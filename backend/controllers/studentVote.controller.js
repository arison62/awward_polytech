import sequelize from "sequelize";
import models from "../models/index.js";

export const addVote = async (req, res) => {
    const { voteId, categoryId, candidateStudentId, voterStudentId } = req.body;
    const user = req.user;

    if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    if (!voteId || !categoryId || !candidateStudentId || !voterStudentId) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const [vote, created] = await models.StudentVote.findOrCreate({
            where: {
                voteId,
                categoryId,
                voterStudentId: voterStudentId
            },
            defaults: {
                voteId,
                categoryId,
                voterStudentId: voterStudentId,
                candidateStudentId: candidateStudentId,
                voteTimestamp: new Date()
            }
        });

        if (created) {
            res.status(201).json({ message: "Vote created successfully", vote: vote });
        } else {
            res.status(400).json({ message: "Vote already exists for this voter in this category" });
        }
    } catch (error) {
        console.error("Error creating vote:", error);
        res.status(500).json({ message: "Error creating vote", error });
    }
}

export const checkUserVoted = async (req, res) => {
    const { voteId, studentId } = req.body;
    const user = req.user;

    if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    if (!voteId || !studentId) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const vote = await models.Vote.findByPk(voteId);
        if (!vote) {
            return res.status(404).json({ message: "Vote not found" });
        }

        const studentVote = await models.StudentVote.findOne({
            where: {
                voteId: voteId,
                voterStudentId: studentId
            }
        });

        if (studentVote) {
            res.status(200).json({ message: "User has already voted in this vote", hasVoted: true });
        } else {
            res.status(200).json({ message: "User has not voted in this vote", hasVoted: false });
        }
    } catch (error) {
        console.error("Error checking user vote:", error);
        res.status(500).json({ message: "Error checking user vote", error });
    }
}

/*
    renvoi par Category le nombre de vote pour chaque candidat
    ne renvoie par le candidat que le nombre de vote est zero
*/

export const getVoteResult = async (req, res) => {
    const { voteId } = req.params;
    try {
        // 1. Récupérer les résultats des votes groupés par candidat et catégorie
        const voteResults = await models.StudentVote.findAll({
            attributes: [
                'candidateStudentId',
                'categoryId',
                [sequelize.fn('count', sequelize.col('candidateStudentId')), 'voteCount']
            ],
            where: { voteId },
            group: ['candidateStudentId', 'categoryId'], // Group by both to get counts per candidate per category
            order: [[sequelize.fn('count', sequelize.col('candidateStudentId')), 'DESC']],
            include: [
                {
                    model: models.Student,
                    as: 'Candidate',
                    attributes: ['id', 'name', 'matricule'], // Sélectionnez uniquement les attributs nécessaires
                    required: true
                },
            ]
        });

        // 2. Regrouper les résultats par categoryId pour faciliter le traitement
        const groupedResults = voteResults.reduce((acc, result) => {
            const categoryId = result.categoryId;
            if (!acc[categoryId]) {
                acc[categoryId] = [];
            }
            acc[categoryId].push(result);
            return acc;
        }, {});

        let categoryVoted = [];

        // 3. Traiter chaque groupe de catégories de manière asynchrone et attendre toutes les promesses
        const processCategoriesPromises = Object.keys(groupedResults).map(async (categoryId) => {
            const resultsForCategory = groupedResults[categoryId];

            const categoryInfos = await models.Category.findByPk(categoryId);

            if (!categoryInfos) {
                console.warn(`Category with ID ${categoryId} not found.`);
                return null; // Ou gérer l'erreur comme vous le souhaitez
            }

            const candidatesData = resultsForCategory.map((result) => {
                return {
                    voteCount: result.dataValues.voteCount, // Accéder à voteCount via dataValues
                    candidate: {
                        studentId: result.Candidate.id,
                        name: result.Candidate.name, // 'name' dans votre modèle Student
                        matricule: result.Candidate.matricule // 'matricule' dans votre modèle Student
                    }
                };
            });

            return {
                categoryId: categoryInfos.id,
                categoryName: categoryInfos.name,
                categoryDescription: categoryInfos.description,
                candidat: candidatesData,
            };
        });

        // Attendre que toutes les promesses soient résolues
        categoryVoted = (await Promise.all(processCategoriesPromises)).filter(Boolean); // Filtrer les `null` si des catégories n'ont pas été trouvées

        res.status(200).json({ message: "Vote result found successfully", result: categoryVoted });

    } catch (error) {
        console.error("Error getting vote result:", error);
        res.status(500).json({ message: "Error getting vote result", error: error.message }); // Renvoie le message d'erreur pour un meilleur débogage
    }
};
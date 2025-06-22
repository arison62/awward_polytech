import models from "../models/index.js";

export const addVote = async (req, res) => {
    const { voteId, categoryId, candidateStudentId, voterStudentId } = req.body;
    const user = req.user;

    if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    if (!voteId  || !categoryId || !candidateStudentId || !voterStudentId) {
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
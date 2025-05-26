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
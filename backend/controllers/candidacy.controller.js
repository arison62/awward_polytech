import models from "../models/index.js";

export const createCandidacies = async (req, res) => {
    const { studentsId, categoryId, voteId } = req.body;
    try {
        if(!studentsId || !categoryId || !voteId){
            return res.status(400).json({ message: "All fields are required" })
        }
       if(!Array.isArray(studentsId)){
        return res.status(400).json({ message: "StudentsId must be an array" })
       }
       const vote = await models.Vote.findByPk(voteId)
       if(!vote){
        return res.status(404).json({ message: "Vote not found" })
       }
       if(vote.status !== "pending"){
        return res.status(400).json({ message: "Vote is not active" })
       }
       const category = await models.Category.findByPk(categoryId)
       if(!category){
        return res.status(404).json({ message: "Category not found" })
       }

       for (const studentId of studentsId) {
        const student = await models.Student.findByPk(studentId);
        if (!student) {
          return res.status(404).json({ message: "Student not found" });
        }
        await models.Candidacy.create({ studentId, categoryId, voteId });
      }
      res.status(201).json({ message: "Candidacy created successfully" });
      
    } catch (error) {
        console.error("Error creating candidacy:", error);
        res.status(500).json({ message: "Error creating candidacy", error });
    }
};

export const getCandidac = async (req, res) => {
    
}

import models from "../models/index.js";
import { generateToken } from "../utils.js";

const createStudent = async (req, res) => {
    const { matricule, name, groupId } = req.body

    if (!matricule) {
        return res.status(400).json({ message: "Matricule and name are required" })
    }
    models.Student.create({ matricule, name,  groupId})
        .then((student) => {
            res.status(201).json({ message: "Student created successfully", student })
        })
        .catch((error) => {
            res.status(500).json({ message: "Error creating student", error })
        });
}

const createStudentsBulk = async (req, res) => {
    const admin = req.user;
    if(!admin){
        return res.status(401).json({ message: "Unauthorized" })
    }
    try {
        const studentsData = req.body; 

        if (!Array.isArray(studentsData) || studentsData.length === 0) {
            return res.status(400).json({ message: 'Le corps de la requête doit être un tableau non vide de données étudiants.' });
        }

        let createdCount = 0;
        let updatedCount = 0;

        // Parcourt les données des étudiants et crée/met à jour dans la base de données
        for (const student of studentsData) {
            // Utilise findOrCreate ou upsert pour éviter les doublons et mettre à jour
            // Ici, nous supposons que 'matricule' est ton identifiant unique
            const [existingStudent, created] = await models.Student.findOrCreate({
                where: { matricule: student.matricule },
                defaults: {
                    name: student.name,
                    groupId: student.groupId
                }
            });

            if (!created) {
                // L'étudiant existe déjà, on le met à jour
                await existingStudent.update({
                    name: student.name
                });
                updatedCount++;
            } else {
                createdCount++;
            }
        }

        res.status(200).json({
            message: 'Données étudiants traitées avec succès.',
            createdCount,
            updatedCount,
            totalProcessed: studentsData.length
        });

    } catch (error) {
        console.error('Erreur lors de l\'importation en masse des étudiants :', error);
        res.status(500).json({ message: 'Erreur interne du serveur lors du traitement des données.', error: error.message });
    }

}

const loginStudent = async (req, res)=>{
    const {matricule} = req.body
    try {
        const student = await models.Student.findOne({ where: { matricule } })
        if (!student) {
          
            return res.status(404).json({ message: "Student not found",  })
        }
        const payload = { id: student.id, role: "student", groupId: student.groupId }
        res.status(200).json({ message: "Student logged in successfully", student, access_token : generateToken(payload) })
    } catch (error) {
        res.status(500).json({ message: "Error logging in student", error })
    }
}

export {
    createStudent,
    createStudentsBulk,
    loginStudent
}
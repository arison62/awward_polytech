import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const Student = sequelize.define('Student', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: true,
        },
      
        matricule: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true,
        },
        groupId: {
            type: DataTypes.INTEGER,
            allowNull: true, // Peut être null si un étudiant n'est pas encore attribué à un groupe
            references: {
                model: 'Groups', // Référence la table Groups
                key: 'id',
            },
        },
    });

    Student.associate = (models) => {
        Student.belongsTo(models.Group, { foreignKey: 'groupId' }); // Un étudiant appartient à un groupe
        Student.hasMany(models.Candidacy, { foreignKey: 'studentId', onDelete: 'CASCADE' });
        Student.hasMany(models.StudentVote, { as: 'VoterVotes', foreignKey: 'voterStudentId', onDelete: 'CASCADE' });
        Student.hasMany(models.StudentVote, { as: 'CandidateVotes', foreignKey: 'candidateStudentId', onDelete: 'CASCADE' });
    };

    return Student;
};
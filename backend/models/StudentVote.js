import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const StudentVote = sequelize.define('StudentVote', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        voteId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Votes',
                key: 'id',
            },
        },
        categoryId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Categories',
                key: 'id',
            },
        },
        voterStudentId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Students',
                key: 'id',
            },
        },
        candidateStudentId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Students',
                as: 'Candidate',
                key: 'id',
            },
        },
        voteTimestamp: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
            allowNull: false,
        },
    }, {
        indexes: [
            {
                unique: true,
                fields: ['voteId', 'categoryId', 'voterStudentId'],
            }
        ]
    });

    StudentVote.associate = (models) => {
        StudentVote.belongsTo(models.Vote, { foreignKey: 'voteId' });
        StudentVote.belongsTo(models.Category, { foreignKey: 'categoryId' });
        StudentVote.belongsTo(models.Student, { as: 'Voter', foreignKey: 'voterStudentId' });
        StudentVote.belongsTo(models.Student, { as: 'Candidate', foreignKey: 'candidateStudentId' });
    };

    return StudentVote;
};
import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const Candidacy = sequelize.define('Candidacy', {
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
        studentId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Students',
                key: 'id',
            },
        },
    }, {
        indexes: [
            {
                unique: true,
                fields: ['voteId', 'categoryId', 'studentId'],
            }
        ]
    });

    Candidacy.associate = (models) => {
        Candidacy.belongsTo(models.Vote, { foreignKey: 'voteId' });
        Candidacy.belongsTo(models.Category, { foreignKey: 'categoryId' });
        Candidacy.belongsTo(models.Student, { foreignKey: 'studentId' });
    };

    return Candidacy;
};
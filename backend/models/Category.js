import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const Category = sequelize.define('Category', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        voteId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Votes',
                key: 'id',
            },
        },
    });

    Category.associate = (models) => {
        Category.belongsTo(models.Vote, { foreignKey: 'voteId' });
        Category.hasMany(models.Candidacy, { foreignKey: 'categoryId', onDelete: 'CASCADE' });
        Category.hasMany(models.StudentVote, { foreignKey: 'categoryId', onDelete: 'CASCADE' });
    };

    return Category;
};
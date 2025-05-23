import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const Vote = sequelize.define('Vote', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        startDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        endDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('pending', 'active', 'completed', 'cancelled'),
            allowNull: false,
            defaultValue: 'pending',
        },
        adminId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Admins',
                key: 'id',
            },
        },
    });

    Vote.associate = (models) => {
        Vote.belongsTo(models.Admin, { foreignKey: 'adminId' });
        Vote.belongsTo(models.Group, { foreignKey: 'groupId' }); // Un vote appartient à un groupe
        Vote.hasMany(models.Category, { foreignKey: 'voteId', onDelete: 'CASCADE' });
        Vote.hasMany(models.StudentVote, { foreignKey: 'voteId', onDelete: 'CASCADE' });
    };

    return Vote;
};
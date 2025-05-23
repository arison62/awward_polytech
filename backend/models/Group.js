import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const Group = sequelize.define('Group', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true, // Un nom de groupe doit être unique
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        // Clé étrangère pour l'Admin qui a créé ce groupe
        adminId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Admins', // Référence la table Admins
                key: 'id',
            },
        },
    });

    Group.associate = (models) => {
        Group.belongsTo(models.Admin, { foreignKey: 'adminId' });
        Group.hasMany(models.Student, { foreignKey: 'groupId', onDelete: 'SET NULL' }); // Un groupe a plusieurs étudiants
        Group.hasMany(models.Vote, { foreignKey: 'groupId', onDelete: 'CASCADE' });    // Un groupe a plusieurs votes
    };

    return Group;
};
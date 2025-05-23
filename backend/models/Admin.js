import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const Admin = sequelize.define('Admin', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        password: { // Hashed password
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
        is_verified: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
    });

    // Les associations sont définies dans index.js
    Admin.associate = (models) => {
        Admin.hasMany(models.Vote, { foreignKey: 'adminId', onDelete: 'CASCADE' });
        Admin.hasMany(models.Group, { foreignKey: 'adminId', onDelete: 'CASCADE' }); // Un admin peut créer plusieurs groupes
    };

    return Admin;
};
const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class Partner extends Model { }

Partner.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                notEmpty: { msg: 'El nombre del partner es requerido' }
            }
        },
        logo: {
            type: DataTypes.STRING,
            allowNull: true
        },
        website: {
            type: DataTypes.STRING,
            allowNull: true
        },
        order: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    },
    {
        sequelize,
        modelName: 'Partner',
        tableName: 'Partners',
        timestamps: true,
        indexes: [
            { fields: ['isActive'] }
        ]
    }
);

module.exports = Partner;

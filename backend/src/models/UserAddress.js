const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class UserAddress extends Model { }

UserAddress.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        // userId FK definida en associations (index.js)
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                notEmpty: { msg: 'El nombre de la dirección es requerido' }
            }
        },
        street: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                notEmpty: { msg: 'La calle es requerida' }
            }
        },
        city: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                notEmpty: { msg: 'La ciudad es requerida' }
            }
        },
        state: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                notEmpty: { msg: 'El departamento/estado es requerido' }
            }
        },
        zipCode: {
            type: DataTypes.STRING(20),
            allowNull: true
        },
        phone: {
            type: DataTypes.STRING(20),
            allowNull: false,
            validate: {
                notEmpty: { msg: 'El teléfono de contacto es requerido' }
            }
        },
        isDefault: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        }
    },
    {
        sequelize,
        modelName: 'UserAddress',
        tableName: 'UserAddresses',
        timestamps: true,
        indexes: [
            { fields: ['userId'] }
        ]
    }
);

module.exports = UserAddress;

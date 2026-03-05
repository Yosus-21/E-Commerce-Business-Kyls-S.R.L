const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class CartItem extends Model { }

CartItem.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        // cartId FK → definida en index.js (NOT NULL, CASCADE)
        // productId FK → allowNull:true para soportar ON DELETE SET NULL
        // Si el producto es eliminado, productId queda NULL y getCart lo limpia
        productId: {
            type: DataTypes.INTEGER,
            allowNull: true  // ✅ requerido para onDelete: 'SET NULL' en index.js
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
            validate: {
                min: { args: [1], msg: 'La cantidad debe ser al menos 1' }
            }
        },
        price: {
            type: DataTypes.FLOAT,
            allowNull: false,
            validate: {
                min: { args: [0], msg: 'El precio no puede ser negativo' }
            }
        }
    },
    {
        sequelize,
        modelName: 'CartItem',
        tableName: 'cart_items',
        underscored: true,
        timestamps: true
    }
);

module.exports = CartItem;

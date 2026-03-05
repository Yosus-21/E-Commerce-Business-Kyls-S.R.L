const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class QuoteItem extends Model { }

QuoteItem.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        // quoteId FK → definida en index.js (NOT NULL, CASCADE)
        // productId FK → allowNull:true para soportar ON DELETE SET NULL
        // El snapshot de name/price/subtotal preserva los datos aunque el producto se elimine
        productId: {
            type: DataTypes.INTEGER,
            allowNull: true  // ✅ requerido para onDelete: 'SET NULL' en index.js
        },
        /**
         * Snapshot del nombre del producto al momento de la cotización.
         * Se guarda para no perder el dato si el producto es eliminado o renombrado.
         */
        name: {
            type: DataTypes.STRING(200),
            allowNull: false
        },
        price: {
            type: DataTypes.FLOAT,
            allowNull: false,
            validate: {
                min: { args: [0], msg: 'El precio no puede ser negativo' }
            }
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min: { args: [1], msg: 'La cantidad debe ser al menos 1' }
            }
        },
        subtotal: {
            type: DataTypes.FLOAT,
            allowNull: false,
            validate: {
                min: { args: [0], msg: 'El subtotal no puede ser negativo' }
            }
        },
        image: {
            type: DataTypes.STRING,
            allowNull: true
        }
    },
    {
        sequelize,
        modelName: 'QuoteItem',
        tableName: 'quote_items',
        underscored: true,
        timestamps: false // No necesitamos timestamps en esta tabla de detalle
    }
);

module.exports = QuoteItem;

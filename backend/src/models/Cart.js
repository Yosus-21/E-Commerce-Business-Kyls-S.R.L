const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class Cart extends Model {
    /**
     * Calcula y actualiza el totalAmount del carrito
     * a partir de su array CartItems (debe estar cargado con include)
     */
    async recalculateTotal() {
        if (this.CartItems && this.CartItems.length > 0) {
            this.totalAmount = this.CartItems.reduce(
                (total, item) => total + item.price * item.quantity,
                0
            );
        } else {
            this.totalAmount = 0;
        }
        await this.save();
        return this.totalAmount;
    }
}

Cart.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        // userId FK → definida en index.js (UNIQUE: un carrito por usuario)
        totalAmount: {
            type: DataTypes.FLOAT,
            defaultValue: 0
        }
    },
    {
        sequelize,
        modelName: 'Cart',
        tableName: 'Carts',
        timestamps: true,
        indexes: [
            { fields: ['userId'], unique: true }
        ]
    }
);

module.exports = Cart;

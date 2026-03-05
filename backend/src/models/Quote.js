const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../config/database');

class Quote extends Model {
    // ====================================
    // GETTERS (equivalentes a Virtuals en Mongoose)
    // ====================================

    /** Retorna true si la cotización ha expirado */
    get isExpired() {
        return this.expiresAt < new Date();
    }

    /** Retorna cuántos días quedan hasta que expire */
    get daysRemaining() {
        const now = new Date();
        const diff = this.expiresAt - now;
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        return days > 0 ? days : 0;
    }

    // ====================================
    // MÉTODO ESTÁTICO
    // ====================================
    /** Genera un número único de cotización con formato QT-YYYYMMDD-XXX */
    static async generateQuoteNumber() {
        const today = new Date();
        const year = today.getFullYear();
        const month = (today.getMonth() + 1).toString().padStart(2, '0');
        const day = today.getDate().toString().padStart(2, '0');
        const datePrefix = `QT-${year}${month}${day}`;

        // Buscar la última cotización del día usando LIKE
        const { Op } = require('sequelize');
        const lastQuote = await Quote.findOne({
            where: {
                quoteNumber: { [Op.like]: `${datePrefix}%` }
            },
            order: [['quoteNumber', 'DESC']]
        });

        let sequence = 1;
        if (lastQuote) {
            const parts = lastQuote.quoteNumber.split('-');
            const lastSeq = parseInt(parts[2]);
            sequence = lastSeq + 1;
        }

        return `${datePrefix}-${sequence.toString().padStart(3, '0')}`;
    }
}

Quote.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        quoteNumber: {
            type: DataTypes.STRING(30),
            allowNull: false,
            unique: true
            // Formato: QT-YYYYMMDD-XXX
        },
        // userId FK → definida en index.js
        /**
         * Snapshot de datos del cliente al momento de la cotización
         * { name, email, phone, company }
         */
        customerData: {
            type: DataTypes.JSON,
            allowNull: false
        },
        totalAmount: {
            type: DataTypes.FLOAT,
            allowNull: false,
            validate: {
                min: { args: [0], msg: 'El monto total no puede ser negativo' }
            }
        },
        pdfPath: {
            type: DataTypes.STRING,
            allowNull: true
        },
        status: {
            type: DataTypes.ENUM('Generada', 'Contactado', 'Cerrada'),
            defaultValue: 'Generada'
        },
        expiresAt: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: () => {
                // 30 días desde la creación
                return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
            }
        },
        notes: {
            type: DataTypes.STRING(500),
            allowNull: true
        }
    },
    {
        sequelize,
        modelName: 'Quote',
        tableName: 'quotes',
        underscored: true,
        timestamps: true,
        getterMethods: {
            isExpired() {
                return this.expiresAt < new Date();
            },
            daysRemaining() {
                const now = new Date();
                const diff = this.expiresAt - now;
                const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
                return days > 0 ? days : 0;
            }
        }
    }
);

module.exports = Quote;

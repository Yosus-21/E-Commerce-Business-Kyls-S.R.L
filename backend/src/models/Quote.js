const mongoose = require('mongoose');

// Schema de items de cotización (subdocumento embebido)
const quoteItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    subtotal: {
        type: Number,
        required: true,
        min: 0
    },
    image: {
        type: String
    }
}, {
    _id: false
});

// Schema de datos del cliente (subdocumento embebido)
const customerDataSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    company: {
        type: String
    }
}, {
    _id: false
});

// Schema principal de cotización
const quoteSchema = new mongoose.Schema({
    quoteNumber: {
        type: String,
        required: true,
        unique: true,
        index: true
        // Formato: QT-YYYYMMDD-XXX
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    customerData: {
        type: customerDataSchema,
        required: true
    },
    items: {
        type: [quoteItemSchema],
        required: true,
        validate: {
            validator: function (items) {
                return items && items.length > 0;
            },
            message: 'La cotización debe tener al menos un producto'
        }
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    pdfPath: {
        type: String
    },
    status: {
        type: String,
        enum: ['Generada', 'Contactado', 'Cerrada'],
        default: 'Generada',
        index: true
    },
    expiresAt: {
        type: Date,
        default: function () {
            // 30 días desde la creación
            return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        }
    },
    notes: {
        type: String,
        maxlength: 500
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// ====================================
// ÍNDICES
// ====================================
quoteSchema.index({ quoteNumber: 1 });
quoteSchema.index({ user: 1, createdAt: -1 });
quoteSchema.index({ status: 1 });
quoteSchema.index({ expiresAt: 1 });

// ====================================
// VIRTUALS
// ====================================
// Virtual para verificar si está expirada
quoteSchema.virtual('isExpired').get(function () {
    return this.expiresAt < new Date();
});

// Virtual para días restantes
quoteSchema.virtual('daysRemaining').get(function () {
    const now = new Date();
    const diff = this.expiresAt - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
});

// ====================================
// MÉTODOS ESTÁTICOS
// ====================================
// Generar número único de cotización
quoteSchema.statics.generateQuoteNumber = async function () {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    const datePrefix = `QT-${year}${month}${day}`;

    // Buscar última cotización del día
    const lastQuote = await this.findOne({
        quoteNumber: new RegExp(`^${datePrefix}`)
    }).sort({ quoteNumber: -1 });

    let sequence = 1;
    if (lastQuote) {
        const parts = lastQuote.quoteNumber.split('-');
        const lastSeq = parseInt(parts[2]);
        sequence = lastSeq + 1;
    }

    return `${datePrefix}-${sequence.toString().padStart(3, '0')}`;
};

// Middleware removed - using manual status tracking

// Exportar modelo
module.exports = mongoose.model('Quote', quoteSchema);

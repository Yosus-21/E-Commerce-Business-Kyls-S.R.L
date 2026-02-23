const mongoose = require('mongoose');

// Schema de items del carrito (subdocumento)
const cartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, 'La cantidad debe ser al menos 1'],
        default: 1
    },
    price: {
        type: Number,
        required: true,
        min: [0, 'El precio no puede ser negativo']
    }
}, {
    _id: true
});

// Schema principal del Carrito
const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    items: [cartItemSchema],
    totalAmount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// ====================================
// ÍNDICES
// ====================================
// user ya tiene unique: true en el schema, no necesitamos índice duplicado
cartSchema.index({ updatedAt: 1 });

// ====================================
// MÉTODOS DE INSTANCIA
// ====================================
// Calcular el total del carrito
cartSchema.methods.calculateTotal = function () {
    this.totalAmount = this.items.reduce((total, item) => {
        return total + (item.price * item.quantity);
    }, 0);
    return this.totalAmount;
};

// ====================================
// MIDDLEWARE PRE-SAVE
// ====================================
// Auto-calcular total antes de guardar
cartSchema.pre('save', function (next) {
    this.calculateTotal();
    next();
});

// Exportar modelo
module.exports = mongoose.model('Cart', cartSchema);

const mongoose = require('mongoose');

/**
 * Partner/Aliado Schema
 * Representa las empresas clientes que confían en Business Kyla
 */
const partnerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'El nombre del aliado es obligatorio'],
        trim: true,
        maxlength: [100, 'El nombre no puede exceder 100 caracteres']
    },
    logo: {
        type: String,
        required: [true, 'El logo es obligatorio']
    },
    order: {
        type: Number,
        default: 0,
        index: true
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true
    }
}, {
    timestamps: true
});

// Índice compuesto para consultas optimizadas
partnerSchema.index({ isActive: 1, order: 1 });

/**
 * Obtener aliados activos ordenados
 */
partnerSchema.statics.getActive = function () {
    return this.find({ isActive: true })
        .sort({ order: 1, createdAt: -1 })
        .select('name logo order createdAt');
};

module.exports = mongoose.model('Partner', partnerSchema);

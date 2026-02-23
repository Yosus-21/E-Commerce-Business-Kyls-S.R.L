const mongoose = require('mongoose');
const slugify = require('slugify');

// Schema de Marca
const brandSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'El nombre de la marca es requerido'],
        unique: true,
        trim: true,
        maxlength: [100, 'El nombre no puede exceder 100 caracteres']
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    },
    image: {
        type: String,
        required: [true, 'La imagen/logo de la marca es requerida']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'La descripción no puede exceder 500 caracteres']
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// ====================================
// ÍNDICES
// ====================================
brandSchema.index({ slug: 1 });
brandSchema.index({ isActive: 1 });

// ====================================
// MIDDLEWARE PRE-VALIDATE
// ====================================
// Auto-generar slug desde name si no existe
brandSchema.pre('validate', function (next) {
    if (this.name && !this.slug) {
        this.slug = slugify(this.name, {
            lower: true,
            strict: true,
            locale: 'es'
        });
    }
    next();
});

// ====================================
// VIRTUALS
// ====================================
// Virtual para contar productos de esta marca
brandSchema.virtual('productCount', {
    ref: 'Product',
    localField: '_id',
    foreignField: 'brand',
    count: true
});

// Exportar modelo
module.exports = mongoose.model('Brand', brandSchema);

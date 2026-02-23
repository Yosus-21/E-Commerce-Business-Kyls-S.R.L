const mongoose = require('mongoose');
const slugify = require('slugify');

// Schema de Categoría
const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'El nombre de la categoría es requerido'],
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
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'La descripción no puede exceder 500 caracteres']
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null
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
// slug ya tiene unique: true en el schema
// name ya tiene unique: true en el schema, no necesitamos índice adicional

// ====================================
// MIDDLEWARE PRE-VALIDATE
// ====================================
// Auto-generar slug desde name si no existe
categorySchema.pre('validate', function (next) {
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
// Virtual para contar productos de esta categoría
categorySchema.virtual('productCount', {
    ref: 'Product',
    localField: '_id',
    foreignField: 'category',
    count: true
});

// Exportar modelo
module.exports = mongoose.model('Category', categorySchema);

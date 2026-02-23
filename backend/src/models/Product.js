const mongoose = require('mongoose');
const slugify = require('slugify');

// Schema de Producto
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'El nombre del producto es requerido'],
        trim: true,
        maxlength: [200, 'El nombre no puede exceder 200 caracteres']
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true
    },
    description: {
        type: String,
        required: [true, 'La descripción es requerida'],
        trim: true,
        maxlength: [2000, 'La descripción no puede exceder 2000 caracteres']
    },
    longDescription: {
        type: String,
        required: false,
        trim: true,
        maxlength: [10000, 'La descripción extendida no puede exceder 10000 caracteres']
    },
    price: {
        type: Number,
        required: [true, 'El precio es requerido'],
        min: [0, 'El precio no puede ser negativo']
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'La categoría es requerida']
    },
    brand: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Brand',
        required: false
    },
    stock: {
        type: Number,
        required: [true, 'El stock es requerido'],
        min: [0, 'El stock no puede ser negativo'],
        default: 0
    },
    images: [{
        type: String
    }],
    specifications: {
        type: Map,
        of: String
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    discountPercentage: {
        type: Number,
        default: 0,
        min: [0, 'El descuento no puede ser negativo'],
        max: [100, 'El descuento no puede exceder 100%']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    views: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// ====================================
// ÍNDICES
// ====================================
// slug ya tiene unique: true en el schema, no necesitamos índice duplicado
productSchema.index({ name: 'text' }); // Índice de texto para búsqueda full-text
productSchema.index({ category: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ price: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ createdAt: -1 });

// ====================================
// MIDDLEWARE PRE-VALIDATE
// ====================================
// Auto-generar slug desde name si no existe
productSchema.pre('validate', function (next) {
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
// Virtual para verificar si hay stock disponible
productSchema.virtual('inStock').get(function () {
    return this.stock > 0;
});

// Virtual para calcular precio con descuento
productSchema.virtual('discountedPrice').get(function () {
    if (this.discountPercentage > 0) {
        return this.price * (1 - this.discountPercentage / 100);
    }
    return this.price;
});

// ====================================
// MÉTODOS ESTÁTICOS
// ====================================
// Encontrar productos por categoría
productSchema.statics.findByCategory = function (categoryId) {
    return this.find({
        category: categoryId,
        isActive: true
    }).populate('category', 'name slug');
};

// Exportar modelo
module.exports = mongoose.model('Product', productSchema);

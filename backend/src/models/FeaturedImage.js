const mongoose = require('mongoose');

/**
 * Schema de Imagen Destacada (Hero Carousel)
 */
const featuredImageSchema = new mongoose.Schema({
    image: {
        type: String,
        required: [true, 'La imagen es requerida']
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
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// ====================================
// ÍNDICES
// ====================================
featuredImageSchema.index({ order: 1, isActive: 1 });

// ====================================
// MÉTODOS ESTÁTICOS
// ====================================
/**
 * Obtener imágenes activas ordenadas
 */
featuredImageSchema.statics.getActive = function () {
    return this.find({ isActive: true })
        .sort({ order: 1, createdAt: -1 })
        .select('image order createdAt');
};

/**
 * Obtener todas las imágenes (admin)
 */
featuredImageSchema.statics.getAll = function () {
    return this.find()
        .sort({ order: 1, createdAt: -1 });
};

// ====================================
// MIDDLEWARE
// ====================================
// Pre-save: Asignar orden automáticamente si no se proporciona
featuredImageSchema.pre('save', async function (next) {
    if (this.isNew && this.order === 0) {
        const count = await this.constructor.countDocuments();
        this.order = count;
    }
    next();
});

module.exports = mongoose.model('FeaturedImage', featuredImageSchema);

const mongoose = require('mongoose');
const slugify = require('slugify');

// Schema de Servicio
const serviceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'El título del servicio es requerido'],
        trim: true,
        maxlength: [200, 'El título no puede exceder 200 caracteres']
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true
    },
    description: {
        type: String,
        trim: true,
        maxlength: [3000, 'La descripción no puede exceder 3000 caracteres']
    },
    longDescription: {
        type: String,
        required: false,
        trim: true,
        maxlength: [10000, 'La descripción extendida no puede exceder 10000 caracteres']
    },
    image: {
        type: String,
        default: null
    },
    price: {
        type: String,
        trim: true,
        maxlength: [50, 'El precio no puede exceder 50 caracteres']
    },
    features: [{
        type: String,
        trim: true
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    views: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// ====================================
// ÍNDICES
// ====================================
serviceSchema.index({ slug: 1 });
serviceSchema.index({ isActive: 1 });
serviceSchema.index({ createdAt: -1 });

// ====================================
// MIDDLEWARE PRE-VALIDATE
// ====================================
// Auto-generar slug desde title si no existe
serviceSchema.pre('validate', function (next) {
    if (this.title && !this.slug) {
        this.slug = slugify(this.title, {
            lower: true,
            strict: true,
            locale: 'es'
        });
    }
    next();
});

// Exportar modelo
module.exports = mongoose.model('Service', serviceSchema);

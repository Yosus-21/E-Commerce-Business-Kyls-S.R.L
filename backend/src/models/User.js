const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Schema de direcciones (subdocumento)
const addressSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'El nombre de la dirección es requerido'],
        trim: true
    },
    street: {
        type: String,
        required: [true, 'La calle es requerida'],
        trim: true
    },
    city: {
        type: String,
        required: [true, 'La ciudad es requerida'],
        trim: true
    },
    state: {
        type: String,
        required: [true, 'El departamento/estado es requerido'],
        trim: true
    },
    zipCode: {
        type: String,
        trim: true
    },
    phone: {
        type: String,
        required: [true, 'El teléfono de contacto es requerido'],
        trim: true
    },
    isDefault: {
        type: Boolean,
        default: false
    }
});

// Schema principal de Usuario
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'El nombre es requerido'],
        trim: true,
        maxlength: [100, 'El nombre no puede exceder 100 caracteres']
    },
    email: {
        type: String,
        required: [true, 'El email es requerido'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^\S+@\S+\.\S+$/,
            'Por favor ingrese un email válido'
        ]
    },
    password: {
        type: String,
        required: [true, 'La contraseña es requerida'],
        minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
        select: false // No devolver password en queries por defecto
    },
    phone: {
        type: String,
        trim: true,
        match: [
            /^[0-9]{8,15}$/,
            'Por favor ingrese un número de teléfono válido (8-15 dígitos)'
        ]
    },
    role: {
        type: String,
        enum: {
            values: ['user', 'admin'],
            message: 'El rol debe ser user o admin'
        },
        default: 'user'
    },
    addresses: [addressSchema],
    isActive: {
        type: Boolean,
        default: true
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
}, {
    timestamps: true
});

// ====================================
// ÍNDICES
// ====================================
// email ya tiene unique: true en el schema, no necesitamos índice duplicado
userSchema.index({ role: 1 });

// ====================================
// MIDDLEWARE PRE-SAVE
// ====================================
// Hashear password antes de guardar
userSchema.pre('save', async function (next) {
    // Solo hashear si el password fue modificado
    if (!this.isModified('password')) {
        return next();
    }

    try {
        // Generar salt y hashear password
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// ====================================
// MÉTODOS DE INSTANCIA
// ====================================

// Comparar password ingresado con el hasheado
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generar y firmar JWT
userSchema.methods.getSignedJwtToken = function () {
    return jwt.sign(
        { id: this._id, role: this.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
    );
};

// Generar token de reset de contraseña
userSchema.methods.getResetPasswordToken = function () {
    // Generar token aleatorio
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hashear token y guardarlo
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Establecer tiempo de expiración (10 minutos)
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    // Retornar token original (sin hashear) para enviarlo por email
    return resetToken;
};

// Exportar modelo
module.exports = mongoose.model('User', userSchema);

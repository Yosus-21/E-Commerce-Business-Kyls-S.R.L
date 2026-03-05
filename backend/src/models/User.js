const { DataTypes, Model } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sequelize } = require('../config/database');

class User extends Model {
    // ====================================
    // MÉTODOS DE INSTANCIA
    // ====================================

    /** Comparar password ingresado con el hasheado en BD */
    async matchPassword(enteredPassword) {
        return await bcrypt.compare(enteredPassword, this.password);
    }

    /** Generar y firmar JWT */
    getSignedJwtToken() {
        return jwt.sign(
            { id: this.id, role: this.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );
    }

    /** Generar token de reset de contraseña (retorna token en texto plano) */
    getResetPasswordToken() {
        // Generar token aleatorio
        const resetToken = crypto.randomBytes(20).toString('hex');

        // Hashear token y guardarlo en la instancia
        this.resetPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        // Expiración en 10 minutos
        this.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000);

        // Retornar token sin hashear (para enviarlo por email)
        return resetToken;
    }
}

User.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                notEmpty: { msg: 'El nombre es requerido' },
                len: { args: [1, 100], msg: 'El nombre no puede exceder 100 caracteres' }
            }
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: { msg: 'El email ya está registrado' },
            validate: {
                isEmail: { msg: 'Por favor ingrese un email válido' }
            },
            set(value) {
                this.setDataValue('email', value ? value.toLowerCase().trim() : value);
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: { args: [6, 255], msg: 'La contraseña debe tener al menos 6 caracteres' }
            }
        },
        phone: {
            type: DataTypes.STRING(15),
            allowNull: true,
            validate: {
                is: {
                    args: /^[0-9]{8,15}$/,
                    msg: 'Por favor ingrese un número de teléfono válido (8-15 dígitos)'
                }
            }
        },
        role: {
            type: DataTypes.ENUM('user', 'admin'),
            defaultValue: 'user',
            validate: {
                isIn: { args: [['user', 'admin']], msg: 'El rol debe ser user o admin' }
            }
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        resetPasswordToken: {
            type: DataTypes.STRING,
            allowNull: true
        },
        resetPasswordExpire: {
            type: DataTypes.DATE,
            allowNull: true
        }
    },
    {
        sequelize,
        modelName: 'User',
        tableName: 'users',
        underscored: true,
        timestamps: true,
        defaultScope: {
            // Por defecto excluir password de todas las queries
            attributes: { exclude: ['password'] }
        },
        scopes: {
            // Scope para login: incluye el password explicitando TODOS los campos.
            // NOTA: attributes: { include: ['password'] } NO funciona para revertir
            // un exclude del defaultScope — hay que listar los campos completos.
            withPassword: {
                attributes: [
                    'id', 'name', 'email', 'password', 'phone',
                    'role', 'isActive', 'resetPasswordToken',
                    'resetPasswordExpire', 'createdAt', 'updatedAt'
                ]
            }
        }
    }
);

// ====================================
// HOOKS
// ====================================

/** Hashear password antes de crear o actualizar si fue modificado */
User.addHook('beforeSave', async (user) => {
    if (user.changed('password') && user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
    }
});

module.exports = User;

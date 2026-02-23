const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

/**
 * @desc    Registrar nuevo usuario
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = asyncHandler(async (req, res, next) => {
    const { name, email, password, phone } = req.body;

    // Verificar si el email ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({
            success: false,
            error: 'El email ya está registrado'
        });
    }

    // Crear usuario
    const user = await User.create({
        name,
        email,
        password,
        phone
    });

    // Generar token JWT
    const token = user.getSignedJwtToken();

    // Respuesta exitosa
    res.status(201).json({
        success: true,
        data: {
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            token
        },
        message: 'Usuario registrado exitosamente'
    });
});

/**
 * @desc    Iniciar sesión
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    // Buscar usuario por email (incluir password)
    const user = await User.findOne({ email }).select('+password');

    // Verificar que el usuario existe
    if (!user) {
        return res.status(401).json({
            success: false,
            error: 'Credenciales inválidas'
        });
    }

    // Verificar que el usuario está activo
    if (!user.isActive) {
        return res.status(401).json({
            success: false,
            error: 'Usuario inactivo'
        });
    }

    // Verificar password
    const isPasswordMatch = await user.matchPassword(password);
    if (!isPasswordMatch) {
        return res.status(401).json({
            success: false,
            error: 'Credenciales inválidas'
        });
    }

    // Generar token JWT
    const token = user.getSignedJwtToken();

    // Respuesta exitosa
    res.status(200).json({
        success: true,
        data: {
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            },
            token
        },
        message: 'Login exitoso'
    });
});

/**
 * @desc    Obtener usuario actual
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = asyncHandler(async (req, res, next) => {
    // El usuario ya está en req.user (viene del middleware protect)
    res.status(200).json({
        success: true,
        data: req.user
    });
});

/**
 * @desc    Cerrar sesión
 * @route   POST /api/auth/logout
 * @access  Private
 */
exports.logout = asyncHandler(async (req, res, next) => {
    // El logout se maneja en el frontend eliminando el token
    // Este endpoint es opcional y solo confirma la acción
    res.status(200).json({
        success: true,
        message: 'Sesión cerrada exitosamente'
    });
});

/**
 * @desc    Olvidé mi contraseña - Envío de email
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
exports.forgotPassword = asyncHandler(async (req, res, next) => {
    const { email } = req.body;

    // Validar que venga el email
    if (!email) {
        return res.status(400).json({
            success: false,
            error: 'Por favor proporciona tu email'
        });
    }

    // Buscar usuario por email
    const user = await User.findOne({ email });

    if (!user) {
        return res.status(404).json({
            success: false,
            error: 'No existe usuario con ese email'
        });
    }

    // Generar token de reset
    const resetToken = user.getResetPasswordToken();

    // Guardar usuario con el token
    await user.save({ validateBeforeSave: false });

    // Crear URL de reset
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    // Mensaje HTML del email
    const message = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔐 Recuperación de Contraseña</h1>
                </div>
                <div class="content">
                    <p>Hola <strong>${user.name}</strong>,</p>
                    <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en <strong>Business Kyla SRL</strong>.</p>
                    <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>
                    <div style="text-align: center;">
                        <a href="${resetUrl}" class="button">Restablecer Contraseña</a>
                    </div>
                    <p style="margin-top: 20px;"><strong>⏰ Este enlace expira en 10 minutos.</strong></p>
                    <p style="color: #666; font-size: 14px;">Si no puedes hacer clic en el botón, copia y pega esta URL en tu navegador:</p>
                    <p style="word-break: break-all; background: #fff; padding: 10px; border-radius: 5px;">${resetUrl}</p>
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                    <p style="color: #999; font-size: 13px;">⚠️ Si no solicitaste este cambio, puedes ignorar este correo de forma segura.</p>
                </div>
                <div class="footer">
                    <p>© 2026 Business Kyla SRL. Todos los derechos reservados.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    try {
        await sendEmail({
            email: user.email,
            subject: '🔐 Recuperación de Contraseña - Business Kyla',
            message
        });

        res.status(200).json({
            success: true,
            message: 'Email de recuperación enviado exitosamente. Revisa tu bandeja de entrada.'
        });
    } catch (error) {
        console.error('Error al enviar email:', error);

        // Limpiar token si falla el envío
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });

        return res.status(500).json({
            success: false,
            error: 'No se pudo enviar el email. Intenta nuevamente.'
        });
    }
});

/**
 * @desc    Restablecer contraseña
 * @route   PUT /api/auth/reset-password/:token
 * @access  Public
 */
exports.resetPassword = asyncHandler(async (req, res, next) => {
    const { password } = req.body;

    // Validar que venga la nueva contraseña
    if (!password) {
        return res.status(400).json({
            success: false,
            error: 'Por favor proporciona la nueva contraseña'
        });
    }

    // Validar longitud mínima
    if (password.length < 6) {
        return res.status(400).json({
            success: false,
            error: 'La contraseña debe tener al menos 6 caracteres'
        });
    }

    // Hashear el token recibido en la URL
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    // Buscar usuario con token válido y no expirado
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
        return res.status(400).json({
            success: false,
            error: 'Token inválido o expirado. Por favor solicita un nuevo enlace de recuperación.'
        });
    }

    // Establecer nueva contraseña
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
        success: true,
        message: '✅ Contraseña actualizada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.'
    });
});

const asyncHandler = require('../utils/asyncHandler');
const sendEmail = require('../utils/sendEmail');

/**
 * @desc    Enviar mensaje de contacto por email
 * @route   POST /api/contact
 * @access  Public
 *
 * NOTA: Este controlador no interactúa con la base de datos.
 * Solo valida y reenvía el mensaje por email.
 * No requiere cambios al migrar de MongoDB a MySQL.
 */
exports.sendContactMessage = asyncHandler(async (req, res) => {
    const { name, email, phone, message } = req.body;

    // Validar campos requeridos
    if (!name || !email || !message) {
        return res.status(400).json({
            success: false,
            message: 'Por favor, completa todos los campos requeridos (nombre, email y mensaje)'
        });
    }

    // Email de destino (empresa)
    const businessEmail = process.env.BUSINESS_EMAIL || 'belen.torrico@kyla.com.bo';

    // HTML del email (idéntico al original — sin cambios)
    const emailHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                .header { background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%); color: white; padding: 30px 20px; text-align: center; }
                .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
                .content { padding: 30px 25px; }
                .field { margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid #e5e7eb; }
                .field:last-child { border-bottom: none; }
                .label { font-weight: 600; color: #7c3aed; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px; }
                .value { color: #1f2937; font-size: 15px; margin-top: 5px; }
                .message-box { background-color: #f9fafb; padding: 15px; border-radius: 6px; border-left: 4px solid #7c3aed; margin-top: 8px; }
                .footer { background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; }
                .footer a { color: #7c3aed; text-decoration: none; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>📬 Nuevo Mensaje de Contacto</h1>
                </div>
                <div class="content">
                    <div class="field">
                        <div class="label">👤 Nombre</div>
                        <div class="value">${name}</div>
                    </div>
                    <div class="field">
                        <div class="label">📧 Email</div>
                        <div class="value"><a href="mailto:${email}" style="color: #7c3aed; text-decoration: none;">${email}</a></div>
                    </div>
                    ${phone ? `
                    <div class="field">
                        <div class="label">📞 Teléfono</div>
                        <div class="value"><a href="tel:${phone}" style="color: #7c3aed; text-decoration: none;">${phone}</a></div>
                    </div>` : ''}
                    <div class="field">
                        <div class="label">💬 Mensaje</div>
                        <div class="message-box">${message}</div>
                    </div>
                </div>
                <div class="footer">
                    <p>Enviado desde el formulario de contacto de <strong>Business Kyla SRL</strong></p>
                    <p>Responder a: <a href="mailto:${email}">${email}</a></p>
                </div>
            </div>
        </body>
        </html>
    `;

    try {
        await sendEmail({
            email: businessEmail,
            subject: `📬 Nuevo contacto de ${name}`,
            message: emailHTML
        });

        res.status(200).json({
            success: true,
            message: 'Mensaje enviado exitosamente. Te contactaremos pronto.'
        });
    } catch (error) {
        console.error('Error enviando email de contacto:', error);
        res.status(500).json({
            success: false,
            message: 'Error al enviar el mensaje. Por favor, intenta nuevamente o contáctanos directamente por teléfono.'
        });
    }
});

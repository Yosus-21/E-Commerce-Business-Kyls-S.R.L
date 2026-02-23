const nodemailer = require('nodemailer');

/**
 * Send Email using Nodemailer
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email  
 * @param {string} options.subject - Email subject
 * @param {string} options.message - HTML message content
 */
const sendEmail = async (options) => {
    try {
        // Create transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASSWORD
            }
        });

        // Email options
        const mailOptions = {
            from: `Business Kyla SRL <${process.env.SMTP_EMAIL}>`,
            to: options.email,
            subject: options.subject,
            html: options.message
        };

        // Send email
        const info = await transporter.sendMail(mailOptions);

        console.log('Email sent successfully:', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('No se pudo enviar el email');
    }
};

module.exports = sendEmail;

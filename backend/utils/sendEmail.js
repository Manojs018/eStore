const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');

const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: false,
        auth: {
            user: process.env.SMTP_EMAIL || process.env.EMAIL_USER,
            pass: process.env.SMTP_PASSWORD || process.env.EMAIL_PASS
        }
    });

    let html = options.html;

    if (options.template) {
        const templatePath = path.join(__dirname, '../templates', `${options.template}.ejs`);
        const templateData = {
            subject: options.subject,
            ...options.data
        };
        html = await ejs.renderFile(templatePath, templateData);
    }

    const message = {
        from: `${process.env.FROM_NAME || 'eStore'} <${process.env.FROM_EMAIL || process.env.EMAIL_USER}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: html
    };

    const info = await transporter.sendMail(message);

    console.log('Message sent: %s', info.messageId);
};

module.exports = sendEmail;

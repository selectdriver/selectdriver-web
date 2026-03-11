const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { type, data } = req.body;

    // Honeypot anti-spam check
    if (data && data.website) {
        // Bot detected — silently succeed
        return res.status(200).json({ success: true, message: 'Email enviado correctamente' });
    }

    // Validate required environment variables
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.EMAIL_TO) {
        console.error('Missing environment variables');
        return res.status(500).json({ error: 'Server configuration error' });
    }

    // Configure Transporter for handling any SMTP service
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.office365.com',
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_PORT == 465, // True for 465, false for 587
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            ciphers: 'SSLv3', // Often required for older SSL support on Office 365
            rejectUnauthorized: false // Helps avoid local/intermediate certificate issues
        },
        requireTLS: true
    });

    // Generate timestamp
    const now = new Date();
    const timestamp = now.toLocaleString('es-ES', {
        timeZone: 'Europe/Madrid',
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });

    // Construct Email Content based on form type
    let subject = 'Nuevo Mensaje desde Web SelectDriver';
    let htmlContent = '<h1>Nuevo Mensaje</h1>';
    let clientEmail = null;
    let clientName = null;
    let autoResponseSubject = '';
    let autoResponseHtml = '';

    if (type === 'companies') {
        const need = data.need || 'Consulta general';
        subject = `[SelectDriver Web] ${need} — ${data.companyName}`;
        clientEmail = data.email;
        clientName = data.contactName;

        htmlContent = `
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px;">
                <div style="background: #1E40AF; padding: 20px 24px; border-radius: 8px 8px 0 0;">
                    <h2 style="color: #ffffff; margin: 0; font-size: 18px;">Nueva Solicitud de Empresa — SelectDriver Web</h2>
                </div>
                <div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                        <tr><td style="padding: 8px 4px; color: #6b7280; width: 160px;"><strong>Empresa:</strong></td><td style="padding: 8px 4px;">${data.companyName}</td></tr>
                        <tr><td style="padding: 8px 4px; color: #6b7280;"><strong>Contacto:</strong></td><td style="padding: 8px 4px;">${data.contactName}</td></tr>
                        <tr><td style="padding: 8px 4px; color: #6b7280;"><strong>Email:</strong></td><td style="padding: 8px 4px;"><a href="mailto:${data.email}" style="color: #1E40AF;">${data.email}</a></td></tr>
                        <tr><td style="padding: 8px 4px; color: #6b7280;"><strong>Teléfono:</strong></td><td style="padding: 8px 4px;">${data.phone}</td></tr>
                        <tr><td style="padding: 8px 4px; color: #6b7280;"><strong>Necesidad principal:</strong></td><td style="padding: 8px 4px;"><strong style="color: #F97316;">${need}</strong></td></tr>
                        <tr><td style="padding: 8px 4px; color: #6b7280;"><strong>Fecha/hora:</strong></td><td style="padding: 8px 4px;">${timestamp}</td></tr>
                        <tr><td style="padding: 8px 4px; color: #6b7280;"><strong>Página origen:</strong></td><td style="padding: 8px 4px;">Página Empresas (companies.html)</td></tr>
                    </table>
                    ${data.message ? `
                    <div style="margin-top: 16px;">
                        <p style="color: #6b7280; font-size: 14px; margin-bottom: 6px;"><strong>Mensaje / Detalles:</strong></p>
                        <blockquote style="background: #ffffff; padding: 12px 16px; border-left: 4px solid #F97316; margin: 0; border-radius: 0 4px 4px 0; font-size: 14px; color: #374151;">${data.message}</blockquote>
                    </div>` : ''}
                </div>
                <p style="font-size: 12px; color: #9ca3af; margin-top: 16px; text-align: center;">SelectDriver Web — Notificación automática</p>
            </div>
        `;

        // Auto-response content adapted to "necesidad principal"
        const needMessages = {
            'Cobertura urgente': 'Sabemos que el tiempo es clave. Nuestro equipo revisará su solicitud con prioridad y le contactará a la brevedad.',
            'Planificación de incorporaciones': 'Revisaremos su necesidad de planificación y le presentaremos un enfoque adaptado a sus tiempos.',
            'Información sobre el servicio': 'Le enviaremos toda la información sobre nuestro proceso de selección y los servicios disponibles.',
            'Solicitar reunión': 'Nos pondremos en contacto para coordinar una reunión en la fecha que mejor le convenga.',
            'Otra consulta': 'Un consultor especializado revisará su consulta y le responderá con la mayor brevedad posible.'
        };
        const needMsg = needMessages[need] || 'Un consultor especializado le contactará pronto.';

        autoResponseSubject = `Hemos recibido su solicitud — SelectDriver`;
        autoResponseHtml = `
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px;">
                <div style="background: #1E40AF; padding: 20px 24px; border-radius: 8px 8px 0 0;">
                    <h2 style="color: #ffffff; margin: 0; font-size: 18px;">Confirmación de recepción</h2>
                </div>
                <div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
                    <p style="font-size: 15px;">Estimado/a <strong>${data.contactName}</strong>,</p>
                    <p style="font-size: 14px; color: #374151;">Hemos recibido correctamente su solicitud de <strong>${data.companyName}</strong>. Muchas gracias por contactar con SelectDriver.</p>
                    <div style="background: #eff6ff; border-left: 4px solid #1E40AF; padding: 14px 16px; border-radius: 0 4px 4px 0; margin: 16px 0;">
                        <p style="margin: 0; font-size: 14px; color: #1E40AF;">${needMsg}</p>
                    </div>
                    <p style="font-size: 13px; color: #6b7280;">Tiempo de respuesta habitual: <strong>menos de 24 horas hábiles</strong>.</p>
                    <p style="font-size: 13px; color: #6b7280;">Si necesita contactarnos directamente: <a href="mailto:info@selectdriver.es" style="color: #1E40AF;">info@selectdriver.es</a> · <a href="tel:+34603293679" style="color: #1E40AF;">+34 603 293 679</a></p>
                </div>
                <p style="font-size: 12px; color: #9ca3af; margin-top: 16px; text-align: center;">SelectDriver — Reclutamiento Internacional de Conductores</p>
            </div>
        `;
    } else if (type === 'drivers') {
        subject = `[SelectDriver Web] Evaluación de conductor: ${data.fullName}`;
        clientEmail = data.email;
        clientName = data.fullName;

        htmlContent = `
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px;">
                <div style="background: #F97316; padding: 20px 24px; border-radius: 8px 8px 0 0;">
                    <h2 style="color: #ffffff; margin: 0; font-size: 18px;">Nueva Evaluación de Conductor — SelectDriver Web</h2>
                </div>
                <div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                        <tr><td style="padding: 8px 4px; color: #6b7280; width: 160px;"><strong>Nombre:</strong></td><td style="padding: 8px 4px;">${data.fullName}</td></tr>
                        <tr><td style="padding: 8px 4px; color: #6b7280;"><strong>País:</strong></td><td style="padding: 8px 4px;">${data.country}</td></tr>
                        <tr><td style="padding: 8px 4px; color: #6b7280;"><strong>Email:</strong></td><td style="padding: 8px 4px;"><a href="mailto:${data.email}" style="color: #1E40AF;">${data.email}</a></td></tr>
                        <tr><td style="padding: 8px 4px; color: #6b7280;"><strong>Teléfono:</strong></td><td style="padding: 8px 4px;">${data.phone}</td></tr>
                        <tr><td style="padding: 8px 4px; color: #6b7280;"><strong>Experiencia:</strong></td><td style="padding: 8px 4px;">${data.experience}</td></tr>
                        <tr><td style="padding: 8px 4px; color: #6b7280;"><strong>Fecha/hora:</strong></td><td style="padding: 8px 4px;">${timestamp}</td></tr>
                    </table>
                    ${data.summary ? `<div style="margin-top: 16px;"><p style="color: #6b7280; font-size: 14px; margin-bottom: 6px;"><strong>Resumen:</strong></p><blockquote style="background: #ffffff; padding: 12px 16px; border-left: 4px solid #1E40AF; margin: 0; border-radius: 0 4px 4px 0; font-size: 14px;">${data.summary}</blockquote></div>` : ''}
                </div>
            </div>
        `;
    } else if (type === 'contact') {
        subject = `[SelectDriver Web] Consulta: ${data.subject || 'General'} — ${data.fullName}`;
        clientEmail = data.email;
        clientName = data.fullName;

        htmlContent = `
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px;">
                <div style="background: #374151; padding: 20px 24px; border-radius: 8px 8px 0 0;">
                    <h2 style="color: #ffffff; margin: 0; font-size: 18px;">Consulta General — SelectDriver Web</h2>
                </div>
                <div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                        <tr><td style="padding: 8px 4px; color: #6b7280; width: 160px;"><strong>Nombre:</strong></td><td style="padding: 8px 4px;">${data.fullName}</td></tr>
                        <tr><td style="padding: 8px 4px; color: #6b7280;"><strong>Email:</strong></td><td style="padding: 8px 4px;"><a href="mailto:${data.email}" style="color: #1E40AF;">${data.email}</a></td></tr>
                        <tr><td style="padding: 8px 4px; color: #6b7280;"><strong>Asunto:</strong></td><td style="padding: 8px 4px;">${data.subject}</td></tr>
                        <tr><td style="padding: 8px 4px; color: #6b7280;"><strong>Fecha/hora:</strong></td><td style="padding: 8px 4px;">${timestamp}</td></tr>
                    </table>
                    ${data.message ? `<div style="margin-top: 16px;"><blockquote style="background: #fff; padding: 12px 16px; border-left: 4px solid #9ca3af; margin: 0; border-radius: 0 4px 4px 0; font-size: 14px;">${data.message}</blockquote></div>` : ''}
                </div>
            </div>
        `;
    }

    try {
        // 1. Send internal notification
        await transporter.sendMail({
            from: `"SelectDriver Web" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_TO,
            subject: subject,
            html: htmlContent,
            replyTo: clientEmail || process.env.EMAIL_USER
        });

        // 2. Send auto-response to client (if applicable)
        if (clientEmail && autoResponseHtml) {
            await transporter.sendMail({
                from: `"SelectDriver" <${process.env.EMAIL_USER}>`,
                to: clientEmail,
                subject: autoResponseSubject,
                html: autoResponseHtml
            });
        }

        res.status(200).json({ success: true, message: 'Email enviado correctamente' });
    } catch (error) {
        console.error('Email sending failed with error:', error);
        res.status(500).json({
            error: 'Error al enviar el email',
            details: error.message,
            code: error.code
        });
    }
};

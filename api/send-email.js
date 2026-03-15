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

    // Configure Transporter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.office365.com',
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_PORT == 465, // True for 465, false for 587
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    // Generate timestamp
    const now = new Date();
    const timestamp = now.toLocaleString('es-ES', {
        timeZone: 'Europe/Madrid',
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });

    // --- Helper for Email Template ---
    const getEmailTemplate = (title, content, color = '#1E40AF') => `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 20px auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
                .header { background: ${color}; padding: 30px 40px; text-align: center; }
                .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; }
                .content { padding: 40px; background: #ffffff; }
                .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
                .info-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                .info-table td { padding: 12px 0; border-bottom: 1px solid #f3f4f6; vertical-align: top; }
                .info-table td.label { color: #6b7280; font-weight: 600; width: 180px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; }
                .info-table td.value { color: #111827; font-size: 14px; }
                .highlight-box { background: #eff6ff; border-left: 4px solid ${color}; padding: 20px; border-radius: 0 8px 8px 0; margin: 25px 0; }
                .quote { border-left: 4px solid #F97316; background: #fffaf0; padding: 15px 20px; font-style: italic; margin: 20px 0; border-radius: 0 8px 8px 0; color: #4b5563; white-space: pre-wrap; }
                .footer-links { margin-top: 10px; }
                .footer-links a { color: #9ca3af; text-decoration: none; margin: 0 10px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>${title}</h1>
                </div>
                <div class="content">
                    ${content}
                </div>
                <div class="footer">
                    <p style="margin: 0;">&copy; ${now.getFullYear()} SelectDriver — Reclutamiento Internacional de Conductores</p>
                    <div class="footer-links">
                        <a href="https://selectdriver.es/privacy-policy.html">Privacidad</a>
                        <a href="https://selectdriver.es/contact.html">Contacto</a>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;

    // Construct Email Content based on form type
    let internalSubject = '';
    let internalHtml = '';
    let autoResponseSubject = '';
    let autoResponseHtml = '';
    const clientEmail = data.email;
    const clientName = data.contactName || data.fullName || 'Usuario';
    const source = data.source || 'Website';

    if (type === 'companies') {
        const need = data.need || 'Consulta general';

        // REQ: [SelectDriver Web] Cobertura urgente — [Company Name]
        internalSubject = `[SelectDriver Web] ${need} — ${data.companyName}`;

        internalHtml = getEmailTemplate('Nueva Solicitud de Empresa', `
            <p>Se ha recibido una nueva solicitud de una empresa interesada en los servicios de SelectDriver.</p>
            <table class="info-table">
                <tr><td class="label">Empresa</td><td class="value"><strong>${data.companyName}</strong></td></tr>
                <tr><td class="label">Contacto</td><td class="value">${data.contactName}</td></tr>
                <tr><td class="label">Email</td><td class="value"><a href="mailto:${data.email}" style="color: #1E40AF;">${data.email}</a></td></tr>
                <tr><td class="label">Teléfono</td><td class="value">${data.phone}</td></tr>
                <tr><td class="label">Necesidad principal</td><td class="value"><strong style="color: #F97316;">${need}</strong></td></tr>
                <tr><td class="label">Fecha/Hora</td><td class="value">${timestamp}</td></tr>
                <tr><td class="label">Página de origen</td><td class="value">${source} (Página de Empresas)</td></tr>
            </table>
            ${data.message ? `<p><strong>Mensaje / Detalles:</strong></p><div class="quote">${data.message}</div>` : ''}
        `, '#1E40AF');

        const needMessages = {
            'Cobertura urgente': 'Sabemos que el tiempo es crítico para su operativa. Nuestro equipo de selección ha sido notificado y revisará su solicitud con prioridad máxima.',
            'Planificación de incorporaciones': 'Gracias por pensar en SelectDriver para su crecimiento. Analizaremos su cronograma para proponerle la mejor estrategia de incorporación.',
            'Información sobre el servicio': 'En breve recibirá un dossier detallado con nuestro proceso de selección, garantías y modelos de colaboración.',
            'Solicitar reunión': 'Un consultor se pondrá en contacto para agendar una videollamada y conocer a fondo sus requerimientos.',
            'Otra consulta': 'Hemos recibido su consulta. Un especialista en gestión de flotas le responderá en las próximas horas.'
        };
        const needMsg = needMessages[need] || 'Un consultor especializado le contactará pronto para ayudarle con su necesidad.';

        autoResponseSubject = 'Confirmación de solicitud — SelectDriver';
        autoResponseHtml = getEmailTemplate('¡Gracias por contactarnos!', `
            <p>Estimado/a <strong>${data.contactName}</strong>,</p>
            <p>Hemos recibido correctamente la solicitud de <strong>${data.companyName}</strong>. Es un placer saludarle.</p>
            <div class="highlight-box">
                <p style="margin: 0; color: #1E40AF; font-weight: 500;">${needMsg}</p>
            </div>
            <p>Un consultor experto de nuestro equipo revisará los detalles y se pondrá en contacto con usted en un plazo máximo de 24 horas hábiles.</p>
            <p style="font-size: 14px; color: #6b7280;">Si tiene alguna urgencia o desea agilizar el proceso, puede escribirnos directamente respondiendo a este email o llamarnos al <a href="tel:+34603293679" style="color: #1E40AF; text-decoration: none; font-weight: 600;">+34 603 293 679</a>.</p>
        `, '#1E40AF');

    } else if (type === 'drivers') {
        internalSubject = `🚚 Nueva Evaluación Conductor: ${data.fullName}`;
        internalHtml = getEmailTemplate('Nueva Evaluación de Conductor', `
            <p>Un nuevo conductor ha completado el formulario de evaluación inicial desde la web.</p>
            <table class="info-table">
                <tr><td class="label">Nombre completo</td><td class="value"><strong>${data.fullName}</strong></td></tr>
                <tr><td class="label">País</td><td class="value">${data.country}</td></tr>
                <tr><td class="label">Email</td><td class="value"><a href="mailto:${data.email}" style="color: #F97316;">${data.email}</a></td></tr>
                <tr><td class="label">Teléfono</td><td class="value">${data.phone}</td></tr>
                <tr><td class="label">Experiencia</td><td class="value">${data.experience}</td></tr>
                <tr><td class="label">Licencia < 2009</td><td class="value">${data.licensePriorSept2009}</td></tr>
                <tr><td class="label">Fecha Licencia</td><td class="value">${data.licenseIssueDate}</td></tr>
                <tr><td class="label">Fecha/Hora</td><td class="value">${timestamp}</td></tr>
                <tr><td class="label">Origen</td><td class="value">${source}</td></tr>
            </table>
        `, '#F97316');

        autoResponseSubject = 'Evaluación recibida correctamente — SelectDriver';
        autoResponseHtml = getEmailTemplate('¡Formulario recibido!', `
            <p>Hola <strong>${data.fullName}</strong>,</p>
            <p>Gracias por tu interés en trabajar como conductor profesional en España con SelectDriver. He recibido tus datos correctamente.</p>
            <div class="highlight-box" style="border-left-color: #F97316; background-color: #fffaf0;">
                <p style="margin: 0; color: #C2410C; font-weight: 500;">Nuestro equipo revisará tu perfil y tu experiencia. Si cumples con los requisitos, te contactaremos vía WhatsApp para explicarte los siguientes pasos del proceso de selección.</p>
            </div>
            <p>Recuerda que SelectDriver es tu socio estratégico para facilitar tu incorporación legal y profesional en el mercado europeo.</p>
            <p style="font-size: 14px; color: #6b7280;">No es necesario que envíes documentos adicionales en este momento. Un consultor se pondrá en contacto contigo pronto.</p>
        `, '#F97316');

    } else if (type === 'contact') {
        internalSubject = `📩 Consulta Web: ${data.subject || 'Sin asunto'}`;
        internalHtml = getEmailTemplate('Nueva Consulta General', `
            <p>Se ha recibido un nuevo mensaje a través del formulario de contacto de la web.</p>
            <table class="info-table">
                <tr><td class="label">Nombre</td><td class="value"><strong>${data.fullName}</strong></td></tr>
                <tr><td class="label">Email</td><td class="value"><a href="mailto:${data.email}" style="color: #374151;">${data.email}</a></td></tr>
                <tr><td class="label">Asunto</td><td class="value">${data.subject || 'General'}</td></tr>
                <tr><td class="label">Fecha/Hora</td><td class="value">${timestamp}</td></tr>
                <tr><td class="label">Origen</td><td class="value">${source}</td></tr>
            </table>
            <p><strong>Mensaje:</strong></p>
            <div class="quote">${data.message}</div>
        `, '#374151');

        autoResponseSubject = 'Hemos recibido tu consulta — SelectDriver';
        autoResponseHtml = getEmailTemplate('Confirmación de contacto', `
            <p>Hola <strong>${data.fullName}</strong>,</p>
            <p>Gracias por contactar con SelectDriver. Te confirmamos que hemos recibido tu mensaje correctamente.</p>
            <div class="highlight-box" style="border-left-color: #374151; background-color: #f9fafb;">
                <p style="margin: 0; color: #374151; font-weight: 500;">Un miembro de nuestro equipo revisará tu consulta y te responderá lo antes posible. Habitualmente respondemos en menos de 24 horas hábiles.</p>
            </div>
            <p>Si tu consulta es sobre empleo para conductores, te recomendamos revisar nuestra sección de <a href="https://selectdriver.es/drivers.html" style="color: #1E40AF;">conductores</a> para agilizar el proceso.</p>
        `, '#374151');
    }

    try {
        // 1. Send internal notification
        await transporter.sendMail({
            from: `"SelectDriver Web" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_TO,
            subject: internalSubject,
            html: internalHtml,
            replyTo: clientEmail || process.env.EMAIL_USER
        });

        // 2. Send auto-response to client
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
        console.error('Email sending failed:', error);
        res.status(500).json({
            error: 'Error al enviar el email',
            details: error.message
        });
    }
};

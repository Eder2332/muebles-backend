const { sendEmail, isEmailEnabled } = require('../utils/mailer');
const { buildSupportReportEmail } = require('../utils/emailTemplates');

function normalizeText(value) {
  return String(value || '').trim();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

exports.sendSupportReport = async (req, res) => {
  const name = normalizeText(req.body?.name);
  const email = normalizeText(req.body?.email).toLowerCase();
  const issueType = normalizeText(req.body?.issueType);
  const message = normalizeText(req.body?.message);

  if (!name || name.length < 2) {
    return res.status(400).json({
      error: 'Ingresa tu nombre'
    });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({
      error: 'Ingresa un correo válido'
    });
  }

  if (!issueType) {
    return res.status(400).json({
      error: 'Selecciona el tipo de problema'
    });
  }

  if (!message || message.length < 10) {
    return res.status(400).json({
      error: 'Describe tu problema con más detalle'
    });
  }

  if (!isEmailEnabled()) {
    return res.status(503).json({
      error: 'El servicio de soporte por correo no está disponible por ahora'
    });
  }

  const supportEmail = process.env.SUPPORT_TO_EMAIL?.trim() || 'vilcayucrae@gmail.com';
  const { html, text } = buildSupportReportEmail({
    name,
    email,
    issueType,
    message
  });

  try {
    await sendEmail({
      to: supportEmail,
      subject: `UrbanMuebles: nuevo reporte de soporte - ${issueType}`,
      html,
      text,
      replyTo: email
    });

    return res.status(201).json({
      message: 'Tu reporte fue enviado correctamente'
    });
  } catch (error) {
    console.log('No se pudo enviar el correo de soporte:', error?.message || error);
    return res.status(500).json({
      error: 'No se pudo enviar tu reporte en este momento'
    });
  }
};

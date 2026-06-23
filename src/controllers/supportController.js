const { sendEmail, isEmailEnabled } = require('../utils/mailer');
const { buildSupportReportEmail } = require('../utils/emailTemplates');
const User = require('../models/User');

function normalizeText(value) {
  return String(value || '').trim();
}

function isValidName(name) {
  return /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(name);
}

exports.sendSupportReport = async (req, res) => {
  const name = normalizeText(req.body?.name);
  const issueType = normalizeText(req.body?.issueType);
  const message = normalizeText(req.body?.message);

  if (!req.user?.id) {
    return res.status(401).json({
      error: 'Debes iniciar sesión'
    });
  }

  if (!name || name.length < 2) {
    return res.status(400).json({
      error: 'Ingresa tu nombre'
    });
  }

  if (!isValidName(name)) {
    return res.status(400).json({
      error: 'El nombre solo puede contener letras y espacios'
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

  try {
    const user = await User.findByPk(req.user.id);

    if (!user?.email) {
      return res.status(400).json({
        error: 'Tu cuenta no tiene un correo válido registrado'
      });
    }

    const email = normalizeText(user.email).toLowerCase();
    const { html, text } = buildSupportReportEmail({
      name,
      email,
      issueType,
      message
    });

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

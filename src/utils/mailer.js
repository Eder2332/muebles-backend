const nodemailer = require('nodemailer');
const { google } = require('googleapis');

function getEnv(name) {
  const value = process.env[name];
  return typeof value === 'string' ? value.trim() : '';
}

function isEmailEnabled() {
  return String(getEnv('EMAIL_ENABLED')).toLowerCase() === 'true';
}

async function createTransporter() {
  const gmailUser = getEnv('GMAIL_SENDER');
  const clientId = getEnv('GOOGLE_CLIENT_ID');
  const clientSecret = getEnv('GOOGLE_CLIENT_SECRET');
  const refreshToken = getEnv('GOOGLE_REFRESH_TOKEN');

  if (!gmailUser || !clientId || !clientSecret || !refreshToken) {
    throw new Error('EMAIL_CONFIG_INCOMPLETE');
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  const accessTokenResponse = await oauth2Client.getAccessToken();
  const accessToken = accessTokenResponse?.token;

  if (!accessToken) {
    throw new Error('EMAIL_ACCESS_TOKEN_FAILED');
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: gmailUser,
      clientId,
      clientSecret,
      refreshToken,
      accessToken
    }
  });
}

async function sendEmail({ to, subject, html, text }) {
  if (!isEmailEnabled()) return { skipped: true };

  const fromName = getEnv('EMAIL_FROM_NAME') || 'UrbanMuebles';
  const gmailUser = getEnv('GMAIL_SENDER');

  const transporter = await createTransporter();

  const info = await transporter.sendMail({
    from: `"${fromName}" <${gmailUser}>`,
    to,
    subject,
    html,
    text
  });

  return { skipped: false, messageId: info.messageId };
}

module.exports = {
  sendEmail,
  isEmailEnabled
};


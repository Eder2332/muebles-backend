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

  oauth2Client.setCredentials({
    refresh_token: refreshToken,
    access_token: accessToken
  });

  const gmail = google.gmail({
    version: 'v1',
    auth: oauth2Client
  });

  return {
    gmail,
    gmailUser
  };
}

function toBase64Url(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function buildRawMessage({ from, to, subject, html, text }) {
  const lines = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    '',
    html || text || ''
  ];

  return toBase64Url(lines.join('\r\n'));
}

async function sendEmail({ to, subject, html, text }) {
  if (!isEmailEnabled()) {
    console.log('[EMAIL] Envío omitido: EMAIL_ENABLED no está en true');
    return { skipped: true, reason: 'EMAIL_DISABLED' };
  }

  const fromName = getEnv('EMAIL_FROM_NAME') || 'UrbanMuebles';
  const gmailUser = getEnv('GMAIL_SENDER');

  console.log(`[EMAIL] Preparando envío. From: ${gmailUser} -> To: ${to}`);

  const { gmail } = await createTransporter();
  const fromHeader = `"${fromName}" <${gmailUser}>`;
  const raw = buildRawMessage({
    from: fromHeader,
    to,
    subject,
    html,
    text
  });

  const response = await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw
    }
  });

  console.log(`[EMAIL] Correo enviado correctamente. MessageId: ${response.data.id}`);
  return { skipped: false, messageId: response.data.id };
}

module.exports = {
  sendEmail,
  isEmailEnabled
};

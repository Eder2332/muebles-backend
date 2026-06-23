function formatMoney(value) {
  const number = Number(value) || 0;
  return number.toFixed(2);
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildOrderReceiptEmail({ orderId, items, total }) {
  const rows = (items || [])
    .map((item) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #eee;">${escapeHtml(item.nombre)}</td>
        <td style="padding:8px;border-bottom:1px solid #eee; text-align:center;">${item.quantity}</td>
        <td style="padding:8px;border-bottom:1px solid #eee; text-align:right;">S/ ${formatMoney(item.price)}</td>
        <td style="padding:8px;border-bottom:1px solid #eee; text-align:right;">S/ ${formatMoney(item.subtotal)}</td>
      </tr>
    `)
    .join('');

  const html = `
    <div style="font-family:Segoe UI, Arial, sans-serif; color:#2d3138;">
      <h2 style="margin:0 0 8px;">Gracias por tu compra</h2>
      <p style="margin:0 0 14px;">Tu pedido fue registrado correctamente.</p>
      <p style="margin:0 0 14px;"><strong>Orden:</strong> #${orderId}</p>
      <table style="border-collapse:collapse; width:100%; max-width:640px;">
        <thead>
          <tr>
            <th style="text-align:left; padding:8px; border-bottom:2px solid #ddd;">Producto</th>
            <th style="text-align:center; padding:8px; border-bottom:2px solid #ddd;">Cant.</th>
            <th style="text-align:right; padding:8px; border-bottom:2px solid #ddd;">Precio</th>
            <th style="text-align:right; padding:8px; border-bottom:2px solid #ddd;">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
      <p style="margin:14px 0 0; font-size:16px;"><strong>Total:</strong> S/ ${formatMoney(total)}</p>
      <p style="margin:18px 0 0; color:#7b6d63;">UrbanMuebles</p>
    </div>
  `;

  const textLines = (items || []).map((i) => `- ${i.nombre} x${i.quantity} = S/ ${formatMoney(i.subtotal)}`);
  const text = `Gracias por tu compra\nOrden: #${orderId}\n\n${textLines.join('\n')}\n\nTotal: S/ ${formatMoney(total)}\n`;

  return { html, text };
}

function buildSupportReportEmail({ name, email, issueType, message }) {
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeIssueType = escapeHtml(issueType);
  const safeMessage = escapeHtml(message).replace(/\n/g, '<br>');

  const html = `
    <div style="font-family:Segoe UI, Arial, sans-serif; color:#2d3138;">
      <h2 style="margin:0 0 8px;">Nuevo reporte de soporte</h2>
      <p style="margin:0 0 14px;">Se registró una nueva solicitud desde la página de soporte.</p>
      <p style="margin:0 0 8px;"><strong>Nombre:</strong> ${safeName}</p>
      <p style="margin:0 0 8px;"><strong>Correo:</strong> ${safeEmail}</p>
      <p style="margin:0 0 14px;"><strong>Tipo de problema:</strong> ${safeIssueType}</p>
      <div style="padding:14px; border-radius:12px; background:#f8f5f1; border:1px solid #eadfd3;">
        <p style="margin:0 0 8px;"><strong>Descripción del problema</strong></p>
        <p style="margin:0; line-height:1.6;">${safeMessage}</p>
      </div>
      <p style="margin:18px 0 0; color:#7b6d63;">UrbanMuebles</p>
    </div>
  `;

  const text = [
    'Nuevo reporte de soporte',
    '',
    `Nombre: ${name}`,
    `Correo: ${email}`,
    `Tipo de problema: ${issueType}`,
    '',
    'Descripción del problema:',
    message
  ].join('\n');

  return { html, text };
}

module.exports = {
  buildOrderReceiptEmail,
  buildSupportReportEmail
};

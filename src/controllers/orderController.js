const sequelize = require('../config/database');
const Product = require('../models/Product');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const User = require('../models/User');
const { sendEmail } = require('../utils/mailer');
const { buildOrderReceiptEmail } = require('../utils/emailTemplates');

function maskCardNumber(cardDigits) {
  const digits = String(cardDigits || '').replace(/\D/g, '');
  if (digits.length < 4) return '****';
  const last4 = digits.slice(-4);
  return `****-****-****-${last4}`;
}

exports.checkout = async (req, res) => {
  const { items, payment } = req.body || {};

  if (!req.user?.id) {
    return res.status(401).json({
      error: 'No autorizado'
    });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      error: 'Items requeridos'
    });
  }

  if (!payment || payment.method !== 'tarjeta') {
    return res.status(400).json({
      error: 'Método de pago inválido'
    });
  }

  const cardNumberRaw = (payment.cardNumber || '').trim();
  const cardDigits = cardNumberRaw.replace(/\D/g, '');

  if (cardDigits.length !== 16) {
    return res.status(400).json({
      error: 'El número de tarjeta debe tener 16 dígitos'
    });
  }

  const normalizedItems = items
    .map((item) => ({
      productId: Number(item.productId),
      quantity: Number(item.quantity || 1)
    }))
    .filter((item) => Number.isInteger(item.productId) && item.productId > 0 && Number.isInteger(item.quantity) && item.quantity > 0);

  if (!normalizedItems.length) {
    return res.status(400).json({
      error: 'Items inválidos'
    });
  }

  try {
    const productIds = [...new Set(normalizedItems.map((i) => i.productId))];
    let receiptItems = [];
    let receiptTotal = 0;

    const order = await sequelize.transaction(async (t) => {
      // Cargar y bloquear productos para actualizar stock en forma segura
      const products = await Product.findAll({
        where: { id: productIds },
        transaction: t,
        lock: t.LOCK.UPDATE
      });

      const productsById = new Map(products.map((p) => [p.id, p]));

      const missing = productIds.filter((id) => !productsById.has(id));
      if (missing.length) {
        const error = new Error('Hay productos que no existen');
        error.statusCode = 400;
        throw error;
      }

      // Validar stock y calcular total
      const total = normalizedItems.reduce((acc, item) => {
        const product = productsById.get(item.productId);
        const price = Number(product.precio) || 0;
        return acc + price * item.quantity;
      }, 0);

      receiptTotal = total;

      const createdOrder = await Order.create(
        {
          UserId: req.user.id,
          total,
          paymentMethod: 'tarjeta',
          cardNumber: maskCardNumber(cardDigits)
        },
        { transaction: t }
      );

      const orderItems = normalizedItems.map((item) => {
        const product = productsById.get(item.productId);

        const currentStock = Number(product.stock) || 0;
        if (currentStock < item.quantity) {
          const error = new Error(`Stock insuficiente para: ${product.nombre}`);
          error.statusCode = 400;
          throw error;
        }

        product.stock = currentStock - item.quantity;

        receiptItems.push({
          nombre: product.nombre,
          quantity: item.quantity,
          price: Number(product.precio) || 0,
          subtotal: (Number(product.precio) || 0) * item.quantity
        });

        return {
          OrderId: createdOrder.id,
          ProductId: product.id,
          quantity: item.quantity,
          price: product.precio
        };
      });

      await OrderItem.bulkCreate(orderItems, { transaction: t });

      // Guardar stock actualizado
      for (const product of productsById.values()) {
        if (product.changed('stock')) {
          await product.save({ transaction: t });
        }
      }

      return createdOrder;
    });

    // Enviar correo (no bloquea la compra si falla)
    try {
      const user = await User.findByPk(req.user.id);
      const to = user?.email;

      console.log(`[CHECKOUT] Orden #${order.id} registrada para el usuario ${req.user.id}. Email destino: ${to || 'sin email'}`);

      if (to) {
        const { html, text } = buildOrderReceiptEmail({
          orderId: order.id,
          items: receiptItems,
          total: receiptTotal
        });

        const emailResult = await sendEmail({
          to,
          subject: `UrbanMuebles: Confirmación de compra #${order.id}`,
          html,
          text
        });

        console.log('[CHECKOUT] Resultado del envío de correo:', emailResult);
      } else {
        console.log('[CHECKOUT] No se intentó enviar correo porque el usuario no tiene email');
      }
    } catch (emailError) {
      // Solo log, la compra ya fue registrada
      console.log('No se pudo enviar el correo de compra:', emailError?.message || emailError);
    }

    return res.status(201).json({
      message: 'Gracias por comprar',
      orderId: order.id
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        error: error.message
      });
    }

    return res.status(500).json({
      error: 'No se pudo procesar la compra'
    });
  }
};

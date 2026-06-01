const sequelize = require('../config/database');
const Product = require('../models/Product');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');

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

  const cardName = (payment.cardName || '').trim();
  const cardNumber = (payment.cardNumber || '').trim();
  const cardExpiry = (payment.cardExpiry || '').trim();
  const cardCvv = (payment.cardCvv || '').trim();

  if (!cardName || !cardNumber || !cardExpiry || !cardCvv) {
    return res.status(400).json({
      error: 'Datos de tarjeta incompletos'
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
    const products = await Product.findAll({
      where: { id: productIds }
    });

    const productsById = new Map(products.map((p) => [p.id, p]));

    const missing = productIds.filter((id) => !productsById.has(id));
    if (missing.length) {
      return res.status(400).json({
        error: 'Hay productos que no existen'
      });
    }

    const total = normalizedItems.reduce((acc, item) => {
      const product = productsById.get(item.productId);
      const price = Number(product.precio) || 0;
      return acc + price * item.quantity;
    }, 0);

    const order = await sequelize.transaction(async (t) => {
      const createdOrder = await Order.create(
        {
          UserId: req.user.id,
          total,
          paymentMethod: 'tarjeta',
          cardName,
          cardNumber,
          cardExpiry,
          cardCvv
        },
        { transaction: t }
      );

      const orderItems = normalizedItems.map((item) => {
        const product = productsById.get(item.productId);
        return {
          OrderId: createdOrder.id,
          ProductId: product.id,
          quantity: item.quantity,
          price: product.precio
        };
      });

      await OrderItem.bulkCreate(orderItems, { transaction: t });

      return createdOrder;
    });

    return res.status(201).json({
      message: 'Compra registrada',
      orderId: order.id
    });
  } catch (error) {
    return res.status(500).json({
      error: 'No se pudo procesar la compra'
    });
  }
};

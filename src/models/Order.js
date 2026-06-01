const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'tarjeta'
  },
  cardName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  cardNumber: {
    type: DataTypes.STRING,
    allowNull: false
  },
  cardExpiry: {
    type: DataTypes.STRING,
    allowNull: false
  },
  cardCvv: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

module.exports = Order;

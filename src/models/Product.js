const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {

  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },

  descripcion: {
    type: DataTypes.TEXT
  },

  precio: {
    type: DataTypes.DECIMAL(10,2),
    allowNull: false
  },

  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },

  imagen: {
    type: DataTypes.STRING
  }

});

module.exports = Product;
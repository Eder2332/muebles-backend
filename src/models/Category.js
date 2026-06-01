const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Category = sequelize.define('Category', {
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }
});

module.exports = Category;
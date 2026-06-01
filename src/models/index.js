const Category = require('./Category');
const Product = require('./Product');
const User = require('./User');
const Order = require('./Order');
const OrderItem = require('./OrderItem');

Category.hasMany(Product);

Product.belongsTo(Category);

User.hasMany(Order);
Order.belongsTo(User);

Order.hasMany(OrderItem);
OrderItem.belongsTo(Order);

Product.hasMany(OrderItem);
OrderItem.belongsTo(Product);

module.exports = {
  Category,
  Product,
  User,
  Order,
  OrderItem
};

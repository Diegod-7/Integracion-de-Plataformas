const User = require('./user.model');
const Product = require('./product.model');
const Order = require('./order.model');
const OrderItem = require('./order-item.model');

// Aquí se pueden establecer relaciones adicionales si es necesario

module.exports = {
  User,
  Product,
  Order,
  OrderItem
}; 
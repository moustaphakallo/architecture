const Cart = require('../models/Cart');
const Product = require('../models/Product');

async function getCart(req, res) {
  const cart = await Cart.findOne({ userId: req.user.id }).populate('items.productId');
  return res.json({ cart: cart || { userId: req.user.id, items: [] } });
}

async function addItem(req, res) {
  const { productId, quantity } = req.body;
  if (typeof productId !== 'string' || !Number.isInteger(quantity) || quantity < 1) {
    return res.status(400).json({ message: 'A productId and positive integer quantity are required' });
  }

  const product = await Product.findOne({ _id: productId, isActive: true, inStock: true });
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  let cart = await Cart.findOne({ userId: req.user.id });
  if (!cart) {
    cart = new Cart({ userId: req.user.id, items: [] });
  }
  const item = cart.items.find((entry) => entry.productId.equals(product._id));
  const nextQuantity = (item ? item.quantity : 0) + quantity;
  if (nextQuantity > product.stock) {
    return res.status(409).json({ message: 'Requested quantity exceeds available stock' });
  }

  if (item) {
    item.quantity = nextQuantity;
  } else {
    cart.items.push({ productId: product._id, quantity });
  }
  await cart.save();
  await cart.populate('items.productId');
  return res.json({ cart });
}

async function updateItem(req, res) {
  const { quantity } = req.body;
  if (!Number.isInteger(quantity) || quantity < 1) {
    return res.status(400).json({ message: 'Quantity must be a positive integer' });
  }

  const cart = await Cart.findOne({ userId: req.user.id });
  const item = cart && cart.items.find((entry) => entry.productId.equals(req.params.productId));
  if (!item) {
    return res.status(404).json({ message: 'Cart item not found' });
  }
  const product = await Product.findOne({ _id: item.productId, isActive: true, inStock: true });
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }
  if (quantity > product.stock) {
    return res.status(409).json({ message: 'Requested quantity exceeds available stock' });
  }

  item.quantity = quantity;
  await cart.save();
  await cart.populate('items.productId');
  return res.json({ cart });
}

async function removeItem(req, res) {
  const cart = await Cart.findOne({ userId: req.user.id });
  if (!cart) {
    return res.status(404).json({ message: 'Cart item not found' });
  }
  const originalLength = cart.items.length;
  cart.items = cart.items.filter((item) => !item.productId.equals(req.params.productId));
  if (cart.items.length === originalLength) {
    return res.status(404).json({ message: 'Cart item not found' });
  }
  await cart.save();
  return res.status(204).end();
}

module.exports = { addItem, getCart, removeItem, updateItem };

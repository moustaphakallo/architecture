const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Product = require('../models/Product');

function isValidAddress(address) {
  return address && ['name', 'phone', 'street', 'city', 'postalCode', 'country']
    .every((field) => typeof address[field] === 'string' && address[field].trim());
}

async function createOrder(req, res) {
  const { items, shippingAddress } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'A non-empty items array is required' });
  }
  if (shippingAddress !== undefined && !isValidAddress(shippingAddress)) {
    return res.status(400).json({ message: 'shippingAddress must include name, phone, street, city, postalCode and country' });
  }

  const quantities = new Map();
  for (const item of items) {
    const productId = item && (item.productId || item.product);
    if (typeof productId !== 'string' || !/^[a-f\d]{24}$/i.test(productId)
      || !Number.isInteger(item.quantity) || item.quantity < 1) {
      return res.status(400).json({ message: 'Each item must include a valid productId and positive integer quantity' });
    }
    const normalizedId = productId.toLowerCase();
    quantities.set(normalizedId, (quantities.get(normalizedId) || 0) + item.quantity);
  }

  const products = await Product.find({
    _id: { $in: [...quantities.keys()] },
    isActive: true,
  });
  const productById = new Map(products.map((product) => [product.id, product]));
  const orderItems = [];
  for (const [productId, quantity] of quantities) {
    const product = productById.get(productId);
    if (!product || !product.inStock || product.stock < quantity) {
      return res.status(409).json({ message: 'A product is unavailable or has insufficient stock' });
    }
    orderItems.push({
      product: product.id,
      name: product.name,
      price: product.price,
      quantity,
    });
  }

  const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const reservedItems = [];
  let order;
  try {
    for (const item of orderItems) {
      const result = await Product.updateOne(
        { _id: item.product, isActive: true, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } }
      );
      if (result.modifiedCount !== 1) {
        const error = new Error('Stock changed while placing the order; please retry');
        error.status = 409;
        throw error;
      }
      reservedItems.push(item);
    }

    [order] = await Order.create([{
      user: req.user.id,
      items: orderItems,
      total,
      ...(shippingAddress ? { shippingAddress } : {}),
    }]);

    const cart = await Cart.findOne({ userId: req.user.id });
    if (cart) {
      const purchasedIds = new Set(quantities.keys());
      cart.items = cart.items.filter((item) => !purchasedIds.has(item.productId.toString()));
      await cart.save();
    }
  } catch (error) {
    const rollbackErrors = [];
    for (const item of reservedItems) {
      try {
        await Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity } });
      } catch (rollbackError) {
        rollbackErrors.push(rollbackError);
      }
    }
    if (order) {
      try {
        await Order.findByIdAndDelete(order.id);
      } catch (rollbackError) {
        rollbackErrors.push(rollbackError);
      }
    }
    if (rollbackErrors.length) {
      throw new AggregateError([error, ...rollbackErrors], 'Order failed and inventory rollback was incomplete');
    }
    throw error;
  }

  return res.status(201).json({ order });
}

async function listOrders(req, res) {
  const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
  return res.json({ orders });
}

async function getOrder(req, res) {
  const filter = req.user.role === 'admin'
    ? { _id: req.params.id }
    : { _id: req.params.id, user: req.user.id };
  const order = await Order.findOne(filter);
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }
  return res.json({ order });
}

async function updateOrderStatus(req, res) {
  const allowedStatuses = ['paid', 'shipped', 'delivered', 'cancelled'];
  if (!allowedStatuses.includes(req.body.status)) {
    return res.status(400).json({ message: 'Invalid order status' });
  }

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true, runValidators: true }
  );
  if (!order) {
    return res.status(404).json({ message: 'Order not found' });
  }
  return res.json({ order });
}

module.exports = { createOrder, getOrder, listOrders, updateOrderStatus };

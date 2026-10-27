const Product = require("../models/Product");

exports.listProducts = async (req, res) => {
  const { category, search, q, sort } = req.query;
  const query = { isActive: true };

  if (category && category !== 'all') {
    const escapedCategory = String(category).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    query.category = { $regex: `^${escapedCategory}$`, $options: 'i' };
  }

  const searchTerm = search || q;
  if (searchTerm) {
    query.name = { $regex: String(searchTerm), $options: 'i' };
  }

  const sortOption = sort === 'price-low'
    ? { price: 1 }
    : sort === 'price-high'
      ? { price: -1 }
      : { createdAt: -1 };

  const products = await Product.find(query).sort(sortOption);
  return res.json(products);
};

exports.getProduct = async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, isActive: true });
  if (!product) {
    return res.status(404).json({ message: 'Produit non trouvé' });
  }
  return res.json(product);
};

exports.createProduct = async (req, res) => {
  const { name, emoji, price, category, specs, stock, inStock, description } = req.body;
  const product = await Product.create({ name, emoji, price, category, specs, stock, inStock, description });
  return res.status(201).json(product);
};

exports.updateProduct = async (req, res) => {
  const { name, emoji, price, category, specs, stock, inStock, isActive, description } = req.body;
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { name, emoji, price, category, specs, stock, inStock, isActive, description },
    { new: true, runValidators: true }
  );
  if (!product) {
    return res.status(404).json({ message: 'Produit non trouvé' });
  }
  return res.json(product);
};

exports.deleteProduct = async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!product) {
    return res.status(404).json({ message: 'Produit non trouvé' });
  }
  return res.status(204).end();
};

const express = require('express');
const Product = require('../models/Product');
const verifyToken = require('../middleware/verifyToken');
const verifyAdmin = require('../middleware/verifyAdmin');
const Cart = require('../models/Cart');
const router = express.Router();

// ✅ Return all products without filters
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });
    res.json(products);
  } catch {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.post('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch {
    res.status(400).json({ error: 'Failed to create product' });
  }
});

router.put('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch {
    res.status(400).json({ error: 'Failed to update product' });
  }
});

router.delete('/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const productId = req.params.id;

    // Delete the product
    await Product.findByIdAndDelete(productId);

    // Remove the product from all users' carts
    await Cart.updateMany(
      {},
      { $pull: { items: { productId: productId } } }
    );

    res.json({ message: 'Product deleted and removed from all carts' });
  } catch (err) {
    console.error('Delete Product Error:', err);
    res.status(400).json({ error: 'Failed to delete product' });
  }
});

module.exports = router;
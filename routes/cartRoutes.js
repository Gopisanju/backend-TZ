const express = require('express');
const Cart = require('../models/Cart');
const verifyToken = require('../middleware/verifyToken');
const router = express.Router();

router.post('/', verifyToken, async (req, res) => {
  const { productId, quantity } = req.body;
  try {
    let cart = await Cart.findOne({ userId: req.user.userId });
    if (!cart) {
      cart = new Cart({ userId: req.user.userId, items: [{ productId, quantity }] });
    } else {
      const index = cart.items.findIndex(item => item.productId.toString() === productId);
      if (index > -1) {
        cart.items[index].quantity += quantity;
      } else {
        cart.items.push({ productId, quantity });
      }
    }
    await cart.save();
    res.json(cart);
  } catch {
    res.status(500).json({ error: 'Cart error' });
  }
});

// GET /api/cart - fetch cart with full product info
router.get('/', verifyToken, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.userId }).populate({
      path: 'items.productId',
      model: 'Product'
    });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    res.json(cart);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// DELETE /api/cart/:productId - remove an item from the user's cart
router.delete('/:productId', verifyToken, async (req, res) => {
  const { productId } = req.params;

  try {
    const cart = await Cart.findOne({ userId: req.user.userId });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const initialLength = cart.items.length;

    // Filter out the item with the matching productId
    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId
    );

    if (cart.items.length === initialLength) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    await cart.save();
    res.json({ message: 'Item removed successfully', cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to remove item from cart' });
  }
});


module.exports = router;
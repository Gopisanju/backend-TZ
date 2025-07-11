// Express Router - routes/orderRoutes.js
const express = require('express');
const router = express.Router();

const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const verifyToken = require('../middleware/verifyToken');

// Place a new order
router.post('/', verifyToken, async (req, res) => {
    const { shippingAddress, items } = req.body;

    try {
        let orderItems = [];
        let totalAmount = 0;
        const cartProductIds = [];

        if (items && items.length > 0) {
            for (const item of items) {
                const product = await Product.findById(item._id || item.productId);
                if (!product) continue;

                const quantity = item.quantity || 1;
                const price = product.price;

                if (product.stock < quantity) {
                    return res.status(400).json({
                        error: `Insufficient stock for product ${product.name}`,
                    });
                }

                totalAmount += price * quantity;

                orderItems.push({
                    productId: product._id,
                    quantity,
                    price,
                });

                cartProductIds.push(product._id.toString());
            }
        } else {
            const cart = await Cart.findOne({ userId: req.user.userId }).populate('items.productId');
            if (!cart || cart.items.length === 0) {
                return res.status(400).json({ error: 'Cart is empty' });
            }

            for (const item of cart.items) {
                const product = item.productId;
                const quantity = item.quantity;
                const price = product.price;

                if (product.stock < quantity) {
                    return res.status(400).json({
                        error: `Insufficient stock for product ${product.name}`,
                    });
                }

                totalAmount += price * quantity;

                orderItems.push({
                    productId: product._id,
                    quantity,
                    price,
                });

                cartProductIds.push(product._id.toString());
            }
        }

        // ✅ Save the order
        const order = new Order({
            userId: req.user.userId,
            items: orderItems,
            shippingAddress,
            totalAmount,
        });

        await order.save();

        // ✅ Reduce stock
        for (const item of orderItems) {
            const product = await Product.findById(item.productId);
            if (product) {
                product.stock -= item.quantity;
                await product.save();
            }
        }

        // ✅ Clear ordered items from cart
        const userCart = await Cart.findOne({ userId: req.user.userId });
        if (userCart) {
            userCart.items = userCart.items.filter(
                (item) => !cartProductIds.includes(item.productId.toString())
            );
            await userCart.save();
        }

        res.status(201).json({ message: 'Order placed successfully', order });
    } catch (err) {
        console.error('Order Error:', err);
        res.status(500).json({ error: 'Failed to place order' });
    }
});


// Get all orders
router.get('/', verifyToken, async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('userId', 'userName email')
            .populate('items.productId', 'name price');

        const formattedOrders = orders.map(order => ({
            _id: order._id,
            user: {
                name: order.userId.userName || order.userId.name,
                email: order.userId.email
            },
            shippingAddress: order.shippingAddress,
            products: order.items.map(item => ({
                name: item.productId?.name,
                quantity: item.quantity,
                price: item.price
            })),
            totalAmount: order.totalAmount,
            status: order.status,
            createdAt: order.createdAt
        }));

        res.json(formattedOrders);
    } catch (err) {
        console.error('Fetch Orders Error:', err);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

module.exports = router;

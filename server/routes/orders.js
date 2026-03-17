const express = require('express');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { adminAuth } = require('../middleware/adminAuth');

const router = express.Router();

// Helper to reduce stock
async function reduceStock(items) {
    for (const item of items) {
        const product = await Product.findByPk(item.id);
        if (product) {
            const newStock = Math.max(0, product.stock - (item.quantity || 1));
            await product.update({ stock: newStock });
        }
    }
}

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ── POST /api/orders ────────────────────────────────────────────────
// Customer places an order (authenticated via Clerk userId)
router.post('/', async (req, res) => {
    try {
        const { userId, userEmail, userName, userPhone, items, totalAmount, shippingAddress, notes, isWhatsApp } = req.body;
        if (!userId || !items || !totalAmount) {
            return res.status(400).json({ error: 'userId, items, and totalAmount are required' });
        }

        const order = await Order.create({
            userId, userEmail, userName, userPhone,
            items,
            totalAmount,
            shippingAddress: shippingAddress || 'To be collected',
            notes: notes || (isWhatsApp ? 'WhatsApp Order' : ''),
            status: 'pending',
            paymentStatus: 'pending'
        });

        // Only reduce stock for direct web orders (not WhatsApp/pending payments)
        if (!isWhatsApp) {
            await reduceStock(items);
        }

        res.status(201).json({ message: 'Order created', order });
    } catch (err) {
        console.error('Create order error:', err);
        res.status(500).json({ error: 'Failed to place order' });
    }
});

// ── GET /api/orders/public/:id ──────────────────────────────────────
// Publicly fetch order summary (for payment link)
router.get('/public/:id', async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id);
        if (!order) return res.status(404).json({ error: 'Order not found' });
        
        // Return only necessary non-sensitive info
        res.json({
            id: order.id,
            totalAmount: order.totalAmount,
            items: order.items,
            userName: order.userName,
            userEmail: order.userEmail,
            paymentStatus: order.paymentStatus,
            status: order.status
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch order' });
    }
});

// ── POST /api/orders/initiate-link-payment ──────────────────────────
// Initiate Razorpay payment for an existing order (from link)
router.post('/initiate-link-payment', async (req, res) => {
    try {
        const { orderId } = req.body;
        const order = await Order.findByPk(orderId);
        
        if (!order) return res.status(404).json({ error: 'Order not found' });
        if (order.paymentStatus === 'paid') return res.status(400).json({ error: 'Order already paid' });

        const amountInPaise = Math.round(Number(order.totalAmount) * 100);
        const options = {
            amount: amountInPaise,
            currency: 'INR',
            receipt: `receipt_link_${order.id}`
        };

        const razorpayOrder = await razorpayInstance.orders.create(options);
        await order.update({ razorpayOrderId: razorpayOrder.id });

        res.json({
            razorpayOrderId: razorpayOrder.id,
            amount: amountInPaise,
            currency: 'INR',
            keyId: process.env.RAZORPAY_KEY_ID
        });
    } catch (err) {
        console.error('Initiate link payment error:', err);
        res.status(500).json({ error: 'Failed to initiate payment' });
    }
});

// ── POST /api/orders/create-razorpay-order ──────────────────────────
// Customer initiates a Razorpay checkout
router.post('/create-razorpay-order', async (req, res) => {
    try {
        const { userId, userEmail, userName, userPhone, items, totalAmount, shippingAddress, notes } = req.body;
        
        if (!userId || !items || !totalAmount) {
            return res.status(400).json({ error: 'userId, items, and totalAmount are required' });
        }

        // Create razorpay order instance
        const amountInPaise = Math.round(Number(totalAmount) * 100);
        const options = {
            amount: amountInPaise,
            currency: 'INR',
            receipt: `receipt_order_${Date.now()}`
        };

        const razorpayOrder = await razorpayInstance.orders.create(options);

        // Save order in our database as 'pending'
        const order = await Order.create({
            userId, userEmail, userName, userPhone,
            items,
            totalAmount,
            shippingAddress,
            notes,
            status: 'pending',
            paymentStatus: 'pending',
            razorpayOrderId: razorpayOrder.id
        });

        res.status(201).json({
            message: 'Razorpay order created',
            order,
            razorpayOrderId: razorpayOrder.id,
            amount: amountInPaise,
            currency: 'INR',
            keyId: process.env.RAZORPAY_KEY_ID // send key ID to frontend
        });
    } catch (err) {
        console.error('Create Razorpay order error:', err);
        res.status(500).json({ error: 'Failed to create Razorpay order' });
    }
});

// ── POST /api/orders/verify-payment ─────────────────────────────────
// Verify Razorpay payment signature
router.post('/verify-payment', async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
             return res.status(400).json({ error: 'Missing payment details' });
        }

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            // Find the order
            const order = await Order.findOne({ where: { razorpayOrderId: razorpay_order_id } });
            
            if (!order) {
                return res.status(404).json({ error: 'Order not found for this payment' });
            }

            await order.update({
                paymentStatus: 'paid',
                status: 'confirmed',
                razorpayPaymentId: razorpay_payment_id,
                razorpaySignature: razorpay_signature
            });

            // Reduce stock only when payment is verified
            if (order.items) {
                await reduceStock(order.items);
            }

            return res.json({ message: 'Payment verified successfully', order });
        } else {
            // Can optionally update the order status to failed here
            const order = await Order.findOne({ where: { razorpayOrderId: razorpay_order_id } });
            if (order) {
                await order.update({ paymentStatus: 'failed' });
            }
            return res.status(400).json({ error: 'Invalid signature' });
        }
    } catch (err) {
        console.error('Verify payment error:', err);
        res.status(500).json({ error: 'Failed to verify payment' });
    }
});

// ── GET /api/orders/my/:userId ──────────────────────────────────────
// Customer views their own orders
router.get('/my/:userId', async (req, res) => {
    try {
        const orders = await Order.findAll({
            where: { userId: req.params.userId },
            order: [['createdAt', 'DESC']],
        });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// ── Admin-only order routes ─────────────────────────────────────────

// GET /api/orders — Admin: view all orders
router.get('/', adminAuth, async (req, res) => {
    try {
        const orders = await Order.findAll({
            order: [['createdAt', 'DESC']],
        });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// GET /api/orders/:id — Admin: view single order
router.get('/:id', adminAuth, async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id);
        if (!order) return res.status(404).json({ error: 'Order not found' });
        res.json(order);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch order' });
    }
});

// PUT /api/orders/:id/status — Admin: update order status
router.put('/:id/status', adminAuth, async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const order = await Order.findByPk(req.params.id);
        if (!order) return res.status(404).json({ error: 'Order not found' });

        await order.update({ status });
        res.json({ message: 'Order status updated', order });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update order status' });
    }
});

module.exports = router;

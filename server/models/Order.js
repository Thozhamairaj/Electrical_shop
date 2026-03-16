const { DataTypes } = require('sequelize');
const { sequelize } = require('../index');

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: 'Clerk user ID',
    },
    userEmail: {
        type: DataTypes.STRING,
    },
    userName: {
        type: DataTypes.STRING,
    },
    userPhone: {
        type: DataTypes.STRING,
    },
    items: {
        type: DataTypes.JSON,
        allowNull: false,
        comment: 'Snapshot of cart items at time of order',
    },
    totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'),
        defaultValue: 'pending',
    },
    paymentStatus: {
        type: DataTypes.ENUM('pending', 'paid', 'failed'),
        defaultValue: 'pending',
    },
    razorpayOrderId: {
        type: DataTypes.STRING,
    },
    razorpayPaymentId: {
        type: DataTypes.STRING,
    },
    razorpaySignature: {
        type: DataTypes.STRING,
    },
    shippingAddress: {
        type: DataTypes.TEXT,
    },
    notes: {
        type: DataTypes.TEXT,
    },
}, {
    timestamps: true,
});

module.exports = Order;

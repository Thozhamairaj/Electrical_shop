const { DataTypes } = require('sequelize');
const { sequelize } = require('../index');

const CartItem = sequelize.define('CartItem', {
    pk: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    userEmail: {
        type: DataTypes.STRING,
    },
    userName: {
        type: DataTypes.STRING,
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    originalPrice: {
        type: DataTypes.DECIMAL(10, 2),
    },
    image: {
        type: DataTypes.STRING,
    },
    category: {
        type: DataTypes.STRING,
    },
    rating: {
        type: DataTypes.DECIMAL(3, 2),
    },
    reviews: {
        type: DataTypes.INTEGER,
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1
        }
    }
}, {
    timestamps: true
});

module.exports = CartItem;

const { DataTypes } = require('sequelize');
const { sequelize } = require('../index');

const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
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
    description: {
        type: DataTypes.TEXT,
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
        defaultValue: 0,
    },
    stock: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    }
}, {
    timestamps: true
});

module.exports = Product;

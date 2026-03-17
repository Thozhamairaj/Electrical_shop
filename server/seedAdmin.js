/**
 * Script to create the first admin account.
 * Run once: node server/seedAdmin.js
 *
 * Usage: node seedAdmin.js <username> <password> <email> <name>
 * Example: node seedAdmin.js admin admin123 admin@shop.com "Shop Admin"
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'postgres',
        logging: false,
    }
);

const { DataTypes } = require('sequelize');

const Admin = sequelize.define('Admin', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    passwordHash: { type: DataTypes.STRING, allowNull: false },
    name: { type: DataTypes.STRING },
    isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    lastLogin: { type: DataTypes.DATE },
}, { timestamps: true });

async function seedAdmin() {
    const args = process.argv.slice(2);
    const username = args[0] || 'admin';
    const password = args[1] || 'admin123';
    const email = args[2] || 'admin@electricalshop.com';
    const name = args[3] || 'Shop Administrator';

    try {
        await sequelize.authenticate();
        await sequelize.sync({ alter: true });

        const existing = await Admin.findOne({ where: { username } });
        if (existing) {
            console.log(`⚠️  Admin "${username}" already exists.`);
            process.exit(0);
        }

        const passwordHash = await bcrypt.hash(password, 12);
        const admin = await Admin.create({ username, email, passwordHash, name });
        console.log(`✅  Admin created successfully!`);
        console.log(`   Username: ${admin.username}`);
        console.log(`   Email:    ${admin.email}`);
        console.log(`   Name:     ${admin.name}`);
        console.log(`\n   Login at: http://localhost:5173/admin/login`);
    } catch (err) {
        console.error('❌  Failed to create admin:', err.message);
    } finally {
        await sequelize.close();
    }
}

seedAdmin();

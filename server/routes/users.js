const express = require('express');
const router = express.Router();
const Users = require('../models/User');

// Sync user data after login/signup
router.post('/sync', async (req, res) => {
    try {
        const { clerkId, email, name, profileImageUrl } = req.body;

        if (!clerkId) {
            return res.status(400).json({ message: 'clerkId is required' });
        }

        let user = await Users.findByPk(clerkId);

        if (user) {
            // Update existing user
            await user.update({
                email: email || user.email,
                name: name || user.name,
                profileImageUrl: profileImageUrl || user.profileImageUrl,
                lastLogin: new Date()
            });
            return res.status(200).json({ message: 'User updated', user });
        } else {
            // Create new user
            user = await Users.create({
                clerkId,
                email,
                name,
                profileImageUrl
            });
            return res.status(201).json({ message: 'User created', user });
        }
    } catch (error) {
        console.error('Error syncing user:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

// Get user profile
router.get('/profile/:clerkId', async (req, res) => {
    try {
        const user = await Users.findByPk(req.params.clerkId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

// Update user profile (phone, address, etc.)
router.put('/profile/:clerkId', async (req, res) => {
    try {
        const { phoneNumber, address, name } = req.body;
        const [updatedRowsCount, [updatedUser]] = await Users.update(
            { 
                phoneNumber, 
                address, 
                name 
            },
            { 
                where: { clerkId: req.params.clerkId },
                returning: true 
            }
        );

        if (updatedRowsCount === 0) {
            // Sequelize update for MySQL doesn't return the updated record like Postgres
            // So we need to fetch it if we want to return it
            const user = await Users.findByPk(req.params.clerkId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            return res.json({ message: 'Profile updated', user });
        }

        const user = await Users.findByPk(req.params.clerkId);
        res.json({ message: 'Profile updated', user });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

module.exports = router;

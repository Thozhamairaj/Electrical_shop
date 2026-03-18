const express = require('express');
const db = require('../db');
const router = express.Router();

// Sync user data after login/signup
router.post('/sync', async (req, res) => {
    try {
        const { clerkId, email, name, profileImageUrl } = req.body;

        if (!clerkId) {
            return res.status(400).json({ message: 'clerkId is required' });
        }

        const result = await db.query('SELECT * FROM "Users" WHERE "clerkId" = $1', [clerkId]);

        if (result.rows.length > 0) {
            // Update existing user
            const updateResult = await db.query(
                `UPDATE "Users" 
                 SET email = $1, name = $2, "profileImageUrl" = $3, "lastLogin" = NOW(), "updatedAt" = NOW()
                 WHERE "clerkId" = $4
                 RETURNING *`,
                [email, name, profileImageUrl, clerkId]
            );
            return res.status(200).json({ message: 'User updated', user: updateResult.rows[0] });
        } else {
            // Create new user
            const insertResult = await db.query(
                `INSERT INTO "Users" ("clerkId", email, name, "profileImageUrl", "createdAt", "updatedAt", "lastLogin") 
                 VALUES ($1, $2, $3, $4, NOW(), NOW(), NOW())
                 RETURNING *`,
                [clerkId, email, name, profileImageUrl]
            );
            return res.status(201).json({ message: 'User created', user: insertResult.rows[0] });
        }
    } catch (error) {
        console.error('Error syncing user:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

// Get user profile
router.get('/profile/:clerkId', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM "Users" WHERE "clerkId" = $1', [req.params.clerkId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

// Update user profile (phone, address, etc.)
router.put('/profile/:clerkId', async (req, res) => {
    try {
        const { phoneNumber, address, name } = req.body;
        const result = await db.query(
            `UPDATE "Users" 
             SET "phoneNumber" = $1, address = $2, name = $3, "updatedAt" = NOW()
             WHERE "clerkId" = $4
             RETURNING *`,
            [phoneNumber, address, name, req.params.clerkId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'Profile updated', user: result.rows[0] });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

module.exports = router;

const db = require('../db');

async function userAuth(req, res, next) {
    try {
        const clerkId = req.headers['x-user-id'] || req.headers['x-clerk-user-id'] || req.body?.userId;

        if (!clerkId || typeof clerkId !== 'string') {
            return res.status(401).json({ error: 'Unauthorized: user id is required' });
        }

        const result = await db.query('SELECT * FROM "Users" WHERE "clerkId" = $1 LIMIT 1', [clerkId]);
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ error: 'Unauthorized: user not found' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('userAuth error:', error);
        res.status(500).json({ error: 'Failed to verify user' });
    }
}

module.exports = { userAuth };
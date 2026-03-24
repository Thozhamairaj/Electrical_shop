const jwt = require('jsonwebtoken');

/**
 * Middleware to verify admin JWT token.
 * Expects: Authorization: Bearer <token>
 */
function adminAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.warn('adminAuth: No Bearer token provided in Authorization header');
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== 'admin') {
            return res.status(403).json({ error: 'Forbidden: Admin access only' });
        }
        req.admin = decoded;
        next();
    } catch (err) {
        console.error('adminAuth: Token verification failed:', err.message);
        return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
    }
}

module.exports = { adminAuth };

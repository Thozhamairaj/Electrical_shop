const express = require('express');
const { adminAuth } = require('../middleware/adminAuth');
const { userAuth } = require('../middleware/userAuth');
const {
    getReviewsForProduct,
    createReviewHandler,
    updateReviewHandler,
    deleteReviewHandler,
    helpfulReviewHandler,
    getUserReviewsHandler,
    getAdminReviewsHandler,
    getAdminReviewStatsHandler,
    updateReviewStatusHandler,
    adminDeleteReviewHandler,
} = require('../controllers/reviewController');

const router = express.Router();

router.get('/product/:id', getReviewsForProduct);
router.post('/', userAuth, createReviewHandler);
router.put('/:id', userAuth, updateReviewHandler);
router.delete('/:id', userAuth, deleteReviewHandler);
router.post('/helpful/:id', userAuth, helpfulReviewHandler);
router.get('/user', userAuth, getUserReviewsHandler);

router.get('/admin', adminAuth, getAdminReviewsHandler);
router.get('/admin/stats', adminAuth, getAdminReviewStatsHandler);
router.put('/admin/:id/status', adminAuth, updateReviewStatusHandler);
router.delete('/admin/:id', adminAuth, adminDeleteReviewHandler);

module.exports = router;
const {
    listProductReviews,
    createReview,
    updateReview,
    deleteReview,
    markHelpful,
    getUserReviews,
    listAdminReviews,
    updateReviewStatus,
} = require('../services/reviewService');
const { validateReviewInput, validateStatus } = require('../utils/reviewValidation');

function sendError(res, error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ error: error.message || 'Unexpected error' });
}

async function getReviewsForProduct(req, res) {
    try {
        const { id } = req.params;
        const { page, limit, sort } = req.query;
        const viewerUserId = req.user?.clerkId || req.headers['x-user-id'] || null;
        const result = await listProductReviews({
            productId: Number(id),
            page,
            limit,
            sort,
            viewerUserId,
        });

        res.json(result);
    } catch (error) {
        sendError(res, error);
    }
}

async function createReviewHandler(req, res) {
    try {
        const validation = validateReviewInput(req.body);
        if (!validation.isValid) {
            return res.status(400).json({ error: 'Validation failed', details: validation.errors });
        }

        const review = await createReview({
            clerkId: req.user.clerkId,
            productId: Number(req.body.productId),
            rating: validation.normalized.rating,
            reviewTitle: validation.normalized.reviewTitle,
            reviewText: validation.normalized.reviewText,
        });

        res.status(201).json({ message: 'Review submitted successfully', review });
    } catch (error) {
        sendError(res, error);
    }
}

async function updateReviewHandler(req, res) {
    try {
        const validation = validateReviewInput(req.body);
        if (!validation.isValid) {
            return res.status(400).json({ error: 'Validation failed', details: validation.errors });
        }

        const review = await updateReview({
            reviewId: Number(req.params.id),
            clerkId: req.user.clerkId,
            rating: validation.normalized.rating,
            reviewTitle: validation.normalized.reviewTitle,
            reviewText: validation.normalized.reviewText,
        });

        res.json({ message: 'Review updated successfully', review });
    } catch (error) {
        sendError(res, error);
    }
}

async function deleteReviewHandler(req, res) {
    try {
        await deleteReview({
            reviewId: Number(req.params.id),
            clerkId: req.user.clerkId,
        });

        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        sendError(res, error);
    }
}

async function helpfulReviewHandler(req, res) {
    try {
        const review = await markHelpful({
            reviewId: Number(req.params.id),
            clerkId: req.user.clerkId,
        });

        res.json({ message: 'Helpful vote recorded', review });
    } catch (error) {
        sendError(res, error);
    }
}

async function getUserReviewsHandler(req, res) {
    try {
        const reviews = await getUserReviews(req.user.clerkId);
        res.json({ reviews });
    } catch (error) {
        sendError(res, error);
    }
}

async function getAdminReviewsHandler(req, res) {
    try {
        const result = await listAdminReviews({
            status: req.query.status || 'all',
            page: req.query.page || 1,
            limit: req.query.limit || 20,
            search: req.query.search || '',
        });

        res.json(result);
    } catch (error) {
        sendError(res, error);
    }
}

async function getAdminReviewStatsHandler(req, res) {
    try {
        const result = await listAdminReviews({
            status: 'all',
            page: 1,
            limit: 1,
            search: '',
        });

        res.json(result.stats);
    } catch (error) {
        sendError(res, error);
    }
}

async function updateReviewStatusHandler(req, res) {
    try {
        const validation = validateStatus(req.body.status);
        if (!validation.isValid) {
            return res.status(400).json({ error: validation.error });
        }

        const review = await updateReviewStatus({
            reviewId: Number(req.params.id),
            status: req.body.status,
        });

        res.json({ message: 'Review status updated', review });
    } catch (error) {
        sendError(res, error);
    }
}

async function adminDeleteReviewHandler(req, res) {
    try {
        await deleteReview({
            reviewId: Number(req.params.id),
            clerkId: req.admin?.id ? String(req.admin.id) : 'admin',
            isAdmin: true,
        });

        res.json({ message: 'Review deleted successfully' });
    } catch (error) {
        sendError(res, error);
    }
}

module.exports = {
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
};
const db = require('../db');
const { runTrustInference } = require('./trustPipeline');

function toNumber(value, fallback = 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeReview(row) {
    if (!row) return null;

    return {
        id: row.id,
        userId: row.userId,
        productId: row.productId,
        rating: toNumber(row.rating),
        reviewTitle: row.reviewTitle,
        reviewText: row.reviewText,
        verifiedPurchase: Boolean(row.verifiedPurchase),
        helpfulVotes: toNumber(row.helpfulVotes),
        trustLevel: row.trustLevel,
        trustReason: row.trustReason,
        status: row.status,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        reviewerName: row.reviewerName || row.name || row.userName || 'Customer',
        reviewerEmail: row.email || row.userEmail || null,
        productName: row.productName || null,
        productImage: row.productImage || null,
    };
}

function reviewOrderClause(sort) {
    switch (sort) {
        case 'oldest':
            return 'r."createdAt" ASC, r.id ASC';
        case 'highest':
            return 'r.rating DESC, r."createdAt" DESC';
        case 'lowest':
            return 'r.rating ASC, r."createdAt" DESC';
        case 'newest':
        default:
            return 'r."createdAt" DESC, r.id DESC';
    }
}

function allowedSort(sort) {
    return ['newest', 'oldest', 'highest', 'lowest'].includes(sort) ? sort : 'newest';
}

function allowedPageValue(value, fallback) {
    const parsed = parseInt(value, 10);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

async function withTransaction(work) {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        const result = await work(client);
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

async function getUserById(client, clerkId) {
    const result = await client.query('SELECT * FROM "Users" WHERE "clerkId" = $1 LIMIT 1', [clerkId]);
    return result.rows[0] || null;
}

async function getProductById(client, productId) {
    const result = await client.query('SELECT * FROM "Products" WHERE id = $1 LIMIT 1', [productId]);
    return result.rows[0] || null;
}

async function getReviewById(client, reviewId) {
    const result = await client.query(
        `SELECT r.*, u.name AS "reviewerName", u.email AS "reviewerEmail", p.name AS "productName", p.image AS "productImage"
         FROM "Reviews" r
         LEFT JOIN "Users" u ON u."clerkId" = r."userId"
         LEFT JOIN "Products" p ON p.id = r."productId"
         WHERE r.id = $1
         LIMIT 1`,
        [reviewId]
    );
    return normalizeReview(result.rows[0]);
}

async function isVerifiedPurchase(client, clerkId, productId) {
    const result = await client.query(
        `SELECT EXISTS (
            SELECT 1
            FROM "Orders" o
            JOIN LATERAL jsonb_array_elements(o.items::jsonb) item ON TRUE
            WHERE o."userId" = $1
              AND o."paymentStatus" = 'paid'
              AND (item ->> 'id')::integer = $2
        ) AS verified`,
        [clerkId, productId]
    );

    return Boolean(result.rows[0]?.verified);
}

async function getApprovedSummary(client, productId) {
    const result = await client.query(
        `SELECT
            COUNT(*)::integer AS total_count,
            COALESCE(ROUND(AVG(rating)::numeric, 2), NULL) AS average_rating,
            COUNT(*) FILTER (WHERE rating = 5)::integer AS five_star,
            COUNT(*) FILTER (WHERE rating = 4)::integer AS four_star,
            COUNT(*) FILTER (WHERE rating = 3)::integer AS three_star,
            COUNT(*) FILTER (WHERE rating = 2)::integer AS two_star,
            COUNT(*) FILTER (WHERE rating = 1)::integer AS one_star
         FROM "Reviews"
         WHERE "productId" = $1
           AND status = 'Approved'`,
        [productId]
    );

    const row = result.rows[0] || {};
    const totalCount = toNumber(row.total_count, 0);
    const averageRating = row.average_rating == null ? null : Number(row.average_rating);

    return {
        reviewCount: totalCount,
        averageRating,
        distribution: {
            5: toNumber(row.five_star, 0),
            4: toNumber(row.four_star, 0),
            3: toNumber(row.three_star, 0),
            2: toNumber(row.two_star, 0),
            1: toNumber(row.one_star, 0),
        },
    };
}

async function getUserReviewStats(client, userId) {
    if (!userId) return { userReviewsCount: 1, userVerifiedCount: 0, userAvgRating: 5.0, userAvgHelpfulVote: 0.0, userPurchasedCount: 0 };
    try {
        const res = await client.query(
            `SELECT
                COUNT(*)::integer AS total,
                COUNT(*) FILTER (WHERE "verifiedPurchase" = TRUE)::integer AS verified,
                AVG(rating)::numeric AS avg_rating,
                AVG("helpfulVotes")::numeric AS avg_helpful
             FROM "Reviews"
             WHERE "userId" = $1`,
            [userId]
        );
        const ordersRes = await client.query(
            `SELECT COUNT(DISTINCT (item ->> 'id')::integer)::integer AS purchased_count
             FROM "Orders" o
             JOIN LATERAL jsonb_array_elements(o.items::jsonb) item ON TRUE
             WHERE o."userId" = $1
               AND o."paymentStatus" = 'paid'`,
            [userId]
        );
        const row = res.rows[0] || {};
        const purchasedRow = ordersRes.rows[0] || {};
        return {
            userReviewsCount: (row.total || 0) + 1,
            userVerifiedCount: row.verified || 0,
            userAvgRating: row.avg_rating == null ? 5.0 : Number(row.avg_rating),
            userAvgHelpfulVote: row.avg_helpful == null ? 0.0 : Number(row.avg_helpful),
            userPurchasedCount: Number(purchasedRow.purchased_count || 0),
        };
    } catch {
        return { userReviewsCount: 1, userVerifiedCount: 0, userAvgRating: 5.0, userAvgHelpfulVote: 0.0, userPurchasedCount: 0 };
    }
}

async function enrichReviewWithDynamicTrust(client, row, productData = null, viewerUserId = null) {
    if (!row) return null;
    const normalized = normalizeReview(row);

    try {
        let product = productData;
        if (!product && row.productId) {
            product = await getProductById(client, row.productId);
        }

        const userStats = await getUserReviewStats(client, row.userId);

        const trustResult = await runTrustInference({
            productId: row.productId,
            rating: normalized.rating,
            reviewTitle: normalized.reviewTitle || '',
            reviewText: normalized.reviewText || '',
            verifiedPurchase: normalized.verifiedPurchase,
            helpfulVotes: normalized.helpfulVotes,
            userReviewsCount: userStats.userReviewsCount,
            userVerifiedCount: userStats.userVerifiedCount,
            userAvgRating: userStats.userAvgRating,
            userAvgHelpfulVote: userStats.userAvgHelpfulVote,
            userPurchasedCount: userStats.userPurchasedCount,
            productData: product || null,
        });

        if (trustResult?.prediction) {
            normalized.trustLevel = trustResult.prediction.trust_level || normalized.trustLevel;
            normalized.trustReason = trustResult.prediction.trust_reason || normalized.trustReason;
            normalized.trustScore = trustResult.prediction.trust_score ?? null;
        }

        if (viewerUserId) {
            const feedbackRes = await client.query(
                `SELECT feedback, reason, "createdAt" FROM "ReviewTrustFeedback" WHERE "reviewId" = $1 AND "userId" = $2 LIMIT 1`,
                [normalized.id, viewerUserId]
            );
            if (feedbackRes.rows.length > 0) {
                normalized.userTrustFeedback = feedbackRes.rows[0];
            }
        }
    } catch (err) {
        console.error('Error enriching review with dynamic trust:', err);
    }

    return normalized;
}

async function listProductReviews({ productId, sort = 'newest', page = 1, limit = 10, viewerUserId = null }) {
    const safeSort = allowedSort(sort);
    const safePage = allowedPageValue(page, 1);
    const safeLimit = Math.min(20, allowedPageValue(limit, 10));
    const offset = (safePage - 1) * safeLimit;

    return withTransaction(async (client) => {
        const product = await getProductById(client, productId);
        if (!product) {
            const error = new Error('Product not found');
            error.statusCode = 404;
            throw error;
        }

        const summary = await getApprovedSummary(client, productId);

        const countResult = await client.query(
            `SELECT COUNT(*)::integer AS total_count
             FROM "Reviews" r
             WHERE r."productId" = $1
               AND r.status = 'Approved'`,
            [productId]
        );
        const totalCount = toNumber(countResult.rows[0]?.total_count, 0);

        const listParams = [productId, safeLimit, offset];
        const listQuery =
            `SELECT r.*, u.name AS "reviewerName", u.email AS "reviewerEmail"
             FROM "Reviews" r
             LEFT JOIN "Users" u ON u."clerkId" = r."userId"
             WHERE r."productId" = $1 AND r.status = 'Approved'
             ORDER BY ${reviewOrderClause(safeSort)}
             LIMIT $2 OFFSET $3`;

        const reviewsResult = await client.query(listQuery, listParams);

        const enrichedReviews = await Promise.all(
            reviewsResult.rows.map((row) => enrichReviewWithDynamicTrust(client, row, product, viewerUserId))
        );


        let currentUserReview = null;
        if (viewerUserId) {
            const currentResult = await client.query(
                `SELECT r.*, u.name AS "reviewerName", u.email AS "reviewerEmail"
                 FROM "Reviews" r
                 LEFT JOIN "Users" u ON u."clerkId" = r."userId"
                 WHERE r."productId" = $1 AND r."userId" = $2
                 LIMIT 1`,
                [productId, viewerUserId]
            );
            if (currentResult.rows[0]) {
                currentUserReview = await enrichReviewWithDynamicTrust(client, currentResult.rows[0], product);
            }
        }

        return {
            product: {
                id: product.id,
                name: product.name,
                image: product.image,
                rating: product.rating == null ? null : Number(product.rating),
                reviews: toNumber(product.reviews, 0),
            },
            summary,
            pagination: {
                page: safePage,
                limit: safeLimit,
                totalCount,
                totalPages: Math.max(1, Math.ceil(totalCount / safeLimit)),
                sort: safeSort,
            },
            reviews: enrichedReviews,
            currentUserReview,
        };
    });
}

async function createReview({ clerkId, productId, rating, reviewTitle, reviewText }) {
    return withTransaction(async (client) => {
        const user = await getUserById(client, clerkId);
        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 401;
            throw error;
        }

        const product = await getProductById(client, productId);
        if (!product) {
            const error = new Error('Product not found');
            error.statusCode = 404;
            throw error;
        }

        const existingReview = await client.query(
            'SELECT id FROM "Reviews" WHERE "userId" = $1 AND "productId" = $2 LIMIT 1',
            [clerkId, productId]
        );

        if (existingReview.rows.length > 0) {
            const error = new Error('You have already reviewed this product');
            error.statusCode = 409;
            throw error;
        }

        const verifiedPurchase = await isVerifiedPurchase(client, clerkId, productId);
        const userStats = await getUserReviewStats(client, clerkId);

        let trustLevel = 'Medium Trust';
        let trustReason = '';
        let reviewStatus = 'Approved';

        try {
            const trustResult = await runTrustInference({
                productId,
                rating,
                reviewTitle,
                reviewText,
                verifiedPurchase,
                helpfulVotes: 0,
                userReviewsCount: userStats.userReviewsCount,
                userVerifiedCount: userStats.userVerifiedCount + (verifiedPurchase ? 1 : 0),
                userAvgRating: userStats.userAvgRating,
                userAvgHelpfulVote: userStats.userAvgHelpfulVote,
                userPurchasedCount: userStats.userPurchasedCount,
                productData: product,
            });

            trustLevel = trustResult?.prediction?.trust_level || 'Medium Trust';
            trustReason = trustResult?.prediction?.trust_reason || '';
            reviewStatus = 'Approved';
        } catch (error) {
            console.error('Trust inference error during review creation:', error);
        }

        const insertResult = await client.query(
            `INSERT INTO "Reviews" (
                "userId", "productId", rating, "reviewTitle", "reviewText",
                "verifiedPurchase", "helpfulVotes", "trustLevel", "trustReason", status,
                "createdAt", "updatedAt"
            )
            VALUES ($1, $2, $3, $4, $5, $6, 0, $7, $8, $9, NOW(), NOW())
            RETURNING id`,
            [clerkId, productId, rating, reviewTitle, reviewText, verifiedPurchase, trustLevel, trustReason, reviewStatus]
        );

        const newReviewRow = await getReviewById(client, insertResult.rows[0].id);
        return enrichReviewWithDynamicTrust(client, newReviewRow, product);
    });
}

async function updateReview({ reviewId, clerkId, rating, reviewTitle, reviewText, isAdmin = false }) {
    return withTransaction(async (client) => {
        const existing = await getReviewById(client, reviewId);
        if (!existing) {
            const error = new Error('Review not found');
            error.statusCode = 404;
            throw error;
        }

        if (!isAdmin && existing.userId !== clerkId) {
            const error = new Error('You can only edit your own review');
            error.statusCode = 403;
            throw error;
        }

        const product = await getProductById(client, existing.productId);
        const verifiedPurchase = await isVerifiedPurchase(client, existing.userId, existing.productId);
        const userStats = await getUserReviewStats(client, existing.userId);

        let trustLevel = 'Medium Trust';
        let trustReason = '';
        let reviewStatus = 'Approved';

        try {
            const trustResult = await runTrustInference({
                productId: existing.productId,
                rating,
                reviewTitle,
                reviewText,
                verifiedPurchase,
                helpfulVotes: existing.helpfulVotes || 0,
                userReviewsCount: userStats.userReviewsCount,
                userVerifiedCount: userStats.userVerifiedCount,
                userAvgRating: userStats.userAvgRating,
                userAvgHelpfulVote: userStats.userAvgHelpfulVote,
                userPurchasedCount: userStats.userPurchasedCount,
                productData: product,
            });

            trustLevel = trustResult?.prediction?.trust_level || 'Medium Trust';
            trustReason = trustResult?.prediction?.trust_reason || '';
            reviewStatus = 'Approved';
        } catch (error) {
            console.error('Trust inference error during review update:', error);
        }

        await client.query(
            `UPDATE "Reviews"
             SET rating = $1,
                 "reviewTitle" = $2,
                 "reviewText" = $3,
                 "verifiedPurchase" = $4,
                 "trustLevel" = $5,
                 "trustReason" = $6,
                 status = $7,
                 "updatedAt" = NOW()
             WHERE id = $8`,
            [rating, reviewTitle, reviewText, verifiedPurchase, trustLevel, trustReason, reviewStatus, reviewId]
        );

        const updatedRow = await getReviewById(client, reviewId);
        return enrichReviewWithDynamicTrust(client, updatedRow, product);
    });
}

async function deleteReview({ reviewId, clerkId, isAdmin = false }) {
    return withTransaction(async (client) => {
        const existing = await getReviewById(client, reviewId);
        if (!existing) {
            const error = new Error('Review not found');
            error.statusCode = 404;
            throw error;
        }

        if (!isAdmin && existing.userId !== clerkId) {
            const error = new Error('You can only delete your own review');
            error.statusCode = 403;
            throw error;
        }

        await client.query('DELETE FROM "Reviews" WHERE id = $1', [reviewId]);
        return existing;
    });
}

async function markHelpful({ reviewId, clerkId }) {
    return withTransaction(async (client) => {
        const review = await getReviewById(client, reviewId);
        if (!review) {
            const error = new Error('Review not found');
            error.statusCode = 404;
            throw error;
        }

        if (review.userId === clerkId) {
            const error = new Error('You cannot mark your own review as helpful');
            error.statusCode = 400;
            throw error;
        }

        const voteResult = await client.query(
            `INSERT INTO "ReviewHelpfulVotes" ("reviewId", "userId", "createdAt")
             VALUES ($1, $2, NOW())
             ON CONFLICT ("reviewId", "userId") DO NOTHING
             RETURNING id`,
            [reviewId, clerkId]
        );

        if (voteResult.rows.length === 0) {
            const error = new Error('You already marked this review as helpful');
            error.statusCode = 409;
            throw error;
        }

        const updateResult = await client.query(
            `UPDATE "Reviews"
             SET "helpfulVotes" = "helpfulVotes" + 1,
                 "updatedAt" = NOW()
             WHERE id = $1
             RETURNING id`,
            [reviewId]
        );

        return getReviewById(client, updateResult.rows[0].id);
    });
}

async function getUserReviews(clerkId) {
    return withTransaction(async (client) => {
        const result = await client.query(
            `SELECT r.*, p.name AS "productName", p.image AS "productImage", p.category AS "productCategory"
             FROM "Reviews" r
             LEFT JOIN "Products" p ON p.id = r."productId"
             WHERE r."userId" = $1
             ORDER BY r."createdAt" DESC, r.id DESC`,
            [clerkId]
        );

        return Promise.all(result.rows.map((row) => enrichReviewWithDynamicTrust(client, row)));
    });
}

async function listAdminReviews({ status = 'all', page = 1, limit = 20, search = '' }) {
    const safePage = allowedPageValue(page, 1);
    const safeLimit = Math.min(50, allowedPageValue(limit, 20));
    const offset = (safePage - 1) * safeLimit;
    const filters = [];
    const params = [];

    if (status !== 'all') {
        params.push(status);
        filters.push(`r.status = $${params.length}`);
    }

    if (search) {
        params.push(`%${search.toLowerCase()}%`);
        filters.push(`(LOWER(r."reviewTitle") LIKE $${params.length} OR LOWER(r."reviewText") LIKE $${params.length} OR LOWER(u.name) LIKE $${params.length} OR LOWER(p.name) LIKE $${params.length})`);
    }

    const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';

    return withTransaction(async (client) => {
        const countResult = await client.query(
            `SELECT COUNT(*)::integer AS total_count
             FROM "Reviews" r
             LEFT JOIN "Users" u ON u."clerkId" = r."userId"
             LEFT JOIN "Products" p ON p.id = r."productId"
             ${whereClause}`,
            params
        );

        const listParams = [...params, safeLimit, offset];
        const listResult = await client.query(
            `SELECT r.*, u.name AS "reviewerName", u.email AS "reviewerEmail", p.name AS "productName", p.image AS "productImage"
             FROM "Reviews" r
             LEFT JOIN "Users" u ON u."clerkId" = r."userId"
             LEFT JOIN "Products" p ON p.id = r."productId"
             ${whereClause}
             ORDER BY r."createdAt" DESC, r.id DESC
             LIMIT $${listParams.length - 1} OFFSET $${listParams.length}`,
            listParams
        );

        const enrichedReviews = await Promise.all(
            listResult.rows.map((row) => enrichReviewWithDynamicTrust(client, row))
        );

        const statsResult = await client.query(
            `SELECT
                COUNT(*)::integer AS total_reviews,
                COUNT(*) FILTER (WHERE status = 'Pending')::integer AS pending_reviews,
                COUNT(*) FILTER (WHERE status = 'Approved')::integer AS approved_reviews,
                COUNT(*) FILTER (WHERE status = 'Rejected')::integer AS rejected_reviews,
                COALESCE(ROUND(AVG(CASE WHEN status = 'Approved' THEN rating END)::numeric, 2), NULL) AS average_rating,
                COALESCE(SUM("helpfulVotes"), 0)::integer AS total_helpful_votes
             FROM "Reviews"`
        );

        const totalCount = toNumber(countResult.rows[0]?.total_count, 0);
        const statsRow = statsResult.rows[0] || {};

        return {
            reviews: enrichedReviews,
            pagination: {
                page: safePage,
                limit: safeLimit,
                totalCount,
                totalPages: Math.max(1, Math.ceil(totalCount / safeLimit)),
            },
            stats: {
                totalReviews: toNumber(statsRow.total_reviews, 0),
                pendingReviews: toNumber(statsRow.pending_reviews, 0),
                approvedReviews: toNumber(statsRow.approved_reviews, 0),
                rejectedReviews: toNumber(statsRow.rejected_reviews, 0),
                averageRating: statsRow.average_rating == null ? null : Number(statsRow.average_rating),
                totalHelpfulVotes: toNumber(statsRow.total_helpful_votes, 0),
            },
        };
    });
}

async function updateReviewStatus({ reviewId, status }) {
    return withTransaction(async (client) => {
        const existing = await getReviewById(client, reviewId);
        if (!existing) {
            const error = new Error('Review not found');
            error.statusCode = 404;
            throw error;
        }

        await client.query(
            `UPDATE "Reviews"
             SET status = $1,
                 "updatedAt" = NOW()
             WHERE id = $2`,
            [status, reviewId]
        );

        return getReviewById(client, reviewId);
    });
}

async function saveTrustFeedback({ reviewId, userId, predictedTrustLevel, predictedTrustScore, feedback, reason }) {
    return withTransaction(async (client) => {
        const reviewResult = await client.query('SELECT id FROM "Reviews" WHERE id = $1 LIMIT 1', [reviewId]);
        if (reviewResult.rows.length === 0) {
            const error = new Error('Review not found');
            error.statusCode = 404;
            throw error;
        }

        const insertResult = await client.query(
            `INSERT INTO "ReviewTrustFeedback" (
                "reviewId", "userId", "predictedTrustLevel", "predictedTrustScore",
                feedback, reason, "createdAt"
            )
            VALUES ($1, $2, $3, $4, $5, $6, NOW())
            ON CONFLICT ("reviewId", "userId")
            DO UPDATE SET
                "predictedTrustLevel" = EXCLUDED."predictedTrustLevel",
                "predictedTrustScore" = EXCLUDED."predictedTrustScore",
                feedback = EXCLUDED.feedback,
                reason = EXCLUDED.reason,
                "createdAt" = NOW()
            RETURNING *`,
            [reviewId, userId, predictedTrustLevel, predictedTrustScore != null ? Number(predictedTrustScore) : null, feedback, reason || null]
        );

        return insertResult.rows[0];
    });
}

module.exports = {
    normalizeReview,
    listProductReviews,
    createReview,
    updateReview,
    deleteReview,
    markHelpful,
    getUserReviews,
    listAdminReviews,
    updateReviewStatus,
    isVerifiedPurchase,
    saveTrustFeedback,
};
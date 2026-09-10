const db = require('../db');
const { runTrustInference } = require('../services/trustPipeline');

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

async function main() {
    const client = await db.pool.connect();
    try {
        console.log('Starting dynamic trust re-evaluation for all database reviews...');

        const reviewsRes = await client.query(`SELECT r.*, p.name AS "productName", p.category AS "productCategory", p.description AS "productDescription", p.rating AS "productRating", p.reviews AS "productReviews" FROM "Reviews" r LEFT JOIN "Products" p ON p.id = r."productId" ORDER BY r.id ASC`);
        const reviews = reviewsRes.rows;

        console.log(`Found ${reviews.length} reviews in DB to process.`);

        let updatedCount = 0;

        for (const review of reviews) {
            const userStats = await getUserReviewStats(client, review.userId);
            const productData = {
                id: review.productId,
                name: review.productName,
                category: review.productCategory,
                description: review.productDescription,
                rating: review.productRating,
                reviews: review.productReviews,
            };

            const trustResult = await runTrustInference({
                productId: review.productId,
                rating: Number(review.rating),
                reviewTitle: review.reviewTitle || '',
                reviewText: review.reviewText || '',
                verifiedPurchase: Boolean(review.verifiedPurchase),
                helpfulVotes: Number(review.helpfulVotes || 0),
                userReviewsCount: userStats.userReviewsCount,
                userVerifiedCount: userStats.userVerifiedCount,
                userAvgRating: userStats.userAvgRating,
                userAvgHelpfulVote: userStats.userAvgHelpfulVote,
                userPurchasedCount: userStats.userPurchasedCount,
                productData,
            });

            if (trustResult?.prediction) {
                const trustLevel = trustResult.prediction.trust_level || 'Medium Trust';
                const trustReason = trustResult.prediction.trust_reason || '';

                await client.query(
                    `UPDATE "Reviews" SET "trustLevel" = $1, "trustReason" = $2, "updatedAt" = NOW() WHERE id = $3`,
                    [trustLevel, trustReason, review.id]
                );
                updatedCount++;
                console.log(`Updated Review #${review.id}: trustLevel="${trustLevel}"`);
            }
        }

        console.log(`Successfully updated ${updatedCount} reviews with dynamic trust predictions!`);
        process.exit(0);
    } catch (err) {
        console.error('Error updating trust predictions:', err);
        process.exit(1);
    } finally {
        client.release();
    }
}

main();

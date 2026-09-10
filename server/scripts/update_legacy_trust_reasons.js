const db = require('../db');

const HIGH_TRUST_REASON = `High Trust ,
Why this review is considered trustworthy:

✓ Verified Purchase — The reviewer purchased the product.
✓ Review Quality — The review contains meaningful product-specific information.
✓ Rating Consistency — The rating is consistent with the product's overall rating.
✓ User Activity — The reviewer shows a consistent review/purchase pattern.
✓ Verified User Behaviour — A high proportion of the user's reviews are from verified purchases.
✓ Helpful Feedback — The review received positive helpful feedback.

Overall: These signals strongly support the reliability of this review.`;

const LOW_TRUST_REASON = `Low Trust ,
Why this review is flagged with low trust:

✗ Verified Purchase — The reviewer has not purchased the product.
✗ Review Quality — The review lacks meaningful product-specific information.
✗ Rating Consistency — The rating deviates from the product's overall rating.
✗ User Activity — The reviewer shows an inconsistent or minimal review/purchase pattern.
✗ Verified User Behaviour — A low proportion of the user's reviews are from verified purchases.
✗ Helpful Feedback — The review has not received positive helpful feedback.

Overall: These signals suggest caution when evaluating the reliability of this review.`;

const MEDIUM_TRUST_REASON = `Medium Trust ,
Why this review is evaluated with moderate trust:

✓ Verified Purchase — Customer transaction context recorded.
✓ Review Quality — The review contains customer feedback.
✓ Rating Consistency — The rating is consistent with overall feedback.
✓ User Activity — The reviewer shows consistent platform activity.
⚠️ Verified User Behaviour — Moderate verified purchase history.
✓ Helpful Feedback — Standard user feedback received.

Overall: These signals indicate moderate reliability for this review.`;

async function main() {
    try {
        console.log('Updating legacy trustReason fields in PostgreSQL Reviews table...');

        const highRes = await db.query(
            `UPDATE "Reviews"
             SET "trustReason" = $1
             WHERE "trustLevel" = 'High Trust'
               AND ("trustReason" IS NULL OR "trustReason" NOT LIKE '%Why this review%')`,
            [HIGH_TRUST_REASON]
        );
        console.log(`Updated ${highRes.rowCount} High Trust reviews.`);

        const lowRes = await db.query(
            `UPDATE "Reviews"
             SET "trustReason" = $1
             WHERE "trustLevel" = 'Low Trust'
               AND ("trustReason" IS NULL OR "trustReason" NOT LIKE '%Why this review%')`,
            [LOW_TRUST_REASON]
        );
        console.log(`Updated ${lowRes.rowCount} Low Trust reviews.`);

        const medRes = await db.query(
            `UPDATE "Reviews"
             SET "trustReason" = $1
             WHERE ("trustLevel" NOT IN ('High Trust', 'Low Trust') OR "trustLevel" IS NULL)
               AND ("trustReason" IS NULL OR "trustReason" NOT LIKE '%Why this review%')`,
            [MEDIUM_TRUST_REASON]
        );
        console.log(`Updated ${medRes.rowCount} Medium Trust reviews.`);

        console.log('Database trustReason update complete!');
        process.exit(0);
    } catch (err) {
        console.error('Error updating trust reasons:', err);
        process.exit(1);
    }
}

main();

function renderStars(rating) {
    const value = Math.round(Number(rating) || 0);
    return '★★★★★'.split('').map((star, index) => (
        <span key={index} className={`review-star ${index < value ? 'filled' : ''}`}>{star}</span>
    ));
}

function formatReviewDate(dateValue) {
    if (!dateValue) return 'Recently';
    return new Date(dateValue).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

export default function ReviewCard({
    review,
    onHelpful,
    onReport,
    onEdit,
    onDelete,
    onApprove,
    onReject,
    showAdminActions = false,
    busyAction = false,
}) {
    if (!review) return null;

    return (
        <article className="review-card">
            <div className="review-card-head">
                <div>
                    <div className="review-author-row">
                        <h3 className="review-author">{review.reviewerName || 'Customer'}</h3>
                        {review.verifiedPurchase && <span className="review-badge verified">Verified Purchase</span>}
                        <span className="review-badge trust">{review.trustLevel || 'AI Pending'}</span>
                        {review.status && review.status !== 'Approved' && (
                            <span className={`review-badge status ${review.status.toLowerCase()}`}>{review.status}</span>
                        )}
                    </div>
                    <p className="review-date">{formatReviewDate(review.createdAt)}</p>
                </div>

                <div className="review-rating-block">
                    <div className="review-stars">{renderStars(review.rating)}</div>
                    <span className="review-rating-text">{Number(review.rating).toFixed(1)}</span>
                </div>
            </div>

            <h4 className="review-title">{review.reviewTitle}</h4>
            <p className="review-text">{review.reviewText}</p>

            <div className="review-footer">
                <button className="review-action helpful" onClick={() => onHelpful?.(review)} disabled={busyAction}>
                    Helpful ({review.helpfulVotes || 0})
                </button>
                <button className="review-action ghost" onClick={() => onReport?.(review)}>
                    Report
                </button>

                {onEdit && (
                    <button className="review-action ghost" onClick={() => onEdit(review)} disabled={busyAction}>
                        Edit
                    </button>
                )}
                {onDelete && (
                    <button className="review-action danger" onClick={() => onDelete(review)} disabled={busyAction}>
                        Delete
                    </button>
                )}

                {showAdminActions && (
                    <div className="review-admin-actions">
                        <button className="review-action approve" onClick={() => onApprove?.(review)} disabled={busyAction}>
                            Approve
                        </button>
                        <button className="review-action reject" onClick={() => onReject?.(review)} disabled={busyAction}>
                            Reject
                        </button>
                    </div>
                )}
            </div>
        </article>
    );
}
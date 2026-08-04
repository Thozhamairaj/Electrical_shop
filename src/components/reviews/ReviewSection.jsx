import { useEffect, useMemo, useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { reviewService } from '../../services/reviewService';
import { useProductReviews } from '../../hooks/useProductReviews';
import ReviewCard from './ReviewCard';
import './ReviewSection.css';

const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest' },
    { value: 'oldest', label: 'Oldest' },
    { value: 'highest', label: 'Highest Rating' },
    { value: 'lowest', label: 'Lowest Rating' },
];

const EMPTY_FORM = {
    rating: 5,
    reviewTitle: '',
    reviewText: '',
};

function StarInput({ value, onChange }) {
    return (
        <div className="review-star-input" role="radiogroup" aria-label="Rating">
            {[5, 4, 3, 2, 1].map((star) => (
                <button
                    key={star}
                    type="button"
                    className={`review-star-select ${value >= star ? 'active' : ''}`}
                    onClick={() => onChange(star)}
                    aria-label={`${star} star rating`}
                >
                    ★
                </button>
            ))}
        </div>
    );
}

function DistributionBar({ label, value, total }) {
    const percent = total > 0 ? Math.round((value / total) * 100) : 0;
    return (
        <div className="distribution-row">
            <span className="distribution-label">{label}</span>
            <div className="distribution-track">
                <div className="distribution-fill" style={{ width: `${percent}%` }} />
            </div>
            <span className="distribution-count">{value}</span>
        </div>
    );
}

export default function ReviewSection({ productId, productName }) {
    const { user } = useUser();
    const { isSignedIn } = useAuth();
    const navigate = useNavigate();
    const userId = user?.id || null;
    const {
        reviews,
        summary,
        pagination,
        currentUserReview,
        loading,
        error,
        sort,
        page,
        setPage,
        setSort,
        refresh,
    } = useProductReviews(productId, userId, 6);

    const [form, setForm] = useState(EMPTY_FORM);
    const [submitting, setSubmitting] = useState(false);
    const [actionError, setActionError] = useState('');
    const [toast, setToast] = useState(null);

    const isEditing = Boolean(currentUserReview);

    useEffect(() => {
        if (currentUserReview) {
            setForm({
                rating: currentUserReview.rating,
                reviewTitle: currentUserReview.reviewTitle || '',
                reviewText: currentUserReview.reviewText || '',
            });
        } else {
            setForm(EMPTY_FORM);
        }
    }, [currentUserReview]);

    useEffect(() => {
        if (!toast) return undefined;
        const timer = setTimeout(() => setToast(null), 3000);
        return () => clearTimeout(timer);
    }, [toast]);

    const reviewCountLabel = useMemo(() => {
        const count = summary.reviewCount || 0;
        return `${count} ${count === 1 ? 'review' : 'reviews'}`;
    }, [summary.reviewCount]);

    const averageRating = summary.averageRating != null ? Number(summary.averageRating) : 0;

    const handleSubmit = async (event) => {
        event.preventDefault();
        setActionError('');

        if (!isSignedIn || !userId) {
            navigate('/auth');
            return;
        }

        const trimmedTitle = form.reviewTitle.trim();
        const trimmedText = form.reviewText.trim();

        if (form.rating < 1 || form.rating > 5) {
            setActionError('Choose a rating between 1 and 5.');
            return;
        }

        if (trimmedTitle.length < 3 || trimmedTitle.length > 120) {
            setActionError('Review title must be between 3 and 120 characters.');
            return;
        }

        if (trimmedText.length < 20 || trimmedText.length > 1000) {
            setActionError('Review text must be between 20 and 1000 characters.');
            return;
        }

        setSubmitting(true);
        try {
            if (currentUserReview) {
                await reviewService.updateReview(currentUserReview.id, {
                    rating: form.rating,
                    reviewTitle: trimmedTitle,
                    reviewText: trimmedText,
                    productId,
                }, userId);
                setToast({ type: 'success', message: 'Review updated and sent for moderation.' });
            } else {
                await reviewService.createReview({
                    productId,
                    rating: form.rating,
                    reviewTitle: trimmedTitle,
                    reviewText: trimmedText,
                }, userId);
                setToast({ type: 'success', message: 'Review submitted and queued for AI analysis.' });
            }

            await refresh();
        } catch (requestError) {
            setActionError(requestError.details ? Object.values(requestError.details).join(' ') : requestError.message || 'Failed to save review');
            setToast({ type: 'error', message: requestError.message || 'Failed to save review' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleHelpful = async (review) => {
        if (!isSignedIn || !userId) {
            navigate('/auth');
            return;
        }

        try {
            await reviewService.markHelpful(review.id, userId);
            setToast({ type: 'success', message: 'Thanks for your feedback.' });
            await refresh();
        } catch (requestError) {
            setToast({ type: 'error', message: requestError.message || 'Could not record vote' });
        }
    };

    const handleReport = () => {
        setToast({ type: 'info', message: 'Report flow is a placeholder for now.' });
    };

    const handleDelete = async () => {
        if (!currentUserReview || !userId) return;
        if (!window.confirm('Delete this review?')) return;

        setSubmitting(true);
        try {
            await reviewService.deleteReview(currentUserReview.id, userId);
            setToast({ type: 'success', message: 'Review deleted.' });
            await refresh();
        } catch (requestError) {
            setToast({ type: 'error', message: requestError.message || 'Failed to delete review' });
        } finally {
            setSubmitting(false);
        }
    };

    const totalDistribution = [5, 4, 3, 2, 1].reduce((sum, star) => sum + (summary.distribution?.[star] || 0), 0);

    return (
        <section className="review-section">
            <div className="review-section-header">
                <div>
                    <p className="review-kicker">Customer feedback</p>
                    <h2>Reviews for {productName}</h2>
                </div>

                <div className="review-sorter">
                    {SORT_OPTIONS.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            className={`sort-chip ${sort === option.value ? 'active' : ''}`}
                            onClick={() => setSort(option.value)}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>

            {toast && <div className={`review-toast ${toast.type}`}>{toast.message}</div>}

            <div className="review-summary-grid">
                <div className="review-summary-card rating">
                    <span className="review-summary-label">Average Rating</span>
                    <div className="review-summary-score">{averageRating.toFixed(1)}</div>
                    <div className="review-summary-stars">
                        {'★★★★★'.split('').map((star, index) => (
                            <span key={index} className={index < Math.round(averageRating) ? 'star filled' : 'star'}>★</span>
                        ))}
                    </div>
                </div>

                <div className="review-summary-card count">
                    <span className="review-summary-label">Number of Reviews</span>
                    <div className="review-summary-score">{reviewCountLabel}</div>
                    <p className="review-summary-subtext">Based on approved reviews</p>
                </div>

                <div className="review-summary-card distribution">
                    <span className="review-summary-label">Star Distribution</span>
                    <div className="distribution-list">
                        {[5, 4, 3, 2, 1].map((star) => (
                            <DistributionBar
                                key={star}
                                label={`${star} star`}
                                value={summary.distribution?.[star] || 0}
                                total={totalDistribution}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <div className="review-form-shell">
                <div className="review-form-copy">
                    <p className="review-kicker">Write a review</p>
                    <h3>{isEditing ? 'Edit your review' : 'Share your experience'}</h3>
                    <p>
                        {isEditing
                            ? 'Updating your review will send it back into moderation and reset the trust placeholder.'
                            : 'Reviews are only visible after approval. Trust analysis will be added later through your AI pipeline.'}
                    </p>
                </div>

                <form className="review-form" onSubmit={handleSubmit}>
                    <label>
                        Rating
                        <StarInput value={form.rating} onChange={(nextRating) => setForm((current) => ({ ...current, rating: nextRating }))} />
                    </label>

                    <label>
                        Review title
                        <input
                            type="text"
                            value={form.reviewTitle}
                            onChange={(event) => setForm((current) => ({ ...current, reviewTitle: event.target.value }))}
                            placeholder="Summarize your experience"
                            maxLength={120}
                        />
                    </label>

                    <label>
                        Review text
                        <textarea
                            rows="5"
                            value={form.reviewText}
                            onChange={(event) => setForm((current) => ({ ...current, reviewText: event.target.value }))}
                            placeholder="Tell other customers what you liked, what could improve, and how the product performs."
                            maxLength={1000}
                        />
                    </label>

                    {actionError && <div className="review-inline-error">{actionError}</div>}

                    {!isSignedIn ? (
                        <button type="button" className="review-submit-btn" onClick={() => navigate('/auth')}>
                            Sign in to review
                        </button>
                    ) : (
                        <div className="review-form-actions">
                            <button type="submit" className="review-submit-btn" disabled={submitting}>
                                {submitting ? 'Saving…' : isEditing ? 'Update review' : 'Submit review'}
                            </button>
                            {isEditing && (
                                <button type="button" className="review-secondary-btn" onClick={handleDelete} disabled={submitting}>
                                    Delete review
                                </button>
                            )}
                        </div>
                    )}

                    {currentUserReview && (
                        <p className={`review-status-note ${currentUserReview.status?.toLowerCase() || ''}`}>
                            Your review is currently {currentUserReview.status?.toLowerCase() || 'pending'} and the trust field is waiting for AI analysis.
                        </p>
                    )}
                </form>
            </div>

            <div className="review-list-shell">
                <div className="review-list-header">
                    <h3>Latest customer reviews</h3>
                    <p>{pagination.totalCount || 0} total approved reviews</p>
                </div>

                {loading ? (
                    <div className="review-state">Loading reviews…</div>
                ) : error ? (
                    <div className="review-state error">{error}</div>
                ) : reviews.length === 0 ? (
                    <div className="review-state empty">
                        <strong>No reviews yet</strong>
                        <span>Be the first to share feedback on this product.</span>
                    </div>
                ) : (
                    <div className="review-list">
                        {reviews.map((review) => (
                            <ReviewCard
                                key={review.id}
                                review={review}
                                onHelpful={handleHelpful}
                                onReport={handleReport}
                                busyAction={submitting}
                            />
                        ))}
                    </div>
                )}

                {pagination.totalPages > 1 && (
                    <div className="review-pagination">
                        <button type="button" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>
                            Previous
                        </button>
                        <span>
                            Page {page} of {pagination.totalPages}
                        </span>
                        <button type="button" onClick={() => setPage(Math.min(pagination.totalPages, page + 1))} disabled={page >= pagination.totalPages}>
                            Next
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import ReviewCard from '../components/reviews/ReviewCard';
import { reviewService } from '../services/reviewService';
import './MyReviews.css';

const EMPTY_FORM = {
    rating: 5,
    reviewTitle: '',
    reviewText: '',
};

function formatDate(dateValue) {
    if (!dateValue) return 'Recently';
    return new Date(dateValue).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

export default function MyReviews() {
    const { isLoaded, isSignedIn, user } = useUser();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [toast, setToast] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [editingReviewId, setEditingReviewId] = useState(null);
    const [editForm, setEditForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const timer = toast ? setTimeout(() => setToast(null), 3000) : null;
        return () => timer && clearTimeout(timer);
    }, [toast]);

    useEffect(() => {
        let mounted = true;

        const loadReviews = async () => {
            if (!isLoaded || !isSignedIn || !user) {
                setLoading(false);
                return;
            }

            setLoading(true);
            setError('');

            try {
                const data = await reviewService.getUserReviews(user.id);
                if (!mounted) return;
                setReviews(data.reviews || []);
            } catch (requestError) {
                if (mounted) {
                    setError(requestError.message || 'Failed to load your reviews.');
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        };

        loadReviews();

        return () => {
            mounted = false;
        };
    }, [isLoaded, isSignedIn, user]);

    const stats = useMemo(() => {
        const approved = reviews.filter((review) => review.status === 'Approved').length;
        const pending = reviews.filter((review) => review.status === 'Pending').length;
        const rejected = reviews.filter((review) => review.status === 'Rejected').length;
        const average = reviews.length
            ? reviews.reduce((sum, review) => sum + (Number(review.rating) || 0), 0) / reviews.length
            : 0;

        return {
            total: reviews.length,
            approved,
            pending,
            rejected,
            average,
        };
    }, [reviews]);

    const visibleReviews = useMemo(() => {
        if (statusFilter === 'all') return reviews;
        return reviews.filter((review) => review.status === statusFilter);
    }, [reviews, statusFilter]);

    const startEditing = (review) => {
        setEditingReviewId(review.id);
        setEditForm({
            rating: Number(review.rating) || 5,
            reviewTitle: review.reviewTitle || '',
            reviewText: review.reviewText || '',
        });
    };

    const cancelEditing = () => {
        setEditingReviewId(null);
        setEditForm(EMPTY_FORM);
    };

    const saveReview = async (reviewId) => {
        if (!user) return;
        setSaving(true);
        setError('');

        try {
            await reviewService.updateReview(reviewId, editForm, user.id);
            setToast({ type: 'success', text: 'Review updated and sent back for review.' });
            cancelEditing();

            const data = await reviewService.getUserReviews(user.id);
            setReviews(data.reviews || []);
        } catch (requestError) {
            setToast({ type: 'error', text: requestError.message || 'Failed to update your review.' });
        } finally {
            setSaving(false);
        }
    };

    const deleteReview = async (review) => {
        if (!user) return;
        if (!window.confirm(`Delete your review for ${review.productName || 'this product'}?`)) return;

        setSaving(true);
        try {
            await reviewService.deleteReview(review.id, user.id);
            setToast({ type: 'success', text: 'Review deleted.' });
            if (editingReviewId === review.id) {
                cancelEditing();
            }

            const data = await reviewService.getUserReviews(user.id);
            setReviews(data.reviews || []);
        } catch (requestError) {
            setToast({ type: 'error', text: requestError.message || 'Failed to delete your review.' });
        } finally {
            setSaving(false);
        }
    };

    if (!isLoaded || loading) {
        return <div className="my-reviews-state">Loading your reviews...</div>;
    }

    if (!isSignedIn) {
        return (
            <div className="my-reviews-state empty">
                <h2>Sign in to view your reviews</h2>
                <p>Your saved reviews are linked to your account.</p>
                <Link to="/auth" className="my-reviews-cta">Go to sign in</Link>
            </div>
        );
    }

    return (
        <div className="my-reviews-page">
            <section className="my-reviews-hero">
                <div>
                    <p className="my-reviews-kicker">Your account</p>
                    <h1>My Reviews</h1>
                    <p className="my-reviews-subtitle">
                        All of the reviews you have written, in one private place.
                    </p>
                </div>
                <Link to="/products" className="my-reviews-cta">Write another review</Link>
            </section>

            {toast && <div className={`my-reviews-toast ${toast.type}`}>{toast.text}</div>}
            {error && <div className="my-reviews-toast error">{error}</div>}

            <section className="my-reviews-stats">
                <article className="my-review-stat-card">
                    <span>Total Reviews</span>
                    <strong>{stats.total}</strong>
                </article>
                <article className="my-review-stat-card">
                    <span>Average Rating</span>
                    <strong>{stats.average ? stats.average.toFixed(1) : '0.0'}</strong>
                </article>
                <article className="my-review-stat-card">
                    <span>Approved</span>
                    <strong>{stats.approved}</strong>
                </article>
                <article className="my-review-stat-card">
                    <span>Pending</span>
                    <strong>{stats.pending}</strong>
                </article>
            </section>

            <section className="my-reviews-shell">
                <div className="my-reviews-toolbar">
                    <div>
                        <h2>Review history</h2>
                        <p>Filter your saved feedback by moderation status.</p>
                    </div>
                    <div className="my-reviews-filter-row">
                        {['all', 'Pending', 'Approved', 'Rejected'].map((option) => (
                            <button
                                key={option}
                                type="button"
                                className={`my-review-filter ${statusFilter === option ? 'active' : ''}`}
                                onClick={() => setStatusFilter(option)}
                            >
                                {option === 'all' ? 'All' : option}
                            </button>
                        ))}
                    </div>
                </div>

                {visibleReviews.length === 0 ? (
                    <div className="my-reviews-empty">
                        <h3>No reviews yet</h3>
                        <p>Write a review from any product page and it will appear here.</p>
                        <Link to="/products" className="my-reviews-cta">Browse products</Link>
                    </div>
                ) : (
                    <div className="my-reviews-list">
                        {visibleReviews.map((review) => (
                            <article key={review.id} className="my-review-item">
                                <div className="my-review-product">
                                    <div className="my-review-product-image">
                                        {review.productImage ? (
                                            <img src={encodeURI(review.productImage)} alt={review.productName || 'Product'} />
                                        ) : (
                                            <span>{(review.productName || 'P').slice(0, 1).toUpperCase()}</span>
                                        )}
                                    </div>
                                    <div>
                                        <Link to={`/product/${review.productId}`} className="my-review-product-name">
                                            {review.productName || 'Unknown product'}
                                        </Link>
                                        <p className="my-review-meta">
                                            Submitted on {formatDate(review.createdAt)}
                                        </p>
                                    </div>
                                </div>

                                <ReviewCard
                                    review={review}
                                    onEdit={startEditing}
                                    onDelete={deleteReview}
                                    busyAction={saving}
                                />

                                {editingReviewId === review.id && (
                                    <form
                                        className="my-review-edit-form"
                                        onSubmit={(event) => {
                                            event.preventDefault();
                                            saveReview(review.id);
                                        }}
                                    >
                                        <label>
                                            Rating
                                            <input
                                                type="number"
                                                min="1"
                                                max="5"
                                                value={editForm.rating}
                                                onChange={(event) => setEditForm((prev) => ({ ...prev, rating: Number(event.target.value) }))}
                                            />
                                        </label>
                                        <label>
                                            Title
                                            <input
                                                type="text"
                                                value={editForm.reviewTitle}
                                                onChange={(event) => setEditForm((prev) => ({ ...prev, reviewTitle: event.target.value }))}
                                            />
                                        </label>
                                        <label>
                                            Review
                                            <textarea
                                                rows="4"
                                                value={editForm.reviewText}
                                                onChange={(event) => setEditForm((prev) => ({ ...prev, reviewText: event.target.value }))}
                                            />
                                        </label>
                                        <div className="my-review-edit-actions">
                                            <button type="submit" className="my-review-save" disabled={saving}>
                                                {saving ? 'Saving...' : 'Save changes'}
                                            </button>
                                            <button type="button" className="my-review-cancel" onClick={cancelEditing} disabled={saving}>
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
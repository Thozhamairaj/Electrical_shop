import { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAdmin } from '../../context/AdminContext';
import { reviewService } from '../../services/reviewService';
import ReviewCard from '../../components/reviews/ReviewCard';
import './AdminReviews.css';

const STATUS_FILTERS = [
    { value: 'all', label: 'All' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Rejected', label: 'Rejected' },
];

export default function AdminReviews() {
    const { authFetch } = useAdmin();
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ totalPages: 1, totalCount: 0 });
    const [busyReviewId, setBusyReviewId] = useState(null);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        const timer = toast ? setTimeout(() => setToast(null), 3000) : null;
        return () => timer && clearTimeout(timer);
    }, [toast]);

    useEffect(() => {
        let mounted = true;

        const loadReviews = async () => {
            setLoading(true);
            setError('');

            try {
                const [reviewData, statData] = await Promise.all([
                    reviewService.getAdminReviews(authFetch, {
                        status: filter,
                        page,
                        limit: 12,
                        search,
                    }),
                    reviewService.getAdminStats(authFetch),
                ]);

                if (!mounted) return;

                setReviews(reviewData.reviews || []);
                setPagination(reviewData.pagination || { totalPages: 1, totalCount: 0 });
                setStats(statData);
            } catch (requestError) {
                if (mounted) {
                    setError(requestError.message || 'Failed to load review data.');
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
    }, [authFetch, filter, page, search]);

    const showToast = (message, type = 'success') => setToast({ message, type });

    const reload = async () => {
        setLoading(true);
        try {
            const [reviewData, statData] = await Promise.all([
                reviewService.getAdminReviews(authFetch, { status: filter, page, limit: 12, search }),
                reviewService.getAdminStats(authFetch),
            ]);
            setReviews(reviewData.reviews || []);
            setPagination(reviewData.pagination || { totalPages: 1, totalCount: 0 });
            setStats(statData);
        } catch (requestError) {
            setError(requestError.message || 'Failed to refresh reviews.');
        } finally {
            setLoading(false);
        }
    };

    const handleReviewStatus = async (review, status) => {
        setBusyReviewId(review.id);
        try {
            await reviewService.updateAdminReviewStatus(authFetch, review.id, status);
            showToast(`Review ${status.toLowerCase()} successfully.`);
            await reload();
        } catch (requestError) {
            showToast(requestError.message || 'Failed to update review status.', 'error');
        } finally {
            setBusyReviewId(null);
        }
    };

    const handleDelete = async (review) => {
        if (!window.confirm(`Delete review #${review.id}?`)) return;
        setBusyReviewId(review.id);
        try {
            await reviewService.deleteAdminReview(authFetch, review.id);
            showToast('Review deleted.');
            await reload();
        } catch (requestError) {
            showToast(requestError.message || 'Failed to delete review.', 'error');
        } finally {
            setBusyReviewId(null);
        }
    };

    return (
        <AdminLayout>
            <div className="ar-page">
                {toast && <div className={`ar-toast ${toast.type}`}>{toast.message}</div>}

                <div className="ar-toolbar">
                    <div>
                        <h2 className="ar-heading">Reviews</h2>
                        <p className="ar-subhead">Moderate customer feedback and trust placeholders.</p>
                    </div>

                    <div className="ar-controls">
                        <input
                            type="text"
                            className="ar-search"
                            value={search}
                            onChange={(event) => {
                                setSearch(event.target.value);
                                setPage(1);
                            }}
                            placeholder="Search reviews, products, or customers"
                        />
                        <div className="ar-filter-row">
                            {STATUS_FILTERS.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    className={`ar-filter-btn ${filter === option.value ? 'active' : ''}`}
                                    onClick={() => {
                                        setFilter(option.value);
                                        setPage(1);
                                    }}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {stats && (
                    <div className="ar-stats-grid">
                        <div className="ar-stat-card">
                            <span>Total Reviews</span>
                            <strong>{stats.totalReviews}</strong>
                        </div>
                        <div className="ar-stat-card">
                            <span>Pending</span>
                            <strong>{stats.pendingReviews}</strong>
                        </div>
                        <div className="ar-stat-card">
                            <span>Approved</span>
                            <strong>{stats.approvedReviews}</strong>
                        </div>
                        <div className="ar-stat-card">
                            <span>Average Rating</span>
                            <strong>{stats.averageRating != null ? Number(stats.averageRating).toFixed(1) : '0.0'}</strong>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="ar-state">Loading reviews…</div>
                ) : error ? (
                    <div className="ar-state error">{error}</div>
                ) : reviews.length === 0 ? (
                    <div className="ar-state empty">No reviews found for the selected filters.</div>
                ) : (
                    <div className="ar-list">
                        {reviews.map((review) => (
                            <div key={review.id} className="ar-list-item">
                                <div className="ar-item-meta">
                                    <div>
                                        <p className="ar-product">{review.productName || 'Unknown product'}</p>
                                        <p className="ar-customer">{review.reviewerName || 'Customer'} • {review.status}</p>
                                    </div>
                                </div>

                                <ReviewCard
                                    review={review}
                                    showAdminActions
                                    onApprove={(item) => handleReviewStatus(item, 'Approved')}
                                    onReject={(item) => handleReviewStatus(item, 'Rejected')}
                                    onDelete={handleDelete}
                                    busyAction={busyReviewId === review.id}
                                />
                            </div>
                        ))}
                    </div>
                )}

                {pagination.totalPages > 1 && (
                    <div className="ar-pagination">
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
        </AdminLayout>
    );
}
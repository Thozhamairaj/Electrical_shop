import { useCallback, useEffect, useState } from 'react';
import { reviewService } from '../services/reviewService';

const DEFAULT_SUMMARY = {
    averageRating: null,
    reviewCount: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
};

const DEFAULT_PAGINATION = {
    page: 1,
    limit: 6,
    totalCount: 0,
    totalPages: 1,
    sort: 'newest',
};

export function useProductReviews(productId, userId, initialLimit = 6) {
    const [reviews, setReviews] = useState([]);
    const [summary, setSummary] = useState(DEFAULT_SUMMARY);
    const [pagination, setPagination] = useState({ ...DEFAULT_PAGINATION, limit: initialLimit });
    const [currentUserReview, setCurrentUserReview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sort, setSort] = useState('newest');
    const [page, setPage] = useState(1);

    const loadReviews = useCallback(async (nextPage = 1, nextSort = 'newest') => {
        if (!productId) return;

        setLoading(true);
        setError('');

        try {
            const data = await reviewService.getProductReviews(productId, {
                page: nextPage,
                limit: initialLimit,
                sort: nextSort,
                userId,
            });

            setReviews(data.reviews || []);
            setSummary(data.summary || DEFAULT_SUMMARY);
            setPagination(data.pagination || { ...DEFAULT_PAGINATION, limit: initialLimit });
            setCurrentUserReview(data.currentUserReview || null);
        } catch (requestError) {
            setError(requestError.message || 'Failed to load reviews');
        } finally {
            setLoading(false);
        }
    }, [productId, userId, initialLimit]);

    useEffect(() => {
        loadReviews(page, sort);
    }, [loadReviews, page, sort]);

    const refresh = useCallback(() => loadReviews(page, sort), [loadReviews, page, sort]);

    const updateSort = useCallback((nextSort) => {
        setSort(nextSort);
        setPage(1);
    }, []);

    return {
        reviews,
        summary,
        pagination,
        currentUserReview,
        loading,
        error,
        sort,
        page,
        setPage,
        setSort: updateSort,
        refresh,
        setReviews,
        setCurrentUserReview,
    };
}
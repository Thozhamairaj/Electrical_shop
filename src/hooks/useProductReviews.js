import { useCallback, useEffect, useState } from 'react';
import { reviewService } from '../services/reviewService';

const DEFAULT_SUMMARY = {
    averageRating: null,
    reviewCount: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
};

export function useProductReviews(productId, userId) {
    const [allReviews, setAllReviews] = useState([]);
    const [summary, setSummary] = useState(DEFAULT_SUMMARY);
    const [currentUserReview, setCurrentUserReview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadReviews = useCallback(async () => {
        if (!productId) return;

        setLoading(true);
        setError('');

        try {
            const firstPageData = await reviewService.getProductReviews(productId, {
                page: 1,
                limit: 20,
                sort: 'newest',
                userId,
            });

            let combinedReviews = firstPageData.reviews || [];
            const totalPages = firstPageData.pagination?.totalPages || 1;

            if (totalPages > 1) {
                const remainingPromises = [];
                for (let p = 2; p <= totalPages; p++) {
                    remainingPromises.push(
                        reviewService.getProductReviews(productId, {
                            page: p,
                            limit: 20,
                            sort: 'newest',
                            userId,
                        })
                    );
                }
                const remainingResults = await Promise.all(remainingPromises);
                remainingResults.forEach((res) => {
                    if (res.reviews) {
                        combinedReviews = combinedReviews.concat(res.reviews);
                    }
                });
            }

            // Deduplicate reviews by ID just in case
            const deduped = [];
            const seen = new Set();
            for (const r of combinedReviews) {
                if (r && r.id && !seen.has(r.id)) {
                    seen.add(r.id);
                    deduped.push(r);
                }
            }

            setAllReviews(deduped);
            setSummary(firstPageData.summary || DEFAULT_SUMMARY);
            setCurrentUserReview(firstPageData.currentUserReview || null);
        } catch (requestError) {
            setError(requestError.message || 'Failed to load reviews');
        } finally {
            setLoading(false);
        }
    }, [productId, userId]);

    useEffect(() => {
        loadReviews();
    }, [loadReviews]);

    return {
        allReviews,
        summary,
        currentUserReview,
        loading,
        error,
        refresh: loadReviews,
        setAllReviews,
        setCurrentUserReview,
    };
}
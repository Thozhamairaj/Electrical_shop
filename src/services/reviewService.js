const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/reviews`;

async function requestJson(path, { method = 'GET', body, userId, headers = {} } = {}) {
    const response = await fetch(`${API_URL}${path}`, {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(userId ? { 'x-user-id': userId } : {}),
            ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        const error = new Error(data.error || 'Request failed');
        error.status = response.status;
        error.details = data.details || null;
        throw error;
    }

    return data;
}

export const reviewService = {
    getProductReviews: (productId, { page = 1, limit = 6, sort = 'newest', userId } = {}) =>
        requestJson(`/product/${productId}?page=${page}&limit=${limit}&sort=${sort}`, { userId }),

    createReview: (payload, userId) => requestJson('/', { method: 'POST', body: payload, userId }),

    updateReview: (reviewId, payload, userId) => requestJson(`/${reviewId}`, { method: 'PUT', body: payload, userId }),

    deleteReview: (reviewId, userId) => requestJson(`/${reviewId}`, { method: 'DELETE', userId }),

    markHelpful: (reviewId, userId) => requestJson(`/helpful/${reviewId}`, { method: 'POST', userId }),

    getUserReviews: (userId) => requestJson('/user', { userId }),

    getAdminReviews: async (authFetch, params = {}) => {
        const query = new URLSearchParams();
        if (params.status && params.status !== 'all') query.set('status', params.status);
        if (params.page) query.set('page', params.page);
        if (params.limit) query.set('limit', params.limit);
        if (params.search) query.set('search', params.search);

        const response = await authFetch(`${API_URL}/admin${query.toString() ? `?${query.toString()}` : ''}`);
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Failed to load admin reviews');
        }
        return data;
    },

    getAdminStats: async (authFetch) => {
        const response = await authFetch(`${API_URL}/admin/stats`);
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Failed to load review stats');
        }
        return data;
    },

    updateAdminReviewStatus: async (authFetch, reviewId, status) => {
        const response = await authFetch(`${API_URL}/admin/${reviewId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Failed to update review status');
        }
        return data;
    },

    deleteAdminReview: async (authFetch, reviewId) => {
        const response = await authFetch(`${API_URL}/admin/${reviewId}`, {
            method: 'DELETE',
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Failed to delete review');
        }
        return data;
    },
};
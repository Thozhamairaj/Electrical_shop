function normalizeText(value) {
    return typeof value === 'string' ? value.trim() : '';
}

function validateReviewInput(payload) {
    const errors = {};
    const rating = Number(payload.rating);
    const reviewTitle = normalizeText(payload.reviewTitle);
    const reviewText = normalizeText(payload.reviewText);

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        errors.rating = 'Rating must be an integer between 1 and 5';
    }

    if (reviewTitle.length < 3) {
        errors.reviewTitle = 'Review title must be at least 3 characters long';
    } else if (reviewTitle.length > 120) {
        errors.reviewTitle = 'Review title must be 120 characters or less';
    }

    if (reviewText.length < 20) {
        errors.reviewText = 'Review text must be at least 20 characters long';
    } else if (reviewText.length > 1000) {
        errors.reviewText = 'Review text must be 1000 characters or less';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
        normalized: {
            rating,
            reviewTitle,
            reviewText,
        },
    };
}

function validateStatus(status) {
    const allowed = ['Pending', 'Approved', 'Rejected'];
    if (!allowed.includes(status)) {
        return {
            isValid: false,
            error: 'Status must be one of Pending, Approved, or Rejected',
        };
    }

    return { isValid: true };
}

module.exports = {
    validateReviewInput,
    validateStatus,
};
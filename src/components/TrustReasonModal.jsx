import { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { reviewService } from '../services/reviewService';
import './TrustReasonModal.css';

const REASON_OPTIONS = [
    'Review is actually suspicious',
    'Review is actually trustworthy',
    'Trust level is incorrect',
    'Explanation is incorrect',
    'Other',
];

function getBadgeClass(levelText) {
    if (!levelText) return 'medium';
    const lower = levelText.toLowerCase();
    if (lower.includes('very high')) return 'very-high';
    if (lower.includes('very low')) return 'very-low';
    if (lower.includes('high')) return 'high';
    if (lower.includes('low')) return 'low';
    return 'medium';
}

export default function TrustReasonModal({ open, onClose, reason, review = null, title = 'Why this trust label?' }) {
    const { isSignedIn } = useAuth();
    const { user } = useUser();

    const [feedbackSelection, setFeedbackSelection] = useState(null);
    const [selectedReason, setSelectedReason] = useState('');
    const [otherReasonText, setOtherReasonText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [existingFeedback, setExistingFeedback] = useState(null);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        if (review?.userTrustFeedback) {
            setExistingFeedback(review.userTrustFeedback);
            setFeedbackSelection(review.userTrustFeedback.feedback);
            setSelectedReason(review.userTrustFeedback.reason || '');
        } else {
            setExistingFeedback(null);
            setFeedbackSelection(null);
            setSelectedReason('');
        }
        setOtherReasonText('');
        setToast(null);
    }, [review, open]);

    if (!open) return null;

    const trimmed = (reason || review?.trustReason || '').trim();
    const lines = trimmed.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

    // Extract Trust Level, Score, Title line, Bullets, and Overall statement
    let trustBadgeText = review?.trustLevel || 'Medium Trust';
    let scoreText = '';
    let titleLine = '';
    const bulletLines = [];
    let overallLine = '';

    for (const line of lines) {
        if (/^((?:Very\s+)?(?:High|Medium|Low)\s*(?:Trust)?)\s*,?/i.test(line) && !titleLine && !trustBadgeText.includes('Trust Score')) {
            trustBadgeText = line.replace(',', '').trim();
        } else if (line.toLowerCase().startsWith('trust score:')) {
            scoreText = line.trim();
        } else if (line.startsWith('✓') || line.startsWith('✗') || line.startsWith('⚠️') || line.startsWith('⚠') || line.startsWith('•')) {
            bulletLines.push(line);
        } else if (line.startsWith('Overall:')) {
            overallLine = line;
        } else if (line.toLowerCase().startsWith('why this review')) {
            titleLine = line;
        }
    }

    if (!titleLine) {
        titleLine = `Why this review is evaluated with ${trustBadgeText.toLowerCase()}:`;
    }

    const badgeClass = getBadgeClass(trustBadgeText);

    const handleFeedbackSubmit = async (e) => {
        e.preventDefault();
        if (!review?.id) return;
        if (!isSignedIn || !user) {
            alert('Please sign in to submit feedback.');
            return;
        }

        const finalReason = selectedReason === 'Other' ? (otherReasonText.trim() || 'Other') : selectedReason;

        setSubmitting(true);
        try {
            let numScore = review.trustScore;
            if (numScore == null && scoreText) {
                const match = scoreText.match(/(\d+)%/);
                if (match) numScore = parseInt(match[1], 10) / 100;
            }

            const res = await reviewService.submitTrustFeedback({
                reviewId: review.id,
                predictedTrustLevel: trustBadgeText,
                predictedTrustScore: numScore,
                feedback: feedbackSelection,
                reason: finalReason,
            }, user.id);

            const updatedFeedback = res.feedback || {
                feedback: feedbackSelection,
                reason: finalReason,
                createdAt: new Date().toISOString(),
            };

            setExistingFeedback(updatedFeedback);
            if (review) {
                review.userTrustFeedback = updatedFeedback;
            }
            setToast({ type: 'success', text: 'Thank you for your feedback!' });
        } catch (err) {
            setToast({ type: 'error', text: err.message || 'Failed to submit feedback' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="tr-modal-backdrop" role="dialog" aria-modal="true" onClick={onClose}>
            <div className="tr-modal" onClick={(e) => e.stopPropagation()}>
                <div className="tr-modal-header">
                    <h3>{title}</h3>
                    <button className="tr-modal-close" onClick={onClose}>✕</button>
                </div>
                <div className="tr-modal-body">
                    <div className="tr-structured-reason">
                        <div className="tr-header-row">
                            <div className="tr-badge-score-line">
                                <span className={`tr-badge ${badgeClass}`}>{trustBadgeText}</span>
                                {scoreText && <span className="tr-score-pill">{scoreText}</span>}
                            </div>
                            {titleLine && <h4 className="tr-title-line">{titleLine}</h4>}
                        </div>

                        {bulletLines.length > 0 && (
                            <ul className="tr-bullet-list">
                                {bulletLines.map((bullet, idx) => {
                                    const icon = bullet.charAt(0);
                                    const text = bullet.slice(1).trim();
                                    const iconClass =
                                        icon === '✓'
                                            ? 'pass'
                                            : icon === '✗'
                                            ? 'fail'
                                            : icon === '⚠' || icon === '⚠️'
                                            ? 'warn'
                                            : 'info';
                                    return (
                                        <li key={idx} className={`tr-bullet-item ${iconClass}`}>
                                            <span className="tr-bullet-icon">{icon}</span>
                                            <span className="tr-bullet-text">{text}</span>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}

                        {overallLine && (
                            <div className="tr-overall-box">
                                <p>{overallLine}</p>
                            </div>
                        )}

                        {/* Feedback Mechanism Section */}
                        {review && (
                            <div className="tr-feedback-section">
                                <h4 className="tr-feedback-title">Was this trust prediction helpful?</h4>

                                <div className="tr-feedback-buttons">
                                    <button
                                        type="button"
                                        className={`tr-feedback-btn helpful ${feedbackSelection === 'helpful' ? 'selected' : ''}`}
                                        onClick={() => {
                                            setFeedbackSelection('helpful');
                                            if (!selectedReason) setSelectedReason('Review is actually trustworthy');
                                        }}
                                    >
                                        👍 Helpful
                                    </button>
                                    <button
                                        type="button"
                                        className={`tr-feedback-btn not-helpful ${feedbackSelection === 'not_helpful' ? 'selected' : ''}`}
                                        onClick={() => {
                                            setFeedbackSelection('not_helpful');
                                            if (!selectedReason) setSelectedReason('Trust level is incorrect');
                                        }}
                                    >
                                        👎 Not Helpful
                                    </button>
                                </div>

                                {feedbackSelection && (
                                    <form className="tr-feedback-form" onSubmit={handleFeedbackSubmit}>
                                        <p className="tr-feedback-prompt">Please select a reason:</p>
                                        <div className="tr-reason-options">
                                            {REASON_OPTIONS.map((reasonOpt) => (
                                                <label key={reasonOpt} className={`tr-reason-chip ${selectedReason === reasonOpt ? 'active' : ''}`}>
                                                    <input
                                                        type="radio"
                                                        name="feedbackReason"
                                                        value={reasonOpt}
                                                        checked={selectedReason === reasonOpt}
                                                        onChange={() => setSelectedReason(reasonOpt)}
                                                    />
                                                    <span>{reasonOpt}</span>
                                                </label>
                                            ))}
                                        </div>

                                        {selectedReason === 'Other' && (
                                            <input
                                                type="text"
                                                className="tr-other-input"
                                                placeholder="Provide custom reason..."
                                                value={otherReasonText}
                                                onChange={(e) => setOtherReasonText(e.target.value)}
                                                maxLength={200}
                                            />
                                        )}

                                        <button type="submit" className="tr-feedback-submit" disabled={submitting}>
                                            {submitting ? 'Submitting…' : 'Submit Feedback'}
                                        </button>
                                    </form>
                                )}

                                {toast && <div className={`tr-feedback-toast ${toast.type}`}>{toast.text}</div>}

                                {existingFeedback && (
                                    <div className="tr-feedback-recorded">
                                        <span>
                                            ✓ Feedback recorded as <strong>{existingFeedback.feedback === 'helpful' ? 'Helpful 👍' : 'Not Helpful 👎'}</strong>
                                        </span>
                                        {existingFeedback.reason && <p className="tr-feedback-reason">Reason: {existingFeedback.reason}</p>}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                <div className="tr-modal-footer">
                    <button className="tr-modal-ok" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
}


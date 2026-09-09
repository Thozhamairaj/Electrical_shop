import React from 'react';
import './TrustReasonModal.css';

export default function TrustReasonModal({ open, onClose, reason, title = 'Why this trust label?' }) {
    if (!open) return null;

    return (
        <div className="tr-modal-backdrop" role="dialog" aria-modal="true">
            <div className="tr-modal">
                <div className="tr-modal-header">
                    <h3>{title}</h3>
                    <button className="tr-modal-close" onClick={onClose}>✕</button>
                </div>
                <div className="tr-modal-body">
                    <p>{reason}</p>
                </div>
                <div className="tr-modal-footer">
                    <button className="tr-modal-ok" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
}

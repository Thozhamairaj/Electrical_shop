import { useState } from 'react';
import './PhoneNumberModal.css';

const PhoneNumberModal = ({ isOpen, onClose, onConfirm, initialValue = '' }) => {
    const [phoneNumber, setPhoneNumber] = useState(initialValue);
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!phoneNumber || phoneNumber.length < 10) {
            setError('Please enter a valid phone number (at least 10 digits).');
            return;
        }
        onConfirm(phoneNumber);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Contact Number Required</h2>
                <p>Please provide your phone number to proceed with the WhatsApp order. This helps the shop owner contact you regarding your order.</p>
                
                <form onSubmit={handleSubmit}>
                    <div className="modal-form-group">
                        <label htmlFor="modalPhone">Phone Number</label>
                        <input
                            type="tel"
                            id="modalPhone"
                            value={phoneNumber}
                            onChange={(e) => {
                                setPhoneNumber(e.target.value);
                                setError('');
                            }}
                            placeholder="+91 1234567890"
                            autoFocus
                        />
                        {error && <span className="modal-error">{error}</span>}
                    </div>

                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="modal-cancel-btn">Cancel</button>
                        <button type="submit" className="modal-confirm-btn">Confirm & Order</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PhoneNumberModal;

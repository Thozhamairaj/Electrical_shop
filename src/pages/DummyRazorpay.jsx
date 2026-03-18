import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './DummyRazorpay.css';

export default function DummyRazorpay() {
  const location = useLocation();
  const navigate = useNavigate();
  const { product, quantity, totalAmount, orderId, isExistingOrder } = location.state || {};
  const [step, setStep] = useState('loading'); // loading -> payment -> processing -> success

  useEffect(() => {
    if (!product && !isExistingOrder) {
      navigate('/');
      return;
    }
    const timer = setTimeout(() => setStep('payment'), 1500);
    return () => clearTimeout(timer);
  }, [product, isExistingOrder, navigate]);

  const handlePay = async () => {
    setStep('processing');
    
    try {
      if (isExistingOrder && orderId) {
        await axios.post(`http://localhost:5000/api/orders/${orderId}/pay`);
      }
      // Simple delay to simulate processing
      setTimeout(() => {
        setStep('success');
      }, 2000);
    } catch (err) {
      console.error('Payment error:', err);
      alert('Mock Payment Failed. Please try again.');
      setStep('payment');
    }
  };

  if (step === 'loading') {
    return (
      <div className="razorpay-overlay">
        <div className="razorpay-loader">
          <div className="spinner"></div>
          <p>Initialising Secure Payment...</p>
        </div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="razorpay-overlay">
        <div className="success-modal">
          <div className="success-icon">✓</div>
          <h2>Payment Successful!</h2>
          <p>Order ID: #ORD-{Math.floor(Math.random() * 1000000)}</p>
          <p>Amount Paid: ₹{totalAmount?.toFixed(2)}</p>
          <button onClick={() => navigate('/')}>Continue Shopping</button>
        </div>
      </div>
    );
  }

  return (
    <div className="razorpay-overlay">
      <div className="razorpay-modal">
        <div className="modal-header">
          <div className="shop-info">
            <div className="shop-logo">ES</div>
            <div>
              <h3>Electrical Shop</h3>
              <p>order_summary_{Date.now()}</p>
            </div>
          </div>
          <div className="amount">₹{totalAmount?.toFixed(2)}</div>
        </div>

        <div className="modal-body">
          {step === 'processing' ? (
            <div className="processing">
              <div className="spinner"></div>
              <p>Processing Payment...</p>
              <p className="subtext">Do not refresh or close the window</p>
            </div>
          ) : (
            <>
              <div className="payment-options">
                <h4>PAYMENT OPTIONS</h4>
                <div className="option active">
                  <span className="icon">💳</span>
                  <div className="text">
                    <strong>Cards</strong>
                    <span>Visa, MasterCard, RuPay, and Maestro</span>
                  </div>
                </div>
                <div className="option">
                  <span className="icon">🏦</span>
                  <div className="text">
                    <strong>Netbanking</strong>
                    <span>All Indian Banks</span>
                  </div>
                </div>
                <div className="option">
                  <span className="icon">📱</span>
                  <div className="text">
                    <strong>UPI</strong>
                    <span>Google Pay, PhonePe, Paytm, etc.</span>
                  </div>
                </div>
                <div className="option">
                  <span className="icon">💰</span>
                  <div className="text">
                    <strong>Wallet</strong>
                    <span>Mobikwik, Freecharge, etc.</span>
                  </div>
                </div>
              </div>

              <div className="card-form">
                <input type="text" placeholder="Card Number" defaultValue="4312 8765 4321 0987" />
                <div className="row">
                  <input type="text" placeholder="Expiry (MM/YY)" defaultValue="12/28" />
                  <input type="password" placeholder="CVV" defaultValue="•••" />
                </div>
                <input type="text" placeholder="Card Holder Name" defaultValue="John Doe" />
              </div>

              <button className="pay-btn" onClick={handlePay}>
                PAY ₹{totalAmount?.toFixed(2)}
              </button>
            </>
          )}
        </div>

        <div className="modal-footer">
          <p>Trusted by over 50 lakh businesses</p>
          <div className="razorpay-logo">RAZORPAY</div>
        </div>
      </div>
    </div>
  );
}

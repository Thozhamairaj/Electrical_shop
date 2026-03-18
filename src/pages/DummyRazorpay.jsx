import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import confetti from 'canvas-confetti';
import { useUser } from '@clerk/clerk-react';
import { useCart } from '../context/CartContext';
import './DummyRazorpay.css';

export default function DummyRazorpay() {
  const { user } = useUser();
  const { clearCart } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const { product, quantity, totalAmount, orderId, isExistingOrder, isCartCheckout, items } = location.state || {};
  const [step, setStep] = useState('loading'); // loading -> payment -> processing -> success
  const [method, setMethod] = useState('card'); // card, upi, netbanking, wallet
  const [processingSubtext, setProcessingSubtext] = useState('Processing Payment...');

  useEffect(() => {
    if (!product && !isExistingOrder && !isCartCheckout) {
      navigate('/');
      return;
    }
    const timer = setTimeout(() => setStep('payment'), 1500);
    return () => clearTimeout(timer);
  }, [product, isExistingOrder, isCartCheckout, navigate]);

  useEffect(() => {
    if (step === 'success') {
      // Immediate blast
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#339af0', '#2b3144', '#ffbf00', '#40c057']
      });

      // Side bursts
      const duration = 3 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#339af0', '#40c057']
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#ffbf00', '#2b3144']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      
      const timeout = setTimeout(frame, 500);
      return () => clearTimeout(timeout);
    }
  }, [step]);

  useEffect(() => {
    if (step === 'success') {
      const timer = setTimeout(() => {
        navigate('/orders');
      }, 7000); // Increased to 7s to let user enjoy the confetti
      return () => clearTimeout(timer);
    }
  }, [step, navigate]);

  const handlePay = async () => {
    if (step === 'processing' || step === 'success') return;
    setStep('processing');
    setProcessingSubtext('Communicating with Bank...');
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    
    try {
      // Simulate real-ish delay
      await new Promise(r => setTimeout(r, 1000));
      setProcessingSubtext('Authorizing Transaction...');
      await new Promise(r => setTimeout(r, 800));
      setProcessingSubtext('Finalizing payment...');

      if (isExistingOrder && orderId) {
        await axios.post(`${apiUrl}/api/orders/${orderId}/pay`);
      } else if (isCartCheckout && items) {
        await axios.post(`${apiUrl}/api/orders`, {
          userId: user.id,
          userEmail: user.primaryEmailAddress?.emailAddress,
          userName: user.fullName || user.username || 'Customer',
          items: items,
          totalAmount: totalAmount,
          paymentStatus: 'paid',
          status: 'confirmed'
        });
        clearCart();
      } else if (product) {
        await axios.post(`${apiUrl}/api/orders`, {
          userId: user.id,
          userEmail: user.primaryEmailAddress?.emailAddress,
          userName: user.fullName || user.username || 'Customer',
          items: [{ ...product, quantity }],
          totalAmount: totalAmount,
          paymentStatus: 'paid',
          status: 'confirmed'
        });
      }

      setStep('success');
    } catch (err) {
      console.error('Payment error:', err);
      alert('Mock Payment Failed. Please try again.');
      setStep('payment');
    }
  };

  const renderMethodForm = () => {
    switch (method) {
      case 'upi':
        return (
          <div className="method-form upi-form">
            <div className="upi-apps">
              {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map(app => (
                <div key={app} className="upi-app">
                  <div className="app-icon">{app[0]}</div>
                  <span>{app}</span>
                </div>
              ))}
            </div>
            <div className="divider"><span>OR</span></div>
            <div className="vpa-input">
              <input type="text" placeholder="Enter UPI ID (e.g. name@bank)" defaultValue="customer@okhdfc" />
              <button className="verify-btn">Verify</button>
            </div>
          </div>
        );
      case 'netbanking':
        return (
          <div className="method-form netbanking-form">
            <div className="bank-grid">
              {['SBI', 'HDFC', 'ICICI', 'AXIS', 'KOTAK', 'PNB'].map(bank => (
                <div key={bank} className="bank-item">
                  <div className="bank-logo-placeholder">{bank}</div>
                  <span>{bank}</span>
                </div>
              ))}
            </div>
            <select className="bank-select">
              <option>Select another bank</option>
              <option>Bank of Baroda</option>
              <option>Canara Bank</option>
              <option>Union Bank</option>
            </select>
          </div>
        );
      case 'wallet':
        return (
          <div className="method-form wallet-form">
            {['Amazon Pay', 'MobiKwik', 'Freecharge', 'Airtel Money'].map(wallet => (
              <div key={wallet} className="wallet-item">
                <span className="bullet">○</span>
                <span>{wallet}</span>
              </div>
            ))}
          </div>
        );
      default:
        return (
          <div className="method-form card-form">
            <input type="text" placeholder="Card Number" defaultValue="4312 8765 4321 0987" />
            <div className="row">
              <input type="text" placeholder="Expiry (MM/YY)" defaultValue="12/28" />
              <input type="password" placeholder="CVV" defaultValue="•••" />
            </div>
            <input type="text" placeholder="Card Holder Name" defaultValue={user?.fullName || 'John Doe'} />
            <div className="card-labels">
              <span>Visa</span>
              <span>MasterCard</span>
              <span>Maestro</span>
              <span>RuPay</span>
            </div>
          </div>
        );
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
          <div className="success-details">
            <p>Order Reference: #ORD-{Math.floor(Math.random() * 1000000)}</p>
            <p>Amount: ₹{totalAmount?.toFixed(2)}</p>
            <p>Bank Ref: RPX_{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
          </div>
          <button onClick={() => navigate('/orders')}>View My Orders</button>
          <p className="redirect-note">Redirecting to orders in 5s...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="razorpay-overlay">
      <div className="razorpay-modal">
        <div className="modal-header">
          <div className="shop-info">
            <div className="shop-logo">SVH</div>
            <div>
              <h3>Sri Vinayaga Hardwares</h3>
              <p>#{orderId ? `Order ${orderId}` : 'Cart Checkout'}</p>
            </div>
          </div>
          <div className="amount">₹{totalAmount?.toFixed(2)}</div>
        </div>

        <div className="modal-body">
          {step === 'processing' ? (
            <div className="processing">
              <div className="spinner"></div>
              <p>{processingSubtext}</p>
              <p className="subtext">Do not refresh or close the window</p>
            </div>
          ) : (
            <div className="checkout-view">
              <div className="method-sidebar">
                <div 
                  className={`method-tab ${method === 'card' ? 'active' : ''}`}
                  onClick={() => setMethod('card')}
                >
                  <span className="icon">💳</span>
                  <div className="tab-text">
                    <strong>Cards</strong>
                    <span>Visa, Master, etc</span>
                  </div>
                </div>
                <div 
                  className={`method-tab ${method === 'upi' ? 'active' : ''}`}
                  onClick={() => setMethod('upi')}
                >
                  <span className="icon">📱</span>
                  <div className="tab-text">
                    <strong>UPI</strong>
                    <span>GPay, PhonePe</span>
                  </div>
                </div>
                <div 
                  className={`method-tab ${method === 'netbanking' ? 'active' : ''}`}
                  onClick={() => setMethod('netbanking')}
                >
                  <span className="icon">🏦</span>
                  <div className="tab-text">
                    <strong>Netbanking</strong>
                    <span>All Indian Banks</span>
                  </div>
                </div>
                <div 
                  className={`method-tab ${method === 'wallet' ? 'active' : ''}`}
                  onClick={() => setMethod('wallet')}
                >
                  <span className="icon">💰</span>
                  <div className="tab-text">
                    <strong>Wallet</strong>
                    <span>Paytm, Mobikwik</span>
                  </div>
                </div>
              </div>

              <div className="method-content">
                {renderMethodForm()}
                <button className="pay-btn" onClick={handlePay}>
                  PAY ₹{totalAmount?.toFixed(2)}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <p>🔒 100% Secure Payments | Powered by <strong>RAZORPAY</strong></p>
        </div>
      </div>
    </div>
  );
}

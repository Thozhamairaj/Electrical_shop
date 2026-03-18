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

  const itemList = isCartCheckout ? items : (product ? [{ ...product, quantity }] : []);
  const subtotal = itemList.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  const shipping = subtotal >= 500 ? 0 : 50;

  if (step === 'loading') {
    return (
      <div className="razorpay-overlay">
        <div className="state-center">
          <div className="razorpay-loader">
            <div className="spinner"></div>
            <p>Initialising Secure Payment...</p>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="razorpay-overlay">
        <div className="state-center">
          <div className="success-modal">
            <div className="success-icon">✓</div>
            <h2>Payment Successful!</h2>
            <div className="success-details">
              <p>ORDER ID: #ORD-{Math.floor(Math.random() * 1000000)}</p>
              <p>AMOUNT PAID: ₹{totalAmount?.toFixed(2)}</p>
              <p>BANK REF: RPX_{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
              <p>STATUS: CONFIRMED</p>
            </div>
            <button onClick={() => navigate('/orders')}>VIEW MY ORDERS</button>
            <p className="redirect-note">Redirecting to orders in 7s...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="razorpay-overlay">
      <header className="checkout-header">
        <button onClick={() => navigate(-1)} className="back-link">
          ‹ Back to shop
        </button>
        <div className="progress-steps">
          <div className="step completed">
            <span className="step-num">✓</span>
            <span>Shopping cart</span>
          </div>
          <div className="step active">
            <span className="step-num">2</span>
            <span>Payment details</span>
          </div>
          <div className="step">
            <span className="step-num">3</span>
            <span>Payment complete</span>
          </div>
        </div>
      </header>

      <main className="checkout-container">
        <section className="payment-section">
          {step === 'processing' ? (
            <div className="processing">
              <div className="spinner"></div>
              <h3>{processingSubtext}</h3>
              <p>Please do not refresh or close this page.</p>
            </div>
          ) : (
            <>
              <h2>How would you like to pay?</h2>
              <div className="method-grid">
                <div 
                  className={`method-card ${method === 'card' ? 'active' : ''}`}
                  onClick={() => setMethod('card')}
                >
                  <span className="icon">💳</span>
                  <strong>Cards</strong>
                </div>
                <div 
                  className={`method-card ${method === 'upi' ? 'active' : ''}`}
                  onClick={() => setMethod('upi')}
                >
                  <span className="icon">📱</span>
                  <strong>UPI</strong>
                </div>
                <div 
                  className={`method-card ${method === 'netbanking' ? 'active' : ''}`}
                  onClick={() => setMethod('netbanking')}
                >
                  <span className="icon">🏦</span>
                  <strong>Netbanking</strong>
                </div>
                <div 
                  className={`method-card ${method === 'wallet' ? 'active' : ''}`}
                  onClick={() => setMethod('wallet')}
                >
                  <span className="icon">💰</span>
                  <strong>Wallet</strong>
                </div>
              </div>

              <div className="method-form">
                {renderMethodForm()}
                <button className="pay-btn" onClick={handlePay}>
                  Continue to secure payment
                </button>
              </div>
            </>
          )}
        </section>

        <section className="summary-section">
          <h3>Order Summary</h3>
          <p className="order-ref">Order reference: {orderId || 'NEW-ORDER'}</p>
          
          <div className="order-items">
            {itemList.map((item, idx) => (
              <div key={idx} className="summary-item">
                <img src={encodeURI(item.image)} alt={item.name} />
                <div className="item-info">
                  <h4>{item.name}</h4>
                  <p>x {item.quantity || quantity || 1}</p>
                </div>
                <div className="item-price">₹{(item.price * (item.quantity || quantity || 1)).toFixed(2)}</div>
              </div>
            ))}
          </div>

          <div className="price-breakdown">
            <div className="row">
              <span>Shipping</span>
              <span>{shipping === 0 ? 'Free' : `₹${shipping.toFixed(2)}`}</span>
            </div>
            <div className="row">
              <span>Taxes (Included)</span>
              <span>₹{(totalAmount - (totalAmount / 1.18)).toFixed(2)}</span>
            </div>
          </div>

          <div className="row total">
            <span>Total</span>
            <span>₹{totalAmount?.toFixed(2)}</span>
          </div>
        </section>
      </main>

      <footer className="modal-footer" style={{ background: 'transparent' }}>
        <p>🔒 100% SECURE PAYMENTS | POWERED BY <strong>RAZORPAY</strong></p>
      </footer>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CheckoutLink.css';

const loadScript = (src) => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function CheckoutLink() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paying, setPaying] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('upi');

  const paymentMethods = [
    { id: 'upi', label: 'UPI', description: 'PhonePe, GPay, Paytm', accent: '#2563eb' },
    { id: 'card', label: 'Cards', description: 'Debit and credit cards', accent: '#7c3aed' },
    { id: 'netbanking', label: 'Netbanking', description: 'All major banks', accent: '#0f766e' },
    { id: 'wallet', label: 'Wallet', description: 'Popular wallets', accent: '#ea580c' },
  ];

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const { data } = await axios.get(`${apiUrl}/api/orders/public/${orderId}`);
        setOrder(data);
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Order not found or has expired.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  const handlePayment = async () => {
    setPaying(true);
    const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
    if (!res) {
      alert('Razorpay SDK failed to load.');
      setPaying(false);
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const { data: payData } = await axios.post(`${apiUrl}/api/orders/initiate-link-payment`, {
        orderId: order.id
      });

      const options = {
        key: payData.keyId,
        amount: payData.amount,
        currency: payData.currency,
        name: 'Electrical Shop',
        description: `Payment for Order #${order.id}`,
        order_id: payData.razorpayOrderId,
        handler: async function (response) {
          try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            await axios.post(`${apiUrl}/api/orders/verify-payment`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            alert('Payment Successful!');
            setOrder(prev => ({ ...prev, paymentStatus: 'paid', status: 'confirmed' }));
          } catch (err) {
            alert('Payment verification failed.');
          } finally {
            setPaying(false);
          }
        },
        prefill: {
          name: order.userName || '',
          email: order.userEmail || '',
        },
        theme: { color: '#dc2626' },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      console.error('Payment error:', err);
      alert('Failed to initiate payment.');
      setPaying(false);
    }
  };

  if (loading) return <div className="checkout-link-container">Loading order details...</div>;
  if (error) return <div className="checkout-link-container error">{error}</div>;

  const parsedItems = order.items ? JSON.parse(order.items) : [];
  const isPaid = order.paymentStatus === 'paid';
  const displayTotal = Number(order.totalAmount || 0).toFixed(2);

  return (
    <div className="checkout-link-page">
      <div className="gateway-shell">
        <aside className="gateway-sidebar">
          <div className="brand-row">
            <div className="brand-mark">S</div>
            <div>
              <h1>Sri Vinayaga Hardwares</h1>
              <p>Payment Gateway</p>
            </div>
          </div>

          <div className="summary-card">
            <span className="summary-label">Price Summary</span>
            <strong className="summary-amount">₹{displayTotal}</strong>
          </div>

          <div className="summary-card muted">
            <span className="summary-label">Order</span>
            <strong className="summary-amount small">#{order.id}</strong>
          </div>

          <div className="summary-card muted user-card">
            <span className="summary-label">Using as</span>
            <strong className="summary-amount small">{order.userName || 'Customer'}</strong>
          </div>
        </aside>

        <main className="gateway-panel">
          <div className="gateway-card">
            <div className="gateway-header">
              <div>
                <span className="gateway-kicker">Secure checkout</span>
                <h2>Select payment method</h2>
              </div>
              <button className="close-btn" onClick={() => navigate('/')}>×</button>
            </div>

            <div className="status-row">
              <span className={`status-pill ${order.paymentStatus}`}>{order.paymentStatus.toUpperCase()}</span>
              <span className="status-copy">{isPaid ? 'Payment completed' : 'Payment pending'}</span>
            </div>

            <div className="method-list">
              {paymentMethods.map(method => (
                <button
                  key={method.id}
                  type="button"
                  className={`method-item ${selectedMethod === method.id ? 'active' : ''}`}
                  onClick={() => setSelectedMethod(method.id)}
                >
                  <span className="method-icon" style={{ '--method-accent': method.accent }}>{method.label[0]}</span>
                  <span className="method-copy">
                    <strong>{method.label}</strong>
                    <small>{method.description}</small>
                  </span>
                  <span className="method-arrow">›</span>
                </button>
              ))}
            </div>

            <div className="items-section">
              <h3>Items Summary</h3>
              <div className="items-list">
                {parsedItems.map((item, idx) => (
                  <div key={idx} className="summary-item">
                    <span>{item.name} x {item.quantity}</span>
                    <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="total-row">
                <span>Total Payable</span>
                <span className="amount">₹{displayTotal}</span>
              </div>
            </div>

            {isPaid ? (
              <div className="success-msg">
                <span className="check-icon">✅</span>
                <p>This order has already been paid. Thank you!</p>
                <button className="back-btn" onClick={() => navigate('/')}>Back to Shop</button>
              </div>
            ) : (
              <button
                className="pay-btn"
                onClick={handlePayment}
                disabled={paying}
              >
                {paying ? 'Processing...' : `Pay with Razorpay (${selectedMethod.toUpperCase()})`}
              </button>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

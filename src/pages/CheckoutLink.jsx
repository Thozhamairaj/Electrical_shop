import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CheckoutLink.css';

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

  const parseItems = (items) => {
    if (!items) return [];
    if (Array.isArray(items)) return items;
    if (typeof items === 'string') {
      try {
        const parsed = JSON.parse(items);
        return Array.isArray(parsed) ? parsed : [];
      } catch (error) {
        return [];
      }
    }
    return [];
  };

  const handlePayment = async () => {
    setPaying(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      await axios.post(`${apiUrl}/api/orders/${order.id}/pay`);
      setOrder(prev => ({ ...prev, paymentStatus: 'paid', status: 'confirmed' }));
      alert('Demo payment completed successfully.');
    } catch (err) {
      console.error('Payment error:', err);
      alert('Failed to complete demo payment.');
    } finally {
      setPaying(false);
    }
  };

  if (loading) return <div className="checkout-link-container">Loading order details...</div>;
  if (error) return <div className="checkout-link-container error">{error}</div>;

  const parsedItems = parseItems(order.items);
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
              <p>Demo Payment Desk</p>
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
                <span className="gateway-kicker">Secure demo checkout</span>
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
                <p>This order has been marked as paid in the demo flow.</p>
                <button className="back-btn" onClick={() => navigate('/orders')}>View Orders</button>
              </div>
            ) : (
              <button
                className="pay-btn"
                onClick={handlePayment}
                disabled={paying}
              >
                {paying ? 'Processing...' : `Confirm Demo Payment (${selectedMethod.toUpperCase()})`}
              </button>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

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

  return (
    <div className="checkout-link-page">
      <div className="checkout-card">
        <div className="checkout-header">
          <img src="/supa-avatar.png" alt="Supa" className="checkout-logo" />
          <h1>Secure Checkout</h1>
          <p className="order-tag">Order #{order.id}</p>
        </div>

        <div className="order-summary">
          <h3>Items Summary</h3>
          <div className="items-list">
            {order.items && JSON.parse(order.items).map((item, idx) => (
              <div key={idx} className="summary-item">
                <span>{item.name} x {item.quantity}</span>
                <span>₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="total-row">
            <span>Total Payable</span>
            <span className="amount">₹{order.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        <div className="payment-status">
          <p>Status: <span className={`status-pill ${order.paymentStatus}`}>{order.paymentStatus.toUpperCase()}</span></p>
        </div>

        {order.paymentStatus === 'pending' ? (
          <button 
            className="pay-btn" 
            onClick={handlePayment}
            disabled={paying}
          >
            {paying ? 'Processing...' : 'Pay with Razorpay'}
          </button>
        ) : (
          <div className="success-msg">
            <span className="check-icon">✅</span>
            <p>This order has already been paid. Thank you!</p>
            <button className="back-btn" onClick={() => navigate('/')}>Back to Shop</button>
          </div>
        )}
      </div>
    </div>
  );
}

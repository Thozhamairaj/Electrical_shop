import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Orders.css';

const loadScript = (src) => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function Orders() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  useEffect(() => {
    if (user?.id) {
      fetchOrders();
    }
  }, [user]);


  const fetchOrders = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const { data } = await axios.get(`${apiUrl}/api/orders/my/${user.id}`);
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const parseItems = (items) => {
    if (!items) return [];
    if (typeof items === 'string') {
      try {
        return JSON.parse(items);
      } catch (e) {
        return [];
      }
    }
    return Array.isArray(items) ? items : [];
  };

  const handlePayNow = async (order) => {
    try {
      const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
      if (!res) {
        alert('Razorpay SDK failed to load.');
        return;
      }

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      // 1. Get Razorpay Order ID (either existing or create new)
      let razorpayOrderId = order.razorpayOrderId;
      
      if (!razorpayOrderId) {
        const { data } = await axios.post(`${apiUrl}/api/orders/initiate-link-payment`, {
          orderId: order.id
        });
        razorpayOrderId = data.razorpayOrderId;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_your_key_here',
        amount: Math.round(Number(order.totalAmount) * 100),
        currency: 'INR',
        name: 'Sri Vinayaga Hardwares',
        description: `Order Payment #${order.id}`,
        order_id: razorpayOrderId,
        handler: async (response) => {
          try {
            await axios.post(`${apiUrl}/api/orders/verify-payment`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            alert('Payment Successful!');
            fetchOrders(); // Refresh orders list
          } catch (err) {
            console.error('Verification error:', err);
            alert('Payment verification failed.');
          }
        },
        prefill: {
          name: user.fullName,
          email: user.primaryEmailAddress?.emailAddress,
        },
        theme: { color: '#2563eb' },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      console.error('Payment error:', err);
      alert('Failed to initiate payment.');
    }
  };

  if (loading) return <div className="orders-loading"><div className="spinner"></div><p>Fetching your orders...</p></div>;

  return (
    <div className="orders-page">
      <div className="orders-container">
        <h1>My Orders</h1>
        {orders.length === 0 ? (
          <div className="no-orders">
            <div className="no-orders-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2>No orders yet</h2>
            <p>Your shopping journey starts here. Explore our collection of premium electrical supplies.</p>
            <button className="browse-btn" onClick={() => navigate('/products')}>
              Browse Products
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div className="order-meta">
                    <span className="order-id">Order ID: #ORD-{(order.id || 0).toString().padStart(6, '0')}</span>
                    <span className="order-date">{order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}</span>
                  </div>
                  <div className={`order-status ${(order.status || 'pending').toLowerCase()}`}>
                    {(order.status || 'PENDING').toUpperCase()}
                  </div>
                </div>

                <div className="order-body">
                  <div className="order-items">
                    {parseItems(order.items).map((item, idx) => (
                      <div key={idx} className="order-item">
                        <img src={item.image ? encodeURI(item.image) : '/placeholder.png'} alt={item.name || 'Product'} />
                        <div className="item-info">
                          <h4>{item.name || 'Unnamed Product'}</h4>
                          <p>Qty: {item.quantity || 1} × ₹{parseFloat(item.price || 0).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="order-summary">
                    <div className="summary-row">
                      <span>Total Amount:</span>
                      <span className="total-price">₹{parseFloat(order.totalAmount || 0).toFixed(2)}</span>
                    </div>
                    <div className="summary-row">
                      <span>Payment:</span>
                      <span className={`payment-status ${(order.paymentStatus || 'pending').toLowerCase()}`}>
                        {(order.paymentStatus || 'pending').toLowerCase() === 'paid' ? '✓ Paid' : '⌛ Pending'}
                      </span>
                    </div>

                    {(order.paymentStatus || 'pending').toLowerCase() === 'pending' && (
                      <button className="pay-now-btn" onClick={() => handlePayNow(order)}>
                        Complete Payment
                      </button>
                    )}
                    
                    {order.paymentStatus === 'paid' && (
                      <div className="order-actions">
                        <button 
                          className="track-order-btn"
                          onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                        >
                          {expandedOrderId === order.id ? 'Hide Tracking' : 'Track Order'}
                        </button>
                        <div className="paid-badge">
                          <span className="dummy-label">Secured by Razorpay</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {expandedOrderId === order.id && (
                  <div className="order-tracking">
                    <div className="tracking-timeline">
                      {[
                        { label: 'Ordered', status: 'pending' },
                        { label: 'Confirmed', status: 'confirmed' },
                        { label: 'Processing', status: 'processing' },
                        { label: 'Shipped', status: 'shipped' },
                        { label: 'Delivered', status: 'delivered' }
                      ].map((step, idx, arr) => {
                        const orderStatus = (order.status || 'pending').toLowerCase();
                        const statusIndex = arr.findIndex(s => s.status === orderStatus);
                        const isCompleted = idx <= statusIndex;
                        const isCurrent = idx === statusIndex;

                        return (
                          <div key={step.label} className={`tracking-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
                            <div className="step-marker">
                              {isCompleted ? '✓' : idx + 1}
                            </div>
                            <div className="step-label">{step.label}</div>
                            {idx < arr.length - 1 && <div className="step-line"></div>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

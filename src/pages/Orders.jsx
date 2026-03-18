import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Orders.css';

export default function Orders() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handlePayNow = (order) => {
    // Navigate to dummy payment with order details
    navigate('/payment', { 
      state: { 
        orderId: order.id,
        totalAmount: parseFloat(order.totalAmount || 0),
        isExistingOrder: true
      } 
    });
  };

  if (loading) return <div className="orders-loading"><div className="spinner"></div><p>Fetching your orders...</p></div>;

  return (
    <div className="orders-page">
      <div className="orders-container">
        <h1>My Orders</h1>
        {orders.length === 0 ? (
          <div className="no-orders">
            <h2>No orders yet</h2>
            <p>Ready to start shopping? Your orders will appear here.</p>
            <button onClick={() => navigate('/products')}>Browse Products</button>
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
                        {order.paymentStatus === 'paid' ? '✓ Paid' : '⌛ Pending'}
                      </span>
                    </div>

                    {order.paymentStatus === 'pending' && (
                      <button className="pay-now-btn" onClick={() => handlePayNow(order)}>
                        Complete Payment
                      </button>
                    )}
                    
                    {order.paymentStatus === 'paid' && (
                      <div className="paid-badge">
                        <span className="dummy-label">Secured by Dummy Razorpay</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

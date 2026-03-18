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
      const { data } = await axios.get(`http://localhost:5000/api/orders/my/${user.id}`);
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = (order) => {
    // Navigate to dummy payment with order details
    navigate('/payment', { 
      state: { 
        orderId: order.id,
        totalAmount: parseFloat(order.totalAmount),
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
                    <span className="order-id">Order ID: #ORD-{order.id.toString().padStart(6, '0')}</span>
                    <span className="order-date">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div className={`order-status ${order.status}`}>
                    {order.status.toUpperCase()}
                  </div>
                </div>

                <div className="order-body">
                  <div className="order-items">
                    {JSON.parse(order.items).map((item, idx) => (
                      <div key={idx} className="order-item">
                        <img src={encodeURI(item.image)} alt={item.name} />
                        <div className="item-info">
                          <h4>{item.name}</h4>
                          <p>Qty: {item.quantity} × ₹{parseFloat(item.price).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="order-summary">
                    <div className="summary-row">
                      <span>Total Amount:</span>
                      <span className="total-price">₹{parseFloat(order.totalAmount).toFixed(2)}</span>
                    </div>
                    <div className="summary-row">
                      <span>Payment:</span>
                      <span className={`payment-status ${order.paymentStatus}`}>
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

import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { useCart } from '../context/CartContext';
import { generateWhatsAppUrl, formatCartOrderMessage } from '../utils/whatsapp';
import { userService } from '../services/userService';
import PhoneNumberModal from '../components/PhoneNumberModal';
import axios from 'axios';

import './Cart.css';

const loadScript = (src) => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

export default function Cart() {
  const { cartItems, cartTotal, removeFromCart, updateQuantity, clearCart } = useCart();
  const { isLoaded, isSignedIn, user } = useUser();
  const navigate = useNavigate();
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Initialize selected items with all cart items
  useEffect(() => {
    if (cartItems.length > 0 && selectedIds.size === 0) {
      setSelectedIds(new Set(cartItems.map(item => item.id)));
    }
  }, [cartItems]);

  const toggleSelectItem = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === cartItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(cartItems.map(item => item.id)));
    }
  };

  const selectedCartItems = useMemo(() => {
    return cartItems.filter(item => selectedIds.has(item.id));
  }, [cartItems, selectedIds]);

  const selectedTotal = useMemo(() => {
    return selectedCartItems.reduce((acc, item) => acc + Number(item.price) * item.quantity, 0);
  }, [selectedCartItems]);

  const handleWhatsAppOrder = async () => {
    try {
      if (!isSignedIn) {
        alert('Please login to place an order.');
        navigate('/auth');
        return;
      }

      if (selectedCartItems.length === 0) {
        alert('Please select at least one item to order.');
        return;
      }

      try {
        const dbUser = await userService.getUserProfile(user.id);
        if (dbUser && dbUser.phoneNumber) {
          completeWhatsAppOrder(dbUser.phoneNumber);
        } else {
          setIsPhoneModalOpen(true);
        }
      } catch (error) {
        console.error('Error checking user profile:', error);
        setIsPhoneModalOpen(true);
      }
    } catch (error) {
      console.error('WhatsApp order error:', error);
      alert('An error occurred while processing your order. Please try again.');
    }
  };

  const completeWhatsAppOrder = async (phone) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const { data } = await axios.post(`${apiUrl}/api/orders`, {
        userId: user.id,
        userEmail: user.primaryEmailAddress?.emailAddress,
        userName: user.fullName || user.username || 'Customer',
        userPhone: phone,
        items: selectedCartItems,
        totalAmount: selectedTotal,
        isWhatsApp: true
      });

      const orderId = data.order?.id;
      const message = formatCartOrderMessage(selectedCartItems, selectedTotal, phone, orderId);
      const url = generateWhatsAppUrl(message);
      if (!url) {
        alert('Unable to open WhatsApp. Please try again.');
        return;
      }
      window.open(url, '_blank');
      
      // Optionally clear ONLY selected items, or clear all? 
      // Usually, checkout clears part of the cart. 
      // But clearing all is simpler for this flow.
      clearCart(); 
    } catch (err) {
      console.error('Error creating WhatsApp order record:', err);
      const message = formatCartOrderMessage(selectedCartItems, selectedTotal, phone);
      const url = generateWhatsAppUrl(message);
      if (!url) {
        alert('Unable to open WhatsApp. Please try again.');
        return;
      }
      window.open(url, '_blank');
    }
  };

  const handlePhoneConfirm = async (phone) => {
    try {
      if (!phone || phone.length < 10) {
        alert('Please enter a valid phone number.');
        return;
      }

      try {
        await userService.updateUserProfile(user.id, { phoneNumber: phone });
      } catch (error) {
        console.error('Error saving phone number:', error);
      }

      setIsPhoneModalOpen(false);
      completeWhatsAppOrder(phone);
    } catch (error) {
      console.error('Error processing phone confirmation:', error);
      alert('An error occurred. Please try again.');
    }
  };

  const handleRazorpayCheckout = async () => {
    if (!isSignedIn) {
      alert('Please login to proceed with checkout.');
      navigate('/auth');
      return;
    }

    if (selectedCartItems.length === 0) {
      alert('Please select at least one item to checkout.');
      return;
    }

    try {
      const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
      if (!res) {
        alert('Razorpay SDK failed to load. Are you online?');
        return;
      }

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      // 1. Create order in our database first
      const orderResponse = await axios.post(`${apiUrl}/api/orders`, {
        userId: user.id,
        userEmail: user.primaryEmailAddress?.emailAddress,
        userName: user.fullName || user.username || 'Customer',
        items: selectedCartItems,
        totalAmount: selectedTotal >= 500 ? selectedTotal : selectedTotal + 50,
        status: 'pending',
        paymentStatus: 'pending'
      });

      const order = orderResponse.data.order;

      // 2. Create Razorpay order
      const paymentResponse = await axios.post(`${apiUrl}/api/orders/create-payment`, {
        amount: order.totalAmount,
        orderId: order.id
      });

      const razorpayOrder = paymentResponse.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_your_key_here',
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'Sri Vinayaga Hardwares',
        description: 'Order Payment',
        order_id: razorpayOrder.id,
        handler: async (response) => {
          try {
            const verifyRes = await axios.post(`${apiUrl}/api/orders/verify-payment`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.data.message === 'Payment verified') {
              alert('Payment Successful!');
              clearCart();
              navigate('/orders');
            }
          } catch (err) {
            console.error('Verification error:', err);
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: user.fullName,
          email: user.primaryEmailAddress?.emailAddress,
        },
        theme: {
          color: '#2563eb',
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Failed to initiate checkout. Please try again.');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-header">
          <h1>Shopping Cart</h1>
        </div>
        <div className="cart-container">
          <div className="empty-cart">
            <span className="empty-icon">🛒</span>
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added any items to your cart yet.</p>
            <Link to="/products" className="continue-shopping-btn">
              Continue Shopping →
            </Link>
          </div>
        </div>

        <section className="why-shop">
          <div className="why-shop-container">
            <h2>Why shop with Sri Vinayaga Hardwares?</h2>
            <div className="benefits-grid">
              <div className="benefit-card">
                <span className="benefit-icon">🚚</span>
                <h3>Free Shipping</h3>
                <p>On orders over ₹500</p>
              </div>
              <div className="benefit-card">
                <span className="benefit-icon">🔒</span>
                <h3>Secure Checkout</h3>
                <p>100% secure transactions</p>
              </div>
              <div className="benefit-card">
                <span className="benefit-icon">↩️</span>
                <h3>Easy Returns</h3>
                <p>30-day money-back guarantee</p>
              </div>
              <div className="benefit-card">
                <span className="benefit-icon">⭐</span>
                <h3>Expert Support</h3>
                <p>24/7 customer service</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const isAllSelected = selectedIds.size === cartItems.length;

  return (
    <div className="cart-page">
      <div className="cart-header">
        <h1>Shopping Cart</h1>
        <span className="cart-item-count">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="cart-container">
        <div className="cart-items-wrapper">
          <div className="select-all-bar">
            <label className="checkbox-container">
              <input 
                type="checkbox" 
                checked={isAllSelected} 
                onChange={toggleSelectAll} 
              />
              <span className="checkmark"></span>
              <span className="select-all-text">Select All ({cartItems.length} items)</span>
            </label>
            {selectedIds.size > 0 && (
              <span className="selected-count-badge">
                {selectedIds.size} selected
              </span>
            )}
          </div>

          <div className="cart-items-list">
            {cartItems.map(item => (
              <div key={item.id} className="cart-item">
                <label className="checkbox-container item-checkbox">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.has(item.id)} 
                    onChange={() => toggleSelectItem(item.id)} 
                  />
                  <span className="checkmark"></span>
                </label>
                
                <img src={encodeURI(item.image)} alt={item.name} className="cart-item-image" />
                <div className="cart-item-details">
                  <h3 className="cart-item-name">{item.name}</h3>
                  <p className="cart-item-price">₹{Math.round(item.price)}</p>
                </div>
                <div className="cart-item-controls">
                  <button
                    className="qty-btn"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >−</button>
                  <span className="cart-item-qty">{item.quantity}</span>
                  <button
                    className="qty-btn"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >+</button>
                </div>
                <p className="cart-item-subtotal">₹{Math.round(Number(item.price) * item.quantity)}</p>
                <button
                  className="remove-item-btn"
                  onClick={() => removeFromCart(item.id)}
                  title="Remove from cart"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                  <span>Remove</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="cart-summary">
          <h2>Order Summary</h2>
          <div className="summary-row">
            <span>Selected Items</span>
            <span>{selectedIds.size}</span>
          </div>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>₹{Math.round(selectedTotal)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>{selectedTotal > 0 ? (selectedTotal >= 500 ? 'FREE' : '₹50') : '₹0'}</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>₹{Math.round(selectedTotal > 0 ? (selectedTotal >= 500 ? selectedTotal : selectedTotal + 50) : 0)}</span>
          </div>
          <button
            type="button"
            className="checkout-btn"
            disabled={selectedIds.size === 0}
            onClick={handleRazorpayCheckout}
          >
            Proceed to Checkout
          </button>

          <button
            type="button"
            className="whatsapp-cart-btn"
            disabled={selectedIds.size === 0}
            onClick={handleWhatsAppOrder}
          >
            <span className="whatsapp-icon">💬</span> Order on WhatsApp
          </button>

          <button
            type="button"
            className="clear-cart-btn"
            onClick={clearCart}
          >
            Clear Full Cart
          </button>
          <Link to="/products" className="continue-shopping-btn secondary">
            ← Continue Shopping
          </Link>
        </div>
      </div>
      <PhoneNumberModal
        isOpen={isPhoneModalOpen}
        onClose={() => setIsPhoneModalOpen(false)}
        onConfirm={handlePhoneConfirm}
      />
    </div>
  );
}

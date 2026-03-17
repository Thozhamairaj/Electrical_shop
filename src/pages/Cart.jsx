import { useState } from 'react';
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

  const handleWhatsAppOrder = async () => {
    if (!isSignedIn) {
      alert('Please login to place an order.');
      navigate('/auth');
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
  };

  const completeWhatsAppOrder = async (phone) => {
    try {
      // 1. Create a "WhatsApp" order in the database for tracking & payment link
      const { data } = await axios.post('http://localhost:5000/api/orders', {
        userId: user.id,
        userEmail: user.primaryEmailAddress?.emailAddress,
        userName: user.fullName || user.username || 'Customer',
        userPhone: phone,
        items: cartItems,
        totalAmount: cartTotal,
        isWhatsApp: true
      });

      const orderId = data.order?.id;

      // 2. Format message with orderId for payment link
      const message = formatCartOrderMessage(cartItems, cartTotal, phone, orderId);
      const url = generateWhatsAppUrl(message);
      window.open(url, '_blank');
      
      // 3. Clear cart as order is "placed" (pending payment)
      clearCart();
    } catch (err) {
      console.error('Error creating WhatsApp order record:', err);
      // Fallback: order without link if API fails
      const message = formatCartOrderMessage(cartItems, cartTotal, phone);
      const url = generateWhatsAppUrl(message);
      window.open(url, '_blank');
    }
  };

  const handlePhoneConfirm = async (phone) => {
    try {
      await userService.updateUserProfile(user.id, { phoneNumber: phone });
      setIsPhoneModalOpen(false);
      completeWhatsAppOrder(phone);
    } catch (error) {
      console.error('Error saving phone number:', error);
      completeWhatsAppOrder(phone);
    }
  };

  const handleRazorpayCheckout = async () => {
    if (!isSignedIn) {
      alert('Please login to place an order.');
      navigate('/auth');
      return;
    }

    const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
    if (!res) {
      alert('Razorpay SDK failed to load. Are you online?');
      return;
    }

    try {
      // 1. Create order on our server
      const { data: orderData } = await axios.post('http://localhost:5000/api/orders/create-razorpay-order', {
        userId: user.id,
        userEmail: user.primaryEmailAddress?.emailAddress,
        userName: user.fullName || user.username || 'Customer',
        userPhone: '', // get from profile if needed, or prompt
        items: cartItems,
        totalAmount: cartTotal,
        shippingAddress: 'To be collected', // Hardcoded for now
        notes: 'Razorpay payment',
      });

      if (!orderData) {
        alert('Server error. Please try again.');
        return;
      }

      // 2. Initialize Razorpay popup
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Sri Vinayaga Hardwares',
        description: 'Test Transaction',
        order_id: orderData.razorpayOrderId,
        handler: async function (response) {
          try {
            // 3. Verify payment on our server
            const { data: verifyData } = await axios.post('http://localhost:5000/api/orders/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            alert(verifyData.message);
            clearCart();
            // Optionally redirect to an orders page
          } catch (err) {
            console.error('Payment verification failed', err);
            alert('Payment verification failed.');
          }
        },
        prefill: {
          name: user.fullName || user.username || '',
          email: user.primaryEmailAddress?.emailAddress || '',
          contact: ''
        },
        theme: {
          color: '#3399cc',
        },
      };

      const paymentObject = new window.Razorpay(options);

      paymentObject.on('payment.failed', function (response) {
        console.error('Payment failed', response.error);
        alert(`Payment Failed: ${response.error.description}`);
      });

      paymentObject.open();

    } catch (error) {
      console.error('Checkout error:', error);
      alert('Error initiating checkout.');
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

  return (
    <div className="cart-page">
      <div className="cart-header">
        <h1>Shopping Cart</h1>
        <span className="cart-item-count">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="cart-container">
        <div className="cart-items-list">
          {cartItems.map(item => (
            <div key={item.id} className="cart-item">
              <img src={encodeURI(item.image)} alt={item.name} className="cart-item-image" />
              <div className="cart-item-details">
                <h3 className="cart-item-name">{item.name}</h3>
                <p className="cart-item-price">₹{Number(item.price).toFixed(2)}</p>
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
              <p className="cart-item-subtotal">₹{(Number(item.price) * item.quantity).toFixed(2)}</p>
              <button
                className="remove-btn"
                onClick={() => removeFromCart(item.id)}
                aria-label="Remove item"
              >✕</button>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h2>Order Summary</h2>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>₹{cartTotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>{cartTotal >= 500 ? 'FREE' : '₹50.00'}</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>₹{(cartTotal >= 500 ? cartTotal : cartTotal + 50).toFixed(2)}</span>
          </div>
          <button className="checkout-btn" onClick={handleRazorpayCheckout}>
            Proceed to Checkout
          </button>

          <button
            className="whatsapp-cart-btn"
            onClick={handleWhatsAppOrder}
          >
            <span className="whatsapp-icon">💬</span> Order on WhatsApp
          </button>

          <button className="clear-cart-btn" onClick={clearCart}>Clear Cart</button>
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

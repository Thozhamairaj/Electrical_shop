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
    try {
      if (!isSignedIn) {
        alert('Please login to place an order.');
        navigate('/auth');
        return;
      }

      if (cartItems.length === 0) {
        alert('Your cart is empty. Please add items before ordering.');
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
      // 1. Create a "WhatsApp" order in the database for tracking & payment link
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const { data } = await axios.post(`${apiUrl}/api/orders`, {
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
      if (!url) {
        alert('Unable to open WhatsApp. Please try again.');
        return;
      }
      window.open(url, '_blank');

      // 3. Clear cart as order is "placed" (pending payment)
      clearCart();
    } catch (err) {
      console.error('Error creating WhatsApp order record:', err);
      // Fallback: order without link if API fails
      const message = formatCartOrderMessage(cartItems, cartTotal, phone);
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
    try {
      if (!isSignedIn) {
        alert('Please login to proceed with checkout.');
        navigate('/auth');
        return;
      }

      if (!cartItems || cartItems.length === 0) {
        alert('Your cart is empty. Please add items before checkout.');
        return;
      }

      const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
      if (!res) {
        alert('Payment gateway is unavailable. Please try again or use WhatsApp to order.');
        return;
      }

      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const { data: orderData } = await axios.post(`${apiUrl}/api/orders/create-razorpay-order`, {
          userId: user.id,
          userEmail: user.primaryEmailAddress?.emailAddress || 'noemail@example.com',
          userName: user.fullName || user.username || 'Customer',
          userPhone: '',
          items: cartItems,
          totalAmount: cartTotal,
          shippingAddress: 'To be collected',
          notes: 'Razorpay payment',
        });

        if (!orderData || !orderData.razorpayOrderId) {
          throw new Error('Invalid order response from server');
        }

        const options = {
          key: orderData.keyId || 'rzp_live_key',
          amount: orderData.amount,
          currency: orderData.currency || 'INR',
          name: 'Electrical Shop',
          description: 'Order Payment',
          order_id: orderData.razorpayOrderId,
          handler: async function (response) {
            try {
              const { data: verifyData } = await axios.post('http://localhost:5000/api/orders/verify-payment', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });

              alert(verifyData.message || 'Payment successful!');
              clearCart();
              navigate('/orders');
            } catch (err) {
              console.error('Payment verification failed', err);
              alert('Payment completed but verification failed. Please contact support.');
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
          alert(`Payment Failed: ${response.error?.description || 'Unknown error'}`);
        });

        paymentObject.open();
      } catch (error) {
        console.error('Checkout error:', error);
        alert(`Checkout error: ${error.message || 'Unable to process payment. Please try again.'}`);
      }
    } catch (error) {
      console.error('Razorpay checkout error:', error);
      alert('An unexpected error occurred. Please try again.');
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
          <button
            type="button"
            className="checkout-btn"
            onClick={handleRazorpayCheckout}
          >
            Proceed to Checkout
          </button>

          <button
            type="button"
            className="whatsapp-cart-btn"
            onClick={handleWhatsAppOrder}
          >
            <span className="whatsapp-icon">💬</span> Order on WhatsApp
          </button>

          <button
            type="button"
            className="clear-cart-btn"
            onClick={clearCart}
          >
            Clear Cart
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

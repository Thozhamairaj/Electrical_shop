import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { products } from '../data/products';
import { generateWhatsAppUrl, formatProductOrderMessage, formatProductEnquiryMessage } from '../utils/whatsapp';
import { userService } from '../services/userService';
import PhoneNumberModal from '../components/PhoneNumberModal';
import axios from 'axios';

import './ProductPage.css';

export default function ProductPage() {
  const { id } = useParams();
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();
  const product = products.find(p => p.id === parseInt(id));
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);

  if (!product) {
    return (
      <div className="product-page">
        <div className="not-found">
          <h1>Product Not Found</h1>
          <p>Sorry, the product you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!isSignedIn) {
      alert('Please login to add items to your cart.');
      navigate('/auth');
      return;
    }
    addToCart(product, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const loadScript = (src) => new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  const handleBuyNow = async () => {
    if (!isSignedIn) {
      alert('Please login to proceed with purchase.');
      navigate('/auth');
      return;
    }

    try {
      const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
      if (!res) {
        alert('Razorpay SDK failed to load. Are you online?');
        return;
      }

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const totalAmount = product.price * quantity;
      const amountWithShipping = totalAmount >= 500 ? totalAmount : totalAmount + 50;

      const paymentResponse = await axios.post(`${apiUrl}/api/orders/create-payment`, {
        amount: amountWithShipping,
        items: [{ ...product, quantity }],
      });

      const razorpayOrder = paymentResponse.data;

      const options = {
        key: razorpayOrder.key_id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'Sri Vinayaga Hardwares',
        description: `${product.name} × ${quantity}`,
        order_id: razorpayOrder.id,
        handler: async (response) => {
          try {
            const verifyRes = await axios.post(`${apiUrl}/api/orders/verify-payment`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderData: {
                userId: user.id,
                userEmail: user.primaryEmailAddress?.emailAddress,
                userName: user.fullName || user.username || 'Customer',
                items: [{ ...product, quantity }],
                totalAmount: amountWithShipping,
                shippingAddress: 'To be collected',
              },
            });
            if (verifyRes.data.message.includes('verified')) {
              alert('Payment Successful and Order Placed!');
              navigate('/orders');
            }
          } catch (err) {
            console.error('Verification error:', err);
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: user?.fullName,
          email: user?.primaryEmailAddress?.emailAddress,
        },
        theme: { color: '#2563eb' },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      console.error('Buy Now checkout error:', err);
      alert('Failed to initiate checkout. Please try again.');
    }
  };

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
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      // 1. Create order record
      const { data } = await axios.post(`${apiUrl}/api/orders`, {
        userId: user.id,
        userEmail: user.primaryEmailAddress?.emailAddress,
        userName: user.fullName || user.username || 'Customer',
        userPhone: phone,
        items: [{ ...product, quantity }],
        totalAmount: product.price * quantity,
        isWhatsApp: true
      });

      const orderId = data.order?.id;

      // 2. Open WhatsApp
      const message = formatProductOrderMessage(product, quantity, phone, orderId);
      const url = generateWhatsAppUrl(message);
      window.open(url, '_blank');
    } catch (err) {
      console.error('Error creating product WhatsApp order:', err);
      const message = formatProductOrderMessage(product, quantity, phone);
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
      completeWhatsAppOrder(phone); // Still proceed with order even if save fails
    }
  };


  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  const relatedProducts = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

  return (
    <div className="product-page">
      <div className="breadcrumb">
        <span>Home</span> / <span>Products</span> / <span>{product.name}</span>
      </div>

      <div className="product-detail">
        <div className="product-images">
          <div className="main-image">
            <img src={encodeURI(product.image)} alt={product.name} />
            {discount > 0 && <div className="discount-badge">{discount}% OFF</div>}
          </div>
        </div>

        <div className="product-details">
          <h1>{product.name}</h1>

          <div className="rating-section">
            <span className="stars">{'⭐'.repeat(Math.floor(product.rating))}</span>
            <span className="rating-number">({product.reviews} reviews)</span>
          </div>

          <div className="price-section">
            <span className="price">₹{product.price.toFixed(2)}</span>
            {product.originalPrice > product.price && (
              <>
                <span className="original-price">₹{product.originalPrice.toFixed(2)}</span>
                <span className="savings">Save ₹{(product.originalPrice - product.price).toFixed(2)}</span>
              </>
            )}
          </div>

          <div className="availability">
            <span className={product.stock > 0 ? 'in-stock' : 'out-of-stock'}>
              {product.stock > 0 ? '✓ In Stock' : '✗ Out of Stock'}
            </span>
          </div>

          <p className="description">{product.description}</p>

          {product.specs && (
            <div className="specifications">
              <h3>Specifications</h3>
              <ul>
                {Object.entries(product.specs).map(([key, value]) => (
                  <li key={key}>
                    <strong>{key.replace(/([A-Z])/g, ' $1').trim()}:</strong> {value}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="purchase-section">
            <div className="quantity-selector">
              <label>Quantity:</label>
              <div className="quantity-input">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                <input type="number" value={quantity} readOnly />
                <button onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>
            </div>

            <button
              className="buy-now-btn"
              onClick={handleBuyNow}
              disabled={product.stock <= 0}
            >
              Buy Now
            </button>

            <button
              className={`add-to-cart-btn ${addedToCart ? 'added' : ''}`}
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
            >
              {addedToCart ? '✓ Added to Cart' : 'Add to Cart'}
            </button>

            <button
              className="whatsapp-order-btn"
              onClick={handleWhatsAppOrder}
              disabled={product.stock <= 0}
            >
              <span className="whatsapp-icon">💬</span> Order on WhatsApp
            </button>


            <button 
              className={`wishlist-btn ${isInWishlist(product.id) ? 'active' : ''}`}
              onClick={() => toggleWishlist(product)}
            >
              {isInWishlist(product.id) ? '❤️ In Wishlist' : '♡ Add to Wishlist'}
            </button>
          </div>

          <div className="trust-badges">
            <div className="badge">
              <span>📦</span>
              <span>Free Shipping</span>
            </div>
            <div className="badge">
              <span>🔄</span>
              <span>30-Day Returns</span>
            </div>
            <div className="badge">
              <span>🔒</span>
              <span>Secure Payment</span>
            </div>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <section className="related-products">
          <h2>Related Products</h2>
          <div className="related-grid">
            {relatedProducts.map(related => (
              <div key={related.id} className="related-card">
                <img src={encodeURI(related.image)} alt={related.name} />
                <h4>{related.name}</h4>
                <p className="price">${related.price.toFixed(2)}</p>
                <a href={`/product/${related.id}`} className="view-link">View Details →</a>
              </div>
            ))}
          </div>
        </section>
      )}

      <PhoneNumberModal
        isOpen={isPhoneModalOpen}
        onClose={() => setIsPhoneModalOpen(false)}
        onConfirm={handlePhoneConfirm}
      />
    </div>
  );
}

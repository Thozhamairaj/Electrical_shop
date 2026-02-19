import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Cart.css';

export default function Cart() {
  const { cartItems, cartTotal, removeFromCart, updateQuantity, clearCart } = useCart();

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
            <h2>Why shop with ElectroHub?</h2>
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
              <img src={item.image} alt={item.name} className="cart-item-image" />
              <div className="cart-item-details">
                <h3 className="cart-item-name">{item.name}</h3>
                <p className="cart-item-price">₹{item.price.toFixed(2)}</p>
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
              <p className="cart-item-subtotal">₹{(item.price * item.quantity).toFixed(2)}</p>
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
          <button className="checkout-btn">Proceed to Checkout</button>
          <button className="clear-cart-btn" onClick={clearCart}>Clear Cart</button>
          <Link to="/products" className="continue-shopping-btn secondary">
            ← Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

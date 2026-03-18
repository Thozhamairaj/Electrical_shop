import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import './Wishlist.css';

export default function Wishlist() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveToCart = (product) => {
    addToCart(product, 1);
    removeFromWishlist(product.id);
  };

  if (wishlist.length === 0) {
    return (
      <div className="wishlist-page empty">
        <div className="empty-state">
          <div className="empty-icon">❤️</div>
          <h2>Your Wishlist is Empty</h2>
          <p>Tap heart on any product to save it for later!</p>
          <Link to="/products" className="shop-now-btn">Explore Products</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <div className="wishlist-container">
        <h1>My Wishlist ({wishlist.length})</h1>
        <div className="wishlist-grid">
          {wishlist.map(product => (
            <div key={product.id} className="wishlist-card">
              <button 
                className="remove-btn" 
                onClick={() => removeFromWishlist(product.id)}
                title="Remove from wishlist"
              >
                ✕
              </button>
              <div className="product-image">
                <img src={encodeURI(product.image)} alt={product.name} />
              </div>
              <div className="product-info">
                <h3>{product.name}</h3>
                <p className="category">{product.category}</p>
                <div className="price-tag">
                  <span className="current-price">₹{product.price.toFixed(2)}</span>
                  {product.originalPrice > product.price && (
                    <span className="old-price">₹{product.originalPrice.toFixed(2)}</span>
                  )}
                </div>
                <button 
                  className="move-to-cart-btn"
                  onClick={() => handleMoveToCart(product)}
                >
                  Move to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

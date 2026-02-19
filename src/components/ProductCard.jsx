import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { useCart } from '../context/CartContext';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const { isSignedIn } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [added, setAdded] = useState(false);

  const handleAddToCart = (e) => {
    e.preventDefault(); // stop the card link from navigating
    if (!isSignedIn) {
      alert('Please login to add items to your cart.');
      navigate('/auth');
      return;
    }
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <Link to={`/product/${product.id}`} className="product-card">
      <div className="product-image">
        <img src={product.image} alt={product.name} />
        {product.originalPrice > product.price && (
          <div className="discount-badge">
            {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
          </div>
        )}
      </div>

      <div className="product-info">
        <h3>{product.name}</h3>
        <div className="rating">
          <span className="stars">{'⭐'.repeat(Math.floor(product.rating))}</span>
          <span className="rating-text">({product.reviews})</span>
        </div>

        <div className="price-section">
          <span className="price">₹{product.price.toFixed(2)}</span>
          {product.originalPrice > product.price && (
            <span className="original-price">₹{product.originalPrice.toFixed(2)}</span>
          )}
        </div>

        <button className={`add-to-cart-btn${added ? ' added' : ''}`} onClick={handleAddToCart}>
          {added ? '✓ Added!' : 'Add to Cart'}
        </button>
      </div>
    </Link>
  );
}

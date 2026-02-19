import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { useCart } from '../context/CartContext';
import { products } from '../data/products';
import './ProductPage.css';

export default function ProductPage() {
  const { id } = useParams();
  const { isSignedIn } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const product = products.find(p => p.id === parseInt(id));
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

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
            <img src={product.image} alt={product.name} />
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
            <span className={product.inStock ? 'in-stock' : 'out-of-stock'}>
              {product.inStock ? '✓ In Stock' : '✗ Out of Stock'}
            </span>
          </div>

          <p className="description">{product.description}</p>

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
              className={`add-to-cart-btn ${addedToCart ? 'added' : ''}`}
              onClick={handleAddToCart}
              disabled={!product.inStock}
            >
              {addedToCart ? '✓ Added to Cart' : 'Add to Cart'}
            </button>

            <button className="wishlist-btn">♡ Add to Wishlist</button>
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
                <img src={related.image} alt={related.name} />
                <h4>{related.name}</h4>
                <p className="price">${related.price.toFixed(2)}</p>
                <a href={`/product/${related.id}`} className="view-link">View Details →</a>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

import HeroCarousel from '../components/HeroCarousel';
import ProductCard from '../components/ProductCard';
import { products, categories } from '../data/products';
import { Link } from 'react-router-dom';
import './Home.css';

// One featured product per category (first match)
const categorySpotlight = categories
  .filter(c => c.id !== 'all')
  .map(cat => ({
    ...cat,
    product: products.find(p => p.category === cat.id),
  }))
  .filter(c => c.product);

// 8 top-rated products for the featured strip
const featuredProducts = [...products]
  .sort((a, b) => b.rating - a.rating)
  .slice(0, 8);

export default function Home() {
  return (
    <div className="home">

      {/* ── Hero Carousel ──────────────────────────────────────────── */}
      <HeroCarousel />

      {/* ── Category Showcase ──────────────────────────────────────── */}
      <section className="category-showcase">
        <div className="section-header">
          <h2>Shop by Category</h2>
          <Link to="/products" className="view-all">View all →</Link>
        </div>
        <div className="category-grid">
          {categorySpotlight.map(({ id, name, icon, product }) => (
            <Link
              key={id}
              to={`/products?category=${id}`}
              className="category-card"
            >
              <div className="category-card-img">
                <img src={product.image} alt={name} />
              </div>
              <div className="category-card-body">
                <span className="category-icon">{icon}</span>
                <h3>{name}</h3>
                <span className="category-count">
                  {products.filter(p => p.category === id).length} products
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured Products ──────────────────────────────────────── */}
      <section className="featured-section">
        <div className="section-header">
          <h2>Top Rated Products</h2>
          <Link to="/products" className="view-all">View all →</Link>
        </div>
        <div className="products-grid">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* ── Promo Banner ───────────────────────────────────────────── */}
      <section className="promo-banner">
        <div className="promo-inner">
          <div className="promo-text">
            <span className="promo-tag">LIMITED OFFER</span>
            <h2>Free Delivery on Prepaid Orders above ₹999</h2>
            <p>Shop your electrical essentials today and save on shipping every time you prepay.</p>
            <Link to="/products" className="promo-cta">Shop Now →</Link>
          </div>
          <div className="promo-emoji">🚚⚡🔌💡</div>
        </div>
      </section>

    </div>
  );
}

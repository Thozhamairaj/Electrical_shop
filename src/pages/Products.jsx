import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { categories } from '../data/products';
import './Products.css';

export default function Products() {
  const [searchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState(() => searchParams.get('category') || 'all');
  const [sortBy, setSortBy] = useState('featured');
  const [searchTerm, setSearchTerm] = useState(() => searchParams.get('search') || '');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [priceInitialized, setPriceInitialized] = useState(false);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const response = await fetch(`${apiUrl}/api/products?category=${selectedCategory}&search=${searchTerm}`);
        const data = await response.json();
        setProducts(data);
        // Auto-set price bounds from actual data (only first time)
        if (!priceInitialized && data.length > 0) {
          const prices = data.map(p => p.price);
          setMinPrice(0);
          setMaxPrice(Math.ceil(Math.max(...prices) / 500) * 500);
          setPriceInitialized(true);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory, searchTerm]);

  // Sync filters when URL params change
  useEffect(() => {
    setSelectedCategory(searchParams.get('category') || 'all');
    setSearchTerm(searchParams.get('search') || '');
  }, [searchParams]);

  // Compute bounds for sliders
  const absoluteMax = useMemo(() => {
    if (!products.length) return 10000;
    return Math.ceil(Math.max(...products.map(p => p.price)) / 500) * 500;
  }, [products]);

  const absoluteMin = useMemo(() => {
    if (!products.length) return 0;
    return Math.floor(Math.min(...products.map(p => p.price)) / 100) * 100;
  }, [products]);

  // Filter and Sort
  const filteredAndSorted = products
    .filter(p => p.price >= minPrice && p.price <= maxPrice)
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':  return a.price - b.price;
        case 'price-high': return b.price - a.price;
        case 'rating':     return b.rating - a.rating;
        default:           return 0;
      }
    });

  return (
    <div className="products-page">
      <div className="products-header">
        <h1>All Products</h1>
        <p>Browse our complete collection of lighting, fans, switches, and electrical essentials</p>
      </div>

      <div className="products-container">
        <main className="products-main">
          <div className="toolbar">
            <div className="results-count">
              Showing {filteredAndSorted.length} products
            </div>

            <div className="toolbar-actions">
              {/* Dual price range */}
              <div className="price-filter-toolbar">
                <span className="price-filter-label">Price Range</span>
                <div className="price-range-display">
                  <span>₹{minPrice.toLocaleString()}</span>
                  <span className="price-range-sep">–</span>
                  <span>₹{maxPrice.toLocaleString()}</span>
                </div>
                <div className="dual-slider-wrap">
                  <input
                    type="range"
                    className="toolbar-slider slider-min"
                    min={absoluteMin}
                    max={absoluteMax}
                    step={100}
                    value={minPrice}
                    onChange={e => {
                      const val = Number(e.target.value);
                      if (val < maxPrice) setMinPrice(val);
                    }}
                  />
                  <input
                    type="range"
                    className="toolbar-slider slider-max"
                    min={absoluteMin}
                    max={absoluteMax}
                    step={100}
                    value={maxPrice}
                    onChange={e => {
                      const val = Number(e.target.value);
                      if (val > minPrice) setMaxPrice(val);
                    }}
                  />
                </div>
              </div>

              <div className="sort-container">
                <label>Sort by:</label>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rating</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="loading">Loading products...</div>
          ) : filteredAndSorted.length > 0 ? (
            <div className="products-grid">
              {filteredAndSorted.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="no-products">
              <p>No products found in the ₹{minPrice.toLocaleString()} – ₹{maxPrice.toLocaleString()} range.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

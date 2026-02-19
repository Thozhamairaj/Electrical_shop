import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SignedIn, SignedOut, UserButton, useUser, useClerk } from '@clerk/clerk-react';
import { useCart } from '../context/CartContext';
import { categories } from '../data/products';
import './Header.css';

const categoryLinks = [
  // Electrical
  { label: 'All Products', category: 'all' },
  { label: 'Lighting', category: 'lighting' },
  { label: 'Fans & Ventilation', category: 'fans' },
  { label: 'Switches & Controls', category: 'switches' },
  { label: 'Power Backup', category: 'power' },
  { label: 'Safety & Protection', category: 'safety' },
  { label: 'Outdoor Lighting', category: 'outdoor' },
  { label: 'Wiring & Cables', category: 'wiring' },
  { label: 'Electrical Tools', category: 'tools' },
  // Plumbing
  { label: '|', category: null },
  { label: 'Pipes & Fittings', category: 'pipes' },
  { label: 'Water Tanks', category: 'tanks' },
  { label: 'Pumps & Motors', category: 'pumps' },
  { label: 'Bathroom Fittings', category: 'bathroom' },
  { label: 'Plumbing Tools', category: 'plumbing-tools' },
];

function UserMenu() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();

  const firstName = user?.firstName || user?.username || user?.emailAddresses?.[0]?.emailAddress?.split('@')[0] || 'User';

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="user-menu">
      {/* Clerk's UserButton — opens Manage Account modal on click */}
      <UserButton
        afterSignOutUrl="/auth"
        appearance={{
          elements: {
            avatarBox: 'clerk-avatar-box',
          },
        }}
      />
      <div className="user-dropdown">
        <span className="user-name">{firstName}</span>
        <button className="signout-btn" onClick={handleSignOut}>Sign out</button>
      </div>
    </div>
  );
}

export default function Header() {
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (selectedCat && selectedCat !== 'all') params.set('category', selectedCat);
    if (searchTerm.trim()) params.set('search', searchTerm.trim());
    navigate(`/products?${params.toString()}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <header className="header">
      <div className="top-strip">✨ Now enjoy free delivery on prepaid orders on the 1st of every month.</div>

      <div className="header-main">
        <Link to="/" className="logo">
          <span className="logo-mark">EH</span>
          <span className="logo-mark alt">Bazar</span>
        </Link>

        <div className="search-stack">
          <input
            className="search-input"
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <select
            className="category-select"
            aria-label="Choose category"
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
          >
            <option value="all">All categories</option>
            {categories.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
          <button className="search-btn" aria-label="Search products" onClick={handleSearch}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </button>
        </div>

        <div className="actions">
          <SignedOut>
            <div className="user-actions">
              <Link to="/auth" className="login-link">Login / Signup</Link>
              <span className="account-link">My account</span>
            </div>
          </SignedOut>
          <SignedIn>
            <UserMenu />
          </SignedIn>
          <Link to="/cart" className="cart-link">
            <div className="cart-icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
              <span className="cart-pill">{cartCount}</span>
            </div>
            <span className="cart-text">Cart</span>
          </Link>
        </div>
      </div>

      {/* Simple welcome text under search bar — only when signed in */}
      <SignedIn>
        <WelcomeBar />
      </SignedIn>

      <div className="nav-rail">
        <nav className="nav">
          {categoryLinks.map(({ label, category }) =>
            category === null ? (
              <span key="divider" className="nav-divider">|</span>
            ) : (
              <Link
                key={label}
                to={`/products?category=${category}`}
                className="nav-item"
              >
                {label}
              </Link>
            )
          )}
        </nav>
      </div>
    </header>
  );
}

function WelcomeBar() {
  const { user } = useUser();
  const firstName = user?.firstName || user?.username || user?.emailAddresses?.[0]?.emailAddress?.split('@')[0] || 'User';

  return (
    <div className="welcome-bar">
      👋 Welcome, <span className="welcome-name">{firstName}</span>! What are you looking for today?
    </div>
  );
}

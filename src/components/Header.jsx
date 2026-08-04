import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
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
  // Plumbing
  { label: '|', category: null },
  { label: 'Pipes & Fittings', category: 'pipes' },
  { label: 'Water Tanks', category: 'tanks' },
  { label: 'Pumps & Motors', category: 'pumps' },
  { label: 'Bathroom Fittings', category: 'bathroom' },
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
        <div className="user-dropdown-links">
          <Link to="/profile" className="profile-link">My Profile</Link>
            <Link to="/my-reviews" className="profile-link">My Reviews</Link>
          <button className="signout-btn" onClick={handleSignOut}>Sign out</button>
        </div>
      </div>
    </div>
  );
}

export default function Header() {
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');

  // Sync searchTerm and selectedCat with URL search params
  useEffect(() => {
    const cat = searchParams.get('category') || 'all';
    const search = searchParams.get('search') || '';
    setSelectedCat(cat);
    setSearchTerm(search);
  }, [searchParams]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (selectedCat && selectedCat !== 'all') params.set('category', selectedCat);
    if (searchTerm.trim()) {
      params.set('search', searchTerm.trim());
    } else {
      params.delete('search');
    }
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
          <div className="logo-icon">SV</div>
          <div className="logo-content">
            <span className="logo-main">Sri Vinayaga</span>
            <span className="logo-sub">Electricals & Hardwares</span>
          </div>
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

          {/* Wishlist */}
          <Link to="/wishlist" className="action-icon-link" title="Wishlist">
            <div className="action-icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
            </div>
            <span className="action-text">Wishlist</span>
          </Link>

          {/* Reviews */}
          <Link to="/my-reviews" className="action-icon-link" title="My Reviews">
            <div className="action-icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path><path d="M8 8h8"></path><path d="M8 12h5"></path></svg>
            </div>
            <span className="action-text">Reviews</span>
          </Link>

          {/* Orders & Tracking */}
          <Link to="/orders" className="action-icon-link" title="Orders & Tracking">
            <div className="action-icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="5 12 12 19 19 12"></polyline></svg>
            </div>
            <span className="action-text">Orders</span>
          </Link>

          {/* Cart */}
          <Link to="/cart" className="cart-link">
            <div className="cart-icon-wrapper">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
              <span className="cart-pill">{cartCount}</span>
            </div>
            <span className="cart-text">Cart</span>
          </Link>
        </div>
      </div >

    {/* Simple welcome text under search bar — only when signed in */ }
    < SignedIn >
    <WelcomeBar />
      </SignedIn >

    <div className="nav-rail">
      <nav className="nav">
        {categoryLinks.map(({ label, category }) =>
          category === null ? (
            <span key="divider" className="nav-divider">|</span>
          ) : (
            <Link
              key={label}
              to={`/products?category=${category}`}
              className={`nav-item ${selectedCat === category ? 'active' : ''}`}
            >
              {label}
            </Link>
          )
        )}
      </nav>
    </div>
    </header >
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

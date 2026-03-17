import './About.css';

export default function About() {
  return (
    <div className="about-page">
      <div className="about-hero">
        <h1>About Sri Vinayaga Hardwares</h1>
        <p>Your trusted partner for electricals since 2020</p>
      </div>

      <div className="about-container">
        <section className="about-section">
          <div className="about-content">
            <h2>Our Story</h2>
            <p>
              Sri Vinayaga Hardwares was founded in 2020 with a simple mission: to make quality electrical fittings accessible to everyone.
              What started as a small online store has grown into a trusted destination for homeowners, electricians, and
              contractors looking for reliable lighting, fans, wiring devices, and power backup solutions.
            </p>
            <p>
              We believe safe, efficient electricals make every space better. We curate proven products, keep prices fair,
              and back it all with responsive support.
            </p>
          </div>
          <div className="about-image">
            <div className="image-placeholder">📱💻⌚</div>
          </div>
        </section>

        <section className="mission-section">
          <h2>Our Mission</h2>
          <div className="mission-grid">
            <div className="mission-card">
              <span className="mission-icon">🎯</span>
              <h3>Quality First</h3>
              <p>We curate every product to ensure highest quality standards and reliability.</p>
            </div>
            <div className="mission-card">
              <span className="mission-icon">💡</span>
              <h3>Innovation</h3>
              <p>We stay ahead of energy-efficient trends and safer installation practices.</p>
            </div>
            <div className="mission-card">
              <span className="mission-icon">🤝</span>
              <h3>Customer First</h3>
              <p>Your satisfaction is our priority with 24/7 support and hassle-free returns.</p>
            </div>
            <div className="mission-card">
              <span className="mission-icon">🌍</span>
              <h3>Global Reach</h3>
              <p>We ship worldwide with fast and reliable delivery to your doorstep.</p>
            </div>
          </div>
        </section>

        <section className="values-section">
          <h2>Why Choose Sri Vinayaga Hardwares?</h2>
          <div className="values-list">
            <div className="value-item">
              <h4>✓ Authentic Products</h4>
              <p>All products are 100% authentic and sourced from authorized distributors.</p>
            </div>
            <div className="value-item">
              <h4>✓ Competitive Pricing</h4>
              <p>We offer the best prices in the market with regular discounts and offers.</p>
            </div>
            <div className="value-item">
              <h4>✓ Expert Guidance</h4>
              <p>Our team of tech experts is always ready to help you choose the right product.</p>
            </div>
            <div className="value-item">
              <h4>✓ Secure Shopping</h4>
              <p>Your data is safe with our encrypted checkout and secure payment processing.</p>
            </div>
            <div className="value-item">
              <h4>✓ Fast Delivery</h4>
              <p>Free shipping on orders over $50 with real-time tracking.</p>
            </div>
            <div className="value-item">
              <h4>✓ Easy Returns</h4>
              <p>30-day money-back guarantee on all products, no questions asked.</p>
            </div>
          </div>
        </section>

        <section className="team-section">
          <h2>Our Team</h2>
          <p className="section-intro">We are a passionate crew of electrical specialists focused on safe installs and a smooth shopping experience.</p>
          <div className="team-grid">
            <div className="team-member">
              <div className="member-avatar">👨‍💻</div>
              <h4>Thozhamairaj</h4>
              <p>Backend Developer</p>
            </div>
            <div className="team-member">
              <div className="member-avatar">🧑‍💻</div>
              <h4>Premkumar</h4>
              <p>Frontend Developer</p>
            </div>
            <div className="team-member">
              <div className="member-avatar">👩‍💻</div>
              <h4>Subbulakshmi</h4>
              <p>Database Administrator</p>
            </div>
          </div>
        </section>

        <section className="stats-section">
          <div className="stat">
            <h3>10K+</h3>
            <p>Happy Customers</p>
          </div>
          <div className="stat">
            <h3>5K+</h3>
            <p>Products</p>
          </div>
          <div className="stat">
            <h3>50+</h3>
            <p>Brands</p>
          </div>
          <div className="stat">
            <h3>4.8★</h3>
            <p>Average Rating</p>
          </div>
        </section>
      </div>
    </div>
  );
}

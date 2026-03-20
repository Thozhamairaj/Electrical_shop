import './Footer.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>Sri Vinayaga Electricals & Hardwares</h3>
          <p>Your one-stop shop for premium electrical fittings, lighting, and hardware essentials. Quality, reliability, and innovation.</p>
        </div>
        
        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/products">Products</a></li>
            <li><a href="/about">About Us</a></li>
            <li><a href="/contact">Contact Us</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Customer Service</h3>
          <ul>
            <li><a href="#shipping">Shipping Info</a></li>
            <li><a href="#returns">Returns</a></li>
            <li><a href="#faq">FAQ</a></li>
            <li><a href="#support">Support</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Connect With Us</h3>
          <div className="social-links">
            <a href="#facebook" title="Facebook">f</a>
            <a href="#twitter" title="Twitter">𝕏</a>
            <a href="#instagram" title="Instagram">📷</a>
            <a href="#linkedin" title="LinkedIn">in</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {currentYear} Sri Vinayaga Electricals & Hardwares. All rights reserved. | Privacy Policy | Terms of Service</p>
      </div>
    </footer>
  );
}

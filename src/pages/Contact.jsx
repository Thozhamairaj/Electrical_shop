import { useState } from 'react';
import './Contact.css';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    });
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="contact-page">
      <div className="contact-hero">
        <h1>Contact Us</h1>
        <p>We'd love to hear from you. Get in touch with our team.</p>
      </div>

      <div className="contact-container">
        <div className="contact-info">
          <h2>Get In Touch</h2>
          
          <div className="info-cards">
            <div className="info-card">
              <span className="info-icon">📍</span>
              <h3>Address</h3>
              <p>123 Tech Street<br />Silicon Valley, CA 94025<br />United States</p>
            </div>

            <div className="info-card">
              <span className="info-icon">📞</span>
              <h3>Phone</h3>
              <p>+1 (555) 123-4567<br />+1 (555) 987-6543<br />Available 24/7</p>
            </div>

            <div className="info-card">
              <span className="info-icon">✉️</span>
              <h3>Email</h3>
              <p>support@electrohub.com<br />sales@electrohub.com<br />info@electrohub.com</p>
            </div>

            <div className="info-card">
              <span className="info-icon">⏰</span>
              <h3>Business Hours</h3>
              <p>Monday - Friday: 9am - 9pm<br />Saturday - Sunday: 10am - 6pm<br />Holidays: 10am - 4pm</p>
            </div>
          </div>

          <div className="social-section">
            <h3>Follow Us</h3>
            <div className="social-icons">
              <a href="#facebook" className="social-link">f</a>
              <a href="#twitter" className="social-link">𝕏</a>
              <a href="#instagram" className="social-link">📷</a>
              <a href="#linkedin" className="social-link">in</a>
              <a href="#youtube" className="social-link">▶</a>
            </div>
          </div>
        </div>

        <div className="contact-form-container">
          <h2>Send us a Message</h2>
          {submitted && (
            <div className="success-message">
              ✓ Thank you! Your message has been sent successfully. We'll get back to you soon.
            </div>
          )}
          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Your name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="your@email.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <div className="form-group">
              <label htmlFor="subject">Subject *</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                placeholder="How can we help?"
              />
            </div>

            <div className="form-group">
              <label htmlFor="message">Message *</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows="6"
                placeholder="Tell us more about your inquiry..."
              ></textarea>
            </div>

            <button type="submit" className="submit-btn">Send Message</button>
          </form>
        </div>
      </div>

      <div className="faq-section">
        <div className="faq-container">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-grid">
            <div className="faq-item">
              <h4>What are your shipping times?</h4>
              <p>Standard shipping typically takes 5-7 business days. Express shipping is available for 2-3 business days delivery.</p>
            </div>
            <div className="faq-item">
              <h4>Do you offer international shipping?</h4>
              <p>Yes! We ship to over 100 countries worldwide. International shipping times vary by location.</p>
            </div>
            <div className="faq-item">
              <h4>What is your return policy?</h4>
              <p>We offer a 30-day money-back guarantee on all products. Simply contact us for a return authorization.</p>
            </div>
            <div className="faq-item">
              <h4>Do you have a physical store?</h4>
              <p>We primarily operate online, but you can visit our showroom by appointment in Silicon Valley.</p>
            </div>
            <div className="faq-item">
              <h4>How can I track my order?</h4>
              <p>Once your order ships, you'll receive a tracking link via email that you can use to monitor delivery.</p>
            </div>
            <div className="faq-item">
              <h4>What payment methods do you accept?</h4>
              <p>We accept all major credit cards, PayPal, Apple Pay, Google Pay, and other digital payment methods.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

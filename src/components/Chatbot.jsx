import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Chatbot.css';

const INITIAL_MESSAGES = [
  { id: 1, type: 'bot', text: 'Hello, welcome to Electrical Bazar! People who know quality best!' },
  { id: 2, type: 'bot', text: 'What would you like to know about?' }
];

const QUICK_ACTIONS = [
  { label: 'About Us', action: 'about' },
  { label: 'Our Products', action: 'products' },
  { label: 'Get in Touch', action: 'contact' },
  { label: 'Latest Offers', action: 'offers' }
];

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      startChat();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const startChat = async () => {
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setMessages([INITIAL_MESSAGES[0]]);
    setIsTyping(false);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setMessages(prev => [...prev, INITIAL_MESSAGES[1]]);
    setIsTyping(false);
  };

  const handleAction = async (action) => {
    const selected = QUICK_ACTIONS.find(a => a.action === action);
    setMessages(prev => [...prev, { id: Date.now(), type: 'user', text: selected.label }]);

    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsTyping(false);

    switch (action) {
      case 'about':
        setMessages(prev => [...prev, { id: Date.now() + 1, type: 'bot', text: 'We are a leading provider of electrical and plumbing solutions with over 20 years of excellence.' }]);
        setTimeout(() => navigate('/about'), 2000);
        break;
      case 'products':
        setMessages(prev => [...prev, { id: Date.now() + 1, type: 'bot', text: 'Sure! Let me take you to our full catalog of 160+ products.' }]);
        setTimeout(() => navigate('/products'), 2000);
        break;
      case 'contact':
        setMessages(prev => [...prev, { id: Date.now() + 1, type: 'bot', text: 'You can reach us directly via WhatsApp or our contact page for bulk inquiries.' }]);
        setTimeout(() => navigate('/contact'), 2000);
        break;
      case 'offers':
        setMessages(prev => [...prev, { id: Date.now() + 1, type: 'bot', text: 'Most of our products currently have a discount of up to 40%. Check our Lighting section for the best deals!' }]);
        setTimeout(() => navigate('/products?category=lighting'), 2000);
        break;
      default:
        break;
    }
  };

  return (
    <div className={`chatbot-container ${isOpen ? 'open' : ''}`}>
      {!isOpen && (
        <button className="chat-trigger" onClick={() => setIsOpen(true)}>
          <img src="/supa-avatar.png" alt="Supa" className="trigger-avatar" />
          <span className="trigger-pulse"></span>
        </button>
      )}

      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="header-info">
              <div className="avatar-wrapper">
                <img src="/supa-avatar.png" alt="Supa" className="chat-avatar" />
                <span className="online-indicator"></span>
              </div>
              <div className="header-text">
                <h3>Supa</h3>
                <span>Online</span>
              </div>
            </div>
            <button className="close-btn" onClick={() => setIsOpen(false)}>&times;</button>
          </div>

          <div className="chat-body">
            <div className="messages-list">
              {messages.map(msg => (
                <div key={msg.id} className={`message-bubble ${msg.type}`}>
                  {msg.type === 'bot' && (
                    <img src="/supa-avatar.png" alt="Supa" className="bubble-avatar" />
                  )}
                  <div className="message-content">{msg.text}</div>
                </div>
              ))}
              {isTyping && (
                <div className="message-bubble bot typing">
                  <img src="/supa-avatar.png" alt="Supa" className="bubble-avatar" />
                  <div className="typing-dots">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {messages.length >= 2 && !isTyping && (
              <div className="quick-actions">
                {QUICK_ACTIONS.map(qa => (
                  <button 
                    key={qa.action} 
                    className="action-btn"
                    onClick={() => handleAction(qa.action)}
                  >
                    {qa.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

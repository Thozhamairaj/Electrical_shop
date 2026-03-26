import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Chatbot.css';

const INITIAL_MESSAGES = [
  { id: 1, type: 'bot', text: 'Hi! I\'m Supa 👋 Your Supreme Assistant. Ask me anything about our shop, products, or services!' },
];

// Knowledge base for answering user questions
function getBotResponse(text) {
  const q = text.toLowerCase().trim();

  // Greetings
  if (/^(hi|hello|hey|good morning|good evening|namaste|hii|helo)/.test(q)) {
    return "Hello! Welcome to Supreme Electrical & Plumbing Shop 👋 How can I help you today?";
  }

  // Fan / regulator / controller
  if (q.includes('fan regulator') || q.includes('speed controller') || q.includes('speed regulator') || q.includes('dimmer')) {
    return "Yes! We carry Fan Regulators, Fan Speed Dimmers, and 2-Step Fan Regulators. Find them in the **Fans & Ventilation** section. 🌀";
  }
  if (q.includes('fan') || q.includes('ceiling fan') || q.includes('exhaust') || q.includes('table fan') || q.includes('bldc')) {
    return "We stock Ceiling Fans, BLDC Fans, Table Fans, Exhaust Fans, and Snow White Ceiling Fans — all energy-efficient. 🌀 Browse the **Fans & Ventilation** category!";
  }

  // Lighting
  if (q.includes('light') || q.includes('led') || q.includes('bulb') || q.includes('lamp') || q.includes('downlight') || q.includes('strip light')) {
    return "Our **Lighting** section has 36+ products — LED bulbs, downlights, strip lights, panel lights, and designer fans with lights. 💡 Starting from just ₹90!";
  }

  // Switches
  if (q.includes('switch') || q.includes('modular') || q.includes('socket') || q.includes('arteor') || q.includes('murphy') || q.includes('marvel') || q.includes('panel')) {
    return "We carry 28+ switch products — 1-way, 2-way, curtain switches, doorbell switches, and premium modular series like Arteor, Murphy, Marvel & more! 🔘";
  }

  // Pipes & fittings
  if (q.includes('pipe') || q.includes('fitting') || q.includes('elbow') || q.includes('tee') || q.includes('coupler') || q.includes('valve') || q.includes('pvc')) {
    return "Our **Pipes & Fittings** category has 52 products — PVC pipes, elbows, tees, ball valves, flanges, reducers, UPVC tubes & more. 🔩 Perfect for all plumbing needs!";
  }

  // Pumps
  if (q.includes('pump') || q.includes('motor') || q.includes('borewell') || q.includes('submersible') || q.includes('centrifugal')) {
    return "We have 5 water pump options — Borewell Submersible, Centrifugal, Domestic, and Industrial pumps. 💧 Visit **Pumps & Motors** for details!";
  }

  // Tanks
  if (q.includes('tank') || q.includes('water tank') || q.includes('storage tank')) {
    return "Our **Water Tanks** section has 7 products including plastic overhead and underground storage tanks. 🛢️ Durable and ISI certified!";
  }

  // Bathroom
  if (q.includes('bathroom') || q.includes('faucet') || q.includes('tap') || q.includes('shower') || q.includes('flush') || q.includes('diverter') || q.includes('health faucet')) {
    return "We have 9 bathroom fitting products — faucets, health faucets, hand showers, flush tanks, diverters & more! 🚿 Browse **Bathroom Fittings**.";
  }

  // Safety
  if (q.includes('safety') || q.includes('helmet') || q.includes('glove') || q.includes('protection') || q.includes('ppe')) {
    return "Stay safe with our 7 Safety & Protection products — safety helmets, electrical gloves, and protective gear. ⚡ Safety first!";
  }

  // Outdoor
  if (q.includes('outdoor') || q.includes('spot light') || q.includes('garden light') || q.includes('exterior')) {
    return "Check out our **Outdoor Lighting** range — weather-resistant spot lights and garden lights for exterior use. 🏡";
  }

  // Wiring / cables
  if (q.includes('wire') || q.includes('cable') || q.includes('wiring') || q.includes('junction') || q.includes('fr grade') || q.includes('conduit')) {
    return "Our **Wiring & Cables** section has FR-grade cables, PVC electrical fittings, and junction boxes. 🔌 All ISI certified!";
  }

  // Power / inverter / battery / water heater / geyser
  if (q.includes('inverter') || q.includes('battery') || q.includes('ups') || q.includes('power backup') || q.includes('luminous') || q.includes('microtek')) {
    return "We carry 17 power backup products — Microtek & Luminous inverters, batteries, UPS systems. 🔋 Keep the power on!";
  }
  if (q.includes('geyser') || q.includes('water heater') || q.includes('heater')) {
    return "We have V-Guard and Instant Water Heaters — electric storage & instant models available! 🔥 Found in the **Power** section.";
  }

  // Price / cost / rate
  if (q.includes('price') || q.includes('cost') || q.includes('rate') || q.includes('how much') || q.includes('cheap') || q.includes('affordable') || q.includes('offer') || q.includes('discount')) {
    return "Our products start from ₹80 and go up to ₹6,000+. Most categories have discounts of 15–40%! 🏷️ Use the price slider on the Products page to filter by budget.";
  }

  // Delivery / shipping
  if (q.includes('deliver') || q.includes('shipping') || q.includes('dispatch') || q.includes('courier')) {
    return "We offer free delivery on prepaid orders above ₹999. For bulk/trade orders, contact us via WhatsApp for special rates! 🚚";
  }

  // WhatsApp / contact / order
  if (q.includes('whatsapp') || q.includes('contact') || q.includes('order') || q.includes('call') || q.includes('phone') || q.includes('reach')) {
    return "You can reach us via WhatsApp for bulk orders or quick inquiries. Visit our **Contact** page for details! 📞";
  }

  // About / who are you
  if (q.includes('about') || q.includes('who are') || q.includes('company') || q.includes('supreme') || q.includes('svh')) {
    return "Supreme Electrical & Plumbing Shop is a trusted provider of electrical, lighting, plumbing, and bathroom solutions. We carry 180+ quality products, all ISI certified. 🏪";
  }

  // Total products / catalog
  if (q.includes('how many product') || q.includes('total product') || q.includes('catalog') || q.includes('collection')) {
    return "We have 180+ products across 11 categories — lighting, fans, switches, pipes, pumps, bathroom fittings, power backup, safety gear & more! 🛒";
  }

  // Categories
  if (q.includes('categor') || q.includes('section') || q.includes('department') || q.includes('type')) {
    return "We have 11 categories: 💡 Lighting, 🌀 Fans, 🔘 Switches, 🔌 Wiring, 🔩 Pipes, 💧 Pumps, 🛢️ Water Tanks, 🚿 Bathroom, ⚡ Safety, 🏡 Outdoor & 🔋 Power Backup.";
  }

  // Warranty / guarantee
  if (q.includes('warrant') || q.includes('guarantee') || q.includes('quality')) {
    return "All our products come with a 1-year warranty and are ISI certified for quality and safety. ✅";
  }

  // Returns / refund
  if (q.includes('return') || q.includes('refund') || q.includes('exchange')) {
    return "For returns or exchanges, please contact us via WhatsApp or the Contact page within 7 days of delivery. 📦";
  }

  // Payment
  if (q.includes('payment') || q.includes('pay') || q.includes('razorpay') || q.includes('upi') || q.includes('card') || q.includes('cod')) {
    return "We accept online payments via Razorpay (UPI, cards, net banking). You can also place orders via WhatsApp! 💳";
  }

  // Thanks / bye
  if (/^(thank|thanks|bye|ok|okay|great|awesome|perfect|got it|noted)/.test(q)) {
    return "Happy to help! 😊 Feel free to ask anything else. Visit our Products page to start shopping!";
  }

  // Default fallback
  return `Thanks for your question! For specific queries, please visit our **Products** page or contact us via WhatsApp. You can also browse by category on the home page. 😊`;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
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

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const startChat = async () => {
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 700));
    setMessages([INITIAL_MESSAGES[0]]);
    setIsTyping(false);
  };

  const addBotReply = async (text, navTo) => {
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 900));
    setIsTyping(false);
    setMessages(prev => [...prev, { id: Date.now() + 1, type: 'bot', text }]);
    if (navTo) setTimeout(() => navigate(navTo), 2000);
  };

  const handleSend = async (text) => {
    const trimmed = (text || inputText).trim();
    if (!trimmed || isTyping) return;
    setInputText('');
    // Add user message
    setMessages(prev => [...prev, { id: Date.now(), type: 'user', text: trimmed }]);

    // Check quick-nav triggers
    const q = trimmed.toLowerCase();
    if (/\b(contact|whatsapp|reach us|call)\b/.test(q) && q.length < 30) {
      await addBotReply("Sure! Let me take you to our Contact page. 📞", '/contact');
    } else if (/\bproducts?\b/.test(q) && q.length < 20) {
      await addBotReply("Here's our full catalog of 180+ products! 🛒", '/products');
    } else if (/\babout\b/.test(q) && q.length < 20) {
      await addBotReply("Taking you to our About page! 🏪", '/about');
    } else {
      const response = getBotResponse(trimmed);
      await addBotReply(response);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const QUICK_ACTIONS = [
    { label: '💡 Lighting', text: 'Tell me about lighting products' },
    { label: '🌀 Fans', text: 'What ceiling fans and regulators do you have?' },
    { label: '🔩 Pipes', text: 'What pipes and fittings are available?' },
    { label: '🚚 Delivery', text: 'What are the delivery charges?' },
  ];

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
                <span>AI Assistant · Online</span>
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

            {/* Quick action chips */}
            {messages.length >= 1 && !isTyping && (
              <div className="quick-actions">
                {QUICK_ACTIONS.map(qa => (
                  <button
                    key={qa.label}
                    className="action-btn"
                    onClick={() => handleSend(qa.text)}
                  >
                    {qa.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Text input area */}
          <div className="chat-input-area">
            <input
              ref={inputRef}
              type="text"
              className="chat-input"
              placeholder="Ask me anything..."
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isTyping}
            />
            <button
              className={`send-btn ${inputText.trim() ? 'active' : ''}`}
              onClick={() => handleSend()}
              disabled={!inputText.trim() || isTyping}
              aria-label="Send message"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

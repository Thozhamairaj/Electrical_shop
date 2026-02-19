import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import './HeroCarousel.css';

const slides = [
    {
        id: 1,
        tag: 'LIMITED TIME DEAL',
        title: 'Smart LED Lighting',
        subtitle: 'Up to 40% OFF on all LED panels, bulbs & tube lights',
        cta: 'Shop Lighting',
        link: '/products?category=lighting',
        accent: '#ff5722',
        bg: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #ff5722 100%)',
        icon: '💡',
        badge: '40% OFF',
    },
    {
        id: 2,
        tag: 'BESTSELLER',
        title: 'BLDC Energy Saver Fans',
        subtitle: 'Save up to 65% electricity — remote controlled, whisper quiet',
        cta: 'Shop Fans',
        link: '/products?category=fans',
        accent: '#06b6d4',
        bg: 'linear-gradient(135deg, #0c1a3a 0%, #0e3a5a 60%, #06b6d4 100%)',
        icon: '🌀',
        badge: '65% Energy Savings',
    },
    {
        id: 3,
        tag: 'HOME SAFETY',
        title: 'MCBs, RCCBs & Distribution Boards',
        subtitle: 'Protect your home wiring with certified safety equipment',
        cta: 'Shop Safety',
        link: '/products?category=safety',
        accent: '#f59e0b',
        bg: 'linear-gradient(135deg, #1a1000 0%, #2d1f00 60%, #f59e0b 100%)',
        icon: '⚡',
        badge: 'IS/IEC Certified',
    },
    {
        id: 4,
        tag: 'FREE DELIVERY',
        title: 'Wiring & Cable Solutions',
        subtitle: 'FR-PVC copper wire, junction boxes, cable ties — all in one place',
        cta: 'Shop Wiring',
        link: '/products?category=wiring',
        accent: '#10b981',
        bg: 'linear-gradient(135deg, #001a0f 0%, #003320 60%, #10b981 100%)',
        icon: '🔌',
        badge: 'Free on ₹999+',
    },
    {
        id: 5,
        tag: 'NEW ARRIVALS',
        title: 'Power Backup Solutions',
        subtitle: 'Pure sine wave inverters & voltage stabilizers for uninterrupted power',
        cta: 'Shop Power Backup',
        link: '/products?category=power',
        accent: '#8b5cf6',
        bg: 'linear-gradient(135deg, #0d001a 0%, #1e0035 60%, #8b5cf6 100%)',
        icon: '🔋',
        badge: 'Up to 5 hrs Backup',
    },
    {
        id: 6,
        tag: 'PLUMBING SOLUTIONS',
        title: 'Pipes, Tanks & Pumps',
        subtitle: 'CPVC pipes, triple-layer tanks, borewell pumps & bathroom fittings — all brands',
        cta: 'Shop Plumbing',
        link: '/products?category=pipes',
        accent: '#0891b2',
        bg: 'linear-gradient(135deg, #001820 0%, #003040 60%, #0891b2 100%)',
        icon: '🔩',
        badge: '10-Year Warranty',
    },
];

export default function HeroCarousel() {
    const [current, setCurrent] = useState(0);
    const [paused, setPaused] = useState(false);

    const next = useCallback(() => setCurrent(c => (c + 1) % slides.length), []);
    const prev = () => setCurrent(c => (c - 1 + slides.length) % slides.length);

    useEffect(() => {
        if (paused) return;
        const timer = setInterval(next, 4500);
        return () => clearInterval(timer);
    }, [paused, next]);

    const slide = slides[current];

    return (
        <div
            className="hero-carousel"
            style={{ background: slide.bg }}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            {/* Slides */}
            {slides.map((s, i) => (
                <div
                    key={s.id}
                    className={`carousel-slide ${i === current ? 'active' : i === (current - 1 + slides.length) % slides.length ? 'prev' : ''}`}
                >
                    <div className="slide-content">
                        {/* Left: Text */}
                        <div className="slide-text">
                            <span className="slide-tag" style={{ color: s.accent }}>{s.tag}</span>
                            <h1 className="slide-title">{s.title}</h1>
                            <p className="slide-subtitle">{s.subtitle}</p>
                            <div className="slide-actions">
                                <Link to={s.link} className="slide-cta" style={{ background: s.accent }}>
                                    {s.cta} →
                                </Link>
                                <span className="slide-badge">{s.badge}</span>
                            </div>
                        </div>

                        {/* Right: Visual */}
                        <div className="slide-visual">
                            <div className="slide-icon-wrap" style={{ boxShadow: `0 0 80px ${s.accent}55` }}>
                                <span className="slide-icon">{s.icon}</span>
                            </div>
                            {/* Floating orbs */}
                            <div className="orb orb1" style={{ background: s.accent }} />
                            <div className="orb orb2" style={{ background: s.accent }} />
                            <div className="orb orb3" style={{ background: s.accent }} />
                        </div>
                    </div>
                </div>
            ))}

            {/* Arrows */}
            <button className="carousel-arrow left" onClick={prev} aria-label="Previous slide">‹</button>
            <button className="carousel-arrow right" onClick={next} aria-label="Next slide">›</button>

            {/* Dot indicators */}
            <div className="carousel-dots">
                {slides.map((_, i) => (
                    <button
                        key={i}
                        className={`dot ${i === current ? 'active' : ''}`}
                        style={i === current ? { background: slide.accent } : {}}
                        onClick={() => setCurrent(i)}
                        aria-label={`Go to slide ${i + 1}`}
                    />
                ))}
            </div>

            {/* Progress bar */}
            <div className="carousel-progress">
                <div
                    key={current}
                    className="progress-bar"
                    style={{ '--accent': slide.accent }}
                />
            </div>
        </div>
    );
}

import React, { useEffect, useState, useRef } from 'react';
import './LandingPage.css';

const LandingPage = () => {
  const [demoChosen, setDemoChosen] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  
  // Refs for Cursor
  const curRef = useRef<HTMLDivElement | null>(null);
  const curRRef = useRef<HTMLDivElement | null>(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const ringPos = useRef({ x: 0, y: 0 });

  // Refs for Hero Animation
  const [liveCount, setLiveCount] = useState(0);
  const [bars, setBars] = useState([0, 0, 0]);

  useEffect(() => {
    // 1. Custom Cursor Animation
    const moveCursor = (e: globalThis.MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };

    const animLoop = () => {
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * 0.15;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * 0.15;

      if (curRef.current) {
        curRef.current.style.left = `${mousePos.current.x}px`;
        curRef.current.style.top = `${mousePos.current.y}px`;
      }
      if (curRRef.current) {
        curRRef.current.style.left = `${ringPos.current.x}px`;
        curRRef.current.style.top = `${ringPos.current.y}px`;
      }
      requestAnimationFrame(animLoop);
    };

    window.addEventListener('mousemove', moveCursor);
    const frameId = requestAnimationFrame(animLoop);

    // 2. Intersection Observer for Scroll Reveals
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.15 });

    const animatedEls = document.querySelectorAll('.feature-cell, .how-step, .how-right h2, .how-right p, .stat-cell, .cta-section h2, .cta-section p, .cta-btns');
    animatedEls.forEach(el => observer.observe(el));

    // 3. Hero Stats Counter Animation
    const timer = setTimeout(() => {
      let c = 0;
      const interval = setInterval(() => {
        c++;
        setLiveCount(c);
        setBars([
          Math.round(57 * Math.min(c / 100, 1)),
          Math.round(23 * Math.min(c / 100, 1)),
          Math.round(20 * Math.min(c / 100, 1))
        ]);
        if (c >= 100) clearInterval(interval);
      }, 18);
    }, 1200);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      cancelAnimationFrame(frameId);
      observer.disconnect();
      clearTimeout(timer);
    };
  }, []);

  const handleDemoSubmit = () => {
    if (!demoChosen) setDemoChosen("Low response rates");
    setIsSubmitted(true);
  };

  return (
    <div className="landing-body">
      <div className="noise-overlay" />
      <div className="cursor" ref={curRef}></div>
      <div className="cursor-ring" ref={curRRef}></div>

      <nav>
        <div className="nav-logo">
          <div className="logo-dot"></div>
          PulseBoard
        </div>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#how">How it works</a>
          <a href="#demo">Try it</a>
        </div>
        <a href="/sign-in" className="nav-cta">Get started →</a>
      </nav>

      {/* HERO SECTION */}
      <section className="hero">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="hero-tag">
          <div className="logo-dot" style={{ width: '6px', height: '6px' }}></div>
          Live feedback, instantly
        </div>
        <h1>Polls that<br /><em>pulse</em> in<br />real time.</h1>
        <p className="hero-sub">Create, share, and collect feedback — watch responses roll in live as they happen.</p>
        
        <div className="hero-actions">
          <a href="/sign-in" className="btn-primary">
            Start for free
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          <a href="#demo" className="btn-ghost">Try the demo ↓</a>
        </div>

        <div className="hero-visual">
          <div className="mock-card">
            <div className="mock-header">
              <div className="mock-dot" style={{ background: '#FF5F57' }}></div>
              <div className="mock-dot" style={{ background: '#FFBD2E' }}></div>
              <div className="mock-dot" style={{ background: '#28CA41' }}></div>
            </div>
            <div className="mock-body">
              <div className="mock-title">Team Lunch Preference</div>
              <div className="mock-sub">4 questions · Expires in 2h 14m</div>
              <div className="mock-option selected">
                Italian
                <div style={{ display: 'flex', alignItems: 'center', flex: 1, marginLeft: '12px' }}>
                  <div className="mock-bar-wrap"><div className="mock-bar" style={{ width: `${bars[0]}%` }}></div></div>
                  <span className="mock-pct">{bars[0]}%</span>
                </div>
              </div>
              <div className="mock-stat">
                <div>
                  <div className="mock-stat-num">{liveCount}</div>
                  <div className="mock-stat-label">responses</div>
                </div>
                <div className="live-badge">
                  <span className="live-pulse"></span> Live
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TICKER */}
      <div className="ticker-wrap">
        <div className="ticker">
          {Array(2).fill(["Create Polls", "Share Links", "Live Analytics"]).flat().map((text, i) => (
            <React.Fragment key={i}>
              <span>{text}</span><span className="accent">——</span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* DEMO POLL SECTION */}
      <section style={{ padding: '120px 48px' }} id="demo">
        <div className="demo-wrap">
          <div className="demo-card">
            <div className="demo-q">What's your biggest challenge when collecting feedback?</div>
            
            {!isSubmitted ? (
              <div className="demo-opts-wrap">
                {["Low response rates", "Messy data", "Too slow", "Hard to share"].map(opt => (
                  <div 
                    key={opt}
                    className={`demo-opt ${demoChosen === opt ? 'chosen' : ''}`} 
                    onClick={() => setDemoChosen(opt)}
                  >
                    {opt}
                  </div>
                ))}
                <button className="demo-submit" onClick={handleDemoSubmit}>Submit response →</button>
              </div>
            ) : (
              <div className="demo-submitted show">
                <div className="demo-emoji">🎉</div>
                <div className="demo-thanks">Response recorded!</div>
                <div className="demo-retake" onClick={() => setIsSubmitted(false)}>Try again</div>
              </div>
            )}
          </div>
        </div>
      </section>

      <footer>
        <div className="nav-logo"><div className="logo-dot"></div>PulseBoard</div>
        <p>Built for the PulseBoard Hackathon 2026.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
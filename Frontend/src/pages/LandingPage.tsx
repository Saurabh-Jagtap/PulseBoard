import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";
import { useAuth } from "@clerk/react";
import { useTheme } from "../hooks/useTheme";
import { LiveDashboardPreview } from "../components/landing/LiveDashboardPreview";
import { fadeUp, stagger } from "../components/landing/motion";
import { AnimatedNum } from "../components/landing/AnimatedNum";
import { BarFill } from "../components/landing/BarFill";
import { TICKER_ITEMS, FEATURES, STEPS, INITIAL_MOCK } from "../constants/landing.constants";
import { clamp, randomBetween } from "../utils/landing.utils";

import type {
  MockData,
  TabId,
} from "../types/landing.types";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();

  // Theme
  const { theme, setThemeMode } = useTheme();

  // Cursor
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const mx = useRef(0);
  const my = useRef(0);
  const rx = useRef(0);
  const ry = useRef(0);
  const rafRef = useRef<number>(0);

  // Active tab in mock dashboard
  const [activeTab, setActiveTab] = useState<TabId>("polls");

  // Mock live data
  const [mockData, setMockData] = useState<MockData>(INITIAL_MOCK);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mx.current = e.clientX;
      my.current = e.clientY;
    };

    // Track hover state via DOM directly — no setState, no re-renders
    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isHoverable = target.closest("a, button, [data-hover]");
      cursorRef.current?.classList.toggle("lp-cursor--hover", !!isHoverable);
      ringRef.current?.classList.toggle("lp-cursor--hover", !!isHoverable);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onMouseOver);

    const animate = () => {
      rx.current += (mx.current - rx.current) * 0.12;
      ry.current += (my.current - ry.current) * 0.12;
      if (cursorRef.current) {
        cursorRef.current.style.left = `${mx.current}px`;
        cursorRef.current.style.top = `${my.current}px`;
      }
      if (ringRef.current) {
        ringRef.current.style.left = `${rx.current}px`;
        ringRef.current.style.top = `${ry.current}px`;
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onMouseOver);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // ── Mock data simulation loop ────────────────────────────────────────────
  useEffect(() => {
    const tick = () => {
      setMockData((prev) => {
        const updatedPolls = prev.polls.map((poll) => {
          const newResponses = poll.responses + randomBetween(0, 3);
          const delta = randomBetween(-8, 8);
          const rawOpts = poll.options.map((o, i) =>
            i === 0 ? { ...o, pct: clamp(o.pct + delta, 5, 85) } : o
          );
          const total = rawOpts.reduce((s, o) => s + o.pct, 0);
          const norm = rawOpts.map((o) => ({ ...o, pct: Math.round((o.pct / total) * 100) }));
          return { ...poll, responses: newResponses, options: norm };
        });

        const updatedBars = prev.analytics.map((b) => ({
          ...b,
          value: clamp(b.value + randomBetween(-6, 10), 5, 100),
        }));

        return {
          polls: updatedPolls,
          analytics: updatedBars,
          totalResponses: prev.totalResponses + randomBetween(0, 4),
          activeUsers: clamp(prev.activeUsers + randomBetween(-2, 3), 5, 50),
          completionRate: clamp(prev.completionRate + randomBetween(-2, 2), 60, 99),
        };
      });
    };

    const scheduleNext = () => {
      const delay = randomBetween(2500, 4000);
      return setTimeout(() => { tick(); scheduleNext(); }, delay);
    };

    const id = scheduleNext();
    return () => clearTimeout(id);
  }, []);

  // ── Theme slider position ────────────────────────────────────────────────
  const sliderLeft = theme === "light" ? "4px" : "calc(50% + 2px)";
  const sliderWidth = theme === "light" ? "calc(50% - 6px)" : "calc(50% - 6px)";

  const maxBarValue = Math.max(...mockData.analytics.map((b) => b.value));

  return (
    <div
      className="lp-root"
      data-theme={theme}
    >
      {/* Background layers */}
      <div className="lp-bg-grid" />
      <div className="lp-bg-noise" />

      {/* Custom cursor */}
      <div
        ref={cursorRef}
        className={`lp-cursor`}
      />
      <div
        ref={ringRef}
        className={`lp-cursor-ring`}
      />

      {/* ── NAVIGATION ── */}
      <motion.nav
        className="lp-nav"
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <a className="lp-logo" href="/" >
          <span className="lp-logo-dot" />
          PulseBoard
        </a>

        <div className="lp-nav-center">
          <a className="lp-nav-link" href="#features" >Features</a>
          <a className="lp-nav-link" href="#dashboard" >Preview</a>
          <a className="lp-nav-link" href="#how" >How it works</a>
        </div>

        <div className="lp-nav-right">
          {/* ── Premium theme toggle ── */}
          <motion.div
            className="lp-theme-toggle"
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}

          >
            <motion.div
              className="lp-theme-slider"
              animate={{ left: sliderLeft, width: sliderWidth }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
            />
            <button
              className={`lp-theme-btn${theme === "light" ? " active" : ""}`}
              onClick={() => setThemeMode("light")}
            >
              ☀ Light
            </button>
            <button
              className={`lp-theme-btn${theme === "dark" ? " active" : ""}`}
              onClick={() => setThemeMode("dark")}
            >
              ◆ Dark
            </button>
          </motion.div>

          <motion.button
            className="lp-btn-primary"
            onClick={() => navigate(isSignedIn ? "/dashboard" : "/sign-in")}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}

          >
            {isSignedIn ? "Dashboard" : "Get Started"}
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.button>
        </div>
      </motion.nav>

      {/* ── HERO ── */}
      <section className="lp-hero" id="hero">
        <div className="lp-hero-left">
          <motion.div
            className="lp-hero-tag"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.55 }}
          >
            <span className="lp-hero-tag-dot" />
            Live feedback, instantly
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          >
            Polls that<br /><em>pulse</em><br />in real time.
          </motion.h1>

          <motion.p
            className="lp-hero-sub"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            Create, share, and collect feedback, watch responses roll in live as they happen.
            No refresh. No waiting. Pure signal.
          </motion.p>

          <motion.div
            className="lp-hero-actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.55 }}
          >
            <motion.button
              className="lp-btn-primary"
              onClick={() => navigate(isSignedIn ? "/dashboard" : "/sign-in")}
              whileHover={{ y: -2, boxShadow: "0 12px 40px color-mix(in srgb, var(--accent) 40%, transparent)" }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}

            >
              Start for free
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5"
                  strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.button>
            <motion.a
              className="lp-btn-ghost"
              href="#dashboard"
              whileHover={{ x: 3 }}
              transition={{ type: "spring", stiffness: 400 }}

            >
              See it live ↓
            </motion.a>
          </motion.div>
        </div>

        {/* Hero visual — small floating mock card */}
        <motion.div
          className="lp-hero-right"
          initial={{ opacity: 0, x: 48 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.75, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            whileInView={{ y: [0, -10, 0] }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="lp-mock-dashboard" style={{ maxWidth: "100%", height: "auto" }}>
              <div className="lp-mock-topbar">
                <div className="lp-mock-traffic">
                  <div className="lp-mock-dot" style={{ background: "#FF5F57" }} />
                  <div className="lp-mock-dot" style={{ background: "#FFBD2E" }} />
                  <div className="lp-mock-dot" style={{ background: "#28CA41" }} />
                </div>
                <div className="lp-mock-url">pulseboard.app/analytics/backendArchitecture</div>
              </div>
              <div style={{ padding: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <div>
                    <div className="lp-mock-main-title">Is HTTP stateless?</div>
                    <div className="lp-stat-label" style={{ marginTop: "4px" }}>Expires in 15m</div>
                  </div>
                  <div className="lp-live-badge">
                    <span className="lp-live-pulse" />
                    <AnimatedNum value={mockData.polls[0]?.responses ?? 47} /> live
                  </div>
                </div>
                {mockData.polls[0]?.options.map((opt) => (
                  <div key={opt.label} className="lp-option-row">
                    <div className="lp-option-label">
                      <span>{opt.label}</span>
                      <span>{opt.pct}%</span>
                    </div>
                    <BarFill pct={opt.pct} />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── TICKER ── */}
      <div className="lp-ticker-wrap">
        <div className="lp-ticker">
          {TICKER_ITEMS.map((item, i) => (
            <span
              key={i}
              className={`lp-ticker-item${item === "——" ? " accent" : ""}`}
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section className="lp-section" id="features">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
        >
          <div className="lp-section-tag">
            <span className="lp-hero-tag-dot" />
            What you get
          </div>
          <h2 className="lp-section-h2">Built for real feedback,<br />not just data collection.</h2>
          <p className="lp-section-sub">
            PulseBoard is the only tool where your audience can respond and you can watch
            the results shift in real time all in one link.
          </p>
        </motion.div>

        <div className="lp-features-grid">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.num}
              className="lp-feature-cell"
              variants={stagger(i * 0.08)}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-40px" }}
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 300 }}

            >
              <div className="lp-feature-num">{f.num}</div>
              <div className="lp-feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── LIVE DASHBOARD PREVIEW ── */}
      <LiveDashboardPreview
        mockData={mockData}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        maxBarValue={maxBarValue}
      />

      {/* ── HOW IT WORKS ── */}
      <section className="lp-how-grid" id="how">
        <div className="lp-steps">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.n}
              className="lp-step"
              variants={stagger(i * 0.1)}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-30px" }}
            >
              <div className="lp-step-num">{step.n}</div>
              <div className="lp-step-text">
                <h4>{step.title}</h4>
                <p>{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
        >
          <div className="lp-section-tag">
            <span className="lp-hero-tag-dot" />
            The process
          </div>
          <h2 className="lp-section-h2">Four steps.<br />Real results.</h2>
          <p className="lp-section-sub" style={{ marginTop: 20 }}>
            PulseBoard cuts the friction out of collecting feedback.
            From question to insight in minutes, not days.
          </p>
        </motion.div>
      </section>

      {/* ── STATS ── */}
      <div className="lp-stats-section">
        {[
          { num: "<1", unit: "min", desc: "to create and share a poll" },
          { num: "0", unit: "ms*", desc: "perceived delay on live updates" },
          { num: "100", unit: "%", desc: "free to start, no card needed" },
        ].map((s, i) => (
          <motion.div
            key={i}
            className="lp-stat-cell"
            variants={stagger(i * 0.1)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            <div className="lp-stat-big">
              {s.num}<span className="lp-stat-accent">{s.unit}</span>
            </div>
            <div className="lp-stat-desc">{s.desc}</div>
          </motion.div>
        ))}
      </div>

      {/* ── CTA ── */}
      <section className="lp-cta">
        <div className="lp-cta-bg-text" aria-hidden>PULSE</div>

        <motion.h2
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          Ready to see your<br />feedback come alive?
        </motion.h2>

        <motion.p
          variants={stagger(0.1)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          Create your first poll in under a minute.
          Free forever for small teams.
        </motion.p>

        <motion.div
          className="lp-cta-btns"
          variants={stagger(0.2)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          <motion.button
            className="lp-btn-primary"
            onClick={() => navigate(isSignedIn ? "/dashboard" : "/sign-in")}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}

          >
            Create a free poll
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.button>
          <motion.a
            className="lp-btn-ghost"
            href="#dashboard"
            whileHover={{ x: 3 }}

          >
            See the preview ↑
          </motion.a>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="lp-footer">
        <a className="lp-logo" href="/" >
          <span className="lp-logo-dot" />
          PulseBoard
        </a>
        <p>Built for the PulseBoard Hackathon 2026.</p>
        <p>Real-time polls. Real results.</p>
      </footer>
    </div>
  );
};

export default LandingPage;

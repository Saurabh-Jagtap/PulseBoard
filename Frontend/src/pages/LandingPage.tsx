import React, {
  useState,
  useEffect,
  useRef,
} from "react";
import { motion, AnimatePresence, useScroll, useTransform, useSpring, LayoutGroup }
  from "framer-motion";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

// ─── Types ────────────────────────────────────────────────────────────────────

type Theme = "light" | "dark";
type TabId = "polls" | "analytics";

interface PollOption {
  label: string;
  pct: number;
}

interface MockPoll {
  id: string;
  title: string;
  responses: number;
  options: PollOption[];
}

interface AnalyticsBar {
  label: string;
  value: number;
}

interface MockData {
  polls: MockPoll[];
  analytics: AnalyticsBar[];
  totalResponses: number;
  activeUsers: number;
  completionRate: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TICKER_ITEMS = [
  "Create Polls", "——", "Share Links", "——",
  "Live Analytics", "——", "Real-time Updates", "——",
  "Anonymous Responses", "——", "Publish Results", "——",
  "Create Polls", "——", "Share Links", "——",
  "Live Analytics", "——", "Real-time Updates", "——",
  "Anonymous Responses", "——", "Publish Results", "——",
];

const FEATURES = [
  {
    num: "01",
    icon: "⚡",
    title: "Instant live updates",
    desc: "Watch your analytics update the moment someone submits. Powered by WebSockets — no polling, no refresh, just instant.",
  },
  {
    num: "02",
    icon: "🔒",
    title: "Anonymous or authenticated",
    desc: "Require sign-in for accountability, or let anyone respond anonymously. Bulletproof duplicate prevention either way.",
  },
  {
    num: "03",
    icon: "⏱",
    title: "Auto-expiring polls",
    desc: "Set a deadline and forget it. Polls close themselves automatically — respondents see a live countdown as it ticks down.",
  },
  {
    num: "04",
    icon: "📊",
    title: "Publish & share results",
    desc: "When you're ready, publish results with one click. The same link transforms into a beautiful public results page anyone can view.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Create your poll",
    desc: "Add questions, mark mandatory ones, choose anonymous or authenticated mode, set an expiry.",
  },
  {
    n: "02",
    title: "Share the link",
    desc: "One click copies the poll URL. Send it anywhere. No account needed to respond.",
  },
  {
    n: "03",
    title: "Watch responses arrive",
    desc: "Your analytics dashboard updates in real time. Charts animate, counts roll up live.",
  },
  {
    n: "04",
    title: "Publish the outcome",
    desc: "When your poll closes, publish results. The same link shows everyone the final breakdown.",
  },
];

const INITIAL_MOCK: MockData = {
  polls: [
    {
      id: "p1",
      title: "What is your go-to state management tool for real-time apps?",
      responses: 47,
      options: [
        { label: "Redis Pub/Sub", pct: 42 },
        { label: "Socket.IO", pct: 38 },
        { label: "Apache Kafka Streams", pct: 17 },
      ],
    },
    {
      id: "p2",
      title: "What part of backend architecture is the most challenging to scale?",
      responses: 23,
      options: [
        { label: "Database Concurrency", pct: 45 },
        { label: "Real-time WebSocket Sync", pct: 30 },
        { label: "Authentication", pct: 18 },
      ],
    },
  ],
  analytics: [
    { label: "Mon", value: 32 },
    { label: "Tue", value: 58 },
    { label: "Wed", value: 45 },
    { label: "Thu", value: 71 },
    { label: "Fri", value: 63 },
    { label: "Sat", value: 28 },
    { label: "Sun", value: 19 },
  ],
  totalResponses: 247,
  activeUsers: 14,
  completionRate: 87,
};

// ─── Utility ──────────────────────────────────────────────────────────────────

const clamp = (n: number, min: number, max: number) =>
  Math.min(Math.max(n, min), max);

const randBetween = (a: number, b: number) =>
  Math.floor(Math.random() * (b - a + 1)) + a;

// ─── Fade-up motion variant ────────────────────────────────────────────────
const smoothEase = [0.22, 1, 0.36, 1] as const;
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: smoothEase } },
};

const stagger = (delay = 0) => ({
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, delay, ease: smoothEase } },
});

// ─── Bar fill component ────────────────────────────────────────────────────

const BarFill: React.FC<{ pct: number }> = ({ pct }) => (
  <div className="lp-bar-track">
    <motion.div
      className="lp-bar-fill"
      initial={{ width: "0%" }}
      whileInView={{ width: `${pct}%` }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ type: "spring", stiffness: 80, damping: 18 }}
    />
  </div>
);

// ─── Chart bar ────────────────────────────────────────────────────────────

const ChartBar: React.FC<{ value: number; label: string; maxValue: number }> = ({
  value, label, maxValue,
}) => {
  const heightPct = maxValue > 0 ? (value / maxValue) * 100 : 0;
  return (
    <div className="lp-chart-bar-wrap">
      <motion.div
        className="lp-chart-bar"
        whileInView={{ height: `${heightPct}%` }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ type: "spring", stiffness: 80, damping: 16 }}
        style={{ width: "100%" }}
      />
      <span className="lp-chart-label">{label}</span>
    </div>
  );
};

// ─── Animated counter ─────────────────────────────────────────────────────

const AnimatedNum: React.FC<{ value: number }> = ({ value }) => {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);

  useEffect(() => {
    if (prev.current === value) return;
    const start = prev.current;
    const diff = value - start;
    const steps = 20;
    let i = 0;
    const id = setInterval(() => {
      i++;
      const ease = 1 - Math.pow(1 - i / steps, 3);
      setDisplay(Math.round(start + diff * ease));
      if (i >= steps) { clearInterval(id); prev.current = value; }
    }, 25);
    return () => clearInterval(id);
  }, [value]);

  return <>{display.toLocaleString()}</>;
};

// ─── Main Component ───────────────────────────────────────────────────────────

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  // Theme
  const [theme, setTheme] = useState<Theme>("dark");

  // Cursor
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const mx = useRef(0);
  const my = useRef(0);
  const rx = useRef(0);
  const ry = useRef(0);
  const rafRef = useRef<number>(0);
  // const [cursorHover, setCursorHover] = useState(false);

  // Active tab in mock dashboard
  const [activeTab, setActiveTab] = useState<TabId>("polls");

  // Mock live data
  const [mockData, setMockData] = useState<MockData>(INITIAL_MOCK);

  // Scroll-driven dashboard scale
  const dashRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: dashProgress } = useScroll({
    target: dashRef,
    offset: ["start end", "end start"],
  });
  const dashScale = useTransform(dashProgress, [0, 0.3, 0.7, 1], [0.92, 1, 1, 0.96]);
  const dashBlur = useTransform(dashProgress, [0, 0.25, 0.6], [6, 0, 0]);
  const dashOpacity = useTransform(dashProgress, [0, 0.2], [0.4, 1]);
  const dashScaleSpring = useSpring(dashScale, { stiffness: 60, damping: 20 });

  // ── Cursor tracking ──────────────────────────────────────────────────────
  // useEffect(() => {
  //   const onMove = (e: MouseEvent) => { mx.current = e.clientX; my.current = e.clientY; };
  //   window.addEventListener("mousemove", onMove);

  //   const animate = () => {
  //     rx.current += (mx.current - rx.current) * 0.12;
  //     ry.current += (my.current - ry.current) * 0.12;
  //     if (cursorRef.current) {
  //       cursorRef.current.style.left = `${mx.current}px`;
  //       cursorRef.current.style.top = `${my.current}px`;
  //     }
  //     if (ringRef.current) {
  //       ringRef.current.style.left = `${rx.current}px`;
  //       ringRef.current.style.top = `${ry.current}px`;
  //     }
  //     rafRef.current = requestAnimationFrame(animate);
  //   };
  //   rafRef.current = requestAnimationFrame(animate);

  //   return () => {
  //     window.removeEventListener("mousemove", onMove);
  //     cancelAnimationFrame(rafRef.current);
  //   };
  // }, []);
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
          const newResponses = poll.responses + randBetween(0, 3);
          const delta = randBetween(-8, 8);
          const rawOpts = poll.options.map((o, i) =>
            i === 0 ? { ...o, pct: clamp(o.pct + delta, 5, 85) } : o
          );
          const total = rawOpts.reduce((s, o) => s + o.pct, 0);
          const norm = rawOpts.map((o) => ({ ...o, pct: Math.round((o.pct / total) * 100) }));
          return { ...poll, responses: newResponses, options: norm };
        });

        const updatedBars = prev.analytics.map((b) => ({
          ...b,
          value: clamp(b.value + randBetween(-6, 10), 5, 100),
        }));

        return {
          polls: updatedPolls,
          analytics: updatedBars,
          totalResponses: prev.totalResponses + randBetween(0, 4),
          activeUsers: clamp(prev.activeUsers + randBetween(-2, 3), 5, 50),
          completionRate: clamp(prev.completionRate + randBetween(-2, 2), 60, 99),
        };
      });
    };

    const scheduleNext = () => {
      const delay = randBetween(2500, 4000);
      return setTimeout(() => { tick(); scheduleNext(); }, delay);
    };

    const id = scheduleNext();
    return () => clearTimeout(id);
  }, []);

  // ── Hover helpers ────────────────────────────────────────────────────────
  // const onHoverEnter = useCallback(() => setCursorHover(true), []);
  // const onHoverLeave = useCallback(() => setCursorHover(false), []);

  // const hoverProps = { onMouseEnter: onHoverEnter, onMouseLeave: onHoverLeave };

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
              onClick={() => setTheme("light")}
            >
              ☀ Light
            </button>
            <button
              className={`lp-theme-btn${theme === "dark" ? " active" : ""}`}
              onClick={() => setTheme("dark")}
            >
              ◆ Dark
            </button>
          </motion.div>

          <motion.button
            className="lp-btn-primary"
            onClick={() => navigate("/sign-in")}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            
          >
            Get started
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
            Create, share, and collect feedback — watch responses roll in live as they happen.
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
              onClick={() => navigate("/sign-in")}
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
                    <div className="lp-mock-main-title">What is your go-to state management tool for real-time apps?</div>
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
            the results shift in real time — all in one link.
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
      <section className="lp-dashboard-section" id="dashboard" ref={dashRef}>
        <div className="lp-dashboard-header">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
          >
            <div className="lp-section-tag" style={{ justifyContent: "center" }}>
              <span className="lp-hero-tag-dot" />
              Live dashboard preview
            </div>
            <h2 className="lp-section-h2" style={{ textAlign: "center" }}>
              Your analytics, live and breathing.
            </h2>
            <p className="lp-section-sub" style={{ margin: "0 auto", textAlign: "center" }}>
              This is a real simulation of the PulseBoard dashboard —
              data updates automatically just like it does in production.
            </p>
          </motion.div>
        </div>

        <motion.div
          style={{
            scale: dashScaleSpring,
            opacity: dashOpacity,
            filter: useTransform(dashBlur, (v) => `blur(${v}px)`),
          }}
        >
          <div className="lp-mock-dashboard">
            {/* Browser chrome */}
            <div className="lp-mock-topbar">
              <div className="lp-mock-traffic">
                <div className="lp-mock-dot" style={{ background: "#FF5F57" }} />
                <div className="lp-mock-dot" style={{ background: "#FFBD2E" }} />
                <div className="lp-mock-dot" style={{ background: "#28CA41" }} />
              </div>
              <div className="lp-mock-url">pulseboard.app/dashboard</div>
            </div>

            <div className="lp-mock-body">
              {/* Sidebar */}
              <div className="lp-mock-sidebar">
                <div className="lp-mock-sidebar-logo">
                  <span className="lp-logo-dot" style={{ width: 6, height: 6 }} />
                  PulseBoard
                </div>
                {[
                  { icon: "▦", label: "Dashboard", active: true },
                  { icon: "◎", label: "My Polls", active: false },
                  { icon: "↗", label: "Analytics", active: false },
                  { icon: "⋯", label: "Settings", active: false },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`lp-mock-sidebar-item${item.active ? " active" : ""}`}
                    data-hover
                  >
                    <span style={{ fontSize: 13 }}>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                ))}

                {/* Live users indicator */}
                <div style={{ marginTop: "auto", padding: "10px" }}>
                  <div className="lp-live-badge" style={{ width: "100%", justifyContent: "center" }}>
                    <span className="lp-live-pulse" />
                    <AnimatedNum value={mockData.activeUsers} /> active
                  </div>
                </div>
              </div>

              {/* Main content */}
              <div className="lp-mock-main">
                <div className="lp-mock-main-header">
                  <span className="lp-mock-main-title">Overview</span>
                  <div className="lp-live-badge">
                    <span className="lp-live-pulse" />
                    <AnimatedNum value={mockData.totalResponses} /> total responses
                  </div>
                </div>

                {/* Tab bar */}
                <LayoutGroup>
                  <div className="lp-tab-bar">
                    {(["polls", "analytics"] as TabId[]).map((tab) => (
                      <button
                        key={tab}
                        className={`lp-tab${activeTab === tab ? " active" : ""}`}
                        onClick={() => setActiveTab(tab)}
                        
                      >
                        {tab === "polls" ? "Active Polls" : "Live Analytics"}
                        {activeTab === tab && (
                          <motion.div
                            className="lp-tab-indicator"
                            layoutId="tab-underline"
                            transition={{ type: "spring", stiffness: 340, damping: 28 }}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </LayoutGroup>

                {/* Tab content */}
                <div className="lp-mock-content">
                  <AnimatePresence mode="wait">
                    {activeTab === "polls" ? (
                      <motion.div
                        key="polls"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      >
                        {mockData.polls.map((poll) => (
                          <div key={poll.id} className="lp-poll-card">
                            <div className="lp-poll-card-title">
                              {poll.title}
                              <span className="lp-poll-count">
                                <AnimatedNum value={poll.responses} /> responses
                              </span>
                            </div>
                            {poll.options.map((opt) => (
                              <div key={opt.label} className="lp-option-row">
                                <div className="lp-option-label">
                                  <span>{opt.label}</span>
                                  <span>{opt.pct}%</span>
                                </div>
                                <BarFill pct={opt.pct} />
                              </div>
                            ))}
                          </div>
                        ))}
                      </motion.div>
                    ) : (
                      <motion.div
                        key="analytics"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <div className="lp-chart-wrap">
                          {mockData.analytics.map((bar) => (
                            <ChartBar
                              key={bar.label}
                              value={bar.value}
                              label={bar.label}
                              maxValue={maxBarValue}
                            />
                          ))}
                        </div>
                        <div className="lp-stats-row">
                          <div className="lp-stat-tile">
                            <div className="lp-stat-num">
                              <AnimatedNum value={mockData.totalResponses} />
                            </div>
                            <div className="lp-stat-label">Total responses</div>
                          </div>
                          <div className="lp-stat-tile">
                            <div className="lp-stat-num">
                              <AnimatedNum value={mockData.activeUsers} />
                            </div>
                            <div className="lp-stat-label">Active now</div>
                          </div>
                          <div className="lp-stat-tile">
                            <div className="lp-stat-num">
                              <AnimatedNum value={mockData.completionRate} />%
                            </div>
                            <div className="lp-stat-label">Completion rate</div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

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
            onClick={() => navigate("/sign-in")}
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

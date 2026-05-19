import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuthFetch } from "../hooks/useAuthFetch.js";
import { useSocket } from "../hooks/useSocket.js";
import {
  motion,
  AnimatePresence,
  animate,
} from "framer-motion";
import "./Analytics.css";

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface OptionSummary {
  optionId: string;
  optionText: string;
  count: number;
  percentage: number;
}
interface QuestionSummary {
  questionId: string;
  questionText: string;
  isMandatory: boolean;
  options: OptionSummary[];
}
interface Analytics {
  pollId: string;
  title: string;
  totalResponses: number;
  isPublished: boolean;
  expiresAt: string;
  questions: QuestionSummary[];
}

// ─── THEME HOOK ───────────────────────────────────────────────────────────────

function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("pb-theme") as "light" | "dark") ??
        (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    }
    return "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("pb-theme", theme);
  }, [theme]);

  const toggle = useCallback(
    () => setTheme((t) => (t === "light" ? "dark" : "light")),
    []
  );

  return { theme, toggle };
}

// ─── ANIMATED COUNTER ─────────────────────────────────────────────────────────

function AnimatedCounter({ value }: { value: number }) {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const prevRef = useRef(value);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;
    const controls = animate(prevRef.current, value, {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(v) {
        node.textContent = Math.round(v).toLocaleString();
      },
    });
    prevRef.current = value;
    return () => controls.stop();
  }, [value]);

  return <span ref={nodeRef}>{value.toLocaleString()}</span>;
}

// ─── LIVE BADGE ───────────────────────────────────────────────────────────────

function LiveBadge() {
  return (
    <div className="pb-live-badge">
      <span style={{ position: "relative", width: 12, height: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <motion.span
          animate={{ scale: [1, 2.4], opacity: [0.7, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
          style={{
            position: "absolute",
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: "var(--accent)",
          }}
        />
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--accent)", flexShrink: 0 }} />
      </span>
      Live
    </div>
  );
}

// ─── EXPIRY RADIAL ────────────────────────────────────────────────────────────

// function ExpiryRadial({ expiresAt, isExpired }: { expiresAt: string; isExpired: boolean }) {
//   const expiryDate = new Date(expiresAt);
//   const now = new Date();

//   // Calculate progress as fraction of time elapsed from creation estimate
//   // We use a 30-day window as default reference
//   const totalMs = 30 * 24 * 60 * 60 * 1000;
//   const elapsed = now.getTime() - (expiryDate.getTime() - totalMs);
//   const rawProgress = isExpired ? 1 : Math.max(0, Math.min(elapsed / totalMs, 1));

//   const R = 16;
//   const C = 2 * Math.PI * R;
//   const dashOffset = C * (1 - rawProgress);

//   const dateLabel = isExpired
//     ? "Expired"
//     : expiryDate.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

//   const timeLabel = isExpired
//     ? ""
//     : expiryDate.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

//   return (
//     <div className="pb-expiry-track">
//       <div className={`pb-expiry-ring${isExpired ? " expired" : ""}`}>
//         <svg width="40" height="40" viewBox="0 0 40 40">
//           <circle className="pb-expiry-ring-track" cx="20" cy="20" r={R} />
//           <circle
//             className="pb-expiry-ring-fill"
//             cx="20"
//             cy="20"
//             r={R}
//             strokeDasharray={C}
//             strokeDashoffset={dashOffset}
//           />
//         </svg>
//       </div>
//       <div className={`pb-expiry-label${isExpired ? " expired" : ""}`}>
//         <strong>{dateLabel}</strong>
//         {timeLabel && <span>{timeLabel}</span>}
//       </div>
//     </div>
//   );
// }

// ─── TELEMETRY HERO CANVAS ────────────────────────────────────────────────────

// function TelemetryHero({
//   title,
//   totalResponses,
//   questionsCount,
//   isPublished,
//   expiresAt,
//   isExpired,
//   liveFlash,
//   liveCount,
// }: {
//   title: string;
//   totalResponses: number;
//   questionsCount: number;
//   isPublished: boolean;
//   expiresAt: string;
//   isExpired: boolean;
//   liveFlash: boolean;
//   liveCount: number | null;
// }) {
//   return (
//     <motion.div
//       className="pb-hero"
//       initial={{ opacity: 0, y: -16 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
//     >
//       {/* LEFT: title + meta */}
//       <div className="pb-hero-left">
//         <div className="pb-hero-eyebrow">
//           <span className="pb-hero-kicker">Analytics Report</span>
//           <span className={`pb-hero-status ${isPublished ? "published" : "draft"}`}>
//             {isPublished ? "● Published" : "○ Draft"}
//           </span>
//         </div>

//         <h1 className="pb-hero-title">{title}</h1>

//         <div className="pb-hero-meta-row">
//           <div className="pb-meta-chip">
//             <div className="pb-meta-chip-dot" style={{ background: "var(--pie-5)" }} />
//             <span><strong>{questionsCount}</strong> question{questionsCount !== 1 ? "s" : ""}</span>
//           </div>
//           <div className="pb-meta-chip">
//             <div className="pb-meta-chip-dot" style={{ background: isExpired ? "var(--accent)" : "var(--pie-6)" }} />
//             <span>{isExpired ? <strong style={{ color: "var(--accent)" }}>Expired</strong> : <><strong>Active</strong> until {new Date(expiresAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</>}</span>
//           </div>
//           {liveCount !== null && (
//             <div className="pb-meta-chip">
//               <LiveBadge />
//             </div>
//           )}
//         </div>
//       </div>

//       {/* RIGHT: cinematic response number */}
//       <div className="pb-hero-right">
//         <div className={`pb-response-canvas${liveFlash ? " pb-response-flash" : ""}`}>
//           <span className="pb-response-label">Total Responses</span>
//           <motion.div
//             className="pb-response-number"
//             animate={liveFlash ? { scale: [1, 1.04, 1] } : {}}
//             transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
//           >
//             <AnimatedCounter value={totalResponses} />
//           </motion.div>
//         </div>

//         <ExpiryRadial expiresAt={expiresAt} isExpired={isExpired} />

//         <AnimatePresence mode="wait">
//           {isPublished ? (
//             <motion.div
//               key="pub"
//               initial={{ opacity: 0, y: 4 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: -4 }}
//               style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "'DM Sans', sans-serif", fontSize: "11px", fontWeight: 700, color: "#22C55E", letterSpacing: "0.08em", textTransform: "uppercase" }}
//             >
//               <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22C55E" }} />
//               Results public
//             </motion.div>
//           ) : (
//             <motion.div
//               key="live"
//               initial={{ opacity: 0, y: 4 }}
//               animate={{ opacity: 1, y: 0 }}
//               exit={{ opacity: 0, y: -4 }}
//               style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "'DM Sans', sans-serif", fontSize: "11px", fontWeight: 700, color: "var(--muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}
//             >
//               <span className="live-dot-ring" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--muted)", display: "inline-block" }} />
//               Live updating
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </div>
//     </motion.div>
//   );
// }

// ─── REALTIME PIE CHART ───────────────────────────────────────────────────────

function RealtimePieChart({
  questions,
  totalResponses,
}: {
  questions: QuestionSummary[];
  totalResponses: number;
}) {
  const slices = questions
    .flatMap((q) =>
      q.options.map((o) => ({
        id: `${q.questionId}-${o.optionId}`,
        label: o.optionText,
        count: o.count,
        percentage: o.percentage,
      }))
    )
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const activeSlices = slices.filter((s) => s.count > 0);

  let offset = 0;
  const gradientStops = activeSlices.length === 0
    ? "var(--border) 0 100%"
    : activeSlices
      .map((s, i) => {
        const start = offset;
        offset += Math.max(s.percentage, 0);
        return `var(--pie-${(i % 6) + 1}) ${start}% ${offset}%`;
      })
      .join(", ");

  return (
    <div className="pb-chart-card">
      <p className="pb-chart-kicker">Response Share</p>
      <h2 className="pb-chart-title">Pie Distribution</h2>

      {activeSlices.length === 0 ? (
        <div className="pb-chart-empty">No data yet</div>
      ) : (
        <>
          <div className="pb-pie-wrap">
            <motion.div
              className="pb-pie"
              animate={{
                background: `conic-gradient(${gradientStops})`,
                rotate: -90,
              }}
              transition={{ type: "spring", stiffness: 80, damping: 20 }}
            >
              <div className="pb-pie-hole">
                <span className="pb-pie-hole-label">Total</span>
                <strong className="pb-pie-hole-value">
                  <AnimatedCounter value={totalResponses} />
                </strong>
              </div>
            </motion.div>
          </div>

          <motion.div layout className="pb-pie-legend">
            <AnimatePresence initial={false}>
              {slices.map((row, i) => (
                <motion.div
                  layout
                  key={row.id}
                  className="pb-pie-legend-row"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{
                    layout: { type: "spring", stiffness: 280, damping: 28 },
                    opacity: { duration: 0.2 },
                    delay: i * 0.025,
                  }}
                >
                  <div
                    className="pb-pie-legend-dot"
                    style={{ background: `var(--pie-${(i % 6) + 1})` }}
                  />
                  <span className="pb-pie-legend-label">{row.label}</span>
                  <span className="pb-pie-legend-value">
                    {row.count.toLocaleString()} · {row.percentage}%
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </div>
  );
}

// ─── REALTIME VERTICAL BAR CHART ─────────────────────────────────────────────
// Aggregates all options across all questions into a single vertical column chart.
// Each column rises with a spring animation on every socket update.

const BAR_COLORS = [
  "var(--pie-1)",
  "var(--pie-4)",
  "var(--pie-5)",
  "var(--pie-6)",
  "var(--pie-2)",
  "var(--pie-3)",
];

function RealtimeVerticalBarChart({
  questions,
}: {
  questions: QuestionSummary[];
}) {
  // Flatten all options across every question
  // const allOptions = questions.flatMap((q) => q.options);

  // If poll has one question: show its options. Multiple questions: show per-question totals.
  const bars: { label: string; count: number; percentage: number; colorIdx: number }[] =
    questions.length === 1
      ? [...(questions[0]?.options ?? [])]
        .sort((a, b) => b.count - a.count)
        .map((o, i) => ({
          label: o.optionText,
          count: o.count,
          percentage: o.percentage,
          colorIdx: i,
        }))
      : questions.map((q, i) => {
        const total = q.options.reduce((s, o) => s + o.count, 0);
        const maxPct = q.options.length > 0
          ? Math.max(...q.options.map((o) => o.percentage))
          : 0;
        return {
          label: `Q${i + 1}`,
          count: total,
          percentage: maxPct,
          colorIdx: i,
        };
      });

  const isEmpty = bars.every((b) => b.count === 0);
  const maxCount = Math.max(...bars.map((b) => b.count), 1);

  // Y-axis gridline values
  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((f) =>
    Math.round(f * maxCount)
  );

  if (isEmpty) {
    return (
      <div className="pb-chart-card">
        <p className="pb-chart-kicker">Response Distribution</p>
        <p className="pb-chart-title">Vote Columns</p>
        <div className="pb-chart-empty">No votes recorded yet.</div>
      </div>
    );
  }

  return (
    <div className="pb-chart-card pb-vchart-card">
      <p className="pb-chart-kicker">Response Distribution</p>
      <p className="pb-chart-title">Vote Columns</p>

      <div className="pb-vchart-wrap">
        {/* Y-axis labels */}
        <div className="pb-vchart-yaxis">
          {[...gridLines].reverse().map((v) => (
            <span key={v} className="pb-vchart-ylabel">
              {v}
            </span>
          ))}
        </div>

        {/* Grid + bars */}
        <div className="pb-vchart-body">
          {/* Horizontal gridlines */}
          <div className="pb-vchart-grid" aria-hidden="true">
            {gridLines.map((v) => (
              <div key={v} className="pb-vchart-gridline" />
            ))}
          </div>

          {/* Column bars */}
          <div className="pb-vchart-cols">
            {bars.map((bar, i) => {
              // Calculate a numerical scale fraction between 0 and 1
              // const scaleYVal = maxCount > 0 ? bar.count / maxCount : 0;
              const color = BAR_COLORS[bar.colorIdx % BAR_COLORS.length];
              const isTop = i === 0 && questions.length === 1;

              return (
                /* FIX 1: Use a completely stable key (remove "+ i") 
                  and add the 'layout' prop so columns slide horizontally when re-ordered
                */
                <motion.div
                  key={bar.label} // Stable key for sorting
                  className="pb-vchart-col"
                  layout // This makes the bars slide into new positions if sorted
                  transition={{ type: "spring", stiffness: 200, damping: 25 }}
                >
                  {/* Count label */}
                  <motion.span
                    className="pb-vchart-col-count"
                    animate={{ opacity: 1 }}
                    initial={{ opacity: 0 }}
                  >
                    {bar.count.toLocaleString()}
                  </motion.span>

                  {/* The Bar Track */}
                  <div className="pb-vchart-track">
                    <motion.div
                      className="pb-vchart-bar"
                      // THIS IS THE KEY: We animate the height directly. 
                      // Framer Motion handles the 'tween' between old height and new height automatically.
                      animate={{ height: `${(bar.count / maxCount) * 100}%` }}
                      initial={{ height: "0%" }} // Starts at 0 on mount
                      transition={{
                        type: "spring",
                        stiffness: 100, // Slightly slower, more "bouncy/organic" feel
                        damping: 15,
                        mass: 1,
                        delay: i * 0.05 // Staggered reveal
                      }}
                      style={{
                        background: isTop
                          ? `linear-gradient(180deg, ${color} 0%, color-mix(in srgb, ${color} 55%, transparent) 100%)`
                          : `linear-gradient(180deg, ${color} 0%, color-mix(in srgb, ${color} 40%, transparent) 100%)`,
                      }}
                    />
                  </div>

                  {/* Labels */}
                  <span className="pb-vchart-xlabel">{bar.label}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── OPTION BAR (inside question cards) ──────────────────────────────────────

function OptionBar({ opt, rank }: { opt: OptionSummary; rank: number }) {
  const isTop = rank === 0;

  return (
    <motion.div
      layout
      layoutId={opt.optionId}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        layout: { type: "spring", stiffness: 260, damping: 28 },
        opacity: { duration: 0.22 },
      }}
      className={`pb-option-row${isTop ? " top" : ""}`}
    >
      <div className={`pb-option-rank${isTop ? " top" : " rest"}`}>#{rank + 1}</div>

      <div className="pb-option-row-head">
        <span className="pb-option-label">{opt.optionText}</span>
        <span className={`pb-option-stats${isTop ? " top" : " rest"}`}>
          {opt.count.toLocaleString()} · {opt.percentage}%
        </span>
      </div>

      <div className="pb-option-track">
        <motion.div
          animate={{ width: `${opt.percentage}%` }}
          transition={{ type: "spring", stiffness: 70, damping: 15 }}
          className={isTop ? "pb-option-fill-top" : "pb-option-fill-rest"}
          style={{ minWidth: opt.percentage > 0 ? "5px" : "0" }}
        />
      </div>
    </motion.div>
  );
}

// ─── QUESTION CARD ────────────────────────────────────────────────────────────

function QuestionCard({ q, index }: { q: QuestionSummary; index: number }) {
  const sorted = [...q.options].sort((a, b) => b.count - a.count);

  return (
    <motion.div
      className="pb-question-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.06,
        duration: 0.45,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <span className="pb-question-index-bg">{index + 1}</span>

      <p className="pb-question-text">{q.questionText}</p>

      {q.isMandatory && <span className="pb-required-badge">Required</span>}

      <motion.div layout className="pb-options-list">
        <AnimatePresence initial={false}>
          {sorted.map((opt, rank) => (
            <OptionBar key={opt.optionId} opt={opt} rank={rank} />
          ))}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

// ─── LOADING STATE ────────────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="pb-loading analytics-root">
      <motion.div
        className="pb-loading-spinner"
        animate={{ rotate: 360 }}
        transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
      />
      <p className="pb-loading-text">Fetching analytics…</p>
    </div>
  );
}

// ─── ERROR STATE ──────────────────────────────────────────────────────────────

function ErrorState() {
  return (
    <div className="pb-error analytics-root">
      <div className="pb-error-icon">⚠</div>
      <p className="pb-error-title">Analytics unavailable</p>
      <p className="pb-error-sub">Could not load poll data. Please try again.</p>
      <Link to="/dashboard" className="pb-error-link">← Back to Dashboard</Link>
    </div>
  );
}

// ─── STICKY ACTION BAR ────────────────────────────────────────────────────────

function StickyActionBar({
  theme,
  onToggleTheme,
}: {
  theme: "light" | "dark";
  onToggleTheme: () => void;
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className={`pb-action-bar${scrolled ? " scrolled" : ""}`}>
      <div className="pb-action-bar-inner">
        {/* Left Side Edge */}
        <span className="pb-logo">
          <span className="pb-logo-dot" />
          PulseBoard
        </span>

        {/* Right Side Edge Group */}
        <div className="pb-action-bar-right">
          <Link to="/dashboard" className="pb-nav-back">
            <span style={{ fontSize: 15 }}>←</span> Dashboard
          </Link>

          <button className="pb-theme-btn" onClick={onToggleTheme} aria-label="Toggle theme">
            {theme === "dark" ? "☀" : "◑"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN ANALYTICS PAGE ──────────────────────────────────────────────────────

export default function Analytics() {
  const { pollId } = useParams<{ pollId: string }>();
  const authFetch = useAuthFetch();
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [liveCount, setLiveCount] = useState<number | null>(null);
  const [, setLiveFlash] = useState(false);
  const [copied, setCopied] = useState(false);
  const { theme, toggle } = useTheme();

  /* initial fetch */
  useEffect(() => {
    authFetch
      .get(`/api/analytics/${pollId}`)
      .then((r) => setData(r.data.data))
      .catch(() => setHasError(true))
      .finally(() => setLoading(false));
  }, [pollId]);

  /* live socket updates */
  useSocket(pollId!, (payload) => {
    setLiveCount(payload.totalResponses);
    setLiveFlash(true);
    setTimeout(() => setLiveFlash(false), 700);
    authFetch
      .get(`/api/analytics/${pollId}`)
      .then((r) => setData(r.data.data))
      .catch(console.error);
  });

  if (loading) return <LoadingState />;
  if (hasError || !data) return <ErrorState />;

  const totalResponses = liveCount ?? data.totalResponses;
  const pollUrl = `${window.location.origin}/poll/${pollId}`;
  // const expiryDate = new Date(data.expiresAt);
  // const isExpired = expiryDate < new Date();

  const handleCopy = () => {
    navigator.clipboard.writeText(pollUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePublish = async () => {
    await authFetch.patch(`/api/polls/${pollId}/publish`);
    setData((d) => (d ? { ...d, isPublished: true } : d));
  };

  return (
    <div className="analytics-root">

      {/* ══ 1. PRIMARY NAVBAR — clean, always at absolute top ══ */}
      <StickyActionBar
        theme={theme}
        onToggleTheme={toggle}
      />

      {/* ══ 2. STANDALONE FLOATING ACTION BAR — below navbar, sticky on scroll ══ */}
      <div className="pb-sub-action-bar">
        <div className="pb-sub-action-bar-inner">
          <div className="pb-hero-eyebrow" style={{ margin: 0, flex: 1, minWidth: 0, gap: 10 }}>
            <span className="pb-hero-kicker">{data.title}</span>
            <span className={`pb-hero-status ${data.isPublished ? "published" : "draft"}`}>
              {data.isPublished ? "● Published" : "○ Draft"}
            </span>
            {liveCount !== null && <LiveBadge />}
          </div>

          <div className="pb-poll-url-pill" style={{ flex: "0 1 280px" }}>
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0, opacity: 0.45 }}>
              <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
            <span className="pb-poll-url-text">{pollUrl}</span>
          </div>

          <div className="pb-actions-group">
            <motion.button
              className="pb-btn pb-btn-ghost"
              onClick={handleCopy}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
            >
              <AnimatePresence mode="wait" initial={false}>
                {copied ? (
                  <motion.span key="done" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}>
                    ✓ Copied
                  </motion.span>
                ) : (
                  <motion.span key="copy" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}>
                    Copy link
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {!data.isPublished && (
              <motion.button
                className="pb-btn pb-btn-primary"
                onClick={handlePublish}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
              >
                Publish results
              </motion.button>
            )}

            {data.isPublished && (
              <Link to={`/poll/${data.pollId}/results`}>
                <motion.span
                  className="pb-btn pb-btn-solid"
                  style={{ display: "inline-flex" }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                >
                  View public →
                </motion.span>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="pb-page">

        {/* ══ 3. MAIN BENTO VISUALIZATION CANVAS — 50/50 equal-height split ══ */}
        <motion.div
          className="pb-bento-canvas"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* LEFT: Pie chart */}
          <div className="pb-bento-pane">
            <RealtimePieChart
              questions={data.questions}
              totalResponses={totalResponses}
            />
          </div>

          {/* RIGHT: Vertical bar chart */}
          <div className="pb-bento-pane">
            <RealtimeVerticalBarChart questions={data.questions} />
          </div>
        </motion.div>

        {/* ══ 4. SECTION DIVIDER ══ */}
        <motion.div
          className="pb-section-divider"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.22, duration: 0.4 }}
        >
          <span className="pb-section-label">Question Breakdown</span>
          <div className="pb-section-rule" />
          <span className="pb-section-count">
            {data.questions.length} question{data.questions.length !== 1 ? "s" : ""}
            {" · "}
            {totalResponses.toLocaleString()} response{totalResponses !== 1 ? "s" : ""}
          </span>
        </motion.div>

        {/* ══ 5. QUESTION BREAKDOWN — 2-column flex-wrap grid ══ */}
        <motion.div
          className="pb-breakdown-grid"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {data.questions.length === 0 ? (
            <div className="pb-chart-empty" style={{ gridColumn: "1 / -1" }}>
              No questions with responses yet.
            </div>
          ) : (
            data.questions.map((q, i) => (
              <QuestionCard key={q.questionId} q={q} index={i} />
            ))
          )}
        </motion.div>

        {/* ══ FOOTER ══ */}
        <motion.div
          className="pb-footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.38, duration: 0.5 }}
        >
          <span className="pb-footer-brand">PulseBoard</span>
          <span className="pb-footer-id">Poll ID: {data.pollId}</span>
        </motion.div>

      </div>
    </div>
  );
}
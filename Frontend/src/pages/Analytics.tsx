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

function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("pb-theme") as "light" | "dark") ??
        (window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light");
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

// ----- ANIMATED COUNTER -----
function AnimatedCounter({ value }: { value: number }) {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const prevRef = useRef(value);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;
    const controls = animate(prevRef.current, value, {
      duration: 0.7,
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

// ----- LIVE BADGE WITH PULSING RING -----
function LiveBadge() {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: "5px 12px 5px 8px",
        borderRadius: "100px",
        border: "1px solid var(--accent)",
        background: "color-mix(in srgb, var(--accent) 10%, transparent)",
        fontSize: "11px",
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 600,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "var(--accent)",
        userSelect: "none",
      }}
    >
      {/* outer ring */}
      <span style={{ position: "relative", width: 12, height: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <motion.span
          animate={{ scale: [1, 2.2], opacity: [0.6, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
          style={{
            position: "absolute",
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: "var(--accent)",
          }}
        />
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "var(--accent)",
            flexShrink: 0,
          }}
        />
      </span>
      Live Stream
    </div>
  );
}

// ----- OPTION BAR (represents one option's count + percentage) ------
function OptionBar({
  opt,
  rank,
}: {
  opt: OptionSummary;
  rank: number;
  totalOptions: number;
}) {
  const isTop = rank === 0;

  return (
    <motion.div
      layout
      layoutId={opt.optionId}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ layout: { type: "spring", stiffness: 260, damping: 28 }, opacity: { duration: 0.25 } }}
      style={{
        position: "relative",
        padding: "14px 16px",
        borderRadius: "12px",
        border: `1px solid ${isTop ? "var(--accent)" : "var(--border)"}`,
        background: isTop
          ? "color-mix(in srgb, var(--accent) 6%, var(--card))"
          : "var(--card)",
        overflow: "hidden",
      }}
    >
      {/* rank badge */}
      <div
        style={{
          position: "absolute",
          top: 12,
          right: 14,
          fontFamily: "'Syne', sans-serif",
          fontWeight: 800,
          fontSize: "11px",
          letterSpacing: "0.06em",
          color: isTop ? "var(--accent)" : "var(--border)",
        }}
      >
        #{rank + 1}
      </div>

      {/* label row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "10px",
          gap: 8,
          paddingRight: 28,
        }}
      >
        <span
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "14px",
            fontWeight: 500,
            color: "var(--text)",
            lineHeight: 1.4,
          }}
        >
          {opt.optionText}
        </span>
        <span
          style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 700,
            fontSize: "13px",
            color: isTop ? "var(--accent)" : "color-mix(in srgb, var(--text) 55%, transparent)",
            whiteSpace: "nowrap",
          }}
        >
          {opt.count.toLocaleString()} · {opt.percentage}%
        </span>
      </div>

      {/* track */}
      <div
        style={{
          width: "100%",
          height: "6px",
          borderRadius: "100px",
          background: "var(--border)",
          overflow: "hidden",
        }}
      >
        <motion.div
          animate={{ width: `${opt.percentage}%` }}
          transition={{ type: "spring", stiffness: 70, damping: 15 }}
          style={{
            height: "100%",
            borderRadius: "100px",
            background: isTop
              ? "var(--accent)"
              : "color-mix(in srgb, var(--accent) 45%, var(--border))",
            minWidth: opt.percentage > 0 ? "6px" : "0px",
          }}
        />
      </div>
    </motion.div>
  );
}

// ----- QUESTION CARD (represents one question with its options) ------
function QuestionCard({
  q,
  index,
}: {
  q: QuestionSummary;
  index: number;
}) {
  const sorted = [...q.options].sort((a, b) => b.count - a.count);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: "20px",
        padding: "28px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* subtle question index watermark */}
      <span
        style={{
          position: "absolute",
          top: -8,
          right: 20,
          fontFamily: "'Syne', sans-serif",
          fontWeight: 900,
          fontSize: "88px",
          color: "color-mix(in srgb, var(--border) 60%, transparent)",
          lineHeight: 1,
          userSelect: "none",
          pointerEvents: "none",
        }}
      >
        {index + 1}
      </span>

      {/* question text */}
      <div style={{ marginBottom: "20px", paddingRight: "60px" }}>
        <p
          style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 700,
            fontSize: "16px",
            color: "var(--text)",
            lineHeight: 1.5,
            margin: 0,
          }}
        >
          {q.questionText}
        </p>
        {q.isMandatory && (
          <span
            style={{
              display: "inline-block",
              marginTop: "6px",
              padding: "2px 8px",
              borderRadius: "4px",
              background: "color-mix(in srgb, #FF4D00 15%, transparent)",
              border: "1px solid color-mix(in srgb, #FF4D00 35%, transparent)",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "10px",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase" as const,
              color: "#FF4D00",
            }}
          >
            Required
          </span>
        )}
      </div>

      {/* options with FLIP layout animation */}
      <motion.div layout style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <AnimatePresence initial={false}>
          {sorted.map((opt, rank) => (
            <OptionBar key={opt.optionId} opt={opt} rank={rank} totalOptions={sorted.length} />
          ))}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

function RealtimePieChart({
  questions,
  totalResponses,
}: {
  questions: QuestionSummary[];
  totalResponses: number;
}) {
  const slices = questions
    .flatMap((question) =>
      question.options.map((option) => ({
        id: `${question.questionId}-${option.optionId}`,
        label: option.optionText,
        count: option.count,
        percentage: option.percentage,
      }))
    )
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  const activeSlices = slices.filter((slice) => slice.count > 0);
  let offset = 0;
  const gradientStops =
    activeSlices.length === 0
      ? "var(--border) 0 100%"
      : activeSlices
        .map((slice, index) => {
          const start = offset;
          const size = Math.max(slice.percentage, 0);
          offset += size;
          const color = `var(--pie-${(index % 6) + 1})`;
          return `${color} ${start}% ${offset}%`;
        })
        .join(", ");
  const maxCount = Math.max(...slices.map((row) => row.count), 1);

  return (
    <motion.aside
      className="analytics-pie-card"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="analytics-pie-header">
        <div>
          <p className="analytics-pie-kicker">Realtime Pie Chart</p>
          <h2 className="analytics-pie-title">Response share</h2>
        </div>
        <div className="analytics-pie-total">
          <AnimatedCounter value={totalResponses} />
        </div>
      </div>

      {activeSlices.length === 0 ? (
        <div className="analytics-pie-empty">No option data yet</div>
      ) : (
        <>
          <div className="analytics-pie-wrap">
            <motion.div
              className="analytics-pie"
              initial={{ rotate: -90, scale: 0.92, opacity: 0 }}
              animate={{
                rotate: -90,
                scale: 1,
                opacity: 1,
                background: `conic-gradient(${gradientStops})`,
              }}
              transition={{ type: "spring", stiffness: 90, damping: 18 }}
            >
              <div className="analytics-pie-hole">
                <span>Total</span>
                <strong>{totalResponses.toLocaleString()}</strong>
              </div>
            </motion.div>
          </div>

          <motion.div layout className="analytics-pie-legend">
            <AnimatePresence initial={false}>
              {slices.map((row, index) => (
                <motion.div
                  layout
                  key={row.id}
                  className="analytics-pie-legend-row"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{
                    layout: { type: "spring", stiffness: 260, damping: 28 },
                    opacity: { duration: 0.2 },
                    delay: index * 0.03,
                  }}
                >
                  <div className="analytics-chart-row-head">
                    <div>
                      <div className="analytics-chart-label">{row.label}</div>
                    </div>
                    <div className="analytics-chart-value">
                      {row.count.toLocaleString()} · {row.percentage}%
                    </div>
                  </div>
                  <div className="analytics-chart-track">
                    <motion.div
                      className="analytics-chart-fill"
                      animate={{
                        width: `${Math.max((row.count / maxCount) * 100, row.count > 0 ? 4 : 0)}%`,
                      }}
                      transition={{ type: "spring", stiffness: 80, damping: 16 }}
                    />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </motion.aside>
  );
}

// ----- LOADING STATE ------
function LoadingState() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
      }}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          border: "3px solid var(--border)",
          borderTopColor: "var(--accent)",
        }}
      />
      <p
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "14px",
          color: "color-mix(in srgb, var(--text) 45%, transparent)",
          letterSpacing: "0.04em",
        }}
      >
        Fetching analytics…
      </p>
    </div>
  );
}

// ----- ERROR STATE ------
function ErrorState() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        padding: "40px 24px",
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: "16px",
          background: "color-mix(in srgb, #FF4D00 12%, var(--card))",
          border: "1px solid color-mix(in srgb, #FF4D00 30%, transparent)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "24px",
        }}
      >
        ⚠
      </div>
      <div style={{ textAlign: "center" }}>
        <p
          style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 700,
            fontSize: "18px",
            color: "var(--text)",
            margin: "0 0 6px",
          }}
        >
          Analytics unavailable
        </p>
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "14px",
            color: "color-mix(in srgb, var(--text) 50%, transparent)",
            margin: 0,
          }}
        >
          Could not load poll data. Please try again.
        </p>
      </div>
      <Link
        to="/dashboard"
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "13px",
          fontWeight: 600,
          color: "var(--accent)",
          textDecoration: "none",
          padding: "8px 18px",
          borderRadius: "8px",
          border: "1px solid var(--accent)",
        }}
      >
        ← Back to Dashboard
      </Link>
    </div>
  );
}

// ----- STAT CARD (used for summary stats at the top) ------
function StatCard({
  label,
  children,
  accent = false,
}: {
  label: string;
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div
      style={{
        background: accent
          ? "color-mix(in srgb, var(--accent) 8%, var(--card))"
          : "var(--card)",
        border: `1px solid ${accent ? "var(--accent)" : "var(--border)"}`,
        borderRadius: "16px",
        padding: "20px 22px",
        display: "flex",
        flexDirection: "column" as const,
        gap: "6px",
      }}
    >
      <span
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "11px",
          fontWeight: 600,
          letterSpacing: "0.09em",
          textTransform: "uppercase" as const,
          color: accent
            ? "var(--accent)"
            : "color-mix(in srgb, var(--text) 45%, transparent)",
        }}
      >
        {label}
      </span>
      {children}
    </div>
  );
}

// ----- ICON BUTTON (used for small buttons with icons, like the copy button) ------
function IconButton({
  onClick,
  children,
  variant = "default",
}: {
  onClick?: () => void;
  children: React.ReactNode;
  variant?: "default" | "primary" | "dark";
}) {
  const styles: Record<string, React.CSSProperties> = {
    default: {
      background: "var(--card)",
      border: "1px solid var(--border)",
      color: "var(--text)",
    },
    primary: {
      background: "var(--accent)",
      border: "1px solid var(--accent)",
      color: "var(--accent-contrast)",
    },
    dark: {
      background: "var(--text)",
      border: "1px solid var(--text)",
      color: "var(--bg)",
    },
  };

  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      style={{
        ...styles[variant],
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 600,
        fontSize: "13px",
        padding: "9px 18px",
        borderRadius: "10px",
        cursor: "pointer",
        letterSpacing: "0.01em",
        lineHeight: 1,
      }}
    >
      {children}
    </motion.button>
  );
}

// ----- MAIN ANALYTICS PAGE -----
export default function Analytics() {
  const { pollId } = useParams<{ pollId: string }>();
  const authFetch = useAuthFetch();
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [liveCount, setLiveCount] = useState<number | null>(null);
  const [liveFlash, setLiveFlash] = useState(false);
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

  /* ── render guards ── */
  if (loading) return <LoadingState />;
  if (hasError || !data) return <ErrorState />;

  const totalResponses = liveCount ?? data.totalResponses;
  const pollUrl = `${window.location.origin}/poll/${pollId}`;
  const expiryDate = new Date(data.expiresAt);
  const isExpired = expiryDate < new Date();

  const handleCopy = () => {
    navigator.clipboard.writeText(pollUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePublish = async () => {
    await authFetch.patch(`/api/polls/${pollId}/publish`);
    setData((d) => (d ? { ...d, isPublished: true } : d));
  };

  /* ── full render ── */
  return (
    <>
      {/* google fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800;900&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        button { appearance: none; background: none; border: none; cursor: pointer; }
        a { text-decoration: none; }
      `}</style>

      <div className="analytics-root">
        {/* ── NAV BAR ── */}
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 50,
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            background: "color-mix(in srgb, var(--bg) 80%, transparent)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div
            style={{
              maxWidth: "1400px",
              margin: "0 auto",
              padding: "14px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Link
              to="/dashboard"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "13px",
                fontWeight: 500,
                color: "color-mix(in srgb, var(--text) 60%, transparent)",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "color 0.2s",
              }}
            >
              <span style={{ fontSize: "16px" }}>←</span> Dashboard
            </Link>

            <div
              style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 800,
                fontSize: "14px",
                letterSpacing: "0.04em",
                color: "var(--accent)",
              }}
            >
              PulseBoard
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <button
                className="pb-theme-toggle"
                onClick={toggle}
                title="Toggle theme"
                aria-label="Toggle color theme"
              >
                {theme === "dark" ? "☀" : "◑"}
              </button>
              {liveCount !== null && <LiveBadge />}
            </div>
          </div>
        </div>

        <div className="bento-container">

          {/* ── TITLE BLOCK ── */}
          <motion.div
            className="span-4"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{ marginBottom: "32px" }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--accent)",
                    marginBottom: "8px",
                  }}
                >
                  Analytics Report
                </p>
                <h1
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    fontWeight: 900,
                    fontSize: "clamp(22px, 4vw, 32px)",
                    lineHeight: 1.2,
                    color: "var(--text)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {data.title}
                </h1>
              </div>

              {/* status pill */}
              <div
                style={{
                  flexShrink: 0,
                  padding: "6px 14px",
                  borderRadius: "100px",
                  border: `1px solid ${data.isPublished ? "color-mix(in srgb, #22c55e 40%, transparent)" : "var(--border)"}`,
                  background: data.isPublished
                    ? "color-mix(in srgb, #22c55e 10%, transparent)"
                    : "var(--card)",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: data.isPublished
                    ? "#22c55e"
                    : "color-mix(in srgb, var(--text) 50%, transparent)",
                }}
              >
                {data.isPublished ? "● Published" : "○ Draft"}
              </div>
            </div>
          </motion.div>

          {/* ── STATS GRID ── */}
          <motion.div
            className="span-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "12px",
              marginBottom: "20px",
            }}
          >
            {/* total responses — big hero card */}
            <motion.div
              animate={liveFlash ? { scale: [1, 1.03, 1] } : {}}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ scale: 1.02 }}
              style={{
                background: "color-mix(in srgb, var(--accent) 9%, var(--card))",
                border: "1px solid var(--accent)",
                borderRadius: "16px",
                padding: "22px 24px",
                gridColumn: "span 1",
              }}
            >
              <span
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "0.09em",
                  textTransform: "uppercase",
                  color: "var(--accent)",
                  display: "block",
                  marginBottom: "10px",
                }}
              >
                Total Responses
              </span>
              <div
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 900,
                  fontSize: "48px",
                  lineHeight: 1,
                  color: "var(--text)",
                }}
              >
                <AnimatedCounter value={totalResponses} />
              </div>

              {/* THE UPDATED STATUS LOGIC */}
              <div style={{ marginTop: "12px" }}>
                <AnimatePresence mode="wait">
                  {data.isPublished ? (
                    <motion.div
                      key="published"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "12px",
                        color: "var(--accent)",
                        fontWeight: 700,
                      }}
                    >
                      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--accent)" }} />
                      RESULTS PUBLISHED
                    </motion.div>
                  ) : (
                    <motion.div
                      key="live"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "12px",
                        color: "#22c55e",
                        fontWeight: 700,
                      }}
                    >
                      <span className="live-dot" style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22c55e" }} />
                      LIVE UPDATING
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* questions count */}
            <StatCard label="Questions">
              <span
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 800,
                  fontSize: "36px",
                  lineHeight: 1,
                  color: "var(--text)",
                }}
              >
                {data.questions.length}
              </span>
            </StatCard>

            {/* expiry */}
            <StatCard label="Expires" accent={isExpired}>
              <span
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 700,
                  fontSize: "15px",
                  color: isExpired ? "#FF4D00" : "var(--text)",
                  lineHeight: 1.3,
                }}
              >
                {isExpired ? "Expired" : expiryDate.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
              </span>
              <span
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "11px",
                  color: "color-mix(in srgb, var(--text) 45%, transparent)",
                }}
              >
                {isExpired ? "" : expiryDate.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
              </span>
            </StatCard>
          </motion.div>

          <motion.section
            className="span-4 analytics-insight-grid"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="analytics-question-column">
              {/* ── DIVIDER LABEL ── */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "24px",
                }}
              >
                <span
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    fontWeight: 800,
                    fontSize: "12px",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "color-mix(in srgb, var(--text) 40%, transparent)",
                  }}
                >
                  Question Breakdown
                </span>
                <div
                  style={{
                    flex: 1,
                    height: "1px",
                    background: "var(--border)",
                  }}
                />
                <span
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "12px",
                    color: "color-mix(in srgb, var(--text) 40%, transparent)",
                  }}
                >
                  {data.questions.length} total
                </span>
              </div>

              {/* ── QUESTION CARDS ── */}
              {data.questions.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "20px",
                    padding: "60px 32px",
                    textAlign: "center",
                  }}
                >
                  <p
                    style={{
                      fontFamily: "'Syne', sans-serif",
                      fontWeight: 700,
                      fontSize: "18px",
                      color: "var(--text)",
                      marginBottom: "8px",
                    }}
                  >
                    No questions yet
                  </p>
                  <p
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "14px",
                      color: "color-mix(in srgb, var(--text) 50%, transparent)",
                    }}
                  >
                    This poll doesn't have any questions with responses.
                  </p>
                </motion.div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {data.questions.map((q, i) => (
                    <QuestionCard key={q.questionId} q={q} index={i} />
                  ))}
                </div>
              )}
            </div>

            <RealtimePieChart questions={data.questions} totalResponses={totalResponses} />
          </motion.section>

          {/* ── ACTION BAR ── */}
          <motion.div
            className="span-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "16px",
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flexWrap: "wrap",
              marginTop: "4px",
            }}
          >
            <div
              style={{
                flex: 1,
                minWidth: 0,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "12px",
                color: "color-mix(in srgb, var(--text) 50%, transparent)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {pollUrl}
            </div>

            <div style={{ display: "flex", gap: "8px", flexShrink: 0, flexWrap: "wrap" }}>
              <IconButton onClick={handleCopy} variant="default">
                {copied ? "✓ Copied" : "Copy link"}
              </IconButton>

              {!data.isPublished && (
                <IconButton onClick={handlePublish} variant="primary">
                  Publish results
                </IconButton>
              )}

              {data.isPublished && (
                <Link to={`/poll/${pollId}/results`}>
                  <IconButton variant="dark">View public →</IconButton>
                </Link>
              )}
            </div>
          </motion.div>

          {/* ── FOOTER ── */}
          <div
            className="span-4"
            style={{
              marginTop: "56px",
              paddingTop: "24px",
              borderTop: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <span
              style={{
                fontFamily: "'Syne', sans-serif",
                fontWeight: 800,
                fontSize: "13px",
                letterSpacing: "0.06em",
                color: "var(--accent)",
              }}
            >
              PulseBoard
            </span>
            <span
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "12px",
                color: "color-mix(in srgb, var(--text) 35%, transparent)",
              }}
            >
              Poll ID: {data.pollId}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

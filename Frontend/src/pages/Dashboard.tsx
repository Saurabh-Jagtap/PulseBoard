import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthFetch } from "../hooks/useAuthFetch.js";
import { UserButton } from "@clerk/react";
import "./AppTheme.css";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  type Variants,
} from "framer-motion";

interface Poll {
  id: string;
  title: string;
  isActive: boolean;
  isPublished: boolean;
  isAnonymous: boolean;
  expiresAt: string;
  createdAt: string;
}

// ─── Theme hook ──────────────────────────────────────────────
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

// ─── Animation variants ───────────────────────────────────────
const pageVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 300, damping: 28 },
  },
  exit: {
    opacity: 0,
    x: -16,
    scale: 0.97,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

const headerVariants: Variants = {
  hidden: { opacity: 0, y: -12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

// ─── Geometric Empty State ─────────────────────────────────────
function EmptyIllustration() {
  return (
    <motion.div
      style={{ position: "relative", width: 180, height: 160 }}
      initial="hidden"
      animate="visible"
    >
      {/* Back rect */}
      <motion.div
        style={{
          position: "absolute",
          width: 100,
          height: 70,
          borderRadius: 12,
          background: "var(--border)",
          top: 30,
          left: 40,
        }}
        variants={{
          hidden: { opacity: 0, scale: 0.6, rotate: -8 },
          visible: {
            opacity: 1,
            scale: 1,
            rotate: -8,
            transition: { type: "spring", stiffness: 260, damping: 20, delay: 0.1 },
          },
        }}
      />
      {/* Mid rect */}
      <motion.div
        style={{
          position: "absolute",
          width: 110,
          height: 75,
          borderRadius: 12,
          background: "var(--card)",
          border: "1.5px solid var(--border)",
          top: 20,
          left: 34,
          boxShadow: "var(--shadow-card)",
        }}
        variants={{
          hidden: { opacity: 0, scale: 0.6, rotate: 4 },
          visible: {
            opacity: 1,
            scale: 1,
            rotate: 4,
            transition: { type: "spring", stiffness: 260, damping: 20, delay: 0.2 },
          },
        }}
      >
        <motion.div
          style={{
            position: "absolute",
            top: 14,
            left: 14,
            right: 14,
            height: 8,
            borderRadius: 4,
            background: "var(--border)",
          }}
        />
        <motion.div
          style={{
            position: "absolute",
            top: 30,
            left: 14,
            width: "55%",
            height: 8,
            borderRadius: 4,
            background: "var(--border)",
          }}
        />
      </motion.div>
      {/* Front accent card */}
      <motion.div
        style={{
          position: "absolute",
          width: 118,
          height: 80,
          borderRadius: 12,
          background: "var(--card)",
          border: "1.5px solid var(--accent)",
          top: 40,
          left: 30,
          boxShadow: "0 0 0 3px var(--accent-glow), var(--shadow-lifted)",
        }}
        variants={{
          hidden: { opacity: 0, scale: 0.7, y: 16 },
          visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: { type: "spring", stiffness: 300, damping: 22, delay: 0.35 },
          },
        }}
      >
        <motion.div
          style={{
            position: "absolute",
            top: 16,
            left: 14,
            right: 14,
            height: 8,
            borderRadius: 4,
            background: "var(--accent)",
            opacity: 0.6,
          }}
        />
        <motion.div
          style={{
            position: "absolute",
            top: 32,
            left: 14,
            width: "45%",
            height: 8,
            borderRadius: 4,
            background: "var(--accent)",
            opacity: 0.3,
          }}
        />
        <motion.div
          style={{
            position: "absolute",
            top: 48,
            left: 14,
            width: "70%",
            height: 8,
            borderRadius: 4,
            background: "var(--accent)",
            opacity: 0.2,
          }}
        />
      </motion.div>
      {/* Floating accent dot */}
      <motion.div
        style={{
          position: "absolute",
          width: 14,
          height: 14,
          borderRadius: "50%",
          background: "var(--accent)",
          top: 8,
          right: 28,
        }}
        variants={{
          hidden: { opacity: 0, scale: 0 },
          visible: {
            opacity: 1,
            scale: 1,
            transition: { type: "spring", stiffness: 400, damping: 18, delay: 0.5 },
          },
        }}
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Small square */}
      <motion.div
        style={{
          position: "absolute",
          width: 10,
          height: 10,
          borderRadius: 3,
          background: "var(--accent)",
          opacity: 0.45,
          bottom: 18,
          right: 20,
          rotate: 25,
        }}
        variants={{
          hidden: { opacity: 0, scale: 0 },
          visible: {
            opacity: 0.45,
            scale: 1,
            transition: { type: "spring", stiffness: 400, damping: 18, delay: 0.6 },
          },
        }}
        animate={{ rotate: [25, 55, 25] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
}

// ─── Poll Card ─────────────────────────────────────────────────
interface PollCardProps {
  poll: Poll;
  onCopyLink: (id: string) => void;
  onPublish: (id: string) => Promise<void>;
  copied?: boolean;
}

function PollCard({ poll, onCopyLink, onPublish, copied }: PollCardProps) {
  const [publishing, setPublishing] = useState(false);
  const navigate = useNavigate();
  const expired = new Date() > new Date(poll.expiresAt);

  const handlePublish = async () => {
    setPublishing(true);
    try {
      await onPublish(poll.id);
    } finally {
      setPublishing(false);
    }
  };

  const relativeDate = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <motion.div
      className="pb-poll-card"
      variants={cardVariants}
      whileHover={{
        y: -3,
        boxShadow: "var(--shadow-lifted)",
        transition: { type: "spring", stiffness: 400, damping: 28 },
      }}
      layout
    >
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 6,
            flexWrap: "wrap",
          }}
        >
          <h3 className="pb-poll-card__title">{poll.title}</h3>
          <span
            className={`pb-pill ${
              expired ? "pb-pill--inactive" : "pb-pill--active"
            }`}
          >
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: "currentColor",
                display: "inline-block",
              }}
            />
            {expired ? "Expired" : "Live"}
          </span>
          {poll.isPublished && (
            <span className="pb-pill pb-pill--inactive">Published</span>
          )}
        </div>
        <div className="pb-poll-card__meta">
          <span>Created {relativeDate(poll.createdAt)}</span>
          {!expired && (
            <span>
              Expires{" "}
              {new Date(poll.expiresAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          )}
        </div>
      </div>

      <div className="pb-poll-card__actions">
        <motion.button
          className="pb-btn pb-btn--ghost"
          onClick={() => onCopyLink(poll.id)}
          whileTap={{ scale: 0.95 }}
          style={{ 
            fontSize: 13,
            color: copied ? "var(--accent)" : "inherit",
            borderColor: copied ? "var(--accent)" : "transparent"
          }}
          title="Copy shareable link"
        >
          {copied ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          )}
          {copied ? "Copied!" : "Copy"}
        </motion.button>

        <motion.button
          className="pb-btn pb-btn--ghost"
          onClick={() => navigate(`/analytics/${poll.id}`)}
          whileTap={{ scale: 0.95 }}
          style={{ fontSize: 13 }}
        >
          Results
        </motion.button>

        {!poll.isPublished && (
          <motion.button
            className="pb-btn pb-btn--primary"
            onClick={handlePublish}
            disabled={publishing}
            whileTap={{ scale: 0.96 }}
            style={{ fontSize: 13 }}
          >
            {publishing ? "Publishing…" : "Publish"}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────
export default function Dashboard() {
  const authFetch = useAuthFetch();
  const navigate = useNavigate();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { theme, toggle } = useTheme();
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    authFetch
      .get("/api/polls")
      .then((r) => setPolls(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const copyLink = (id: string) => {
  navigator.clipboard.writeText(`${window.location.origin}/poll/${id}`);
  setCopiedId(id);
  setTimeout(() => setCopiedId(null), 2000);
};

  const handlePublish = useCallback(
    async (id: string) => {
      await authFetch.patch(`/api/polls/${id}/publish`);
      setPolls((prev) =>
        prev.map((p) => (p.id === id ? { ...p, isPublished: true } : p))
      );
    },
    [authFetch]
  );

  return (
    <div className="pb-page">
      {/* Header */}
      <motion.header
        className="pb-header"
        variants={headerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="pb-logo">
          <span className="pb-logo-dot" />
          PulseBoard
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <motion.button
            className="pb-btn pb-btn--primary"
            onClick={() => navigate("/create")}
            whileTap={{ scale: 0.96 }}
            whileHover={{
              scale: 1.02,
              transition: { type: "spring", stiffness: 400, damping: 20 },
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Poll
          </motion.button>
          <button
            className="pb-theme-toggle"
            onClick={toggle}
            title="Toggle theme"
            aria-label="Toggle color theme"
          >
            {theme === "dark" ? "☀" : "◑"}
          </button>
          <UserButton />
        </div>
      </motion.header>

      {/* Main */}
      <main
        className="pb-container"
        style={{ paddingTop: 40, paddingBottom: 80 }}
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          style={{ marginBottom: 28 }}
        >
          <h2
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 26,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              color: "var(--text)",
            }}
          >
            Your Polls
          </h2>
          {!loading && polls.length > 0 && (
            <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 4 }}>
              {polls.length} poll{polls.length !== 1 ? "s" : ""}
            </p>
          )}
        </motion.div>

        {/* Loading skeletons */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ display: "flex", flexDirection: "column", gap: 12 }}
            >
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="pb-skeleton"
                  style={{
                    height: 80,
                    background: `linear-gradient(90deg, var(--border) 25%, var(--card) 50%, var(--border) 75%)`,
                    backgroundSize: "200% 100%",
                    animation: `shimmer 1.6s ease-in-out ${i * 0.1}s infinite`,
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state */}
        <AnimatePresence>
          {!loading && polls.length === 0 && (
            <motion.div
              className="pb-empty"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
            >
              <EmptyIllustration />
              <h3 className="pb-empty__title">No polls yet</h3>
              <p className="pb-empty__body">
                Create your first poll and start collecting responses in seconds.
              </p>
              <motion.button
                className="pb-btn pb-btn--primary"
                onClick={() => navigate("/create")}
                whileTap={{ scale: 0.96 }}
                whileHover={{
                  scale: 1.03,
                  transition: { type: "spring", stiffness: 400, damping: 20 },
                }}
                style={{ padding: "11px 24px", fontSize: 14 }}
              >
                Create your first poll
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Poll list */}
        <AnimatePresence>
          {!loading && polls.length > 0 && (
            <motion.div
              variants={shouldReduceMotion ? {} : pageVariants}
              initial="hidden"
              animate="visible"
              style={{ display: "flex", flexDirection: "column", gap: 12 }}
            >
              <AnimatePresence mode="popLayout">
                {polls.map((poll) => (
                  <PollCard
                    key={poll.id}
                    poll={poll}
                    copied={copiedId === poll.id}
                    onCopyLink={copyLink}
                    onPublish={handlePublish}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

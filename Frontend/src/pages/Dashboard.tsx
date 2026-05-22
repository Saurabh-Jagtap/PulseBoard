import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthFetch } from "../hooks/useAuthFetch.js";
import { UserButton } from "@clerk/react";
import "./AppTheme.css";
import { useTheme } from "../hooks/useTheme";
import { EmptyIllustration } from "../components/dashboard/EmptyIllustration";
import { PollCard } from "../components/dashboard/PollCard";
import { motion, AnimatePresence, useReducedMotion, 
  type Variants,
} from "framer-motion";
import type { Poll } from "../types/dashboard.types";

// ----- Animation variants -----
const pageVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } },
};

const headerVariants: Variants = {
  hidden: { opacity: 0, y: -12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

// ----- Dashboard -----
export default function Dashboard() {
  const authFetch = useAuthFetch();
  const navigate = useNavigate();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { theme, toggleTheme } = useTheme();
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

  const handleDelete = useCallback(
    async (id: string) => {
      await authFetch.delete(`/api/polls/${id}`);
      // AnimatePresence + mode="popLayout" handles the exit animation automatically
      setPolls((prev) => prev.filter((p) => p.id !== id));
    },
    [authFetch]
  );

  return (
    <div className="pb-page" style={{ maxWidth: "none" }}>
      {/* Header */}
      <motion.header
        className="pb-header"
        variants={headerVariants}
        initial="hidden"
        animate="visible"
        style={{ maxWidth: "none", width: "100%", boxSizing: "border-box" }}
      >
        <a className="pb-logo" href="/">
          <span className="pb-logo-dot" />
          PulseBoard
        </a>
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
            onClick={toggleTheme}
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
                    onDelete={handleDelete}
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

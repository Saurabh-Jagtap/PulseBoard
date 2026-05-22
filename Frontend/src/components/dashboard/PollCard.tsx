import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DeleteConfirmModal } from "./DeleteConfirmModal";
import { AnimatePresence, motion,
    type Variants,
} from "framer-motion";
import type { Poll } from "../../types/dashboard.types";

interface PollCardProps {
  poll: Poll;
  onCopyLink: (id: string) => void;
  onPublish: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  copied?: boolean;
}

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

export function PollCard({ poll, onCopyLink, onPublish, onDelete, copied }: PollCardProps) {
  const [publishing, setPublishing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
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

  const handleDelete = () => setShowDeleteModal(true);

  const confirmDelete = async () => {
    setDeleting(true);
    try { await onDelete(poll.id); }
    finally { setDeleting(false); setShowDeleteModal(false); }
  };

  const formatRelativeDate = (dateStr: string) => {
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
    <>
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
              className={`pb-pill ${expired ? "pb-pill--inactive" : "pb-pill--active"
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
            <span>Created {formatRelativeDate(poll.createdAt)}</span>
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
          {/* ----- COPY BUTTON ----- */}
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

          {/* ----- PUBLISH BUTTON ----- */}
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

          {/* ----- DELETE BUTTON ----- */}
          <motion.button
            className="pb-btn pb-btn--ghost"
            onClick={handleDelete}
            disabled={deleting}
            whileTap={{ scale: 0.95 }}
            style={{
              fontSize: 13,
              color: deleting ? "var(--muted)" : "#e53e3e",
              borderColor: "transparent",
            }}
            title="Delete poll"
            aria-label="Delete poll"
          >
            {deleting ? (
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                style={{ display: "inline-block", fontSize: 13 }}
              >
                ◌
              </motion.span>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4h6v2" />
              </svg>
            )}

          </motion.button>
        </div>
      </motion.div>

      <AnimatePresence>
        {showDeleteModal && (
          <DeleteConfirmModal
            pollTitle={poll.title}
            onConfirm={confirmDelete}
            onCancel={() => setShowDeleteModal(false)}
            isDeleting={deleting}
          />
        )}
      </AnimatePresence>
    </>
  );
}
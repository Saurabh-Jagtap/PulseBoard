import { useEffect, useRef } from "react";
import { motion} from "framer-motion";

interface DeleteConfirmModalProps {
  pollTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

export function DeleteConfirmModal({
  pollTitle,
  onConfirm,
  onCancel,
  isDeleting,
}: DeleteConfirmModalProps) {
  // Close on Escape key
  const onCancelRef = useRef(onCancel);
  useEffect(() => { onCancelRef.current = onCancel; });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onCancelRef.current(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    /* Backdrop */
    <motion.div
      key="delete-modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onCancel}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 16px",
      }}
    >
      {/* Dialog panel — stop click propagation so it doesn't close */}
      <motion.div
        key="delete-modal-panel"
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }}
        transition={{ type: "spring", stiffness: 340, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 20,
          padding: "32px 28px 24px",
          width: "100%",
          maxWidth: 400,
          boxShadow: "0 24px 64px -12px rgba(0,0,0,0.35)",
          display: "flex",
          flexDirection: "column",
          gap: 0,
        }}
      >
        {/* Icon */}
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: "color-mix(in srgb, #e53e3e 12%, transparent)",
            border: "1px solid color-mix(in srgb, #e53e3e 28%, transparent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 18,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e53e3e" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4h6v2" />
          </svg>
        </div>

        {/* Text */}
        <p
          style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            fontSize: 17,
            color: "var(--text)",
            marginBottom: 8,
            letterSpacing: "-0.02em",
          }}
        >
          Delete this poll?
        </p>
        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            color: "var(--muted)",
            lineHeight: 1.55,
            marginBottom: 28,
          }}
        >
          <strong style={{ color: "var(--text)", fontWeight: 600 }}>"{pollTitle}"</strong> will be permanently deleted along with all its responses. This cannot be undone.
        </p>

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <motion.button
            className="pb-btn pb-btn--ghost"
            onClick={onCancel}
            disabled={isDeleting}
            whileTap={{ scale: 0.96 }}
            style={{ fontSize: 13 }}
          >
            Cancel
          </motion.button>
          <motion.button
            className="pb-btn"
            onClick={onConfirm}
            disabled={isDeleting}
            whileTap={{ scale: 0.96 }}
            style={{
              fontSize: 13,
              background: "#e53e3e",
              color: "#fff",
              border: "1px solid #e53e3e",
              opacity: isDeleting ? 0.65 : 1,
              minWidth: 90,
              justifyContent: "center",
            }}
          >
            {isDeleting ? (
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                style={{ display: "inline-block" }}
              >
                ◌
              </motion.span>
            ) : (
              "Delete"
            )}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
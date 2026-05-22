import { motion } from "framer-motion";

export function LiveBadge() {
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
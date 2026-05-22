import { motion } from "framer-motion";

export function LoadingState() {
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
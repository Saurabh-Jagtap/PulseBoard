import { motion } from "framer-motion";
import type { OptionSummary } from "../../types/analytics.types";

interface OptionBarProps {
  opt: OptionSummary;
  rank: number;
}

export function OptionBar({ opt, rank }: OptionBarProps) {
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
import {
  motion,
  AnimatePresence,
  type Variants,
} from "framer-motion";
import type { QuestionInput } from "../../types/createPoll.types";
import { OptionRow } from "./OptionRow";


interface QuestionCardProps {
  question: QuestionInput;
  index: number;
  total: number;
  isFocused: boolean;
  onFocus: () => void;
  onChange: (field: keyof QuestionInput, value: unknown) => void;
  onOptionChange: (oi: number, value: string) => void;
  onAddOption: () => void;
  onRemoveOption: (oi: number) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

const slideIn: Variants = {
  hidden: { opacity: 0, y: 18, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 320, damping: 26 },
  },
  exit: {
    opacity: 0,
    y: -12,
    scale: 0.97,
    transition: { duration: 0.18, ease: "easeIn" },
  },
};

export function QuestionCard({
  question,
  index,
  total,
  isFocused,
  onFocus,
  onChange,
  onOptionChange,
  onAddOption,
  onRemoveOption,
  onRemove,
  onMoveUp,
  onMoveDown,
}: QuestionCardProps) {
  return (
    <motion.div
      variants={slideIn}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
      className={`pb-question-card ${isFocused ? "pb-question-card--focused" : ""}`}
      onClick={onFocus}
    >
      {/* Card header */}
      <div className="pb-question-card__header">
        <span className="pb-question-num">Q{index + 1}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {/* Move up/down */}
          <motion.button
            onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
            disabled={index === 0}
            style={{
              width: 28, height: 28, borderRadius: 7,
              background: "transparent", border: "1px solid var(--border)",
              color: "var(--muted)", cursor: index === 0 ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              opacity: index === 0 ? 0.35 : 1, fontSize: 13,
            }}
            whileTap={{ scale: 0.9 }}
            aria-label="Move question up"
          >
            ↑
          </motion.button>
          <motion.button
            onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
            disabled={index === total - 1}
            style={{
              width: 28, height: 28, borderRadius: 7,
              background: "transparent", border: "1px solid var(--border)",
              color: "var(--muted)", cursor: index === total - 1 ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              opacity: index === total - 1 ? 0.35 : 1, fontSize: 13,
            }}
            whileTap={{ scale: 0.9 }}
            aria-label="Move question down"
          >
            ↓
          </motion.button>

          {/* Mandatory toggle */}
          <motion.label
            style={{
              display: "flex", alignItems: "center", gap: 5,
              fontSize: 12, color: question.isMandatory ? "var(--accent)" : "var(--muted)",
              cursor: "pointer", userSelect: "none", padding: "4px 8px",
              borderRadius: 6, border: "1px solid",
              borderColor: question.isMandatory ? "var(--accent)" : "var(--border)",
              background: question.isMandatory ? "var(--accent-dim)" : "transparent",
              transition: "all 0.2s ease",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="checkbox"
              checked={question.isMandatory}
              onChange={(e) => onChange("isMandatory", e.target.checked)}
              style={{ display: "none" }}
            />
            {question.isMandatory ? "★ Required" : "☆ Optional"}
          </motion.label>

          {/* Remove question */}
          {total > 1 && (
            <motion.button
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              style={{
                width: 28, height: 28, borderRadius: 7,
                background: "transparent", border: "1px solid var(--border)",
                color: "var(--muted)", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16, lineHeight: 1,
              }}
              whileHover={{ background: "rgba(255,77,0,0.08)", color: "#FF4D00", borderColor: "rgba(255,77,0,0.3)" }}
              whileTap={{ scale: 0.9 }}
              aria-label="Remove question"
            >
              ×
            </motion.button>
          )}
        </div>
      </div>

      {/* Question text */}
      <input
        className="pb-input"
        value={question.questionText}
        onClick={(e) => { e.stopPropagation(); onFocus(); }}
        onChange={(e) => onChange("questionText", e.target.value)}
        placeholder="What would you like to ask?"
        style={{ marginBottom: 14, fontFamily: "'Syne', sans-serif", fontWeight: 600, fontSize: 15 }}
      />

      {/* Options */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <AnimatePresence mode="popLayout">
          {question.options.map((option, optionIndex) => (
            <OptionRow
              key={optionIndex}
              option={option}
              optionIndex={optionIndex}
              canRemove={question.options.length > 2}
              onChange={(val) => onOptionChange(optionIndex, val)}
              onRemove={() => onRemoveOption(optionIndex)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Add option */}
      <motion.button
        onClick={(e) => { e.stopPropagation(); onAddOption(); }}
        style={{
          marginTop: 10, background: "transparent", border: "1.5px dashed var(--border)",
          borderRadius: 9, padding: "8px 14px", fontSize: 13,
          color: "var(--muted)", cursor: "pointer", width: "100%",
          fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s ease",
        }}
        whileHover={{ borderColor: "var(--accent)", color: "var(--accent)" }}
        whileTap={{ scale: 0.99 }}
        disabled={question.options.length >= 8}
      >
        + Add option
      </motion.button>
    </motion.div>
  );
}
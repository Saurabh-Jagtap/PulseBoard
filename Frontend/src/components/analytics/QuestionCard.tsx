import { motion, AnimatePresence } from "framer-motion";
import type { QuestionSummary } from "../../types/analytics.types";
import { OptionBar } from "./OptionBar";

interface QuestionCardProps {
  question: QuestionSummary;
  index: number;
}

export function QuestionCard({ question, index }: QuestionCardProps) {
  const sortedOptions = [...question.options].sort((a, b) => b.count - a.count);

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

      <p className="pb-question-text">{question.questionText}</p>

      {question.isMandatory && <span className="pb-required-badge">Required</span>}

      <motion.div layout className="pb-options-list">
        <AnimatePresence initial={false}>
          {sortedOptions.map((opt, rank) => (
            <OptionBar key={opt.optionId} opt={opt} rank={rank} />
          ))}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
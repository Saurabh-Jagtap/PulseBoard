import { motion } from "framer-motion";

export interface StepperProps {
  totalQuestions: number;
  filledQuestions: number;
  hasMeta: boolean;
}

export function Stepper({ totalQuestions, filledQuestions, hasMeta }: StepperProps) {
  const totalSteps = 2 + totalQuestions; // meta + questions + publish
  const filledSteps = (hasMeta ? 1 : 0) + filledQuestions;
  const progress = totalSteps > 0 ? filledSteps / totalSteps : 0;

  return (
    <div style={{ marginBottom: 28 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <span
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--muted)",
          }}
        >
          Poll Builder
        </span>
        <span
          style={{
            fontSize: 11,
            color: "var(--muted)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {Math.round(progress * 100)}% complete
        </span>
      </div>
      <div
        style={{
          height: 4,
          borderRadius: 4,
          background: "var(--track, var(--border))",
          overflow: "hidden",
        }}
      >
        <motion.div
          style={{
            height: "100%",
            background: "var(--accent)",
            borderRadius: 4,
            transformOrigin: "left",
          }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: progress }}
          transition={{ type: "spring", stiffness: 160, damping: 24 }}
        />
      </div>
    </div>
  );
}
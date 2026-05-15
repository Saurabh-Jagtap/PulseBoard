import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api.js";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

interface OptionSummary {
  optionId: string;
  optionText: string;
  count: number;
  percentage: number;
}
interface QuestionSummary {
  questionId: string;
  questionText: string;
  options: OptionSummary[];
}
interface Results {
  pollId: string;
  title: string;
  totalResponses: number;
  questions: QuestionSummary[];
}

// ─── Animated progress bar ────────────────────────────────────
interface BarProps {
  option: OptionSummary;
  isWinner: boolean;
  delay: number;
}

function ResultBar({ option, isWinner, delay }: BarProps) {
  const [mounted, setMounted] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), delay * 1000);
    return () => clearTimeout(t);
  }, [delay]);

  const targetWidth = mounted ? option.percentage : 0;

  return (
    <motion.div layout style={{ marginBottom: 0 }}>
      {/* Label row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 7,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          {isWinner && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 18, delay: delay + 0.4 }}
              style={{
                display: "inline-block",
                width: 20,
                height: 20,
                borderRadius: 5,
                background: "var(--accent)",
                color: "#fff",
                fontSize: 10,
                fontWeight: 800,
                textAlign: "center",
                lineHeight: "20px",
                flexShrink: 0,
              }}
            >
              #1
            </motion.span>
          )}
          <span
            style={{
              fontSize: 14,
              fontWeight: isWinner ? 700 : 400,
              color: isWinner ? "var(--accent)" : "var(--text)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {option.optionText}
          </span>
        </div>
        <span
          style={{
            fontSize: 13,
            color: "var(--muted)",
            fontVariantNumeric: "tabular-nums",
            marginLeft: 12,
            flexShrink: 0,
          }}
        >
          {option.count} · {option.percentage}%
        </span>
      </div>

      {/* Track */}
      <div
        style={{
          height: 8,
          borderRadius: 100,
          background: "var(--track, var(--border))",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <motion.div
          style={{
            height: "100%",
            borderRadius: 100,
            background: isWinner ? "var(--accent)" : "var(--border)",
            transformOrigin: "left",
          }}
          initial={{ scaleX: 0 }}
          animate={{
            scaleX: shouldReduceMotion ? targetWidth / 100 : targetWidth / 100,
          }}
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : {
                  type: "spring",
                  stiffness: 80,
                  damping: 18,
                  delay: delay + 0.05,
                }
          }
        />
      </div>
    </motion.div>
  );
}

// ─── Question Card ────────────────────────────────────────────
interface QuestionCardProps {
  question: QuestionSummary;
  index: number;
  delay: number;
}

function QuestionCard({ question, index, delay }: QuestionCardProps) {
  const sorted = [...question.options].sort((a, b) => b.count - a.count);

  return (
    <motion.div
      layout
      className="pb-card"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 26,
        delay,
      }}
    >
      {/* Question heading */}
      <div style={{ marginBottom: 20 }}>
        <span
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--accent)",
            display: "block",
            marginBottom: 4,
          }}
        >
          Q{index + 1}
        </span>
        <h3
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 17,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: "var(--text)",
          }}
        >
          {question.questionText}
        </h3>
      </div>

      {/* Bars with layout animation — reorders when counts change */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <AnimatePresence mode="popLayout" initial={false}>
          {sorted.map((opt, oi) => (
            <ResultBar
              key={opt.optionId}
              option={opt}
              isWinner={oi === 0 && opt.count > 0}
              delay={delay + oi * 0.07}
            />
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Stat Badge ───────────────────────────────────────────────
function StatBadge({
  label,
  value,
  delay,
}: {
  label: string;
  value: string | number;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 24, delay }}
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "12px 20px",
        textAlign: "center",
        minWidth: 100,
      }}
    >
      <div
        style={{
          fontFamily: "'Syne', sans-serif",
          fontSize: 22,
          fontWeight: 800,
          color: "var(--accent)",
          letterSpacing: "-0.03em",
          lineHeight: 1.1,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 11,
          color: "var(--muted)",
          textTransform: "uppercase",
          letterSpacing: "0.07em",
          marginTop: 3,
          fontWeight: 500,
        }}
      >
        {label}
      </div>
    </motion.div>
  );
}

// ─── PollResults ──────────────────────────────────────────────
export default function PollResults() {
  const { pollId } = useParams<{ pollId: string }>();
  const [data, setData] = useState<Results | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Optional live refresh every 15 seconds
  useEffect(() => {
    const load = () => {
      api
        .get(`/api/polls/${pollId}/results`)
        .then((r) => setData(r.data.data))
        .catch(() => setError("Results not available yet"))
        .finally(() => setLoading(false));
    };
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, [pollId]);

  // ── Loading ───────────────────────────────────────────────
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background: "var(--bg)",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            border: "3px solid var(--border)",
            borderTopColor: "var(--accent)",
          }}
        />
        <span style={{ color: "var(--muted)", fontSize: 14 }}>
          Loading results…
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background: "var(--bg)",
          padding: 24,
          textAlign: "center",
        }}
      >
        <div>
          <p
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 18,
              fontWeight: 700,
              color: "var(--muted)",
              marginBottom: 8,
            }}
          >
            {error}
          </p>
          <p style={{ fontSize: 14, color: "var(--muted)" }}>
            Results will appear here once the poll creator publishes them.
          </p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div
      className="pb-page"
      style={{ paddingTop: 40, paddingBottom: 80, paddingLeft: 16, paddingRight: 16 }}
    >
      <div className="pb-container--narrow">
        {/* Hero header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 26 }}
          style={{ textAlign: "center", marginBottom: 32 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 22 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "var(--accent-dim)",
              border: "1px solid var(--accent)",
              borderRadius: 100,
              padding: "4px 14px",
              marginBottom: 14,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--accent)",
                display: "inline-block",
                animation: "pulse 2s ease infinite",
              }}
            />
            <span
              style={{
                fontFamily: "'Syne', sans-serif",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--accent)",
              }}
            >
              Results
            </span>
          </motion.div>

          <h1
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 26,
              fontWeight: 800,
              letterSpacing: "-0.04em",
              color: "var(--text)",
              marginBottom: 20,
              lineHeight: 1.15,
            }}
          >
            {data.title}
          </h1>

          {/* Stats row */}
          <div
            style={{
              display: "flex",
              gap: 10,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <StatBadge
              label="Responses"
              value={data.totalResponses}
              delay={0.15}
            />
            <StatBadge
              label="Questions"
              value={data.questions.length}
              delay={0.2}
            />
            <StatBadge
              label="Options"
              value={data.questions.reduce((acc, q) => acc + q.options.length, 0)}
              delay={0.25}
            />
          </div>
        </motion.div>

        {/* Question cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {data.questions.map((q, i) => (
            <QuestionCard
              key={q.questionId}
              question={q}
              index={i}
              delay={0.15 + i * 0.08}
            />
          ))}
        </div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 + data.questions.length * 0.08 }}
          style={{
            textAlign: "center",
            fontSize: 12,
            color: "var(--muted)",
            marginTop: 32,
          }}
        >
          Results refresh automatically every 15 seconds.
        </motion.p>
      </div>
    </div>
  );
}

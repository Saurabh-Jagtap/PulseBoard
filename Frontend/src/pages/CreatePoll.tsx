import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthFetch } from "../hooks/useAuthFetch.js";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  type Variants,
} from "framer-motion";

interface OptionInput {
  optionText: string;
  displayOrder: number;
}

interface QuestionInput {
  questionText: string;
  isMandatory: boolean;
  displayOrder: number;
  options: OptionInput[];
}

// ─── Framer variants ──────────────────────────────────────────
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

const optionSlideIn: Variants = {
  hidden: { opacity: 0, x: -12, scale: 0.97 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 380, damping: 28 },
  },
  exit: {
    opacity: 0,
    x: 16,
    scale: 0.96,
    transition: { duration: 0.15, ease: "easeIn" },
  },
};

// ─── Progress Stepper ─────────────────────────────────────────
interface StepperProps {
  totalQuestions: number;
  filledQuestions: number;
  hasMeta: boolean;
}

function Stepper({ totalQuestions, filledQuestions, hasMeta }: StepperProps) {
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

// ─── Option Row ───────────────────────────────────────────────
interface OptionRowProps {
  option: OptionInput;
  optionIndex: number;
  questionIndex: number;
  canRemove: boolean;
  onChange: (value: string) => void;
  onRemove: () => void;
}

function OptionRow({
  option,
  optionIndex,
  canRemove,
  onChange,
  onRemove,
}: OptionRowProps) {
  return (
    <motion.div
      className="pb-option-row"
      variants={optionSlideIn}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
    >
      <div
        className="pb-option-handle"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: 10,
            fontWeight: 700,
            color: "var(--muted)",
          }}
        >
          {optionIndex + 1}
        </span>
      </div>
      <input
        className="pb-input"
        value={option.optionText}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Option ${optionIndex + 1}`}
        style={{ flex: 1 }}
      />
      <AnimatePresence>
        {canRemove && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            onClick={onRemove}
            style={{
              width: 28,
              height: 28,
              borderRadius: 7,
              background: "transparent",
              border: "1px solid var(--border)",
              color: "var(--muted)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              fontSize: 16,
              lineHeight: 1,
              transition: "all 0.15s ease",
            }}
            whileHover={{ background: "rgba(255,77,0,0.08)", color: "#FF4D00", borderColor: "rgba(255,77,0,0.3)" }}
            whileTap={{ scale: 0.9 }}
            aria-label="Remove option"
          >
            ×
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Question Card ────────────────────────────────────────────
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

function QuestionCard({
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
          {question.options.map((opt, oi) => (
            <OptionRow
              key={oi}
              option={opt}
              optionIndex={oi}
              questionIndex={index}
              canRemove={question.options.length > 2}
              onChange={(val) => onOptionChange(oi, val)}
              onRemove={() => onRemoveOption(oi)}
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

// ─── CreatePoll ───────────────────────────────────────────────
export default function CreatePoll() {
  const authFetch = useAuthFetch();
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const [focusedQuestion, setFocusedQuestion] = useState<number>(0);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [expiresAt, setExpiresAt] = useState("");
  const [questions, setQuestions] = useState<QuestionInput[]>([
    {
      questionText: "",
      isMandatory: true,
      displayOrder: 0,
      options: [
        { optionText: "", displayOrder: 0 },
        { optionText: "", displayOrder: 1 },
      ],
    },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Stepper calculation
  const hasMeta = Boolean(title.trim() && expiresAt);
  const filledQuestions = questions.filter(
    (q) =>
      q.questionText.trim() &&
      q.options.length >= 2 &&
      q.options.every((o) => o.optionText.trim())
  ).length;

  const addQuestion = () => {
    const newIndex = questions.length;
    setQuestions((prev) => [
      ...prev,
      {
        questionText: "",
        isMandatory: false,
        displayOrder: newIndex,
        options: [
          { optionText: "", displayOrder: 0 },
          { optionText: "", displayOrder: 1 },
        ],
      },
    ]);
    setFocusedQuestion(newIndex);
  };

  const removeQuestion = (qi: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== qi));
    setFocusedQuestion(Math.max(0, qi - 1));
  };

  const updateQuestion = (qi: number, field: keyof QuestionInput, value: unknown) =>
    setQuestions((prev) => prev.map((q, i) => (i === qi ? { ...q, [field]: value } : q)));

  const addOption = (qi: number) =>
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qi
          ? { ...q, options: [...q.options, { optionText: "", displayOrder: q.options.length }] }
          : q
      )
    );

  const removeOption = (qi: number, oi: number) =>
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qi ? { ...q, options: q.options.filter((_, j) => j !== oi) } : q
      )
    );

  const updateOption = (qi: number, oi: number, value: string) =>
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qi
          ? { ...q, options: q.options.map((o, j) => (j === oi ? { ...o, optionText: value } : o)) }
          : q
      )
    );

  const moveUp = (qi: number) => {
    if (qi === 0) return;
    setQuestions((prev) => {
      const updated = [...prev];
      [updated[qi - 1], updated[qi]] = [updated[qi], updated[qi - 1]];
      return updated.map((q, i) => ({ ...q, displayOrder: i }));
    });
  };

  const moveDown = (qi: number) => {
    if (qi === questions.length - 1) return;
    setQuestions((prev) => {
      const updated = [...prev];
      [updated[qi], updated[qi + 1]] = [updated[qi + 1], updated[qi]];
      return updated.map((q, i) => ({ ...q, displayOrder: i }));
    });
  };

  const handleSubmit = async () => {
    setError("");
    if (!title.trim()) return setError("Title is required");
    if (!expiresAt) return setError("Expiry date is required");
    if (new Date(expiresAt) <= new Date()) return setError("Expiry must be in the future");

    for (const q of questions) {
      if (!q.questionText.trim()) return setError("All questions need text");
      if (q.options.length < 2) return setError("Each question needs at least 2 options");
      if (q.options.some((o) => !o.optionText.trim())) return setError("All options need text");
    }

    setSubmitting(true);
    try {
      const res = await authFetch.post("/api/polls", {
        title,
        description,
        isAnonymous,
        expiresAt: new Date(expiresAt).toISOString(),
        questions,
      });
      navigate(`/analytics/${res.data.data.id}`);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pb-page">
      {/* Minimal header */}
      <header className="pb-header">
        <div className="pb-logo">
          <span className="pb-logo-dot" />
          PulseBoard
        </div>
        <motion.button
          className="pb-btn pb-btn--ghost"
          onClick={() => navigate("/dashboard")}
          whileTap={{ scale: 0.96 }}
          style={{ fontSize: 13 }}
        >
          ← Back
        </motion.button>
      </header>

      <main
        className="pb-container--narrow"
        style={{ paddingTop: 40, paddingBottom: 80 }}
      >
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1
            style={{
              fontFamily: "'Syne', sans-serif",
              fontSize: 28,
              fontWeight: 800,
              letterSpacing: "-0.04em",
              color: "var(--text)",
              marginBottom: 28,
            }}
          >
            Create a new poll
          </h1>

          {/* Progress stepper */}
          <Stepper
            totalQuestions={questions.length}
            filledQuestions={filledQuestions}
            hasMeta={hasMeta}
          />

          {/* Error banner */}
          <AnimatePresence>
            {error && (
              <motion.div
                className="pb-alert pb-alert--error"
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                transition={{ type: "spring", stiffness: 320, damping: 26 }}
                style={{ marginBottom: 16, overflow: "hidden" }}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Meta card */}
            <motion.div
              className="pb-card"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05, type: "spring", stiffness: 280, damping: 26 }}
            >
              <h2
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--muted)",
                  marginBottom: 16,
                }}
              >
                Poll Details
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div className="pb-field">
                  <label className="pb-label">Title *</label>
                  <input
                    className="pb-input"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What's this poll about?"
                    style={{ fontFamily: "'Syne', sans-serif", fontWeight: 600, fontSize: 15 }}
                  />
                </div>
                <div className="pb-field">
                  <label className="pb-label">Description</label>
                  <textarea
                    className="pb-textarea"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    placeholder="Optional context for respondents"
                  />
                </div>
                <div className="pb-field">
                  <label className="pb-label">Expires at *</label>
                  <input
                    type="datetime-local"
                    className="pb-input"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                  />
                </div>
                <motion.label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    cursor: "pointer",
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "1.5px solid",
                    borderColor: isAnonymous ? "var(--accent)" : "var(--border)",
                    background: isAnonymous ? "var(--accent-dim)" : "transparent",
                    transition: "all 0.2s ease",
                    userSelect: "none",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    style={{ display: "none" }}
                  />
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 5,
                      border: "2px solid",
                      borderColor: isAnonymous ? "var(--accent)" : "var(--border)",
                      background: isAnonymous ? "var(--accent)" : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      transition: "all 0.2s ease",
                    }}
                  >
                    {isAnonymous && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        style={{ color: "#fff", fontSize: 11, fontWeight: 700, lineHeight: 1 }}
                      >
                        ✓
                      </motion.span>
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>
                      Allow anonymous responses
                    </div>
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>
                      Respondents won't be identified
                    </div>
                  </div>
                </motion.label>
              </div>
            </motion.div>

            {/* Questions */}
            <AnimatePresence mode="popLayout">
              {questions.map((q, qi) => (
                <QuestionCard
                  key={qi}
                  question={q}
                  index={qi}
                  total={questions.length}
                  isFocused={focusedQuestion === qi}
                  onFocus={() => setFocusedQuestion(qi)}
                  onChange={(field, value) => updateQuestion(qi, field, value)}
                  onOptionChange={(oi, value) => updateOption(qi, oi, value)}
                  onAddOption={() => addOption(qi)}
                  onRemoveOption={(oi) => removeOption(qi, oi)}
                  onRemove={() => removeQuestion(qi)}
                  onMoveUp={() => moveUp(qi)}
                  onMoveDown={() => moveDown(qi)}
                />
              ))}
            </AnimatePresence>

            {/* Add question */}
            <motion.button
              onClick={addQuestion}
              style={{
                background: "transparent",
                border: "1.5px dashed var(--border)",
                borderRadius: 14,
                padding: "16px 24px",
                fontSize: 14,
                color: "var(--muted)",
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                transition: "all 0.2s ease",
              }}
              whileHover={{
                borderColor: "var(--accent)",
                color: "var(--accent)",
                background: "var(--accent-dim)",
              }}
              whileTap={{ scale: 0.99 }}
              layout
            >
              + Add another question
            </motion.button>

            {/* Submit */}
            <motion.button
              className="pb-btn pb-btn--primary pb-btn--full"
              onClick={handleSubmit}
              disabled={submitting}
              whileHover={
                !submitting
                  ? {
                      scale: 1.01,
                      transition: { type: "spring", stiffness: 400, damping: 20 },
                    }
                  : undefined
              }
              whileTap={!submitting ? { scale: 0.98 } : undefined}
              layout
            >
              {submitting ? (
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                    style={{ display: "inline-block", fontSize: 14 }}
                  >
                    ◌
                  </motion.span>
                  Creating…
                </span>
              ) : (
                "Create poll →"
              )}
            </motion.button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthFetch } from "../hooks/useAuthFetch.js";
import { useTheme } from "../hooks/useTheme";
import { Stepper } from "../components/create-poll/Stepper.js";
import { QuestionCard } from "../components/create-poll/QuestionCard.js";
import { type QuestionInput } from "../types/createPoll.types.js";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { validatePoll } from "../utils/ValidatePoll.js";

// ----- CreatePoll -----
export default function CreatePoll() {
  const authFetch = useAuthFetch();
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const [focusedQuestion, setFocusedQuestion] = useState<number>(0);
  const { theme, toggleTheme } = useTheme();

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
    const validation = validatePoll(
      title,
      expiresAt,
      questions
    );

    if (!validation.isValid) {
      setError(validation.error ?? "Invalid poll");

      return;
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
    <div className="pb-page" style={{ maxWidth: "none" }}>
      {/* Minimal header */}
      <header className="pb-header" style={{ maxWidth: "none", width: "100%", boxSizing: "border-box" }}>
        <a className="pb-logo" href="/">
          <span className="pb-logo-dot" />
          PulseBoard
        </a>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
          <motion.button
            className="pb-btn pb-btn--ghost"
            onClick={() => navigate("/dashboard")}
            whileTap={{ scale: 0.96 }}
            style={{ fontSize: 13 }}
          >
            ← Back
          </motion.button>

          <button
            className="pb-theme-toggle"
            onClick={toggleTheme}
            title="Toggle theme"
            aria-label="Toggle color theme"
          >
            {theme === "dark" ? "☀" : "◑"}
          </button>
        </div>
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

          <div style={{ display: "flex", flexDirection: "row", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
            {/* Meta card */}
            <motion.div
              className="pb-card"
              style={{ flex: "1 1 340px" }}
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

            <div style={{ display: "flex", flexDirection: "column", gap: 16, flex: "2 1 480px" }}>
              {/* Questions */}
              <AnimatePresence mode="popLayout">
                {questions.map((question, questionIndex) => (
                  <QuestionCard
                    key={questionIndex}
                    question={question}
                    index={questionIndex}
                    total={questions.length}
                    isFocused={focusedQuestion === questionIndex}
                    onFocus={() => setFocusedQuestion(questionIndex)}
                    onChange={(field, value) => updateQuestion(questionIndex, field, value)}
                    onOptionChange={(optionIndex, value) => updateOption(questionIndex, optionIndex, value)}
                    onAddOption={() => addOption(questionIndex)}
                    onRemoveOption={(optionIndex) => removeOption(questionIndex, optionIndex)}
                    onRemove={() => removeQuestion(questionIndex)}
                    onMoveUp={() => moveUp(questionIndex)}
                    onMoveDown={() => moveDown(questionIndex)}
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
          </div>
        </motion.div>
      </main>
    </div>
  );
}

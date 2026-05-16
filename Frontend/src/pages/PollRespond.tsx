import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "@clerk/react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api.js";
import { useAuthFetch } from "../hooks/useAuthFetch.js";
import CountdownTimer from "../components/CountDownTimer.js";

interface Option {
  id: string;
  optionText: string;
}
interface Question {
  id: string;
  questionText: string;
  isMandatory: boolean;
  options: Option[];
}
interface Poll {
  id: string;
  title: string;
  description?: string;
  isAnonymous: boolean;
  isPublished: boolean;
  isActive: boolean;
  questions: Question[];
  expiresAt: string;
}

// stable session token per browser for anonymous dedup
const getSessionToken = (): string => {
  const KEY = "pb_session_token";
  let token = localStorage.getItem(KEY);
  if (!token) {
    token = crypto.randomUUID();
    localStorage.setItem(KEY, token);
  }
  return token;
};

// ── Minimalist confetti squares on success ────────────────────────────────────
const CONFETTI_COLORS = ["#FF4D00", "#C5FF44", "#FFB347", "#00C2FF", "#FF6EB4"];

function Confetti() {
  const pieces = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    x: (Math.random() - 0.5) * 300,
    y: -(Math.random() * 200 + 80),
    rotate: Math.random() * 360,
    size: Math.random() * 8 + 6,
    delay: Math.random() * 0.3,
  }));

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
          animate={{
            x: p.x,
            y: p.y,
            opacity: 0,
            rotate: p.rotate,
            scale: 0.3,
          }}
          transition={{ duration: 1.2, delay: p.delay, ease: [0.22, 1, 0.36, 1] }}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: p.size,
            height: p.size,
            background: p.color,
            borderRadius: "2px",
          }}
        />
      ))}
    </div>
  );
}

// ── Login wall — shown when poll requires auth but user is not signed in ───────
// function LoginWall({ pollTitle }: { pollTitle: string }) {
//   return (
//     <div
//       style={{
//         minHeight: "100vh",
//         background: "var(--bg)",
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//         justifyContent: "center",
//         padding: "40px 24px",
//         gap: "32px",
//       }}
//     >
//       <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');`}</style>

//       <motion.div
//         initial={{ opacity: 0, y: 24 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
//         style={{ textAlign: "center", maxWidth: "420px" }}
//       >
//         {/* lock icon */}
//         <motion.div
//           initial={{ scale: 0.5, opacity: 0 }}
//           animate={{ scale: 1, opacity: 1 }}
//           transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
//           style={{
//             width: "64px",
//             height: "64px",
//             borderRadius: "18px",
//             background: "color-mix(in srgb, var(--accent) 12%, var(--card))",
//             border: "1px solid color-mix(in srgb, var(--accent) 30%, transparent)",
//             display: "flex",
//             alignItems: "center",
//             justifyContent: "center",
//             fontSize: "28px",
//             margin: "0 auto 24px",
//           }}
//         >
//           🔒
//         </motion.div>

//         <p
//           style={{
//             fontFamily: "'DM Sans', sans-serif",
//             fontSize: "11px",
//             fontWeight: 600,
//             letterSpacing: "0.1em",
//             textTransform: "uppercase",
//             color: "var(--accent)",
//             marginBottom: "12px",
//           }}
//         >
//           Sign in required
//         </p>

//         <h1
//           style={{
//             fontFamily: "'Syne', sans-serif",
//             fontWeight: 800,
//             fontSize: "clamp(20px, 4vw, 28px)",
//             color: "var(--text)",
//             lineHeight: 1.2,
//             marginBottom: "12px",
//           }}
//         >
//           This poll requires authentication
//         </h1>

//         <p
//           style={{
//             fontFamily: "'DM Sans', sans-serif",
//             fontSize: "15px",
//             color: "var(--muted)",
//             lineHeight: 1.6,
//             fontWeight: 300,
//             marginBottom: "8px",
//           }}
//         >
//           <strong style={{ color: "var(--text)", fontWeight: 500 }}>
//             "{pollTitle}"
//           </strong>{" "}
//           only accepts responses from signed-in users. Please log in to continue.
//         </p>
//       </motion.div>

//       {/* Clerk's sign-in component embedded inline */}
//       <motion.div
//         initial={{ opacity: 0, y: 16 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 0.25, duration: 0.5 }}
//       >
//         <SignIn
//           routing="hash"
//           forceRedirectUrl={window.location.href}
//           signUpForceRedirectUrl={window.location.href}
//         />
//       </motion.div>
//     </div>
//   );
// }

// ── Vote Gate — shown inline when poll requires auth + user not signed in ──────
// Shows a "sign in to vote" CTA instead of hijacking the whole page
function VoteGate({ pollId }: { pollId: string }) {
  const redirectUrl = encodeURIComponent(`/poll/${pollId}`);
  const signInUrl = `/sign-in?redirect=${redirectUrl}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      style={{
        marginTop: "24px",
        padding: "28px",
        borderRadius: "16px",
        background: "var(--card)",
        border: "1.5px solid color-mix(in srgb, var(--accent) 35%, var(--border))",
        textAlign: "center",
      }}
    >
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "14px",
          background: "color-mix(in srgb, var(--accent) 12%, var(--card))",
          border: "1px solid color-mix(in srgb, var(--accent) 30%, transparent)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "22px",
          margin: "0 auto 16px",
        }}
      >
        🔒
      </motion.div>

      <p
        style={{
          fontFamily: "'Syne', sans-serif",
          fontWeight: 700,
          fontSize: "16px",
          color: "var(--text)",
          marginBottom: "8px",
        }}
      >
        Sign in to submit your vote
      </p>

      <p
        style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "13px",
          color: "var(--muted)",
          fontWeight: 300,
          lineHeight: 1.6,
          marginBottom: "20px",
          maxWidth: "320px",
          margin: "0 auto 20px",
        }}
      >
        This poll requires authentication. You can see the questions above —
        sign in to record your response.
      </p>

      <motion.a
        href={signInUrl}
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "12px 28px",
          borderRadius: "100px",
          background: "var(--accent)",
          color: "var(--bg)",
          fontFamily: "'Syne', sans-serif",
          fontWeight: 700,
          fontSize: "14px",
          letterSpacing: "0.02em",
          textDecoration: "none",
          transition: "box-shadow 0.2s ease",
        }}
      >
        Sign in to vote
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </motion.a>
    </motion.div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function PollRespond() {
  const { pollId } = useParams<{ pollId: string }>();
  // const navigate   = useNavigate();
  const { isSignedIn, isLoaded } = useAuth();
  const authFetch = useAuthFetch();

  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  // answers: questionId → selectedOptionId
  const [answers, setAnswers] = useState<Record<string, string>>({});
  // per-question validation errors
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  // global submission error
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    api
      .get(`/api/polls/${pollId}`)
      .then((r) => setPoll(r.data.data))
      .catch(() => setFetchError("Poll not found or unavailable"))
      .finally(() => setLoading(false));
  }, [pollId]);

  // ── guards ────────────────────────────────────────────────────────────
  if (loading || !isLoaded) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
          style={{ width: 36, height: 36, borderRadius: "50%", border: "3px solid var(--border)", borderTopColor: "var(--accent)" }}
        />
      </div>
    );
  }

  if (fetchError) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontFamily: "'DM Sans',sans-serif", color: "var(--muted)" }}>{fetchError}</p>
      </div>
    );
  }

  if (!poll) return null;

  const expired = new Date() > new Date(poll.expiresAt);
  const isPublished = poll.isPublished;

  if (expired && !isPublished) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "20px", color: "var(--text)", marginBottom: "8px" }}>
            This poll has closed
          </p>
          <p style={{ fontFamily: "'DM Sans',sans-serif", color: "var(--muted)" }}>
            The deadline has passed and responses are no longer accepted.
          </p>
        </div>
      </div>
    );
  }

  if (isPublished) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "20px", color: "var(--text)", marginBottom: "12px" }}>
            Results are published
          </p>
          <Link
            to={`/poll/${pollId}/results`}
            style={{ fontFamily: "'DM Sans',sans-serif", color: "var(--accent)", fontSize: "15px" }}
          >
            View results →
          </Link>
        </div>
      </div>
    );
  }

  // ── AUTH GATE ────────────────────────────────────────────────────────
  // Poll requires login and user is NOT signed in → show login wall
  // if (!poll.isAnonymous && !isSignedIn) {
  //   return <LoginWall pollTitle={poll.title} />;
  // }

  // ── Success screen ────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--bg)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
          position: "relative",
        }}
      >
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');`}</style>
        <Confetti />

        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 280, damping: 18 }}
          style={{ fontSize: "52px" }}
        >
          🎉
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          style={{ textAlign: "center" }}
        >
          <h2
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: "26px",
              color: "var(--text)",
              marginBottom: "8px",
            }}
          >
            Response recorded!
          </h2>
          <p style={{ fontFamily: "'DM Sans', sans-serif", color: "var(--muted)", fontSize: "15px", fontWeight: 300 }}>
            Thank you for participating.
          </p>
        </motion.div>
      </div>
    );
  }

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleSelect = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
    // clear the per-field error when the user selects an option
    if (fieldErrors[questionId]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[questionId];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    let valid = true;

    for (const q of poll.questions) {
      if (q.isMandatory && !answers[q.id]) {
        errors[q.id] = "This question is required";
        valid = false;
      }
    }

    setFieldErrors(errors);

    if (!valid) {
      // scroll to first error
      const firstErrorId = Object.keys(errors)[0];
      const el = document.getElementById(`question-${firstErrorId}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    return valid;
  };

  const handleSubmit = async () => {
    setSubmitError("");
    if (!validate()) return;

    const answersPayload = Object.entries(answers).map(
      ([questionId, selectedOptionId]) => ({ questionId, selectedOptionId })
    );

    setSubmitting(true);
    try {
      // use authFetch if signed in (sends Bearer token),
      // use public api if anonymous poll
      const caller = isSignedIn ? authFetch : api;
      await caller.post(`/api/respond/${pollId}`, {
        answers: answersPayload,
        sessionToken: getSessionToken(),
      });
      setSubmitted(true);
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message;
      setSubmitError(msg ?? "Submission failed — please try again");
    } finally {
      setSubmitting(false);
    }
  };

  const mandatoryCount = poll.questions.filter((q) => q.isMandatory).length;
  const optionalCount = poll.questions.length - mandatoryCount;

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg)",
        paddingBottom: "80px",
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600&display=swap');`}</style>

      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "40px 20px 0" }}>

        {/* poll header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "20px",
            padding: "28px",
            marginBottom: "12px",
          }}
        >
          <h1
            style={{
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(20px, 4vw, 26px)",
              color: "var(--text)",
              lineHeight: 1.2,
              marginBottom: "10px",
            }}
          >
            {poll.title}
          </h1>

          {poll.description && (
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "14px",
                color: "var(--muted)",
                lineHeight: 1.6,
                fontWeight: 300,
                marginBottom: "12px",
              }}
            >
              {poll.description}
            </p>
          )}

          {/* meta row */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
            <CountdownTimer
              expiresAt={poll.expiresAt}
              onExpire={() => window.location.reload()}
            />

            {poll.isAnonymous ? (
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  fontFamily: "'DM Sans', sans-serif",
                  letterSpacing: "0.06em",
                  padding: "4px 10px",
                  borderRadius: "100px",
                  background: "color-mix(in srgb, #22c55e 10%, transparent)",
                  border: "1px solid color-mix(in srgb, #22c55e 30%, transparent)",
                  color: "#22c55e",
                }}
              >
                ✓ Anonymous
              </span>
            ) : (
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  fontFamily: "'DM Sans', sans-serif",
                  letterSpacing: "0.06em",
                  padding: "4px 10px",
                  borderRadius: "100px",
                  background: "color-mix(in srgb, var(--accent) 10%, transparent)",
                  border: "1px solid color-mix(in srgb, var(--accent) 30%, transparent)",
                  color: "var(--accent)",
                }}
              >
                🔒 Authenticated
              </span>
            )}

            {/* question count summary */}
            <span
              style={{
                fontSize: "11px",
                fontFamily: "'DM Sans', sans-serif",
                color: "var(--muted)",
                padding: "4px 10px",
                borderRadius: "100px",
                background: "var(--bg)",
                border: "1px solid var(--border)",
              }}
            >
              {mandatoryCount} required
              {optionalCount > 0 && `, ${optionalCount} optional`}
            </span>
          </div>
        </motion.div>

        {/* global error */}
        <AnimatePresence>
          {submitError && (
            <motion.div
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              style={{
                background: "color-mix(in srgb, #FF4D00 10%, var(--card))",
                border: "1px solid color-mix(in srgb, #FF4D00 35%, transparent)",
                borderRadius: "12px",
                padding: "12px 16px",
                marginBottom: "12px",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "13px",
                color: "#FF4D00",
                fontWeight: 500,
              }}
            >
              {submitError}
            </motion.div>
          )}
        </AnimatePresence>

        {/* questions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {poll.questions.map((q, i) => {
            const hasError = !!fieldErrors[q.id];
            const isAnswered = !!answers[q.id];

            return (
              <motion.div
                key={q.id}
                id={`question-${q.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: i * 0.06,
                  duration: 0.45,
                  ease: [0.22, 1, 0.36, 1],
                }}
                style={{
                  background: "var(--card)",
                  border: `1.5px solid ${hasError
                    ? "#FF4D00"
                    : isAnswered
                      ? "var(--accent)"
                      : "var(--border)"
                    }`,
                  borderRadius: "16px",
                  padding: "22px",
                  transition: "border-color 0.2s ease",
                }}
              >
                {/* question header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: "10px",
                    marginBottom: "16px",
                  }}
                >
                  <p
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 500,
                      fontSize: "15px",
                      color: "var(--text)",
                      lineHeight: 1.5,
                      flex: 1,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Syne', sans-serif",
                        fontWeight: 700,
                        color: "color-mix(in srgb, var(--text) 35%, transparent)",
                        marginRight: "8px",
                        fontSize: "13px",
                      }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {q.questionText}
                  </p>

                  {/* mandatory / optional badge */}
                  {q.isMandatory ? (
                    <span
                      style={{
                        flexShrink: 0,
                        fontSize: "10px",
                        fontWeight: 600,
                        fontFamily: "'DM Sans', sans-serif",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        padding: "3px 8px",
                        borderRadius: "4px",
                        background: hasError
                          ? "color-mix(in srgb, #FF4D00 15%, transparent)"
                          : "color-mix(in srgb, var(--accent) 12%, transparent)",
                        border: `1px solid ${hasError
                          ? "color-mix(in srgb, #FF4D00 35%, transparent)"
                          : "color-mix(in srgb, var(--accent) 30%, transparent)"
                          }`,
                        color: hasError ? "#FF4D00" : "var(--accent)",
                      }}
                    >
                      Required
                    </span>
                  ) : (
                    <span
                      style={{
                        flexShrink: 0,
                        fontSize: "10px",
                        fontWeight: 600,
                        fontFamily: "'DM Sans', sans-serif",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        padding: "3px 8px",
                        borderRadius: "4px",
                        background: "var(--bg)",
                        border: "1px solid var(--border)",
                        color: "var(--muted)",
                      }}
                    >
                      Optional
                    </span>
                  )}
                </div>

                {/* per-field error */}
                <AnimatePresence>
                  {hasError && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "12px",
                        color: "#FF4D00",
                        fontWeight: 500,
                        marginBottom: "10px",
                        marginTop: "-6px",
                      }}
                    >
                      ↑ {fieldErrors[q.id]}
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* options */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {q.options.map((opt) => {
                    const selected = answers[q.id] === opt.id;
                    return (
                      <motion.label
                        key={opt.id}
                        whileTap={(!poll.isAnonymous && !isSignedIn) ? {} : { scale: 0.985 }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "12px 16px",
                          borderRadius: "10px",
                          border: `1.5px solid ${selected ? "var(--accent)" : "var(--border)"
                            }`,
                          background: selected
                            ? "color-mix(in srgb, var(--accent) 8%, var(--card))"
                            : "var(--bg)",
                          cursor: (!poll.isAnonymous && !isSignedIn) ? "default" : "pointer",
                          opacity: (!poll.isAnonymous && !isSignedIn) ? 0.5 : 1,
                          transition: "border-color 0.15s ease, background 0.15s ease, opacity 0.15s ease",
                          pointerEvents: (!poll.isAnonymous && !isSignedIn) ? "none" : "auto",
                        }}
                      >
                        {/* custom radio */}
                        <span
                          style={{
                            width: "18px",
                            height: "18px",
                            borderRadius: "50%",
                            border: `2px solid ${selected ? "var(--accent)" : "var(--border)"}`,
                            background: selected ? "var(--accent)" : "transparent",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            transition: "all 0.15s ease",
                          }}
                        >
                          {selected && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              style={{
                                width: "6px",
                                height: "6px",
                                borderRadius: "50%",
                                background: "var(--bg)",
                              }}
                            />
                          )}
                        </span>

                        <input
                          type="radio"
                          name={q.id}
                          value={opt.id}
                          checked={selected}
                          onChange={() => handleSelect(q.id, opt.id)}
                          style={{ display: "none" }}
                        />

                        <span
                          style={{
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: "14px",
                            color: selected ? "var(--text)" : "var(--muted)",
                            fontWeight: selected ? 500 : 400,
                            transition: "color 0.15s ease",
                          }}
                        >
                          {opt.optionText}
                        </span>
                      </motion.label>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* progress summary */}
        <div
          style={{
            margin: "20px 0 12px",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "12px",
            color: "var(--muted)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <div
            style={{
              flex: 1,
              height: "3px",
              background: "var(--border)",
              borderRadius: "100px",
              overflow: "hidden",
            }}
          >
            <motion.div
              animate={{
                width: `${poll.questions.length > 0
                  ? (Object.keys(answers).length / poll.questions.length) * 100
                  : 0
                  }%`,
              }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              style={{
                height: "100%",
                background: "var(--accent)",
                borderRadius: "100px",
              }}
            />
          </div>
          <span style={{ whiteSpace: "nowrap" }}>
            {Object.keys(answers).length} / {poll.questions.length} answered
          </span>
        </div>

        {/* submit button */}
        {/* <motion.button
          onClick={handleSubmit}
          disabled={submitting}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          style={{
            width: "100%",
            padding: "16px",
            borderRadius: "14px",
            background: submitting
              ? "color-mix(in srgb, var(--accent) 60%, transparent)"
              : "var(--accent)",
            color: "var(--bg)",
            fontFamily: "'Syne', sans-serif",
            fontWeight: 700,
            fontSize: "15px",
            letterSpacing: "0.02em",
            border: "none",
            cursor: submitting ? "not-allowed" : "pointer",
            transition: "background 0.2s ease",
          }}
        >
          {submitting ? "Submitting…" : "Submit response"}
        </motion.button> */}

        {/* submit button — or vote gate if not signed in */}
        {!poll.isAnonymous && !isSignedIn ? (
          // show the poll questions read-only above, gate the submit
          <VoteGate pollId={pollId!} />
        ) : (
          <>
            {/* progress summary */}
            <div
              style={{
                margin: "20px 0 12px",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "12px",
                color: "var(--muted)",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <div
                style={{
                  flex: 1,
                  height: "3px",
                  background: "var(--border)",
                  borderRadius: "100px",
                  overflow: "hidden",
                }}
              >
                <motion.div
                  animate={{
                    width: `${poll.questions.length > 0
                      ? (Object.keys(answers).length / poll.questions.length) * 100
                      : 0
                      }%`,
                  }}
                  transition={{ type: "spring", stiffness: 100, damping: 20 }}
                  style={{
                    height: "100%",
                    background: "var(--accent)",
                    borderRadius: "100px",
                  }}
                />
              </div>
              <span style={{ whiteSpace: "nowrap" }}>
                {Object.keys(answers).length} / {poll.questions.length} answered
              </span>
            </div>

            {/* submit button */}
            <motion.button
              onClick={handleSubmit}
              disabled={submitting}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: "14px",
                background: submitting
                  ? "color-mix(in srgb, var(--accent) 60%, transparent)"
                  : "var(--accent)",
                color: "var(--bg)",
                fontFamily: "'Syne', sans-serif",
                fontWeight: 700,
                fontSize: "15px",
                letterSpacing: "0.02em",
                border: "none",
                cursor: submitting ? "not-allowed" : "pointer",
                transition: "background 0.2s ease",
              }}
            >
              {submitting ? "Submitting…" : "Submit response"}
            </motion.button>

            {/* anonymous disclaimer */}
            {poll.isAnonymous && (
              <p
                style={{
                  textAlign: "center",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "12px",
                  color: "var(--muted)",
                  marginTop: "12px",
                  fontWeight: 300,
                }}
              >
                Your identity will not be recorded.
              </p>
            )}
          </>
        )}

      </div>
    </div>
  );
}
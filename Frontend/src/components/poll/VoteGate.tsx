import { motion } from "framer-motion";

const REDIRECT_KEY = "pb_post_auth_redirect";

export function VoteGate({ pollId }: { pollId: string }) {
  const pollPath = `/poll/${pollId}`;

  const handleSignInClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    // Save the destination before leaving — survives email verification
    sessionStorage.setItem(REDIRECT_KEY, pollPath);
    // Include it as a query param too, for returning users who skip verification
    window.location.href = `/sign-in?redirect=${encodeURIComponent(pollPath)}`;
  };

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
        href={`/sign-in?redirect=${encodeURIComponent(pollPath)}`}
        onClick={handleSignInClick}
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
import { useNavigate } from "react-router-dom";
import CountdownTimer from "./CountDownTimer.jsx";
import {
  motion,
  AnimatePresence,
} from "framer-motion";

interface Poll {
  id: string;
  title: string;
  isActive: boolean;
  isPublished: boolean;
  isAnonymous: boolean;
  expiresAt: string;
  createdAt: string;
}

interface Props {
  poll: Poll;
  onCopyLink: (id: string) => void;
  onPublish: (id: string) => void;
  copied?: boolean;
}

export default function PollCard({ poll, onCopyLink, onPublish, copied = false }: Props) {
  const navigate = useNavigate();
  const expired = new Date() > new Date(poll.expiresAt);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-4">

        {/* left — info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 truncate">{poll.title}</h3>

          {/* REPLACE the div at Line 32 with this: */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <CountdownTimer expiresAt={poll.expiresAt} />

            {poll.isAnonymous && (
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                Anonymous
              </span>
            )}

            {/* --- START OF STATUS BUG FIX --- */}
            <AnimatePresence mode="wait">
              {poll.isPublished ? (
                <motion.span
                  key="status-published"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="text-xs px-2 py-0.5 rounded flex items-center gap-1.5"
                  style={{
                    backgroundColor: "color-mix(in srgb, var(--accent) 15%, transparent)",
                    color: "var(--accent)",
                    fontWeight: 600,
                    border: "1px solid color-mix(in srgb, var(--accent) 30%, transparent)"
                  }}
                >
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--accent)" }} />
                  PUBLISHED
                </motion.span>
              ) : (
                !expired && (
                  <motion.span
                    key="status-live"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="text-xs px-2 py-0.5 rounded flex items-center gap-1.5"
                    style={{
                      backgroundColor: "rgba(34, 197, 94, 0.1)",
                      color: "#22c55e",
                      fontWeight: 600,
                      border: "1px solid rgba(34, 197, 94, 0.2)"
                    }}
                  >
                    <span className="live-dot" style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22c55e" }} />
                    LIVE
                  </motion.span>
                )
              )}
            </AnimatePresence>
            {/* --- END OF STATUS BUG FIX --- */}
          </div>

          <p className="text-xs text-gray-400 mt-2">
            Created {new Date(poll.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* right — actions */}
        <div className="flex flex-col gap-2 flex-shrink-0">
          <button
            onClick={() => navigate(`/analytics/${poll.id}`)}
            className="text-xs border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 text-gray-700"
          >
            Analytics
          </button>

          <button
            onClick={() => onCopyLink(poll.id)}
            className="text-xs border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 text-gray-700"
            style={{
              borderColor: copied ? "var(--accent)" : undefined,
              color: copied ? "var(--accent)" : undefined,
              backgroundColor: copied
                ? "color-mix(in srgb, var(--accent) 8%, transparent)"
                : undefined,
            }}
          >
            {copied ? "✓ Copied!" : "Copy link"}
            {/* Copy link */}
          </button>

          {/* publish — only when expired and not yet published */}
          {expired && !poll.isPublished && (
            <button
              onClick={() => onPublish(poll.id)}
              className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700"
            >
              Publish
            </button>
          )}

          {/* view public results */}
          {poll.isPublished && (
            <button
              onClick={() => navigate(`/poll/${poll.id}/results`)}
              className="text-xs bg-gray-800 text-white px-3 py-1.5 rounded-lg hover:bg-gray-900"
            >
              Results
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
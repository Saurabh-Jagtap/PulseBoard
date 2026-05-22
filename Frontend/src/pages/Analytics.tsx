import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useAuthFetch } from "../hooks/useAuthFetch.js";
import { useSocket } from "../hooks/useSocket.js";
import { motion } from "framer-motion";
import { useTheme } from "../hooks/useTheme";

import {
  LoadingState,
  ErrorState,
  StickyActionBar,
  QuestionCard,
  RealtimePieChart,
  RealtimeVerticalBarChart,
  SubActionBar,
} from "../components/analytics";

import "./Analytics.css";
import type { AnalyticsData } from "../types/analytics.types";

export default function Analytics() {
  const { pollId } = useParams<{ pollId: string }>();
  const authFetch = useAuthFetch();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [liveCount, setLiveCount] = useState<number | null>(null);
  const [, setLiveFlash] = useState(false);
  const [copied, setCopied] = useState(false);

  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    authFetch
      .get(`/api/analytics/${pollId}`)
      .then((r) => setData(r.data.data))
      .catch(() => setHasError(true))
      .finally(() => setLoading(false));
  }, [pollId]);

  /* live socket updates — stable callback ref prevents reconnect storms */
  const socketCallback = useCallback((payload: { totalResponses: number }) => {
    setLiveCount(payload.totalResponses);
    setLiveFlash(true);
    setTimeout(() => setLiveFlash(false), 700);
    authFetch
      .get(`/api/analytics/${pollId}`)
      .then((r) => setData(r.data.data))
      .catch(console.error);
  }, [pollId]);

  useSocket(pollId!, socketCallback);

  if (loading) return <LoadingState />;
  if (hasError || !data) return <ErrorState />;

  const totalResponses = liveCount ?? data.totalResponses;
  const pollUrl = `${window.location.origin}/poll/${pollId}`;

  const handleCopyPollLink  = () => {
    navigator.clipboard.writeText(pollUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePublishResults  = async () => {
    await authFetch.patch(`/api/polls/${pollId}/publish`);
    setData((d) => (d ? { ...d, isPublished: true } : d));
  };

  return (
    <div className="analytics-root">

      {/* ══ 1. PRIMARY NAVBAR — clean, always at absolute top ══ */}
      <StickyActionBar
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* ══ 2. STANDALONE FLOATING ACTION BAR — below navbar, sticky on scroll ══ */}
      <SubActionBar
        title={data.title}
        pollUrl={pollUrl}
        isPublished={data.isPublished}
        pollId={data.pollId}
        copied={copied}
        liveCount={liveCount}
        onCopy={handleCopyPollLink}
        onPublish={handlePublishResults}
      />

      <div className="pb-page">

        {/* ══ 3. MAIN BENTO VISUALIZATION CANVAS — 50/50 equal-height split ══ */}
        <motion.div
          className="pb-bento-canvas"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* LEFT: Pie chart */}
          <div className="pb-bento-pane">
            <RealtimePieChart
              questions={data.questions}
              totalResponses={totalResponses}
            />
          </div>

          {/* RIGHT: Vertical bar chart */}
          <div className="pb-bento-pane">
            <RealtimeVerticalBarChart questions={data.questions} />
          </div>
        </motion.div>

        {/* ══ 4. SECTION DIVIDER ══ */}
        <motion.div
          className="pb-section-divider"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.22, duration: 0.4 }}
        >
          <span className="pb-section-label">Question Breakdown</span>
          <div className="pb-section-rule" />
          <span className="pb-section-count">
            {data.questions.length} question{data.questions.length !== 1 ? "s" : ""}
            {" · "}
            {totalResponses.toLocaleString()} response{totalResponses !== 1 ? "s" : ""}
          </span>
        </motion.div>

        {/* ══ 5. QUESTION BREAKDOWN — 2-column flex-wrap grid ══ */}
        <motion.div
          className="pb-breakdown-grid"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {data.questions.length === 0 ? (
            <div className="pb-chart-empty" style={{ gridColumn: "1 / -1" }}>
              No questions with responses yet.
            </div>
          ) : (
            data.questions.map((question, index) => (
              <QuestionCard key={question.questionId} question={question} index={index} />
            ))
          )}
        </motion.div>

        {/* ══ FOOTER ══ */}
        <motion.div
          className="pb-footer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.38, duration: 0.5 }}
        >
          <span className="pb-footer-brand">PulseBoard</span>
          <span className="pb-footer-id">Poll ID: {data.pollId}</span>
        </motion.div>

      </div>
    </div>
  );
}
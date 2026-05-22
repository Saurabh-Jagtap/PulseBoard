import type { MockData } from "../types/landing.types";

export const TICKER_ITEMS = [
  "Create Polls", "——", "Share Links", "——",
  "Live Analytics", "——", "Real-time Updates", "——",
  "Anonymous Responses", "——", "Publish Results", "——",
  "Create Polls", "——", "Share Links", "——",
  "Live Analytics", "——", "Real-time Updates", "——",
  "Anonymous Responses", "——", "Publish Results", "——",
];

export const FEATURES = [
  {
    num: "01",
    icon: "⚡",
    title: "Instant live updates",
    desc: "Watch your analytics update the moment someone submits. Powered by WebSockets — no polling, no refresh, just instant.",
  },
  {
    num: "02",
    icon: "🔒",
    title: "Anonymous or authenticated",
    desc: "Require sign-in for accountability, or let anyone respond anonymously. Bulletproof duplicate prevention either way.",
  },
  {
    num: "03",
    icon: "⏱",
    title: "Auto-expiring polls",
    desc: "Set a deadline and forget it. Polls close themselves automatically — respondents see a live countdown as it ticks down.",
  },
  {
    num: "04",
    icon: "📊",
    title: "Publish & share results",
    desc: "When you're ready, publish results with one click. The same link transforms into a beautiful public results page anyone can view.",
  },
];

export const STEPS = [
  {
    n: "01",
    title: "Create your poll",
    desc: "Add questions, mark mandatory ones, choose anonymous or authenticated mode, set an expiry.",
  },
  {
    n: "02",
    title: "Share the link",
    desc: "One click copies the poll URL. Send it anywhere. No account needed to respond.",
  },
  {
    n: "03",
    title: "Watch responses arrive",
    desc: "Your analytics dashboard updates in real time. Charts animate, counts roll up live.",
  },
  {
    n: "04",
    title: "Publish the outcome",
    desc: "When your poll closes, publish results. The same link shows everyone the final breakdown.",
  },
];

export const INITIAL_MOCK: MockData = {
  polls: [
    {
      id: "p1",
      title: "Is HTTP stateless?",
      responses: 47,
      options: [
        { label: "Yes", pct: 42 },
        { label: "No", pct: 38 },
        { label: "Maybe", pct: 17 },
      ],
    },
  ],
  analytics: [
    { label: "Mon", value: 32 },
    { label: "Tue", value: 58 },
    { label: "Wed", value: 45 },
    { label: "Thu", value: 71 },
    { label: "Fri", value: 63 },
    { label: "Sat", value: 28 },
    { label: "Sun", value: 19 },
  ],
  totalResponses: 247,
  activeUsers: 14,
  completionRate: 87,
};
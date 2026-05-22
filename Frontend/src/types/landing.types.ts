
export type TabId = "polls" | "analytics";

export interface PollOption {
  label: string;
  pct: number;
}

export interface MockPoll {
  id: string;
  title: string;
  responses: number;
  options: PollOption[];
}

export interface AnalyticsBar {
  label: string;
  value: number;
}

export interface MockData {
  polls: MockPoll[];
  analytics: AnalyticsBar[];
  totalResponses: number;
  activeUsers: number;
  completionRate: number;
}
import { Link } from "react-router-dom";

export function ErrorState() {
  return (
    <div className="pb-error analytics-root">
      <div className="pb-error-icon">⚠</div>
      <p className="pb-error-title">Analytics unavailable</p>
      <p className="pb-error-sub">Could not load poll data. Please try again.</p>
      <Link to="/dashboard" className="pb-error-link">← Back to Dashboard</Link>
    </div>
  );
}
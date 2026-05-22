import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface StickyActionBarProps {
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

export function StickyActionBar({
  theme,
  onToggleTheme,
}: StickyActionBarProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className={`pb-action-bar${scrolled ? " scrolled" : ""}`}>
      <div className="pb-action-bar-inner">
        {/* Left Side Edge */}
        <span className="pb-logo">
          <span className="pb-logo-dot" />
          PulseBoard
        </span>

        {/* Right Side Edge Group */}
        <div className="pb-action-bar-right">
          <Link to="/dashboard" className="pb-nav-back">
            <span style={{ fontSize: 15 }}>←</span> Dashboard
          </Link>

          <button className="pb-theme-btn" onClick={onToggleTheme} aria-label="Toggle theme">
            {theme === "dark" ? "☀" : "◑"}
          </button>
        </div>
      </div>
    </div>
  );
}
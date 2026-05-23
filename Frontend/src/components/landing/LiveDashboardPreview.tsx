import { AnimatePresence, LayoutGroup, motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";
import type { MockData, TabId } from "../../types/landing.types";
import { fadeUp } from "./motion";
import { BarFill } from "./BarFill";
import { AnimatedNum } from "./AnimatedNum";

const ChartBar: React.FC<{ value: number; label: string; maxValue: number }> = ({
    value, label, maxValue,
}) => {
    const heightPct = maxValue > 0 ? (value / maxValue) * 100 : 0;
    return (
        <div className="lp-chart-bar-wrap">
            <motion.div
                className="lp-chart-bar"
                whileInView={{ height: `${heightPct}%` }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ type: "spring", stiffness: 80, damping: 16 }}
                style={{ width: "100%" }}
            />
            <span className="lp-chart-label">{label}</span>
        </div>
    );
};

interface LiveDashboardPreviewProps {
    mockData: MockData;
    activeTab: TabId;
    setActiveTab: React.Dispatch<React.SetStateAction<TabId>>;
    maxBarValue: number
}

export function LiveDashboardPreview({
    mockData,
    activeTab,
    setActiveTab,
    maxBarValue,
}: LiveDashboardPreviewProps) {

    const dashRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress: dashProgress } = useScroll({
        target: dashRef,
        offset: ["start end", "end start"],
    });
    const dashScale = useTransform(dashProgress, [0, 0.3, 0.7, 1], [0.92, 1, 1, 0.96]);
    const dashBlur = useTransform(dashProgress, [0, 0.25, 0.6], [6, 0, 0]);
    const dashOpacity = useTransform(dashProgress, [0, 0.2], [0.4, 1]);
    const dashScaleSpring = useSpring(dashScale, { stiffness: 60, damping: 20 });

    return (
        <section className="lp-dashboard-section" id="dashboard" ref={dashRef}>
            <div className="lp-dashboard-header">
                <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-60px" }}
                >
                    <div className="lp-section-tag" style={{ justifyContent: "center" }}>
                        <span className="lp-hero-tag-dot" />
                        Live dashboard preview
                    </div>
                    <h2 className="lp-section-h2" style={{ textAlign: "center" }}>
                        Your analytics, live and breathing.
                    </h2>
                    <p className="lp-section-sub" style={{ margin: "0 auto", textAlign: "center" }}>
                        This is a real simulation of the PulseBoard dashboard —
                        data updates automatically just like it does in production.
                    </p>
                </motion.div>
            </div>

            <motion.div
                style={{
                    scale: dashScaleSpring,
                    opacity: dashOpacity,
                    filter: useTransform(dashBlur, (v) => `blur(${v}px)`),
                }}
            >
                <div className="lp-mock-dashboard">
                    {/* Browser chrome */}
                    <div className="lp-mock-topbar">
                        <div className="lp-mock-traffic">
                            <div className="lp-mock-dot" style={{ background: "#FF5F57" }} />
                            <div className="lp-mock-dot" style={{ background: "#FFBD2E" }} />
                            <div className="lp-mock-dot" style={{ background: "#28CA41" }} />
                        </div>
                        <div className="lp-mock-url">pulseboard.app/dashboard</div>
                    </div>

                    <div className="lp-mock-body">
                        {/* Sidebar */}
                        <div className="lp-mock-sidebar">
                            <div className="lp-mock-sidebar-logo">
                                <span className="lp-logo-dot" style={{ width: 6, height: 6 }} />
                                PulseBoard
                            </div>
                            {[
                                { icon: "▦", label: "Dashboard", active: true },
                                { icon: "◎", label: "My Polls", active: false },
                                { icon: "↗", label: "Analytics", active: false },
                                { icon: "⋯", label: "Settings", active: false },
                            ].map((item) => (
                                <div
                                    key={item.label}
                                    className={`lp-mock-sidebar-item${item.active ? " active" : ""}`}
                                    data-hover
                                >
                                    <span style={{ fontSize: 13 }}>{item.icon}</span>
                                    <span>{item.label}</span>
                                </div>
                            ))}

                            {/* Live users indicator */}
                            <div style={{ marginTop: "auto", padding: "10px" }}>
                                <div className="lp-live-badge" style={{ width: "100%", justifyContent: "center" }}>
                                    <span className="lp-live-pulse" />
                                    <AnimatedNum value={mockData.activeUsers} /> active
                                </div>
                            </div>
                        </div>

                        {/* Main content */}
                        <div className="lp-mock-main">
                            <div className="lp-mock-main-header">
                                <span className="lp-mock-main-title">Overview</span>
                                <div className="lp-live-badge">
                                    <span className="lp-live-pulse" />
                                    <AnimatedNum value={mockData.totalResponses} /> total responses
                                </div>
                            </div>

                            {/* Tab bar */}
                            <LayoutGroup>
                                <div className="lp-tab-bar">
                                    {(["polls", "analytics"] as TabId[]).map((tab) => (
                                        <button
                                            key={tab}
                                            className={`lp-tab${activeTab === tab ? " active" : ""}`}
                                            onClick={() => setActiveTab(tab)}

                                        >
                                            {tab === "polls" ? "Active Polls" : "Live Analytics"}
                                            {activeTab === tab && (
                                                <motion.div
                                                    className="lp-tab-indicator"
                                                    layoutId="tab-underline"
                                                    transition={{ type: "spring", stiffness: 340, damping: 28 }}
                                                />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </LayoutGroup>

                            {/* Tab content */}
                            <div className="lp-mock-content">
                                <AnimatePresence mode="wait">
                                    {activeTab === "polls" ? (
                                        <motion.div
                                            key="polls"
                                            initial={{ opacity: 0, y: 12 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -8 }}
                                            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                                        >
                                            {mockData.polls.map((poll) => (
                                                <div key={poll.id} className="lp-poll-card">
                                                    <div className="lp-poll-card-title">
                                                        {poll.title}
                                                        <span className="lp-poll-count">
                                                            <AnimatedNum value={poll.responses} /> responses
                                                        </span>
                                                    </div>
                                                    {poll.options.map((opt) => (
                                                        <div key={opt.label} className="lp-option-row">
                                                            <div className="lp-option-label">
                                                                <span>{opt.label}</span>
                                                                <span>{opt.pct}%</span>
                                                            </div>
                                                            <BarFill pct={opt.pct} />
                                                        </div>
                                                    ))}
                                                </div>
                                            ))}
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="analytics"
                                            initial={{ opacity: 0, y: 12 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -8 }}
                                            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                                        >
                                            <div className="lp-chart-wrap">
                                                {mockData.analytics.map((bar) => (
                                                    <ChartBar
                                                        key={bar.label}
                                                        value={bar.value}
                                                        label={bar.label}
                                                        maxValue={maxBarValue}
                                                    />
                                                ))}
                                            </div>
                                            <div className="lp-stats-row">
                                                <div className="lp-stat-tile">
                                                    <div className="lp-stat-num">
                                                        <AnimatedNum value={mockData.totalResponses} />
                                                    </div>
                                                    <div className="lp-stat-label">Total responses</div>
                                                </div>
                                                <div className="lp-stat-tile">
                                                    <div className="lp-stat-num">
                                                        <AnimatedNum value={mockData.activeUsers} />
                                                    </div>
                                                    <div className="lp-stat-label">Active now</div>
                                                </div>
                                                <div className="lp-stat-tile">
                                                    <div className="lp-stat-num">
                                                        <AnimatedNum value={mockData.completionRate} />%
                                                    </div>
                                                    <div className="lp-stat-label">Completion rate</div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </section>
    );
}
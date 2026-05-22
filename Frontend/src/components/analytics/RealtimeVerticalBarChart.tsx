import type { QuestionSummary } from "../../types/analytics.types";
import { motion } from "framer-motion";

const BAR_COLORS = [
    "var(--pie-1)",
    "var(--pie-4)",
    "var(--pie-5)",
    "var(--pie-6)",
    "var(--pie-2)",
    "var(--pie-3)",
];

interface RealtimeVerticalBarChartProps {
    questions: QuestionSummary[];
}

export function RealtimeVerticalBarChart({
    questions,
}: RealtimeVerticalBarChartProps) {

    // If poll has one question: show its options. Multiple questions: show per-question totals.
    const chartBars: { label: string; count: number; percentage: number; colorIdx: number }[] =
        questions.length === 1
            ? [...(questions[0]?.options ?? [])]
                .sort((a, b) => b.count - a.count)
                .map((o, i) => ({
                    label: o.optionText,
                    count: o.count,
                    percentage: o.percentage,
                    colorIdx: i,
                }))
            : questions.map((q, i) => {
                const total = q.options.reduce((s, o) => s + o.count, 0);
                const maxPct = q.options.length > 0
                    ? Math.max(...q.options.map((o) => o.percentage))
                    : 0;
                return {
                    label: `Q${i + 1}`,
                    count: total,
                    percentage: maxPct,
                    colorIdx: i,
                };
            });

    const isEmpty = chartBars.every((b) => b.count === 0);
    const maxCount = Math.max(...chartBars.map((b) => b.count), 1);
    const gridLines = [0, 0.25, 0.5, 0.75, 1].map((f) =>
        Math.round(f * maxCount)
    );

    if (isEmpty) {
        return (
            <div className="pb-chart-card">
                <p className="pb-chart-kicker">Response Distribution</p>
                <p className="pb-chart-title">Vote Columns</p>
                <div className="pb-chart-empty">No votes recorded yet.</div>
            </div>
        );
    }

    return (
        <div className="pb-chart-card pb-vchart-card">
            <p className="pb-chart-kicker">Response Distribution</p>
            <p className="pb-chart-title">Vote Columns</p>

            <div className="pb-vchart-wrap">
                {/* Y-axis labels */}
                <div className="pb-vchart-yaxis">
                    {[...gridLines].reverse().map((v) => (
                        <span key={v} className="pb-vchart-ylabel">
                            {v}
                        </span>
                    ))}
                </div>

                {/* Grid + bars */}
                <div className="pb-vchart-body">
                    {/* Horizontal gridlines */}
                    <div className="pb-vchart-grid" aria-hidden="true">
                        {gridLines.map((v) => (
                            <div key={v} className="pb-vchart-gridline" />
                        ))}
                    </div>

                    {/* Column bars */}
                    <div className="pb-vchart-cols">
                        {chartBars.map((bar, i) => {
                            const color = BAR_COLORS[bar.colorIdx % BAR_COLORS.length];
                            const isTop = i === 0 && questions.length === 1;

                            return (
                                <motion.div
                                    key={bar.label}
                                    className="pb-vchart-col"
                                    layout
                                    transition={{ type: "spring", stiffness: 200, damping: 25 }}
                                >
                                    {/* Count label */}
                                    <motion.span
                                        className="pb-vchart-col-count"
                                        animate={{ opacity: 1 }}
                                        initial={{ opacity: 0 }}
                                    >
                                        {bar.count.toLocaleString()}
                                    </motion.span>

                                    {/* The Bar Track */}
                                    <div className="pb-vchart-track">
                                        <motion.div
                                            className="pb-vchart-bar"
                                            animate={{ height: `${(bar.count / maxCount) * 100}%` }}
                                            initial={{ height: "0%" }}
                                            transition={{
                                                type: "spring",
                                                stiffness: 100,
                                                damping: 15,
                                                mass: 1,
                                                delay: i * 0.05
                                            }}
                                            style={{
                                                background: isTop
                                                    ? `linear-gradient(180deg, ${color} 0%, color-mix(in srgb, ${color} 55%, transparent) 100%)`
                                                    : `linear-gradient(180deg, ${color} 0%, color-mix(in srgb, ${color} 40%, transparent) 100%)`,
                                            }}
                                        />
                                    </div>

                                    {/* Labels */}
                                    <span className="pb-vchart-xlabel">{bar.label}</span>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
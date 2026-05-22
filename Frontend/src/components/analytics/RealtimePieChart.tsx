import { motion, AnimatePresence } from "framer-motion";
import { AnimatedCounter } from "./AnimatedCounter";

import type { QuestionSummary } from "../../types/analytics.types";

interface RealtimePieChartProps {
    questions: QuestionSummary[];
    totalResponses: number;
}

export function RealtimePieChart({
    questions,
    totalResponses,
}: RealtimePieChartProps) {

    const allOptions = questions.flatMap((q) =>
        q.options.map((o) => ({
            id: `${q.questionId}-${o.optionId}`,
            label: o.optionText,
            count: o.count,
            percentage: o.percentage,
        }))
    )

    const slices = allOptions
        .sort((a, b) => b.count - a.count)
        .slice(0, 6);

    const activeSlices = slices.filter((s) => s.count > 0);

    let offset = 0;
    const gradientStops = activeSlices.length === 0
        ? "var(--border) 0 100%"
        : activeSlices
            .map((s, i) => {
                const start = offset;
                offset += Math.max(s.percentage, 0);
                return `var(--pie-${(i % 6) + 1}) ${start}% ${offset}%`;
            })
            .join(", ");

    return (
        <div className="pb-chart-card">
            <p className="pb-chart-kicker">Response Share</p>
            <h2 className="pb-chart-title">Pie Distribution</h2>

            {activeSlices.length === 0 ? (
                <div className="pb-chart-empty">No data yet</div>
            ) : (
                <>
                    <div className="pb-pie-wrap">
                        <motion.div
                            className="pb-pie"
                            animate={{
                                background: `conic-gradient(${gradientStops})`,
                                rotate: -90,
                            }}
                            transition={{ type: "spring", stiffness: 80, damping: 20 }}
                        >
                            <div className="pb-pie-hole">
                                <span className="pb-pie-hole-label">Total</span>
                                <strong className="pb-pie-hole-value">
                                    <AnimatedCounter value={totalResponses} />
                                </strong>
                            </div>
                        </motion.div>
                    </div>

                    <motion.div layout className="pb-pie-legend">
                        <AnimatePresence initial={false}>
                            {slices.map((row, i) => (
                                <motion.div
                                    layout
                                    key={row.id}
                                    className="pb-pie-legend-row"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -6 }}
                                    transition={{
                                        layout: { type: "spring", stiffness: 280, damping: 28 },
                                        opacity: { duration: 0.2 },
                                        delay: i * 0.025,
                                    }}
                                >
                                    <div
                                        className="pb-pie-legend-dot"
                                        style={{ background: `var(--pie-${(i % 6) + 1})` }}
                                    />
                                    <span className="pb-pie-legend-label">{row.label}</span>
                                    <span className="pb-pie-legend-value">
                                        {row.count.toLocaleString()} · {row.percentage}%
                                    </span>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                </>
            )}
        </div>
    );
}
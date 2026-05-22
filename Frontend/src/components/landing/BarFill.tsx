import { motion } from "framer-motion";

export const BarFill: React.FC<{ pct: number }> = ({ pct }) => (
    <div className="lp-bar-track">
        <motion.div
            className="lp-bar-fill"
            initial={{ width: "0%" }}
            whileInView={{ width: `${pct}%` }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ type: "spring", stiffness: 80, damping: 18 }}
        />
    </div>
);
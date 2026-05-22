import { motion } from "framer-motion";
const CONFETTI_COLORS = ["#FF4D00", "#C5FF44", "#FFB347", "#00C2FF", "#FF6EB4"];

export function Confetti() {
    const pieces = Array.from({ length: 18 }, (_, i) => ({
        id: i,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        x: (Math.random() - 0.5) * 300,
        y: -(Math.random() * 200 + 80),
        rotate: Math.random() * 360,
        size: Math.random() * 8 + 6,
        delay: Math.random() * 0.3,
    }));

    return (
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
            {pieces.map((p) => (
                <motion.div
                    key={p.id}
                    initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
                    animate={{
                        x: p.x,
                        y: p.y,
                        opacity: 0,
                        rotate: p.rotate,
                        scale: 0.3,
                    }}
                    transition={{ duration: 1.2, delay: p.delay, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        width: p.size,
                        height: p.size,
                        background: p.color,
                        borderRadius: "2px",
                    }}
                />
            ))}
        </div>
    );
}
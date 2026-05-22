import { motion} from "framer-motion";

export function EmptyIllustration() {
  return (
    <motion.div
      style={{ position: "relative", width: 180, height: 160 }}
      initial="hidden"
      animate="visible"
    >
      {/* Back rect */}
      <motion.div
        style={{
          position: "absolute",
          width: 100,
          height: 70,
          borderRadius: 12,
          background: "var(--border)",
          top: 30,
          left: 40,
        }}
        variants={{
          hidden: { opacity: 0, scale: 0.6, rotate: -8 },
          visible: {
            opacity: 1,
            scale: 1,
            rotate: -8,
            transition: { type: "spring", stiffness: 260, damping: 20, delay: 0.1 },
          },
        }}
      />
      {/* Mid rect */}
      <motion.div
        style={{
          position: "absolute",
          width: 110,
          height: 75,
          borderRadius: 12,
          background: "var(--card)",
          border: "1.5px solid var(--border)",
          top: 20,
          left: 34,
          boxShadow: "var(--shadow-card)",
        }}
        variants={{
          hidden: { opacity: 0, scale: 0.6, rotate: 4 },
          visible: {
            opacity: 1,
            scale: 1,
            rotate: 4,
            transition: { type: "spring", stiffness: 260, damping: 20, delay: 0.2 },
          },
        }}
      >
        <motion.div
          style={{
            position: "absolute",
            top: 14,
            left: 14,
            right: 14,
            height: 8,
            borderRadius: 4,
            background: "var(--border)",
          }}
        />
        <motion.div
          style={{
            position: "absolute",
            top: 30,
            left: 14,
            width: "55%",
            height: 8,
            borderRadius: 4,
            background: "var(--border)",
          }}
        />
      </motion.div>
      {/* Front accent card */}
      <motion.div
        style={{
          position: "absolute",
          width: 118,
          height: 80,
          borderRadius: 12,
          background: "var(--card)",
          border: "1.5px solid var(--accent)",
          top: 40,
          left: 30,
          boxShadow: "0 0 0 3px var(--accent-glow), var(--shadow-lifted)",
        }}
        variants={{
          hidden: { opacity: 0, scale: 0.7, y: 16 },
          visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: { type: "spring", stiffness: 300, damping: 22, delay: 0.35 },
          },
        }}
      >
        <motion.div
          style={{
            position: "absolute",
            top: 16,
            left: 14,
            right: 14,
            height: 8,
            borderRadius: 4,
            background: "var(--accent)",
            opacity: 0.6,
          }}
        />
        <motion.div
          style={{
            position: "absolute",
            top: 32,
            left: 14,
            width: "45%",
            height: 8,
            borderRadius: 4,
            background: "var(--accent)",
            opacity: 0.3,
          }}
        />
        <motion.div
          style={{
            position: "absolute",
            top: 48,
            left: 14,
            width: "70%",
            height: 8,
            borderRadius: 4,
            background: "var(--accent)",
            opacity: 0.2,
          }}
        />
      </motion.div>
      {/* Floating accent dot */}
      <motion.div
        style={{
          position: "absolute",
          width: 14,
          height: 14,
          borderRadius: "50%",
          background: "var(--accent)",
          top: 8,
          right: 28,
        }}
        variants={{
          hidden: { opacity: 0, scale: 0 },
          visible: {
            opacity: 1,
            scale: 1,
            transition: { type: "spring", stiffness: 400, damping: 18, delay: 0.5 },
          },
        }}
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Small square */}
      <motion.div
        style={{
          position: "absolute",
          width: 10,
          height: 10,
          borderRadius: 3,
          background: "var(--accent)",
          opacity: 0.45,
          bottom: 18,
          right: 20,
          rotate: 25,
        }}
        variants={{
          hidden: { opacity: 0, scale: 0 },
          visible: {
            opacity: 0.45,
            scale: 1,
            transition: { type: "spring", stiffness: 400, damping: 18, delay: 0.6 },
          },
        }}
        animate={{ rotate: [25, 55, 25] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.div>
  );
}
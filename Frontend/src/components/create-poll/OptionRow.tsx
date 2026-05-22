import { AnimatePresence, motion, type Variants } from "framer-motion";
import type { OptionInput } from "../../types/createPoll.types";

interface OptionRowProps {
    option: OptionInput;
    optionIndex: number;
    canRemove: boolean;
    onChange: (value: string) => void;
    onRemove: () => void;
}

const optionSlideIn: Variants = {
    hidden: { opacity: 0, x: -12, scale: 0.97 },
    visible: {
        opacity: 1,
        x: 0,
        scale: 1,
        transition: { type: "spring", stiffness: 380, damping: 28 },
    },
    exit: {
        opacity: 0,
        x: 16,
        scale: 0.96,
        transition: { duration: 0.15, ease: "easeIn" },
    },
};

export function OptionRow({
    option,
    optionIndex,
    canRemove,
    onChange,
    onRemove,
}: OptionRowProps) {
    return (
        <motion.div
            className="pb-option-row"
            variants={optionSlideIn}
            initial="hidden"
            animate="visible"
            exit="exit"
            layout
        >
            <div
                className="pb-option-handle"
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <span
                    style={{
                        fontFamily: "'Syne', sans-serif",
                        fontSize: 10,
                        fontWeight: 700,
                        color: "var(--muted)",
                    }}
                >
                    {optionIndex + 1}
                </span>
            </div>
            <input
                className="pb-input"
                value={option.optionText}
                onChange={(e) => onChange(e.target.value)}
                placeholder={`Option ${optionIndex + 1}`}
                style={{ flex: 1 }}
            />
            <AnimatePresence>
                {canRemove && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                        onClick={onRemove}
                        style={{
                            width: 28,
                            height: 28,
                            borderRadius: 7,
                            background: "transparent",
                            border: "1px solid var(--border)",
                            color: "var(--muted)",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            fontSize: 16,
                            lineHeight: 1,
                            transition: "all 0.15s ease",
                        }}
                        whileHover={{ background: "rgba(255,77,0,0.08)", color: "#FF4D00", borderColor: "rgba(255,77,0,0.3)" }}
                        whileTap={{ scale: 0.9 }}
                        aria-label="Remove option"
                    >
                        X
                    </motion.button>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
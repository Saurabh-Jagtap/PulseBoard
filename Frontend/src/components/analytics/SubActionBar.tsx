import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import { LiveBadge } from "./LiveBadge";

interface SubActionBarProps {
    title: string;
    pollUrl: string;
    isPublished: boolean;
    pollId: string;
    copied: boolean;
    liveCount: number | null;
    onCopy: () => void;
    onPublish: () => Promise<void>;
}

export function SubActionBar({ title, pollUrl, isPublished, pollId, copied, liveCount, onCopy, onPublish }: SubActionBarProps) {
    return (
        <div className="pb-sub-action-bar">
            <div className="pb-sub-action-bar-inner">
                <div className="pb-hero-eyebrow" style={{ margin: 0, flex: 1, minWidth: 0, gap: 10 }}>
                    <span className="pb-hero-kicker">{title}</span>
                    <span className={`pb-hero-status ${isPublished ? "published" : "draft"}`}>
                        {isPublished ? "● Published" : "○ Draft"}
                    </span>
                    {liveCount !== null && <LiveBadge />}
                </div>

                <div className="pb-poll-url-pill" style={{ flex: "0 1 280px" }}>
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0, opacity: 0.45 }}>
                        <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                    </svg>
                    <span className="pb-poll-url-text">{pollUrl}</span>
                </div>

                <div className="pb-actions-group">
                    <motion.button
                        className="pb-btn pb-btn-ghost"
                        onClick={onCopy}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.96 }}
                    >
                        <AnimatePresence mode="wait" initial={false}>
                            {copied ? (
                                <motion.span key="done" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}>
                                    ✓ Copied
                                </motion.span>
                            ) : (
                                <motion.span key="copy" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}>
                                    Copy link
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </motion.button>

                    {!isPublished && (
                        <motion.button
                            className="pb-btn pb-btn-primary"
                            onClick={onPublish}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.96 }}
                        >
                            Publish results
                        </motion.button>
                    )}

                    {isPublished && (
                        <Link to={`/poll/${pollId}/results`}>
                            <motion.span
                                className="pb-btn pb-btn-solid"
                                style={{ display: "inline-flex" }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.96 }}
                            >
                                View public →
                            </motion.span>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
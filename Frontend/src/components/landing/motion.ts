export const smoothEase = [0.22, 1, 0.36, 1] as const;
export const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: smoothEase } },
};

export const stagger = (delay = 0) => ({
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, delay, ease: smoothEase } },
});
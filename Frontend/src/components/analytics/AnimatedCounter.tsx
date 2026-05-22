import { animate } from "framer-motion";
import { useEffect, useRef } from "react";


export function AnimatedCounter({ value }: { value: number }) {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const prevRef = useRef(value);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;
    const controls = animate(prevRef.current, value, {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(v) {
        node.textContent = Math.round(v).toLocaleString();
      },
    });
    prevRef.current = value;
    return () => controls.stop();
  }, [value]);

  return <span ref={nodeRef}>{value.toLocaleString()}</span>;
}
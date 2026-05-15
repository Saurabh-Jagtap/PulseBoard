import { useEffect, useRef, useState } from "react";

interface Props {
  count: number;
  isLive?: boolean;
}

// animates the number rolling up when it changes
const useAnimatedCount = (target: number) => {
  const [display, setDisplay] = useState(target);
  const prevRef = useRef(target);

  useEffect(() => {
    const start = prevRef.current;
    const end   = target;
    if (start === end) return;

    const steps    = 20;
    const duration = 600; // ms
    const stepTime = duration / steps;
    let current = 0;

    const timer = setInterval(() => {
      current++;
      const progress = current / steps;
      // ease out
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + (end - start) * eased));

      if (current >= steps) {
        clearInterval(timer);
        setDisplay(end);
        prevRef.current = end;
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [target]);

  return display;
};

export default function LiveCounter({ count, isLive = false }: Props) {
  const animated = useAnimatedCount(count);
  // flash effect on update
  const [flash, setFlash] = useState(false);
  const prevCount = useRef(count);

  useEffect(() => {
    if (count !== prevCount.current) {
      setFlash(true);
      prevCount.current = count;
      const t = setTimeout(() => setFlash(false), 600);
      return () => clearTimeout(t);
    }
  }, [count]);

  return (
    <div className="flex flex-col items-end">
      <div className={`text-3xl font-bold transition-colors duration-300 ${
        flash ? "text-indigo-400" : "text-indigo-600"
      }`}>
        {animated.toLocaleString()}
      </div>
      <div className="flex items-center gap-1.5 mt-0.5">
        <span className="text-xs text-gray-400">responses</span>
        {isLive && (
          <span className="inline-flex items-center gap-1 text-xs text-green-500 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
            live
          </span>
        )}
      </div>
    </div>
  );
}
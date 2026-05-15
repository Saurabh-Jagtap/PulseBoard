import { useEffect, useState } from "react";

interface Props {
  expiresAt: string;
  onExpire?: () => void;
}

const getTimeLeft = (expiresAt: string) => {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return null;

  const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, diff };
};

export default function CountdownTimer({ expiresAt, onExpire }: Props) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(expiresAt));

  useEffect(() => {
    const interval = setInterval(() => {
      const t = getTimeLeft(expiresAt);
      setTimeLeft(t);
      if (!t) {
        clearInterval(interval);
        onExpire?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  // expired
  if (!timeLeft) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 bg-red-50 px-2.5 py-1 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
        Expired
      </span>
    );
  }

  // urgent — less than 1 hour
  const isUrgent  = timeLeft.diff < 1000 * 60 * 60;
  // warning — less than 24 hours
  const isWarning = timeLeft.diff < 1000 * 60 * 60 * 24;

  const colorClass = isUrgent
    ? "text-red-600 bg-red-50"
    : isWarning
    ? "text-amber-600 bg-amber-50"
    : "text-green-600 bg-green-50";

  const dotClass = isUrgent
    ? "bg-red-500 animate-pulse"
    : isWarning
    ? "bg-amber-500"
    : "bg-green-500";

  // format the label
  let label = "";
  if (timeLeft.days > 0) {
    label = `${timeLeft.days}d ${timeLeft.hours}h left`;
  } else if (timeLeft.hours > 0) {
    label = `${timeLeft.hours}h ${timeLeft.minutes}m left`;
  } else if (timeLeft.minutes > 0) {
    label = `${timeLeft.minutes}m ${timeLeft.seconds}s left`;
  } else {
    label = `${timeLeft.seconds}s left`;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${colorClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full inline-block ${dotClass}`} />
      {label}
    </span>
  );
}
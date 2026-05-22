import { useEffect, useRef, useState } from "react";

export const AnimatedNum: React.FC<{ value: number }> = ({ value }) => {
    const [display, setDisplay] = useState(value);
    const prev = useRef(value);

    useEffect(() => {
        if (prev.current === value) return;
        const start = prev.current;
        const diff = value - start;
        const steps = 20;
        let i = 0;
        const id = setInterval(() => {
            i++;
            const ease = 1 - Math.pow(1 - i / steps, 3);
            setDisplay(Math.round(start + diff * ease));
            if (i >= steps) { clearInterval(id); prev.current = value; }
        }, 25);
        return () => clearInterval(id);
    }, [value]);

    return <>{display.toLocaleString()}</>;
};
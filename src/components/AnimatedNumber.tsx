import { useEffect, useState } from "react";

export const AnimatedNumber = ({ value, prefix = "", suffix = "", duration = 1200 }: {
  value: number; prefix?: string; suffix?: string; duration?: number;
}) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start: number | null = null;
    const from = display;
    const delta = value - from;
    let raf = 0;
    const step = (t: number) => {
      if (start === null) start = t;
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(from + delta * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <>{prefix}{display.toLocaleString()}{suffix}</>;
};

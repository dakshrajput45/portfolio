"use client";

import { useEffect, useState } from "react";

// 5 December 2026, 7:00 AM IST — fixed offset so every visitor counts to the same moment.
const TARGET = new Date("2026-12-05T07:00:00+05:30").getTime();

function remaining(now: number) {
  const ms = Math.max(0, TARGET - now);
  return {
    done: ms === 0,
    days: Math.floor(ms / 86_400_000),
    hours: Math.floor((ms / 3_600_000) % 24),
    minutes: Math.floor((ms / 60_000) % 60),
    seconds: Math.floor((ms / 1000) % 60),
  };
}

export default function Countdown() {
  // null until mounted, so server and first client render match (no hydration mismatch).
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (now === null) {
    return <div className="h-[76px] sm:h-[92px]" aria-hidden="true" />;
  }

  const t = remaining(now);

  if (t.done) {
    return (
      <p className="font-sans text-2xl sm:text-4xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-purple-300 to-cyan-300 animate-shimmer-text">
        It&apos;s time 💖
      </p>
    );
  }

  const units: [number, string][] = [
    [t.days, "days"],
    [t.hours, "hours"],
    [t.minutes, "mins"],
    [t.seconds, "secs"],
  ];

  return (
    <div className="flex items-start gap-3 sm:gap-5" role="timer" aria-label="Countdown to 5 December, 7 AM">
      {units.map(([value, label]) => (
        <div
          key={label}
          className="flex w-16 sm:w-20 flex-col items-center rounded-2xl border-2 border-pink-300/30 bg-black/40 py-2 sm:py-3 backdrop-blur-sm"
        >
          <span className="font-mono text-2xl sm:text-4xl font-bold tabular-nums text-white">
            {String(value).padStart(2, "0")}
          </span>
          <span className="text-[10px] sm:text-xs uppercase tracking-widest text-gray-400">{label}</span>
        </div>
      ))}
    </div>
  );
}

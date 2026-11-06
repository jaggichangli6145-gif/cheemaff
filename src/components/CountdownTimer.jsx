import React, { useState, useEffect } from 'react';

const CountdownTimer = ({ targetDate, onExpire, compact = false }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    if (!targetDate) return;

    const calculateTimeLeft = () => {
      let target;
      // Handle Firebase Timestamp or standard date
      if (targetDate?.toDate) {
        target = targetDate.toDate().getTime();
      } else if (typeof targetDate === 'string' || typeof targetDate === 'number') {
        target = new Date(targetDate).getTime();
      } else if (targetDate instanceof Date) {
        target = targetDate.getTime();
      } else {
        return;
      }

      const difference = target - new Date().getTime();

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        if (onExpire) onExpire();
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isExpired: false,
      });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [targetDate, onExpire]);

  if (timeLeft.isExpired) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-primary/20 border border-primary text-primary text-xs font-bold font-heading uppercase tracking-wider animate-pulse shadow-[0_0_10px_rgba(255,45,45,0.4)]">
        <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
        Match Ready / Live
      </div>
    );
  }

  const formatNumber = (num) => String(num).padStart(2, '0');

  if (compact) {
    return (
      <div className="flex items-center space-x-1 font-mono text-xs text-secondary font-bold">
        {timeLeft.days > 0 && <span>{timeLeft.days}d:</span>}
        <span>{formatNumber(timeLeft.hours)}h:</span>
        <span>{formatNumber(timeLeft.minutes)}m:</span>
        <span className="text-primary">{formatNumber(timeLeft.seconds)}s</span>
      </div>
    );
  }

  const timeBlocks = [
    { label: 'DAYS', value: timeLeft.days },
    { label: 'HRS', value: formatNumber(timeLeft.hours) },
    { label: 'MINS', value: formatNumber(timeLeft.minutes) },
    { label: 'SECS', value: formatNumber(timeLeft.seconds) },
  ];

  return (
    <div className="flex items-center gap-2">
      {timeBlocks.map((block, index) => (
        <div key={index} className="flex flex-col items-center">
          <div className="min-w-[42px] px-2 py-1.5 bg-black/80 border border-primary/40 rounded flex items-center justify-center shadow-[0_0_8px_rgba(255,45,45,0.25)]">
            <span className="font-heading font-black text-sm md:text-base text-gray-100">
              {block.value}
            </span>
          </div>
          <span className="text-[9px] uppercase tracking-wider text-gray-400 mt-1 font-mono">
            {block.label}
          </span>
        </div>
      ))}
    </div>
  );
};

export default CountdownTimer;

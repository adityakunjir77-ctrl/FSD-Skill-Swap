import React from 'react';

export default function CompatibilityRing({
  score = 0,
  size = 46,
  strokeWidth = 3.5,
  showLabel = true,
  className = '',
}) {
  const normalizedScore = Math.min(100, Math.max(0, Math.round(score)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  let strokeColor = '#0F766E'; // teal for high
  if (normalizedScore < 50) {
    strokeColor = '#8A9794';
  } else if (normalizedScore < 80) {
    strokeColor = '#F2674A'; // coral
  }

  return (
    <div
      className={`relative inline-flex items-center justify-center flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
      title={`${normalizedScore}% Compatibility`}
    >
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E4E7E5"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress bar */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          className="transition-all duration-500 ease-out"
        />
      </svg>

      {showLabel && (
        <span className="absolute font-heading font-bold text-[11px] text-ink-primary select-none">
          {normalizedScore}%
        </span>
      )}
    </div>
  );
}


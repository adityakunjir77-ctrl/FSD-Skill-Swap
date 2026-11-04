import React from 'react';

export default function Skeleton({
  className = '',
  variant = 'text',
  count = 1,
}) {
  const baseStyle = 'animate-pulse bg-[#E4E7E5] rounded';

  const variants = {
    text: 'h-4 w-full',
    title: 'h-6 w-3/4',
    avatar: 'w-10 h-10 rounded-full',
    pill: 'h-6 w-16 rounded-full',
    card: 'h-36 w-full rounded-card',
    button: 'h-10 w-24 rounded-button',
  };

  const currentVariant = variants[variant] || variants.text;

  if (count > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className={`${baseStyle} ${currentVariant} ${className}`} />
        ))}
      </div>
    );
  }

  return <div className={`${baseStyle} ${currentVariant} ${className}`} />;
}


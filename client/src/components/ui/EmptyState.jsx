import React from 'react';
import Button from './Button';

export default function EmptyState({
  title = 'Nothing here yet',
  description = 'Find someone to swap skills with and get started.',
  actionLabel,
  onAction,
  icon: Icon,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 ${className}`}>
      {/* Hand-crafted flat spot illustration with brand swap motif */}
      <div className="w-28 h-28 mb-5 relative flex items-center justify-center">
        <svg viewBox="0 0 120 120" className="w-full h-full fill-none" xmlns="http://www.w3.org/2000/svg">
          {/* Subtle back circles */}
          <circle cx="48" cy="60" r="32" fill="#E6F6F3" />
          <circle cx="72" cy="60" r="32" fill="#FFF1DB" />
          
          {/* Center overlap outline */}
          <circle cx="48" cy="60" r="32" stroke="#0F766E" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.4" />
          <circle cx="72" cy="60" r="32" stroke="#9A5B00" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.4" />
          
          {/* Two-way exchange arrows motif */}
          <path
            d="M38 52h40m0 0l-7-7m7 7l-7 7"
            stroke="#0F766E"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M82 68H42m0 0l7-7m-7 7l7 7"
            stroke="#F2674A"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <h3 className="font-heading font-semibold text-lg text-ink-primary">
        {title}
      </h3>
      <p className="text-sm text-ink-secondary max-w-sm mt-1.5 mb-6">
        {description}
      </p>

      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}


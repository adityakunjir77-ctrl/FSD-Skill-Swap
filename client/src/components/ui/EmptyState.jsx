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
    <div className={`flex flex-col items-start justify-center text-left py-10 px-1 sm:py-12 ${className}`}>
      {/* Brand swap mark, set as a framed glyph */}
      <div
        className="w-12 h-12 mb-5 flex items-center justify-center border border-ink-primary text-ink-primary"
        aria-hidden="true"
      >
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 8h13m0 0l-4-4m4 4l-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
          <path d="M20 16H7m0 0l4-4m-4 4l4 4" stroke="#0F766E" strokeWidth="1.6" strokeLinecap="square" />
        </svg>
      </div>

      <h3 className="font-display font-medium text-display-sm text-ink-primary max-w-lg">
        {title}
      </h3>
      <p className="text-base text-ink-secondary max-w-md mt-2 mb-6 leading-relaxed">
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

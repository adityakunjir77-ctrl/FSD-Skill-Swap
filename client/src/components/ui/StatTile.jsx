import React from 'react';

export default function StatTile({
  label,
  value,
  subtext,
  icon: Icon,
  variant = 'default',
  className = '',
  onClick,
}) {
  const iconVariants = {
    default: 'text-brand-teal',
    coral: 'text-ink-primary',
    amber: 'text-learn-text',
    success: 'text-status-success',
  };

  const currentIconStyle = iconVariants[variant] || iconVariants.default;

  return (
    <div
      onClick={onClick}
      className={`border-t-2 border-ink-primary pt-3 pb-1 transition-colors ${
        onClick ? 'cursor-pointer hover:border-brand-teal' : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-ink-secondary">
          {label}
        </span>
        {Icon && (
          <div className={`flex items-center justify-center ${currentIconStyle}`} aria-hidden="true">
            <Icon className="w-4 h-4" strokeWidth={1.75} />
          </div>
        )}
      </div>

      <div className="mt-1 flex items-baseline gap-2">
        <span className="font-display font-medium text-display-md text-ink-primary numerals">
          {value}
        </span>
        {subtext && (
          <span className="text-sm text-ink-muted">{subtext}</span>
        )}
      </div>
    </div>
  );
}


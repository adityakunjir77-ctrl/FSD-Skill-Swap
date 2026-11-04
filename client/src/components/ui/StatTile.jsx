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
    default: 'text-brand-teal bg-brand-teal-surface border-teach-border',
    coral: 'text-brand-coral bg-brand-coral-tint border-[#FED7CE]',
    amber: 'text-learn-text bg-learn-bg border-learn-border',
    success: 'text-status-success bg-status-success-bg border-[#BBF7D0]',
  };

  const currentIconStyle = iconVariants[variant] || iconVariants.default;

  return (
    <div
      onClick={onClick}
      className={`bg-canvas-card border border-canvas-border rounded-card p-4 transition-colors ${
        onClick ? 'cursor-pointer hover:border-canvas-border-dark' : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-ink-muted uppercase tracking-wider">
          {label}
        </span>
        {Icon && (
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${currentIconStyle}`}>
            <Icon className="w-4 h-4" strokeWidth={1.75} />
          </div>
        )}
      </div>

      <div className="mt-2 flex items-baseline gap-2">
        <span className="font-heading font-bold text-2xl text-ink-primary">
          {value}
        </span>
        {subtext && (
          <span className="text-xs text-ink-secondary">{subtext}</span>
        )}
      </div>
    </div>
  );
}


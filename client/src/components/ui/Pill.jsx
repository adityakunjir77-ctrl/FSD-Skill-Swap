import React from 'react';
import { X } from 'lucide-react';

export default function Pill({
  children,
  variant = 'teach',
  size = 'md',
  onClick,
  onRemove,
  icon: Icon,
  className = '',
  title,
}) {
  const variants = {
    teach: 'bg-teach-bg/60 text-teach-text border-teach-border',
    learn: 'bg-learn-bg/70 text-learn-text border-learn-border',
    neutral: 'bg-transparent text-ink-secondary border-canvas-border-dark',
    coral: 'bg-transparent text-ink-primary border-ink-primary',
    success: 'bg-status-success-bg text-status-success border-status-success/30',
    warning: 'bg-status-warning-bg text-status-warning border-status-warning/30',
    danger: 'bg-status-danger-bg text-status-danger border-status-danger/30',
    tealSolid: 'bg-brand-teal text-white border-brand-teal',
    outline: 'bg-transparent text-ink-secondary border-canvas-border-dark hover:border-ink-primary hover:text-ink-primary',
  };

  const sizes = {
    xs: 'text-xs py-px px-1.5 gap-1',
    sm: 'text-xs py-0.5 px-2 gap-1.5',
    md: 'text-[13px] font-medium py-0.5 px-2.5 gap-1.5',
    lg: 'text-sm font-medium py-1 px-3 gap-2',
  };

  const currentVariant = variants[variant] || variants.neutral;
  const currentSize = sizes[size] || sizes.md;
  const isInteractive = Boolean(onClick);

  return (
    <span
      onClick={onClick}
      title={title}
      className={`inline-flex items-center rounded-button border transition-colors select-none ${currentVariant} ${currentSize} ${
        isInteractive ? 'cursor-pointer hover:opacity-85' : ''
      } ${className}`}
    >
      {Icon && <Icon className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={1.75} />}
      <span className="truncate">{children}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 -mr-1 p-0.5 rounded-button hover:bg-ink-primary/10 focus:outline-none"
          aria-label="Remove"
        >
          <X className="w-3 h-3" strokeWidth={2} />
        </button>
      )}
    </span>
  );
}


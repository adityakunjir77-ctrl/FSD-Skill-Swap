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
    teach: 'bg-teach-bg text-teach-text border-teach-border',
    learn: 'bg-learn-bg text-learn-text border-learn-border',
    neutral: 'bg-canvas-subtle text-ink-secondary border-canvas-border',
    coral: 'bg-brand-coral-tint text-brand-coral border-[#FED7CE]',
    success: 'bg-status-success-bg text-status-success border-[#BBF7D0]',
    warning: 'bg-status-warning-bg text-status-warning border-[#FDE68A]',
    danger: 'bg-status-danger-bg text-status-danger border-[#FECACA]',
    tealSolid: 'bg-brand-teal text-white border-transparent',
    outline: 'bg-white text-ink-secondary border-canvas-border hover:bg-canvas-subtle',
  };

  const sizes = {
    xs: 'text-[11px] py-0.5 px-2 gap-1',
    sm: 'text-xs py-0.5 px-2.5 gap-1.5',
    md: 'text-xs font-medium py-1 px-3 gap-1.5',
    lg: 'text-sm font-medium py-1.5 px-3.5 gap-2',
  };

  const currentVariant = variants[variant] || variants.neutral;
  const currentSize = sizes[size] || sizes.md;
  const isInteractive = Boolean(onClick);

  return (
    <span
      onClick={onClick}
      title={title}
      className={`inline-flex items-center rounded-full border transition-colors select-none ${currentVariant} ${currentSize} ${
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
          className="ml-0.5 -mr-1 p-0.5 rounded-full hover:bg-black/10 focus:outline-none"
          aria-label="Remove"
        >
          <X className="w-3 h-3" strokeWidth={2} />
        </button>
      )}
    </span>
  );
}


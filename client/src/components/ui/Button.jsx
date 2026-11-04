import React from 'react';

export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-heading font-medium rounded-button transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 select-none disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary:
      'bg-brand-teal text-white hover:bg-brand-teal-hover focus:ring-brand-teal/40 active:bg-brand-teal-dark',
    coral:
      'bg-brand-coral text-white hover:bg-brand-coral-hover focus:ring-brand-coral/40 active:bg-[#C9472B]',
    secondary:
      'bg-white text-ink-primary border border-canvas-border hover:bg-canvas-subtle hover:border-canvas-border-dark focus:ring-brand-teal/20',
    ghost:
      'bg-transparent text-ink-secondary hover:text-ink-primary hover:bg-canvas-subtle focus:ring-brand-teal/20',
    danger:
      'bg-status-danger text-white hover:bg-[#991B1B] focus:ring-status-danger/40',
    'danger-ghost':
      'bg-transparent text-status-danger hover:bg-status-danger-bg focus:ring-status-danger/20',
    tealTint:
      'bg-brand-teal-surface text-brand-teal border border-teach-border hover:bg-teach-bg focus:ring-brand-teal/20',
  };

  const sizes = {
    sm: 'h-8 px-3 text-xs gap-1.5',
    md: 'h-10 px-4 text-sm gap-2',
    lg: 'h-11 px-5 text-base gap-2.5',
    icon: 'w-10 h-10 p-0 text-sm',
    'icon-sm': 'w-8 h-8 p-0 text-xs',
  };

  const currentVariant = variants[variant] || variants.primary;
  const currentSize = sizes[size] || sizes.md;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${currentVariant} ${currentSize} ${className}`}
      {...props}
    >
      {loading ? (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : Icon && iconPosition === 'left' ? (
        <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} />
      ) : null}

      <span>{children}</span>

      {!loading && Icon && iconPosition === 'right' && (
        <Icon className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} />
      )}
    </button>
  );
}


import React from 'react';

export default function Card({
  children,
  className = '',
  hover = false,
  onClick,
  padding = 'p-5',
  ...props
}) {
  const isClickable = Boolean(onClick);

  return (
    <div
      onClick={onClick}
      className={`bg-canvas-card border border-canvas-border rounded-card transition-colors duration-150 ${padding} ${
        hover ? 'hover:border-ink-primary/60' : ''
      } ${isClickable ? 'cursor-pointer' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

Card.Header = function CardHeader({ title, subtitle, action, className = '' }) {
  return (
    <div className={`flex items-end justify-between gap-4 pb-3 border-b border-ink-primary ${className}`}>
      <div>
        <h3 className="font-display font-medium text-ink-primary text-title leading-tight">
          {title}
        </h3>
        {subtitle && (
          <p className="text-sm text-ink-muted mt-1">{subtitle}</p>
        )}
      </div>
      {action && <div className="ml-4 flex-shrink-0">{action}</div>}
    </div>
  );
};

Card.Body = function CardBody({ children, className = '' }) {
  return <div className={`pt-4 ${className}`}>{children}</div>;
};

Card.Footer = function CardFooter({ children, className = '' }) {
  return (
    <div className={`mt-4 pt-3 border-t border-canvas-border flex items-center justify-between text-sm text-ink-muted ${className}`}>
      {children}
    </div>
  );
};


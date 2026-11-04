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
      className={`bg-canvas-card border border-canvas-border rounded-card shadow-soft transition-colors duration-150 ${padding} ${
        hover ? 'hover:border-canvas-border-dark' : ''
      } ${isClickable ? 'cursor-pointer' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

Card.Header = function CardHeader({ title, subtitle, action, className = '' }) {
  return (
    <div className={`flex items-start justify-between pb-4 border-b border-canvas-border ${className}`}>
      <div>
        <h3 className="font-heading font-semibold text-ink-primary text-base leading-tight">
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs text-ink-muted mt-0.5">{subtitle}</p>
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
    <div className={`mt-4 pt-3 border-t border-canvas-border flex items-center justify-between text-xs text-ink-muted ${className}`}>
      {children}
    </div>
  );
};


import React from 'react';

export default function PageHeader({
  title,
  description,
  badge,
  actions,
  className = '',
}) {
  return (
    <div className={`flex flex-col md:flex-row md:items-end md:justify-between gap-5 pb-6 mb-8 border-b border-ink-primary ${className}`}>
      <div>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
          <h1 className="font-display font-medium text-display-sm sm:text-display-md text-ink-primary tracking-[-0.02em]">
            {title}
          </h1>
          {badge && <div className="flex-shrink-0">{badge}</div>}
        </div>
        {description && (
          <p className="text-base text-ink-secondary mt-2 max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex flex-wrap items-center gap-3 flex-shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}


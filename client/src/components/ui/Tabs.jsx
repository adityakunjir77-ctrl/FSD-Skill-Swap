import React from 'react';

export default function Tabs({
  tabs = [],
  activeTab,
  onChange,
  variant = 'underline',
  className = '',
}) {
  if (variant === 'segmented') {
    return (
      <div className={`inline-flex p-1 bg-canvas-subtle border border-canvas-border rounded-button ${className}`}>
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`px-3 py-1.5 text-xs font-heading font-medium rounded-button transition-colors flex items-center gap-1.5 select-none ${
                isActive
                  ? 'bg-white text-ink-primary shadow-soft'
                  : 'text-ink-secondary hover:text-ink-primary'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    isActive
                      ? 'bg-brand-teal-surface text-brand-teal'
                      : 'bg-canvas-card text-ink-muted'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Underline variant (default)
  return (
    <div className={`border-b border-canvas-border flex space-x-6 ${className}`}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`pb-3 text-sm font-heading font-semibold transition-colors relative flex items-center gap-2 select-none ${
              isActive
                ? 'text-brand-teal'
                : 'text-ink-secondary hover:text-ink-primary'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  isActive
                    ? 'bg-teach-bg text-teach-text'
                    : 'bg-canvas-subtle text-ink-muted'
                }`}
              >
                {tab.count}
              </span>
            )}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-teal rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
}


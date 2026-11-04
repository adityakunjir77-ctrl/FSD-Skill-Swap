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
      <div className={`inline-flex border border-ink-primary rounded-button max-w-full overflow-x-auto ${className}`}>
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={`px-3 py-1.5 text-sm font-heading font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 select-none border-r border-ink-primary last:border-r-0 ${
                isActive
                  ? 'bg-ink-primary text-white'
                  : 'text-ink-secondary hover:text-ink-primary hover:bg-canvas-subtle'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={`text-xs numerals ${
                    isActive
                      ? 'text-white/75'
                      : 'text-ink-muted'
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
    <div className={`border-b border-canvas-border flex gap-6 overflow-x-auto ${className}`}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`pb-3 pt-1 text-[15px] font-heading font-semibold whitespace-nowrap transition-colors relative flex items-center gap-2 select-none ${
              isActive
                ? 'text-ink-primary'
                : 'text-ink-muted hover:text-ink-primary'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`font-display italic text-base numerals ${
                  isActive
                    ? 'text-brand-teal'
                    : 'text-ink-muted'
                }`}
              >
                {tab.count}
              </span>
            )}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-ink-primary" />
            )}
          </button>
        );
      })}
    </div>
  );
}


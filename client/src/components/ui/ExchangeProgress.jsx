import React from 'react';
import { Check, Clock, X, Play, Award } from 'lucide-react';

const STEPS = [
  { id: 'Pending', label: 'Requested' },
  { id: 'Accepted', label: 'Accepted' },
  { id: 'In Progress', label: 'In Progress' },
  { id: 'Completed', label: 'Completed' },
];

export default function ExchangeProgress({
  status = 'Pending',
  className = '',
}) {
  if (status === 'Rejected' || status === 'Cancelled') {
    return (
      <div className={`flex items-center gap-2 py-2 px-3 rounded-button bg-status-danger-bg border-l-2 border-status-danger text-status-danger text-sm font-heading font-semibold ${className}`}>
        <X className="w-4 h-4 flex-shrink-0" strokeWidth={2} />
        <span>Exchange {status}</span>
      </div>
    );
  }

  const getStepIndex = (st) => {
    switch (st) {
      case 'Pending':
        return 0;
      case 'Accepted':
        return 1;
      case 'In Progress':
        return 2;
      case 'Completed':
        return 3;
      default:
        return 0;
    }
  };

  const currentIndex = getStepIndex(status);

  return (
    <div className={`w-full max-w-md ${className}`}>
      <div className="flex items-center justify-between relative">
        {/* Connecting line */}
        <div className="absolute top-3.5 left-4 right-4 h-px bg-canvas-border-dark -z-0">
          <div
            className="h-full bg-ink-primary transition-all duration-300"
            style={{ width: `${(currentIndex / (STEPS.length - 1)) * 100}%` }}
          />
        </div>

        {/* 4 Steps */}
        {STEPS.map((step, idx) => {
          const isDone = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const isUpcoming = idx > currentIndex;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                  isDone
                    ? 'bg-ink-primary text-white'
                    : isCurrent
                    ? 'bg-canvas-card border-2 border-brand-teal text-brand-teal ring-4 ring-canvas-card'
                    : 'bg-canvas-card border border-canvas-border-dark text-ink-muted ring-4 ring-canvas-card'
                }`}
              >
                {isDone ? (
                  <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                ) : isCurrent ? (
                  <span className="w-2 h-2 rounded-full bg-brand-teal" />
                ) : (
                  <span className="font-display italic text-[13px] text-ink-muted">{idx + 1}</span>
                )}
              </div>
              <span
                className={`text-xs font-heading mt-1.5 whitespace-nowrap ${
                  isCurrent
                    ? 'font-semibold text-brand-teal'
                    : isDone
                    ? 'font-semibold text-ink-primary'
                    : 'text-ink-muted'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}


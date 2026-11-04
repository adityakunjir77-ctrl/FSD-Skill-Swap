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
      <div className={`flex items-center gap-2 py-2 px-3 rounded-button bg-status-danger-bg/40 border border-[#FECACA] text-status-danger text-xs font-heading font-medium ${className}`}>
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
        <div className="absolute top-3.5 left-4 right-4 h-0.5 bg-canvas-border -z-0">
          <div
            className="h-full bg-brand-teal transition-all duration-300"
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
                    ? 'bg-brand-teal text-white'
                    : isCurrent
                    ? 'bg-white border-2 border-brand-teal text-brand-teal ring-4 ring-teach-bg'
                    : 'bg-white border-2 border-canvas-border text-ink-muted'
                }`}
              >
                {isDone ? (
                  <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
                ) : isCurrent ? (
                  <span className="w-2 h-2 rounded-full bg-brand-teal animate-pulse" />
                ) : (
                  <span className="text-[10px] text-ink-muted">{idx + 1}</span>
                )}
              </div>
              <span
                className={`text-[11px] font-heading mt-1.5 whitespace-nowrap ${
                  isCurrent
                    ? 'font-bold text-brand-teal'
                    : isDone
                    ? 'font-medium text-ink-primary'
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


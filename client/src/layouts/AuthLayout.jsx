import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { ArrowLeftRight, Sparkles, CheckCircle2 } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl bg-canvas-card border border-canvas-border rounded-card shadow-soft overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
        {/* Left Column: Form Area */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
          <div>
            {/* Brand Logo Header */}
            <div className="mb-8">
              <Link to="/" className="inline-flex items-center gap-2.5 focus:outline-none group">
                <div className="w-9 h-9 rounded-button bg-brand-teal flex items-center justify-center text-white shadow-soft group-hover:bg-brand-teal-hover transition-colors">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 8h13m0 0l-4-4m4 4l-4 4" />
                    <path d="M20 16H7m0 0l4-4m-4 4l4 4" />
                  </svg>
                </div>
                <span className="font-heading font-bold text-xl tracking-tight text-ink-primary">
                  Skill<span className="text-brand-teal">Swap</span>
                </span>
              </Link>
            </div>

            {/* Form Outlet */}
            <Outlet />
          </div>

          <div className="mt-8 pt-4 border-t border-canvas-border text-center text-xs text-ink-muted">
            Non-monetary peer-to-peer learning network.
          </div>
        </div>

        {/* Right Column: Brand Value Proposition & Subtle Visual Spot */}
        <div className="hidden lg:flex lg:col-span-5 bg-canvas-subtle/80 border-l border-canvas-border p-8 flex-col justify-between relative overflow-hidden">
          {/* Subtle Background Circles */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-brand-teal-surface/60 -z-0 pointer-events-none" />

          <div className="relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-heading font-semibold bg-teach-bg text-teach-text border border-teach-border mb-4">
              <Sparkles className="w-3.5 h-3.5 text-brand-teal" />
              Reciprocal Learning
            </span>

            <h3 className="font-heading font-bold text-xl text-ink-primary leading-snug">
              Teach what you love. <br />
              Learn what you need.
            </h3>
            <p className="text-xs text-ink-secondary mt-2 leading-relaxed">
              No money, no subscriptions. Exchange direct 1-on-1 mentorship with community peers who value your skills.
            </p>
          </div>

          {/* Central Hand-crafted Swap Graphic */}
          <div className="relative z-10 my-8 py-6 px-4 bg-white border border-canvas-border rounded-card shadow-soft">
            <div className="flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-teach-bg text-teach-text font-bold text-xs flex items-center justify-center border border-teach-border">
                  AL
                </div>
                <div>
                  <div className="font-semibold text-ink-primary">Alex</div>
                  <div className="text-[10px] text-teach-text font-medium">Teaches React</div>
                </div>
              </div>

              <div className="w-7 h-7 rounded-full bg-canvas-subtle border border-canvas-border flex items-center justify-center text-brand-teal">
                <ArrowLeftRight className="w-3.5 h-3.5" />
              </div>

              <div className="flex items-center gap-2 text-right">
                <div>
                  <div className="font-semibold text-ink-primary">Priya</div>
                  <div className="text-[10px] text-learn-text font-medium">Teaches Python</div>
                </div>
                <div className="w-8 h-8 rounded-full bg-learn-bg text-learn-text font-bold text-xs flex items-center justify-center border border-learn-border">
                  PR
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-canvas-border/80 flex items-center justify-between text-[11px]">
              <span className="text-ink-muted">Match Compatibility</span>
              <span className="font-heading font-bold text-brand-teal">100% Reciprocal</span>
            </div>
          </div>

          <div className="relative z-10 space-y-2 text-xs text-ink-secondary">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-teal flex-shrink-0" />
              <span>Algorithmic complementary pairing</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-teal flex-shrink-0" />
              <span>Real-time chat & session booking</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-brand-teal flex-shrink-0" />
              <span>Verified peer ratings and reviews</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

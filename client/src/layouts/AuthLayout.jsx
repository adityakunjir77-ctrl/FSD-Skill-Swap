import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { ArrowLeftRight, Sparkles, CheckCircle2 } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-canvas grid grid-cols-1 lg:grid-cols-12">
      {/* Left Column: Form Area */}
      <div className="lg:col-span-7 px-5 sm:px-10 lg:px-16 py-8 sm:py-10 flex flex-col justify-between">
        <div>
          {/* Brand Logo Header */}
          <div className="mb-10 lg:mb-14 pb-5 border-b border-ink-primary">
            <Link to="/" className="inline-flex items-center gap-2.5 focus:outline-none group">
              <div className="w-9 h-9 rounded-button bg-brand-teal flex items-center justify-center text-white group-hover:bg-brand-teal-dark transition-colors">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M4 8h13m0 0l-4-4m4 4l-4 4" />
                  <path d="M20 16H7m0 0l4-4m-4 4l4 4" />
                </svg>
              </div>
              <span className="font-display font-semibold text-[23px] leading-none tracking-[-0.02em] text-ink-primary">
                Skill<span className="text-brand-teal">Swap</span>
              </span>
            </Link>
          </div>

          {/* Form Outlet */}
          <div className="w-full max-w-md">
            <Outlet />
          </div>
        </div>

        <div className="mt-12 pt-4 border-t border-canvas-border text-sm text-ink-muted">
          Non-monetary peer-to-peer learning network.
        </div>
      </div>

      {/* Right Column: Brand value proposition, set as an editorial panel */}
      <aside className="hidden lg:flex lg:col-span-5 bg-ink-primary text-white px-12 xl:px-16 py-12 flex-col justify-between sticky top-0 h-screen">
        <div>
          <span className="inline-flex items-center gap-2 text-sm font-heading font-semibold text-brand-teal-tint">
            <Sparkles className="w-4 h-4" strokeWidth={1.75} />
            Reciprocal Learning
          </span>

          <h3 className="mt-8 font-display font-medium text-display-lg text-white leading-[1.02] tracking-[-0.025em]">
            <span className="block">Teach what you love.</span>
            <span className="block pl-10 xl:pl-16 italic text-brand-teal-tint">Learn what you need.</span>
          </h3>
          <p className="text-base text-white/70 mt-6 leading-relaxed max-w-sm">
            No money, no subscriptions. Exchange direct 1-on-1 mentorship with community peers who value your skills.
          </p>
        </div>

        {/* The swap, set as a two-column ledger */}
        <div className="my-10 border-y border-white/25">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 py-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-card bg-white/10 text-white font-display text-lg flex items-center justify-center border border-white/20">
                AL
              </div>
              <div>
                <div className="font-display text-lg leading-tight text-white">Alex</div>
                <div className="text-sm text-brand-teal-tint">Teaches React</div>
              </div>
            </div>

            <div className="text-brand-teal-tint" aria-hidden="true">
              <ArrowLeftRight className="w-5 h-5" strokeWidth={1.5} />
            </div>

            <div className="flex items-center gap-3 justify-end text-right">
              <div>
                <div className="font-display text-lg leading-tight text-white">Priya</div>
                <div className="text-sm text-[#F0D9AE]">Teaches Python</div>
              </div>
              <div className="w-10 h-10 rounded-card bg-white/10 text-white font-display text-lg flex items-center justify-center border border-white/20">
                PR
              </div>
            </div>
          </div>

          <div className="py-3 border-t border-white/15 flex items-center justify-between text-sm">
            <span className="text-white/60">Match Compatibility</span>
            <span className="font-display italic text-lg text-white">100% Reciprocal</span>
          </div>
        </div>

        <ul className="space-y-3 text-[15px] text-white/80">
          <li className="flex items-center gap-3">
            <CheckCircle2 className="w-4 h-4 text-brand-teal-tint flex-shrink-0" strokeWidth={1.75} />
            <span>Algorithmic complementary pairing</span>
          </li>
          <li className="flex items-center gap-3">
            <CheckCircle2 className="w-4 h-4 text-brand-teal-tint flex-shrink-0" strokeWidth={1.75} />
            <span>Real-time chat & session booking</span>
          </li>
          <li className="flex items-center gap-3">
            <CheckCircle2 className="w-4 h-4 text-brand-teal-tint flex-shrink-0" strokeWidth={1.75} />
            <span>Verified peer ratings and reviews</span>
          </li>
        </ul>
      </aside>
    </div>
  );
}

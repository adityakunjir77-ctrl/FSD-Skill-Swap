import React from 'react';
import { Link } from 'react-router-dom';
import { Code } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-canvas border-t border-ink-primary text-ink-secondary pt-10 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-10">
          {/* Brand Info */}
          <div className="md:col-span-6 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-button bg-brand-teal flex items-center justify-center text-white" aria-hidden="true">
                <svg
                  width="16"
                  height="16"
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
              <span className="font-display font-semibold text-[21px] leading-none tracking-[-0.02em] text-ink-primary">
                Skill<span className="text-brand-teal">Swap</span>
              </span>
            </div>
            <p className="font-display italic text-lg text-ink-secondary max-w-md leading-snug pt-1">
              Democratizing education through reciprocal 1-on-1 skill exchange. Teach what you love, learn what you need, with no money involved.
            </p>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-2 md:col-start-8">
            <h4 className="text-sm font-heading font-semibold text-ink-primary mb-3 pb-2 border-b border-canvas-border">
              Explore
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/discover" className="hover:text-ink-primary hover:underline decoration-brand-teal underline-offset-4 transition-colors">
                  Skill Directory
                </Link>
              </li>
              <li>
                <Link to="/matches" className="hover:text-ink-primary hover:underline decoration-brand-teal underline-offset-4 transition-colors">
                  Reciprocal Matches
                </Link>
              </li>
              <li>
                <Link to="/sessions" className="hover:text-ink-primary hover:underline decoration-brand-teal underline-offset-4 transition-colors">
                  Exchange Scheduler
                </Link>
              </li>
            </ul>
          </div>

          {/* Academic Info */}
          <div className="md:col-span-3">
            <h4 className="text-sm font-heading font-semibold text-ink-primary mb-3 pb-2 border-b border-canvas-border">
              Academic Project
            </h4>
            <p className="text-sm text-ink-muted leading-relaxed mb-3">
              Full-Stack MERN Architecture with real-time Socket.io and reciprocal skill matching.
            </p>
            <span className="inline-flex items-center gap-1.5 text-sm font-heading font-semibold text-ink-primary">
              <Code className="w-3.5 h-3.5 text-brand-teal" strokeWidth={1.75} /> 4-Developer Capstone
            </span>
          </div>
        </div>

        <div className="pt-5 border-t border-canvas-border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-ink-muted">
          <p>© {new Date().getFullYear()} SkillSwap. Built for non-monetary collaborative learning.</p>
          <div className="flex items-center gap-4">
            <span className="font-display italic text-sm text-ink-secondary">Reciprocal Skill Exchange</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

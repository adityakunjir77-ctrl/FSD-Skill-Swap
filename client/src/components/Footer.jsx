import React from 'react';
import { Link } from 'react-router-dom';
import { Code } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-canvas-card border-t border-canvas-border text-ink-secondary py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-button bg-brand-teal flex items-center justify-center text-white shadow-soft">
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
              <span className="font-heading font-bold text-lg tracking-tight text-ink-primary">
                Skill<span className="text-brand-teal">Swap</span>
              </span>
            </div>
            <p className="text-xs text-ink-secondary max-w-sm leading-relaxed">
              Democratizing education through reciprocal 1-on-1 skill exchange. Teach what you love, learn what you need, with no money involved.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-heading font-bold text-ink-primary uppercase tracking-wider mb-3">
              Explore
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/discover" className="hover:text-brand-teal transition-colors">
                  Skill Directory
                </Link>
              </li>
              <li>
                <Link to="/matches" className="hover:text-brand-teal transition-colors">
                  Reciprocal Matches
                </Link>
              </li>
              <li>
                <Link to="/sessions" className="hover:text-brand-teal transition-colors">
                  Exchange Scheduler
                </Link>
              </li>
            </ul>
          </div>

          {/* Academic Info */}
          <div>
            <h4 className="text-xs font-heading font-bold text-ink-primary uppercase tracking-wider mb-3">
              Academic Project
            </h4>
            <p className="text-xs text-ink-muted leading-relaxed mb-3">
              Full-Stack MERN Architecture with real-time Socket.io and reciprocal skill matching.
            </p>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-heading font-medium bg-teach-bg text-teach-text border border-teach-border">
              <Code className="w-3.5 h-3.5" /> 4-Developer Capstone
            </span>
          </div>
        </div>

        <div className="pt-6 border-t border-canvas-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ink-muted">
          <p>© {new Date().getFullYear()} SkillSwap. Built for non-monetary collaborative learning.</p>
          <div className="flex items-center gap-4">
            <span className="text-brand-teal font-medium">Reciprocal Skill Exchange</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRightLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 min-h-[60vh]">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10 items-end border-b border-ink-primary pb-10">
        <div className="md:col-span-5">
          <span
            className="block font-display font-medium text-[clamp(6rem,22vw,13rem)] leading-[0.8] tracking-[-0.05em] text-ink-primary numerals"
            aria-hidden="true"
          >
            404
          </span>
        </div>

        <div className="md:col-span-6 md:col-start-7">
          <span className="inline-flex items-center gap-2 text-sm font-heading font-semibold text-brand-teal mb-3">
            <ArrowRightLeft className="w-4 h-4" strokeWidth={1.75} />
            Error 404
          </span>

          <h1 className="font-display font-medium text-display-md sm:text-display-lg text-ink-primary tracking-[-0.025em]">
            Page Not Found
          </h1>

          <p className="text-base text-ink-secondary max-w-md mt-3 mb-8 leading-relaxed">
            The skill or exchange destination you're looking for doesn't exist or has moved to a new route.
          </p>

          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-button bg-ink-primary border border-ink-primary text-white text-sm font-heading font-semibold hover:bg-brand-teal-dark hover:border-brand-teal-dark transition-colors"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.75} />
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

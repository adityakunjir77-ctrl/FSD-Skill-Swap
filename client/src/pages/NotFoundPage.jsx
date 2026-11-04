import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { ArrowLeft, ArrowRightLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-16">
      <div className="w-20 h-20 rounded-full bg-teach-bg text-brand-teal flex items-center justify-center border border-teach-border mb-6">
        <ArrowRightLeft className="w-8 h-8" strokeWidth={2} />
      </div>

      <span className="text-xs font-heading font-bold text-brand-coral uppercase tracking-wider mb-2">
        Error 404
      </span>

      <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-ink-primary tracking-tight">
        Page Not Found
      </h1>

      <p className="text-sm text-ink-secondary max-w-sm mt-2 mb-8 leading-relaxed">
        The skill or exchange destination you're looking for doesn't exist or has moved to a new route.
      </p>

      <Link to="/dashboard">
        <Button variant="primary" size="md" icon={ArrowLeft}>
          Return to Dashboard
        </Button>
      </Link>
    </div>
  );
}

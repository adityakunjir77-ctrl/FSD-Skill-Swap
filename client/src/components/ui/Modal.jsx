import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = 'max-w-lg',
  className = '',
}) {
  const modalRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-primary/50 transition-opacity"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className={`w-full ${maxWidth} bg-canvas-card border-t-4 border-ink-primary rounded-card shadow-elevated overflow-hidden flex flex-col max-h-[90vh] animate-rise-in ${className}`}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b border-canvas-border flex-shrink-0">
          <div>
            <h2 id="modal-title" className="font-display font-medium text-display-sm text-ink-primary leading-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm text-ink-secondary mt-1">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 -mr-1.5 rounded-button text-ink-muted hover:text-ink-primary hover:bg-canvas-subtle transition-colors focus:outline-none"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" strokeWidth={1.75} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-6 py-5 overflow-y-auto flex-1 text-[15px] text-ink-primary space-y-4">
          {children}
        </div>

        {/* Sticky Footer */}
        {footer && (
          <div className="px-6 py-3.5 bg-canvas border-t border-canvas-border flex flex-wrap items-center justify-end gap-3 flex-shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}


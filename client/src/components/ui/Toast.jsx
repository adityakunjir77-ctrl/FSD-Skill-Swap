import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext({
  showToast: () => {},
  success: () => {},
  error: () => {},
  info: () => {},
});

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message, type = 'info', duration = 3500) => {
      const id = Date.now() + Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, message, type }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback(
    (msg, dur) => addToast(msg, 'success', dur),
    [addToast]
  );
  const error = useCallback(
    (msg, dur) => addToast(msg, 'error', dur),
    [addToast]
  );
  const info = useCallback(
    (msg, dur) => addToast(msg, 'info', dur),
    [addToast]
  );

  return (
    <ToastContext.Provider value={{ showToast: addToast, success, error, info }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => {
          const typeConfig = {
            success: {
              icon: CheckCircle2,
              style: 'bg-white border-status-success/30 text-ink-primary',
              iconStyle: 'text-status-success',
            },
            error: {
              icon: AlertCircle,
              style: 'bg-white border-status-danger/30 text-ink-primary',
              iconStyle: 'text-status-danger',
            },
            info: {
              icon: Info,
              style: 'bg-white border-brand-teal/30 text-ink-primary',
              iconStyle: 'text-brand-teal',
            },
          }[toast.type] || {
            icon: Info,
            style: 'bg-white border-canvas-border text-ink-primary',
            iconStyle: 'text-brand-teal',
          };

          const IconComponent = typeConfig.icon;

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-card border shadow-elevated transition-all duration-150 ${typeConfig.style}`}
              role="status"
            >
              <IconComponent className={`w-5 h-5 flex-shrink-0 mt-0.5 ${typeConfig.iconStyle}`} strokeWidth={1.75} />
              <div className="flex-1 text-sm font-medium">{toast.message}</div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="text-ink-muted hover:text-ink-primary p-0.5 rounded focus:outline-none"
                aria-label="Dismiss toast"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);


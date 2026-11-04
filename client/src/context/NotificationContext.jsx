import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [toast, setToast] = useState(null);

  const showNotification = useCallback((message, type = 'info', duration = 4000) => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast((prev) => (prev && prev.message === message ? null : prev));
    }, duration);
  }, []);

  const hideNotification = () => setToast(null);

  return (
    <NotificationContext.Provider value={{ showNotification, hideNotification }}>
      {children}
      {toast && (
        <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-card shadow-elevated border-l-4 border-ink-primary text-[15px] font-medium animate-rise-in bg-canvas-card text-ink-primary">
          {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-status-success" strokeWidth={1.75} />}
          {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-status-danger" strokeWidth={1.75} />}
          {toast.type === 'info' && <Info className="w-5 h-5 text-brand-teal" strokeWidth={1.75} />}
          <span className="max-w-xs">{toast.message}</span>
          <button onClick={hideNotification} className="text-ink-muted hover:text-ink-primary" aria-label="Dismiss notification">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);

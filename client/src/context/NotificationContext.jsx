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
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all transform animate-bounce-short bg-white text-gray-800">
          {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
          {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-500" />}
          {toast.type === 'info' && <Info className="w-5 h-5 text-indigo-500" />}
          <span className="max-w-xs">{toast.message}</span>
          <button onClick={hideNotification} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);

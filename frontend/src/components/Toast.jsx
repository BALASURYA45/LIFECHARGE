import { useCallback, useState } from 'react';
import { ToastContext } from './ToastContext.jsx';

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, message, type }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:px-6">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`lc-focus w-full max-w-md rounded border px-4 py-3 text-sm shadow-lg transition-all ${
              toast.type === 'error'
                ? 'border-red-700 bg-red-950 text-red-100'
                : toast.type === 'success'
                  ? 'border-emerald-700 bg-emerald-950 text-emerald-100'
                  : toast.type === 'warning'
                    ? 'border-amber-700 bg-amber-950 text-amber-100'
                    : 'border-slate-700 bg-slate-900 text-slate-100'
            }`}
            role="status"
            aria-live="polite"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="flex-1 text-left">{toast.message}</p>
              <button
                type="button"
                className="lc-focus rounded p-1 text-slate-400 hover:text-white"
                onClick={() => removeToast(toast.id)}
                aria-label="Dismiss notification"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}


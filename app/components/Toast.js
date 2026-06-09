"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

const ToastContext = createContext({
  toast: () => {},
  success: () => {},
  error: () => {},
});

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message, type = "info", duration = 4000) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => removeToast(id), duration);
    },
    [removeToast]
  );

  const success = useCallback(
    (message, duration) => toast(message, "success", duration),
    [toast]
  );
  const error = useCallback(
    (message, duration) => toast(message, "error", duration),
    [toast]
  );

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    error: <AlertCircle className="h-5 w-5 text-red-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />,
  };

  const styles = {
    success: "border-green-200 bg-green-50",
    error: "border-red-200 bg-red-50",
    info: "border-blue-200 bg-blue-50",
  };

  return (
    <ToastContext.Provider value={{ toast, success, error }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-lg ${styles[t.type]}`}
          >
            {icons[t.type]}
            <p className="text-sm font-medium text-slate-800">{t.message}</p>
            <button
              onClick={() => removeToast(t.id)}
              className="ml-2 rounded-full p-1 hover:bg-black/5"
            >
              <X className="h-4 w-4 text-slate-500" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

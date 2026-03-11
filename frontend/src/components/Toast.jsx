import React from "react";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

const ToastContext = React.createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = React.useState([]);

  const addToast = React.useCallback((message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`
              animate-slide-up flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg
              backdrop-blur-xl border min-w-[300px] max-w-[420px]
              ${t.type === "success" ? "bg-emerald-50/90 border-emerald-400/30 text-emerald-600" : ""}
              ${t.type === "error" ? "bg-rose-50/90 border-rose-400/30 text-rose-600" : ""}
              ${t.type === "info" ? "bg-accent-50/90 border-accent-400/30 text-accent-600" : ""}
            `}
          >
            {t.type === "success" && <CheckCircle2 size={18} />}
            {t.type === "error" && <XCircle size={18} />}
            {t.type === "info" && <Info size={18} />}
            <span className="text-sm font-medium flex-1">{t.message}</span>
            <button onClick={() => removeToast(t.id)} className="opacity-50 hover:opacity-100 transition">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

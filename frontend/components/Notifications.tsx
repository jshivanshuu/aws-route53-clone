import { createContext, ReactNode, useContext, useState } from "react";

type Toast = { id: number; message: string; tone: "success" | "error" };
const ToastContext = createContext<{ notify: (message: string, tone?: Toast["tone"]) => void }>({ notify: () => undefined });

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const notify = (message: string, tone: Toast["tone"] = "success") => {
    const id = Date.now();
    setToasts(current => [...current, { id, message, tone }]);
    window.setTimeout(() => setToasts(current => current.filter(toast => toast.id !== id)), 4500);
  };
  return <ToastContext.Provider value={{ notify }}>{children}<div className="toast-stack" aria-live="polite">{toasts.map(toast => <div key={toast.id} className={`toast ${toast.tone}`}>{toast.message}<button onClick={() => setToasts(current => current.filter(item => item.id !== toast.id))}>×</button></div>)}</div></ToastContext.Provider>;
}

export const useToast = () => useContext(ToastContext);

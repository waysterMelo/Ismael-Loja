import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastContextValue {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<string, number>>(new Map());

  const removeToast = useCallback((id: string) => {
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((type: Toast['type'], message: string) => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, type, message }]);
    const timer = window.setTimeout(() => removeToast(id), 4000);
    timers.current.set(id, timer);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ success: (m) => addToast('success', m), error: (m) => addToast('error', m), info: (m) => addToast('info', m) }}>
      {children}
      {toasts.length > 0 && (
        <div className="fixed top-4 right-4 z-[999] space-y-3 w-80 max-w-screen-sm">
          {toasts.map(toast => (
            <div
              key={toast.id}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl shadow-lg border text-sm font-medium animate-fade-in-up backdrop-blur-sm
                ${toast.type === 'success' ? 'bg-green-50/95 text-green-700 border-green-200' : ''}
                ${toast.type === 'error' ? 'bg-red-50/95 text-red-700 border-red-200' : ''}
                ${toast.type === 'info' ? 'bg-blue-50/95 text-blue-700 border-blue-200' : ''}
              `}
            >
              {toast.type === 'success' && <CheckCircle2 size={18} className="shrink-0" />}
              {toast.type === 'error' && <AlertCircle size={18} className="shrink-0" />}
              {toast.type === 'info' && <AlertCircle size={18} className="shrink-0" />}
              <span className="flex-1">{toast.message}</span>
              <button onClick={() => removeToast(toast.id)} className="shrink-0 text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
};

// frontend/src/components/common/Toast.tsx
import { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export const Toast = ({ message, type, onClose, duration = 3000 }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle className="text-green-500" size={20} />,
    error: <AlertCircle className="text-red-500" size={20} />,
    warning: <AlertTriangle className="text-yellow-500" size={20} />,
    info: <Info className="text-blue-500" size={20} />
  };

  const bgColors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200'
  };

  const textColors = {
    success: 'text-green-800',
    error: 'text-red-800',
    warning: 'text-yellow-800',
    info: 'text-blue-800'
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border ${bgColors[type]} animate-slide-up`}>
      {icons[type]}
      <p className={`text-sm font-medium ${textColors[type]}`}>{message}</p>
      <button onClick={onClose} className={`ml-2 ${textColors[type]} hover:opacity-70 transition`}>
        <X size={16} />
      </button>
    </div>
  );
};

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

let toastListeners: ((toasts: ToastItem[]) => void)[] = [];
let toasts: ToastItem[] = [];

export const showToast = (message: string, type: ToastType = 'info') => {
  const id = Date.now().toString();
  toasts = [...toasts, { id, message, type }];
  notifyListeners();

  setTimeout(() => {
    toasts = toasts.filter(t => t.id !== id);
    notifyListeners();
  }, 3000);
};

const notifyListeners = () => {
  toastListeners.forEach(listener => listener(toasts));
};

export const ToastContainer = () => {
  const [currentToasts, setCurrentToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const listener = (newToasts: ToastItem[]) => {
      setCurrentToasts(newToasts);
    };
    toastListeners.push(listener);
    return () => {
      toastListeners = toastListeners.filter(l => l !== listener);
    };
  }, []);

  const removeToast = (id: string) => {
    toasts = toasts.filter(t => t.id !== id);
    notifyListeners();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {currentToasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};
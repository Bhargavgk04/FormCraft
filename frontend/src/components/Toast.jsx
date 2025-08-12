import { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  Info, 
  X,
  AlertTriangle
} from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ type = 'info', title, message, duration = 5000 }) => {
    const id = Date.now() + Math.random();
    const newToast = { id, type, title, message, duration };
    
    setToasts(prev => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const success = useCallback((title, message) => {
    addToast({ type: 'success', title, message });
  }, [addToast]);

  const error = useCallback((title, message) => {
    addToast({ type: 'error', title, message });
  }, [addToast]);

  const warning = useCallback((title, message) => {
    addToast({ type: 'warning', title, message });
  }, [addToast]);

  const info = useCallback((title, message) => {
    addToast({ type: 'info', title, message });
  }, [addToast]);

  const getToastStyles = (type) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-gradient-to-r from-green-50 to-emerald-50',
          border: 'border-green-200/60',
          shadow: 'shadow-lg shadow-green-100/50',
          icon: 'text-green-600',
          title: 'text-green-900',
          message: 'text-green-700',
          iconBg: 'bg-green-100',
          iconComponent: CheckCircle,
          progress: 'bg-gradient-to-r from-green-400 to-emerald-500'
        };
      case 'error':
        return {
          bg: 'bg-gradient-to-r from-red-50 to-rose-50',
          border: 'border-red-200/60',
          shadow: 'shadow-lg shadow-red-100/50',
          icon: 'text-red-600',
          title: 'text-red-900',
          message: 'text-red-700',
          iconBg: 'bg-red-100',
          iconComponent: XCircle,
          progress: 'bg-gradient-to-r from-red-400 to-rose-500'
        };
      case 'warning':
        return {
          bg: 'bg-gradient-to-r from-amber-50 to-yellow-50',
          border: 'border-amber-200/60',
          shadow: 'shadow-lg shadow-amber-100/50',
          icon: 'text-amber-600',
          title: 'text-amber-900',
          message: 'text-amber-700',
          iconBg: 'bg-amber-100',
          iconComponent: AlertTriangle,
          progress: 'bg-gradient-to-r from-amber-400 to-yellow-500'
        };
      case 'info':
      default:
        return {
          bg: 'bg-gradient-to-r from-blue-50 to-indigo-50',
          border: 'border-blue-200/60',
          shadow: 'shadow-lg shadow-blue-100/50',
          icon: 'text-blue-600',
          title: 'text-blue-900',
          message: 'text-blue-700',
          iconBg: 'bg-blue-100',
          iconComponent: Info,
          progress: 'bg-gradient-to-r from-blue-400 to-indigo-500'
        };
    }
  };

  return (
    <ToastContext.Provider value={{ success, error, warning, info, addToast, removeToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-6 right-6 z-50 space-y-3 max-w-sm">
        <AnimatePresence mode="popLayout">
          {toasts.map((toast, index) => {
            const styles = getToastStyles(toast.type);
            const IconComponent = styles.iconComponent;
            
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 400, scale: 0.8, y: -20 }}
                animate={{ opacity: 1, x: 0, scale: 1, y: 0 }}
                exit={{ opacity: 0, x: 400, scale: 0.8, y: -20 }}
                transition={{ 
                  duration: 0.4, 
                  ease: [0.25, 0.46, 0.45, 0.94],
                  type: "spring",
                  stiffness: 300,
                  damping: 30
                }}
                className={`relative overflow-hidden ${styles.bg} ${styles.border} border rounded-2xl ${styles.shadow} backdrop-blur-sm`}
                style={{ zIndex: 1000 - index }}
              >
                {/* Progress Bar */}
                <motion.div
                  className={`h-1 ${styles.progress}`}
                  initial={{ scaleX: 1 }}
                  animate={{ scaleX: 0 }}
                  transition={{ duration: toast.duration / 1000, ease: "linear" }}
                  style={{ transformOrigin: "left" }}
                />
                
                <div className="p-5">
                  <div className="flex items-start space-x-4">
                    {/* Icon */}
                    <div className={`flex-shrink-0 ${styles.iconBg} p-2.5 rounded-xl`}>
                      <IconComponent className={`w-5 h-5 ${styles.icon}`} />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {toast.title && (
                        <h4 className={`text-sm font-semibold ${styles.title} leading-5 mb-1`}>
                          {toast.title}
                        </h4>
                      )}
                      {toast.message && (
                        <p className={`text-sm ${styles.message} leading-5`}>
                          {toast.message}
                        </p>
                      )}
                    </div>
                    
                    {/* Close Button */}
                    <motion.button
                      onClick={() => removeToast(toast.id)}
                      className={`flex-shrink-0 p-1.5 rounded-lg ${styles.icon} hover:${styles.iconBg} transition-all duration-200 group`}
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <X className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
                
                {/* Subtle border accent */}
                <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${styles.progress} opacity-20`} />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider;

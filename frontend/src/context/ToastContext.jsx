import { createContext, useCallback, useContext, useState } from 'react';

/**
 * A very small toast (pop-up message) system.
 *
 * Usage inside any component:
 *   const toast = useToast();
 *   toast.success('Event created successfully.');
 *   toast.error('Registration failed.');
 *
 * Messages disappear on their own after 3.5 seconds.
 */
const ToastContext = createContext(null);

let nextId = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (message, type = 'info') => {
      if (!message) return;
      const id = nextId++;
      setToasts((current) => [...current, { id, message, type }]);
      window.setTimeout(() => remove(id), 3500);
    },
    [remove]
  );

  const value = {
    toasts,
    remove,
    success: (message) => push(message, 'success'),
    error: (message) => push(message, 'error'),
    info: (message) => push(message, 'info'),
  };

  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used inside a <ToastProvider>.');
  }
  return context;
}

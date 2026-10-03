import { useToast } from '../context/ToastContext.jsx';

/**
 * Renders the toast messages that ToastProvider is holding.
 * Mounted once, just inside the layout, so it appears on every page.
 */
export default function ToastStack() {
  const { toasts, remove } = useToast();

  if (toasts.length === 0) return null;

  const iconFor = (type) => {
    if (type === 'success') return 'bi-check-circle-fill';
    if (type === 'error') return 'bi-exclamation-triangle-fill';
    return 'bi-info-circle-fill';
  };

  return (
    <div className="ce-toast-stack" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`ce-toast ${toast.type}`}>
          <i className={`bi ${iconFor(toast.type)} mt-1`} />
          <div className="flex-grow-1">{toast.message}</div>
          <button
            type="button"
            className="btn-close btn-close-white btn-sm"
            aria-label="Dismiss"
            onClick={() => remove(toast.id)}
          />
        </div>
      ))}
    </div>
  );
}

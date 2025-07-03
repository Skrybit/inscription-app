import { useEffect } from 'react';

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg text-white ${
        type === 'error' ? 'bg-red-500' : 'bg-green-500'
      }`}
    >
      <div className="flex items-center space-x-2">
        <span>{message}</span>
        <button onClick={onClose} className="text-white font-bold">
          ×
        </button>
      </div>
    </div>
  );
}

export default Toast;
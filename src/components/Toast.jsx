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
      className={`fixed top-4 right-4 p-4 rounded-lg shadow-md flex items-center justify-between space-x-4 ${
        type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
      }`}
    >
      <p className="flex-1">{message}</p>
      <button onClick={onClose} className="text-white font-bold hover:text-gray-200">
        <sup>x</sup>
      </button>
    </div>
  );
}

export default Toast;
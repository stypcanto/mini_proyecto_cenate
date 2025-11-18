import React from 'react';
import { AlertTriangle } from 'lucide-react';

const ConfirmDialog = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = '¿Está seguro?',
  message = 'Esta acción no se puede deshacer.',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'danger' // 'danger', 'warning', 'info'
}) => {
  if (!isOpen) return null;

  const getColors = () => {
    switch (type) {
      case 'danger':
        return {
          icon: 'text-red-500',
          button: 'bg-red-500 hover:bg-red-600'
        };
      case 'warning':
        return {
          icon: 'text-yellow-500',
          button: 'bg-yellow-500 hover:bg-yellow-600'
        };
      case 'info':
        return {
          icon: 'text-blue-500',
          button: 'bg-blue-500 hover:bg-blue-600'
        };
      default:
        return {
          icon: 'text-gray-500',
          button: 'bg-gray-500 hover:bg-gray-600'
        };
    }
  };

  const colors = getColors();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6">
          {/* Icon */}
          <div className="flex items-center justify-center mb-4">
            <div className={`rounded-full p-3 bg-gray-100 ${colors.icon}`}>
              <AlertTriangle className="w-8 h-8" />
            </div>
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-gray-800 text-center mb-2">
            {title}
          </h3>

          {/* Message */}
          <p className="text-gray-600 text-center mb-6">
            {message}
          </p>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-semibold"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 px-4 py-2 ${colors.button} text-white rounded-lg transition-colors font-semibold`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;

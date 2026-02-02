import React from 'react';
import { AlertTriangle, AlertCircle, Info, CheckCircle2 } from 'lucide-react';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onCancel,
  onConfirm,
  title = '¿Está seguro?',
  message = 'Esta acción no se puede deshacer.',
  details,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'danger', // 'danger', 'warning', 'info', 'success'
  isLoading = false
}) => {
  if (!isOpen) return null;

  const handleCancel = onCancel || onClose;

  const getConfig = () => {
    switch (type) {
      case 'danger':
        return {
          headerBg: 'bg-red-600',
          icon: AlertTriangle,
          iconColor: 'text-red-600',
          button: 'bg-red-600 hover:bg-red-700'
        };
      case 'warning':
        return {
          headerBg: 'bg-amber-600',
          icon: AlertCircle,
          iconColor: 'text-amber-600',
          button: 'bg-amber-600 hover:bg-amber-700'
        };
      case 'info':
        return {
          headerBg: 'bg-blue-600',
          icon: Info,
          iconColor: 'text-blue-600',
          button: 'bg-blue-600 hover:bg-blue-700'
        };
      case 'success':
        return {
          headerBg: 'bg-green-600',
          icon: CheckCircle2,
          iconColor: 'text-green-600',
          button: 'bg-green-600 hover:bg-green-700'
        };
      default:
        return {
          headerBg: 'bg-gray-600',
          icon: AlertTriangle,
          iconColor: 'text-gray-600',
          button: 'bg-gray-600 hover:bg-gray-700'
        };
    }
  };

  const config = getConfig();
  const IconComponent = config.icon;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className={`${config.headerBg} p-6 text-white`}>
          <div className="flex items-center gap-3">
            <IconComponent className="w-6 h-6" />
            <h2 className="text-xl font-bold">{title}</h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-gray-700">{message}</p>

          {details && (
            <div className={`bg-gray-50 p-4 rounded-lg border border-gray-200 ${config.iconColor}`}>
              {details}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t border-gray-200">
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 px-4 py-2 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${config.button}`}
          >
            {isLoading && <span className="animate-spin">⏳</span>}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;

import React from 'react';
import { X } from 'lucide-react';

/**
 * FullscreenImageViewer - Componente para visualizar imagen en pantalla completa
 * v9.2.0
 */
export default function FullscreenImageViewer({
  isOpen = false,
  imageSrc = "",
  onClose = () => {}
}) {

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      {/* Botón cerrar */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 bg-white text-black p-2 rounded-lg hover:bg-gray-200 z-10"
      >
        <X size={24} />
      </button>

      {/* Imagen a pantalla completa */}
      <img
        src={imageSrc}
        alt="ECG Fullscreen"
        className="w-full h-full object-contain"
      />
    </div>
  );
}

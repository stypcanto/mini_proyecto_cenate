import React from 'react';
import { Loader } from 'lucide-react';

/**
 * 🔄 LoadingSpinner - Componente de carga reutilizable
 * Muestra un spinner mientras los datos se cargan
 */
export default function LoadingSpinner({ message = 'Cargando...' }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <div className="relative w-16 h-16">
        <Loader className="w-16 h-16 text-blue-600 animate-spin" />
      </div>
      <p className="text-gray-600 font-medium text-lg">{message}</p>
    </div>
  );
}

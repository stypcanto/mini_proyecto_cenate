import React from 'react';
import { Stethoscope } from 'lucide-react';

export default function GestionSolicitudesDiagnostico() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Stethoscope className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Gestión de Solicitudes Diagnóstico
              </h1>
              <p className="text-gray-600 mt-1">
                Administra las solicitudes de diagnósticos médicos
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-4">
              ✅ Página Cargada Correctamente
            </h2>
            <p className="text-blue-800">
              La página está funcionando. Este es un componente de prueba básico.
            </p>
          </div>

          <div className="mt-8 space-y-4">
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">
                Funcionalidades Disponibles:
              </h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Crear nueva solicitud</li>
                <li>Listar solicitudes</li>
                <li>Editar solicitud</li>
                <li>Eliminar solicitud</li>
                <li>Buscar solicitud</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

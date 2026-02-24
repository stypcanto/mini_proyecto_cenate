// src/pages/coordinador/gestion-periodos-disponibilidad/components/ModalReabrirPeriodo.jsx
import React, { useState, useMemo } from "react";
import { XCircle, AlertCircle } from "lucide-react";

// 🆕 Función para extraer fecha ISO sin problemas de zona horaria
function extractDateFromISO(isoString) {
  if (!isoString) return null;
  const match = isoString.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return match ? `${match[1]}-${match[2]}-${match[3]}` : null;
}

export default function ModalReabrirPeriodo({ periodoObj, onClose, onConfirmar }) {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  // 🆕 Calcular fecha mínima: máximo entre fechaFin del período y hoy
  const fechaMinima = useMemo(() => {
    if (!periodoObj || !periodoObj.fechaFin) return today;
    
    const fechaFinPeriodo = extractDateFromISO(periodoObj.fechaFin);
    if (!fechaFinPeriodo) return today;
    
    // Comparar y devolver la mayor
    return fechaFinPeriodo >= today ? fechaFinPeriodo : today;
  }, [periodoObj]);
  
  const [nuevaFechaFin, setNuevaFechaFin] = useState(fechaMinima);
  const [error, setError] = useState("");

  const handleConfirmar = () => {
    if (!nuevaFechaFin || nuevaFechaFin.trim() === "") {
      setError("Debe seleccionar una fecha fin");
      return;
    }

    // 🆕 Validar que la fecha sea >= fechaMinima
    const fechaSeleccionada = new Date(nuevaFechaFin + "T00:00:00");
    const fechaMinimaDate = new Date(fechaMinima + "T00:00:00");

    if (fechaSeleccionada < fechaMinimaDate) {
      setError(`La fecha fin debe ser igual o posterior a ${fechaMinima}`);
      return;
    }

    // Confirmado
    onConfirmar(nuevaFechaFin);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-amber-600" />
            <h2 className="text-lg font-bold text-gray-800">Reabrir Período</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded p-3">
            <p className="text-sm text-blue-900">
              <span className="font-semibold">Período:</span> {periodoObj?.periodo}
            </p>
            <p className="text-xs text-blue-700 mt-2">
              Al reabrir un período, la fecha fin debe ser igual o posterior a la fecha fin actual ({fechaMinima}).
            </p>
          </div>

          {/* Selector de fecha */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nueva Fecha Fin
            </label>
            <input
              type="date"
              value={nuevaFechaFin}
              onChange={(e) => {
                setNuevaFechaFin(e.target.value);
                setError("");
              }}
              min={fechaMinima}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Fecha mínima: {fechaMinima}</p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}
        </div>

        {/* Botones */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmar}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Reabrir
          </button>
        </div>
      </div>
    </div>
  );
}

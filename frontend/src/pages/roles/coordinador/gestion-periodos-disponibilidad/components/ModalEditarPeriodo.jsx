import React, { useState, useEffect } from "react";
import { Calendar, X, Save } from "lucide-react";

// 🆕 Función segura para convertir ISO a YYYY-MM-DD sin problemas de zona horaria
function formatToDateInput(isoString) {
  if (!isoString) return "";
  
  // Si ya está en formato YYYY-MM-DD, devolverlo
  if (isoString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return isoString;
  }
  
  // 🆕 Extraer directamente YYYY-MM-DD de la string ISO sin conversión de zona horaria
  const dateMatch = isoString.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (dateMatch) {
    return `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`;
  }
  
  // Fallback: usar el método anterior si falla el regex
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

// 🆕 Función para formatear fecha ISO a formato local (DD/M/YYYY) sin zona horaria
function formatToLocaleDateString(isoString) {
  if (!isoString) return "—";
  
  // Extraer YYYY-MM-DD sin conversión de zona horaria
  const dateStr = formatToDateInput(isoString);
  if (!dateStr) return "—";
  
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

export default function ModalEditarPeriodo({ periodo, onClose, onGuardar }) {
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    console.log("%c📅 MODAL EDITAR PERIODO - useEffect", "color: #f59e0b; font-weight: bold;");
    console.log("Periodo recibido en modal:", periodo);
    
    if (periodo) {
      // 🆕 Usar función segura para extraer fechas
      const inicio = formatToDateInput(periodo.fechaInicio);
      const fin = formatToDateInput(periodo.fechaFin);
      
      console.log("Fechas extraídas (seguras):");
      console.log("  - fechaInicio:", inicio);
      console.log("  - fechaFin:", fin);
      
      setFechaInicio(inicio);
      setFechaFin(fin);
    } else {
      console.warn("⚠️ No se recibió periodo en el modal");
    }
  }, [periodo]);

  const handleGuardar = async () => {
    if (!fechaInicio || !fechaFin) {
      alert("Debe completar ambas fechas");
      return;
    }

    if (new Date(fechaInicio) > new Date(fechaFin)) {
      alert("La fecha de inicio debe ser anterior a la fecha de cierre");
      return;
    }

    setGuardando(true);
    try {
      // 🆕 Enviar fechas en formato YYYY-MM-DD (LocalDate en Java)
      const payload = {
        periodo: periodo.periodo,
        idArea: periodo.idArea,
        fechaInicio: fechaInicio,  // YYYY-MM-DD
        fechaFin: fechaFin,        // YYYY-MM-DD
      };
      
      console.log("%c💾 GUARDAR EDICIÓN - Payload preparado", "color: #059669; font-weight: bold; font-size: 14px;");
      console.log("🆔 Periodo:", periodo.periodo);
      console.log("📦 Payload que se enviará:");
      console.table(payload);
      
      await onGuardar(periodo, payload);
      onClose();
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Error al actualizar las fechas del período");
    } finally {
      setGuardando(false);
    }
  };

  if (!periodo) {
    console.warn("⚠️ Modal no se renderiza porque periodo es null/undefined");
    return null;
  }

  console.log("✅ Renderizando ModalEditarPeriodo con periodo:", periodo);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      
      <div className="relative bg-white rounded-lg shadow-2xl max-w-lg w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0A5BA9] to-[#2563EB] px-6 py-4 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white bg-opacity-20 p-2 rounded-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Editar Período</h2>
              <p className="text-blue-100 text-sm">{periodo.descripcion || `Periodo ${periodo.periodo}`}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-lg transition-all"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <span className="font-bold">Nota:</span> Solo se pueden modificar las fechas de inicio y cierre del período.
            </p>
          </div>

          {/* Fecha de Inicio */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Fecha de Inicio
            </label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          {/* Fecha de Cierre */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Fecha de Cierre
            </label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          {/* Información actual */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <p className="text-xs font-semibold text-gray-700 uppercase">Fechas Actuales</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Inicio:</p>
                <p className="font-semibold text-gray-900">
                  {formatToLocaleDateString(periodo.fechaInicio)}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Cierre:</p>
                <p className="font-semibold text-gray-900">
                  {formatToLocaleDateString(periodo.fechaFin)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleGuardar}
            disabled={guardando || !fechaInicio || !fechaFin}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {guardando ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}

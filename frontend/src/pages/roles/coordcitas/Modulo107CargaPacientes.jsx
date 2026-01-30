// ========================================================================
// 📤 Modulo107CargaPacientes.jsx – Carga de Pacientes Módulo 107
// ========================================================================

import React, { useState } from "react";
import { Upload, FileText, AlertCircle, CheckCircle } from "lucide-react";

export default function Modulo107CargaPacientes() {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    // Lógica para procesar archivo
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900">Carga de Pacientes - Módulo 107</h1>
          <p className="text-slate-600">
            Carga datos de pacientes mediante archivo Excel
          </p>
        </div>

        {/* Zona de carga */}
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`rounded-xl border-2 border-dashed p-12 text-center transition-colors ${
            isDragging
              ? "border-blue-500 bg-blue-50"
              : "border-slate-300 bg-white hover:border-blue-400"
          }`}
        >
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
              <Upload className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            {isDragging ? "Suelta tu archivo aquí" : "Arrastra tu archivo Excel aquí"}
          </h3>
          <p className="text-sm text-slate-600 mb-4">
            o haz clic para seleccionar un archivo
          </p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
            Seleccionar archivo
          </button>
        </div>

        {/* Requerimientos */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-start gap-3">
            <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">Formato requerido</h3>
              <p className="text-sm text-slate-600">
                Archivo Excel (.xlsx) con las siguientes columnas: Nombre, Apellido, DNI, Edad, Diagnóstico, Fecha ingreso
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">Tamaño máximo</h3>
              <p className="text-sm text-slate-600">
                El archivo no debe exceder 10 MB. Se pueden cargar múltiples archivos.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">Validación automática</h3>
              <p className="text-sm text-slate-600">
                El sistema validará automáticamente los datos y te mostrará un reporte de errores si los hay.
              </p>
            </div>
          </div>
        </div>

        {/* Historial de cargas */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-semibold text-slate-900 mb-4">📋 Historial de cargas</h3>
          <div className="text-center py-8">
            <p className="text-sm text-slate-600">
              No hay cargas previas. Los archivos cargados aparecerán aquí.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

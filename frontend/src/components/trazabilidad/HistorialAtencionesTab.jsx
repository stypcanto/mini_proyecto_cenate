// ========================================================================
// HistorialAtencionesTab.jsx - Historial de Atenciones Clínicas
// ------------------------------------------------------------------------
// CENATE 2026 | Componente para mostrar timeline de atenciones del asegurado
// ========================================================================

import React, { useState, useEffect } from 'react';
import {
  Activity,
  Calendar,
  User,
  Building2,
  FileText,
  AlertCircle,
  Loader2,
  RefreshCw,
  Clock,
  Stethoscope
} from 'lucide-react';
import { atencionesClinicasService } from '../../services/atencionesClinicasService';

export default function HistorialAtencionesTab({ pkAsegurado }) {
  const [atenciones, setAtenciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ============================================================
  // Cargar Atenciones
  // ============================================================
  const cargarAtenciones = async () => {
    if (!pkAsegurado) {
      setError('No se proporcionó el identificador del asegurado');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await atencionesClinicasService.obtenerPorAsegurado(pkAsegurado, 0, 50);
      console.log('✅ Atenciones cargadas:', response);
      setAtenciones(response.content || []);
    } catch (err) {
      console.error('❌ Error al cargar atenciones:', err);
      setError('No se pudieron cargar las atenciones clínicas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarAtenciones();
  }, [pkAsegurado]);

  // ============================================================
  // Formatear Fecha
  // ============================================================
  const formatearFecha = (fecha) => {
    if (!fecha) return 'Sin fecha';
    try {
      return new Date(fecha).toLocaleDateString('es-PE', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  // ============================================================
  // Render
  // ============================================================
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-12 h-12 text-[#0A5BA9] animate-spin mb-4" />
        <p className="text-slate-600 font-medium">Cargando atenciones clínicas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-700 font-medium mb-2">{error}</p>
        <button
          onClick={cargarAtenciones}
          className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all font-medium inline-flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Reintentar
        </button>
      </div>
    );
  }

  if (!atenciones || atenciones.length === 0) {
    return (
      <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-12 text-center">
        <Activity className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-600 font-medium mb-2">
          No se encontraron atenciones clínicas
        </p>
        <p className="text-sm text-slate-500">
          Este asegurado aún no tiene atenciones registradas en el sistema
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-[#0A5BA9] to-[#2563EB] rounded-lg">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Historial de Atenciones Clínicas
            </h3>
            <p className="text-sm text-slate-500">
              {atenciones.length} {atenciones.length === 1 ? 'atención registrada' : 'atenciones registradas'}
            </p>
          </div>
        </div>
        <button
          onClick={cargarAtenciones}
          className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all text-sm font-medium"
        >
          <RefreshCw className="w-4 h-4" />
          Actualizar
        </button>
      </div>

      {/* Timeline de Atenciones */}
      <div className="space-y-3">
        {atenciones.map((atencion, index) => (
          <div
            key={atencion.idAtencion}
            className="bg-white border-2 border-slate-200 rounded-xl p-4 hover:border-[#0A5BA9] transition-all"
          >
            <div className="flex items-start gap-4">
              {/* Icono y línea de timeline */}
              <div className="flex flex-col items-center">
                <div className="p-2 bg-gradient-to-br from-[#0A5BA9] to-[#2563EB] rounded-full">
                  <Stethoscope className="w-4 h-4 text-white" />
                </div>
                {index < atenciones.length - 1 && (
                  <div className="w-0.5 h-full bg-slate-200 mt-2" />
                )}
              </div>

              {/* Contenido */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-slate-900">
                      {atencion.nombreTipoAtencion || 'Atención Clínica'}
                    </h4>
                    <p className="text-sm text-slate-600">
                      {atencion.nombreEspecialidad || 'Sin especialidad'}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    atencion.activo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {atencion.activo ? 'ACTIVA' : 'INACTIVA'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar className="w-4 h-4 text-[#0A5BA9]" />
                    <span>{formatearFecha(atencion.fechaAtencion)}</span>
                  </div>
                  {atencion.nombreProfesional && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <User className="w-4 h-4 text-[#0A5BA9]" />
                      <span>{atencion.nombreProfesional}</span>
                    </div>
                  )}
                  {atencion.nombreIpress && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Building2 className="w-4 h-4 text-[#0A5BA9]" />
                      <span className="truncate">{atencion.nombreIpress}</span>
                    </div>
                  )}
                  {atencion.nombreEstrategia && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <FileText className="w-4 h-4 text-[#0A5BA9]" />
                      <span>{atencion.nombreEstrategia}</span>
                    </div>
                  )}
                </div>

                {/* Motivo de Consulta (si existe) */}
                {atencion.motivoConsulta && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs font-semibold text-blue-900 mb-1">
                      Motivo de Consulta:
                    </p>
                    <p className="text-sm text-blue-800">
                      {atencion.motivoConsulta}
                    </p>
                  </div>
                )}

                {/* Diagnóstico (si existe) */}
                {atencion.diagnostico && (
                  <div className="mt-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <p className="text-xs font-semibold text-purple-900 mb-1">
                      Diagnóstico:
                    </p>
                    <p className="text-sm text-purple-800">
                      {atencion.diagnostico}
                    </p>
                  </div>
                )}

                {/* Badges de información adicional */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {atencion.tieneSignosVitales && (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">
                      Signos Vitales ✓
                    </span>
                  )}
                  {atencion.tieneInterconsulta && (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-orange-100 text-orange-800">
                      Interconsulta
                    </span>
                  )}
                  {atencion.requiereTelemonitoreo && (
                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                      Telemonitoreo
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

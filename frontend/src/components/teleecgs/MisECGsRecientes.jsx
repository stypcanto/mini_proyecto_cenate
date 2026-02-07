/**
 * 📊 Mis EKGs Recientes - Panel Derecho Mejorado
 * Muestra: Estadísticas del día + Últimas 3 cargas + Tooltips de observaciones
 *
 * v1.55.0 - Diseño médico profesional
 */

import React, { useState } from 'react';
import {
  CheckCircle,
  AlertCircle,
  Clock,
  ExternalLink,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  CloudUpload,
  Eye,
  MessageSquare,
  CheckCheck,
} from 'lucide-react';
import { COLORS, MEDICAL_PALETTE } from '../../config/designSystem';

export default function MisECGsRecientes({
  ultimas3 = [],
  estadisticas = {
    cargadas: 0,
    enEvaluacion: 0,
    observadas: 0,
    atendidas: 0,
  },
  onVerRegistro = () => {},
  onRefrescar = () => {},
  onVerImagen = () => {},
  loading = false,
}) {
  const [expandidoTooltip, setExpandidoTooltip] = useState(null);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100 h-fit">
      {/* ==================== ESTADÍSTICAS PROFESIONALES - FULL WIDTH ==================== */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-slate-900">📊 Resumen de Hoy</h3>

          {/* Botón Refrescar */}
          <button
            onClick={onRefrescar}
            disabled={loading}
            className="p-2.5 hover:bg-slate-100 rounded-lg transition-all duration-200 disabled:opacity-50"
            title="Refrescar estadísticas"
            aria-label="Refrescar datos"
          >
            <RefreshCw className={`w-5 h-5 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Grid responsive - Professional Stats Cards Compact */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Cargadas - Verde SATURADO (Impar - Oscuro) */}
          <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 border border-emerald-600 p-4 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105">
            {/* Background decorativo */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8" />

            <div className="relative z-10">
              {/* Icono */}
              <div className="mb-2.5">
                <div className="inline-flex p-2 bg-white/20 rounded-lg">
                  <CloudUpload className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
              </div>

              {/* Número */}
              <div className="mb-1.5">
                <span className="text-3xl font-bold text-white">
                  {estadisticas.cargadas}
                </span>
              </div>

              {/* Etiqueta */}
              <span className="text-xs font-semibold text-white/90">
                Cargados
              </span>
            </div>
          </div>

          {/* En Evaluación - Gris Oscuro/Negro SATURADO */}
          <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-800 p-4 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105">
            {/* Background decorativo */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8" />

            <div className="relative z-10">
              {/* Icono */}
              <div className="mb-2.5">
                <div className="inline-flex p-2 bg-white/20 rounded-lg">
                  <Eye className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
              </div>

              {/* Número */}
              <div className="mb-1.5">
                <span className="text-3xl font-bold text-white">
                  {estadisticas.enEvaluacion}
                </span>
              </div>

              {/* Etiqueta */}
              <span className="text-xs font-semibold text-white/90">
                En Evaluación
              </span>
            </div>
          </div>

          {/* Observadas - Ámbar SATURADO (Impar - Oscuro) */}
          <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 border border-orange-600 p-4 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105">
            {/* Background decorativo */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8" />

            <div className="relative z-10">
              {/* Icono */}
              <div className="mb-2.5">
                <div className="inline-flex p-2 bg-white/20 rounded-lg">
                  <MessageSquare className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
              </div>

              {/* Número */}
              <div className="mb-1.5">
                <span className="text-3xl font-bold text-white">
                  {estadisticas.observadas}
                </span>
              </div>

              {/* Etiqueta */}
              <span className="text-xs font-semibold text-white/90">
                Observadas
              </span>
            </div>
          </div>

          {/* Atendidas - Teal CLARO (Par - Luz) */}
          <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-teal-50 to-teal-100 border border-teal-200 p-4 shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105">
            {/* Background decorativo */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-teal-200/30 rounded-full -mr-8 -mt-8" />

            <div className="relative z-10">
              {/* Icono */}
              <div className="mb-2.5">
                <div className="inline-flex p-2 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg">
                  <CheckCheck className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
              </div>

              {/* Número */}
              <div className="mb-1.5">
                <span className="text-3xl font-bold text-teal-900">
                  {estadisticas.atendidas}
                </span>
              </div>

              {/* Etiqueta */}
              <span className="text-xs font-semibold text-teal-700">
                Atendidas
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== ÚLTIMAS CARGAS CON TOOLTIPS - COMPACTO ==================== */}
      <div className="mb-6">
        <h3 className="text-sm font-bold text-gray-900 mb-3">🕐 Últimas Cargas</h3>

        {ultimas3.length > 0 ? (
          <div className="space-y-2">
            {ultimas3.map((carga, idx) => {
              const esObservacion = carga.estado === 'OBSERVACION';
              const tooltipAbierto = expandidoTooltip === idx;

              return (
                <div
                  key={idx}
                  onClick={() => onVerImagen({ dni: carga.dni, nombrePaciente: carga.nombrePaciente })}
                  className={`relative overflow-hidden rounded-xl border transition-all duration-300 cursor-pointer hover:scale-102 ${
                    esObservacion
                      ? 'border-amber-200 bg-gradient-to-r from-amber-50 to-white hover:shadow-lg hover:border-amber-400'
                      : 'border-blue-200 bg-gradient-to-r from-blue-50 to-white hover:shadow-lg hover:border-blue-400'
                  }`}
                >
                  {/* Línea decorativa superior */}
                  <div className={`h-1 w-full ${esObservacion ? 'bg-gradient-to-r from-amber-400 to-amber-300' : 'bg-gradient-to-r from-blue-400 to-blue-300'}`} />

                  <div className="p-4 flex items-start justify-between gap-3">
                    {/* Lado izquierdo - Info Paciente */}
                    <div className="flex-1 min-w-0">
                      {/* Icono + Nombre Paciente - Prominente */}
                      <div className="flex items-start gap-2.5 mb-3">
                        <div className={`flex-shrink-0 p-2 rounded-lg ${esObservacion ? 'bg-amber-100' : 'bg-blue-100'}`}>
                          {carga.estado === 'ENVIADA' ? (
                            <CheckCircle className={`w-5 h-5 ${esObservacion ? 'text-amber-600' : 'text-blue-600'}`} />
                          ) : (
                            <AlertCircle className={`w-5 h-5 ${esObservacion ? 'text-amber-600' : 'text-blue-600'}`} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 text-sm truncate">
                            {carga.nombrePaciente}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5 font-mono">
                            DNI: {carga.dni}
                          </p>
                        </div>
                      </div>

                      {/* Tiempo transcurrido */}
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{carga.tiempoTranscurrido}</span>
                      </div>

                      {/* 🔴 TOOLTIP INTEGRADO - Observaciones - Compacto */}
                      {esObservacion && carga.observacion && (
                        <div
                          className={`mt-1.5 p-2 bg-white border-l-4 border-amber-600 rounded text-xs
                            transition-all duration-300 ease-out cursor-pointer
                            ${tooltipAbierto ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}
                          onClick={() =>
                            setExpandidoTooltip(tooltipAbierto ? null : idx)
                          }
                        >
                          <div className="flex items-start gap-1.5">
                            <AlertCircle className="w-3 h-3 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="font-bold text-amber-900 mb-0.5">
                                📌 Observación:
                              </p>
                              <p className="text-amber-800 leading-relaxed">
                                "{carga.observacion}"
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Botón expandir/colapsar tooltip - Más pequeño */}
                      {esObservacion && carga.observacion && (
                        <button
                          onClick={() =>
                            setExpandidoTooltip(tooltipAbierto ? null : idx)
                          }
                          className="text-xs text-amber-600 hover:text-amber-700 font-medium mt-1
                            flex items-center gap-0.5 transition-colors"
                        >
                          {tooltipAbierto ? (
                            <>
                              <ChevronUp className="w-3 h-3" />
                              Ocultar
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-3 h-3" />
                              Ver
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Lado derecho - Contador y Botón */}
                    <div className="flex flex-col items-end gap-2.5">
                      {/* Badge de cantidad de imágenes */}
                      <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                        esObservacion
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        📸 {carga.cantidadImagenes} {carga.cantidadImagenes === 1 ? 'imagen' : 'imágenes'}
                      </span>

                      {/* Botón "Ver" */}
                      <button
                        onClick={() =>
                          window.open(`/teleekgs/listar?dni=${carga.dni}`, '_blank', 'noopener,noreferrer')
                        }
                        className={`flex-shrink-0 p-2 rounded-lg transition-all duration-200 ${
                          esObservacion
                            ? 'hover:bg-amber-100 text-amber-600 hover:text-amber-700'
                            : 'hover:bg-blue-100 text-blue-600 hover:text-blue-700'
                        }`}
                        title="Ver en nueva pestaña"
                        aria-label={`Ver EKG de ${carga.nombrePaciente} en nueva pestaña`}
                      >
                        <ExternalLink className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-3 text-center">
            <Clock className="w-6 h-6 text-gray-400 mx-auto mb-1.5" />
            <p className="text-xs text-gray-600">
              No hay cargas recientes. ¡Sube tu primer EKG!
            </p>
          </div>
        )}
      </div>

      {/* ==================== BOTÓN DE ACCIÓN PRINCIPAL ==================== */}
      <div>
        {/* Ver Registro Completo - ABRE EN NUEVA PESTAÑA (ruta accesible para rol actual) */}
        <button
          onClick={onVerRegistro}
          className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white
            rounded-lg font-semibold text-sm transition-all duration-200
            flex items-center justify-center gap-2 shadow-sm hover:shadow-md
            active:translate-y-0.5"
          title="Abrir registro completo de EKGs en nueva pestaña"
        >
          <ExternalLink className="w-4 h-4" />
          Ver Registro Completo ↗
        </button>
      </div>
    </div>
  );
}

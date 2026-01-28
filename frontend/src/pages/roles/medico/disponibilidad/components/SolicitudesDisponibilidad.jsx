// ========================================================================
// SolicitudesDisponibilidad.jsx - Lista de Solicitudes de Disponibilidad
// ------------------------------------------------------------------------
// CENATE 2026 | Componente para gestionar solicitudes de disponibilidad
// ========================================================================

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Plus,
  Eye,
  Edit,
  Send,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import { disponibilidadService } from '../../../../../services/disponibilidadService';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function SolicitudesDisponibilidad({ idPeriodo, periodo }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [solicitudes, setSolicitudes] = useState([]);
  const [enviando, setEnviando] = useState(null);
  const [periodoInfo, setPeriodoInfo] = useState(periodo || null);

  // ============================================================
  // Cargar información del período si no viene como prop
  // ============================================================
  useEffect(() => {
    if (idPeriodo && !periodo) {
      cargarPeriodo();
    } else if (periodo) {
      setPeriodoInfo(periodo);
    }
  }, [idPeriodo, periodo]);

  const cargarPeriodo = async () => {
    try {
      const data = await disponibilidadService.obtenerPeriodo(idPeriodo);
      // Asegurar que anio y mes estén correctamente extraídos
      const periodoFormatted = {
        ...data,
        anio: data.anio || (data.periodo ? parseInt(data.periodo.substring(0, 4)) : null),
        mes: data.mes || (data.periodo ? parseInt(data.periodo.substring(4, 6)) : null)
      };
      setPeriodoInfo(periodoFormatted);
    } catch (error) {
      console.error('Error al cargar período:', error);
    }
  };

  // ============================================================
  // Cargar solicitudes del período
  // ============================================================
  useEffect(() => {
    if (idPeriodo) {
      cargarSolicitudes();
    }
  }, [idPeriodo]);

  const cargarSolicitudes = async () => {
    try {
      setLoading(true);
      const data = await disponibilidadService.obtenerSolicitudesPorPeriodo(idPeriodo);
      setSolicitudes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar solicitudes:', error);
      toast.error('Error al cargar solicitudes');
      setSolicitudes([]);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // Iniciar nueva solicitud
  // ============================================================
  const iniciarSolicitud = () => {
    navigate(`/disponibilidad/nueva?periodo=${idPeriodo}`);
  };

  // ============================================================
  // Enviar solicitud a revisión
  // ============================================================
  const handleEnviarSolicitud = async (idSolicitud) => {
    try {
      setEnviando(idSolicitud);
      await disponibilidadService.enviarSolicitud(idSolicitud);
      toast.success('Solicitud enviada correctamente');
      cargarSolicitudes();
    } catch (error) {
      console.error('Error al enviar solicitud:', error);
      toast.error(error.response?.data?.message || 'Error al enviar solicitud');
    } finally {
      setEnviando(null);
    }
  };

  // ============================================================
  // Renderizar badge de estado
  // ============================================================
  const renderEstadoBadge = (estado) => {
    const estados = {
      BORRADOR: { color: 'bg-gray-100 text-gray-800', icon: Edit, label: 'Borrador' },
      ENVIADO: { color: 'bg-blue-100 text-blue-800', icon: Send, label: 'Enviado' },
      OBSERVADO: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle, label: 'Observado' },
      APROBADO: { color: 'bg-green-100 text-green-800', icon: CheckCircle2, label: 'Aprobado' },
      RECHAZADO: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Rechazado' },
      ANULADO: { color: 'bg-gray-100 text-gray-500', icon: XCircle, label: 'Anulado' }
    };

    const config = estados[estado] || estados.BORRADOR;
    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <IconComponent size={14} />
        {config.label}
      </span>
    );
  };

  // ============================================================
  // Renderizar: Loading
  // ============================================================
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  // ============================================================
  // Renderizar: Sin solicitudes - Mostrar botón "Iniciar"
  // ============================================================
  if (!solicitudes || solicitudes.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="text-blue-600" size={32} />
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No hay solicitudes para este período
          </h3>
          
          <p className="text-gray-600 mb-6">
            Crea una nueva solicitud de disponibilidad para el período {periodoInfo?.anio || ''}-{periodoInfo?.mes ? String(periodoInfo.mes).padStart(2, '0') : ''}
          </p>
          
          <button
            onClick={iniciarSolicitud}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus size={20} />
            Iniciar Solicitud
          </button>
        </div>
      </div>
    );
  }

  // ============================================================
  // Renderizar: Lista de solicitudes
  // ============================================================
  return (
    <div className="space-y-4">
      {/* Header con botón para nueva solicitud si se permite */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Solicitudes del período {periodoInfo?.anio || ''}-{periodoInfo?.mes ? String(periodoInfo.mes).padStart(2, '0') : ''}
        </h3>
        
        {/* Mostrar botón solo si no hay solicitud ENVIADO/APROBADO */}
        {!solicitudes.some(s => ['ENVIADO', 'APROBADO', 'OBSERVADO'].includes(s.estado)) && (
          <button
            onClick={iniciarSolicitud}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Plus size={16} />
            Nueva Solicitud
          </button>
        )}
      </div>

      {/* Lista de solicitudes */}
      <div className="space-y-3">
        {solicitudes.map((solicitud) => (
          <div
            key={solicitud.idSolicitud}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {renderEstadoBadge(solicitud.estado)}
                  <span className="text-sm text-gray-500">
                    <Clock size={14} className="inline mr-1" />
                    {new Date(solicitud.createdAt).toLocaleDateString('es-PE', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                
                {solicitud.observaciones && (
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Observaciones:</strong> {solicitud.observaciones}
                  </p>
                )}
                
                {solicitud.observacionValidador && (
                  <p className="text-sm text-orange-600">
                    <strong>Observación del validador:</strong> {solicitud.observacionValidador}
                  </p>
                )}
                
                <p className="text-sm text-gray-500 mt-2">
                  {solicitud.detalles?.length || 0} día(s) declarado(s)
                </p>
              </div>

              {/* Acciones */}
              <div className="flex items-center gap-2 ml-4">
                {solicitud.estado === 'BORRADOR' && (
                  <>
                    <button
                      onClick={() => navigate(`/disponibilidad/editar/${solicitud.idSolicitud}`)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <Edit size={18} />
                    </button>
                    
                    <button
                      onClick={() => handleEnviarSolicitud(solicitud.idSolicitud)}
                      disabled={enviando === solicitud.idSolicitud}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm disabled:opacity-50"
                      title="Enviar a revisión"
                    >
                      {enviando === solicitud.idSolicitud ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Send size={16} />
                      )}
                      Enviar
                    </button>
                  </>
                )}
                
                <button
                  onClick={() => navigate(`/disponibilidad/ver/${solicitud.idSolicitud}`)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Ver detalles"
                >
                  <Eye size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

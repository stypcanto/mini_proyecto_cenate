import React from "react";
import {
  Calendar,
  Clock,
  Building2,
  User,
  CheckCircle2,
  Sun,
  Moon,
  Sunrise,
  TrendingUp,
  Users,
  FileText,
  Hash,
} from "lucide-react";

/**
 * Componente para visualizar una solicitud en estado ENVIADO/REVISADO/APROBADO
 */
export default function VistaSolicitudEnviada({ solicitud }) {
  if (!solicitud) {
    return (
      <div className="text-center py-8 text-gray-500">
        No hay datos de la solicitud
      </div>
    );
  }

  const formatFecha = (fecha) => {
    if (!fecha) return "—";
    try {
      const d = new Date(fecha);
      return d.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return fecha;
    }
  };

  const formatFechaCorta = (fecha) => {
    if (!fecha) return "—";
    try {
      const d = new Date(fecha);
      return d.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return fecha;
    }
  };

  const estadoBadgeClass = (estado) => {
    const clases = {
      ENVIADO: "bg-blue-100 text-blue-800 border-blue-200",
      REVISADO: "bg-yellow-100 text-yellow-800 border-yellow-200",
      APROBADA: "bg-green-100 text-green-800 border-green-200",
      RECHAZADA: "bg-red-100 text-red-800 border-red-200",
    };
    return clases[estado] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  return (
    <div className="space-y-6">
      {/* Header con información general */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Solicitud #{solicitud.idSolicitud}
              </h3>
              <p className="text-sm text-gray-600">
                {solicitud.periodoDescripcion}
              </p>
            </div>
          </div>
          <span
            className={`px-4 py-2 rounded-xl font-semibold text-sm border-2 ${estadoBadgeClass(
              solicitud.estado
            )}`}
          >
            {solicitud.estado}
          </span>
        </div>

        {/* Grid con información clave */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border border-blue-100">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-medium">Total Turnos</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {solicitud.totalTurnosSolicitados}
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-blue-100">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <Users className="w-4 h-4" />
              <span className="text-xs font-medium">Especialidades</span>
            </div>
            <p className="text-2xl font-bold text-indigo-600">
              {solicitud.totalEspecialidades}
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-blue-100">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-xs font-medium">Fecha Envío</span>
            </div>
            <p className="text-sm font-semibold text-gray-900">
              {formatFechaCorta(solicitud.fechaEnvio)}
            </p>
          </div>

          <div className="bg-white rounded-xl p-4 border border-blue-100">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-medium">Última Act.</span>
            </div>
            <p className="text-sm font-semibold text-gray-900">
              {formatFechaCorta(solicitud.fechaActualizacion)}
            </p>
          </div>
        </div>
      </div>

      {/* Información del Usuario e IPRESS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200">
          <div className="flex items-center gap-2 mb-3">
            <User className="w-5 h-5 text-gray-600" />
            <h4 className="font-semibold text-gray-900">Usuario Creador</h4>
          </div>
          <p className="text-gray-700 font-medium">
            {solicitud.nombreUsuarioCreador}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            ID: {solicitud.idUsuarioCreador}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200">
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="w-5 h-5 text-gray-600" />
            <h4 className="font-semibold text-gray-900">IPRESS</h4>
          </div>
          <p className="text-gray-700 font-medium">{solicitud.nombreIpress}</p>
          <p className="text-xs text-gray-500 mt-1">
            RENAES: {solicitud.codigoRenaes} | ID: {solicitud.idIpress}
          </p>
        </div>
      </div>

      {/* Fechas del Periodo */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200">
        <h4 className="font-semibold text-gray-900 mb-3">Periodo de Solicitud</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Inicio:</span>
            <p className="font-semibold text-gray-900">
              {formatFechaCorta(solicitud.fechaInicio)}
            </p>
          </div>
          <div>
            <span className="text-gray-600">Fin:</span>
            <p className="font-semibold text-gray-900">
              {formatFechaCorta(solicitud.fechaFin)}
            </p>
          </div>
          <div>
            <span className="text-gray-600">Código Periodo:</span>
            <p className="font-semibold text-gray-900">{solicitud.periodo}</p>
          </div>
        </div>
      </div>

      {/* Lista de Especialidades */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          Especialidades Solicitadas
        </h4>

        <div className="space-y-4">
          {(solicitud.detalles || []).map((detalle, index) => {
            const totalTurnos = detalle.turnoTM + detalle.turnoManana + detalle.turnoTarde;
            
            return (
              <div
                key={`${detalle.idDetalle}-${index}`}
                className="border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow"
              >
                {/* Header de la especialidad */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-bold text-gray-900">
                        {detalle.nombreServicio}
                      </h5>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {detalle.codigoServicio}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      ID Detalle: {detalle.idDetalle}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      {totalTurnos}
                    </div>
                    <p className="text-xs text-gray-500">turnos</p>
                  </div>
                </div>

                {/* Desglose de turnos */}
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Sunrise className="w-4 h-4 text-purple-600" />
                      <span className="text-xs font-medium text-gray-700">TM</span>
                    </div>
                    <p className="text-lg font-bold text-purple-600">
                      {detalle.turnoTM}
                    </p>
                  </div>

                  <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Sun className="w-4 h-4 text-yellow-600" />
                      <span className="text-xs font-medium text-gray-700">Mañana</span>
                    </div>
                    <p className="text-lg font-bold text-yellow-600">
                      {detalle.turnoManana}
                    </p>
                  </div>

                  <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Moon className="w-4 h-4 text-orange-600" />
                      <span className="text-xs font-medium text-gray-700">Tarde</span>
                    </div>
                    <p className="text-lg font-bold text-orange-600">
                      {detalle.turnoTarde}
                    </p>
                  </div>
                </div>

                {/* Toggles TC/TL */}
                <div className="flex gap-4 mb-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-4 h-4 rounded ${
                        detalle.tc ? "bg-green-500" : "bg-gray-300"
                      }`}
                    />
                    <span className="text-gray-700">Teleconsultorio (TC)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-4 h-4 rounded ${
                        detalle.tl ? "bg-blue-500" : "bg-gray-300"
                      }`}
                    />
                    <span className="text-gray-700">Teleconsulta (TL)</span>
                  </div>
                </div>

                {/* Observación - Solo si tiene texto */}
                {detalle.observacion && detalle.observacion.trim() !== "" && (
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200 mb-3">
                    <h6 className="text-xs font-semibold text-blue-700 mb-1">
                      Observación:
                    </h6>
                    <p className="text-sm text-gray-700">{detalle.observacion}</p>
                  </div>
                )}

                {/* Fechas detalle */}
                {detalle.fechasDetalle && detalle.fechasDetalle.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <h6 className="text-xs font-semibold text-gray-700 mb-2 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Fechas Programadas ({detalle.fechasDetalle.length})
                    </h6>
                    <div className="flex flex-wrap gap-2">
                      {detalle.fechasDetalle.map((fecha) => (
                        <div
                          key={fecha.idDetalleFecha}
                          className={`px-3 py-1 rounded-lg text-xs font-medium ${
                            fecha.bloque === "MANANA"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-orange-100 text-orange-800"
                          }`}
                        >
                          {formatFechaCorta(fecha.fecha)} - {fecha.bloque}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Estado y fechas de creación */}
                <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between text-xs text-gray-500">
                  <span>Estado: <span className="font-semibold">{detalle.estado}</span></span>
                  <span>Creado: {formatFecha(detalle.fechaCreacion)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

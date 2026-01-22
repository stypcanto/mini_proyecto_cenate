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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-gray-700" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Detalle de Solicitud
            </h3>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-sm text-gray-700 font-medium">{solicitud.nombreIpress}</span>
              <span className={`px-2.5 py-0.5 rounded-md text-xs font-semibold border ${estadoBadgeClass(solicitud.estado)}`}>
                {solicitud.estado}
              </span>
              <span className="text-sm text-gray-500">• {solicitud.periodoDescripcion}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Información en 3 columnas */}
      <div className="grid grid-cols-3 gap-6">
        {/* Solicitud */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-200">
            <Hash className="w-4 h-4 text-gray-500" />
            <p className="text-sm font-semibold text-gray-900">Solicitud</p>
          </div>
          <Row label="ID SOLICITUD" value={solicitud.idSolicitud} />
          <Row label="ID PERIODO" value={solicitud.idPeriodo} />
          <Row label="ESPECIALIDADES" value={solicitud.totalEspecialidades} />
          <Row label="TURNOS" value={solicitud.totalTurnosSolicitados} />
        </div>

        {/* IPRESS */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-200">
            <Building2 className="w-4 h-4 text-gray-500" />
            <p className="text-sm font-semibold text-gray-900">IPRESS</p>
          </div>
          <Row label="RENAES" value={solicitud.codigoRenaes} />
          <Row label="NOMBRE" value={solicitud.nombreIpress} />
          <Row label="RED" value={solicitud.nombreRed || "—"} />
        </div>

        {/* Usuario */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-200">
            <User className="w-4 h-4 text-gray-500" />
            <p className="text-sm font-semibold text-gray-900">Usuario</p>
          </div>
          <Row label="ID" value={solicitud.idUsuarioCreador || "—"} />
          <Row label="NOMBRE" value={solicitud.nombreUsuarioCreador} />
          <Row label="EMAIL" value={solicitud.emailContacto || "—"} />
          <Row label="TELÉFONO" value={solicitud.telefonoContacto || "—"} />
        </div>
      </div>

      {/* Fechas */}
      <div className="grid grid-cols-3 gap-6 pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-500" />
          <div>
            <div className="text-xs text-gray-500 uppercase">Creado:</div>
            <div className="text-sm text-gray-900">{formatFecha(solicitud.fechaCreacion || solicitud.createdAt)}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-500" />
          <div>
            <div className="text-xs text-gray-500 uppercase">Actualizado:</div>
            <div className="text-sm text-gray-900">{formatFecha(solicitud.fechaActualizacion || solicitud.updatedAt)}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-500" />
          <div>
            <div className="text-xs text-gray-500 uppercase">Enviado:</div>
            <div className="text-sm text-gray-900">{formatFecha(solicitud.fechaEnvio)}</div>
          </div>
        </div>
      </div>

      {/* Tabla compacta de Especialidades */}
      <div className="bg-white rounded-2xl p-3 border border-slate-200">
        <h4 className="font-semibold text-gray-900 mb-3 px-2 flex items-center gap-2 text-sm">
          <Users className="w-4 h-4 text-blue-600" />
          Especialidades Solicitadas
        </h4>

        <div className="max-h-[500px] overflow-y-auto border border-slate-200 rounded-lg">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
              <tr>
                <th className="px-2 py-2 text-left font-semibold text-gray-700">#</th>
                <th className="px-2 py-2 text-left font-semibold text-gray-700">Especialidad</th>
                <th className="px-2 py-2 text-center font-semibold text-gray-700">Estado</th>
                <th className="px-2 py-2 text-center font-semibold text-gray-700">TM</th>
                <th className="px-2 py-2 text-center font-semibold text-gray-700">Mañana</th>
                <th className="px-2 py-2 text-center font-semibold text-gray-700">Tarde</th>
                <th className="px-2 py-2 text-center font-semibold text-gray-700">Total</th>
                <th className="px-2 py-2 text-center font-semibold text-gray-700">TC</th>
                <th className="px-2 py-2 text-center font-semibold text-gray-700">TL</th>
                <th className="px-2 py-2 text-center font-semibold text-gray-700">Fechas</th>
                <th className="px-2 py-2 text-left font-semibold text-gray-700">Observación</th>
              </tr>
            </thead>
            <tbody>
              {(solicitud.detalles || []).length === 0 ? (
                <tr>
                  <td colSpan="11" className="px-4 py-8 text-center text-gray-500">
                    <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm">No hay especialidades registradas</p>
                  </td>
                </tr>
              ) : (
                (solicitud.detalles || []).map((detalle, index) => {
                  const totalTurnos = detalle.turnoTM + detalle.turnoManana + detalle.turnoTarde;
                  const yesNoPill = (valor) =>
                    valor ? (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100 text-green-700 border border-green-300">
                        <CheckCircle2 className="w-3 h-3" />
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-gray-400 border border-gray-200">
                        ✕
                      </span>
                    );

                  return (
                    <tr key={`${detalle.idDetalle}-${index}`} className="hover:bg-gray-50 border-b border-slate-100 last:border-b-0">
                      <td className="px-2 py-1.5 text-gray-500">{index + 1}</td>
                      
                      <td className="px-2 py-1.5">
                        <div className="font-semibold text-gray-900">{detalle.nombreServicio}</div>
                        <div className="text-[10px] text-gray-500">Cód: {detalle.codigoServicio}</div>
                      </td>

                      <td className="px-2 py-1.5 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                          detalle.estado === "APROBADO"
                            ? "bg-green-100 text-green-700 border-green-300"
                            : detalle.estado === "RECHAZADO"
                            ? "bg-red-100 text-red-700 border-red-300"
                            : "bg-amber-100 text-amber-700 border-amber-300"
                        }`}>
                          {detalle.estado}
                        </span>
                      </td>

                      <td className="px-2 py-1.5 text-center">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100 text-purple-700 border border-purple-200">
                          {detalle.turnoTM}
                        </span>
                      </td>

                      <td className="px-2 py-1.5 text-center">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-yellow-100 text-yellow-700 border border-yellow-200">
                          {detalle.turnoManana}
                        </span>
                      </td>

                      <td className="px-2 py-1.5 text-center">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-orange-100 text-orange-700 border border-orange-200">
                          {detalle.turnoTarde}
                        </span>
                      </td>

                      <td className="px-2 py-1.5 text-center">
                        <span className="text-base font-bold text-blue-600">{totalTurnos}</span>
                      </td>

                      <td className="px-2 py-1.5 text-center">{yesNoPill(detalle.tc)}</td>
                      <td className="px-2 py-1.5 text-center">{yesNoPill(detalle.tl)}</td>

                      <td className="px-2 py-1.5 text-xs">
                        {detalle.fechasDetalle && detalle.fechasDetalle.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {detalle.fechasDetalle.map((fechaItem, idx) => (
                              <span 
                                key={idx}
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200"
                                title={`${formatFechaCorta(fechaItem.fecha)} - ${fechaItem.bloque}`}
                              >
                                <Calendar className="w-2.5 h-2.5" />
                                {formatFechaCorta(fechaItem.fecha)}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>

                      <td className="px-2 py-1.5 text-xs max-w-xs">
                        {detalle.observacion && detalle.observacion.trim() !== "" ? (
                          <div className="text-gray-700 leading-tight" title={detalle.observacion}>
                            {detalle.observacion}
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        <div className="mt-2 px-2 text-[10px] text-gray-500">
          Total: {(solicitud.detalles || []).length} especialidad(es) | {solicitud.totalTurnosSolicitados} turno(s)
        </div>
      </div>
    </div>
  );
}

// Componente auxiliar para filas de información
function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">{label}</span>
      <span className="text-sm text-gray-900 font-medium">{value ?? "—"}</span>
    </div>
  );
}

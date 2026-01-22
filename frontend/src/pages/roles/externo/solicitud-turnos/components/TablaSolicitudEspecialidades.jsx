// ========================================================================
// TablaSolicitudEspecialidades.jsx - Nueva interfaz de tabla para solicitud de turnos
// ------------------------------------------------------------------------
// Interfaz basada en tabla interactiva con especialidades
// ========================================================================

import React, { useState, useMemo, useEffect } from "react";
import { Check, X, Calendar, FileText, Search, Filter } from "lucide-react";
import ModalSeleccionarFechas from "./ModalSeleccionarFechas";

// Componente Switch personalizado
const CustomSwitch = ({ checked, onChange, disabled = false, color = "green" }) => {
  const colorClasses = {
    green: {
      bg: checked ? "bg-green-500" : "bg-gray-300",
      thumb: checked ? "translate-x-5" : "translate-x-0",
      focus: "focus:ring-green-500"
    },
    blue: {
      bg: checked ? "bg-blue-500" : "bg-gray-300",
      thumb: checked ? "translate-x-5" : "translate-x-0",
      focus: "focus:ring-blue-500"
    }
  };

  const classes = colorClasses[color];

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full transition-colors
        focus:outline-none focus:ring-2 focus:ring-offset-2 ${classes.focus}
        ${classes.bg}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <span
        className={`
          inline-block h-4 w-4 transform rounded-full bg-white transition-transform
          ${classes.thumb}
        `}
      />
    </button>
  );
};

/**
 * Componente de tabla interactiva para solicitar turnos por especialidad
 * @param {Object} props
 * @param {Array} props.especialidades - Lista de especialidades disponibles
 * @param {Object} props.periodo - Periodo seleccionado
 * @param {Array} props.registros - Registros actuales (formato: [{idServicio, turnoTM, turnoM, turnoT, tc, tl, fecha, estado}])
 * @param {Function} props.onChange - Callback cuando cambian los datos
 * @param {Function} props.onAutoGuardarFechas - Callback para auto-guardar cuando se confirman fechas
 * @param {Boolean} props.soloLectura - Si es solo lectura
 * @param {Boolean} props.mostrarEncabezado - Si muestra el encabezado púrpura (default: true)
 */
export default function TablaSolicitudEspecialidades({
  especialidades = [],
  periodo = null,
  registros = [],
  onChange = () => {},
  onAutoGuardarFechas = null,
  soloLectura = false,
  mostrarEncabezado = true,
}) {
  // Estado local para las especialidades seleccionadas y sus configuraciones
  const [datos, setDatos] = useState(() => {
    // Inicializar desde registros existentes
    const inicial = {};
    registros.forEach((r) => {
      inicial[r.idServicio] = {
        idServicio: r.idServicio,
        idDetalle: r.idDetalle || null,
        turnoTM: r.turnoTM || 0,
        turnoManana: r.turnoManana || 0,
        turnoTarde: r.turnoTarde || 0,
        tc: r.tc !== undefined ? r.tc : true,
        tl: r.tl !== undefined ? r.tl : true,
        fechas: r.fechas || [],
        estado: r.estado || "PENDIENTE",
      };
    });
    return inicial;
  });

  // Sincronizar cuando cambian los registros props (al cargar solicitud)
  useEffect(() => {
    const nuevo = {};
    registros.forEach((r) => {
      nuevo[r.idServicio] = {
        idServicio: r.idServicio,
        idDetalle: r.idDetalle || null,
        turnoTM: r.turnoTM || 0,
        turnoManana: r.turnoManana || 0,
        turnoTarde: r.turnoTarde || 0,
        tc: r.tc !== undefined ? r.tc : true,
        tl: r.tl !== undefined ? r.tl : true,
        fechas: r.fechas || [],
        estado: r.estado || "PENDIENTE",
      };
    });
    setDatos(nuevo);
  }, [registros]);

  // Estado para controlar el modal de fechas
  const [modalFechasOpen, setModalFechasOpen] = useState(false);
  const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState(null);

  // Filtros
  const [filtroEspecialidad, setFiltroEspecialidad] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("TODAS"); // TODAS | REGISTRADAS | NO_REGISTRADAS

  // Actualizar padre cuando cambian los datos
  const notificarCambio = (nuevosDatos) => {
    // Pasar TODOS los registros, incluyendo los que tienen turnos = 0
    // El padre (FormularioSolicitudTurnos) decidirá si eliminarlos o no
    const registrosArray = Object.values(nuevosDatos);
    onChange(registrosArray);
  };

  // Actualizar campo de una especialidad
  const actualizarCampo = (idServicio, campo, valor) => {
    setDatos((prev) => {
      const nuevo = { ...prev };

      if (!nuevo[idServicio]) {
        nuevo[idServicio] = {
          idServicio,
          turnoTM: 0,
          turnoManana: 0,
          turnoTarde: 0,
          tc: true,
          tl: true,
          fechas: [],
          estado: "PENDIENTE",
        };
      }

      nuevo[idServicio] = {
        ...nuevo[idServicio],
        [campo]: valor,
      };

      notificarCambio(nuevo);
      return nuevo;
    });
  };

  // Calcular total de turnos
  const calcularTotal = (idServicio) => {
    const d = datos[idServicio];
    if (!d) return 0;
    return (
      Number(d.turnoTM || 0) + Number(d.turnoManana || 0) + Number(d.turnoTarde || 0)
    );
  };

  // Obtener clase de badge según estado
  const getEstadoBadgeClass = (estado) => {
    switch (estado) {
      case "APROBADO":
        return "bg-green-500 text-white";
      case "ASIGNADO":
        return "bg-blue-500 text-white";
      case "BLOQUEADO":
        return "bg-gray-400 text-white";
      case "PENDIENTE":
        return "bg-orange-500 text-white";
      case "NO_PROCEDE":
        return "bg-orange-500 text-white";
      case "RECHAZADO":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-300 text-gray-700";
    }
  };

  // Obtener etiqueta del estado
  const getEstadoLabel = (estado) => {
    switch (estado) {
      case "APROBADO":
        return "Aprobado";
      case "ASIGNADO":
        return "Asignado";
      case "BLOQUEADO":
        return "Bloqueado";
      case "PENDIENTE":
        return "Pendiente";
      case "NO_PROCEDE":
        return "No procede";
      case "RECHAZADO":
        return "Rechazado";
      default:
        return "Seleccionar";
    }
  };

  // Especialidades con datos (para mostrar días)
  const especialidadesConDatos = useMemo(() => {
    return especialidades.map((esp) => {
      const dato = datos[esp.idServicio] || null;
      const total = calcularTotal(esp.idServicio);
      const tieneRegistro = dato && total > 0;

      return {
        ...esp,
        dato,
        total,
        tieneRegistro,
        diasAsignados: dato ? total : 0, // Simulación - en realidad vendría del backend
      };
    });
  }, [especialidades, datos]);

  // Especialidades filtradas
  const especialidadesFiltradas = useMemo(() => {
    return especialidadesConDatos.filter((esp) => {
      // Filtro por texto (especialidad)
      const coincideTexto = esp.descServicio?.toLowerCase().includes(filtroEspecialidad.toLowerCase());
      
      // Filtro por estado basado en si está guardada en BD (idDetalle), no en el total actual
      let coincideEstado = true;
      if (filtroEstado === "REGISTRADAS") {
        // Registradas: tienen idDetalle (ya guardadas en BD)
        coincideEstado = esp.dato?.idDetalle != null;
      } else if (filtroEstado === "PENDIENTES") {
        // Pendientes: no tienen idDetalle (sin guardar en BD)
        coincideEstado = !esp.dato?.idDetalle;
      }
      // TODAS: no filtra

      return coincideTexto && coincideEstado;
    });
  }, [especialidadesConDatos, filtroEspecialidad, filtroEstado]);

  return (
    <div className="space-y-4">
      {/* Encabezado (opcional) */}
      {mostrarEncabezado && (
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-4 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <div className="bg-white bg-opacity-20 p-2 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Solicita tus especialidades</h2>
              <p className="text-purple-100 text-xs">
                {periodo
                  ? `Se encuentra aperturado el mes de ${new Date(periodo.fechaInicio).toLocaleDateString("es-ES", { month: "long", year: "numeric" })}`
                  : "Selecciona un periodo para continuar"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        {/* Filtros */}
        <div className="bg-slate-50 p-4 border-b border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Filtro por especialidad */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar especialidad..."
                value={filtroEspecialidad}
                onChange={(e) => setFiltroEspecialidad(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0A5BA9] focus:border-[#0A5BA9]"
              />
            </div>

            {/* Filtro por estado */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#0A5BA9] focus:border-[#0A5BA9] appearance-none bg-white"
              >
                <option value="TODAS">Todas</option>
                <option value="REGISTRADAS">Registradas</option>
                <option value="PENDIENTES">Pendientes</option>
              </select>
            </div>
          </div>

          {/* Contador de resultados */}
          <div className="mt-2 text-xs text-slate-600">
            Mostrando {especialidadesFiltradas.length} de {especialidadesConDatos.length} especialidades
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-700 uppercase">
                  Especialidad
                </th>
                <th className="px-4 py-3 text-center text-xs font-bold text-slate-700 uppercase">
                  Turno<br />TM
                </th>
                <th className="px-4 py-3 text-center text-xs font-bold text-slate-700 uppercase">
                  Turnos<br />Mañana
                </th>
                <th className="px-4 py-3 text-center text-xs font-bold text-slate-700 uppercase">
                  Turnos<br />Tarde
                </th>
                <th className="px-4 py-3 text-center text-xs font-bold text-slate-700 uppercase">
                  Teleconsultorio
                </th>
                <th className="px-4 py-3 text-center text-xs font-bold text-slate-700 uppercase">
                  Teleconsulta
                </th>
                <th className="px-4 py-3 text-center text-xs font-bold text-slate-700 uppercase">
                  Total<br />Turnos
                </th>
                <th className="px-4 py-3 text-center text-xs font-bold text-slate-700 uppercase">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Fecha
                </th>
                <th className="px-4 py-3 text-center text-xs font-bold text-slate-700 uppercase">
                  Estado
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {especialidadesFiltradas.map((esp) => {
                const d = esp.dato;
                const total = esp.total;

                return (
                  <tr key={esp.idServicio} className="hover:bg-slate-50 transition-colors">
                    {/* Especialidad */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${esp.dato?.idDetalle ? 'bg-purple-100' : 'bg-slate-100'}`}>
                          <Check className={`w-4 h-4 ${esp.dato?.idDetalle ? 'text-purple-600' : 'text-slate-400'}`} />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800">
                            {esp.descServicio}
                          </div>
                          <div className="text-xs text-slate-500">
                            {esp.diasAsignados} día(s) • {esp.dato?.idDetalle ? 'Registrada' : 'Pendiente'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Turno TM */}
                    <td className="px-4 py-4 text-center">
                      <input
                        type="number"
                        min="0"
                        value={d?.turnoTM || 0}
                        onChange={(e) => {
                          const valor = Math.max(0, parseInt(e.target.value) || 0);
                          actualizarCampo(esp.idServicio, "turnoTM", valor);
                          // Si hay TM, resetear Mañana y Tarde
                          if (valor > 0) {
                            actualizarCampo(esp.idServicio, "turnoManana", 0);
                            actualizarCampo(esp.idServicio, "turnoTarde", 0);
                          }
                        }}
                        disabled={soloLectura}
                        className="w-16 px-3 py-2 text-center border-2 border-purple-300 rounded-lg font-bold text-purple-600 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100"
                      />
                    </td>

                    {/* Turnos Mañana */}
                    <td className="px-4 py-4 text-center">
                      <input
                        type="number"
                        min="0"
                        value={d?.turnoManana || 0}
                        onChange={(e) =>
                          actualizarCampo(
                            esp.idServicio,
                            "turnoManana",
                            Math.max(0, parseInt(e.target.value) || 0)
                          )
                        }
                        disabled={soloLectura || (d?.turnoTM > 0)}
                        className="w-16 px-3 py-2 text-center border-2 border-orange-300 rounded-lg font-bold text-orange-600 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-gray-100 disabled:opacity-50"
                      />
                    </td>

                    {/* Turnos Tarde */}
                    <td className="px-4 py-4 text-center">
                      <input
                        type="number"
                        min="0"
                        value={d?.turnoTarde || 0}
                        onChange={(e) =>
                          actualizarCampo(
                            esp.idServicio,
                            "turnoTarde",
                            Math.max(0, parseInt(e.target.value) || 0)
                          )
                        }
                        disabled={soloLectura || (d?.turnoTM > 0)}
                        className="w-16 px-3 py-2 text-center border-2 border-purple-300 rounded-lg font-bold text-purple-600 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100 disabled:opacity-50"
                      />
                    </td>

                    {/* Teleconsultorio */}
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <CustomSwitch
                          checked={d?.tc || false}
                          onChange={(checked) => actualizarCampo(esp.idServicio, "tc", checked)}
                          disabled={soloLectura}
                          color="green"
                        />
                        <span className={`text-sm font-medium ${d?.tc ? 'text-green-600' : 'text-gray-500'}`}>
                          {d?.tc ? 'Sí' : 'No'}
                        </span>
                      </div>
                    </td>

                    {/* Teleconsulta */}
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <CustomSwitch
                          checked={d?.tl || false}
                          onChange={(checked) => actualizarCampo(esp.idServicio, "tl", checked)}
                          disabled={soloLectura}
                          color="blue"
                        />
                        <span className={`text-sm font-medium ${d?.tl ? 'text-blue-600' : 'text-gray-500'}`}>
                          {d?.tl ? 'Sí' : 'No'}
                        </span>
                      </div>
                    </td>

                    {/* Total Turnos */}
                    <td className="px-4 py-4 text-center">
                      <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-cyan-500 text-white font-bold text-lg">
                        {total}
                      </div>
                    </td>

                    {/* Fecha */}
                    <td className="px-4 py-4 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setEspecialidadSeleccionada(esp);
                          setModalFechasOpen(true);
                        }}
                        className={`px-3 py-1.5 rounded-lg border-2 text-xs font-semibold transition-all ${
                          total > 0 && !soloLectura
                            ? "border-blue-500 text-blue-500 hover:bg-blue-50 cursor-pointer"
                            : "border-gray-300 text-gray-400 cursor-not-allowed"
                        }`}
                        disabled={soloLectura || total === 0}
                        title={total === 0 ? "Configura turnos primero (TM, Mañana o Tarde)" : "Seleccionar fechas específicas"}
                      >
                        Opcional
                      </button>
                    </td>

                    {/* Estado */}
                    <td className="px-4 py-4 text-center">
                      <div
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm ${getEstadoBadgeClass(
                          d?.estado || "PENDIENTE"
                        )}`}
                      >
                        {d?.estado === "ASIGNADO" && <Check className="w-4 h-4" />}
                        {d?.estado === "APROBADO" && <Check className="w-4 h-4" />}
                        {d?.estado === "PENDIENTE" && <Calendar className="w-4 h-4" />}
                        {getEstadoLabel(d?.estado || "PENDIENTE")}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {especialidades.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No hay especialidades disponibles</p>
          </div>
        )}
      </div>

      {/* Modal de selección de fechas */}
      {modalFechasOpen && especialidadSeleccionada && (
        <ModalSeleccionarFechas
          open={modalFechasOpen}
          onClose={() => {
            setModalFechasOpen(false);
            setEspecialidadSeleccionada(null);
          }}
          especialidad={especialidadSeleccionada.descripcion}
          turnoManana={datos[especialidadSeleccionada.idServicio]?.turnoManana || 0}
          turnoTarde={datos[especialidadSeleccionada.idServicio]?.turnoTarde || 0}
          idDetalle={datos[especialidadSeleccionada.idServicio]?.idDetalle || null}
          fechasIniciales={datos[especialidadSeleccionada.idServicio]?.fechas || []}
          onConfirm={(fechasSeleccionadas) => {
            console.log("📅 Fechas seleccionadas en modal:", fechasSeleccionadas);
            console.log("🔧 onAutoGuardarFechas existe?", !!onAutoGuardarFechas);
            console.log("🔧 especialidadSeleccionada:", especialidadSeleccionada);
            
            // Actualizar las fechas en los datos
            actualizarCampo(especialidadSeleccionada.idServicio, "fechas", fechasSeleccionadas);
            
            // Auto-guardar si existe el callback - pasar las fechas directamente
            if (onAutoGuardarFechas) {
              console.log("🚀 Llamando a onAutoGuardarFechas...");
              // NO esperar el tick - llamar inmediatamente con las fechas
              onAutoGuardarFechas(especialidadSeleccionada.idServicio, fechasSeleccionadas);
            } else {
              console.warn("⚠️ onAutoGuardarFechas NO está definido");
            }
            
            setModalFechasOpen(false);
            setEspecialidadSeleccionada(null);
          }}
        />
      )}
    </div>
  );
}

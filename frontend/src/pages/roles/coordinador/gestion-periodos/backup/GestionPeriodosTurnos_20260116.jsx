// ========================================================================
// GestionPeriodosTurnos.jsx - Panel del Coordinador
// ------------------------------------------------------------------------
// ✅ Tabs: Períodos | Solicitudes
// ✅ Ver Detalle: carga /api/solicitudes-turno/{idSolicitud} y muestra en modo lectura (bonito)
// ✅ Botones Aprobar/Rechazar SOLO si estado === "ENVIADO" (en lista y en modal)
// ========================================================================

import React, { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  Clock,
  FileText,
  CheckCircle2,
  XCircle,
  Eye,
  Search,
  Filter,
  Loader2,
  Plus,
  ToggleLeft,
  ToggleRight,
  Building2,
  Users,
  Mail,
  Phone,
  Hash,
  MapPin,
  ClipboardList,
} from "lucide-react";

import { periodoSolicitudService } from "../../../services/periodoSolicitudService";
import { solicitudTurnosService } from "../../../services/solicitudTurnosService";

// ------------------------------
// Helpers UI
// ------------------------------
const fmtDateTime = (val) => {
  if (!val) return "—";
  try {
    return new Date(val).toLocaleString("es-PE", { hour12: true });
  } catch {
    return String(val);
  }
};

const chipDay = (d) => (
  <span
    key={d}
    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border border-indigo-200 bg-indigo-50 text-indigo-700"
  >
    {d}
  </span>
);

const yesNoPill = (yes) => (
  <span
    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
      yes ? "border-green-200 bg-green-50 text-green-700" : "border-gray-200 bg-gray-50 text-gray-600"
    }`}
  >
    {yes ? "Sí" : "No"}
  </span>
);

// ========================================================================
// ✅ Componente principal
// ========================================================================
export default function GestionPeriodosTurnos() {
  const [activeTab, setActiveTab] = useState("periodos"); // 'periodos' | 'solicitudes'

  const [loadingPeriodos, setLoadingPeriodos] = useState(true);
  const [loadingSolicitudes, setLoadingSolicitudes] = useState(false);

  const [periodos, setPeriodos] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);

  const [showNuevoPeriodoModal, setShowNuevoPeriodoModal] = useState(false);
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [solicitudDetalle, setSolicitudDetalle] = useState(null);

  // Para rechazar desde lista (sin entrar al detalle primero)
  const [prefillRechazo, setPrefillRechazo] = useState(false);

  const [filtros, setFiltros] = useState({
    estado: "TODAS",
    periodo: "",
    busqueda: "",
  });

  // ============================================================
  // Cargar datos iniciales
  // ============================================================
  useEffect(() => {
    cargarPeriodos();
  }, []);

  useEffect(() => {
    if (activeTab === "solicitudes") {
      cargarSolicitudes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, filtros.estado, filtros.periodo, filtros.busqueda]);

  const cargarPeriodos = async () => {
    setLoadingPeriodos(true);
    try {
      const data = await periodoSolicitudService.obtenerTodos();
      setPeriodos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al cargar períodos:", err);
      setPeriodos([]);
    } finally {
      setLoadingPeriodos(false);
    }
  };

  const cargarSolicitudes = async () => {
    setLoadingSolicitudes(true);
    try {
      const data = await solicitudTurnosService.obtenerTodas(filtros);

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.content)
        ? data.content
        : [];

      // Filtro local de búsqueda (si tu backend no soporta busqueda)
      const q = (filtros.busqueda || "").trim().toLowerCase();
      const listFiltered = !q
        ? list
        : list.filter((s) => {
            const nombre = (s?.nombreIpress || "").toLowerCase();
            const cod = String(s?.codIpress || "").toLowerCase();
            return nombre.includes(q) || cod.includes(q);
          });

      setSolicitudes(listFiltered);
    } catch (err) {
      console.error("Error al cargar solicitudes:", err);
      setSolicitudes([]);
    } finally {
      setLoadingSolicitudes(false);
    }
  };

  // ============================================================
  // Acciones de períodos
  // ============================================================
  const handleTogglePeriodo = async (periodo) => {
    try {
      const nuevoEstado = periodo.estado === "ACTIVO" ? "CERRADO" : "ACTIVO";
      await periodoSolicitudService.cambiarEstado(periodo.idPeriodo, nuevoEstado);
      await cargarPeriodos();
    } catch (err) {
      console.log(err);
      window.alert("Error al cambiar estado del período");
    }
  };

  const handleCrearPeriodo = async (nuevoPeriodo) => {
    try {
      await periodoSolicitudService.crear(nuevoPeriodo);
      await cargarPeriodos();
      setShowNuevoPeriodoModal(false);
    } catch (err) {
      console.log(err);
      window.alert("Error al crear período");
    }
  };

  // ============================================================
  // Acciones de solicitudes
  // ============================================================
  const handleVerDetalle = async (solicitud) => {
    try {
      setPrefillRechazo(false);
      setLoadingDetalle(true);
      setShowDetalleModal(true); // abre rápido (con loader)
      const detalle = await solicitudTurnosService.obtenerPorId(solicitud.idSolicitud);
      setSolicitudDetalle(detalle);
    } catch (err) {
      console.log(err);
      window.alert("Error al cargar detalle de la solicitud");
      setShowDetalleModal(false);
      setSolicitudDetalle(null);
    } finally {
      setLoadingDetalle(false);
    }
  };

  const handleAprobarSolicitud = async (idSolicitud) => {
    if (!window.confirm("¿Está seguro de aprobar esta solicitud?")) return;
    try {
      await solicitudTurnosService.aprobarSolicitud(idSolicitud);
      await cargarSolicitudes();
      setShowDetalleModal(false);
      setSolicitudDetalle(null);
    } catch (err) {
      console.log(err);
      window.alert("Error al aprobar solicitud");
    }
  };

  const handleRechazarSolicitud = async (idSolicitud, motivo) => {
    if (!motivo) {
      window.alert("Debe indicar el motivo del rechazo");
      return;
    }
    try {
      await solicitudTurnosService.rechazarSolicitud(idSolicitud, motivo);
      await cargarSolicitudes();
      setShowDetalleModal(false);
      setSolicitudDetalle(null);
    } catch (err) {
      console.log(err);
      window.alert("Error al rechazar solicitud");
    }
  };

  const abrirRechazoRapido = async (solicitud) => {
    // Abre modal directo en “Rechazo”, cargando detalle real para mostrar bien la tabla
    try {
      setPrefillRechazo(true);
      setLoadingDetalle(true);
      setShowDetalleModal(true);
      const detalle = await solicitudTurnosService.obtenerPorId(solicitud.idSolicitud);
      setSolicitudDetalle(detalle);
    } catch (err) {
      console.log(err);
      window.alert("Error al cargar detalle de la solicitud");
      setShowDetalleModal(false);
      setSolicitudDetalle(null);
    } finally {
      setLoadingDetalle(false);
    }
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      ACTIVO: "bg-green-100 text-green-800 border-green-300",
      INACTIVO: "bg-gray-100 text-gray-800 border-gray-300",
      CERRADO: "bg-red-100 text-red-800 border-red-300",
      BORRADOR: "bg-yellow-100 text-yellow-800 border-yellow-300",
      ENVIADO: "bg-blue-100 text-blue-800 border-blue-300",
      APROBADA: "bg-green-100 text-green-800 border-green-300",
      RECHAZADA: "bg-red-100 text-red-800 border-red-300",
      REVISADO: "bg-purple-100 text-purple-800 border-purple-300",
    };
    return badges[estado] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  // ============================================================
  // Render
  // ============================================================
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Períodos y Solicitudes</h1>
          <p className="text-gray-600">
            Administre los períodos de solicitud y revise las peticiones de turnos de las IPRESS
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab("periodos")}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "periodos"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>Gestión de Períodos</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab("solicitudes")}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "solicitudes"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  <span>Solicitudes Recibidas</span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Contenido */}
        {activeTab === "periodos" ? (
          <TabPeriodos
            periodos={periodos}
            loading={loadingPeriodos}
            onTogglePeriodo={handleTogglePeriodo}
            onCrearPeriodo={() => setShowNuevoPeriodoModal(true)}
            getEstadoBadge={getEstadoBadge}
          />
        ) : (
          <TabSolicitudes
            solicitudes={solicitudes}
            loading={loadingSolicitudes}
            filtros={filtros}
            setFiltros={setFiltros}
            onVerDetalle={handleVerDetalle}
            onAprobar={handleAprobarSolicitud}
            onRechazar={abrirRechazoRapido}
            getEstadoBadge={getEstadoBadge}
            periodos={periodos}
          />
        )}

        {/* Modal Nuevo Período */}
        {showNuevoPeriodoModal && (
          <ModalNuevoPeriodo onClose={() => setShowNuevoPeriodoModal(false)} onCrear={handleCrearPeriodo} />
        )}

        {/* Modal Detalle */}
        {showDetalleModal && (
          <ModalDetalleSolicitud
            loading={loadingDetalle}
            solicitud={solicitudDetalle}
            onClose={() => {
              setShowDetalleModal(false);
              setSolicitudDetalle(null);
              setPrefillRechazo(false);
            }}
            onAprobar={handleAprobarSolicitud}
            onRechazar={handleRechazarSolicitud}
            getEstadoBadge={getEstadoBadge}
            prefillRechazo={prefillRechazo}
          />
        )}
      </div>
    </div>
  );
}

// ========================================================================
// Tab: Periodos
// ========================================================================
function TabPeriodos({ periodos, loading, onTogglePeriodo, onCrearPeriodo, getEstadoBadge }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Períodos de Solicitud</h2>
        <button
          onClick={onCrearPeriodo}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuevo Período
        </button>
      </div>

      <div className="divide-y divide-gray-200">
        {periodos.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg mb-2">No hay períodos configurados</p>
            <p className="text-sm">Cree un nuevo período para comenzar a recibir solicitudes</p>
          </div>
        ) : (
          periodos.map((periodo) => (
            <div key={periodo.idPeriodo} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {periodo.nombrePeriodo ?? periodo.descripcion ?? `Periodo ${periodo.idPeriodo}`}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getEstadoBadge(periodo.estado)}`}>
                      {periodo.estado}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Inicio:{" "}
                        {periodo.fechaInicio ? new Date(periodo.fechaInicio).toLocaleDateString("es-PE") : "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Fin:{" "}
                        {periodo.fechaFin ? new Date(periodo.fechaFin).toLocaleDateString("es-PE") : "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span>Solicitudes: {periodo.totalSolicitudes || 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Aprobadas: {periodo.solicitudesAprobadas || 0}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onTogglePeriodo(periodo)}
                  className="ml-6 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  title={periodo.estado === "ACTIVO" ? "Desactivar" : "Activar"}
                >
                  {periodo.estado === "ACTIVO" ? (
                    <ToggleRight className="w-8 h-8 text-green-600" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ========================================================================
// Tab: Solicitudes (lista + botones aprobar/rechazar si ENVIADO)
// ========================================================================
function TabSolicitudes({
  solicitudes,
  loading,
  filtros,
  setFiltros,
  onVerDetalle,
  onAprobar,
  onRechazar,
  getEstadoBadge,
  periodos,
}) {
  const safeSolicitudes = Array.isArray(solicitudes) ? solicitudes : [];

  // Para mostrar el nombre del periodo en la tarjeta (si lo tienes cargado)
  const periodoMap = useMemo(() => {
    const m = new Map();
    (periodos || []).forEach((p) => m.set(Number(p.idPeriodo), p.nombrePeriodo ?? p.descripcion ?? `Periodo ${p.idPeriodo}`));
    return m;
  }, [periodos]);

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Filtros */}
      <div className="p-6 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="w-4 h-4 inline mr-1" />
              Estado
            </label>
            <select
              value={filtros.estado}
              onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="TODAS">Todas</option>
              <option value="BORRADOR">BORRADOR</option>
              <option value="ENVIADO">ENVIADO</option>
              <option value="APROBADA">APROBADA</option>
              <option value="RECHAZADA">RECHAZADA</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Período
            </label>
            <select
              value={filtros.periodo}
              onChange={(e) => setFiltros({ ...filtros, periodo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos los períodos</option>
              {periodos.map((p) => (
                <option key={p.idPeriodo} value={p.idPeriodo}>
                  {p.nombrePeriodo ?? p.descripcion ?? `Periodo ${p.idPeriodo}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Search className="w-4 h-4 inline mr-1" />
              Buscar IPRESS (local)
            </label>
            <input
              type="text"
              value={filtros.busqueda}
              onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })}
              placeholder="Nombre o código..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : safeSolicitudes.length === 0 ? (
        <div className="p-12 text-center text-gray-500">
          <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-lg mb-2">No se encontraron solicitudes</p>
          <p className="text-sm">Ajuste los filtros o espere a que las IPRESS envíen sus solicitudes</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {safeSolicitudes.map((solicitud) => {
            const periodoLabel = periodoMap.get(Number(solicitud.idPeriodo)) ?? `Periodo ${solicitud.idPeriodo}`;
            const isEnviado = solicitud.estado === "ENVIADO";

            return (
              <div key={solicitud.idSolicitud} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">{solicitud.nombreIpress}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getEstadoBadge(solicitud.estado)}`}>
                        {solicitud.estado}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        <span>Solicitud: {solicitud.idSolicitud}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Periodo: {solicitud.idPeriodo} <span className="text-gray-400">•</span> {periodoLabel}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>Creación: {fmtDateTime(solicitud.fechaCreacion)}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>Envío: {fmtDateTime(solicitud.fechaEnvio)}</span>
                      </div>

                      <div className="flex items-center gap-2 md:col-span-2">
                        <Users className="w-4 h-4" />
                        <span>Actualización: {fmtDateTime(solicitud.fechaActualizacion)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Botonera */}
                  <div className="min-w-[190px] flex flex-col gap-2">
                    <button
                      onClick={() => onVerDetalle(solicitud)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      Ver Detalle
                    </button>

                    {isEnviado && (
                      <>
                        <button
                          onClick={() => onAprobar(solicitud.idSolicitud)}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Aprobar
                        </button>

                        <button
                          onClick={() => onRechazar(solicitud)}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                          Rechazar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ========================================================================
// Modal: Nuevo Período
// ========================================================================
function ModalNuevoPeriodo({ onClose, onCrear }) {
  const [formData, setFormData] = useState({
    nombrePeriodo: "",
    fechaInicio: "",
    fechaFin: "",
    descripcion: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onCrear(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Crear Nuevo Período</h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Período *</label>
            <input
              type="text"
              required
              value={formData.nombrePeriodo}
              onChange={(e) => setFormData({ ...formData, nombrePeriodo: e.target.value })}
              placeholder="Ej: Febrero 2026"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Inicio *</label>
            <input
              type="date"
              required
              value={formData.fechaInicio}
              onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Fin *</label>
            <input
              type="date"
              required
              value={formData.fechaFin}
              onChange={(e) => setFormData({ ...formData, fechaFin: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Descripción (opcional)</label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              rows={3}
              placeholder="Descripción del período..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Crear Período
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ========================================================================
// Modal: Detalle de Solicitud (modo lectura + tabla detalles)
// ========================================================================
function ModalDetalleSolicitud({
  loading,
  solicitud,
  onClose,
  onAprobar,
  onRechazar,
  getEstadoBadge,
  prefillRechazo = false,
}) {
  const [motivoRechazo, setMotivoRechazo] = useState("");
  const [showRechazoForm, setShowRechazoForm] = useState(prefillRechazo);

  useEffect(() => {
    setShowRechazoForm(prefillRechazo);
    setMotivoRechazo("");
  }, [prefillRechazo, solicitud?.idSolicitud]);

  const isEnviado = solicitud?.estado === "ENVIADO";
  const detalles = Array.isArray(solicitud?.detalles) ? solicitud.detalles : [];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[92vh] overflow-y-auto">
        {/* Header sticky */}
        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-gray-700" />
                Detalle de Solicitud
              </h3>

              <div className="flex flex-wrap items-center gap-3">
                <span className="text-gray-700 font-medium">
                  {solicitud?.nombreIpress ?? "Cargando..."}
                </span>

                {solicitud?.estado && (
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getEstadoBadge(solicitud.estado)}`}>
                    {solicitud.estado}
                  </span>
                )}

                {solicitud?.periodoDescripcion && (
                  <span className="text-sm text-gray-500">• {solicitud.periodoDescripcion}</span>
                )}
              </div>
            </div>

            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XCircle className="w-7 h-7" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            </div>
          ) : !solicitud ? (
            <div className="p-8 text-center text-gray-500">No hay datos para mostrar.</div>
          ) : (
            <>
              {/* Resumen (cards) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Card 1: Solicitud */}
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Hash className="w-4 h-4 text-gray-500" />
                    <p className="font-semibold text-gray-900">Solicitud</p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <Row label="ID Solicitud" value={solicitud.idSolicitud} />
                    <Row label="ID Periodo" value={solicitud.idPeriodo} />
                    <Row label="Total Especialidades" value={solicitud.totalEspecialidades ?? detalles.length} />
                    <Row label="Total Turnos" value={solicitud.totalTurnosSolicitados ?? "—"} />
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {yesNoPill(!!solicitud.borrador)}
                    <span className="text-xs text-gray-500">Borrador</span>
                    {yesNoPill(!!solicitud.enviado)}
                    <span className="text-xs text-gray-500">Enviado</span>
                    {yesNoPill(!!solicitud.revisado)}
                    <span className="text-xs text-gray-500">Revisado</span>
                  </div>
                </div>

                {/* Card 2: IPRESS */}
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Building2 className="w-4 h-4 text-gray-500" />
                    <p className="font-semibold text-gray-900">IPRESS</p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <Row label="Código IPRESS" value={solicitud.codIpress ?? "—"} />
                    <Row label="Nombre IPRESS" value={solicitud.nombreIpress ?? "—"} />
                    <Row label="Red" value={solicitud.nombreRed ?? "—"} icon={<MapPin className="w-4 h-4 text-gray-400" />} />
                  </div>
                </div>

                {/* Card 3: Usuario / Contacto */}
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-4 h-4 text-gray-500" />
                    <p className="font-semibold text-gray-900">Usuario / Contacto</p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <Row label="DNI" value={solicitud.dniUsuario ?? "—"} />
                    <Row label="Nombre" value={solicitud.nombreCompleto ?? "—"} />
                    <Row
                      label="Email"
                      value={solicitud.emailContacto ?? "—"}
                      icon={<Mail className="w-4 h-4 text-gray-400" />}
                    />
                    <Row
                      label="Teléfono"
                      value={solicitud.telefonoContacto ?? "—"}
                      icon={<Phone className="w-4 h-4 text-gray-400" />}
                    />
                  </div>
                </div>
              </div>

              {/* Fechas */}
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">Creado:</span>
                    <span className="text-gray-600">{fmtDateTime(solicitud.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">Actualizado:</span>
                    <span className="text-gray-600">{fmtDateTime(solicitud.updatedAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">Enviado:</span>
                    <span className="text-gray-600">{fmtDateTime(solicitud.fechaEnvio)}</span>
                  </div>
                </div>
              </div>

              {/* Tabla Detalles */}
              <div className="rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <h4 className="font-semibold text-gray-900">Especialidades solicitadas</h4>
                  </div>
                  <span className="text-sm text-gray-500">{detalles.length} filas</span>
                </div>

                <div className="overflow-x-auto bg-white">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 text-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold">#</th>
                        <th className="px-4 py-3 text-left font-semibold">Especialidad</th>
                        <th className="px-4 py-3 text-center font-semibold">Requiere</th>
                        <th className="px-4 py-3 text-center font-semibold">N° turnos</th>
                        <th className="px-4 py-3 text-center font-semibold">Mañana</th>
                        <th className="px-4 py-3 text-left font-semibold">Días (Mañana)</th>
                        <th className="px-4 py-3 text-center font-semibold">Tarde</th>
                        <th className="px-4 py-3 text-left font-semibold">Días (Tarde)</th>
                        <th className="px-4 py-3 text-left font-semibold">Obs.</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200">
                      {detalles.map((d, idx) => (
                        <tr key={d.idDetalle ?? idx} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-500">{idx + 1}</td>

                          <td className="px-4 py-3">
                            <div className="font-semibold text-gray-900">{d.nombreEspecialidad}</div>
                            <div className="text-xs text-gray-500">Código: {d.codServicio ?? "—"}</div>
                          </td>

                          <td className="px-4 py-3 text-center">{yesNoPill(!!d.requiere)}</td>

                          <td className="px-4 py-3 text-center font-semibold text-gray-900">
                            {d.turnosSolicitados ?? 0}
                          </td>

                          <td className="px-4 py-3 text-center">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                                d.mananaActiva ? "border-blue-200 bg-blue-50 text-blue-700" : "border-gray-200 bg-gray-50 text-gray-500"
                              }`}
                            >
                              {d.mananaActiva ? "Activo" : "Inactivo"}
                            </span>
                          </td>

                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {(d.diasManana || []).length ? (d.diasManana || []).map(chipDay) : <span className="text-gray-400">—</span>}
                            </div>
                          </td>

                          <td className="px-4 py-3 text-center">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                                d.tardeActiva ? "border-orange-200 bg-orange-50 text-orange-700" : "border-gray-200 bg-gray-50 text-gray-500"
                              }`}
                            >
                              {d.tardeActiva ? "Activo" : "Inactivo"}
                            </span>
                          </td>

                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {(d.diasTarde || []).length ? (d.diasTarde || []).map(chipDay) : <span className="text-gray-400">—</span>}
                            </div>
                          </td>

                          <td className="px-4 py-3 text-gray-600">{d.observacion?.trim() ? d.observacion : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Acciones: Aprobar / Rechazar solo si ENVIADO */}
              {isEnviado && (
                <div className="rounded-xl border border-gray-200 bg-white p-4">
                  {!showRechazoForm ? (
                    <div className="flex flex-col md:flex-row gap-3">
                      <button
                        onClick={() => onAprobar(solicitud.idSolicitud)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        Aprobar Solicitud
                      </button>

                      <button
                        onClick={() => setShowRechazoForm(true)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        <XCircle className="w-5 h-5" />
                        Rechazar Solicitud
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700">Motivo del Rechazo *</label>
                      <textarea
                        value={motivoRechazo}
                        onChange={(e) => setMotivoRechazo(e.target.value)}
                        rows={3}
                        placeholder="Indique el motivo del rechazo..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />

                      <div className="flex flex-col md:flex-row gap-3">
                        <button
                          onClick={() => {
                            setShowRechazoForm(false);
                            setMotivoRechazo("");
                          }}
                          className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => onRechazar(solicitud.idSolicitud, motivoRechazo)}
                          className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Confirmar Rechazo
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, icon = null }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-2 text-gray-500">
        {icon}
        <span className="text-xs uppercase tracking-wide">{label}</span>
      </div>
      <div className="text-gray-800 font-medium text-right break-all">{value ?? "—"}</div>
    </div>
  );
}

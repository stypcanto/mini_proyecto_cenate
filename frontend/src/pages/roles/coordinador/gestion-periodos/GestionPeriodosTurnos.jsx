// src/pages/coordinador/turnos/GestionPeriodosTurnos.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Calendar, FileText, Loader2, RefreshCw } from "lucide-react";

import { periodoSolicitudService } from "../../../../services/periodoSolicitudService";
import { solicitudTurnosService } from "../../../../services/solicitudTurnosService";


import TabPeriodos from "./components/TabPeriodos";
import TabSolicitudes from "./components/TabSolicitudes";
import ModalAperturarPeriodo from "./components/ModalAperturarPeriodo";
import ModalEditarPeriodo from "./components/ModalEditarPeriodo";
import ModalConfirmarEliminacion from "./components/ModalConfirmarEliminacion";
import ModalDetalleSolicitud from "./components/ModalDetalleSolicitud";
import CardStat from "./components/CardStat";

import { getEstadoBadgeDefault } from "./utils/ui";

const ESTADO_PERIODO = {
  BORRADOR: "BORRADOR",
  ACTIVO: "ACTIVO",
  CERRADO: "CERRADO",
};

export default function GestionPeriodosTurnos() {
  const [activeTab, setActiveTab] = useState("periodos");

  const [loadingPeriodos, setLoadingPeriodos] = useState(true);
  const [loadingSolicitudes, setLoadingSolicitudes] = useState(false);

  const [periodos, setPeriodos] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);

  const [showAperturarModal, setShowAperturarModal] = useState(false);
  const [showEditarModal, setShowEditarModal] = useState(false);
  const [periodoAEditar, setPeriodoAEditar] = useState(null);
  const [showEliminarModal, setShowEliminarModal] = useState(false);
  const [periodoAEliminar, setPeriodoAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);

  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [solicitudDetalle, setSolicitudDetalle] = useState(null);

  const [prefillRechazo, setPrefillRechazo] = useState(false);

  const [filtros, setFiltros] = useState({
    estado: "TODAS",
    periodo: "",
    busqueda: "",
    macroId: "",
    redId: "",
    ipressId: "",
  });

  // Filtros específicos para periodos
  const [filtrosPeriodos, setFiltrosPeriodos] = useState({
    estado: "TODOS", // TODOS, ACTIVO, CERRADO
    anio: new Date().getFullYear(), // Año actual por defecto
  });

  const [aniosDisponibles, setAniosDisponibles] = useState([new Date().getFullYear()]);

  useEffect(() => {
    cargarPeriodos();
    cargarAniosDisponibles();
  }, []);

  // Recargar periodos cuando cambien los filtros
  useEffect(() => {
    if (activeTab === "periodos") {
      cargarPeriodos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtrosPeriodos.estado, filtrosPeriodos.anio]);

  // Cargar solicitudes solo al cambiar de tab (no automáticamente con filtros)
  useEffect(() => {
    if (activeTab === "solicitudes") cargarSolicitudes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const cargarPeriodos = async () => {
    setLoadingPeriodos(true);
    try {
      // Si hay filtros aplicados, usar el endpoint de filtros
      const tieneEstadoFiltrado = filtrosPeriodos.estado && filtrosPeriodos.estado !== "TODOS";
      
      let data;
      if (tieneEstadoFiltrado || filtrosPeriodos.anio) {
        data = await periodoSolicitudService.obtenerConFiltros(filtrosPeriodos);
      } else {
        data = await periodoSolicitudService.obtenerTodos();
      }
      
      setPeriodos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al cargar periodos:", err);
      setPeriodos([]);
    } finally {
      setLoadingPeriodos(false);
    }
  };

  const cargarAniosDisponibles = async () => {
    try {
      const anios = await periodoSolicitudService.obtenerAniosDisponibles();
      setAniosDisponibles(anios.length > 0 ? anios : [new Date().getFullYear()]);
    } catch (err) {
      console.error("Error al cargar años disponibles:", err);
      setAniosDisponibles([new Date().getFullYear()]);
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

  const handleTogglePeriodo = async (periodo) => {
    const actual = periodo?.estado;
    const nuevoEstado = actual === ESTADO_PERIODO.ACTIVO ? ESTADO_PERIODO.CERRADO : ESTADO_PERIODO.ACTIVO;

    try {
      await periodoSolicitudService.cambiarEstado(periodo.idPeriodo, nuevoEstado);
      await cargarPeriodos();
      if (activeTab === "solicitudes") await cargarSolicitudes();
    } catch (err) {
      console.error(err);
      window.alert("Error al cambiar estado del período");
    }
  };

  const handleAperturarPeriodo = async (nuevoPeriodo) => {
    try {
      await periodoSolicitudService.crear(nuevoPeriodo);
      setShowAperturarModal(false);
      await cargarPeriodos();
      if (activeTab === "solicitudes") await cargarSolicitudes();
    } catch (err) {
      console.error(err);
      window.alert("Error al aperturar el período");
    }
  };

  const handleEditarPeriodo = (periodo) => {
    console.log("%c🔧 EDITAR PERIODO", "color: #f59e0b; font-weight: bold; font-size: 14px;");
    console.log("Periodo recibido:", periodo);
    console.log("Estado del periodo:", periodo?.estado);
    
    if (periodo.estado !== "ACTIVO") {
      window.alert("Solo se pueden editar periodos en estado ACTIVO");
      return;
    }
    
    console.log("✅ Abriendo modal de edición...");
    setPeriodoAEditar(periodo);
    setShowEditarModal(true);
    
    // Log del estado después de actualizar
    setTimeout(() => {
      console.log("Estado showEditarModal:", true);
      console.log("periodoAEditar:", periodo);
    }, 100);
  };

  const handleGuardarEdicionPeriodo = async (idPeriodo, fechas) => {
    try {
      console.log("%c💾 GUARDAR EDICIÓN PERIODO", "color: #059669; font-weight: bold; font-size: 14px;");
      console.log("🆔 ID Periodo:", idPeriodo);
      console.log("📦 Fechas a actualizar:");
      console.table(fechas);
      
      await periodoSolicitudService.actualizarFechas(idPeriodo, fechas);
      setShowEditarModal(false);
      setPeriodoAEditar(null);
      await cargarPeriodos();
      if (activeTab === "solicitudes") await cargarSolicitudes();
      window.alert("¡Fechas actualizadas correctamente!");
    } catch (err) {
      console.error("❌ Error al actualizar fechas:", err);
      
      // Extraer el mensaje de error del backend
      const errorMessage = err.message || "Error desconocido al actualizar las fechas";
      
      console.log("💬 Mensaje de error:", errorMessage);
      window.alert(`Error al actualizar las fechas:\n\n${errorMessage}`);
      throw err;
    }
  };

  const handleEliminarPeriodo = (periodo) => {
    console.log("%c🗑️ ELIMINAR PERIODO", "color: #dc2626; font-weight: bold; font-size: 14px;");
    console.log("Periodo a eliminar:", periodo);
    setPeriodoAEliminar(periodo);
    setShowEliminarModal(true);
  };

  const handleConfirmarEliminacion = async () => {
    if (!periodoAEliminar) return;
    
    setEliminando(true);
    try {
      console.log("%c🗑️ CONFIRMAR ELIMINACIÓN", "color: #dc2626; font-weight: bold; font-size: 14px;");
      console.log("🆔 ID del periodo a eliminar:", periodoAEliminar.idPeriodo);
      console.log("📋 Datos del periodo:");
      console.table({
        ID: periodoAEliminar.idPeriodo,
        Periodo: periodoAEliminar.periodo,
        Descripcion: periodoAEliminar.descripcion,
        Estado: periodoAEliminar.estado,
      });
      
      await periodoSolicitudService.eliminar(periodoAEliminar.idPeriodo);
      
      setShowEliminarModal(false);
      setPeriodoAEliminar(null);
      
      await cargarPeriodos();
      if (activeTab === "solicitudes") await cargarSolicitudes();
      
      window.alert("¡Período eliminado correctamente!");
      console.log("✅ Período eliminado exitosamente");
    } catch (err) {
      console.error("❌ Error al eliminar:", err);
      
      // Extraer el mensaje de error del backend
      const errorMessage = err.message || "Error desconocido al eliminar el período";
      
      console.log("💬 Mensaje de error:", errorMessage);
      window.alert(`Error al eliminar el período:\n\n${errorMessage}`);
    } finally {
      setEliminando(false);
    }
  };

  const handleVerDetalle = async (solicitud) => {
    try {
      setPrefillRechazo(false);
      setLoadingDetalle(true);
      setShowDetalleModal(true);
      const detalle = await solicitudTurnosService.obtenerPorId(solicitud.idSolicitud);
      setSolicitudDetalle(detalle);
    } catch (err) {
      console.error(err);
      window.alert("Error al cargar detalle de la solicitud");
      setShowDetalleModal(false);
      setSolicitudDetalle(null);
    } finally {
      setLoadingDetalle(false);
    }
  };

  const handleRecargarDetalle = async (idSolicitud) => {
    try {
      setLoadingDetalle(true);
      const detalle = await solicitudTurnosService.obtenerPorId(idSolicitud);
      setSolicitudDetalle(detalle);
    } catch (err) {
      console.error(err);
      window.alert("Error al recargar detalle de la solicitud");
    } finally {
      setLoadingDetalle(false);
    }
  };

  const abrirRechazoRapido = async (solicitud) => {
    try {
      setPrefillRechazo(true);
      setLoadingDetalle(true);
      setShowDetalleModal(true);
      const detalle = await solicitudTurnosService.obtenerPorId(solicitud.idSolicitud);
      setSolicitudDetalle(detalle);
    } catch (err) {
      console.error(err);
      window.alert("Error al cargar detalle de la solicitud");
      setShowDetalleModal(false);
      setSolicitudDetalle(null);
      setPrefillRechazo(false);
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
      setPrefillRechazo(false);
    } catch (err) {
      console.error(err);
      window.alert("Error al aprobar solicitud");
    }
  };

  const handleRechazarSolicitud = async (idSolicitud, motivo) => {
    if (!motivo || !motivo.trim()) {
      window.alert("Debe indicar el motivo del rechazo");
      return;
    }
    try {
      await solicitudTurnosService.rechazarSolicitud(idSolicitud, motivo.trim());
      await cargarSolicitudes();
      setShowDetalleModal(false);
      setSolicitudDetalle(null);
      setPrefillRechazo(false);
    } catch (err) {
      console.error(err);
      window.alert("Error al rechazar solicitud");
    }
  };

  const getEstadoBadge = (estado) => getEstadoBadgeDefault(estado);

  const stats = useMemo(() => {
    const total = (periodos || []).length;
    const activos = (periodos || []).filter((p) => p.estado === ESTADO_PERIODO.ACTIVO).length;
    const cerrados = (periodos || []).filter((p) => p.estado === ESTADO_PERIODO.CERRADO).length;
    const borradores = (periodos || []).filter((p) => p.estado === ESTADO_PERIODO.BORRADOR).length;
    return { total, activos, cerrados, borradores };
  }, [periodos]);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Gestión de Períodos y Solicitudes</h1>
            <p className="text-sm text-gray-600">Administre los períodos y revise solicitudes de turnos de las IPRESS</p>
          </div>
        </div>

        {activeTab === "periodos" && (
          <div className="grid grid-cols-4 gap-2 mb-4">
            <CardStat title="Períodos" value={stats.total} subtitle="Total registrados" icon={<Calendar className="w-4 h-4" />} tone="blue" />
            <CardStat title="Activos" value={stats.activos} subtitle="En captura" icon={<Calendar className="w-4 h-4" />} tone="green" />
            <CardStat title="Cerrados" value={stats.cerrados} subtitle="Históricos" icon={<Calendar className="w-4 h-4" />} tone="orange" />
            <CardStat title="Borradores" value={stats.borradores} subtitle="Sin publicar" icon={<Calendar className="w-4 h-4" />} tone="purple" />
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm mb-4">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab("periodos")}
                className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "periodos"
                    ? "border-green-600 text-green-700"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Períodos</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab("solicitudes")}
                className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "solicitudes"
                    ? "border-blue-600 text-blue-700"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>Solicitudes</span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {activeTab === "periodos" ? (
          <TabPeriodos
            periodos={periodos}
            loading={loadingPeriodos}
            onTogglePeriodo={handleTogglePeriodo}
            onCrearPeriodo={() => setShowAperturarModal(true)}
            getEstadoBadge={getEstadoBadge}
            onEditarPeriodo={handleEditarPeriodo}
            onEliminarPeriodo={handleEliminarPeriodo}
            filtros={filtrosPeriodos}
            onFiltrosChange={setFiltrosPeriodos}
            aniosDisponibles={aniosDisponibles}
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
            onConsultar={cargarSolicitudes}
          />
        )}

        {showAperturarModal && (
          <ModalAperturarPeriodo onClose={() => setShowAperturarModal(false)} onCrear={handleAperturarPeriodo} />
        )}

        {showEditarModal && periodoAEditar && (
          <ModalEditarPeriodo
            periodo={periodoAEditar}
            onClose={() => {
              console.log("Cerrando modal de edición");
              setShowEditarModal(false);
              setPeriodoAEditar(null);
            }}
            onGuardar={handleGuardarEdicionPeriodo}
          />
        )}

        {showEliminarModal && periodoAEliminar && (
          <ModalConfirmarEliminacion
            periodo={periodoAEliminar}
            onClose={() => {
              setShowEliminarModal(false);
              setPeriodoAEliminar(null);
            }}
            onConfirmar={handleConfirmarEliminacion}
            eliminando={eliminando}
          />
        )}

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
            onRecargarDetalle={handleRecargarDetalle}
          />
        )}

        {(loadingPeriodos && periodos.length === 0) && (
          <div className="fixed bottom-4 right-4 bg-white border rounded-lg shadow px-3 py-2 flex items-center gap-2 text-sm text-gray-700">
            <Loader2 className="w-4 h-4 animate-spin" />
            Cargando...
          </div>
        )}
      </div>
    </div>
  );
}

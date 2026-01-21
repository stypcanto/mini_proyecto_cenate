// src/pages/coordinador/turnos/GestionPeriodosTurnos.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Calendar, FileText, Loader2 } from "lucide-react";

import { periodoSolicitudService } from "../../../../services/periodoSolicitudService";
import { solicitudTurnosService } from "../../../../services/solicitudTurnosService";


import TabPeriodos from "./components/TabPeriodos";
import TabSolicitudes from "./components/TabSolicitudes";
import ModalAperturarPeriodo from "./components/ModalAperturarPeriodo";
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

  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [solicitudDetalle, setSolicitudDetalle] = useState(null);

  const [prefillRechazo, setPrefillRechazo] = useState(false);

  const [filtros, setFiltros] = useState({
    estado: "TODAS",
    periodo: "",
    busqueda: "",
  });

  useEffect(() => {
    cargarPeriodos();
  }, []);

  useEffect(() => {
    if (activeTab === "solicitudes") cargarSolicitudes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, filtros.estado, filtros.periodo, filtros.busqueda]);

  const cargarPeriodos = async () => {
    setLoadingPeriodos(true);
    try {
      const data = await periodoSolicitudService.obtenerTodos();
      setPeriodos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al cargar periodos:", err);
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Períodos y Solicitudes</h1>
          <p className="text-gray-600">Administre los períodos y revise solicitudes de turnos de las IPRESS</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
          <CardStat title="Períodos" value={stats.total} subtitle="Total registrados" icon={<Calendar className="w-5 h-5" />} tone="blue" />
          <CardStat title="Activos" value={stats.activos} subtitle="En captura" icon={<Calendar className="w-5 h-5" />} tone="green" />
          <CardStat title="Cerrados" value={stats.cerrados} subtitle="Históricos" icon={<Calendar className="w-5 h-5" />} tone="orange" />
          <CardStat title="Borradores" value={stats.borradores} subtitle="Sin publicar" icon={<Calendar className="w-5 h-5" />} tone="purple" />
        </div>

        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab("periodos")}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "periodos"
                    ? "border-green-600 text-green-700"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>Períodos</span>
                </div>
              </button>

              <button
                onClick={() => setActiveTab("solicitudes")}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "solicitudes"
                    ? "border-blue-600 text-blue-700"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
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

        {showAperturarModal && (
          <ModalAperturarPeriodo onClose={() => setShowAperturarModal(false)} onCrear={handleAperturarPeriodo} />
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
          />
        )}
      </div>

      {(loadingPeriodos && periodos.length === 0) ? (
        <div className="fixed bottom-4 right-4 bg-white border rounded-lg shadow px-3 py-2 flex items-center gap-2 text-sm text-gray-700">
          <Loader2 className="w-4 h-4 animate-spin" />
          Cargando...
        </div>
      ) : null}
    </div>
  );
}

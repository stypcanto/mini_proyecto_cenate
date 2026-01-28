// src/pages/coordinador/gestion-periodos-disponibilidad/GestionPeriodosDisponibilidad.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Calendar, FileText, Loader2, RefreshCw } from "lucide-react";

import periodoMedicoDisponibilidadService from "../../../../services/periodoMedicoDisponibilidadService";
import periodoDisponibilidadService from "../../../../services/periodoDisponibilidadService";

import TabPeriodos from "./components/TabPeriodos";
import TabDisponibilidades from "./components/TabDisponibilidades";
import ModalAperturarPeriodo from "./components/ModalAperturarPeriodo";
import ModalEditarPeriodo from "./components/ModalEditarPeriodo";
import ModalConfirmarEliminacion from "./components/ModalConfirmarEliminacion";
import CardStat from "./components/CardStat";

import { getEstadoBadgeDefault } from "./utils/ui";

const ESTADO_PERIODO = {
  BORRADOR: "BORRADOR",
  ACTIVO: "ACTIVO",
  CERRADO: "CERRADO",
};

export default function GestionPeriodosDisponibilidad() {
  const [activeTab, setActiveTab] = useState("periodos");

  const [loadingPeriodos, setLoadingPeriodos] = useState(true);
  const [loadingDisponibilidades, setLoadingDisponibilidades] = useState(false);

  const [periodos, setPeriodos] = useState([]);
  const [disponibilidades, setDisponibilidades] = useState([]);

  const [showAperturarModal, setShowAperturarModal] = useState(false);
  const [showEditarModal, setShowEditarModal] = useState(false);
  const [periodoAEditar, setPeriodoAEditar] = useState(null);
  const [showEliminarModal, setShowEliminarModal] = useState(false);
  const [periodoAEliminar, setPeriodoAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);

  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [disponibilidadDetalle, setDisponibilidadDetalle] = useState(null);

  const [filtros, setFiltros] = useState({
    estado: "TODAS",
    periodo: "",
    busqueda: "",
    busquedaEspecialidad: "",
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

  // Cargar disponibilidades solo al cambiar de tab (no automáticamente con filtros)
  useEffect(() => {
    if (activeTab === "disponibilidades") cargarDisponibilidades();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const cargarPeriodos = async () => {
    setLoadingPeriodos(true);
    try {
      let response;
      
      // Usar el servicio correcto según el filtro de estado
      if (filtrosPeriodos.estado === "ACTIVO") {
        response = await periodoMedicoDisponibilidadService.listarActivos();
      } else if (filtrosPeriodos.estado === "CERRADO") {
        // Para CERRADO, obtenemos todos y filtramos
        response = await periodoMedicoDisponibilidadService.listarTodos();
      } else {
        // TODOS
        response = await periodoMedicoDisponibilidadService.listarTodos();
      }
      
      let data = Array.isArray(response) ? response : (response?.data || []);
      
      // Filtrar por año si está seleccionado
      if (filtrosPeriodos.anio) {
        data = data.filter((p) => {
          const anioPeriodo = p.anio || (p.periodo ? parseInt(p.periodo.substring(0, 4)) : null);
          return anioPeriodo === filtrosPeriodos.anio;
        });
      }
      
      // Filtrar por estado CERRADO si está seleccionado
      if (filtrosPeriodos.estado === "CERRADO") {
        data = data.filter((p) => p.estado === "CERRADO");
      }
      
      // Mapear los datos del backend al formato esperado por el frontend
      const periodosMapeados = data.map((p) => ({
        idPeriodo: p.idPeriodoRegDisp,
        idPeriodoRegDisp: p.idPeriodoRegDisp,
        periodo: p.periodo,
        descripcion: p.descripcion,
        fechaInicio: p.fechaInicio,
        fechaFin: p.fechaFin,
        estado: p.estado,
        anio: p.anio,
        totalDisponibilidades: 0, // Se calculará si es necesario
        enviadas: 0,
        revisadas: 0,
      }));
      
      setPeriodos(periodosMapeados);
    } catch (err) {
      console.error("Error al cargar periodos:", err);
      setPeriodos([]);
    } finally {
      setLoadingPeriodos(false);
    }
  };

  const cargarAniosDisponibles = async () => {
    try {
      // Usar el endpoint específico para obtener años
      const response = await periodoMedicoDisponibilidadService.listarAnios();
      
      // Extraer correctamente los datos del response
      let anios = [];
      if (Array.isArray(response)) {
        anios = response;
      } else if (response?.data) {
        anios = Array.isArray(response.data) ? response.data : [];
      }
      
      console.log('Años recibidos del backend:', anios);
      
      if (anios.length > 0) {
        setAniosDisponibles(anios.sort((a, b) => b - a));
      } else {
        // Si no hay años, usar el año actual
        setAniosDisponibles([new Date().getFullYear()]);
      }
    } catch (err) {
      console.error("Error al cargar años disponibles:", err);
      setAniosDisponibles([new Date().getFullYear()]);
    }
  };

  const cargarDisponibilidades = async () => {
    setLoadingDisponibilidades(true);
    try {
      let response;
      
      if (filtros.estado && filtros.estado !== "TODAS") {
        response = await periodoDisponibilidadService.obtenerPorEstado(filtros.estado, 0, 100);
      } else {
        response = await periodoDisponibilidadService.obtenerPeriodos(0, 100);
      }
      
      let data = response.data?.content || response.data || [];
      
      // Aplicar filtros adicionales en frontend
      if (filtros.periodo) {
        data = data.filter((d) => String(d.idPeriodo || d.periodo) === String(filtros.periodo));
      }
      
      if (filtros.busqueda) {
        const q = filtros.busqueda.toLowerCase();
        data = data.filter((d) => {
          const nombre = (d.nombreMedico || d.personal?.nombreCompleto || "").toLowerCase();
          return nombre.includes(q);
        });
      }
      
      if (filtros.busquedaEspecialidad) {
        const q = filtros.busquedaEspecialidad.toLowerCase();
        data = data.filter((d) => {
          const especialidad = (d.nombreServicio || d.servicio?.nombreServicio || "").toLowerCase();
          return especialidad.includes(q);
        });
      }
      
      setDisponibilidades(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al cargar disponibilidades:", err);
      setDisponibilidades([]);
    } finally {
      setLoadingDisponibilidades(false);
    }
  };

  const handleTogglePeriodo = async (periodo) => {
    const actual = periodo?.estado;
    const nuevoEstado = actual === ESTADO_PERIODO.ACTIVO ? ESTADO_PERIODO.CERRADO : ESTADO_PERIODO.ACTIVO;

    try {
      const idPeriodo = periodo.idPeriodoRegDisp || periodo.idPeriodo;
      await periodoMedicoDisponibilidadService.cambiarEstado(idPeriodo, nuevoEstado);
      await cargarPeriodos();
      if (activeTab === "disponibilidades") await cargarDisponibilidades();
      window.alert(`Período ${nuevoEstado === ESTADO_PERIODO.ACTIVO ? 'activado' : 'cerrado'} correctamente`);
    } catch (err) {
      console.error(err);
      const errorMessage = err.message || "Error desconocido al cambiar estado del período";
      window.alert(`Error al cambiar estado del período:\n\n${errorMessage}`);
    }
  };

  const handleAperturarPeriodo = async (nuevoPeriodo) => {
    try {
      // Preparar los datos según el formato esperado por el backend
      const anio = parseInt(nuevoPeriodo.periodo.substring(0, 4));
      const fechaInicio = nuevoPeriodo.fechaInicio.split('T')[0]; // Solo la fecha sin hora
      const fechaFin = nuevoPeriodo.fechaFin.split('T')[0];
      
      const requestData = {
        anio: anio,
        periodo: nuevoPeriodo.periodo,
        descripcion: nuevoPeriodo.descripcion,
        fechaInicio: fechaInicio,
        fechaFin: fechaFin,
      };
      
      await periodoMedicoDisponibilidadService.crear(requestData);
      setShowAperturarModal(false);
      await cargarPeriodos();
      await cargarAniosDisponibles(); // Recargar años por si se agregó uno nuevo
      if (activeTab === "disponibilidades") await cargarDisponibilidades();
      window.alert("Período aperturado correctamente");
    } catch (err) {
      console.error(err);
      const errorMessage = err.message || "Error desconocido al aperturar el período";
      window.alert(`Error al aperturar el período:\n\n${errorMessage}`);
    }
  };

  const handleEditarPeriodo = (periodo) => {
    console.log("%c🔧 EDITAR PERIODO", "color: #f59e0b; font-weight: bold; font-size: 14px;");
    console.log("Periodo recibido:", periodo);
    console.log("Estado del periodo:", periodo?.estado);
    
    // Permitir editar si está en ACTIVO o BORRADOR
    if (periodo.estado !== "ACTIVO" && periodo.estado !== "BORRADOR") {
      window.alert("Solo se pueden editar periodos en estado ACTIVO o BORRADOR");
      return;
    }
    
    console.log("✅ Abriendo modal de edición...");
    setPeriodoAEditar(periodo);
    setShowEditarModal(true);
  };

  const handleGuardarEdicionPeriodo = async (idPeriodo, fechas) => {
    try {
      console.log("%c💾 GUARDAR EDICIÓN PERIODO", "color: #059669; font-weight: bold; font-size: 14px;");
      console.log("🆔 ID Periodo:", idPeriodo);
      console.log("📦 Fechas a actualizar:", fechas);
      
      // Obtener el período actual para mantener los demás campos
      const periodoActual = periodoAEditar;
      if (!periodoActual) {
        throw new Error("No se encontró el período a editar");
      }
      
      // Extraer solo la fecha (sin hora) del formato que viene del modal
      const fechaInicio = fechas.fechaInicio ? fechas.fechaInicio.split(' ')[0] : periodoActual.fechaInicio?.split('T')[0];
      const fechaFin = fechas.fechaFin ? fechas.fechaFin.split(' ')[0] : periodoActual.fechaFin?.split('T')[0];
      
      // Preparar los datos según el formato esperado por el backend
      const requestData = {
        anio: periodoActual.anio || parseInt(periodoActual.periodo?.substring(0, 4)),
        periodo: periodoActual.periodo,
        descripcion: periodoActual.descripcion,
        fechaInicio: fechaInicio,
        fechaFin: fechaFin,
      };
      
      await periodoMedicoDisponibilidadService.actualizar(idPeriodo, requestData);
      
      setShowEditarModal(false);
      setPeriodoAEditar(null);
      await cargarPeriodos();
      if (activeTab === "disponibilidades") await cargarDisponibilidades();
      window.alert("¡Fechas actualizadas correctamente!");
    } catch (err) {
      console.error("❌ Error al actualizar fechas:", err);
      const errorMessage = err.message || "Error desconocido al actualizar las fechas";
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
      const idPeriodo = periodoAEliminar.idPeriodoRegDisp || periodoAEliminar.idPeriodo;
      console.log("🆔 ID del periodo a eliminar:", idPeriodo);
      
      await periodoMedicoDisponibilidadService.eliminar(idPeriodo);
      
      setShowEliminarModal(false);
      setPeriodoAEliminar(null);
      
      await cargarPeriodos();
      if (activeTab === "disponibilidades") await cargarDisponibilidades();
      
      window.alert("¡Período eliminado correctamente!");
      console.log("✅ Período eliminado exitosamente");
    } catch (err) {
      console.error("❌ Error al eliminar:", err);
      const errorMessage = err.message || "Error desconocido al eliminar el período";
      window.alert(`Error al eliminar el período:\n\n${errorMessage}`);
    } finally {
      setEliminando(false);
    }
  };

  const handleVerDetalle = async (disponibilidad) => {
    try {
      setLoadingDetalle(true);
      setShowDetalleModal(true);
      const detalle = await periodoDisponibilidadService.obtenerPorId(disponibilidad.idDisponibilidad);
      setDisponibilidadDetalle(detalle.data || detalle);
    } catch (err) {
      console.error(err);
      window.alert("Error al cargar detalle de la disponibilidad");
      setShowDetalleModal(false);
      setDisponibilidadDetalle(null);
    } finally {
      setLoadingDetalle(false);
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

  const statsDisponibilidades = useMemo(() => {
    const total = (disponibilidades || []).length;
    const enviadas = (disponibilidades || []).filter((d) => d.estado === "ENVIADO").length;
    const revisadas = (disponibilidades || []).filter((d) => d.estado === "REVISADO").length;
    return { total, enviadas, revisadas };
  }, [disponibilidades]);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4 bg-gradient-to-r from-[#0A5BA9] to-[#2563EB] rounded-lg p-6 shadow-lg">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-white" />
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">Gestión de Períodos y Disponibilidades</h1>
              <p className="text-sm text-blue-100">Administre los períodos y revise disponibilidades médicas</p>
            </div>
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

        {activeTab === "disponibilidades" && (
          <div className="grid grid-cols-3 gap-2 mb-4">
            <CardStat title="Total" value={statsDisponibilidades.total} subtitle="Disponibilidades" icon={<FileText className="w-4 h-4" />} tone="blue" />
            <CardStat title="Enviadas" value={statsDisponibilidades.enviadas} subtitle="Para revisión" icon={<FileText className="w-4 h-4" />} tone="green" />
            <CardStat title="Revisadas" value={statsDisponibilidades.revisadas} subtitle="Procesadas" icon={<FileText className="w-4 h-4" />} tone="purple" />
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
                onClick={() => setActiveTab("disponibilidades")}
                className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "disponibilidades"
                    ? "border-blue-600 text-blue-700"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>Disponibilidades</span>
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
          <TabDisponibilidades
            disponibilidades={disponibilidades}
            loading={loadingDisponibilidades}
            filtros={filtros}
            setFiltros={setFiltros}
            onVerDetalle={handleVerDetalle}
            getEstadoBadge={getEstadoBadge}
            periodos={periodos}
            onConsultar={cargarDisponibilidades}
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

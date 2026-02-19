// src/pages/coordinador/gestion-periodos-disponibilidad/GestionPeriodosDisponibilidad.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Calendar, FileText, Loader2, RefreshCw } from "lucide-react";

import { useAuth } from "../../../../context/AuthContext";
import periodoMedicoDisponibilidadService from "../../../../services/periodoMedicoDisponibilidadService";
import periodoDisponibilidadService from "../../../../services/periodoDisponibilidadService";

import TabPeriodos from "./components/TabPeriodos";
import TabDisponibilidades from "./components/TabDisponibilidades";
import ModalAperturarPeriodo from "./components/ModalAperturarPeriodo";
import ModalEditarPeriodo from "./components/ModalEditarPeriodo";
import ModalConfirmarEliminacion from "./components/ModalConfirmarEliminacion";
import CardStat from "./components/CardStat";

import { getEstadoBadgeDefault } from "./utils/ui";

// Estados válidos para la nueva tabla ctr_periodo
const ESTADO_PERIODO = {
  ABIERTO: "ABIERTO",
  EN_VALIDACION: "EN_VALIDACION",
  CERRADO: "CERRADO",
  REABIERTO: "REABIERTO",
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

  // Obtener usuario autenticado
  const { user } = useAuth();

  // Filtros específicos para periodos
  const [filtrosPeriodos, setFiltrosPeriodos] = useState({
    estado: "TODOS", // TODOS, ABIERTO, EN_VALIDACION, CERRADO, REABIERTO
    idArea: "TODOS", // TODOS, 2, 3, 13
    propietario: "TODOS", // TODOS, MIS_PERIODOS
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
  }, [filtrosPeriodos.estado, filtrosPeriodos.idArea, filtrosPeriodos.propietario, filtrosPeriodos.anio]);

  // Cargar disponibilidades solo al cambiar de tab (no automáticamente con filtros)
  useEffect(() => {
    if (activeTab === "disponibilidades") cargarDisponibilidades();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const cargarPeriodos = async () => {
    setLoadingPeriodos(true);
    try {
      // Siempre cargar todos y filtrar en el frontend
      const response = await periodoMedicoDisponibilidadService.listarTodos();
      
      let data = Array.isArray(response) ? response : (response?.data || []);
      
      // Filtrar por año si está seleccionado
      if (filtrosPeriodos.anio) {
        data = data.filter((p) => {
          const anioPeriodo = p.anio || (p.periodo ? parseInt(p.periodo.substring(0, 4)) : null);
          return anioPeriodo === filtrosPeriodos.anio;
        });
      }
      
      // Filtrar por estado si está seleccionado (no TODOS)
      if (filtrosPeriodos.estado && filtrosPeriodos.estado !== "TODOS") {
        data = data.filter((p) => p.estado === filtrosPeriodos.estado);
      }
      
      // Filtrar por área si está seleccionada
      if (filtrosPeriodos.idArea && filtrosPeriodos.idArea !== "TODOS") {
        const idAreaNum = parseInt(filtrosPeriodos.idArea);
        data = data.filter((p) => p.idArea === idAreaNum);
      }
      
      // Filtrar por propietario (solo mis períodos)
      if (filtrosPeriodos.propietario === "MIS_PERIODOS" && user?.id) {
        data = data.filter((p) => p.idCoordinador === user.id);
      }
      
      // Mapear los datos del backend al formato esperado por el frontend
      // Nueva estructura con PK compuesta (periodo, idArea)
      const periodosMapeados = data.map((p) => ({
        // Clave compuesta
        periodo: p.periodo,
        idArea: p.idArea,
        nombreArea: p.nombreArea,
        // Datos del periodo
        descripcion: `${p.periodo} - ${p.nombreArea || 'Área ' + p.idArea}`,
        fechaInicio: p.fechaInicio,
        fechaFin: p.fechaFin,
        estado: p.estado,
        anio: p.anio,
        mes: p.mes,
        // Coordinador
        idCoordinador: p.idCoordinador,
        nombreCoordinador: p.nombreCoordinador,
        // Fechas de apertura/cierre
        fechaApertura: p.fechaApertura,
        fechaCierre: p.fechaCierre,
        // Fechas de auditoría
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
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

  const handleTogglePeriodo = async (periodoObj) => {
    const actual = periodoObj?.estado;
    // Alternar entre ABIERTO y CERRADO
    const nuevoEstado = actual === ESTADO_PERIODO.ABIERTO || actual === ESTADO_PERIODO.REABIERTO 
      ? ESTADO_PERIODO.CERRADO 
      : ESTADO_PERIODO.ABIERTO;

    try {
      // Usar clave compuesta (periodo, idArea)
      const { periodo, idArea } = periodoObj;
      await periodoMedicoDisponibilidadService.cambiarEstado(periodo, idArea, nuevoEstado);
      await cargarPeriodos();
      if (activeTab === "disponibilidades") await cargarDisponibilidades();
      window.alert(`Período ${nuevoEstado === ESTADO_PERIODO.ABIERTO ? 'abierto' : 'cerrado'} correctamente`);
    } catch (err) {
      console.error(err);
      const errorMessage = err.message || "Error desconocido al cambiar estado del período";
      window.alert(`Error al cambiar estado del período:\n\n${errorMessage}`);
    }
  };

  const handleAperturarPeriodo = async (nuevoPeriodo) => {
    try {
      // Preparar los datos según el formato esperado por el backend
      // Nota: idArea se obtiene automáticamente del backend usando dim_personal_cnt
      const fechaInicio = nuevoPeriodo.fechaInicio.split('T')[0]; // Solo la fecha sin hora
      const fechaFin = nuevoPeriodo.fechaFin.split('T')[0];
      
      const requestData = {
        periodo: nuevoPeriodo.periodo,
        // idArea se obtiene automáticamente del usuario autenticado (dim_personal_cnt)
        fechaInicio: fechaInicio,
        fechaFin: fechaFin,
        estado: "ABIERTO",
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

  const handleEditarPeriodo = (periodoObj) => {
    console.log("%c🔧 EDITAR PERIODO", "color: #f59e0b; font-weight: bold; font-size: 14px;");
    console.log("Periodo recibido:", periodoObj);
    console.log("Estado del periodo:", periodoObj?.estado);
    
    // Permitir editar si está en ABIERTO o REABIERTO
    if (periodoObj.estado !== "ABIERTO" && periodoObj.estado !== "REABIERTO") {
      window.alert("Solo se pueden editar periodos en estado ABIERTO o REABIERTO");
      return;
    }
    
    console.log("✅ Abriendo modal de edición...");
    setPeriodoAEditar(periodoObj);
    setShowEditarModal(true);
  };

  const handleGuardarEdicionPeriodo = async (periodoObj, fechas) => {
    try {
      console.log("%c💾 GUARDAR EDICIÓN PERIODO", "color: #059669; font-weight: bold; font-size: 14px;");
      console.log("📦 Periodo:", periodoObj);
      console.log("📦 Fechas a actualizar:", fechas);
      
      // Obtener el período actual para mantener los demás campos
      const periodoActual = periodoAEditar;
      if (!periodoActual) {
        throw new Error("No se encontró el período a editar");
      }
      
      // Extraer solo la fecha (sin hora) del formato que viene del modal
      const fechaInicio = fechas.fechaInicio ? fechas.fechaInicio.split(' ')[0] : periodoActual.fechaInicio?.split('T')[0];
      const fechaFin = fechas.fechaFin ? fechas.fechaFin.split(' ')[0] : periodoActual.fechaFin?.split('T')[0];
      
      // Preparar los datos según el formato esperado por el nuevo backend
      const requestData = {
        periodo: periodoActual.periodo,
        idArea: periodoActual.idArea,
        fechaInicio: fechaInicio,
        fechaFin: fechaFin,
      };
      
      // Usar clave compuesta (periodo, idArea)
      await periodoMedicoDisponibilidadService.actualizar(periodoActual.periodo, periodoActual.idArea, requestData);
      
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
      console.log("📦 Periodo a eliminar:", periodoAEliminar.periodo, "idArea:", periodoAEliminar.idArea);
      
      // Usar clave compuesta (periodo, idArea)
      await periodoMedicoDisponibilidadService.eliminar(periodoAEliminar.periodo, periodoAEliminar.idArea);
      
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
    const abiertos = (periodos || []).filter((p) => p.estado === ESTADO_PERIODO.ABIERTO).length;
    const cerrados = (periodos || []).filter((p) => p.estado === ESTADO_PERIODO.CERRADO).length;
    const enValidacion = (periodos || []).filter((p) => p.estado === ESTADO_PERIODO.EN_VALIDACION).length;
    const reabiertos = (periodos || []).filter((p) => p.estado === ESTADO_PERIODO.REABIERTO).length;
    return { total, abiertos, cerrados, enValidacion, reabiertos };
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
            <CardStat title="Abiertos" value={stats.abiertos} subtitle="En captura" icon={<Calendar className="w-4 h-4" />} tone="green" />
            <CardStat title="Cerrados" value={stats.cerrados} subtitle="Históricos" icon={<Calendar className="w-4 h-4" />} tone="orange" />
            <CardStat title="En Validación" value={stats.enValidacion} subtitle="Por revisar" icon={<Calendar className="w-4 h-4" />} tone="purple" />
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

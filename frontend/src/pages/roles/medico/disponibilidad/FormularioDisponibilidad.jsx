// ========================================================================
// FormularioDisponibilidad.jsx (Rol Médico)
// ========================================================================

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Calendar, RefreshCw, Edit, Eye, Plus, Filter, Check, X, Clock, LoaderCircle } from "lucide-react";
import { 
  Table, Select, Button, Tag, message, Card, Badge, Tooltip, Alert, Input, 
  Modal as AntModal, Popconfirm, Space, Empty, Spin, Divider
} from "antd";
import { format, parseISO, isWeekend, isBefore, isAfter } from 'date-fns';
import { es } from 'date-fns/locale';

import { solicitudDisponibilidadService } from "../../../../services/solicitudDisponibilidadService";
import periodoMedicoDisponibilidadService from "../../../../services/periodoMedicoDisponibilidadService";
import { formatFecha, getYearFromPeriodo, estadoBadgeClass, formatSoloFecha } from "./utils/helpers";
import ModalSolicitudDisponibilidad from "./components/ModalSolicitudDisponibilidad";

export default function FormularioDisponibilidad() {
  // ============== ESTADOS ==============
  const [loading, setLoading] = useState(false);
  const [solicitudes, setSolicitudes] = useState([]);
  const [periodos, setPeriodos] = useState([]);  const [todosPeriodos, setTodosPeriodos] = useState([]);
  const [periodoSeleccionado, setPeriodoSeleccionadoFiltro] = useState(null);  const [anios, setAnios] = useState([]);
  const [filtroAnio, setFiltroAnio] = useState(new Date().getFullYear());
  const [filtroEstadoSolicitud, setFiltroEstadoSolicitud] = useState('TODOS'); // PENDIENTE, APROBADA, RECHAZADA, TODOS
  const [filtroEstado, setFiltroEstado] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  // Estados para modal
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("crear");
  const [periodSeleccionado, setPeriodSeleccionado] = useState(null);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);

  // ============== EFECTOS ==============
  useEffect(() => {
    cargarDatos();
  }, []);

  // ============== FUNCIONES ==============
  
  const cargarDatos = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🚀 Iniciando carga de datos...');
      
      const [respSolicitudes, respAnios, respTodosPeriodos] = await Promise.all([
        solicitudDisponibilidadService.listarMisSolicitudes(),
        periodoMedicoDisponibilidadService.listarAniosDisponibles(),
        periodoMedicoDisponibilidadService.listarDisponibles()
      ]);
      
      console.log('📋 Solicitudes recibidas:', respSolicitudes);
      console.log('📅 Años disponibles:', respAnios);
      console.log('📊 Todos los periodos:', respTodosPeriodos);
      
      setSolicitudes(respSolicitudes || []);
      setTodosPeriodos(respTodosPeriodos || []);
      
      // Cargar años y actualizar filtroAnio si es necesario
      const anosDisponibles = respAnios || [];
      setAnios(anosDisponibles);
      
      // Si el año actual no está en la lista, seleccionar el primer año disponible
      const anoActual = new Date().getFullYear();
      const anoSeleccionado = anosDisponibles.length > 0 && !anosDisponibles.includes(anoActual) ? anosDisponibles[0] : anoActual;
      
      console.log('📆 Año seleccionado:', anoSeleccionado);
      
      if (anosDisponibles.length > 0 && !anosDisponibles.includes(anoActual)) {
        setFiltroAnio(anosDisponibles[0]);
      }
      
      // Cargar periodos después de tener el año
      await cargarPeriodos(anoSeleccionado);
    } catch (error) {
      console.error("❌ Error cargando datos:", error);
      message.error("Error al cargar los datos: " + (error.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  }, []);

  const cargarPeriodos = useCallback(async (anio) => {
    try {
      console.log('🔍 Cargando periodos:', { anio });
      let respPeriodos;
      
      // Obtener todos los periodos disponibles
      respPeriodos = await periodoMedicoDisponibilidadService.listarDisponibles();
      console.log('📦 Periodos recibidos del backend:', respPeriodos);
      
      // Filtrar por año si se proporciona
      if (anio) {
        const periodosFiltrados = (respPeriodos || []).filter(p => {
          const yearPeriodo = getYearFromPeriodo(p);
          console.log('🔍 Comparando año:', { periodo: p.descripcion, yearPeriodo, anio, fechaInicio: p.fechaInicio });
          return yearPeriodo === anio;
        });
        
        console.log('✅ Periodos filtrados finales:', periodosFiltrados);
        console.log('📊 Total periodos a mostrar:', periodosFiltrados.length);
        setPeriodos(periodosFiltrados);
      } else {
        setPeriodos(respPeriodos || []);
      }
    } catch (error) {
      console.error("❌ Error cargando periodos:", error);
      console.error("❌ Detalles del error:", error.response?.data || error.message);
      message.error("Error al cargar los periodos: " + (error.response?.data?.message || error.message));
    }
  }, []);

  // Recargar periodos cuando cambia el filtro de año o estado del periodo
  useEffect(() => {
    if (filtroAnio) {
      cargarPeriodos(filtroAnio);
    }
  }, [filtroAnio, cargarPeriodos]);

  // Periodos disponibles para el combo (filtrados por año)
  const periodosDisponiblesCombo = useMemo(() => {
    let resultado = [...todosPeriodos];
    
    // Filtrar por año
    if (filtroAnio) {
      resultado = resultado.filter(p => getYearFromPeriodo(p) === filtroAnio);
    }
    
    console.log('📋 Periodos disponibles para combo:', resultado);
    return resultado;
  }, [todosPeriodos, filtroAnio]);

  const handleAbrirCrear = useCallback((periodo) => {
    setPeriodSeleccionado(periodo);
    setModalMode("crear");
    setSolicitudSeleccionada(null);
    setShowModal(true);
  }, []);

  const handleAbrirEditar = useCallback((solicitud) => {
    setSolicitudSeleccionada(solicitud);
    setPeriodSeleccionado(solicitud.periodo);
    setModalMode("editar");
    setShowModal(true);
  }, []);

  const handleGuardar = useCallback(async (datos) => {
    try {
      setLoading(true);
      
      if (modalMode === "crear") {
        await solicitudDisponibilidadService.guardarBorrador({
          idPeriodo: periodSeleccionado.id,
          ...datos
        });
        message.success("Disponibilidad guardada");
      } else {
        await solicitudDisponibilidadService.actualizar(solicitudSeleccionada.id, datos);
        message.success("Disponibilidad actualizada");
      }
      
      setShowModal(false);
      cargarDatos();
    } catch (error) {
      console.error("Error guardando:", error);
      message.error(error.response?.data?.message || "Error al guardar");
    } finally {
      setLoading(false);
    }
  }, [modalMode, periodSeleccionado, solicitudSeleccionada, cargarDatos]);

  const handleEnviar = useCallback(async (id) => {
    try {
      setLoading(true);
      await solicitudDisponibilidadService.enviar(id);
      message.success("Disponibilidad enviada para revisión");
      cargarDatos();
    } catch (error) {
      console.error("Error enviando:", error);
      message.error(error.response?.data?.message || "Error al enviar");
    } finally {
      setLoading(false);
    }
  }, [cargarDatos]);

  const handleEliminar = useCallback(async (id) => {
    try {
      setLoading(true);
      await solicitudDisponibilidadService.eliminar(id);
      message.success("Disponibilidad eliminada");
      cargarDatos();
    } catch (error) {
      console.error("Error eliminando:", error);
      message.error(error.response?.data?.message || "Error al eliminar");
    } finally {
      setLoading(false);
    }
  }, [cargarDatos]);

  // ============== FILTROS ==============
  
  const periodosFiltrados = useMemo(() => {
    console.log('🔍 Filtrando periodos por búsqueda y periodo seleccionado...');
    console.log('   - Periodos originales:', periodos);
    console.log('   - Búsqueda:', busqueda);
    console.log('   - Periodo seleccionado del combo:', periodoSeleccionado);
    
    let resultado = [...periodos];
    
    // Si hay un periodo seleccionado del combo, mostrar solo ese
    if (periodoSeleccionado) {
      resultado = resultado.filter(p => {
        const match = (p.idPeriodoRegDisp === periodoSeleccionado);
        console.log(`   Comparando periodo ${p.descripcion}: idPeriodoRegDisp=${p.idPeriodoRegDisp}, seleccionado=${periodoSeleccionado}, match=${match}`);
        return match;
      });
      console.log('   - Filtrado por periodo seleccionado:', resultado);
    }
    
    // Filtrar por búsqueda
    if (busqueda) {
      resultado = resultado.filter(p => 
        p.descripcion?.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.periodo?.toLowerCase().includes(busqueda.toLowerCase())
      );
      console.log('   - Después de búsqueda:', resultado);
    }
    
    // Ordenar por fecha de inicio (más reciente primero)
    resultado = resultado.sort((a, b) => new Date(b.fechaInicio) - new Date(a.fechaInicio));
    console.log('✅ Periodos filtrados finales:', resultado);
    return resultado;
  }, [periodos, busqueda, periodoSeleccionado]);

  // Preparar datos de la tabla: periodos con sus solicitudes
  const datosTablaPeriodos = useMemo(() => {
    console.log('📊 Calculando datosTablaPeriodos...');
    console.log('   - Periodos filtrados:', periodosFiltrados);
    console.log('   - Solicitudes:', solicitudes);
    console.log('   - Filtro estado solicitud:', filtroEstadoSolicitud);
    
    let resultado = periodosFiltrados.map(periodo => {
      const solicitud = solicitudes.find(s => {
        console.log(`   Comparando solicitud ${s.idSolicitud} (periodo ${s.idPeriodo}) con periodo ${periodo.idPeriodoRegDisp}`);
        return s.idPeriodo === periodo.idPeriodoRegDisp;
      });
      
      const fila = {
        ...periodo,
        solicitud: solicitud || null,
        tieneSolicitud: !!solicitud
      };
      
      console.log(`   - Periodo ${periodo.descripcion}: tiene solicitud =`, !!solicitud);
      return fila;
    });
    
    // Filtrar por estado de solicitud
    if (filtroEstadoSolicitud && filtroEstadoSolicitud !== 'TODOS') {
      resultado = resultado.filter(fila => {
        if (filtroEstadoSolicitud === 'SIN_SOLICITUD') {
          return !fila.tieneSolicitud;
        }
        return fila.solicitud && fila.solicitud.estado === filtroEstadoSolicitud;
      });
      console.log('   - Después de filtrar por estado solicitud:', resultado);
    }
    
    console.log('✅ Datos tabla final:', resultado);
    return resultado;
  }, [periodosFiltrados, solicitudes, filtroEstadoSolicitud]);

  // ============== COLUMNAS DE TABLA ==============

  const columnasTabla = [
    {
      title: "Período",
      dataIndex: "descripcion",
      key: "descripcion",
      width: 150,
      render: (descripcion, record) => (
        <div>
          <div className="font-medium text-gray-700">{descripcion}</div>
          <div className="text-xs text-gray-500">{record.periodo || ''}</div>
        </div>
      )
    },
    {
      title: "Fechas",
      key: "fechas",
      width: 150,
      render: (_, record) => (
        <div className="text-sm text-gray-600">
          <div>{format(parseISO(record.fechaInicio), "dd MMM yyyy", { locale: es })}</div>
          <div>{format(parseISO(record.fechaFin), "dd MMM yyyy", { locale: es })}</div>
        </div>
      )
    },
    {
      title: "Estado Periodo",
      dataIndex: "estado",
      key: "estadoPeriodo",
      width: 100,
      render: (estado) => (
        <Tag color={estado === 'ACTIVO' ? 'green' : estado === 'VIGENTE' ? 'blue' : 'default'}>
          {estado}
        </Tag>
      )
    },
    {
      title: "ID Solicitud",
      key: "idSolicitud",
      width: 100,
      render: (_, record) => (
        record.solicitud ? (
          <span className="font-mono text-sm text-blue-600">#{record.solicitud.idSolicitud || record.solicitud.id}</span>
        ) : (
          <span className="text-gray-400 text-xs">-</span>
        )
      )
    },
    {
      title: "Estado Solicitud",
      key: "estadoSolicitud",
      width: 120,
      render: (_, record) => {
        if (!record.solicitud) return <span className="text-gray-400 text-xs">Sin solicitud</span>;
        const estado = record.solicitud.estado;
        return (
          <Badge 
            color={estadoBadgeClass(estado)?.split(" ")[1]?.replace("bg-", "")}
            text={estado}
          />
        );
      }
    },
    {
      title: "Días Registrados",
      key: "diasDisponibles",
      width: 100,
      render: (_, record) => (
        record.solicitud ? (
          <span className="text-gray-700">{record.solicitud.detalles?.length || 0}</span>
        ) : (
          <span className="text-gray-400">-</span>
        )
      )
    },
    {
      title: "Acciones",
      key: "acciones",
      width: 200,
      fixed: 'right',
      render: (_, record) => {
        if (!record.tieneSolicitud) {
          // No tiene solicitud - mostrar botón Iniciar Solicitud
          return (
            <Button
              type="primary"
              icon={<Plus size={16} />}
              size="small"
              onClick={() => handleAbrirCrear(record)}
            >
              Iniciar Solicitud
            </Button>
          );
        }
        
        // Tiene solicitud - mostrar botones según estado
        const solicitud = record.solicitud;
        const puedeEditar = solicitud.estado === "BORRADOR";
        const puedeEnviar = solicitud.estado === "BORRADOR";
        
        return (
          <Space size="small">
            {puedeEditar && (
              <Tooltip title="Editar">
                <Button
                  type="text"
                  icon={<Edit size={16} />}
                  size="small"
                  onClick={() => handleAbrirEditar(solicitud)}
                />
              </Tooltip>
            )}
            
            {puedeEnviar && (
              <Tooltip title="Enviar para revisión">
                <Button
                  type="text"
                  icon={<Check size={16} />}
                  size="small"
                  onClick={() => handleEnviar(solicitud.idSolicitud || solicitud.id)}
                />
              </Tooltip>
            )}

            <Tooltip title="Ver detalles">
              <Button
                type="text"
                icon={<Eye size={16} />}
                size="small"
                onClick={() => handleAbrirEditar(solicitud)}
              />
            </Tooltip>

            {puedeEditar && (
              <Popconfirm
                title="Eliminar solicitud"
                description="¿Estás seguro de que deseas eliminar esta solicitud?"
                onConfirm={() => handleEliminar(solicitud.idSolicitud || solicitud.id)}
                okText="Sí"
                cancelText="No"
              >
                <Button
                  type="text"
                  danger
                  icon={<X size={16} />}
                  size="small"
                />
              </Popconfirm>
            )}
          </Space>
        );
      }
    }
  ];



  // ============== RENDER ==============

  return (
    <div className="p-6 bg-white rounded-lg">
      {/* Encabezado */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Calendar size={28} className="text-blue-600" />
              Mi Disponibilidad
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              Gestiona tu disponibilidad para atender pacientes
            </p>
          </div>
          <Button
            type="primary"
            icon={<RefreshCw size={16} />}
            onClick={cargarDatos}
            loading={loading}
          >
            Actualizar
          </Button>
        </div>

        {/* Controles de filtro */}
        <Card size="small" className="mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Año
              </label>
              <Select
                value={filtroAnio}
                onChange={(value) => {
                  console.log('📅 Año seleccionado:', value);
                  setFiltroAnio(value);
                  setPeriodoSeleccionadoFiltro(null); // Limpiar periodo seleccionado al cambiar año
                }}
                options={anios.length > 0 ? anios.map(a => ({ label: a, value: a })) : [{ label: new Date().getFullYear(), value: new Date().getFullYear() }]}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Periodo
              </label>
              <Select
                value={periodoSeleccionado}
                onChange={(value) => {
                  console.log('🎯 Periodo seleccionado del combo:', value);
                  setPeriodoSeleccionadoFiltro(value);
                }}
                placeholder="Seleccione un periodo"
                showSearch
                optionFilterProp="children"
                className="w-full"
                options={[
                  { label: "Todos", value: null },
                  ...periodosDisponiblesCombo.map(p => ({
                    label: p.descripcion,
                    value: p.idPeriodoRegDisp
                  }))
                ]}
                notFoundContent="No hay periodos disponibles con los filtros seleccionados"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado de Solicitud
              </label>
              <Select
                value={filtroEstadoSolicitud}
                onChange={(value) => {
                  console.log('🏷️ Estado de solicitud seleccionado:', value);
                  setFiltroEstadoSolicitud(value);
                }}
                options={[
                  { label: "Todos", value: "TODOS" },
                  { label: "Sin Solicitud", value: "SIN_SOLICITUD" },
                  { label: "Pendiente", value: "PENDIENTE" },
                  { label: "Aprobada", value: "APROBADA" },
                  { label: "Rechazada", value: "RECHAZADA" }
                ]}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buscar
              </label>
              <Input
                placeholder="Buscar por período..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                allowClear
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Tabla de períodos con sus solicitudes */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Períodos de Disponibilidad - Año {filtroAnio}
          </h2>
          <div className="text-sm text-gray-600">
            Total: {datosTablaPeriodos.length} periodos | 
            Con solicitud: {datosTablaPeriodos.filter(p => p.tieneSolicitud).length} | 
            Pendientes: {datosTablaPeriodos.filter(p => !p.tieneSolicitud).length}
          </div>
        </div>

        <Table
          columns={columnasTabla}
          dataSource={datosTablaPeriodos}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `Total ${total} periodos` }}
          size="small"
          scroll={{ x: 1200 }}
          locale={{
            emptyText: (
              <Empty
                description="No hay periodos disponibles para este año"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )
          }}
        />
      </div>

      {/* Modal para crear/editar */}
      {showModal && (
        <ModalSolicitudDisponibilidad
          open={showModal}
          onClose={() => setShowModal(false)}
          periodo={periodSeleccionado}
          mode={modalMode}
          solicitudExistente={solicitudSeleccionada}
          onGuardar={handleGuardar}
        />
      )}
    </div>
  );
}


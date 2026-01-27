import React, { useState, useEffect } from 'react';
import { Plus, Search, Phone, ChevronDown, Circle, Eye, Users, UserPlus, Download, FileText, FolderOpen, ListChecks, Upload } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import ListHeader from '../../components/ListHeader';
import bolsasService from '../../services/bolsasService';

/**
 * 📋 Solicitudes - Recepción de Bolsa
 * v2.0.0 - Redesign con estadísticas y filtros mejorados
 *
 * Características:
 * - Dashboard de estadísticas por estado (Total, Pendientes, Citados, Atendidos, Observados)
 * - Tabla mejorada con IPRESS, Bolsa, Fechas, Estado, Semáforo
 * - Filtros dropdown para Bolsas, Redes, Especialidades, Estados
 * - Indicadores de tráfico (semáforo) por paciente
 * - Acciones: Cambiar celular
 */
export default function Solicitudes() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroBolsa, setFiltroBolsa] = useState('todas');
  const [filtroRed, setFiltroRed] = useState('todas');
  const [filtroEspecialidad, setFiltroEspecialidad] = useState('todas');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [selectedRows, setSelectedRows] = useState(new Set());

  // Cache de catálogos para evitar N+1 queries
  const [cacheEstados, setCacheEstados] = useState({});
  const [cacheIpress, setCacheIpress] = useState({});
  const [cacheRedes, setCacheRedes] = useState({});
  const [errorMessage, setErrorMessage] = useState('');

  // Modales y estado para acciones
  const [modalCambiarTelefono, setModalCambiarTelefono] = useState(false);
  const [modalAsignarGestora, setModalAsignarGestora] = useState(false);
  const [modalEnviarRecordatorio, setModalEnviarRecordatorio] = useState(false);
  const [modalImportar, setModalImportar] = useState(false);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState(null);
  const [nuevoTelefono, setNuevoTelefono] = useState('');
  const [gestoraSeleccionada, setGestoraSeleccionada] = useState(null);
  const [tipoRecordatorio, setTipoRecordatorio] = useState('EMAIL');
  const [isProcessing, setIsProcessing] = useState(false);

  // Estado para importación de Excel
  const [idTipoBolsaSeleccionado, setIdTipoBolsaSeleccionado] = useState('');
  const [idServicioSeleccionado, setIdServicioSeleccionado] = useState('');
  const [archivoExcel, setArchivoExcel] = useState(null);
  const [isImporting, setIsImporting] = useState(false);

  // Estado para asegurados nuevos
  const [modalAseguradosNuevos, setModalAseguradosNuevos] = useState(false);
  const [aseguradosNuevos, setAseguradosNuevos] = useState([]);

  // Estado para asegurados sincronizados recientemente
  const [modalAseguradosSincronizados, setModalAseguradosSincronizados] = useState(false);
  const [aseguradosSincronizados, setAseguradosSincronizados] = useState([]);

  useEffect(() => {
    // Cargar solicitudes y catálogos inicialmente
    cargarDatos();
  }, []);

  // Cargar solicitudes y catálogos en paralelo
  const cargarDatos = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      // Cargar solicitudes y catálogos en paralelo
      const [solicitudesData, estadosData, ipressData, redesData] = await Promise.all([
        bolsasService.obtenerSolicitudes(),
        bolsasService.obtenerEstadosGestion().catch(() => []),
        bolsasService.obtenerIpress().catch(() => []),
        bolsasService.obtenerRedes().catch(() => [])
      ]);

      // Debug: Verificar estructura de API response
      if (solicitudesData && solicitudesData.length > 0) {
        console.log('📊 DEBUG - Primera solicitud del API:', JSON.stringify(solicitudesData[0], null, 2));
        console.log('📊 DEBUG - Campos disponibles:', Object.keys(solicitudesData[0]));
        console.log('📊 DEBUG - Total solicitudes:', solicitudesData.length);
      }

      // Procesar solicitudes y enriquecer con nombres de catálogos
      const solicitudesEnriquecidas = (solicitudesData || []).map(solicitud => {
        return {
          ...solicitud,
          id: solicitud.id_solicitud,
          dni: solicitud.paciente_dni || '',
          paciente: solicitud.paciente_nombre || '',
          telefono: solicitud.paciente_telefono || '',
          correo: solicitud.paciente_email || solicitud.email_pers || '',
          sexo: solicitud.paciente_sexo || solicitud.sexo || 'N/A',
          edad: solicitud.paciente_edad || solicitud.edad || 'N/A',
          estado: mapearEstadoAPI(solicitud.cod_estado_cita || solicitud.estado_gestion_citas_id),
          estadoDisplay: getEstadoDisplay(mapearEstadoAPI(solicitud.cod_estado_cita || solicitud.estado_gestion_citas_id)),
          estadoCodigo: solicitud.cod_estado_cita,
          semaforo: solicitud.recordatorio_enviado ? 'verde' : 'rojo',
          diferimiento: calcularDiferimiento(solicitud.fecha_solicitud),
          especialidad: solicitud.especialidad || 'N/A',
          red: solicitud.responsable_gestora_nombre || 'Sin asignar',
          ipress: solicitud.id_bolsa ? `Bolsa ${solicitud.id_bolsa}` : 'N/A',
          bolsa: solicitud.cod_tipo_bolsa || 'Sin clasificar',
          nombreBolsa: solicitud.desc_tipo_bolsa || 'Sin descripción',
          fechaCita: solicitud.fecha_asignacion ? new Date(solicitud.fecha_asignacion).toLocaleDateString('es-PE') : 'N/A',
          fechaAsignacion: solicitud.fecha_solicitud ? new Date(solicitud.fecha_solicitud).toLocaleDateString('es-PE') : 'N/A',
          // ============================================================================
          // 📋 LOS 10 CAMPOS DEL EXCEL v1.8.0
          // ============================================================================
          fechaPreferidaNoAtendida: solicitud.fecha_preferida_no_atendida ?
            (() => {
              const [y, m, d] = solicitud.fecha_preferida_no_atendida.split('-');
              return `${d}/${m}/${y}`;
            })() : 'N/A',
          tipoDocumento: solicitud.tipo_documento || 'N/A',
          fechaNacimiento: solicitud.fecha_nacimiento ?
            (() => {
              const [y, m, d] = solicitud.fecha_nacimiento.split('-');
              return `${d}/${m}/${y}`;
            })() : 'N/A',
          tipoCita: solicitud.tipo_cita || 'N/A',
          codigoIpress: solicitud.codigo_ipress || 'N/A'
        };
      });

      setSolicitudes(solicitudesEnriquecidas);

      // Debug: Ver primera solicitud DESPUÉS del procesamiento
      if (solicitudesEnriquecidas && solicitudesEnriquecidas.length > 0) {
        console.log('✅ DEBUG ENRIQUECIDA - Primera solicitud después del mapeo:', JSON.stringify(solicitudesEnriquecidas[0], null, 2));
        console.log('✅ DEBUG - Campos en objeto enriquecido:', Object.keys(solicitudesEnriquecidas[0]));
      }

      // Crear cache de estados, IPRESS y Redes
      if (estadosData && Array.isArray(estadosData)) {
        const estadosMap = {};
        estadosData.forEach(e => { estadosMap[e.id] = e; });
        setCacheEstados(estadosMap);
      }

      if (ipressData && Array.isArray(ipressData)) {
        const ipressMap = {};
        ipressData.forEach(i => { ipressMap[i.id] = i; });
        setCacheIpress(ipressMap);
      }

      if (redesData && Array.isArray(redesData)) {
        const redesMap = {};
        redesData.forEach(r => { redesMap[r.id] = r; });
        setCacheRedes(redesMap);
      }

      // Verificar si hay asegurados nuevos sin sincronizar
      verificarAseguradosNuevos();

    } catch (error) {
      console.error('Error cargando datos:', error);
      setErrorMessage('Error al cargar las solicitudes. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper: Obtener nombre descriptivo del estado para mostrar en tabla
  const getEstadoDisplay = (estadoCodigo) => {
    const displayMap = {
      'pendiente': 'Pendiente Citar',
      'citado': 'Citado',
      'atendido': 'Asistió',
      'observado': 'Observado'
    };
    return displayMap[estadoCodigo] || 'Pendiente';
  };

  // Helper: Mapear estado API a estado UI (v1.6.0 - Estados Gestión Citas)
  const mapearEstadoAPI = (estado) => {
    // Mapeo de códigos de estado v1.6.0 a estados UI para filtros y estadísticas
    const mapping = {
      // Estado inicial
      'PENDIENTE_CITA': 'pendiente',

      // Estados de gestión (después de contacto)
      'CITADO': 'citado',
      'NO_CONTESTA': 'observado',
      'CANCELADO': 'observado',
      'ASISTIO': 'atendido',
      'REPROGRAMADO': 'observado',
      'INASISTENCIA': 'observado',
      'VENCIDO': 'observado',
      'EN_SEGUIMIENTO': 'observado',
      'DERIVADO': 'observado',

      // Compatibilidad hacia atrás (por si API aún retorna valores antiguos)
      'PENDIENTE': 'pendiente',
      'APROBADA': 'citado',
      'RECHAZADA': 'observado',
      'ATENDIDA': 'atendido'
    };

    // Si es un string (cod_estado_cita), buscar en el mapping
    if (typeof estado === 'string') {
      return mapping[estado] || 'pendiente';
    }

    // Si es un número (estado_gestion_citas_id), mapear basado en ID
    // IDs de dim_estados_gestion_citas (v1.33.0):
    // 1=CITADO, 2=NO_CONTESTA, 3=CANCELADO, 4=ASISTIO, 5=PENDIENTE_CITA (INICIAL)
    // 6=REPROGRAMADO, 7=INASISTENCIA, 8=VENCIDO, 9=EN_SEGUIMIENTO, 10=DERIVADO
    const idMapping = {
      1: 'citado',      // CITADO (visitó, asistió)
      2: 'observado',   // NO_CONTESTA (no responde)
      3: 'observado',   // CANCELADO (cita cancelada)
      4: 'atendido',    // ASISTIO (asistió a la cita)
      5: 'pendiente',   // PENDIENTE_CITA ◄─── INICIAL (Paciente nuevo que ingresó a la bolsa)
      6: 'observado',   // REPROGRAMADO (reprogramada)
      7: 'observado',   // INASISTENCIA (no asistió)
      8: 'observado',   // VENCIDO (plazo vencido)
      9: 'observado',   // EN_SEGUIMIENTO (seguimiento)
      10: 'observado'   // DERIVADO (derivada a otro)
    };

    return idMapping[estado] || 'pendiente';
  };

  // Helper: Calcular diferimiento en días desde la fecha de solicitud
  const calcularDiferimiento = (fechaSolicitud) => {
    if (!fechaSolicitud) return 0;
    const fecha = new Date(fechaSolicitud);
    const hoy = new Date();
    const diferencia = Math.floor((hoy - fecha) / (1000 * 60 * 60 * 24));
    return Math.max(0, diferencia);
  };

  // Verificar si hay asegurados nuevos detectados (no sincronizados)
  const verificarAseguradosNuevos = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/bolsas/solicitudes/asegurados-nuevos', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth.token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.total > 0) {
          setAseguradosNuevos(data.asegurados);
          setModalAseguradosNuevos(true);
          console.log('⚠️ Se encontraron ' + data.total + ' asegurados nuevos sin sincronizar');
        }
      }
    } catch (error) {
      console.warn('No se pudo verificar asegurados nuevos:', error.message);
    }
  };

  // Calcular estadísticas
  const estadisticas = {
    total: solicitudes.length,
    pendientes: solicitudes.filter(s => s.estado === 'pendiente').length,
    citados: solicitudes.filter(s => s.estado === 'citado').length,
    atendidos: solicitudes.filter(s => s.estado === 'atendido').length,
    observados: solicitudes.filter(s => s.estado === 'observado').length,
  };

  // Aplicar filtros
  const solicitudesFiltradas = solicitudes.filter(sol => {
    const matchBusqueda = sol.paciente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sol.dni.includes(searchTerm) ||
                         sol.ipress.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sol.red.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sol.especialidad.toLowerCase().includes(searchTerm.toLowerCase());
    const matchBolsa = filtroBolsa === 'todas' || sol.bolsa === filtroBolsa;
    const matchRed = filtroRed === 'todas' || sol.red === filtroRed;
    const matchEspecialidad = filtroEspecialidad === 'todas' || sol.especialidad === filtroEspecialidad;
    const matchEstado = filtroEstado === 'todos' || sol.estado === filtroEstado;

    return matchBusqueda && matchBolsa && matchRed && matchEspecialidad && matchEstado;
  });

  // Debug filtros
  React.useEffect(() => {
    if (solicitudes.length > 0 && solicitudesFiltradas.length === 0 && !errorMessage) {
      console.log('⚠️ DEBUG FILTROS - Solicitudes cargadas pero NINGUNA pasa los filtros:');
      console.log('  - Total solicitudes:', solicitudes.length);
      console.log('  - Filtro búsqueda:', searchTerm);
      console.log('  - Filtro bolsa:', filtroBolsa);
      console.log('  - Filtro red:', filtroRed);
      console.log('  - Filtro especialidad:', filtroEspecialidad);
      console.log('  - Filtro estado:', filtroEstado);
      console.log('  - Primera solicitud:', solicitudes[0]);
    }
  }, [solicitudes, solicitudesFiltradas, searchTerm, filtroBolsa, filtroRed, filtroEspecialidad, filtroEstado, errorMessage]);

  const getEstadoBadge = (estado) => {
    const estilos = {
      pendiente: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
      citado: 'bg-purple-100 text-purple-800 border border-purple-300',
      atendido: 'bg-green-100 text-green-800 border border-green-300',
      observado: 'bg-red-100 text-red-800 border border-red-300'
    };
    return estilos[estado] || estilos.pendiente;
  };

  const getSemaforoColor = (semaforo) => {
    return semaforo === 'rojo' ? 'text-red-500' : 'text-green-500';
  };

  const getBolsaColor = (bolsa) => {
    const colorMap = {
      'BOLSA 107': 'bg-green-100 text-green-700 border border-green-300',
      'BOLSA DENGUE': 'bg-orange-100 text-orange-700 border border-orange-300',
      'BOLSAS ENFERMERIA': 'bg-cyan-100 text-cyan-700 border border-cyan-300',
      'BOLSAS EXPLOTADATOS': 'bg-pink-100 text-pink-700 border border-pink-300',
      'BOLSAS IVR': 'bg-purple-100 text-purple-700 border border-purple-300',
      'BOLSAS REPROGRAMACION': 'bg-blue-100 text-blue-700 border border-blue-300',
      'BOLSA GESTORES TERRITORIAL': 'bg-indigo-100 text-indigo-700 border border-indigo-300'
    };
    return colorMap[bolsa] || 'bg-gray-100 text-gray-700 border border-gray-300';
  };

  const getSexoColor = (sexo) => {
    return sexo === 'Femenino'
      ? 'bg-pink-100 text-pink-700 border border-pink-300'
      : 'bg-blue-100 text-blue-700 border border-blue-300';
  };

  const getRedColor = () => {
    return 'bg-cyan-100 text-cyan-700 border border-cyan-300';
  };

  // Obtener valores únicos para filtros dinámicos
  const redesUnicas = [...new Set(solicitudes.map(s => s.red))].sort();
  const especialidadesUnicas = [...new Set(solicitudes.map(s => s.especialidad))].sort();

  // Manejar selección de filas
  const toggleRowSelection = (id) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  const toggleAllRows = () => {
    if (selectedRows.size === solicitudesFiltradas.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(solicitudesFiltradas.map(s => s.id)));
    }
  };

  // Obtener iniciales del paciente
  const getInitials = (nombre) => {
    return nombre.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  };

  // Obtener color para diferimiento
  const getDiferimiento = (dias) => {
    if (dias >= 20) {
      return 'text-red-600';
    } else if (dias >= 10) {
      return 'text-orange-600';
    } else {
      return 'text-green-600';
    }
  };

  // Descargar selección de bolsas
  const descargarSeleccion = async () => {
    if (selectedRows.size === 0) {
      alert('Selecciona al menos una bolsa para descargar');
      return;
    }

    try {
      const idsSeleccionados = Array.from(selectedRows);
      const csvBlob = await bolsasService.descargarCSV(idsSeleccionados);

      // Descargar archivo
      const element = document.createElement('a');
      const url = URL.createObjectURL(csvBlob);
      element.setAttribute('href', url);
      element.setAttribute('download', `bolsas_${new Date().toISOString().split('T')[0]}.csv`);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error descargando CSV:', error);
      alert('Error al descargar el archivo. Intenta nuevamente.');
    }
  };

  // ========================================================================
  // 📋 HANDLERS DE ACCIONES
  // ========================================================================

  // Abrir modal para cambiar teléfono
  const handleAbrirCambiarTelefono = (solicitud) => {
    setSolicitudSeleccionada(solicitud);
    setNuevoTelefono(solicitud.telefono || '');
    setModalCambiarTelefono(true);
  };

  // Procesar cambio de teléfono
  const handleGuardarCambiarTelefono = async () => {
    if (!nuevoTelefono.trim()) {
      alert('Por favor ingresa un teléfono válido');
      return;
    }

    setIsProcessing(true);
    try {
      await bolsasService.cambiarTelefono(solicitudSeleccionada.idSolicitud || solicitudSeleccionada.id, nuevoTelefono);
      alert('Teléfono actualizado correctamente');
      setModalCambiarTelefono(false);
      cargarDatos(); // Recargar datos
    } catch (error) {
      console.error('Error cambiar teléfono:', error);
      alert('Error al cambiar el teléfono. Intenta nuevamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Abrir modal para asignar gestora
  const handleAbrirAsignarGestora = (solicitud) => {
    setSolicitudSeleccionada(solicitud);
    setGestoraSeleccionada(null);
    setModalAsignarGestora(true);
  };

  // Procesar asignación a gestora
  const handleGuardarAsignarGestora = async () => {
    if (!gestoraSeleccionada) {
      alert('Por favor selecciona una gestora');
      return;
    }

    setIsProcessing(true);
    try {
      await bolsasService.asignarAGestora(
        solicitudSeleccionada.idSolicitud || solicitudSeleccionada.id,
        1, // TODO: Usar ID real de gestora cuando esté disponible
        gestoraSeleccionada
      );
      alert('Solicitud asignada correctamente');
      setModalAsignarGestora(false);
      cargarDatos(); // Recargar datos
    } catch (error) {
      console.error('Error asignando gestora:', error);
      alert('Error al asignar la gestora. Intenta nuevamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Abrir modal para enviar recordatorio
  const handleAbrirEnviarRecordatorio = (solicitud) => {
    setSolicitudSeleccionada(solicitud);
    setTipoRecordatorio('EMAIL');
    setModalEnviarRecordatorio(true);
  };

  // Procesar envío de recordatorio
  const handleGuardarEnviarRecordatorio = async () => {
    setIsProcessing(true);
    try {
      await bolsasService.enviarRecordatorio(
        solicitudSeleccionada.idSolicitud || solicitudSeleccionada.id,
        tipoRecordatorio
      );
      alert(`Recordatorio enviado por ${tipoRecordatorio}`);
      setModalEnviarRecordatorio(false);
      cargarDatos(); // Recargar datos
    } catch (error) {
      console.error('Error enviar recordatorio:', error);
      alert('Error al enviar el recordatorio. Intenta nuevamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Procesar importación de Excel
  const handleImportarExcel = async (e) => {
    e.preventDefault();

    if (!archivoExcel || !idTipoBolsaSeleccionado || !idServicioSeleccionado) {
      alert('Por favor complete todos los campos: tipo de bolsa, especialidad y archivo Excel');
      return;
    }

    const formData = new FormData();
    formData.append('file', archivoExcel);
    formData.append('idTipoBolsa', idTipoBolsaSeleccionado);
    formData.append('idServicio', idServicioSeleccionado);

    setIsImporting(true);
    try {
      const result = await bolsasService.importarSolicitudesDesdeExcel(formData);
      alert(`Importación exitosa: ${result.filas_ok} OK, ${result.filas_error} errores`);

      // Limpiar formulario y cerrar modal
      setModalImportar(false);
      setIdTipoBolsaSeleccionado('');
      setIdServicioSeleccionado('');
      setArchivoExcel(null);

      // Recargar tabla
      cargarDatos();

      // 📍 Verificar asegurados sincronizados recientemente
      await verificarAseguradosSincronizados();
    } catch (error) {
      console.error('Error al importar Excel:', error);
      alert('Error al importar: ' + (error.message || 'Intenta nuevamente'));
    } finally {
      setIsImporting(false);
    }
  };

  // Función para verificar asegurados sincronizados recientemente
  const verificarAseguradosSincronizados = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/bolsas/asegurados-sincronizados-reciente', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth.token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.total > 0) {
          setAseguradosSincronizados(data.asegurados);
          setModalAseguradosSincronizados(true);
          console.log('✅ Se encontraron ' + data.total + ' asegurados sincronizados recientemente');
        }
      }
    } catch (error) {
      console.warn('No se pudo verificar asegurados sincronizados:', error.message);
    }
  };


  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="w-full">
        {/* Header Reutilizable */}
        <PageHeader
          badge={{
            label: "Recepción de Bolsa",
            bgColor: "bg-blue-100 text-blue-700",
            icon: FolderOpen
          }}
          title="Solicitudes"
          primaryAction={{
            label: "Importar desde Excel",
            onClick: () => setModalImportar(true),
            icon: Upload
          }}
        />

        {/* Tarjetas de Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <StatCard
            label="Total Pacientes"
            value={estadisticas.total}
            borderColor="border-blue-500"
            textColor="text-blue-600"
            icon="👥"
          />
          <StatCard
            label="Pendiente Citar"
            value={estadisticas.pendientes}
            borderColor="border-orange-500"
            textColor="text-orange-600"
            icon="⏳"
          />
          <StatCard
            label="Citados"
            value={estadisticas.citados}
            borderColor="border-purple-500"
            textColor="text-purple-600"
            icon="📞"
          />
          <StatCard
            label="Asistió"
            value={estadisticas.atendidos}
            borderColor="border-green-500"
            textColor="text-green-600"
            icon="✓"
          />
          <StatCard
            label="Observados"
            value={estadisticas.observados}
            borderColor="border-red-500"
            textColor="text-red-600"
            icon="⚠️"
          />
        </div>

        {/* Sección de Lista de Pacientes */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* ListHeader Reutilizable */}
          <ListHeader
            title="Lista de Pacientes"
            searchPlaceholder="Buscar paciente, DNI o IPRESS..."
            searchValue={searchTerm}
            onSearchChange={(e) => setSearchTerm(e.target.value)}
            filters={[
              {
                name: "Bolsas",
                value: filtroBolsa,
                onChange: (e) => setFiltroBolsa(e.target.value),
                options: [
                  { label: "Todas las bolsas", value: "todas" },
                  { label: "BOLSA 107", value: "BOLSA 107" },
                  { label: "BOLSA DENGUE", value: "BOLSA DENGUE" },
                  { label: "BOLSAS ENFERMERIA", value: "BOLSAS ENFERMERIA" },
                  { label: "BOLSAS EXPLOTADATOS", value: "BOLSAS EXPLOTADATOS" },
                  { label: "BOLSAS IVR", value: "BOLSAS IVR" },
                  { label: "BOLSAS REPROGRAMACION", value: "BOLSAS REPROGRAMACION" },
                  { label: "BOLSA GESTORES TERRITORIAL", value: "BOLSA GESTORES TERRITORIAL" }
                ]
              },
              {
                name: "Redes",
                value: filtroRed,
                onChange: (e) => setFiltroRed(e.target.value),
                options: [
                  { label: "Todas las redes", value: "todas" },
                  ...redesUnicas.map(red => ({ label: red, value: red }))
                ]
              },
              {
                name: "Especialidades",
                value: filtroEspecialidad,
                onChange: (e) => setFiltroEspecialidad(e.target.value),
                options: [
                  { label: "Todas las especialidades", value: "todas" },
                  ...especialidadesUnicas.map(esp => ({ label: esp, value: esp }))
                ]
              }
            ]}
          />

          {/* Botón para descargar selección */}
          {selectedRows.size > 0 && (
            <div className="mb-4 flex justify-end">
              <button
                onClick={descargarSeleccion}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl"
              >
                <Download size={22} className="font-bold" />
                Descargar Selección ({selectedRows.size})
              </button>
            </div>
          )}

          {/* Tabla con nuevo diseño visual */}
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : errorMessage ? (
              <div className="p-8 text-center">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-700 font-semibold">{errorMessage}</p>
                  <button
                    onClick={() => cargarDatos()}
                    className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold transition-colors"
                  >
                    Reintentar
                  </button>
                </div>
              </div>
            ) : solicitudesFiltradas.length > 0 ? (
              <table className="w-full">
                <thead className="bg-[#0D5BA9] text-white sticky top-0">
                  <tr className="border-b-2 border-blue-800">
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedRows.size === solicitudesFiltradas.length && solicitudesFiltradas.length > 0}
                        onChange={toggleAllRows}
                        className="w-5 h-5 cursor-pointer"
                      />
                    </th>
                    {/* Columnas - Nombres de BD */}
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Origen de la Bolsa</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Tipo de Documento</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Número de documento</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Nombre del Asegurado</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Sexo</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Fecha de Nacimiento</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Edad</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Teléfono</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Correo</th>
                    {/* Campos Excel v1.8.0 */}
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Cod. IPRESS</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Tipo de Cita</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Fecha Preferida</th>
                    {/* Columnas de gestión */}
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">IPRESS</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Red</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Especialidad</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Estado</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Solicitante</th>
                    <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider">Gestora Asignada</th>
                    <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {solicitudesFiltradas.map((solicitud) => (
                    <tr key={solicitud.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedRows.has(solicitud.id)}
                          onChange={() => toggleRowSelection(solicitud.id)}
                          className="w-4 h-4 border-2 border-gray-300 rounded cursor-pointer"
                        />
                      </td>
                      {/* Columnas de datos personales */}
                      <td className="px-4 py-3 text-sm text-gray-700">{solicitud.cod_tipo_bolsa || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{solicitud.tipoDocumento}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-blue-600">{solicitud.dni}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">{solicitud.paciente}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{solicitud.sexo}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{solicitud.fechaNacimiento}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{solicitud.edad}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{solicitud.telefono}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate" title={solicitud.correo}>{solicitud.correo}</td>
                      {/* Nuevos campos v1.8.0 */}
                      <td className="px-4 py-3 text-sm text-gray-900 font-semibold" title="Código IPRESS">{solicitud.codigoIpress}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <span className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap inline-block ${
                          solicitud.tipoCita === 'Recita' ? 'bg-blue-100 text-blue-700' :
                          solicitud.tipoCita === 'Interconsulta' ? 'bg-purple-100 text-purple-700' :
                          solicitud.tipoCita === 'Voluntaria' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {solicitud.tipoCita}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{solicitud.fechaPreferidaNoAtendida}</td>
                      {/* Columnas de gestión */}
                      <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate" title={solicitud.nombre_ipress}>{solicitud.nombre_ipress || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{solicitud.red_asistencial || 'Sin Red'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{solicitud.especialidad}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap inline-block ${getEstadoBadge(solicitud.estado)}`}
                          title={solicitud.estadoCodigo || 'Código de estado'}
                        >
                          {solicitud.estadoDisplay}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{solicitud.solicitante_nombre || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm">
                        <button
                          onClick={() => handleAbrirAsignarGestora(solicitud)}
                          className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-md text-xs font-semibold transition-colors disabled:opacity-50"
                          disabled={isProcessing}
                        >
                          {solicitud.red || '(sin asignar)'}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleAbrirCambiarTelefono(solicitud)}
                            className="p-1.5 hover:bg-blue-100 rounded-md transition-colors text-blue-600 disabled:opacity-50"
                            title="Cambiar teléfono"
                            disabled={isProcessing}
                          >
                            <Phone size={16} />
                          </button>
                          <button
                            onClick={() => handleAbrirEnviarRecordatorio(solicitud)}
                            className="p-1.5 hover:bg-green-100 rounded-md transition-colors text-green-600 disabled:opacity-50"
                            title="Enviar recordatorio"
                            disabled={isProcessing}
                          >
                            <Users size={16} />
                          </button>
                          <button
                            className="p-1.5 hover:bg-red-100 rounded-md transition-colors text-red-600 disabled:opacity-50"
                            title="Más opciones"
                            disabled={isProcessing}
                          >
                            <FileText size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-12 text-center">
                <p className="text-gray-600 font-semibold text-lg">No hay solicitudes para mostrar</p>
              </div>
            )}
          </div>
        </div>

        {/* ====== MODAL 1: CAMBIAR TELÉFONO ====== */}
        {modalCambiarTelefono && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
              <h2 className="text-xl font-bold mb-4 text-gray-900">Cambiar Teléfono</h2>
              {solicitudSeleccionada && (
                <p className="text-sm text-gray-600 mb-4">
                  Paciente: <strong>{solicitudSeleccionada.paciente}</strong>
                </p>
              )}
              <input
                type="tel"
                value={nuevoTelefono}
                onChange={(e) => setNuevoTelefono(e.target.value)}
                placeholder="Ingresa el nuevo teléfono"
                className="w-full px-4 py-2 border border-gray-300 rounded-md mb-6 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setModalCambiarTelefono(false)}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 font-semibold hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleGuardarCambiarTelefono}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold disabled:opacity-50"
                >
                  {isProcessing ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ====== MODAL 2: ASIGNAR GESTORA ====== */}
        {modalAsignarGestora && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
              <h2 className="text-xl font-bold mb-4 text-gray-900">Asignar a Gestora</h2>
              {solicitudSeleccionada && (
                <p className="text-sm text-gray-600 mb-4">
                  Paciente: <strong>{solicitudSeleccionada.paciente}</strong>
                </p>
              )}
              <select
                value={gestoraSeleccionada || ''}
                onChange={(e) => setGestoraSeleccionada(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md mb-6 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="">Selecciona una gestora</option>
                <option value="María García">María García</option>
                <option value="Juan Pérez">Juan Pérez</option>
                <option value="Ana López">Ana López</option>
                <option value="Carlos Ruiz">Carlos Ruiz</option>
              </select>
              <div className="flex gap-3">
                <button
                  onClick={() => setModalAsignarGestora(false)}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 font-semibold hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleGuardarAsignarGestora}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-semibold disabled:opacity-50"
                >
                  {isProcessing ? 'Asignando...' : 'Asignar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ====== MODAL 3: ENVIAR RECORDATORIO ====== */}
        {modalEnviarRecordatorio && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
              <h2 className="text-xl font-bold mb-4 text-gray-900">Enviar Recordatorio</h2>
              {solicitudSeleccionada && (
                <p className="text-sm text-gray-600 mb-4">
                  Paciente: <strong>{solicitudSeleccionada.paciente}</strong>
                </p>
              )}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Tipo de Recordatorio
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="tipo"
                      value="WHATSAPP"
                      checked={tipoRecordatorio === 'WHATSAPP'}
                      onChange={(e) => setTipoRecordatorio(e.target.value)}
                      className="w-4 h-4 mr-2"
                    />
                    <span className="text-sm text-gray-700">WhatsApp</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="tipo"
                      value="EMAIL"
                      checked={tipoRecordatorio === 'EMAIL'}
                      onChange={(e) => setTipoRecordatorio(e.target.value)}
                      className="w-4 h-4 mr-2"
                    />
                    <span className="text-sm text-gray-700">Email</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setModalEnviarRecordatorio(false)}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 font-semibold hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleGuardarEnviarRecordatorio}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-semibold disabled:opacity-50"
                >
                  {isProcessing ? 'Enviando...' : 'Enviar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ====== MODAL 4: IMPORTAR DESDE EXCEL ====== */}
        {modalImportar && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
                <h2 className="text-xl font-bold text-gray-900">Importar Solicitudes desde Excel</h2>
                <p className="text-sm text-gray-500 mt-1">Cargue un archivo Excel con 2 columnas: DNI y Código Adscripción</p>
              </div>

              <form onSubmit={handleImportarExcel} className="p-6 space-y-6">
                {/* PASO 1: Selector Tipo de Bolsa */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    PASO 1: Seleccionar Tipo de Bolsa *
                  </label>
                  <select
                    value={idTipoBolsaSeleccionado}
                    onChange={(e) => setIdTipoBolsaSeleccionado(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  >
                    <option value="">-- Seleccione un tipo de bolsa --</option>
                    <option value="1">BOLSA_107 - Importación masiva</option>
                    <option value="2">BOLSA_DENGUE - Control epidemiológico</option>
                    <option value="3">BOLSAS_ENFERMERIA - Atenciones de enfermería</option>
                    <option value="4">BOLSAS_EXPLOTADATOS - Análisis y reportes</option>
                    <option value="5">BOLSAS_IVR - Sistema IVR</option>
                    <option value="6">BOLSAS_REPROGRAMACION - Citas reprogramadas</option>
                    <option value="7">BOLSA_GESTORES_TERRITORIAL - Gestión territorial</option>
                  </select>
                </div>

                {/* PASO 2: Selector Especialidad */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    PASO 2: Seleccionar Especialidad *
                  </label>
                  <select
                    value={idServicioSeleccionado}
                    onChange={(e) => setIdServicioSeleccionado(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    required
                  >
                    <option value="">-- Seleccione una especialidad --</option>
                    <option value="1">Cardiología</option>
                    <option value="2">Neurología</option>
                    <option value="3">Oncología</option>
                    <option value="4">Dermatología</option>
                    <option value="5">Pediatría</option>
                    <option value="6">Psicología</option>
                    <option value="7">Medicina Interna</option>
                  </select>
                </div>

                {/* PASO 3: Carga de Archivo Excel */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    PASO 3: Cargar Archivo Excel *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={(e) => setArchivoExcel(e.target.files?.[0] || null)}
                      className="hidden"
                      id="fileInputExcel"
                      required
                    />
                    <label htmlFor="fileInputExcel" className="cursor-pointer">
                      <p className="text-blue-600 hover:text-blue-700 font-semibold">
                        {archivoExcel ? archivoExcel.name : 'Haga clic para seleccionar archivo'}
                      </p>
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      Excel debe tener 2 columnas: Columna A = DNI, Columna B = Código Adscripción
                    </p>
                  </div>
                </div>

                {/* Botones */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setModalImportar(false);
                      setIdTipoBolsaSeleccionado('');
                      setIdServicioSeleccionado('');
                      setArchivoExcel(null);
                    }}
                    disabled={isImporting}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold disabled:opacity-50 transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isImporting || !archivoExcel || !idTipoBolsaSeleccionado || !idServicioSeleccionado}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:bg-gray-400 disabled:opacity-50 transition flex items-center gap-2"
                  >
                    {isImporting ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Importando...
                      </>
                    ) : (
                      <>
                        <Upload size={18} />
                        Importar
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ====== MODAL 5: ASEGURADOS NUEVOS ====== */}
        {modalAseguradosNuevos && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-yellow-200 bg-yellow-50 sticky top-0">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">⚠️</div>
                  <div>
                    <h2 className="text-xl font-bold text-yellow-900">Asegurados Nuevos Detectados</h2>
                    <p className="text-sm text-yellow-800 mt-1">Se encontraron {aseguradosNuevos.length} asegurados que no existen en la base de datos</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <p className="text-sm text-gray-700 mb-4">
                  Los siguientes DNIs están siendo usados en solicitudes pero no están registrados en la base de datos de asegurados.
                  <strong> Esto impide mostrar sus nombres completos.</strong>
                </p>

                {/* Tabla de asegurados nuevos */}
                <div className="overflow-x-auto mb-6">
                  <table className="w-full text-sm border-collapse">
                    <thead className="bg-yellow-100">
                      <tr>
                        <th className="border border-yellow-300 px-4 py-2 text-left font-semibold text-yellow-900">DNI</th>
                        <th className="border border-yellow-300 px-4 py-2 text-left font-semibold text-yellow-900">Estado Actual</th>
                        <th className="border border-yellow-300 px-4 py-2 text-center font-semibold text-yellow-900">Solicitudes</th>
                        <th className="border border-yellow-300 px-4 py-2 text-left font-semibold text-yellow-900">Primera Solicitud</th>
                      </tr>
                    </thead>
                    <tbody>
                      {aseguradosNuevos.map((aseg, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-yellow-50'}>
                          <td className="border border-yellow-200 px-4 py-2 font-mono font-semibold text-blue-600">{aseg.dni}</td>
                          <td className="border border-yellow-200 px-4 py-2">
                            <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-semibold">
                              {aseg.estado_actual}
                            </span>
                          </td>
                          <td className="border border-yellow-200 px-4 py-2 text-center">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded font-semibold text-xs">
                              {aseg.solicitudes_con_este_dni}
                            </span>
                          </td>
                          <td className="border border-yellow-200 px-4 py-2 text-xs text-gray-600">
                            {new Date(aseg.fecha_primera_solicitud).toLocaleDateString('es-PE')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-900">
                    <strong>¿Qué hacer?</strong> Estos asegurados deben ser añadidos a la base de datos de asegurados para mostrar sus nombres completos.
                    Puede realizar una actualización de la BD desde el módulo de importación de asegurados o contactar al administrador del sistema.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setModalAseguradosNuevos(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 font-semibold hover:bg-gray-50"
                  >
                    Cerrar
                  </button>
                  <button
                    onClick={() => {
                      setModalAseguradosNuevos(false);
                      // Aquí se podría navegar a un módulo de importación de asegurados
                      console.log('Redirigir a módulo de importación de asegurados');
                    }}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold"
                  >
                    Ir a Importar Asegurados
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ====== MODAL 6: ASEGURADOS SINCRONIZADOS RECIENTEMENTE ====== */}
        {modalAseguradosSincronizados && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-green-200 bg-green-50 sticky top-0">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">✅</div>
                  <div>
                    <h2 className="text-xl font-bold text-green-900">Pacientes Registrados en la Base de Datos</h2>
                    <p className="text-sm text-green-800 mt-1">
                      {aseguradosSincronizados.length} asegurados han sido registrados/actualizados exitosamente
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <p className="text-sm text-gray-700 mb-4">
                  Los siguientes pacientes han sido sincronizados en la base de datos de asegurados con sus datos de contacto actualizados:
                </p>

                {/* Tabla de asegurados sincronizados */}
                <div className="overflow-x-auto mb-6">
                  <table className="w-full text-sm border-collapse">
                    <thead className="bg-green-100">
                      <tr>
                        <th className="border border-green-300 px-4 py-2 text-left font-semibold text-green-900">DNI</th>
                        <th className="border border-green-300 px-4 py-2 text-left font-semibold text-green-900">Nombre</th>
                        <th className="border border-green-300 px-4 py-2 text-left font-semibold text-green-900">Teléfono</th>
                        <th className="border border-green-300 px-4 py-2 text-left font-semibold text-green-900">Correo</th>
                        <th className="border border-green-300 px-4 py-2 text-left font-semibold text-green-900">Sexo</th>
                        <th className="border border-green-300 px-4 py-2 text-left font-semibold text-green-900">F. Nacimiento</th>
                      </tr>
                    </thead>
                    <tbody>
                      {aseguradosSincronizados.map((aseg, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-green-50'}>
                          <td className="border border-green-200 px-4 py-2 font-mono font-semibold text-blue-600">{aseg.dni}</td>
                          <td className="border border-green-200 px-4 py-2 font-medium text-gray-800">{aseg.nombre}</td>
                          <td className="border border-green-200 px-4 py-2">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              aseg.telefono !== 'N/A' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {aseg.telefono}
                            </span>
                          </td>
                          <td className="border border-green-200 px-4 py-2 truncate max-w-xs" title={aseg.correo}>
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              aseg.correo !== 'N/A' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {aseg.correo}
                            </span>
                          </td>
                          <td className="border border-green-200 px-4 py-2">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              aseg.sexo === 'Femenino' || aseg.sexo === 'F' ? 'bg-pink-100 text-pink-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {aseg.sexo}
                            </span>
                          </td>
                          <td className="border border-green-200 px-4 py-2 text-xs text-gray-600">
                            {aseg.fecha_nacimiento !== 'N/A' ? new Date(aseg.fecha_nacimiento).toLocaleDateString('es-PE') : 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-green-900">
                    <strong>✅ Sincronización Exitosa:</strong> Los pacientes han sido registrados y sus datos de teléfono y correo han sido actualizados en la base de datos de asegurados.
                    Todos los datos están disponibles para consultas futuras.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setModalAseguradosSincronizados(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 font-semibold hover:bg-gray-50"
                  >
                    Cerrar
                  </button>
                  <button
                    onClick={() => {
                      setModalAseguradosSincronizados(false);
                      cargarDatos(); // Recargar tabla con datos actualizados
                    }}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-semibold"
                  >
                    Actualizar Tabla
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

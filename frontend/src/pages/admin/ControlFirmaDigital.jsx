// ========================================================================
// 🔐 ControlFirmaDigital.jsx – Control de Tokens de Firma Digital
// ------------------------------------------------------------------------
// Panel completo para gestión y monitoreo de firmas digitales del personal
// Diseño profesional con estadísticas, filtros y tabla detallada
// ========================================================================

import React, { useState, useEffect, useMemo } from "react";
import {
  FileSignature,
  Search,
  Download,
  Filter,
  RefreshCw,
  Calendar,
  User,
  Shield,
  Clock,
  AlertCircle,
  CheckCircle2,
  Plus,
  Edit,
  Edit2,
  Trash2,
  TrendingUp,
  Database,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  XCircle,
  Building,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import apiClient from "../../services/apiClient";
import ActualizarModel from "../user/components/common/ActualizarModel"; // 🆕 v1.14.0

// ================================================================
// 🎨 FUNCIONES AUXILIARES PARA AVATARES Y COLORES
// ================================================================
const getInitials = (nombre) => {
  if (!nombre) return '?';
  const words = nombre.trim().split(' ');
  if (words.length >= 2) {
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
  }
  return nombre.charAt(0).toUpperCase();
};

const getAvatarColor = (dni) => {
  const colors = [
    'bg-orange-500',
    'bg-emerald-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-blue-500',
    'bg-cyan-500',
  ];
  const index = (dni?.charCodeAt(0) || 0) % colors.length;
  return colors[index];
};

export default function ControlFirmaDigital() {
  const navigate = useNavigate();

  // Estados principales
  const [firmasDigitales, setFirmasDigitales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");

  // 🆕 Filtros avanzados
  const [filtroRegimenLaboral, setFiltroRegimenLaboral] = useState("");
  const [filtroProfesion, setFiltroProfesion] = useState("");
  const [filtroEspecialidad, setFiltroEspecialidad] = useState("");
  const [filtroFechaInicioDesde, setFiltroFechaInicioDesde] = useState("");
  const [filtroFechaInicioHasta, setFiltroFechaInicioHasta] = useState("");
  const [filtroFechaVencimientoDesde, setFiltroFechaVencimientoDesde] = useState("");
  const [filtroFechaVencimientoHasta, setFiltroFechaVencimientoHasta] = useState("");
  const [mostrarFiltrosAvanzados, setMostrarFiltrosAvanzados] = useState(false);

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina] = useState(10);

  // Modal de edición 🆕
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

  // 🆕 Selección para exportar
  const [seleccionados, setSeleccionados] = useState([]);
  const [seleccionarTodos, setSeleccionarTodos] = useState(false); // Para seleccionar TODOS los registros filtrados

  // Estadísticas
  const [stats, setStats] = useState({
    total: 0,
    registrados: 0,
    pendientes: 0,
    vigentes: 0,
    porVencer: 0,
  });

  // ================================================================
  // 📋 LISTAS ÚNICAS PARA FILTROS (extraídas de los datos) - HOOKS
  // ================================================================
  const regimenesUnicos = useMemo(() => {
    const regimenes = new Set();
    firmasDigitales.forEach(firma => {
      if (firma.regimenLaboral) regimenes.add(firma.regimenLaboral);
    });
    return Array.from(regimenes).sort();
  }, [firmasDigitales]);

  const profesionesUnicas = useMemo(() => {
    const profesiones = new Set();
    firmasDigitales.forEach(firma => {
      if (firma.profesion) profesiones.add(firma.profesion);
    });
    return Array.from(profesiones).sort();
  }, [firmasDigitales]);

  const especialidadesUnicas = useMemo(() => {
    const especialidades = new Set();
    firmasDigitales.forEach(firma => {
      if (firma.especialidad) especialidades.add(firma.especialidad);
    });
    return Array.from(especialidades).sort();
  }, [firmasDigitales]);

  // ================================================================
  // 🎯 OBTENER ESTADO DE FIRMA (Mejorado - Usa estadoCertificado del backend)
  // ================================================================
  const obtenerEstadoFirma = (firma) => {
    // Priorizar el estado del certificado del backend
    if (firma.estadoCertificado === 'VENCIDO') {
      return 'VENCIDO';
    }

    if (firma.estadoCertificado === 'VIGENTE') {
      return 'VIGENTE';
    }

    // Si entregó token pero aún no tiene fechas
    if (firma.entregoToken && !firma.fechaVencimientoCertificado) {
      return 'REGISTRADO';
    }

    // Si no entregó token, verificar motivo
    if (!firma.entregoToken && firma.motivoSinToken) {
      return firma.motivoSinToken; // PENDIENTE, YA_TIENE, NO_REQUIERE
    }

    return 'SIN_REGISTRO';
  };

  // ================================================================
  // 🔍 FILTRAR FIRMAS (con filtros avanzados) - HOOK
  // ================================================================
  const firmasFiltradas = useMemo(() => {
    return firmasDigitales.filter(firma => {
      const matchBusqueda = busqueda === '' ||
        firma.nombreCompleto?.toLowerCase().includes(busqueda.toLowerCase()) ||
        firma.dni?.includes(busqueda) ||
        firma.numeroSerieToken?.toLowerCase().includes(busqueda.toLowerCase());

      const matchEstado = filtroEstado === '' || obtenerEstadoFirma(firma) === filtroEstado;

      // 🆕 Filtros avanzados
      const matchRegimen = filtroRegimenLaboral === '' || firma.regimenLaboral === filtroRegimenLaboral;
      const matchProfesion = filtroProfesion === '' || firma.profesion === filtroProfesion;
      const matchEspecialidad = filtroEspecialidad === '' || firma.especialidad === filtroEspecialidad;

      // Filtros de fecha inicio
      let matchFechaInicio = true;
      if (filtroFechaInicioDesde || filtroFechaInicioHasta) {
        const fechaInicio = firma.fechaInicioCertificado ? new Date(firma.fechaInicioCertificado) : null;
        if (fechaInicio) {
          if (filtroFechaInicioDesde) {
            const desde = new Date(filtroFechaInicioDesde);
            matchFechaInicio = matchFechaInicio && fechaInicio >= desde;
          }
          if (filtroFechaInicioHasta) {
            const hasta = new Date(filtroFechaInicioHasta);
            matchFechaInicio = matchFechaInicio && fechaInicio <= hasta;
          }
        } else {
          matchFechaInicio = false;
        }
      }

      // Filtros de fecha vencimiento
      let matchFechaVencimiento = true;
      if (filtroFechaVencimientoDesde || filtroFechaVencimientoHasta) {
        const fechaVenc = firma.fechaVencimientoCertificado ? new Date(firma.fechaVencimientoCertificado) : null;
        if (fechaVenc) {
          if (filtroFechaVencimientoDesde) {
            const desde = new Date(filtroFechaVencimientoDesde);
            matchFechaVencimiento = matchFechaVencimiento && fechaVenc >= desde;
          }
          if (filtroFechaVencimientoHasta) {
            const hasta = new Date(filtroFechaVencimientoHasta);
            matchFechaVencimiento = matchFechaVencimiento && fechaVenc <= hasta;
          }
        } else {
          matchFechaVencimiento = false;
        }
      }

      return matchBusqueda && matchEstado && matchRegimen && matchProfesion && matchEspecialidad && matchFechaInicio && matchFechaVencimiento;
    });
  }, [firmasDigitales, busqueda, filtroEstado, filtroRegimenLaboral, filtroProfesion, filtroEspecialidad, filtroFechaInicioDesde, filtroFechaInicioHasta, filtroFechaVencimientoDesde, filtroFechaVencimientoHasta]);

  // ================================================================
  // 📄 PAGINACIÓN - HOOKS
  // ================================================================
  const indiceInicio = (paginaActual - 1) * itemsPorPagina;
  const indiceFin = indiceInicio + itemsPorPagina;
  const firmasPaginadas = firmasFiltradas.slice(indiceInicio, indiceFin);
  const totalPaginas = Math.ceil(firmasFiltradas.length / itemsPorPagina);

  // ================================================================
  // 📡 CARGAR FIRMAS DIGITALES - useEffect
  // ================================================================
  useEffect(() => {
    cargarFirmasDigitales();
  }, []);

  // ================================================================
  // 🔧 FUNCIONES REGULARES (NO HOOKS)
  // ================================================================
  const cargarFirmasDigitales = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/firma-digital');

      console.log('📦 Respuesta completa:', response);
      console.log('📊 Total registros:', response?.total);
      console.log('📋 Datos recibidos:', response?.data);

      if (response?.status === 200 && Array.isArray(response.data)) {
        const firmas = response.data;
        console.log('✅ Firmas válidas:', firmas.length);
        console.log('🔍 Primera firma completa:', JSON.stringify(firmas[0], null, 2));
        console.log('🩺 Especialidad de primera firma:', firmas[0]?.especialidad);
        setFirmasDigitales(firmas);
        calcularEstadisticas(firmas);
      } else {
        console.warn('⚠️ Respuesta inválida o datos no son array');
        setFirmasDigitales([]);
        calcularEstadisticas([]);
      }
    } catch (error) {
      console.error('Error al cargar firmas digitales:', error);
      toast.error('Error al cargar firmas digitales');
      setFirmasDigitales([]);
    } finally {
      setLoading(false);
    }
  };

  // ================================================================
  // 📊 CALCULAR ESTADÍSTICAS
  // ================================================================
  const calcularEstadisticas = (firmas) => {
    const total = firmas.length;
    const registrados = firmas.filter(f => f.entregoToken === true).length;
    const pendientes = firmas.filter(f => f.motivoSinToken === 'PENDIENTE').length;

    // Vigentes: entregoToken = true Y certificado vigente
    const hoy = new Date();
    const vigentes = firmas.filter(f => {
      if (!f.entregoToken || !f.fechaVencimientoCertificado) return false;
      const fechaVenc = new Date(f.fechaVencimientoCertificado);
      return fechaVenc > hoy;
    }).length;

    // Por vencer: certificados que vencen en menos de 30 días
    const treintaDias = new Date();
    treintaDias.setDate(treintaDias.getDate() + 30);
    const porVencer = firmas.filter(f => {
      if (!f.entregoToken || !f.fechaVencimientoCertificado) return false;
      const fechaVenc = new Date(f.fechaVencimientoCertificado);
      return fechaVenc > hoy && fechaVenc <= treintaDias;
    }).length;

    setStats({ total, registrados, pendientes, vigentes, porVencer });
  };

  // ================================================================
  // ✏️ MANEJAR EDICIÓN DE USUARIO (Abre modal en pestaña Firma Digital) 🆕
  // ================================================================
  const handleEditar = async (firma) => {
    try {
      // Construir objeto de usuario compatible con ActualizarModel
      const usuario = {
        idUser: firma.idPersonal, // ID del personal
        username: firma.dni,
        nombreCompleto: firma.nombreCompleto,
        ipress: firma.ipress,
        id_regimen_laboral: firma.idRegimenLaboral // 🆕 Pasar ID del régimen laboral
      };

      setUsuarioSeleccionado(usuario);
      setMostrarModalEdicion(true);
    } catch (error) {
      console.error('Error al abrir modal de edición:', error);
      toast.error('Error al cargar datos del usuario');
    }
  };

  // Callback cuando se cierra el modal de edición
  const handleCerrarModalEdicion = () => {
    setMostrarModalEdicion(false);
    setUsuarioSeleccionado(null);
  };

  // Callback cuando se guarda exitosamente
  const handleSuccessEdicion = () => {
    cargarFirmasDigitales(); // Recargar datos
    setMostrarModalEdicion(false);
    setUsuarioSeleccionado(null);
    toast.success('Usuario actualizado exitosamente');
  };

  // ================================================================
  // 📦 FUNCIONES DE SELECCIÓN Y EXPORTACIÓN
  // ================================================================

  // Seleccionar/Deseleccionar todos de la página actual
  const handleSeleccionarTodos = () => {
    if (seleccionados.length === firmasPaginadas.length && !seleccionarTodos) {
      // Si todos de la página están seleccionados, deseleccionar todos
      setSeleccionados([]);
      setSeleccionarTodos(false);
    } else {
      // Seleccionar todos los de la página actual
      const todosIds = firmasPaginadas.map(firma => firma.idFirmaPersonal);
      setSeleccionados(todosIds);
      setSeleccionarTodos(false);
    }
  };

  // Seleccionar TODOS los registros filtrados (no solo la página actual)
  const handleSeleccionarTodosFiltrados = () => {
    const todosIds = firmasFiltradas.map(firma => firma.idFirmaPersonal);
    setSeleccionados(todosIds);
    setSeleccionarTodos(true);
  };

  // Deseleccionar todos
  const handleDeseleccionarTodos = () => {
    setSeleccionados([]);
    setSeleccionarTodos(false);
  };

  // Seleccionar/Deseleccionar individual
  const handleSeleccionarFila = (idFirma) => {
    setSeleccionarTodos(false); // Desactivar "seleccionar todos" al hacer selección manual
    setSeleccionados(prev => {
      if (prev.includes(idFirma)) {
        return prev.filter(id => id !== idFirma);
      } else {
        return [...prev, idFirma];
      }
    });
  };

  // Exportar a CSV
  const exportarCSV = () => {
    if (seleccionados.length === 0) {
      toast.error('Selecciona al menos un registro para exportar');
      return;
    }

    // Filtrar solo los registros seleccionados
    const firmasAExportar = firmasDigitales.filter(firma =>
      seleccionados.includes(firma.idFirmaPersonal)
    );

    // Crear CSV
    const headers = [
      'DNI',
      'Nombre Completo',
      'Régimen Laboral',
      'Profesión',
      'Especialidad',
      'IPRESS',
      'Entregó Token',
      'N° Serie Token',
      'Fecha Entrega',
      'Fecha Inicio Certificado',
      'Fecha Vencimiento',
      'Estado Certificado',
      'Días para Vencer',
      'Motivo Sin Token',
      'Observaciones'
    ];

    const filas = firmasAExportar.map(firma => [
      firma.dni || '—',
      firma.nombreCompleto || '—',
      firma.regimenLaboral || '—',
      firma.profesion || '—',
      firma.especialidad || '—',
      firma.nombreIpress || '—',
      firma.entregoToken ? 'SÍ' : 'NO',
      firma.numeroSerieToken || '—',
      firma.fechaEntregaToken ? new Date(firma.fechaEntregaToken).toLocaleDateString('es-PE') : '—',
      firma.fechaInicioCertificado ? new Date(firma.fechaInicioCertificado).toLocaleDateString('es-PE') : '—',
      firma.fechaVencimientoCertificado ? new Date(firma.fechaVencimientoCertificado).toLocaleDateString('es-PE') : '—',
      firma.estadoCertificado || '—',
      firma.diasRestantesVencimiento !== null ? firma.diasRestantesVencimiento : '—',
      firma.descripcionMotivo || firma.motivoSinToken || '—',
      firma.observaciones || '—'
    ]);

    const csvContent = [
      headers.join(','),
      ...filas.map(fila => fila.map(campo => `"${campo}"`).join(','))
    ].join('\n');

    // Descargar archivo
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `firma_digital_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success(`✅ ${seleccionados.length} registro(s) exportado(s)`);

    // Limpiar selección después de exportar
    setSeleccionados([]);
    setSeleccionarTodos(false);
  };

  // ================================================================
  // 📄 PAGINACIÓN - Función de navegación
  // ================================================================
  const irAPagina = (pagina) => {
    if (pagina >= 1 && pagina <= totalPaginas) {
      setPaginaActual(pagina);
      if (!seleccionarTodos) {
        // Solo limpiar si no está activado "seleccionar todos"
        setSeleccionados([]);
      }
    }
  };

  // ================================================================
  // 🔴 DAR DE BAJA USUARIO (Marcar como INACTIVO)
  // ================================================================
  const handleDarDeBaja = async (firma) => {
    try {
      // Confirmación
      const confirmacion = window.confirm(
        `¿Está seguro de dar de baja al usuario?\n\n` +
        `Nombre: ${firma.nombreCompleto}\n` +
        `DNI: ${firma.dni}\n\n` +
        `El usuario será marcado como INACTIVO.`
      );

      if (!confirmacion) {
        return;
      }

      // Llamar al endpoint de desactivación
      await apiClient.put(`/usuarios/id/${firma.idPersonal}/deactivate`);

      toast.success('✅ Usuario dado de baja exitosamente');

      // Recargar la lista de firmas digitales
      cargarFirmasDigitales();

    } catch (error) {
      console.error('Error al dar de baja al usuario:', error);
      const errorMsg = error.response?.data?.message ||
                       error.message ||
                       'Error desconocido al dar de baja al usuario';
      toast.error(`❌ Error: ${errorMsg}`);
    }
  };

  // ================================================================
  // 📅 OBTENER DÍAS PARA VENCER (Usa diasRestantesVencimiento del backend)
  // ================================================================
  const obtenerDiasVencimiento = (firma) => {
    // Usar el valor calculado del backend si existe
    if (firma.diasRestantesVencimiento !== null && firma.diasRestantesVencimiento !== undefined) {
      return firma.diasRestantesVencimiento;
    }

    // Fallback: calcular localmente si no viene del backend
    if (!firma.fechaVencimientoCertificado) return null;
    const hoy = new Date();
    const fechaVenc = new Date(firma.fechaVencimientoCertificado);
    const diff = Math.ceil((fechaVenc - hoy) / (1000 * 60 * 60 * 24));
    return diff;
  };

  // ================================================================
  // 🎨 BADGE DE ESTADO (Estilo UsersTable)
  // ================================================================
  const renderEstadoBadge = (firma) => {
    const estado = obtenerEstadoFirma(firma);
    const badges = {
      'PENDIENTE': { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200', label: 'EN PROCESO' },
      'REGISTRADO': { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200', label: 'REGISTRADO' },
      'VIGENTE': { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', label: 'VIGENTE' },
      'VENCIDO': { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', label: 'VENCIDO' },
      'NO_REQUIERE': { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200', label: 'NO REQUIERE' },
      'YA_TIENE': { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', label: 'YA TIENE' },
      'SIN_REGISTRO': { bg: 'bg-gray-100', text: 'text-gray-500', border: 'border-gray-200', label: 'SIN REGISTRO' },
    };

    const config = badges[estado] || badges['SIN_REGISTRO'];

    return (
      <span className={`inline-block px-2.5 py-1 text-xs font-medium ${config.bg} ${config.text} rounded border ${config.border}`}>
        {config.label}
      </span>
    );
  };

  // ================================================================
  // 🎨 RENDER
  // ================================================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl shadow-lg">
            <FileSignature className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Control de Tokens – Firma Digital
            </h1>
            <p className="text-gray-600 text-sm mt-0.5">
              Gestión y monitoreo de certificados digitales del personal
            </p>
          </div>
        </div>
      </div>

      {/* Cards de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6">
        {/* Total Profesionales */}
        <div className="bg-white rounded-xl p-4 shadow-md border-t-4 border-blue-500">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-800">{stats.total}</div>
            <div className="text-xs text-gray-500 uppercase mt-1">Total Profesionales</div>
          </div>
        </div>

        {/* Registrados */}
        <div className="bg-white rounded-xl p-4 shadow-md border-t-4 border-green-500">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-800">{stats.registrados}</div>
            <div className="text-xs text-gray-500 uppercase mt-1">Registrados</div>
          </div>
        </div>

        {/* En Proceso */}
        <div className="bg-white rounded-xl p-4 shadow-md border-t-4 border-amber-500">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-800">{stats.pendientes}</div>
            <div className="text-xs text-gray-500 uppercase mt-1">En Proceso</div>
          </div>
        </div>

        {/* Activos */}
        <div className="bg-white rounded-xl p-4 shadow-md border-t-4 border-purple-500">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-800">{stats.vigentes}</div>
            <div className="text-xs text-gray-500 uppercase mt-1">Activos</div>
          </div>
        </div>

        {/* < 30 Días */}
        <div className="bg-white rounded-xl p-4 shadow-md border-t-4 border-red-500">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-800">{stats.porVencer}</div>
            <div className="text-xs text-gray-500 uppercase mt-1">&lt; 30 Días</div>
          </div>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Búsqueda */}
          <div className="flex-1 min-w-[280px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar DNI / Médico / Especialidad..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Filtro Estado */}
          <div className="min-w-[180px]">
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white"
            >
              <option value="">Estado Token</option>
              <option value="VIGENTE">Vigente</option>
              <option value="PENDIENTE">En Proceso</option>
              <option value="REGISTRADO">Registrado</option>
              <option value="VENCIDO">Vencido</option>
              <option value="NO_REQUIERE">No Requiere</option>
              <option value="YA_TIENE">Ya Tiene</option>
            </select>
          </div>

          {/* Botón Refrescar */}
          <button
            onClick={cargarFirmasDigitales}
            disabled={loading}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>

          {/* Botón Exportar */}
          <button
            onClick={exportarCSV}
            className={`px-4 py-2.5 text-sm rounded-lg transition-all flex items-center gap-2 font-medium border-2 ${
              seleccionados.length > 0
                ? 'bg-green-50 border-green-300 text-green-700 hover:bg-green-100'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
            title={seleccionados.length > 0 ? `Exportar ${seleccionados.length} seleccionado(s)` : 'Selecciona registros para exportar'}
          >
            <Download className="w-4 h-4" />
            Exportar
            {seleccionados.length > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-green-600 text-white text-xs rounded-full font-semibold">
                {seleccionados.length}
              </span>
            )}
          </button>

          {/* Botón Filtros Avanzados */}
          <button
            onClick={() => setMostrarFiltrosAvanzados(!mostrarFiltrosAvanzados)}
            className={`px-4 py-2.5 text-sm rounded-lg transition-all flex items-center gap-2 font-medium border-2 ${
              mostrarFiltrosAvanzados
                ? 'bg-purple-50 border-purple-300 text-purple-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filtros Avanzados
          </button>
        </div>
      </div>

      {/* 🆕 Panel de Filtros Avanzados */}
      {mostrarFiltrosAvanzados && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-200">
          {/* FILTROS LABORALES */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
              FILTROS LABORALES
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Régimen Laboral */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2 flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  RÉGIMEN LABORAL
                </label>
                <select
                  value={filtroRegimenLaboral}
                  onChange={(e) => setFiltroRegimenLaboral(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white"
                >
                  <option value="">Todos los Regímenes</option>
                  {regimenesUnicos.map((regimen, index) => (
                    <option key={index} value={regimen}>{regimen}</option>
                  ))}
                </select>
              </div>

              {/* Profesión */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2 flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                  PROFESIÓN
                </label>
                <select
                  value={filtroProfesion}
                  onChange={(e) => setFiltroProfesion(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white"
                >
                  <option value="">Todas las Profesiones</option>
                  {profesionesUnicas.map((profesion, index) => (
                    <option key={index} value={profesion}>{profesion}</option>
                  ))}
                </select>
              </div>

              {/* Especialidad */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2 flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  ESPECIALIDAD
                </label>
                <select
                  value={filtroEspecialidad}
                  onChange={(e) => setFiltroEspecialidad(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white"
                >
                  <option value="">Todas las Especialidades</option>
                  {especialidadesUnicas.map((especialidad, index) => (
                    <option key={index} value={especialidad}>{especialidad}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* FILTROS DE FECHAS */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              FILTROS DE FECHAS DE CERTIFICADO
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Fecha Inicio Certificado */}
              <div className="space-y-3">
                <label className="block text-xs font-medium text-gray-600">
                  📅 FECHA INICIO CERTIFICADO
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">Desde</label>
                    <input
                      type="date"
                      value={filtroFechaInicioDesde}
                      onChange={(e) => setFiltroFechaInicioDesde(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">Hasta</label>
                    <input
                      type="date"
                      value={filtroFechaInicioHasta}
                      onChange={(e) => setFiltroFechaInicioHasta(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Fecha Vencimiento Certificado */}
              <div className="space-y-3">
                <label className="block text-xs font-medium text-gray-600">
                  ⏰ FECHA VENCIMIENTO CERTIFICADO
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">Desde</label>
                    <input
                      type="date"
                      value={filtroFechaVencimientoDesde}
                      onChange={(e) => setFiltroFechaVencimientoDesde(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1.5">Hasta</label>
                    <input
                      type="date"
                      value={filtroFechaVencimientoHasta}
                      onChange={(e) => setFiltroFechaVencimientoHasta(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Botón Limpiar Filtros */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => {
                setFiltroRegimenLaboral("");
                setFiltroProfesion("");
                setFiltroEspecialidad("");
                setFiltroFechaInicioDesde("");
                setFiltroFechaInicioHasta("");
                setFiltroFechaVencimientoDesde("");
                setFiltroFechaVencimientoHasta("");
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-all font-medium flex items-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              Limpiar Filtros Avanzados
            </button>
          </div>
        </div>
      )}

      {/* Banner: Seleccionar TODOS los registros */}
      {seleccionados.length === firmasPaginadas.length &&
       seleccionados.length > 0 &&
       firmasFiltradas.length > firmasPaginadas.length &&
       !seleccionarTodos && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900">
                  Los {firmasPaginadas.length} registros de esta página están seleccionados.
                </p>
                <p className="text-xs text-blue-700 mt-0.5">
                  ¿Quieres seleccionar los <strong>{firmasFiltradas.length} registros filtrados</strong> en total?
                </p>
              </div>
            </div>
            <button
              onClick={handleSeleccionarTodosFiltrados}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Seleccionar todos ({firmasFiltradas.length})
            </button>
          </div>
        </div>
      )}

      {/* Banner: TODOS los registros seleccionados */}
      {seleccionarTodos && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-900">
                  Los <strong>{firmasFiltradas.length} registros filtrados</strong> están seleccionados.
                </p>
              </div>
            </div>
            <button
              onClick={handleDeseleccionarTodos}
              className="px-4 py-2 bg-white border-2 border-green-300 text-green-700 text-sm font-medium rounded-lg hover:bg-green-50 transition-colors"
            >
              Deseleccionar todos
            </button>
          </div>
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
        <div className="overflow-x-auto relative">
          <table className="w-full text-sm text-left table-fixed">
            <thead className="text-xs font-semibold text-white uppercase tracking-wider bg-[#0A5BA9]">
              <tr>
                <th className="px-4 py-3 w-16 text-center">
                  <input
                    type="checkbox"
                    checked={(seleccionados.length > 0 && seleccionados.length === firmasPaginadas.length) || seleccionarTodos}
                    onChange={handleSeleccionarTodos}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                    title={seleccionarTodos ? `${firmasFiltradas.length} registros seleccionados` : (seleccionados.length === firmasPaginadas.length ? 'Deseleccionar página' : 'Seleccionar página')}
                  />
                </th>
                <th className="px-4 py-3 w-28">DNI</th>
                <th className="px-4 py-3 w-48">MÉDICO</th>
                <th className="px-4 py-3 w-36">ESPECIALIDAD</th>
                <th className="px-4 py-3 w-28 text-center">INICIO</th>
                <th className="px-4 py-3 w-28 text-center">FIN</th>
                <th className="px-4 py-3 w-20 text-center">VENCE</th>
                <th className="px-4 py-3 w-32 text-center">ESTADO</th>
                <th className="px-4 py-3 w-32 text-center">SERIE</th>
                <th className="px-4 py-3 w-44 text-center">MANTENIMIENTO</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="10" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0A5BA9]"></div>
                      <p className="text-sm font-medium text-gray-600">Cargando firmas digitales...</p>
                    </div>
                  </td>
                </tr>
              ) : firmasPaginadas.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 bg-gray-100 rounded-full">
                        <FileSignature className="w-8 h-8 text-gray-400" strokeWidth={1.5} />
                      </div>
                      <p className="text-sm font-medium text-gray-500">No se encontraron firmas digitales</p>
                      <p className="text-xs text-gray-400">Intenta ajustar los filtros de búsqueda</p>
                    </div>
                  </td>
                </tr>
              ) : (
                firmasPaginadas.map((firma, index) => {
                  const diasVencimiento = obtenerDiasVencimiento(firma);

                  return (
                    <tr key={firma.idFirmaPersonal} className={`hover:bg-gray-50 transition-colors duration-150 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                      {/* Checkbox */}
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={seleccionados.includes(firma.idFirmaPersonal)}
                          onChange={() => handleSeleccionarFila(firma.idFirmaPersonal)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>

                      {/* DNI */}
                      <td className="px-4 py-3">
                        <span className="text-gray-700 font-medium text-sm">{firma.dni || '—'}</span>
                      </td>

                      {/* Médico (Nombre completo) */}
                      <td className="px-4 py-3">
                        <span className="text-gray-700 font-medium text-sm truncate block">{firma.nombreCompleto || '—'}</span>
                      </td>

                      {/* Especialidad */}
                      <td className="px-4 py-3">
                        <span className="text-gray-700 text-xs truncate block">{firma.especialidad || '—'}</span>
                      </td>

                      {/* Inicio (fecha inicio certificado) */}
                      <td className="px-4 py-3 text-center">
                        <span className="text-gray-700 text-xs">
                          {firma.fechaInicioCertificado ? new Date(firma.fechaInicioCertificado).toLocaleDateString('es-PE') : '—'}
                        </span>
                      </td>

                      {/* Fin (fecha fin certificado) */}
                      <td className="px-4 py-3 text-center">
                        <span className="text-gray-700 text-xs">
                          {firma.fechaVencimientoCertificado ? new Date(firma.fechaVencimientoCertificado).toLocaleDateString('es-PE') : '—'}
                        </span>
                      </td>

                      {/* Vence (días para vencer) */}
                      <td className="px-4 py-3 text-center">
                        <span className="text-gray-700 font-medium text-sm">
                          {diasVencimiento !== null ? diasVencimiento : '—'}
                        </span>
                      </td>

                      {/* Estado */}
                      <td className="px-4 py-3 text-center">
                        {renderEstadoBadge(firma)}
                      </td>

                      {/* Serie (número de serie del token) */}
                      <td className="px-4 py-3 text-center">
                        <span className="text-gray-700 text-xs font-mono">
                          {firma.numeroSerieToken || '—'}
                        </span>
                      </td>

                      {/* Mantenimiento (botones) */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditar(firma)}
                            className="px-3 py-1.5 bg-green-500 text-white text-xs font-medium rounded hover:bg-green-600 transition-colors"
                            title="Editar firma digital"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDarDeBaja(firma)}
                            className="px-3 py-1.5 bg-red-500 text-white text-xs font-medium rounded hover:bg-red-600 transition-colors"
                            title="Dar de baja al usuario (marcar como INACTIVO)"
                          >
                            Baja
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {!loading && firmasFiltradas.length > 0 && (
          <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-600">
                Mostrando <span className="font-medium">{indiceInicio + 1}</span> a{' '}
                <span className="font-medium">{Math.min(indiceFin, firmasFiltradas.length)}</span> de{' '}
                <span className="font-medium">{firmasFiltradas.length}</span> resultados
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => irAPagina(paginaActual - 1)}
                  disabled={paginaActual === 1}
                  className="p-1.5 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((pagina) => (
                    <button
                      key={pagina}
                      onClick={() => irAPagina(pagina)}
                      className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-all ${
                        pagina === paginaActual
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {pagina}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => irAPagina(paginaActual + 1)}
                  disabled={paginaActual === totalPaginas}
                  className="p-1.5 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Edición (abre en pestaña Firma Digital) 🆕 */}
      {mostrarModalEdicion && usuarioSeleccionado && (
        <ActualizarModel
          user={usuarioSeleccionado}
          onClose={handleCerrarModalEdicion}
          onSuccess={handleSuccessEdicion}
          initialTab="firma" // 🎯 Abre directamente en pestaña Firma Digital
          firmaDigitalOnly={true} // 🆕 Solo permite editar Firma Digital (otros tabs bloqueados)
        />
      )}
    </div>
  );
}

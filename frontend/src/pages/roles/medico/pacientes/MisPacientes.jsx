/**
 * 👨‍⚕️ MisPacientes.jsx - Tabla de Pacientes para Médicos (v1.46.0)
 *
 * Panel que muestra los pacientes asignados al médico en tabla
 * con acciones profesionales de gestión de estado:
 * - Cambiar Estado: Atendido | Pendiente | Deserción (con razones)
 * - Generar Interconsulta
 */

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Clock,
  AlertCircle,
  Loader,
  RefreshCw,
  CheckCircle,
  ChevronRight,
  X,
  Check,
  FileText,
  Share2,
  Heart
} from 'lucide-react';
import toast from 'react-hot-toast';
import gestionPacientesService from '../../../../services/gestionPacientesService';

export default function MisPacientes() {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [modalAccion, setModalAccion] = useState(null);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState('Pendiente');
  const [razonDesercion, setRazonDesercion] = useState('');

  // ✅ v1.47.0: Estados para modal Atender Paciente
  const [tieneRecita, setTieneRecita] = useState(false);
  const [recitaDias, setRecitaDias] = useState(7);
  const [expandRecita, setExpandRecita] = useState(false);

  const [tieneInterconsulta, setTieneInterconsulta] = useState(false);
  const [interconsultaEspecialidad, setInterconsultaEspecialidad] = useState('');
  const [expandInterconsulta, setExpandInterconsulta] = useState(false);

  const [esCronico, setEsCronico] = useState(false);
  const [enfermedadesCronicas, setEnfermedadesCronicas] = useState([]);
  const [otroDetalle, setOtroDetalle] = useState('');
  const [expandCronico, setExpandCronico] = useState(false);

  const [especialidades, setEspecialidades] = useState([]);
  const [notasAccion, setNotasAccion] = useState('');

  useEffect(() => {
    cargarPacientes();
    cargarEspecialidades();
  }, []);

  const cargarEspecialidades = async () => {
    try {
      const data = await gestionPacientesService.obtenerEspecialidades();
      setEspecialidades(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error cargando especialidades:', error);
    }
  };

  const cargarPacientes = async () => {
    try {
      setLoading(true);
      const data = await gestionPacientesService.obtenerPacientesMedico();
      console.log('🔍 [DEBUG] Datos del API:', data);
      if (data?.length > 0) {
        console.log('🔍 [DEBUG] Primer paciente estructura:', data[0]);
        console.log('🔍 [DEBUG] Campos disponibles:', Object.keys(data[0]));
        console.log('🔍 [DEBUG] ipress:', data[0].ipress);
        console.log('🔍 [DEBUG] fechaAsignacion:', data[0].fechaAsignacion);
        console.log('🔍 [DEBUG] TODOS LOS CAMPOS:', JSON.stringify(data[0], null, 2));
      }
      setPacientes(Array.isArray(data) ? data : []);
      if (data?.length > 0) {
        toast.success(`${data.length} pacientes cargados`);
      }
    } catch (error) {
      console.error('Error cargando pacientes:', error);
      toast.error('Error al cargar pacientes');
      setPacientes([]);
    } finally {
      setLoading(false);
    }
  };

  const pacientesFiltrados = pacientes.filter(p => {
    const coincideBusqueda =
      (p.apellidosNombres?.toLowerCase().includes(busqueda.toLowerCase())) ||
      (p.numDoc?.includes(busqueda));

    const coincideEstado = !filtroEstado || (p.condicion === filtroEstado);

    return coincideBusqueda && coincideEstado;
  });

  const formatearFecha = (fecha) => {
    if (!fecha) return '-';

    try {
      // ✅ v1.47.0: Manejo de dos formatos de ISO 8601
      // 1. Con offset: "2026-02-06T08:06:44.765279-05:00" (hora LOCAL con offset)
      // 2. Con Z (UTC): "2026-02-06T10:58:54.563975Z" (UTC, requiere conversión a -05:00)

      let año, mes, día, hora, minuto, segundo;

      if (fecha.endsWith('Z')) {
        // Formato UTC (Z) - necesita conversión a hora local Peru (-05:00)
        // Crear Date object desde ISO string con Z
        const date = new Date(fecha);

        // Convertir a Peru local time (UTC-5)
        // Restar 5 horas al UTC
        let peruDate = new Date(date.getTime() - (5 * 60 * 60 * 1000));

        año = peruDate.getUTCFullYear();
        mes = String(peruDate.getUTCMonth() + 1).padStart(2, '0');
        día = String(peruDate.getUTCDate()).padStart(2, '0');
        hora = String(peruDate.getUTCHours()).padStart(2, '0');
        minuto = String(peruDate.getUTCMinutes()).padStart(2, '0');
        segundo = String(peruDate.getUTCSeconds()).padStart(2, '0');
      } else {
        // Formato con offset (±HH:MM) - ya es hora LOCAL, extraer componentes directamente
        // Expresión regex para ISO 8601: YYYY-MM-DDTHH:MM:SS[.ffffff][±HH:MM]
        const isoMatch = fecha.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?([+-]\d{2}):?(\d{2})?/);
        if (!isoMatch) return '-';

        año = isoMatch[1];
        mes = isoMatch[2];
        día = isoMatch[3];
        hora = isoMatch[4];
        minuto = isoMatch[5];
        segundo = isoMatch[6];
      }

      // Convertir a números para formateo
      const h = parseInt(hora);
      const m = parseInt(minuto);
      const s = parseInt(segundo);
      const d = parseInt(día);
      const mo = parseInt(mes);
      const y = parseInt(año);

      // Formatear en 12 horas con AM/PM
      const meridiem = h >= 12 ? 'p. m.' : 'a. m.';
      const h12 = h % 12 || 12;

      return `${String(d).padStart(2, '0')}/${String(mo).padStart(2, '0')}/${y}, ${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')} ${meridiem}`;
    } catch (e) {
      console.error('Error formateando fecha:', fecha, e);
      return '-';
    }
  };

  // ✅ v1.48.0: Formato humanizado sin segundos (para tabla)
  const formatearFechaHumana = (fecha) => {
    if (!fecha) return '-';

    try {
      let año, mes, día, hora, minuto;

      if (fecha.endsWith('Z')) {
        const date = new Date(fecha);
        let peruDate = new Date(date.getTime() - (5 * 60 * 60 * 1000));

        año = peruDate.getUTCFullYear();
        mes = String(peruDate.getUTCMonth() + 1).padStart(2, '0');
        día = String(peruDate.getUTCDate()).padStart(2, '0');
        hora = String(peruDate.getUTCHours()).padStart(2, '0');
        minuto = String(peruDate.getUTCMinutes()).padStart(2, '0');
      } else {
        const isoMatch = fecha.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?([+-]\d{2}):?(\d{2})?/);
        if (!isoMatch) return '-';

        año = isoMatch[1];
        mes = isoMatch[2];
        día = isoMatch[3];
        hora = isoMatch[4];
        minuto = isoMatch[5];
      }

      const h = parseInt(hora);
      const m = parseInt(minuto);
      const d = parseInt(día);
      const mo = parseInt(mes);
      const y = parseInt(año);

      // Verificar si es hoy
      const hoy = new Date();
      const peruHoy = new Date(hoy.getTime() - (5 * 60 * 60 * 1000));
      const diaHoy = peruHoy.getUTCDate();
      const mesHoy = peruHoy.getUTCMonth() + 1;
      const anoHoy = peruHoy.getUTCFullYear();

      const esHoy = d === diaHoy && mo === mesHoy && y === anoHoy;

      const meridiem = h >= 12 ? 'p. m.' : 'a. m.';
      const h12 = h % 12 || 12;
      const horaFormato = `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

      if (esHoy) {
        return `Hoy, ${horaFormato} ${meridiem}`;
      } else {
        return `${String(d).padStart(2, '0')}/${String(mo).padStart(2, '0')}/${String(y).slice(-2)} ${horaFormato} ${meridiem}`;
      }
    } catch (e) {
      console.error('Error formateando fecha humanizada:', fecha, e);
      return '-';
    }
  };

  const getColorCondicion = (condicion) => {
    // ✅ v1.48.0: Colores más distintos y visualmente separados
    // - Pendiente: Naranja vibrante (llama atención = acción requerida)
    // - Atendido: Verde suave (descarte visual = completado)
    // - Citado: Azul profesional (estado intermedio)
    // - Reprogramación Fallida: Rojo (problema)
    // - No Contactado: Gris neutro (estado neutro)
    const colores = {
      'Citado': 'bg-sky-100 text-sky-700 border-sky-300',
      'Atendido': 'bg-emerald-100 text-emerald-700 border-emerald-300',
      'Pendiente': 'bg-orange-100 text-orange-700 border-orange-300',
      'Reprogramación Fallida': 'bg-red-100 text-red-700 border-red-300',
      'No Contactado': 'bg-slate-100 text-slate-600 border-slate-300'
    };
    return colores[condicion] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const abrirAccion = (paciente) => {
    setPacienteSeleccionado(paciente);
    setModalAccion('cambiarEstado');
    setEstadoSeleccionado('Pendiente'); // Por defecto
    setRazonDesercion('');
    setNotasAccion('');
  };

  const procesarAccion = async () => {
    if (!pacienteSeleccionado) return;

    // ✅ v1.47.0: Si seleccionó "Atendido", registrar atención (opciones son opcionales)
    if (estadoSeleccionado === 'Atendido') {
      await procesarAtencionMedica();
      return;
    }

    // Validación para deserción
    if (estadoSeleccionado === 'Deserción' && !razonDesercion) {
      toast.error('Debe seleccionar una razón para registrar deserción');
      return;
    }

    try {
      setProcesando(true);

      // Preparar observaciones basadas en el estado
      let observaciones = '';
      if (estadoSeleccionado === 'Deserción') {
        observaciones = `Deserción registrada. Razón: ${razonDesercion}`;
      }
      // ✅ Cuando es "Pendiente": observaciones quedan vacías (borrar motivo)

      // ✅ v1.46.0: Usar idSolicitudBolsa si existe (pacientes de dim_solicitud_bolsa)
      // Si no, usar idGestion (pacientes de gestion_paciente)
      const idParaActualizar = pacienteSeleccionado.idSolicitudBolsa || pacienteSeleccionado.idGestion;

      console.log('🔍 [DEBUG] Actualizando condición:', {
        idSolicitudBolsa: pacienteSeleccionado.idSolicitudBolsa,
        idGestion: pacienteSeleccionado.idGestion,
        idParaActualizar,
        estado: estadoSeleccionado
      });

      // Guardar cambio en la base de datos
      await gestionPacientesService.actualizarCondicion(
        idParaActualizar,
        estadoSeleccionado,
        observaciones
      );

      // Mensaje de éxito
      if (estadoSeleccionado === 'Deserción') {
        toast.success(`Deserción registrada: ${razonDesercion} ✓`);
      } else {
        toast.success(`Estado cambiado a "${estadoSeleccionado}" ✓`);
      }

      // ✅ v1.47.0: Recargar lista de pacientes para obtener la fecha de atención actualizada
      await cargarPacientes();

      setModalAccion(null);
      setPacienteSeleccionado(null);
      setEstadoSeleccionado('Pendiente');
      setRazonDesercion('');
    } catch (error) {
      console.error('Error procesando acción:', error);
      toast.error('Error al cambiar estado. Intenta nuevamente.');
    } finally {
      setProcesando(false);
    }
  };

  // ✅ v1.47.0: Procesar atención médica (Recita + Interconsulta + Crónico)
  const procesarAtencionMedica = async () => {
    if (!pacienteSeleccionado) return;

    // ✅ v1.47.0: Opciones son opcionales - el médico decide si son necesarias
    try {
      setProcesando(true);

      const idParaAtender = pacienteSeleccionado.idSolicitudBolsa || pacienteSeleccionado.idGestion;

      const payload = {
        tieneRecita,
        recitaDias: tieneRecita ? recitaDias : null,
        tieneInterconsulta,
        interconsultaEspecialidad: tieneInterconsulta ? interconsultaEspecialidad : null,
        esCronico,
        enfermedades: esCronico ? enfermedadesCronicas : [],
        otroDetalle: esCronico && enfermedadesCronicas.includes('Otro') ? otroDetalle : null
      };

      console.log('🏥 [v1.47.0] Registrando atención:', payload);

      await gestionPacientesService.atenderPaciente(idParaAtender, payload);

      toast.success('✅ Atención registrada correctamente');

      // Recargar pacientes
      await cargarPacientes();

      // Cambiar estado a Atendido en la BD
      await gestionPacientesService.actualizarCondicion(
        idParaAtender,
        'Atendido',
        ''
      );

      // Cerrar modales
      setModalAccion(null);
      setPacienteSeleccionado(null);
      setEstadoSeleccionado('Pendiente');
    } catch (error) {
      console.error('Error registrando atención:', error);
      toast.error('Error al registrar atención. Intenta nuevamente.');
    } finally {
      setProcesando(false);
    }
  };

  const toggleEnfermedad = (enfermedad) => {
    setEnfermedadesCronicas(prev =>
      prev.includes(enfermedad)
        ? prev.filter(e => e !== enfermedad)
        : [...prev, enfermedad]
    );
  };

  // ✅ v1.48.0: Estilos dinámicos para botón de condición
  const getButtonStyleCondicion = (condicion) => {
    const baseClasses = 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105';

    if (condicion === 'Atendido') {
      return `${baseClasses} ${getColorCondicion(condicion)} opacity-70`;
    } else if (condicion === 'Pendiente') {
      return `${baseClasses} ${getColorCondicion(condicion)} shadow-md hover:shadow-lg`;
    }
    return `${baseClasses} ${getColorCondicion(condicion)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Cargando pacientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-8 h-8 text-[#0A5BA9]" />
            <h1 className="text-3xl font-bold text-gray-900">👨‍⚕️ Mis Pacientes</h1>
          </div>
          <p className="text-gray-600 font-medium">Gestiona tus pacientes asignados</p>
        </div>

        {/* 📊 Estadísticas - Parte Superior */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
            <p className="text-gray-600 text-sm font-medium">Total de Pacientes</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{pacientes.length}</p>
          </div>
          <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
            <p className="text-gray-600 text-sm font-medium">Filtrados</p>
            <p className="text-3xl font-bold text-[#0A5BA9] mt-2">{pacientesFiltrados.length}</p>
          </div>
          <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
            <p className="text-gray-600 text-sm font-medium">Atendidos</p>
            <p className="text-3xl font-bold text-emerald-600 mt-2">
              {pacientes.filter(p => p.condicion === 'Atendido').length}
            </p>
          </div>
          <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
            <p className="text-gray-600 text-sm font-medium">Pendientes</p>
            <p className="text-3xl font-bold text-amber-600 mt-2">
              {pacientes.filter(p => p.condicion === 'Pendiente').length}
            </p>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search className="w-4 h-4 inline mr-2" />
                Buscar por nombre o DNI
              </label>
              <input
                type="text"
                placeholder="Ingresa nombre o DNI..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A5BA9]/50 focus:border-[#0A5BA9] transition-colors"
              />
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Filter className="w-4 h-4 inline mr-2" />
                  Condición
                </label>
                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A5BA9]/50 focus:border-[#0A5BA9] transition-colors"
                >
                  <option value="">Todas</option>
                  <option value="Citado">Citado</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="Atendido">Atendido</option>
                  <option value="Reprogramación Fallida">Reprogramación Fallida</option>
                  <option value="No Contactado">No Contactado</option>
                </select>
              </div>

              {/* ✅ v1.48.0: Botón Actualizar discreto - solo icono */}
              <button
                onClick={cargarPacientes}
                title="Actualizar lista de pacientes"
                className="px-3 py-2 bg-[#0A5BA9] text-white rounded-lg hover:bg-[#083d78] transition-colors duration-200 flex items-center justify-center hover:shadow-md flex-shrink-0"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Tabla de pacientes */}
        {pacientesFiltrados.length === 0 ? (
          <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-12 text-center">
            <div className="p-4 bg-gray-100 rounded-full inline-block mb-4">
              <AlertCircle className="w-8 h-8 text-gray-400" strokeWidth={1.5} />
            </div>
            <p className="text-gray-600 font-medium">No hay pacientes para mostrar</p>
            <p className="text-gray-500 text-sm mt-1">Intenta ajustando los filtros de búsqueda</p>
          </div>
        ) : (
          <div className="relative overflow-hidden bg-white border border-gray-200 shadow-sm rounded-lg">
            <div className="overflow-x-auto relative">
              <table className="w-full text-sm text-left">
                <thead className="text-xs font-semibold text-white uppercase tracking-wider bg-[#0A5BA9] relative z-20">
                  <tr>
                    <th className="px-4 py-3 text-left">Paciente</th>
                    <th className="px-4 py-3 text-left">Teléfono</th>
                    <th className="px-4 py-3 text-left">IPRESS</th>
                    <th className="px-4 py-3 text-left">Condición</th>
                    <th className="px-4 py-3 text-left">Motivo</th>
                    <th className="px-4 py-3 text-left">Fecha Asignación</th>
                    <th className="px-4 py-3 text-left">Fecha Atención</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pacientesFiltrados.map((paciente, idx) => (
                    <tr key={idx} className={`hover:bg-gray-50 transition-colors duration-150 ${paciente.condicion === 'Atendido' ? 'bg-emerald-50/30' : 'bg-white'} ${idx % 2 === 0 ? '' : 'bg-opacity-50'}`}>
                      {/* Paciente: Nombre en bold + DNI abajo en gris */}
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-0.5">
                          <div className="font-bold text-gray-900 text-sm">{paciente.apellidosNombres}</div>
                          <div className="text-gray-500 text-xs">DNI: {paciente.numDoc}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{paciente.telefono || '-'}</td>
                      <td className="px-4 py-3 text-gray-600">{paciente.ipress || '-'}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => abrirAccion(paciente)}
                          title="Haz clic para cambiar estado"
                          className={getButtonStyleCondicion(paciente.condicion)}
                        >
                          <span>{paciente.condicion || 'Sin asignar'}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {paciente.observaciones ? (
                          <span className="inline-flex px-2.5 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                            {paciente.observaciones}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">
                        {formatearFechaHumana(paciente.fechaAsignacion)}
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">
                        {formatearFechaHumana(paciente.fechaAtencion)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Cambio de Estado */}
      {modalAccion === 'cambiarEstado' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh]">
            {/* Header Fijo - Mejorado con tipografía y espaciado */}
            <div className="relative px-6 py-5 bg-[#0A5BA9] rounded-t-lg">
              {/* Close Button X - En círculo con zona segura */}
              <button
                onClick={() => setModalAccion(null)}
                className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
                title="Cerrar"
              >
                <X className="w-5 h-5 text-white" strokeWidth={2.5} />
              </button>

              <div className="flex items-start justify-between gap-6 pr-12">
                {/* Nombre del paciente y DNI */}
                <div className="flex-1">
                  <p className="text-2xl font-bold text-white leading-relaxed">
                    {pacienteSeleccionado?.apellidosNombres
                      ?.split(' ')
                      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                      .join(' ')}
                  </p>
                  <p className="text-sm text-white/75 font-medium mt-1">DNI: {pacienteSeleccionado?.numDoc}</p>
                </div>

                {/* Estado Actual como Badge - Mejor alineación */}
                <div className="px-3 py-2 bg-white/20 rounded-full backdrop-blur-sm flex-shrink-0">
                  <p className="text-xs font-semibold text-white uppercase tracking-wider">{pacienteSeleccionado?.condicion || 'Citado'}</p>
                </div>
              </div>
            </div>

            {/* Contenido Scrolleable - Más espacio blanco */}
            <div className="flex-1 overflow-y-auto p-8 bg-white space-y-6">
              {/* Opción Atendido - DESTACADA */}
              <button
                onClick={() => setEstadoSeleccionado('Atendido')}
                className={`w-full text-left p-4 rounded-lg border-2 cursor-pointer transition-all font-semibold ${
                  estadoSeleccionado === 'Atendido'
                    ? 'border-green-500 bg-green-50 shadow-md text-green-900'
                    : 'border-gray-300 bg-white hover:border-green-300 hover:bg-gray-50 text-gray-900'
                }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                    estadoSeleccionado === 'Atendido'
                      ? 'bg-green-500 text-white'
                      : 'border-2 border-gray-400 text-gray-400'
                  }`}>
                    <Check className="w-4 h-4" strokeWidth={3} />
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-bold">Atendido</p>
                    <p className="text-sm text-gray-600 font-normal mt-1">Consulta completada</p>
                  </div>
                </div>
              </button>

              {/* ✅ Opciones de Atención (aparecen cuando selecciona Atendido) - Chips simples */}
              {estadoSeleccionado === 'Atendido' && (
                <div className="space-y-3 pl-10">
                  {/* Grid 3 columnas para chips grandes */}
                  <div className="grid grid-cols-3 gap-3">
                    {/* Chip 1: Recita */}
                    <button
                      onClick={() => {
                        setTieneRecita(!tieneRecita);
                        setExpandRecita(!expandRecita);
                      }}
                      className={`p-4 rounded-lg transition-all cursor-pointer text-center font-semibold ${
                        tieneRecita
                          ? 'bg-green-100 text-green-900 border-2 border-green-400 shadow-md'
                          : 'bg-gray-100 text-gray-700 border-2 border-gray-300 hover:bg-gray-200 hover:border-green-300'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="w-5 h-5" strokeWidth={2.5} />
                        <span className="text-sm">Recita</span>
                      </div>
                    </button>

                    {/* Chip 2: Referencia */}
                    <button
                      onClick={() => {
                        setTieneInterconsulta(!tieneInterconsulta);
                        setExpandInterconsulta(!expandInterconsulta);
                      }}
                      className={`p-4 rounded-lg transition-all cursor-pointer text-center font-semibold ${
                        tieneInterconsulta
                          ? 'bg-blue-100 text-blue-900 border-2 border-blue-400 shadow-md'
                          : 'bg-gray-100 text-gray-700 border-2 border-gray-300 hover:bg-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Share2 className="w-5 h-5" strokeWidth={2.5} />
                        <span className="text-sm">Referencia</span>
                      </div>
                    </button>

                    {/* Chip 3: Crónico */}
                    <button
                      onClick={() => {
                        setEsCronico(!esCronico);
                        setExpandCronico(!expandCronico);
                      }}
                      className={`p-4 rounded-lg transition-all cursor-pointer text-center font-semibold ${
                        esCronico
                          ? 'bg-purple-100 text-purple-900 border-2 border-purple-400 shadow-md'
                          : 'bg-gray-100 text-gray-700 border-2 border-gray-300 hover:bg-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Heart className="w-5 h-5" strokeWidth={2.5} />
                        <span className="text-sm">Crónico</span>
                      </div>
                    </button>
                  </div>

                  {/* Detalles Expandibles */}
                  <div className="space-y-2">
                    {/* Detalle 1: RECITA */}
                    {expandRecita && tieneRecita && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 animate-in slide-in-from-top-2">
                        <label className="text-xs font-semibold text-gray-700 block mb-2">Plazo:</label>
                        <select
                          value={recitaDias}
                          onChange={(e) => setRecitaDias(parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-green-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm font-medium text-gray-900 bg-white"
                        >
                          <option value={3}>3 días</option>
                          <option value={7}>7 días</option>
                          <option value={15}>15 días</option>
                          <option value={30}>30 días</option>
                          <option value={60}>60 días</option>
                          <option value={90}>90 días</option>
                        </select>
                      </div>
                    )}

                    {/* Detalle 2: INTERCONSULTA */}
                    {expandInterconsulta && tieneInterconsulta && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 animate-in slide-in-from-top-2">
                        <label className="text-xs font-semibold text-gray-700 block mb-2">Especialidad:</label>
                        <select
                          value={interconsultaEspecialidad}
                          onChange={(e) => setInterconsultaEspecialidad(e.target.value)}
                          className="w-full px-3 py-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium text-gray-900 bg-white"
                        >
                          <option value="">Selecciona especialidad...</option>
                          {especialidades.map(esp => (
                            <option key={esp.id} value={esp.descServicio}>
                              {esp.descServicio}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Detalle 3: CRÓNICO */}
                    {expandCronico && esCronico && (
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 animate-in slide-in-from-top-2">
                        <div className="space-y-2">
                          <label className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-purple-100 transition-colors">
                            <input
                              type="checkbox"
                              checked={enfermedadesCronicas.includes('Hipertensión')}
                              onChange={() => toggleEnfermedad('Hipertensión')}
                              className="w-4 h-4 text-purple-600 rounded"
                            />
                            <span className="text-xs font-medium text-gray-800">Hipertensión</span>
                          </label>

                          <label className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-purple-100 transition-colors">
                            <input
                              type="checkbox"
                              checked={enfermedadesCronicas.includes('Diabetes')}
                              onChange={() => toggleEnfermedad('Diabetes')}
                              className="w-4 h-4 text-purple-600 rounded"
                            />
                            <span className="text-xs font-medium text-gray-800">Diabetes</span>
                          </label>

                          <label className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-purple-100 transition-colors">
                            <input
                              type="checkbox"
                              checked={enfermedadesCronicas.includes('Otro')}
                              onChange={() => toggleEnfermedad('Otro')}
                              className="w-4 h-4 text-purple-600 rounded"
                            />
                            <span className="text-xs font-medium text-gray-800">Otra</span>
                          </label>
                        </div>

                        {enfermedadesCronicas.includes('Otro') && (
                          <input
                            type="text"
                            placeholder="Describa..."
                            value={otroDetalle}
                            onChange={(e) => setOtroDetalle(e.target.value)}
                            className="w-full mt-2 px-2 py-1 border border-purple-300 rounded text-xs"
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Opción Pendiente */}
              <button
                onClick={() => setEstadoSeleccionado('Pendiente')}
                className={`w-full text-left p-4 rounded-lg border-2 cursor-pointer transition-all font-semibold ${
                  estadoSeleccionado === 'Pendiente'
                    ? 'border-amber-500 bg-amber-50 shadow-md text-amber-900'
                    : 'border-gray-300 bg-white hover:border-amber-300 hover:bg-gray-50 text-gray-900'
                }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                    estadoSeleccionado === 'Pendiente'
                      ? 'bg-amber-500 text-white'
                      : 'border-2 border-gray-400 text-gray-400'
                  }`}>
                    <Clock className="w-4 h-4" strokeWidth={3} />
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-bold">Pendiente <span className="text-xs text-gray-500 font-normal">(por defecto)</span></p>
                    <p className="text-sm text-gray-600 font-normal mt-1">Aún no atendido, requiere seguimiento</p>
                  </div>
                </div>
              </button>

              {/* Opción Deserción */}
              <button
                onClick={() => setEstadoSeleccionado('Deserción')}
                className={`w-full text-left p-4 rounded-lg border-2 cursor-pointer transition-all font-semibold ${
                  estadoSeleccionado === 'Deserción'
                    ? 'border-red-400 bg-red-50 shadow-md text-red-900'
                    : 'border-gray-300 bg-white hover:border-red-300 hover:bg-gray-50 text-gray-900'
                }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                    estadoSeleccionado === 'Deserción'
                      ? 'border-2 border-red-500 text-red-500'
                      : 'border-2 border-gray-400 text-gray-400'
                  }`}>
                    <X className="w-4 h-4" strokeWidth={3} />
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-bold">Deserción</p>
                    <p className="text-sm text-gray-600 font-normal mt-1">Paciente no asistió o no desea atención</p>
                  </div>
                </div>
              </button>

                {/* Campo de razón para deserción */}
                {estadoSeleccionado === 'Deserción' && (
                  <div className="mt-6 ml-10 pt-6 border-t border-red-200">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Seleccione la razón:</label>
                    <select
                      value={razonDesercion}
                      onChange={(e) => setRazonDesercion(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 text-sm"
                    >
                      <option value="">-- Seleccionar razón --</option>
                      <optgroup label="Contacto">
                        <option value="No contactado">No contactado</option>
                        <option value="No contesta">No contesta</option>
                        <option value="Número apagado">Número apagado</option>
                        <option value="Número no existe">Número no existe</option>
                        <option value="Número equivocado">Número equivocado</option>
                      </optgroup>
                      <optgroup label="Rechazo">
                        <option value="Paciente rechazó">Paciente rechazó</option>
                        <option value="No desea atención">No desea atención</option>
                      </optgroup>
                      <optgroup label="Condición Médica">
                        <option value="Paciente internado">Paciente internado</option>
                        <option value="Paciente fallecido">Paciente fallecido</option>
                        <option value="Examen pendiente">Examen pendiente</option>
                      </optgroup>
                      <optgroup label="Otro">
                        <option value="Otro">Otro</option>
                      </optgroup>
                    </select>
                  </div>
                )}
            </div>

            {/* Footer Fijo con Botones */}
            <div className="border-t border-gray-200 p-6 bg-white flex gap-3 justify-end rounded-b-lg">
              <button
                onClick={() => setModalAccion(null)}
                disabled={procesando}
                className="px-5 py-2.5 text-gray-700 border-2 border-gray-300 rounded-lg hover:bg-gray-100 hover:border-gray-400 transition disabled:opacity-50 font-semibold text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={procesarAccion}
                disabled={procesando}
                className="px-6 py-2.5 bg-[#0A5BA9] text-white rounded-lg hover:bg-[#083d78] transition disabled:opacity-50 font-semibold text-sm flex items-center justify-center gap-2 shadow-sm"
              >
                {procesando ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  '✓ Confirmar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

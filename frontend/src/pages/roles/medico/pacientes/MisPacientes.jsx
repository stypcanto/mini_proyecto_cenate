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
  ChevronRight
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
  const [tieneInterconsulta, setTieneInterconsulta] = useState(false);
  const [interconsultaEspecialidad, setInterconsultaEspecialidad] = useState('');
  const [esCronico, setEsCronico] = useState(false);
  const [enfermedadesCronicas, setEnfermedadesCronicas] = useState([]);
  const [otroDetalle, setOtroDetalle] = useState('');
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

  const getColorCondicion = (condicion) => {
    const colores = {
      'Citado': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'Atendido': 'bg-blue-100 text-blue-700 border-blue-200',
      'Pendiente': 'bg-amber-100 text-amber-700 border-amber-200',
      'Reprogramación Fallida': 'bg-red-100 text-red-700 border-red-200',
      'No Contactado': 'bg-gray-100 text-gray-700 border-gray-200'
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

    // ✅ v1.47.0: Si seleccionó "Atendido", abrir modal Atender en lugar de cambiar estado directamente
    if (estadoSeleccionado === 'Atendido') {
      // Resetear valores v1.47.0
      setTieneRecita(false);
      setRecitaDias(7);
      setTieneInterconsulta(false);
      setInterconsultaEspecialidad('');
      setEsCronico(false);
      setEnfermedadesCronicas([]);
      setOtroDetalle('');

      // Cambiar a modal Atender
      setModalAccion('atender');
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

    // Validación: al menos una acción debe estar seleccionada
    if (!tieneRecita && !tieneInterconsulta && !esCronico) {
      toast.error('Debe seleccionar al menos una acción: Recita, Interconsulta o Crónico');
      return;
    }

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

        {/* Filtros y búsqueda */}
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

            <div>
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

            <div className="flex items-end">
              <button
                onClick={cargarPacientes}
                className="w-full px-4 py-2 bg-[#0A5BA9] text-white rounded-lg hover:bg-[#083d78] transition-colors duration-200 flex items-center justify-center gap-2 font-medium"
              >
                <RefreshCw className="w-4 h-4" />
                Actualizar
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
                    <th className="px-4 py-3">DNI</th>
                    <th className="px-4 py-3">Paciente</th>
                    <th className="px-4 py-3">Teléfono</th>
                    <th className="px-4 py-3">IPRESS</th>
                    <th className="px-4 py-3">Condición</th>
                    <th className="px-4 py-3">Motivo</th>
                    <th className="px-4 py-3">Fecha Asignación</th>
                    <th className="px-4 py-3">Fecha Atención</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pacientesFiltrados.map((paciente, idx) => (
                    <tr key={idx} className={`hover:bg-gray-50 transition-colors duration-150 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                      <td className="px-4 py-3 font-medium text-gray-900">{paciente.numDoc}</td>
                      <td className="px-4 py-3 text-gray-700">{paciente.apellidosNombres}</td>
                      <td className="px-4 py-3 text-gray-600">{paciente.telefono || '-'}</td>
                      <td className="px-4 py-3 text-gray-600">{paciente.ipress || '-'}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => abrirAccion(paciente)}
                          title="Haz clic para cambiar estado"
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium border cursor-pointer transition-all duration-200 hover:shadow-md ${getColorCondicion(paciente.condicion)}`}
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
                      <td className="px-4 py-3 text-gray-600">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-xs">{formatearFecha(paciente.fechaAsignacion)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-xs">{formatearFecha(paciente.fechaAtencion)}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Estadísticas */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
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
        </div>
      </div>

      {/* ✅ v1.47.0: Modal Atender Paciente (Recita + Interconsulta + Crónico) */}
      {modalAccion === 'atender' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-2">🏥 Registrar Atención Médica</h2>
            <p className="text-sm text-gray-600 mb-6">{pacienteSeleccionado?.apellidosNombres}</p>

            {/* Sección 1: Recita */}
            <div className="mb-8 p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <input
                  type="checkbox"
                  id="recita"
                  checked={tieneRecita}
                  onChange={(e) => setTieneRecita(e.target.checked)}
                  className="w-5 h-5 text-green-600 rounded"
                />
                <label htmlFor="recita" className="text-lg font-semibold text-gray-900">📋 Recita</label>
              </div>

              {tieneRecita && (
                <div className="ml-8 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Plazo de Recita (días):</label>
                    <select
                      value={recitaDias}
                      onChange={(e) => setRecitaDias(parseInt(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value={3}>3 días</option>
                      <option value={7}>7 días</option>
                      <option value={15}>15 días</option>
                      <option value={30}>30 días</option>
                      <option value={60}>60 días</option>
                      <option value={90}>90 días</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Sección 2: Interconsulta */}
            <div className="mb-8 p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <input
                  type="checkbox"
                  id="interconsulta"
                  checked={tieneInterconsulta}
                  onChange={(e) => setTieneInterconsulta(e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded"
                />
                <label htmlFor="interconsulta" className="text-lg font-semibold text-gray-900">🔗 Interconsulta</label>
              </div>

              {tieneInterconsulta && (
                <div className="ml-8 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Especialidad:</label>
                    <select
                      value={interconsultaEspecialidad}
                      onChange={(e) => setInterconsultaEspecialidad(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">-- Seleccione especialidad --</option>
                      {especialidades.map(esp => (
                        <option key={esp.id} value={esp.descServicio}>{esp.descServicio}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Sección 3: Enfermedad Crónica */}
            <div className="mb-8 p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <input
                  type="checkbox"
                  id="cronico"
                  checked={esCronico}
                  onChange={(e) => setEsCronico(e.target.checked)}
                  className="w-5 h-5 text-purple-600 rounded"
                />
                <label htmlFor="cronico" className="text-lg font-semibold text-gray-900">🏥 Paciente Crónico</label>
              </div>

              {esCronico && (
                <div className="ml-8 space-y-4">
                  <p className="text-sm text-gray-600 font-medium">Seleccione enfermedad(es):</p>

                  <div className="space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enfermedadesCronicas.includes('Hipertensión')}
                        onChange={() => toggleEnfermedad('Hipertensión')}
                        className="w-4 h-4 text-purple-600 rounded"
                      />
                      <span className="text-sm text-gray-700">Hipertensión</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enfermedadesCronicas.includes('Diabetes')}
                        onChange={() => toggleEnfermedad('Diabetes')}
                        className="w-4 h-4 text-purple-600 rounded"
                      />
                      <span className="text-sm text-gray-700">Diabetes</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={enfermedadesCronicas.includes('Otro')}
                        onChange={() => toggleEnfermedad('Otro')}
                        className="w-4 h-4 text-purple-600 rounded"
                      />
                      <span className="text-sm text-gray-700">Otra enfermedad crónica</span>
                    </label>
                  </div>

                  {enfermedadesCronicas.includes('Otro') && (
                    <div>
                      <input
                        type="text"
                        placeholder="Describa la enfermedad crónica..."
                        value={otroDetalle}
                        onChange={(e) => setOtroDetalle(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Botones */}
            <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setModalAccion('cambiarEstado');
                  setEstadoSeleccionado('Atendido');
                }}
                disabled={procesando}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 font-medium"
              >
                ← Atrás
              </button>
              <button
                onClick={() => setModalAccion(null)}
                disabled={procesando}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={procesarAtencionMedica}
                disabled={procesando || (!tieneRecita && !tieneInterconsulta && !esCronico)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 font-medium flex items-center justify-center gap-2"
              >
                {procesando ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  '✓ Registrar Atención'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Cambio de Estado */}
      {modalAccion === 'cambiarEstado' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Cambiar Estado de Consulta</h2>

            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">Paciente</p>
              <p className="text-lg font-semibold text-gray-900">{pacienteSeleccionado?.apellidosNombres}</p>
            </div>

            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">Estado Actual</p>
              <p className="text-lg font-semibold text-gray-900">{pacienteSeleccionado?.condicion || 'Citado'}</p>
            </div>

            {/* Opciones de Estado */}
            <div className="space-y-4 mb-6">
              <h3 className="text-sm font-semibold text-gray-900">Seleccione el nuevo estado:</h3>

              {/* Opción Atendido */}
              <div className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-blue-50 cursor-pointer transition"
                   onClick={() => setEstadoSeleccionado('Atendido')}>
                <input
                  type="radio"
                  name="estado"
                  value="Atendido"
                  checked={estadoSeleccionado === 'Atendido'}
                  onChange={(e) => setEstadoSeleccionado(e.target.value)}
                  className="mt-1 w-4 h-4 text-blue-600"
                />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">✓ Atendido</p>
                  <p className="text-xs text-gray-600">Consulta completada</p>
                </div>
              </div>

              {/* Opción Pendiente */}
              <div className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-blue-50 cursor-pointer transition"
                   onClick={() => setEstadoSeleccionado('Pendiente')}>
                <input
                  type="radio"
                  name="estado"
                  value="Pendiente"
                  checked={estadoSeleccionado === 'Pendiente'}
                  onChange={(e) => setEstadoSeleccionado(e.target.value)}
                  className="mt-1 w-4 h-4 text-blue-600"
                />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">⏳ Pendiente <span className="text-xs text-gray-500">(por defecto)</span></p>
                  <p className="text-xs text-gray-600">Aún no atendido, requiere seguimiento</p>
                </div>
              </div>

              {/* Opción Deserción */}
              <div className="p-4 border border-gray-200 rounded-lg hover:bg-red-50 transition">
                <div className="flex items-start gap-4 cursor-pointer"
                     onClick={() => setEstadoSeleccionado('Deserción')}>
                  <input
                    type="radio"
                    name="estado"
                    value="Deserción"
                    checked={estadoSeleccionado === 'Deserción'}
                    onChange={(e) => setEstadoSeleccionado(e.target.value)}
                    className="mt-1 w-4 h-4 text-red-600"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">❌ Deserción</p>
                    <p className="text-xs text-gray-600">Paciente no asistió o no desea atención</p>
                  </div>
                </div>

                {/* Campo de razón para deserción */}
                {estadoSeleccionado === 'Deserción' && (
                  <div className="mt-4 ml-8">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Seleccione la razón:</label>
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
            </div>

            {/* Botones */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setModalAccion(null)}
                disabled={procesando}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={procesarAccion}
                disabled={procesando}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-medium flex items-center justify-center gap-2"
              >
                {procesando ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  'Confirmar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

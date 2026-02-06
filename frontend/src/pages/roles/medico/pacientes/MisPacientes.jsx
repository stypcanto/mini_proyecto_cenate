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
  Share2,
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
  const [notasAccion, setNotasAccion] = useState('');
  const [procesando, setProcesando] = useState(false);
  const [estadoSeleccionado, setEstadoSeleccionado] = useState('Pendiente');
  const [razonDesercion, setRazonDesercion] = useState('');

  useEffect(() => {
    cargarPacientes();
  }, []);

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
      // Parsear ISO 8601 con dos formatos posibles:
      // 1. Con offset: "2026-02-05T02:09:54-05:00" o "2026-02-05T02:09:54+05:30"
      // 2. Con Z (UTC): "2026-02-06T10:58:54.563975Z"

      let localDate;

      // Intentar con Z (UTC con posibles millisegundos)
      if (fecha.endsWith('Z')) {
        localDate = new Date(fecha);
      } else {
        // Intentar con offset: "2026-02-05T02:09:54-05:00"
        const offsetMatch = fecha.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})([+-]\d{2}):?(\d{2})?/);
        if (!offsetMatch) return '-';

        const [, año, mes, día, hora, minuto, segundo, offsetHoras, offsetMinutos] = offsetMatch;

        // Parsear como UTC y aplicar el offset
        const utcDate = new Date(`${año}-${mes}-${día}T${hora}:${minuto}:${segundo}Z`);
        const offset = (parseInt(offsetHoras) * 60 + (parseInt(offsetMinutos) || 0)) * 60000;
        localDate = new Date(utcDate.getTime() + offset);
      }

      if (isNaN(localDate.getTime())) return '-';

      // Extraer componentes
      const h = localDate.getUTCHours();
      const m = localDate.getUTCMinutes();
      const s = localDate.getUTCSeconds();
      const d = localDate.getUTCDate();
      const mo = localDate.getUTCMonth() + 1;
      const y = localDate.getUTCFullYear();

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
      'Citado': 'bg-green-50 text-green-700 border-green-200',
      'Atendido': 'bg-blue-50 text-blue-700 border-blue-200',
      'Pendiente': 'bg-yellow-50 text-yellow-700 border-yellow-200',
      'Reprogramación Fallida': 'bg-red-50 text-red-700 border-red-200',
      'No Contactado': 'bg-gray-50 text-gray-700 border-gray-200'
    };
    return colores[condicion] || 'bg-gray-50 text-gray-700 border-gray-200';
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
      // ✅ Cuando es "Atendido" o "Pendiente": observaciones quedan vacías (borrar motivo)

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

      // Actualizar condición y observaciones del paciente en la tabla
      setPacientes(pacientes.map(p =>
        p.numDoc === pacienteSeleccionado.numDoc
          ? { ...p, condicion: estadoSeleccionado, observaciones: observaciones }
          : p
      ));

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
            <Users className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">👨‍⚕️ Mis Pacientes</h1>
          </div>
          <p className="text-gray-600">Gestiona tus pacientes asignados</p>
        </div>

        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
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
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Actualizar
              </button>
            </div>
          </div>
        </div>

        {/* Tabla de pacientes */}
        {pacientesFiltrados.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No hay pacientes para mostrar</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">DNI</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Paciente</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Teléfono</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">IPRESS</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Condición</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Motivo</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700">Fecha Asignación</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pacientesFiltrados.map((paciente, idx) => (
                    <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{paciente.numDoc}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{paciente.apellidosNombres}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{paciente.telefono || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{paciente.ipress || '-'}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => abrirAccion(paciente)}
                          title="Haz clic para cambiar estado"
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold border cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-110 active:scale-95 ${getColorCondicion(paciente.condicion)}`}
                        >
                          <span>{paciente.condicion || 'Sin asignar'}</span>
                          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {paciente.observaciones ? (
                          <div className="max-w-xs">
                            <p className="text-xs bg-yellow-50 text-yellow-800 border border-yellow-200 rounded px-2 py-1">
                              {paciente.observaciones}
                            </p>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          {formatearFecha(paciente.fechaAsignacion)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => {
                              setPacienteSeleccionado(paciente);
                              setModalAccion('interconsulta');
                            }}
                            title="Generar Interconsulta"
                            className="p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
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
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-gray-600 text-sm">Total de Pacientes</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{pacientes.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-gray-600 text-sm">Filtrados</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{pacientesFiltrados.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-gray-600 text-sm">Atendidos</p>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {pacientes.filter(p => p.condicion === 'Atendido').length}
            </p>
          </div>
        </div>
      </div>

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

      {/* Modal de Interconsulta */}
      {modalAccion === 'interconsulta' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">🔄 Generar Interconsulta</h3>
            <p className="text-gray-600 text-sm mb-4">
              Paciente: <span className="font-semibold">{pacienteSeleccionado?.apellidosNombres}</span>
            </p>

            {/* Campo de notas */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Notas (opcional)</label>
              <textarea
                value={notasAccion}
                onChange={(e) => setNotasAccion(e.target.value)}
                placeholder="Agrega observaciones o detalles de interconsulta..."
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>

            {/* Botones */}
            <div className="flex gap-3">
              <button
                onClick={() => setModalAccion(null)}
                disabled={procesando}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setProcesando(true);
                  setTimeout(() => {
                    toast.success('Interconsulta creada exitosamente ✓');
                    setModalAccion(null);
                    setProcesando(false);
                  }, 500);
                }}
                disabled={procesando}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
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

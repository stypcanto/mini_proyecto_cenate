/**
 * 👨‍⚕️ MisPacientes.jsx - Tabla de Pacientes para Médicos (v1.45.1)
 *
 * Panel que muestra los pacientes asignados al médico en tabla
 * con acciones: Marcar Atendido, Receta, Interconsulta
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
  FileText,
  Share2
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

  useEffect(() => {
    cargarPacientes();
  }, []);

  const cargarPacientes = async () => {
    try {
      setLoading(true);
      const data = await gestionPacientesService.obtenerPacientesMedico();
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
      // Parsear ISO 8601 con offset: "2026-02-05T02:09:54-05:00"
      const match = fecha.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})([+-]\d{2}):?(\d{2})?/);
      if (!match) return '-';

      const [, año, mes, día, hora, minuto, segundo, offsetHoras, offsetMinutos] = match;

      // Parsear como UTC y aplicar el offset
      const utcDate = new Date(`${año}-${mes}-${día}T${hora}:${minuto}:${segundo}Z`);
      const offset = (parseInt(offsetHoras) * 60 + (parseInt(offsetMinutos) || 0)) * 60000;
      const localDate = new Date(utcDate.getTime() + offset);

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

  const abrirAccion = (paciente, tipo) => {
    setPacienteSeleccionado(paciente);
    setModalAccion(tipo);
    setNotasAccion('');
  };

  const procesarAccion = async () => {
    if (!pacienteSeleccionado) return;

    try {
      setProcesando(true);

      // Aquí iría la lógica para guardar la acción
      // Por ahora simulamos el éxito
      await new Promise(resolve => setTimeout(resolve, 500));

      const mensajes = {
        'atendido': 'Paciente marcado como Atendido ✓',
        'receta': 'Receta generada exitosamente ✓',
        'interconsulta': 'Interconsulta creada exitosamente ✓'
      };

      toast.success(mensajes[modalAccion] || 'Acción completada');

      // Actualizar condición del paciente en la tabla
      setPacientes(pacientes.map(p =>
        p.numDoc === pacienteSeleccionado.numDoc
          ? { ...p, condicion: 'Atendido' }
          : p
      ));

      setModalAccion(null);
      setPacienteSeleccionado(null);
    } catch (error) {
      console.error('Error procesando acción:', error);
      toast.error('Error al procesar la acción');
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
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getColorCondicion(paciente.condicion)}`}>
                          {paciente.condicion || 'Sin asignar'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          {formatearFecha(paciente.fechaAsignacion)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => abrirAccion(paciente, 'atendido')}
                            title="Marcar como Atendido"
                            className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => abrirAccion(paciente, 'receta')}
                            title="Generar Receta"
                            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => abrirAccion(paciente, 'interconsulta')}
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

      {/* Modal de Acciones */}
      {modalAccion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {modalAccion === 'atendido' && '✓ Marcar como Atendido'}
              {modalAccion === 'receta' && '📋 Generar Receta'}
              {modalAccion === 'interconsulta' && '🔄 Generar Interconsulta'}
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Paciente: <span className="font-semibold">{pacienteSeleccionado?.apellidosNombres}</span>
            </p>

            {/* Campo de notas */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Notas (opcional)</label>
              <textarea
                value={notasAccion}
                onChange={(e) => setNotasAccion(e.target.value)}
                placeholder="Agrega observaciones o diagnóstico..."
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
                onClick={procesarAccion}
                disabled={procesando}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
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

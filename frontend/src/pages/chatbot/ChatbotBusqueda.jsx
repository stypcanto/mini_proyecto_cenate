// ========================================================================
// CHATBOT BUSQUEDA - Dashboard de Solicitudes de Citas CENATE
// ========================================================================
// Dashboard con KPIs, graficos y busqueda avanzada de citas
// ========================================================================

import React, { useState, useEffect, useCallback } from 'react';
import chatbotService from '../../services/chatbotService';

// Componente KPI Card
const KpiCard = ({ title, value, color, icon }) => {
  const gradients = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600'
  };

  const textColors = {
    blue: 'text-blue-100',
    green: 'text-green-100',
    purple: 'text-purple-100',
    orange: 'text-orange-100'
  };

  return (
    <div className={`bg-gradient-to-br ${gradients[color]} rounded-xl shadow-lg p-6 text-white`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`${textColors[color]} text-sm font-medium`}>{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        {icon && <div className="text-4xl opacity-80">{icon}</div>}
      </div>
    </div>
  );
};

// Componente de Estado Badge
const EstadoBadge = ({ estado }) => {
  const estados = {
    PENDIENTE: 'bg-yellow-100 text-yellow-800',
    RESERVADO: 'bg-blue-100 text-blue-800',
    CONFIRMADA: 'bg-green-100 text-green-800',
    CANCELADA: 'bg-red-100 text-red-800',
    NO_PRESENTADO: 'bg-gray-100 text-gray-800',
    ATENDIDO: 'bg-emerald-100 text-emerald-800'
  };

  const colorClass = estados[estado?.toUpperCase()] || 'bg-gray-100 text-gray-800';

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${colorClass}`}>
      {estado || 'N/A'}
    </span>
  );
};

export default function ChatbotBusqueda() {
  // Estado de datos
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Estado de filtros
  const [showFilters, setShowFilters] = useState(true);
  const [filtros, setFiltros] = useState({
    fechaInicio: '',
    fechaFin: '',
    periodo: '',
    docPaciente: '',
    numDocPers: '',
    areaHosp: '',
    servicio: '',
    estadoPaciente: ''
  });

  // Estado de paginacion
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Opciones para combos (se llenan desde los datos)
  const [opciones, setOpciones] = useState({
    periodos: [],
    areas: [],
    servicios: [],
    estados: [],
    profesionales: []
  });

  // Cargar datos inicial
  const cargarCitas = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await chatbotService.buscarCitas(filtros);
      const lista = Array.isArray(data) ? data : [];
      setCitas(lista);
      actualizarOpciones(lista);
      setCurrentPage(1);
    } catch (err) {
      setError(err.message || 'Error al cargar citas');
      setCitas([]);
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  // Actualizar opciones de combos desde los datos
  const actualizarOpciones = (data) => {
    const uniq = (arr) => [...new Set(arr.filter((x) => x && x.toString().trim() !== ''))].sort();

    setOpciones({
      periodos: uniq(data.map((x) => x.periodo)),
      areas: uniq(data.map((x) => x.area || x.areaHosp)),
      servicios: uniq(data.map((x) => x.desc_servicio || x.descServicio || x.servicio)),
      estados: uniq(data.map((x) => x.cod_estado_cita || x.codEstadoCita || x.estadoPaciente || x.estado)),
      profesionales: uniq(data.map((x) => x.profesional))
    });
  };

  // Cargar al montar
  useEffect(() => {
    cargarCitas();
  }, []);

  // Calcular KPIs
  const calcularKPIs = () => {
    const totalCitas = citas.length;
    const citasReservadas = citas.filter(
      (c) => (c.cod_estado_cita || c.codEstadoCita || c.estado || '').toUpperCase() === 'RESERVADO'
    ).length;
    const pacientesUnicos = new Set(citas.map((c) => c.doc_paciente || c.docPaciente)).size;
    const profesionalesActivos = new Set(citas.map((c) => c.profesional)).size;

    return { totalCitas, citasReservadas, pacientesUnicos, profesionalesActivos };
  };

  const kpis = calcularKPIs();

  // Paginacion
  const totalPages = Math.max(1, Math.ceil(citas.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const citasPaginadas = citas.slice(startIndex, startIndex + itemsPerPage);

  // Handlers
  const handleFiltroChange = (campo, valor) => {
    setFiltros((prev) => ({ ...prev, [campo]: valor }));
  };

  const aplicarFiltros = () => {
    cargarCitas();
  };

  const limpiarFiltros = () => {
    setFiltros({
      fechaInicio: '',
      fechaFin: '',
      periodo: '',
      docPaciente: '',
      numDocPers: '',
      areaHosp: '',
      servicio: '',
      estadoPaciente: ''
    });
  };

  // Exportar CSV
  const exportarCSV = () => {
    const headers = [
      'ID',
      'Periodo',
      'Fecha Cita',
      'Hora',
      'Paciente',
      'DNI',
      'Edad',
      'Sexo',
      'Profesional',
      'Servicio',
      'Area',
      'Estado',
      'Observacion'
    ];

    const rows = citas.map((c) => [
      c.id_solicitud || c.idSolicitud || '',
      c.periodo || '',
      c.fecha_cita || c.fechaCita || '',
      c.hora_cita || c.horaCita || '',
      c.nombres_paciente || c.nombresPaciente || '',
      c.doc_paciente || c.docPaciente || '',
      c.edad || '',
      c.sexo || '',
      c.profesional || '',
      c.desc_servicio || c.descServicio || c.servicio || '',
      c.area || c.areaHosp || '',
      c.cod_estado_cita || c.codEstadoCita || c.estado || '',
      c.observacion || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((r) => r.map((x) => `"${(x || '').toString().replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `citas_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Normalizar campos de cita
  const normalizeCita = (c) => ({
    id: c.id_solicitud || c.idSolicitud || c.id,
    periodo: c.periodo,
    fechaCita: c.fecha_cita || c.fechaCita,
    horaCita: c.hora_cita || c.horaCita,
    docPaciente: c.doc_paciente || c.docPaciente,
    nombresPaciente: c.nombres_paciente || c.nombresPaciente || c.paciente,
    sexo: c.sexo,
    edad: c.edad,
    profesional: c.profesional,
    servicio: c.desc_servicio || c.descServicio || c.servicio,
    estado: c.cod_estado_cita || c.codEstadoCita || c.estadoPaciente || c.estado
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-bold">
                  C
                </span>
                Dashboard de Solicitudes de Citas
              </h1>
              <p className="text-gray-600 mt-2">CENATE - EsSalud Telesalud</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
              </button>
              <button
                onClick={exportarCSV}
                disabled={citas.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-gray-400"
              >
                Exportar CSV
              </button>
            </div>
          </div>

          {/* Loading / Error */}
          {loading && (
            <div className="mt-4 p-3 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 text-sm">
              Cargando datos...
            </div>
          )}
          {error && (
            <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <KpiCard title="Total Citas" value={kpis.totalCitas} color="blue" />
          <KpiCard title="Reservadas" value={kpis.citasReservadas} color="green" />
          <KpiCard title="Pacientes" value={kpis.pacientesUnicos} color="purple" />
          <KpiCard title="Profesionales" value={kpis.profesionalesActivos} color="orange" />
        </div>

        {/* Filtros */}
        {showFilters && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
              <h2 className="text-xl font-bold text-gray-800">Filtros de Busqueda</h2>
              <div className="flex gap-2">
                <button
                  onClick={limpiarFiltros}
                  className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  Limpiar
                </button>
                <button
                  onClick={aplicarFiltros}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Buscar
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Fecha Inicio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Inicio</label>
                <input
                  type="date"
                  value={filtros.fechaInicio}
                  onChange={(e) => handleFiltroChange('fechaInicio', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Fecha Fin */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Fin</label>
                <input
                  type="date"
                  value={filtros.fechaFin}
                  onChange={(e) => handleFiltroChange('fechaFin', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Periodo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Periodo</label>
                <select
                  value={filtros.periodo}
                  onChange={(e) => handleFiltroChange('periodo', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos</option>
                  {opciones.periodos.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              {/* DNI Paciente */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">DNI Paciente</label>
                <input
                  type="text"
                  value={filtros.docPaciente}
                  onChange={(e) => handleFiltroChange('docPaciente', e.target.value)}
                  placeholder="Ej: 70073164"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* DNI Personal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">DNI Personal</label>
                <input
                  type="text"
                  value={filtros.numDocPers}
                  onChange={(e) => handleFiltroChange('numDocPers', e.target.value)}
                  placeholder="Ej: 12345678"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Area</label>
                <select
                  value={filtros.areaHosp}
                  onChange={(e) => handleFiltroChange('areaHosp', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todas</option>
                  {opciones.areas.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>

              {/* Servicio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Servicio</label>
                <select
                  value={filtros.servicio}
                  onChange={(e) => handleFiltroChange('servicio', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos</option>
                  {opciones.servicios.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* Estado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                <select
                  value={filtros.estadoPaciente}
                  onChange={(e) => handleFiltroChange('estadoPaciente', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos</option>
                  {opciones.estados.map((e) => (
                    <option key={e} value={e}>
                      {e}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Tabla de resultados */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-xl font-bold text-gray-800">Resultados: {citas.length} citas</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Fecha
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Hora
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Paciente
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    DNI
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Profesional
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Servicio
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {citasPaginadas.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                      No se encontraron citas
                    </td>
                  </tr>
                ) : (
                  citasPaginadas.map((cita, index) => {
                    const c = normalizeCita(cita);
                    return (
                      <tr key={c.id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-blue-600">#{c.id}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-900">{c.fechaCita}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-900">{c.horaCita}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{c.nombresPaciente}</div>
                          <div className="text-sm text-gray-500">
                            {c.sexo} - {c.edad} anos
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-900">{c.docPaciente}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{c.profesional}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">{c.servicio}</div>
                        </td>
                        <td className="px-6 py-4">
                          <EstadoBadge estado={c.estado} />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Paginacion */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between flex-wrap gap-4">
            <div className="text-sm text-gray-700">
              Mostrando {citas.length === 0 ? 0 : startIndex + 1} a{' '}
              {Math.min(startIndex + itemsPerPage, citas.length)} de {citas.length} resultados
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <span className="px-4 py-2 text-sm font-medium text-gray-700">
                Pagina {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

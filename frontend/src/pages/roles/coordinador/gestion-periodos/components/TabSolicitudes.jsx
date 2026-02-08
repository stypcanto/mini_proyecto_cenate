// src/pages/coordinador/turnos/components/TabSolicitudes.jsx
import React, { useMemo, useState, useEffect } from "react";
import {
  Calendar,
  FileText,
  Eye,
  Search,
  Filter,
  Loader2,
  Building2,
  ChevronDown,
  ChevronUp,
  MapPin,
  Download,
  X,
  ChevronRight,
} from "lucide-react";
import { fmtDateTime } from "../utils/ui";
import { filtrosUbicacionService } from "../../../../../services/filtrosUbicacionService";
import { exportarSolicitudCompleta } from "../utils/exportarExcel";

export default function TabSolicitudes({
  solicitudes,
  loading,
  filtros,
  setFiltros,
  onVerDetalle,
  onAprobar,
  onRechazar,
  getEstadoBadge,
  periodos,
  onConsultar,
}) {
  const safeSolicitudes = Array.isArray(solicitudes) ? solicitudes : [];
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Estados para filtros en cascada
  const [macroregiones, setMacroregiones] = useState([]);
  const [redes, setRedes] = useState([]);
  const [ipressList, setIpressList] = useState([]);
  const [loadingFiltros, setLoadingFiltros] = useState(false);

  // Cargar macroregiones al iniciar
  useEffect(() => {
    cargarMacroregiones();
  }, []);

  // Cargar redes cuando cambia macroregión
  useEffect(() => {
    if (filtros.macroId) {
      cargarRedes(filtros.macroId);
    } else {
      setRedes([]);
      setFiltros(prev => ({ ...prev, redId: "", ipressId: "" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtros.macroId]);

  // Cargar IPRESS cuando cambia red
  useEffect(() => {
    if (filtros.redId) {
      cargarIpress(filtros.redId);
    } else {
      setIpressList([]);
      setFiltros(prev => ({ ...prev, ipressId: "" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtros.redId]);

  const cargarMacroregiones = async () => {
    try {
      setLoadingFiltros(true);
      const data = await filtrosUbicacionService.obtenerMacroregiones();
      setMacroregiones(data);
    } catch (error) {
      console.error("Error al cargar macroregiones:", error);
    } finally {
      setLoadingFiltros(false);
    }
  };

  const cargarRedes = async (macroId) => {
    try {
      setLoadingFiltros(true);
      const data = await filtrosUbicacionService.obtenerRedesPorMacro(macroId);
      setRedes(data);
    } catch (error) {
      console.error("Error al cargar redes:", error);
      setRedes([]);
    } finally {
      setLoadingFiltros(false);
    }
  };

  const cargarIpress = async (redId) => {
    try {
      setLoadingFiltros(true);
      const data = await filtrosUbicacionService.obtenerIpressPorRed(redId);
      setIpressList(data);
    } catch (error) {
      console.error("Error al cargar IPRESS:", error);
      setIpressList([]);
    } finally {
      setLoadingFiltros(false);
    }
  };

  const periodoMap = useMemo(() => {
    const m = new Map();
    (periodos || []).forEach((p) =>
      m.set(Number(p.idPeriodo), p.descripcion ?? p.nombrePeriodo ?? `Periodo ${p.periodo ?? p.idPeriodo}`)
    );
    return m;
  }, [periodos]);

  // Ordenamiento
  const sortedSolicitudes = useMemo(() => {
    if (!sortConfig.key) return safeSolicitudes;

    return [...safeSolicitudes].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      if (sortConfig.key === 'nombreIpress') {
        aVal = (aVal || '').toLowerCase();
        bVal = (bVal || '').toLowerCase();
      }

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [safeSolicitudes, sortConfig]);

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc',
    });
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return null;
    return sortConfig.direction === 'asc' ? 
      <ChevronUp className="w-4 h-4 inline ml-1" /> : 
      <ChevronDown className="w-4 h-4 inline ml-1" />;
  };

  // Obtener filtros activos para mostrar como chips
  const filtrosActivos = [
    filtros.estado && filtros.estado !== 'TODAS' && { key: 'estado', label: filtros.estado },
    filtros.periodo && { key: 'periodo', label: periodos?.find(p => p.idPeriodo == filtros.periodo)?.descripcion || `Período ${filtros.periodo}` },
    filtros.macroId && { key: 'macro', label: macroregiones?.find(m => m.id == filtros.macroId)?.descripcion },
    filtros.redId && { key: 'red', label: redes?.find(r => r.id == filtros.redId)?.descripcion },
    filtros.ipressId && { key: 'ipress', label: ipressList?.find(i => i.id == filtros.ipressId)?.descripcion },
  ].filter(Boolean);

  return (
    <div className="space-y-2">
      {/* Header Compacto - Fusionado */}
      <div className="bg-gradient-to-r from-[#1e40af] to-[#2563eb] rounded-lg shadow-sm p-3">
        <h2 className="text-lg font-bold text-white">Mis Solicitudes de Turnos</h2>
      </div>

      {/* Buscador Destacado */}
      <div className="bg-white rounded-lg shadow-sm border-2 border-blue-400 p-3">
        <div className="flex gap-2 items-center mb-2">
          <Search className="w-4 h-4 text-blue-600" />
          <input
            type="text"
            placeholder="🔍 Buscar IPRESS específica..."
            value={filtros.busqueda || ''}
            onChange={(e) => setFiltros({ ...filtros, busqueda: e.target.value })}
            className="flex-1 px-3 py-2 text-sm border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-blue-50"
          />
        </div>

        {/* Filtros Activos como Chips */}
        {filtrosActivos.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
            {filtrosActivos.map((filtro) => (
              <span
                key={filtro.key}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-300"
              >
                {filtro.label}
                <button
                  onClick={() => {
                    if (filtro.key === 'estado') {
                      setFiltros({ ...filtros, estado: 'TODAS' });
                    } else if (filtro.key === 'periodo') {
                      setFiltros({ ...filtros, periodo: '' });
                    } else if (filtro.key === 'macro') {
                      setFiltros({ ...filtros, macroId: '', redId: '', ipressId: '' });
                    } else if (filtro.key === 'red') {
                      setFiltros({ ...filtros, redId: '', ipressId: '' });
                    } else if (filtro.key === 'ipress') {
                      setFiltros({ ...filtros, ipressId: '' });
                    }
                  }}
                  className="hover:text-blue-900 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <button
              onClick={() => {
                setFiltros({
                  estado: 'TODAS',
                  periodo: '',
                  macroId: '',
                  redId: '',
                  ipressId: '',
                  busqueda: ''
                });
              }}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium ml-auto"
            >
              Limpiar todos
            </button>
          </div>
        )}
      </div>

      {/* Filtros Compactos */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-2">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              Estado
            </label>
            <select
              value={filtros.estado}
              onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
              className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="TODAS">Todas</option>
              <option value="INICIADO">INICIADO</option>
              <option value="ENVIADO">ENVIADO</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              <Calendar className="w-3 h-3 inline mr-1" />
              Período
            </label>
            <select
              value={filtros.periodo}
              onChange={(e) => setFiltros({ ...filtros, periodo: e.target.value })}
              className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos</option>
              {(periodos || []).map((p) => (
                <option key={p.idPeriodo} value={p.idPeriodo}>
                  {p.descripcion ?? p.nombrePeriodo ?? `Periodo ${p.periodo ?? p.idPeriodo}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              <MapPin className="w-3 h-3 inline mr-1" />
              Macroregión
            </label>
            <select
              value={filtros.macroId || ""}
              onChange={(e) => setFiltros({ ...filtros, macroId: e.target.value, redId: "", ipressId: "" })}
              disabled={loadingFiltros}
              className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            >
              <option value="">Todas</option>
              {macroregiones.map((macro) => (
                <option key={macro.id} value={macro.id}>
                  {macro.descripcion}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              <Building2 className="w-3 h-3 inline mr-1" />
              Red
            </label>
            <select
              value={filtros.redId || ""}
              onChange={(e) => setFiltros({ ...filtros, redId: e.target.value, ipressId: "" })}
              disabled={!filtros.macroId || loadingFiltros}
              className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            >
              <option value="">Todas</option>
              {redes.map((red) => (
                <option key={red.id} value={red.id}>
                  {red.codigo} - {red.descripcion}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">
              <Building2 className="w-3 h-3 inline mr-1" />
              IPRESS
            </label>
            <select
              value={filtros.ipressId || ""}
              onChange={(e) => setFiltros({ ...filtros, ipressId: e.target.value })}
              disabled={!filtros.redId || loadingFiltros}
              className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            >
              <option value="">Todas</option>
              {ipressList.map((ipress) => (
                <option key={ipress.id} value={ipress.id}>
                  {ipress.codigo} - {ipress.descripcion}
                </option>
              ))}
            </select>
          </div>
        </div>

      </div>

      {/* Tabla compacta */}
      {loading ? (
        <div className="flex items-center justify-center py-12 bg-white rounded-lg">
          <div className="text-center">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-3" />
            <p className="text-sm text-gray-600">Cargando solicitudes...</p>
          </div>
        </div>
      ) : safeSolicitudes.length === 0 ? (
        <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
          <FileText className="w-16 h-16 mx-auto mb-3 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No se encontraron solicitudes</h3>
          <p className="text-sm text-gray-500">Ajuste los filtros o espere a que las IPRESS envíen solicitudes</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
              <p className="text-xs text-gray-600">
                💡 Para descargar los datos de especialidades de una IPRESS, haz clic en el icono para abrir el detalle, donde podrás descargar la información completa.
              </p>
            </div>
            <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-[#1e40af] to-[#2563eb]">
                <tr>
                  <th
                    className="px-3 py-2.5 text-left text-xs font-bold text-white cursor-pointer hover:bg-blue-700/50"
                    onClick={() => handleSort('nombreIpress')}
                  >
                    IPRESS <SortIcon columnKey="nombreIpress" />
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-bold text-white">
                    Periodo
                  </th>
                  <th 
                    className="px-3 py-2.5 text-center text-xs font-bold text-white cursor-pointer hover:bg-blue-700/50"
                    onClick={() => handleSort('estado')}
                  >
                    Estado <SortIcon columnKey="estado" />
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-bold text-white">
                    Fecha Envío
                  </th>
                  <th className="px-3 py-2.5 text-center text-xs font-bold text-white">
                    Ver Detalle
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedSolicitudes.map((s) => {
                  const periodoLabel = periodoMap.get(Number(s.idPeriodo)) ?? `Periodo ${s.idPeriodo}`;

                  return (
                    <tr
                      key={s.idSolicitud}
                      className="hover:bg-blue-50 transition-colors cursor-pointer border-b border-gray-200"
                      onClick={() => onVerDetalle(s)}
                    >
                      <td className="px-3 py-2.5">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{s.nombreIpress}</div>
                          {s.codIpress && (
                            <div className="text-xs text-gray-500">Cód: {s.codIpress}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-sm text-gray-700">
                        {periodoLabel}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span className={`inline-block px-2 py-1 rounded-md text-xs font-semibold border ${getEstadoBadge(s.estado)}`}>
                          {s.estado}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-xs text-gray-600">
                        {fmtDateTime(s.fechaEnvio)}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onVerDetalle(s);
                          }}
                          className="inline-flex items-center justify-center p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                          title="Ver detalle de solicitud"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>

            {/* Footer con contador */}
            <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
              <p className="text-xs text-gray-600">
                Mostrando <span className="font-semibold">{sortedSolicitudes.length}</span> solicitud{sortedSolicitudes.length !== 1 ? 'es' : ''}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

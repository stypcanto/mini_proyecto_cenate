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
import ipressService from "../../../../../services/ipressService";

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
  const [ipressUbicacionMap, setIpressUbicacionMap] = useState(new Map()); // Mapa de IPRESS -> {redId, macroId, redNombre, macroNombre}
  const [loadingFiltros, setLoadingFiltros] = useState(false);
  const [loadingUbicacionMap, setLoadingUbicacionMap] = useState(true); // Para mostrar loader mientras carga el mapa

  // Cargar IPRESS para mapear información de ubicación
  useEffect(() => {
    cargarIpressYMapear();
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

  const cargarIpressYMapear = async () => {
    setLoadingUbicacionMap(true);
    try {
      // Cargar todas las IPRESS
      const allIpress = await ipressService.obtenerTodas();

      // Cargar macroregiones para lookup de nombres
      const macrosData = await filtrosUbicacionService.obtenerMacroregiones();
      const macrosMap = new Map(macrosData.map(m => [m.id, m.descripcion]));

      // Cargar redes de cada macrorregión - guardamos el macroId con cada red
      let redesData = [];
      for (const macro of macrosData) {
        try {
          const redesMacro = await filtrosUbicacionService.obtenerRedesPorMacro(macro.id);
          // Añadir el macroId a cada red para posterior lookup
          const redesConMacro = (redesMacro || []).map(red => ({
            ...red,
            macroId: macro.id,
            macroNombre: macro.descripcion
          }));
          redesData.push(...redesConMacro);
        } catch (redError) {
          console.error("❌ Error al cargar redes para", macro.descripcion, ":", redError);
        }
      }

      // Crear mapa: redId -> macroNombre para lookup rápido
      const redMacroMap = new Map();
      redesData.forEach((red) => {
        redMacroMap.set(red.id, red.macroNombre || '—');
      });

      // Crear mapa: nombreIpress -> {redNombre, macroNombre}
      const map = new Map();

      (allIpress || []).forEach((ipress) => {
        // Buscar nombre de Red - campo: red.descRed
        const redNombre = ipress.red?.descRed || ipress.red?.descripcion || '—';

        // Obtener macrorregión desde el mapa de red->macro
        let macroNombre = '—';
        if (ipress.red?.id && redMacroMap.has(ipress.red.id)) {
          macroNombre = redMacroMap.get(ipress.red.id);
        } else if (ipress.idRed && redMacroMap.has(ipress.idRed)) {
          macroNombre = redMacroMap.get(ipress.idRed);
        }

        // Usar nombreIpress (descIpress) como key para coincidencia con solicitudes
        const nombreKey = ipress.descIpress || ipress.nombreIpress || ipress.nombre;
        if (nombreKey) {
          map.set(nombreKey, { redNombre, macroNombre });
        }
      });

      setIpressUbicacionMap(map);
    } catch (error) {
      console.error("❌ Error al cargar IPRESS:", error);
      setIpressUbicacionMap(new Map());
    } finally {
      setLoadingUbicacionMap(false);
    }
  };

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



  // Filtrado
  const filteredSolicitudes = useMemo(() => {
    let filtered = safeSolicitudes;

    // Filtro por Estado
    if (filtros.estado && filtros.estado !== 'TODAS') {
      filtered = filtered.filter(s => s.estado === filtros.estado);
    }

    // Filtro por Período
    if (filtros.periodo) {
      filtered = filtered.filter(s => String(s.idPeriodo) === String(filtros.periodo));
    }

    // Filtro por Macrorregión (usando nombre en lugar de ID)
    if (filtros.macroId) {
      filtered = filtered.filter(s => {
        const ubicacion = ipressUbicacionMap.get(s.nombreIpress);
        return ubicacion?.macroNombre === filtros.macroId;
      });
    }

    // Filtro por Red (usando nombre en lugar de ID)
    if (filtros.redId) {
      filtered = filtered.filter(s => {
        const ubicacion = ipressUbicacionMap.get(s.nombreIpress);
        return ubicacion?.redNombre === filtros.redId;
      });
    }

    // Filtro por IPRESS (usando nombre)
    if (filtros.ipressId) {
      filtered = filtered.filter(s => s.nombreIpress === filtros.ipressId);
    }

    // Filtro por búsqueda
    if (filtros.busqueda) {
      const q = filtros.busqueda.toLowerCase();
      filtered = filtered.filter(s => {
        const nombre = (s.nombreIpress || '').toLowerCase();
        const cod = String(s.codIpress || '').toLowerCase();
        return nombre.includes(q) || cod.includes(q);
      });
    }

    return filtered;
  }, [safeSolicitudes, filtros, ipressUbicacionMap]);

  // Ordenamiento
  const sortedSolicitudes = useMemo(() => {
    if (!sortConfig.key) return filteredSolicitudes;

    return [...filteredSolicitudes].sort((a, b) => {
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
  }, [filteredSolicitudes, sortConfig]);

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

  // Extraer valores únicos que aparecen realmente en la tabla
  const estadosUnicos = useMemo(() => {
    const estados = new Set(safeSolicitudes.map(s => s.estado).filter(Boolean));
    return Array.from(estados).sort();
  }, [safeSolicitudes]);

  const periodosUnicos = useMemo(() => {
    const periodoIds = new Set(safeSolicitudes.map(s => String(s.idPeriodo)).filter(Boolean));
    return Array.from(periodoIds).map(id => {
      const periodo = periodos?.find(p => p.idPeriodo == id);
      return { id, descripcion: periodo?.descripcion || `Período ${id}` };
    });
  }, [safeSolicitudes, periodos]);

  // Macrorregiones únicas filtrando por Estado y Período
  const macrorregionesUnicos = useMemo(() => {
    let filtered = safeSolicitudes;

    if (filtros.estado && filtros.estado !== 'TODAS') {
      filtered = filtered.filter(s => s.estado === filtros.estado);
    }
    if (filtros.periodo) {
      filtered = filtered.filter(s => String(s.idPeriodo) === String(filtros.periodo));
    }

    const unicos = new Map();
    filtered.forEach(s => {
      const ubicacion = ipressUbicacionMap.get(s.nombreIpress);
      if (ubicacion?.macroNombre) {
        unicos.set(ubicacion.macroNombre, ubicacion.macroNombre);
      }
    });
    return Array.from(unicos.values()).sort();
  }, [safeSolicitudes, filtros, ipressUbicacionMap]);

  // Redes únicas filtrando por Estado, Período y Macrorregión
  const redesUnicos = useMemo(() => {
    let filtered = safeSolicitudes;

    if (filtros.estado && filtros.estado !== 'TODAS') {
      filtered = filtered.filter(s => s.estado === filtros.estado);
    }
    if (filtros.periodo) {
      filtered = filtered.filter(s => String(s.idPeriodo) === String(filtros.periodo));
    }
    if (filtros.macroId) {
      filtered = filtered.filter(s => {
        const ubicacion = ipressUbicacionMap.get(s.nombreIpress);
        return ubicacion?.macroNombre === filtros.macroId;
      });
    }

    const unicos = new Map();
    filtered.forEach(s => {
      const ubicacion = ipressUbicacionMap.get(s.nombreIpress);
      if (ubicacion?.redNombre) {
        unicos.set(ubicacion.redNombre, ubicacion.redNombre);
      }
    });
    return Array.from(unicos.values()).sort();
  }, [safeSolicitudes, filtros, ipressUbicacionMap]);

  // IPRESS únicos filtrando primero por los otros filtros aplicados
  const ipressUnicos = useMemo(() => {
    let filtered = safeSolicitudes;

    // Aplicar todos los filtros EXCEPTO ipressId
    if (filtros.estado && filtros.estado !== 'TODAS') {
      filtered = filtered.filter(s => s.estado === filtros.estado);
    }
    if (filtros.periodo) {
      filtered = filtered.filter(s => String(s.idPeriodo) === String(filtros.periodo));
    }
    if (filtros.macroId) {
      filtered = filtered.filter(s => {
        const ubicacion = ipressUbicacionMap.get(s.nombreIpress);
        return ubicacion?.macroNombre === filtros.macroId;
      });
    }
    if (filtros.redId) {
      filtered = filtered.filter(s => {
        const ubicacion = ipressUbicacionMap.get(s.nombreIpress);
        return ubicacion?.redNombre === filtros.redId;
      });
    }

    const unicos = new Set(filtered.map(s => s.nombreIpress).filter(Boolean));
    return Array.from(unicos).sort();
  }, [safeSolicitudes, filtros, ipressUbicacionMap]);

  // Obtener filtros activos para mostrar como chips
  const filtrosActivos = [
    filtros.estado && filtros.estado !== 'TODAS' && { key: 'estado', label: filtros.estado },
    filtros.periodo && { key: 'periodo', label: periodosUnicos?.find(p => p.id == filtros.periodo)?.descripcion || `Período ${filtros.periodo}` },
    filtros.macroId && { key: 'macro', label: filtros.macroId },
    filtros.redId && { key: 'red', label: filtros.redId },
    filtros.ipressId && { key: 'ipress', label: filtros.ipressId },
  ].filter(Boolean);

  return (
    <div className="space-y-2">
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
              {estadosUnicos.map((estado) => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
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
              {periodosUnicos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.descripcion}
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
              className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todas</option>
              {macrorregionesUnicos.map((macro) => (
                <option key={macro} value={macro}>
                  {macro}
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
              className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todas</option>
              {redesUnicos.map((red) => (
                <option key={red} value={red}>
                  {red}
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
              className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todas</option>
              {ipressUnicos.map((ipress) => (
                <option key={ipress} value={ipress}>
                  {ipress}
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
                  <th className="px-3 py-2.5 text-left text-xs font-bold text-white">
                    Macrorregión
                  </th>
                  <th className="px-3 py-2.5 text-left text-xs font-bold text-white">
                    Red
                  </th>
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

                  // Obtener información de ubicación desde el mapa de IPRESS (buscar por nombre)
                  const ipressUbicacion = ipressUbicacionMap.get(s.nombreIpress);
                  const macroregionLabel = ipressUbicacion?.macroNombre;
                  const redLabel = ipressUbicacion?.redNombre;

                  return (
                    <tr
                      key={s.idSolicitud}
                      className="hover:bg-blue-50 transition-colors cursor-pointer border-b border-gray-200"
                      onClick={() => onVerDetalle(s)}
                    >
                      <td className="px-3 py-2.5 text-sm text-gray-700 uppercase">
                        {macroregionLabel ? (
                          macroregionLabel
                        ) : loadingUbicacionMap ? (
                          <Loader2 className="w-4 h-4 animate-spin text-blue-500 inline-block" />
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-sm text-gray-700 uppercase">
                        {redLabel ? (
                          redLabel
                        ) : loadingUbicacionMap ? (
                          <Loader2 className="w-4 h-4 animate-spin text-blue-500 inline-block" />
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-sm text-gray-700 uppercase">
                        <div>
                          <div>{s.nombreIpress}</div>
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

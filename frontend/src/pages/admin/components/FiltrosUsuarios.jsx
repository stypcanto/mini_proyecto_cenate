// ========================================================================
// 🔍 FiltrosUsuarios.jsx - Filtros avanzados para gestión de usuarios
// ========================================================================

import React, { useState } from "react";
import {
  Search,
  Filter,
  X,
  Users,
  Briefcase,
  Calendar,
  Building2,
  ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TIPOS_PERSONAL = [
  { value: "TODOS", label: "Todos" },
  { value: "CENATE", label: "CENATE" },
  { value: "EXTERNO", label: "Externo" }
];

const ESTADOS = [
  { value: "TODOS", label: "Todos" },
  { value: "ACTIVO", label: "Activo" },
  { value: "INACTIVO", label: "Inactivo" }
];

const MESES = [
  { value: 1, label: "Enero" },
  { value: 2, label: "Febrero" },
  { value: 3, label: "Marzo" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Mayo" },
  { value: 6, label: "Junio" },
  { value: 7, label: "Julio" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Septiembre" },
  { value: 10, label: "Octubre" },
  { value: 11, label: "Noviembre" },
  { value: 12, label: "Diciembre" }
];

const ROLES_COMUNES = [
  "SUPERADMIN",
  "ADMIN",
  "MEDICO_CNT",
  "ENFERMERO_CNT",
  "ESPECIALISTA_TI",
  "INSTITUCION_EX"
];

export default function FiltrosUsuarios({ onFiltrar, rolesDisponibles = [], personalTotal = [] }) {
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [filtros, setFiltros] = useState({
    busqueda: "",
    tipoPersonal: "TODOS",
    rol: "TODOS",
    estado: "TODOS",
    mes: "",
    profesion: "",
    especialidad: "",
    area: "",
    ipress: ""
  });

  // ======================================================
  // 📝 Manejar cambios en filtros
  // ======================================================
  const handleChange = (campo, valor) => {
    const nuevosFiltros = { ...filtros, [campo]: valor };
    setFiltros(nuevosFiltros);
    onFiltrar(nuevosFiltros);
  };

  // ======================================================
  // 🔄 Limpiar filtros
  // ======================================================
  const limpiarFiltros = () => {
    const filtrosLimpios = {
      busqueda: "",
      tipoPersonal: "TODOS",
      rol: "TODOS",
      estado: "TODOS",
      mes: "",
      profesion: "",
      especialidad: "",
      area: "",
      ipress: ""
    };
    setFiltros(filtrosLimpios);
    onFiltrar(filtrosLimpios);
  };

  // ======================================================
  // 📊 Extraer profesiones únicas del personal
  // ======================================================
  const profesionesUnicas = React.useMemo(() => {
    const profesiones = new Set();
    personalTotal.forEach(p => {
      if (p.profesion) profesiones.add(p.profesion);
    });
    return Array.from(profesiones).sort();
  }, [personalTotal]);

  // ======================================================
  // 📊 Extraer áreas únicas
  // ======================================================
  const areasUnicas = React.useMemo(() => {
    const areas = new Set();
    personalTotal.forEach(p => {
      if (p.area) areas.add(p.area);
    });
    return Array.from(areas).sort();
  }, [personalTotal]);

  // ======================================================
  // 📊 Contar filtros activos
  // ======================================================
  const filtrosActivos = Object.values(filtros).filter(v =>
    v && v !== "TODOS" && v !== ""
  ).length;

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
      {/* Barra principal de búsqueda */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Búsqueda general */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, usuario o documento..."
              value={filtros.busqueda}
              onChange={(e) => handleChange("busqueda", e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Botón de filtros avanzados */}
          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
              mostrarFiltros
                ? "bg-teal-600 text-white shadow-lg"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Filter className="w-5 h-5" />
            <span>Filtros</span>
            {filtrosActivos > 0 && (
              <span className="px-2 py-0.5 bg-white text-teal-600 rounded-full text-xs font-bold">
                {filtrosActivos}
              </span>
            )}
          </button>

          {/* Limpiar filtros */}
          {filtrosActivos > 0 && (
            <button
              onClick={limpiarFiltros}
              className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-medium transition-all"
            >
              <X className="w-5 h-5" />
              <span>Limpiar</span>
            </button>
          )}
        </div>
      </div>

      {/* Panel de filtros avanzados */}
      <AnimatePresence>
        {mostrarFiltros && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-6 bg-gray-50 border-t border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Filtro: Tipo de Personal */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Users className="w-4 h-4 text-teal-600" />
                    Tipo Personal
                  </label>
                  <select
                    value={filtros.tipoPersonal}
                    onChange={(e) => handleChange("tipoPersonal", e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  >
                    {TIPOS_PERSONAL.map(tipo => (
                      <option key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filtro: Rol */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    Rol
                  </label>
                  <select
                    value={filtros.rol}
                    onChange={(e) => handleChange("rol", e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="TODOS">Todos los roles</option>
                    {ROLES_COMUNES.map(rol => (
                      <option key={rol} value={rol}>
                        {rol.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filtro: Estado */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Filter className="w-4 h-4 text-purple-600" />
                    Estado
                  </label>
                  <select
                    value={filtros.estado}
                    onChange={(e) => handleChange("estado", e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  >
                    {ESTADOS.map(estado => (
                      <option key={estado.value} value={estado.value}>
                        {estado.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filtro: Mes de Cumpleaños */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 text-pink-600" />
                    Cumpleaños
                  </label>
                  <select
                    value={filtros.mes}
                    onChange={(e) => handleChange("mes", e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                  >
                    <option value="">Cualquier mes</option>
                    {MESES.map(mes => (
                      <option key={mes.value} value={mes.value}>
                        {mes.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filtro: Profesión (solo si hay datos) */}
                {profesionesUnicas.length > 0 && (
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <Briefcase className="w-4 h-4 text-orange-600" />
                      Profesión
                    </label>
                    <select
                      value={filtros.profesion}
                      onChange={(e) => handleChange("profesion", e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    >
                      <option value="">Todas</option>
                      {profesionesUnicas.map(prof => (
                        <option key={prof} value={prof}>
                          {prof}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Filtro: Área (solo si hay datos) */}
                {areasUnicas.length > 0 && (
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                      <Building2 className="w-4 h-4 text-indigo-600" />
                      Área
                    </label>
                    <select
                      value={filtros.area}
                      onChange={(e) => handleChange("area", e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    >
                      <option value="">Todas</option>
                      {areasUnicas.map(area => (
                        <option key={area} value={area}>
                          {area}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Filtro: IPRESS */}
                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Building2 className="w-4 h-4 text-green-600" />
                    IPRESS
                  </label>
                  <input
                    type="text"
                    placeholder="Buscar por institución..."
                    value={filtros.ipress}
                    onChange={(e) => handleChange("ipress", e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ========================================================================
// 🔧 FiltrosAvanzados.jsx - Panel de filtros para usuarios CENATE
// ========================================================================

import React, { useMemo } from "react";
import { Filter, X } from "lucide-react";
import { motion } from "framer-motion";

export default function FiltrosAvanzados({ filtros, setFiltros, usuarios }) {
  // ======================================================
  // 📊 Extraer valores únicos de usuarios
  // ======================================================

  const valoresUnicos = useMemo(() => {
    const profesiones = new Set();
    const especialidades = new Set();
    const areas = new Set();
    const roles = new Set();
    const estados = new Set();

    usuarios.forEach((u) => {
      if (u.profesion) profesiones.add(u.profesion);
      if (u.area) areas.add(u.area);
      if (u.estado_usuario) {
        const estado = u.estado_usuario === "A" ? "Activo" : u.estado_usuario;
        estados.add(estado);
      }
      if (Array.isArray(u.especialidades)) {
        u.especialidades.forEach((e) => especialidades.add(e));
      }
      if (Array.isArray(u.roles)) {
        u.roles.forEach((r) => roles.add(r));
      }
    });

    return {
      profesiones: Array.from(profesiones).sort(),
      especialidades: Array.from(especialidades).sort(),
      areas: Array.from(areas).sort(),
      roles: Array.from(roles).sort(),
      estados: Array.from(estados).sort(),
    };
  }, [usuarios]);

  // ======================================================
  // 🎛️ Componente Select Personalizado
  // ======================================================

  const FiltroSelect = ({ label, name, options, value, onChange }) => (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-gray-700 bg-white"
      >
        <option value="">— Todos —</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );

  const handleChange = (nombre, valor) => {
    setFiltros((prev) => ({ ...prev, [nombre]: valor }));
  };

  const limpiarFiltro = (nombre) => {
    setFiltros((prev) => ({ ...prev, [nombre]: "" }));
  };

  const limpiarTodos = () => {
    setFiltros({
      profesion: "",
      especialidad: "",
      area: "",
      rol: "",
      mesCumpleanos: "",
      estado: "",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="mt-6 p-6 bg-gray-50 border border-gray-200 rounded-xl space-y-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <Filter className="w-5 h-5 text-teal-600" />
          Filtros Avanzados
        </h3>
        <button
          onClick={limpiarTodos}
          className="text-sm px-3 py-1 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg font-medium transition-all"
        >
          Limpiar todos
        </button>
      </div>

      {/* Grid de filtros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Profesión */}
        <FiltroSelect
          label="🎓 Profesión"
          name="profesion"
          options={valoresUnicos.profesiones}
          value={filtros.profesion}
          onChange={handleChange}
        />

        {/* Especialidad */}
        <FiltroSelect
          label="🏥 Especialidad"
          name="especialidad"
          options={valoresUnicos.especialidades}
          value={filtros.especialidad}
          onChange={handleChange}
        />

        {/* Área */}
        <FiltroSelect
          label="🏢 Área Laboral"
          name="area"
          options={valoresUnicos.areas}
          value={filtros.area}
          onChange={handleChange}
        />

        {/* Rol */}
        <FiltroSelect
          label="🔐 Rol"
          name="rol"
          options={valoresUnicos.roles}
          value={filtros.rol}
          onChange={handleChange}
        />

        {/* Mes de Cumpleaños */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            🎂 Mes de Cumpleaños
          </label>
          <select
            value={filtros.mesCumpleanos}
            onChange={(e) => handleChange("mesCumpleanos", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-gray-700 bg-white"
          >
            <option value="">— Todos —</option>
            <option value="1">Enero</option>
            <option value="2">Febrero</option>
            <option value="3">Marzo</option>
            <option value="4">Abril</option>
            <option value="5">Mayo</option>
            <option value="6">Junio</option>
            <option value="7">Julio</option>
            <option value="8">Agosto</option>
            <option value="9">Septiembre</option>
            <option value="10">Octubre</option>
            <option value="11">Noviembre</option>
            <option value="12">Diciembre</option>
          </select>
        </div>

        {/* Estado */}
        <FiltroSelect
          label="📊 Estado"
          name="estado"
          options={valoresUnicos.estados}
          value={filtros.estado}
          onChange={handleChange}
        />
      </div>

      {/* Resumen de filtros activos */}
      {Object.values(filtros).some((v) => v !== "") && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-2 pt-4 border-t border-gray-300"
        >
          {filtros.profesion && (
            <FilterBadge
              label={`Profesión: ${filtros.profesion}`}
              onClear={() => limpiarFiltro("profesion")}
            />
          )}
          {filtros.especialidad && (
            <FilterBadge
              label={`Especialidad: ${filtros.especialidad}`}
              onClear={() => limpiarFiltro("especialidad")}
            />
          )}
          {filtros.area && (
            <FilterBadge
              label={`Área: ${filtros.area}`}
              onClear={() => limpiarFiltro("area")}
            />
          )}
          {filtros.rol && (
            <FilterBadge
              label={`Rol: ${filtros.rol}`}
              onClear={() => limpiarFiltro("rol")}
            />
          )}
          {filtros.mesCumpleanos && (
            <FilterBadge
              label={`Mes: ${filtros.mesCumpleanos}`}
              onClear={() => limpiarFiltro("mesCumpleanos")}
            />
          )}
          {filtros.estado && (
            <FilterBadge
              label={`Estado: ${filtros.estado}`}
              onClear={() => limpiarFiltro("estado")}
            />
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

// ========================================================================
// 🧩 Componente Badge de Filtro
// ========================================================================

function FilterBadge({ label, onClear }) {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="inline-flex items-center gap-2 px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-semibold"
    >
      {label}
      <button
        onClick={onClear}
        className="hover:bg-teal-200 rounded-full p-0.5 transition-all"
      >
        <X className="w-3 h-3" />
      </button>
    </motion.div>
  );
}

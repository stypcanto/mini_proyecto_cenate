import React from 'react';
import { Search, ChevronDown, RotateCcw } from 'lucide-react';

/**
 * 🔍 Componente Reutilizable: ListHeader
 *
 * Encabezado de lista con búsqueda y filtros siguiendo Design System CENATE v1.0.0
 *
 * Props:
 * - title: string - Título de la sección (ej: "Lista de Pacientes")
 * - searchPlaceholder: string - Placeholder para la búsqueda
 * - searchValue: string - Valor actual del búsqueda
 * - onSearchChange: function - Callback cuando cambia la búsqueda
 * - filters: array - Array de objetos filtro {name, value, onChange, options: [{label, value}]}
 * - onClearFilters: function - Callback para limpiar todos los filtros
 *
 * Ejemplo:
 * <ListHeader
 *   title="Lista de Pacientes"
 *   searchPlaceholder="Buscar paciente, DNI o IPRESS..."
 *   searchValue={search}
 *   onSearchChange={(e) => setSearch(e.target.value)}
 *   filters={[...]}
 *   onClearFilters={() => {...}}
 * />
 */
export default function ListHeader({
  title = "Lista",
  searchPlaceholder = "Buscar...",
  searchValue = "",
  onSearchChange = () => {},
  filters = [],
  onClearFilters = () => {}
}) {
  return (
    <div className="p-3 border-b border-gray-200 bg-gradient-to-b from-gray-50 to-white">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold text-gray-800">{title}</h2>
      </div>

      {/* Búsqueda */}
      <div className="mb-2">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={onSearchChange}
            className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs font-medium transition-all"
          />
        </div>
      </div>

      {/* Filtros */}
      <div className="space-y-2">
        {/* Primera fila: Bolsas + Botón Limpiar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div className="md:col-span-3 relative">
            <label className="block text-xs font-semibold text-gray-600 mb-1">{filters[0]?.name}</label>
            <div className="relative">
              <select
                value={filters[0]?.value}
                onChange={filters[0]?.onChange}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs appearance-none cursor-pointer bg-white font-medium transition-all hover:border-gray-400"
              >
                {filters[0]?.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-2 top-2.5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Botón Limpiar Filtros */}
          <div className="flex items-end">
            <button
              onClick={onClearFilters}
              className="w-full px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium flex items-center justify-center gap-1.5 transition-all shadow-md hover:shadow-lg text-xs"
            >
              <RotateCcw size={16} />
              Limpiar
            </button>
          </div>
        </div>

        {/* Segunda fila: Macrorregión | Redes | IPRESS (siempre juntas) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {filters.slice(1, 4).map((filter, index) => (
            <div key={index + 1} className="relative">
              <label className="block text-xs font-semibold text-gray-600 mb-1">{filter.name}</label>
              <div className="relative">
                <select
                  value={filter.value}
                  onChange={filter.onChange}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs appearance-none cursor-pointer bg-white font-medium transition-all hover:border-gray-400"
                >
                  {filter.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-2 top-2.5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          ))}
        </div>

        {/* Tercera fila: Especialidades | Tipo de Cita */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {filters.slice(4).map((filter, index) => (
            <div key={index + 4} className="relative">
              <label className="block text-xs font-semibold text-gray-600 mb-1">{filter.name}</label>
              <div className="relative">
                <select
                  value={filter.value}
                  onChange={filter.onChange}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs appearance-none cursor-pointer bg-white font-medium transition-all hover:border-gray-400"
                >
                  {filter.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-2 top-2.5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

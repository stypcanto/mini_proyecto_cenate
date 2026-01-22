import React from 'react';
import { Search, ChevronDown } from 'lucide-react';

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
 *
 * Ejemplo:
 * <ListHeader
 *   title="Lista de Pacientes"
 *   searchPlaceholder="Buscar paciente, DNI o IPRESS..."
 *   searchValue={search}
 *   onSearchChange={(e) => setSearch(e.target.value)}
 *   filters={[
 *     {
 *       name: "Todas las bolsas",
 *       value: filtroBolsa,
 *       onChange: (e) => setFiltroBolsa(e.target.value),
 *       options: [{label: "Todas las bolsas", value: "todas"}, ...]
 *     }
 *   ]}
 * />
 */
export default function ListHeader({
  title = "Lista",
  searchPlaceholder = "Buscar...",
  searchValue = "",
  onSearchChange = () => {},
  filters = []
}) {
  return (
    <div className="p-4 border-b border-gray-200">
      <h2 className="text-lg font-bold text-gray-800 mb-3">{title}</h2>

      {/* Búsqueda y Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {/* Búsqueda */}
        <div className="relative md:col-span-2">
          <Search size={18} className="absolute left-4 top-3 text-gray-400" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={onSearchChange}
            className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0D5BA9] text-sm"
          />
        </div>

        {/* Filtros Dinámicos */}
        {filters.map((filter, index) => (
          <div key={index} className="relative">
            <select
              value={filter.value}
              onChange={filter.onChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0D5BA9] text-sm appearance-none cursor-pointer bg-white"
            >
              {filter.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown size={18} className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" />
          </div>
        ))}
      </div>
    </div>
  );
}

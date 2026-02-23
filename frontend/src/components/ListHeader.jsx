import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, RotateCcw, Check, X } from 'lucide-react';

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
 * - filters: array - Array de objetos filtro {name, value, onChange, options: [{label, value}], multiSelect?: boolean, onMultiChange?: (values) => void}
 * - onClearFilters: function - Callback para limpiar todos los filtros
 */

function SearchableSelect({ filter }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchText('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const allOptions = filter.options || [];
  const filtered = searchText.trim() === ''
    ? allOptions
    : allOptions.filter(o =>
        o.label.toLowerCase().includes(searchText.toLowerCase())
      );

  const selectedOption = allOptions.find(o => o.value === filter.value);
  const isFiltered = filter.value && filter.value !== 'todas';

  const handleSelect = (value) => {
    filter.onChange({ target: { value } });
    setIsOpen(false);
    setSearchText('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    filter.onChange({ target: { value: 'todas' } });
    setSearchText('');
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs text-left cursor-pointer bg-white font-medium transition-all hover:border-gray-400 flex items-center justify-between gap-1 ${
          isFiltered ? 'border-blue-400 text-blue-700' : 'border-gray-300 text-gray-700'
        }`}
      >
        <span className="truncate flex-1">
          {selectedOption ? selectedOption.label : allOptions[0]?.label || 'Todas'}
        </span>
        <div className="flex items-center gap-1 flex-shrink-0">
          {isFiltered && (
            <span
              onClick={handleClear}
              className="text-blue-400 hover:text-blue-600 cursor-pointer"
            >
              <X size={12} />
            </span>
          )}
          <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-300 rounded-lg shadow-lg">
          {/* Input de búsqueda */}
          <div className="p-2 border-b border-gray-200">
            <div className="relative">
              <Search size={13} className="absolute left-2 top-2 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Escribir para filtrar..."
                className="w-full pl-7 pr-3 py-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
          </div>
          {/* Lista de opciones */}
          <div className="max-h-52 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-xs text-gray-400 italic">Sin resultados</div>
            ) : (
              filtered.map((option) => (
                <div
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`px-3 py-1.5 text-xs cursor-pointer hover:bg-blue-50 truncate ${
                    option.value === filter.value ? 'bg-blue-100 text-blue-700 font-semibold' : 'text-gray-700'
                  }`}
                >
                  {option.label}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MultiSelectDropdown({ filter }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedValues = filter.value || [];
  const allOptions = filter.options || [];

  const hasNoneSelected = selectedValues.length === 1 && selectedValues[0] === '__NONE__';
  const realSelectedCount = hasNoneSelected ? 0 : selectedValues.length;
  const displayText = selectedValues.length === 0
    ? `Todas las bolsas (${allOptions.length})`
    : hasNoneSelected
      ? '0 bolsas seleccionadas'
      : `${realSelectedCount} bolsa${realSelectedCount > 1 ? 's' : ''} seleccionada${realSelectedCount > 1 ? 's' : ''}`;

  const toggleOption = (optionValue) => {
    // Si está en modo "ninguna" (__NONE__), seleccionar solo esta
    if (hasNoneSelected) {
      filter.onMultiChange([optionValue]);
      return;
    }
    // Si está en modo "todas" (array vacío), cambiar a "todas menos esta"
    if (selectedValues.length === 0) {
      const allExceptThis = allOptions.map(o => o.value).filter(v => v !== optionValue);
      filter.onMultiChange(allExceptThis);
      return;
    }
    const newValues = selectedValues.includes(optionValue)
      ? selectedValues.filter(v => v !== optionValue)
      : [...selectedValues, optionValue];
    // Si selecciona todas, volver a array vacío (= todas)
    if (newValues.length === allOptions.length) {
      filter.onMultiChange([]);
    } else if (newValues.length === 0) {
      filter.onMultiChange(['__NONE__']);
    } else {
      filter.onMultiChange(newValues);
    }
  };

  const selectAll = (e) => {
    e.stopPropagation();
    filter.onMultiChange([]);
  };

  const deselectAll = (e) => {
    e.stopPropagation();
    // Array con un valor imposible para forzar "ninguna coincidencia"
    // Mejor: setear array vacío NO funciona (= todas), usar array con placeholder
    filter.onMultiChange(['__NONE__']);
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs text-left cursor-pointer bg-white font-medium transition-all hover:border-gray-400 flex items-center justify-between"
      >
        <span className={selectedValues.length > 0 ? 'text-blue-700 font-semibold' : 'text-gray-700'}>
          {displayText}
        </span>
        <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border-2 border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {/* Seleccionar/Deseleccionar todas */}
          <div className="sticky top-0 bg-gray-50 border-b border-gray-200 px-3 py-1.5 flex gap-2">
            <button
              type="button"
              onClick={selectAll}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              Todas
            </button>
            <span className="text-gray-300">|</span>
            <button
              type="button"
              onClick={deselectAll}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              Ninguna
            </button>
          </div>

          {allOptions.map((option) => {
            const isSelected = selectedValues.length === 0 || (!hasNoneSelected && selectedValues.includes(option.value));
            return (
              <div
                key={option.value}
                onClick={(e) => { e.stopPropagation(); toggleOption(option.value); }}
                className="flex items-center gap-2 px-3 py-1.5 hover:bg-blue-50 cursor-pointer text-xs select-none"
              >
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'
                }`}>
                  {isSelected && <Check size={10} className="text-white" strokeWidth={3} />}
                </div>
                <span className="font-medium text-gray-700 truncate">{option.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ListHeader({
  title = "Lista",
  searchPlaceholder = "Buscar...",
  searchValue = "",
  onSearchChange = () => {},
  filters = [],
  onClearFilters = () => {}
}) {
  const firstFilter = filters[0];
  const isMultiSelect = firstFilter?.multiSelect === true;

  return (
    <div className="p-3 border-b border-gray-200 bg-gradient-to-b from-gray-50 to-white">
      {title && (
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold text-gray-800">{title}</h2>
        </div>
      )}

      {/* Filtros */}
      <div className="space-y-1.5">
        {/* Primera fila: Búsqueda + Primer filtro (Bolsas) + Botón Limpiar */}
        <div className="flex items-center gap-2">
          {/* Buscador */}
          <div className="relative flex-shrink-0 w-48">
            <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={onSearchChange}
              className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs font-medium transition-all"
            />
          </div>

          {/* Primer filtro */}
          <div className="flex-1 min-w-0">
            {isMultiSelect ? (
              <MultiSelectDropdown filter={firstFilter} />
            ) : (
              <div className="relative">
                <select
                  value={firstFilter?.value}
                  onChange={firstFilter?.onChange}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs appearance-none cursor-pointer bg-white font-medium transition-all hover:border-gray-400"
                >
                  {firstFilter?.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-2 top-2.5 text-gray-400 pointer-events-none" />
              </div>
            )}
          </div>

          {/* Botón Limpiar Filtros */}
          <div className="flex-shrink-0">
            <button
              onClick={onClearFilters}
              className="px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium flex items-center justify-center gap-1.5 transition-all shadow-md hover:shadow-lg text-xs whitespace-nowrap"
            >
              <RotateCcw size={16} />
              Limpiar
            </button>
          </div>
        </div>

        {/* Segunda fila: IPRESS | Estado | Tipo de Cita | Especialidades (4 columnas) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          {filters.slice(1, 5).map((filter, index) => (
            <div key={index + 1} className="relative">
              <label className="block text-xs font-semibold text-gray-600 mb-1">{filter.name}</label>
              {filter.searchable ? (
                <SearchableSelect filter={filter} />
              ) : (
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
              )}
            </div>
          ))}
        </div>

        {/* Tercera fila: Tipo de Cita | Estado | Filtros adicionales */}
        {filters.length > 5 && (
          <div className={`grid grid-cols-1 ${filters.slice(5).length <= 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-2`}>
            {filters.slice(5).map((filter, index) => (
              <div key={index + 5} className="relative">
                <label className="block text-xs font-semibold text-gray-600 mb-1">{filter.name}</label>
                {filter.searchable ? (
                  <SearchableSelect filter={filter} />
                ) : (
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
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

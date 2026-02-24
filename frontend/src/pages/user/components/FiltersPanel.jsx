// src/pages/admin/users/components/FiltersPanel.jsx
import React, { useState, useMemo } from 'react';
import { Search, Filter, ChevronDown, UserPlus, X, Trash2, Download, Upload, LayoutGrid, List, Sparkles, RefreshCw, Building2, Calendar } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const FiltersPanel = ({ filters, setFilters, searchTerm, setSearchTerm, onNewUser, selectedCount = 0, onDeleteSelected, viewMode, setViewMode, roles = [], areas = [], redesList = [], ipressList = [], regimenes = [], profesionesList = [], especialidadesList = [], onRefresh }) => {
  const { user: currentUser } = useAuth();
  const [showFilters, setShowFilters] = useState(false);

  // Verificar si es SUPERADMIN (único que puede eliminar usuarios)
  const esSuperAdmin = currentUser?.roles?.includes('SUPERADMIN');

  const meses = useMemo(() => [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ], []);

  const hasActiveFilters = Object.values(filters).some((v) => v !== '') || searchTerm;

  const limpiarFiltros = () => {
    setFilters({ rol: '', institucion: '', estado: '', mesCumpleanos: '', area: '', red: '', ipress: '', regimen: '', profesion: '', especialidad: '', fechaRegistroDesde: '', fechaRegistroHasta: '' });
    setSearchTerm('');
    // Recargar usuarios con paginación normal después de limpiar filtros
    // Delay de 300ms para asegurar que las refs se actualicen antes de recargar
    if (onRefresh) {
      setTimeout(() => onRefresh(), 300);
    }
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchTerm) count++;
    if (filters.rol) count++;
    if (filters.institucion) count++;
    if (filters.estado) count++;
    if (filters.mesCumpleanos) count++;
    if (filters.area) count++;
    if (filters.red) count++;
    if (filters.ipress) count++;
    if (filters.regimen) count++;
    if (filters.profesion) count++;
    if (filters.especialidad) count++;
    return count;
  }, [filters, searchTerm]);

  // Obtener filtros activos con sus valores para mostrar badges
  const activeFiltersList = useMemo(() => {
    const list = [];
    if (searchTerm) list.push({ key: 'search', label: 'DNI/CE', value: searchTerm });
    if (filters.rol) list.push({ key: 'rol', label: 'Rol', value: filters.rol });
    if (filters.institucion) list.push({ key: 'institucion', label: 'Tipo', value: filters.institucion });
    if (filters.estado) list.push({ key: 'estado', label: 'Estado', value: filters.estado });
    if (filters.mesCumpleanos) list.push({ key: 'mesCumpleanos', label: 'Mes', value: filters.mesCumpleanos });
    if (filters.area) list.push({ key: 'area', label: 'Área', value: filters.area });
    if (filters.red) list.push({ key: 'red', label: 'Red', value: filters.red });
    if (filters.ipress) list.push({ key: 'ipress', label: 'IPRESS', value: filters.ipress });
    if (filters.regimen) list.push({ key: 'regimen', label: 'Régimen', value: filters.regimen });
    if (filters.profesion) list.push({ key: 'profesion', label: 'Profesión', value: filters.profesion });
    if (filters.especialidad) list.push({ key: 'especialidad', label: 'Especialidad', value: filters.especialidad });
    return list;
  }, [filters, searchTerm]);

  const removeFilter = (key) => {
    if (key === 'search') {
      setSearchTerm('');
    } else {
      setFilters({ ...filters, [key]: '' });
    }
  };

  return (
    <div className="w-full px-3 sm:px-4 lg:px-6">
      {/* Toolbar estilo Apple - Minimalista y elegante */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 py-2">
        {/* Botones de acción - Estilo Apple */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onNewUser}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg hover:from-emerald-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-1 transition-all duration-200 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] text-sm font-medium backdrop-blur-sm"
          >
            <UserPlus className="w-4 h-4" strokeWidth={2.5} />
            Nuevo Usuario
          </button>

          {/* Solo SUPERADMIN puede ver el botón de eliminar */}
          {esSuperAdmin && (
            <button
              onClick={onDeleteSelected}
              disabled={selectedCount === 0}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-1 transition-all duration-200 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-sm relative"
            >
              <Trash2 className="w-4 h-4" strokeWidth={2.5} />
              Eliminar
              {selectedCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1.5 bg-white text-red-600 rounded-full text-xs font-bold flex items-center justify-center shadow-lg border-2 border-red-500 animate-pulse">
                  {selectedCount}
                </span>
              )}
            </button>
          )}

          <button
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-1 transition-all duration-200 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] text-sm font-medium"
          >
            <Download className="w-4 h-4" strokeWidth={2.5} />
            Exportar
          </button>

          <button
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-1 transition-all duration-200 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] text-sm font-medium"
          >
            <Upload className="w-4 h-4" strokeWidth={2.5} />
            Importar
          </button>

          <button
            onClick={onRefresh}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-1 transition-all duration-200 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] text-sm font-medium backdrop-blur-sm"
            title="Actualizar tabla de usuarios"
          >
            <RefreshCw className="w-4 h-4" strokeWidth={2.5} />
            Actualizar
          </button>
        </div>

        {/* Controles de vista - Estilo Apple */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5 bg-gray-100/80 backdrop-blur-sm rounded-lg p-1 border border-gray-200/50 shadow-inner">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-md transition-all duration-200 ${
                viewMode === 'table'
                  ? 'bg-white text-blue-600 shadow-sm scale-105'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
              }`}
              title="Vista de tabla"
            >
              <List className="w-4 h-4" strokeWidth={2.5} />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2 rounded-md transition-all duration-200 ${
                viewMode === 'cards'
                  ? 'bg-white text-blue-600 shadow-sm scale-105'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
              }`}
              title="Vista de tarjetas"
            >
              <LayoutGrid className="w-4 h-4" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>

      {/* Filtros Avanzados - Estilo Apple Premium */}
      <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-md border border-gray-200/60 mb-5 overflow-hidden transition-all duration-300 hover:shadow-lg">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-50/50 transition-all duration-200 group"
        >
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="p-2 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg group-hover:from-blue-100 group-hover:to-blue-200 transition-all duration-200 shadow-sm">
                <Filter className="w-4.5 h-4.5 text-blue-600" strokeWidth={2.5} />
              </div>
              {activeFiltersCount > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md animate-pulse">
                  <span className="text-[10px] font-bold text-white">{activeFiltersCount}</span>
                </div>
              )}
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                Filtros Avanzados
                {activeFiltersCount > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200">
                    <Sparkles className="w-3 h-3" />
                    {activeFiltersCount} activo{activeFiltersCount > 1 ? 's' : ''}
                  </span>
                )}
              </p>
              <p className="text-xs text-gray-500 mt-0.5 font-medium">
                {showFilters ? 'Ocultar opciones de filtrado' : 'Configurar búsqueda y filtros personalizados'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && !showFilters && (
              <div className="flex gap-1.5 flex-wrap max-w-[200px] justify-end">
                {activeFiltersList.slice(0, 2).map((filter) => (
                  <span
                    key={filter.key}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg border border-blue-200 truncate max-w-[90px]"
                    title={filter.value}
                  >
                    {filter.value.length > 8 ? filter.value.substring(0, 8) + '...' : filter.value}
                  </span>
                ))}
                {activeFiltersList.length > 2 && (
                  <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-lg">
                    +{activeFiltersList.length - 2}
                  </span>
                )}
              </div>
            )}
            <ChevronDown
              className={`w-5 h-5 text-gray-400 transition-all duration-300 ${showFilters ? 'rotate-180 text-blue-600' : 'group-hover:text-gray-600'}`}
              strokeWidth={2.5}
            />
          </div>
        </button>

        {/* Panel expandible con animación suave */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            showFilters ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-5 pb-5 bg-gradient-to-b from-gray-50/50 to-white border-t border-gray-200/60">

            {/* Badges de filtros activos - Visualización estilo Apple */}
            {activeFiltersList.length > 0 && (
              <div className="mb-2.5 pb-2.5 border-b border-gray-200/60">
                <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Filtros Aplicados</p>
                <div className="flex flex-wrap gap-1.5">
                  {activeFiltersList.map((filter) => (
                    <div
                      key={filter.key}
                      className="inline-flex items-center gap-1.5 px-2 py-1 bg-gradient-to-r from-blue-50 to-blue-100/50 border border-blue-200 rounded-lg text-[10px] text-blue-700 font-medium shadow-sm hover:shadow-md transition-all duration-200 group"
                    >
                      <span className="text-[10px] font-semibold text-blue-600">{filter.label}:</span>
                      <span className="text-blue-800 text-[10px]">{filter.value}</span>
                      <button
                        onClick={() => removeFilter(filter.key)}
                        className="ml-0.5 p-0.5 hover:bg-blue-200 rounded-md transition-colors duration-150 opacity-70 hover:opacity-100"
                      >
                        <X className="w-3 h-3" strokeWidth={2.5} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Separador visual */}
            <div className="my-1.5">
              <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            </div>

            {/* Grid de filtros principales - Cards estilo Apple */}
            <div className="space-y-4">
              {/* Sección 1: Filtros de Usuario */}
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-blue-500"></div>
                  Filtros de Usuario
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                  {/* Búsqueda por DNI / CE */}
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative bg-white rounded-lg p-3 border-2 border-gray-200 hover:border-blue-400 transition-all duration-300 shadow-sm hover:shadow-md h-full">
                      <label className="block mb-2 text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Search className="w-3.5 h-3.5 text-blue-500" strokeWidth={2.5} />
                        DNI / CE
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="Nro. documento..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value.replace(/\D/g, ''))}
                          maxLength={12}
                          className="w-full pl-2 pr-6 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        />
                        {searchTerm && (
                          <button onClick={() => setSearchTerm('')} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            <X className="w-3.5 h-3.5" strokeWidth={2.5} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Rol */}
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative bg-white rounded-lg p-3 border-2 border-gray-200 hover:border-blue-400 transition-all duration-300 shadow-sm hover:shadow-md h-full">
                      <label className="block mb-2 text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        Rol
                      </label>
                      <div className="relative">
                        <select
                          value={filters.rol}
                          onChange={(e) => setFilters({ ...filters, rol: e.target.value })}
                          className="w-full px-3 py-2 bg-gray-50/50 border border-gray-300 rounded-md text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none cursor-pointer hover:bg-white font-medium"
                        >
                          <option value="">Todos los Roles</option>
                          {roles.map((rol) => (
                            <option key={rol.idRol} value={rol.nombreRol}>
                              {rol.nombreRol}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                          <ChevronDown className="w-3.5 h-3.5 text-gray-500" strokeWidth={2.5} />
                        </div>
                      </div>
                      {filters.rol && (
                        <div className="mt-2 px-2.5 py-1.5 bg-blue-50 border border-blue-200 rounded-md">
                          <span className="text-[10px] text-blue-700 font-semibold">{filters.rol}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tipo de Personal */}
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative bg-white rounded-lg p-3 border-2 border-gray-200 hover:border-emerald-400 transition-all duration-300 shadow-sm hover:shadow-md h-full">
                      <label className="block mb-2 text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        Tipo
                      </label>
                      <div className="relative">
                        <select
                          value={filters.institucion}
                          onChange={(e) => setFilters({ ...filters, institucion: e.target.value })}
                          className="w-full px-3 py-2 bg-gray-50/50 border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 appearance-none cursor-pointer hover:bg-white font-medium"
                        >
                          <option value="">Todos los Tipos</option>
                          <option value="Interno">Interno</option>
                          <option value="Externo">Externo</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                          <ChevronDown className="w-3.5 h-3.5 text-gray-500" strokeWidth={2.5} />
                        </div>
                      </div>
                      {filters.institucion && (
                        <div className="mt-2 px-2.5 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg">
                          <span className="text-[10px] text-emerald-700 font-semibold">{filters.institucion}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Área */}
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-violet-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative bg-white rounded-lg p-3 border-2 border-gray-200 hover:border-indigo-400 transition-all duration-300 shadow-sm hover:shadow-md h-full">
                      <label className="block mb-2 text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                        Área
                      </label>
                      <div className="relative">
                        <select
                          value={filters.area}
                          onChange={(e) => setFilters({ ...filters, area: e.target.value })}
                          className="w-full px-3 py-2 bg-gray-50/50 border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 appearance-none cursor-pointer hover:bg-white font-medium"
                        >
                          <option value="">Todas las Áreas</option>
                          {areas.map((area) => (
                            <option key={area.idArea} value={area.descArea}>
                              {area.descArea}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                          <ChevronDown className="w-3.5 h-3.5 text-gray-500" strokeWidth={2.5} />
                        </div>
                      </div>
                      {filters.area && (
                        <div className="mt-2 px-2.5 py-1.5 bg-indigo-50 border border-indigo-200 rounded-lg">
                          <span className="text-[10px] text-indigo-700 font-semibold">{filters.area}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Estado */}
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative bg-white rounded-lg p-3 border-2 border-gray-200 hover:border-green-400 transition-all duration-300 shadow-sm hover:shadow-md h-full">
                      <label className="block mb-2 text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        Estado
                      </label>
                      <div className="relative">
                        <select
                          value={filters.estado}
                          onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
                          className="w-full px-3 py-2 bg-gray-50/50 border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 appearance-none cursor-pointer hover:bg-white font-medium"
                        >
                          <option value="">Todos los Estados</option>
                          <option value="ACTIVO">Activo</option>
                          <option value="INACTIVO">Inactivo</option>
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                          <ChevronDown className="w-3.5 h-3.5 text-gray-500" strokeWidth={2.5} />
                        </div>
                      </div>
                      {filters.estado && (
                        <div className={`mt-2 px-2.5 py-1.5 rounded-lg border ${
                          filters.estado === 'ACTIVO'
                            ? 'bg-green-50 border-green-200'
                            : 'bg-red-50 border-red-200'
                        }`}>
                          <span className={`text-xs font-semibold ${
                            filters.estado === 'ACTIVO' ? 'text-green-700' : 'text-red-700'
                          }`}>
                            {filters.estado}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Mes Cumpleaños */}
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-rose-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative bg-white rounded-lg p-3 border-2 border-gray-200 hover:border-pink-400 transition-all duration-300 shadow-sm hover:shadow-md h-full">
                      <label className="block mb-2 text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                        Cumpleaños
                      </label>
                      <div className="relative">
                        <select
                          value={filters.mesCumpleanos}
                          onChange={(e) => setFilters({ ...filters, mesCumpleanos: e.target.value })}
                          className="w-full px-3 py-2 bg-gray-50/50 border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all duration-200 appearance-none cursor-pointer hover:bg-white font-medium"
                        >
                          <option value="">Todos los Meses</option>
                          {meses.map((m) => (
                            <option key={m} value={m}>
                              {m}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                          <ChevronDown className="w-3.5 h-3.5 text-gray-500" strokeWidth={2.5} />
                        </div>
                      </div>
                      {filters.mesCumpleanos && (
                        <div className="mt-2 px-2.5 py-1.5 bg-pink-50 border border-pink-200 rounded-lg">
                          <span className="text-[10px] text-pink-700 font-semibold">{filters.mesCumpleanos}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sección 2: Filtros Laborales, Ubicación y Fecha */}
              <div className="mt-4">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-teal-500"></div>
                  Filtros Laborales, Ubicación y Fecha
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
                  {/* Régimen Laboral */}
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-cyan-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative bg-white rounded-lg p-3 border-2 border-gray-200 hover:border-teal-400 transition-all duration-300 shadow-sm hover:shadow-md h-full">
                      <label className="block mb-2 text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                        Régimen Laboral
                      </label>
                      <div className="relative">
                        <select
                          value={filters.regimen}
                          onChange={(e) => setFilters({ ...filters, regimen: e.target.value })}
                          className="w-full px-3 py-2 bg-gray-50/50 border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 appearance-none cursor-pointer hover:bg-white font-medium"
                        >
                          <option value="">Todos los Regímenes</option>
                          {regimenes.map((regimen) => (
                            <option key={regimen.idRegLab} value={regimen.descRegLab}>
                              {regimen.descRegLab}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                          <ChevronDown className="w-3.5 h-3.5 text-gray-500" strokeWidth={2.5} />
                        </div>
                      </div>
                      {filters.regimen && (
                        <div className="mt-2 px-2.5 py-1.5 bg-teal-50 border border-teal-200 rounded-lg">
                          <span className="text-[10px] text-teal-700 font-semibold truncate block" title={filters.regimen}>
                            {filters.regimen.length > 20 ? filters.regimen.substring(0, 20) + '...' : filters.regimen}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Profesión */}
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-yellow-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative bg-white rounded-lg p-3 border-2 border-gray-200 hover:border-amber-400 transition-all duration-300 shadow-sm hover:shadow-md h-full">
                      <label className="block mb-2 text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                        Profesión
                      </label>
                      <div className="relative">
                        <select
                          value={filters.profesion}
                          onChange={(e) => setFilters({ ...filters, profesion: e.target.value })}
                          className="w-full px-3 py-2 bg-gray-50/50 border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 appearance-none cursor-pointer hover:bg-white font-medium"
                        >
                          <option value="">Todas las Profesiones</option>
                          {profesionesList.map((profesion, index) => (
                            <option key={profesion.id_profesion || profesion.idProfesion || index} value={profesion.nombre_profesion || profesion.nombreProfesion}>
                              {profesion.nombre_profesion || profesion.nombreProfesion}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                          <ChevronDown className="w-3.5 h-3.5 text-gray-500" strokeWidth={2.5} />
                        </div>
                      </div>
                      {filters.profesion && (
                        <div className="mt-2 px-2.5 py-1.5 bg-amber-50 border border-amber-200 rounded-lg">
                          <span className="text-[10px] text-amber-700 font-semibold truncate block" title={filters.profesion}>
                            {filters.profesion.length > 20 ? filters.profesion.substring(0, 20) + '...' : filters.profesion}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Especialidad */}
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-red-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative bg-white rounded-lg p-3 border-2 border-gray-200 hover:border-rose-400 transition-all duration-300 shadow-sm hover:shadow-md h-full">
                      <label className="block mb-2 text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                        Especialidad
                      </label>
                      <div className="relative">
                        <select
                          value={filters.especialidad}
                          onChange={(e) => setFilters({ ...filters, especialidad: e.target.value })}
                          className="w-full px-3 py-2 bg-gray-50/50 border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all duration-200 appearance-none cursor-pointer hover:bg-white font-medium"
                        >
                          <option value="">Todas las Especialidades</option>
                          {especialidadesList.map((especialidad, index) => (
                            <option key={especialidad.id_especialidad || especialidad.idEspecialidad || index} value={especialidad.nombre_especialidad || especialidad.nombreEspecialidad}>
                              {especialidad.nombre_especialidad || especialidad.nombreEspecialidad}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                          <ChevronDown className="w-3.5 h-3.5 text-gray-500" strokeWidth={2.5} />
                        </div>
                      </div>
                      {filters.especialidad && (
                        <div className="mt-2 px-2.5 py-1.5 bg-rose-50 border border-rose-200 rounded-lg">
                          <span className="text-[10px] text-rose-700 font-semibold truncate block" title={filters.especialidad}>
                            {filters.especialidad.length > 20 ? filters.especialidad.substring(0, 20) + '...' : filters.especialidad}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* RED Asistencial */}
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-violet-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative bg-white rounded-lg p-3 border-2 border-gray-200 hover:border-purple-400 transition-all duration-300 shadow-sm hover:shadow-md h-full">
                      <label className="block mb-2 text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-purple-500" strokeWidth={2.5} />
                        Red Asistencial
                      </label>
                      <div className="relative">
                        <select
                          value={filters.red}
                          onChange={(e) => {
                            // Al cambiar red, limpiar el filtro de IPRESS
                            setFilters({ ...filters, red: e.target.value, ipress: '' });
                          }}
                          className="w-full px-3 py-2 bg-gray-50/50 border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 appearance-none cursor-pointer hover:bg-white font-medium"
                        >
                          <option value="">Todas las Redes</option>
                          {redesList.map((red) => (
                            <option key={red.id_red} value={red.nombre_red}>
                              {red.nombre_red}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                          <ChevronDown className="w-3.5 h-3.5 text-gray-500" strokeWidth={2.5} />
                        </div>
                      </div>
                      {filters.red && (
                        <div className="mt-2 px-2.5 py-1.5 bg-purple-50 border border-purple-200 rounded-lg">
                          <span className="text-[10px] text-purple-700 font-semibold truncate block" title={filters.red}>
                            {filters.red.length > 20 ? filters.red.substring(0, 20) + '...' : filters.red}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* IPRESS */}
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-amber-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative bg-white rounded-lg p-3 border-2 border-gray-200 hover:border-orange-400 transition-all duration-300 shadow-sm hover:shadow-md h-full">
                      <label className="block mb-2 text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-orange-500" strokeWidth={2.5} />
                        IPRESS
                      </label>
                      <div className="relative">
                        <select
                          value={filters.ipress}
                          onChange={(e) => setFilters({ ...filters, ipress: e.target.value })}
                          className="w-full px-3 py-2 bg-gray-50/50 border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 appearance-none cursor-pointer hover:bg-white font-medium"
                        >
                          <option value="">Todas las IPRESS</option>
                          {ipressList.map((ipress) => (
                            <option key={ipress.id_ipress || ipress.idIpress} value={ipress.desc_ipress || ipress.descIpress}>
                              {ipress.desc_ipress || ipress.descIpress}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                          <ChevronDown className="w-3.5 h-3.5 text-gray-500" strokeWidth={2.5} />
                        </div>
                      </div>
                      {filters.ipress && (
                        <div className="mt-2 px-2.5 py-1.5 bg-orange-50 border border-orange-200 rounded-lg">
                          <span className="text-[10px] text-orange-700 font-semibold truncate block" title={filters.ipress}>
                            {filters.ipress.length > 20 ? filters.ipress.substring(0, 20) + '...' : filters.ipress}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </div>


          </div>
        </div>

        {/* Botón limpiar filtros - Siempre visible fuera del panel colapsable */}
        {hasActiveFilters && (
          <div className="px-4 py-2.5 bg-white border-t border-gray-200/60">
            <button
              onClick={limpiarFiltros}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-green-700 bg-gradient-to-r from-green-50 to-emerald-50 backdrop-blur-sm border-2 border-green-300 rounded-lg hover:from-green-100 hover:to-emerald-100 hover:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:ring-offset-1 transition-all duration-200 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
            >
              <X className="w-3.5 h-3.5" strokeWidth={2.5} />
              Limpiar todos los filtros
              <span className="px-1.5 py-0.5 bg-green-600 text-white rounded-full text-[10px] font-bold">
                {activeFiltersCount}
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FiltersPanel;

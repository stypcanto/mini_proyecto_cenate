// src/pages/admin/users/components/FiltersPanel.jsx
import React, { useState, useMemo } from 'react';
import { Search, Filter, ChevronDown, UserPlus, X, Trash2, Download, Upload, LayoutGrid, List, Sparkles, RefreshCw } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const FiltersPanel = ({ filters, setFilters, searchTerm, setSearchTerm, onNewUser, selectedCount = 0, onDeleteSelected, viewMode, setViewMode, roles = [], areas = [], onRefresh }) => {
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
    setFilters({ rol: '', institucion: '', estado: '', mesCumpleanos: '', area: '' });
    setSearchTerm('');
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchTerm) count++;
    if (filters.rol) count++;
    if (filters.institucion) count++;
    if (filters.estado) count++;
    if (filters.mesCumpleanos) count++;
    if (filters.area) count++;
    return count;
  }, [filters, searchTerm]);

  // Obtener filtros activos con sus valores para mostrar badges
  const activeFiltersList = useMemo(() => {
    const list = [];
    if (searchTerm) list.push({ key: 'search', label: `Búsqueda: "${searchTerm}"`, value: searchTerm });
    if (filters.rol) list.push({ key: 'rol', label: 'Rol', value: filters.rol });
    if (filters.institucion) list.push({ key: 'institucion', label: 'Tipo', value: filters.institucion });
    if (filters.estado) list.push({ key: 'estado', label: 'Estado', value: filters.estado });
    if (filters.mesCumpleanos) list.push({ key: 'mesCumpleanos', label: 'Mes', value: filters.mesCumpleanos });
    if (filters.area) list.push({ key: 'area', label: 'Área', value: filters.area });
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
    <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
      {/* Toolbar estilo Apple - Minimalista y elegante */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 py-3">
        {/* Botones de acción - Estilo Apple */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onNewUser}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] text-sm font-medium backdrop-blur-sm"
          >
            <UserPlus className="w-4 h-4" strokeWidth={2.5} />
            Nuevo Usuario
          </button>
          
          {/* Solo SUPERADMIN puede ver el botón de eliminar */}
          {esSuperAdmin && (
            <button
              onClick={onDeleteSelected}
              disabled={selectedCount === 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-sm relative"
            >
              <Trash2 className="w-4 h-4" strokeWidth={2.5} />
              Eliminar
              {selectedCount > 0 && (
                <span className="absolute -top-2 -right-2 min-w-[22px] h-5 px-1.5 bg-white text-red-600 rounded-full text-xs font-bold flex items-center justify-center shadow-lg border-2 border-red-500 animate-pulse">
                  {selectedCount}
                </span>
              )}
            </button>
          )}
          
          <button
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] text-sm font-medium"
          >
            <Download className="w-4 h-4" strokeWidth={2.5} />
            Exportar
          </button>
          
          <button
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] text-sm font-medium"
          >
            <Upload className="w-4 h-4" strokeWidth={2.5} />
            Importar
          </button>
          
          <button
            onClick={onRefresh}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] text-sm font-medium backdrop-blur-sm"
            title="Actualizar tabla de usuarios"
          >
            <RefreshCw className="w-4 h-4" strokeWidth={2.5} />
            Actualizar
          </button>
        </div>

        {/* Controles de vista - Estilo Apple */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5 bg-gray-100/80 backdrop-blur-sm rounded-xl p-1 border border-gray-200/50 shadow-inner">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-all duration-200 ${
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
              className={`p-2 rounded-lg transition-all duration-200 ${
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
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/60 mb-6 overflow-hidden transition-all duration-300 hover:shadow-xl">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 transition-all duration-200 group"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="p-2.5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl group-hover:from-blue-100 group-hover:to-blue-200 transition-all duration-200 shadow-sm">
                <Filter className="w-5 h-5 text-blue-600" strokeWidth={2.5} />
              </div>
              {activeFiltersCount > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                  <span className="text-[10px] font-bold text-white">{activeFiltersCount}</span>
                </div>
              )}
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                Filtros Avanzados
                {activeFiltersCount > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200">
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
          <div className="px-6 pb-6 bg-gradient-to-b from-gray-50/50 to-white border-t border-gray-200/60">
            {/* Buscador principal - Estilo Apple */}
            <div className="pt-6 pb-5">
              <label className="block mb-3 text-sm font-semibold text-gray-800 flex items-center gap-2">
                <div className="p-1.5 bg-blue-50 rounded-lg">
                  <Search className="w-4 h-4 text-blue-600" strokeWidth={2.5} />
                </div>
                Búsqueda General
              </label>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-600 transition-all duration-200 pointer-events-none z-10" strokeWidth={2} />
                  <input
                    type="text"
                    placeholder="Buscar por nombre, usuario, documento, IPRESS..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-white/90 backdrop-blur-sm border-2 border-gray-200 rounded-2xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 shadow-sm hover:border-gray-300 hover:shadow-md focus:shadow-lg"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                    >
                      <X className="w-4 h-4" strokeWidth={2.5} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Badges de filtros activos - Visualización estilo Apple */}
            {activeFiltersList.length > 0 && (
              <div className="mb-5 pb-4 border-b border-gray-200/60">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">Filtros Aplicados</p>
                <div className="flex flex-wrap gap-2">
                  {activeFiltersList.map((filter) => (
                    <div
                      key={filter.key}
                      className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-blue-100/50 border border-blue-200 rounded-xl text-sm text-blue-700 font-medium shadow-sm hover:shadow-md transition-all duration-200 group"
                    >
                      <span className="text-xs font-semibold text-blue-600">{filter.label}:</span>
                      <span className="text-blue-800">{filter.value}</span>
                      <button
                        onClick={() => removeFilter(filter.key)}
                        className="ml-1 p-0.5 hover:bg-blue-200 rounded-md transition-colors duration-150 opacity-70 hover:opacity-100"
                      >
                        <X className="w-3.5 h-3.5" strokeWidth={2.5} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Grid de filtros - Cards estilo Apple */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Rol */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
                <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/60 hover:border-blue-300/60 hover:shadow-lg transition-all duration-300">
                  <label className="block mb-2.5 text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Rol de Usuario
                  </label>
                  <div className="relative">
                    <select
                      value={filters.rol}
                      onChange={(e) => setFilters({ ...filters, rol: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white/80 border-2 border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-200 appearance-none cursor-pointer hover:border-gray-300 hover:bg-white shadow-sm"
                    >
                      <option value="">Todos los Roles</option>
                      {roles.map((rol) => (
                        <option key={rol.idRol} value={rol.nombreRol}>
                          {rol.nombreRol}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <ChevronDown className="w-4 h-4 text-gray-400" strokeWidth={2} />
                    </div>
                  </div>
                  {filters.rol && (
                    <div className="mt-2 px-2 py-1 bg-blue-50 border border-blue-200 rounded-lg">
                      <span className="text-xs text-blue-700 font-medium">{filters.rol}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Tipo de Personal */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
                <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/60 hover:border-emerald-300/60 hover:shadow-lg transition-all duration-300">
                  <label className="block mb-2.5 text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Tipo de Personal
                  </label>
                  <div className="relative">
                    <select
                      value={filters.institucion}
                      onChange={(e) => setFilters({ ...filters, institucion: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white/80 border-2 border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-200 appearance-none cursor-pointer hover:border-gray-300 hover:bg-white shadow-sm"
                    >
                      <option value="">Todos los Tipos</option>
                      <option value="Interno">Interno</option>
                      <option value="Externo">Externo</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <ChevronDown className="w-4 h-4 text-gray-400" strokeWidth={2} />
                    </div>
                  </div>
                  {filters.institucion && (
                    <div className="mt-2 px-2 py-1 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <span className="text-xs text-emerald-700 font-medium">{filters.institucion}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Área */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-violet-50/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
                <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/60 hover:border-indigo-300/60 hover:shadow-lg transition-all duration-300">
                  <label className="block mb-2.5 text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Área
                  </label>
                  <div className="relative">
                    <select
                      value={filters.area}
                      onChange={(e) => setFilters({ ...filters, area: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white/80 border-2 border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-200 appearance-none cursor-pointer hover:border-gray-300 hover:bg-white shadow-sm"
                    >
                      <option value="">Todas las Áreas</option>
                      {areas.map((area) => (
                        <option key={area.idArea} value={area.descArea}>
                          {area.descArea}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <ChevronDown className="w-4 h-4 text-gray-400" strokeWidth={2} />
                    </div>
                  </div>
                  {filters.area && (
                    <div className="mt-2 px-2 py-1 bg-indigo-50 border border-indigo-200 rounded-lg">
                      <span className="text-xs text-indigo-700 font-medium">{filters.area}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Estado */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 to-emerald-50/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
                <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/60 hover:border-green-300/60 hover:shadow-lg transition-all duration-300">
                  <label className="block mb-2.5 text-xs font-bold text-gray-600 uppercase tracking-wider">
                    Estado del Usuario
                  </label>
                  <div className="relative">
                    <select
                      value={filters.estado}
                      onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white/80 border-2 border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all duration-200 appearance-none cursor-pointer hover:border-gray-300 hover:bg-white shadow-sm"
                    >
                      <option value="">Todos los Estados</option>
                      <option value="ACTIVO">Activo</option>
                      <option value="INACTIVO">Inactivo</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <ChevronDown className="w-4 h-4 text-gray-400" strokeWidth={2} />
                    </div>
                  </div>
                  {filters.estado && (
                    <div className={`mt-2 px-2 py-1 rounded-lg border ${
                      filters.estado === 'ACTIVO' 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <span className={`text-xs font-medium ${
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
                <div className="absolute inset-0 bg-gradient-to-br from-pink-50/50 to-rose-50/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
                <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/60 hover:border-pink-300/60 hover:shadow-lg transition-all duration-300">
                  <label className="block mb-2.5 text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1zm-5 8.274l-.818 2.552c.25.112.526.174.818.174.292 0 .569-.062.818-.174L5 10.274zm10 0l-.818 2.552c.25.112.526.174.818.174.292 0 .569-.062.818-.174L15 10.274z" />
                    </svg>
                    Mes de Cumpleaños
                  </label>
                  <div className="relative">
                    <select
                      value={filters.mesCumpleanos}
                      onChange={(e) => setFilters({ ...filters, mesCumpleanos: e.target.value })}
                      className="w-full px-4 py-2.5 bg-white/80 border-2 border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 transition-all duration-200 appearance-none cursor-pointer hover:border-gray-300 hover:bg-white shadow-sm"
                    >
                      <option value="">Todos los Meses</option>
                      {meses.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <ChevronDown className="w-4 h-4 text-gray-400" strokeWidth={2} />
                    </div>
                  </div>
                  {filters.mesCumpleanos && (
                    <div className="mt-2 px-2 py-1 bg-pink-50 border border-pink-200 rounded-lg">
                      <span className="text-xs text-pink-700 font-medium">{filters.mesCumpleanos}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Botón limpiar filtros - Estilo Apple */}
            {hasActiveFilters && (
              <div className="mt-6 pt-5 border-t border-gray-200/60">
                <button
                  onClick={limpiarFiltros}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white/80 backdrop-blur-sm border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400/50 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
                >
                  <X className="w-4 h-4" strokeWidth={2.5} />
                  Limpiar todos los filtros
                  <span className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full text-xs font-bold">
                    {activeFiltersCount}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FiltersPanel;

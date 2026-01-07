/**
 * 💊 Componente CRUD para gestión de Medicamentos (Petitorio)
 *
 * Este componente permite administrar el petitorio nacional de medicamentos
 * almacenados en la tabla dim_medicamento.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    Search,
    RefreshCw,
    Plus,
    Eye,
    Edit2,
    Trash2,
    X,
    Check,
    AlertCircle,
    FileText,
    Calendar,
    Clock
} from 'lucide-react';
import medicamentosService from '../../../services/medicamentosService';
import PaginationControls from '../../user/components/PaginationControls';

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
const Medicamentos = () => {
    // Estado
    const [medicamentos, setMedicamentos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Filtros de búsqueda separados
    const [filtroCodigo, setFiltroCodigo] = useState('');
    const [filtroDescripcion, setFiltroDescripcion] = useState('');
    const [debouncedCodigo, setDebouncedCodigo] = useState('');
    const [debouncedDescripcion, setDebouncedDescripcion] = useState('');
    
    // Paginación
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize] = useState(30); // 30 registros por página
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // Modales
    const [showModal, setShowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
    const [selectedItem, setSelectedItem] = useState(null);

    // Formulario
    const [formData, setFormData] = useState({
        codMedicamento: '',
        descMedicamento: '',
        statMedicamento: 'A'
    });

    // ============================================================
    // DEBOUNCE PARA BÚSQUEDA
    // ============================================================
    useEffect(() => {
        const timerCodigo = setTimeout(() => {
            setDebouncedCodigo(filtroCodigo);
        }, 500);
        return () => clearTimeout(timerCodigo);
    }, [filtroCodigo]);

    useEffect(() => {
        const timerDescripcion = setTimeout(() => {
            setDebouncedDescripcion(filtroDescripcion);
        }, 500);
        return () => clearTimeout(timerDescripcion);
    }, [filtroDescripcion]);

    // ============================================================
    // CARGAR DATOS CON BÚSQUEDA EN BACKEND
    // ============================================================
    const loadData = useCallback(async () => {
        const codBusqueda = debouncedCodigo.trim() || null;
        const descBusqueda = debouncedDescripcion.trim() || null;
        
        console.log('🔵 [Medicamentos] Iniciando carga de datos paginados...', { 
            page: currentPage, 
            size: pageSize,
            codigo: codBusqueda,
            descripcion: descBusqueda
        });
        setLoading(true);
        setError(null);
        try {
            const response = await medicamentosService.obtenerTodosPaginados(
                currentPage, 
                pageSize, 
                'idMedicamento', 
                'asc',
                codBusqueda,
                descBusqueda
            );
            
            // Manejar respuesta: puede ser array o objeto Page
            if (Array.isArray(response)) {
                // Si es array, construir objeto Page manualmente
                const startIndex = currentPage * pageSize;
                const endIndex = startIndex + pageSize;
                setMedicamentos(response.slice(startIndex, endIndex));
                setTotalElements(response.length);
                setTotalPages(Math.ceil(response.length / pageSize));
                console.log('✅ [Medicamentos] Datos cargados (array):', response.slice(startIndex, endIndex).length, 'de', response.length);
            } else {
                // Si es objeto Page
                setMedicamentos(response.content || []);
                setTotalElements(response.totalElements || 0);
                setTotalPages(response.totalPages || 0);
                console.log('✅ [Medicamentos] Datos cargados (Page):', response.content?.length || 0, 'de', response.totalElements || 0);
            }
        } catch (err) {
            console.error('❌ [Medicamentos] Error al cargar:', err);
            setError('Error al cargar los medicamentos. Por favor, intente nuevamente.');
            setMedicamentos([]);
            setTotalElements(0);
            setTotalPages(0);
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, debouncedCodigo, debouncedDescripcion]);

    // Resetear página cuando cambian los filtros
    useEffect(() => {
        setCurrentPage(0);
    }, [debouncedCodigo, debouncedDescripcion]);

    // Cargar datos cuando cambian los parámetros
    useEffect(() => {
        loadData();
    }, [currentPage, pageSize, debouncedCodigo, debouncedDescripcion, loadData]);

    // ============================================================
    // DATOS FILTRADOS (ya vienen filtrados del backend)
    // ============================================================
    const filteredData = medicamentos;

    // ============================================================
    // HANDLER DE CAMBIO DE PÁGINA
    // ============================================================
    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        // Scroll al inicio de la tabla
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // ============================================================
    // HANDLERS
    // ============================================================
    const handleOpenCreate = () => {
        setFormData({ codMedicamento: '', descMedicamento: '', statMedicamento: 'A' });
        setModalMode('create');
        setShowModal(true);
    };

    const handleOpenEdit = (item) => {
        setFormData({
            codMedicamento: item.codMedicamento || '',
            descMedicamento: item.descMedicamento || '',
            statMedicamento: item.statMedicamento || 'A'
        });
        setSelectedItem(item);
        setModalMode('edit');
        setShowModal(true);
    };

    const handleOpenView = (item) => {
        setSelectedItem(item);
        setShowViewModal(true);
    };

    const handleOpenDelete = (item) => {
        setSelectedItem(item);
        setShowDeleteModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (modalMode === 'create') {
                await medicamentosService.crear(formData);
            } else {
                await medicamentosService.actualizar(selectedItem.idMedicamento, formData);
            }
            setShowModal(false);
            loadData();
        } catch (err) {
            console.error('Error al guardar:', err);
            setError('Error al guardar el medicamento.');
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        setLoading(true);
        try {
            await medicamentosService.eliminar(selectedItem.idMedicamento);
            setShowDeleteModal(false);
            loadData();
        } catch (err) {
            console.error('Error al eliminar:', err);
            setError('No se puede eliminar. El medicamento está siendo utilizado.');
            setLoading(false);
        }
    };

    const handleToggleStatus = async (item) => {
        const nuevoEstado = item.statMedicamento === 'A' ? 'I' : 'A';
        try {
            await medicamentosService.cambiarEstado(item.idMedicamento, nuevoEstado);
            loadData();
        } catch (err) {
            console.error('Error al cambiar estado:', err);
            setError('Error al cambiar el estado del medicamento.');
        }
    };

    // ============================================================
    // RENDER
    // ============================================================
    return (
        <div className="overflow-hidden bg-white border border-gray-100 shadow-lg rounded-2xl">
            {/* Header */}
            <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-3 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                            <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Medicamentos Medicamento</h2>
                            <p className="text-sm text-gray-500">Catálogo de medicamentos médicos</p>
                            <p className="text-xs text-green-600 font-medium mt-1 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                Actualizado al 06/01/2026 - 56,662 registros
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={ loadData }
                            disabled={ loading }
                            className="flex items-center gap-2 px-4 py-2 text-gray-600 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
                        >
                            <RefreshCw className={ `w-4 h-4 ${loading ? 'animate-spin' : ''}` } />
                            Actualizar
                        </button>
                        <button
                            onClick={ handleOpenCreate }
                            className="flex items-center gap-2 px-4 py-2 text-white transition-all rounded-lg shadow-md bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                        >
                            <Plus className="w-4 h-4" />
                            Nuevo Medicamento
                        </button>
                    </div>
                </div>
            </div>

            {/* Filtros de Búsqueda Profesionales */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50">
                <div className="mb-4">
                    <h3 className="flex items-center gap-2 text-sm font-bold tracking-wide text-gray-700 uppercase">
                        <Search className="w-4 h-4 text-blue-600" />
                        Búsqueda Avanzada
                    </h3>
                    <p className="mt-1 text-xs text-gray-500">Busca por código Medicamento o descripción. Puedes usar ambos filtros simultáneamente.</p>
                </div>
                
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* Filtro por Código Medicamento */}
                    <div className="relative">
                        <label className="block mb-2 text-sm font-semibold text-gray-700">
                            <span className="flex items-center gap-2">
                                <div className="p-1.5 bg-blue-100 rounded-md">
                                    <FileText className="w-3.5 h-3.5 text-blue-700" />
                                </div>
                                Código Medicamento
                            </span>
                        </label>
                        <div className="relative group">
                            <Search className="absolute w-5 h-5 text-gray-400 transition-colors transform -translate-y-1/2 left-3 top-1/2 group-focus-within:text-blue-500" />
                            <input
                                type="text"
                                placeholder="Ej: 100010001, 100010002, 100010003..."
                                value={filtroCodigo}
                                onChange={(e) => setFiltroCodigo(e.target.value)}
                                className="w-full py-3 pl-10 pr-10 transition-all bg-white border-2 border-gray-200 shadow-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300 focus:shadow-md"
                            />
                            {filtroCodigo && (
                                <button
                                    onClick={() => setFiltroCodigo('')}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50 transition-all"
                                    title="Limpiar filtro de código"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        {filtroCodigo && (
                            <p className="mt-1.5 text-xs text-gray-500 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
                                Buscando códigos que contengan "{filtroCodigo}"
                            </p>
                        )}
                    </div>

                    {/* Filtro por Descripción */}
                    <div className="relative">
                        <label className="block mb-2 text-sm font-semibold text-gray-700">
                            <span className="flex items-center gap-2">
                                <div className="p-1.5 bg-blue-100 rounded-md">
                                    <FileText className="w-3.5 h-3.5 text-blue-700" />
                                </div>
                                Descripción
                            </span>
                        </label>
                        <div className="relative group">
                            <Search className="absolute w-5 h-5 text-gray-400 transition-colors transform -translate-y-1/2 left-3 top-1/2 group-focus-within:text-blue-500" />
                            <input
                                type="text"
                                placeholder="Ej: cultivo, anestesia, consulta, emergencia..."
                                value={filtroDescripcion}
                                onChange={(e) => setFiltroDescripcion(e.target.value)}
                                className="w-full py-3 pl-10 pr-10 transition-all bg-white border-2 border-gray-200 shadow-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300 focus:shadow-md"
                            />
                            {filtroDescripcion && (
                                <button
                                    onClick={() => setFiltroDescripcion('')}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50 transition-all"
                                    title="Limpiar filtro de descripción"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        {filtroDescripcion && (
                            <p className="mt-1.5 text-xs text-gray-500 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
                                Buscando descripciones que contengan "{filtroDescripcion}"
                            </p>
                        )}
                    </div>
                </div>
                
                {/* Información de búsqueda activa */}
                {(debouncedCodigo || debouncedDescripcion) && (
                    <div className="flex items-center justify-between p-3 mt-4 border border-blue-200 rounded-lg bg-blue-50">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                            <div className="p-1.5 bg-blue-100 rounded-md">
                                <AlertCircle className="w-4 h-4 text-blue-600" />
                            </div>
                            <span>
                                <span className="font-semibold text-blue-700">Filtros activos:</span>
                                {debouncedCodigo && (
                                    <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md text-xs font-medium">
                                        Código: "{debouncedCodigo}"
                                    </span>
                                )}
                                {debouncedCodigo && debouncedDescripcion && (
                                    <span className="mx-1 text-gray-400">+</span>
                                )}
                                {debouncedDescripcion && (
                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md text-xs font-medium">
                                        Descripción: "{debouncedDescripcion}"
                                    </span>
                                )}
                            </span>
                        </div>
                        <button
                            onClick={() => {
                                setFiltroCodigo('');
                                setFiltroDescripcion('');
                            }}
                            className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm"
                        >
                            Limpiar todo
                        </button>
                    </div>
                )}
            </div>

            {/* Error */}
            { error && (
                <div className="flex items-center gap-2 p-4 mx-4 mt-4 text-red-700 border border-red-200 rounded-lg bg-red-50">
                    <AlertCircle className="w-5 h-5" />
                    { error }
                    <button onClick={ () => setError(null) } className="ml-auto">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ) }

            {/* Tabla Estándar */}
            <div className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-[#0A5BA9]">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-white uppercase">
                                    Código Medicamento
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-white uppercase">
                                    Descripción
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold tracking-wider text-center text-white uppercase">
                                    Estado
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold tracking-wider text-center text-white uppercase">
                                    Acción
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            { loading ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <RefreshCw className="w-10 h-10 mb-4 text-blue-500 animate-spin" />
                                            <p className="font-medium text-gray-600">Cargando medicamentos...</p>
                                            <p className="mt-1 text-sm text-gray-400">Por favor espere</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <FileText className="w-12 h-12 mb-4 text-gray-300" />
                                            <p className="text-lg font-medium text-gray-600">No se encontraron medicamentos</p>
                                            <p className="mt-1 text-sm text-gray-400">
                                                {(debouncedCodigo || debouncedDescripcion) 
                                                    ? 'Intenta con otros términos de búsqueda o ajusta los filtros' 
                                                    : 'No hay medicamentos registrados'}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredData.map((item, index) => (
                                    <tr 
                                        key={ item.idMedicamento } 
                                        className={ `hover:bg-blue-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}` }
                                    >
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                { item.codMedicamento }
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-900">
                                                { item.descMedicamento }
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 text-center whitespace-nowrap">
                                            <div className="flex items-center justify-center">
                                                <button
                                                    onClick={ () => handleToggleStatus(item) }
                                                    className={ `relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                                        item.statMedicamento === 'A'
                                                            ? 'bg-emerald-500 focus:ring-emerald-500'
                                                            : 'bg-gray-300 focus:ring-gray-400'
                                                    }` }
                                                >
                                                    <span
                                                        className={ `inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
                                                            item.statMedicamento === 'A' ? 'translate-x-6' : 'translate-x-1'
                                                        }` }
                                                    />
                                                </button>
                                                <span className={ `ml-2 text-xs font-semibold ${item.statMedicamento === 'A' ? 'text-emerald-600' : 'text-gray-500'}` }>
                                                    { item.statMedicamento === 'A' ? 'ACTIVO' : 'INACTIVO' }
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center justify-center gap-1">
                                                {/* Botón Ver Detalle */}
                                                <div className="relative group">
                                                    <button
                                                        onClick={ () => handleOpenView(item) }
                                                        className="p-2 text-gray-500 transition-all duration-200 rounded-lg hover:bg-gray-100 hover:text-gray-700"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <span className="absolute z-10 px-2 py-1 mb-2 text-xs font-medium text-white transition-opacity duration-200 -translate-x-1/2 bg-gray-800 rounded-md opacity-0 pointer-events-none bottom-full left-1/2 group-hover:opacity-100 whitespace-nowrap">
                                                        Ver detalle
                                                    </span>
                                                </div>

                                                {/* Botón Editar */}
                                                <div className="relative group">
                                                    <button
                                                        onClick={ () => handleOpenEdit(item) }
                                                        className="p-2 text-gray-500 transition-all duration-200 rounded-lg hover:bg-gray-100 hover:text-gray-700"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <span className="absolute z-10 px-2 py-1 mb-2 text-xs font-medium text-white transition-opacity duration-200 -translate-x-1/2 bg-gray-800 rounded-md opacity-0 pointer-events-none bottom-full left-1/2 group-hover:opacity-100 whitespace-nowrap">
                                                        Editar
                                                    </span>
                                                </div>

                                                {/* Botón Eliminar */}
                                                <div className="relative group">
                                                    <button
                                                        onClick={ () => handleOpenDelete(item) }
                                                        className="p-2 text-gray-500 transition-all duration-200 rounded-lg hover:bg-red-100 hover:text-red-600"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                    <span className="absolute z-10 px-2 py-1 mb-2 text-xs font-medium text-white transition-opacity duration-200 -translate-x-1/2 bg-gray-800 rounded-md opacity-0 pointer-events-none bottom-full left-1/2 group-hover:opacity-100 whitespace-nowrap">
                                                        Eliminar
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) }
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Paginación */}
            {!loading && totalPages > 0 && (
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                    <PaginationControls
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalElements={totalElements}
                        pageSize={pageSize}
                        onPageChange={handlePageChange}
                        loading={loading}
                    />
                </div>
            )}

            {/* Modal Crear/Editar - Diseño Profesional */}
            { showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-2xl my-8 overflow-hidden duration-200 bg-white shadow-2xl rounded-3xl animate-in fade-in zoom-in">
                        {/* Header con gradiente profesional */}
                        <div className="relative px-8 py-8 bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600">
                            <button 
                                onClick={ () => setShowModal(false) } 
                                className="absolute top-5 right-5 p-2.5 text-white hover:bg-white/20 rounded-xl transition-all backdrop-blur-sm z-10 hover:scale-110"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="flex items-start gap-6">
                                {/* Icono principal */}
                                <div className="flex-shrink-0">
                                    <div className="flex items-center justify-center w-20 h-20 text-white border-4 shadow-2xl rounded-2xl bg-white/20 backdrop-blur-md border-white/40 ring-4 ring-white/20">
                                        { modalMode === 'create' ? (
                                            <Plus className="w-10 h-10" />
                                        ) : (
                                            <Edit2 className="w-10 h-10" />
                                        ) }
                                    </div>
                                </div>

                                {/* Información principal */}
                                <div className="flex-1 text-white">
                                    <h3 className="mb-2 text-2xl font-bold">
                                        { modalMode === 'create' ? 'Nuevo Medicamento Medicamento' : 'Editar Medicamento Medicamento' }
                                    </h3>
                                    <p className="text-sm text-blue-100">
                                        { modalMode === 'create' 
                                            ? 'Completa el formulario para crear un nuevo medicamento médico' 
                                            : 'Modifica los datos del medicamento seleccionado' 
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Formulario */}
                        <form onSubmit={ handleSubmit } className="p-8 space-y-6 bg-gradient-to-br from-gray-50 to-white">
                            {/* Código Medicamento */}
                            <div>
                                <label className="flex items-center gap-2 mb-2 text-sm font-semibold text-gray-700">
                                    <div className="p-1.5 bg-blue-100 rounded-lg">
                                        <FileText className="w-4 h-4 text-blue-700" />
                                    </div>
                                    Código Medicamento <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={ formData.codMedicamento }
                                    onChange={ (e) => setFormData({ ...formData, codMedicamento: e.target.value }) }
                                    className="w-full px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:border-gray-300 focus:shadow-md"
                                    placeholder="Ej: 100010001, 100010002, 100010003..."
                                    required
                                />
                                <p className="mt-1.5 text-xs text-gray-500">Ingresa el código Medicamento único del medicamento</p>
                            </div>

                            {/* Descripción */}
                            <div>
                                <label className="flex items-center gap-2 mb-2 text-sm font-semibold text-gray-700">
                                    <div className="p-1.5 bg-indigo-100 rounded-lg">
                                        <FileText className="w-4 h-4 text-indigo-700" />
                                    </div>
                                    Descripción <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={ formData.descMedicamento }
                                    onChange={ (e) => setFormData({ ...formData, descMedicamento: e.target.value }) }
                                    className="w-full px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:border-gray-300 focus:shadow-md resize-none"
                                    placeholder="Ej: Anestesia para medicamentos en glándulas salivales, incluyendo biopsia..."
                                    rows={ 4 }
                                    required
                                />
                                <p className="mt-1.5 text-xs text-gray-500">Describe detalladamente el medicamento médico</p>
                            </div>

                            {/* Estado */}
                            <div>
                                <label className="flex items-center gap-2 mb-2 text-sm font-semibold text-gray-700">
                                    <div className="p-1.5 bg-green-100 rounded-lg">
                                        <Check className="w-4 h-4 text-green-700" />
                                    </div>
                                    Estado
                                </label>
                                <select
                                    value={ formData.statMedicamento }
                                    onChange={ (e) => setFormData({ ...formData, statMedicamento: e.target.value }) }
                                    className="w-full px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:border-gray-300 focus:shadow-md"
                                >
                                    <option value="A">Activo</option>
                                    <option value="I">Inactivo</option>
                                </select>
                                <p className="mt-1.5 text-xs text-gray-500">Selecciona el estado del medicamento</p>
                            </div>

                            {/* Botones de acción */}
                            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={ () => setShowModal(false) }
                                    className="px-6 py-3 font-semibold text-gray-700 transition-all bg-white border-2 border-gray-300 shadow-sm rounded-xl hover:bg-gray-50 hover:border-gray-400"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={ loading }
                                    className="flex items-center gap-2 px-6 py-3 font-semibold text-white transition-all shadow-md bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    { loading ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                            Guardando...
                                        </>
                                    ) : (
                                        <>
                                            <Check className="w-4 h-4" />
                                            Guardar
                                        </>
                                    ) }
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            ) }

            {/* Modal Ver Detalles - Diseño Profesional */}
            { showViewModal && selectedItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-3xl my-8 overflow-hidden duration-200 bg-white shadow-2xl rounded-3xl animate-in fade-in zoom-in">
                        {/* Header con gradiente profesional */}
                        <div className="relative px-8 py-8 bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600">
                            <button 
                                onClick={ () => setShowViewModal(false) } 
                                className="absolute top-5 right-5 p-2.5 text-white hover:bg-white/20 rounded-xl transition-all backdrop-blur-sm z-10 hover:scale-110"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="flex items-start gap-6">
                                {/* Icono principal */}
                                <div className="flex-shrink-0">
                                    <div className="flex items-center justify-center w-20 h-20 text-white border-4 shadow-2xl rounded-2xl bg-white/20 backdrop-blur-md border-white/40 ring-4 ring-white/20">
                                        <FileText className="w-10 h-10" />
                                    </div>
                                </div>

                                {/* Información principal */}
                                <div className="flex-1 text-white">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-2xl font-bold">Detalles del Medicamento</h3>
                                        <span className={ `inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg ${
                                            selectedItem.statMedicamento === 'A'
                                                ? 'bg-emerald-500/90 text-white border border-emerald-400/50'
                                                : 'bg-gray-500/90 text-white border border-gray-400/50'
                                        }` }>
                                            { selectedItem.statMedicamento === 'A' ? (
                                                <>
                                                    <Check className="w-3.5 h-3.5" />
                                                    ACTIVO
                                                </>
                                            ) : (
                                                <>
                                                    <X className="w-3.5 h-3.5" />
                                                    INACTIVO
                                                </>
                                            ) }
                                        </span>
                                    </div>
                                    <p className="mb-1 text-sm text-blue-100">Código Medicamento: <span className="font-bold text-white">{ selectedItem.codMedicamento }</span></p>
                                </div>
                            </div>
                        </div>

                        {/* Contenido del modal */}
                        <div className="p-8 bg-gradient-to-br from-gray-50 to-white">
                            {/* Descripción destacada */}
                            <div className="p-6 mb-6 bg-white border-2 border-blue-100 shadow-sm rounded-xl">
                                <div className="flex items-start gap-3 mb-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <FileText className="w-5 h-5 text-blue-700" />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                                            Descripción del Medicamento
                                        </label>
                                        <p className="text-base font-medium leading-relaxed text-gray-800">
                                            { selectedItem.descMedicamento }
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Información adicional en grid */}
                            <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2">
                                {/* Código Medicamento */}
                                <div className="p-5 transition-shadow bg-white border border-gray-200 shadow-sm rounded-xl hover:shadow-md">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-indigo-100 rounded-lg">
                                            <FileText className="w-4 h-4 text-indigo-700" />
                                        </div>
                                        <label className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                                            Código Medicamento
                                        </label>
                                    </div>
                                    <p className="text-lg font-bold text-gray-900">{ selectedItem.codMedicamento }</p>
                                </div>

                                {/* Estado */}
                                <div className="p-5 transition-shadow bg-white border border-gray-200 shadow-sm rounded-xl hover:shadow-md">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-green-100 rounded-lg">
                                            <Check className="w-4 h-4 text-green-700" />
                                        </div>
                                        <label className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                                            Estado
                                        </label>
                                    </div>
                                    <span className={ `inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold ${
                                        selectedItem.statMedicamento === 'A'
                                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                                            : 'bg-gray-100 text-gray-600 border border-gray-300'
                                    }` }>
                                        { selectedItem.statMedicamento === 'A' ? (
                                            <>
                                                <Check className="w-4 h-4" />
                                                ACTIVO
                                            </>
                                        ) : (
                                            <>
                                                <X className="w-4 h-4" />
                                                INACTIVO
                                            </>
                                        ) }
                                    </span>
                                </div>

                                {/* Fecha de creación */}
                                <div className="p-5 transition-shadow bg-white border border-gray-200 shadow-sm rounded-xl hover:shadow-md">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 rounded-lg bg-amber-100">
                                            <Calendar className="w-4 h-4 text-amber-700" />
                                        </div>
                                        <label className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                                            Fecha de Creación
                                        </label>
                                    </div>
                                    <p className="text-lg font-semibold text-gray-900">
                                        { selectedItem.createdAt 
                                            ? new Date(selectedItem.createdAt).toLocaleDateString('es-PE', { 
                                                year: 'numeric', 
                                                month: 'long', 
                                                day: 'numeric' 
                                            })
                                            : 'No disponible' 
                                        }
                                    </p>
                                    { selectedItem.updatedAt && selectedItem.updatedAt !== selectedItem.createdAt && (
                                        <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                                            <Clock className="w-3 h-3" />
                                            <span>Actualizado: { new Date(selectedItem.updatedAt).toLocaleDateString('es-PE') }</span>
                                        </div>
                                    ) }
                                </div>
                            </div>

                            {/* Acciones */}
                            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
                                <button
                                    onClick={ () => {
                                        setShowViewModal(false);
                                        handleOpenEdit(selectedItem);
                                    } }
                                    className="flex items-center gap-2 px-5 py-2.5 text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-all font-medium shadow-sm"
                                >
                                    <Edit2 className="w-4 h-4" />
                                    Editar
                                </button>
                                <button
                                    onClick={ () => setShowViewModal(false) }
                                    className="px-6 py-2.5 text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-semibold shadow-md"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) }

            {/* Modal Confirmar Eliminación - Diseño Profesional */}
            { showDeleteModal && selectedItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-lg my-8 overflow-hidden duration-200 bg-white shadow-2xl rounded-3xl animate-in fade-in zoom-in">
                        {/* Header con gradiente rojo */}
                        <div className="relative px-8 py-8 bg-gradient-to-br from-red-600 via-red-500 to-rose-600">
                            <button 
                                onClick={ () => setShowDeleteModal(false) } 
                                className="absolute top-5 right-5 p-2.5 text-white hover:bg-white/20 rounded-xl transition-all backdrop-blur-sm z-10 hover:scale-110"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="flex items-start gap-6">
                                {/* Icono principal */}
                                <div className="flex-shrink-0">
                                    <div className="flex items-center justify-center w-20 h-20 text-white border-4 shadow-2xl rounded-2xl bg-white/20 backdrop-blur-md border-white/40 ring-4 ring-white/20">
                                        <Trash2 className="w-10 h-10" />
                                    </div>
                                </div>

                                {/* Información principal */}
                                <div className="flex-1 text-white">
                                    <h3 className="mb-2 text-2xl font-bold">
                                        ¿Eliminar Medicamento?
                                    </h3>
                                    <p className="text-sm text-red-100">
                                        Esta acción no se puede deshacer
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Contenido del modal */}
                        <div className="p-8 bg-gradient-to-br from-gray-50 to-white">
                            {/* Alerta de advertencia */}
                            <div className="p-5 mb-6 border-2 border-red-200 bg-red-50 rounded-xl">
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 p-2 bg-red-100 rounded-lg">
                                        <AlertCircle className="w-5 h-5 text-red-600" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="mb-1 font-semibold text-red-900">Advertencia</h4>
                                        <p className="text-sm text-red-700">
                                            Estás a punto de eliminar permanentemente este medicamento. Esta acción no se puede revertir.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Información del medicamento a eliminar */}
                            <div className="p-6 mb-6 bg-white border-2 border-gray-200 shadow-sm rounded-xl">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 p-3 bg-gray-100 rounded-xl">
                                        <FileText className="w-6 h-6 text-gray-600" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="mb-3">
                                            <label className="block mb-1 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                                                Código Medicamento
                                            </label>
                                            <p className="text-lg font-bold text-gray-900">{ selectedItem.codMedicamento }</p>
                                        </div>
                                        <div>
                                            <label className="block mb-1 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                                                Descripción
                                            </label>
                                            <p className="text-sm leading-relaxed text-gray-700">
                                                { selectedItem.descMedicamento }
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Botones de acción */}
                            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
                                <button
                                    onClick={ () => setShowDeleteModal(false) }
                                    className="px-6 py-3 font-semibold text-gray-700 transition-all bg-white border-2 border-gray-300 shadow-sm rounded-xl hover:bg-gray-50 hover:border-gray-400"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={ handleDelete }
                                    disabled={ loading }
                                    className="flex items-center gap-2 px-6 py-3 font-semibold text-white transition-all shadow-md bg-gradient-to-r from-red-600 to-red-700 rounded-xl hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    { loading ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                            Eliminando...
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 className="w-4 h-4" />
                                            Eliminar Permanentemente
                                        </>
                                    ) }
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) }
        </div>
    );
};

export default Medicamentos;

/**
 * 📦 Componente CRUD para gestión de Tipos de Bolsas
 *
 * Este componente permite administrar los tipos/categorías de bolsas de pacientes
 * almacenados en la tabla dim_tipos_bolsas.
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
    Package,
    Calendar,
    Clock
} from 'lucide-react';
import tiposBolsasService from '../../../services/tiposBolsasService';
import PaginationControls from '../../user/components/PaginationControls';

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
const TiposBolsas = () => {
    // Estado
    const [tiposBolsas, setTiposBolsas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filtros de búsqueda separados
    const [filtroCodigo, setFiltroCodigo] = useState('');
    const [filtroDescripcion, setFiltroDescripcion] = useState('');
    const [debouncedCodigo, setDebouncedCodigo] = useState('');
    const [debouncedDescripcion, setDebouncedDescripcion] = useState('');

    // Paginación
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize] = useState(30);
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // Modales
    const [showModal, setShowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
    const [selectedItem, setSelectedItem] = useState(null);

    // Notificaciones
    const [notification, setNotification] = useState(null);

    // Formulario
    const [formData, setFormData] = useState({
        codTipoBolsa: '',
        descTipoBolsa: ''
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
    // DATOS INICIALES PRECARGADOS DESDE BD
    // ============================================================
    const TIPOS_BOLSAS_INICIALES = [
        {
            idTipoBolsa: 1,
            codTipoBolsa: 'BOLSA_107',
            descTipoBolsa: 'Bolsa 107 - Importación de pacientes masiva',
            statTipoBolsa: 'A',
            createdAt: '2026-01-22T15:40:46.552396-05:00',
            updatedAt: '2026-01-22T15:40:46.552396-05:00'
        },
        {
            idTipoBolsa: 2,
            codTipoBolsa: 'BOLSA_DENGUE',
            descTipoBolsa: 'Bolsa Dengue - Control epidemiológico',
            statTipoBolsa: 'A',
            createdAt: '2026-01-22T15:40:46.552396-05:00',
            updatedAt: '2026-01-22T15:40:46.552396-05:00'
        },
        {
            idTipoBolsa: 3,
            codTipoBolsa: 'BOLSAS_ENFERMERIA',
            descTipoBolsa: 'Bolsas Enfermería - Atenciones de enfermería',
            statTipoBolsa: 'A',
            createdAt: '2026-01-22T15:40:46.552396-05:00',
            updatedAt: '2026-01-22T15:40:46.552396-05:00'
        },
        {
            idTipoBolsa: 4,
            codTipoBolsa: 'BOLSAS_EXPLOTADATOS',
            descTipoBolsa: 'Bolsas Explotación de Datos - Análisis y reportes',
            statTipoBolsa: 'A',
            createdAt: '2026-01-22T15:40:46.552396-05:00',
            updatedAt: '2026-01-22T15:40:46.552396-05:00'
        },
        {
            idTipoBolsa: 5,
            codTipoBolsa: 'BOLSAS_IVR',
            descTipoBolsa: 'Bolsas IVR - Sistema interactivo de respuesta de voz',
            statTipoBolsa: 'A',
            createdAt: '2026-01-22T15:40:46.552396-05:00',
            updatedAt: '2026-01-22T15:40:46.552396-05:00'
        },
        {
            idTipoBolsa: 6,
            codTipoBolsa: 'BOLSAS_REPROGRAMACION',
            descTipoBolsa: 'Bolsas Reprogramación - Citas reprogramadas',
            statTipoBolsa: 'A',
            createdAt: '2026-01-22T15:40:46.552396-05:00',
            updatedAt: '2026-01-22T15:40:46.552396-05:00'
        },
        {
            idTipoBolsa: 7,
            codTipoBolsa: 'BOLSA_GESTORES_TERRITORIAL',
            descTipoBolsa: 'Bolsa Gestores Territorial - Gestión territorial',
            statTipoBolsa: 'A',
            createdAt: '2026-01-22T15:40:46.552396-05:00',
            updatedAt: '2026-01-22T15:40:46.552396-05:00'
        }
    ];

    // ============================================================
    // CARGAR DATOS CON BÚSQUEDA EN BACKEND
    // ============================================================
    const loadData = useCallback(async () => {
        const codBusqueda = debouncedCodigo.trim() || null;
        const descBusqueda = debouncedDescripcion.trim() || null;

        console.log('🔵 [TiposBolsas] Iniciando carga de datos paginados...', {
            page: currentPage,
            size: pageSize,
            codigo: codBusqueda,
            descripcion: descBusqueda
        });
        setLoading(true);
        setError(null);
        try {
            const response = await tiposBolsasService.buscar(
                codBusqueda,
                descBusqueda,
                currentPage,
                pageSize
            );

            if (Array.isArray(response)) {
                const startIndex = currentPage * pageSize;
                const endIndex = startIndex + pageSize;
                setTiposBolsas(response.slice(startIndex, endIndex));
                setTotalElements(response.length);
                setTotalPages(Math.ceil(response.length / pageSize));
                console.log('✅ [TiposBolsas] Datos cargados (array):', response.slice(startIndex, endIndex).length, 'de', response.length);
            } else {
                setTiposBolsas(response.content || []);
                setTotalElements(response.totalElements || 0);
                setTotalPages(response.totalPages || 0);
                console.log('✅ [TiposBolsas] Datos cargados (Page):', response.content?.length || 0, 'de', response.totalElements || 0);
            }
        } catch (err) {
            console.error('❌ [TiposBolsas] Error al cargar del backend:', err);
            // Cargar datos iniciales como fallback
            console.log('📦 Cargando datos iniciales desde BD como fallback...');
            setTiposBolsas(TIPOS_BOLSAS_INICIALES);
            setTotalElements(TIPOS_BOLSAS_INICIALES.length);
            setTotalPages(1);
            setError(null); // No mostrar error si cargamos datos iniciales
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, debouncedCodigo, debouncedDescripcion]);

    // Resetear página cuando cambian los filtros
    useEffect(() => {
        setCurrentPage(0);
    }, [debouncedCodigo, debouncedDescripcion]);

    // Auto-dismiss notification after 4 seconds
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => {
                setNotification(null);
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    // Cargar datos cuando cambian los parámetros
    useEffect(() => {
        loadData();
    }, [currentPage, pageSize, debouncedCodigo, debouncedDescripcion, loadData]);

    // ============================================================
    // DATOS FILTRADOS
    // ============================================================
    const filteredData = tiposBolsas;

    // ============================================================
    // HANDLER DE CAMBIO DE PÁGINA
    // ============================================================
    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // ============================================================
    // HANDLERS
    // ============================================================
    const handleOpenCreate = () => {
        setFormData({ codTipoBolsa: '', descTipoBolsa: '' });
        setModalMode('create');
        setShowModal(true);
    };

    const handleOpenEdit = (item) => {
        setFormData({
            codTipoBolsa: item.codTipoBolsa || '',
            descTipoBolsa: item.descTipoBolsa || ''
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
        setError(null);
        try {
            if (modalMode === 'create') {
                // 📝 Crear: llamar API y recargar si es exitoso
                const resultado = await tiposBolsasService.crear(formData);
                console.log('✅ Tipo de bolsa creado en backend:', resultado);

                // 🎉 Mostrar notificación de éxito
                setNotification({
                    type: 'success',
                    title: '✅ Tipo de Bolsa Creado',
                    message: `"${formData.codTipoBolsa}" ha sido creado exitosamente`
                });

                // Limpiar formulario y cerrar modal
                setShowModal(false);
                setFormData({ codTipoBolsa: '', descTipoBolsa: '' });

                // 🔄 Recargar datos desde el backend
                await new Promise(resolve => setTimeout(resolve, 500)); // Pequeño delay
                await loadData();
                console.log('🔄 Datos recargados después de crear');
            } else {
                // 📝 Actualizar: llamar API y recargar si es exitoso
                const resultado = await tiposBolsasService.actualizar(selectedItem.idTipoBolsa, formData);
                console.log('✅ Tipo de bolsa actualizado en backend:', resultado);

                // 🎉 Mostrar notificación de éxito
                setNotification({
                    type: 'success',
                    title: '✅ Tipo de Bolsa Actualizado',
                    message: `"${formData.codTipoBolsa}" ha sido actualizado exitosamente`
                });

                // Limpiar formulario y cerrar modal
                setShowModal(false);
                setFormData({ codTipoBolsa: '', descTipoBolsa: '' });

                // 🔄 Recargar datos desde el backend
                await new Promise(resolve => setTimeout(resolve, 500)); // Pequeño delay
                await loadData();
                console.log('🔄 Datos recargados después de actualizar');
            }
        } catch (err) {
            // ❌ Error: mostrar mensaje sin fallback local
            console.error('❌ Error al guardar:', err);
            const errorMsg = err.response?.data?.message || err.message || 'Error al guardar el tipo de bolsa';
            setError(errorMsg);
            setNotification({
                type: 'error',
                title: '❌ Error al Guardar',
                message: errorMsg
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        setLoading(true);
        try {
            // Eliminar: llamar API y recargar si es exitoso
            await tiposBolsasService.eliminar(selectedItem.idTipoBolsa);
            console.log('✅ Tipo de bolsa eliminado en backend');

            // Cerrar modal de confirmación
            setShowDeleteModal(false);

            // 🔄 Recargar datos desde el backend
            await loadData();
            console.log('🔄 Datos recargados después de eliminar');
        } catch (err) {
            console.error('❌ Error al eliminar:', err);
            const errorMsg = err.response?.data?.message || err.message || 'No se puede eliminar. El tipo de bolsa está siendo utilizado.';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (item) => {
        const nuevoEstado = item.statTipoBolsa === 'A' ? 'I' : 'A';
        try {
            // Cambiar estado: llamar API y recargar si es exitoso
            await tiposBolsasService.cambiarEstado(item.idTipoBolsa, nuevoEstado);
            console.log('✅ Estado cambiado en backend');

            // 🔄 Recargar datos desde el backend
            await loadData();
            console.log('🔄 Datos recargados después de cambiar estado');
        } catch (err) {
            console.error('❌ Error al cambiar estado:', err);
            const errorMsg = err.response?.data?.message || err.message || 'Error al cambiar el estado del tipo de bolsa.';
            setError(errorMsg);
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
                            <Package className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Tipos de Bolsas</h2>
                            <p className="text-sm text-gray-500">Catálogo de categorías de bolsas de pacientes</p>
                            <p className="text-xs text-green-600 font-medium mt-1 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                Actualizado al 22/01/2026
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={loadData}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 text-gray-600 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            Actualizar
                        </button>
                        <button
                            onClick={handleOpenCreate}
                            className="flex items-center gap-2 px-4 py-2 text-white transition-all rounded-lg shadow-md bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                        >
                            <Plus className="w-4 h-4" />
                            Nuevo Tipo de Bolsa
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
                    <p className="mt-1 text-xs text-gray-500">Busca por código o descripción. Puedes usar ambos filtros simultáneamente.</p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* Filtro por Código */}
                    <div className="relative">
                        <label className="block mb-2 text-sm font-semibold text-gray-700">
                            <span className="flex items-center gap-2">
                                <div className="p-1.5 bg-blue-100 rounded-md">
                                    <Package className="w-3.5 h-3.5 text-blue-700" />
                                </div>
                                Código del Tipo de Bolsa
                            </span>
                        </label>
                        <div className="relative group">
                            <Search className="absolute w-5 h-5 text-gray-400 transition-colors transform -translate-y-1/2 left-3 top-1/2 group-focus-within:text-blue-500" />
                            <input
                                type="text"
                                placeholder="Ej: BOLSA_107, BOLSA_DENGUE..."
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
                                    <Package className="w-3.5 h-3.5 text-blue-700" />
                                </div>
                                Descripción
                            </span>
                        </label>
                        <div className="relative group">
                            <Search className="absolute w-5 h-5 text-gray-400 transition-colors transform -translate-y-1/2 left-3 top-1/2 group-focus-within:text-blue-500" />
                            <input
                                type="text"
                                placeholder="Ej: Importación, Dengue, Enfermería..."
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
            {error && (
                <div className="flex items-center gap-2 p-4 mx-4 mt-4 text-red-700 border border-red-200 rounded-lg bg-red-50">
                    <AlertCircle className="w-5 h-5" />
                    {error}
                    <button onClick={() => setError(null)} className="ml-auto">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Toast Notification */}
            {notification && (
                <div
                    className={`fixed top-6 right-6 z-[9999] p-6 rounded-xl shadow-2xl border-2 max-w-sm animate-in fade-in slide-in-from-top-5 ${
                        notification.type === 'success'
                            ? 'bg-emerald-50 border-emerald-300'
                            : 'bg-red-50 border-red-300'
                    }`}
                >
                    <div className="flex items-start gap-4">
                        <div className={`flex-shrink-0 text-2xl ${notification.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
                            {notification.type === 'success' ? '✅' : '❌'}
                        </div>
                        <div className="flex-1">
                            <h4 className={`font-bold text-sm mb-1 ${notification.type === 'success' ? 'text-emerald-900' : 'text-red-900'}`}>
                                {notification.title}
                            </h4>
                            <p className={`text-xs ${notification.type === 'success' ? 'text-emerald-700' : 'text-red-700'}`}>
                                {notification.message}
                            </p>
                        </div>
                        <button
                            onClick={() => setNotification(null)}
                            className={`flex-shrink-0 p-1.5 rounded-lg transition-colors ${
                                notification.type === 'success'
                                    ? 'hover:bg-emerald-100 text-emerald-600'
                                    : 'hover:bg-red-100 text-red-600'
                            }`}
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Tabla Estándar */}
            <div className="overflow-hidden bg-white border border-gray-100 shadow-sm rounded-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-[#0D5BA9]">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold tracking-wider text-left text-white uppercase">
                                    Código
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
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <RefreshCw className="w-10 h-10 mb-4 text-amber-500 animate-spin" />
                                            <p className="font-medium text-gray-600">Cargando tipos de bolsas...</p>
                                            <p className="mt-1 text-sm text-gray-400">Por favor espere</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <Package className="w-12 h-12 mb-4 text-gray-300" />
                                            <p className="text-lg font-medium text-gray-600">No se encontraron tipos de bolsas</p>
                                            <p className="mt-1 text-sm text-gray-400">
                                                {(debouncedCodigo || debouncedDescripcion)
                                                    ? 'Intenta con otros términos de búsqueda o ajusta los filtros'
                                                    : 'No hay tipos de bolsas registrados'}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredData.map((item, index) => (
                                    <tr
                                        key={item.idTipoBolsa}
                                        className={`hover:bg-amber-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                                    >
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                {item.codTipoBolsa}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-900">
                                                {item.descTipoBolsa}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 text-center whitespace-nowrap">
                                            <div className="flex items-center justify-center">
                                                <button
                                                    onClick={() => handleToggleStatus(item)}
                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                                        item.statTipoBolsa === 'A'
                                                            ? 'bg-emerald-500 focus:ring-emerald-500'
                                                            : 'bg-gray-300 focus:ring-gray-400'
                                                    }`}
                                                >
                                                    <span
                                                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ${
                                                            item.statTipoBolsa === 'A' ? 'translate-x-6' : 'translate-x-1'
                                                        }`}
                                                    />
                                                </button>
                                                <span className={`ml-2 text-xs font-semibold ${item.statTipoBolsa === 'A' ? 'text-emerald-600' : 'text-gray-500'}`}>
                                                    {item.statTipoBolsa === 'A' ? 'ACTIVO' : 'INACTIVO'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center justify-center gap-1">
                                                {/* Botón Ver Detalle */}
                                                <div className="relative group">
                                                    <button
                                                        onClick={() => handleOpenView(item)}
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
                                                        onClick={() => handleOpenEdit(item)}
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
                                                        onClick={() => handleOpenDelete(item)}
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
                            )}
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

            {/* Modal Crear/Editar */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-2xl my-8 overflow-hidden duration-200 bg-white shadow-2xl rounded-3xl animate-in fade-in zoom-in">
                        {/* Header con gradiente profesional */}
                        <div className="relative px-8 py-8 bg-gradient-to-br from-blue-500 via-blue-500 to-blue-600">
                            <button
                                onClick={() => setShowModal(false)}
                                className="absolute top-5 right-5 p-2.5 text-white hover:bg-white/20 rounded-xl transition-all backdrop-blur-sm z-10 hover:scale-110"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="flex items-start gap-6">
                                {/* Icono principal */}
                                <div className="flex-shrink-0">
                                    <div className="flex items-center justify-center w-20 h-20 text-white border-4 shadow-2xl rounded-2xl bg-white/20 backdrop-blur-md border-white/40 ring-4 ring-white/20">
                                        {modalMode === 'create' ? (
                                            <Plus className="w-10 h-10" />
                                        ) : (
                                            <Edit2 className="w-10 h-10" />
                                        )}
                                    </div>
                                </div>

                                {/* Información principal */}
                                <div className="flex-1 text-white">
                                    <h3 className="mb-2 text-2xl font-bold">
                                        {modalMode === 'create' ? 'Nuevo Tipo de Bolsa' : 'Editar Tipo de Bolsa'}
                                    </h3>
                                    <p className="text-sm text-amber-100">
                                        {modalMode === 'create'
                                            ? 'Completa el formulario para crear una nueva categoría de bolsa'
                                            : 'Modifica los datos del tipo de bolsa seleccionado'
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Formulario */}
                        <form onSubmit={handleSubmit} className="p-8 space-y-6 bg-gradient-to-br from-gray-50 to-white">
                            {/* Código */}
                            <div>
                                <label className="flex items-center gap-2 mb-2 text-sm font-semibold text-gray-700">
                                    <div className="p-1.5 bg-blue-100 rounded-lg">
                                        <Package className="w-4 h-4 text-blue-700" />
                                    </div>
                                    Código del Tipo de Bolsa <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.codTipoBolsa}
                                    onChange={(e) => setFormData({ ...formData, codTipoBolsa: e.target.value })}
                                    className="w-full px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:border-gray-300 focus:shadow-md"
                                    placeholder="Ej: BOLSA_107, BOLSA_DENGUE..."
                                    required
                                />
                                <p className="mt-1.5 text-xs text-gray-500">Ingresa el código único del tipo de bolsa</p>
                            </div>

                            {/* Descripción */}
                            <div>
                                <label className="flex items-center gap-2 mb-2 text-sm font-semibold text-gray-700">
                                    <div className="p-1.5 bg-blue-100 rounded-lg">
                                        <Package className="w-4 h-4 text-blue-700" />
                                    </div>
                                    Descripción <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={formData.descTipoBolsa}
                                    onChange={(e) => setFormData({ ...formData, descTipoBolsa: e.target.value })}
                                    className="w-full px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm hover:border-gray-300 focus:shadow-md resize-none"
                                    placeholder="Ej: Bolsa para importación masiva de pacientes..."
                                    rows={4}
                                    required
                                />
                                <p className="mt-1.5 text-xs text-gray-500">Describe detalladamente el tipo de bolsa</p>
                            </div>

                            {/* Botones de acción */}
                            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-6 py-3 font-semibold text-gray-700 transition-all bg-white border-2 border-gray-300 shadow-sm rounded-xl hover:bg-gray-50 hover:border-gray-400"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex items-center gap-2 px-6 py-3 font-semibold text-white transition-all shadow-md bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                            Guardando...
                                        </>
                                    ) : (
                                        <>
                                            <Check className="w-4 h-4" />
                                            Guardar
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Ver Detalles */}
            {showViewModal && selectedItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-3xl my-8 overflow-hidden duration-200 bg-white shadow-2xl rounded-3xl animate-in fade-in zoom-in">
                        {/* Header con gradiente profesional */}
                        <div className="relative px-8 py-8 bg-gradient-to-br from-blue-500 via-blue-500 to-blue-600">
                            <button
                                onClick={() => setShowViewModal(false)}
                                className="absolute top-5 right-5 p-2.5 text-white hover:bg-white/20 rounded-xl transition-all backdrop-blur-sm z-10 hover:scale-110"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="flex items-start gap-6">
                                {/* Icono principal */}
                                <div className="flex-shrink-0">
                                    <div className="flex items-center justify-center w-20 h-20 text-white border-4 shadow-2xl rounded-2xl bg-white/20 backdrop-blur-md border-white/40 ring-4 ring-white/20">
                                        <Package className="w-10 h-10" />
                                    </div>
                                </div>

                                {/* Información principal */}
                                <div className="flex-1 text-white">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-2xl font-bold">Detalles del Tipo de Bolsa</h3>
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg ${
                                            selectedItem.statTipoBolsa === 'A'
                                                ? 'bg-emerald-500/90 text-white border border-emerald-400/50'
                                                : 'bg-gray-500/90 text-white border border-gray-400/50'
                                        }`}>
                                            {selectedItem.statTipoBolsa === 'A' ? (
                                                <>
                                                    <Check className="w-3.5 h-3.5" />
                                                    ACTIVO
                                                </>
                                            ) : (
                                                <>
                                                    <X className="w-3.5 h-3.5" />
                                                    INACTIVO
                                                </>
                                            )}
                                        </span>
                                    </div>
                                    <p className="mb-1 text-sm text-amber-100">Código: <span className="font-bold text-white">{selectedItem.codTipoBolsa}</span></p>
                                </div>
                            </div>
                        </div>

                        {/* Contenido del modal */}
                        <div className="p-8 bg-gradient-to-br from-gray-50 to-white">
                            {/* Descripción destacada */}
                            <div className="p-6 mb-6 bg-white border-2 border-blue-100 shadow-sm rounded-xl">
                                <div className="flex items-start gap-3 mb-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Package className="w-5 h-5 text-blue-700" />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                                            Descripción
                                        </label>
                                        <p className="text-base font-medium leading-relaxed text-gray-800">
                                            {selectedItem.descTipoBolsa}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Información adicional en grid */}
                            <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2">
                                {/* Código */}
                                <div className="p-5 transition-shadow bg-white border border-gray-200 shadow-sm rounded-xl hover:shadow-md">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <Package className="w-4 h-4 text-blue-700" />
                                        </div>
                                        <label className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                                            Código
                                        </label>
                                    </div>
                                    <p className="text-lg font-bold text-gray-900">{selectedItem.codTipoBolsa}</p>
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
                                    <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold ${
                                        selectedItem.statTipoBolsa === 'A'
                                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                                            : 'bg-gray-100 text-gray-600 border border-gray-300'
                                    }`}>
                                        {selectedItem.statTipoBolsa === 'A' ? (
                                            <>
                                                <Check className="w-4 h-4" />
                                                ACTIVO
                                            </>
                                        ) : (
                                            <>
                                                <X className="w-4 h-4" />
                                                INACTIVO
                                            </>
                                        )}
                                    </span>
                                </div>

                                {/* Fecha de creación */}
                                <div className="p-5 transition-shadow bg-white border border-gray-200 shadow-sm rounded-xl hover:shadow-md">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 rounded-lg bg-blue-100">
                                            <Calendar className="w-4 h-4 text-blue-700" />
                                        </div>
                                        <label className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                                            Fecha de Creación
                                        </label>
                                    </div>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {selectedItem.createdAt
                                            ? new Date(selectedItem.createdAt).toLocaleDateString('es-PE', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })
                                            : 'No disponible'
                                        }
                                    </p>
                                    {selectedItem.updatedAt && selectedItem.updatedAt !== selectedItem.createdAt && (
                                        <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                                            <Clock className="w-3 h-3" />
                                            <span>Actualizado: {new Date(selectedItem.updatedAt).toLocaleDateString('es-PE')}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Acciones */}
                            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
                                <button
                                    onClick={() => {
                                        setShowViewModal(false);
                                        handleOpenEdit(selectedItem);
                                    }}
                                    className="flex items-center gap-2 px-5 py-2.5 text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-all font-medium shadow-sm"
                                >
                                    <Edit2 className="w-4 h-4" />
                                    Editar
                                </button>
                                <button
                                    onClick={() => setShowViewModal(false)}
                                    className="px-6 py-2.5 text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all font-semibold shadow-md"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Confirmar Eliminación */}
            {showDeleteModal && selectedItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-lg my-8 overflow-hidden duration-200 bg-white shadow-2xl rounded-3xl animate-in fade-in zoom-in">
                        {/* Header con gradiente rojo */}
                        <div className="relative px-8 py-8 bg-gradient-to-br from-red-600 via-red-500 to-rose-600">
                            <button
                                onClick={() => setShowDeleteModal(false)}
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
                                        ¿Eliminar Tipo de Bolsa?
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
                                            Estás a punto de eliminar permanentemente este tipo de bolsa. Esta acción no se puede revertir.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Información del tipo de bolsa a eliminar */}
                            <div className="p-6 mb-6 bg-white border-2 border-gray-200 shadow-sm rounded-xl">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 p-3 bg-gray-100 rounded-xl">
                                        <Package className="w-6 h-6 text-gray-600" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="mb-3">
                                            <label className="block mb-1 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                                                Código
                                            </label>
                                            <p className="text-lg font-bold text-gray-900">{selectedItem.codTipoBolsa}</p>
                                        </div>
                                        <div>
                                            <label className="block mb-1 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                                                Descripción
                                            </label>
                                            <p className="text-sm leading-relaxed text-gray-700">
                                                {selectedItem.descTipoBolsa}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Botones de acción */}
                            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="px-6 py-3 font-semibold text-gray-700 transition-all bg-white border-2 border-gray-300 shadow-sm rounded-xl hover:bg-gray-50 hover:border-gray-400"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={loading}
                                    className="flex items-center gap-2 px-6 py-3 font-semibold text-white transition-all shadow-md bg-gradient-to-r from-red-600 to-red-700 rounded-xl hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                            Eliminando...
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 className="w-4 h-4" />
                                            Eliminar Permanentemente
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TiposBolsas;

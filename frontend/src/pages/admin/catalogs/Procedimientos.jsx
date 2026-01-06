/**
 * 🏥 Componente CRUD para gestión de Procedimientos CPT
 * 
 * Este componente permite administrar los procedimientos médicos CPT
 * almacenados en la tabla dim_proced.
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
    FileText
} from 'lucide-react';
import procedimientosService from '../../../services/procedimientosService';

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
const Procedimientos = () => {
    // Estado
    const [procedimientos, setProcedimientos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Modales
    const [showModal, setShowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
    const [selectedItem, setSelectedItem] = useState(null);

    // Formulario
    const [formData, setFormData] = useState({
        codProced: '',
        descProced: '',
        statProced: 'A'
    });

    // ============================================================
    // CARGAR DATOS
    // ============================================================
    const loadData = useCallback(async () => {
        console.log('🔵 [Procedimientos] Iniciando carga de datos...');
        setLoading(true);
        setError(null);
        try {
            const data = await procedimientosService.obtenerTodos();
            setProcedimientos(data || []);
            console.log('✅ [Procedimientos] Datos cargados:', data?.length || 0);
        } catch (err) {
            console.error('❌ [Procedimientos] Error al cargar:', err);
            setError('Error al cargar los procedimientos. Por favor, intente nuevamente.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // ============================================================
    // FILTRAR DATOS
    // ============================================================
    const filteredData = procedimientos.filter(item => {
        const search = searchTerm.toLowerCase();
        return (
            item.codProced?.toLowerCase().includes(search) ||
            item.descProced?.toLowerCase().includes(search)
        );
    });

    // ============================================================
    // HANDLERS
    // ============================================================
    const handleOpenCreate = () => {
        setFormData({ codProced: '', descProced: '', statProced: 'A' });
        setModalMode('create');
        setShowModal(true);
    };

    const handleOpenEdit = (item) => {
        setFormData({
            codProced: item.codProced || '',
            descProced: item.descProced || '',
            statProced: item.statProced || 'A'
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
                await procedimientosService.crear(formData);
            } else {
                await procedimientosService.actualizar(selectedItem.idProced, formData);
            }
            setShowModal(false);
            loadData();
        } catch (err) {
            console.error('Error al guardar:', err);
            setError('Error al guardar el procedimiento.');
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        setLoading(true);
        try {
            await procedimientosService.eliminar(selectedItem.idProced);
            setShowDeleteModal(false);
            loadData();
        } catch (err) {
            console.error('Error al eliminar:', err);
            setError('No se puede eliminar. El procedimiento está siendo utilizado.');
            setLoading(false);
        }
    };

    const handleToggleStatus = async (item) => {
        const nuevoEstado = item.statProced === 'A' ? 'I' : 'A';
        try {
            await procedimientosService.cambiarEstado(item.idProced, nuevoEstado);
            loadData();
        } catch (err) {
            console.error('Error al cambiar estado:', err);
            setError('Error al cambiar el estado del procedimiento.');
        }
    };

    // ============================================================
    // RENDER
    // ============================================================
    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Header */ }
            <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                            <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">Procedimientos CPT</h2>
                            <p className="text-sm text-gray-500">Catálogo de procedimientos médicos</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={ loadData }
                            disabled={ loading }
                            className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            <RefreshCw className={ `w-4 h-4 ${loading ? 'animate-spin' : ''}` } />
                            Actualizar
                        </button>
                        <button
                            onClick={ handleOpenCreate }
                            className="flex items-center gap-2 px-4 py-2 text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-md"
                        >
                            <Plus className="w-4 h-4" />
                            Nuevo Procedimiento
                        </button>
                    </div>
                </div>
            </div>

            {/* Buscador */ }
            <div className="p-4 border-b border-gray-100">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por código o descripción..."
                        value={ searchTerm }
                        onChange={ (e) => setSearchTerm(e.target.value) }
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                </div>
            </div>

            {/* Error */ }
            { error && (
                <div className="mx-4 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                    <AlertCircle className="w-5 h-5" />
                    { error }
                    <button onClick={ () => setError(null) } className="ml-auto">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ) }

            {/* Tabla */ }
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold">CÓDIGO</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold">DESCRIPCIÓN</th>
                            <th className="px-6 py-4 text-center text-sm font-semibold">ESTADO</th>
                            <th className="px-6 py-4 text-center text-sm font-semibold">ACCIONES</th>
                        </tr>
                    </thead>
                    <tbody>
                        { loading ? (
                            <tr>
                                <td colSpan="4" className="px-6 py-12 text-center">
                                    <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
                                    <p className="mt-2 text-gray-500">Cargando procedimientos...</p>
                                </td>
                            </tr>
                        ) : filteredData.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                                    No se encontraron procedimientos
                                </td>
                            </tr>
                        ) : (
                            filteredData.map((item, index) => (
                                <tr
                                    key={ item.idProced }
                                    className={ `border-b border-gray-100 hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                                        }` }
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-100 rounded-lg">
                                                <FileText className="w-4 h-4 text-blue-600" />
                                            </div>
                                            <div>
                                                <span className="font-semibold text-gray-800">{ item.codProced }</span>
                                                <p className="text-xs text-gray-400">ID: { item.idProced }</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-gray-700 line-clamp-2">{ item.descProced }</p>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={ () => handleToggleStatus(item) }
                                            className={ `inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-colors ${item.statProced === 'A'
                                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }` }
                                        >
                                            { item.statProced === 'A' ? (
                                                <>
                                                    <Check className="w-3 h-3" />
                                                    ACTIVO
                                                </>
                                            ) : (
                                                <>
                                                    <X className="w-3 h-3" />
                                                    INACTIVO
                                                </>
                                            ) }
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={ () => handleOpenView(item) }
                                                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Ver detalles"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={ () => handleOpenEdit(item) }
                                                className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                                title="Editar"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={ () => handleOpenDelete(item) }
                                                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Eliminar"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) }
                    </tbody>
                </table>
            </div>

            {/* Footer con contador */ }
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 text-sm text-gray-500">
                Mostrando { filteredData.length } de { procedimientos.length } procedimientos
            </div>

            {/* Modal Crear/Editar */ }
            { showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h3 className="text-lg font-bold text-gray-800">
                                { modalMode === 'create' ? 'Nuevo Procedimiento' : 'Editar Procedimiento' }
                            </h3>
                            <button onClick={ () => setShowModal(false) } className="p-2 hover:bg-gray-100 rounded-lg">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        <form onSubmit={ handleSubmit } className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Código CPT *
                                </label>
                                <input
                                    type="text"
                                    value={ formData.codProced }
                                    onChange={ (e) => setFormData({ ...formData, codProced: e.target.value }) }
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Ej: 00100"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Descripción *
                                </label>
                                <textarea
                                    value={ formData.descProced }
                                    onChange={ (e) => setFormData({ ...formData, descProced: e.target.value }) }
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Descripción del procedimiento"
                                    rows={ 3 }
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Estado
                                </label>
                                <select
                                    value={ formData.statProced }
                                    onChange={ (e) => setFormData({ ...formData, statProced: e.target.value }) }
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="A">Activo</option>
                                    <option value="I">Inactivo</option>
                                </select>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={ () => setShowModal(false) }
                                    className="flex-1 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={ loading }
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all"
                                >
                                    { loading ? 'Guardando...' : 'Guardar' }
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            ) }

            {/* Modal Ver Detalles */ }
            { showViewModal && selectedItem && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h3 className="text-lg font-bold text-gray-800">Detalles del Procedimiento</h3>
                            <button onClick={ () => setShowViewModal(false) } className="p-2 hover:bg-gray-100 rounded-lg">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">ID</p>
                                    <p className="font-semibold">{ selectedItem.idProced }</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Código CPT</p>
                                    <p className="font-semibold">{ selectedItem.codProced }</p>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Descripción</p>
                                <p className="font-semibold">{ selectedItem.descProced }</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Estado</p>
                                    <span className={ `inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm ${selectedItem.statProced === 'A'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-gray-100 text-gray-600'
                                        }` }>
                                        { selectedItem.statProced === 'A' ? 'Activo' : 'Inactivo' }
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Creado</p>
                                    <p className="font-semibold text-sm">
                                        { selectedItem.createdAt ? new Date(selectedItem.createdAt).toLocaleDateString() : '-' }
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t bg-gray-50">
                            <button
                                onClick={ () => setShowViewModal(false) }
                                className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            ) }

            {/* Modal Confirmar Eliminación */ }
            { showDeleteModal && selectedItem && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-8 h-8 text-red-500" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 mb-2">
                                ¿Eliminar procedimiento?
                            </h3>
                            <p className="text-gray-500 mb-1">
                                Estás a punto de eliminar:
                            </p>
                            <p className="font-semibold text-gray-800 mb-4">
                                { selectedItem.codProced } - { selectedItem.descProced?.substring(0, 50) }...
                            </p>
                            <p className="text-sm text-red-500">
                                Esta acción no se puede deshacer
                            </p>
                        </div>
                        <div className="flex gap-3 p-6 border-t bg-gray-50">
                            <button
                                onClick={ () => setShowDeleteModal(false) }
                                className="flex-1 px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={ handleDelete }
                                disabled={ loading }
                                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                                { loading ? 'Eliminando...' : 'Eliminar' }
                            </button>
                        </div>
                    </div>
                </div>
            ) }
        </div>
    );
};

export default Procedimientos;

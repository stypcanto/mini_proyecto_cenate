// ========================================================================
// CPMS.jsx – CRUD de Tipos de Procedimiento (CENATE 2026)
// ------------------------------------------------------------------------
// Componente para gestionar tipos de procedimiento del sistema
// ========================================================================

import React, { useState, useEffect } from 'react';
import {
    FlaskConical,
    Plus,
    Edit,
    Trash2,
    Search,
    RefreshCw,
    Loader2,
    X,
    Save,
    AlertCircle,
    Eye
} from 'lucide-react';
import { cpmsService } from '../../../services/cpmsService';

export default function CPMS() {
    const [tiposProcedimiento, setTiposProcedimiento] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedTipo, setSelectedTipo] = useState(null);
    const [formData, setFormData] = useState({
        codTipProced: '',
        descTipProced: '',
        statTipProced: 'A'
    });
    const [saving, setSaving] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    // ============================================================
    // Cargar Tipos de Procedimiento
    // ============================================================
    const loadData = async () => {
        console.log('🔵 [CPMS] Iniciando carga de datos...');
        setLoading(true);
        setError(null);
        try {
            const data = await cpmsService.obtenerTodos();
            console.log('✅ [CPMS] Tipos de procedimiento cargados:', data);
            setTiposProcedimiento(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('❌ [CPMS] Error al cargar tipos:', err);
            setError('No se pudieron cargar los tipos de procedimiento. Verifique que el backend esté corriendo.');
            setTiposProcedimiento([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // ============================================================
    // Filtrar y Ordenar Tipos de Procedimiento
    // ============================================================
    const filteredTipos = (tiposProcedimiento || [])
        .filter(tipo =>
            tipo.codTipProced?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tipo.descTipProced?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => (a.codTipProced || '').localeCompare(b.codTipProced || ''));

    // ============================================================
    // Abrir Modal (Crear/Editar)
    // ============================================================
    const handleOpenModal = (tipo = null) => {
        if (tipo) {
            setSelectedTipo(tipo);
            setFormData({
                codTipProced: tipo.codTipProced || '',
                descTipProced: tipo.descTipProced || '',
                statTipProced: tipo.statTipProced || 'A'
            });
        } else {
            setSelectedTipo(null);
            setFormData({
                codTipProced: '',
                descTipProced: '',
                statTipProced: 'A'
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedTipo(null);
        setFormData({
            codTipProced: '',
            descTipProced: '',
            statTipProced: 'A'
        });
    };

    // ============================================================
    // Guardar Tipo de Procedimiento
    // ============================================================
    const handleSave = async () => {
        if (!formData.codTipProced.trim()) {
            alert('El código es obligatorio');
            return;
        }
        if (!formData.descTipProced.trim()) {
            alert('La descripción es obligatoria');
            return;
        }

        // Verificar duplicados
        if (!selectedTipo || selectedTipo.codTipProced !== formData.codTipProced) {
            const codigoDuplicado = tiposProcedimiento.some(t =>
                t.codTipProced?.toUpperCase() === formData.codTipProced.trim().toUpperCase() &&
                (!selectedTipo || t.idTipProced !== selectedTipo.idTipProced)
            );
            if (codigoDuplicado) {
                alert('Ya existe un tipo de procedimiento con este código');
                return;
            }
        }

        setSaving(true);
        try {
            const dataToSend = {
                codTipProced: formData.codTipProced.trim().toUpperCase(),
                descTipProced: formData.descTipProced.trim().toUpperCase(),
                statTipProced: formData.statTipProced
            };

            if (selectedTipo) {
                await cpmsService.actualizar(selectedTipo.idTipProced, dataToSend);
            } else {
                await cpmsService.crear(dataToSend);
            }
            handleCloseModal();
            loadData();
        } catch (err) {
            console.error('Error al guardar tipo de procedimiento:', err);
            alert('Error al guardar: ' + (err.message || 'Error desconocido'));
        } finally {
            setSaving(false);
        }
    };

    // ============================================================
    // Eliminar Tipo de Procedimiento
    // ============================================================
    const handleDelete = async (id) => {
        try {
            await cpmsService.eliminar(id);
            setDeleteConfirm(null);
            loadData();
        } catch (err) {
            console.error('Error al eliminar tipo de procedimiento:', err);
            alert('Error al eliminar: ' + (err.message || 'Error desconocido'));
        }
    };

    // ============================================================
    // Toggle Estado
    // ============================================================
    const handleToggleEstado = async (tipo) => {
        try {
            const nuevoEstado = tipo.statTipProced === 'A' ? 'I' : 'A';
            await cpmsService.actualizar(tipo.idTipProced, {
                codTipProced: tipo.codTipProced,
                descTipProced: tipo.descTipProced,
                statTipProced: nuevoEstado
            });
            loadData();
        } catch (err) {
            console.error('Error al cambiar estado:', err);
            alert('Error al cambiar estado: ' + (err.message || 'Error desconocido'));
        }
    };

    // ============================================================
    // Render
    // ============================================================
    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-6 border border-slate-100 dark:border-slate-800">
            {/* Header */ }
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl shadow-lg">
                        <FlaskConical className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                            Gestión de CPMS
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Administra los tipos de procedimiento del sistema CENATE
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={ loadData }
                        className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl transition-all font-medium shadow-sm"
                        disabled={ loading }
                    >
                        <RefreshCw className={ `w-4 h-4 ${loading ? 'animate-spin' : ''}` } />
                        Actualizar
                    </button>
                    <button
                        onClick={ () => handleOpenModal() }
                        className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-all font-medium shadow-lg hover:shadow-xl"
                    >
                        <Plus className="w-4 h-4" />
                        Nuevo Tipo
                    </button>
                </div>
            </div>

            {/* Buscador */ }
            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Buscar por código o descripción..."
                        value={ searchTerm }
                        onChange={ (e) => setSearchTerm(e.target.value) }
                        className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                    />
                </div>
            </div>

            {/* Contenido */ }
            { loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-12 h-12 text-purple-600 animate-spin mb-4" />
                    <p className="text-slate-600 dark:text-slate-400 font-medium">
                        Cargando tipos de procedimiento...
                    </p>
                </div>
            ) : error ? (
                <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl p-8 text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-red-700 dark:text-red-300 font-medium mb-2">
                        { error }
                    </p>
                    <button
                        onClick={ loadData }
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all font-medium"
                    >
                        Reintentar
                    </button>
                </div>
            ) : filteredTipos.length === 0 ? (
                <div className="bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 rounded-2xl p-12 text-center">
                    <FlaskConical className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-400 font-medium mb-2">
                        { searchTerm ? 'No se encontraron tipos de procedimiento' : 'No hay tipos de procedimiento registrados' }
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-500 mb-4">
                        { searchTerm ? 'Intenta con otro término de búsqueda' : 'Comienza creando tu primer tipo de procedimiento' }
                    </p>
                    { !searchTerm && (
                        <button
                            onClick={ () => handleOpenModal() }
                            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                        >
                            <Plus className="w-5 h-5 inline mr-2" />
                            Crear Primer Tipo
                        </button>
                    ) }
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-purple-600">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                                        Código
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                                        Descripción
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider">
                                        Estado
                                    </th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                { filteredTipos.map((tipo, index) => (
                                    <tr key={ tipo.idTipProced } className={ `hover:bg-purple-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}` }>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg">
                                                    <FlaskConical className="w-4 h-4 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">
                                                        { tipo.codTipProced }
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        ID: { tipo.idTipProced }
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-900">
                                                { tipo.descTipProced }
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center justify-center">
                                                <button
                                                    onClick={ () => handleToggleEstado(tipo) }
                                                    className={ `relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${tipo.statTipProced === 'A'
                                                            ? 'bg-emerald-500 focus:ring-emerald-500'
                                                            : 'bg-gray-300 focus:ring-gray-400'
                                                        }` }
                                                >
                                                    <span
                                                        className={ `inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-200 ${tipo.statTipProced === 'A' ? 'translate-x-6' : 'translate-x-1'
                                                            }` }
                                                    />
                                                </button>
                                                <span className={ `ml-2 text-xs font-semibold ${tipo.statTipProced === 'A' ? 'text-emerald-600' : 'text-gray-500'}` }>
                                                    { tipo.statTipProced === 'A' ? 'ACTIVO' : 'INACTIVO' }
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center justify-center gap-1">
                                                {/* Botón Ver Detalle */ }
                                                <div className="relative group">
                                                    <button
                                                        onClick={ () => handleOpenModal(tipo) }
                                                        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-all duration-200"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs font-medium text-white bg-gray-800 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
                                                        Ver detalle
                                                    </span>
                                                </div>

                                                {/* Botón Editar */ }
                                                <div className="relative group">
                                                    <button
                                                        onClick={ () => handleOpenModal(tipo) }
                                                        className="p-2 rounded-lg text-purple-500 hover:bg-purple-50 hover:text-purple-700 transition-all duration-200"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs font-medium text-white bg-gray-800 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
                                                        Editar
                                                    </span>
                                                </div>

                                                {/* Botón Eliminar */ }
                                                <div className="relative group">
                                                    <button
                                                        onClick={ () => setDeleteConfirm(tipo) }
                                                        className="p-2 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700 transition-all duration-200"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs font-medium text-white bg-gray-800 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
                                                        Eliminar
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )) }
                            </tbody>
                        </table>
                    </div>
                </div>
            ) }

            {/* Modal Crear/Editar */ }
            { showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg">
                        {/* Header del Modal */ }
                        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-purple-50 dark:from-slate-900 dark:to-slate-800 rounded-t-2xl">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl shadow-lg">
                                    <FlaskConical className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                        { selectedTipo ? 'Editar Tipo de Procedimiento' : 'Nuevo Tipo de Procedimiento' }
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        { selectedTipo ? `ID: ${selectedTipo.idTipProced}` : 'Complete los datos requeridos' }
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={ handleCloseModal }
                                className="p-2 hover:bg-white/50 dark:hover:bg-slate-700/50 rounded-xl transition-all"
                            >
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>

                        {/* Contenido del Modal */ }
                        <div className="p-6 space-y-4">
                            {/* Campo: Código */ }
                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    <FlaskConical className="w-4 h-4 text-purple-600" />
                                    Código
                                    <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={ formData.codTipProced }
                                    onChange={ (e) => setFormData({ ...formData, codTipProced: e.target.value }) }
                                    placeholder="Ej: LAB"
                                    className="w-full px-4 py-3 bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all uppercase font-bold"
                                    autoFocus
                                />
                            </div>

                            {/* Campo: Descripción */ }
                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                    Descripción
                                    <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={ formData.descTipProced }
                                    onChange={ (e) => setFormData({ ...formData, descTipProced: e.target.value }) }
                                    placeholder="Ej: LABORATORIO CLINICO"
                                    className="w-full px-4 py-3 bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all uppercase font-medium resize-none"
                                    rows={ 3 }
                                />
                            </div>

                            {/* Campo: Estado */ }
                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                                    Estado
                                </label>
                                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 border-2 border-slate-200 dark:border-slate-600">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">
                                                { formData.statTipProced === 'A' ? 'Activo' : 'Inactivo' }
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                { formData.statTipProced === 'A'
                                                    ? 'El tipo estará disponible en el sistema'
                                                    : 'El tipo no estará disponible'
                                                }
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={ () => setFormData({
                                                ...formData,
                                                statTipProced: formData.statTipProced === 'A' ? 'I' : 'A'
                                            }) }
                                            className={ `relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${formData.statTipProced === 'A'
                                                    ? 'bg-emerald-500 focus:ring-emerald-500'
                                                    : 'bg-gray-300 focus:ring-gray-400'
                                                }` }
                                        >
                                            <span
                                                className={ `inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-200 ${formData.statTipProced === 'A' ? 'translate-x-7' : 'translate-x-1'
                                                    }` }
                                            />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Información Adicional */ }
                            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4">
                                <div className="flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-xs font-semibold text-purple-900 dark:text-purple-100 mb-1">
                                            Ejemplos de tipos de procedimiento:
                                        </p>
                                        <ul className="text-xs text-purple-700 dark:text-purple-300 space-y-1">
                                            <li>• LAB - LABORATORIO CLINICO</li>
                                            <li>• IMG - IMAGENOLOGIA</li>
                                            <li>• MNU - MEDICINA NUCLEAR</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer con Botones */ }
                        <div className="flex gap-3 p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 rounded-b-2xl">
                            <button
                                onClick={ handleCloseModal }
                                className="flex-1 px-6 py-3 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 border-2 border-slate-300 dark:border-slate-600 rounded-xl transition-all font-semibold shadow-sm"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={ handleSave }
                                disabled={ saving }
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl transition-all font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                { saving ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Guardando...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        <span>Guardar Cambios</span>
                                    </>
                                ) }
                            </button>
                        </div>
                    </div>
                </div>
            ) }

            {/* Modal Confirmar Eliminación */ }
            { deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-6">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-8 h-8 text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                Confirmar Eliminación
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400 mb-6">
                                ¿Estás seguro de eliminar el tipo <strong>{ deleteConfirm.codTipProced }</strong> - { deleteConfirm.descTipProced }? Esta acción no se puede deshacer.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={ () => setDeleteConfirm(null) }
                                    className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl transition-all font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={ () => handleDelete(deleteConfirm.idTipProced) }
                                    className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all font-medium"
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) }
        </div>
    );
}

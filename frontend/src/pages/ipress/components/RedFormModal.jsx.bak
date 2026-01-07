// ========================================================================
// 🌐 RedFormModal.jsx – Modal de Creación/Edición de Redes
// ------------------------------------------------------------------------
// Formulario para crear o editar redes asistenciales
// ========================================================================

import React, { useState, useEffect } from 'react';
import { X, Network, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { redesService } from '../../../services/redesService';

const RedFormModal = ({ red = null, macrorregiones = [], onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        codRed: '',
        descRed: '',
        idMacro: '',
    });

    const [errors, setErrors] = useState({});

    // Si es edición, cargar datos de la red
    useEffect(() => {
        if (red) {
            setFormData({
                codRed: red.codRed || '',
                descRed: red.descRed || '',
                idMacro: red.macroregion?.idMacro || red.idMacro || '',
            });
        }
    }, [red]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Limpiar error del campo
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.codRed.trim()) {
            newErrors.codRed = 'El código es obligatorio';
        }

        if (!formData.descRed.trim()) {
            newErrors.descRed = 'El nombre es obligatorio';
        }

        if (!formData.idMacro) {
            newErrors.idMacro = 'La macrorregión es obligatoria';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        try {
            setLoading(true);

            // Preparar payload
            const payload = {
                codRed: formData.codRed,
                descRed: formData.descRed,
                idMacro: parseInt(formData.idMacro),
            };

            console.log('📤 Enviando payload:', payload);

            let response;
            if (red) {
                // Actualizar
                console.log(`🔄 Actualizando Red ID: ${red.idRed}`);
                response = await redesService.actualizar(red.idRed, payload);
                console.log('✅ Respuesta actualización:', response);
                toast.success('Red actualizada exitosamente');
            } else {
                // Crear
                console.log('➕ Creando nueva Red');
                response = await redesService.crear(payload);
                console.log('✅ Respuesta creación:', response);
                toast.success('Red creada exitosamente');
            }

            // Llamar a onSuccess ANTES de cerrar el modal
            onSuccess();

            // Cerrar el modal después de un pequeño delay
            setTimeout(() => {
                onClose();
            }, 100);

            setLoading(false);
        } catch (error) {
            console.error('❌ Error al guardar Red:', error);
            const errorMsg = error?.response?.data?.message || error?.message || 'Error al guardar Red';
            toast.error(errorMsg);
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden">

                {/* Header */ }
                <div className="bg-emerald-600 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                            <Network className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-white">
                            <h2 className="text-xl font-bold">
                                { red ? 'Editar Red' : 'Nueva Red' }
                            </h2>
                            <p className="text-sm text-emerald-100">
                                { red ? 'Actualizar información de la red asistencial' : 'Registrar nueva red asistencial' }
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={ onClose }
                        className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Formulario */ }
                <form onSubmit={ handleSubmit } className="p-6">
                    <div className="grid grid-cols-1 gap-6">

                        {/* Código de Red */ }
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Código de Red <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="codRed"
                                value={ formData.codRed }
                                onChange={ handleChange }
                                className={ `w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 ${errors.codRed
                                        ? 'border-red-500 focus:ring-red-500'
                                        : 'border-gray-300 focus:ring-emerald-500'
                                    }` }
                                placeholder="Ej: 99"
                            />
                            { errors.codRed && (
                                <p className="mt-1 text-sm text-red-600">{ errors.codRed }</p>
                            ) }
                        </div>

                        {/* Nombre de Red */ }
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Nombre de la Red <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="descRed"
                                value={ formData.descRed }
                                onChange={ handleChange }
                                className={ `w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 ${errors.descRed
                                        ? 'border-red-500 focus:ring-red-500'
                                        : 'border-gray-300 focus:ring-emerald-500'
                                    }` }
                                placeholder="Ej: MICRORED ASISTENCIAL MOYOBAMBA"
                            />
                            { errors.descRed && (
                                <p className="mt-1 text-sm text-red-600">{ errors.descRed }</p>
                            ) }
                        </div>

                        {/* Macrorregión */ }
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Macrorregión <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="idMacro"
                                value={ formData.idMacro }
                                onChange={ handleChange }
                                className={ `w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 ${errors.idMacro
                                        ? 'border-red-500 focus:ring-red-500'
                                        : 'border-gray-300 focus:ring-emerald-500'
                                    }` }
                            >
                                <option value="">Seleccione una macrorregión</option>
                                { macrorregiones.map((macro) => (
                                    <option key={ macro.idMacro } value={ macro.idMacro }>
                                        { macro.descMacro }
                                    </option>
                                )) }
                            </select>
                            { errors.idMacro && (
                                <p className="mt-1 text-sm text-red-600">{ errors.idMacro }</p>
                            ) }
                        </div>

                    </div>
                </form>

                {/* Footer */ }
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={ onClose }
                        className="px-6 py-2.5 bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 rounded-xl transition-all font-medium"
                        disabled={ loading }
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        onClick={ handleSubmit }
                        disabled={ loading }
                        className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all font-medium shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        { loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Guardando...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                { red ? 'Actualizar Red' : 'Crear Red' }
                            </>
                        ) }
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RedFormModal;

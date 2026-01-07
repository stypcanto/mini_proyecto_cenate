import React from 'react';
import { X, Phone, User, Calendar, MapPin, FileText, MessageCircle, Edit2, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';

/**
 * Modal para mostrar los detalles completos de un paciente
 */
const DetallesPacienteModal = ({ isOpen, onClose, paciente, onEdit, onDelete, onWhatsApp }) => {
    if (!isOpen || !paciente) return null;

    const InfoRow = ({ icon: Icon, label, value, fullWidth = false }) => (
        <div className={ `${fullWidth ? 'col-span-2' : ''} flex items-start gap-3 p-3 bg-gray-50 rounded-lg` }>
            <Icon className="w-5 h-5 text-[#0A5BA9] flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-500 mb-1">{ label }</p>
                <p className="text-sm font-semibold text-gray-900 break-words">
                    { value || <span className="text-gray-400">No especificado</span> }
                </p>
            </div>
        </div>
    );

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={ onClose }
        >
            <div
                className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
                onClick={ (e) => e.stopPropagation() }
            >
                {/* Header */ }
                <div className="bg-gradient-to-r from-[#0A5BA9] to-[#084a8a] text-white p-6">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold mb-2">
                                { paciente.apellidosNombres || paciente.nombre }
                            </h2>
                            <p className="text-blue-100 flex items-center gap-2">
                                <span className="font-mono bg-white/20 px-3 py-1 rounded-full text-sm">
                                    DNI: { paciente.numDoc || paciente.dni || paciente.codigo }
                                </span>
                            </p>
                        </div>
                        <button
                            onClick={ onClose }
                            className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-2 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Body - Scrollable */ }
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Información Personal */ }
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <User className="w-5 h-5 text-[#0A5BA9]" />
                            Información Personal
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <InfoRow
                                icon={ User }
                                label="Nombre Completo"
                                value={ paciente.apellidosNombres || paciente.nombre }
                            />
                            <InfoRow
                                icon={ FileText }
                                label="Documento"
                                value={ paciente.numDoc || paciente.dni || paciente.codigo }
                            />
                            <InfoRow
                                icon={ User }
                                label="Sexo"
                                value={ paciente.sexo }
                            />
                            <InfoRow
                                icon={ Calendar }
                                label="Edad"
                                value={ paciente.edad ? `${paciente.edad} años` : null }
                            />
                            <InfoRow
                                icon={ Phone }
                                label="Teléfono"
                                value={ paciente.telefono }
                            />
                            <InfoRow
                                icon={ User }
                                label="Tipo de Paciente"
                                value={ paciente.tipoPaciente }
                            />
                        </div>
                    </div>

                    {/* Información Clínica */ }
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-[#0A5BA9]" />
                            Información de Gestión
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <InfoRow
                                icon={ MapPin }
                                label="IPRESS"
                                value={ paciente.ipress || paciente.institucion }
                                fullWidth
                            />
                            <InfoRow
                                icon={ FileText }
                                label="Condición"
                                value={ paciente.condicion || paciente.estado }
                            />
                            <InfoRow
                                icon={ User }
                                label="Gestora Asignada"
                                value={ paciente.gestora || paciente.gestorAsignado }
                            />
                            <InfoRow
                                icon={ Calendar }
                                label="Última Actualización"
                                value={ paciente.fechaActualizacion || paciente.fechaContacto }
                                fullWidth
                            />
                        </div>
                    </div>

                    {/* Observaciones */ }
                    { paciente.observaciones && (
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-[#0A5BA9]" />
                                Observaciones
                            </h3>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                    { paciente.observaciones }
                                </p>
                            </div>
                        </div>
                    ) }
                </div>

                {/* Footer - Actions */ }
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                    <div className="flex flex-wrap gap-2 justify-end">
                        { paciente.telefono && onWhatsApp && (
                            <Button
                                onClick={ () => onWhatsApp(paciente) }
                                className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                                <MessageCircle className="w-4 h-4" />
                                WhatsApp
                            </Button>
                        ) }
                        { onEdit && (
                            <Button
                                onClick={ () => {
                                    onEdit(paciente);
                                    onClose();
                                } }
                                className="gap-2 bg-[#0A5BA9] hover:bg-[#084a8a] text-white"
                            >
                                <Edit2 className="w-4 h-4" />
                                Editar
                            </Button>
                        ) }
                        { onDelete && (
                            <Button
                                onClick={ () => {
                                    onDelete(paciente.idGestion || paciente.id);
                                    onClose();
                                } }
                                variant="outline"
                                className="gap-2 border-orange-300 text-orange-600 hover:bg-orange-50"
                            >
                                <Trash2 className="w-4 h-4" />
                                Eliminar
                            </Button>
                        ) }
                        <Button
                            onClick={ onClose }
                            variant="outline"
                            className="border-gray-300 text-gray-600 hover:bg-gray-100"
                        >
                            Cerrar
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetallesPacienteModal;

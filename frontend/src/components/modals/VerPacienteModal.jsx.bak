import React from 'react';
import { X, User, Phone, MapPin, Calendar, ClipboardList, Activity, Building2, UserCircle } from 'lucide-react';

const VerPacienteModal = ({ paciente, onClose }) => {
    if (!paciente) return null;

    // Helper para calcular edad
    const calcularEdad = (fechaNacimiento) => {
        if (!fechaNacimiento) return "—";
        const hoy = new Date();
        const nacimiento = new Date(fechaNacimiento);
        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const mes = hoy.getMonth() - nacimiento.getMonth();
        if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
            edad--;
        }
        return `${edad} años`;
    };

    // Helper para formatear fecha
    const formatFecha = (fecha) => {
        if (!fecha) return "—";
        try {
            const date = new Date(fecha);
            return date.toLocaleDateString('es-PE', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return fecha;
        }
    };

    const InfoCard = ({ label, value, icon: Icon, color = "text-blue-600" }) => (
        <div className="bg-white border border-slate-200 rounded-lg p-3 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-1">
                { Icon && <Icon className={ `w-4 h-4 ${color}` } /> }
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">{ label }</p>
            </div>
            <p className="text-sm font-semibold text-slate-800 break-words">
                { value || <span className="text-slate-400 italic font-normal">No especificado</span> }
            </p>
        </div>
    );

    const Section = ({ title, icon: Icon, children }) => (
        <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                { Icon && <Icon className="w-5 h-5 text-blue-600" /> }
                <h3 className="text-sm font-bold text-slate-700">{ title }</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                { children }
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">

                {/* Header */ }
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between shadow-lg">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-full">
                            <UserCircle className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white leading-tight">
                                { paciente.paciente || "Paciente Sin Nombre" }
                            </h2>
                            <p className="text-blue-100 text-sm flex items-center gap-2 mt-1">
                                <span>DNI: { paciente.numero_documento }</span>
                                <span className="w-1 h-1 bg-blue-200 rounded-full" />
                                <span>Reg: { paciente.registro }</span>
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={ onClose }
                        className="p-2 hover:bg-white/20 text-white rounded-lg transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */ }
                <div className="p-6 overflow-y-auto flex-1 bg-slate-50 space-y-6">

                    {/* Información Personal */ }
                    <Section title="Información Personal" icon={ User }>
                        <InfoCard label="Fecha de Nacimiento" value={ formatFecha(paciente.fecha_nacimiento) } icon={ Calendar } />
                        <InfoCard label="Edad" value={ calcularEdad(paciente.fecha_nacimiento) } icon={ Activity } />
                        <InfoCard label="Sexo" value={ paciente.sexo === 'M' ? 'Masculino' : paciente.sexo === 'F' ? 'Femenino' : paciente.sexo } icon={ User } />
                        <InfoCard label="Teléfono" value={ paciente.telefono } icon={ Phone } />
                    </Section>

                    {/* Ubicación */ }
                    <Section title="Ubicación" icon={ MapPin }>
                        <InfoCard label="Departamento" value={ paciente.departamento } color="text-amber-600" />
                        <InfoCard label="Provincia" value={ paciente.provincia } color="text-amber-600" />
                        <InfoCard label="Distrito" value={ paciente.distrito } color="text-amber-600" />
                    </Section>

                    {/* Datos Clínicos / Gestión */ }
                    <Section title="Datos de Gestión" icon={ ClipboardList }>
                        <InfoCard label="IPRESS" value={ paciente.desc_ipress } icon={ Building2 } color="text-purple-600" />
                        <InfoCard label="Afiliación" value={ paciente.afiliacion } color="text-purple-600" />
                        <InfoCard label="Derivación" value={ paciente.derivacion_interna } color="text-purple-600" />
                        <InfoCard label="Motivo" value={ paciente.motivo_llamada } color="text-purple-600" />
                    </Section>

                    { (paciente.nombre_gestor || paciente.gestor) && (
                        <Section title="Asignación Actual" icon={ UserCircle }>
                            <InfoCard label="Gestor Asignado" value={ paciente.nombre_gestor || paciente.gestor } color="text-green-600" />
                            <InfoCard
                                label="Fecha Asignación"
                                value={ formatFecha(paciente.fecha_asignacion_gestor) }
                                color="text-green-600"
                            />
                        </Section>
                    ) }

                </div>

                {/* Footer */ }
                <div className="px-6 py-4 bg-white border-t border-slate-200 flex justify-end">
                    <button
                        onClick={ onClose }
                        className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VerPacienteModal;

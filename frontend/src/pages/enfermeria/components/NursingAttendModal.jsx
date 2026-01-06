import React, { useState } from "react";
import { X, Save, Activity, FileText, Share2, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import apiClient from "../../../services/apiClient"; // Asegúrate de tener este servicio configurado
import TrazabilidadClinicaTabs from "../../../components/trazabilidad/TrazabilidadClinicaTabs";
import { useAuth } from "../../../context/AuthContext";

export default function NursingAttendModal({ paciente, onClose, onSuccess }) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        motivoConsulta: "",
        observaciones: "",
        signosVitales: {
            pa: "",
            fc: "",
            spo2: "",
            temp: "",
            peso: "",
            talla: ""
        },
        derivaInterconsulta: false,
        especialidadInterconsulta: "",
        motivoInterconsulta: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith("sv_")) {
            const svKey = name.replace("sv_", "");
            setFormData((prev) => ({
                ...prev,
                signosVitales: { ...prev.signosVitales, [svKey]: value }
            }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setFormData((prev) => ({ ...prev, [name]: checked }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.motivoConsulta.trim()) {
            toast.error("El motivo de consulta es obligatorio");
            return;
        }

        try {
            setLoading(true);
            // ✅ FIX: Convertir pacienteDni a número para el backend
            const idPacienteNumerico = parseInt(paciente.pacienteDni) || paciente.idPaciente || 0;

            const payload = {
                idPaciente: idPacienteNumerico, // Enviar DNI como número
                idAtencionMedicaRef: paciente.tipoOrigen === "MEDICINA_GENERAL" ? paciente.idOrigen : null,
                idCitaRef: paciente.tipoOrigen === "CITA" ? paciente.idOrigen : null,
                motivoConsulta: formData.motivoConsulta,
                observaciones: formData.observaciones,
                signosVitales: formData.signosVitales,
                idUsuarioEnfermera: user?.id || null, // ID del usuario enfermera logueado
                derivaInterconsulta: formData.derivaInterconsulta,
                especialidadInterconsulta: formData.derivaInterconsulta ? formData.especialidadInterconsulta : null,
                motivoInterconsulta: formData.derivaInterconsulta ? formData.motivoInterconsulta : null
            };

            const response = await apiClient.post("/enfermeria/attend", payload);

            if (response.status === 200) {
                toast.success("Atención registrada correctamente");
                onSuccess();
                onClose();
            }
        } catch (error) {
            console.error("Error al registrar atención:", error);
            toast.error("Error al guardar la atención");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[95vw] h-[90vh] flex flex-col overflow-hidden">

                {/* Header */ }
                <div className="bg-gradient-to-r from-green-600 to-teal-700 px-6 py-4 flex items-center justify-between shadow-md z-10">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-lg backdrop-blur-md">
                            <Activity className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Registro de Atención Clinica</h2>
                            <p className="text-green-100 text-sm flex items-center gap-2">
                                <span className="font-semibold">{ paciente.pacienteNombre }</span>
                                <span className="opacity-75">| DNI: { paciente.pacienteDni }</span>
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={ onClose }
                        className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all text-white"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content - Split View */ }
                <div className="flex flex-1 overflow-hidden">

                    {/* Left Panel: Historical Context (Read-Only) */ }
                    <div className="w-1/2 border-r border-gray-200 bg-gray-50 flex flex-col">
                        <div className="p-4 bg-blue-50 border-b border-blue-100 flex items-center gap-2 text-blue-800 text-sm font-medium">
                            <FileText className="w-4 h-4" />
                            Historial Clínico y Antecedentes
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                            {/* ✅ FIX: Usar pkAsegurado completo para buscar historial, fallback a pacienteDni */ }
                            <TrazabilidadClinicaTabs pkAsegurado={ paciente.pkAsegurado || paciente.pacienteDni } />
                        </div>
                    </div>

                    {/* Right Panel: Active Form (Input) */ }
                    <div className="w-1/2 flex flex-col bg-white">
                        <div className="p-4 bg-green-50 border-b border-green-100 flex items-center gap-2 text-green-800 text-sm font-medium">
                            <Activity className="w-4 h-4" />
                            Nueva Evolución de Enfermería
                        </div>

                        <form onSubmit={ handleSubmit } className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">

                            {/* Signos Vitales */ }
                            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-green-500" /> Signos Vitales
                                </h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-xs text-gray-500 font-medium ml-1">P. Arterial (mmHg)</label>
                                        <input
                                            name="sv_pa"
                                            value={ formData.signosVitales.pa }
                                            onChange={ handleChange }
                                            placeholder="120/80"
                                            className="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:bg-white transition-all text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 font-medium ml-1">F. Cardíaca (lpm)</label>
                                        <input
                                            name="sv_fc"
                                            type="number"
                                            value={ formData.signosVitales.fc }
                                            onChange={ handleChange }
                                            placeholder="72"
                                            className="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:bg-white transition-all text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 font-medium ml-1">Sat. O2 (%)</label>
                                        <input
                                            name="sv_spo2"
                                            type="number"
                                            value={ formData.signosVitales.spo2 }
                                            onChange={ handleChange }
                                            placeholder="98"
                                            className="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:bg-white transition-all text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 font-medium ml-1">Temp (°C)</label>
                                        <input
                                            name="sv_temp"
                                            type="number"
                                            step="0.1"
                                            value={ formData.signosVitales.temp }
                                            onChange={ handleChange }
                                            placeholder="36.5"
                                            className="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:bg-white transition-all text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 font-medium ml-1">Peso (Kg)</label>
                                        <input
                                            name="sv_peso"
                                            type="number"
                                            step="0.1"
                                            value={ formData.signosVitales.peso }
                                            onChange={ handleChange }
                                            className="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:bg-white transition-all text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 font-medium ml-1">Talla (cm)</label>
                                        <input
                                            name="sv_talla"
                                            type="number"
                                            value={ formData.signosVitales.talla }
                                            onChange={ handleChange }
                                            className="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:bg-white transition-all text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Consulta */ }
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Motivo de Atención</label>
                                    <input
                                        name="motivoConsulta"
                                        value={ formData.motivoConsulta }
                                        onChange={ handleChange }
                                        placeholder="Ej. Control de hipertensión..."
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones y Recomendaciones</label>
                                    <textarea
                                        name="observaciones"
                                        rows={ 4 }
                                        value={ formData.observaciones }
                                        onChange={ handleChange }
                                        placeholder="Detalle de la evolución..."
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                                    />
                                </div>
                            </div>

                            {/* Interconsulta */ }
                            <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                                <div className="flex items-center gap-3 mb-4">
                                    <input
                                        type="checkbox"
                                        id="derivaInterconsulta"
                                        name="derivaInterconsulta"
                                        checked={ formData.derivaInterconsulta }
                                        onChange={ handleCheckboxChange }
                                        className="w-5 h-5 text-green-600 rounded focus:ring-green-500 border-gray-300"
                                    />
                                    <label htmlFor="derivaInterconsulta" className="text-gray-800 font-medium text-sm flex items-center gap-2 cursor-pointer">
                                        <Share2 className="w-4 h-4 text-orange-500" />
                                        Requiere Interconsulta / Derivación
                                    </label>
                                </div>

                                { formData.derivaInterconsulta && (
                                    <div className="space-y-3 pl-8 animate-in slide-in-from-top-2 duration-200">
                                        <div>
                                            <label className="text-xs text-gray-500 font-medium">Especialidad Destino</label>
                                            <select
                                                name="especialidadInterconsulta"
                                                value={ formData.especialidadInterconsulta }
                                                onChange={ handleChange }
                                                className="w-full mt-1 px-3 py-2 bg-white border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 text-sm"
                                            >
                                                <option value="">Seleccione...</option>
                                                <option value="NUTRICION">Nutrición</option>
                                                <option value="PSICOLOGIA">Psicología</option>
                                                <option value="CARDIOLOGIA">Cardiología</option>
                                                <option value="MEDICINA_FISICA">Medicina Física</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 font-medium">Motivo de Derivación</label>
                                            <input
                                                name="motivoInterconsulta"
                                                value={ formData.motivoInterconsulta }
                                                onChange={ handleChange }
                                                className="w-full mt-1 px-3 py-2 bg-white border border-orange-200 rounded-lg focus:ring-2 focus:ring-orange-500 text-sm"
                                            />
                                        </div>
                                    </div>
                                ) }
                            </div>

                        </form>

                        {/* Footer Actions */ }
                        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={ onClose }
                                className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors border border-gray-300"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={ handleSubmit }
                                disabled={ loading }
                                className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-teal-700 text-white font-medium rounded-lg hover:from-green-700 hover:to-teal-800 focus:ring-4 focus:ring-green-100 transition-all shadow-lg shadow-green-200 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                { loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        Finalizar Atención
                                    </>
                                ) }
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

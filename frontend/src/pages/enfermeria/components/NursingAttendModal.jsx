import React, { useState, useEffect } from "react";
import { X, Save, Activity, FileText, Share2, AlertCircle, ChevronRight, ChevronLeft, History, User, Building2, ClipboardList, Video, Calendar } from "lucide-react";
import toast from "react-hot-toast";
import apiClient from "../../../services/apiClient";
import TrazabilidadClinicaTabs from "../../../components/trazabilidad/TrazabilidadClinicaTabs";
import { useAuth } from "../../../context/AuthContext";
import EstrategiaService from "../../../services/estrategiaService";
import telemedicinaService from "../../../services/telemedicinaService";
import VideoConsulta from "../../../components/telemedicina/VideoConsulta";

export default function NursingAttendModal({ paciente, onClose, onSuccess }) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [isHistorialExpanded, setIsHistorialExpanded] = useState(false);
    const [estrategiaSigla, setEstrategiaSigla] = useState(null);
    const [activeTab, setActiveTab] = useState("registro");
    const [proximasCitas, setProximasCitas] = useState([]);
    const [loadingCitas, setLoadingCitas] = useState(false);
    const [showVideoConsulta, setShowVideoConsulta] = useState(false);
    const [videoConsultaData, setVideoConsultaData] = useState(null);
    const [loadingVideo, setLoadingVideo] = useState(false);
    const [formData, setFormData] = useState({
        motivoConsulta: "",
        observaciones: "",
        observacionesCheckboxes: {
            dietaHiposodica: false,
            signosAlarmaExplicados: false,
            verificaTecnicaAutomedida: false
        },
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

    const [signosVitalesErrors, setSignosVitalesErrors] = useState({});

    // Cargar estrategia activa del paciente
    useEffect(() => {
        const cargarEstrategia = async () => {
            const pkAsegurado = paciente?.pkAsegurado || paciente?.pacienteDni;
            if (pkAsegurado) {
                try {
                    const estrategias = await EstrategiaService.obtenerEstrategiasActivas(pkAsegurado);
                    if (estrategias && Array.isArray(estrategias) && estrategias.length > 0) {
                        const primeraEstrategia = estrategias[0];
                        const sigla = primeraEstrategia?.estrategiaSigla || primeraEstrategia?.sigla;
                        if (sigla) {
                            setEstrategiaSigla(sigla);
                        }
                    }
                } catch (error) {
                    console.error("Error al cargar estrategia del paciente:", error);
                }
            }
        };
        cargarEstrategia();
    }, [paciente]);

    // Cargar próximas citas del paciente
    useEffect(() => {
        const cargarProximasCitas = async () => {
            const dniPaciente = paciente?.numDoc || paciente?.pacienteDni || paciente?.docPaciente;
            if (dniPaciente && activeTab === "proximas-citas") {
                try {
                    setLoadingCitas(true);
                    const response = await apiClient.get(`/v1/chatbot/solicitud/paciente/${dniPaciente}`);
                    const citas = Array.isArray(response) ? response : (response.data || []);

                    const hoy = new Date();
                    hoy.setHours(0, 0, 0, 0);

                    const citasFuturas = citas
                        .filter(cita => {
                            if (!cita.fechaCita) return false;
                            const fechaCita = new Date(cita.fechaCita);
                            fechaCita.setHours(0, 0, 0, 0);
                            return fechaCita >= hoy;
                        })
                        .sort((a, b) => {
                            const fechaA = new Date(a.fechaCita);
                            const fechaB = new Date(b.fechaCita);
                            if (fechaA.getTime() === fechaB.getTime()) {
                                const horaA = a.horaCita || "00:00:00";
                                const horaB = b.horaCita || "00:00:00";
                                return horaA.localeCompare(horaB);
                            }
                            return fechaA - fechaB;
                        });

                    setProximasCitas(citasFuturas);
                } catch (error) {
                    console.error("Error al cargar próximas citas:", error);
                    toast.error("Error al cargar las próximas citas");
                    setProximasCitas([]);
                } finally {
                    setLoadingCitas(false);
                }
            }
        };
        cargarProximasCitas();
    }, [paciente, activeTab]);

    // Validación de rangos fisiológicos
    const validarSignosVitales = (nombre, valor) => {
        const errores = { ...signosVitalesErrors };

        if (!valor || valor.trim() === "") {
            delete errores[nombre];
            setSignosVitalesErrors(errores);
            return true;
        }

        const numValor = parseFloat(valor);

        switch (nombre) {
            case "pa":
                const paMatch = valor.match(/^(\d+)\/(\d+)$/);
                if (!paMatch) {
                    errores.pa = "Formato inválido. Use: SISTOLICA/DASTOLICA (ej: 120/80)";
                    setSignosVitalesErrors(errores);
                    return false;
                }
                const sistolica = parseInt(paMatch[1]);
                const diastolica = parseInt(paMatch[2]);
                if (sistolica < 70 || sistolica > 250 || diastolica < 40 || diastolica > 150) {
                    errores.pa = "⚠️ ¿Estás segura? Valores fuera de rango fisiológico (70-250/40-150)";
                    setSignosVitalesErrors(errores);
                    return false;
                }
                delete errores.pa;
                break;
            case "fc":
                if (numValor < 40 || numValor > 200) {
                    errores.fc = "⚠️ ¿Estás segura? Frecuencia cardíaca fuera de rango (40-200 lpm)";
                    setSignosVitalesErrors(errores);
                    return false;
                }
                delete errores.fc;
                break;
            case "spo2":
                if (numValor < 70 || numValor > 100) {
                    errores.spo2 = "⚠️ ¿Estás segura? Saturación O2 fuera de rango (70-100%)";
                    setSignosVitalesErrors(errores);
                    return false;
                }
                delete errores.spo2;
                break;
            case "temp":
                if (numValor < 35 || numValor > 42) {
                    errores.temp = "⚠️ ¿Estás segura? Temperatura fuera de rango (35-42°C)";
                    setSignosVitalesErrors(errores);
                    return false;
                }
                delete errores.temp;
                break;
            case "peso":
                if (numValor < 1 || numValor > 300) {
                    errores.peso = "⚠️ ¿Estás segura? Peso fuera de rango (1-300 kg)";
                    setSignosVitalesErrors(errores);
                    return false;
                }
                delete errores.peso;
                break;
            case "talla":
                if (numValor < 30 || numValor > 250) {
                    errores.talla = "⚠️ ¿Estás segura? Talla fuera de rango (30-250 cm)";
                    setSignosVitalesErrors(errores);
                    return false;
                }
                delete errores.talla;
                break;
        }

        setSignosVitalesErrors(errores);
        return true;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith("sv_")) {
            const svKey = name.replace("sv_", "");
            setFormData((prev) => ({
                ...prev,
                signosVitales: { ...prev.signosVitales, [svKey]: value }
            }));
            validarSignosVitales(svKey, value);
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleCheckboxObservacion = (e) => {
        const { name, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            observacionesCheckboxes: {
                ...prev.observacionesCheckboxes,
                [name]: checked
            }
        }));
    };

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setFormData((prev) => ({ ...prev, [name]: checked }));
    };

    const handleIniciarVideollamada = async () => {
        if (!paciente) {
            toast.error("No hay información del paciente");
            return;
        }

        if (!user || !user.id) {
            toast.error("No se pudo identificar al usuario médico");
            return;
        }

        try {
            setLoadingVideo(true);

            // Obtener nombre del médico desde el usuario
            const nombreMedico = user.nombres && user.apellidos
                ? `${user.nombres} ${user.apellidos}`.trim()
                : user.username || "Médico CENATE";

            // Crear la sala de videollamada
            const datosSala = {
                nombrePaciente: paciente.apellidosNombres || paciente.pacienteNombre || "Paciente",
                dniPaciente: paciente.numDoc || paciente.pacienteDni || paciente.docPaciente || "",
                idUsuarioMedico: user.id,
                nombreMedico: nombreMedico,
                motivoConsulta: formData.motivoConsulta || "Consulta de telemedicina"
            };

            const response = await telemedicinaService.crearSala(datosSala);

            console.log('📹 Respuesta del servidor:', response);

            if (response && response.roomUrl) {
                setVideoConsultaData({
                    roomUrl: response.roomUrl,
                    roomName: response.roomName || response.room_name,
                    nombrePaciente: response.nombrePaciente || response.nombre_paciente,
                    nombreMedico: response.nombreMedico || response.nombre_medico,
                    token: response.token // Guardar el token por si acaso
                });
                setShowVideoConsulta(true);
                toast.success("Sala de videollamada creada exitosamente");
            } else {
                console.error('❌ Respuesta inválida:', response);
                throw new Error("No se recibió la información de la sala");
            }
        } catch (error) {
            console.error("Error al crear sala de videollamada:", error);
            toast.error(error.response?.data?.message || "Error al iniciar la videollamada");
        } finally {
            setLoadingVideo(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.motivoConsulta.trim()) {
            toast.error("El motivo de consulta es obligatorio");
            return;
        }

        if (Object.keys(signosVitalesErrors).length > 0) {
            toast.error("Por favor, corrige los errores en los signos vitales antes de guardar");
            return;
        }

        const observacionesCheckboxes = [];
        if (formData.observacionesCheckboxes.dietaHiposodica) {
            observacionesCheckboxes.push("Dieta hiposódica reforzada");
        }
        if (formData.observacionesCheckboxes.signosAlarmaExplicados) {
            observacionesCheckboxes.push("Signos de alarma explicados");
        }
        if (formData.observacionesCheckboxes.verificaTecnicaAutomedida) {
            observacionesCheckboxes.push("Verifica técnica de automedida");
        }

        const observacionesCompletas = [
            ...observacionesCheckboxes,
            formData.observaciones.trim()
        ].filter(Boolean).join(". ");

        try {
            setLoading(true);
            const idPacienteNumerico = parseInt(paciente.pacienteDni) || paciente.idPaciente || 0;

            const payload = {
                idPaciente: idPacienteNumerico,
                idAtencionMedicaRef: paciente.tipoOrigen === "MEDICINA_GENERAL" ? paciente.idOrigen : null,
                idCitaRef: paciente.tipoOrigen === "CITA" ? paciente.idOrigen : null,
                motivoConsulta: formData.motivoConsulta,
                observaciones: observacionesCompletas,
                signosVitales: formData.signosVitales,
                idUsuarioEnfermera: user?.id || null,
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-[96vw] h-[92vh] flex flex-col overflow-hidden border border-gray-100">
                {/* Header Azul Marino Oscuro */ }
                <div className="relative flex items-center justify-between px-8 py-6 overflow-hidden border-b-2 border-[#084a8a] bg-[#084a8a] shadow-3xl">
                    {/* Efecto de brillo animado */ }
                    <div className="absolute inset-0 transform -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>

                    <div className="relative z-10 flex items-center flex-1 min-w-0 gap-4">
                        <div className="p-3 border shadow-lg bg-white/20 rounded-xl backdrop-blur-md shrink-0 border-white/30">
                            <Activity className="w-6 h-6 text-white drop-shadow-lg" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-2xl font-bold text-white mb-1.5 tracking-tight drop-shadow-md">Registro de Atención Clínica</h2>
                            <div className="flex items-center gap-2.5 flex-wrap">
                                <span className="text-sm font-semibold text-white/95 drop-shadow">{ paciente.pacienteNombre }</span>
                                <span className="text-sm text-white/70">•</span>
                                <span className="text-white/90 text-sm font-mono bg-white/10 px-2 py-0.5 rounded backdrop-blur-sm">DNI: { paciente.pacienteDni }</span>
                                { paciente.esCronico && (
                                    <span className="inline-flex items-center px-3 py-1 bg-purple-700 text-white rounded-lg text-[10px] font-bold shadow-md">
                                        ⚡ CRÓNICO
                                    </span>
                                ) }
                                { estrategiaSigla && (
                                    <span className="inline-flex items-center px-3 py-1 bg-green-600 text-white rounded-lg text-[10px] font-bold shadow-md">
                                        📋 { estrategiaSigla }
                                    </span>
                                ) }
                            </div>
                        </div>
                    </div>
                    <div className="relative z-10 flex items-center gap-3 shrink-0">
                        <button
                            onClick={ handleIniciarVideollamada }
                            disabled={ loadingVideo }
                            className="flex items-center gap-2 px-5 py-2.5 bg-[#084a8a] hover:bg-[#063d6f] text-white rounded-xl transition-all shadow-lg hover:shadow-2xl text-sm font-bold active:scale-95 border border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Iniciar videollamada con el paciente"
                        >
                            { loadingVideo ? (
                                <>
                                    <div className="w-5 h-5 border-2 rounded-full border-white/30 border-t-white animate-spin"></div>
                                    <span>Iniciando...</span>
                                </>
                            ) : (
                                <>
                                    <Video className="w-5 h-5" />
                                    <span>Iniciar Videollamada</span>
                                </>
                            ) }
                        </button>
                        <button
                            onClick={ onClose }
                            className="bg-white/20 hover:bg-white/30 p-2.5 rounded-xl transition-all text-white active:scale-95 backdrop-blur-sm border border-white/30"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Content */ }
                <div className="relative flex flex-1 overflow-hidden bg-gray-50/30">
                    {/* Left Panel: Historial (Colapsable) */ }
                    <div className={ `absolute left-0 top-0 bottom-0 bg-gradient-to-br from-slate-50 to-gray-100 flex flex-col transition-all duration-300 ease-in-out z-20 shadow-2xl border-r-2 border-[#084a8a]/30 ${isHistorialExpanded ? 'w-1/2 translate-x-0' : 'w-0 -translate-x-full opacity-0 pointer-events-none'
                        }` }>
                        <div className="flex items-center justify-between px-6 py-5 border-b-2 border-[#084a8a] shadow-xl bg-[#084a8a]">
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">
                                    <FileText className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-sm font-bold text-white drop-shadow">Historial Clínico y Antecedentes</span>
                            </div>
                            <button
                                onClick={ () => setIsHistorialExpanded(false) }
                                className="p-2 text-white transition-all border rounded-lg hover:bg-white/20 backdrop-blur-sm border-white/20"
                                title="Ocultar historial"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex-1 p-5 overflow-y-auto bg-white custom-scrollbar">
                            <TrazabilidadClinicaTabs pkAsegurado={ paciente.pkAsegurado || paciente.pacienteDni } />
                        </div>
                    </div>

                    {/* Right Panel: Contenido Principal */ }
                    <div className={ `flex flex-col bg-white transition-all duration-300 ease-in-out ${isHistorialExpanded ? 'w-1/2 ml-auto' : 'w-full'
                        }` }>
                        {/* Pestañas mejoradas */ }
                        <div className="border-b border-gray-200 bg-gradient-to-b from-gray-50 to-white">
                            <div className="flex items-center gap-1 px-6 pt-3 pb-0">
                                { [
                                    { id: "datos", label: "Datos del Paciente", icon: User },
                                    { id: "adscripcion", label: "Datos de Adscripción", icon: Building2 },
                                    { id: "historial", label: "Ver Historial", icon: History },
                                    { id: "registro", label: "Registro Clínico", icon: ClipboardList },
                                    { id: "proximas-citas", label: "Próximas Citas", icon: Calendar }
                                ].map((tab) => {
                                    const Icon = tab.icon;
                                    const isActive = activeTab === tab.id;
                                    return (
                                        <button
                                            key={ tab.id }
                                            onClick={ () => {
                                                setActiveTab(tab.id);
                                                if (tab.id === "historial") {
                                                    setIsHistorialExpanded(false);
                                                }
                                            } }
                                            className={ `flex items-center gap-2 px-5 py-3 text-sm font-medium rounded-t-lg transition-all relative ${isActive
                                                ? "bg-green-100 text-green-700 shadow-sm"
                                                : "text-gray-600 hover:text-[#084a8a] hover:bg-gray-50 border-t-2 border-l border-r border-transparent"
                                                }` }
                                        >
                                            <Icon className={ `w-4 h-4 ${isActive ? 'text-green-700' : 'text-gray-500'}` } />
                                            <span>{ tab.label }</span>
                                        </button>
                                    );
                                }) }
                            </div>
                        </div>

                        {/* Contenido de las pestañas */ }
                        <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50/50">
                            {/* Pestaña: Datos del Paciente */ }
                            { activeTab === "datos" && (
                                <div className="p-8">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="bg-[#084a8a]/20 p-2.5 rounded-lg">
                                            <User className="w-6 h-6 text-[#084a8a]" />
                                        </div>
                                        <h3 className="text-2xl font-bold tracking-tight text-gray-900">Información del Paciente</h3>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        { [
                                            { label: "Nombre Completo", value: paciente.pacienteNombre || "N/A", colSpan: "md:col-span-2" },
                                            { label: "DNI", value: paciente.pacienteDni || "N/A" },
                                            { label: "Edad", value: paciente.pacienteEdad ? `${paciente.pacienteEdad} años` : "N/A" },
                                            { label: "Sexo", value: paciente.pacienteSexo === 'M' ? 'Masculino' : paciente.pacienteSexo === 'F' ? 'Femenino' : paciente.pacienteSexo || "N/A" },
                                            { label: "Teléfono", value: paciente.telefono || "N/A" },
                                            { label: "Estado", value: null, badges: true }
                                        ].map((field, idx) => (
                                            <div key={ idx } className={ `bg-gradient-to-br from-white via-cyan-50/30 to-blue-50/20 border-2 border-cyan-200/50 rounded-xl p-5 shadow-md hover:shadow-xl hover:scale-[1.02] hover:border-cyan-300 transition-all duration-300 ${field.colSpan || ''}` }>
                                                <label className="block mb-2 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                                                    { field.label }
                                                </label>
                                                { field.badges ? (
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        { paciente.esCronico && (
                                                            <span className="inline-flex items-center px-3 py-1 text-xs font-bold text-purple-700 bg-purple-100 border border-purple-300 rounded-md">
                                                                CRÓNICO
                                                            </span>
                                                        ) }
                                                        { estrategiaSigla && (
                                                            <span className="inline-flex items-center px-3 py-1 text-xs font-bold text-green-700 bg-green-100 border border-green-300 rounded-md">
                                                                { estrategiaSigla }
                                                            </span>
                                                        ) }
                                                        { !paciente.esCronico && !estrategiaSigla && (
                                                            <span className="text-sm text-gray-400">N/A</span>
                                                        ) }
                                                    </div>
                                                ) : (
                                                    <p className="text-base font-bold text-gray-900 mt-1.5">{ field.value }</p>
                                                ) }
                                            </div>
                                        )) }
                                    </div>
                                </div>
                            ) }

                            {/* Pestaña: Datos de Adscripción */ }
                            { activeTab === "adscripcion" && (
                                <div className="p-8">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="bg-[#084a8a]/20 p-2.5 rounded-lg">
                                            <Building2 className="w-6 h-6 text-[#084a8a]" />
                                        </div>
                                        <h3 className="text-2xl font-bold tracking-tight text-gray-900">Centro de Adscripción</h3>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="bg-gradient-to-br from-white via-amber-50/30 to-orange-50/20 border-2 border-amber-200/50 rounded-xl p-5 shadow-md hover:shadow-xl hover:scale-[1.02] hover:border-amber-300 transition-all duration-300">
                                            <label className="block mb-2 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                                                IPRESS de Adscripción
                                            </label>
                                            <p className="mt-1 text-base font-semibold text-gray-900">{ paciente.nombreIpress || "N/A" }</p>
                                        </div>
                                        { paciente.pkAsegurado && (
                                            <div className="bg-gradient-to-br from-white via-amber-50/30 to-orange-50/20 border-2 border-amber-200/50 rounded-xl p-5 shadow-md hover:shadow-xl hover:scale-[1.02] hover:border-amber-300 transition-all duration-300">
                                                <label className="block mb-2 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                                                    PK Asegurado
                                                </label>
                                                <p className="px-3 py-2 mt-1 font-mono text-sm text-gray-700 border rounded-lg shadow-inner bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">{ paciente.pkAsegurado }</p>
                                            </div>
                                        ) }
                                    </div>
                                </div>
                            ) }

                            {/* Pestaña: Ver Historial */ }
                            { activeTab === "historial" && (
                                <div className="p-8">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="bg-[#084a8a]/20 p-2.5 rounded-lg">
                                            <History className="w-6 h-6 text-[#084a8a]" />
                                        </div>
                                        <h3 className="text-2xl font-bold tracking-tight text-gray-900">Historial Clínico y Antecedentes</h3>
                                    </div>
                                    <div className="overflow-hidden border-2 shadow-lg bg-gradient-to-br from-white via-purple-50/20 to-indigo-50/10 border-purple-200/50 rounded-xl">
                                        <TrazabilidadClinicaTabs pkAsegurado={ paciente.pkAsegurado || paciente.pacienteDni } />
                                    </div>
                                </div>
                            ) }

                            {/* Pestaña: Próximas Citas */ }
                            { activeTab === "proximas-citas" && (
                                <div className="p-8">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="bg-[#084a8a]/20 p-2.5 rounded-lg">
                                            <Calendar className="w-6 h-6 text-[#084a8a]" />
                                        </div>
                                        <h3 className="text-2xl font-bold tracking-tight text-gray-900">Próximas Citas Agendadas</h3>
                                    </div>

                                    { loadingCitas ? (
                                        <div className="flex items-center justify-center py-16">
                                            <div className="flex flex-col items-center gap-4">
                                                <Activity className="w-10 h-10 text-[#084a8a] animate-spin" />
                                                <span className="font-medium text-gray-600">Cargando citas...</span>
                                            </div>
                                        </div>
                                    ) : proximasCitas.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                                            <div className="p-6 mb-4 bg-gray-100 rounded-full">
                                                <Calendar className="w-12 h-12 text-gray-300" />
                                            </div>
                                            <p className="mb-1 text-base font-semibold text-gray-600">No hay próximas citas agendadas</p>
                                            <p className="text-sm text-gray-400">El paciente no tiene citas programadas</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-4">
                                            { proximasCitas.map((cita, index) => {
                                                const fechaCita = new Date(cita.fechaCita);
                                                const fechaFormateada = fechaCita.toLocaleDateString('es-PE', {
                                                    weekday: 'long',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                });
                                                const horaFormateada = cita.horaCita
                                                    ? new Date(`2000-01-01T${cita.horaCita}`).toLocaleTimeString('es-PE', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })
                                                    : "Hora no definida";

                                                const getEstadoBadge = () => {
                                                    if (cita.idEstadoCita === 2) {
                                                        return { text: "Programada", bg: "bg-green-50", textColor: "text-green-700", border: "border-green-200" };
                                                    } else if (cita.idEstadoCita === 3) {
                                                        return { text: "Confirmada", bg: "bg-purple-50", textColor: "text-purple-700", border: "border-purple-200" };
                                                    }
                                                    return { text: "Pendiente", bg: "bg-gray-50", textColor: "text-gray-700", border: "border-gray-200" };
                                                };

                                                const estado = getEstadoBadge();

                                                return (
                                                    <div key={ cita.idSolicitud || index } className="bg-gradient-to-br from-white via-pink-50/30 to-rose-50/20 border-2 border-pink-300 rounded-2xl p-6 shadow-lg hover:shadow-2xl hover:scale-[1.03] hover:border-pink-400 transition-all duration-200">
                                                        <div className="flex items-start gap-4">
                                                            <div className="p-3 rounded-lg bg-[#084a8a]/20 shrink-0">
                                                                <Calendar className="w-6 h-6 text-[#084a8a]" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-start justify-between mb-3">
                                                                    <div>
                                                                        <p className="mb-1 text-lg font-bold text-gray-900 capitalize">{ fechaFormateada }</p>
                                                                        <p className="text-sm font-medium text-gray-600">🕐 Hora: { horaFormateada }</p>
                                                                    </div>
                                                                    { cita.idEstadoCita && (
                                                                        <span className={ `inline-flex items-center px-3 py-1.5 ${estado.bg} ${estado.textColor} border ${estado.border} rounded-lg text-xs font-bold shrink-0` }>
                                                                            { estado.text }
                                                                        </span>
                                                                    ) }
                                                                </div>

                                                                { cita.descServicio && (
                                                                    <div className="mb-3">
                                                                        <span className="inline-flex items-center px-3 py-1.5 bg-green-100 text-green-700 border border-green-300 rounded-md text-sm font-semibold">
                                                                            { cita.descServicio }
                                                                        </span>
                                                                    </div>
                                                                ) }

                                                                <div className="space-y-2">
                                                                    { cita.descActividad && (
                                                                        <p className="text-sm text-gray-700">
                                                                            <span className="font-semibold text-gray-900">Actividad:</span> { cita.descActividad }
                                                                        </p>
                                                                    ) }
                                                                    { cita.descSubactividad && (
                                                                        <p className="text-sm text-gray-700">
                                                                            <span className="font-semibold text-gray-900">Subactividad:</span> { cita.descSubactividad }
                                                                        </p>
                                                                    ) }
                                                                    { cita.observacion && (
                                                                        <p className="pt-2 text-sm italic text-gray-600 border-t border-gray-100">
                                                                            { cita.observacion }
                                                                        </p>
                                                                    ) }
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            }) }
                                        </div>
                                    ) }
                                </div>
                            ) }

                            {/* Pestaña: Registro Clínico */ }
                            { activeTab === "registro" && (
                                <form onSubmit={ handleSubmit } className="p-8 space-y-6 bg-gray-50/50">
                                    {/* Signos Vitales */ }
                                    <div className="p-8 bg-white border-2 border-gray-200 shadow-xl rounded-2xl">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="bg-green-100 p-2.5 rounded-lg">
                                                <Activity className="w-5 h-5 text-green-600" />
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-900">Signos Vitales</h3>
                                        </div>
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                            { [
                                                { name: "sv_pa", label: "P. Arterial (mmHg)", placeholder: "120/80", type: "text" },
                                                { name: "sv_fc", label: "F. Cardíaca (lpm)", placeholder: "72", type: "number" },
                                                { name: "sv_spo2", label: "Sat. O2 (%)", placeholder: "98", type: "number" },
                                                { name: "sv_temp", label: "Temp (°C)", placeholder: "36.5", type: "number", step: "0.1" },
                                                { name: "sv_peso", label: "Peso (Kg)", placeholder: "70.5", type: "number", step: "0.1" },
                                                { name: "sv_talla", label: "Talla (cm)", placeholder: "170", type: "number" }
                                            ].map((field) => (
                                                <div key={ field.name }>
                                                    <label className="block mb-2 text-xs font-semibold text-gray-700">
                                                        { field.label }
                                                    </label>
                                                    <input
                                                        name={ field.name }
                                                        type={ field.type }
                                                        step={ field.step }
                                                        value={ formData.signosVitales[field.name.replace("sv_", "")] }
                                                        onChange={ handleChange }
                                                        placeholder={ field.placeholder }
                                                        className={ `w-full px-4 py-2.5 border rounded-lg transition-all text-sm font-medium ${signosVitalesErrors[field.name.replace("sv_", "")]
                                                            ? "bg-purple-50 border-purple-400 text-purple-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                                            : "bg-white border-[#084a8a]/30 text-gray-900 focus:ring-2 focus:ring-[#084a8a] focus:border-[#084a8a] hover:border-[#084a8a]/50"
                                                            }` }
                                                    />
                                                    { signosVitalesErrors[field.name.replace("sv_", "")] && (
                                                        <p className="text-xs text-purple-600 mt-1.5 font-medium flex items-center gap-1">
                                                            <AlertCircle className="w-3 h-3" />
                                                            { signosVitalesErrors[field.name.replace("sv_", "")] }
                                                        </p>
                                                    ) }
                                                </div>
                                            )) }
                                        </div>
                                    </div>

                                    {/* Motivo de Consulta */ }
                                    <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
                                        <label className="block mb-4 text-base font-bold text-gray-900">
                                            Motivo de Atención <span className="text-purple-600">*</span>
                                        </label>
                                        <select
                                            name="motivoConsulta"
                                            value={ formData.motivoConsulta }
                                            onChange={ handleChange }
                                            className="w-full px-4 py-2.5 border border-[#084a8a]/30 rounded-lg focus:ring-2 focus:ring-[#084a8a] focus:border-[#084a8a] bg-white text-gray-900 font-medium transition-all hover:border-[#084a8a]/50"
                                            required
                                        >
                                            <option value="">Seleccione un motivo...</option>
                                            <option value="Control Rutina">Control Rutina</option>
                                            <option value="Urgencia">Urgencia</option>
                                            <option value="Telemonitoreo">Telemonitoreo</option>
                                            <option value="Consejería">Consejería</option>
                                        </select>
                                    </div>

                                    {/* Observaciones */ }
                                    <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
                                        <label className="block mb-4 text-sm font-bold text-gray-900">
                                            Observaciones y Recomendaciones
                                        </label>

                                        <div className="p-4 mb-4 space-y-3 border border-gray-200 rounded-lg bg-gray-50">
                                            { [
                                                { name: "dietaHiposodica", label: "Dieta hiposódica reforzada" },
                                                { name: "signosAlarmaExplicados", label: "Signos de alarma explicados" },
                                                { name: "verificaTecnicaAutomedida", label: "Verifica técnica de automedida" }
                                            ].map((checkbox) => (
                                                <label key={ checkbox.name } className="flex items-center gap-3 cursor-pointer group">
                                                    <input
                                                        type="checkbox"
                                                        name={ checkbox.name }
                                                        checked={ formData.observacionesCheckboxes[checkbox.name] }
                                                        onChange={ handleCheckboxObservacion }
                                                        className="w-5 h-5 text-[#084a8a] transition-all border-[#084a8a]/30 rounded cursor-pointer focus:ring-2 focus:ring-[#084a8a]"
                                                    />
                                                    <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900">
                                                        { checkbox.label }
                                                    </span>
                                                </label>
                                            )) }
                                        </div>

                                        <textarea
                                            name="observaciones"
                                            rows={ 4 }
                                            value={ formData.observaciones }
                                            onChange={ handleChange }
                                            placeholder="Observaciones adicionales o excepciones..."
                                            className="w-full px-4 py-3 text-sm font-medium text-gray-900 transition-all bg-white border border-[#084a8a]/30 rounded-lg resize-none focus:ring-2 focus:ring-[#084a8a] focus:border-[#084a8a] hover:border-[#084a8a]/50"
                                        />
                                        <p className="mt-2 text-xs text-gray-500">Use este campo solo para observaciones adicionales o excepciones</p>
                                    </div>

                                    {/* Interconsulta */ }
                                    <div className="p-8 border-2 border-purple-300 shadow-xl bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl">
                                        <label className="flex items-center gap-4 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                id="derivaInterconsulta"
                                                name="derivaInterconsulta"
                                                checked={ formData.derivaInterconsulta }
                                                onChange={ handleCheckboxChange }
                                                className="w-5 h-5 text-[#084a8a] border-[#084a8a]/30 rounded cursor-pointer focus:ring-2 focus:ring-[#084a8a]"
                                            />
                                            <div className="flex items-center gap-2.5">
                                                <Share2 className="w-5 h-5 text-purple-600" />
                                                <span className="text-base font-bold text-gray-900">Requiere Interconsulta / Derivación</span>
                                            </div>
                                        </label>

                                        { formData.derivaInterconsulta && (
                                            <div className="pl-8 mt-5 space-y-4 border-l-2 border-purple-300">
                                                <div>
                                                    <label className="block mb-2 text-xs font-semibold text-gray-700">Especialidad Destino</label>
                                                    <select
                                                        name="especialidadInterconsulta"
                                                        value={ formData.especialidadInterconsulta }
                                                        onChange={ handleChange }
                                                        className="w-full px-4 py-2.5 bg-white border border-[#084a8a]/30 rounded-lg focus:ring-2 focus:ring-[#084a8a] focus:border-[#084a8a] text-sm font-medium transition-all hover:border-[#084a8a]/50"
                                                    >
                                                        <option value="">Seleccione...</option>
                                                        <option value="NUTRICION">Nutrición</option>
                                                        <option value="PSICOLOGIA">Psicología</option>
                                                        <option value="CARDIOLOGIA">Cardiología</option>
                                                        <option value="MEDICINA_FISICA">Medicina Física</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block mb-2 text-xs font-semibold text-gray-700">Motivo de Derivación</label>
                                                    <input
                                                        name="motivoInterconsulta"
                                                        value={ formData.motivoInterconsulta }
                                                        onChange={ handleChange }
                                                        className="w-full px-4 py-2.5 bg-white border border-[#084a8a]/30 rounded-lg focus:ring-2 focus:ring-[#084a8a] focus:border-[#084a8a] text-sm font-medium transition-all hover:border-[#084a8a]/50"
                                                    />
                                                </div>
                                            </div>
                                        ) }
                                    </div>
                                </form>
                            ) }
                        </div>

                        {/* Footer Actions */ }
                        { activeTab === "registro" && (
                            <div className="flex justify-end gap-4 px-8 py-6 border-t-2 border-gray-200 shadow-lg bg-gradient-to-r from-gray-50 to-white">
                                <button
                                    type="button"
                                    onClick={ onClose }
                                    className="px-6 py-3 font-bold text-gray-700 transition-all bg-white border-2 border-gray-300 shadow-md hover:bg-gray-50 hover:border-gray-400 rounded-xl hover:shadow-lg active:scale-95"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={ handleSubmit }
                                    disabled={ loading }
                                    className="px-8 py-3.5 bg-[#084a8a] hover:bg-[#063d6f] text-white font-bold rounded-xl focus:ring-4 focus:ring-[#084a8a]/50 transition-all shadow-xl hover:shadow-2xl flex items-center gap-2.5 disabled:opacity-70 disabled:cursor-not-allowed active:scale-95"
                                >
                                    { loading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 rounded-full border-white/30 border-t-white animate-spin"></div>
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
                        ) }
                    </div>
                </div>
            </div>

            {/* Componente de Videollamada con todas las pestañas del modal */ }
            { showVideoConsulta && videoConsultaData && (
                <VideoConsulta
                    isOpen={ showVideoConsulta }
                    onClose={ () => {
                        setShowVideoConsulta(false);
                        setVideoConsultaData(null);
                    } }
                    roomUrl={ videoConsultaData.roomUrl }
                    roomName={ videoConsultaData.roomName }
                    nombrePaciente={ videoConsultaData.nombrePaciente }
                    nombreMedico={ videoConsultaData.nombreMedico }
                    token={ videoConsultaData.token }
                    onCallEnd={ () => {
                        toast.info("Videollamada finalizada");
                        setShowVideoConsulta(false);
                        setVideoConsultaData(null);
                    } }
                    registroContent={
                        <div className="flex flex-col h-full bg-white">
                            {/* Header del Modal */}
                            <div className="relative flex items-center justify-between px-6 py-4 overflow-hidden border-b-2 border-[#084a8a] bg-[#084a8a] shadow-lg">
                                <div className="relative z-10 flex items-center flex-1 min-w-0 gap-3">
                                    <div className="p-2 border shadow-lg bg-white/20 rounded-lg backdrop-blur-md shrink-0 border-white/30">
                                        <Activity className="w-5 h-5 text-white drop-shadow-lg" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h2 className="text-xl font-bold text-white mb-1 tracking-tight drop-shadow-md">Registro de Atención Clínica</h2>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-xs font-semibold text-white/95 drop-shadow">{ paciente.pacienteNombre }</span>
                                            <span className="text-xs text-white/70">•</span>
                                            <span className="text-white/90 text-xs font-mono bg-white/10 px-2 py-0.5 rounded backdrop-blur-sm">DNI: { paciente.pacienteDni }</span>
                                            { paciente.esCronico && (
                                                <span className="inline-flex items-center px-2 py-0.5 bg-purple-700 text-white rounded text-[10px] font-bold shadow-md">
                                                    ⚡ CRÓNICO
                                                </span>
                                            ) }
                                            { estrategiaSigla && (
                                                <span className="inline-flex items-center px-2 py-0.5 bg-green-600 text-white rounded text-[10px] font-bold shadow-md">
                                                    📋 { estrategiaSigla }
                                                </span>
                                            ) }
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Pestañas */}
                            <div className="border-b border-gray-200 bg-gradient-to-b from-gray-50 to-white">
                                <div className="flex items-center gap-1 px-4 pt-2 pb-0 overflow-x-auto">
                                    { [
                                        { id: "datos", label: "Datos del Paciente", icon: User },
                                        { id: "adscripcion", label: "Adscripción", icon: Building2 },
                                        { id: "historial", label: "Historial", icon: History },
                                        { id: "registro", label: "Registro", icon: ClipboardList },
                                        { id: "proximas-citas", label: "Próximas Citas", icon: Calendar }
                                    ].map((tab) => {
                                        const Icon = tab.icon;
                                        const isActive = activeTab === tab.id;
                                        return (
                                            <button
                                                key={ tab.id }
                                                onClick={ () => setActiveTab(tab.id) }
                                                className={ `flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-t-lg transition-all whitespace-nowrap ${isActive
                                                    ? "bg-green-100 text-green-700 shadow-sm"
                                                    : "text-gray-600 hover:text-[#084a8a] hover:bg-gray-50 border-t-2 border-l border-r border-transparent"
                                                }` }
                                            >
                                                <Icon className={ `w-3 h-3 ${isActive ? 'text-green-700' : 'text-gray-500'}` } />
                                                <span>{ tab.label }</span>
                                            </button>
                                        );
                                    }) }
                                </div>
                            </div>

                            {/* Contenido de las pestañas */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50/50">
                                {/* Pestaña: Datos del Paciente */}
                                { activeTab === "datos" && (
                                    <div className="p-4">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="p-2 rounded-lg bg-[#084a8a]/20">
                                                <User className="w-4 h-4 text-[#084a8a]" />
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-900">Información del Paciente</h3>
                                        </div>
                                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                            { [
                                                { label: "Nombre Completo", value: paciente.pacienteNombre || "N/A", colSpan: "md:col-span-2" },
                                                { label: "DNI", value: paciente.pacienteDni || "N/A" },
                                                { label: "Edad", value: paciente.pacienteEdad ? `${paciente.pacienteEdad} años` : "N/A" },
                                                { label: "Sexo", value: paciente.pacienteSexo === 'M' ? 'Masculino' : paciente.pacienteSexo === 'F' ? 'Femenino' : paciente.pacienteSexo || "N/A" },
                                                { label: "Teléfono", value: paciente.telefono || "N/A" },
                                                { label: "Estado", value: null, badges: true }
                                            ].map((field, idx) => (
                                                <div key={ idx } className={ `bg-white border border-gray-200 rounded-lg p-3 shadow-sm ${field.colSpan || ''}` }>
                                                    <label className="block mb-1 text-xs font-semibold text-gray-500 uppercase">
                                                        { field.label }
                                                    </label>
                                                    { field.badges ? (
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            { paciente.esCronico && (
                                                                <span className="inline-flex items-center px-2 py-1 text-xs font-bold text-purple-700 bg-purple-100 border border-purple-300 rounded">
                                                                    CRÓNICO
                                                                </span>
                                                            ) }
                                                            { estrategiaSigla && (
                                                                <span className="inline-flex items-center px-2 py-1 text-xs font-bold text-green-700 bg-green-100 border border-green-300 rounded">
                                                                    { estrategiaSigla }
                                                                </span>
                                                            ) }
                                                            { !paciente.esCronico && !estrategiaSigla && (
                                                                <span className="text-xs text-gray-400">N/A</span>
                                                            ) }
                                                        </div>
                                                    ) : (
                                                        <p className="mt-1 text-sm font-bold text-gray-900">{ field.value }</p>
                                                    ) }
                                                </div>
                                            )) }
                                        </div>
                                    </div>
                                ) }

                                {/* Pestaña: Datos de Adscripción */}
                                { activeTab === "adscripcion" && (
                                    <div className="p-4">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="p-2 rounded-lg bg-[#084a8a]/20">
                                                <Building2 className="w-4 h-4 text-[#084a8a]" />
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-900">Centro de Adscripción</h3>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                                                <label className="block mb-1 text-xs font-semibold text-gray-500 uppercase">
                                                    IPRESS de Adscripción
                                                </label>
                                                <p className="mt-1 text-sm font-semibold text-gray-900">{ paciente.nombreIpress || "N/A" }</p>
                                            </div>
                                            { paciente.pkAsegurado && (
                                                <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                                                    <label className="block mb-1 text-xs font-semibold text-gray-500 uppercase">
                                                        PK Asegurado
                                                    </label>
                                                    <p className="px-2 py-1 mt-1 font-mono text-xs text-gray-700 border border-gray-200 rounded bg-gray-50">{ paciente.pkAsegurado }</p>
                                                </div>
                                            ) }
                                        </div>
                                    </div>
                                ) }

                                {/* Pestaña: Ver Historial */}
                                { activeTab === "historial" && (
                                    <div className="p-4">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="p-2 rounded-lg bg-[#084a8a]/20">
                                                <History className="w-4 h-4 text-[#084a8a]" />
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-900">Historial Clínico y Antecedentes</h3>
                                        </div>
                                        <div className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm">
                                            <TrazabilidadClinicaTabs pkAsegurado={ paciente.pkAsegurado || paciente.pacienteDni } />
                                        </div>
                                    </div>
                                ) }

                                {/* Pestaña: Próximas Citas */}
                                { activeTab === "proximas-citas" && (
                                    <div className="p-4">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="p-2 rounded-lg bg-[#084a8a]/20">
                                                <Calendar className="w-4 h-4 text-[#084a8a]" />
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-900">Próximas Citas Agendadas</h3>
                                        </div>

                                        { loadingCitas ? (
                                            <div className="flex items-center justify-center py-12">
                                                <div className="flex flex-col items-center gap-3">
                                                    <Activity className="w-8 h-8 text-[#084a8a] animate-spin" />
                                                    <span className="text-sm font-medium text-gray-600">Cargando citas...</span>
                                                </div>
                                            </div>
                                        ) : proximasCitas.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                                <div className="p-4 mb-3 bg-gray-100 rounded-full">
                                                    <Calendar className="w-8 h-8 text-gray-300" />
                                                </div>
                                                <p className="mb-1 text-sm font-semibold text-gray-600">No hay próximas citas agendadas</p>
                                                <p className="text-xs text-gray-400">El paciente no tiene citas programadas</p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 gap-3">
                                                { proximasCitas.map((cita, index) => {
                                                    const fechaCita = new Date(cita.fechaCita);
                                                    const fechaFormateada = fechaCita.toLocaleDateString('es-PE', {
                                                        weekday: 'short',
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    });
                                                    const horaFormateada = cita.horaCita
                                                        ? new Date(`2000-01-01T${cita.horaCita}`).toLocaleTimeString('es-PE', {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })
                                                        : "Hora no definida";

                                                    const getEstadoBadge = () => {
                                                        if (cita.idEstadoCita === 2) {
                                                            return { text: "Programada", bg: "bg-green-50", textColor: "text-green-700", border: "border-green-200" };
                                                        } else if (cita.idEstadoCita === 3) {
                                                            return { text: "Confirmada", bg: "bg-purple-50", textColor: "text-purple-700", border: "border-purple-200" };
                                                        }
                                                        return { text: "Pendiente", bg: "bg-gray-50", textColor: "text-gray-700", border: "border-gray-200" };
                                                    };

                                                    const estado = getEstadoBadge();

                                                    return (
                                                        <div key={ cita.idSolicitud || index } className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                                                            <div className="flex items-start gap-3">
                                                                <div className="p-2 rounded-lg bg-blue-400/20 shrink-0">
                                                                    <Calendar className="w-4 h-4 text-[#084a8a]" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-start justify-between mb-2">
                                                                        <div>
                                                                            <p className="text-sm font-bold text-gray-900 capitalize">{ fechaFormateada }</p>
                                                                            <p className="text-xs font-medium text-gray-600">🕐 { horaFormateada }</p>
                                                                        </div>
                                                                        { cita.idEstadoCita && (
                                                                            <span className={ `inline-flex items-center px-2 py-1 ${estado.bg} ${estado.textColor} border ${estado.border} rounded text-xs font-bold shrink-0` }>
                                                                                { estado.text }
                                                                            </span>
                                                                        ) }
                                                                    </div>
                                                                    { cita.descServicio && (
                                                                        <div className="mb-2">
                                                                            <span className="inline-flex items-center px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 border border-green-300 rounded">
                                                                                { cita.descServicio }
                                                                            </span>
                                                                        </div>
                                                                    ) }
                                                                    { cita.descActividad && (
                                                                        <p className="text-xs text-gray-700">
                                                                            <span className="font-semibold text-gray-900">Actividad:</span> { cita.descActividad }
                                                                        </p>
                                                                    ) }
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                }) }
                                            </div>
                                        ) }
                                    </div>
                                ) }

                                {/* Pestaña: Registro Clínico */}
                                { activeTab === "registro" && (
                                    <form onSubmit={ handleSubmit } className="p-4 space-y-4">
                                        {/* Signos Vitales */}
                                        <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className="bg-green-100 p-1.5 rounded-lg">
                                                    <Activity className="w-3 h-3 text-green-600" />
                                                </div>
                                                <h3 className="text-sm font-bold text-gray-900">Signos Vitales</h3>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                { [
                                                    { name: "sv_pa", label: "P. Arterial", placeholder: "120/80", type: "text" },
                                                    { name: "sv_fc", label: "F. Cardíaca", placeholder: "72", type: "number" },
                                                    { name: "sv_spo2", label: "Sat. O2 (%)", placeholder: "98", type: "number" },
                                                    { name: "sv_temp", label: "Temp (°C)", placeholder: "36.5", type: "number", step: "0.1" },
                                                    { name: "sv_peso", label: "Peso (Kg)", placeholder: "70.5", type: "number", step: "0.1" },
                                                    { name: "sv_talla", label: "Talla (cm)", placeholder: "170", type: "number" }
                                                ].map((field) => (
                                                    <div key={ field.name }>
                                                        <label className="block mb-1 text-xs font-semibold text-gray-700">
                                                            { field.label }
                                                        </label>
                                                        <input
                                                            name={ field.name }
                                                            type={ field.type }
                                                            step={ field.step }
                                                            value={ formData.signosVitales[field.name.replace("sv_", "")] }
                                                            onChange={ handleChange }
                                                            placeholder={ field.placeholder }
                                                            className={ `w-full px-2 py-1.5 border rounded text-xs transition-all ${signosVitalesErrors[field.name.replace("sv_", "")]
                                                                ? "bg-purple-50 border-purple-400"
                                                                : "bg-white border-[#084a8a]/30 focus:ring-2 focus:ring-[#084a8a] focus:border-[#084a8a] hover:border-[#084a8a]/50"
                                                                }` }
                                                        />
                                                    </div>
                                                )) }
                                            </div>
                                        </div>

                                        {/* Motivo de Consulta */}
                                        <div className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                                            <label className="block mb-2 text-xs font-bold text-gray-900">
                                                Motivo de Atención <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                name="motivoConsulta"
                                                value={ formData.motivoConsulta }
                                                onChange={ handleChange }
                                                className="w-full px-3 py-2 text-xs border border-[#084a8a]/30 rounded-lg focus:ring-2 focus:ring-[#084a8a] focus:border-[#084a8a] hover:border-[#084a8a]/50 transition-all"
                                                required
                                            >
                                                <option value="">Seleccione...</option>
                                                <option value="Control Rutina">Control Rutina</option>
                                                <option value="Urgencia">Urgencia</option>
                                                <option value="Telemonitoreo">Telemonitoreo</option>
                                                <option value="Consejería">Consejería</option>
                                            </select>
                                        </div>

                                        {/* Observaciones */}
                                        <div className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                                            <label className="block mb-2 text-xs font-bold text-gray-900">
                                                Observaciones
                                            </label>
                                            <div className="space-y-1.5 mb-2 p-2 bg-gray-50 rounded border border-gray-200">
                                                { [
                                                    { name: "dietaHiposodica", label: "Dieta hiposódica reforzada" },
                                                    { name: "signosAlarmaExplicados", label: "Signos de alarma explicados" },
                                                    { name: "verificaTecnicaAutomedida", label: "Verifica técnica de automedida" }
                                                ].map((checkbox) => (
                                                    <label key={ checkbox.name } className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            name={ checkbox.name }
                                                            checked={ formData.observacionesCheckboxes[checkbox.name] }
                                                            onChange={ handleCheckboxObservacion }
                                                            className="w-3 h-3 text-[#084a8a] border-[#084a8a]/30 rounded focus:ring-2 focus:ring-[#084a8a]"
                                                        />
                                                        <span className="text-xs font-medium text-gray-700">
                                                            { checkbox.label }
                                                        </span>
                                                    </label>
                                                )) }
                                            </div>
                                            <textarea
                                                name="observaciones"
                                                rows={ 3 }
                                                value={ formData.observaciones }
                                                onChange={ handleChange }
                                                placeholder="Observaciones adicionales..."
                                                className="w-full px-3 py-2 text-xs border border-[#084a8a]/30 rounded-lg resize-none focus:ring-2 focus:ring-[#084a8a] focus:border-[#084a8a] hover:border-[#084a8a]/50 transition-all"
                                            />
                                        </div>

                                        {/* Interconsulta */}
                                        <div className="p-3 border border-purple-200 rounded-lg shadow-sm bg-purple-50">
                                            <label className="flex items-center gap-2 mb-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    name="derivaInterconsulta"
                                                    checked={ formData.derivaInterconsulta }
                                                    onChange={ handleCheckboxChange }
                                                    className="w-3 h-3 text-[#084a8a] border-[#084a8a]/30 rounded focus:ring-2 focus:ring-[#084a8a]"
                                                />
                                                <span className="text-xs font-bold text-gray-900">Requiere Interconsulta</span>
                                            </label>
                                            { formData.derivaInterconsulta && (
                                                <div className="pl-4 mt-2 space-y-2 border-l-2 border-purple-300">
                                                    <div>
                                                        <label className="block mb-1 text-xs font-semibold text-gray-700">Especialidad</label>
                                                        <select
                                                            name="especialidadInterconsulta"
                                                            value={ formData.especialidadInterconsulta }
                                                            onChange={ handleChange }
                                                            className="w-full px-2 py-1.5 bg-white border border-[#084a8a]/30 rounded text-xs focus:ring-2 focus:ring-[#084a8a] focus:border-[#084a8a] hover:border-[#084a8a]/50 transition-all"
                                                        >
                                                            <option value="">Seleccione...</option>
                                                            <option value="NUTRICION">Nutrición</option>
                                                            <option value="PSICOLOGIA">Psicología</option>
                                                            <option value="CARDIOLOGIA">Cardiología</option>
                                                            <option value="MEDICINA_FISICA">Medicina Física</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block mb-1 text-xs font-semibold text-gray-700">Motivo</label>
                                                        <input
                                                            name="motivoInterconsulta"
                                                            value={ formData.motivoInterconsulta }
                                                            onChange={ handleChange }
                                                            className="w-full px-2 py-1.5 bg-white border border-[#084a8a]/30 rounded text-xs focus:ring-2 focus:ring-[#084a8a] focus:border-[#084a8a] hover:border-[#084a8a]/50 transition-all"
                                                            placeholder="Motivo de derivación..."
                                                        />
                                                    </div>
                                                </div>
                                            ) }
                                        </div>

                                        {/* Botones de acción */}
                                        <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
                                            <button
                                                type="button"
                                                onClick={ () => {
                                                    setShowVideoConsulta(false);
                                                    setVideoConsultaData(null);
                                                } }
                                                className="px-4 py-2 text-xs font-semibold text-gray-700 transition-all bg-white border border-gray-300 rounded hover:bg-gray-50"
                                            >
                                                Cerrar
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={ loading }
                                                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white transition-all bg-[#084a8a] rounded hover:bg-[#063d6f] disabled:opacity-70 disabled:cursor-not-allowed"
                                            >
                                                { loading ? (
                                                    <>
                                                        <div className="w-3 h-3 border-2 rounded-full border-white/30 border-t-white animate-spin"></div>
                                                        Guardando...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="w-3 h-3" />
                                                        Finalizar Atención
                                                    </>
                                                ) }
                                            </button>
                                        </div>
                                    </form>
                                ) }
                            </div>
                        </div>
                    }
                />
            ) }
        </div>
    );
}
import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../services/apiClient";
import formularioDiagnosticoService from "../../../services/formularioDiagnosticoService";
import firmaDigitalService from "../../../services/firmaDigitalService";
import FirmaDigitalModal from "../../../components/modals/FirmaDigitalModal";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import toast from "react-hot-toast";
import {
    ClipboardList,
    ArrowRight,
    ArrowLeft,
    FileText,
    CheckCircle2,
    AlertCircle,
    Calendar,
    HelpCircle,
    ListChecks,
    BookOpen,
    Users,
    Building2,
    Monitor,
    Wifi,
    Stethoscope,
    FileQuestion,
    Save,
    Send,
    Check,
    FileDown,
    Eye,
    Download,
    Printer,
    Loader2,
    Edit2,
    Trash2,
    ChevronDown,
    Shield,
    Home,
    Clock,
    FileCheck,
    ExternalLink
} from "lucide-react";

// Componente de selector numérico profesional con dropdown usando portal
const NumberSelector = ({ value, onChange, min = 0, max = 100, className = "", placeholder = "0", disabled = false }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [searchValue, setSearchValue] = React.useState("");
    const [position, setPosition] = React.useState({ top: 0, left: 0, width: 0 });
    const buttonRef = React.useRef(null);
    const dropdownRef = React.useRef(null);

    const options = Array.from({ length: max - min + 1 }, (_, i) => min + i);
    const filteredOptions = searchValue
        ? options.filter(num => num.toString().includes(searchValue))
        : options;

    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (buttonRef.current && !buttonRef.current.contains(event.target) &&
                dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
                setSearchValue("");
            }
        };
        const handleScroll = (event) => {
            // Ignorar scroll dentro del dropdown
            if (dropdownRef.current && dropdownRef.current.contains(event.target)) {
                return;
            }
            if (isOpen) setIsOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        window.addEventListener("scroll", handleScroll, true);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            window.removeEventListener("scroll", handleScroll, true);
        };
    }, [isOpen]);

    const handleToggle = () => {
        if (disabled) return; // No hacer nada si está deshabilitado
        if (!isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setPosition({
                top: rect.bottom + 4,
                left: rect.left,
                width: rect.width
            });
        }
        setIsOpen(!isOpen);
        setSearchValue("");
    };

    const handleSelect = (num) => {
        onChange({ target: { value: num.toString() } });
        setIsOpen(false);
        setSearchValue("");
    };

    return (
        <>
            <div className={`relative ${className}`}>
                <button
                    ref={buttonRef}
                    type="button"
                    onClick={handleToggle}
                    disabled={disabled}
                    className={`w-full px-3 py-2 border-2 rounded-lg transition-all flex items-center justify-between gap-2 text-left ${
                        disabled
                            ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                            : "bg-yellow-50 border-yellow-300 hover:bg-yellow-100 focus:border-[#0A5BA9] focus:ring-2 focus:ring-[#0A5BA9]/20"
                    }`}
                >
                    <span className={value !== "" && value !== undefined && !disabled ? "text-gray-900 font-medium" : "text-gray-400"}>
                        {value !== "" && value !== undefined ? value : placeholder}
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${disabled ? "text-gray-300" : "text-gray-500"} ${isOpen ? "rotate-180" : ""}`} />
                </button>
            </div>

            {isOpen && !disabled && ReactDOM.createPortal(
                <div
                    ref={dropdownRef}
                    className="bg-white border border-gray-300 rounded-lg shadow-2xl"
                    style={{
                        position: 'fixed',
                        top: position.top,
                        left: position.left,
                        width: Math.max(position.width, 140),
                        zIndex: 99999
                    }}
                >
                    <div className="p-2 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                        <input
                            type="text"
                            placeholder="Buscar..."
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-[#0A5BA9] focus:ring-2 focus:ring-[#0A5BA9]/20 bg-white"
                            autoFocus
                        />
                    </div>
                    <div className="max-h-52 overflow-y-auto bg-white rounded-b-lg">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((num) => (
                                <button
                                    key={num}
                                    type="button"
                                    onClick={() => handleSelect(num)}
                                    className={`w-full px-4 py-2.5 text-left text-sm transition-colors border-b border-gray-100 last:border-b-0 ${
                                        String(value) === String(num)
                                            ? "bg-[#0A5BA9] text-white font-medium"
                                            : "text-gray-700 hover:bg-blue-50"
                                    }`}
                                >
                                    {num}
                                </button>
                            ))
                        ) : (
                            <div className="px-4 py-3 text-sm text-gray-500 text-center">
                                No hay resultados
                            </div>
                        )}
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};

// Configuración de las pestañas del formulario (las primeras 7 son editables)
const TABS_CONFIG = [
    { id: "datos-generales", label: "Datos Generales", icon: FileText },
    { id: "recursos-humanos", label: "Recursos Humanos", icon: Users },
    { id: "infraestructura", label: "Infraestructura", icon: Building2 },
    { id: "equipamiento", label: "Equipamiento", icon: Monitor },
    { id: "conectividad", label: "Conectividad", icon: Wifi },
    { id: "servicios", label: "Servicios", icon: Stethoscope },
    { id: "necesidades", label: "Necesidades", icon: FileQuestion },
    { id: "vista-previa", label: "Vista Previa", icon: Eye, isPreview: true },
];

export default function FormularioDiagnostico() {
    const { user } = useAuth();
    const [currentView, setCurrentView] = useState("instrucciones"); // instrucciones | formulario
    const [activeTab, setActiveTab] = useState("datos-generales");
    const [datosUsuario, setDatosUsuario] = useState(null);
    const [vistaPreviaHabilitada, setVistaPreviaHabilitada] = useState(false);
    const [formData, setFormData] = useState({
        datosGenerales: {},
        recursosHumanos: {},
        infraestructura: {},
        equipamiento: {},
        conectividad: {},
        servicios: {},
        necesidades: {}
    });
    const [tabsCompletados, setTabsCompletados] = useState({});
    const pdfPreviewRef = useRef(null);
    const [errores, setErrores] = useState({});

    // Estados para integración con backend
    const [idFormulario, setIdFormulario] = useState(null);
    const [estadoFormulario, setEstadoFormulario] = useState(null); // BORRADOR, ENVIADO, FIRMADO, etc.
    const [guardando, setGuardando] = useState(false);
    const [enviando, setEnviando] = useState(false);
    const [cargandoBorrador, setCargandoBorrador] = useState(false);

    // Estados para firma digital
    const [mostrarModalFirma, setMostrarModalFirma] = useState(false);
    const [pdfParaFirmar, setPdfParaFirmar] = useState(null);
    const [formularioFirmado, setFormularioFirmado] = useState(false);

    // Estado para documentos enviados (historial)
    const [documentosEnviados, setDocumentosEnviados] = useState([]);
    const [cargandoDocumentos, setCargandoDocumentos] = useState(false);

    // Funciones de validación
    const validarEmail = (email) => {
        if (!email) return true; // Campo vacío es válido (no es requerido)
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const validarTelefono = (telefono) => {
        if (!telefono) return true; // Campo vacío es válido
        const soloNumeros = telefono.replace(/\s/g, '');
        return /^\d{9}$/.test(soloNumeros);
    };

    const validarNombreCompleto = (nombre) => {
        if (!nombre) return true; // Campo vacío es válido
        const palabras = nombre.trim().split(/\s+/);
        return palabras.length >= 2 && palabras.every(p => p.length >= 2);
    };

    // Formatear número con separador de miles (formato: 1'000,000)
    const formatearNumero = (valor) => {
        if (!valor) return "";
        const numero = valor.toString().replace(/\D/g, '');
        // Primero agregamos comas cada 3 dígitos desde la derecha
        let formateado = numero.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        // Luego reemplazamos la coma de millones por apóstrofe
        const partes = formateado.split(",");
        if (partes.length > 2) {
            // Más de miles (millones o más)
            const millones = partes.slice(0, -2).join("'");
            const miles = partes.slice(-2).join(",");
            formateado = millones + "'" + miles;
        }
        return formateado;
    };

    // Manejar cambio de número formateado
    const handleNumeroFormateado = (section, field, value) => {
        const soloNumeros = value.replace(/\D/g, '');
        handleInputChange(section, field, soloNumeros);
    };

    // Manejar validación en tiempo real
    const handleValidatedInputChange = (section, field, value, validationType) => {
        let valorProcesado = value;

        // Para teléfono, solo permitir números
        if (validationType === "telefono") {
            valorProcesado = value.replace(/\D/g, '').slice(0, 9);
        }

        handleInputChange(section, field, valorProcesado);

        let esValido = true;
        let mensajeError = "";

        if (valorProcesado) {
            switch (validationType) {
                case "email":
                    esValido = validarEmail(valorProcesado);
                    mensajeError = esValido ? "" : "Ingrese un correo válido (ejemplo@dominio.com)";
                    break;
                case "telefono":
                    esValido = valorProcesado.length === 9;
                    mensajeError = esValido ? "" : "El teléfono debe tener 9 dígitos";
                    break;
                case "nombreCompleto":
                    esValido = validarNombreCompleto(valorProcesado);
                    mensajeError = esValido ? "" : "Ingrese nombre y apellido (mínimo 2 palabras)";
                    break;
                default:
                    break;
            }
        }

        setErrores(prev => ({
            ...prev,
            [`${section}.${field}`]: mensajeError
        }));
    };

    // Cargar datos del usuario (IPRESS) y borrador existente
    useEffect(() => {
        const cargarDatosUsuario = async () => {
            if (user?.username) {
                try {
                    const response = await api.get(`/usuarios/detalle/${user.username}`);
                    if (response) {
                        setDatosUsuario(response);

                        // Intentar cargar borrador existente
                        const idIpress = response.id_ipress || response.personalExterno?.ipress?.idIpress;
                        if (idIpress) {
                            cargarBorradorExistente(idIpress);
                            cargarDocumentosEnviados(idIpress);
                        }
                    }
                } catch (error) {
                    console.error("Error cargando datos del usuario:", error);
                }
            }
        };
        cargarDatosUsuario();
    }, [user]);

    // Función para cargar documentos enviados del usuario
    const cargarDocumentosEnviados = async (idIpress) => {
        setCargandoDocumentos(true);
        try {
            const response = await formularioDiagnosticoService.listarPorIpress(idIpress);
            // Filtrar solo los enviados o firmados
            const enviados = (response || []).filter(doc =>
                doc.estado === "ENVIADO" || doc.estado === "FIRMADO"
            );
            // Ordenar por ID ascendente (del más antiguo al más reciente)
            enviados.sort((a, b) => a.idFormulario - b.idFormulario);
            setDocumentosEnviados(enviados);
        } catch (error) {
            console.error("Error cargando documentos enviados:", error);
            setDocumentosEnviados([]);
        } finally {
            setCargandoDocumentos(false);
        }
    };

    // Función para ver el PDF real del backend
    const verPdfBackend = async (idFormulario) => {
        try {
            const token = localStorage.getItem('auth.token');
            const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

            const response = await fetch(`${baseUrl}/formulario-diagnostico/${idFormulario}/pdf`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Error al obtener PDF');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank');
        } catch (error) {
            console.error("Error abriendo PDF:", error);
            toast.error("No hay PDF disponible para este formulario");
        }
    };

    // Función para eliminar un documento enviado
    const handleEliminarDocumento = async (documento) => {
        const confirmacion = window.confirm(
            `¿Está seguro de eliminar el Formulario #${documento.idFormulario}?\n\nEsta acción eliminará permanentemente todos los datos del formulario y no se puede deshacer.`
        );

        if (!confirmacion) return;

        try {
            await formularioDiagnosticoService.eliminar(documento.idFormulario);
            toast.success(`Formulario #${documento.idFormulario} eliminado correctamente`);

            // Recargar la lista de documentos
            const idIpress = datosUsuario?.id_ipress || datosUsuario?.personalExterno?.ipress?.idIpress;
            if (idIpress) {
                cargarDocumentosEnviados(idIpress);
            }
        } catch (error) {
            console.error("Error eliminando formulario:", error);
            toast.error("No se pudo eliminar el formulario. " + (error.message || ""));
        }
    };

    // Función para ver un documento enviado específico
    const verDocumentoEnviado = async (documento) => {
        setIdFormulario(documento.idFormulario);
        setEstadoFormulario(documento.estado);

        // Verificar si tiene firma
        if (documento.fechaFirma || documento.firmaDigital || documento.estado === "FIRMADO") {
            setFormularioFirmado(true);
        } else {
            setFormularioFirmado(false);
        }

        // Cargar los datos del formulario
        try {
            const formularioCompleto = await formularioDiagnosticoService.obtenerPorId(documento.idFormulario);
            if (formularioCompleto) {
                setFormData({
                    datosGenerales: formularioCompleto.datosGenerales || {},
                    recursosHumanos: formularioCompleto.recursosHumanos || {},
                    infraestructura: formularioCompleto.infraestructura || {},
                    equipamiento: formularioCompleto.equipamiento || {},
                    conectividad: formularioCompleto.conectividad || {},
                    servicios: formularioCompleto.servicios || {},
                    necesidades: formularioCompleto.necesidades || {}
                });
            }
        } catch (error) {
            console.error("Error cargando formulario:", error);
        }

        setVistaPreviaHabilitada(true);
        setActiveTab("vista-previa");
        setCurrentView("formulario");
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Función para cargar SOLO borrador en proceso (no formularios enviados)
    const cargarBorradorExistente = async (idIpress) => {
        setCargandoBorrador(true);
        try {
            // Solo buscar borrador EN_PROCESO
            const formulario = await formularioDiagnosticoService.obtenerBorradorPorIpress(idIpress);

            // Solo cargar si es un borrador EN_PROCESO
            if (formulario && formulario.estado === "EN_PROCESO") {
                setIdFormulario(formulario.idFormulario);
                setEstadoFormulario(formulario.estado);
                setFormData({
                    datosGenerales: formulario.datosGenerales || {},
                    recursosHumanos: formulario.recursosHumanos || {},
                    infraestructura: formulario.infraestructura || {},
                    equipamiento: formulario.equipamiento || {},
                    conectividad: formulario.conectividad || {},
                    servicios: formulario.servicios || {},
                    necesidades: formulario.necesidades || {}
                });
                setFormularioFirmado(false);
                toast.success("Se cargó el borrador existente. Puede continuar donde lo dejó.");
            }
            // Si no hay borrador EN_PROCESO, el usuario puede comenzar uno nuevo
            // Los formularios enviados se pueden ver desde "Documentos Enviados"
        } catch (error) {
            console.error("Error cargando formulario:", error);
        } finally {
            setCargandoBorrador(false);
        }
    };

    // Manejar cambios en los campos del formulario
    const handleInputChange = (section, field, value) => {
        setFormData(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [field]: value
            }
        }));
    };

    // Navegar entre tabs
    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Ir al siguiente tab
    const handleNextTab = () => {
        const currentIndex = TABS_CONFIG.findIndex(t => t.id === activeTab);
        if (currentIndex < TABS_CONFIG.length - 1) {
            setActiveTab(TABS_CONFIG[currentIndex + 1].id);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Ir al tab anterior
    const handlePrevTab = () => {
        const currentIndex = TABS_CONFIG.findIndex(t => t.id === activeTab);
        if (currentIndex > 0) {
            setActiveTab(TABS_CONFIG[currentIndex - 1].id);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Guardar progreso en el backend (incluye PDF)
    const handleSaveProgress = async (incluirPdf = true) => {
        const idIpress = datosUsuario?.id_ipress || datosUsuario?.personalExterno?.ipress?.idIpress;
        if (!idIpress) {
            toast.error("No se pudo identificar la IPRESS del usuario");
            return false;
        }

        setGuardando(true);
        try {
            // Transformar datos al formato del backend
            const datosParaBackend = formularioDiagnosticoService.transformarParaBackend(
                formData,
                idIpress,
                idFormulario
            );

            // Generar PDF y agregarlo si se requiere
            if (incluirPdf) {
                try {
                    const pdfBase64 = await generarPdfBase64();
                    datosParaBackend.pdfBase64 = pdfBase64;
                } catch (pdfError) {
                    console.warn("No se pudo generar PDF:", pdfError);
                }
            }

            // Guardar en el backend
            const response = await formularioDiagnosticoService.guardarBorrador(datosParaBackend);

            if (response) {
                setIdFormulario(response.idFormulario);
                setEstadoFormulario(response.estado);
                toast.success("Progreso guardado correctamente");
                return response.idFormulario; // Retornar el ID para uso inmediato
            }
            return null;
        } catch (error) {
            console.error("Error guardando progreso:", error);
            toast.error("Error al guardar el progreso. Intente nuevamente.");
            // Fallback: guardar en localStorage
            localStorage.setItem("formulario_diagnostico_progress", JSON.stringify(formData));
            return null;
        } finally {
            setGuardando(false);
        }
    };

    // Enviar formulario SIN firma (cambiar estado a ENVIADO)
    const handleEnviarSinFirma = async () => {
        // Confirmar acción
        if (!window.confirm("¿Está seguro de enviar el formulario SIN firma digital?\n\nEl formulario quedará registrado pero sin validación de firma.")) {
            return;
        }

        setEnviando(true);
        try {
            // Primero guardar con PDF si no tiene ID
            let formularioId = idFormulario;
            if (!formularioId) {
                formularioId = await handleSaveProgress(true);
                if (!formularioId) {
                    toast.error("Debe guardar el formulario antes de enviarlo");
                    return;
                }
            } else {
                // Actualizar con el PDF más reciente
                await handleSaveProgress(true);
            }

            // Enviar (cambiar estado)
            const response = await formularioDiagnosticoService.enviar(formularioId);
            if (response) {
                setEstadoFormulario(response.estado);
                toast.success("Formulario enviado correctamente (sin firma)");
            }
        } catch (error) {
            console.error("Error enviando formulario:", error);
            toast.error("Error al enviar el formulario. Intente nuevamente.");
        } finally {
            setEnviando(false);
        }
    };

    // Generar PDF como Base64 para firma/envío
    const generarPdfBase64 = () => {
        return new Promise((resolve) => {
            const doc = crearDocumentoPDF();
            const pdfOutput = doc.output('datauristring');
            const base64 = pdfOutput.split(',')[1];
            resolve(base64);
        });
    };

    // Abrir modal de firma digital
    const handleAbrirModalFirma = async () => {
        let formularioId = idFormulario;

        if (!formularioId) {
            // Primero guardar el formulario
            const nuevoId = await handleSaveProgress();
            if (!nuevoId) {
                toast.error("Debe guardar el formulario antes de firmarlo");
                return;
            }
            formularioId = nuevoId;
        }

        try {
            setEnviando(true);
            // Generar el PDF para firmar
            const pdfBase64 = await generarPdfBase64();
            setPdfParaFirmar(pdfBase64);
            setMostrarModalFirma(true);
        } catch (error) {
            console.error("Error generando PDF para firma:", error);
            toast.error("Error al preparar el documento para firma");
        } finally {
            setEnviando(false);
        }
    };

    // Callback cuando la firma es exitosa
    const handleFirmaExitosa = (resultado) => {
        setFormularioFirmado(true);
        setEstadoFormulario("FIRMADO");
        toast.success("Documento firmado y enviado correctamente");
        console.log("Firma exitosa:", resultado);
    };

    // Generar vista previa del PDF
    const handleGenerarPDF = () => {
        setVistaPreviaHabilitada(true);
        setActiveTab("vista-previa");
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Crear documento PDF completo - Diseño Ejecutivo Profesional
    const crearDocumentoPDF = () => {
        const doc = new jsPDF('p', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 10;
        const contentWidth = pageWidth - 2 * margin; // 190mm disponible
        let currentY = margin;

        const nombreIpress = datosUsuario?.nombre_ipress || "-";
        const redAsistencial = datosUsuario?.nombre_red || "-";
        const macroregion = datosUsuario?.nombre_macroregion || "-";
        const fechaActual = new Date().toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });

        const formatValue = (val) => val === "si" ? "Sí" : val === "no" ? "No" : val || "-";
        const capitalizeFirst = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : "-";

        // Header compacto
        const addHeader = () => {
            doc.setFillColor(10, 91, 169);
            doc.rect(0, 0, pageWidth, 18, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text("DIAGNÓSTICO SITUACIONAL DE TELESALUD", pageWidth / 2, 8, { align: 'center' });
            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.text(`${nombreIpress} | ${redAsistencial} | ${macroregion}`, pageWidth / 2, 14, { align: 'center' });
            return 22;
        };

        // Footer compacto
        const addFooter = (pageNum, totalPages) => {
            doc.setDrawColor(10, 91, 169);
            doc.setLineWidth(0.5);
            doc.line(margin, pageHeight - 8, pageWidth - margin, pageHeight - 8);
            doc.setTextColor(100);
            doc.setFontSize(7);
            doc.text(`CENATE | ${fechaActual}`, margin, pageHeight - 4);
            doc.text(`Página ${pageNum} de ${totalPages}`, pageWidth - margin, pageHeight - 4, { align: 'right' });
        };

        // Título de sección
        const addSection = (title, y) => {
            doc.setFillColor(10, 91, 169);
            doc.rect(margin, y, pageWidth - 2 * margin, 7, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.text(title, margin + 2, y + 5);
            return y + 10;
        };

        // Subtítulo
        const addSubSection = (title, y) => {
            doc.setTextColor(10, 91, 169);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.text(title, margin, y);
            doc.setTextColor(0);
            return y + 5;
        };

        // Check si necesita nueva página
        const checkNewPage = (y, needed = 40) => {
            if (y > pageHeight - needed) {
                doc.addPage();
                return addHeader();
            }
            return y;
        };

        // ==================== PÁGINA 1 ====================
        currentY = addHeader();

        // DATOS GENERALES + RECURSOS HUMANOS en misma página
        currentY = addSection("I. DATOS GENERALES DE LA IPRESS", currentY);

        const datosGeneralesTable = [
            [{ content: 'IPRESS', styles: { fontStyle: 'bold' } }, nombreIpress, { content: 'Red', styles: { fontStyle: 'bold' } }, redAsistencial],
            [{ content: 'Macroregión', styles: { fontStyle: 'bold' } }, macroregion, { content: 'Fecha', styles: { fontStyle: 'bold' } }, fechaActual],
        ];
        autoTable(doc, { startY: currentY, body: datosGeneralesTable, theme: 'plain', styles: { fontSize: 8, cellPadding: 2.5 }, margin: { left: margin, right: margin } });
        currentY = doc.lastAutoTable.finalY + 4;

        // Director y Responsable en columnas
        const contactosData = [];
        if (formData.datosGenerales.directorNombre || formData.datosGenerales.responsableNombre) {
            contactosData.push([
                { content: 'Director IPRESS', styles: { fontStyle: 'bold', fillColor: [240, 245, 250] } },
                { content: 'Responsable Telesalud', styles: { fontStyle: 'bold', fillColor: [240, 245, 250] } }
            ]);
            contactosData.push([
                formData.datosGenerales.directorNombre || "-",
                formData.datosGenerales.responsableNombre || "-"
            ]);
            if (formData.datosGenerales.directorCorreo || formData.datosGenerales.responsableCorreo) {
                contactosData.push([
                    formData.datosGenerales.directorCorreo || "-",
                    formData.datosGenerales.responsableCorreo || "-"
                ]);
            }
            if (formData.datosGenerales.directorTelefono || formData.datosGenerales.responsableTelefono) {
                contactosData.push([
                    formData.datosGenerales.directorTelefono || "-",
                    formData.datosGenerales.responsableTelefono || "-"
                ]);
            }
        }
        if (contactosData.length > 0) {
            autoTable(doc, { startY: currentY, body: contactosData, theme: 'grid', styles: { fontSize: 8, cellPadding: 2.5 }, margin: { left: margin, right: margin }, columnStyles: { 0: { cellWidth: (pageWidth - 2 * margin) / 2 }, 1: { cellWidth: (pageWidth - 2 * margin) / 2 } } });
            currentY = doc.lastAutoTable.finalY + 4;
        }

        // Población y Atenciones
        const atencionesMensuales = formData.datosGenerales.atencionesMenuales || formData.datosGenerales.promedioAtenciones;
        if (formData.datosGenerales.poblacionAdscrita || atencionesMensuales) {
            const poblacionRow = [];
            if (formData.datosGenerales.poblacionAdscrita) poblacionRow.push([{ content: 'Población adscrita', styles: { fontStyle: 'bold' } }, formatearNumero(formData.datosGenerales.poblacionAdscrita)]);
            if (atencionesMensuales) poblacionRow.push([{ content: 'Promedio atenciones mensuales', styles: { fontStyle: 'bold' } }, formatearNumero(atencionesMensuales)]);
            if (poblacionRow.length > 0) {
                autoTable(doc, { startY: currentY, body: [poblacionRow.flat()], theme: 'plain', styles: { fontSize: 8, cellPadding: 2.5 }, margin: { left: margin, right: margin } });
                currentY = doc.lastAutoTable.finalY + 5;
            }
        }

        // RECURSOS HUMANOS
        currentY = addSection("II. RECURSOS HUMANOS PARA TELESALUD (Ref. NTS N° 235, numeral 6.3.1)", currentY);

        // 2.1 Coordinador y Personal de apoyo - Preguntas completas
        currentY = addSubSection("2.1 Designación de Responsables", currentY);

        const preguntasRH = [
            {
                num: "2.1.1",
                pregunta: "¿La IPRESS designa, mediante documento formal, a un Coordinador de Telesalud o profesional de la salud responsable de la implementación y articulación de los servicios de Telesalud?",
                valor: formData.recursosHumanos.coordTelesalud
            },
            {
                num: "2.1.2",
                pregunta: "¿Durante la prestación de dichos servicios, la IPRESS asigna un personal de apoyo, conformado por profesionales, técnicos o auxiliares de la salud, personal de soporte TIC o administrativo?",
                valor: formData.recursosHumanos.personalApoyo
            }
        ];

        const rhTableData = preguntasRH.map(p => [
            { content: p.num, styles: { fontStyle: 'bold', textColor: [10, 91, 169], halign: 'center' } },
            p.pregunta,
            {
                content: p.valor === "si" ? "Sí" : (p.valor === "no" ? "No" : "-"),
                styles: {
                    halign: 'center',
                    fontStyle: 'bold',
                    fillColor: p.valor === "si" ? [200, 230, 200] : (p.valor === "no" ? [230, 200, 200] : null)
                }
            }
        ]);

        autoTable(doc, {
            startY: currentY,
            head: [[
                { content: "N°", styles: { halign: 'center' } },
                { content: "PREGUNTA", styles: { halign: 'center' } },
                { content: "RESPUESTA", styles: { halign: 'center' } }
            ]],
            body: rhTableData,
            theme: 'grid',
            styles: { fontSize: 7, cellPadding: 3, valign: 'middle' },
            headStyles: { fillColor: [10, 91, 169], fontSize: 8, fontStyle: 'bold', halign: 'center' },
            margin: { left: margin, right: margin },
            tableWidth: contentWidth,
            columnStyles: {
                0: { cellWidth: 15, halign: 'center' },
                1: { cellWidth: 145 },
                2: { cellWidth: 30, halign: 'center' }
            }
        });
        currentY = doc.lastAutoTable.finalY + 5;

        // 2.2 CAPACITACIÓN Y COMPETENCIAS - Tabla con preguntas completas
        currentY = checkNewPage(currentY, 60);
        currentY = addSubSection("2.2 Capacitación y Competencias", currentY);

        const preguntasCapacitacion = [
            {
                num: "2.2.1",
                pregunta: "¿El personal ha recibido capacitación en uso de TIC para Telesalud?",
                valor: formData.recursosHumanos.capacitacionTic
            },
            {
                num: "2.2.2",
                pregunta: "¿El personal conoce la normativa vigente de Telesalud?",
                valor: formData.recursosHumanos.normativa
            },
            {
                num: "2.2.3",
                pregunta: "¿El personal tiene competencias en alfabetización digital?",
                valor: formData.recursosHumanos.alfabetizacion
            },
            {
                num: "2.2.4",
                pregunta: "¿Existe un plan de capacitación en Telesalud?",
                valor: formData.recursosHumanos.planCapacitacion
            }
        ];

        const capTableData = preguntasCapacitacion.map(p => [
            { content: p.num, styles: { fontStyle: 'bold', textColor: [10, 91, 169] } },
            p.pregunta,
            { content: p.valor === "si" ? "X" : "", styles: { halign: 'center', fontStyle: 'bold', fillColor: p.valor === "si" ? [200, 230, 200] : null } },
            { content: p.valor === "no" ? "X" : "", styles: { halign: 'center', fontStyle: 'bold', fillColor: p.valor === "no" ? [230, 200, 200] : null } }
        ]);

        autoTable(doc, {
            startY: currentY,
            head: [[
                { content: "N°", styles: { halign: 'center' } },
                { content: "PREGUNTA", styles: { halign: 'center' } },
                { content: "SÍ", styles: { halign: 'center' } },
                { content: "NO", styles: { halign: 'center' } }
            ]],
            body: capTableData,
            theme: 'grid',
            styles: { fontSize: 7, cellPadding: 3, valign: 'middle' },
            headStyles: { fillColor: [10, 91, 169], fontSize: 8, fontStyle: 'bold', halign: 'center' },
            margin: { left: margin, right: margin },
            tableWidth: contentWidth,
            columnStyles: {
                0: { cellWidth: 15, halign: 'center' },
                1: { cellWidth: 145 },
                2: { cellWidth: 15, halign: 'center' },
                3: { cellWidth: 15, halign: 'center' }
            }
        });
        currentY = doc.lastAutoTable.finalY + 5;

        // 2.2.5 y 2.2.6 - Capacitaciones en el año y necesidades (usando tabla)
        const datosAdicionales = [];
        if (formData.recursosHumanos.capacitacionesAnio) {
            datosAdicionales.push([
                { content: "2.2.5", styles: { fontStyle: 'bold', textColor: [10, 91, 169], halign: 'center' } },
                "¿Cuántas capacitaciones en Telesalud se han realizado en el último año?",
                { content: String(formData.recursosHumanos.capacitacionesAnio), styles: { halign: 'center', fillColor: [255, 250, 205], fontStyle: 'bold' } }
            ]);
        }
        if (formData.recursosHumanos.necesidadesCapacitacion) {
            datosAdicionales.push([
                { content: "2.2.6", styles: { fontStyle: 'bold', textColor: [10, 91, 169], halign: 'center' } },
                "Principales necesidades (temas) de capacitación identificadas:",
                { content: formData.recursosHumanos.necesidadesCapacitacion, styles: { fillColor: [255, 250, 205] } }
            ]);
        }

        if (datosAdicionales.length > 0) {
            autoTable(doc, {
                startY: currentY,
                body: datosAdicionales,
                theme: 'grid',
                styles: { fontSize: 7, cellPadding: 3, valign: 'middle' },
                margin: { left: margin, right: margin },
                tableWidth: contentWidth,
                columnStyles: {
                    0: { cellWidth: 15, halign: 'center' },
                    1: { cellWidth: 110 },
                    2: { cellWidth: 65 }
                }
            });
            currentY = doc.lastAutoTable.finalY + 5;
        }

        // Resetear color de texto
        doc.setTextColor(0, 0, 0);

        // INFRAESTRUCTURA
        currentY = checkNewPage(currentY, 80);
        currentY = addSection("III. INFRAESTRUCTURA (Ref. NTS N° 235, numeral 6.3.2)", currentY);

        // 3.1 INFRAESTRUCTURA FÍSICA - Preguntas completas
        currentY = addSubSection("3.1 Infraestructura Física", currentY);

        const preguntasInfraFisica = [
            { num: "3.1.1", pregunta: "¿Cuenta con espacio físico destinado para Telesalud/Teleconsultorio?", id: "espacioFisico" },
            { num: "3.1.2", pregunta: "¿Los espacios garantizan privacidad del paciente?", id: "privacidad" },
            { num: "3.1.3", pregunta: "¿Cuenta con escritorio ergonómico?", id: "escritorio" },
            { num: "3.1.4", pregunta: "¿Cuenta con sillas ergonómicas?", id: "sillas" },
            { num: "3.1.5", pregunta: "¿Cuenta con estantes para equipos?", id: "estantes" },
            { num: "3.1.6", pregunta: "¿Cuenta con archivero con llave?", id: "archivero" },
            { num: "3.1.7", pregunta: "¿Cuenta con iluminación adecuada?", id: "iluminacion" },
            { num: "3.1.8", pregunta: "¿Cuenta con ventilación adecuada?", id: "ventilacion" },
            { num: "3.1.9", pregunta: "¿Cuenta con aire acondicionado?", id: "aireAcondicionado" },
        ];

        const infraFisicaData = preguntasInfraFisica.map(p => [
            { content: p.num, styles: { fontStyle: 'bold', textColor: [10, 91, 169], halign: 'center' } },
            p.pregunta,
            { content: formData.infraestructura[p.id] === "si" ? "X" : "", styles: { halign: 'center', fontStyle: 'bold', fillColor: formData.infraestructura[p.id] === "si" ? [200, 230, 200] : null } },
            { content: formData.infraestructura[p.id] === "no" ? "X" : "", styles: { halign: 'center', fontStyle: 'bold', fillColor: formData.infraestructura[p.id] === "no" ? [230, 200, 200] : null } }
        ]);

        autoTable(doc, {
            startY: currentY,
            head: [[
                { content: "N°", styles: { halign: 'center' } },
                { content: "PREGUNTA", styles: { halign: 'center' } },
                { content: "SÍ", styles: { halign: 'center' } },
                { content: "NO", styles: { halign: 'center' } }
            ]],
            body: infraFisicaData,
            theme: 'grid',
            styles: { fontSize: 7, cellPadding: 2, valign: 'middle' },
            headStyles: { fillColor: [10, 91, 169], fontSize: 7, fontStyle: 'bold', halign: 'center' },
            margin: { left: margin, right: margin },
            tableWidth: contentWidth,
            columnStyles: {
                0: { cellWidth: 15, halign: 'center' },
                1: { cellWidth: 145 },
                2: { cellWidth: 15, halign: 'center' },
                3: { cellWidth: 15, halign: 'center' }
            }
        });
        currentY = doc.lastAutoTable.finalY + 3;

        // 3.1.10 Número de ambientes
        if (formData.infraestructura.numAmbientes) {
            autoTable(doc, {
                startY: currentY,
                body: [[
                    { content: "3.1.10", styles: { fontStyle: 'bold', textColor: [10, 91, 169], halign: 'center' } },
                    "Número de ambientes/consultorios destinados a Telesalud:",
                    { content: String(formData.infraestructura.numAmbientes), styles: { halign: 'center', fillColor: [255, 250, 205], fontStyle: 'bold' } }
                ]],
                theme: 'grid',
                styles: { fontSize: 7, cellPadding: 2, valign: 'middle' },
                margin: { left: margin, right: margin },
                tableWidth: contentWidth,
                columnStyles: {
                    0: { cellWidth: 15, halign: 'center' },
                    1: { cellWidth: 145 },
                    2: { cellWidth: 30, halign: 'center' }
                }
            });
            currentY = doc.lastAutoTable.finalY + 3;
        }

        // 3.2 INFRAESTRUCTURA TECNOLÓGICA - Preguntas completas
        currentY = checkNewPage(currentY, 50);
        currentY = addSubSection("3.2 Infraestructura Tecnológica", currentY);

        const preguntasInfraTec = [
            { num: "3.2.1", pregunta: "¿Cuenta con Hardware: Dispositivos físicos como servidores, computadoras, equipos de red (routers, switches) y sistemas de almacenamiento?", id: "hardware" },
            { num: "3.2.2", pregunta: "¿Cuenta con Software: Incluye los sistemas operativos, programas, aplicaciones y el software necesario para la gestión y ejecución de tareas?", id: "software" },
            { num: "3.2.3", pregunta: "¿Cuenta con Redes: Conjunto de sistemas de comunicación (cableado estructurado, redes inalámbricas, etc.) que permiten la interconexión entre equipos y el intercambio de información?", id: "redes" },
            { num: "3.2.4", pregunta: "¿Cuenta con Almacenamiento: Sistemas y tecnologías para guardar datos y asegurar su acceso y seguridad?", id: "almacenamiento" },
            { num: "3.2.5", pregunta: "¿Cuenta con Servicios: Elementos como la seguridad informática, la gestión de rendimiento y los servicios de soporte que garantizan el funcionamiento óptimo del sistema?", id: "serviciosTec" },
        ];

        const infraTecData = preguntasInfraTec.map(p => [
            { content: p.num, styles: { fontStyle: 'bold', textColor: [10, 91, 169], halign: 'center' } },
            p.pregunta,
            { content: formData.infraestructura[p.id] === "si" ? "X" : "", styles: { halign: 'center', fontStyle: 'bold', fillColor: formData.infraestructura[p.id] === "si" ? [200, 230, 200] : null } },
            { content: formData.infraestructura[p.id] === "no" ? "X" : "", styles: { halign: 'center', fontStyle: 'bold', fillColor: formData.infraestructura[p.id] === "no" ? [230, 200, 200] : null } }
        ]);

        autoTable(doc, {
            startY: currentY,
            head: [[
                { content: "N°", styles: { halign: 'center' } },
                { content: "PREGUNTA", styles: { halign: 'center' } },
                { content: "SÍ", styles: { halign: 'center' } },
                { content: "NO", styles: { halign: 'center' } }
            ]],
            body: infraTecData,
            theme: 'grid',
            styles: { fontSize: 7, cellPadding: 2, valign: 'middle' },
            headStyles: { fillColor: [10, 91, 169], fontSize: 7, fontStyle: 'bold', halign: 'center' },
            margin: { left: margin, right: margin },
            tableWidth: contentWidth,
            columnStyles: {
                0: { cellWidth: 15, halign: 'center' },
                1: { cellWidth: 145 },
                2: { cellWidth: 15, halign: 'center' },
                3: { cellWidth: 15, halign: 'center' }
            }
        });
        currentY = doc.lastAutoTable.finalY + 3;

        // EQUIPAMIENTO
        currentY = checkNewPage(currentY, 60);
        currentY = addSection("IV. EQUIPAMIENTO (Ref. NTS N° 235, numeral 6.3.3)", currentY);

        // 4.1 EQUIPAMIENTO INFORMÁTICO PARA TELESALUD
        const equipInfoCompleto = [
            { num: "4.1.1", nombre: "Computadora de escritorio" },
            { num: "4.1.2", nombre: "Computadora portátil (laptop)" },
            { num: "4.1.3", nombre: "Monitor" },
            { num: "4.1.4", nombre: "Cable HDMI" },
            { num: "4.1.5", nombre: "Cámara web HD (resolución mínima de 1080p)" },
            { num: "4.1.6", nombre: "Micrófono" },
            { num: "4.1.7", nombre: "Parlantes/audífonos" },
            { num: "4.1.8", nombre: "Impresora" },
            { num: "4.1.9", nombre: "Escáner" },
            { num: "4.1.10", nombre: "Router/Switch de red" }
        ];

        const equipInfoData = equipInfoCompleto.map((equipo, index) => {
            const fieldId = `equipInfo${index}`;
            const disp = formData.equipamiento[`${fieldId}_disponible`];
            const cant = formData.equipamiento[`${fieldId}_cantidad`];
            const estado = formData.equipamiento[`${fieldId}_estado`];
            const obs = formData.equipamiento[`${fieldId}_obs`];
            // Solo incluir si tiene datos registrados
            if (!disp) return null;
            return [
                { content: equipo.num, styles: { fontStyle: 'bold', textColor: [10, 91, 169], halign: 'center' } },
                equipo.nombre,
                { content: disp === "si" ? "Sí" : "No", styles: { halign: 'center', fillColor: disp === "si" ? [200, 230, 200] : [230, 200, 200] } },
                { content: cant || "-", styles: { halign: 'center' } },
                { content: capitalizeFirst(estado) || "-", styles: { halign: 'center' } },
                { content: obs || "-", styles: { fontSize: 6 } }
            ];
        }).filter(item => item !== null);

        if (equipInfoData.length > 0) {
            currentY = addSubSection("4.1 Equipamiento Informático para Telesalud", currentY);
            autoTable(doc, {
                startY: currentY,
                head: [[
                    { content: "N°", styles: { halign: 'center' } },
                    { content: "EQUIPO/DISPOSITIVO", styles: { halign: 'center' } },
                    { content: "DISP.", styles: { halign: 'center' } },
                    { content: "CANT.", styles: { halign: 'center' } },
                    { content: "ESTADO", styles: { halign: 'center' } },
                    { content: "OBSERVACIONES", styles: { halign: 'center' } }
                ]],
                body: equipInfoData,
                theme: 'striped',
                styles: { fontSize: 6, cellPadding: 1.5, valign: 'middle' },
                headStyles: { fillColor: [10, 91, 169], fontSize: 6, fontStyle: 'bold' },
                margin: { left: margin, right: margin },
                tableWidth: contentWidth,
                columnStyles: {
                    0: { cellWidth: 15, halign: 'center' },
                    1: { cellWidth: 60 },
                    2: { cellWidth: 15, halign: 'center' },
                    3: { cellWidth: 15, halign: 'center' },
                    4: { cellWidth: 20, halign: 'center' },
                    5: { cellWidth: 65 }
                }
            });
            currentY = doc.lastAutoTable.finalY + 3;
        }

        // 4.2 EQUIPAMIENTO BIOMÉDICO DIGITAL
        currentY = checkNewPage(currentY, 60);

        const equipBioCompleto = [
            { num: "4.2.1", nombre: "Pulsioxímetro digital" },
            { num: "4.2.2", nombre: "Dermatoscopio digital" },
            { num: "4.2.3", nombre: "Ecógrafo digital" },
            { num: "4.2.4", nombre: "Electrocardiógrafo digital" },
            { num: "4.2.5", nombre: "Equipo de gases arteriales digital" },
            { num: "4.2.6", nombre: "Estetoscopio digital" },
            { num: "4.2.7", nombre: "Fonendoscopio digital" },
            { num: "4.2.8", nombre: "Monitor de funciones vitales" },
            { num: "4.2.9", nombre: "Otoscopio digital" },
            { num: "4.2.10", nombre: "Oxímetro digital" },
            { num: "4.2.11", nombre: "Retinógrafo digital" },
            { num: "4.2.12", nombre: "Tensiómetro digital" },
            { num: "4.2.13", nombre: "Videocolposcopio" },
            { num: "4.2.14", nombre: "Estación móvil de telemedicina" }
        ];

        const equipBioData = equipBioCompleto.map((equipo, index) => {
            const fieldId = `equipBio${index}`;
            const disp = formData.equipamiento[`${fieldId}_disponible`];
            const cant = formData.equipamiento[`${fieldId}_cantidad`];
            const estado = formData.equipamiento[`${fieldId}_estado`];
            const obs = formData.equipamiento[`${fieldId}_obs`];
            // Solo incluir si tiene datos registrados
            if (!disp) return null;
            return [
                { content: equipo.num, styles: { fontStyle: 'bold', textColor: [10, 91, 169], halign: 'center' } },
                equipo.nombre,
                { content: disp === "si" ? "Sí" : "No", styles: { halign: 'center', fillColor: disp === "si" ? [200, 230, 200] : [230, 200, 200] } },
                { content: cant || "-", styles: { halign: 'center' } },
                { content: capitalizeFirst(estado) || "-", styles: { halign: 'center' } },
                { content: obs || "-", styles: { fontSize: 6 } }
            ];
        }).filter(item => item !== null);

        if (equipBioData.length > 0) {
            currentY = addSubSection("4.2 Equipamiento Biomédico Digital", currentY);
            autoTable(doc, {
                startY: currentY,
                head: [[
                    { content: "N°", styles: { halign: 'center' } },
                    { content: "EQUIPO/DISPOSITIVO", styles: { halign: 'center' } },
                    { content: "DISP.", styles: { halign: 'center' } },
                    { content: "CANT.", styles: { halign: 'center' } },
                    { content: "ESTADO", styles: { halign: 'center' } },
                    { content: "OBSERVACIONES", styles: { halign: 'center' } }
                ]],
                body: equipBioData,
                theme: 'striped',
                styles: { fontSize: 6, cellPadding: 1.5, valign: 'middle' },
                headStyles: { fillColor: [10, 91, 169], fontSize: 6, fontStyle: 'bold' },
                margin: { left: margin, right: margin },
                tableWidth: contentWidth,
                columnStyles: {
                    0: { cellWidth: 15, halign: 'center' },
                    1: { cellWidth: 60 },
                    2: { cellWidth: 15, halign: 'center' },
                    3: { cellWidth: 15, halign: 'center' },
                    4: { cellWidth: 20, halign: 'center' },
                    5: { cellWidth: 65 }
                }
            });
            currentY = doc.lastAutoTable.finalY + 3;
        }

        // CONECTIVIDAD Y SISTEMAS DE INFORMACIÓN
        currentY = checkNewPage(currentY, 80);
        currentY = addSection("V. CONECTIVIDAD Y SISTEMAS DE INFORMACIÓN (Ref. NTS N° 235, numerales 6.3.4 y 6.3.5)", currentY);

        // 5.1 CONECTIVIDAD Y SERVICIOS
        currentY = addSubSection("5.1 Conectividad y Servicios", currentY);

        const conectividadPreguntas = [
            { num: "5.1.1", pregunta: "¿Cuenta con acceso a internet?", id: "internet" },
            { num: "5.1.2", pregunta: "¿La conexión es estable y permanente?", id: "estable" },
            { num: "5.1.3", pregunta: "¿Cuenta con sistema alternativo de energía eléctrica?", id: "energiaAlt" },
            { num: "5.1.4", pregunta: "¿Cuenta con puntos de red suficientes?", id: "puntosRed" },
            { num: "5.1.5", pregunta: "¿Cuenta con red WiFi institucional?", id: "wifi" }
        ];

        const conectData = conectividadPreguntas
            .filter(item => formData.conectividad[item.id])
            .map(item => [
                { content: item.num, styles: { fontStyle: 'bold', textColor: [10, 91, 169], halign: 'center' } },
                item.pregunta,
                { content: formData.conectividad[item.id] === "si" ? "Sí" : "No", styles: { halign: 'center', fillColor: formData.conectividad[item.id] === "si" ? [200, 230, 200] : [230, 200, 200] } },
                { content: formData.conectividad[item.id] === "si" ? "" : "", styles: { halign: 'center', fillColor: formData.conectividad[item.id] === "no" ? [230, 200, 200] : null } }
            ]);

        if (conectData.length > 0) {
            autoTable(doc, {
                startY: currentY,
                head: [[
                    { content: "N°", styles: { halign: 'center' } },
                    { content: "PREGUNTA", styles: { halign: 'center' } },
                    { content: "SÍ", styles: { halign: 'center' } },
                    { content: "NO", styles: { halign: 'center' } }
                ]],
                body: conectData,
                theme: 'grid',
                styles: { fontSize: 7, cellPadding: 2, valign: 'middle' },
                headStyles: { fillColor: [10, 91, 169], fontSize: 7, fontStyle: 'bold', halign: 'center' },
                margin: { left: margin, right: margin },
                tableWidth: contentWidth,
                columnStyles: {
                    0: { cellWidth: 15, halign: 'center' },
                    1: { cellWidth: 145 },
                    2: { cellWidth: 15, halign: 'center' },
                    3: { cellWidth: 15, halign: 'center' }
                },
                didParseCell: function(data) {
                    if (data.section === 'body') {
                        const rowIndex = data.row.index;
                        const colIndex = data.column.index;
                        const item = conectividadPreguntas.filter(i => formData.conectividad[i.id])[rowIndex];
                        if (item) {
                            const value = formData.conectividad[item.id];
                            if (colIndex === 2) {
                                data.cell.text = value === "si" ? ["X"] : [""];
                                data.cell.styles.fillColor = value === "si" ? [200, 230, 200] : null;
                            } else if (colIndex === 3) {
                                data.cell.text = value === "no" ? ["X"] : [""];
                                data.cell.styles.fillColor = value === "no" ? [230, 200, 200] : null;
                            }
                        }
                    }
                }
            });
            currentY = doc.lastAutoTable.finalY + 3;
        }

        // Detalles de conexión (5.1.6 - 5.1.10)
        const detallesConexion = [];
        if (formData.conectividad.tipoConexion) detallesConexion.push(["5.1.6", "Tipo de conexión a internet:", formData.conectividad.tipoConexion]);
        if (formData.conectividad.proveedor) detallesConexion.push(["5.1.7", "Proveedor de servicio de internet:", formData.conectividad.proveedor]);
        if (formData.conectividad.velocidadContratada) detallesConexion.push(["5.1.8", "Velocidad contratada (Mbps):", formData.conectividad.velocidadContratada + " Mbps"]);
        if (formData.conectividad.velocidadReal) detallesConexion.push(["5.1.9", "Velocidad real promedio (Mbps):", formData.conectividad.velocidadReal + " Mbps"]);
        if (formData.conectividad.numPuntosRed) detallesConexion.push(["5.1.10", "N° de puntos de red:", formData.conectividad.numPuntosRed]);

        if (detallesConexion.length > 0) {
            const detallesData = detallesConexion.map(item => [
                { content: item[0], styles: { fontStyle: 'bold', textColor: [10, 91, 169], halign: 'center' } },
                item[1],
                { content: item[2], styles: { fillColor: [255, 255, 200] } }
            ]);
            autoTable(doc, {
                startY: currentY,
                body: detallesData,
                theme: 'grid',
                styles: { fontSize: 7, cellPadding: 2, valign: 'middle' },
                margin: { left: margin, right: margin },
                tableWidth: contentWidth,
                columnStyles: {
                    0: { cellWidth: 15, halign: 'center' },
                    1: { cellWidth: 85 },
                    2: { cellWidth: 90 }
                }
            });
            currentY = doc.lastAutoTable.finalY + 3;
        }

        // 5.2 SISTEMAS DE INFORMACIÓN
        currentY = checkNewPage(currentY, 60);
        currentY = addSubSection("5.2 Sistemas de Información", currentY);

        const sistemasPreguntas = [
            { num: "5.2.1", pregunta: "¿Cuenta con ESSI, que permita el registro, la trazabilidad, continuidad y legalidad de las atenciones por Telesalud?", id: "essi" },
            { num: "5.2.2", pregunta: "¿Cuenta con PACS, autorizado por la institución, que permita el registro, la trazabilidad, continuidad y legalidad de las atenciones por Telesalud?", id: "pacs" },
            { num: "5.2.3", pregunta: "¿Cuenta con ANATPAT autorizado por la institución?", id: "anatpat" },
            { num: "5.2.4", pregunta: "¿Cuenta con sistema de videoconferencia?", id: "videoconferencia" },
            { num: "5.2.5", pregunta: "¿Cuenta con sistema de citas en línea?", id: "citasLinea" }
        ];

        const sistemasData = sistemasPreguntas
            .filter(item => formData.conectividad[item.id])
            .map(item => [
                { content: item.num, styles: { fontStyle: 'bold', textColor: [10, 91, 169], halign: 'center' } },
                item.pregunta,
                { content: "X", styles: { halign: 'center' } },
                { content: "", styles: { halign: 'center' } }
            ]);

        if (sistemasData.length > 0) {
            autoTable(doc, {
                startY: currentY,
                head: [[
                    { content: "N°", styles: { halign: 'center' } },
                    { content: "PREGUNTA", styles: { halign: 'center' } },
                    { content: "SÍ", styles: { halign: 'center' } },
                    { content: "NO", styles: { halign: 'center' } }
                ]],
                body: sistemasData,
                theme: 'grid',
                styles: { fontSize: 7, cellPadding: 2, valign: 'middle' },
                headStyles: { fillColor: [10, 91, 169], fontSize: 7, fontStyle: 'bold', halign: 'center' },
                margin: { left: margin, right: margin },
                tableWidth: contentWidth,
                columnStyles: {
                    0: { cellWidth: 15, halign: 'center' },
                    1: { cellWidth: 145 },
                    2: { cellWidth: 15, halign: 'center' },
                    3: { cellWidth: 15, halign: 'center' }
                },
                didParseCell: function(data) {
                    if (data.section === 'body') {
                        const rowIndex = data.row.index;
                        const colIndex = data.column.index;
                        const item = sistemasPreguntas.filter(i => formData.conectividad[i.id])[rowIndex];
                        if (item) {
                            const value = formData.conectividad[item.id];
                            if (colIndex === 2) {
                                data.cell.text = value === "si" ? ["X"] : [""];
                                data.cell.styles.fillColor = value === "si" ? [200, 230, 200] : null;
                            } else if (colIndex === 3) {
                                data.cell.text = value === "no" ? ["X"] : [""];
                                data.cell.styles.fillColor = value === "no" ? [230, 200, 200] : null;
                            }
                        }
                    }
                }
            });
            currentY = doc.lastAutoTable.finalY + 3;
        }

        // 5.2.6 Otro sistema interoperable
        if (formData.conectividad.otroSistema) {
            autoTable(doc, {
                startY: currentY,
                body: [[
                    { content: "5.2.6", styles: { fontStyle: 'bold', textColor: [10, 91, 169], halign: 'center' } },
                    "¿Cuenta con otro sistema interoperable autorizado?",
                    { content: formData.conectividad.otroSistema, styles: { fillColor: [255, 255, 200] } }
                ]],
                theme: 'grid',
                styles: { fontSize: 7, cellPadding: 2, valign: 'middle' },
                margin: { left: margin, right: margin },
                tableWidth: contentWidth,
                columnStyles: {
                    0: { cellWidth: 15, halign: 'center' },
                    1: { cellWidth: 85 },
                    2: { cellWidth: 90 }
                }
            });
            currentY = doc.lastAutoTable.finalY + 3;
        }

        // 5.3 SEGURIDAD DE LA INFORMACIÓN Y PROTECCIÓN DE DATOS
        currentY = checkNewPage(currentY, 60);
        currentY = addSubSection("5.3 Seguridad de la Información y Protección de Datos", currentY);

        const seguridadPreguntas = [
            { num: "5.3.1", pregunta: "¿Cuenta con mecanismos de confidencialidad de la información?", id: "confidencialidad" },
            { num: "5.3.2", pregunta: "¿Cuenta con mecanismos de integridad de la información?", id: "integridad" },
            { num: "5.3.3", pregunta: "¿Cuenta con mecanismos de disponibilidad de la información?", id: "disponibilidad" },
            { num: "5.3.4", pregunta: "¿Implementa planes de contingencia para pérdida de datos?", id: "contingencia" },
            { num: "5.3.5", pregunta: "¿Cuenta con respaldo (backup) de información?", id: "backup" },
            { num: "5.3.6", pregunta: "¿Cuenta con formato de Consentimiento Informado para Telemedicina?", id: "consentimiento" },
            { num: "5.3.7", pregunta: "¿Cumple con la Ley N° 29733 de Protección de Datos Personales?", id: "ley29733" }
        ];

        const seguridadData = seguridadPreguntas
            .filter(item => formData.conectividad[item.id])
            .map(item => [
                { content: item.num, styles: { fontStyle: 'bold', textColor: [10, 91, 169], halign: 'center' } },
                item.pregunta,
                { content: "X", styles: { halign: 'center' } },
                { content: "", styles: { halign: 'center' } }
            ]);

        if (seguridadData.length > 0) {
            autoTable(doc, {
                startY: currentY,
                head: [[
                    { content: "N°", styles: { halign: 'center' } },
                    { content: "PREGUNTA", styles: { halign: 'center' } },
                    { content: "SÍ", styles: { halign: 'center' } },
                    { content: "NO", styles: { halign: 'center' } }
                ]],
                body: seguridadData,
                theme: 'grid',
                styles: { fontSize: 7, cellPadding: 2, valign: 'middle' },
                headStyles: { fillColor: [10, 91, 169], fontSize: 7, fontStyle: 'bold', halign: 'center' },
                margin: { left: margin, right: margin },
                tableWidth: contentWidth,
                columnStyles: {
                    0: { cellWidth: 15, halign: 'center' },
                    1: { cellWidth: 145 },
                    2: { cellWidth: 15, halign: 'center' },
                    3: { cellWidth: 15, halign: 'center' }
                },
                didParseCell: function(data) {
                    if (data.section === 'body') {
                        const rowIndex = data.row.index;
                        const colIndex = data.column.index;
                        const item = seguridadPreguntas.filter(i => formData.conectividad[i.id])[rowIndex];
                        if (item) {
                            const value = formData.conectividad[item.id];
                            if (colIndex === 2) {
                                data.cell.text = value === "si" ? ["X"] : [""];
                                data.cell.styles.fillColor = value === "si" ? [200, 230, 200] : null;
                            } else if (colIndex === 3) {
                                data.cell.text = value === "no" ? ["X"] : [""];
                                data.cell.styles.fillColor = value === "no" ? [230, 200, 200] : null;
                            }
                        }
                    }
                }
            });
            currentY = doc.lastAutoTable.finalY + 5;
        }

        // SERVICIOS DE TELESALUD
        currentY = checkNewPage(currentY, 40);
        currentY = addSection("VI. SERVICIOS DE TELESALUD", currentY);

        const serviciosCompletos = [
            { label: "Servicios incorporados en RENIPRESS", id: "incorporoServicios" },
            { label: "Teleconsulta", id: "teleconsulta" },
            { label: "Teleorientación", id: "teleorientacion" },
            { label: "Telemonitoreo", id: "telemonitoreo" },
            { label: "Teleinterconsulta", id: "teleinterconsulta" },
            { label: "Teleurgencia", id: "teleurgencia" },
            { label: "Teletriaje", id: "teletriaje" },
            { label: "Telerradiografía", id: "telerradiografia" },
            { label: "Telemamografía", id: "telemamografia" },
            { label: "Teletomografía", id: "teletomografia" },
            { label: "Telecapacitación", id: "telecapacitacion" },
            { label: "TeleIEC", id: "teleiec" },
        ];

        const serviciosData = serviciosCompletos
            .filter(item => formData.servicios[item.id])
            .map(item => [
                item.label,
                formatValue(formData.servicios[item.id]),
                formData.servicios[`${item.id}_obs`] || "-"
            ]);

        if (serviciosData.length > 0) {
            autoTable(doc, {
                startY: currentY,
                head: [["Servicio", "Estado", "Observaciones"]],
                body: serviciosData,
                theme: 'striped',
                styles: { fontSize: 8, cellPadding: 2.5 },
                headStyles: { fillColor: [10, 91, 169], fontSize: 8 },
                margin: { left: margin, right: margin },
                tableWidth: contentWidth,
                columnStyles: {
                    0: { cellWidth: 60 },
                    1: { halign: 'center', cellWidth: 25 },
                    2: { cellWidth: 105 }
                }
            });
            currentY = doc.lastAutoTable.finalY + 5;
        }

        addFooter(2, 3);

        // ==================== PÁGINA 3: NECESIDADES ====================
        doc.addPage();
        currentY = addHeader();
        currentY = addSection("VII. NECESIDADES Y REQUERIMIENTOS", currentY);

        // Infraestructura Física
        const needsInfra = [
            { label: "Espacio físico para Teleconsultorio", id: "espacioFisico" },
            { label: "Escritorio ergonómico", id: "escritorio" },
            { label: "Sillas ergonómicas", id: "sillas" },
            { label: "Estantes para equipos", id: "estantes" },
            { label: "Archivero con llave", id: "archivero" },
            { label: "Instalación de luz eléctrica", id: "luzElectrica" },
            { label: "Sistema de ventilación", id: "ventilacion" },
            { label: "Aire acondicionado", id: "aireAcond" },
        ].filter(item => formData.necesidades[`infra_${item.id}_cant`] || formData.necesidades[`infra_${item.id}_prior`]);

        if (needsInfra.length > 0) {
            currentY = addSubSection("7.1 Infraestructura Física", currentY);
            const infraNeedData = needsInfra.map(item => [item.label, formData.necesidades[`infra_${item.id}_cant`] || "0", capitalizeFirst(formData.necesidades[`infra_${item.id}_prior`])]);
            autoTable(doc, { startY: currentY, head: [["Requerimiento", "Cant", "Prioridad"]], body: infraNeedData, theme: 'striped', styles: { fontSize: 8, cellPadding: 2.5 }, headStyles: { fillColor: [10, 91, 169], fontSize: 8 }, margin: { left: margin, right: margin }, tableWidth: contentWidth, columnStyles: { 0: { cellWidth: 130 }, 1: { halign: 'center', cellWidth: 30 }, 2: { halign: 'center', cellWidth: 30 } } });
            currentY = doc.lastAutoTable.finalY + 2;
        }

        // Pregunta de suficiencia - Infraestructura Física
        if (formData.necesidades.infraFisicaSuficiente) {
            const suficienteText = formData.necesidades.infraFisicaSuficiente === 'si' ? 'Sí' :
                                   formData.necesidades.infraFisicaSuficiente === 'no' ? 'No' : 'Parcial';
            autoTable(doc, {
                startY: currentY,
                body: [[
                    { content: "¿La infraestructura física es suficiente?", styles: { fontStyle: 'bold' } },
                    { content: suficienteText, styles: { halign: 'center', fillColor: suficienteText === 'Sí' ? [200, 250, 200] : suficienteText === 'No' ? [250, 200, 200] : [255, 250, 200] } }
                ]],
                theme: 'grid',
                styles: { fontSize: 8, cellPadding: 2.5 },
                margin: { left: margin, right: margin },
                tableWidth: contentWidth,
                columnStyles: { 0: { cellWidth: 150 }, 1: { cellWidth: 40 } }
            });
            currentY = doc.lastAutoTable.finalY + 1;

            if (formData.necesidades.infraFisicaObservaciones) {
                autoTable(doc, {
                    startY: currentY,
                    body: [[
                        { content: "Observaciones:", styles: { fontStyle: 'bold', cellWidth: 30 } },
                        { content: formData.necesidades.infraFisicaObservaciones }
                    ]],
                    theme: 'plain',
                    styles: { fontSize: 8, cellPadding: 2 },
                    margin: { left: margin, right: margin },
                    tableWidth: contentWidth
                });
                currentY = doc.lastAutoTable.finalY + 2;
            }
        }
        currentY += 2;

        // 7.2 Infraestructura Tecnológica
        const needsInfraTec = [
            { label: "Equipo de Computo", id: "equipoComputo" },
            { label: "Equipos de red (routers, switches)", id: "equiposRed" },
            { label: "Software para gestión de teleconsulta", id: "softwareAtencion" },
            { label: "Aplicaciones de seguimiento y monitoreo", id: "aplicacionesMonitoreo" },
            { label: "Servicios de soporte", id: "serviciosSoporte" },
        ].filter(item => formData.necesidades[`infraTec_${item.id}_cant`] || formData.necesidades[`infraTec_${item.id}_prior`]);

        if (needsInfraTec.length > 0) {
            currentY = addSubSection("7.2 Infraestructura Tecnológica", currentY);
            const infraTecData = needsInfraTec.map(item => [item.label, formData.necesidades[`infraTec_${item.id}_cant`] || "0", capitalizeFirst(formData.necesidades[`infraTec_${item.id}_prior`])]);
            autoTable(doc, { startY: currentY, head: [["Requerimiento", "Cant", "Prioridad"]], body: infraTecData, theme: 'striped', styles: { fontSize: 8, cellPadding: 2.5 }, headStyles: { fillColor: [10, 91, 169], fontSize: 8 }, margin: { left: margin, right: margin }, tableWidth: contentWidth, columnStyles: { 0: { cellWidth: 130 }, 1: { halign: 'center', cellWidth: 30 }, 2: { halign: 'center', cellWidth: 30 } } });
            currentY = doc.lastAutoTable.finalY + 2;
        }

        // Pregunta de suficiencia - Infraestructura Tecnológica
        if (formData.necesidades.infraTecAdecuada) {
            if (needsInfraTec.length === 0) {
                currentY = addSubSection("7.2 Infraestructura Tecnológica", currentY);
            }
            const adecuadaText = formData.necesidades.infraTecAdecuada === 'si' ? 'Sí' :
                                 formData.necesidades.infraTecAdecuada === 'no' ? 'No' : 'Parcial';
            autoTable(doc, {
                startY: currentY,
                body: [[
                    { content: "¿La infraestructura tecnológica es adecuada?", styles: { fontStyle: 'bold' } },
                    { content: adecuadaText, styles: { halign: 'center', fillColor: adecuadaText === 'Sí' ? [200, 250, 200] : adecuadaText === 'No' ? [250, 200, 200] : [255, 250, 200] } }
                ]],
                theme: 'grid',
                styles: { fontSize: 8, cellPadding: 2.5 },
                margin: { left: margin, right: margin },
                tableWidth: contentWidth,
                columnStyles: { 0: { cellWidth: 150 }, 1: { cellWidth: 40 } }
            });
            currentY = doc.lastAutoTable.finalY + 4;
        }

        // Equipamiento Informático
        const needsEquip = [
            { label: "Computadora de escritorio", id: "computadora" },
            { label: "Laptop", id: "laptop" },
            { label: "Monitor", id: "monitor" },
            { label: "Cable HDMI", id: "cableHdmi" },
            { label: "Cámara web HD", id: "camaraWeb" },
            { label: "Micrófono", id: "microfono" },
            { label: "Parlantes/Audífonos", id: "parlantes" },
            { label: "Impresora", id: "impresora" },
            { label: "Escáner", id: "escaner" },
            { label: "Router/Switch de red", id: "router" },
        ].filter(item => formData.necesidades[`equip_${item.id}_cant`] || formData.necesidades[`equip_${item.id}_prior`]);

        if (needsEquip.length > 0) {
            currentY = addSubSection("7.3 Equipamiento Informático", currentY);
            const equipNeedData = needsEquip.map(item => [item.label, formData.necesidades[`equip_${item.id}_cant`] || "0", capitalizeFirst(formData.necesidades[`equip_${item.id}_prior`])]);
            autoTable(doc, { startY: currentY, head: [["Requerimiento", "Cant", "Prioridad"]], body: equipNeedData, theme: 'striped', styles: { fontSize: 8, cellPadding: 2.5 }, headStyles: { fillColor: [10, 91, 169], fontSize: 8 }, margin: { left: margin, right: margin }, tableWidth: contentWidth, columnStyles: { 0: { cellWidth: 130 }, 1: { halign: 'center', cellWidth: 30 }, 2: { halign: 'center', cellWidth: 30 } } });
            currentY = doc.lastAutoTable.finalY + 2;
        }

        // Pregunta de suficiencia - Equipamiento Informático
        if (formData.necesidades.equipInfoAdecuado) {
            const adecuadoText = formData.necesidades.equipInfoAdecuado === 'si' ? 'Sí' :
                                 formData.necesidades.equipInfoAdecuado === 'no' ? 'No' : 'Parcial';
            autoTable(doc, {
                startY: currentY,
                body: [[
                    { content: "¿El equipamiento informático es adecuado?", styles: { fontStyle: 'bold' } },
                    { content: adecuadoText, styles: { halign: 'center', fillColor: adecuadoText === 'Sí' ? [200, 250, 200] : adecuadoText === 'No' ? [250, 200, 200] : [255, 250, 200] } }
                ]],
                theme: 'grid',
                styles: { fontSize: 8, cellPadding: 2.5 },
                margin: { left: margin, right: margin },
                tableWidth: contentWidth,
                columnStyles: { 0: { cellWidth: 150 }, 1: { cellWidth: 40 } }
            });
            currentY = doc.lastAutoTable.finalY + 4;
        }

        // Equipamiento Biomédico
        const needsBio = [
            { label: "Pulsioxímetro digital", id: "pulsioximetro" },
            { label: "Dermatoscopio digital", id: "dermatoscopio" },
            { label: "Ecógrafo digital", id: "ecografo" },
            { label: "Electrocardiógrafo digital", id: "electrocardiografo" },
            { label: "Equipo de gases arteriales digital", id: "gasesArteriales" },
            { label: "Estetoscopio digital", id: "estetoscopio" },
            { label: "Fonendoscopio digital", id: "fonendoscopio" },
            { label: "Monitor de funciones vitales", id: "monitorVitales" },
            { label: "Otoscopio digital", id: "otoscopio" },
            { label: "Oxímetro digital", id: "oximetro" },
            { label: "Retinógrafo digital", id: "retinografo" },
            { label: "Tensiómetro digital", id: "tensiometro" },
            { label: "Videocolposcopio", id: "videocolposcopio" },
            { label: "Estación móvil de telemedicina", id: "estacionMovil" },
        ].filter(item => formData.necesidades[`bio_${item.id}_cant`] || formData.necesidades[`bio_${item.id}_prior`]);

        if (needsBio.length > 0) {
            currentY = addSubSection("7.4 Equipamiento Biomédico", currentY);
            const bioNeedData = needsBio.map(item => [item.label, formData.necesidades[`bio_${item.id}_cant`] || "0", capitalizeFirst(formData.necesidades[`bio_${item.id}_prior`])]);
            autoTable(doc, { startY: currentY, head: [["Requerimiento", "Cant", "Prioridad"]], body: bioNeedData, theme: 'striped', styles: { fontSize: 8, cellPadding: 2.5 }, headStyles: { fillColor: [10, 91, 169], fontSize: 8 }, margin: { left: margin, right: margin }, tableWidth: contentWidth, columnStyles: { 0: { cellWidth: 130 }, 1: { halign: 'center', cellWidth: 30 }, 2: { halign: 'center', cellWidth: 30 } } });
            currentY = doc.lastAutoTable.finalY + 2;
        }

        // Pregunta de suficiencia - Equipamiento Biomédico
        if (formData.necesidades.equipBioAdecuado) {
            const adecuadoText = formData.necesidades.equipBioAdecuado === 'si' ? 'Sí' :
                                 formData.necesidades.equipBioAdecuado === 'no' ? 'No' : 'Parcial';
            autoTable(doc, {
                startY: currentY,
                body: [[
                    { content: "¿El equipamiento biomédico es adecuado?", styles: { fontStyle: 'bold' } },
                    { content: adecuadoText, styles: { halign: 'center', fillColor: adecuadoText === 'Sí' ? [200, 250, 200] : adecuadoText === 'No' ? [250, 200, 200] : [255, 250, 200] } }
                ]],
                theme: 'grid',
                styles: { fontSize: 8, cellPadding: 2.5 },
                margin: { left: margin, right: margin },
                tableWidth: contentWidth,
                columnStyles: { 0: { cellWidth: 150 }, 1: { cellWidth: 40 } }
            });
            currentY = doc.lastAutoTable.finalY + 4;
        }

        // 7.5 Conectividad
        const needsConect = [
            { label: "Instalación de internet", id: "instalacionInternet" },
            { label: "Puntos de red", id: "puntosRed" },
            { label: "Módem WiFi", id: "modemWifi" },
            { label: "Internet satelital", id: "internetSatelital" },
        ].filter(item => formData.necesidades[`conect_${item.id}_cant`] || formData.necesidades[`conect_${item.id}_prior`]);

        if (needsConect.length > 0) {
            currentY = checkNewPage(currentY, 40);
            currentY = addSubSection("7.5 Conectividad", currentY);
            const conectData = needsConect.map(item => [item.label, formData.necesidades[`conect_${item.id}_cant`] || "0", capitalizeFirst(formData.necesidades[`conect_${item.id}_prior`])]);
            autoTable(doc, { startY: currentY, head: [["Requerimiento", "Cant", "Prioridad"]], body: conectData, theme: 'striped', styles: { fontSize: 8, cellPadding: 2.5 }, headStyles: { fillColor: [10, 91, 169], fontSize: 8 }, margin: { left: margin, right: margin }, tableWidth: contentWidth, columnStyles: { 0: { cellWidth: 130 }, 1: { halign: 'center', cellWidth: 30 }, 2: { halign: 'center', cellWidth: 30 } } });
            currentY = doc.lastAutoTable.finalY + 4;
        }

        // 7.6 Recursos Humanos
        const needsRRHH = [
            { label: "Médicos especialistas", id: "medicosEspecialistas" },
            { label: "Médicos generales", id: "medicosGenerales" },
            { label: "Enfermeras(os)", id: "enfermeras" },
            { label: "Obstetras", id: "obstetras" },
            { label: "Tecnólogos médicos", id: "tecnologosMedicos" },
            { label: "Psicólogos", id: "psicologos" },
            { label: "Nutricionistas", id: "nutricionistas" },
            { label: "Trabajadores sociales", id: "trabajadoresSociales" },
            { label: "Otros profesionales de salud", id: "otrosProfesionales" },
            { label: "Personal técnico de salud", id: "personalTecnico" },
            { label: "Personal de soporte TIC", id: "personalTic" },
            { label: "Personal administrativo", id: "personalAdmin" },
        ].filter(item => formData.necesidades[`rrhh_${item.id}_cant`] || formData.necesidades[`rrhh_${item.id}_prior`]);

        if (needsRRHH.length > 0) {
            currentY = checkNewPage(currentY, 60);
            currentY = addSubSection("7.6 Recursos Humanos", currentY);
            const rrhhData = needsRRHH.map(item => [item.label, formData.necesidades[`rrhh_${item.id}_cant`] || "0", capitalizeFirst(formData.necesidades[`rrhh_${item.id}_prior`])]);
            autoTable(doc, { startY: currentY, head: [["Rol", "Cant", "Prioridad"]], body: rrhhData, theme: 'striped', styles: { fontSize: 8, cellPadding: 2.5 }, headStyles: { fillColor: [10, 91, 169], fontSize: 8 }, margin: { left: margin, right: margin }, tableWidth: contentWidth, columnStyles: { 0: { cellWidth: 130 }, 1: { halign: 'center', cellWidth: 30 }, 2: { halign: 'center', cellWidth: 30 } } });
            currentY = doc.lastAutoTable.finalY + 4;
        }

        // 7.7 Capacitación para Telesalud
        const needsCapac = [
            { label: "Uso de plataformas de telesalud", id: "usoPlataformas" },
            { label: "Seguridad de la información", id: "seguridadInfo" },
            { label: "Protocolos clínicos", id: "protocolosClinicos" },
        ].filter(item => formData.necesidades[`capac_${item.id}_cant`] || formData.necesidades[`capac_${item.id}_prior`]);

        if (needsCapac.length > 0) {
            currentY = checkNewPage(currentY, 40);
            currentY = addSubSection("7.7 Capacitación para Telesalud", currentY);
            const capacData = needsCapac.map(item => [item.label, formData.necesidades[`capac_${item.id}_cant`] || "0", capitalizeFirst(formData.necesidades[`capac_${item.id}_prior`])]);
            autoTable(doc, { startY: currentY, head: [["Capacitación", "Participantes", "Prioridad"]], body: capacData, theme: 'striped', styles: { fontSize: 8, cellPadding: 2.5 }, headStyles: { fillColor: [10, 91, 169], fontSize: 8 }, margin: { left: margin, right: margin }, tableWidth: contentWidth, columnStyles: { 0: { cellWidth: 130 }, 1: { halign: 'center', cellWidth: 30 }, 2: { halign: 'center', cellWidth: 30 } } });
            currentY = doc.lastAutoTable.finalY + 4;
        }

        // 7.8 OBSERVACIONES Y COMENTARIOS ADICIONALES
        if (formData.necesidades.necesidadesConectividad || formData.necesidades.necesidadesCapacitacion || formData.necesidades.observacionesGenerales || formData.necesidades.observacionesFinales) {
            currentY = checkNewPage(currentY, 60);
            currentY = addSubSection("7.8 Observaciones y Comentarios Adicionales", currentY);

            // Necesidades de conectividad
            if (formData.necesidades.necesidadesConectividad) {
                autoTable(doc, {
                    startY: currentY,
                    body: [[
                        { content: "7.8.1", styles: { fontStyle: 'bold', textColor: [10, 91, 169], halign: 'center', valign: 'top' } },
                        { content: "Necesidades de conectividad (internet, puntos de red, etc.):", styles: { fontStyle: 'bold' } }
                    ]],
                    theme: 'plain',
                    styles: { fontSize: 8, cellPadding: 1 },
                    margin: { left: margin, right: margin },
                    tableWidth: contentWidth,
                    columnStyles: { 0: { cellWidth: 15 }, 1: { cellWidth: 175 } }
                });
                currentY = doc.lastAutoTable.finalY + 1;

                autoTable(doc, {
                    startY: currentY,
                    body: [[{ content: formData.necesidades.necesidadesConectividad, styles: { fillColor: [255, 255, 200], minCellHeight: 15 } }]],
                    theme: 'grid',
                    styles: { fontSize: 8, cellPadding: 4 },
                    margin: { left: margin, right: margin },
                    tableWidth: contentWidth
                });
                currentY = doc.lastAutoTable.finalY + 4;
            }

            // 7.8.2 Necesidades de capacitación
            if (formData.necesidades.necesidadesCapacitacion) {
                currentY = checkNewPage(currentY, 40);
                autoTable(doc, {
                    startY: currentY,
                    body: [[
                        { content: "7.8.2", styles: { fontStyle: 'bold', textColor: [10, 91, 169], halign: 'center', valign: 'top' } },
                        { content: "Necesidades de capacitación del personal:", styles: { fontStyle: 'bold' } }
                    ]],
                    theme: 'plain',
                    styles: { fontSize: 8, cellPadding: 1 },
                    margin: { left: margin, right: margin },
                    tableWidth: contentWidth,
                    columnStyles: { 0: { cellWidth: 15 }, 1: { cellWidth: 175 } }
                });
                currentY = doc.lastAutoTable.finalY + 1;

                autoTable(doc, {
                    startY: currentY,
                    body: [[{ content: formData.necesidades.necesidadesCapacitacion, styles: { fillColor: [255, 255, 200], minCellHeight: 15 } }]],
                    theme: 'grid',
                    styles: { fontSize: 8, cellPadding: 4 },
                    margin: { left: margin, right: margin },
                    tableWidth: contentWidth
                });
                currentY = doc.lastAutoTable.finalY + 4;
            }

            // 7.8.3 Observaciones generales
            if (formData.necesidades.observacionesGenerales || formData.necesidades.observacionesFinales) {
                currentY = checkNewPage(currentY, 40);
                autoTable(doc, {
                    startY: currentY,
                    body: [[
                        { content: "7.8.3", styles: { fontStyle: 'bold', textColor: [10, 91, 169], halign: 'center', valign: 'top' } },
                        { content: "Observaciones generales y comentarios adicionales:", styles: { fontStyle: 'bold' } }
                    ]],
                    theme: 'plain',
                    styles: { fontSize: 8, cellPadding: 1 },
                    margin: { left: margin, right: margin },
                    tableWidth: contentWidth,
                    columnStyles: { 0: { cellWidth: 15 }, 1: { cellWidth: 175 } }
                });
                currentY = doc.lastAutoTable.finalY + 1;

                autoTable(doc, {
                    startY: currentY,
                    body: [[{ content: formData.necesidades.observacionesGenerales || formData.necesidades.observacionesFinales, styles: { fillColor: [255, 255, 200], minCellHeight: 15 } }]],
                    theme: 'grid',
                    styles: { fontSize: 8, cellPadding: 4 },
                    margin: { left: margin, right: margin },
                    tableWidth: contentWidth
                });
                currentY = doc.lastAutoTable.finalY + 4;
            }
        }

        addFooter(3, 3);

        return doc;
    };

    // Abrir PDF en nueva pestaña
    const handleDescargarPDF = () => {
        const doc = crearDocumentoPDF();
        const pdfBlob = doc.output('blob');
        window.open(URL.createObjectURL(pdfBlob), '_blank');
    };

    const instrucciones = [
        {
            numero: 1,
            icono: <FileText className="w-5 h-5" />,
            texto: "Este instrumento tiene como objetivo recopilar información para el diagnóstico situacional de Telesalud y realizar el requerimiento."
        },
        {
            numero: 2,
            icono: <BookOpen className="w-5 h-5" />,
            texto: (
                <>
                    Basado en la <strong className="text-[#0A5BA9]">NTS N° 235-MINSA/DIGTEL/2025 'NORMA TÉCNICA DE SALUD EN TELESALUD' (RM 664-2025-MINSA)</strong> y Directiva de Gerencia General N°008-GG-ESSALUD-2025 "Disposiciones para la Implementación de los Servicios de Telesalud en las Instituciones Prestadoras de Servicios de Salud - IPRESS del Seguro Social de Salud – ESSALUD".
                </>
            )
        },
        {
            numero: 3,
            icono: <ListChecks className="w-5 h-5" />,
            texto: "Complete todas las hojas del presente cuestionario con información actualizada."
        },
        {
            numero: 4,
            icono: <CheckCircle2 className="w-5 h-5" />,
            texto: (
                <>
                    Las celdas en color <span className="inline-flex items-center px-3 py-1 bg-yellow-400 text-yellow-900 font-bold rounded-md shadow-sm mx-1">AMARILLO</span> son campos para completar.
                </>
            )
        },
        {
            numero: 5,
            icono: <AlertCircle className="w-5 h-5" />,
            texto: "Para las preguntas con opciones, seleccione de la lista desplegable."
        },
        {
            numero: 6,
            icono: <HelpCircle className="w-5 h-5" />,
            texto: "En caso de dudas, comuníquese con los gestores territoriales del Cenate."
        },
        {
            numero: 7,
            icono: <Calendar className="w-5 h-5" />,
            texto: (
                <>
                    <strong className="text-[#0A5BA9]">Plazo de entrega:</strong> Según cronograma establecido.
                </>
            )
        }
    ];

    // ========== VISTA DE INSTRUCCIONES ==========
    const renderInstrucciones = () => (
        <div className="min-h-screen relative">
            {/* Marca de agua / Watermark */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <img
                    src="/images/LogoCENATEAzul.png"
                    alt=""
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] opacity-[0.03]"
                />
            </div>

            <div className="relative z-10 w-full px-4 py-6">
                {/* Header con gradiente institucional */}
                <div className="bg-gradient-to-r from-[#0A5BA9] to-[#094580] rounded-2xl shadow-2xl p-8 mb-8 relative overflow-hidden">
                    <div className="flex items-center justify-between relative">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                                <ClipboardList className="w-12 h-12 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                                    Formulario de Diagnóstico
                                </h1>
                                <p className="text-xl text-white/90 font-medium mt-1">
                                    Situacional de Telesalud
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Card principal de instrucciones */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    {/* Header de la card */}
                    <div className="bg-gradient-to-r from-gray-50 to-white px-8 py-6 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-[#0A5BA9]/10 rounded-xl">
                                <BookOpen className="w-6 h-6 text-[#0A5BA9]" />
                            </div>
                            <h2 className="text-2xl font-bold text-[#0A5BA9]">
                                INSTRUCCIONES PARA EL LLENADO
                            </h2>
                        </div>
                    </div>

                    {/* Contenido de instrucciones */}
                    <div className="p-8">
                        <div className="space-y-4">
                            {instrucciones.map((item) => (
                                <div
                                    key={item.numero}
                                    className="flex items-start gap-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-transparent hover:from-blue-50 hover:to-transparent transition-all duration-300 group"
                                >
                                    {/* Número */}
                                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-[#0A5BA9] to-[#094580] rounded-xl flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                                        {item.numero}
                                    </div>

                                    {/* Icono */}
                                    <div className="flex-shrink-0 p-2 bg-[#0A5BA9]/10 rounded-lg text-[#0A5BA9] group-hover:bg-[#0A5BA9]/20 transition-colors duration-300">
                                        {item.icono}
                                    </div>

                                    {/* Texto */}
                                    <p className="text-gray-700 leading-relaxed pt-1 flex-1">
                                        {item.texto}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Separador decorativo */}
                        <div className="my-8 flex items-center gap-4">
                            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                            <img
                                src="/images/LogoESSALUDAzul.png"
                                alt="EsSalud"
                                className="h-8 opacity-50"
                            />
                            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                        </div>

                        {/* Nota informativa */}
                        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-l-4 border-amber-400 rounded-r-xl p-5 mb-8">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-amber-800">Nota importante</p>
                                    <p className="text-amber-700 text-sm mt-1">
                                        Asegúrese de tener toda la información necesaria antes de iniciar el formulario.
                                        Una vez iniciado, podrá guardar su progreso y continuar en cualquier momento.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Botón Continuar */}
                        <div className="flex justify-end">
                            <button
                                className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#0A5BA9] to-[#094580] hover:from-[#094580] hover:to-[#073660] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                                onClick={() => setCurrentView("formulario")}
                            >
                                <span className="text-lg">Comenzar Formulario</span>
                                <div className="p-1.5 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sección de Documentos Enviados */}
                {documentosEnviados.length > 0 && (
                    <div className="mt-8 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-8 py-5 border-b border-emerald-500">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-xl">
                                    <FileCheck className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">
                                        Documentos Enviados
                                    </h2>
                                    <p className="text-emerald-100 text-sm">
                                        Historial de formularios enviados por su IPRESS
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6">
                            {cargandoDocumentos ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                                    <span className="ml-3 text-gray-600">Cargando documentos...</span>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {documentosEnviados.map((doc) => (
                                        <div
                                            key={doc.idFormulario}
                                            className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover:border-emerald-300 hover:shadow-md transition-all duration-200"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`p-3 rounded-xl ${
                                                    doc.estado === "FIRMADO"
                                                        ? "bg-purple-100"
                                                        : "bg-emerald-100"
                                                }`}>
                                                    {doc.estado === "FIRMADO" ? (
                                                        <Shield className="w-5 h-5 text-purple-600" />
                                                    ) : (
                                                        <FileText className="w-5 h-5 text-emerald-600" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-800">
                                                        Formulario #{doc.idFormulario}
                                                    </p>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className="flex items-center gap-1 text-sm text-gray-500">
                                                            <Calendar className="w-4 h-4" />
                                                            {doc.fechaEnvio
                                                                ? new Date(doc.fechaEnvio).toLocaleDateString("es-PE", {
                                                                    day: '2-digit',
                                                                    month: '2-digit',
                                                                    year: 'numeric'
                                                                })
                                                                : "Sin fecha"}
                                                        </span>
                                                        <span className="flex items-center gap-1 text-sm text-gray-500">
                                                            <Clock className="w-4 h-4" />
                                                            {doc.fechaEnvio
                                                                ? new Date(doc.fechaEnvio).toLocaleTimeString("es-PE", {
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })
                                                                : "--:--"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                {/* Badge de estado */}
                                                <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                                                    doc.estado === "FIRMADO"
                                                        ? "bg-purple-100 text-purple-700"
                                                        : "bg-green-100 text-green-700"
                                                }`}>
                                                    {doc.estado === "FIRMADO"
                                                        ? "Firmado"
                                                        : "Enviado"}
                                                </span>

                                                {/* Botón Ver PDF (del backend) */}
                                                <button
                                                    onClick={() => verPdfBackend(doc.idFormulario)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                    Ver PDF
                                                </button>

                                                {/* Botón Eliminar */}
                                                <button
                                                    onClick={() => handleEliminarDocumento(doc)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors shadow-sm"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    Eliminar
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Footer institucional */}
                <div className="mt-8 text-center">
                    <p className="text-gray-400 text-sm">
                        Centro Nacional de Telemedicina — EsSalud © 2025
                    </p>
                </div>
            </div>
        </div>
    );

    // ========== VISTA DEL FORMULARIO ==========
    const renderFormulario = () => (
        <div className="min-h-screen bg-gray-50">
            {/* Header de tabs */}
            <div className="bg-white border-b border-gray-200 shadow-sm">
                <div className="w-full">
                    <div className="flex overflow-x-auto scrollbar-hide">
                        {TABS_CONFIG.filter(tab => !tab.isPreview || vistaPreviaHabilitada).map((tab, index) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            const isCompleted = tabsCompletados[tab.id];

                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => {
                                        if (tab.isPreview && !vistaPreviaHabilitada) return;
                                        handleTabChange(tab.id);
                                    }}
                                    className={`
                                        flex flex-col items-center justify-center px-4 py-4 min-w-[120px] border-b-2 transition-all duration-200
                                        ${isActive
                                            ? "border-[#0A5BA9] bg-blue-50 text-[#0A5BA9]"
                                            : tab.isPreview
                                                ? "border-transparent text-green-600 hover:text-green-700 hover:bg-green-50"
                                                : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                        }
                                    `}
                                >
                                    <div className={`p-2 rounded-lg mb-1 ${isActive ? "bg-[#0A5BA9]/10" : tab.isPreview ? "bg-green-100" : "bg-gray-100"}`}>
                                        <Icon className={`w-5 h-5 ${isActive ? "text-[#0A5BA9]" : tab.isPreview ? "text-green-600" : "text-gray-400"}`} />
                                    </div>
                                    <span className={`text-xs font-medium whitespace-nowrap ${isActive ? "text-[#0A5BA9]" : tab.isPreview ? "text-green-600" : "text-gray-600"}`}>
                                        {tab.label}
                                    </span>
                                    {isCompleted && (
                                        <Check className="w-3 h-3 text-green-500 mt-1" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Contenido del formulario */}
            <div className="w-full px-4 py-6">
                {/* Tab: Datos Generales */}
                {activeTab === "datos-generales" && (
                    <div className="space-y-6">
                        {/* Sección I: Datos de la IPRESS */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-[#0A5BA9] to-[#094580] px-6 py-4">
                                <h3 className="text-lg font-semibold text-white">
                                    I. DATOS GENERALES DE LA IPRESS
                                </h3>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Campo 1.1 */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <span className="text-[#0A5BA9] font-bold mr-2">1.1</span>
                                            Nombre de la IPRESS:
                                        </label>
                                        <input
                                            type="text"
                                            value={datosUsuario?.nombre_ipress || ""}
                                            readOnly
                                            className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-600 cursor-not-allowed"
                                        />
                                    </div>
                                    {/* Campo 1.2 */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <span className="text-[#0A5BA9] font-bold mr-2">1.2</span>
                                            Red Asistencial:
                                        </label>
                                        <input
                                            type="text"
                                            value={datosUsuario?.nombre_red || ""}
                                            readOnly
                                            className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-600 cursor-not-allowed"
                                        />
                                    </div>
                                    {/* Campo 1.2b - Macroregión */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <span className="text-[#0A5BA9] font-bold mr-2">1.2b</span>
                                            Macroregión:
                                        </label>
                                        <input
                                            type="text"
                                            value={datosUsuario?.nombre_macroregion || ""}
                                            readOnly
                                            className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-600 cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                {/* Datos del Director */}
                                <div className="mt-8">
                                    <h4 className="text-[#0A5BA9] font-semibold mb-4 pb-2 border-b border-gray-200">
                                        Datos del Director de la IPRESS
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <span className="text-[#0A5BA9] font-bold mr-2">1.3</span>
                                                Nombre y Apellido completo: <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.datosGenerales.directorNombre || ""}
                                                onChange={(e) => handleValidatedInputChange("datosGenerales", "directorNombre", e.target.value, "nombreCompleto")}
                                                className={`w-full px-4 py-3 bg-yellow-50 border-2 rounded-lg focus:ring-2 focus:ring-[#0A5BA9]/20 transition-all ${
                                                    errores["datosGenerales.directorNombre"]
                                                        ? "border-red-400 focus:border-red-500"
                                                        : "border-yellow-300 focus:border-[#0A5BA9]"
                                                }`}
                                                placeholder="Ingrese nombre completo"
                                            />
                                            {errores["datosGenerales.directorNombre"] && (
                                                <p className="text-red-500 text-xs mt-1">{errores["datosGenerales.directorNombre"]}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <span className="text-[#0A5BA9] font-bold mr-2">1.4</span>
                                                Correo: <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="email"
                                                value={formData.datosGenerales.directorCorreo || ""}
                                                onChange={(e) => handleValidatedInputChange("datosGenerales", "directorCorreo", e.target.value, "email")}
                                                className={`w-full px-4 py-3 bg-yellow-50 border-2 rounded-lg focus:ring-2 focus:ring-[#0A5BA9]/20 transition-all ${
                                                    errores["datosGenerales.directorCorreo"]
                                                        ? "border-red-400 focus:border-red-500"
                                                        : "border-yellow-300 focus:border-[#0A5BA9]"
                                                }`}
                                                placeholder="correo@ejemplo.com"
                                            />
                                            {errores["datosGenerales.directorCorreo"] && (
                                                <p className="text-red-500 text-xs mt-1">{errores["datosGenerales.directorCorreo"]}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <span className="text-[#0A5BA9] font-bold mr-2">1.5</span>
                                                Tel/Cel Director: <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="tel"
                                                value={formData.datosGenerales.directorTelefono || ""}
                                                onChange={(e) => handleValidatedInputChange("datosGenerales", "directorTelefono", e.target.value, "telefono")}
                                                className={`w-full px-4 py-3 bg-yellow-50 border-2 rounded-lg focus:ring-2 focus:ring-[#0A5BA9]/20 transition-all ${
                                                    errores["datosGenerales.directorTelefono"]
                                                        ? "border-red-400 focus:border-red-500"
                                                        : "border-yellow-300 focus:border-[#0A5BA9]"
                                                }`}
                                                placeholder="999999999"
                                                maxLength={9}
                                            />
                                            {errores["datosGenerales.directorTelefono"] && (
                                                <p className="text-red-500 text-xs mt-1">{errores["datosGenerales.directorTelefono"]}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Datos del Responsable */}
                                <div className="mt-8">
                                    <h4 className="text-[#0A5BA9] font-semibold mb-4 pb-2 border-b border-gray-200">
                                        Datos del responsable o coordinador de telesalud de la IPRESS
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <span className="text-[#0A5BA9] font-bold mr-2">1.6</span>
                                                Nombre y Apellido completo: <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.datosGenerales.responsableNombre || ""}
                                                onChange={(e) => handleValidatedInputChange("datosGenerales", "responsableNombre", e.target.value, "nombreCompleto")}
                                                className={`w-full px-4 py-3 bg-yellow-50 border-2 rounded-lg focus:ring-2 focus:ring-[#0A5BA9]/20 transition-all ${
                                                    errores["datosGenerales.responsableNombre"]
                                                        ? "border-red-400 focus:border-red-500"
                                                        : "border-yellow-300 focus:border-[#0A5BA9]"
                                                }`}
                                                placeholder="Ingrese nombre completo"
                                            />
                                            {errores["datosGenerales.responsableNombre"] && (
                                                <p className="text-red-500 text-xs mt-1">{errores["datosGenerales.responsableNombre"]}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <span className="text-[#0A5BA9] font-bold mr-2">1.7</span>
                                                Correo: <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="email"
                                                value={formData.datosGenerales.responsableCorreo || ""}
                                                onChange={(e) => handleValidatedInputChange("datosGenerales", "responsableCorreo", e.target.value, "email")}
                                                className={`w-full px-4 py-3 bg-yellow-50 border-2 rounded-lg focus:ring-2 focus:ring-[#0A5BA9]/20 transition-all ${
                                                    errores["datosGenerales.responsableCorreo"]
                                                        ? "border-red-400 focus:border-red-500"
                                                        : "border-yellow-300 focus:border-[#0A5BA9]"
                                                }`}
                                                placeholder="correo@ejemplo.com"
                                            />
                                            {errores["datosGenerales.responsableCorreo"] && (
                                                <p className="text-red-500 text-xs mt-1">{errores["datosGenerales.responsableCorreo"]}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <span className="text-[#0A5BA9] font-bold mr-2">1.8</span>
                                                Tel/Cel Responsable o Coordinador: <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="tel"
                                                value={formData.datosGenerales.responsableTelefono || ""}
                                                onChange={(e) => handleValidatedInputChange("datosGenerales", "responsableTelefono", e.target.value, "telefono")}
                                                className={`w-full px-4 py-3 bg-yellow-50 border-2 rounded-lg focus:ring-2 focus:ring-[#0A5BA9]/20 transition-all ${
                                                    errores["datosGenerales.responsableTelefono"]
                                                        ? "border-red-400 focus:border-red-500"
                                                        : "border-yellow-300 focus:border-[#0A5BA9]"
                                                }`}
                                                placeholder="999999999"
                                                maxLength={9}
                                            />
                                            {errores["datosGenerales.responsableTelefono"] && (
                                                <p className="text-red-500 text-xs mt-1">{errores["datosGenerales.responsableTelefono"]}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Datos adicionales */}
                                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <span className="text-[#0A5BA9] font-bold mr-2">1.9</span>
                                            Población adscrita: <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            value={formatearNumero(formData.datosGenerales.poblacionAdscrita)}
                                            onChange={(e) => handleNumeroFormateado("datosGenerales", "poblacionAdscrita", e.target.value)}
                                            className="w-full px-4 py-3 bg-yellow-50 border-2 border-yellow-300 rounded-lg focus:border-[#0A5BA9] focus:ring-2 focus:ring-[#0A5BA9]/20 transition-all"
                                            placeholder="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <span className="text-[#0A5BA9] font-bold mr-2">1.10</span>
                                            Promedio de atenciones mensuales: <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            value={formatearNumero(formData.datosGenerales.atencionesMenuales)}
                                            onChange={(e) => handleNumeroFormateado("datosGenerales", "atencionesMenuales", e.target.value)}
                                            className="w-full px-4 py-3 bg-yellow-50 border-2 border-yellow-300 rounded-lg focus:border-[#0A5BA9] focus:ring-2 focus:ring-[#0A5BA9]/20 transition-all"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab: Recursos Humanos */}
                {activeTab === "recursos-humanos" && (
                    <div className="space-y-6">
                        {/* Sección II: Recursos Humanos */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-[#0A5BA9] to-[#094580] px-6 py-4">
                                <h3 className="text-lg font-semibold text-white">
                                    II. RECURSOS HUMANOS PARA TELESALUD (Ref. NTS N° 235, numeral 6.3.1)
                                </h3>
                            </div>
                            <div className="p-6 space-y-8">
                                {/* Pregunta 2.1.1 */}
                                <div>
                                    <p className="text-gray-700 mb-3">
                                        <span className="text-[#0A5BA9] font-bold mr-2">2.1.1</span>
                                        ¿La IPRESS designa, mediante documento formal, a un Coordinador de Telesalud o profesional de la salud responsable de la implementación y articulación de los servicios de Telesalud en el establecimiento de salud? <span className="text-red-500">*</span>
                                    </p>
                                    <div className="flex gap-6">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="coord-telesalud"
                                                value="si"
                                                checked={formData.recursosHumanos.coordTelesalud === "si"}
                                                onChange={(e) => handleInputChange("recursosHumanos", "coordTelesalud", e.target.value)}
                                                className="w-5 h-5 text-[#0A5BA9]"
                                            />
                                            <span>Sí</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="coord-telesalud"
                                                value="no"
                                                checked={formData.recursosHumanos.coordTelesalud === "no"}
                                                onChange={(e) => handleInputChange("recursosHumanos", "coordTelesalud", e.target.value)}
                                                className="w-5 h-5 text-[#0A5BA9]"
                                            />
                                            <span>No</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Pregunta 2.1.2 */}
                                <div>
                                    <p className="text-gray-700 mb-3">
                                        <span className="text-[#0A5BA9] font-bold mr-2">2.1.2</span>
                                        Durante la prestación de dichos servicios, ¿la IPRESS asigna un personal de apoyo, conformado por profesionales, técnicos o auxiliares de la salud, personal de soporte TIC o administrativo, encargado de garantizar una atención adecuada y oportuna al usuario? <span className="text-red-500">*</span>
                                    </p>
                                    <div className="flex gap-6">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="personal-apoyo"
                                                value="si"
                                                checked={formData.recursosHumanos.personalApoyo === "si"}
                                                onChange={(e) => handleInputChange("recursosHumanos", "personalApoyo", e.target.value)}
                                                className="w-5 h-5 text-[#0A5BA9]"
                                            />
                                            <span>Sí</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="personal-apoyo"
                                                value="no"
                                                checked={formData.recursosHumanos.personalApoyo === "no"}
                                                onChange={(e) => handleInputChange("recursosHumanos", "personalApoyo", e.target.value)}
                                                className="w-5 h-5 text-[#0A5BA9]"
                                            />
                                            <span>No</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Tabla de Personal */}
                                {formData.recursosHumanos.personalApoyo === "si" && (
                                    <div className="mt-6">
                                        <p className="font-semibold text-gray-700 mb-4">SEÑALAR EL TIPO DE PERSONAL DE APOYO Y LA CANTIDAD</p>
                                        <div className="overflow-x-auto">
                                            <table className="w-full border-collapse">
                                                <thead>
                                                    <tr className="bg-[#0A5BA9] text-white">
                                                        <th className="px-4 py-3 text-left font-medium">CATEGORÍA PROFESIONAL</th>
                                                        <th className="px-4 py-3 text-center font-medium w-32">CANTIDAD TOTAL</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {[
                                                        { id: "medicosEspecialistas", label: "Médicos especialistas" },
                                                        { id: "medicosGenerales", label: "Médicos generales" },
                                                        { id: "enfermeras", label: "Enfermeras(os)" },
                                                        { id: "obstetras", label: "Obstetras" },
                                                        { id: "tecnologos", label: "Tecnólogos médicos" },
                                                        { id: "psicologos", label: "Psicólogos" },
                                                        { id: "nutricionistas", label: "Nutricionistas" },
                                                        { id: "trabajadoresSociales", label: "Trabajadores sociales" },
                                                        { id: "otrosProfesionales", label: "Otros profesionales de salud" },
                                                        { id: "tecnicoSalud", label: "Personal técnico de salud" },
                                                        { id: "soporteTic", label: "Personal de soporte TIC" },
                                                        { id: "administrativo", label: "Personal administrativo" },
                                                    ].map((item, index) => (
                                                        <tr key={item.id} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                                                            <td className="px-4 py-3 border-b border-gray-200">{item.label}</td>
                                                            <td className="px-4 py-3 border-b border-gray-200 text-center">
                                                                <NumberSelector
                                                                    value={formData.recursosHumanos[item.id] || ""}
                                                                    onChange={(e) => handleInputChange("recursosHumanos", item.id, e.target.value)}
                                                                    min={0}
                                                                    max={50}
                                                                    className="w-24 mx-auto"
                                                                />
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sección 2.2: Capacitación y Competencias */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-[#0A5BA9] to-[#094580] px-6 py-4">
                                <h3 className="text-lg font-semibold text-white">
                                    2.2 CAPACITACIÓN Y COMPETENCIAS
                                </h3>
                            </div>
                            <div className="p-6 space-y-6">
                                {/* Tabla de preguntas Sí/No */}
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr className="bg-[#0A5BA9] text-white">
                                                <th className="px-4 py-3 text-left font-medium">PREGUNTA <span className="text-red-300">*</span></th>
                                                <th className="px-4 py-3 text-center font-medium w-20">SÍ</th>
                                                <th className="px-4 py-3 text-center font-medium w-20">NO</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[
                                                { id: "capacitacionTic", num: "2.2.1", label: "¿El personal ha recibido capacitación en uso de TIC para Telesalud?" },
                                                { id: "normativa", num: "2.2.2", label: "¿El personal conoce la normativa vigente de Telesalud?" },
                                                { id: "alfabetizacion", num: "2.2.3", label: "¿El personal tiene competencias en alfabetización digital?" },
                                                { id: "planCapacitacion", num: "2.2.4", label: "¿Existe un plan de capacitación en Telesalud?" },
                                            ].map((item, index) => (
                                                <tr key={item.id} className={index % 2 === 0 ? "bg-blue-50" : "bg-white"}>
                                                    <td className="px-4 py-3 border-b border-gray-200">
                                                        <span className="text-[#0A5BA9] font-medium mr-2">{item.num}</span>
                                                        {item.label}
                                                    </td>
                                                    <td className="px-4 py-3 border-b border-gray-200 text-center">
                                                        <input
                                                            type="radio"
                                                            name={item.id}
                                                            value="si"
                                                            checked={formData.recursosHumanos[item.id] === "si"}
                                                            onChange={(e) => handleInputChange("recursosHumanos", item.id, e.target.value)}
                                                            className="w-5 h-5 text-[#0A5BA9] cursor-pointer"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 border-b border-gray-200 text-center">
                                                        <input
                                                            type="radio"
                                                            name={item.id}
                                                            value="no"
                                                            checked={formData.recursosHumanos[item.id] === "no"}
                                                            onChange={(e) => handleInputChange("recursosHumanos", item.id, e.target.value)}
                                                            className="w-5 h-5 text-[#0A5BA9] cursor-pointer"
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pregunta 2.2.5 */}
                                <div>
                                    <label className="block text-gray-700 mb-2">
                                        <span className="text-[#0A5BA9] font-bold mr-2">2.2.5</span>
                                        ¿Cuántas capacitaciones en Telesalud se han realizado en el último año? <span className="text-red-500">*</span>
                                    </label>
                                    <NumberSelector
                                        value={formData.recursosHumanos.capacitacionesAnio || ""}
                                        onChange={(e) => handleInputChange("recursosHumanos", "capacitacionesAnio", e.target.value)}
                                        min={0}
                                        max={50}
                                        className="w-full max-w-xs"
                                    />
                                </div>

                                {/* Pregunta 2.2.6 */}
                                <div>
                                    <label className="block text-gray-700 mb-2">
                                        <span className="text-[#0A5BA9] font-bold mr-2">2.2.6</span>
                                        Principales necesidades(temas) de capacitación identificadas: <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={formData.recursosHumanos.necesidadesCapacitacion || ""}
                                        onChange={(e) => handleInputChange("recursosHumanos", "necesidadesCapacitacion", e.target.value)}
                                        className="w-full px-4 py-3 bg-yellow-50 border-2 border-yellow-300 rounded-lg focus:border-[#0A5BA9] focus:ring-2 focus:ring-[#0A5BA9]/20 resize-none"
                                        rows={4}
                                        placeholder="Describa las principales necesidades de capacitación..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab: Infraestructura */}
                {activeTab === "infraestructura" && (
                    <div className="space-y-6">
                        {/* Sección III: Infraestructura */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-[#0A5BA9] to-[#094580] px-6 py-4">
                                <h3 className="text-lg font-semibold text-white">
                                    III. INFRAESTRUCTURA (Ref. NTS N° 235, numeral 6.3.2)
                                </h3>
                            </div>
                            <div className="p-6 space-y-8">
                                {/* 3.1 Infraestructura Física */}
                                <div>
                                    <h4 className="text-[#0A5BA9] font-semibold mb-4">3.1 INFRAESTRUCTURA FÍSICA</h4>
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse">
                                            <thead>
                                                <tr className="bg-[#0A5BA9] text-white">
                                                    <th className="px-4 py-3 text-left font-medium">PREGUNTA <span className="text-red-300">*</span></th>
                                                    <th className="px-4 py-3 text-center font-medium w-20">SÍ</th>
                                                    <th className="px-4 py-3 text-center font-medium w-20">NO</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {[
                                                    { id: "espacioFisico", num: "3.1.1", label: "¿Cuenta con espacio físico destinado para Telesalud/Teleconsultorio?" },
                                                    { id: "privacidad", num: "3.1.2", label: "¿Los espacios garantizan privacidad del paciente?" },
                                                    { id: "escritorio", num: "3.1.3", label: "¿Cuenta con escritorio ergonómico?" },
                                                    { id: "sillas", num: "3.1.4", label: "¿Cuenta con sillas ergonómicas?" },
                                                    { id: "estantes", num: "3.1.5", label: "¿Cuenta con estantes para equipos?" },
                                                    { id: "archivero", num: "3.1.6", label: "¿Cuenta con archivero con llave?" },
                                                    { id: "iluminacion", num: "3.1.7", label: "¿Cuenta con iluminación adecuada?" },
                                                    { id: "ventilacion", num: "3.1.8", label: "¿Cuenta con ventilación adecuada?" },
                                                    { id: "aireAcondicionado", num: "3.1.9", label: "¿Cuenta con aire acondicionado?" },
                                                ].map((item, index) => (
                                                    <tr key={item.id} className={index % 2 === 0 ? "bg-blue-50" : "bg-white"}>
                                                        <td className="px-4 py-3 border-b border-gray-200">
                                                            <span className="text-[#0A5BA9] font-medium mr-2">{item.num}</span>
                                                            {item.label}
                                                        </td>
                                                        <td className="px-4 py-3 border-b border-gray-200 text-center">
                                                            <input
                                                                type="radio"
                                                                name={`infra-${item.id}`}
                                                                value="si"
                                                                checked={formData.infraestructura[item.id] === "si"}
                                                                onChange={(e) => handleInputChange("infraestructura", item.id, e.target.value)}
                                                                className="w-5 h-5 text-[#0A5BA9] cursor-pointer"
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3 border-b border-gray-200 text-center">
                                                            <input
                                                                type="radio"
                                                                name={`infra-${item.id}`}
                                                                value="no"
                                                                checked={formData.infraestructura[item.id] === "no"}
                                                                onChange={(e) => handleInputChange("infraestructura", item.id, e.target.value)}
                                                                className="w-5 h-5 text-[#0A5BA9] cursor-pointer"
                                                            />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pregunta 3.1.10 */}
                                    <div className="mt-6">
                                        <label className="block text-gray-700 mb-2">
                                            <span className="text-[#0A5BA9] font-bold mr-2">3.1.10</span>
                                            Número de ambientes/consultorios destinados a Telesalud: <span className="text-red-500">*</span>
                                        </label>
                                        <NumberSelector
                                            value={formData.infraestructura.numAmbientes || ""}
                                            onChange={(e) => handleInputChange("infraestructura", "numAmbientes", e.target.value)}
                                            min={0}
                                            max={20}
                                            className="w-full max-w-xs"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3.2 Infraestructura Tecnológica */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-[#0A5BA9] to-[#094580] px-6 py-4">
                                <h3 className="text-lg font-semibold text-white">
                                    3.2 INFRAESTRUCTURA TECNOLÓGICA
                                </h3>
                            </div>
                            <div className="p-6">
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr className="bg-[#0A5BA9] text-white">
                                                <th className="px-4 py-3 text-left font-medium">PREGUNTA <span className="text-red-300">*</span></th>
                                                <th className="px-4 py-3 text-center font-medium w-20">SÍ</th>
                                                <th className="px-4 py-3 text-center font-medium w-20">NO</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[
                                                { id: "hardware", num: "3.2.1", label: "¿Cuenta con Hardware: Dispositivos físicos como servidores, computadoras, equipos de red (routers, switches) y sistemas de almacenamiento?" },
                                                { id: "software", num: "3.2.2", label: "¿Cuenta con Software: Incluye los sistemas operativos, programas, aplicaciones y el software necesario para la gestión y ejecución de tareas?" },
                                                { id: "redes", num: "3.2.3", label: "¿Cuenta con Redes: Conjunto de sistemas de comunicación (cableado estructurado, redes inalámbricas, etc.) que permiten la interconexión entre equipos y el intercambio de información?" },
                                                { id: "almacenamiento", num: "3.2.4", label: "¿Cuenta con Almacenamiento: Sistemas y tecnologías para guardar datos y asegurar su acceso y seguridad?" },
                                                { id: "serviciosTec", num: "3.2.5", label: "¿Cuenta con Servicios: Elementos como la seguridad informática, la gestión de rendimiento y los servicios de soporte que garantizan el funcionamiento óptimo del sistema?" },
                                            ].map((item, index) => (
                                                <tr key={item.id} className={index % 2 === 0 ? "bg-blue-50" : "bg-white"}>
                                                    <td className="px-4 py-3 border-b border-gray-200">
                                                        <span className="text-[#0A5BA9] font-medium mr-2">{item.num}</span>
                                                        {item.label}
                                                    </td>
                                                    <td className="px-4 py-3 border-b border-gray-200 text-center">
                                                        <input
                                                            type="radio"
                                                            name={`infra-tec-${item.id}`}
                                                            value="si"
                                                            checked={formData.infraestructura[item.id] === "si"}
                                                            onChange={(e) => handleInputChange("infraestructura", item.id, e.target.value)}
                                                            className="w-5 h-5 text-[#0A5BA9] cursor-pointer"
                                                        />
                                                    </td>
                                                    <td className="px-4 py-3 border-b border-gray-200 text-center">
                                                        <input
                                                            type="radio"
                                                            name={`infra-tec-${item.id}`}
                                                            value="no"
                                                            checked={formData.infraestructura[item.id] === "no"}
                                                            onChange={(e) => handleInputChange("infraestructura", item.id, e.target.value)}
                                                            className="w-5 h-5 text-[#0A5BA9] cursor-pointer"
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab: Equipamiento */}
                {activeTab === "equipamiento" && (
                    <div className="space-y-6">
                        {/* 4.1 Equipamiento Informático */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-[#0A5BA9] to-[#094580] px-6 py-4">
                                <h3 className="text-lg font-semibold text-white">
                                    IV. EQUIPAMIENTO (Ref. NTS N° 235, numeral 6.3.3)
                                </h3>
                            </div>
                            <div className="p-6">
                                <h4 className="text-[#0A5BA9] font-semibold mb-4">4.1 EQUIPAMIENTO INFORMÁTICO PARA TELESALUD</h4>
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse text-sm">
                                        <thead>
                                            <tr className="bg-[#0A5BA9] text-white">
                                                <th className="px-3 py-3 text-center font-medium w-16">N°</th>
                                                <th className="px-3 py-3 text-left font-medium">EQUIPO/DISPOSITIVO</th>
                                                <th className="px-3 py-3 text-center font-medium w-28">¿DISPONIBLE? <span className="text-red-300">*</span></th>
                                                <th className="px-3 py-3 text-center font-medium w-24">CANTIDAD</th>
                                                <th className="px-3 py-3 text-center font-medium w-32">ESTADO</th>
                                                <th className="px-3 py-3 text-left font-medium w-48">OBSERVACIONES</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[
                                                "Computadora de escritorio",
                                                "Computadora portátil (laptop)",
                                                "Monitor",
                                                "Cable HDMI",
                                                "Cámara web HD (resolución mínima de 1080p)",
                                                "Micrófono",
                                                "Parlantes/audífonos",
                                                "Impresora",
                                                "Escáner",
                                                "Router/Switch de red"
                                            ].map((equipo, index) => {
                                                const fieldId = `equipInfo${index}`;
                                                const disponible = formData.equipamiento[`${fieldId}_disponible`];
                                                const isEnabled = disponible === "si";

                                                const handleDisponibleChange = (value) => {
                                                    handleInputChange("equipamiento", `${fieldId}_disponible`, value);
                                                    if (value === "si") {
                                                        // Si selecciona Sí, establecer cantidad mínima de 1
                                                        const cantidadActual = formData.equipamiento[`${fieldId}_cantidad`];
                                                        if (!cantidadActual || parseInt(cantidadActual) < 1) {
                                                            handleInputChange("equipamiento", `${fieldId}_cantidad`, "1");
                                                        }
                                                    } else {
                                                        // Si selecciona No, limpiar cantidad, estado y observaciones
                                                        handleInputChange("equipamiento", `${fieldId}_cantidad`, "");
                                                        handleInputChange("equipamiento", `${fieldId}_estado`, "");
                                                        handleInputChange("equipamiento", `${fieldId}_obs`, "");
                                                    }
                                                };

                                                return (
                                                    <tr key={index} className={disponible === "si" ? "bg-green-50" : (index % 2 === 0 ? "bg-blue-50" : "bg-white")}>
                                                        <td className="px-3 py-2 border-b border-gray-200 text-center font-medium text-[#0A5BA9]">
                                                            4.1.{index + 1}
                                                        </td>
                                                        <td className="px-3 py-2 border-b border-gray-200">{equipo}</td>
                                                        <td className="px-3 py-2 border-b border-gray-200 text-center">
                                                            <div className="flex justify-center gap-3">
                                                                <label className={`flex items-center gap-1 cursor-pointer px-2 py-1 rounded ${disponible === "si" ? "bg-green-200 text-green-800 font-medium" : ""}`}>
                                                                    <input
                                                                        type="radio"
                                                                        name={`${fieldId}_disponible`}
                                                                        value="si"
                                                                        checked={disponible === "si"}
                                                                        onChange={() => handleDisponibleChange("si")}
                                                                        className="w-4 h-4 text-green-600"
                                                                    />
                                                                    <span className="text-sm">Sí</span>
                                                                </label>
                                                                <label className={`flex items-center gap-1 cursor-pointer px-2 py-1 rounded ${disponible === "no" ? "bg-gray-200 text-gray-700 font-medium" : ""}`}>
                                                                    <input
                                                                        type="radio"
                                                                        name={`${fieldId}_disponible`}
                                                                        value="no"
                                                                        checked={disponible === "no"}
                                                                        onChange={() => handleDisponibleChange("no")}
                                                                        className="w-4 h-4 text-gray-600"
                                                                    />
                                                                    <span className="text-sm">No</span>
                                                                </label>
                                                            </div>
                                                        </td>
                                                        <td className="px-3 py-2 border-b border-gray-200 text-center">
                                                            <NumberSelector
                                                                value={formData.equipamiento[`${fieldId}_cantidad`] || ""}
                                                                onChange={(e) => handleInputChange("equipamiento", `${fieldId}_cantidad`, e.target.value)}
                                                                min={isEnabled ? 1 : 0}
                                                                max={50}
                                                                className="w-20"
                                                                disabled={!isEnabled}
                                                            />
                                                        </td>
                                                        <td className="px-3 py-2 border-b border-gray-200 text-center">
                                                            <select
                                                                value={formData.equipamiento[`${fieldId}_estado`] || ""}
                                                                onChange={(e) => handleInputChange("equipamiento", `${fieldId}_estado`, e.target.value)}
                                                                disabled={!isEnabled}
                                                                className={`w-full px-2 py-1.5 border-2 rounded text-sm ${isEnabled ? "bg-yellow-50 border-yellow-300 focus:border-[#0A5BA9]" : "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"}`}
                                                            >
                                                                <option value="">Seleccionar...</option>
                                                                <option value="bueno">Bueno</option>
                                                                <option value="regular">Regular</option>
                                                                <option value="malo">Malo</option>
                                                            </select>
                                                        </td>
                                                        <td className="px-3 py-2 border-b border-gray-200">
                                                            <input
                                                                type="text"
                                                                value={formData.equipamiento[`${fieldId}_obs`] || ""}
                                                                onChange={(e) => handleInputChange("equipamiento", `${fieldId}_obs`, e.target.value)}
                                                                disabled={!isEnabled}
                                                                className={`w-full px-2 py-1.5 border-2 rounded text-sm ${isEnabled ? "bg-yellow-50 border-yellow-300 focus:border-[#0A5BA9]" : "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"}`}
                                                                placeholder="..."
                                                            />
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* 4.2 Equipamiento Biomédico */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-[#0A5BA9] to-[#094580] px-6 py-4">
                                <h3 className="text-lg font-semibold text-white">
                                    4.2 EQUIPAMIENTO BIOMÉDICO DIGITAL
                                </h3>
                            </div>
                            <div className="p-6">
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse text-sm">
                                        <thead>
                                            <tr className="bg-[#0A5BA9] text-white">
                                                <th className="px-3 py-3 text-center font-medium w-16">N°</th>
                                                <th className="px-3 py-3 text-left font-medium">EQUIPO/DISPOSITIVO</th>
                                                <th className="px-3 py-3 text-center font-medium w-28">¿DISPONIBLE? <span className="text-red-300">*</span></th>
                                                <th className="px-3 py-3 text-center font-medium w-24">CANTIDAD</th>
                                                <th className="px-3 py-3 text-center font-medium w-32">ESTADO</th>
                                                <th className="px-3 py-3 text-left font-medium w-48">OBSERVACIONES</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[
                                                "Pulsioxímetro digital",
                                                "Dermatoscopio digital",
                                                "Ecógrafo digital",
                                                "Electrocardiógrafo digital",
                                                "Equipo de gases arteriales digital",
                                                "Estetoscopio digital",
                                                "Fonendoscopio digital",
                                                "Monitor de funciones vitales",
                                                "Otoscopio digital",
                                                "Oxímetro digital",
                                                "Retinógrafo digital",
                                                "Tensiómetro digital",
                                                "Videocolposcopio",
                                                "Estación móvil de telemedicina"
                                            ].map((equipo, index) => {
                                                const fieldId = `equipBio${index}`;
                                                const disponible = formData.equipamiento[`${fieldId}_disponible`];
                                                const isEnabled = disponible === "si";

                                                const handleDisponibleChangeBio = (value) => {
                                                    handleInputChange("equipamiento", `${fieldId}_disponible`, value);
                                                    if (value === "si") {
                                                        // Si selecciona Sí, establecer cantidad mínima de 1
                                                        const cantidadActual = formData.equipamiento[`${fieldId}_cantidad`];
                                                        if (!cantidadActual || parseInt(cantidadActual) < 1) {
                                                            handleInputChange("equipamiento", `${fieldId}_cantidad`, "1");
                                                        }
                                                    } else {
                                                        // Si selecciona No, limpiar cantidad, estado y observaciones
                                                        handleInputChange("equipamiento", `${fieldId}_cantidad`, "");
                                                        handleInputChange("equipamiento", `${fieldId}_estado`, "");
                                                        handleInputChange("equipamiento", `${fieldId}_obs`, "");
                                                    }
                                                };

                                                return (
                                                    <tr key={index} className={disponible === "si" ? "bg-green-50" : (index % 2 === 0 ? "bg-blue-50" : "bg-white")}>
                                                        <td className="px-3 py-2 border-b border-gray-200 text-center font-medium text-[#0A5BA9]">
                                                            4.2.{index + 1}
                                                        </td>
                                                        <td className="px-3 py-2 border-b border-gray-200">{equipo}</td>
                                                        <td className="px-3 py-2 border-b border-gray-200 text-center">
                                                            <div className="flex justify-center gap-3">
                                                                <label className={`flex items-center gap-1 cursor-pointer px-2 py-1 rounded ${disponible === "si" ? "bg-green-200 text-green-800 font-medium" : ""}`}>
                                                                    <input
                                                                        type="radio"
                                                                        name={`${fieldId}_disponible`}
                                                                        value="si"
                                                                        checked={disponible === "si"}
                                                                        onChange={() => handleDisponibleChangeBio("si")}
                                                                        className="w-4 h-4 text-green-600"
                                                                    />
                                                                    <span className="text-sm">Sí</span>
                                                                </label>
                                                                <label className={`flex items-center gap-1 cursor-pointer px-2 py-1 rounded ${disponible === "no" ? "bg-gray-200 text-gray-700 font-medium" : ""}`}>
                                                                    <input
                                                                        type="radio"
                                                                        name={`${fieldId}_disponible`}
                                                                        value="no"
                                                                        checked={disponible === "no"}
                                                                        onChange={() => handleDisponibleChangeBio("no")}
                                                                        className="w-4 h-4 text-gray-600"
                                                                    />
                                                                    <span className="text-sm">No</span>
                                                                </label>
                                                            </div>
                                                        </td>
                                                        <td className="px-3 py-2 border-b border-gray-200 text-center">
                                                            <NumberSelector
                                                                value={formData.equipamiento[`${fieldId}_cantidad`] || ""}
                                                                onChange={(e) => handleInputChange("equipamiento", `${fieldId}_cantidad`, e.target.value)}
                                                                min={isEnabled ? 1 : 0}
                                                                max={50}
                                                                className="w-20"
                                                                disabled={!isEnabled}
                                                            />
                                                        </td>
                                                        <td className="px-3 py-2 border-b border-gray-200 text-center">
                                                            <select
                                                                value={formData.equipamiento[`${fieldId}_estado`] || ""}
                                                                onChange={(e) => handleInputChange("equipamiento", `${fieldId}_estado`, e.target.value)}
                                                                disabled={!isEnabled}
                                                                className={`w-full px-2 py-1.5 border-2 rounded text-sm ${isEnabled ? "bg-yellow-50 border-yellow-300 focus:border-[#0A5BA9]" : "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"}`}
                                                            >
                                                                <option value="">Seleccionar...</option>
                                                                <option value="bueno">Bueno</option>
                                                                <option value="regular">Regular</option>
                                                                <option value="malo">Malo</option>
                                                            </select>
                                                        </td>
                                                        <td className="px-3 py-2 border-b border-gray-200">
                                                            <input
                                                                type="text"
                                                                value={formData.equipamiento[`${fieldId}_obs`] || ""}
                                                                onChange={(e) => handleInputChange("equipamiento", `${fieldId}_obs`, e.target.value)}
                                                                disabled={!isEnabled}
                                                                className={`w-full px-2 py-1.5 border-2 rounded text-sm ${isEnabled ? "bg-yellow-50 border-yellow-300 focus:border-[#0A5BA9]" : "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"}`}
                                                                placeholder="..."
                                                            />
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab: Conectividad */}
                {activeTab === "conectividad" && (
                    <div className="space-y-6">
                        {/* 5.1 Conectividad y Servicios */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-[#0A5BA9] to-[#094580] px-6 py-4">
                                <h3 className="text-lg font-semibold text-white">
                                    V. CONECTIVIDAD Y SISTEMAS DE INFORMACIÓN (Ref. NTS N° 235, numerales 6.3.4 y 6.3.5)
                                </h3>
                            </div>
                            <div className="p-6 space-y-6">
                                <h4 className="text-[#0A5BA9] font-semibold">5.1 CONECTIVIDAD Y SERVICIOS</h4>
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr className="bg-[#0A5BA9] text-white">
                                                <th className="px-4 py-3 text-left font-medium">PREGUNTA</th>
                                                <th className="px-4 py-3 text-center font-medium w-20">SÍ</th>
                                                <th className="px-4 py-3 text-center font-medium w-20">NO</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[
                                                { id: "internet", num: "5.1.1", label: "¿Cuenta con acceso a internet?" },
                                                { id: "estable", num: "5.1.2", label: "¿La conexión es estable y permanente?" },
                                                { id: "energiaAlt", num: "5.1.3", label: "¿Cuenta con sistema alternativo de energía eléctrica?" },
                                                { id: "puntosRed", num: "5.1.4", label: "¿Cuenta con puntos de red suficientes?" },
                                                { id: "wifi", num: "5.1.5", label: "¿Cuenta con red WiFi institucional?" },
                                            ].map((item, index) => (
                                                <tr key={item.id} className={index % 2 === 0 ? "bg-blue-50" : "bg-white"}>
                                                    <td className="px-4 py-3 border-b border-gray-200">
                                                        <span className="text-[#0A5BA9] font-medium mr-2">{item.num}</span>
                                                        {item.label}
                                                    </td>
                                                    <td className="px-4 py-3 border-b border-gray-200 text-center">
                                                        <input type="radio" name={`conect-${item.id}`} value="si"
                                                            checked={formData.conectividad[item.id] === "si"}
                                                            onChange={(e) => handleInputChange("conectividad", item.id, e.target.value)}
                                                            className="w-5 h-5 cursor-pointer" />
                                                    </td>
                                                    <td className="px-4 py-3 border-b border-gray-200 text-center">
                                                        <input type="radio" name={`conect-${item.id}`} value="no"
                                                            checked={formData.conectividad[item.id] === "no"}
                                                            onChange={(e) => handleInputChange("conectividad", item.id, e.target.value)}
                                                            className="w-5 h-5 cursor-pointer" />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Campos adicionales 5.1.6 - 5.1.10 */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <span className="text-[#0A5BA9] font-bold mr-2">5.1.6</span>Tipo de conexión a internet:
                                        </label>
                                        <select
                                            value={formData.conectividad.tipoConexion || ""}
                                            onChange={(e) => handleInputChange("conectividad", "tipoConexion", e.target.value)}
                                            className="w-full px-4 py-3 bg-yellow-50 border-2 border-yellow-300 rounded-lg focus:border-[#0A5BA9]"
                                        >
                                            <option value="">Seleccionar...</option>
                                            <option value="Fibra Óptica">Fibra Óptica</option>
                                            <option value="Cable">Cable</option>
                                            <option value="Internet Satelital">Internet Satelital</option>
                                            <option value="Internet Móvil (4G / 5G)">Internet Móvil (4G / 5G)</option>
                                            <option value="Internet Inalámbrico Fijo (WISP)">Internet Inalámbrico Fijo (WISP)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <span className="text-[#0A5BA9] font-bold mr-2">5.1.7</span>Proveedor de servicio de internet:
                                        </label>
                                        <select
                                            value={formData.conectividad.proveedorSeleccionado || ""}
                                            onChange={(e) => {
                                                handleInputChange("conectividad", "proveedorSeleccionado", e.target.value);
                                                if (e.target.value !== "Otro") {
                                                    handleInputChange("conectividad", "proveedor", e.target.value);
                                                    handleInputChange("conectividad", "proveedorOtro", "");
                                                } else {
                                                    handleInputChange("conectividad", "proveedor", "");
                                                }
                                            }}
                                            className="w-full px-4 py-3 bg-yellow-50 border-2 border-yellow-300 rounded-lg focus:border-[#0A5BA9]"
                                        >
                                            <option value="">Seleccione un proveedor...</option>
                                            <option value="Movistar">Movistar (Telefónica)</option>
                                            <option value="Claro">Claro (América Móvil)</option>
                                            <option value="Entel">Entel Perú</option>
                                            <option value="Bitel">Bitel</option>
                                            <option value="WiNet">WiNet (Win Perú)</option>
                                            <option value="Optical Networks">Optical Networks</option>
                                            <option value="Fiberlux">Fiberlux</option>
                                            <option value="GTD Perú">GTD Perú</option>
                                            <option value="Netline">Netline</option>
                                            <option value="StarGlobal">StarGlobal</option>
                                            <option value="CableMás">CableMás</option>
                                            <option value="HughesNet">HughesNet (Satelital)</option>
                                            <option value="DirectTV">DirectTV (Satelital)</option>
                                            <option value="América Móvil Perú">América Móvil Perú</option>
                                            <option value="Telecable">Telecable</option>
                                            <option value="Cable Perú">Cable Perú</option>
                                            <option value="Cableonda">Cableonda</option>
                                            <option value="Red Científica Peruana">Red Científica Peruana</option>
                                            <option value="Otro">Otro (especificar)</option>
                                        </select>
                                        {formData.conectividad.proveedorSeleccionado === "Otro" && (
                                            <input type="text"
                                                value={formData.conectividad.proveedorOtro || ""}
                                                onChange={(e) => {
                                                    handleInputChange("conectividad", "proveedorOtro", e.target.value);
                                                    handleInputChange("conectividad", "proveedor", e.target.value);
                                                }}
                                                className="w-full mt-2 px-4 py-3 bg-yellow-50 border-2 border-yellow-300 rounded-lg focus:border-[#0A5BA9]"
                                                placeholder="Ingrese el nombre del proveedor..." />
                                        )}
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <span className="text-[#0A5BA9] font-bold mr-2">5.1.8</span>Velocidad contratada (Mbps):
                                        </label>
                                        <NumberSelector
                                            value={formData.conectividad.velocidadContratada || ""}
                                            onChange={(e) => handleInputChange("conectividad", "velocidadContratada", e.target.value)}
                                            min={0}
                                            max={1000}
                                            className="w-full"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <span className="text-[#0A5BA9] font-bold mr-2">5.1.9</span>Velocidad real promedio (Mbps):
                                        </label>
                                        <NumberSelector
                                            value={formData.conectividad.velocidadReal || ""}
                                            onChange={(e) => handleInputChange("conectividad", "velocidadReal", e.target.value)}
                                            min={0}
                                            max={1000}
                                            className="w-full"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <span className="text-[#0A5BA9] font-bold mr-2">5.1.10</span>N° de puntos de red:
                                        </label>
                                        <NumberSelector
                                            value={formData.conectividad.numPuntosRed || ""}
                                            onChange={(e) => handleInputChange("conectividad", "numPuntosRed", e.target.value)}
                                            min={0}
                                            max={100}
                                            className="w-full"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 5.2 Sistemas de Información */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-[#0A5BA9] to-[#094580] px-6 py-4">
                                <h3 className="text-lg font-semibold text-white">5.2 SISTEMAS DE INFORMACIÓN</h3>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr className="bg-[#0A5BA9] text-white">
                                                <th className="px-4 py-3 text-left font-medium">PREGUNTA</th>
                                                <th className="px-4 py-3 text-center font-medium w-20">SÍ</th>
                                                <th className="px-4 py-3 text-center font-medium w-20">NO</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[
                                                { id: "essi", num: "5.2.1", label: "¿Cuenta con ESSI, que permita el registro, la trazabilidad, continuidad y legalidad de las atenciones por Telesalud?" },
                                                { id: "pacs", num: "5.2.2", label: "¿Cuenta con PACS, autorizado por la institución, que permita el registro, la trazabilidad, continuidad y legalidad de las atenciones por Telesalud?" },
                                                { id: "anatpat", num: "5.2.3", label: "¿Cuenta con ANATPAT autorizado por la institución?" },
                                                { id: "videoconferencia", num: "5.2.4", label: "¿Cuenta con sistema de videoconferencia?" },
                                                { id: "citasLinea", num: "5.2.5", label: "¿Cuenta con sistema de citas en línea?" },
                                            ].map((item, index) => (
                                                <tr key={item.id} className={index % 2 === 0 ? "bg-blue-50" : "bg-white"}>
                                                    <td className="px-4 py-3 border-b border-gray-200">
                                                        <span className="text-[#0A5BA9] font-medium mr-2">{item.num}</span>
                                                        {item.label}
                                                    </td>
                                                    <td className="px-4 py-3 border-b border-gray-200 text-center">
                                                        <input type="radio" name={`sist-${item.id}`} value="si"
                                                            checked={formData.conectividad[item.id] === "si"}
                                                            onChange={(e) => handleInputChange("conectividad", item.id, e.target.value)}
                                                            className="w-5 h-5 cursor-pointer" />
                                                    </td>
                                                    <td className="px-4 py-3 border-b border-gray-200 text-center">
                                                        <input type="radio" name={`sist-${item.id}`} value="no"
                                                            checked={formData.conectividad[item.id] === "no"}
                                                            onChange={(e) => handleInputChange("conectividad", item.id, e.target.value)}
                                                            className="w-5 h-5 cursor-pointer" />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <span className="text-[#0A5BA9] font-bold mr-2">5.2.6</span>¿Cuenta con otro sistema interoperable autorizado?
                                    </label>
                                    <input type="text"
                                        value={formData.conectividad.otroSistema || ""}
                                        onChange={(e) => handleInputChange("conectividad", "otroSistema", e.target.value)}
                                        className="w-full px-4 py-3 bg-yellow-50 border-2 border-yellow-300 rounded-lg focus:border-[#0A5BA9]"
                                        placeholder="Especifique..." />
                                </div>
                            </div>
                        </div>

                        {/* 5.3 Seguridad de la Información */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-[#0A5BA9] to-[#094580] px-6 py-4">
                                <h3 className="text-lg font-semibold text-white">5.3 SEGURIDAD DE LA INFORMACIÓN Y PROTECCIÓN DE DATOS</h3>
                            </div>
                            <div className="p-6">
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr className="bg-[#0A5BA9] text-white">
                                                <th className="px-4 py-3 text-left font-medium">PREGUNTA</th>
                                                <th className="px-4 py-3 text-center font-medium w-20">SÍ</th>
                                                <th className="px-4 py-3 text-center font-medium w-20">NO</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[
                                                { id: "confidencialidad", num: "5.3.1", label: "¿Cuenta con mecanismos de confidencialidad de la información?" },
                                                { id: "integridad", num: "5.3.2", label: "¿Cuenta con mecanismos de integridad de la información?" },
                                                { id: "disponibilidad", num: "5.3.3", label: "¿Cuenta con mecanismos de disponibilidad de la información?" },
                                                { id: "contingencia", num: "5.3.4", label: "¿Implementa planes de contingencia para pérdida de datos?" },
                                                { id: "backup", num: "5.3.5", label: "¿Cuenta con respaldo (backup) de información?" },
                                                { id: "consentimiento", num: "5.3.6", label: "¿Cuenta con formato de Consentimiento Informado para Telemedicina?" },
                                                { id: "ley29733", num: "5.3.7", label: "¿Cumple con la Ley N° 29733 de Protección de Datos Personales?" },
                                            ].map((item, index) => (
                                                <tr key={item.id} className={index % 2 === 0 ? "bg-blue-50" : "bg-white"}>
                                                    <td className="px-4 py-3 border-b border-gray-200">
                                                        <span className="text-[#0A5BA9] font-medium mr-2">{item.num}</span>
                                                        {item.label}
                                                    </td>
                                                    <td className="px-4 py-3 border-b border-gray-200 text-center">
                                                        <input type="radio" name={`seg-${item.id}`} value="si"
                                                            checked={formData.conectividad[item.id] === "si"}
                                                            onChange={(e) => handleInputChange("conectividad", item.id, e.target.value)}
                                                            className="w-5 h-5 cursor-pointer" />
                                                    </td>
                                                    <td className="px-4 py-3 border-b border-gray-200 text-center">
                                                        <input type="radio" name={`seg-${item.id}`} value="no"
                                                            checked={formData.conectividad[item.id] === "no"}
                                                            onChange={(e) => handleInputChange("conectividad", item.id, e.target.value)}
                                                            className="w-5 h-5 cursor-pointer" />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab: Servicios */}
                {activeTab === "servicios" && (
                    <div className="space-y-6">
                        {/* 6.1 Servicios de Telesalud Implementados */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-[#0A5BA9] to-[#094580] px-6 py-4">
                                <h3 className="text-lg font-semibold text-white">
                                    VI. SERVICIOS DE TELESALUD ACTUALES (Ref. NTS N° 235, numeral 6.1)
                                </h3>
                            </div>
                            <div className="p-6">
                                <h4 className="text-[#0A5BA9] font-semibold mb-2">6.1 SERVICIOS DE TELESALUD IMPLEMENTADOS</h4>
                                <p className="text-gray-700 font-medium mb-4">¿Incorporó los siguientes servicios en su IPRESS?</p>

                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse text-sm">
                                        <thead>
                                            <tr className="bg-[#0A5BA9] text-white">
                                                <th className="px-3 py-3 text-center font-medium w-20">N°</th>
                                                <th className="px-3 py-3 text-left font-medium">SERVICIO DE TELESALUD</th>
                                                <th className="px-3 py-3 text-center font-medium w-28">SÍ/NO <span className="text-red-300">*</span></th>
                                                <th className="px-3 py-3 text-left font-medium w-48">OBSERVACIONES</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[
                                                { id: "incorporoServicios", num: "6.1.1", label: "¿Incorporó oficialmente los servicios de Telesalud en la cartera de servicios registrada en el RENIPRESS, a fin de asegurar su reconocimiento formal, acciones de auditoría, supervisión y monitoreo?" },
                                                { id: "teleconsulta", num: "6.1.2", label: "Teleconsulta" },
                                                { id: "teleorientacion", num: "6.1.3", label: "Teleorientación" },
                                                { id: "telemonitoreo", num: "6.1.4", label: "Telemonitoreo" },
                                                { id: "teleinterconsulta", num: "6.1.5", label: "Teleinterconsulta" },
                                                { id: "teleurgencia", num: "6.1.6", label: "Teleurgencia" },
                                                { id: "teletriaje", num: "6.1.7", label: "Teletriaje" },
                                                { id: "telerradiografia", num: "6.1.8", label: "Telerradiografía" },
                                                { id: "telemamografia", num: "6.1.9", label: "Telemamografía" },
                                                { id: "teletomografia", num: "6.1.10", label: "Teletomografía" },
                                                { id: "telecapacitacion", num: "6.1.11", label: "Telecapacitación" },
                                                { id: "teleiec", num: "6.1.12", label: "TeleIEC (Información, Educación, Comunicación)" },
                                            ].map((item, index) => {
                                                const valor = formData.servicios[item.id];
                                                const isEnabled = valor === "si";
                                                return (
                                                    <tr key={item.id} className={valor === "si" ? "bg-green-50" : (index % 2 === 0 ? "bg-blue-50" : "bg-white")}>
                                                        <td className="px-3 py-3 border-b border-gray-200 text-center font-medium text-[#0A5BA9]">
                                                            {item.num}
                                                        </td>
                                                        <td className="px-3 py-3 border-b border-gray-200">{item.label}</td>
                                                        <td className="px-3 py-3 border-b border-gray-200 text-center">
                                                            <div className="flex justify-center gap-3">
                                                                <label className={`flex items-center gap-1 cursor-pointer px-2 py-1 rounded ${valor === "si" ? "bg-green-200 text-green-800 font-medium" : ""}`}>
                                                                    <input
                                                                        type="radio"
                                                                        name={`servicio_${item.id}`}
                                                                        value="si"
                                                                        checked={valor === "si"}
                                                                        onChange={(e) => handleInputChange("servicios", item.id, e.target.value)}
                                                                        className="w-4 h-4 text-green-600"
                                                                    />
                                                                    <span className="text-sm">Sí</span>
                                                                </label>
                                                                <label className={`flex items-center gap-1 cursor-pointer px-2 py-1 rounded ${valor === "no" ? "bg-gray-200 text-gray-700 font-medium" : ""}`}>
                                                                    <input
                                                                        type="radio"
                                                                        name={`servicio_${item.id}`}
                                                                        value="no"
                                                                        checked={valor === "no"}
                                                                        onChange={(e) => handleInputChange("servicios", item.id, e.target.value)}
                                                                        className="w-4 h-4 text-gray-600"
                                                                    />
                                                                    <span className="text-sm">No</span>
                                                                </label>
                                                            </div>
                                                        </td>
                                                        <td className="px-3 py-3 border-b border-gray-200">
                                                            <input
                                                                type="text"
                                                                value={formData.servicios[`${item.id}_obs`] || ""}
                                                                onChange={(e) => handleInputChange("servicios", `${item.id}_obs`, e.target.value)}
                                                                disabled={!isEnabled}
                                                                className={`w-full px-2 py-1.5 border-2 rounded text-sm ${isEnabled ? "bg-yellow-50 border-yellow-300 focus:border-[#0A5BA9]" : "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"}`}
                                                                placeholder="..."
                                                            />
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                    </div>
                )}

                {/* Tab: Necesidades */}
                {activeTab === "necesidades" && (
                    <div className="space-y-6">
                        {/* Header */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-[#0A5BA9] to-[#094580] px-6 py-4">
                                <h3 className="text-lg font-semibold text-white">
                                    VII. NECESIDADES Y REQUERIMIENTOS PARA IMPLEMENTACIÓN DE TELESALUD
                                </h3>
                            </div>
                        </div>

                        {/* 7.1 Necesidades de Infraestructura Física */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-[#0A5BA9] to-[#094580] px-6 py-4">
                                <h3 className="text-lg font-semibold text-white">7.1 NECESIDADES DE INFRAESTRUCTURA FÍSICA PARA TELESALUD</h3>
                            </div>
                            <div className="p-6">
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse text-sm">
                                        <thead>
                                            <tr className="bg-[#0A5BA9] text-white">
                                                <th className="px-3 py-3 text-center font-medium w-20">N°</th>
                                                <th className="px-3 py-3 text-left font-medium">DESCRIPCIÓN DEL REQUERIMIENTO</th>
                                                <th className="px-3 py-3 text-center font-medium w-36">PRIORIDAD (Alta/Media/Baja)</th>
                                                <th className="px-3 py-3 text-center font-medium w-32">CANTIDAD REQUERIDA</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[
                                                { id: "espacioFisico", num: "7.1.1", label: "Espacio físico destinado para Teleconsultorio" },
                                                { id: "escritorio", num: "7.1.2", label: "Escritorio ergonómico" },
                                                { id: "sillas", num: "7.1.3", label: "Sillas ergonómicas" },
                                                { id: "estantes", num: "7.1.4", label: "Estantes para equipos" },
                                                { id: "archivero", num: "7.1.5", label: "Archivero con llave" },
                                                { id: "luzElectrica", num: "7.1.6", label: "Instalación de luz eléctrica (puntos de instalación)" },
                                                { id: "ventilacion", num: "7.1.7", label: "Sistema de ventilación" },
                                                { id: "aireAcond", num: "7.1.8", label: "Aire acondicionado" },
                                            ].map((item, index) => (
                                                <tr key={item.id} className={index % 2 === 0 ? "bg-blue-50" : "bg-white"}>
                                                    <td className="px-3 py-3 border-b border-gray-200 text-center font-medium text-[#0A5BA9]">{item.num}</td>
                                                    <td className="px-3 py-3 border-b border-gray-200">{item.label}</td>
                                                    <td className="px-3 py-3 border-b border-gray-200 text-center">
                                                        <select
                                                            value={formData.necesidades[`infra_${item.id}_prior`] || ""}
                                                            onChange={(e) => handleInputChange("necesidades", `infra_${item.id}_prior`, e.target.value)}
                                                            className="w-full px-2 py-1.5 bg-yellow-50 border-2 border-yellow-300 rounded text-sm focus:border-[#0A5BA9]"
                                                        >
                                                            <option value="">Seleccionar...</option>
                                                            <option value="alta">Alta</option>
                                                            <option value="media">Media</option>
                                                            <option value="baja">Baja</option>
                                                        </select>
                                                    </td>
                                                    <td className="px-3 py-3 border-b border-gray-200 text-center">
                                                        <NumberSelector
                                                            value={formData.necesidades[`infra_${item.id}_cant`] || ""}
                                                            onChange={(e) => handleInputChange("necesidades", `infra_${item.id}_cant`, e.target.value)}
                                                            min={0}
                                                            max={20}
                                                            className="w-24"
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pregunta adicional - Infraestructura física suficiente */}
                                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="flex flex-wrap items-center gap-4 mb-2">
                                        <span className="text-gray-700">¿La infraestructura física es suficiente?</span>
                                        <div className="flex items-center gap-4">
                                            <label className="flex items-center gap-1 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="necInfraFisicaSuficiente"
                                                    value="si"
                                                    checked={formData.necesidades.infraFisicaSuficiente === "si"}
                                                    onChange={(e) => handleInputChange("necesidades", "infraFisicaSuficiente", e.target.value)}
                                                    className="w-4 h-4 text-[#0A5BA9]"
                                                />
                                                <span>Sí</span>
                                            </label>
                                            <label className="flex items-center gap-1 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="necInfraFisicaSuficiente"
                                                    value="no"
                                                    checked={formData.necesidades.infraFisicaSuficiente === "no"}
                                                    onChange={(e) => handleInputChange("necesidades", "infraFisicaSuficiente", e.target.value)}
                                                    className="w-4 h-4 text-[#0A5BA9]"
                                                />
                                                <span>No</span>
                                            </label>
                                            <label className="flex items-center gap-1 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="necInfraFisicaSuficiente"
                                                    value="parcial"
                                                    checked={formData.necesidades.infraFisicaSuficiente === "parcial"}
                                                    onChange={(e) => handleInputChange("necesidades", "infraFisicaSuficiente", e.target.value)}
                                                    className="w-4 h-4 text-[#0A5BA9]"
                                                />
                                                <span>Parcial</span>
                                            </label>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 text-sm mb-1">Observaciones:</label>
                                        <input
                                            type="text"
                                            value={formData.necesidades.infraFisicaObservaciones || ""}
                                            onChange={(e) => handleInputChange("necesidades", "infraFisicaObservaciones", e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#0A5BA9] focus:ring-1 focus:ring-[#0A5BA9]"
                                            placeholder=""
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 7.2 Infraestructura Tecnológica */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-[#0A5BA9] to-[#094580] px-6 py-4">
                                <h3 className="text-lg font-semibold text-white">7.2 INFRAESTRUCTURA TECNOLÓGICA</h3>
                            </div>
                            <div className="p-6">
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse text-sm">
                                        <thead>
                                            <tr className="bg-[#0A5BA9] text-white">
                                                <th className="px-3 py-3 text-center font-medium w-20">N°</th>
                                                <th className="px-3 py-3 text-left font-medium">DESCRIPCIÓN DEL REQUERIMIENTO</th>
                                                <th className="px-3 py-3 text-center font-medium w-36">PRIORIDAD (Alta/Media/Baja)</th>
                                                <th className="px-3 py-3 text-center font-medium w-32">CANTIDAD REQUERIDA</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[
                                                { id: "equipoComputo", num: "7.2.1", label: "Equipo de Computo" },
                                                { id: "equiposRed", num: "7.2.2", label: "Equipos de red (routers, switches)" },
                                                { id: "softwareAtencion", num: "7.2.3", label: "Software necesario para la gestión y ejecución de la teleconsulta" },
                                                { id: "aplicacionesMonitoreo", num: "7.2.4", label: "Aplicaciones para el seguimiento y monitoreo de los servicios" },
                                                { id: "serviciosSoporte", num: "7.2.5", label: "Servicios de soporte que garantizan el funcionamiento" },
                                            ].map((item, index) => (
                                                <tr key={item.id} className={index % 2 === 0 ? "bg-blue-50" : "bg-white"}>
                                                    <td className="px-3 py-3 border-b border-gray-200 text-center font-medium text-[#0A5BA9]">{item.num}</td>
                                                    <td className="px-3 py-3 border-b border-gray-200">{item.label}</td>
                                                    <td className="px-3 py-3 border-b border-gray-200 text-center">
                                                        <select
                                                            value={formData.necesidades[`infraTec_${item.id}_prior`] || ""}
                                                            onChange={(e) => handleInputChange("necesidades", `infraTec_${item.id}_prior`, e.target.value)}
                                                            className="w-full px-2 py-1.5 bg-yellow-50 border-2 border-yellow-300 rounded text-sm focus:border-[#0A5BA9]"
                                                        >
                                                            <option value="">Seleccionar...</option>
                                                            <option value="alta">Alta</option>
                                                            <option value="media">Media</option>
                                                            <option value="baja">Baja</option>
                                                        </select>
                                                    </td>
                                                    <td className="px-3 py-3 border-b border-gray-200 text-center">
                                                        <NumberSelector
                                                            value={formData.necesidades[`infraTec_${item.id}_cant`] || ""}
                                                            onChange={(e) => handleInputChange("necesidades", `infraTec_${item.id}_cant`, e.target.value)}
                                                            min={0}
                                                            max={20}
                                                            className="w-24"
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pregunta adicional - Infraestructura tecnológica adecuada */}
                                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="flex flex-wrap items-center gap-4">
                                        <span className="text-gray-700">¿La infraestructura tecnológica es adecuada?</span>
                                        <div className="flex items-center gap-4">
                                            <label className="flex items-center gap-1 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="necInfraTecAdecuada"
                                                    value="si"
                                                    checked={formData.necesidades.infraTecAdecuada === "si"}
                                                    onChange={(e) => handleInputChange("necesidades", "infraTecAdecuada", e.target.value)}
                                                    className="w-4 h-4 text-[#0A5BA9]"
                                                />
                                                <span>Sí</span>
                                            </label>
                                            <label className="flex items-center gap-1 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="necInfraTecAdecuada"
                                                    value="no"
                                                    checked={formData.necesidades.infraTecAdecuada === "no"}
                                                    onChange={(e) => handleInputChange("necesidades", "infraTecAdecuada", e.target.value)}
                                                    className="w-4 h-4 text-[#0A5BA9]"
                                                />
                                                <span>No</span>
                                            </label>
                                            <label className="flex items-center gap-1 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="necInfraTecAdecuada"
                                                    value="parcial"
                                                    checked={formData.necesidades.infraTecAdecuada === "parcial"}
                                                    onChange={(e) => handleInputChange("necesidades", "infraTecAdecuada", e.target.value)}
                                                    className="w-4 h-4 text-[#0A5BA9]"
                                                />
                                                <span>Parcial</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 7.3 Necesidades de Equipamiento Informático */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-[#0A5BA9] to-[#094580] px-6 py-4">
                                <h3 className="text-lg font-semibold text-white">7.3 NECESIDADES DE EQUIPAMIENTO INFORMÁTICO</h3>
                            </div>
                            <div className="p-6">
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse text-sm">
                                        <thead>
                                            <tr className="bg-[#0A5BA9] text-white">
                                                <th className="px-3 py-3 text-center font-medium w-20">N°</th>
                                                <th className="px-3 py-3 text-left font-medium">DESCRIPCIÓN DEL REQUERIMIENTO</th>
                                                <th className="px-3 py-3 text-center font-medium w-36">PRIORIDAD</th>
                                                <th className="px-3 py-3 text-center font-medium w-32">CANTIDAD REQUERIDA</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[
                                                { id: "computadora", num: "7.3.1", label: "Computadora de escritorio" },
                                                { id: "laptop", num: "7.3.2", label: "Computadora portátil (laptop)" },
                                                { id: "monitor", num: "7.3.3", label: "Monitor" },
                                                { id: "cableHdmi", num: "7.3.4", label: "Cable HDMI" },
                                                { id: "camaraWeb", num: "7.3.5", label: "Cámara web HD (resolución mínima 1080p)" },
                                                { id: "microfono", num: "7.3.6", label: "Micrófono" },
                                                { id: "parlantes", num: "7.3.7", label: "Parlantes/Audífonos" },
                                                { id: "impresora", num: "7.3.8", label: "Impresora" },
                                                { id: "escaner", num: "7.3.9", label: "Escáner" },
                                                { id: "router", num: "7.3.10", label: "Router/Switch de red" },
                                            ].map((item, index) => (
                                                <tr key={item.id} className={index % 2 === 0 ? "bg-blue-50" : "bg-white"}>
                                                    <td className="px-3 py-3 border-b border-gray-200 text-center font-medium text-[#0A5BA9]">{item.num}</td>
                                                    <td className="px-3 py-3 border-b border-gray-200">{item.label}</td>
                                                    <td className="px-3 py-3 border-b border-gray-200 text-center">
                                                        <select
                                                            value={formData.necesidades[`equip_${item.id}_prior`] || ""}
                                                            onChange={(e) => handleInputChange("necesidades", `equip_${item.id}_prior`, e.target.value)}
                                                            className="w-full px-2 py-1.5 bg-yellow-50 border-2 border-yellow-300 rounded text-sm focus:border-[#0A5BA9]"
                                                        >
                                                            <option value="">Seleccionar...</option>
                                                            <option value="alta">Alta</option>
                                                            <option value="media">Media</option>
                                                            <option value="baja">Baja</option>
                                                        </select>
                                                    </td>
                                                    <td className="px-3 py-3 border-b border-gray-200 text-center">
                                                        <NumberSelector
                                                            value={formData.necesidades[`equip_${item.id}_cant`] || ""}
                                                            onChange={(e) => handleInputChange("necesidades", `equip_${item.id}_cant`, e.target.value)}
                                                            min={0}
                                                            max={20}
                                                            className="w-24"
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pregunta adicional - Equipamiento informático adecuado */}
                                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="flex flex-wrap items-center gap-4">
                                        <span className="text-gray-700">¿El equipamiento informático es adecuado?</span>
                                        <div className="flex items-center gap-4">
                                            <label className="flex items-center gap-1 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="necEquipInfoAdecuado"
                                                    value="si"
                                                    checked={formData.necesidades.equipInfoAdecuado === "si"}
                                                    onChange={(e) => handleInputChange("necesidades", "equipInfoAdecuado", e.target.value)}
                                                    className="w-4 h-4 text-[#0A5BA9]"
                                                />
                                                <span>Sí</span>
                                            </label>
                                            <label className="flex items-center gap-1 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="necEquipInfoAdecuado"
                                                    value="no"
                                                    checked={formData.necesidades.equipInfoAdecuado === "no"}
                                                    onChange={(e) => handleInputChange("necesidades", "equipInfoAdecuado", e.target.value)}
                                                    className="w-4 h-4 text-[#0A5BA9]"
                                                />
                                                <span>No</span>
                                            </label>
                                            <label className="flex items-center gap-1 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="necEquipInfoAdecuado"
                                                    value="parcial"
                                                    checked={formData.necesidades.equipInfoAdecuado === "parcial"}
                                                    onChange={(e) => handleInputChange("necesidades", "equipInfoAdecuado", e.target.value)}
                                                    className="w-4 h-4 text-[#0A5BA9]"
                                                />
                                                <span>Parcial</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 7.4 Necesidades de Equipamiento Biomédico */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-[#0A5BA9] to-[#094580] px-6 py-4">
                                <h3 className="text-lg font-semibold text-white">7.4 EQUIPAMIENTO BIOMÉDICO DIGITAL</h3>
                            </div>
                            <div className="p-6">
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse text-sm">
                                        <thead>
                                            <tr className="bg-[#0A5BA9] text-white">
                                                <th className="px-3 py-3 text-center font-medium w-20">N°</th>
                                                <th className="px-3 py-3 text-left font-medium">DESCRIPCIÓN DEL REQUERIMIENTO</th>
                                                <th className="px-3 py-3 text-center font-medium w-36">PRIORIDAD</th>
                                                <th className="px-3 py-3 text-center font-medium w-32">CANTIDAD REQUERIDA</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[
                                                { id: "pulsioximetro", num: "7.4.1", label: "Pulsioxímetro digital" },
                                                { id: "dermatoscopio", num: "7.4.2", label: "Dermatoscopio digital" },
                                                { id: "ecografo", num: "7.4.3", label: "Ecógrafo digital" },
                                                { id: "electrocardiografo", num: "7.4.4", label: "Electrocardiógrafo digital" },
                                                { id: "gasesArteriales", num: "7.4.5", label: "Equipo de gases arteriales digital" },
                                                { id: "estetoscopio", num: "7.4.6", label: "Estetoscopio digital" },
                                                { id: "fonendoscopio", num: "7.4.7", label: "Fonendoscopio digital" },
                                                { id: "monitorVitales", num: "7.4.8", label: "Monitor de funciones vitales" },
                                                { id: "otoscopio", num: "7.4.9", label: "Otoscopio digital" },
                                                { id: "oximetro", num: "7.4.10", label: "Oxímetro digital" },
                                                { id: "retinografo", num: "7.4.11", label: "Retinógrafo digital" },
                                                { id: "tensiometro", num: "7.4.12", label: "Tensiómetro digital" },
                                                { id: "videocolposcopio", num: "7.4.13", label: "Videocolposcopio" },
                                                { id: "estacionMovil", num: "7.4.14", label: "Estación móvil de telemedicina" },
                                            ].map((item, index) => (
                                                <tr key={item.id} className={index % 2 === 0 ? "bg-blue-50" : "bg-white"}>
                                                    <td className="px-3 py-3 border-b border-gray-200 text-center font-medium text-[#0A5BA9]">{item.num}</td>
                                                    <td className="px-3 py-3 border-b border-gray-200">{item.label}</td>
                                                    <td className="px-3 py-3 border-b border-gray-200 text-center">
                                                        <select
                                                            value={formData.necesidades[`bio_${item.id}_prior`] || ""}
                                                            onChange={(e) => handleInputChange("necesidades", `bio_${item.id}_prior`, e.target.value)}
                                                            className="w-full px-2 py-1.5 bg-yellow-50 border-2 border-yellow-300 rounded text-sm focus:border-[#0A5BA9]"
                                                        >
                                                            <option value="">Seleccionar...</option>
                                                            <option value="alta">Alta</option>
                                                            <option value="media">Media</option>
                                                            <option value="baja">Baja</option>
                                                        </select>
                                                    </td>
                                                    <td className="px-3 py-3 border-b border-gray-200 text-center">
                                                        <NumberSelector
                                                            value={formData.necesidades[`bio_${item.id}_cant`] || ""}
                                                            onChange={(e) => handleInputChange("necesidades", `bio_${item.id}_cant`, e.target.value)}
                                                            min={0}
                                                            max={20}
                                                            className="w-24"
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pregunta adicional - Equipamiento biomédico adecuado */}
                                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="flex flex-wrap items-center gap-4">
                                        <span className="text-gray-700">¿El equipamiento biomédico es adecuado?</span>
                                        <div className="flex items-center gap-4">
                                            <label className="flex items-center gap-1 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="necEquipBioAdecuado"
                                                    value="si"
                                                    checked={formData.necesidades.equipBioAdecuado === "si"}
                                                    onChange={(e) => handleInputChange("necesidades", "equipBioAdecuado", e.target.value)}
                                                    className="w-4 h-4 text-[#0A5BA9]"
                                                />
                                                <span>Sí</span>
                                            </label>
                                            <label className="flex items-center gap-1 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="necEquipBioAdecuado"
                                                    value="no"
                                                    checked={formData.necesidades.equipBioAdecuado === "no"}
                                                    onChange={(e) => handleInputChange("necesidades", "equipBioAdecuado", e.target.value)}
                                                    className="w-4 h-4 text-[#0A5BA9]"
                                                />
                                                <span>No</span>
                                            </label>
                                            <label className="flex items-center gap-1 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="necEquipBioAdecuado"
                                                    value="parcial"
                                                    checked={formData.necesidades.equipBioAdecuado === "parcial"}
                                                    onChange={(e) => handleInputChange("necesidades", "equipBioAdecuado", e.target.value)}
                                                    className="w-4 h-4 text-[#0A5BA9]"
                                                />
                                                <span>Parcial</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 7.5 Conectividad */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-[#0A5BA9] to-[#094580] px-6 py-4">
                                <h3 className="text-lg font-semibold text-white">7.5 CONECTIVIDAD</h3>
                            </div>
                            <div className="p-6">
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse text-sm">
                                        <thead>
                                            <tr className="bg-[#0A5BA9] text-white">
                                                <th className="px-3 py-3 text-center font-medium w-20">N°</th>
                                                <th className="px-3 py-3 text-left font-medium">DESCRIPCIÓN DEL REQUERIMIENTO</th>
                                                <th className="px-3 py-3 text-center font-medium w-36">PRIORIDAD</th>
                                                <th className="px-3 py-3 text-center font-medium w-32">CANTIDAD REQUERIDA</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[
                                                { id: "instalacionInternet", num: "7.5.1", label: "Instalación de internet" },
                                                { id: "puntosRed", num: "7.5.2", label: "Puntos de red" },
                                                { id: "modemWifi", num: "7.5.3", label: "Módem WiFi" },
                                                { id: "internetSatelital", num: "7.5.4", label: "Internet satelital" },
                                            ].map((item, index) => (
                                                <tr key={item.id} className={index % 2 === 0 ? "bg-blue-50" : "bg-white"}>
                                                    <td className="px-3 py-3 border-b border-gray-200 text-center font-medium text-[#0A5BA9]">{item.num}</td>
                                                    <td className="px-3 py-3 border-b border-gray-200">{item.label}</td>
                                                    <td className="px-3 py-3 border-b border-gray-200 text-center">
                                                        <select
                                                            value={formData.necesidades[`conect_${item.id}_prior`] || ""}
                                                            onChange={(e) => handleInputChange("necesidades", `conect_${item.id}_prior`, e.target.value)}
                                                            className="w-full px-2 py-1.5 bg-yellow-50 border-2 border-yellow-300 rounded text-sm focus:border-[#0A5BA9]"
                                                        >
                                                            <option value="">Seleccionar...</option>
                                                            <option value="alta">Alta</option>
                                                            <option value="media">Media</option>
                                                            <option value="baja">Baja</option>
                                                        </select>
                                                    </td>
                                                    <td className="px-3 py-3 border-b border-gray-200 text-center">
                                                        <NumberSelector
                                                            value={formData.necesidades[`conect_${item.id}_cant`] || ""}
                                                            onChange={(e) => handleInputChange("necesidades", `conect_${item.id}_cant`, e.target.value)}
                                                            min={0}
                                                            max={20}
                                                            className="w-24"
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* 7.6 Recursos Humanos */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-[#0A5BA9] to-[#094580] px-6 py-4">
                                <h3 className="text-lg font-semibold text-white">7.6 RECURSOS HUMANOS</h3>
                            </div>
                            <div className="p-6">
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse text-sm">
                                        <thead>
                                            <tr className="bg-[#0A5BA9] text-white">
                                                <th className="px-3 py-3 text-center font-medium w-20">N°</th>
                                                <th className="px-3 py-3 text-left font-medium">ROL</th>
                                                <th className="px-3 py-3 text-center font-medium w-36">PRIORIDAD</th>
                                                <th className="px-3 py-3 text-center font-medium w-32">CANTIDAD REQUERIDA</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[
                                                { id: "medicosEspecialistas", num: "7.6.1", label: "Médicos especialistas" },
                                                { id: "medicosGenerales", num: "7.6.2", label: "Médicos generales" },
                                                { id: "enfermeras", num: "7.6.3", label: "Enfermeras(os)" },
                                                { id: "obstetras", num: "7.6.4", label: "Obstetras" },
                                                { id: "tecnologosMedicos", num: "7.6.5", label: "Tecnólogos médicos" },
                                                { id: "psicologos", num: "7.6.6", label: "Psicólogos" },
                                                { id: "nutricionistas", num: "7.6.7", label: "Nutricionistas" },
                                                { id: "trabajadoresSociales", num: "7.6.8", label: "Trabajadores sociales" },
                                                { id: "otrosProfesionales", num: "7.6.9", label: "Otros profesionales de salud" },
                                                { id: "personalTecnico", num: "7.6.10", label: "Personal técnico de salud" },
                                                { id: "personalTic", num: "7.6.11", label: "Personal de soporte TIC" },
                                                { id: "personalAdmin", num: "7.6.12", label: "Personal administrativo" },
                                            ].map((item, index) => (
                                                <tr key={item.id} className={index % 2 === 0 ? "bg-blue-50" : "bg-white"}>
                                                    <td className="px-3 py-3 border-b border-gray-200 text-center font-medium text-[#0A5BA9]">{item.num}</td>
                                                    <td className="px-3 py-3 border-b border-gray-200">{item.label}</td>
                                                    <td className="px-3 py-3 border-b border-gray-200 text-center">
                                                        <select
                                                            value={formData.necesidades[`rrhh_${item.id}_prior`] || ""}
                                                            onChange={(e) => handleInputChange("necesidades", `rrhh_${item.id}_prior`, e.target.value)}
                                                            className="w-full px-2 py-1.5 bg-yellow-50 border-2 border-yellow-300 rounded text-sm focus:border-[#0A5BA9]"
                                                        >
                                                            <option value="">Seleccionar...</option>
                                                            <option value="alta">Alta</option>
                                                            <option value="media">Media</option>
                                                            <option value="baja">Baja</option>
                                                        </select>
                                                    </td>
                                                    <td className="px-3 py-3 border-b border-gray-200 text-center">
                                                        <NumberSelector
                                                            value={formData.necesidades[`rrhh_${item.id}_cant`] || ""}
                                                            onChange={(e) => handleInputChange("necesidades", `rrhh_${item.id}_cant`, e.target.value)}
                                                            min={0}
                                                            max={50}
                                                            className="w-24"
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* 7.7 Capacitación para Telesalud */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-[#0A5BA9] to-[#094580] px-6 py-4">
                                <h3 className="text-lg font-semibold text-white">7.7 CAPACITACIÓN PARA TELESALUD</h3>
                            </div>
                            <div className="p-6">
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse text-sm">
                                        <thead>
                                            <tr className="bg-[#0A5BA9] text-white">
                                                <th className="px-3 py-3 text-center font-medium w-20">N°</th>
                                                <th className="px-3 py-3 text-left font-medium">CAPACITACIÓN</th>
                                                <th className="px-3 py-3 text-center font-medium w-36">PRIORIDAD</th>
                                                <th className="px-3 py-3 text-center font-medium w-32">PARTICIPANTES</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[
                                                { id: "usoPlataformas", num: "7.7.1", label: "Uso de plataformas de telesalud" },
                                                { id: "seguridadInfo", num: "7.7.2", label: "Seguridad de la información" },
                                                { id: "protocolosClinicos", num: "7.7.3", label: "Protocolos clínicos" },
                                            ].map((item, index) => (
                                                <tr key={item.id} className={index % 2 === 0 ? "bg-blue-50" : "bg-white"}>
                                                    <td className="px-3 py-3 border-b border-gray-200 text-center font-medium text-[#0A5BA9]">{item.num}</td>
                                                    <td className="px-3 py-3 border-b border-gray-200">{item.label}</td>
                                                    <td className="px-3 py-3 border-b border-gray-200 text-center">
                                                        <select
                                                            value={formData.necesidades[`capac_${item.id}_prior`] || ""}
                                                            onChange={(e) => handleInputChange("necesidades", `capac_${item.id}_prior`, e.target.value)}
                                                            className="w-full px-2 py-1.5 bg-yellow-50 border-2 border-yellow-300 rounded text-sm focus:border-[#0A5BA9]"
                                                        >
                                                            <option value="">Seleccionar...</option>
                                                            <option value="alta">Alta</option>
                                                            <option value="media">Media</option>
                                                            <option value="baja">Baja</option>
                                                        </select>
                                                    </td>
                                                    <td className="px-3 py-3 border-b border-gray-200 text-center">
                                                        <NumberSelector
                                                            value={formData.necesidades[`capac_${item.id}_cant`] || ""}
                                                            onChange={(e) => handleInputChange("necesidades", `capac_${item.id}_cant`, e.target.value)}
                                                            min={0}
                                                            max={100}
                                                            className="w-24"
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* 7.8 Observaciones Finales */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-[#0A5BA9] to-[#094580] px-6 py-4">
                                <h3 className="text-lg font-semibold text-white">7.8 OBSERVACIONES Y COMENTARIOS ADICIONALES</h3>
                            </div>
                            <div className="p-6">
                                <textarea
                                    value={formData.necesidades.observacionesFinales || ""}
                                    onChange={(e) => handleInputChange("necesidades", "observacionesFinales", e.target.value)}
                                    className="w-full px-4 py-3 bg-yellow-50 border-2 border-yellow-300 rounded-lg focus:border-[#0A5BA9] resize-none"
                                    rows={4}
                                    placeholder="Escriba cualquier observación o comentario adicional sobre las necesidades de telesalud..."
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab: Vista Previa */}
                {activeTab === "vista-previa" && vistaPreviaHabilitada && (
                    <div className="space-y-6" ref={pdfPreviewRef}>
                        {/* Header del PDF Preview */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-[#0A5BA9] to-[#094580] px-6 py-4">
                                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <Eye className="w-5 h-5" />
                                    VISTA PREVIA DEL DOCUMENTO PDF
                                </h3>
                                <p className="text-white/80 text-sm mt-1">Revise la información antes de descargar el PDF</p>
                            </div>
                        </div>

                        {/* Página 1: Datos Generales */}
                        <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden">
                            <div className="bg-[#0A5BA9] px-6 py-3 flex justify-between items-center">
                                <span className="text-white font-bold">Página 1 de 7</span>
                                <span className="text-white/80 text-sm">I. DATOS GENERALES</span>
                            </div>
                            <div className="p-6">
                                <div className="text-center mb-6 pb-4 border-b-2 border-[#0A5BA9]">
                                    <h2 className="text-xl font-bold text-[#0A5BA9]">DIAGNÓSTICO SITUACIONAL DE TELESALUD</h2>
                                    <p className="text-gray-600 mt-2"><strong>IPRESS:</strong> {datosUsuario?.nombre_ipress || "No especificado"}</p>
                                    <p className="text-gray-600"><strong>Red Asistencial:</strong> {datosUsuario?.nombre_red || "No especificado"}</p>
                                    <p className="text-gray-600"><strong>Macroregión:</strong> {datosUsuario?.nombre_macroregion || "No especificado"}</p>
                                </div>

                                <h3 className="text-lg font-bold text-[#0A5BA9] mb-4 bg-blue-50 px-4 py-2 rounded">I. DATOS GENERALES DE LA IPRESS</h3>

                                <div className="mb-6">
                                    <h4 className="font-semibold text-gray-700 mb-3 border-b pb-2">Datos del Director de la IPRESS</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                        <div><strong>1.3 Nombre completo:</strong> {formData.datosGenerales.directorNombre || "No especificado"}</div>
                                        <div><strong>1.4 Correo:</strong> {formData.datosGenerales.directorCorreo || "No especificado"}</div>
                                        <div><strong>1.5 Teléfono:</strong> {formData.datosGenerales.directorTelefono || "No especificado"}</div>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <h4 className="font-semibold text-gray-700 mb-3 border-b pb-2">Datos del Responsable/Coordinador de Telesalud</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                        <div><strong>1.6 Nombre completo:</strong> {formData.datosGenerales.responsableNombre || "No especificado"}</div>
                                        <div><strong>1.7 Correo:</strong> {formData.datosGenerales.responsableCorreo || "No especificado"}</div>
                                        <div><strong>1.8 Teléfono:</strong> {formData.datosGenerales.responsableTelefono || "No especificado"}</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div><strong>1.9 Población adscrita:</strong> {formData.datosGenerales.poblacionAdscrita ? formatearNumero(formData.datosGenerales.poblacionAdscrita) : "No especificado"}</div>
                                    <div><strong>1.10 Promedio atenciones mensuales:</strong> {(formData.datosGenerales.atencionesMenuales || formData.datosGenerales.promedioAtenciones) ? formatearNumero(formData.datosGenerales.atencionesMenuales || formData.datosGenerales.promedioAtenciones) : "No especificado"}</div>
                                </div>
                            </div>
                        </div>

                        {/* Página 2: Recursos Humanos */}
                        <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden">
                            <div className="bg-[#0A5BA9] px-6 py-3 flex justify-between items-center">
                                <span className="text-white font-bold">Página 2 de 7</span>
                                <span className="text-white/80 text-sm">II. RECURSOS HUMANOS</span>
                            </div>
                            <div className="p-6">
                                <h3 className="text-lg font-bold text-[#0A5BA9] mb-4 bg-blue-50 px-4 py-2 rounded">II. RECURSOS HUMANOS PARA TELESALUD</h3>

                                <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                                    <div className="p-3 bg-gray-50 rounded"><strong>2.1.1 ¿Designa Coordinador de Telesalud?</strong> {formData.recursosHumanos.coordTelesalud === "si" ? "Sí" : formData.recursosHumanos.coordTelesalud === "no" ? "No" : "-"}</div>
                                    <div className="p-3 bg-gray-50 rounded"><strong>2.1.2 ¿Asigna personal de apoyo?</strong> {formData.recursosHumanos.personalApoyo === "si" ? "Sí" : formData.recursosHumanos.personalApoyo === "no" ? "No" : "-"}</div>
                                </div>

                                {formData.recursosHumanos.personalApoyo === "si" && (
                                    <div className="mb-6">
                                        <h4 className="font-semibold text-gray-700 mb-3">Personal de Apoyo por Categoría</h4>
                                        <table className="w-full text-sm border-collapse">
                                            <thead>
                                                <tr className="bg-[#0A5BA9] text-white">
                                                    <th className="px-4 py-2 text-left">Categoría Profesional</th>
                                                    <th className="px-4 py-2 text-center">Cantidad</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {[
                                                    { label: "Médicos especialistas", id: "medicosEspecialistas" },
                                                    { label: "Médicos generales", id: "medicosGenerales" },
                                                    { label: "Enfermeras(os)", id: "enfermeras" },
                                                    { label: "Obstetras", id: "obstetras" },
                                                    { label: "Tecnólogos médicos", id: "tecnologos" },
                                                    { label: "Psicólogos", id: "psicologos" },
                                                    { label: "Nutricionistas", id: "nutricionistas" },
                                                    { label: "Trabajadores sociales", id: "trabajadoresSociales" },
                                                    { label: "Otros profesionales de salud", id: "otrosProfesionales" },
                                                    { label: "Personal técnico de salud", id: "tecnicoSalud" },
                                                    { label: "Personal de soporte TIC", id: "soporteTic" },
                                                    { label: "Personal administrativo", id: "administrativo" },
                                                ].filter(item => formData.recursosHumanos[item.id]).map((item, idx) => (
                                                    <tr key={item.id} className={idx % 2 === 0 ? "bg-gray-50" : ""}>
                                                        <td className="px-4 py-2 border">{item.label}</td>
                                                        <td className="px-4 py-2 border text-center">{formData.recursosHumanos[item.id]}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                <h4 className="font-semibold text-gray-700 mb-3 border-b pb-2">2.2 Capacitación y Competencias</h4>
                                <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                                    <div className="p-2 bg-gray-50 rounded"><strong>2.2.1 Capacitación en TIC:</strong> {formData.recursosHumanos.capacitacionTic === "si" ? "Sí" : formData.recursosHumanos.capacitacionTic === "no" ? "No" : "-"}</div>
                                    <div className="p-2 bg-gray-50 rounded"><strong>2.2.2 Conoce normativa:</strong> {formData.recursosHumanos.normativa === "si" ? "Sí" : formData.recursosHumanos.normativa === "no" ? "No" : "-"}</div>
                                    <div className="p-2 bg-gray-50 rounded"><strong>2.2.3 Alfabetización digital:</strong> {formData.recursosHumanos.alfabetizacion === "si" ? "Sí" : formData.recursosHumanos.alfabetizacion === "no" ? "No" : "-"}</div>
                                    <div className="p-2 bg-gray-50 rounded"><strong>2.2.4 Plan de capacitación:</strong> {formData.recursosHumanos.planCapacitacion === "si" ? "Sí" : formData.recursosHumanos.planCapacitacion === "no" ? "No" : "-"}</div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div><strong>2.2.5 Capacitaciones en el año:</strong> {formData.recursosHumanos.capacitacionesAnio || "0"}</div>
                                    {formData.recursosHumanos.necesidadesCapacitacion && (
                                        <div className="col-span-2"><strong>2.2.6 Necesidades de capacitación:</strong> {formData.recursosHumanos.necesidadesCapacitacion}</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Página 3: Infraestructura */}
                        <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden">
                            <div className="bg-[#0A5BA9] px-6 py-3 flex justify-between items-center">
                                <span className="text-white font-bold">Página 3 de 7</span>
                                <span className="text-white/80 text-sm">III. INFRAESTRUCTURA</span>
                            </div>
                            <div className="p-6">
                                <h3 className="text-lg font-bold text-[#0A5BA9] mb-4 bg-blue-50 px-4 py-2 rounded">III. INFRAESTRUCTURA</h3>

                                <h4 className="font-semibold text-gray-700 mb-3">3.1 Infraestructura Física</h4>
                                <table className="w-full text-sm border-collapse mb-6">
                                    <thead>
                                        <tr className="bg-[#0A5BA9] text-white">
                                            <th className="px-4 py-2 text-left">Criterio</th>
                                            <th className="px-4 py-2 text-center w-24">Respuesta</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            { label: "3.1.1 Espacio físico para Teleconsultorio", id: "espacioFisico" },
                                            { label: "3.1.2 Garantiza privacidad del paciente", id: "privacidad" },
                                            { label: "3.1.3 Escritorio ergonómico", id: "escritorio" },
                                            { label: "3.1.4 Sillas ergonómicas", id: "sillas" },
                                            { label: "3.1.5 Estantes para equipos", id: "estantes" },
                                            { label: "3.1.6 Archivero con llave", id: "archivero" },
                                            { label: "3.1.7 Iluminación adecuada", id: "iluminacion" },
                                            { label: "3.1.8 Ventilación adecuada", id: "ventilacion" },
                                            { label: "3.1.9 Aire acondicionado", id: "aireAcondicionado" },
                                        ].map((item, idx) => (
                                            <tr key={item.id} className={idx % 2 === 0 ? "bg-gray-50" : ""}>
                                                <td className="px-4 py-2 border">{item.label}</td>
                                                <td className="px-4 py-2 border text-center">{formData.infraestructura[item.id] === "si" ? "Sí" : formData.infraestructura[item.id] === "no" ? "No" : "-"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className="mb-6 text-sm"><strong>3.1.10 N° de ambientes para Telesalud:</strong> {formData.infraestructura.numAmbientes || "0"}</div>

                                <h4 className="font-semibold text-gray-700 mb-3">3.2 Infraestructura Tecnológica</h4>
                                <table className="w-full text-sm border-collapse">
                                    <thead>
                                        <tr className="bg-[#0A5BA9] text-white">
                                            <th className="px-4 py-2 text-left">Criterio</th>
                                            <th className="px-4 py-2 text-center w-24">Respuesta</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            { label: "3.2.1 Hardware (servidores, computadoras, equipos de red)", id: "hardware" },
                                            { label: "3.2.2 Software (sistemas operativos, aplicaciones)", id: "software" },
                                            { label: "3.2.3 Redes (cableado, redes inalámbricas)", id: "redes" },
                                            { label: "3.2.4 Almacenamiento de datos", id: "almacenamiento" },
                                            { label: "3.2.5 Servicios (seguridad informática, soporte)", id: "serviciosTec" },
                                        ].map((item, idx) => (
                                            <tr key={item.id} className={idx % 2 === 0 ? "bg-gray-50" : ""}>
                                                <td className="px-4 py-2 border">{item.label}</td>
                                                <td className="px-4 py-2 border text-center">{formData.infraestructura[item.id] === "si" ? "Sí" : formData.infraestructura[item.id] === "no" ? "No" : "-"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Página 4: Equipamiento */}
                        <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden">
                            <div className="bg-[#0A5BA9] px-6 py-3 flex justify-between items-center">
                                <span className="text-white font-bold">Página 4 de 7</span>
                                <span className="text-white/80 text-sm">IV. EQUIPAMIENTO</span>
                            </div>
                            <div className="p-6">
                                <h3 className="text-lg font-bold text-[#0A5BA9] mb-4 bg-blue-50 px-4 py-2 rounded">IV. EQUIPAMIENTO</h3>

                                <h4 className="font-semibold text-gray-700 mb-3">4.1 Equipamiento Informático</h4>
                                <table className="w-full text-sm border-collapse mb-6">
                                    <thead>
                                        <tr className="bg-[#0A5BA9] text-white">
                                            <th className="px-3 py-2 text-left">Equipo</th>
                                            <th className="px-3 py-2 text-center w-20">Disp.</th>
                                            <th className="px-3 py-2 text-center w-16">Cant.</th>
                                            <th className="px-3 py-2 text-center w-20">Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            "Computadora de escritorio", "Laptop", "Monitor", "Cable HDMI", "Cámara web HD",
                                            "Micrófono", "Parlantes/audífonos", "Impresora", "Escáner", "Router/Switch"
                                        ].map((equipo, index) => {
                                            const fieldId = `equipInfo${index}`;
                                            const disp = formData.equipamiento[`${fieldId}_disponible`];
                                            const cant = formData.equipamiento[`${fieldId}_cantidad`];
                                            const estado = formData.equipamiento[`${fieldId}_estado`];
                                            if (!disp && !cant && !estado) return null;
                                            return (
                                                <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                                                    <td className="px-3 py-2 border">{equipo}</td>
                                                    <td className="px-3 py-2 border text-center">{disp === "si" ? "Sí" : disp === "no" ? "No" : "-"}</td>
                                                    <td className="px-3 py-2 border text-center">{cant || "-"}</td>
                                                    <td className="px-3 py-2 border text-center capitalize">{estado || "-"}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>

                                <h4 className="font-semibold text-gray-700 mb-3">4.2 Equipamiento Biomédico Digital</h4>
                                <table className="w-full text-sm border-collapse">
                                    <thead>
                                        <tr className="bg-[#0A5BA9] text-white">
                                            <th className="px-3 py-2 text-left">Equipo</th>
                                            <th className="px-3 py-2 text-center w-20">Disp.</th>
                                            <th className="px-3 py-2 text-center w-16">Cant.</th>
                                            <th className="px-3 py-2 text-center w-20">Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            "Pulsioxímetro digital", "Dermatoscopio digital", "Ecógrafo digital", "Electrocardiógrafo digital",
                                            "Equipo de gases arteriales", "Estetoscopio digital", "Fonendoscopio digital",
                                            "Monitor de funciones vitales", "Otoscopio digital", "Oxímetro digital",
                                            "Retinógrafo digital", "Tensiómetro digital", "Videocolposcopio", "Estación móvil de telemedicina"
                                        ].map((equipo, index) => {
                                            const fieldId = `equipBio${index}`;
                                            const disp = formData.equipamiento[`${fieldId}_disponible`];
                                            const cant = formData.equipamiento[`${fieldId}_cantidad`];
                                            const estado = formData.equipamiento[`${fieldId}_estado`];
                                            if (!disp && !cant && !estado) return null;
                                            return (
                                                <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                                                    <td className="px-3 py-2 border">{equipo}</td>
                                                    <td className="px-3 py-2 border text-center">{disp === "si" ? "Sí" : disp === "no" ? "No" : "-"}</td>
                                                    <td className="px-3 py-2 border text-center">{cant || "-"}</td>
                                                    <td className="px-3 py-2 border text-center capitalize">{estado || "-"}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Página 5: Conectividad */}
                        <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden">
                            <div className="bg-[#0A5BA9] px-6 py-3 flex justify-between items-center">
                                <span className="text-white font-bold">Página 5 de 7</span>
                                <span className="text-white/80 text-sm">V. CONECTIVIDAD Y SISTEMAS</span>
                            </div>
                            <div className="p-6">
                                <h3 className="text-lg font-bold text-[#0A5BA9] mb-4 bg-blue-50 px-4 py-2 rounded">V. CONECTIVIDAD Y SISTEMAS DE INFORMACIÓN</h3>

                                {/* 5.1 Conectividad - Tabla */}
                                <h4 className="font-semibold text-gray-700 mb-3">5.1 Conectividad y Servicios</h4>
                                <table className="w-full text-sm border-collapse mb-4">
                                    <thead>
                                        <tr className="bg-[#0A5BA9] text-white">
                                            <th className="px-4 py-2 text-left">Criterio</th>
                                            <th className="px-4 py-2 text-center w-24">Respuesta</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            { label: "5.1.1 ¿Cuenta con acceso a internet?", id: "internet" },
                                            { label: "5.1.2 ¿La conexión es estable y permanente?", id: "estable" },
                                            { label: "5.1.3 ¿Sistema alternativo de energía eléctrica?", id: "energiaAlt" },
                                            { label: "5.1.4 ¿Cuenta con puntos de red suficientes?", id: "puntosRed" },
                                            { label: "5.1.5 ¿Cuenta con red WiFi institucional?", id: "wifi" },
                                        ].map((item, idx) => (
                                            <tr key={item.id} className={idx % 2 === 0 ? "bg-gray-50" : ""}>
                                                <td className="px-4 py-2 border">{item.label}</td>
                                                <td className="px-4 py-2 border text-center font-medium">{formData.conectividad[item.id] === "si" ? "Sí" : formData.conectividad[item.id] === "no" ? "No" : "-"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* Datos de conexión - Cards */}
                                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                    <h5 className="font-medium text-gray-700 mb-3">Detalles de la Conexión a Internet</h5>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                                        <div className="bg-white p-3 rounded border border-gray-200">
                                            <span className="text-gray-500 block text-xs mb-1">5.1.6 Tipo de conexión</span>
                                            <strong className="text-gray-800">{formData.conectividad.tipoConexion || "No especificado"}</strong>
                                        </div>
                                        <div className="bg-white p-3 rounded border border-gray-200">
                                            <span className="text-gray-500 block text-xs mb-1">5.1.7 Proveedor</span>
                                            <strong className="text-gray-800">{formData.conectividad.proveedor || "No especificado"}</strong>
                                        </div>
                                        <div className="bg-white p-3 rounded border border-gray-200">
                                            <span className="text-gray-500 block text-xs mb-1">5.1.8 Velocidad contratada</span>
                                            <strong className="text-gray-800">{formData.conectividad.velocidadContratada ? `${formData.conectividad.velocidadContratada} Mbps` : "No especificado"}</strong>
                                        </div>
                                        <div className="bg-white p-3 rounded border border-gray-200">
                                            <span className="text-gray-500 block text-xs mb-1">5.1.9 Velocidad real promedio</span>
                                            <strong className="text-gray-800">{formData.conectividad.velocidadReal ? `${formData.conectividad.velocidadReal} Mbps` : "No especificado"}</strong>
                                        </div>
                                        <div className="bg-white p-3 rounded border border-gray-200">
                                            <span className="text-gray-500 block text-xs mb-1">5.1.10 N° puntos de red</span>
                                            <strong className="text-gray-800">{formData.conectividad.numPuntosRed || "No especificado"}</strong>
                                        </div>
                                    </div>
                                </div>

                                {/* 5.2 Sistemas de Información - Tabla */}
                                <h4 className="font-semibold text-gray-700 mb-3">5.2 Sistemas de Información</h4>
                                <table className="w-full text-sm border-collapse mb-4">
                                    <thead>
                                        <tr className="bg-[#0A5BA9] text-white">
                                            <th className="px-4 py-2 text-left">Sistema</th>
                                            <th className="px-4 py-2 text-center w-24">Disponible</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            { label: "5.2.1 ESSI (Registro y trazabilidad de atenciones)", id: "essi" },
                                            { label: "5.2.2 PACS (Sistema de imágenes médicas)", id: "pacs" },
                                            { label: "5.2.3 ANATPAT (Anatomía patológica)", id: "anatpat" },
                                            { label: "5.2.4 Sistema de videoconferencia", id: "videoconferencia" },
                                            { label: "5.2.5 Sistema de citas en línea", id: "citasLinea" },
                                        ].map((item, idx) => (
                                            <tr key={item.id} className={idx % 2 === 0 ? "bg-gray-50" : ""}>
                                                <td className="px-4 py-2 border">{item.label}</td>
                                                <td className="px-4 py-2 border text-center font-medium">{formData.conectividad[item.id] === "si" ? "Sí" : formData.conectividad[item.id] === "no" ? "No" : "-"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {formData.conectividad.otroSistema && (
                                    <div className="text-sm mb-6 bg-blue-50 p-3 rounded border border-blue-200">
                                        <strong>5.2.6 Otro sistema interoperable autorizado:</strong> {formData.conectividad.otroSistema}
                                    </div>
                                )}

                                {/* 5.3 Seguridad - Tabla */}
                                <h4 className="font-semibold text-gray-700 mb-3">5.3 Seguridad de la Información y Protección de Datos</h4>
                                <table className="w-full text-sm border-collapse">
                                    <thead>
                                        <tr className="bg-[#0A5BA9] text-white">
                                            <th className="px-4 py-2 text-left">Criterio de Seguridad</th>
                                            <th className="px-4 py-2 text-center w-24">Cumple</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            { label: "5.3.1 Mecanismos de confidencialidad de la información", id: "confidencialidad" },
                                            { label: "5.3.2 Mecanismos de integridad de la información", id: "integridad" },
                                            { label: "5.3.3 Mecanismos de disponibilidad de la información", id: "disponibilidad" },
                                            { label: "5.3.4 Planes de contingencia para pérdida de datos", id: "contingencia" },
                                            { label: "5.3.5 Respaldo (backup) de información", id: "backup" },
                                            { label: "5.3.6 Formato de Consentimiento Informado para Telemedicina", id: "consentimiento" },
                                            { label: "5.3.7 Cumplimiento Ley N° 29733 (Protección de Datos Personales)", id: "ley29733" },
                                        ].map((item, idx) => (
                                            <tr key={item.id} className={idx % 2 === 0 ? "bg-gray-50" : ""}>
                                                <td className="px-4 py-2 border">{item.label}</td>
                                                <td className="px-4 py-2 border text-center font-medium">{formData.conectividad[item.id] === "si" ? "Sí" : formData.conectividad[item.id] === "no" ? "No" : "-"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Página 6: Servicios */}
                        <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden">
                            <div className="bg-[#0A5BA9] px-6 py-3 flex justify-between items-center">
                                <span className="text-white font-bold">Página 6 de 7</span>
                                <span className="text-white/80 text-sm">VI. SERVICIOS DE TELESALUD</span>
                            </div>
                            <div className="p-6">
                                <h3 className="text-lg font-bold text-[#0A5BA9] mb-4 bg-blue-50 px-4 py-2 rounded">VI. SERVICIOS DE TELESALUD</h3>
                                <table className="w-full text-sm border-collapse">
                                    <thead>
                                        <tr className="bg-[#0A5BA9] text-white">
                                            <th className="px-4 py-2 text-left">Servicio</th>
                                            <th className="px-4 py-2 text-center w-20">Implementado</th>
                                            <th className="px-4 py-2 text-left">Observaciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            { label: "6.1.1 Servicios incorporados en RENIPRESS", id: "incorporoServicios" },
                                            { label: "6.1.2 Teleconsulta", id: "teleconsulta" },
                                            { label: "6.1.3 Teleorientación", id: "teleorientacion" },
                                            { label: "6.1.4 Telemonitoreo", id: "telemonitoreo" },
                                            { label: "6.1.5 Teleinterconsulta", id: "teleinterconsulta" },
                                            { label: "6.1.6 Teleurgencia", id: "teleurgencia" },
                                            { label: "6.1.7 Teletriaje", id: "teletriaje" },
                                            { label: "6.1.8 Telerradiografía", id: "telerradiografia" },
                                            { label: "6.1.9 Telemamografía", id: "telemamografia" },
                                            { label: "6.1.10 Teletomografía", id: "teletomografia" },
                                            { label: "6.1.11 Telecapacitación", id: "telecapacitacion" },
                                            { label: "6.1.12 TeleIEC", id: "teleiec" },
                                        ].map((item, idx) => (
                                            <tr key={item.id} className={idx % 2 === 0 ? "bg-gray-50" : ""}>
                                                <td className="px-4 py-2 border">{item.label}</td>
                                                <td className="px-4 py-2 border text-center">{formData.servicios[item.id] === "si" ? "Sí" : formData.servicios[item.id] === "no" ? "No" : "-"}</td>
                                                <td className="px-4 py-2 border">{formData.servicios[`${item.id}_obs`] || "-"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Página 7: Necesidades */}
                        <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden">
                            <div className="bg-[#0A5BA9] px-6 py-3 flex justify-between items-center">
                                <span className="text-white font-bold">Página 7 de 7</span>
                                <span className="text-white/80 text-sm">VII. NECESIDADES Y REQUERIMIENTOS</span>
                            </div>
                            <div className="p-6">
                                <h3 className="text-lg font-bold text-[#0A5BA9] mb-4 bg-blue-50 px-4 py-2 rounded">VII. NECESIDADES Y REQUERIMIENTOS PARA IMPLEMENTACIÓN DE TELESALUD</h3>

                                {/* 7.1 Infraestructura Física - Tabla */}
                                <h4 className="font-semibold text-gray-700 mb-3">7.1 Necesidades de Infraestructura Física</h4>
                                {(() => {
                                    const infraItems = [
                                        { label: "Espacio físico para Teleconsultorio", id: "espacioFisico", num: "7.1.1" },
                                        { label: "Escritorio ergonómico", id: "escritorio", num: "7.1.2" },
                                        { label: "Sillas ergonómicas", id: "sillas", num: "7.1.3" },
                                        { label: "Estantes para equipos", id: "estantes", num: "7.1.4" },
                                        { label: "Archivero con llave", id: "archivero", num: "7.1.5" },
                                        { label: "Instalación de luz eléctrica", id: "luzElectrica", num: "7.1.6" },
                                        { label: "Sistema de ventilación", id: "ventilacion", num: "7.1.7" },
                                        { label: "Aire acondicionado", id: "aireAcond", num: "7.1.8" },
                                    ].filter(item => formData.necesidades[`infra_${item.id}_cant`] || formData.necesidades[`infra_${item.id}_prior`]);

                                    return infraItems.length > 0 ? (
                                        <table className="w-full text-sm border-collapse mb-6">
                                            <thead>
                                                <tr className="bg-[#0A5BA9] text-white">
                                                    <th className="px-4 py-2 text-left">Requerimiento</th>
                                                    <th className="px-4 py-2 text-center w-24">Cantidad</th>
                                                    <th className="px-4 py-2 text-center w-24">Prioridad</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {infraItems.map((item, idx) => (
                                                    <tr key={item.id} className={idx % 2 === 0 ? "bg-gray-50" : ""}>
                                                        <td className="px-4 py-2 border">{item.num} {item.label}</td>
                                                        <td className="px-4 py-2 border text-center font-medium">{formData.necesidades[`infra_${item.id}_cant`] || "0"}</td>
                                                        <td className="px-4 py-2 border text-center">
                                                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                                formData.necesidades[`infra_${item.id}_prior`] === "alta" ? "bg-red-100 text-red-700" :
                                                                formData.necesidades[`infra_${item.id}_prior`] === "media" ? "bg-yellow-100 text-yellow-700" :
                                                                formData.necesidades[`infra_${item.id}_prior`] === "baja" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                                                            }`}>
                                                                {formData.necesidades[`infra_${item.id}_prior`] ? formData.necesidades[`infra_${item.id}_prior`].charAt(0).toUpperCase() + formData.necesidades[`infra_${item.id}_prior`].slice(1) : "-"}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : <p className="text-sm text-gray-500 mb-6 italic">No se registraron necesidades de infraestructura física.</p>;
                                })()}

                                {/* Pregunta de suficiencia - Infraestructura Física */}
                                {(formData.necesidades.infraFisicaSuficiente || formData.necesidades.infraFisicaObservaciones) && (
                                    <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                        <div className="flex items-center gap-4 mb-2">
                                            <span className="text-sm font-medium text-gray-700">¿La infraestructura física es suficiente?</span>
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                formData.necesidades.infraFisicaSuficiente === 'si' ? 'bg-green-100 text-green-700' :
                                                formData.necesidades.infraFisicaSuficiente === 'no' ? 'bg-red-100 text-red-700' :
                                                formData.necesidades.infraFisicaSuficiente === 'parcial' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'
                                            }`}>
                                                {formData.necesidades.infraFisicaSuficiente === 'si' ? 'Sí' :
                                                 formData.necesidades.infraFisicaSuficiente === 'no' ? 'No' :
                                                 formData.necesidades.infraFisicaSuficiente === 'parcial' ? 'Parcial' : '-'}
                                            </span>
                                        </div>
                                        {formData.necesidades.infraFisicaObservaciones && (
                                            <div className="mt-2">
                                                <span className="text-xs text-gray-500">Observaciones:</span>
                                                <p className="text-sm text-gray-700 mt-1">{formData.necesidades.infraFisicaObservaciones}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* 7.2 Infraestructura Tecnológica - Tabla */}
                                <h4 className="font-semibold text-gray-700 mb-3">7.2 Necesidades de Infraestructura Tecnológica</h4>
                                {(() => {
                                    const infraTecItems = [
                                        { label: "Equipo de Computo", id: "equipoComputo", num: "7.2.1" },
                                        { label: "Equipos de red (routers, switches)", id: "equiposRed", num: "7.2.2" },
                                        { label: "Software necesario para la gestión y ejecución de la teleconsulta", id: "softwareAtencion", num: "7.2.3" },
                                        { label: "Aplicaciones para el seguimiento y monitoreo de los servicios", id: "aplicacionesMonitoreo", num: "7.2.4" },
                                        { label: "Servicios de soporte que garantizan el funcionamiento", id: "serviciosSoporte", num: "7.2.5" },
                                    ].filter(item => formData.necesidades[`infraTec_${item.id}_cant`] || formData.necesidades[`infraTec_${item.id}_prior`]);

                                    return infraTecItems.length > 0 ? (
                                        <table className="w-full text-sm border-collapse mb-6">
                                            <thead>
                                                <tr className="bg-[#0A5BA9] text-white">
                                                    <th className="px-4 py-2 text-left">Requerimiento</th>
                                                    <th className="px-4 py-2 text-center w-24">Cantidad</th>
                                                    <th className="px-4 py-2 text-center w-24">Prioridad</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {infraTecItems.map((item, idx) => (
                                                    <tr key={item.id} className={idx % 2 === 0 ? "bg-gray-50" : ""}>
                                                        <td className="px-4 py-2 border">{item.num} {item.label}</td>
                                                        <td className="px-4 py-2 border text-center font-medium">{formData.necesidades[`infraTec_${item.id}_cant`] || "0"}</td>
                                                        <td className="px-4 py-2 border text-center">
                                                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                                formData.necesidades[`infraTec_${item.id}_prior`] === "alta" ? "bg-red-100 text-red-700" :
                                                                formData.necesidades[`infraTec_${item.id}_prior`] === "media" ? "bg-yellow-100 text-yellow-700" :
                                                                formData.necesidades[`infraTec_${item.id}_prior`] === "baja" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                                                            }`}>
                                                                {formData.necesidades[`infraTec_${item.id}_prior`] ? formData.necesidades[`infraTec_${item.id}_prior`].charAt(0).toUpperCase() + formData.necesidades[`infraTec_${item.id}_prior`].slice(1) : "-"}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : <p className="text-sm text-gray-500 mb-6 italic">No se registraron necesidades de infraestructura tecnológica.</p>;
                                })()}

                                {/* Pregunta de suficiencia - Infraestructura Tecnológica */}
                                {formData.necesidades.infraTecAdecuada && (
                                    <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm font-medium text-gray-700">¿La infraestructura tecnológica es adecuada?</span>
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                formData.necesidades.infraTecAdecuada === 'si' ? 'bg-green-100 text-green-700' :
                                                formData.necesidades.infraTecAdecuada === 'no' ? 'bg-red-100 text-red-700' :
                                                formData.necesidades.infraTecAdecuada === 'parcial' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'
                                            }`}>
                                                {formData.necesidades.infraTecAdecuada === 'si' ? 'Sí' :
                                                 formData.necesidades.infraTecAdecuada === 'no' ? 'No' :
                                                 formData.necesidades.infraTecAdecuada === 'parcial' ? 'Parcial' : '-'}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* 7.3 Equipamiento Informático - Tabla */}
                                <h4 className="font-semibold text-gray-700 mb-3">7.3 Necesidades de Equipamiento Informático</h4>
                                {(() => {
                                    const equipItems = [
                                        { label: "Computadora de escritorio", id: "computadora", num: "7.3.1" },
                                        { label: "Computadora portátil (laptop)", id: "laptop", num: "7.3.2" },
                                        { label: "Monitor", id: "monitor", num: "7.3.3" },
                                        { label: "Cable HDMI", id: "cableHdmi", num: "7.3.4" },
                                        { label: "Cámara web HD (resolución mínima 1080p)", id: "camaraWeb", num: "7.3.5" },
                                        { label: "Micrófono", id: "microfono", num: "7.3.6" },
                                        { label: "Parlantes/Audífonos", id: "parlantes", num: "7.3.7" },
                                        { label: "Impresora", id: "impresora", num: "7.3.8" },
                                        { label: "Escáner", id: "escaner", num: "7.3.9" },
                                        { label: "Router/Switch de red", id: "router", num: "7.3.10" },
                                    ].filter(item => formData.necesidades[`equip_${item.id}_cant`] || formData.necesidades[`equip_${item.id}_prior`]);

                                    return equipItems.length > 0 ? (
                                        <table className="w-full text-sm border-collapse mb-6">
                                            <thead>
                                                <tr className="bg-[#0A5BA9] text-white">
                                                    <th className="px-4 py-2 text-left">Requerimiento</th>
                                                    <th className="px-4 py-2 text-center w-24">Cantidad</th>
                                                    <th className="px-4 py-2 text-center w-24">Prioridad</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {equipItems.map((item, idx) => (
                                                    <tr key={item.id} className={idx % 2 === 0 ? "bg-gray-50" : ""}>
                                                        <td className="px-4 py-2 border">{item.num} {item.label}</td>
                                                        <td className="px-4 py-2 border text-center font-medium">{formData.necesidades[`equip_${item.id}_cant`] || "0"}</td>
                                                        <td className="px-4 py-2 border text-center">
                                                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                                formData.necesidades[`equip_${item.id}_prior`] === "alta" ? "bg-red-100 text-red-700" :
                                                                formData.necesidades[`equip_${item.id}_prior`] === "media" ? "bg-yellow-100 text-yellow-700" :
                                                                formData.necesidades[`equip_${item.id}_prior`] === "baja" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                                                            }`}>
                                                                {formData.necesidades[`equip_${item.id}_prior`] ? formData.necesidades[`equip_${item.id}_prior`].charAt(0).toUpperCase() + formData.necesidades[`equip_${item.id}_prior`].slice(1) : "-"}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : <p className="text-sm text-gray-500 mb-6 italic">No se registraron necesidades de equipamiento informático.</p>;
                                })()}

                                {/* Pregunta de suficiencia - Equipamiento Informático */}
                                {formData.necesidades.equipInfoAdecuado && (
                                    <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm font-medium text-gray-700">¿El equipamiento informático es adecuado?</span>
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                formData.necesidades.equipInfoAdecuado === 'si' ? 'bg-green-100 text-green-700' :
                                                formData.necesidades.equipInfoAdecuado === 'no' ? 'bg-red-100 text-red-700' :
                                                formData.necesidades.equipInfoAdecuado === 'parcial' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'
                                            }`}>
                                                {formData.necesidades.equipInfoAdecuado === 'si' ? 'Sí' :
                                                 formData.necesidades.equipInfoAdecuado === 'no' ? 'No' :
                                                 formData.necesidades.equipInfoAdecuado === 'parcial' ? 'Parcial' : '-'}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* 7.4 Equipamiento Biomédico - Tabla */}
                                <h4 className="font-semibold text-gray-700 mb-3">7.4 Necesidades de Equipamiento Biomédico Digital</h4>
                                {(() => {
                                    const bioItems = [
                                        { label: "Pulsioxímetro digital", id: "pulsioximetro", num: "7.4.1" },
                                        { label: "Dermatoscopio digital", id: "dermatoscopio", num: "7.4.2" },
                                        { label: "Ecógrafo digital", id: "ecografo", num: "7.4.3" },
                                        { label: "Electrocardiógrafo digital", id: "electrocardiografo", num: "7.4.4" },
                                        { label: "Equipo de gases arteriales digital", id: "gasesArteriales", num: "7.4.5" },
                                        { label: "Estetoscopio digital", id: "estetoscopio", num: "7.4.6" },
                                        { label: "Fonendoscopio digital", id: "fonendoscopio", num: "7.4.7" },
                                        { label: "Monitor de funciones vitales", id: "monitorVitales", num: "7.4.8" },
                                        { label: "Otoscopio digital", id: "otoscopio", num: "7.4.9" },
                                        { label: "Oxímetro digital", id: "oximetro", num: "7.4.10" },
                                        { label: "Retinógrafo digital", id: "retinografo", num: "7.4.11" },
                                        { label: "Tensiómetro digital", id: "tensiometro", num: "7.4.12" },
                                        { label: "Videocolposcopio", id: "videocolposcopio", num: "7.4.13" },
                                        { label: "Estación móvil de telemedicina", id: "estacionMovil", num: "7.4.14" },
                                    ].filter(item => formData.necesidades[`bio_${item.id}_cant`] || formData.necesidades[`bio_${item.id}_prior`]);

                                    return bioItems.length > 0 ? (
                                        <table className="w-full text-sm border-collapse mb-6">
                                            <thead>
                                                <tr className="bg-[#0A5BA9] text-white">
                                                    <th className="px-4 py-2 text-left">Requerimiento</th>
                                                    <th className="px-4 py-2 text-center w-24">Cantidad</th>
                                                    <th className="px-4 py-2 text-center w-24">Prioridad</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {bioItems.map((item, idx) => (
                                                    <tr key={item.id} className={idx % 2 === 0 ? "bg-gray-50" : ""}>
                                                        <td className="px-4 py-2 border">{item.num} {item.label}</td>
                                                        <td className="px-4 py-2 border text-center font-medium">{formData.necesidades[`bio_${item.id}_cant`] || "0"}</td>
                                                        <td className="px-4 py-2 border text-center">
                                                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                                formData.necesidades[`bio_${item.id}_prior`] === "alta" ? "bg-red-100 text-red-700" :
                                                                formData.necesidades[`bio_${item.id}_prior`] === "media" ? "bg-yellow-100 text-yellow-700" :
                                                                formData.necesidades[`bio_${item.id}_prior`] === "baja" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                                                            }`}>
                                                                {formData.necesidades[`bio_${item.id}_prior`] ? formData.necesidades[`bio_${item.id}_prior`].charAt(0).toUpperCase() + formData.necesidades[`bio_${item.id}_prior`].slice(1) : "-"}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : <p className="text-sm text-gray-500 mb-6 italic">No se registraron necesidades de equipamiento biomédico.</p>;
                                })()}

                                {/* Pregunta de suficiencia - Equipamiento Biomédico */}
                                {formData.necesidades.equipBioAdecuado && (
                                    <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm font-medium text-gray-700">¿El equipamiento biomédico es adecuado?</span>
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                formData.necesidades.equipBioAdecuado === 'si' ? 'bg-green-100 text-green-700' :
                                                formData.necesidades.equipBioAdecuado === 'no' ? 'bg-red-100 text-red-700' :
                                                formData.necesidades.equipBioAdecuado === 'parcial' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'
                                            }`}>
                                                {formData.necesidades.equipBioAdecuado === 'si' ? 'Sí' :
                                                 formData.necesidades.equipBioAdecuado === 'no' ? 'No' :
                                                 formData.necesidades.equipBioAdecuado === 'parcial' ? 'Parcial' : '-'}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* 7.5 Conectividad - Tabla */}
                                <h4 className="font-semibold text-gray-700 mb-3">7.5 Necesidades de Conectividad</h4>
                                {(() => {
                                    const conectItems = [
                                        { label: "Instalación de internet", id: "instalacionInternet", num: "7.5.1" },
                                        { label: "Puntos de red", id: "puntosRed", num: "7.5.2" },
                                        { label: "Módem WiFi", id: "modemWifi", num: "7.5.3" },
                                        { label: "Internet satelital", id: "internetSatelital", num: "7.5.4" },
                                    ].filter(item => formData.necesidades[`conect_${item.id}_cant`] || formData.necesidades[`conect_${item.id}_prior`]);

                                    return conectItems.length > 0 ? (
                                        <table className="w-full text-sm border-collapse mb-6">
                                            <thead>
                                                <tr className="bg-[#0A5BA9] text-white">
                                                    <th className="px-4 py-2 text-left">Requerimiento</th>
                                                    <th className="px-4 py-2 text-center w-24">Cantidad</th>
                                                    <th className="px-4 py-2 text-center w-24">Prioridad</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {conectItems.map((item, idx) => (
                                                    <tr key={item.id} className={idx % 2 === 0 ? "bg-gray-50" : ""}>
                                                        <td className="px-4 py-2 border">{item.num} {item.label}</td>
                                                        <td className="px-4 py-2 border text-center font-medium">{formData.necesidades[`conect_${item.id}_cant`] || "0"}</td>
                                                        <td className="px-4 py-2 border text-center">
                                                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                                formData.necesidades[`conect_${item.id}_prior`] === "alta" ? "bg-red-100 text-red-700" :
                                                                formData.necesidades[`conect_${item.id}_prior`] === "media" ? "bg-yellow-100 text-yellow-700" :
                                                                formData.necesidades[`conect_${item.id}_prior`] === "baja" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                                                            }`}>
                                                                {formData.necesidades[`conect_${item.id}_prior`] ? formData.necesidades[`conect_${item.id}_prior`].charAt(0).toUpperCase() + formData.necesidades[`conect_${item.id}_prior`].slice(1) : "-"}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : <p className="text-sm text-gray-500 mb-6 italic">No se registraron necesidades de conectividad.</p>;
                                })()}

                                {/* 7.6 Recursos Humanos - Tabla */}
                                <h4 className="font-semibold text-gray-700 mb-3">7.6 Necesidades de Recursos Humanos</h4>
                                {(() => {
                                    const rrhhItems = [
                                        { label: "Médicos especialistas", id: "medicosEspecialistas", num: "7.6.1" },
                                        { label: "Médicos generales", id: "medicosGenerales", num: "7.6.2" },
                                        { label: "Enfermeras(os)", id: "enfermeras", num: "7.6.3" },
                                        { label: "Obstetras", id: "obstetras", num: "7.6.4" },
                                        { label: "Tecnólogos médicos", id: "tecnologosMedicos", num: "7.6.5" },
                                        { label: "Psicólogos", id: "psicologos", num: "7.6.6" },
                                        { label: "Nutricionistas", id: "nutricionistas", num: "7.6.7" },
                                        { label: "Trabajadores sociales", id: "trabajadoresSociales", num: "7.6.8" },
                                        { label: "Otros profesionales de salud", id: "otrosProfesionales", num: "7.6.9" },
                                        { label: "Personal técnico de salud", id: "personalTecnico", num: "7.6.10" },
                                        { label: "Personal de soporte TIC", id: "personalTic", num: "7.6.11" },
                                        { label: "Personal administrativo", id: "personalAdmin", num: "7.6.12" },
                                    ].filter(item => formData.necesidades[`rrhh_${item.id}_cant`] || formData.necesidades[`rrhh_${item.id}_prior`]);

                                    return rrhhItems.length > 0 ? (
                                        <table className="w-full text-sm border-collapse mb-6">
                                            <thead>
                                                <tr className="bg-[#0A5BA9] text-white">
                                                    <th className="px-4 py-2 text-left">Rol</th>
                                                    <th className="px-4 py-2 text-center w-24">Cantidad</th>
                                                    <th className="px-4 py-2 text-center w-24">Prioridad</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {rrhhItems.map((item, idx) => (
                                                    <tr key={item.id} className={idx % 2 === 0 ? "bg-gray-50" : ""}>
                                                        <td className="px-4 py-2 border">{item.num} {item.label}</td>
                                                        <td className="px-4 py-2 border text-center font-medium">{formData.necesidades[`rrhh_${item.id}_cant`] || "0"}</td>
                                                        <td className="px-4 py-2 border text-center">
                                                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                                formData.necesidades[`rrhh_${item.id}_prior`] === "alta" ? "bg-red-100 text-red-700" :
                                                                formData.necesidades[`rrhh_${item.id}_prior`] === "media" ? "bg-yellow-100 text-yellow-700" :
                                                                formData.necesidades[`rrhh_${item.id}_prior`] === "baja" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                                                            }`}>
                                                                {formData.necesidades[`rrhh_${item.id}_prior`] ? formData.necesidades[`rrhh_${item.id}_prior`].charAt(0).toUpperCase() + formData.necesidades[`rrhh_${item.id}_prior`].slice(1) : "-"}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : <p className="text-sm text-gray-500 mb-6 italic">No se registraron necesidades de recursos humanos.</p>;
                                })()}

                                {/* 7.7 Capacitación para Telesalud - Tabla */}
                                <h4 className="font-semibold text-gray-700 mb-3">7.7 Capacitación para Telesalud</h4>
                                {(() => {
                                    const capacItems = [
                                        { label: "Uso de plataformas de telesalud", id: "usoPlataformas", num: "7.7.1" },
                                        { label: "Seguridad de la información", id: "seguridadInfo", num: "7.7.2" },
                                        { label: "Protocolos clínicos", id: "protocolosClinicos", num: "7.7.3" },
                                    ].filter(item => formData.necesidades[`capac_${item.id}_cant`] || formData.necesidades[`capac_${item.id}_prior`]);

                                    return capacItems.length > 0 ? (
                                        <table className="w-full text-sm border-collapse mb-6">
                                            <thead>
                                                <tr className="bg-[#0A5BA9] text-white">
                                                    <th className="px-4 py-2 text-left">Capacitación</th>
                                                    <th className="px-4 py-2 text-center w-24">Participantes</th>
                                                    <th className="px-4 py-2 text-center w-24">Prioridad</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {capacItems.map((item, idx) => (
                                                    <tr key={item.id} className={idx % 2 === 0 ? "bg-gray-50" : ""}>
                                                        <td className="px-4 py-2 border">{item.num} {item.label}</td>
                                                        <td className="px-4 py-2 border text-center font-medium">{formData.necesidades[`capac_${item.id}_cant`] || "0"}</td>
                                                        <td className="px-4 py-2 border text-center">
                                                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                                formData.necesidades[`capac_${item.id}_prior`] === "alta" ? "bg-red-100 text-red-700" :
                                                                formData.necesidades[`capac_${item.id}_prior`] === "media" ? "bg-yellow-100 text-yellow-700" :
                                                                formData.necesidades[`capac_${item.id}_prior`] === "baja" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                                                            }`}>
                                                                {formData.necesidades[`capac_${item.id}_prior`] ? formData.necesidades[`capac_${item.id}_prior`].charAt(0).toUpperCase() + formData.necesidades[`capac_${item.id}_prior`].slice(1) : "-"}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : <p className="text-sm text-gray-500 mb-6 italic">No se registraron necesidades de capacitación.</p>;
                                })()}

                                {/* 7.8 Observaciones y Comentarios Adicionales */}
                                {(formData.necesidades.necesidadesConectividad || formData.necesidades.necesidadesCapacitacion || formData.necesidades.observacionesGenerales || formData.necesidades.observacionesFinales) && (
                                    <div className="space-y-4">
                                        <h4 className="font-semibold text-gray-700">7.8 Observaciones y Comentarios Adicionales</h4>
                                        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                                            {formData.necesidades.necesidadesConectividad && (
                                                <div className="bg-white p-4 rounded border border-gray-200">
                                                    <span className="text-xs text-gray-500 block mb-1">Necesidades de Conectividad</span>
                                                    <p className="text-sm text-gray-800">{formData.necesidades.necesidadesConectividad}</p>
                                                </div>
                                            )}
                                            {formData.necesidades.necesidadesCapacitacion && (
                                                <div className="bg-white p-4 rounded border border-gray-200">
                                                    <span className="text-xs text-gray-500 block mb-1">Necesidades de Capacitación</span>
                                                    <p className="text-sm text-gray-800">{formData.necesidades.necesidadesCapacitacion}</p>
                                                </div>
                                            )}
                                            {(formData.necesidades.observacionesGenerales || formData.necesidades.observacionesFinales) && (
                                                <div className="bg-white p-4 rounded border border-blue-200 border-l-4 border-l-[#0A5BA9]">
                                                    <span className="text-xs text-gray-500 block mb-1">Observaciones Generales</span>
                                                    <p className="text-sm text-gray-800">{formData.necesidades.observacionesGenerales || formData.necesidades.observacionesFinales}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Indicador de estado del formulario */}
                {estadoFormulario && (
                    <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${
                        estadoFormulario === "BORRADOR" ? "bg-yellow-50 text-yellow-700 border border-yellow-200" :
                        estadoFormulario === "ENVIADO" ? "bg-green-50 text-green-700 border border-green-200" :
                        "bg-gray-50 text-gray-700 border border-gray-200"
                    }`}>
                        {estadoFormulario === "BORRADOR" && <AlertCircle className="w-5 h-5" />}
                        {estadoFormulario === "ENVIADO" && <CheckCircle2 className="w-5 h-5" />}
                        <span className="font-medium">
                            Estado: {estadoFormulario === "BORRADOR" ? "Borrador (no enviado)" :
                                    estadoFormulario === "ENVIADO" ? "Formulario enviado" :
                                    estadoFormulario}
                        </span>
                        {idFormulario && <span className="text-sm opacity-70 ml-2">(ID: {idFormulario})</span>}
                    </div>
                )}

                {/* Barra de acciones */}
                <div className="mt-4 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            {activeTab === "vista-previa" ? (
                                <>
                                    {/* Solo mostrar Editar y Descartar si NO está enviado ni firmado */}
                                    {estadoFormulario !== "ENVIADO" && estadoFormulario !== "FIRMADO" && (
                                        <>
                                            <button
                                                onClick={() => {
                                                    setActiveTab("necesidades");
                                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                                }}
                                                className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                                Editar Formulario
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (window.confirm("¿Está seguro de descartar el formulario? Se perderán todos los datos ingresados.")) {
                                                        setFormData({
                                                            fechaDiagnostico: new Date().toISOString().split("T")[0],
                                                            responsableTecnico: { nombre: "", cargo: "", correo: "", telefono: "" },
                                                            responsableAdministrativo: { nombre: "", cargo: "", correo: "", telefono: "" },
                                                            profesionales: [],
                                                            tecnicos: [],
                                                            administrativos: [],
                                                            teleoperadores: [],
                                                            ambientes: { cantidad: "", espacioAdecuado: "", observaciones: "" },
                                                            mobiliario: { escritorios: "", sillas: "", otroMobiliario: "", observaciones: "" },
                                                            condiciones: { iluminacion: "", ventilacion: "", privacidad: "", accesibilidad: "", observaciones: "" },
                                                            equipos: { computadoras: { cantidad: 0, estado: "-" }, laptops: { cantidad: 0, estado: "-" }, tablets: { cantidad: 0, estado: "-" }, impresoras: { cantidad: 0, estado: "-" }, scanners: { cantidad: 0, estado: "-" } },
                                                            videoconferencia: { camarasWeb: { cantidad: 0, estado: "-" }, microfonos: { cantidad: 0, estado: "-" }, parlantes: { cantidad: 0, estado: "-" }, audifonos: { cantidad: 0, estado: "-" } },
                                                            medico: { estetoscopioDigital: { cantidad: 0, estado: "-" }, dermatoscopio: { cantidad: 0, estado: "-" }, otoscopio: { cantidad: 0, estado: "-" }, tensiometroDigital: { cantidad: 0, estado: "-" }, pulsioximetro: { cantidad: 0, estado: "-" }, glucometro: { cantidad: 0, estado: "-" }, termometroDigital: { cantidad: 0, estado: "-" }, electrocardiografo: { cantidad: 0, estado: "-" } },
                                                            conectividad: { tipoConexion: "", proveedor: "", velocidadContratada: "", velocidadReal: "", estabilidad: "", vpn: "" },
                                                            serviciosTelesalud: { teleconsulta: false, teleorientacion: false, telemonitoreo: false, teleinterconsulta: false, telediagnostico: false, especialidades: "" },
                                                            necesidades: {
                                                                infraestructura: { espacioFisico: { cantidad: 0, prioridad: "-" }, escritorios: { cantidad: 0, prioridad: "-" }, sillas: { cantidad: 0, prioridad: "-" } },
                                                                equipamiento: { computadoras: { cantidad: 0, prioridad: "-" }, laptops: { cantidad: 0, prioridad: "-" }, camaras: { cantidad: 0, prioridad: "-" } },
                                                                conectividad: { mejoraAnchoBanda: false, instalacionVPN: false, otrasNecesidades: "" },
                                                                capacitacion: { telesalud: false, equiposMedicos: false, plataformas: false, otrasCapacitaciones: "" },
                                                                observacionesGenerales: ""
                                                            }
                                                        });
                                                        setIdFormulario(null);
                                                        setEstadoFormulario("NUEVO");
                                                        setVistaPreviaHabilitada(false);
                                                        setActiveTab("datos-generales");
                                                        setCurrentView("instrucciones");
                                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                                        toast.success("Formulario descartado correctamente");
                                                    }
                                                }}
                                                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Descartar Formulario
                                            </button>
                                        </>
                                    )}
                                    {/* Botón Regresar a Inicio cuando está enviado o firmado */}
                                    {(estadoFormulario === "ENVIADO" || estadoFormulario === "FIRMADO") && (
                                        <button
                                            onClick={() => {
                                                // Recargar documentos enviados
                                                const idIpress = datosUsuario?.id_ipress || datosUsuario?.personalExterno?.ipress?.idIpress;
                                                if (idIpress) {
                                                    cargarDocumentosEnviados(idIpress);
                                                }
                                                setCurrentView("instrucciones");
                                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                            }}
                                            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all"
                                        >
                                            <Home className="w-4 h-4" />
                                            Regresar a Inicio
                                        </button>
                                    )}
                                </>
                            ) : (
                                <button
                                    onClick={() => setCurrentView("instrucciones")}
                                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Volver a Instrucciones
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            {activeTab !== "vista-previa" && (
                                <button
                                    onClick={handleSaveProgress}
                                    disabled={guardando || estadoFormulario === "ENVIADO"}
                                    className={`flex items-center gap-2 px-5 py-2.5 font-medium rounded-lg transition-all ${
                                        guardando || estadoFormulario === "ENVIADO"
                                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                            : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                                    }`}
                                >
                                    {guardando ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Save className="w-4 h-4" />
                                    )}
                                    {guardando ? "Guardando..." : "Guardar Progreso"}
                                </button>
                            )}

                            {activeTab === "vista-previa" ? (
                                <div className="flex items-center gap-3">
                                    {/* Solo mostrar Previsualizar PDF si NO está enviado ni firmado */}
                                    {estadoFormulario !== "ENVIADO" && estadoFormulario !== "FIRMADO" && (
                                        <button
                                            onClick={handleDescargarPDF}
                                            className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-all shadow-lg"
                                        >
                                            <Eye className="w-4 h-4" />
                                            Previsualizar PDF
                                        </button>
                                    )}
                                    {estadoFormulario !== "ENVIADO" && estadoFormulario !== "FIRMADO" && (
                                        <>
                                            <button
                                                onClick={handleEnviarSinFirma}
                                                disabled={enviando}
                                                className={`flex items-center gap-2 px-6 py-2.5 font-medium rounded-lg transition-all shadow-lg ${
                                                    enviando
                                                        ? "bg-blue-400 cursor-not-allowed"
                                                        : "bg-blue-600 hover:bg-blue-700"
                                                } text-white`}
                                            >
                                                {enviando ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Send className="w-4 h-4" />
                                                )}
                                                Enviar
                                            </button>
                                        </>
                                    )}
                                    {estadoFormulario === "FIRMADO" && (
                                        <div className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg">
                                            <Shield className="w-4 h-4" />
                                            <span className="font-medium">Formulario Firmado</span>
                                        </div>
                                    )}
                                    {estadoFormulario === "ENVIADO" && (
                                        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-100 text-green-700">
                                            <Send className="w-4 h-4" />
                                            <span className="font-medium">Enviado</span>
                                        </div>
                                    )}
                                </div>
                            ) : activeTab === "necesidades" ? (
                                <button
                                    onClick={handleGenerarPDF}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-all"
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    Terminar Formulario
                                </button>
                            ) : (
                                <button
                                    onClick={handleNextTab}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-[#0A5BA9] hover:bg-[#094580] text-white font-medium rounded-lg transition-all"
                                >
                                    Siguiente Hoja
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // ========== RENDER PRINCIPAL ==========
    return (
        <>
            {currentView === "instrucciones" ? renderInstrucciones() : renderFormulario()}

            {/* Modal de Firma Digital */}
            <FirmaDigitalModal
                isOpen={mostrarModalFirma}
                onClose={() => setMostrarModalFirma(false)}
                onFirmaExitosa={handleFirmaExitosa}
                idFormulario={idFormulario}
                pdfBase64={pdfParaFirmar}
                datosUsuario={{
                    nombreCompleto: datosUsuario?.nombre_completo || user?.name || "Usuario",
                    dni: datosUsuario?.dni || user?.dni || ""
                }}
            />
        </>
    );
}

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../services/apiClient";
import formularioDiagnosticoService from "../../../services/formularioDiagnosticoService";
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
    Loader2
} from "lucide-react";

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
    const [estadoFormulario, setEstadoFormulario] = useState(null); // BORRADOR, ENVIADO, etc.
    const [guardando, setGuardando] = useState(false);
    const [enviando, setEnviando] = useState(false);
    const [cargandoBorrador, setCargandoBorrador] = useState(false);

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
                        }
                    }
                } catch (error) {
                    console.error("Error cargando datos del usuario:", error);
                }
            }
        };
        cargarDatosUsuario();
    }, [user]);

    // Función para cargar borrador existente
    const cargarBorradorExistente = async (idIpress) => {
        setCargandoBorrador(true);
        try {
            const borrador = await formularioDiagnosticoService.obtenerBorradorPorIpress(idIpress);
            if (borrador) {
                // Transformar datos del backend al formato frontend
                const datosTransformados = formularioDiagnosticoService.transformarParaFrontend(borrador);
                if (datosTransformados) {
                    setIdFormulario(datosTransformados.idFormulario);
                    setEstadoFormulario(datosTransformados.estado);
                    setFormData({
                        datosGenerales: datosTransformados.datosGenerales || {},
                        recursosHumanos: datosTransformados.recursosHumanos || {},
                        infraestructura: datosTransformados.infraestructura || {},
                        equipamiento: datosTransformados.equipamiento || {},
                        conectividad: datosTransformados.conectividad || {},
                        servicios: datosTransformados.servicios || {},
                        necesidades: datosTransformados.necesidades || {}
                    });
                    toast.success("Se cargó el borrador existente");
                }
            }
        } catch (error) {
            console.error("Error cargando borrador:", error);
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
    };

    // Ir al siguiente tab
    const handleNextTab = () => {
        const currentIndex = TABS_CONFIG.findIndex(t => t.id === activeTab);
        if (currentIndex < TABS_CONFIG.length - 1) {
            setActiveTab(TABS_CONFIG[currentIndex + 1].id);
        }
    };

    // Ir al tab anterior
    const handlePrevTab = () => {
        const currentIndex = TABS_CONFIG.findIndex(t => t.id === activeTab);
        if (currentIndex > 0) {
            setActiveTab(TABS_CONFIG[currentIndex - 1].id);
        }
    };

    // Guardar progreso en el backend
    const handleSaveProgress = async () => {
        const idIpress = datosUsuario?.id_ipress || datosUsuario?.personalExterno?.ipress?.idIpress;
        if (!idIpress) {
            toast.error("No se pudo identificar la IPRESS del usuario");
            return;
        }

        setGuardando(true);
        try {
            // Transformar datos al formato del backend
            const datosParaBackend = formularioDiagnosticoService.transformarParaBackend(
                formData,
                idIpress,
                idFormulario
            );

            // Guardar en el backend
            const response = await formularioDiagnosticoService.guardarBorrador(datosParaBackend);

            if (response) {
                setIdFormulario(response.idFormulario);
                setEstadoFormulario(response.estado);
                toast.success("Progreso guardado correctamente");
            }
        } catch (error) {
            console.error("Error guardando progreso:", error);
            toast.error("Error al guardar el progreso. Intente nuevamente.");
            // Fallback: guardar en localStorage
            localStorage.setItem("formulario_diagnostico_progress", JSON.stringify(formData));
        } finally {
            setGuardando(false);
        }
    };

    // Enviar formulario (cambiar estado a ENVIADO)
    const handleEnviarFormulario = async () => {
        if (!idFormulario) {
            // Primero guardar el formulario
            await handleSaveProgress();
        }

        if (!idFormulario) {
            toast.error("Debe guardar el formulario antes de enviarlo");
            return;
        }

        setEnviando(true);
        try {
            const response = await formularioDiagnosticoService.enviar(idFormulario);
            if (response) {
                setEstadoFormulario(response.estado);
                toast.success("Formulario enviado correctamente");
            }
        } catch (error) {
            console.error("Error enviando formulario:", error);
            toast.error("Error al enviar el formulario. Intente nuevamente.");
        } finally {
            setEnviando(false);
        }
    };

    // Generar vista previa del PDF
    const handleGenerarPDF = () => {
        setVistaPreviaHabilitada(true);
        setActiveTab("vista-previa");
    };

    // Descargar PDF
    const handleDescargarPDF = () => {
        const doc = new jsPDF('p', 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 15;
        let currentY = margin;

        const nombreIpress = datosUsuario?.nombre_ipress || datosUsuario?.personalExterno?.ipress?.nombre || datosUsuario?.personalCnt?.ipress?.nombre || "IPRESS";
        const redAsistencial = datosUsuario?.nombre_red || datosUsuario?.personalExterno?.ipress?.redAsistencial?.nombre || datosUsuario?.personalCnt?.ipress?.redAsistencial?.nombre || "";
        const macroregion = datosUsuario?.nombre_macroregion || "";
        const fechaActual = new Date().toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' });

        // Función para agregar encabezado en cada página
        const addHeader = (pageNum) => {
            // Fondo del encabezado
            doc.setFillColor(10, 91, 169);
            doc.rect(0, 0, pageWidth, 35, 'F');

            // Título
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text("DIAGNÓSTICO SITUACIONAL DE TELESALUD", pageWidth / 2, 12, { align: 'center' });

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`IPRESS: ${nombreIpress}`, pageWidth / 2, 20, { align: 'center' });
            doc.text(`Red Asistencial: ${redAsistencial}`, pageWidth / 2, 26, { align: 'center' });

            // Número de página
            doc.setFontSize(8);
            doc.text(`Página ${pageNum} de 6`, pageWidth - margin, 32, { align: 'right' });

            return 45; // Retorna la posición Y después del header
        };

        // Función para agregar pie de página
        const addFooter = () => {
            doc.setFillColor(10, 91, 169);
            doc.rect(0, pageHeight - 15, pageWidth, 15, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(8);
            doc.text("CENATE - Centro Nacional de Telemedicina", pageWidth / 2, pageHeight - 8, { align: 'center' });
            doc.text(fechaActual, pageWidth - margin, pageHeight - 8, { align: 'right' });
        };

        // Función auxiliar para agregar sección con título
        const addSectionTitle = (title, y) => {
            doc.setFillColor(10, 91, 169);
            doc.rect(margin, y, pageWidth - 2 * margin, 8, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text(title, margin + 3, y + 5.5);
            doc.setTextColor(0, 0, 0);
            return y + 12;
        };

        // Función para agregar fila de datos
        const addDataRow = (label, value, y, labelWidth = 70) => {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(9);
            doc.text(label + ":", margin, y);
            doc.setFont('helvetica', 'normal');
            const displayValue = value || "No especificado";
            doc.text(String(displayValue), margin + labelWidth, y);
            return y + 6;
        };

        // ==================== PÁGINA 1: DATOS GENERALES ====================
        currentY = addHeader(1);
        currentY = addSectionTitle("I. DATOS GENERALES DEL ESTABLECIMIENTO DE SALUD", currentY);

        currentY = addDataRow("Nombre IPRESS", nombreIpress, currentY);
        currentY = addDataRow("Red Asistencial", redAsistencial, currentY);
        currentY = addDataRow("Macroregión", macroregion, currentY);
        currentY = addDataRow("Categoría", formData.datosGenerales.categoria, currentY);
        currentY = addDataRow("Tipo de Establecimiento", formData.datosGenerales.tipoEstablecimiento, currentY);
        currentY = addDataRow("Ubicación", formData.datosGenerales.ubicacion, currentY);
        currentY = addDataRow("Departamento", formData.datosGenerales.departamento, currentY);
        currentY = addDataRow("Provincia", formData.datosGenerales.provincia, currentY);
        currentY = addDataRow("Distrito", formData.datosGenerales.distrito, currentY);
        currentY = addDataRow("Dirección", formData.datosGenerales.direccion, currentY);
        currentY = addDataRow("Teléfono", formData.datosGenerales.telefono, currentY);
        currentY = addDataRow("Correo Electrónico", formData.datosGenerales.correo, currentY);
        currentY = addDataRow("Director/Jefe", formData.datosGenerales.director, currentY);

        addFooter();

        // ==================== PÁGINA 2: RECURSOS HUMANOS ====================
        doc.addPage();
        currentY = addHeader(2);
        currentY = addSectionTitle("II. RECURSOS HUMANOS", currentY);

        // Tabla de profesionales
        const rhData = [
            ["Médicos", formData.recursosHumanos.medicos || "0", formData.recursosHumanos.medicosCapacitados || "0"],
            ["Enfermeras", formData.recursosHumanos.enfermeras || "0", formData.recursosHumanos.enfermerasCapacitadas || "0"],
            ["Obstetras", formData.recursosHumanos.obstetras || "0", formData.recursosHumanos.obstetrasCapacitados || "0"],
            ["Técnicos de Enfermería", formData.recursosHumanos.tecnicos || "0", formData.recursosHumanos.tecnicosCapacitados || "0"],
            ["Personal Administrativo", formData.recursosHumanos.administrativos || "0", formData.recursosHumanos.administrativosCapacitados || "0"],
            ["Personal Informático", formData.recursosHumanos.informaticos || "0", formData.recursosHumanos.informaticosCapacitados || "0"],
        ];

        autoTable(doc, {
            startY: currentY,
            head: [["PROFESIONAL", "CANTIDAD TOTAL", "CAPACITADOS EN TELESALUD"]],
            body: rhData,
            theme: 'grid',
            headStyles: { fillColor: [10, 91, 169], fontSize: 9 },
            bodyStyles: { fontSize: 9 },
            margin: { left: margin, right: margin },
            columnStyles: {
                0: { cellWidth: 80 },
                1: { cellWidth: 40, halign: 'center' },
                2: { cellWidth: 50, halign: 'center' }
            }
        });

        currentY = doc.lastAutoTable.finalY + 10;
        currentY = addDataRow("Responsable de Telesalud", formData.recursosHumanos.responsableTelesalud, currentY);
        currentY = addDataRow("Cargo", formData.recursosHumanos.cargoResponsable, currentY);
        currentY = addDataRow("Teléfono de contacto", formData.recursosHumanos.telefonoResponsable, currentY);
        currentY = addDataRow("Correo del responsable", formData.recursosHumanos.correoResponsable, currentY);

        addFooter();

        // ==================== PÁGINA 3: INFRAESTRUCTURA ====================
        doc.addPage();
        currentY = addHeader(3);
        currentY = addSectionTitle("III. INFRAESTRUCTURA", currentY);

        const infraData = [
            ["Teleconsultorio exclusivo", formData.infraestructura.teleconsultorio || "No", formData.infraestructura.teleconsultorioArea || "-"],
            ["Ambiente compartido", formData.infraestructura.ambienteCompartido || "No", formData.infraestructura.ambienteCompartidoArea || "-"],
            ["Sala de espera", formData.infraestructura.salaEspera || "No", formData.infraestructura.salaEsperaArea || "-"],
            ["Ambiente administrativo", formData.infraestructura.ambienteAdmin || "No", formData.infraestructura.ambienteAdminArea || "-"],
        ];

        autoTable(doc, {
            startY: currentY,
            head: [["AMBIENTE", "DISPONIBLE", "ÁREA (m²)"]],
            body: infraData,
            theme: 'grid',
            headStyles: { fillColor: [10, 91, 169], fontSize: 9 },
            bodyStyles: { fontSize: 9 },
            margin: { left: margin, right: margin }
        });

        currentY = doc.lastAutoTable.finalY + 10;
        currentY = addDataRow("Conexión eléctrica estable", formData.infraestructura.conexionElectrica, currentY);
        currentY = addDataRow("Sistema de UPS/Respaldo", formData.infraestructura.sistemaUPS, currentY);
        currentY = addDataRow("Aire acondicionado", formData.infraestructura.aireAcondicionado, currentY);
        currentY = addDataRow("Iluminación adecuada", formData.infraestructura.iluminacion, currentY);
        currentY = addDataRow("Ventilación adecuada", formData.infraestructura.ventilacion, currentY);

        addFooter();

        // ==================== PÁGINA 4: EQUIPAMIENTO ====================
        doc.addPage();
        currentY = addHeader(4);
        currentY = addSectionTitle("IV. EQUIPAMIENTO", currentY);

        currentY = addSectionTitle("4.1 Equipos Informáticos", currentY);
        const equipInfoData = [
            ["Computadoras de escritorio", formData.equipamiento.computadoras || "0", formData.equipamiento.computadorasOperativas || "0"],
            ["Laptops", formData.equipamiento.laptops || "0", formData.equipamiento.laptopsOperativas || "0"],
            ["Monitores", formData.equipamiento.monitores || "0", formData.equipamiento.monitoresOperativos || "0"],
            ["Cámaras web HD", formData.equipamiento.camaras || "0", formData.equipamiento.camarasOperativas || "0"],
            ["Audífonos/Micrófonos", formData.equipamiento.audifonos || "0", formData.equipamiento.audifonosOperativos || "0"],
            ["Impresoras", formData.equipamiento.impresoras || "0", formData.equipamiento.impresorasOperativas || "0"],
        ];

        autoTable(doc, {
            startY: currentY,
            head: [["EQUIPO", "CANTIDAD", "OPERATIVOS"]],
            body: equipInfoData,
            theme: 'grid',
            headStyles: { fillColor: [10, 91, 169], fontSize: 9 },
            bodyStyles: { fontSize: 9 },
            margin: { left: margin, right: margin }
        });

        currentY = doc.lastAutoTable.finalY + 8;
        currentY = addSectionTitle("4.2 Equipos Biomédicos Digitales", currentY);
        const equipBioData = [
            ["Estetoscopio digital", formData.equipamiento.estetoscopio || "No", formData.equipamiento.estetoscopioOperativo || "-"],
            ["Otoscopio digital", formData.equipamiento.otoscopio || "No", formData.equipamiento.otoscopioOperativo || "-"],
            ["Dermatoscopio digital", formData.equipamiento.dermatoscopio || "No", formData.equipamiento.dermatoscopioOperativo || "-"],
            ["Electrocardiógrafo digital", formData.equipamiento.electrocardiografo || "No", formData.equipamiento.electrocardiografoOperativo || "-"],
            ["Pulsioxímetro", formData.equipamiento.pulsioximetro || "No", formData.equipamiento.pulsioximetroOperativo || "-"],
        ];

        autoTable(doc, {
            startY: currentY,
            head: [["EQUIPO BIOMÉDICO", "DISPONIBLE", "OPERATIVO"]],
            body: equipBioData,
            theme: 'grid',
            headStyles: { fillColor: [10, 91, 169], fontSize: 9 },
            bodyStyles: { fontSize: 9 },
            margin: { left: margin, right: margin }
        });

        addFooter();

        // ==================== PÁGINA 5: CONECTIVIDAD Y SERVICIOS ====================
        doc.addPage();
        currentY = addHeader(5);
        currentY = addSectionTitle("V. CONECTIVIDAD", currentY);

        currentY = addDataRow("Tipo de conexión", formData.conectividad.tipoConexion, currentY);
        currentY = addDataRow("Proveedor de internet", formData.conectividad.proveedor, currentY);
        currentY = addDataRow("Velocidad contratada (Mbps)", formData.conectividad.velocidad, currentY);
        currentY = addDataRow("Velocidad real (Mbps)", formData.conectividad.velocidadReal, currentY);
        currentY = addDataRow("Estabilidad de conexión", formData.conectividad.estabilidad, currentY);
        currentY = addDataRow("Acceso a VPN institucional", formData.conectividad.vpn, currentY);
        currentY = addDataRow("Red LAN disponible", formData.conectividad.redLan, currentY);
        currentY = addDataRow("WiFi disponible", formData.conectividad.wifi, currentY);

        currentY += 5;
        currentY = addSectionTitle("VI. SERVICIOS DE TELESALUD", currentY);

        currentY = addDataRow("Teleconsulta", formData.servicios.teleconsulta, currentY);
        currentY = addDataRow("Teleorientación", formData.servicios.teleorientacion, currentY);
        currentY = addDataRow("Telemonitoreo", formData.servicios.telemonitoreo, currentY);
        currentY = addDataRow("Teleinterconsulta", formData.servicios.teleinterconsulta, currentY);
        currentY = addDataRow("Teletriaje", formData.servicios.teletriaje, currentY);
        currentY = addDataRow("Telediagnóstico", formData.servicios.telediagnostico, currentY);
        currentY = addDataRow("Teleapoyo diagnóstico", formData.servicios.teleapoyo, currentY);
        currentY = addDataRow("Especialidades con telesalud", formData.servicios.especialidades, currentY);

        addFooter();

        // ==================== PÁGINA 6: NECESIDADES Y REQUERIMIENTOS ====================
        doc.addPage();
        currentY = addHeader(6);
        currentY = addSectionTitle("VII. NECESIDADES Y REQUERIMIENTOS", currentY);

        currentY = addSectionTitle("7.1 Infraestructura Física", currentY);
        const needsInfra = [
            ["Espacio físico para teleconsultorio", formData.necesidades.infra_espacioFisico_cant || "0", formData.necesidades.infra_espacioFisico_prior || "-"],
            ["Escritorio ergonómico", formData.necesidades.infra_escritorio_cant || "0", formData.necesidades.infra_escritorio_prior || "-"],
            ["Sillas ergonómicas", formData.necesidades.infra_sillas_cant || "0", formData.necesidades.infra_sillas_prior || "-"],
            ["Aire acondicionado", formData.necesidades.infra_aireAcond_cant || "0", formData.necesidades.infra_aireAcond_prior || "-"],
        ];

        autoTable(doc, {
            startY: currentY,
            head: [["REQUERIMIENTO", "CANTIDAD", "PRIORIDAD"]],
            body: needsInfra,
            theme: 'grid',
            headStyles: { fillColor: [10, 91, 169], fontSize: 8 },
            bodyStyles: { fontSize: 8 },
            margin: { left: margin, right: margin },
            tableWidth: 'auto'
        });

        currentY = doc.lastAutoTable.finalY + 5;
        currentY = addSectionTitle("7.2 Equipamiento Informático", currentY);
        const needsEquip = [
            ["Computadoras", formData.necesidades.equip_computadora_cant || "0", formData.necesidades.equip_computadora_prior || "-"],
            ["Laptops", formData.necesidades.equip_laptop_cant || "0", formData.necesidades.equip_laptop_prior || "-"],
            ["Cámaras web HD", formData.necesidades.equip_camaraWeb_cant || "0", formData.necesidades.equip_camaraWeb_prior || "-"],
            ["Monitor", formData.necesidades.equip_monitor_cant || "0", formData.necesidades.equip_monitor_prior || "-"],
        ];

        autoTable(doc, {
            startY: currentY,
            head: [["REQUERIMIENTO", "CANTIDAD", "PRIORIDAD"]],
            body: needsEquip,
            theme: 'grid',
            headStyles: { fillColor: [10, 91, 169], fontSize: 8 },
            bodyStyles: { fontSize: 8 },
            margin: { left: margin, right: margin }
        });

        currentY = doc.lastAutoTable.finalY + 5;

        // Observaciones
        if (formData.necesidades.observacionesGenerales) {
            currentY = addSectionTitle("7.4 Observaciones Generales", currentY);
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            const splitText = doc.splitTextToSize(formData.necesidades.observacionesGenerales, pageWidth - 2 * margin);
            doc.text(splitText, margin, currentY);
        }

        addFooter();

        // Guardar el PDF
        doc.save(`Diagnostico_Telesalud_${nombreIpress.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
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

            <div className="relative z-10 max-w-5xl mx-auto px-4 py-6">
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
                <div className="max-w-7xl mx-auto">
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
            <div className="max-w-6xl mx-auto px-4 py-6">
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
                                                Nombre y Apellido completo:
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
                                                Correo:
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
                                                Tel/Cel Director:
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
                                                Nombre y Apellido completo:
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
                                                Correo:
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
                                                Tel/Cel Responsable o Coordinador:
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
                                            Población adscrita:
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
                                            Promedio de atenciones mensuales:
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
                                        ¿La IPRESS designa, mediante documento formal, a un Coordinador de Telesalud o profesional de la salud responsable de la implementación y articulación de los servicios de Telesalud en el establecimiento de salud?
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
                                        Durante la prestación de dichos servicios, ¿la IPRESS asigna un personal de apoyo, conformado por profesionales, técnicos o auxiliares de la salud, personal de soporte TIC o administrativo, encargado de garantizar una atención adecuada y oportuna al usuario?
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
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    value={formData.recursosHumanos[item.id] || ""}
                                                                    onChange={(e) => handleInputChange("recursosHumanos", item.id, e.target.value)}
                                                                    className="w-20 px-3 py-2 bg-yellow-50 border-2 border-yellow-300 rounded-lg text-center focus:border-[#0A5BA9] focus:ring-2 focus:ring-[#0A5BA9]/20"
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
                                                <th className="px-4 py-3 text-left font-medium">PREGUNTA</th>
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
                                        ¿Cuántas capacitaciones en Telesalud se han realizado en el último año?
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.recursosHumanos.capacitacionesAnio || ""}
                                        onChange={(e) => handleInputChange("recursosHumanos", "capacitacionesAnio", e.target.value)}
                                        className="w-full max-w-xs px-4 py-3 bg-yellow-50 border-2 border-yellow-300 rounded-lg focus:border-[#0A5BA9] focus:ring-2 focus:ring-[#0A5BA9]/20"
                                        placeholder="0"
                                    />
                                </div>

                                {/* Pregunta 2.2.6 */}
                                <div>
                                    <label className="block text-gray-700 mb-2">
                                        <span className="text-[#0A5BA9] font-bold mr-2">2.2.6</span>
                                        Principales necesidades(temas) de capacitación identificadas:
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
                                                    <th className="px-4 py-3 text-left font-medium">PREGUNTA</th>
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
                                            Número de ambientes/consultorios destinados a Telesalud:
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.infraestructura.numAmbientes || ""}
                                            onChange={(e) => handleInputChange("infraestructura", "numAmbientes", e.target.value)}
                                            className="w-full max-w-xs px-4 py-3 bg-yellow-50 border-2 border-yellow-300 rounded-lg focus:border-[#0A5BA9] focus:ring-2 focus:ring-[#0A5BA9]/20"
                                            placeholder="0"
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
                                                <th className="px-4 py-3 text-left font-medium">PREGUNTA</th>
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
                                                <th className="px-3 py-3 text-center font-medium w-28">¿DISPONIBLE?</th>
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
                                                return (
                                                    <tr key={index} className={index % 2 === 0 ? "bg-blue-50" : "bg-white"}>
                                                        <td className="px-3 py-2 border-b border-gray-200 text-center font-medium text-[#0A5BA9]">
                                                            4.1.{index + 1}
                                                        </td>
                                                        <td className="px-3 py-2 border-b border-gray-200">{equipo}</td>
                                                        <td className="px-3 py-2 border-b border-gray-200 text-center">
                                                            <select
                                                                value={formData.equipamiento[`${fieldId}_disponible`] || ""}
                                                                onChange={(e) => handleInputChange("equipamiento", `${fieldId}_disponible`, e.target.value)}
                                                                className="w-full px-2 py-1.5 bg-yellow-50 border-2 border-yellow-300 rounded text-sm focus:border-[#0A5BA9]"
                                                            >
                                                                <option value="">Sel.</option>
                                                                <option value="si">Sí</option>
                                                                <option value="no">No</option>
                                                            </select>
                                                        </td>
                                                        <td className="px-3 py-2 border-b border-gray-200 text-center">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                value={formData.equipamiento[`${fieldId}_cantidad`] || ""}
                                                                onChange={(e) => handleInputChange("equipamiento", `${fieldId}_cantidad`, e.target.value)}
                                                                className="w-16 px-2 py-1.5 bg-yellow-50 border-2 border-yellow-300 rounded text-center text-sm focus:border-[#0A5BA9]"
                                                            />
                                                        </td>
                                                        <td className="px-3 py-2 border-b border-gray-200 text-center">
                                                            <select
                                                                value={formData.equipamiento[`${fieldId}_estado`] || ""}
                                                                onChange={(e) => handleInputChange("equipamiento", `${fieldId}_estado`, e.target.value)}
                                                                className="w-full px-2 py-1.5 bg-yellow-50 border-2 border-yellow-300 rounded text-sm focus:border-[#0A5BA9]"
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
                                                                className="w-full px-2 py-1.5 bg-yellow-50 border-2 border-yellow-300 rounded text-sm focus:border-[#0A5BA9]"
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
                                                <th className="px-3 py-3 text-center font-medium w-28">¿DISPONIBLE?</th>
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
                                                return (
                                                    <tr key={index} className={index % 2 === 0 ? "bg-blue-50" : "bg-white"}>
                                                        <td className="px-3 py-2 border-b border-gray-200 text-center font-medium text-[#0A5BA9]">
                                                            4.2.{index + 1}
                                                        </td>
                                                        <td className="px-3 py-2 border-b border-gray-200">{equipo}</td>
                                                        <td className="px-3 py-2 border-b border-gray-200 text-center">
                                                            <select
                                                                value={formData.equipamiento[`${fieldId}_disponible`] || ""}
                                                                onChange={(e) => handleInputChange("equipamiento", `${fieldId}_disponible`, e.target.value)}
                                                                className="w-full px-2 py-1.5 bg-yellow-50 border-2 border-yellow-300 rounded text-sm focus:border-[#0A5BA9]"
                                                            >
                                                                <option value="">Sel.</option>
                                                                <option value="si">Sí</option>
                                                                <option value="no">No</option>
                                                            </select>
                                                        </td>
                                                        <td className="px-3 py-2 border-b border-gray-200 text-center">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                value={formData.equipamiento[`${fieldId}_cantidad`] || ""}
                                                                onChange={(e) => handleInputChange("equipamiento", `${fieldId}_cantidad`, e.target.value)}
                                                                className="w-16 px-2 py-1.5 bg-yellow-50 border-2 border-yellow-300 rounded text-center text-sm focus:border-[#0A5BA9]"
                                                            />
                                                        </td>
                                                        <td className="px-3 py-2 border-b border-gray-200 text-center">
                                                            <select
                                                                value={formData.equipamiento[`${fieldId}_estado`] || ""}
                                                                onChange={(e) => handleInputChange("equipamiento", `${fieldId}_estado`, e.target.value)}
                                                                className="w-full px-2 py-1.5 bg-yellow-50 border-2 border-yellow-300 rounded text-sm focus:border-[#0A5BA9]"
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
                                                                className="w-full px-2 py-1.5 bg-yellow-50 border-2 border-yellow-300 rounded text-sm focus:border-[#0A5BA9]"
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
                                        <input type="text"
                                            value={formData.conectividad.proveedor || ""}
                                            onChange={(e) => handleInputChange("conectividad", "proveedor", e.target.value)}
                                            className="w-full px-4 py-3 bg-yellow-50 border-2 border-yellow-300 rounded-lg focus:border-[#0A5BA9]"
                                            placeholder="Ej: Movistar, Claro..." />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <span className="text-[#0A5BA9] font-bold mr-2">5.1.8</span>Velocidad contratada (Mbps):
                                        </label>
                                        <input type="number" min="0"
                                            value={formData.conectividad.velocidadContratada || ""}
                                            onChange={(e) => handleInputChange("conectividad", "velocidadContratada", e.target.value)}
                                            className="w-full px-4 py-3 bg-yellow-50 border-2 border-yellow-300 rounded-lg focus:border-[#0A5BA9]" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <span className="text-[#0A5BA9] font-bold mr-2">5.1.9</span>Velocidad real promedio (Mbps):
                                        </label>
                                        <input type="number" min="0"
                                            value={formData.conectividad.velocidadReal || ""}
                                            onChange={(e) => handleInputChange("conectividad", "velocidadReal", e.target.value)}
                                            className="w-full px-4 py-3 bg-yellow-50 border-2 border-yellow-300 rounded-lg focus:border-[#0A5BA9]" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            <span className="text-[#0A5BA9] font-bold mr-2">5.1.10</span>N° de puntos de red:
                                        </label>
                                        <input type="number" min="0"
                                            value={formData.conectividad.numPuntosRed || ""}
                                            onChange={(e) => handleInputChange("conectividad", "numPuntosRed", e.target.value)}
                                            className="w-full px-4 py-3 bg-yellow-50 border-2 border-yellow-300 rounded-lg focus:border-[#0A5BA9]" />
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
                                                <th className="px-3 py-3 text-center font-medium w-24">SÍ/NO</th>
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
                                            ].map((item, index) => (
                                                <tr key={item.id} className={index % 2 === 0 ? "bg-blue-50" : "bg-white"}>
                                                    <td className="px-3 py-3 border-b border-gray-200 text-center font-medium text-[#0A5BA9]">
                                                        {item.num}
                                                    </td>
                                                    <td className="px-3 py-3 border-b border-gray-200">{item.label}</td>
                                                    <td className="px-3 py-3 border-b border-gray-200 text-center">
                                                        <select
                                                            value={formData.servicios[item.id] || ""}
                                                            onChange={(e) => handleInputChange("servicios", item.id, e.target.value)}
                                                            className="w-full px-2 py-1.5 bg-yellow-50 border-2 border-yellow-300 rounded text-sm focus:border-[#0A5BA9]"
                                                        >
                                                            <option value="">Sel.</option>
                                                            <option value="si">Sí</option>
                                                            <option value="no">No</option>
                                                        </select>
                                                    </td>
                                                    <td className="px-3 py-3 border-b border-gray-200">
                                                        <input
                                                            type="text"
                                                            value={formData.servicios[`${item.id}_obs`] || ""}
                                                            onChange={(e) => handleInputChange("servicios", `${item.id}_obs`, e.target.value)}
                                                            className="w-full px-2 py-1.5 bg-yellow-50 border-2 border-yellow-300 rounded text-sm focus:border-[#0A5BA9]"
                                                            placeholder="..."
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
                                                <th className="px-3 py-3 text-center font-medium w-32">CANTIDAD REQUERIDA</th>
                                                <th className="px-3 py-3 text-center font-medium w-36">PRIORIDAD (Alta/Media/Baja)</th>
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
                                                        <input type="number" min="0"
                                                            value={formData.necesidades[`infra_${item.id}_cant`] || ""}
                                                            onChange={(e) => handleInputChange("necesidades", `infra_${item.id}_cant`, e.target.value)}
                                                            className="w-20 px-2 py-1.5 bg-yellow-50 border-2 border-yellow-300 rounded text-center text-sm focus:border-[#0A5BA9]"
                                                            placeholder="0" />
                                                    </td>
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
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* 7.2 Necesidades de Equipamiento Informático */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-[#0A5BA9] to-[#094580] px-6 py-4">
                                <h3 className="text-lg font-semibold text-white">7.2 NECESIDADES DE EQUIPAMIENTO INFORMÁTICO</h3>
                            </div>
                            <div className="p-6">
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse text-sm">
                                        <thead>
                                            <tr className="bg-[#0A5BA9] text-white">
                                                <th className="px-3 py-3 text-center font-medium w-20">N°</th>
                                                <th className="px-3 py-3 text-left font-medium">DESCRIPCIÓN DEL REQUERIMIENTO</th>
                                                <th className="px-3 py-3 text-center font-medium w-32">CANTIDAD REQUERIDA</th>
                                                <th className="px-3 py-3 text-center font-medium w-36">PRIORIDAD</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[
                                                { id: "computadora", num: "7.2.1", label: "Computadora de escritorio" },
                                                { id: "laptop", num: "7.2.2", label: "Computadora portátil (laptop)" },
                                                { id: "monitor", num: "7.2.3", label: "Monitor" },
                                                { id: "camaraWeb", num: "7.2.4", label: "Cámara web HD (resolución mínima 1080p)" },
                                                { id: "microfono", num: "7.2.5", label: "Micrófono" },
                                                { id: "parlantes", num: "7.2.6", label: "Parlantes/Audífonos" },
                                                { id: "impresora", num: "7.2.7", label: "Impresora" },
                                                { id: "escaner", num: "7.2.8", label: "Escáner" },
                                                { id: "router", num: "7.2.9", label: "Router/Switch de red" },
                                                { id: "ups", num: "7.2.10", label: "UPS/Estabilizador" },
                                            ].map((item, index) => (
                                                <tr key={item.id} className={index % 2 === 0 ? "bg-blue-50" : "bg-white"}>
                                                    <td className="px-3 py-3 border-b border-gray-200 text-center font-medium text-[#0A5BA9]">{item.num}</td>
                                                    <td className="px-3 py-3 border-b border-gray-200">{item.label}</td>
                                                    <td className="px-3 py-3 border-b border-gray-200 text-center">
                                                        <input type="number" min="0"
                                                            value={formData.necesidades[`equip_${item.id}_cant`] || ""}
                                                            onChange={(e) => handleInputChange("necesidades", `equip_${item.id}_cant`, e.target.value)}
                                                            className="w-20 px-2 py-1.5 bg-yellow-50 border-2 border-yellow-300 rounded text-center text-sm focus:border-[#0A5BA9]"
                                                            placeholder="0" />
                                                    </td>
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
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* 7.3 Necesidades de Equipamiento Biomédico */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-[#0A5BA9] to-[#094580] px-6 py-4">
                                <h3 className="text-lg font-semibold text-white">7.3 NECESIDADES DE EQUIPAMIENTO BIOMÉDICO DIGITAL</h3>
                            </div>
                            <div className="p-6">
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse text-sm">
                                        <thead>
                                            <tr className="bg-[#0A5BA9] text-white">
                                                <th className="px-3 py-3 text-center font-medium w-20">N°</th>
                                                <th className="px-3 py-3 text-left font-medium">DESCRIPCIÓN DEL REQUERIMIENTO</th>
                                                <th className="px-3 py-3 text-center font-medium w-32">CANTIDAD REQUERIDA</th>
                                                <th className="px-3 py-3 text-center font-medium w-36">PRIORIDAD</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[
                                                { id: "pulsioximetro", num: "7.3.1", label: "Pulsioxímetro digital" },
                                                { id: "estetoscopio", num: "7.3.2", label: "Estetoscopio digital" },
                                                { id: "tensiometro", num: "7.3.3", label: "Tensiómetro digital" },
                                                { id: "otoscopio", num: "7.3.4", label: "Otoscopio digital" },
                                                { id: "dermatoscopio", num: "7.3.5", label: "Dermatoscopio digital" },
                                                { id: "electrocardiografo", num: "7.3.6", label: "Electrocardiógrafo digital" },
                                                { id: "ecografo", num: "7.3.7", label: "Ecógrafo digital" },
                                                { id: "estacionMovil", num: "7.3.8", label: "Estación móvil de telemedicina" },
                                            ].map((item, index) => (
                                                <tr key={item.id} className={index % 2 === 0 ? "bg-blue-50" : "bg-white"}>
                                                    <td className="px-3 py-3 border-b border-gray-200 text-center font-medium text-[#0A5BA9]">{item.num}</td>
                                                    <td className="px-3 py-3 border-b border-gray-200">{item.label}</td>
                                                    <td className="px-3 py-3 border-b border-gray-200 text-center">
                                                        <input type="number" min="0"
                                                            value={formData.necesidades[`bio_${item.id}_cant`] || ""}
                                                            onChange={(e) => handleInputChange("necesidades", `bio_${item.id}_cant`, e.target.value)}
                                                            className="w-20 px-2 py-1.5 bg-yellow-50 border-2 border-yellow-300 rounded text-center text-sm focus:border-[#0A5BA9]"
                                                            placeholder="0" />
                                                    </td>
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
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* 7.4 Otras necesidades */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gradient-to-r from-[#0A5BA9] to-[#094580] px-6 py-4">
                                <h3 className="text-lg font-semibold text-white">7.4 OTRAS NECESIDADES Y OBSERVACIONES</h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <span className="text-[#0A5BA9] font-bold mr-2">7.4.1</span>
                                        Necesidades de conectividad (internet, puntos de red, etc.):
                                    </label>
                                    <textarea
                                        value={formData.necesidades.necesidadesConectividad || ""}
                                        onChange={(e) => handleInputChange("necesidades", "necesidadesConectividad", e.target.value)}
                                        className="w-full px-4 py-3 bg-yellow-50 border-2 border-yellow-300 rounded-lg focus:border-[#0A5BA9] resize-none"
                                        rows={3}
                                        placeholder="Describa las necesidades de conectividad..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <span className="text-[#0A5BA9] font-bold mr-2">7.4.2</span>
                                        Necesidades de capacitación del personal:
                                    </label>
                                    <textarea
                                        value={formData.necesidades.necesidadesCapacitacion || ""}
                                        onChange={(e) => handleInputChange("necesidades", "necesidadesCapacitacion", e.target.value)}
                                        className="w-full px-4 py-3 bg-yellow-50 border-2 border-yellow-300 rounded-lg focus:border-[#0A5BA9] resize-none"
                                        rows={3}
                                        placeholder="Describa las necesidades de capacitación..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <span className="text-[#0A5BA9] font-bold mr-2">7.4.3</span>
                                        Observaciones generales y comentarios adicionales:
                                    </label>
                                    <textarea
                                        value={formData.necesidades.observacionesGenerales || ""}
                                        onChange={(e) => handleInputChange("necesidades", "observacionesGenerales", e.target.value)}
                                        className="w-full px-4 py-3 bg-yellow-50 border-2 border-yellow-300 rounded-lg focus:border-[#0A5BA9] resize-none"
                                        rows={4}
                                        placeholder="Escriba cualquier observación o comentario adicional..."
                                    />
                                </div>
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

                        {/* Contenido de Vista Previa - Página 1: Datos Generales */}
                        <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden">
                            <div className="bg-[#0A5BA9] px-6 py-3 flex justify-between items-center">
                                <span className="text-white font-bold">Página 1 de 6</span>
                                <span className="text-white/80 text-sm">I. DATOS GENERALES</span>
                            </div>
                            <div className="p-6">
                                <div className="text-center mb-6 pb-4 border-b-2 border-[#0A5BA9]">
                                    <h2 className="text-xl font-bold text-[#0A5BA9]">DIAGNÓSTICO SITUACIONAL DE TELESALUD</h2>
                                    <p className="text-gray-600 mt-2">
                                        <strong>IPRESS:</strong> {datosUsuario?.nombre_ipress || "No especificado"}
                                    </p>
                                    <p className="text-gray-600">
                                        <strong>Red Asistencial:</strong> {datosUsuario?.nombre_red || "No especificado"}
                                    </p>
                                    <p className="text-gray-600">
                                        <strong>Macroregión:</strong> {datosUsuario?.nombre_macroregion || "No especificado"}
                                    </p>
                                </div>
                                <h3 className="text-lg font-bold text-[#0A5BA9] mb-4 bg-blue-50 px-4 py-2 rounded">I. DATOS GENERALES DEL ESTABLECIMIENTO</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div><strong>Categoría:</strong> {formData.datosGenerales.categoria || "No especificado"}</div>
                                    <div><strong>Tipo:</strong> {formData.datosGenerales.tipoEstablecimiento || "No especificado"}</div>
                                    <div><strong>Departamento:</strong> {formData.datosGenerales.departamento || "No especificado"}</div>
                                    <div><strong>Provincia:</strong> {formData.datosGenerales.provincia || "No especificado"}</div>
                                    <div><strong>Distrito:</strong> {formData.datosGenerales.distrito || "No especificado"}</div>
                                    <div><strong>Dirección:</strong> {formData.datosGenerales.direccion || "No especificado"}</div>
                                    <div><strong>Teléfono:</strong> {formData.datosGenerales.telefono || "No especificado"}</div>
                                    <div><strong>Correo:</strong> {formData.datosGenerales.correo || "No especificado"}</div>
                                    <div className="col-span-2"><strong>Director/Jefe:</strong> {formData.datosGenerales.director || "No especificado"}</div>
                                </div>
                            </div>
                        </div>

                        {/* Página 2: Recursos Humanos */}
                        <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden">
                            <div className="bg-[#0A5BA9] px-6 py-3 flex justify-between items-center">
                                <span className="text-white font-bold">Página 2 de 6</span>
                                <span className="text-white/80 text-sm">II. RECURSOS HUMANOS</span>
                            </div>
                            <div className="p-6">
                                <h3 className="text-lg font-bold text-[#0A5BA9] mb-4 bg-blue-50 px-4 py-2 rounded">II. RECURSOS HUMANOS</h3>
                                <table className="w-full text-sm border-collapse mb-6">
                                    <thead>
                                        <tr className="bg-[#0A5BA9] text-white">
                                            <th className="px-4 py-2 text-left">Profesional</th>
                                            <th className="px-4 py-2 text-center">Cantidad</th>
                                            <th className="px-4 py-2 text-center">Capacitados</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            { label: "Médicos", cant: "medicos", cap: "medicosCapacitados" },
                                            { label: "Enfermeras", cant: "enfermeras", cap: "enfermerasCapacitadas" },
                                            { label: "Obstetras", cant: "obstetras", cap: "obstetrasCapacitados" },
                                            { label: "Técnicos", cant: "tecnicos", cap: "tecnicosCapacitados" },
                                            { label: "Administrativos", cant: "administrativos", cap: "administrativosCapacitados" },
                                        ].map((item, idx) => (
                                            <tr key={item.label} className={idx % 2 === 0 ? "bg-gray-50" : ""}>
                                                <td className="px-4 py-2 border">{item.label}</td>
                                                <td className="px-4 py-2 border text-center">{formData.recursosHumanos[item.cant] || "0"}</td>
                                                <td className="px-4 py-2 border text-center">{formData.recursosHumanos[item.cap] || "0"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div><strong>Responsable de Telesalud:</strong> {formData.recursosHumanos.responsableTelesalud || "No especificado"}</div>
                                    <div><strong>Cargo:</strong> {formData.recursosHumanos.cargoResponsable || "No especificado"}</div>
                                </div>
                            </div>
                        </div>

                        {/* Página 3: Infraestructura */}
                        <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden">
                            <div className="bg-[#0A5BA9] px-6 py-3 flex justify-between items-center">
                                <span className="text-white font-bold">Página 3 de 6</span>
                                <span className="text-white/80 text-sm">III. INFRAESTRUCTURA</span>
                            </div>
                            <div className="p-6">
                                <h3 className="text-lg font-bold text-[#0A5BA9] mb-4 bg-blue-50 px-4 py-2 rounded">III. INFRAESTRUCTURA</h3>
                                <table className="w-full text-sm border-collapse mb-6">
                                    <thead>
                                        <tr className="bg-[#0A5BA9] text-white">
                                            <th className="px-4 py-2 text-left">Ambiente</th>
                                            <th className="px-4 py-2 text-center">Disponible</th>
                                            <th className="px-4 py-2 text-center">Área (m²)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            { label: "Teleconsultorio exclusivo", disp: "teleconsultorio", area: "teleconsultorioArea" },
                                            { label: "Ambiente compartido", disp: "ambienteCompartido", area: "ambienteCompartidoArea" },
                                            { label: "Sala de espera", disp: "salaEspera", area: "salaEsperaArea" },
                                            { label: "Ambiente administrativo", disp: "ambienteAdmin", area: "ambienteAdminArea" },
                                        ].map((item, idx) => (
                                            <tr key={item.label} className={idx % 2 === 0 ? "bg-gray-50" : ""}>
                                                <td className="px-4 py-2 border">{item.label}</td>
                                                <td className="px-4 py-2 border text-center">{formData.infraestructura[item.disp] || "-"}</td>
                                                <td className="px-4 py-2 border text-center">{formData.infraestructura[item.area] || "-"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div><strong>Conexión eléctrica estable:</strong> {formData.infraestructura.conexionElectrica || "-"}</div>
                                    <div><strong>Sistema UPS:</strong> {formData.infraestructura.sistemaUPS || "-"}</div>
                                    <div><strong>Aire acondicionado:</strong> {formData.infraestructura.aireAcondicionado || "-"}</div>
                                    <div><strong>Ventilación:</strong> {formData.infraestructura.ventilacion || "-"}</div>
                                </div>
                            </div>
                        </div>

                        {/* Página 4: Equipamiento */}
                        <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden">
                            <div className="bg-[#0A5BA9] px-6 py-3 flex justify-between items-center">
                                <span className="text-white font-bold">Página 4 de 6</span>
                                <span className="text-white/80 text-sm">IV. EQUIPAMIENTO</span>
                            </div>
                            <div className="p-6">
                                <h3 className="text-lg font-bold text-[#0A5BA9] mb-4 bg-blue-50 px-4 py-2 rounded">IV. EQUIPAMIENTO INFORMÁTICO</h3>
                                <table className="w-full text-sm border-collapse mb-6">
                                    <thead>
                                        <tr className="bg-[#0A5BA9] text-white">
                                            <th className="px-4 py-2 text-left">Equipo</th>
                                            <th className="px-4 py-2 text-center">Cantidad</th>
                                            <th className="px-4 py-2 text-center">Operativos</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            { label: "Computadoras", cant: "computadoras", op: "computadorasOperativas" },
                                            { label: "Laptops", cant: "laptops", op: "laptopsOperativas" },
                                            { label: "Monitores", cant: "monitores", op: "monitoresOperativos" },
                                            { label: "Cámaras web", cant: "camaras", op: "camarasOperativas" },
                                            { label: "Impresoras", cant: "impresoras", op: "impresorasOperativas" },
                                        ].map((item, idx) => (
                                            <tr key={item.label} className={idx % 2 === 0 ? "bg-gray-50" : ""}>
                                                <td className="px-4 py-2 border">{item.label}</td>
                                                <td className="px-4 py-2 border text-center">{formData.equipamiento[item.cant] || "0"}</td>
                                                <td className="px-4 py-2 border text-center">{formData.equipamiento[item.op] || "0"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Página 5: Conectividad y Servicios */}
                        <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden">
                            <div className="bg-[#0A5BA9] px-6 py-3 flex justify-between items-center">
                                <span className="text-white font-bold">Página 5 de 6</span>
                                <span className="text-white/80 text-sm">V. CONECTIVIDAD Y VI. SERVICIOS</span>
                            </div>
                            <div className="p-6">
                                <h3 className="text-lg font-bold text-[#0A5BA9] mb-4 bg-blue-50 px-4 py-2 rounded">V. CONECTIVIDAD</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                                    <div><strong>Tipo de conexión:</strong> {formData.conectividad.tipoConexion || "-"}</div>
                                    <div><strong>Proveedor:</strong> {formData.conectividad.proveedor || "-"}</div>
                                    <div><strong>Velocidad contratada:</strong> {formData.conectividad.velocidad || "-"} Mbps</div>
                                    <div><strong>Velocidad real:</strong> {formData.conectividad.velocidadReal || "-"} Mbps</div>
                                    <div><strong>Estabilidad:</strong> {formData.conectividad.estabilidad || "-"}</div>
                                    <div><strong>VPN institucional:</strong> {formData.conectividad.vpn || "-"}</div>
                                </div>
                                <h3 className="text-lg font-bold text-[#0A5BA9] mb-4 bg-blue-50 px-4 py-2 rounded">VI. SERVICIOS DE TELESALUD</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div><strong>Teleconsulta:</strong> {formData.servicios.teleconsulta || "-"}</div>
                                    <div><strong>Teleorientación:</strong> {formData.servicios.teleorientacion || "-"}</div>
                                    <div><strong>Telemonitoreo:</strong> {formData.servicios.telemonitoreo || "-"}</div>
                                    <div><strong>Teleinterconsulta:</strong> {formData.servicios.teleinterconsulta || "-"}</div>
                                    <div><strong>Telediagnóstico:</strong> {formData.servicios.telediagnostico || "-"}</div>
                                    <div><strong>Especialidades:</strong> {formData.servicios.especialidades || "-"}</div>
                                </div>
                            </div>
                        </div>

                        {/* Página 6: Necesidades */}
                        <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden">
                            <div className="bg-[#0A5BA9] px-6 py-3 flex justify-between items-center">
                                <span className="text-white font-bold">Página 6 de 6</span>
                                <span className="text-white/80 text-sm">VII. NECESIDADES Y REQUERIMIENTOS</span>
                            </div>
                            <div className="p-6">
                                <h3 className="text-lg font-bold text-[#0A5BA9] mb-4 bg-blue-50 px-4 py-2 rounded">VII. NECESIDADES Y REQUERIMIENTOS</h3>
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-semibold text-gray-700 mb-2">7.1 Infraestructura Física</h4>
                                        <div className="grid grid-cols-3 gap-2 text-sm">
                                            <div className="bg-gray-50 p-2 rounded">Espacio físico: {formData.necesidades.infra_espacioFisico_cant || "0"} ({formData.necesidades.infra_espacioFisico_prior || "-"})</div>
                                            <div className="bg-gray-50 p-2 rounded">Escritorio: {formData.necesidades.infra_escritorio_cant || "0"} ({formData.necesidades.infra_escritorio_prior || "-"})</div>
                                            <div className="bg-gray-50 p-2 rounded">Sillas: {formData.necesidades.infra_sillas_cant || "0"} ({formData.necesidades.infra_sillas_prior || "-"})</div>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-700 mb-2">7.2 Equipamiento Informático</h4>
                                        <div className="grid grid-cols-3 gap-2 text-sm">
                                            <div className="bg-gray-50 p-2 rounded">Computadoras: {formData.necesidades.equip_computadora_cant || "0"} ({formData.necesidades.equip_computadora_prior || "-"})</div>
                                            <div className="bg-gray-50 p-2 rounded">Laptops: {formData.necesidades.equip_laptop_cant || "0"} ({formData.necesidades.equip_laptop_prior || "-"})</div>
                                            <div className="bg-gray-50 p-2 rounded">Cámaras: {formData.necesidades.equip_camaraWeb_cant || "0"} ({formData.necesidades.equip_camaraWeb_prior || "-"})</div>
                                        </div>
                                    </div>
                                    {formData.necesidades.observacionesGenerales && (
                                        <div>
                                            <h4 className="font-semibold text-gray-700 mb-2">7.4 Observaciones Generales</h4>
                                            <p className="text-sm bg-gray-50 p-3 rounded">{formData.necesidades.observacionesGenerales}</p>
                                        </div>
                                    )}
                                </div>
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
                        <button
                            onClick={() => {
                                if (activeTab === "vista-previa") {
                                    setActiveTab("necesidades");
                                } else {
                                    setCurrentView("instrucciones");
                                }
                            }}
                            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            {activeTab === "vista-previa" ? "Volver al Formulario" : "Volver a Instrucciones"}
                        </button>

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
                                    <button
                                        onClick={handleDescargarPDF}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-all shadow-lg"
                                    >
                                        <Download className="w-4 h-4" />
                                        Descargar PDF
                                    </button>
                                    {estadoFormulario !== "ENVIADO" && (
                                        <button
                                            onClick={handleEnviarFormulario}
                                            disabled={enviando}
                                            className={`flex items-center gap-2 px-6 py-2.5 font-medium rounded-lg transition-all shadow-lg ${
                                                enviando
                                                    ? "bg-blue-400 cursor-not-allowed"
                                                    : "bg-[#0A5BA9] hover:bg-[#094580]"
                                            } text-white`}
                                        >
                                            {enviando ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Send className="w-4 h-4" />
                                            )}
                                            {enviando ? "Enviando..." : "Enviar Formulario"}
                                        </button>
                                    )}
                                </div>
                            ) : activeTab === "necesidades" ? (
                                <button
                                    onClick={handleGenerarPDF}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-all"
                                >
                                    <FileDown className="w-4 h-4" />
                                    Generar PDF
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
    return currentView === "instrucciones" ? renderInstrucciones() : renderFormulario();
}

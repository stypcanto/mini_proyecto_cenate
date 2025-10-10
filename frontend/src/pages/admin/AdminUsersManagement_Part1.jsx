import React, { useState, useEffect, useRef } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import {
    Users,
    Plus,
    Search,
    Edit,
    Trash2,
    CheckCircle,
    XCircle,
    RefreshCw,
    FileText,
    Building2,
    Briefcase,
    UserPlus,
    Save,
    X as CloseIcon,
    Eye,
    Download,
    Camera,
    Upload,
    Calendar,
    Cake,
    Phone,
    Mail,
    MapPin,
    Briefcase as Work,
    IdCard,
    User,
} from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";

const API_BASE = "http://localhost:8080/api";

const AdminUsersManagement = () => {
    const [activeTab, setActiveTab] = useState("usuarios");
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    
    // Estados para cada entidad
    const [usuarios, setUsuarios] = useState([]);
    const [personal, setPersonal] = useState([]);
    const [tiposDocumento, setTiposDocumento] = useState([]);
    const [areas, setAreas] = useState([]);
    const [regimenesLaborales, setRegimenesLaborales] = useState([]);
    
    // Estados para modales
    const [showModal, setShowModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [modalMode, setModalMode] = useState("create");
    const [currentEntity, setCurrentEntity] = useState(null);
    const [selectedPersonal, setSelectedPersonal] = useState(null);
    
    // Estado para foto
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const fileInputRef = useRef(null);
    
    // Form data para Personal
    const [formData, setFormData] = useState({
        idTipDoc: "",
        numDocPers: "",
        nomPers: "",
        apePaterPers: "",
        apeMaterPers: "",
        perPers: "",
        statPers: "A",
        fechNaciPers: "",
        genPers: "",
        movilPers: "",
        emailPers: "",
        emailCorpPers: "",
        colegPers: "",
        codPlanRem: "",
        direcPers: "",
        idRegLab: "",
        idArea: "",
        idUsuario: "",
    });
    
    // Form data simple para tablas maestras
    const [simpleFormData, setSimpleFormData] = useState({
        descripcion: "",
        estado: "A",
    });

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const getToken = () => localStorage.getItem("token");

    const loadData = async () => {
        setLoading(true);
        try {
            const token = getToken();
            
            switch(activeTab) {
                case "usuarios":
                    const usersRes = await fetch(`${API_BASE}/usuarios`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (usersRes.ok) {
                        const data = await usersRes.json();
                        console.log("📊 Datos de usuarios recibidos:", data);
                        setUsuarios(data);
                    }
                    break;
                    
                case "personal":
                    const personalRes = await fetch(`${API_BASE}/personal`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (personalRes.ok) {
                        const data = await personalRes.json();
                        console.log("📊 Datos de personal recibidos:", data);
                        setPersonal(data);
                    }
                    
                    // Cargar datos para los selects
                    const tiposRes = await fetch(`${API_BASE}/tipos-documento`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (tiposRes.ok) setTiposDocumento(await tiposRes.json());
                    
                    const areasRes = await fetch(`${API_BASE}/areas`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (areasRes.ok) setAreas(await areasRes.json());
                    
                    const regimenesRes = await fetch(`${API_BASE}/regimenes-laborales`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (regimenesRes.ok) setRegimenesLaborales(await regimenesRes.json());
                    break;
                    
                case "tiposDocumento":
                    const tiposDocRes = await fetch(`${API_BASE}/tipos-documento`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (tiposDocRes.ok) setTiposDocumento(await tiposDocRes.json());
                    break;
                    
                case "areas":
                    const areasAllRes = await fetch(`${API_BASE}/areas`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (areasAllRes.ok) setAreas(await areasAllRes.json());
                    break;
                    
                case "regimenesLaborales":
                    const regimenesAllRes = await fetch(`${API_BASE}/regimenes-laborales`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (regimenesAllRes.ok) setRegimenesLaborales(await regimenesAllRes.json());
                    break;
            }
        } catch (error) {
            console.error("Error cargando datos:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        setModalMode("create");
        setCurrentEntity(null);
        setSelectedFile(null);
        setPreviewUrl(null);
        setFormData({
            idTipDoc: "",
            numDocPers: "",
            nomPers: "",
            apePaterPers: "",
            apeMaterPers: "",
            perPers: "",
            statPers: "A",
            fechNaciPers: "",
            genPers: "",
            movilPers: "",
            emailPers: "",
            emailCorpPers: "",
            colegPers: "",
            codPlanRem: "",
            direcPers: "",
            idRegLab: "",
            idArea: "",
            idUsuario: "",
        });
        setSimpleFormData({ descripcion: "", estado: "A" });
        setShowModal(true);
    };

    const handleEdit = (entity) => {
        setModalMode("edit");
        setCurrentEntity(entity);
        setSelectedFile(null);
        setPreviewUrl(null);
        
        if (activeTab === "personal") {
            setFormData({
                idTipDoc: entity.tipoDocumento?.idTipDoc || "",
                numDocPers: entity.numDocPers || "",
                nomPers: entity.nomPers || "",
                apePaterPers: entity.apePaterPers || "",
                apeMaterPers: entity.apeMaterPers || "",
                perPers: entity.perPers || "",
                statPers: entity.statPers || "A",
                fechNaciPers: entity.fechNaciPers || "",
                genPers: entity.genPers || "",
                movilPers: entity.movilPers || "",
                emailPers: entity.emailPers || "",
                emailCorpPers: entity.emailCorpPers || "",
                colegPers: entity.colegPers || "",
                codPlanRem: entity.codPlanRem || "",
                direcPers: entity.direcPers || "",
                idRegLab: entity.regimenLaboral?.idRegLab || "",
                idArea: entity.area?.idArea || "",
                idUsuario: entity.idUsuario || "",
            });
            
            // Establecer foto actual si existe
            if (entity.fotoPers) {
                setPreviewUrl(`${API_BASE}/personal/${entity.idPers}/foto`);
            }
        } else {
            let desc = "";
            let stat = "A";
            
            if (activeTab === "tiposDocumento") {
                desc = entity.descTipDoc;
                stat = entity.statTipDoc;
            } else if (activeTab === "areas") {
                desc = entity.descArea;
                stat = entity.statArea;
            } else if (activeTab === "regimenesLaborales") {
                desc = entity.descRegLab;
                stat = entity.statRegLab;
            }
            
            setSimpleFormData({ descripcion: desc, estado: stat });
        }
        
        setShowModal(true);
    };

    const handleViewProfile = (personal) => {
        setSelectedPersonal(personal);
        setShowProfileModal(true);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('Por favor seleccione una imagen válida');
                return;
            }
            if (file.size > 10 * 1024 * 1024) {
                alert('La imagen no debe superar los 10MB');
                return;
            }
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const uploadFoto = async (idPers) => {
        if (!selectedFile) return;
        
        const formDataUpload = new FormData();
        formDataUpload.append('file', selectedFile);
        
        try {
            const token = getToken();
            const response = await fetch(`${API_BASE}/personal/${idPers}/foto`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formDataUpload
            });
            
            if (response.ok) {
                console.log('✅ Foto subida exitosamente');
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error al subir foto:', error);
            return false;
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("¿Está seguro de que desea eliminar este registro?")) return;
        
        try {
            const token = getToken();
            let endpoint = "";
            
            switch(activeTab) {
                case "personal":
                    endpoint = `${API_BASE}/personal/${id}`;
                    break;
                case "tiposDocumento":
                    endpoint = `${API_BASE}/tipos-documento/${id}`;
                    break;
                case "areas":
                    endpoint = `${API_BASE}/areas/${id}`;
                    break;
                case "regimenesLaborales":
                    endpoint = `${API_BASE}/regimenes-laborales/${id}`;
                    break;
                default:
                    return;
            }
            
            const response = await fetch(endpoint, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.ok) {
                alert("Registro eliminado exitosamente");
                loadData();
            } else {
                alert("Error al eliminar el registro");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Error al eliminar el registro");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const token = getToken();
            let endpoint = "";
            let body = {};
            
            if (activeTab === "personal") {
                endpoint = modalMode === "create" 
                    ? `${API_BASE}/personal` 
                    : `${API_BASE}/personal/${currentEntity.idPers}`;
                
                body = {
                    ...formData,
                    idTipDoc: parseInt(formData.idTipDoc),
                    idRegLab: formData.idRegLab ? parseInt(formData.idRegLab) : null,
                    idArea: formData.idArea ? parseInt(formData.idArea) : null,
                    idUsuario: formData.idUsuario ? parseInt(formData.idUsuario) : null,
                };
            } else {
                if (activeTab === "tiposDocumento") {
                    endpoint = modalMode === "create" 
                        ? `${API_BASE}/tipos-documento` 
                        : `${API_BASE}/tipos-documento/${currentEntity.idTipDoc}`;
                    body = {
                        descTipDoc: simpleFormData.descripcion,
                        statTipDoc: simpleFormData.estado
                    };
                } else if (activeTab === "areas") {
                    endpoint = modalMode === "create" 
                        ? `${API_BASE}/areas` 
                        : `${API_BASE}/areas/${currentEntity.idArea}`;
                    body = {
                        descArea: simpleFormData.descripcion,
                        statArea: simpleFormData.estado
                    };
                } else if (activeTab === "regimenesLaborales") {
                    endpoint = modalMode === "create" 
                        ? `${API_BASE}/regimenes-laborales` 
                        : `${API_BASE}/regimenes-laborales/${currentEntity.idRegLab}`;
                    body = {
                        descRegLab: simpleFormData.descripcion,
                        statRegLab: simpleFormData.estado
                    };
                }
            }
            
            const response = await fetch(endpoint, {
                method: modalMode === "create" ? "POST" : "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });
            
            if (response.ok) {
                const savedData = await response.json();
                
                // Si es personal y hay foto seleccionada, subirla
                if (activeTab === "personal" && selectedFile) {
                    const idPers = modalMode === "create" ? savedData.idPers : currentEntity.idPers;
                    await uploadFoto(idPers);
                }
                
                alert(`Registro ${modalMode === "create" ? "creado" : "actualizado"} exitosamente`);
                setShowModal(false);
                loadData();
            } else {
                const errorData = await response.text();
                alert(`Error: ${errorData}`);
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Error al guardar el registro");
        }
    };

    const generatePDF = (personal) => {
        const doc = new jsPDF();
        
        // Encabezado
        doc.setFillColor(37, 99, 235);
        doc.rect(0, 0, 210, 40, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont(undefined, 'bold');
        doc.text('FICHA DE PERSONAL', 105, 20, { align: 'center' });
        
        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        doc.text('CENATE - Centro Nacional de Telemedicina', 105, 30, { align: 'center' });
        
        // Información Personal
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.text('DATOS PERSONALES', 20, 55);
        
        doc.setFontSize(11);
        doc.setFont(undefined, 'normal');
        
        const infoY = 65;
        const lineHeight = 8;
        let currentY = infoY;
        
        const addField = (label, value) => {
            doc.setFont(undefined, 'bold');
            doc.text(label + ':', 20, currentY);
            doc.setFont(undefined, 'normal');
            doc.text(value || 'N/A', 70, currentY);
            currentY += lineHeight;
        };
        
        addField('Nombre Completo', personal.nombreCompleto);
        addField('Documento', `${personal.tipoDocumento?.descTipDoc || ''}: ${personal.numDocPers}`);
        addField('Fecha Nacimiento', formatFecha(personal.fechNaciPers));
        addField('Edad', personal.edad ? `${personal.edad} años` : 'N/A');
        addField('Género', personal.genPers === 'M' ? 'Masculino' : 'Femenino');
        
        currentY += 5;
        doc.setFont(undefined, 'bold');
        doc.setFontSize(16);
        doc.text('CONTACTO', 20, currentY);
        currentY += 10;
        
        doc.setFontSize(11);
        addField('Teléfono', personal.movilPers);
        addField('Email Personal', personal.emailPers);
        addField('Email Corporativo', personal.emailCorpPers);
        addField('Dirección', personal.direcPers);
        
        currentY += 5;
        doc.setFont(undefined, 'bold');
        doc.setFontSize(16);
        doc.text('INFORMACIÓN LABORAL', 20, currentY);
        currentY += 10;
        
        doc.setFontSize(11);
        addField('Área', personal.area?.descArea);
        addField('Régimen Laboral', personal.regimenLaboral?.descRegLab);
        addField('Periodo', personal.perPers);
        addField('CMP', personal.colegPers);
        addField('Código Plan Rem.', personal.codPlanRem);
        addField('Estado', personal.statPers === 'A' ? 'ACTIVO' : 'INACTIVO');
        
        // Pie de página
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(`Generado el ${new Date().toLocaleString('es-PE')}`, 105, 285, { align: 'center' });
        
        // Guardar PDF
        doc.save(`Personal_${personal.nombreCompleto.replace(/ /g, '_')}.pdf`);
    };

    const getEstadoBadge = (estado) => {
        return estado === "A" || estado === "ACTIVO" ? (
            <span className="flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                <CheckCircle className="w-3 h-3 mr-1" />
                Activo
            </span>
        ) : (
            <span className="flex items-center px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                <XCircle className="w-3 h-3 mr-1" />
                Inactivo
            </span>
        );
    };

    const formatFecha = (fecha) => {
        if (!fecha) return "N/A";
        return new Date(fecha).toLocaleDateString("es-PE", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const formatFechaCorta = (fecha) => {
        if (!fecha) return "N/A";
        return new Date(fecha).toLocaleDateString("es-PE");
    };

    const calcularEdad = (fechaNacimiento) => {
        if (!fechaNacimiento) return null;
        const hoy = new Date();
        const nacimiento = new Date(fechaNacimiento);
        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const mes = hoy.getMonth() - nacimiento.getMonth();
        if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
            edad--;
        }
        return edad;
    };

    const tabs = [
        { id: "usuarios", label: "Usuarios", icon: Users },
        { id: "personal", label: "Personal", icon: UserPlus },
        { id: "tiposDocumento", label: "Tipos Documento", icon: FileText },
        { id: "areas", label: "Áreas", icon: Building2 },
        { id: "regimenesLaborales", label: "Regímenes Laborales", icon: Briefcase },
    ];

    const renderTable = () => {
        if (loading) {
            return (
                <div className="p-12 text-center">
                    <RefreshCw className="w-12 h-12 mx-auto text-blue-600 animate-spin mb-4" />
                    <p className="text-gray-600">Cargando datos...</p>
                </div>
            );
        }

        switch(activeTab) {
            case "usuarios":
                return renderUsuariosTable();
            case "personal":
                return renderPersonalTable();
            case "tiposDocumento":
                return renderTiposDocumentoTable();
            case "areas":
                return renderAreasTable();
            case "regimenesLaborales":
                return renderRegimenesLaboralesTable();
            default:
                return null;
        }
    };

    const renderUsuariosTable = () => {
        const filtrados = usuarios.filter(u => 
            (u.username && u.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (u.idUser && u.idUser.toString().includes(searchTerm))
        );

        if (filtrados.length === 0) {
            return (
                <div className="p-12 text-center">
                    <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 text-lg">No se encontraron usuarios</p>
                </div>
            );
        }

        return (
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b-2 border-gray-200">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">ID</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Usuario</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Estado</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Roles</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Fecha Creación</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filtrados.map((usuario) => (
                            <tr key={usuario.idUser} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-sm font-medium text-gray-900">#{usuario.idUser}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{usuario.username}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {getEstadoBadge(usuario.estado)}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-wrap gap-1">
                                        {usuario.roles && Array.isArray(usuario.roles) && usuario.roles.length > 0 ? (
                                            usuario.roles.map((rol, index) => (
                                                <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                                                    {rol}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-gray-400 text-sm">Sin roles</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {formatFecha(usuario.createAt)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    const renderPersonalTable = () => {
        const filtrados = personal.filter(p => 
            (p.nombreCompleto && p.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (p.numDocPers && p.numDocPers.includes(searchTerm)) ||
            (p.emailPers && p.emailPers.toLowerCase().includes(searchTerm.toLowerCase()))
        );

        if (filtrados.length === 0) {
            return (
                <div className="p-12 text-center">
                    <UserPlus className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 text-lg">No se encontró personal</p>
                </div>
            );
        }

        return (
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b-2 border-gray-200">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Foto</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Nombre</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Documento</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Cumpleaños</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Edad</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Email</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Área</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Estado</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filtrados.map((p) => (
                            <tr key={p.idPers} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex-shrink-0 h-12 w-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                                        {p.fotoPers ? (
                                            <img 
                                                src={`${API_BASE}/personal/${p.idPers}/foto`}
                                                alt={p.nombreCompleto}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <User className="w-6 h-6 text-white" />
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {p.nombreCompleto || `${p.nomPers || ''} ${p.apePaterPers || ''} ${p.apeMaterPers || ''}`.trim() || 'Sin nombre'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">
                                        {p.tipoDocumento?.descTipDoc}: {p.numDocPers}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center text-sm text-gray-900">
                                        <Cake className="w-4 h-4 mr-2 text-pink-500" />
                                        {formatFechaCorta(p.fechNaciPers)}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                        {p.edad || calcularEdad(p.fechNaciPers) || 'N/A'} años
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{p.emailPers || "N/A"}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{p.area?.descArea || "N/A"}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {getEstadoBadge(p.statPers)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex space-x-2">
                                        <button 
                                            onClick={() => handleViewProfile(p)}
                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                            title="Ver Perfil">
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleEdit(p)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Editar">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => generatePDF(p)}
                                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                            title="Descargar PDF">
                                            <Download className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(p.idPers)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Eliminar">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    // Continúa con más código en la siguiente parte...
    // (Debido al límite de caracteres, continuaré en el siguiente mensaje)

    return (
        <AdminLayout>
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8 shadow-lg">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center space-x-3 mb-2">
                                <Users className="w-8 h-8" />
                                <h1 className="text-4xl font-bold">Gestión de Personal y Usuarios</h1>
                            </div>
                            <p className="text-blue-100 text-lg">
                                Administra usuarios, personal y tablas maestras del sistema
                            </p>
                        </div>
                        {activeTab !== "usuarios" && (
                            <button 
                                onClick={handleCreate}
                                className="flex items-center space-x-2 px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors shadow-lg font-semibold">
                                <Plus className="w-5 h-5" />
                                <span>Nuevo</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Resto del componente continúa... */}
        </AdminLayout>
    );
};

export default AdminUsersManagement;

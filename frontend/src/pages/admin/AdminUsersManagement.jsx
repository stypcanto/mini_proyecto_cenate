import React, { useState, useEffect, useRef } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import {
    Users, Plus, Search, Edit, Trash2, CheckCircle, XCircle, RefreshCw,
    FileText, Building2, Briefcase, UserPlus, Save, X as CloseIcon,
    Eye, Download, Camera, Calendar, Cake, Phone, Mail, MapPin, CreditCard, User,
} from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";

const API_BASE = "http://localhost:8080/api";

const AdminUsersManagement = () => {
    const [activeTab, setActiveTab] = useState("usuarios");
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterEstado, setFilterEstado] = useState("");
    const [filterRol, setFilterRol] = useState("");
    // Nuevos filtros para Personal
    const [filterArea, setFilterArea] = useState("");
    const [filterMesCumple, setFilterMesCumple] = useState("");
    const [filterEstadoPersonal, setFilterEstadoPersonal] = useState("");
    
    const [usuarios, setUsuarios] = useState([]);
    const [personal, setPersonal] = useState([]);
    const [tiposDocumento, setTiposDocumento] = useState([]);
    const [areas, setAreas] = useState([]);
    const [regimenesLaborales, setRegimenesLaborales] = useState([]);
    
    const [showModal, setShowModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [modalMode, setModalMode] = useState("create");
    const [currentEntity, setCurrentEntity] = useState(null);
    const [selectedPersonal, setSelectedPersonal] = useState(null);
    
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const fileInputRef = useRef(null);
    
    const [formData, setFormData] = useState({
        idTipDoc: "", numDocPers: "", nomPers: "", apePaterPers: "", apeMaterPers: "",
        perPers: "", statPers: "A", fechNaciPers: "", genPers: "", movilPers: "",
        emailPers: "", emailCorpPers: "", colegPers: "", codPlanRem: "",
        direcPers: "", idRegLab: "", idArea: "", idUsuario: "",
    });
    
    const [simpleFormData, setSimpleFormData] = useState({ descripcion: "", estado: "A" });

    useEffect(() => { 
        loadData();
        // Resetear todos los filtros
        setFilterEstado("");
        setFilterRol("");
        setFilterArea("");
        setFilterMesCumple("");
        setFilterEstadoPersonal("");
    }, [activeTab]);

    const getToken = () => localStorage.getItem("token");

    const loadData = async () => {
        setLoading(true);
        try {
            const token = getToken();
            switch(activeTab) {
                case "usuarios":
                    const usersRes = await fetch(`${API_BASE}/usuarios`, { headers: { Authorization: `Bearer ${token}` }});
                    if (usersRes.ok) setUsuarios(await usersRes.json());
                    // Cargar también personal para vincular con usuarios
                    const personalAllRes = await fetch(`${API_BASE}/personal`, { headers: { Authorization: `Bearer ${token}` }});
                    if (personalAllRes.ok) setPersonal(await personalAllRes.json());
                    break;
                case "personal":
                    const personalRes = await fetch(`${API_BASE}/personal`, { headers: { Authorization: `Bearer ${token}` }});
                    if (personalRes.ok) setPersonal(await personalRes.json());
                    const tiposRes = await fetch(`${API_BASE}/tipos-documento`, { headers: { Authorization: `Bearer ${token}` }});
                    if (tiposRes.ok) setTiposDocumento(await tiposRes.json());
                    const areasRes = await fetch(`${API_BASE}/areas`, { headers: { Authorization: `Bearer ${token}` }});
                    if (areasRes.ok) setAreas(await areasRes.json());
                    const regimenesRes = await fetch(`${API_BASE}/regimenes-laborales`, { headers: { Authorization: `Bearer ${token}` }});
                    if (regimenesRes.ok) setRegimenesLaborales(await regimenesRes.json());
                    break;
                case "tiposDocumento":
                    const tiposDocRes = await fetch(`${API_BASE}/tipos-documento`, { headers: { Authorization: `Bearer ${token}` }});
                    if (tiposDocRes.ok) setTiposDocumento(await tiposDocRes.json());
                    break;
                case "areas":
                    const areasAllRes = await fetch(`${API_BASE}/areas`, { headers: { Authorization: `Bearer ${token}` }});
                    if (areasAllRes.ok) setAreas(await areasAllRes.json());
                    break;
                case "regimenesLaborales":
                    const regimenesAllRes = await fetch(`${API_BASE}/regimenes-laborales`, { headers: { Authorization: `Bearer ${token}` }});
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
            idTipDoc: "", numDocPers: "", nomPers: "", apePaterPers: "", apeMaterPers: "",
            perPers: "", statPers: "A", fechNaciPers: "", genPers: "", movilPers: "",
            emailPers: "", emailCorpPers: "", colegPers: "", codPlanRem: "",
            direcPers: "", idRegLab: "", idArea: "", idUsuario: "",
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
            if (entity.fotoPers) setPreviewUrl(`${API_BASE}/personal/${entity.idPers}/foto?t=${Date.now()}`);
        } else {
            let desc = "", stat = "A";
            if (activeTab === "tiposDocumento") { desc = entity.descTipDoc; stat = entity.statTipDoc; }
            else if (activeTab === "areas") { desc = entity.descArea; stat = entity.statArea; }
            else if (activeTab === "regimenesLaborales") { desc = entity.descRegLab; stat = entity.statRegLab; }
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
            if (!file.type.startsWith('image/')) { alert('Por favor seleccione una imagen válida'); return; }
            if (file.size > 10 * 1024 * 1024) { alert('La imagen no debe superar los 10MB'); return; }
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const uploadFoto = async (idPers) => {
        if (!selectedFile) return true;
        const formDataUpload = new FormData();
        formDataUpload.append('file', selectedFile);
        try {
            const token = getToken();
            const response = await fetch(`${API_BASE}/personal/${idPers}/foto`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formDataUpload
            });
            return response.ok;
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
                case "personal": endpoint = `${API_BASE}/personal/${id}`; break;
                case "tiposDocumento": endpoint = `${API_BASE}/tipos-documento/${id}`; break;
                case "areas": endpoint = `${API_BASE}/areas/${id}`; break;
                case "regimenesLaborales": endpoint = `${API_BASE}/regimenes-laborales/${id}`; break;
                default: return;
            }
            const response = await fetch(endpoint, { method: "DELETE", headers: { Authorization: `Bearer ${token}` }});
            if (response.ok) { alert("Registro eliminado exitosamente"); loadData(); }
            else alert("Error al eliminar el registro");
        } catch (error) {
            console.error("Error:", error);
            alert("Error al eliminar el registro");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = getToken();
            let endpoint = "", body = {};
            
            if (activeTab === "personal") {
                endpoint = modalMode === "create" ? `${API_BASE}/personal` : `${API_BASE}/personal/${currentEntity.idPers}`;
                body = {
                    ...formData,
                    idTipDoc: parseInt(formData.idTipDoc),
                    idRegLab: formData.idRegLab ? parseInt(formData.idRegLab) : null,
                    idArea: formData.idArea ? parseInt(formData.idArea) : null,
                    idUsuario: formData.idUsuario ? parseInt(formData.idUsuario) : null,
                };
            } else {
                if (activeTab === "tiposDocumento") {
                    endpoint = modalMode === "create" ? `${API_BASE}/tipos-documento` : `${API_BASE}/tipos-documento/${currentEntity.idTipDoc}`;
                    body = { descTipDoc: simpleFormData.descripcion, statTipDoc: simpleFormData.estado };
                } else if (activeTab === "areas") {
                    endpoint = modalMode === "create" ? `${API_BASE}/areas` : `${API_BASE}/areas/${currentEntity.idArea}`;
                    body = { descArea: simpleFormData.descripcion, statArea: simpleFormData.estado };
                } else if (activeTab === "regimenesLaborales") {
                    endpoint = modalMode === "create" ? `${API_BASE}/regimenes-laborales` : `${API_BASE}/regimenes-laborales/${currentEntity.idRegLab}`;
                    body = { descRegLab: simpleFormData.descripcion, statRegLab: simpleFormData.estado };
                }
            }
            
            const response = await fetch(endpoint, {
                method: modalMode === "create" ? "POST" : "PUT",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(body)
            });
            
            if (response.ok) {
                const savedData = await response.json();
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
        
        doc.setFillColor(37, 99, 235);
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont(undefined, 'bold');
        doc.text('FICHA DE PERSONAL', 105, 20, { align: 'center' });
        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        doc.text('CENATE - Centro Nacional de Telemedicina', 105, 30, { align: 'center' });
        
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.text('DATOS PERSONALES', 20, 55);
        
        doc.setFontSize(11);
        doc.setFont(undefined, 'normal');
        
        let currentY = 65;
        const lineHeight = 8;
        
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
        addField('Género', personal.genPers === 'M' ? 'Masculino' : personal.genPers === 'F' ? 'Femenino' : 'N/A');
        
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
        
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(`Generado el ${new Date().toLocaleString('es-PE')}`, 105, 285, { align: 'center' });
        
        doc.save(`Personal_${personal.nombreCompleto.replace(/ /g, '_')}.pdf`);
    };

    const getEstadoBadge = (estado) => {
        return estado === "A" || estado === "ACTIVO" ? (
            <span className="flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                <CheckCircle className="w-3 h-3 mr-1" />Activo
            </span>
        ) : (
            <span className="flex items-center px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                <XCircle className="w-3 h-3 mr-1" />Inactivo
            </span>
        );
    };

    const formatFecha = (fecha) => {
        if (!fecha) return "N/A";
        return new Date(fecha).toLocaleDateString("es-PE", { year: "numeric", month: "long", day: "numeric" });
    };

    const formatFechaCorta = (fecha) => {
        if (!fecha) return "N/A";
        return new Date(fecha).toLocaleDateString("es-PE");
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
            case "usuarios": return renderUsuariosTable();
            case "personal": return renderPersonalTable();
            case "tiposDocumento": return renderTiposDocumentoTable();
            case "areas": return renderAreasTable();
            case "regimenesLaborales": return renderRegimenesLaboralesTable();
            default: return null;
        }
    };

    const renderUsuariosTable = () => {
        // Obtener todos los roles únicos
        const todosLosRoles = [...new Set(usuarios.flatMap(u => u.roles || []))];
        
        // Aplicar filtros
        let filtrados = usuarios.filter(u => {
            const matchSearch = !searchTerm || 
                (u.username && u.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (u.idUser && u.idUser.toString().includes(searchTerm));
            
            const matchEstado = !filterEstado || u.estado === filterEstado;
            const matchRol = !filterRol || (u.roles && u.roles.includes(filterRol));
            
            return matchSearch && matchEstado && matchRol;
        });

        // Función auxiliar para obtener personal del usuario
        const getPersonalInfo = (idUser) => {
            return personal.find(p => p.idUsuario === idUser);
        };

        if (filtrados.length === 0) {
            return (
                <div className="p-12 text-center">
                    <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 text-lg">No se encontraron usuarios</p>
                    <p className="text-gray-500 text-sm mt-2">Intenta ajustar los filtros de búsqueda</p>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                {/* Filtros */}
                <div className="flex gap-3 items-center bg-gray-50 p-4 rounded-lg">
                    <div className="flex-1">
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Filtrar por Estado</label>
                        <select 
                            value={filterEstado} 
                            onChange={(e) => setFilterEstado(e.target.value)}
                            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Todos los estados</option>
                            <option value="ACTIVO">Activo</option>
                            <option value="INACTIVO">Inactivo</option>
                        </select>
                    </div>
                    <div className="flex-1">
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Filtrar por Rol</label>
                        <select 
                            value={filterRol} 
                            onChange={(e) => setFilterRol(e.target.value)}
                            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Todos los roles</option>
                            {todosLosRoles.map((rol, idx) => (
                                <option key={idx} value={rol}>{rol}</option>
                            ))}
                        </select>
                    </div>
                    {(filterEstado || filterRol) && (
                        <button 
                            onClick={() => { setFilterEstado(""); setFilterRol(""); }}
                            className="mt-5 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium"
                        >
                            Limpiar filtros
                        </button>
                    )}
                </div>

                {/* Tabla */}
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b-2 border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">ID</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Usuario</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Nombre Personal</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Documento</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Estado</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Roles</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Fecha Creación</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filtrados.map((usuario) => {
                                const personalInfo = getPersonalInfo(usuario.idUser);
                                return (
                                    <tr key={usuario.idUser} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-medium text-gray-900">#{usuario.idUser}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{usuario.username}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {personalInfo ? (
                                                <div className="text-sm text-gray-900">
                                                    {personalInfo.nombreCompleto || 
                                                    `${personalInfo.nomPers || ''} ${personalInfo.apePaterPers || ''} ${personalInfo.apeMaterPers || ''}`.trim() ||
                                                    'Sin nombre'}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 text-sm">No vinculado</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {personalInfo ? (
                                                <div className="text-sm text-gray-900">
                                                    <span className="font-medium">{personalInfo.tipoDocumento?.descTipDoc || 'Doc'}:</span> {personalInfo.numDocPers}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 text-sm">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">{getEstadoBadge(usuario.estado)}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {usuario.roles && Array.isArray(usuario.roles) && usuario.roles.length > 0 ? (
                                                    usuario.roles.map((rol, index) => (
                                                        <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">{rol}</span>
                                                    ))
                                                ) : (
                                                    <span className="text-gray-400 text-sm">Sin roles</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatFecha(usuario.createAt)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Estadísticas */}
                <div className="bg-blue-50 rounded-lg p-4 flex justify-between items-center">
                    <span className="text-sm text-blue-900 font-medium">
                        Mostrando <span className="font-bold">{filtrados.length}</span> de <span className="font-bold">{usuarios.length}</span> usuarios
                    </span>
                    {(filterEstado || filterRol) && (
                        <span className="text-xs text-blue-700">Filtros activos</span>
                    )}
                </div>
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
                                                src={`${API_BASE}/personal/${p.idPers}/foto?t=${Date.now()}`}
                                                alt={p.nombreCompleto}
                                                className="h-full w-full object-cover"
                                                onError={(e) => { e.target.style.display = 'none'; }}
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
                                    <div className="text-sm text-gray-900">{p.tipoDocumento?.descTipDoc}: {p.numDocPers}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center text-sm text-gray-900">
                                        <Cake className="w-4 h-4 mr-2 text-pink-500" />
                                        {formatFechaCorta(p.fechNaciPers)}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                        {p.edad || 'N/A'} años
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{p.emailPers || "N/A"}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900">{p.area?.descArea || "N/A"}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">{getEstadoBadge(p.statPers)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex space-x-2">
                                        <button onClick={() => handleViewProfile(p)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Ver Perfil">
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleEdit(p)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => generatePDF(p)} className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" title="Descargar PDF">
                                            <Download className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleDelete(p.idPers)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
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

    const renderTiposDocumentoTable = () => {
        const filtrados = tiposDocumento.filter(t => t.descTipDoc && t.descTipDoc.toLowerCase().includes(searchTerm.toLowerCase()));
        return renderSimpleTable(filtrados, ["ID", "Descripción", "Estado", "Acciones"],
            (item) => (
                <>
                    <td className="px-6 py-4 whitespace-nowrap"><span className="text-sm font-medium text-gray-900">#{item.idTipDoc}</span></td>
                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{item.descTipDoc}</div></td>
                    <td className="px-6 py-4 whitespace-nowrap">{getEstadoBadge(item.statTipDoc)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                            <button onClick={() => handleEdit(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit className="w-4 h-4" /></button>
                            <button onClick={() => handleDelete(item.idTipDoc)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                        </div>
                    </td>
                </>
            ), item => item.idTipDoc
        );
    };

    const renderAreasTable = () => {
        const filtrados = areas.filter(a => a.descArea && a.descArea.toLowerCase().includes(searchTerm.toLowerCase()));
        return renderSimpleTable(filtrados, ["ID", "Descripción", "Estado", "Acciones"],
            (item) => (
                <>
                    <td className="px-6 py-4 whitespace-nowrap"><span className="text-sm font-medium text-gray-900">#{item.idArea}</span></td>
                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{item.descArea}</div></td>
                    <td className="px-6 py-4 whitespace-nowrap">{getEstadoBadge(item.statArea)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                            <button onClick={() => handleEdit(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit className="w-4 h-4" /></button>
                            <button onClick={() => handleDelete(item.idArea)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                        </div>
                    </td>
                </>
            ), item => item.idArea
        );
    };

    const renderRegimenesLaboralesTable = () => {
        const filtrados = regimenesLaborales.filter(r => r.descRegLab && r.descRegLab.toLowerCase().includes(searchTerm.toLowerCase()));
        return renderSimpleTable(filtrados, ["ID", "Descripción", "Estado", "Acciones"],
            (item) => (
                <>
                    <td className="px-6 py-4 whitespace-nowrap"><span className="text-sm font-medium text-gray-900">#{item.idRegLab}</span></td>
                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{item.descRegLab}</div></td>
                    <td className="px-6 py-4 whitespace-nowrap">{getEstadoBadge(item.statRegLab)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                            <button onClick={() => handleEdit(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit className="w-4 h-4" /></button>
                            <button onClick={() => handleDelete(item.idRegLab)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                        </div>
                    </td>
                </>
            ), item => item.idRegLab
        );
    };

    const renderSimpleTable = (data, headers, renderRow, getKey) => {
        if (data.length === 0) {
            return (
                <div className="p-12 text-center">
                    <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 text-lg">No se encontraron registros</p>
                </div>
            );
        }
        return (
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b-2 border-gray-200">
                        <tr>{headers.map((header, idx) => (
                            <th key={idx} className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">{header}</th>
                        ))}</tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.map((item) => (
                            <tr key={getKey(item)} className="hover:bg-gray-50">{renderRow(item)}</tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    const renderModal = () => {
        if (!showModal) return null;
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
                        <h2 className="text-2xl font-bold text-gray-900">
                            {modalMode === "create" ? "Crear " : "Editar "}
                            {activeTab === "personal" ? "Personal" : activeTab === "tiposDocumento" ? "Tipo de Documento" : activeTab === "areas" ? "Área" : "Régimen Laboral"}
                        </h2>
                        <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                            <CloseIcon className="w-6 h-6" />
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="p-6">
                        {activeTab === "personal" ? renderPersonalForm() : renderSimpleForm()}
                        <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
                            <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold">
                                Cancelar
                            </button>
                            <button type="submit" className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">
                                <Save className="w-4 h-4" /><span>Guardar</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    const renderPersonalForm = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2 flex flex-col items-center mb-6">
                <div className="relative">
                    <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center border-4 border-white shadow-lg">
                        {previewUrl ? (
                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <User className="w-16 h-16 text-white" />
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-lg">
                        <Camera className="w-5 h-5" />
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </div>
                <p className="text-sm text-gray-500 mt-2">Haz clic en el ícono de cámara para cambiar la foto</p>
            </div>
            
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Documento *</label>
                <select value={formData.idTipDoc} onChange={(e) => setFormData({...formData, idTipDoc: e.target.value})} required className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Seleccione...</option>
                    {tiposDocumento.map(t => <option key={t.idTipDoc} value={t.idTipDoc}>{t.descTipDoc}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Número de Documento *</label>
                <input type="text" value={formData.numDocPers} onChange={(e) => setFormData({...formData, numDocPers: e.target.value})} required className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nombres *</label>
                <input type="text" value={formData.nomPers} onChange={(e) => setFormData({...formData, nomPers: e.target.value})} required className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Apellido Paterno *</label>
                <input type="text" value={formData.apePaterPers} onChange={(e) => setFormData({...formData, apePaterPers: e.target.value})} required className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Apellido Materno</label>
                <input type="text" value={formData.apeMaterPers} onChange={(e) => setFormData({...formData, apeMaterPers: e.target.value})} className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Periodo (YYYYMM)</label>
                <input type="text" value={formData.perPers} onChange={(e) => setFormData({...formData, perPers: e.target.value})} placeholder="202403" className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha de Nacimiento</label>
                <input type="date" value={formData.fechNaciPers} onChange={(e) => setFormData({...formData, fechNaciPers: e.target.value})} className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Género</label>
                <select value={formData.genPers} onChange={(e) => setFormData({...formData, genPers: e.target.value})} className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Seleccione...</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Teléfono Móvil</label>
                <input type="text" value={formData.movilPers} onChange={(e) => setFormData({...formData, movilPers: e.target.value})} className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Personal</label>
                <input type="email" value={formData.emailPers} onChange={(e) => setFormData({...formData, emailPers: e.target.value})} className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Corporativo</label>
                <input type="email" value={formData.emailCorpPers} onChange={(e) => setFormData({...formData, emailCorpPers: e.target.value})} className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">CMP</label>
                <input type="text" value={formData.colegPers} onChange={(e) => setFormData({...formData, colegPers: e.target.value})} className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Código Plan Remuneración</label>
                <input type="text" value={formData.codPlanRem} onChange={(e) => setFormData({...formData, codPlanRem: e.target.value})} className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Dirección</label>
                <input type="text" value={formData.direcPers} onChange={(e) => setFormData({...formData, direcPers: e.target.value})} className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Régimen Laboral</label>
                <select value={formData.idRegLab} onChange={(e) => setFormData({...formData, idRegLab: e.target.value})} className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Seleccione...</option>
                    {regimenesLaborales.map(r => <option key={r.idRegLab} value={r.idRegLab}>{r.descRegLab}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Área</label>
                <select value={formData.idArea} onChange={(e) => setFormData({...formData, idArea: e.target.value})} className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Seleccione...</option>
                    {areas.map(a => <option key={a.idArea} value={a.idArea}>{a.descArea}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Estado *</label>
                <select value={formData.statPers} onChange={(e) => setFormData({...formData, statPers: e.target.value})} required className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="A">Activo</option>
                    <option value="I">Inactivo</option>
                </select>
            </div>
        </div>
    );

    const renderSimpleForm = () => (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Descripción *</label>
                <input type="text" value={simpleFormData.descripcion} onChange={(e) => setSimpleFormData({...simpleFormData, descripcion: e.target.value})} required className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Estado *</label>
                <select value={simpleFormData.estado} onChange={(e) => setSimpleFormData({...simpleFormData, estado: e.target.value})} required className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="A">Activo</option>
                    <option value="I">Inactivo</option>
                </select>
            </div>
        </div>
    );

    const renderProfileModal = () => {
        if (!showProfileModal || !selectedPersonal) return null;
        
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                    <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-12 rounded-t-2xl">
                        <button onClick={() => setShowProfileModal(false)} className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg">
                            <CloseIcon className="w-6 h-6" />
                        </button>
                        <div className="flex items-center space-x-6">
                            <div className="w-32 h-32 rounded-full overflow-hidden bg-white flex items-center justify-center border-4 border-white shadow-xl">
                                {selectedPersonal.fotoPers ? (
                                    <img src={`${API_BASE}/personal/${selectedPersonal.idPers}/foto?t=${Date.now()}`} alt={selectedPersonal.nombreCompleto} className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-16 h-16 text-blue-600" />
                                )}
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold mb-2">{selectedPersonal.nombreCompleto}</h2>
                                <p className="text-blue-100 text-lg">{selectedPersonal.area?.descArea || 'Sin área asignada'}</p>
                                <div className="mt-2">{getEstadoBadge(selectedPersonal.statPers)}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                    <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
                                    Información Personal
                                    </h3>
                                    <div className="space-y-3">
                                        <InfoField icon={<User className="w-4 h-4" />} label="Documento" value={`${selectedPersonal.tipoDocumento?.descTipDoc}: ${selectedPersonal.numDocPers}`} />
                                        <InfoField icon={<Cake className="w-4 h-4" />} label="Cumpleaños" value={formatFecha(selectedPersonal.fechNaciPers)} />
                                        <InfoField icon={<Calendar className="w-4 h-4" />} label="Edad" value={selectedPersonal.edad ? `${selectedPersonal.edad} años` : 'N/A'} />
                                        <InfoField icon={<User className="w-4 h-4" />} label="Género" value={selectedPersonal.genPers === 'M' ? 'Masculino' : 'Femenino'} />
                                    </div>
                                </div>
                                
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                        <Phone className="w-5 h-5 mr-2 text-blue-600" />
                                        Contacto
                                    </h3>
                                    <div className="space-y-3">
                                        <InfoField icon={<Phone className="w-4 h-4" />} label="Teléfono" value={selectedPersonal.movilPers} />
                                        <InfoField icon={<Mail className="w-4 h-4" />} label="Email Personal" value={selectedPersonal.emailPers} />
                                        <InfoField icon={<Mail className="w-4 h-4" />} label="Email Corporativo" value={selectedPersonal.emailCorpPers} />
                                        <InfoField icon={<MapPin className="w-4 h-4" />} label="Dirección" value={selectedPersonal.direcPers} />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                                        <Briefcase className="w-5 h-5 mr-2 text-blue-600" />
                                        Información Laboral
                                    </h3>
                                    <div className="space-y-3">
                                        <InfoField icon={<Building2 className="w-4 h-4" />} label="Área" value={selectedPersonal.area?.descArea} />
                                        <InfoField icon={<Briefcase className="w-4 h-4" />} label="Régimen Laboral" value={selectedPersonal.regimenLaboral?.descRegLab} />
                                        <InfoField icon={<Calendar className="w-4 h-4" />} label="Periodo" value={selectedPersonal.perPers} />
                                        <InfoField icon={<CreditCard className="w-4 h-4" />} label="CMP" value={selectedPersonal.colegPers} />
                                        <InfoField icon={<FileText className="w-4 h-4" />} label="Cód. Plan Rem." value={selectedPersonal.codPlanRem} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="mt-8 flex justify-end space-x-3">
                            <button onClick={() => generatePDF(selectedPersonal)} className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold transition-colors">
                                <Download className="w-5 h-5" />
                                <span>Descargar PDF</span>
                            </button>
                            <button onClick={() => { setShowProfileModal(false); handleEdit(selectedPersonal); }} className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors">
                                <Edit className="w-5 h-5" />
                                <span>Editar</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const InfoField = ({ icon, label, value }) => (
        <div className="flex items-start space-x-3">
            <div className="mt-1 text-gray-400">{icon}</div>
            <div className="flex-1">
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-base font-medium text-gray-900">{value || 'N/A'}</p>
            </div>
        </div>
    );

    return (
        <AdminLayout>
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8 shadow-lg">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center space-x-3 mb-2">
                                <Users className="w-8 h-8" />
                                <h1 className="text-4xl font-bold">Gestión de Personal y Usuarios</h1>
                            </div>
                            <p className="text-blue-100 text-lg">Administra usuarios, personal y tablas maestras del sistema</p>
                        </div>
                        {activeTab !== "usuarios" && (
                            <button onClick={handleCreate} className="flex items-center space-x-2 px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors shadow-lg font-semibold">
                                <Plus className="w-5 h-5" /><span>Nuevo</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-8">
                <div className="bg-white rounded-2xl shadow-lg mb-8 overflow-hidden">
                    <div className="flex border-b border-gray-200">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button key={tab.id} onClick={() => { setActiveTab(tab.id); setSearchTerm(""); }}
                                    className={`flex-1 flex items-center justify-center space-x-2 px-6 py-4 font-semibold transition-colors ${
                                        activeTab === tab.id ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600" : "text-gray-600 hover:bg-gray-50"
                                    }`}>
                                    <Icon className="w-5 h-5" /><span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                    <div className="flex items-center space-x-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <button onClick={loadData} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            <RefreshCw className="w-4 h-4" /><span>Actualizar</span>
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">{renderTable()}</div>
            </div>

            {renderModal()}
            {renderProfileModal()}
        </AdminLayout>
    );
};

export default AdminUsersManagement;

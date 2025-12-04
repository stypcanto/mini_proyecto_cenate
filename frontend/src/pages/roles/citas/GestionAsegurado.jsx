import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import {
    Users,
    Search,
    RefreshCw,
    MessageCircle,
    Edit2,
    Trash2,
    Plus,
    Check,
    X,
    Filter,
    Phone,
    UserPlus,
    AlertCircle,
    Loader2
} from "lucide-react";
import toast from "react-hot-toast";
import gestionPacientesService from "../../../services/gestionPacientesService";
import { mbacApi } from "../../../services/mbacApi";
import { useAuth } from "../../../context/AuthContext";

// Opciones de condición
const CONDICIONES = [
    { value: "Citado", label: "Citado", color: "bg-green-100 text-green-800" },
    { value: "Reprogramación Fallida", label: "Reprogramación Fallida", color: "bg-red-100 text-red-800" },
    { value: "Pendiente", label: "Pendiente", color: "bg-yellow-100 text-yellow-800" },
    { value: "Atendido", label: "Atendido", color: "bg-blue-100 text-blue-800" },
    { value: "No Contactado", label: "No Contactado", color: "bg-gray-100 text-gray-800" },
];

export default function GestionAsegurado() {
    // Hook de autenticación para obtener el token
    const { token } = useAuth();

    // Estados para la lista de gestiones
    const [gestiones, setGestiones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCondicion, setFilterCondicion] = useState("");
    const [filterGestora, setFilterGestora] = useState("");
    const [selectedIds, setSelectedIds] = useState([]);

    // Estado para usuarios del sistema (gestoras)
    const [usuariosSistema, setUsuariosSistema] = useState([]);

    // Estados para búsqueda de asegurado
    const [showBuscarModal, setShowBuscarModal] = useState(false);
    const [dniBusqueda, setDniBusqueda] = useState("");
    const [aseguradoEncontrado, setAseguradoEncontrado] = useState(null);
    const [buscandoAsegurado, setBuscandoAsegurado] = useState(false);
    const [errorBusqueda, setErrorBusqueda] = useState("");

    // Estados para autocompletado
    const [sugerencias, setSugerencias] = useState([]);
    const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
    const [buscandoSugerencias, setBuscandoSugerencias] = useState(false);

    // Estados para el formulario de agregar
    const [formGestion, setFormGestion] = useState({
        condicion: "Pendiente",
        gestora: "",
        observaciones: "",
        origen: ""
    });

    // Estados para editar
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingGestion, setEditingGestion] = useState(null);

    // Cargar gestiones
    const cargarGestiones = useCallback(async () => {
        setLoading(true);
        try {
            const data = await gestionPacientesService.listar();
            setGestiones(data || []);
        } catch (error) {
            console.error("Error al cargar gestiones:", error);
            toast.error("Error al cargar los registros de gestión");
        } finally {
            setLoading(false);
        }
    }, []);

    // Cargar usuarios del sistema con rol ADMISION para el selector de gestoras
    const cargarUsuarios = useCallback(async () => {
        try {
            if (!token) return;
            let data = [];
            try {
                // Intentar filtrar solo usuarios con rol ADMISION desde el backend
                data = await mbacApi.listarUsuariosPorRol(['ADMISION'], token);
                console.log("✅ Usuarios con rol ADMISION cargados desde backend:", data?.length || 0, data);
            } catch (rolError) {
                console.warn("⚠️ Endpoint por rol no disponible, filtrando en frontend...");
                // Fallback: cargar todos los usuarios y filtrar por rol ADMISION en frontend
                const todosUsuarios = await mbacApi.listarUsuariosActivos(token);
                // Filtrar solo usuarios que tengan el rol ADMISION
                data = (todosUsuarios || []).filter(usuario =>
                    usuario.roles && (
                        Array.isArray(usuario.roles)
                            ? usuario.roles.includes('ADMISION')
                            : usuario.roles.has?.('ADMISION') || Object.values(usuario.roles).includes('ADMISION')
                    )
                );
                console.log("✅ Usuarios con rol ADMISION filtrados en frontend:", data?.length || 0, data);
            }
            // Filtrar usuarios que tengan nombre real (excluir usuarios de sistema como "Gestor Citas", "IA Cenate", "Chatbot")
            const usuariosReales = (data || []).filter(usuario => {
                const apellidoPaterno = usuario.apellido_paterno || usuario.apellidoPaterno || '';
                const apellidoMaterno = usuario.apellido_materno || usuario.apellidoMaterno || '';
                const nombres = usuario.nombres || '';
                const username = usuario.username || usuario.name_user || '';

                // Excluir usuarios de sistema por username
                const usuariosSistema = ['gestor_citas', 'gestorcitas', 'chatbot', 'ia_cenate', 'iacenate', 'admin', 'system'];
                if (usuariosSistema.some(u => username.toLowerCase().includes(u))) {
                    return false;
                }

                // Debe tener apellido paterno real (no repetido como "Gestor Citas Gestor Citas")
                if (apellidoPaterno && apellidoPaterno === apellidoMaterno && apellidoPaterno === nombres) {
                    return false;
                }

                // Debe tener al menos apellido paterno y nombres para ser un usuario real
                return apellidoPaterno.trim() !== '' && nombres.trim() !== '';
            });
            // Ordenar por nombre completo
            const usuariosOrdenados = usuariosReales.sort((a, b) => {
                const apellidoPaternoA = a.apellido_paterno || a.apellidoPaterno || '';
                const apellidoMaternoA = a.apellido_materno || a.apellidoMaterno || '';
                const nombresA = a.nombres || '';
                const apellidoPaternoB = b.apellido_paterno || b.apellidoPaterno || '';
                const apellidoMaternoB = b.apellido_materno || b.apellidoMaterno || '';
                const nombresB = b.nombres || '';
                const nombreA = `${apellidoPaternoA} ${apellidoMaternoA} ${nombresA}`.trim();
                const nombreB = `${apellidoPaternoB} ${apellidoMaternoB} ${nombresB}`.trim();
                return nombreA.localeCompare(nombreB);
            });
            console.log("✅ Usuarios filtrados y ordenados:", usuariosOrdenados.length);
            setUsuariosSistema(usuariosOrdenados);
        } catch (error) {
            console.error("Error al cargar usuarios con rol ADMISION:", error);
        }
    }, [token]);

    useEffect(() => {
        cargarGestiones();
        cargarUsuarios();
    }, [cargarGestiones, cargarUsuarios]);

    // Filtrar gestiones
    const gestionesFiltradas = gestiones.filter((g) => {
        const matchSearch =
            !searchTerm ||
            g.numDoc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            g.apellidosNombres?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            g.telefono?.includes(searchTerm);

        const matchCondicion = !filterCondicion || g.condicion === filterCondicion;
        const matchGestora = !filterGestora || g.gestora?.toLowerCase().includes(filterGestora.toLowerCase());

        return matchSearch && matchCondicion && matchGestora;
    });

    // Gestoras únicas para el filtro
    const gestorasUnicas = [...new Set(gestiones.map((g) => g.gestora).filter(Boolean))];

    // Función para obtener nombre completo del usuario (maneja snake_case y camelCase)
    const getNombreCompletoUsuario = (usuario) => {
        if (!usuario) return '';
        const apellidoPaterno = usuario.apellido_paterno || usuario.apellidoPaterno || '';
        const apellidoMaterno = usuario.apellido_materno || usuario.apellidoMaterno || '';
        const nombres = usuario.nombres || '';
        // Formato: "NOMBRES APELLIDO_PATERNO APELLIDO_MATERNO"
        return `${nombres} ${apellidoPaterno} ${apellidoMaterno}`.trim();
    };

    // Buscar sugerencias de autocompletado (con debounce)
    const buscarSugerencias = useCallback(async (query) => {
        if (!query || query.length < 3) {
            setSugerencias([]);
            setMostrarSugerencias(false);
            return;
        }

        setBuscandoSugerencias(true);
        try {
            const resultados = await gestionPacientesService.autocompletarAsegurados(query, 8);
            setSugerencias(resultados);
            setMostrarSugerencias(resultados.length > 0);
        } catch (error) {
            console.error("Error al buscar sugerencias:", error);
            setSugerencias([]);
        } finally {
            setBuscandoSugerencias(false);
        }
    }, []);

    // Efecto para debounce en la búsqueda
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (dniBusqueda && dniBusqueda.length >= 3) {
                buscarSugerencias(dniBusqueda);
            } else {
                setSugerencias([]);
                setMostrarSugerencias(false);
            }
        }, 300); // 300ms de debounce

        return () => clearTimeout(timeoutId);
    }, [dniBusqueda, buscarSugerencias]);

    // Seleccionar una sugerencia
    const handleSeleccionarSugerencia = (asegurado) => {
        setDniBusqueda(asegurado.docPaciente);
        setAseguradoEncontrado({
            pkAsegurado: asegurado.pkAsegurado,
            numDoc: asegurado.docPaciente,
            apellidosNombres: asegurado.paciente,
            sexo: asegurado.sexo,
            edad: asegurado.edad,
            telefono: asegurado.telFijo,
            tipoPaciente: asegurado.tipoPaciente,
            ipress: asegurado.nombreIpress
        });
        setSugerencias([]);
        setMostrarSugerencias(false);
        setErrorBusqueda("");
    };

    // Buscar asegurado por DNI
    const handleBuscarAsegurado = async () => {
        if (!dniBusqueda || dniBusqueda.length < 8) {
            setErrorBusqueda("Ingrese un DNI válido (mínimo 8 dígitos)");
            return;
        }

        setBuscandoAsegurado(true);
        setErrorBusqueda("");
        setAseguradoEncontrado(null);

        try {
            const data = await gestionPacientesService.buscarAseguradoPorDni(dniBusqueda);
            if (data) {
                setAseguradoEncontrado(data);
                // Verificar si ya existe en gestión
                const yaExiste = gestiones.some(g => g.numDoc === data.numDoc);
                if (yaExiste) {
                    toast("Este asegurado ya está en gestión", { icon: "⚠️" });
                }
            } else {
                setErrorBusqueda("No se encontró ningún asegurado con ese DNI");
            }
        } catch (error) {
            console.error("Error al buscar asegurado:", error);
            if (error.response?.status === 404) {
                setErrorBusqueda("No se encontró ningún asegurado con ese DNI");
            } else {
                setErrorBusqueda("Error al buscar el asegurado");
            }
        } finally {
            setBuscandoAsegurado(false);
        }
    };

    // Agregar asegurado a gestión
    const handleAgregarAGestion = async () => {
        if (!aseguradoEncontrado) {
            toast.error("Primero busque un asegurado");
            return;
        }

        try {
            const payload = {
                pkAsegurado: aseguradoEncontrado.pkAsegurado,
                condicion: formGestion.condicion || "Pendiente",
                gestora: formGestion.gestora,
                observaciones: formGestion.observaciones,
                origen: formGestion.origen
            };

            await gestionPacientesService.crear(payload);
            toast.success("Asegurado agregado a gestión correctamente");

            // Limpiar y cerrar modal
            setShowBuscarModal(false);
            setDniBusqueda("");
            setAseguradoEncontrado(null);
            setSugerencias([]);
            setMostrarSugerencias(false);
            setFormGestion({
                condicion: "Pendiente",
                gestora: "",
                observaciones: "",
                origen: ""
            });

            // Recargar lista
            cargarGestiones();
        } catch (error) {
            console.error("Error al agregar a gestión:", error);
            if (error.response?.data?.message?.includes("Ya existe")) {
                toast.error("Este asegurado ya está en gestión");
            } else {
                toast.error("Error al agregar el asegurado a gestión");
            }
        }
    };

    // Manejar selección individual
    const handleSelectOne = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    // Seleccionar todos
    const handleSelectAll = () => {
        if (selectedIds.length === gestionesFiltradas.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(gestionesFiltradas.map((g) => g.idGestion));
        }
    };

    // Seleccionar para telemedicina (múltiples)
    const handleSeleccionarTelemedicina = async (seleccionado) => {
        if (selectedIds.length === 0) {
            toast.error("Selecciona al menos un registro");
            return;
        }

        try {
            await gestionPacientesService.seleccionarMultiplesParaTelemedicina(selectedIds, seleccionado);
            toast.success(
                seleccionado
                    ? `${selectedIds.length} seleccionados para telemedicina`
                    : `${selectedIds.length} removidos de telemedicina`
            );
            setSelectedIds([]);
            cargarGestiones();
        } catch (error) {
            console.error("Error:", error);
            toast.error("Error al actualizar selección");
        }
    };

    // Abrir WhatsApp
    const handleEnviarWhatsApp = (gestion) => {
        if (!gestion.telefono) {
            toast.error("El paciente no tiene teléfono registrado");
            return;
        }

        const mensaje = `Hola ${gestion.apellidosNombres}, le contactamos de CENATE para coordinar su cita de telemedicina.`;
        const url = gestionPacientesService.generarEnlaceWhatsApp(gestion.telefono, mensaje);
        window.open(url, "_blank");
    };

    // Abrir modal de edición
    const handleOpenEditModal = (gestion) => {
        setEditingGestion(gestion);
        setFormGestion({
            condicion: gestion.condicion || "Pendiente",
            gestora: gestion.gestora || "",
            observaciones: gestion.observaciones || "",
            origen: gestion.origen || ""
        });
        setShowEditModal(true);
    };

    // Guardar edición
    const handleSaveEdit = async () => {
        if (!editingGestion) return;

        try {
            await gestionPacientesService.actualizar(editingGestion.idGestion, formGestion);
            toast.success("Registro actualizado correctamente");
            setShowEditModal(false);
            setEditingGestion(null);
            cargarGestiones();
        } catch (error) {
            console.error("Error:", error);
            toast.error("Error al actualizar el registro");
        }
    };

    // Eliminar gestión
    const handleDelete = async (id) => {
        if (!window.confirm("¿Está seguro de eliminar este registro de gestión?")) {
            return;
        }

        try {
            await gestionPacientesService.eliminar(id);
            toast.success("Registro eliminado correctamente");
            cargarGestiones();
        } catch (error) {
            console.error("Error:", error);
            toast.error("Error al eliminar el registro");
        }
    };

    // Actualizar condición rápida
    const handleUpdateCondicion = async (id, condicion) => {
        try {
            await gestionPacientesService.actualizarCondicion(id, condicion);
            toast.success("Condición actualizada");
            cargarGestiones();
        } catch (error) {
            console.error("Error:", error);
            toast.error("Error al actualizar condición");
        }
    };

    // Formatear fecha
    const formatFecha = (fecha) => {
        if (!fecha) return "-";
        return new Date(fecha).toLocaleString("es-PE", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Obtener color de condición
    const getCondicionStyle = (condicion) => {
        const found = CONDICIONES.find((c) => c.value === condicion);
        return found ? found.color : "bg-gray-100 text-gray-800";
    };

    return (
        <div className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
                    <Users className="w-6 h-6 text-[#0A5BA9]" />
                    Gestión del Asegurado
                </h1>
                <div className="flex gap-2">
                    <Button onClick={() => setShowBuscarModal(true)} className="gap-2 !bg-[#0A5BA9] hover:!bg-[#084a8a] text-white rounded-full">
                        <UserPlus className="w-4 h-4" />
                        Agregar Asegurado
                    </Button>
                    <Button variant="outline" onClick={cargarGestiones} className="gap-2 border-slate-300 text-slate-600 hover:bg-slate-50">
                        <RefreshCw className="w-4 h-4" />
                        Actualizar
                    </Button>
                </div>
            </div>

            {/* Info */}
            <div className="mb-4 p-3 bg-[#0A5BA9]/5 border border-[#0A5BA9]/20 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-[#0A5BA9] flex-shrink-0 mt-0.5" />
                <div className="text-sm text-slate-700">
                    <strong>Gestión vinculada a Asegurados:</strong> Los datos del paciente (nombre, DNI, edad, teléfono, IPRESS)
                    provienen automáticamente de la tabla de asegurados. Solo se gestionan los campos de seguimiento.
                </div>
            </div>

            {/* Filtros */}
            <Card className="mb-4">
                <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Búsqueda general */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar por DNI, nombre o teléfono..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0A5BA9] focus:border-transparent"
                            />
                        </div>

                        {/* Filtro por condición */}
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <select
                                value={filterCondicion}
                                onChange={(e) => setFilterCondicion(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0A5BA9] focus:border-transparent appearance-none"
                            >
                                <option value="">Todas las condiciones</option>
                                {CONDICIONES.map((c) => (
                                    <option key={c.value} value={c.value}>
                                        {c.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Filtro por gestora */}
                        <div>
                            <select
                                value={filterGestora}
                                onChange={(e) => setFilterGestora(e.target.value)}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0A5BA9] focus:border-transparent"
                            >
                                <option value="">Todas las gestoras</option>
                                {gestorasUnicas.map((g) => (
                                    <option key={g} value={g}>
                                        {g}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Acciones masivas */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleSeleccionarTelemedicina(true)}
                                disabled={selectedIds.length === 0}
                                className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                                    selectedIds.length > 0
                                        ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm hover:shadow-md'
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }`}
                            >
                                <Check className="w-4 h-4" />
                                Seleccionar ({selectedIds.length})
                            </button>
                            <button
                                onClick={() => handleSeleccionarTelemedicina(false)}
                                disabled={selectedIds.length === 0}
                                className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                                    selectedIds.length > 0
                                        ? 'bg-red-500 text-white hover:bg-red-600 shadow-sm hover:shadow-md'
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                }`}
                            >
                                <X className="w-4 h-4" />
                                Quitar
                            </button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tabla de gestiones */}
            <div className="bg-white rounded-[10px] shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Cargando...</div>
                    ) : gestionesFiltradas.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                            <p>No se encontraron registros de gestión</p>
                            <p className="text-sm mt-1">Use el botón "Agregar Asegurado" para buscar y agregar pacientes</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="bg-[#0A5BA9]">
                                <tr>
                                    <th className="px-4 py-4 text-left">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.length === gestionesFiltradas.length && gestionesFiltradas.length > 0}
                                            onChange={handleSelectAll}
                                            className="w-4 h-4 rounded border-white/30 text-[#0A5BA9] focus:ring-white"
                                        />
                                    </th>
                                    <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">NUM.DOC</th>
                                    <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">APELLIDOS Y NOMBRES</th>
                                    <th className="px-4 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider">SEXO</th>
                                    <th className="px-4 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider">EDAD</th>
                                    <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">TELÉFONO</th>
                                    <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">TIPO PACIENTE</th>
                                    <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">IPRESS</th>
                                    <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">CONDICIÓN</th>
                                    <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">GESTORA</th>
                                    <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">OBSERVACIONES</th>
                                    <th className="px-4 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">FECHA ACT.</th>
                                    <th className="px-4 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider">WHATSAPP</th>
                                    <th className="px-4 py-4 text-center text-xs font-semibold text-white uppercase tracking-wider">ACCIONES</th>
                                </tr>
                            </thead>
                            <tbody>
                                {gestionesFiltradas.map((g, idx) => (
                                    <tr
                                        key={g.idGestion}
                                        className={`border-b border-gray-100 hover:bg-blue-50/50 transition-colors ${
                                            g.seleccionadoTelemedicina
                                                ? "bg-emerald-50"
                                                : idx % 2 === 0
                                                    ? "bg-white"
                                                    : "bg-gray-50"
                                        }`}
                                    >
                                        <td className="p-3">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(g.idGestion)}
                                                onChange={() => handleSelectOne(g.idGestion)}
                                                className="w-4 h-4 rounded border-gray-300"
                                            />
                                        </td>
                                        <td className="p-3 font-mono">{g.numDoc}</td>
                                        <td className="p-3 font-medium">{g.apellidosNombres}</td>
                                        <td className="p-3 text-center">{g.sexo || "-"}</td>
                                        <td className="p-3 text-center">{g.edad ?? "-"}</td>
                                        <td className="p-3 whitespace-nowrap">
                                            {g.telefono ? (
                                                <span className="flex items-center gap-1">
                                                    <Phone className="w-3 h-3 text-gray-400" />
                                                    {g.telefono}
                                                </span>
                                            ) : (
                                                "-"
                                            )}
                                        </td>
                                        <td className="p-3 text-xs">{g.tipoPaciente || "-"}</td>
                                        <td className="p-3 text-xs max-w-[150px] truncate" title={g.ipress}>
                                            {g.ipress || "-"}
                                        </td>
                                        <td className="p-3">
                                            <select
                                                value={g.condicion || ""}
                                                onChange={(e) => handleUpdateCondicion(g.idGestion, e.target.value)}
                                                className={`px-2 py-1 rounded text-xs font-medium border-0 cursor-pointer ${getCondicionStyle(g.condicion)}`}
                                            >
                                                <option value="">Seleccionar...</option>
                                                {CONDICIONES.map((c) => (
                                                    <option key={c.value} value={c.value}>
                                                        {c.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="p-3 whitespace-nowrap">{g.gestora || "-"}</td>
                                        <td className="p-3 max-w-xs truncate" title={g.observaciones}>
                                            {g.observaciones || "-"}
                                        </td>
                                        <td className="p-3 whitespace-nowrap text-xs text-gray-500">
                                            {formatFecha(g.fechaActualizacion)}
                                        </td>
                                        <td className="p-3 text-center">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEnviarWhatsApp(g)}
                                                disabled={!g.telefono}
                                                className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                            >
                                                <MessageCircle className="w-5 h-5" />
                                            </Button>
                                        </td>
                                        <td className="p-3">
                                            <div className="flex gap-1 justify-center">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleOpenEditModal(g)}
                                                    className="text-[#0A5BA9] hover:text-[#084a8a] hover:bg-[#0A5BA9]/10"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(g.idGestion)}
                                                    className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Resumen */}
            <div className="mt-4 flex justify-between items-center text-sm text-slate-600">
                <span>
                    Mostrando {gestionesFiltradas.length} de {gestiones.length} registros
                </span>
                <span>
                    Seleccionados para telemedicina:{" "}
                    <strong className="text-emerald-600">
                        {gestiones.filter((g) => g.seleccionadoTelemedicina).length}
                    </strong>
                </span>
            </div>

            {/* Modal de búsqueda de asegurado */}
            {showBuscarModal && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                            setShowBuscarModal(false);
                            setDniBusqueda("");
                            setAseguradoEncontrado(null);
                            setErrorBusqueda("");
                            setSugerencias([]);
                            setMostrarSugerencias(false);
                        }
                    }}
                    tabIndex={-1}
                    ref={(el) => el && el.focus()}
                >
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
                        <div className="p-6 border-b border-slate-200 sticky top-0 bg-white flex items-center justify-between">
                            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                                <UserPlus className="w-5 h-5 text-[#0A5BA9]" />
                                Agregar Asegurado a Gestión
                            </h2>
                            <button
                                onClick={() => {
                                    setShowBuscarModal(false);
                                    setDniBusqueda("");
                                    setAseguradoEncontrado(null);
                                    setErrorBusqueda("");
                                    setSugerencias([]);
                                    setMostrarSugerencias(false);
                                }}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                title="Cerrar (ESC)"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Búsqueda por DNI */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Buscar por DNI
                                </label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Ingrese el DNI del asegurado..."
                                            value={dniBusqueda}
                                            onChange={(e) => {
                                                setDniBusqueda(e.target.value.replace(/\D/g, ''));
                                                setErrorBusqueda("");
                                                setAseguradoEncontrado(null);
                                            }}
                                            onKeyPress={(e) => e.key === 'Enter' && handleBuscarAsegurado()}
                                            onFocus={() => sugerencias.length > 0 && setMostrarSugerencias(true)}
                                            maxLength={15}
                                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0A5BA9] focus:border-transparent"
                                        />
                                        {/* Lista de sugerencias de autocompletado */}
                                        {mostrarSugerencias && sugerencias.length > 0 && (
                                            <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                                {buscandoSugerencias && (
                                                    <div className="px-4 py-2 text-sm text-gray-500 flex items-center gap-2">
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        Buscando...
                                                    </div>
                                                )}
                                                {sugerencias.map((asegurado, index) => (
                                                    <button
                                                        key={asegurado.pkAsegurado || index}
                                                        type="button"
                                                        onClick={() => handleSeleccionarSugerencia(asegurado)}
                                                        className="w-full px-4 py-2 text-left hover:bg-[#0A5BA9]/10 border-b border-slate-100 last:border-b-0 transition-colors"
                                                    >
                                                        <span className="font-mono text-[#0A5BA9] font-medium">{asegurado.docPaciente}</span>
                                                        <span className="mx-2 text-gray-400">-</span>
                                                        <span className="text-gray-700">{asegurado.paciente}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <Button
                                        onClick={handleBuscarAsegurado}
                                        disabled={buscandoAsegurado || !dniBusqueda}
                                        className="bg-[#0A5BA9] hover:bg-[#084a8a] text-white"
                                    >
                                        {buscandoAsegurado ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Search className="w-4 h-4" />
                                        )}
                                        Buscar
                                    </Button>
                                </div>
                                {errorBusqueda && (
                                    <p className="text-sm text-orange-600 mt-2 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {errorBusqueda}
                                    </p>
                                )}
                            </div>

                            {/* Datos del asegurado encontrado */}
                            {aseguradoEncontrado && (
                                <div className="border rounded-lg p-4 bg-emerald-50 border-emerald-200">
                                    <h3 className="font-semibold text-emerald-800 mb-3 flex items-center gap-2">
                                        <Check className="w-4 h-4" />
                                        Asegurado encontrado
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <span className="text-gray-500">DNI:</span>
                                            <span className="ml-2 font-medium">{aseguradoEncontrado.numDoc}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Nombre:</span>
                                            <span className="ml-2 font-medium">{aseguradoEncontrado.apellidosNombres}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Sexo:</span>
                                            <span className="ml-2">{aseguradoEncontrado.sexo === 'M' ? 'Masculino' : 'Femenino'}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Edad:</span>
                                            <span className="ml-2">{aseguradoEncontrado.edad} años</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Teléfono:</span>
                                            <span className="ml-2">{aseguradoEncontrado.telefono || '-'}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Tipo:</span>
                                            <span className="ml-2 text-xs">{aseguradoEncontrado.tipoPaciente || '-'}</span>
                                        </div>
                                        <div className="col-span-2">
                                            <span className="text-gray-500">IPRESS:</span>
                                            <span className="ml-2 text-xs">{aseguradoEncontrado.ipress || '-'}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Formulario de datos de gestión */}
                            {aseguradoEncontrado && (
                                <div className="border border-slate-200 rounded-lg p-4">
                                    <h3 className="font-semibold mb-3 text-slate-800">Datos de Gestión</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                                Condición
                                            </label>
                                            <select
                                                value={formGestion.condicion}
                                                onChange={(e) => setFormGestion({ ...formGestion, condicion: e.target.value })}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0A5BA9] focus:border-transparent"
                                            >
                                                {CONDICIONES.map((c) => (
                                                    <option key={c.value} value={c.value}>
                                                        {c.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                                Gestora
                                            </label>
                                            <select
                                                value={formGestion.gestora}
                                                onChange={(e) => setFormGestion({ ...formGestion, gestora: e.target.value })}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0A5BA9] focus:border-transparent"
                                            >
                                                <option value="">Seleccionar gestora...</option>
                                                {/* Mostrar valor actual si no coincide con ningún usuario */}
                                                {formGestion.gestora && !usuariosSistema.some(u => getNombreCompletoUsuario(u) === formGestion.gestora) && (
                                                    <option value={formGestion.gestora}>{formGestion.gestora} (actual)</option>
                                                )}
                                                {usuariosSistema.map((usuario) => (
                                                    <option key={usuario.id} value={getNombreCompletoUsuario(usuario)}>
                                                        {getNombreCompletoUsuario(usuario)}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                                Origen (IPRESS)
                                            </label>
                                            <input
                                                type="text"
                                                value={aseguradoEncontrado?.ipress || '-'}
                                                readOnly
                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-600 cursor-not-allowed"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                                Observaciones
                                            </label>
                                            <textarea
                                                value={formGestion.observaciones}
                                                onChange={(e) => setFormGestion({ ...formGestion, observaciones: e.target.value })}
                                                rows="2"
                                                placeholder="Observaciones adicionales..."
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0A5BA9] focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Botones */}
                        <div className="flex justify-end gap-3 p-6 border-t bg-slate-50">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowBuscarModal(false);
                                    setDniBusqueda("");
                                    setAseguradoEncontrado(null);
                                    setErrorBusqueda("");
                                    setSugerencias([]);
                                    setMostrarSugerencias(false);
                                }}
                                className="border-slate-300 text-slate-600 hover:bg-slate-100"
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleAgregarAGestion}
                                disabled={!aseguradoEncontrado}
                                className="bg-[#0A5BA9] hover:bg-[#084a8a] text-white"
                            >
                                <Plus className="w-4 h-4 mr-1" />
                                Agregar a Gestión
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de edición */}
            {showEditModal && editingGestion && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                            setShowEditModal(false);
                            setEditingGestion(null);
                        }
                    }}
                    tabIndex={-1}
                    ref={(el) => el && el.focus()}
                >
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
                        <div className="p-6 border-b border-slate-200 flex items-start justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                    <Edit2 className="w-5 h-5 text-[#0A5BA9]" />
                                    Editar Gestión
                                </h2>
                                <p className="text-sm text-slate-500 mt-1">
                                    {editingGestion.apellidosNombres} - DNI: {editingGestion.numDoc}
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowEditModal(false);
                                    setEditingGestion(null);
                                }}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                title="Cerrar (ESC)"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Condición
                                </label>
                                <select
                                    value={formGestion.condicion}
                                    onChange={(e) => setFormGestion({ ...formGestion, condicion: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0A5BA9] focus:border-transparent"
                                >
                                    {CONDICIONES.map((c) => (
                                        <option key={c.value} value={c.value}>
                                            {c.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Gestora
                                </label>
                                <select
                                    value={formGestion.gestora}
                                    onChange={(e) => setFormGestion({ ...formGestion, gestora: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0A5BA9] focus:border-transparent"
                                >
                                    <option value="">Seleccionar gestora...</option>
                                    {/* Mostrar valor actual si no coincide con ningún usuario */}
                                    {formGestion.gestora && !usuariosSistema.some(u => getNombreCompletoUsuario(u) === formGestion.gestora) && (
                                        <option value={formGestion.gestora}>{formGestion.gestora} (actual)</option>
                                    )}
                                    {usuariosSistema.map((usuario) => (
                                        <option key={usuario.id} value={getNombreCompletoUsuario(usuario)}>
                                            {getNombreCompletoUsuario(usuario)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Origen
                                </label>
                                <input
                                    type="text"
                                    value={editingGestion.ipress || '-'}
                                    readOnly
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-600 cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Observaciones
                                </label>
                                <textarea
                                    value={formGestion.observaciones}
                                    onChange={(e) => setFormGestion({ ...formGestion, observaciones: e.target.value })}
                                    rows="3"
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0A5BA9] focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowEditModal(false);
                                    setEditingGestion(null);
                                }}
                                className="border-slate-300 text-slate-600 hover:bg-slate-100"
                            >
                                Cancelar
                            </Button>
                            <Button onClick={handleSaveEdit} className="bg-[#0A5BA9] hover:bg-[#084a8a] text-white">
                                Guardar Cambios
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

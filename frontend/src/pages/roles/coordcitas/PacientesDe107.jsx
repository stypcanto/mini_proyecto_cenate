// ========================================================================
// PacientesDe107.jsx – Gestión de Pacientes de la Bolsa 107 (CENATE 2025)
// ------------------------------------------------------------------------
// Módulo para visualizar y gestionar pacientes importados desde Excel
// Permite filtrar, buscar, asignar gestoras y seleccionar para telemedicina
// ========================================================================

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import {
    Users,
    Search,
    RefreshCw,
    Filter,
    Download,
    Phone,
    UserCheck,
    Calendar,
    MapPin,
    ClipboardList,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Eye,
    Edit2,
    UserPlus,
    Apple,
    ChevronLeft,
    ChevronRight,
    GitBranch,
    Sparkles,
    UserCog,
    MoreVertical,
    Trash2,
    MonitorPlay,
    UserX,
    FileText
} from "lucide-react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import apiClient from "../../../lib/apiClient";
import AsignarAdmisionistaModal from "../../../components/modals/AsignarAdmisionistaModal";
import VerPacienteModal from "../../../components/modals/VerPacienteModal";
import ConfirmDialog from "../../../components/modals/ConfirmDialog"; // Assuming ConfirmDialog availability or I'll implement simple window.confirm first or check if it exists (I saw it in the list)

export default function PacientesDe107() {
    // Estados
    const [pacientes, setPacientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterDerivacion, setFilterDerivacion] = useState("");
    const [filterDepartamento, setFilterDepartamento] = useState("");
    const [filterIpress, setFilterIpress] = useState("");
    const [filterFechaDesde, setFilterFechaDesde] = useState("");
    const [filterFechaHasta, setFilterFechaHasta] = useState("");
    const [selectedIds, setSelectedIds] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        psicologia: 0,
        medicina: 0,
        nutricion: 0,
        lima: 0,
        provincia: 0
    });
    const [modalAsignarOpen, setModalAsignarOpen] = useState(false);
    const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
    // Estados de paginación
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;
    // Estado de agrupación inteligente
    const [agrupacionActiva, setAgrupacionActiva] = useState(false);
    const [gruposFormados, setGruposFormados] = useState([]);
    // Estado para modal de asignación de gestor
    const [modalGestorOpen, setModalGestorOpen] = useState(false);
    const [grupoSeleccionado, setGrupoSeleccionado] = useState(null);
    const [gestores, setGestores] = useState([]);
    const [loadingGestores, setLoadingGestores] = useState(false);
    const [gestorSeleccionadoId, setGestorSeleccionadoId] = useState(null);
    const [searchGestor, setSearchGestor] = useState("");
    const [isReasignacion, setIsReasignacion] = useState(false);

    // Estados para nuevas acciones
    const [verPacienteModalOpen, setVerPacienteModalOpen] = useState(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [pacienteParaDesasignar, setPacienteParaDesasignar] = useState(null);

    // Estado para dropdown de acciones (si decidimos implementarlo custom, por ahora usaremos botones directos o estado local por fila si es necesario)
    const [openActionMenuId, setOpenActionMenuId] = useState(null);

    // Cargar pacientes desde la BD
    const cargarPacientes = useCallback(async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/api/bolsa107/pacientes', true);
            const data = response || [];
            setPacientes(data);

            // Calcular estadísticas
            const psicologia = data.filter(p => p.derivacion_interna?.includes('PSICOLOGIA')).length;
            const medicina = data.filter(p => p.derivacion_interna?.includes('MEDICINA')).length;
            const nutricion = data.filter(p => p.derivacion_interna?.includes('NUTRICION')).length;
            const lima = data.filter(p => p.departamento === 'LIMA').length;
            const provincia = data.filter(p => p.departamento !== 'LIMA').length;

            setStats({
                total: data.length,
                psicologia,
                medicina,
                nutricion,
                lima,
                provincia
            });
        } catch (error) {
            console.error("Error al cargar pacientes:", error);
            toast.error("Error al cargar los pacientes de la Bolsa 107");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        cargarPacientes();
    }, [cargarPacientes]);

    // Filtrar y ordenar pacientes (de más antiguo a más reciente)
    const pacientesFiltrados = pacientes
        .filter((p) => {
            const matchSearch =
                !searchTerm ||
                p.numero_documento?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.paciente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.telefono?.includes(searchTerm);

            const matchDerivacion = !filterDerivacion || p.derivacion_interna === filterDerivacion;
            const matchDepartamento = !filterDepartamento || p.departamento === filterDepartamento;
            const matchIpress = !filterIpress || p.desc_ipress === filterIpress;

            // Filtro de rango de fechas
            let matchFecha = true;
            if (filterFechaDesde || filterFechaHasta) {
                const fechaPaciente = new Date(p.created_at);
                if (filterFechaDesde) {
                    const desdeDate = new Date(filterFechaDesde);
                    desdeDate.setHours(0, 0, 0, 0); // Inicio del día
                    matchFecha = matchFecha && fechaPaciente >= desdeDate;
                }
                if (filterFechaHasta) {
                    const hastaDate = new Date(filterFechaHasta);
                    hastaDate.setHours(23, 59, 59, 999); // Fin del día
                    matchFecha = matchFecha && fechaPaciente <= hastaDate;
                }
            }

            return matchSearch && matchDerivacion && matchDepartamento && matchIpress && matchFecha;
        })
        .sort((a, b) => {
            // Ordenar por fecha de creación (más antiguo primero)
            const fechaA = new Date(a.created_at || 0);
            const fechaB = new Date(b.created_at || 0);
            return fechaA - fechaB;
        });

    // Determinar lista de pacientes a mostrar (agrupados o todos)
    const pacientesAMostrar = agrupacionActiva
        ? gruposFormados.flatMap(grupo => grupo.pacientes)
        : pacientesFiltrados;

    // Calcular paginación
    const totalPages = Math.ceil(pacientesAMostrar.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pacientesPaginados = pacientesAMostrar.slice(startIndex, endIndex);

    // Derivaciones únicas para el filtro
    const derivacionesUnicas = [...new Set(pacientes.map((p) => p.derivacion_interna).filter(Boolean))];
    const departamentosUnicos = [...new Set(pacientes.map((p) => p.departamento).filter(Boolean))];
    const ipressUnicas = [...new Set(pacientes.map((p) => p.desc_ipress).filter(Boolean))];

    // Manejar selección individual
    const handleSelectOne = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    // Seleccionar todos (solo los de la página actual)
    const handleSelectAll = () => {
        const idsEnPaginaActual = pacientesPaginados.map((p) => p.id_item);
        const todosSeleccionados = idsEnPaginaActual.every(id => selectedIds.includes(id));

        if (todosSeleccionados) {
            // Deseleccionar los de la página actual
            setSelectedIds(prev => prev.filter(id => !idsEnPaginaActual.includes(id)));
        } else {
            // Seleccionar los de la página actual
            setSelectedIds(prev => [...new Set([...prev, ...idsEnPaginaActual])]);
        }
    };

    // Resetear página cuando cambian los filtros
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterDerivacion, filterDepartamento, filterIpress, filterFechaDesde, filterFechaHasta]);

    // Función de agrupación inteligente
    const agruparPacientes = () => {
        // Agrupar por IPRESS + Derivación
        const grupos = {};

        pacientesFiltrados.forEach((paciente) => {
            const key = `${paciente.desc_ipress || 'SIN_IPRESS'}_${paciente.derivacion_interna || 'SIN_DERIVACION'}`;

            if (!grupos[key]) {
                grupos[key] = {
                    ipress: paciente.desc_ipress,
                    derivacion: paciente.derivacion_interna,
                    pacientes: []
                };
            }

            grupos[key].pacientes.push(paciente);
        });

        // Filtrar solo grupos con múltiplos de 4
        const gruposValidos = Object.values(grupos)
            .filter(grupo => grupo.pacientes.length >= 4 && grupo.pacientes.length % 4 === 0)
            .map(grupo => ({
                ...grupo,
                cantidadGrupos: Math.floor(grupo.pacientes.length / 4)
            }));

        if (gruposValidos.length === 0) {
            toast.error('❌ No se encontraron grupos de 4 pacientes con la misma IPRESS y Derivación');
            return;
        }

        // Extraer solo los pacientes de los grupos válidos
        const pacientesAgrupados = gruposValidos.flatMap(grupo => grupo.pacientes);

        setGruposFormados(gruposValidos);
        setAgrupacionActiva(true);
        setCurrentPage(1);

        const totalGrupos = gruposValidos.reduce((sum, g) => sum + g.cantidadGrupos, 0);
        toast.success(`✅ Se formaron ${totalGrupos} grupos de 4 pacientes (${pacientesAgrupados.length} pacientes)`);
    };

    const desactivarAgrupacion = () => {
        setAgrupacionActiva(false);
        setGruposFormados([]);
        setCurrentPage(1);
        toast('ℹ️ Agrupación desactivada - Mostrando todos los pacientes');
    };

    // Cargar gestores de citas
    const cargarGestores = async () => {
        setLoadingGestores(true);
        try {
            // Endpoint para obtener usuarios con rol de gestor de citas
            const response = await apiClient.get('/api/usuarios/gestores-citas', true);
            setGestores(response || []);
        } catch (error) {
            console.error('Error al cargar gestores:', error);
            toast.error('❌ Error al cargar la lista de gestores de citas');
            setGestores([]);
        } finally {
            setLoadingGestores(false);
        }
    };

    // Abrir modal de asignación de gestor
    const abrirModalAsignarGestor = (grupo, esReasignacion = false) => {
        setGrupoSeleccionado(grupo);
        setIsReasignacion(esReasignacion);
        setModalGestorOpen(true);
        setGestorSeleccionadoId(null);
        setSearchGestor('');
        cargarGestores();
    };

    // Asignar gestor a grupo de pacientes
    const asignarGestorAGrupo = async () => {
        if (!gestorSeleccionadoId) {
            toast.error('❌ Selecciona un gestor de citas');
            return;
        }

        if (!grupoSeleccionado) {
            toast.error('❌ No hay grupo seleccionado');
            return;
        }

        try {
            const pacientesIds = grupoSeleccionado.pacientes.map(p => p.id_item);

            // Asignar el gestor a cada paciente del grupo
            const promesas = pacientesIds.map(id =>
                apiClient.post('/api/bolsa107/asignar-gestor', {
                    id_item: id,
                    id_gestor: gestorSeleccionadoId
                }, true)
            );

            await Promise.all(promesas);

            toast.success(`✅ Grupo de ${pacientesIds.length} pacientes asignado correctamente`);
            setModalGestorOpen(false);
            cargarPacientes(); // Recargar para actualizar
        } catch (error) {
            console.error('Error al asignar gestor:', error);
            toast.error('❌ Error al asignar el gestor al grupo');
        }
    };

    // Abrir modal de asignación
    const handleAsignarAdmisionista = (paciente) => {
        setPacienteSeleccionado(paciente);
        setModalAsignarOpen(true);
    };

    // Callback cuando se asigna exitosamente
    const handleAsignacionExitosa = () => {
        cargarPacientes(); // Recargar lista
    };

    // --- Nuevos Handlers ---

    const handleVerPaciente = (paciente) => {
        setPacienteSeleccionado(paciente);
        setVerPacienteModalOpen(true);
    };

    const handleReasignarGestor = (paciente) => {
        // Adaptamos el paciente único a la estructura de grupo que espera el modal
        const grupoProxy = {
            cantidadGrupos: 1,
            derivacion: paciente.derivacion_interna || "Sin derivación",
            ipress: paciente.desc_ipress || "Sin IPRESS",
            pacientes: [paciente]
        };
        // Pasar true para indicar que es  una reasignación
        abrirModalAsignarGestor(grupoProxy, true);
    };

    const handleDesasignarGestor = (paciente) => {
        setPacienteParaDesasignar(paciente);
        setConfirmDialogOpen(true);
    };

    const confirmarDesasignacion = async () => {
        if (!pacienteParaDesasignar) return;

        // Si es eliminación múltiple
        if (pacienteParaDesasignar.isMultiple) {
            await confirmarEliminacion();
            return;
        }

        // Si es desasignación individual
        try {
            await apiClient.post('/api/bolsa107/desasignar-gestor', {
                id_item: pacienteParaDesasignar.id_item
            }, true);

            toast.success("✅ Asignación eliminada correctamente");
            setConfirmDialogOpen(false);
            cargarPacientes();
        } catch (error) {
            console.error(error);
            toast.error("❌ Error al eliminar la asignación");
        }
    };

    // Exportar a Excel
    const handleExportar = () => {
        if (selectedIds.length === 0) {
            toast.error("Selecciona al menos un paciente para exportar");
            return;
        }

        try {
            // Filtrar solo pacientes seleccionados
            const pacientesExportar = pacientes.filter(p => selectedIds.includes(p.id_item));

            // Preparar datos para Excel
            const datosExcel = pacientesExportar.map((p) => ({
                "Fecha Registro": p.created_at ? (() => {
                    const fecha = new Date(p.created_at);
                    const dia = String(fecha.getDate()).padStart(2, '0');
                    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
                    const anio = fecha.getFullYear();
                    return `${dia}/${mes}/${anio}`;
                })() : '',
                "DNI": p.numero_documento || '',
                "Paciente": p.paciente || '',
                "Sexo": p.sexo || '',
                "Edad": calcularEdad(p.fecha_nacimiento) || '',
                "Fecha Nacimiento": p.fecha_nacimiento || '',
                "Teléfono": p.telefono || '',
                "IPRESS Código": p.cod_ipress || '',
                "IPRESS Nombre": p.desc_ipress || '',
                "Derivación": p.derivacion_interna || '',
                "Departamento": p.departamento || '',
                "Provincia": p.provincia || '',
                "Distrito": p.distrito || '',
                "Afiliación": p.afiliacion || '',
                "Motivo Llamada": p.motivo_llamada || ''
            }));

            // Crear workbook y worksheet
            const ws = XLSX.utils.json_to_sheet(datosExcel);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Pacientes Bolsa 107");

            // Ajustar anchos de columna
            const colWidths = [
                { wch: 15 }, // Fecha Registro
                { wch: 12 }, // DNI
                { wch: 35 }, // Paciente
                { wch: 6 },  // Sexo
                { wch: 6 },  // Edad
                { wch: 15 }, // Fecha Nacimiento
                { wch: 15 }, // Teléfono
                { wch: 12 }, // IPRESS Código
                { wch: 50 }, // IPRESS Nombre
                { wch: 25 }, // Derivación
                { wch: 15 }, // Departamento
                { wch: 20 }, // Provincia
                { wch: 20 }, // Distrito
                { wch: 15 }, // Afiliación
                { wch: 40 }  // Motivo Llamada
            ];
            ws['!cols'] = colWidths;

            // Generar nombre de archivo con fecha
            const fecha = new Date();
            const nombreArchivo = `Pacientes_Bolsa107_${fecha.getFullYear()}${String(fecha.getMonth() + 1).padStart(2, '0')}${String(fecha.getDate()).padStart(2, '0')}_${String(fecha.getHours()).padStart(2, '0')}${String(fecha.getMinutes()).padStart(2, '0')}.xlsx`;

            // Descargar archivo
            XLSX.writeFile(wb, nombreArchivo);

            toast.success(`✅ Se exportaron ${selectedIds.length} pacientes correctamente`);
            setSelectedIds([]); // Limpiar selección
        } catch (error) {
            console.error("Error al exportar:", error);
            toast.error("❌ Error al exportar los pacientes a Excel");
        }
    };

    // Calcular edad desde fecha de nacimiento
    const calcularEdad = (fechaNacimiento) => {
        if (!fechaNacimiento) return "—";
        const hoy = new Date();
        const nacimiento = new Date(fechaNacimiento);
        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const mes = hoy.getMonth() - nacimiento.getMonth();
        if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
            edad--;
        }
        return edad;
    };

    // Eliminar pacientes seleccionados
    const handleEliminarSeleccionados = () => {
        if (selectedIds.length === 0) {
            toast.error("Selecciona al menos un paciente para eliminar");
            return;
        }

        // Contar pacientes seleccionados para mostrar en el mensaje
        const pacientesSeleccionados = pacientes.filter(p => selectedIds.includes(p.id_item));
        const nombresStr = pacientesSeleccionados.slice(0, 3).map(p => p.paciente).join(", ");
        const restantes = pacientesSeleccionados.length > 3 ? ` y ${pacientesSeleccionados.length - 3} más` : "";

        // Mostrar confirmación
        setPacienteParaDesasignar({
            paciente: `${selectedIds.length} paciente(s): ${nombresStr}${restantes}`,
            id_item: null,
            isMultiple: true
        });
        setConfirmDialogOpen(true);
    };

    // Confirmar eliminación de múltiples pacientes
    const confirmarEliminacion = async () => {
        if (!selectedIds || selectedIds.length === 0) return;

        try {
            await apiClient.delete('/api/bolsa107/pacientes', {
                ids: selectedIds
            }, true); // true = auth required

            toast.success(`✅ Se eliminaron ${selectedIds.length} paciente(s) correctamente`);
            setSelectedIds([]); // Limpiar selección
            cargarPacientes(); // Recargar lista
            setConfirmDialogOpen(false);
        } catch (error) {
            console.error(error);
            toast.error("❌ Error al eliminar los pacientes");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
            {/* Header */ }
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg">
                                <Users className="w-8 h-8 text-white" />
                            </div>
                            Pacientes de la Bolsa 107
                        </h1>
                        <p className="text-slate-600">Gestión y seguimiento de pacientes importados desde Excel</p>
                    </div>
                    <Button
                        onClick={ cargarPacientes }
                        disabled={ loading }
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
                    >
                        <RefreshCw className={ `w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}` } />
                        Actualizar
                    </Button>
                </div>
            </div>

            {/* Estadísticas */ }
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
                <Card className="bg-white border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 hover:shadow-lg">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600 mb-1">Total Pacientes</p>
                                <p className="text-3xl font-bold text-blue-600">{ stats.total }</p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-2 border-purple-200 hover:border-purple-400 transition-all duration-300 hover:shadow-lg">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600 mb-1">Psicología</p>
                                <p className="text-3xl font-bold text-purple-600">{ stats.psicologia }</p>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <UserCheck className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-2 border-green-200 hover:border-green-400 transition-all duration-300 hover:shadow-lg">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600 mb-1">Medicina</p>
                                <p className="text-3xl font-bold text-green-600">{ stats.medicina }</p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-lg">
                                <ClipboardList className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-2 border-orange-200 hover:border-orange-400 transition-all duration-300 hover:shadow-lg">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600 mb-1">Nutrición</p>
                                <p className="text-3xl font-bold text-orange-600">{ stats.nutricion }</p>
                            </div>
                            <div className="p-3 bg-orange-100 rounded-lg">
                                <Apple className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-2 border-amber-200 hover:border-amber-400 transition-all duration-300 hover:shadow-lg">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600 mb-1">Lima</p>
                                <p className="text-3xl font-bold text-amber-600">{ stats.lima }</p>
                            </div>
                            <div className="p-3 bg-amber-100 rounded-lg">
                                <MapPin className="w-6 h-6 text-amber-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-2 border-cyan-200 hover:border-cyan-400 transition-all duration-300 hover:shadow-lg">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600 mb-1">Provincia</p>
                                <p className="text-3xl font-bold text-cyan-600">{ stats.provincia }</p>
                            </div>
                            <div className="p-3 bg-cyan-100 rounded-lg">
                                <MapPin className="w-6 h-6 text-cyan-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filtros y búsqueda */ }
            <Card className="bg-white shadow-lg mb-6 border-2 border-slate-200">
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {/* Búsqueda */ }
                        <div className="relative col-span-2">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar por DNI, nombre o teléfono..."
                                value={ searchTerm }
                                onChange={ (e) => setSearchTerm(e.target.value) }
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {/* Filtro por Derivación */ }
                        <div>
                            <select
                                value={ filterDerivacion }
                                onChange={ (e) => setFilterDerivacion(e.target.value) }
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Todas las derivaciones</option>
                                { derivacionesUnicas.map((deriv) => (
                                    <option key={ deriv } value={ deriv }>
                                        { deriv }
                                    </option>
                                )) }
                            </select>
                        </div>

                        {/* Filtro por Departamento */ }
                        <div>
                            <select
                                value={ filterDepartamento }
                                onChange={ (e) => setFilterDepartamento(e.target.value) }
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Todos los departamentos</option>
                                { departamentosUnicos.map((dep) => (
                                    <option key={ dep } value={ dep }>
                                        { dep }
                                    </option>
                                )) }
                            </select>
                        </div>

                        {/* Filtro por IPRESS */ }
                        <div>
                            <select
                                value={ filterIpress }
                                onChange={ (e) => setFilterIpress(e.target.value) }
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Todas las IPRESS</option>
                                { ipressUnicas.map((ipress) => (
                                    <option key={ ipress } value={ ipress }>
                                        { ipress }
                                    </option>
                                )) }
                            </select>
                        </div>
                    </div>

                    {/* Filtros de Fecha */ }
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-200">
                        <div className="lg:col-span-1">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Fecha Desde
                            </label>
                            <input
                                type="date"
                                value={ filterFechaDesde }
                                onChange={ (e) => setFilterFechaDesde(e.target.value) }
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div className="lg:col-span-1">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Fecha Hasta
                            </label>
                            <input
                                type="date"
                                value={ filterFechaHasta }
                                onChange={ (e) => setFilterFechaHasta(e.target.value) }
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        { (filterFechaDesde || filterFechaHasta) && (
                            <div className="lg:col-span-2 flex items-end">
                                <button
                                    onClick={ () => {
                                        setFilterFechaDesde("");
                                        setFilterFechaHasta("");
                                    } }
                                    className="w-full px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition-colors"
                                >
                                    Limpiar fechas
                                </button>
                            </div>
                        ) }
                    </div>

                    {/* Botón de Agrupación Inteligente */ }
                    <div className="mt-4">
                        { !agrupacionActiva ? (
                            <button
                                onClick={ agruparPacientes }
                                className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-3 font-semibold"
                            >
                                <Sparkles className="w-5 h-5" />
                                <span>Agrupación Inteligente (4 pacientes por IPRESS y Derivación)</span>
                                <GitBranch className="w-5 h-5" />
                            </button>
                        ) : (
                            <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-300 rounded-lg">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-purple-600 rounded-lg">
                                            <GitBranch className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-purple-900 text-lg">Agrupación Activa</p>
                                            <p className="text-sm text-purple-700">
                                                Mostrando { pacientesAMostrar.length } pacientes agrupados en { gruposFormados.reduce((sum, g) => sum + g.cantidadGrupos, 0) } grupos de 4
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={ desactivarAgrupacion }
                                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-semibold flex items-center gap-2"
                                    >
                                        <XCircle className="w-4 h-4" />
                                        Desactivar
                                    </button>
                                </div>

                                {/* Lista de grupos formados */ }
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    { gruposFormados.map((grupo, idx) => (
                                        <div key={ idx } className="p-3 bg-white rounded-lg border border-purple-200 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                                    <span className="text-purple-700 font-bold text-sm">{ grupo.cantidadGrupos }x4</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-semibold text-purple-900 truncate" title={ grupo.derivacion }>
                                                        { grupo.derivacion }
                                                    </p>
                                                    <p className="text-xs text-slate-600 truncate" title={ grupo.ipress }>
                                                        { grupo.ipress }
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                                                <span>{ grupo.pacientes.length } pacientes</span>
                                                <span className="font-semibold text-purple-700">{ grupo.cantidadGrupos } { grupo.cantidadGrupos === 1 ? 'grupo' : 'grupos' }</span>
                                            </div>
                                            <button
                                                onClick={ () => abrirModalAsignarGestor(grupo) }
                                                className="w-full px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                                            >
                                                <UserCog className="w-4 h-4" />
                                                <span>Asignar Gestor de Citas</span>
                                            </button>
                                        </div>
                                    )) }
                                </div>
                            </div>
                        ) }
                    </div>

                    {/* Acciones masivas */ }
                    { selectedIds.length > 0 && (
                        <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                                <span className="font-semibold text-blue-800">
                                    { selectedIds.length } paciente{ selectedIds.length !== 1 ? 's' : '' } seleccionado{ selectedIds.length !== 1 ? 's' : '' }
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    onClick={ handleExportar }
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Exportar
                                </Button>
                                <Button
                                    onClick={ handleEliminarSeleccionados }
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Eliminar
                                </Button>
                                <Button
                                    onClick={ () => setSelectedIds([]) }
                                    className="bg-slate-500 hover:bg-slate-600 text-white"
                                >
                                    Limpiar selección
                                </Button>
                            </div>
                        </div>
                    ) }
                </CardContent>
            </Card>

            {/* Tabla de pacientes */ }
            <Card className="bg-white shadow-lg border-2 border-slate-200">
                <CardContent className="p-6">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b-2 border-slate-200 bg-slate-50">
                                    <th className="text-left py-3 px-4">
                                        <input
                                            type="checkbox"
                                            checked={
                                                pacientesPaginados.length > 0 &&
                                                pacientesPaginados.every(p => selectedIds.includes(p.id_item))
                                            }
                                            onChange={ handleSelectAll }
                                            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                        />
                                    </th>
                                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Fecha Registro</th>
                                    <th className="text-left py-3 px-4 font-semibold text-slate-700">DNI</th>
                                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Paciente</th>
                                    <th className="text-center py-3 px-4 font-semibold text-slate-700">Sexo</th>
                                    <th className="text-center py-3 px-4 font-semibold text-slate-700">Edad</th>
                                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Teléfono</th>
                                    <th className="text-left py-3 px-4 font-semibold text-slate-700">IPRESS</th>
                                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Derivación</th>
                                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Gestor de Cita</th>
                                    <th className="text-center py-3 px-4 font-semibold text-slate-700">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                { loading ? (
                                    <tr>
                                        <td colSpan="11" className="py-12 text-center text-slate-500">
                                            <div className="flex flex-col items-center gap-3">
                                                <RefreshCw className="w-12 h-12 text-slate-300 animate-spin" />
                                                <p className="font-medium text-lg">Cargando pacientes...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : pacientesPaginados.length > 0 ? (
                                    pacientesPaginados.map((paciente) => (
                                        <tr key={ paciente.id_item } className="border-b border-slate-100 hover:bg-blue-50/30 transition-colors">
                                            <td className="py-3 px-4">
                                                <input
                                                    type="checkbox"
                                                    checked={ selectedIds.includes(paciente.id_item) }
                                                    onChange={ () => handleSelectOne(paciente.id_item) }
                                                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                                />
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="text-sm text-slate-700">
                                                    { paciente.created_at ? (() => {
                                                        const fecha = new Date(paciente.created_at);
                                                        const dia = String(fecha.getDate()).padStart(2, '0');
                                                        const mes = String(fecha.getMonth() + 1).padStart(2, '0');
                                                        const anio = fecha.getFullYear();
                                                        return `${dia}/${mes}/${anio}`;
                                                    })() : '—' }
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="font-mono text-slate-800">{ paciente.numero_documento }</span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="font-medium text-slate-800">{ paciente.paciente }</span>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <span className={ `px-3 py-1 rounded-full text-sm font-semibold ${paciente.sexo === 'M' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                                                    }` }>
                                                    { paciente.sexo }
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-center text-slate-700">
                                                { calcularEdad(paciente.fecha_nacimiento) }
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <Phone className="w-4 h-4 text-slate-400" />
                                                    <span className="text-slate-700">{ paciente.telefono || '—' }</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex flex-col">
                                                    { paciente.desc_ipress ? (
                                                        <>
                                                            <span className="text-sm font-medium text-slate-800">{ paciente.desc_ipress }</span>
                                                            <span className="text-xs text-slate-500">Código: { paciente.cod_ipress }</span>
                                                        </>
                                                    ) : (
                                                        <span className="text-sm text-slate-400 italic">Sin IPRESS asignada</span>
                                                    ) }
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={ `px-3 py-1 rounded-full text-xs font-semibold ${paciente.derivacion_interna?.includes('PSICOLOGIA')
                                                    ? 'bg-purple-100 text-purple-800'
                                                    : 'bg-green-100 text-green-800'
                                                    }` }>
                                                    { paciente.derivacion_interna }
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                { paciente.nombre_gestor ? (
                                                    <span className="text-sm font-medium text-slate-700">
                                                        { paciente.nombre_gestor }
                                                    </span>
                                                ) : (
                                                    <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-medium">
                                                        Sin asignar
                                                    </span>
                                                ) }
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center justify-center gap-1">
                                                    {/* Ver Detalle */ }
                                                    <button
                                                        onClick={ () => handleVerPaciente(paciente) }
                                                        className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-blue-600 rounded-lg transition-colors"
                                                        title="Ver Detalles"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>

                                                    {/* Reasignar / Asignar */ }
                                                    <button
                                                        onClick={ () => handleReasignarGestor(paciente) }
                                                        className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-purple-600 rounded-lg transition-colors"
                                                        title={ paciente.id_gestor_asignado ? "Reasignar Gestor" : "Asignar Gestor" }
                                                    >
                                                        <UserCog className="w-4 h-4" />
                                                    </button>

                                                    {/* Eliminar Asignación */ }
                                                    { paciente.id_gestor_asignado && (
                                                        <button
                                                            onClick={ () => handleDesasignarGestor(paciente) }
                                                            className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-red-600 rounded-lg transition-colors"
                                                            title="Eliminar Asignación"
                                                        >
                                                            <UserX className="w-4 h-4" />
                                                        </button>
                                                    ) }

                                                    {/* Asignar Admisionista (legacy/complementary) */ }
                                                    <button
                                                        onClick={ () => handleAsignarAdmisionista(paciente) }
                                                        className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-indigo-600 rounded-lg transition-colors"
                                                        title="Asignar Admisionista"
                                                    >
                                                        <UserPlus className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="11" className="py-12 text-center text-slate-500">
                                            <div className="flex flex-col items-center gap-3">
                                                <Users className="w-16 h-16 text-slate-300" />
                                                <p className="font-medium text-lg">No hay pacientes registrados</p>
                                                <p className="text-sm">Los pacientes aparecerán aquí después de importar el Excel en "Listado de 107"</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) }
                            </tbody>
                        </table>
                    </div>

                    {/* Paginación y contador de resultados */ }
                    { !loading && pacientesAMostrar.length > 0 && (
                        <div className="mt-4 border-t pt-4">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                {/* Contador de resultados */ }
                                <div className="text-sm text-slate-600">
                                    Mostrando <strong>{ startIndex + 1 }</strong> a <strong>{ Math.min(endIndex, pacientesAMostrar.length) }</strong> de <strong>{ pacientesAMostrar.length }</strong> pacientes
                                    { agrupacionActiva && (
                                        <span className="text-purple-700 font-semibold ml-2">(Vista Agrupada)</span>
                                    ) }
                                    { !agrupacionActiva && pacientesFiltrados.length !== pacientes.length && (
                                        <span className="text-slate-500"> (filtrados de { pacientes.length } totales)</span>
                                    ) }
                                </div>

                                {/* Controles de paginación */ }
                                { totalPages > 1 && (
                                    <div className="flex items-center gap-2">
                                        {/* Botón Anterior */ }
                                        <button
                                            onClick={ () => setCurrentPage(prev => Math.max(1, prev - 1)) }
                                            disabled={ currentPage === 1 }
                                            className="px-3 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-1"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                            <span className="hidden sm:inline">Anterior</span>
                                        </button>

                                        {/* Números de página */ }
                                        <div className="flex items-center gap-1">
                                            { Array.from({ length: totalPages }, (_, i) => i + 1)
                                                .filter(page => {
                                                    // Mostrar primera, última, actual y 2 a cada lado
                                                    if (page === 1 || page === totalPages) return true;
                                                    if (Math.abs(page - currentPage) <= 2) return true;
                                                    return false;
                                                })
                                                .map((page, index, array) => {
                                                    const showEllipsis = index > 0 && page - array[index - 1] > 1;
                                                    return (
                                                        <React.Fragment key={ page }>
                                                            { showEllipsis && (
                                                                <span className="px-2 text-slate-400">...</span>
                                                            ) }
                                                            <button
                                                                onClick={ () => setCurrentPage(page) }
                                                                className={ `px-3 py-1 rounded-lg text-sm font-medium transition-colors ${currentPage === page
                                                                    ? 'bg-blue-600 text-white shadow-md'
                                                                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                                                                    }` }
                                                            >
                                                                { page }
                                                            </button>
                                                        </React.Fragment>
                                                    );
                                                }) }
                                        </div>

                                        {/* Botón Siguiente */ }
                                        <button
                                            onClick={ () => setCurrentPage(prev => Math.min(totalPages, prev + 1)) }
                                            disabled={ currentPage === totalPages }
                                            className="px-3 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-1"
                                        >
                                            <span className="hidden sm:inline">Siguiente</span>
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) }
                            </div>
                        </div>
                    ) }
                </CardContent>
            </Card>

            {/* Modal de Asignación de Admisionista */ }
            <AsignarAdmisionistaModal
                isOpen={ modalAsignarOpen }
                onClose={ () => setModalAsignarOpen(false) }
                paciente={ pacienteSeleccionado }
                onAsignacionExitosa={ handleAsignacionExitosa }
            />

            {/* Modal de Asignación de Gestor de Citas */ }
            { modalGestorOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                        {/* Header */ }
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-lg">
                                    <UserCog className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">
                                        { isReasignacion ? 'Reasignar Gestor de Citas' : 'Asignar Gestor de Citas' }
                                    </h2>
                                    <p className="text-sm text-blue-100">
                                        Grupo de { grupoSeleccionado?.pacientes.length || 0 } pacientes
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={ () => setModalGestorOpen(false) }
                                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                            >
                                <XCircle className="w-6 h-6 text-white" />
                            </button>
                        </div>

                        {/* Info del grupo */ }
                        { grupoSeleccionado && (
                            <div className="px-6 py-4 bg-purple-50 border-b border-purple-200">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                        <span className="text-purple-700 font-bold">{ grupoSeleccionado.cantidadGrupos }x4</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-purple-900">{ grupoSeleccionado.derivacion }</p>
                                        <p className="text-sm text-slate-600">{ grupoSeleccionado.ipress }</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-slate-500">Total pacientes</p>
                                        <p className="text-2xl font-bold text-purple-700">{ grupoSeleccionado.pacientes.length }</p>
                                    </div>
                                </div>
                            </div>
                        ) }

                        {/* Búsqueda */ }
                        <div className="px-6 py-4 border-b border-slate-200">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar gestor por nombre, DNI o correo..."
                                    value={ searchGestor }
                                    onChange={ (e) => setSearchGestor(e.target.value) }
                                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        {/* Lista de gestores */ }
                        <div className="px-6 py-4 max-h-96 overflow-y-auto">
                            { loadingGestores ? (
                                <div className="flex items-center justify-center py-8">
                                    <RefreshCw className="w-8 h-8 text-slate-400 animate-spin" />
                                </div>
                            ) : gestores.length === 0 ? (
                                <div className="text-center py-8">
                                    <Users className="w-16 h-16 text-slate-300 mx-auto mb-3" />
                                    <p className="text-slate-600">No hay gestores de citas disponibles</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    { gestores
                                        .filter(g =>
                                            !searchGestor ||
                                            g.nombre_completo?.toLowerCase().includes(searchGestor.toLowerCase()) ||
                                            g.username?.includes(searchGestor) ||
                                            g.correo_corporativo?.toLowerCase().includes(searchGestor.toLowerCase()) ||
                                            g.correo_personal?.toLowerCase().includes(searchGestor.toLowerCase())
                                        )
                                        .map((gestor) => (
                                            <button
                                                key={ gestor.id_user }
                                                onClick={ () => setGestorSeleccionadoId(gestor.id_user) }
                                                className={ `w-full p-3 rounded-lg border-2 transition-all duration-200 text-left ${gestorSeleccionadoId === gestor.id_user
                                                    ? 'border-blue-600 bg-blue-50 shadow-md'
                                                    : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                                                    }` }
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={ `w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${gestorSeleccionadoId === gestor.id_user
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-slate-200 text-slate-700'
                                                        }` }>
                                                        { gestor.nombre_completo?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'GC' }
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-slate-900 truncate">{ gestor.nombre_completo || 'Sin nombre' }</p>
                                                        <p className="text-sm text-slate-600 truncate">DNI: { gestor.username }</p>
                                                        { gestor.correo_corporativo && (
                                                            <p className="text-xs text-slate-500 truncate">{ gestor.correo_corporativo }</p>
                                                        ) }
                                                    </div>
                                                    { gestorSeleccionadoId === gestor.id_user && (
                                                        <div className="flex-shrink-0">
                                                            <CheckCircle2 className="w-6 h-6 text-blue-600" />
                                                        </div>
                                                    ) }
                                                </div>
                                            </button>
                                        )) }
                                </div>
                            ) }
                        </div>

                        {/* Footer con acciones */ }
                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
                            <button
                                onClick={ () => setModalGestorOpen(false) }
                                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-semibold transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={ asignarGestorAGrupo }
                                disabled={ !gestorSeleccionadoId }
                                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <UserCog className="w-5 h-5" />
                                { isReasignacion ? 'Reasignar Gestor' : 'Asignar Gestor' }
                            </button>
                        </div>
                    </div>
                </div>
            ) }

            {/* Modal Ver Paciente */ }
            {/* Modal Ver Paciente */ }
            { verPacienteModalOpen && (
                <VerPacienteModal
                    paciente={ pacienteSeleccionado }
                    onClose={ () => setVerPacienteModalOpen(false) }
                />
            ) }

            {/* Dialogo Confirmación Desasignación o Eliminación */ }
            <ConfirmDialog
                isOpen={ confirmDialogOpen }
                onClose={ () => setConfirmDialogOpen(false) }
                onConfirm={ confirmarDesasignacion }
                title={ pacienteParaDesasignar?.isMultiple ? "Eliminar Pacientes" : "Eliminar Asignación" }
                message={
                    pacienteParaDesasignar?.isMultiple
                        ? `¿Estás seguro de que deseas eliminar estos pacientes de la Bolsa 107?\n\n${pacienteParaDesasignar?.paciente}\n\nEsta acción no se puede deshacer.`
                        : `¿Estás seguro de quitar la asignación del gestor para ${pacienteParaDesasignar?.paciente}? El paciente volverá a estado 'Sin asignar'.`
                }
                confirmText={ pacienteParaDesasignar?.isMultiple ? "Sí, eliminar" : "Sí, eliminar" }
                cancelText="Cancelar"
                type={ pacienteParaDesasignar?.isMultiple ? "danger" : "warning" }
            />
        </div>
    );
}

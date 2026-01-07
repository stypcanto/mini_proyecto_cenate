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
    Download,
    Phone
} from "lucide-react";
import toast from "react-hot-toast";
import gestionPacientesService from "../../../services/gestionPacientesService";

// Opciones de condición
const CONDICIONES = [
    { value: "Citado", label: "Citado", color: "bg-green-100 text-green-800" },
    { value: "Reprogramación Fallida", label: "Reprogramación Fallida", color: "bg-red-100 text-red-800" },
    { value: "Pendiente", label: "Pendiente", color: "bg-yellow-100 text-yellow-800" },
    { value: "Atendido", label: "Atendido", color: "bg-blue-100 text-blue-800" },
    { value: "No Contactado", label: "No Contactado", color: "bg-gray-100 text-gray-800" },
];

export default function GestionPacientes() {
    // Estados
    const [pacientes, setPacientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCondicion, setFilterCondicion] = useState("");
    const [filterGestora, setFilterGestora] = useState("");
    const [selectedIds, setSelectedIds] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingPaciente, setEditingPaciente] = useState(null);
    const [formData, setFormData] = useState({
        redAsistencial: "",
        ipress: "",
        numDoc: "",
        apellidosNombres: "",
        sexo: "",
        edad: "",
        telefonoCelular: "",
        condicion: "",
        gestora: "",
        observaciones: "",
        origen: "",
    });

    // Cargar pacientes
    const cargarPacientes = useCallback(async () => {
        setLoading(true);
        try {
            const data = await gestionPacientesService.listar();
            setPacientes(data || []);
        } catch (error) {
            console.error("Error al cargar pacientes:", error);
            toast.error("Error al cargar los pacientes");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        cargarPacientes();
    }, [cargarPacientes]);

    // Filtrar pacientes
    const pacientesFiltrados = pacientes.filter((p) => {
        const matchSearch =
            !searchTerm ||
            p.numDoc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.apellidosNombres?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.telefonoCelular?.includes(searchTerm);

        const matchCondicion = !filterCondicion || p.condicion === filterCondicion;
        const matchGestora = !filterGestora || p.gestora?.toLowerCase().includes(filterGestora.toLowerCase());

        return matchSearch && matchCondicion && matchGestora;
    });

    // Gestoras únicas para el filtro
    const gestorasUnicas = [...new Set(pacientes.map((p) => p.gestora).filter(Boolean))];

    // Manejar selección individual
    const handleSelectOne = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    // Seleccionar todos
    const handleSelectAll = () => {
        if (selectedIds.length === pacientesFiltrados.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(pacientesFiltrados.map((p) => p.idGestion));
        }
    };

    // Seleccionar para telemedicina (múltiples)
    const handleSeleccionarTelemedicina = async (seleccionado) => {
        if (selectedIds.length === 0) {
            toast.error("Selecciona al menos un paciente");
            return;
        }

        try {
            await gestionPacientesService.seleccionarMultiplesParaTelemedicina(selectedIds, seleccionado);
            toast.success(
                seleccionado
                    ? `${selectedIds.length} pacientes seleccionados para telemedicina`
                    : `${selectedIds.length} pacientes removidos de telemedicina`
            );
            setSelectedIds([]);
            cargarPacientes();
        } catch (error) {
            console.error("Error:", error);
            toast.error("Error al actualizar selección");
        }
    };

    // Abrir WhatsApp
    const handleEnviarWhatsApp = (paciente) => {
        if (!paciente.telefonoCelular) {
            toast.error("El paciente no tiene teléfono registrado");
            return;
        }

        const mensaje = `Hola ${paciente.apellidosNombres}, le contactamos de CENATE para coordinar su cita de telemedicina.`;
        const url = gestionPacientesService.generarEnlaceWhatsApp(paciente.telefonoCelular, mensaje);
        window.open(url, "_blank");
    };

    // Abrir modal para crear/editar
    const handleOpenModal = (paciente = null) => {
        if (paciente) {
            setEditingPaciente(paciente);
            setFormData({
                redAsistencial: paciente.redAsistencial || "",
                ipress: paciente.ipress || "",
                numDoc: paciente.numDoc || "",
                apellidosNombres: paciente.apellidosNombres || "",
                sexo: paciente.sexo || "",
                edad: paciente.edad || "",
                telefonoCelular: paciente.telefonoCelular || "",
                condicion: paciente.condicion || "",
                gestora: paciente.gestora || "",
                observaciones: paciente.observaciones || "",
                origen: paciente.origen || "",
            });
        } else {
            setEditingPaciente(null);
            setFormData({
                redAsistencial: "",
                ipress: "",
                numDoc: "",
                apellidosNombres: "",
                sexo: "",
                edad: "",
                telefonoCelular: "",
                condicion: "",
                gestora: "",
                observaciones: "",
                origen: "",
            });
        }
        setShowModal(true);
    };

    // Guardar paciente
    const handleSave = async (e) => {
        e.preventDefault();

        if (!formData.numDoc || !formData.apellidosNombres) {
            toast.error("El documento y nombre son obligatorios");
            return;
        }

        try {
            const payload = {
                ...formData,
                edad: formData.edad ? parseInt(formData.edad) : null,
            };

            if (editingPaciente) {
                await gestionPacientesService.actualizar(editingPaciente.idGestion, payload);
                toast.success("Paciente actualizado correctamente");
            } else {
                await gestionPacientesService.crear(payload);
                toast.success("Paciente creado correctamente");
            }

            setShowModal(false);
            cargarPacientes();
        } catch (error) {
            console.error("Error:", error);
            toast.error("Error al guardar el paciente");
        }
    };

    // Eliminar paciente
    const handleDelete = async (id) => {
        if (!window.confirm("¿Está seguro de eliminar este paciente?")) {
            return;
        }

        try {
            await gestionPacientesService.eliminar(id);
            toast.success("Paciente eliminado correctamente");
            cargarPacientes();
        } catch (error) {
            console.error("Error:", error);
            toast.error("Error al eliminar el paciente");
        }
    };

    // Actualizar condición rápida
    const handleUpdateCondicion = async (id, condicion) => {
        try {
            await gestionPacientesService.actualizarCondicion(id, condicion);
            toast.success("Condición actualizada");
            cargarPacientes();
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
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Users className="w-6 h-6 text-purple-600" />
                    Gestión de Pacientes - Telemedicina
                </h1>
                <div className="flex gap-2">
                    <Button onClick={() => handleOpenModal()} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Nuevo Paciente
                    </Button>
                    <Button variant="outline" onClick={cargarPacientes} className="gap-2">
                        <RefreshCw className="w-4 h-4" />
                        Actualizar
                    </Button>
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
                                placeholder="Buscar por documento, nombre o teléfono..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>

                        {/* Filtro por condición */}
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <select
                                value={filterCondicion}
                                onChange={(e) => setFilterCondicion(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
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
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSeleccionarTelemedicina(true)}
                                disabled={selectedIds.length === 0}
                                className="gap-1 text-green-600 border-green-600 hover:bg-green-50"
                            >
                                <Check className="w-4 h-4" />
                                Seleccionar ({selectedIds.length})
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSeleccionarTelemedicina(false)}
                                disabled={selectedIds.length === 0}
                                className="gap-1 text-red-600 border-red-600 hover:bg-red-50"
                            >
                                <X className="w-4 h-4" />
                                Quitar
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tabla de pacientes */}
            <Card>
                <CardContent className="p-0 overflow-x-auto">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Cargando...</div>
                    ) : pacientesFiltrados.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No se encontraron pacientes</div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="bg-purple-50 sticky top-0">
                                <tr>
                                    <th className="p-3 text-left">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.length === pacientesFiltrados.length && pacientesFiltrados.length > 0}
                                            onChange={handleSelectAll}
                                            className="w-4 h-4 rounded border-gray-300"
                                        />
                                    </th>
                                    <th className="p-3 text-left font-semibold text-purple-900">RED.ASIS</th>
                                    <th className="p-3 text-left font-semibold text-purple-900">IPRESS</th>
                                    <th className="p-3 text-left font-semibold text-purple-900">NUM.DOC</th>
                                    <th className="p-3 text-left font-semibold text-purple-900">APELLIDOS Y NOMBRES</th>
                                    <th className="p-3 text-center font-semibold text-purple-900">SEXO</th>
                                    <th className="p-3 text-center font-semibold text-purple-900">EDAD</th>
                                    <th className="p-3 text-left font-semibold text-purple-900">TLF.CEL</th>
                                    <th className="p-3 text-left font-semibold text-purple-900">CONDICIÓN</th>
                                    <th className="p-3 text-left font-semibold text-purple-900">GESTORA</th>
                                    <th className="p-3 text-left font-semibold text-purple-900">OBSERVACIONES</th>
                                    <th className="p-3 text-left font-semibold text-purple-900">FECHA ACT.</th>
                                    <th className="p-3 text-center font-semibold text-purple-900">WHATSAPP</th>
                                    <th className="p-3 text-left font-semibold text-purple-900">ORIGEN</th>
                                    <th className="p-3 text-center font-semibold text-purple-900">ACCIONES</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pacientesFiltrados.map((p, idx) => (
                                    <tr
                                        key={p.idGestion}
                                        className={`border-t hover:bg-gray-50 ${
                                            p.seleccionadoTelemedicina ? "bg-green-50" : ""
                                        } ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                                    >
                                        <td className="p-3">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(p.idGestion)}
                                                onChange={() => handleSelectOne(p.idGestion)}
                                                className="w-4 h-4 rounded border-gray-300"
                                            />
                                        </td>
                                        <td className="p-3 whitespace-nowrap">{p.redAsistencial || "-"}</td>
                                        <td className="p-3 whitespace-nowrap">{p.ipress || "-"}</td>
                                        <td className="p-3 font-mono">{p.numDoc}</td>
                                        <td className="p-3 font-medium">{p.apellidosNombres}</td>
                                        <td className="p-3 text-center">{p.sexo || "-"}</td>
                                        <td className="p-3 text-center">{p.edad ?? "-"}</td>
                                        <td className="p-3 whitespace-nowrap">
                                            {p.telefonoCelular ? (
                                                <span className="flex items-center gap-1">
                                                    <Phone className="w-3 h-3 text-gray-400" />
                                                    {p.telefonoCelular}
                                                </span>
                                            ) : (
                                                "-"
                                            )}
                                        </td>
                                        <td className="p-3">
                                            <select
                                                value={p.condicion || ""}
                                                onChange={(e) => handleUpdateCondicion(p.idGestion, e.target.value)}
                                                className={`px-2 py-1 rounded text-xs font-medium border-0 cursor-pointer ${getCondicionStyle(p.condicion)}`}
                                            >
                                                <option value="">Seleccionar...</option>
                                                {CONDICIONES.map((c) => (
                                                    <option key={c.value} value={c.value}>
                                                        {c.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="p-3 whitespace-nowrap">{p.gestora || "-"}</td>
                                        <td className="p-3 max-w-xs truncate" title={p.observaciones}>
                                            {p.observaciones || "-"}
                                        </td>
                                        <td className="p-3 whitespace-nowrap text-xs text-gray-500">
                                            {formatFecha(p.fechaActualizacion)}
                                        </td>
                                        <td className="p-3 text-center">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEnviarWhatsApp(p)}
                                                disabled={!p.telefonoCelular}
                                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                            >
                                                <MessageCircle className="w-5 h-5" />
                                            </Button>
                                        </td>
                                        <td className="p-3 whitespace-nowrap">{p.origen || "-"}</td>
                                        <td className="p-3">
                                            <div className="flex gap-1 justify-center">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleOpenModal(p)}
                                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(p.idGestion)}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
                </CardContent>
            </Card>

            {/* Resumen */}
            <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
                <span>
                    Mostrando {pacientesFiltrados.length} de {pacientes.length} pacientes
                </span>
                <span>
                    Seleccionados para telemedicina:{" "}
                    <strong className="text-green-600">
                        {pacientes.filter((p) => p.seleccionadoTelemedicina).length}
                    </strong>
                </span>
            </div>

            {/* Modal de crear/editar */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b sticky top-0 bg-white">
                            <h2 className="text-xl font-bold">
                                {editingPaciente ? "Editar Paciente" : "Nuevo Paciente"}
                            </h2>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Red Asistencial */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Red Asistencial
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.redAsistencial}
                                        onChange={(e) => setFormData({ ...formData, redAsistencial: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>

                                {/* IPRESS */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        IPRESS
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.ipress}
                                        onChange={(e) => setFormData({ ...formData, ipress: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>

                                {/* Número de documento */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Número de Documento *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.numDoc}
                                        onChange={(e) => setFormData({ ...formData, numDoc: e.target.value })}
                                        required
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>

                                {/* Apellidos y nombres */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Apellidos y Nombres *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.apellidosNombres}
                                        onChange={(e) => setFormData({ ...formData, apellidosNombres: e.target.value })}
                                        required
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>

                                {/* Sexo */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Sexo
                                    </label>
                                    <select
                                        value={formData.sexo}
                                        onChange={(e) => setFormData({ ...formData, sexo: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="">Seleccionar...</option>
                                        <option value="M">Masculino</option>
                                        <option value="F">Femenino</option>
                                    </select>
                                </div>

                                {/* Edad */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Edad
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.edad}
                                        onChange={(e) => setFormData({ ...formData, edad: e.target.value })}
                                        min="0"
                                        max="150"
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>

                                {/* Teléfono */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Teléfono Celular
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.telefonoCelular}
                                        onChange={(e) => setFormData({ ...formData, telefonoCelular: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>

                                {/* Condición */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Condición
                                    </label>
                                    <select
                                        value={formData.condicion}
                                        onChange={(e) => setFormData({ ...formData, condicion: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="">Seleccionar...</option>
                                        {CONDICIONES.map((c) => (
                                            <option key={c.value} value={c.value}>
                                                {c.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Gestora */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Gestora
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.gestora}
                                        onChange={(e) => setFormData({ ...formData, gestora: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>

                                {/* Origen */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Origen
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.origen}
                                        onChange={(e) => setFormData({ ...formData, origen: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                            </div>

                            {/* Observaciones */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Observaciones
                                </label>
                                <textarea
                                    value={formData.observaciones}
                                    onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                                    rows="3"
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                                />
                            </div>

                            {/* Botones */}
                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                                    {editingPaciente ? "Guardar Cambios" : "Crear Paciente"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

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
    MessageCircle,
    UserCheck,
    Calendar,
    MapPin,
    ClipboardList,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Eye,
    Edit2
} from "lucide-react";
import toast from "react-hot-toast";
import apiClient from "../../../lib/apiClient";

export default function PacientesDe107() {
    // Estados
    const [pacientes, setPacientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterDerivacion, setFilterDerivacion] = useState("");
    const [filterDepartamento, setFilterDepartamento] = useState("");
    const [selectedIds, setSelectedIds] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        psicologia: 0,
        medicina: 0,
        lima: 0,
        provincia: 0
    });

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
            const lima = data.filter(p => p.departamento === 'LIMA').length;
            const provincia = data.filter(p => p.departamento !== 'LIMA').length;

            setStats({
                total: data.length,
                psicologia,
                medicina,
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

    // Filtrar pacientes
    const pacientesFiltrados = pacientes.filter((p) => {
        const matchSearch =
            !searchTerm ||
            p.numero_documento?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.paciente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.telefono?.includes(searchTerm);

        const matchDerivacion = !filterDerivacion || p.derivacion_interna === filterDerivacion;
        const matchDepartamento = !filterDepartamento || p.departamento === filterDepartamento;

        return matchSearch && matchDerivacion && matchDepartamento;
    });

    // Derivaciones únicas para el filtro
    const derivacionesUnicas = [...new Set(pacientes.map((p) => p.derivacion_interna).filter(Boolean))];
    const departamentosUnicos = [...new Set(pacientes.map((p) => p.departamento).filter(Boolean))];

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
            setSelectedIds(pacientesFiltrados.map((p) => p.id_item));
        }
    };

    // Abrir WhatsApp
    const handleEnviarWhatsApp = (paciente) => {
        if (!paciente.telefono) {
            toast.error("El paciente no tiene teléfono registrado");
            return;
        }

        const mensaje = `Hola ${paciente.paciente}, le contactamos de CENATE para coordinar su atención de telemedicina.`;
        const numeroLimpio = paciente.telefono.replace(/\D/g, '');
        const url = `https://wa.me/51${numeroLimpio}?text=${encodeURIComponent(mensaje)}`;
        window.open(url, "_blank");
    };

    // Exportar a Excel
    const handleExportar = () => {
        if (selectedIds.length === 0) {
            toast.error("Selecciona al menos un paciente para exportar");
            return;
        }

        // Aquí puedes implementar la exportación a Excel
        toast.success(`Exportando ${selectedIds.length} pacientes...`);
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
            {/* Header */}
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
                        onClick={cargarPacientes}
                        disabled={loading}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Actualizar
                    </Button>
                </div>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                <Card className="bg-white border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 hover:shadow-lg">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600 mb-1">Total Pacientes</p>
                                <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
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
                                <p className="text-3xl font-bold text-purple-600">{stats.psicologia}</p>
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
                                <p className="text-3xl font-bold text-green-600">{stats.medicina}</p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-lg">
                                <ClipboardList className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-2 border-amber-200 hover:border-amber-400 transition-all duration-300 hover:shadow-lg">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600 mb-1">Lima</p>
                                <p className="text-3xl font-bold text-amber-600">{stats.lima}</p>
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
                                <p className="text-3xl font-bold text-cyan-600">{stats.provincia}</p>
                            </div>
                            <div className="p-3 bg-cyan-100 rounded-lg">
                                <MapPin className="w-6 h-6 text-cyan-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filtros y búsqueda */}
            <Card className="bg-white shadow-lg mb-6 border-2 border-slate-200">
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Búsqueda */}
                        <div className="relative col-span-2">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar por DNI, nombre o teléfono..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {/* Filtro por Derivación */}
                        <div>
                            <select
                                value={filterDerivacion}
                                onChange={(e) => setFilterDerivacion(e.target.value)}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Todas las derivaciones</option>
                                {derivacionesUnicas.map((deriv) => (
                                    <option key={deriv} value={deriv}>
                                        {deriv}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Filtro por Departamento */}
                        <div>
                            <select
                                value={filterDepartamento}
                                onChange={(e) => setFilterDepartamento(e.target.value)}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Todos los departamentos</option>
                                {departamentosUnicos.map((dep) => (
                                    <option key={dep} value={dep}>
                                        {dep}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Acciones masivas */}
                    {selectedIds.length > 0 && (
                        <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                                <span className="font-semibold text-blue-800">
                                    {selectedIds.length} paciente{selectedIds.length !== 1 ? 's' : ''} seleccionado{selectedIds.length !== 1 ? 's' : ''}
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    onClick={handleExportar}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Exportar
                                </Button>
                                <Button
                                    onClick={() => setSelectedIds([])}
                                    className="bg-slate-500 hover:bg-slate-600 text-white"
                                >
                                    Limpiar selección
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Tabla de pacientes */}
            <Card className="bg-white shadow-lg border-2 border-slate-200">
                <CardContent className="p-6">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b-2 border-slate-200 bg-slate-50">
                                    <th className="text-left py-3 px-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.length === pacientesFiltrados.length && pacientesFiltrados.length > 0}
                                            onChange={handleSelectAll}
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
                                    <th className="text-center py-3 px-4 font-semibold text-slate-700">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="10" className="py-12 text-center text-slate-500">
                                            <div className="flex flex-col items-center gap-3">
                                                <RefreshCw className="w-12 h-12 text-slate-300 animate-spin" />
                                                <p className="font-medium text-lg">Cargando pacientes...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : pacientesFiltrados.length > 0 ? (
                                    pacientesFiltrados.map((paciente) => (
                                        <tr key={paciente.id_item} className="border-b border-slate-100 hover:bg-blue-50/30 transition-colors">
                                            <td className="py-3 px-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(paciente.id_item)}
                                                    onChange={() => handleSelectOne(paciente.id_item)}
                                                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                                />
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="text-sm text-slate-700">
                                                    {paciente.created_at ? (() => {
                                                        const fecha = new Date(paciente.created_at);
                                                        const dia = String(fecha.getDate()).padStart(2, '0');
                                                        const mes = String(fecha.getMonth() + 1).padStart(2, '0');
                                                        const anio = fecha.getFullYear();
                                                        return `${dia}/${mes}/${anio}`;
                                                    })() : '—'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="font-mono text-slate-800">{paciente.numero_documento}</span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="font-medium text-slate-800">{paciente.paciente}</span>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                                    paciente.sexo === 'M' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                                                }`}>
                                                    {paciente.sexo}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-center text-slate-700">
                                                {calcularEdad(paciente.fecha_nacimiento)}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <Phone className="w-4 h-4 text-slate-400" />
                                                    <span className="text-slate-700">{paciente.telefono || '—'}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex flex-col">
                                                    {paciente.desc_ipress ? (
                                                        <>
                                                            <span className="text-sm font-medium text-slate-800">{paciente.desc_ipress}</span>
                                                            <span className="text-xs text-slate-500">Código: {paciente.cod_ipress}</span>
                                                        </>
                                                    ) : (
                                                        <span className="text-sm text-slate-400 italic">Sin IPRESS asignada</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                    paciente.derivacion_interna?.includes('PSICOLOGIA')
                                                        ? 'bg-purple-100 text-purple-800'
                                                        : 'bg-green-100 text-green-800'
                                                }`}>
                                                    {paciente.derivacion_interna}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    {paciente.telefono && (
                                                        <button
                                                            onClick={() => handleEnviarWhatsApp(paciente)}
                                                            className="p-2 hover:bg-green-100 rounded-lg transition-colors"
                                                            title="Enviar WhatsApp"
                                                        >
                                                            <MessageCircle className="w-4 h-4 text-green-600" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="10" className="py-12 text-center text-slate-500">
                                            <div className="flex flex-col items-center gap-3">
                                                <Users className="w-16 h-16 text-slate-300" />
                                                <p className="font-medium text-lg">No hay pacientes registrados</p>
                                                <p className="text-sm">Los pacientes aparecerán aquí después de importar el Excel en "Listado de 107"</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Contador de resultados */}
                    {!loading && pacientesFiltrados.length > 0 && (
                        <div className="mt-4 flex items-center justify-between text-sm text-slate-600 border-t pt-4">
                            <span>
                                Mostrando <strong>{pacientesFiltrados.length}</strong> de <strong>{pacientes.length}</strong> pacientes
                            </span>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

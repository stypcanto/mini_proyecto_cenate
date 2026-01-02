// ========================================================================
// AsignacionDePacientes.jsx - Bandeja Personal del Admisionista
// ========================================================================
// Muestra los pacientes asignados al admisionista logueado
// Permite gestionar y dar seguimiento a las asignaciones
// ========================================================================

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import {
    Users,
    Search,
    RefreshCw,
    Phone,
    MessageCircle,
    Calendar,
    MapPin,
    ClipboardList,
    CheckCircle2,
    AlertCircle,
    UserCheck,
    Filter
} from "lucide-react";
import toast from "react-hot-toast";
import apiClient from "../../../lib/apiClient";

export default function AsignacionDePacientes() {
    // Estados
    const [pacientes, setPacientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterDerivacion, setFilterDerivacion] = useState("");
    const [stats, setStats] = useState({
        total: 0,
        psicologia: 0,
        medicina: 0,
        lima: 0,
        provincia: 0
    });

    // Cargar pacientes asignados
    const cargarPacientesAsignados = useCallback(async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/api/bolsa107/mis-asignaciones', true);
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
            console.error("Error al cargar pacientes asignados:", error);
            toast.error("Error al cargar tus pacientes asignados");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        cargarPacientesAsignados();
    }, [cargarPacientesAsignados]);

    // Filtrar pacientes
    const pacientesFiltrados = pacientes.filter((p) => {
        const matchSearch =
            !searchTerm ||
            p.numero_documento?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.paciente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.telefono?.includes(searchTerm);

        const matchDerivacion = !filterDerivacion || p.derivacion_interna === filterDerivacion;

        return matchSearch && matchDerivacion;
    });

    // Derivaciones únicas para el filtro
    const derivacionesUnicas = [...new Set(pacientes.map((p) => p.derivacion_interna).filter(Boolean))];

    // Abrir WhatsApp
    const handleEnviarWhatsApp = (paciente) => {
        if (!paciente.telefono) {
            toast.error("El paciente no tiene teléfono registrado");
            return;
        }

        const mensaje = `Hola ${paciente.paciente}, soy su admisionista asignado de CENATE. Le contacto para coordinar su atención de telemedicina.`;
        const numeroLimpio = paciente.telefono.replace(/\D/g, '');
        const url = `https://wa.me/51${numeroLimpio}?text=${encodeURIComponent(mensaje)}`;
        window.open(url, "_blank");
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
                                <UserCheck className="w-8 h-8 text-white" />
                            </div>
                            Asignación de Pacientes
                        </h1>
                        <p className="text-slate-600">Pacientes asignados a tu bandeja personal</p>
                    </div>
                    <Button
                        onClick={cargarPacientesAsignados}
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
                                <p className="text-sm text-slate-600 mb-1">Total Asignados</p>
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
                                <ClipboardList className="w-6 h-6 text-purple-600" />
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Búsqueda */}
                        <div className="relative">
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
                    </div>
                </CardContent>
            </Card>

            {/* Tabla de pacientes */}
            <Card className="bg-white shadow-lg border-2 border-slate-200">
                <CardContent className="p-6">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b-2 border-slate-200 bg-slate-50">
                                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Fecha Asignación</th>
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
                                        <td colSpan="9" className="py-12 text-center text-slate-500">
                                            <div className="flex flex-col items-center gap-3">
                                                <RefreshCw className="w-12 h-12 text-slate-300 animate-spin" />
                                                <p className="font-medium text-lg">Cargando pacientes asignados...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : pacientesFiltrados.length > 0 ? (
                                    pacientesFiltrados.map((paciente) => (
                                        <tr key={paciente.id_item} className="border-b border-slate-100 hover:bg-blue-50/30 transition-colors">
                                            <td className="py-3 px-4">
                                                <span className="text-sm text-slate-700">
                                                    {paciente.fecha_asignacion_admisionista ? (() => {
                                                        const fecha = new Date(paciente.fecha_asignacion_admisionista);
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
                                        <td colSpan="9" className="py-12 text-center text-slate-500">
                                            <div className="flex flex-col items-center gap-3">
                                                <UserCheck className="w-16 h-16 text-slate-300" />
                                                <p className="font-medium text-lg">No tienes pacientes asignados</p>
                                                <p className="text-sm">Los pacientes asignados a tu bandeja aparecerán aquí</p>
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
                                Mostrando <strong>{pacientesFiltrados.length}</strong> de <strong>{pacientes.length}</strong> pacientes asignados
                            </span>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

// ========================================================================
// DashboardCitas.jsx – Panel de Gestión de Citas (CENATE 2025)
// ------------------------------------------------------------------------
// Dashboard principal para el módulo de citas con estadísticas,
// accesos rápidos y visualización de citas pendientes.
// ========================================================================

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import {
    Calendar,
    CalendarPlus,
    Users,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Phone,
    TrendingUp,
    ArrowRight,
    RefreshCw,
    Search,
    Filter,
    UserCheck,
    Stethoscope,
    Activity,
    BarChart3,
    User,
    Loader2
} from "lucide-react";
import apiClient from "../../../lib/apiClient";
import toast from "react-hot-toast";

export default function DashboardCitas() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [totalProfesionales, setTotalProfesionales] = useState(0);
    const [estadisticas, setEstadisticas] = useState({
        totalPacientes: 0,
        porDerivacion: { psicologia: 0, medicina: 0, nutricion: 0 },
        porUbicacion: { lima: 0, provincia: 0 },
        porEstado: { pendiente: 0, citado: 0, atendido: 0, noContactado: 0, reprogramacionFallida: 0 },
        pacientesRecientes: []
    });

    // Cargar profesionales asistenciales
    const cargarProfesionales = useCallback(async () => {
        try {
            const response = await fetch("http://localhost:8080/api/personal/cnt", {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json",
                },
            });

            if (response.ok) {
                const data = await response.json();
                const profesionales = Array.isArray(data) ? data : data?.data || [];
                setTotalProfesionales(profesionales.length);
            }
        } catch (error) {
            console.error("Error al cargar profesionales:", error);
        }
    }, []);

    // Cargar estadísticas del backend
    const cargarEstadisticas = useCallback(async () => {
        setLoading(true);
        try {
            const data = await apiClient.get('/api/bolsa107/estadisticas-gestor', true);
            setEstadisticas(data);
        } catch (error) {
            console.error("Error al cargar estadísticas:", error);
            toast.error("Error al cargar las estadísticas del dashboard");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        cargarEstadisticas();
        cargarProfesionales();
    }, [cargarEstadisticas, cargarProfesionales]);

    // Módulos de acceso rápido
    const modulosAcceso = [
        {
            titulo: "Gestión del Asegurado",
            descripcion: "Administra pacientes y su seguimiento",
            icon: Users,
            color: "from-blue-500 to-blue-600",
            path: "/citas/gestion-asegurado"
        },
        {
            titulo: "Gestión de Pacientes",
            descripcion: "Registro y búsqueda de pacientes",
            icon: UserCheck,
            color: "from-emerald-500 to-emerald-600",
            path: "/citas/gestion-pacientes"
        },
        {
            titulo: "Calendario de Citas",
            descripcion: "Visualiza y programa citas",
            icon: Calendar,
            color: "from-purple-500 to-purple-600",
            path: "/citas/calendario"
        },
        {
            titulo: "Reportes",
            descripcion: "Estadísticas y análisis",
            icon: BarChart3,
            color: "from-orange-500 to-orange-600",
            path: "/citas/reportes"
        }
    ];

    return (
        <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-br from-[#0A5BA9] to-blue-600 rounded-2xl shadow-lg">
                            <CalendarPlus className="w-8 h-8 text-white" />
                        </div>
                        Gestión de Citas
                    </h1>
                    <p className="text-slate-500 mt-2 ml-16">
                        Panel de control para la administración de citas médicas
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        className="gap-2 border-slate-300 hover:bg-slate-50"
                        onClick={cargarEstadisticas}
                        disabled={loading}
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Actualizar
                    </Button>
                    <Button
                        className="gap-2 bg-[#0A5BA9] hover:bg-[#084a8a] text-white"
                        onClick={() => navigate("/citas/gestion-asegurado")}
                    >
                        <Users className="w-4 h-4" />
                        Ver Pacientes Asignados
                    </Button>
                </div>
            </div>

            {/* Tarjetas de estadísticas */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-[#0A5BA9]" />
                    <span className="ml-3 text-slate-600">Cargando estadísticas...</span>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                    <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-indigo-100 text-sm font-medium">Profesionales</p>
                                    <p className="text-3xl font-bold mt-1">{totalProfesionales}</p>
                                </div>
                                <div className="p-3 bg-white/20 rounded-xl">
                                    <Stethoscope className="w-6 h-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100 text-sm font-medium">Total Asignados</p>
                                    <p className="text-3xl font-bold mt-1">{estadisticas.totalPacientes}</p>
                                </div>
                                <div className="p-3 bg-white/20 rounded-xl">
                                    <Users className="w-6 h-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-yellow-100 text-sm font-medium">Pendientes</p>
                                    <p className="text-3xl font-bold mt-1">{estadisticas.porEstado?.pendiente || 0}</p>
                                </div>
                                <div className="p-3 bg-white/20 rounded-xl">
                                    <Clock className="w-6 h-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-emerald-100 text-sm font-medium">Citados</p>
                                    <p className="text-3xl font-bold mt-1">{estadisticas.porEstado?.citado || 0}</p>
                                </div>
                                <div className="p-3 bg-white/20 rounded-xl">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-purple-100 text-sm font-medium">Atendidos</p>
                                    <p className="text-3xl font-bold mt-1">{estadisticas.porEstado?.atendido || 0}</p>
                                </div>
                                <div className="p-3 bg-white/20 rounded-xl">
                                    <Stethoscope className="w-6 h-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-cyan-100 text-sm font-medium">Lima</p>
                                    <p className="text-3xl font-bold mt-1">{estadisticas.porUbicacion?.lima || 0}</p>
                                </div>
                                <div className="p-3 bg-white/20 rounded-xl">
                                    <Activity className="w-6 h-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-pink-100 text-sm font-medium">Provincia</p>
                                    <p className="text-3xl font-bold mt-1">{estadisticas.porUbicacion?.provincia || 0}</p>
                                </div>
                                <div className="p-3 bg-white/20 rounded-xl">
                                    <TrendingUp className="w-6 h-6" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Contenido principal */}
            {!loading && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Pacientes recientes */}
                    <div className="lg:col-span-2">
                        <Card className="shadow-lg border-0">
                            <CardContent className="p-0">
                                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-50 rounded-xl">
                                            <Clock className="w-5 h-5 text-[#0A5BA9]" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-semibold text-slate-800">Pacientes Recientes</h2>
                                            <p className="text-sm text-slate-500">Últimos pacientes asignados</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-[#0A5BA9] hover:bg-blue-50"
                                        onClick={() => navigate("/citas/gestion-asegurado")}
                                    >
                                        Ver todos
                                        <ArrowRight className="w-4 h-4 ml-1" />
                                    </Button>
                                </div>

                                <div className="divide-y divide-slate-100">
                                    {estadisticas.pacientesRecientes?.length > 0 ? (
                                        estadisticas.pacientesRecientes.map((paciente, idx) => (
                                            <div
                                                key={idx}
                                                className="p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                                                onClick={() => navigate("/citas/gestion-asegurado")}
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex items-start gap-4">
                                                        <div className="flex flex-col items-center justify-center min-w-[60px] p-2 bg-slate-100 rounded-xl">
                                                            <span className="text-xs text-slate-500 font-medium">
                                                                {paciente.fecha_asignacion_gestor
                                                                    ? new Date(paciente.fecha_asignacion_gestor).toLocaleDateString('es-PE', { day: '2-digit' })
                                                                    : 'HOY'}
                                                            </span>
                                                            <span className="text-xs font-bold text-slate-800">
                                                                {paciente.fecha_asignacion_gestor
                                                                    ? new Date(paciente.fecha_asignacion_gestor).toLocaleDateString('es-PE', { month: 'short' }).toUpperCase()
                                                                    : new Date().toLocaleDateString('es-PE', { month: 'short' }).toUpperCase()}
                                                            </span>
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <h3 className="font-semibold text-slate-800">{paciente.paciente}</h3>
                                                                <span className="px-2 py-0.5 text-xs font-medium rounded-full border bg-yellow-100 text-yellow-700 border-yellow-200">
                                                                    Pendiente
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-slate-500 mt-1">
                                                                DNI: {paciente.numero_documento}
                                                            </p>
                                                            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-600">
                                                                <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-md text-xs font-medium">
                                                                    {paciente.derivacion_interna || 'Sin derivación'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-[#0A5BA9] border-[#0A5BA9]/30 hover:bg-blue-50"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate("/citas/gestion-asegurado");
                                                        }}
                                                    >
                                                        Ver detalle
                                                    </Button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-12 text-center">
                                            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                            <p className="text-slate-500">No hay pacientes asignados recientemente</p>
                                        </div>
                                    )}
                                </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Panel lateral - Accesos rápidos */}
                <div className="space-y-6">
                    {/* Accesos rápidos */}
                    <Card className="shadow-lg border-0">
                        <CardContent className="p-5">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-purple-50 rounded-xl">
                                    <Activity className="w-5 h-5 text-purple-600" />
                                </div>
                                <h2 className="text-lg font-semibold text-slate-800">Accesos Rápidos</h2>
                            </div>
                            <div className="space-y-3">
                                {modulosAcceso.map((modulo, index) => (
                                    <button
                                        key={index}
                                        onClick={() => navigate(modulo.path)}
                                        className="w-full flex items-center gap-4 p-4 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all group"
                                    >
                                        <div className={`p-3 bg-gradient-to-br ${modulo.color} rounded-xl shadow-md group-hover:shadow-lg transition-shadow`}>
                                            <modulo.icon className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="text-left flex-1">
                                            <h3 className="font-medium text-slate-800 group-hover:text-[#0A5BA9] transition-colors">
                                                {modulo.titulo}
                                            </h3>
                                            <p className="text-xs text-slate-500">{modulo.descripcion}</p>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#0A5BA9] group-hover:translate-x-1 transition-all" />
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Resumen de Derivaciones */}
                    <Card className="shadow-lg border-0 bg-gradient-to-br from-[#0A5BA9] to-blue-700 text-white">
                        <CardContent className="p-5">
                            <h3 className="font-semibold mb-4 flex items-center gap-2">
                                <Activity className="w-5 h-5" />
                                Por Derivación
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                                    <span className="text-blue-100">Psicología</span>
                                    <span className="font-bold text-lg">{estadisticas.porDerivacion?.psicologia || 0}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                                    <span className="text-blue-100">Medicina</span>
                                    <span className="font-bold text-lg">{estadisticas.porDerivacion?.medicina || 0}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                                    <span className="text-blue-100">Nutrición</span>
                                    <span className="font-bold text-lg">{estadisticas.porDerivacion?.nutricion || 0}</span>
                                </div>
                            </div>
                            <Button
                                variant="secondary"
                                className="w-full mt-4 bg-white text-[#0A5BA9] hover:bg-blue-50"
                                onClick={() => navigate("/citas/gestion-asegurado")}
                            >
                                <Users className="w-4 h-4 mr-2" />
                                Ver Todos los Pacientes
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
            )}
        </div>
    );
}

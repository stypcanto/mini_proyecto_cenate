// ========================================================================
// DashboardCitas.jsx – Panel de Gestión de Citas (CENATE 2025)
// ------------------------------------------------------------------------
// Dashboard principal para el módulo de citas con estadísticas,
// accesos rápidos y visualización de citas pendientes.
// ========================================================================

import React, { useState, useEffect } from "react";
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
    User
} from "lucide-react";

export default function DashboardCitas() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Estadísticas de ejemplo (en producción vendrían del backend)
    const estadisticas = {
        citasHoy: 24,
        citasPendientes: 8,
        citasCompletadas: 156,
        citasCanceladas: 12,
        pacientesAtendidos: 142,
        tasaAsistencia: 92
    };

    // Citas próximas de ejemplo
    const citasProximas = [
        {
            id: 1,
            paciente: "Carlos López Mendoza",
            dni: "45678912",
            medico: "Dr. Torres García",
            especialidad: "Cardiología",
            fecha: "2025-12-04",
            hora: "10:00",
            estado: "Confirmada",
            telefono: "987654321",
            gestora: "Ellen Zamudio"
        },
        {
            id: 2,
            paciente: "María Rivas Sánchez",
            dni: "12345678",
            medico: "Dr. Pérez Luna",
            especialidad: "Dermatología",
            fecha: "2025-12-04",
            hora: "11:30",
            estado: "Pendiente",
            telefono: "912345678",
            gestora: null
        },
        {
            id: 3,
            paciente: "Juan García Flores",
            dni: "87654321",
            medico: "Dra. Mendoza Ríos",
            especialidad: "Neurología",
            fecha: "2025-12-04",
            hora: "14:00",
            estado: "Confirmada",
            telefono: "945678123",
            gestora: "María López"
        },
        {
            id: 4,
            paciente: "Ana Torres Vega",
            dni: "56781234",
            medico: "Dr. Castro Díaz",
            especialidad: "Oftalmología",
            fecha: "2025-12-04",
            hora: "15:30",
            estado: "Pendiente",
            telefono: "978123456",
            gestora: null
        },
    ];

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

    const getEstadoStyle = (estado) => {
        switch (estado) {
            case "Confirmada":
                return "bg-emerald-100 text-emerald-700 border-emerald-200";
            case "Pendiente":
                return "bg-yellow-100 text-yellow-700 border-yellow-200";
            case "Cancelada":
                return "bg-red-100 text-red-700 border-red-200";
            default:
                return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

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
                        onClick={() => setLoading(!loading)}
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Actualizar
                    </Button>
                    <Button
                        className="gap-2 bg-[#0A5BA9] hover:bg-[#084a8a] text-white"
                        onClick={() => navigate("/citas/nueva")}
                    >
                        <CalendarPlus className="w-4 h-4" />
                        Nueva Cita
                    </Button>
                </div>
            </div>

            {/* Tarjetas de estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm font-medium">Citas Hoy</p>
                                <p className="text-3xl font-bold mt-1">{estadisticas.citasHoy}</p>
                            </div>
                            <div className="p-3 bg-white/20 rounded-xl">
                                <Calendar className="w-6 h-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-yellow-100 text-sm font-medium">Pendientes</p>
                                <p className="text-3xl font-bold mt-1">{estadisticas.citasPendientes}</p>
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
                                <p className="text-emerald-100 text-sm font-medium">Completadas</p>
                                <p className="text-3xl font-bold mt-1">{estadisticas.citasCompletadas}</p>
                            </div>
                            <div className="p-3 bg-white/20 rounded-xl">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-red-100 text-sm font-medium">Canceladas</p>
                                <p className="text-3xl font-bold mt-1">{estadisticas.citasCanceladas}</p>
                            </div>
                            <div className="p-3 bg-white/20 rounded-xl">
                                <XCircle className="w-6 h-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100 text-sm font-medium">Pacientes</p>
                                <p className="text-3xl font-bold mt-1">{estadisticas.pacientesAtendidos}</p>
                            </div>
                            <div className="p-3 bg-white/20 rounded-xl">
                                <Users className="w-6 h-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-cyan-100 text-sm font-medium">Asistencia</p>
                                <p className="text-3xl font-bold mt-1">{estadisticas.tasaAsistencia}%</p>
                            </div>
                            <div className="p-3 bg-white/20 rounded-xl">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Contenido principal */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Citas próximas */}
                <div className="lg:col-span-2">
                    <Card className="shadow-lg border-0">
                        <CardContent className="p-0">
                            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-50 rounded-xl">
                                        <Clock className="w-5 h-5 text-[#0A5BA9]" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold text-slate-800">Citas de Hoy</h2>
                                        <p className="text-sm text-slate-500">Próximas atenciones programadas</p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-[#0A5BA9] hover:bg-blue-50"
                                    onClick={() => navigate("/citas/calendario")}
                                >
                                    Ver todas
                                    <ArrowRight className="w-4 h-4 ml-1" />
                                </Button>
                            </div>

                            <div className="divide-y divide-slate-100">
                                {citasProximas.map((cita) => (
                                    <div
                                        key={cita.id}
                                        className="p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-start gap-4">
                                                <div className="flex flex-col items-center justify-center min-w-[60px] p-2 bg-slate-100 rounded-xl">
                                                    <span className="text-xs text-slate-500 font-medium">
                                                        {new Date(cita.fecha).toLocaleDateString('es-PE', { weekday: 'short' }).toUpperCase()}
                                                    </span>
                                                    <span className="text-lg font-bold text-slate-800">{cita.hora}</span>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-semibold text-slate-800">{cita.paciente}</h3>
                                                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getEstadoStyle(cita.estado)}`}>
                                                            {cita.estado}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-slate-500 mt-1">
                                                        DNI: {cita.dni}
                                                    </p>
                                                    <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-600">
                                                        <span className="flex items-center gap-1">
                                                            <Stethoscope className="w-4 h-4 text-slate-400" />
                                                            {cita.medico}
                                                        </span>
                                                        <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-md text-xs font-medium">
                                                            {cita.especialidad}
                                                        </span>
                                                        {/* Gestora asignada */}
                                                        {cita.gestora ? (
                                                            <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md text-xs font-medium border border-emerald-200">
                                                                <User className="w-3 h-3" />
                                                                {cita.gestora}
                                                            </span>
                                                        ) : (
                                                            <span className="flex items-center gap-1 px-2 py-0.5 bg-orange-50 text-orange-600 rounded-md text-xs font-medium border border-orange-200">
                                                                <User className="w-3 h-3" />
                                                                Sin gestora
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-emerald-600 hover:bg-emerald-50"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        window.open(`https://wa.me/51${cita.telefono}`, '_blank');
                                                    }}
                                                >
                                                    <Phone className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-[#0A5BA9] border-[#0A5BA9]/30 hover:bg-blue-50"
                                                >
                                                    Ver detalle
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {citasProximas.length === 0 && (
                                <div className="p-12 text-center">
                                    <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                    <p className="text-slate-500">No hay citas programadas para hoy</p>
                                </div>
                            )}
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

                    {/* Resumen del día */}
                    <Card className="shadow-lg border-0 bg-gradient-to-br from-[#0A5BA9] to-blue-700 text-white">
                        <CardContent className="p-5">
                            <h3 className="font-semibold mb-4 flex items-center gap-2">
                                <AlertCircle className="w-5 h-5" />
                                Resumen del Día
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                                    <span className="text-blue-100">Citas confirmadas</span>
                                    <span className="font-bold text-lg">18</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                                    <span className="text-blue-100">Por confirmar</span>
                                    <span className="font-bold text-lg">6</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
                                    <span className="text-blue-100">Médicos activos</span>
                                    <span className="font-bold text-lg">12</span>
                                </div>
                            </div>
                            <Button
                                variant="secondary"
                                className="w-full mt-4 bg-white text-[#0A5BA9] hover:bg-blue-50"
                                onClick={() => navigate("/citas/reportes")}
                            >
                                <BarChart3 className="w-4 h-4 mr-2" />
                                Ver Reportes Completos
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

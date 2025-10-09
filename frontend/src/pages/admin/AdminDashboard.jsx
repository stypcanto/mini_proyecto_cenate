import React, { useEffect, useState } from "react";
import { Users, ShieldCheck, ServerCog, LayoutDashboard, Activity, TrendingUp, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import AdminLayout from "../../components/layout/AdminLayout";

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalUsuarios: 0,
        usuariosActivos: 0,
        usuariosInactivos: 0,
        totalRoles: 0,
        totalLogs: 0,
        logsRecientes24h: 0,
        actividadSemanal: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cargarEstadisticas();
    }, []);

    const cargarEstadisticas = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch("http://localhost:8080/api/admin/dashboard/stats", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error("Error al cargar estadísticas:", error);
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ icon, title, value, subtitle, color, to }) => {
        const colorClasses = {
            teal: "from-teal-500 to-teal-600",
            blue: "from-blue-500 to-blue-600",
            orange: "from-orange-500 to-orange-600",
            purple: "from-purple-500 to-purple-600",
            green: "from-green-500 to-green-600",
            red: "from-red-500 to-red-600",
        };

        const CardContent = (
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 transform hover:-translate-y-1">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]} mb-4`}>
                            {icon}
                        </div>
                        <h3 className="text-gray-600 text-sm font-semibold mb-2">{title}</h3>
                        <p className="text-3xl font-bold text-gray-900 mb-1">{loading ? "..." : value}</p>
                        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
                    </div>
                </div>
            </div>
        );

        return to ? <Link to={to}>{CardContent}</Link> : CardContent;
    };

    return (
        <AdminLayout>
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white p-8 shadow-lg">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center space-x-3 mb-2">
                        <LayoutDashboard className="w-8 h-8" />
                        <h1 className="text-4xl font-bold">Panel de Administración</h1>
                    </div>
                    <p className="text-teal-100 text-lg">Sistema de Gestión CENATE</p>
                </div>
            </div>

            {/* Contenido */}
            <div className="max-w-7xl mx-auto p-8">
                {/* Estadísticas Principales */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                        <TrendingUp className="w-6 h-6 mr-2 text-teal-600" />
                        Estadísticas Generales
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard
                            icon={<Users className="w-6 h-6 text-white" />}
                            title="USUARIOS"
                            value={stats.totalUsuarios}
                            subtitle={`${stats.usuariosActivos} activos`}
                            color="teal"
                            to="/admin/users"
                        />
                        <StatCard
                            icon={<ShieldCheck className="w-6 h-6 text-white" />}
                            title="ROLES"
                            value={stats.totalRoles}
                            subtitle="Roles configurados"
                            color="blue"
                            to="/admin/roles"
                        />
                        <StatCard
                            icon={<ServerCog className="w-6 h-6 text-white" />}
                            title="LOGS DEL SISTEMA"
                            value={stats.totalLogs}
                            subtitle={`${stats.logsRecientes24h} últimas 24h`}
                            color="orange"
                            to="/admin/logs"
                        />
                        <StatCard
                            icon={<Activity className="w-6 h-6 text-white" />}
                            title="ACTIVIDAD SEMANAL"
                            value={stats.actividadSemanal}
                            subtitle="Acciones registradas"
                            color="purple"
                        />
                    </div>
                </div>

                {/* Módulos de Gestión */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                        <LayoutDashboard className="w-6 h-6 mr-2 text-teal-600" />
                        Módulos de Gestión
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <ModuleCard
                            icon={<Users className="text-blue-600" />}
                            title="Usuarios"
                            description="Gestiona usuarios registrados"
                            to="/admin/users"
                            bgColor="bg-blue-50"
                            borderColor="border-blue-200"
                        />
                        <ModuleCard
                            icon={<ShieldCheck className="text-green-600" />}
                            title="Roles y Permisos"
                            description="Configura accesos del sistema"
                            to="/admin/roles"
                            bgColor="bg-green-50"
                            borderColor="border-green-200"
                        />
                        <ModuleCard
                            icon={<ServerCog className="text-orange-600" />}
                            title="Logs del Sistema"
                            description="Monitorea actividad del sistema"
                            to="/admin/logs"
                            bgColor="bg-orange-50"
                            borderColor="border-orange-200"
                        />
                        <ModuleCard
                            icon={<LayoutDashboard className="text-purple-600" />}
                            title="Reportes"
                            description="Visualiza métricas y estadísticas"
                            to="/admin/reportes"
                            bgColor="bg-purple-50"
                            borderColor="border-purple-200"
                        />
                    </div>
                </div>

                {/* Información adicional */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Usuarios Activos vs Inactivos */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                            <Users className="w-5 h-5 mr-2 text-teal-600" />
                            Estado de Usuarios
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                <span className="text-gray-700 font-medium">Usuarios Activos</span>
                                <span className="text-2xl font-bold text-green-600">
                                    {loading ? "..." : stats.usuariosActivos}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                                <span className="text-gray-700 font-medium">Usuarios Inactivos</span>
                                <span className="text-2xl font-bold text-red-600">
                                    {loading ? "..." : stats.usuariosInactivos}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Actividad Reciente */}
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                            <Activity className="w-5 h-5 mr-2 text-teal-600" />
                            Actividad del Sistema
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                <span className="text-gray-700 font-medium">Últimas 24 horas</span>
                                <span className="text-2xl font-bold text-blue-600">
                                    {loading ? "..." : stats.logsRecientes24h}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                                <span className="text-gray-700 font-medium">Última semana</span>
                                <span className="text-2xl font-bold text-purple-600">
                                    {loading ? "..." : stats.actividadSemanal}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

const ModuleCard = ({ icon, title, description, to, bgColor, borderColor }) => (
    <Link
        to={to || "#"}
        className={`${bgColor} border-2 ${borderColor} p-6 rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 block`}
    >
        <div className="text-3xl mb-4">{icon}</div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
    </Link>
);

export default AdminDashboard;

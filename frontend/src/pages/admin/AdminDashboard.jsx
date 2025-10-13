import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    Users,
    ShieldCheck,
    ServerCog,
    Activity,
    LayoutDashboard,
    TrendingUp,
    RefreshCw,
} from "lucide-react";
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
            const response = await fetch(
                "http://localhost:8080/api/admin/dashboard/stats",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error("❌ Error al cargar estadísticas:", error);
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ icon, title, value, subtitle, color, to }) => {
        const colors = {
            teal: "from-teal-500/20 to-teal-600/5",
            blue: "from-blue-500/20 to-blue-600/5",
            orange: "from-orange-500/20 to-orange-600/5",
            purple: "from-purple-500/20 to-purple-600/5",
            green: "from-green-500/20 to-green-600/5",
        };

        const card = (
            <motion.div
                className={`rounded-2xl bg-gradient-to-br ${colors[color]} p-6 shadow-md hover:shadow-xl transition-all border border-white/20 backdrop-blur-xl`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
            >
                <div className="flex items-start justify-between">
                    <div>
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/70 mb-4 shadow-inner">
                            {icon}
                        </div>
                        <h3 className="text-sm font-semibold text-gray-600 mb-1">
                            {title}
                        </h3>
                        <p className="text-3xl font-bold text-gray-900">
                            {loading ? "..." : value}
                        </p>
                        {subtitle && (
                            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
                        )}
                    </div>
                </div>
            </motion.div>
        );

        return to ? <Link to={to}>{card}</Link> : card;
    };

    return (
        <AdminLayout>
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white p-8 shadow-lg">
                <div className="max-w-7xl mx-auto flex items-center space-x-3">
                    <LayoutDashboard className="w-8 h-8" />
                    <h1 className="text-4xl font-bold">Panel de Administración</h1>
                </div>
                <p className="text-teal-100 text-lg mt-2">
                    Monitorea y gestiona el ecosistema digital del CENATE
                </p>
            </div>

            {/* Contenido */}
            <div className="max-w-7xl mx-auto p-8">
                {/* 🔹 Estadísticas principales */}
                <div className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                            <TrendingUp className="w-6 h-6 mr-2 text-teal-600" />
                            Estadísticas Generales
                        </h2>
                        <button
                            onClick={cargarEstadisticas}
                            disabled={loading}
                            className="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-all shadow-md disabled:opacity-50"
                        >
                            <RefreshCw
                                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                            />
                            <span>Actualizar</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard
                            icon={<Users className="w-6 h-6 text-teal-700" />}
                            title="Usuarios"
                            value={stats.totalUsuarios}
                            subtitle={`${stats.usuariosActivos} activos`}
                            color="teal"
                            to="/admin/users"
                        />
                        <StatCard
                            icon={<ShieldCheck className="w-6 h-6 text-blue-700" />}
                            title="Roles"
                            value={stats.totalRoles}
                            subtitle="Roles configurados"
                            color="blue"
                            to="/admin/roles"
                        />
                        <StatCard
                            icon={<ServerCog className="w-6 h-6 text-orange-700" />}
                            title="Logs del sistema"
                            value={stats.totalLogs}
                            subtitle={`${stats.logsRecientes24h} últimas 24h`}
                            color="orange"
                            to="/admin/logs"
                        />
                        <StatCard
                            icon={<Activity className="w-6 h-6 text-purple-700" />}
                            title="Actividad semanal"
                            value={stats.actividadSemanal}
                            subtitle="Eventos registrados"
                            color="purple"
                        />
                    </div>
                </div>

                {/* 🔸 Estado de usuarios */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <motion.div
                        className="bg-white/70 rounded-2xl shadow-lg p-6 backdrop-blur-xl border border-gray-100"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                            <Users className="w-5 h-5 mr-2 text-teal-600" />
                            Estado de Usuarios
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-gray-700 font-medium">
                  Usuarios Activos
                </span>
                                <span className="text-2xl font-bold text-green-600">
                  {loading ? "..." : stats.usuariosActivos}
                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <span className="text-gray-700 font-medium">
                  Usuarios Inactivos
                </span>
                                <span className="text-2xl font-bold text-red-600">
                  {loading ? "..." : stats.usuariosInactivos}
                </span>
                            </div>
                        </div>
                    </motion.div>

                    {/* 🔸 Actividad reciente */}
                    <motion.div
                        className="bg-white/70 rounded-2xl shadow-lg p-6 backdrop-blur-xl border border-gray-100"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                            <Activity className="w-5 h-5 mr-2 text-teal-600" />
                            Actividad del Sistema
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-gray-700 font-medium">
                  Últimas 24 horas
                </span>
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
                    </motion.div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;
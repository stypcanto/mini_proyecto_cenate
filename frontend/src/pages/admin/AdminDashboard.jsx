import React from "react";
import { Users, ShieldCheck, ServerCog, LayoutDashboard } from "lucide-react";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
    return (
        <div className="min-h-screen bg-gray-50 p-10">
            <h1 className="text-4xl font-bold text-gray-800 mb-10">
                Panel de Administración
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                <DashboardCard
                    icon={<Users className="text-blue-600" />}
                    title="Usuarios"
                    to="/admin/users"
                    subtitle="Gestiona usuarios registrados"
                />
                <DashboardCard
                    icon={<ShieldCheck className="text-green-600" />}
                    title="Roles y Permisos"
                    to="/admin/roles"
                    subtitle="Configura accesos del sistema"
                />
                <DashboardCard
                    icon={<ServerCog className="text-orange-600" />}
                    title="Logs del Sistema"
                    to="/admin/logs"
                    subtitle="Monitorea actividad del sistema"
                />
                <DashboardCard
                    icon={<LayoutDashboard className="text-purple-600" />}
                    title="Reportes"
                    subtitle="Visualiza métricas y estadísticas"
                />
            </div>
        </div>
    );
};

const DashboardCard = ({ icon, title, subtitle, to }) => (
    <Link
        to={to || "#"}
        className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-shadow block"
    >
        <div className="mb-4 text-2xl">{icon}</div>
        <h2 className="text-lg font-semibold text-gray-800 mb-1">{title}</h2>
        <p className="text-sm text-gray-600">{subtitle}</p>
    </Link>
);

export default AdminDashboard;

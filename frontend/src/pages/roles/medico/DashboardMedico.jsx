import React from "react";
import RoleLayout from "../RoleLayout";
import { CalendarDays, FileText, Activity } from "lucide-react";

export default function DashboardMedico() {
    const modules = [
        { label: "Citas", path: "/medico/citas", icon: <CalendarDays className="w-5 h-5" /> },
        { label: "Pacientes", path: "/medico/pacientes", icon: <FileText className="w-5 h-5" /> },
        { label: "Indicadores", path: "/medico/indicadores", icon: <Activity className="w-5 h-5" /> },
    ];

    return (
        <RoleLayout title="Panel Profesional de Salud" modules={modules}>
            <div className="text-gray-700">
                <h2 className="text-2xl font-semibold mb-4">Bienvenido, Dr(a).</h2>
                <p className="text-gray-600">
                    Desde aquí podrá acceder a sus módulos clínicos, revisar pacientes y gestionar citas.
                </p>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card title="Citas del día" value="12" />
                    <Card title="Pacientes atendidos" value="8" />
                    <Card title="Alertas pendientes" value="3" />
                </div>
            </div>
        </RoleLayout>
    );
}

const Card = ({ title, value }) => (
    <div className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition">
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-3xl font-bold text-blue-600 mt-1">{value}</p>
    </div>
);
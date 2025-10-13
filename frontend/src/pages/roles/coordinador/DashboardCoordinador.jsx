import React from "react";
import RoleLayout from "../RoleLayout";
import { CalendarCheck, Users, ClipboardList } from "lucide-react";

export default function DashboardCoordinador() {
    const modules = [
        { label: "Agenda Médica", path: "/coordinador/agenda", icon: <CalendarCheck className="w-5 h-5" /> },
        { label: "Profesionales", path: "/coordinador/medicos", icon: <Users className="w-5 h-5" /> },
        { label: "Reportes", path: "/coordinador/reportes", icon: <ClipboardList className="w-5 h-5" /> },
    ];

    return (
        <RoleLayout title="Panel Coordinador de Gestión de Citas" modules={modules}>
            <div className="text-gray-700">
                <h2 className="text-2xl font-semibold mb-4">Gestión de Turnos y Agendas</h2>
                <p className="text-gray-600">
                    Supervisa y organiza la programación de los profesionales de salud.
                </p>
            </div>
        </RoleLayout>
    );
}
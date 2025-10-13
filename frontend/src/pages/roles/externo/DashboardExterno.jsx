import React from "react";
import RoleLayout from "../RoleLayout";
import { Building2, FileText, MessageSquare } from "lucide-react";

export default function DashboardExterno() {
    const modules = [
        { label: "Institución", path: "/externo/info", icon: <Building2 className="w-5 h-5" /> },
        { label: "Reportes Enviados", path: "/externo/reportes", icon: <FileText className="w-5 h-5" /> },
        { label: "Comunicaciones", path: "/externo/mensajes", icon: <MessageSquare className="w-5 h-5" /> },
    ];

    return (
        <RoleLayout title="Panel de Personal Externo" modules={modules}>
            <div className="text-gray-700">
                <h2 className="text-2xl font-semibold mb-4">Bienvenido al Portal Externo</h2>
                <p className="text-gray-600">
                    Acceda a los reportes, registros y módulos asignados a su institución.
                </p>
            </div>
        </RoleLayout>
    );
}
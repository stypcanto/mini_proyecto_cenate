import React, { useState } from "react";
import {
    Users,
    Briefcase,
    FileText,
    Building2,
    ClipboardList,
    PenTool,
    FileSignature,
    ShoppingCart,
} from "lucide-react";

// Tablas
import UsuariosTable from "./tables/UsuariosTable";
import PersonalTable from "./tables/PersonalTable";
import AreasTable from "./tables/AreasTable";
import RegimenesLaboralesTable from "./tables/RegimenesLaboralesTable";
import TiposDocumentoTable from "./tables/TiposDocumentoTable";
import ProfesionesTable from "./tables/ProfesionesTable";
import FirmasDigitalesTable from "./tables/FirmasDigitalesTable";
import OrdenesCompraTable from "./tables/OrdenesCompraTable";

export default function AdminUsersManagement() {
    const [tab, setTab] = useState("usuarios");

    const tabs = [
        { id: "usuarios", label: "Usuarios", icon: <Users className="w-4 h-4" /> },
        { id: "personal", label: "Personal CNT", icon: <Briefcase className="w-4 h-4" /> },
        { id: "areas", label: "Áreas", icon: <Building2 className="w-4 h-4" /> },
        { id: "regimenes", label: "Regímenes", icon: <ClipboardList className="w-4 h-4" /> },
        { id: "documentos", label: "Tipos Documento", icon: <FileText className="w-4 h-4" /> },
        { id: "profesiones", label: "Profesiones", icon: <PenTool className="w-4 h-4" /> },
        { id: "firmas", label: "Firmas Digitales", icon: <FileSignature className="w-4 h-4" /> },
        { id: "ordenes", label: "Órdenes de Compra", icon: <ShoppingCart className="w-4 h-4" /> },
    ];

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
                Gestión de Usuarios y Entidades del Sistema
            </h1>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 border-b pb-3 mb-6">
                {tabs.map(({ id, label, icon }) => (
                    <button
                        key={id}
                        onClick={() => setTab(id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-medium transition-all ${
                            tab === id
                                ? "bg-blue-600 text-white shadow-md"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                        {icon}
                        {label}
                    </button>
                ))}
            </div>

            {/* Contenido dinámico */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                {tab === "usuarios" && <UsuariosTable />}
                {tab === "personal" && <PersonalTable />}
                {tab === "areas" && <AreasTable />}
                {tab === "regimenes" && <RegimenesLaboralesTable />}
                {tab === "documentos" && <TiposDocumentoTable />}
                {tab === "profesiones" && <ProfesionesTable />}
                {tab === "firmas" && <FirmasDigitalesTable />}
                {tab === "ordenes" && <OrdenesCompraTable />}
            </div>
        </div>
    );
}
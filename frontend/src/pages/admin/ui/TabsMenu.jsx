import React from "react";
import { Users, UserPlus, FileText, Building2, Briefcase } from "lucide-react";

const tabs = [
    { id: "usuarios", label: "Usuarios", icon: Users },
    { id: "personal", label: "Personal", icon: UserPlus },
    { id: "tiposDocumento", label: "Tipos Documento", icon: FileText },
    { id: "areas", label: "Áreas", icon: Building2 },
    { id: "regimenesLaborales", label: "Regímenes Laborales", icon: Briefcase },
];

export default function TabsMenu({ activeTab, onChange }) {
    return (
        <div className="flex space-x-4 mb-6 border-b">
            {tabs.map(({ id, label, icon: Icon }) => (
                <button
                    key={id}
                    onClick={() => onChange(id)}
                    className={`flex items-center space-x-2 px-4 py-2 text-sm font-semibold transition ${
                        activeTab === id
                            ? "border-b-2 border-blue-600 text-blue-600"
                            : "text-gray-600 hover:text-blue-600"
                    }`}
                >
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                </button>
            ))}
        </div>
    );
}

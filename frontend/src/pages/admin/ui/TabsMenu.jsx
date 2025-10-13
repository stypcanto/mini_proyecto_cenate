import React from "react";
import { motion } from "framer-motion";
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
        <div className="relative overflow-x-auto">
            <div className="flex space-x-2 sm:space-x-4 border-b border-gray-200 pb-2 min-w-max px-1">
                {tabs.map(({ id, label, icon: Icon }) => {
                    const isActive = activeTab === id;
                    return (
                        <button
                            key={id}
                            onClick={() => onChange(id)}
                            className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 
                ${
                                isActive
                                    ? "text-blue-600 bg-blue-50 shadow-sm"
                                    : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                            }`}
                        >
                            <Icon className={`w-4 h-4 ${isActive ? "text-blue-600" : "text-gray-400"}`} />
                            <span>{label}</span>

                            {/* Línea inferior animada */}
                            {isActive && (
                                <motion.div
                                    layoutId="tab-indicator"
                                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-600 rounded-full"
                                />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
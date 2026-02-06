import React from "react";
import { User, Stethoscope, FileStack } from "lucide-react";

/**
 * DarkSidebar - Left Navigation Panel (Desktop Only: xl: 1280px+)
 * Minimal dark menu with 3 sections: Patient Info, Clinical Data, EKG Files
 */
export default function DarkSidebar({
  activeSection = "patient",
  onSectionChange,
  patientData = {},
  fileCount = 0
}) {
  const sections = [
    {
      id: "patient",
      label: "Información del Paciente",
      icon: User,
      badge: patientData.apellidos ? "✓" : "•"
    },
    {
      id: "clinical",
      label: "Datos Clínicos",
      icon: Stethoscope,
      badge: "•"
    },
    {
      id: "files",
      label: "Archivos EKG",
      icon: FileStack,
      badge: `${fileCount}`
    }
  ];

  return (
    <div className="hidden xl:flex w-52 bg-gradient-to-b from-cyan-900 to-cyan-950 border-r border-cyan-800 flex-col p-3 text-white">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 mb-1">
          📋 Carga de EKG
        </h3>
        <div className="h-0.5 w-6 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-full"></div>
      </div>

      {/* Navigation Sections */}
      <nav className="space-y-1.5 flex-1">
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;

          return (
            <button
              key={section.id}
              onClick={() => onSectionChange?.(section.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-left group ${
                isActive
                  ? "bg-cyan-600 text-white border-l-4 border-cyan-400"
                  : "text-cyan-300 hover:bg-cyan-800 border-l-4 border-transparent"
              }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${
                isActive ? "text-cyan-200" : "text-cyan-500 group-hover:text-cyan-300"
              }`} />
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-medium truncate ${
                  isActive ? "text-white" : "text-cyan-300"
                }`}>
                  {section.label}
                </p>
              </div>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                isActive
                  ? "bg-cyan-700 text-cyan-100"
                  : "bg-cyan-800 text-cyan-400"
              }`}>
                {section.badge}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="border-t border-cyan-800 pt-2 mt-auto">
        <p className="text-[10px] text-cyan-500 text-center leading-relaxed">
          📤 {fileCount > 0 ? `${fileCount} archivos listos` : "Sin archivos aún"}
        </p>
      </div>
    </div>
  );
}

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
    <div className="hidden xl:flex w-60 bg-gray-900 border-r border-gray-800 flex-col p-4 text-white">
      {/* Header */}
      <div className="mb-8">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
          📋 Carga de EKG
        </h3>
        <div className="h-1 w-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
      </div>

      {/* Navigation Sections */}
      <nav className="space-y-2 flex-1">
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;

          return (
            <button
              key={section.id}
              onClick={() => onSectionChange?.(section.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left group ${
                isActive
                  ? "bg-blue-600 text-white border-l-4 border-blue-400"
                  : "text-gray-300 hover:bg-gray-800 border-l-4 border-transparent"
              }`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${
                isActive ? "text-blue-200" : "text-gray-500 group-hover:text-gray-300"
              }`} />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${
                  isActive ? "text-white" : "text-gray-300"
                }`}>
                  {section.label}
                </p>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full flex-shrink-0 ${
                isActive
                  ? "bg-blue-700 text-blue-100"
                  : "bg-gray-800 text-gray-400"
              }`}>
                {section.badge}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="border-t border-gray-800 pt-4 mt-auto">
        <p className="text-xs text-gray-500 text-center leading-relaxed">
          📤 {fileCount > 0 ? `${fileCount} archivos listos` : "Sin archivos aún"}
        </p>
      </div>
    </div>
  );
}

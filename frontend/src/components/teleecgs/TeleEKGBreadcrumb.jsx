import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Upload, List, Activity } from "lucide-react";

/**
 * 📍 Breadcrumb de navegación para TeleEKG Workflow
 * Muestra las 3 etapas: Upload → Listar → Recibidas (CENATE)
 */
export default function TeleEKGBreadcrumb() {
  const location = useLocation();

  const steps = [
    {
      path: "/teleekgs/upload",
      label: "Subir Electrocardiogramas",
      icon: Upload,
      description: "Sube tus imágenes ECG",
    },
    {
      path: "/teleekgs/listar",
      label: "Mis EKGs",
      icon: List,
      description: "Revisa tus cargas",
    },
    {
      path: "/teleecg/recibidas",
      label: "CENATE - Recibidas",
      icon: Activity,
      description: "Vista consolidada",
    },
  ];

  const currentStepIndex = steps.findIndex(
    (step) => step.path === location.pathname
  );

  return (
    <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg shadow-md p-4 mb-6 border border-blue-200">
      <div className="flex items-center gap-2 flex-wrap">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentStepIndex;
          const isCompleted = index < currentStepIndex;

          return (
            <React.Fragment key={step.path}>
              {index > 0 && (
                <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
              )}

              <Link
                to={step.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all transform hover:scale-105 ${
                  isActive
                    ? "bg-blue-600 text-white font-semibold shadow-lg"
                    : isCompleted
                    ? "bg-green-100 text-green-700 hover:bg-green-200"
                    : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-300"
                }`}
                title={step.description}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-medium whitespace-nowrap">
                  {step.label}
                </span>
              </Link>
            </React.Fragment>
          );
        })}
      </div>

      {/* Indicador de progreso */}
      <div className="mt-3 h-1 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300"
          style={{
            width: `${((currentStepIndex + 1) / steps.length) * 100}%`,
          }}
        />
      </div>
    </div>
  );
}

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Upload, List, Activity } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

/**
 * 📍 Breadcrumb de navegación para TeleEKG Workflow
 * Muestra las 3 etapas: Upload → Listar → Recibidas (CENATE)
 * ✅ Oculta "CENATE - Recibidas" para usuarios EXTERNO
 */
export default function TeleEKGBreadcrumb() {
  const location = useLocation();
  const { user } = useAuth();

  // Verificar si el usuario es externo
  const isExterno = user?.roles?.some(role =>
    role.toUpperCase().includes("EXTERNO") || role.toUpperCase().includes("INSTITUCION")
  );

  const allSteps = [
    {
      path: "/teleekgs/upload",
      label: "Subir Electrocardiogramas",
      icon: Upload,
      description: "Sube tus imágenes ECG",
      allowedRoles: ["EXTERNO", "INSTITUCION_EX"], // ✅ Solo usuarios externos
    },
    {
      path: "/teleekgs/listar",
      label: "Mis EKGs",
      icon: List,
      description: "Revisa tus cargas",
      allowedRoles: ["EXTERNO", "INSTITUCION_EX"], // ✅ Solo usuarios externos
    },
    {
      path: "/teleecg/recibidas",
      label: "CENATE - Recibidas",
      icon: Activity,
      description: "Vista consolidada",
      allowedRoles: ["ADMIN", "COORDINADOR", "COORDINADOR_GESTION_CITAS", "MEDICO", "SUPERADMIN"], // ✅ Solo usuarios CENATE
    },
  ];

  // Filtrar steps según rol del usuario
  const steps = allSteps.filter(step => {
    if (!step.allowedRoles) return true;

    // Verificar si el usuario tiene al menos un rol permitido
    return step.allowedRoles.some(allowedRole =>
      user?.roles?.some(userRole =>
        userRole.toUpperCase().includes(allowedRole.toUpperCase())
      )
    );
  });

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

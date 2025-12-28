// ========================================================================
// 🧭 DashboardCoordinador.jsx – Panel Coordinador Médico (CENATE)
// ------------------------------------------------------------------------
// Panel principal para la gestión de turnos y asignación de gestores
// de médicos. Incluye acceso directo al módulo AsignarGestorMedico.jsx.
// ========================================================================

import React from "react";
import { useNavigate } from "react-router-dom";
import RoleLayout from "../RoleLayout";
import { CalendarCheck, UserCog, ClipboardList, CheckCircle } from "lucide-react";

export default function DashboardCoordinador() {
  const navigate = useNavigate();

  const modules = [
    {
      label: "Agenda Médica",
      path: "/roles/coordinador/agenda",
      icon: <CalendarCheck className="w-5 h-5" />,
    },
    {
      label: "Asignar Gestores",
      path: "/roles/coordinador/asignacion",
      icon: <UserCog className="w-5 h-5" />,
    },
    {
      label: "Revisión de Disponibilidad",
      path: "/roles/coordinador/revision-disponibilidad",
      icon: <CheckCircle className="w-5 h-5" />,
    },
    {
      label: "Reportes",
      path: "/roles/coordinador/reportes",
      icon: <ClipboardList className="w-5 h-5" />,
    },
  ];

  return (
    <RoleLayout
      title="Panel Coordinador de Gestión de Citas"
      modules={modules}
    >
      <div className="text-gray-700 space-y-6">
        {/* 📘 Descripción */}
        <div>
          <h2 className="text-2xl font-semibold mb-2 text-cenate-blue">
            Gestión de Turnos y Agendas
          </h2>
          <p className="text-gray-600">
            Supervisa y organiza la programación de los profesionales de salud,
            garantizando la correcta asignación de gestores a cada turno.
          </p>
        </div>

        {/* 🧭 Tarjeta informativa */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-3">
            ¿Qué puedes hacer desde este panel?
          </h3>
          <ul className="list-disc list-inside text-gray-600 text-sm space-y-1">
            <li>Revisar y editar las agendas médicas registradas.</li>
            <li>Asignar gestores responsables por médico y turno.</li>
            <li>Monitorear la cobertura operativa por fecha y especialidad.</li>
            <li>Generar reportes de cumplimiento y productividad.</li>
          </ul>
        </div>

        {/* 🚀 Acción principal */}
        <div className="flex flex-col items-center mt-6">
          <button
            onClick={() => navigate("/roles/coordinador/asignacion")}
            className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900
                       text-white px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            <UserCog className="w-6 h-6" />
            <span className="text-lg font-medium">
              Ir al Módulo de Asignación de Gestores Médicos
            </span>
          </button>

          <p className="text-gray-500 text-sm mt-3">
            Accede al módulo completo para gestionar turnos y cobertura.
          </p>
        </div>
      </div>
    </RoleLayout>
  );
}
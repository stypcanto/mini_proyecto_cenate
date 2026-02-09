// ========================================================================
// 👤 Profile.jsx – Página "Mi Cuenta" con pestañas profesionales (CENATE 2025)
// ========================================================================

import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, User, Lock } from "lucide-react";
import TabContainer from "../../components/common/TabContainer";
import PerfilTab from "../../components/user/PerfilTab";
import SeguridadTab from "../../components/user/SeguridadTab";

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("perfil");

  // 🎯 Definir pestañas
  const tabs = [
    {
      id: "perfil",
      label: "Información Personal",
      icon: <User className="w-4 h-4" />,
    },
    {
      id: "seguridad",
      label: "Seguridad",
      icon: <Lock className="w-4 h-4" />,
    },
  ];

  // ✅ Construir nombre completo
  const nombreCompleto =
    user?.nombreCompleto ||
    user?.nombre_completo ||
    `${user?.nombre || ""} ${user?.apellido || ""}`.trim() ||
    "Usuario";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-6">
      <div className="w-full space-y-6">
        {/* 🎯 Header con breadcrumb */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
              <User className="w-4 h-4" />
              <span>Configuración</span>
              <ChevronLeft className="w-4 h-4 rotate-180" />
              <span className="text-slate-700 font-medium">Mi Cuenta</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Mi Cuenta</h1>
          </div>
          <button
            onClick={() => navigate("/user/dashboard")}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-lg transition-all text-sm font-medium border border-slate-200 shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            Volver
          </button>
        </div>

        {/* 👤 Card de usuario con foto e información */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <div className="flex items-center gap-4">
              {/* Foto o inicial */}
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg flex-shrink-0 overflow-hidden">
                {user?.foto ? (
                  <img
                    src={user.foto}
                    alt={nombreCompleto}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  nombreCompleto[0]?.toUpperCase() || "U"
                )}
              </div>

              <div className="flex-1">
                <h2 className="text-xl font-bold text-white">
                  {nombreCompleto}
                </h2>
                <div className="flex items-center gap-4 mt-1 text-blue-100 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{user?.username}</span>
                  </div>
                </div>
              </div>

              <div className="inline-flex items-center gap-2 bg-green-500/20 text-white px-4 py-2 rounded-lg text-sm font-medium">
                <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                Activo
              </div>
            </div>
          </div>
        </div>

        {/* 📑 Contenedor con pestañas */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Navegación de pestañas */}
          <TabContainer
            tabs={tabs}
            activeTab={activeTab}
            onChange={setActiveTab}
          />

          {/* Contenido de pestañas */}
          <div className="p-6">
            {activeTab === "perfil" && <PerfilTab user={user} />}
            {activeTab === "seguridad" && <SeguridadTab user={user} />}
          </div>
        </div>
      </div>
    </div>
  );
}

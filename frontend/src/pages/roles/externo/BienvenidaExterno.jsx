// ========================================================================
// 👋 BienvenidaExterno.jsx – Página de Bienvenida para Usuarios Externos
// ========================================================================
// Muestra bienvenida personalizada y opciones del módulo
// ========================================================================

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  FileText,
  Calendar,
  Settings,
  Building2,
  ArrowRight,
  CheckCircle2,
  Info,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import ipressService from "../../../services/ipressService";

export default function BienvenidaExterno() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [ipress, setIpress] = useState(null);

  useEffect(() => {
    // Cargar datos de IPRESS del usuario
    const fetchIpress = async () => {
      try {
        const data = await ipressService.obtenerMiIpress();
        setIpress(data.data || data);
      } catch (error) {
        console.error("❌ Error al cargar IPRESS:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchIpress();
  }, []);

  // 🎯 Determinar saludo según género
  const obtenerSaludo = () => {
    const genero = user?.genero?.toUpperCase() || "";
    if (genero === "F" || genero === "FEMENINO")
      return "¡Bienvenida al Sistema CENATE!";
    if (genero === "M" || genero === "MASCULINO")
      return "¡Bienvenido al Sistema CENATE!";
    return "¡Bienvenido(a) al Sistema CENATE!";
  };

  // 📋 Opciones del módulo
  const opciones = [
    {
      id: 1,
      nombre: "Formulario de Diagnóstico",
      descripcion: "Complete el diagnóstico situacional de telesalud",
      icono: FileText,
      ruta: "/roles/externo/formulario-diagnostico",
      color: "indigo",
    },
    {
      id: 2,
      nombre: "Solicitud de Turnos",
      descripcion: "Solicite turnos de telemedicina para sus pacientes",
      icono: Calendar,
      ruta: "/roles/externo/solicitud-turnos",
      color: "blue",
    },
    {
      id: 3,
      nombre: "Gestión de Modalidad de Atención",
      descripcion: "Actualice la modalidad de atención de su institución",
      icono: Settings,
      ruta: "/roles/externo/gestion-modalidad",
      color: "purple",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* 🎯 Header Principal */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-indigo-600" />
            <h1 className="text-4xl font-bold text-gray-800">
              {obtenerSaludo()}
            </h1>
          </div>
          <p className="text-gray-600 text-lg ml-11">
            {new Date().toLocaleDateString("es-PE", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* 💼 Card de Información - IPRESS del Usuario */}
        {ipress && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8 border-l-4 border-indigo-600">
            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
                  <Building2 className="w-10 h-10 text-white" />
                </div>
                <div className="flex-1 text-white">
                  <h2 className="text-2xl font-bold mb-1">
                    {ipress?.descIpress || "IPRESS"}
                  </h2>
                  <div className="flex items-center gap-4 text-indigo-100 text-sm">
                    <span>📍 Código: {ipress?.codIpress}</span>
                    <span>🏥 Red: {ipress?.red?.descRed || "—"}</span>
                    <span>
                      📡 Modalidad:{" "}
                      <span className="font-semibold">
                        {ipress?.nombreModalidadAtencion || "—"}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 📌 Información del Usuario */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Usuario */}
          <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-indigo-500">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">👤</span>
              <h3 className="font-semibold text-gray-700">Usuario</h3>
            </div>
            <p className="text-gray-800 font-bold">{user?.username}</p>
          </div>

          {/* Rol */}
          <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-blue-500">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">🎖️</span>
              <h3 className="font-semibold text-gray-700">Rol</h3>
            </div>
            <p className="text-gray-800 font-bold">
              {user?.roles?.[0] || "Externo"}
            </p>
          </div>

          {/* Estado */}
          <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-green-500">
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <h3 className="font-semibold text-gray-700">Estado</h3>
            </div>
            <p className="text-gray-800 font-bold text-green-600">
              ✓ Activo
            </p>
          </div>
        </div>

        {/* 🎯 Opciones Disponibles */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            📋 Opciones Disponibles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {opciones.map((opcion) => {
              const Icon = opcion.icono;
              const colorClasses = {
                indigo: "from-indigo-500 to-indigo-600",
                blue: "from-blue-500 to-blue-600",
                purple: "from-purple-500 to-purple-600",
              };

              return (
                <div
                  key={opcion.id}
                  className="group cursor-pointer"
                  onClick={() => navigate(opcion.ruta)}
                >
                  <div className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
                    {/* Header con color */}
                    <div
                      className={`bg-gradient-to-br ${
                        colorClasses[opcion.color]
                      } p-6 text-white`}
                    >
                      <Icon className="w-12 h-12 mb-4" />
                      <h3 className="text-xl font-bold">{opcion.nombre}</h3>
                    </div>

                    {/* Body */}
                    <div className="p-6">
                      <p className="text-gray-600 mb-4">
                        {opcion.descripcion}
                      </p>
                      <div className="flex items-center gap-2 text-indigo-600 font-semibold group-hover:gap-4 transition-all duration-300">
                        <span>Acceder</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ℹ️ Información Importante */}
        <div className="mt-10 bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6">
          <div className="flex gap-4">
            <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">
                ℹ️ Información Importante
              </h3>
              <ul className="text-gray-700 space-y-2">
                <li>
                  ✓ Puede acceder a cualquiera de las opciones en el menú
                  lateral
                </li>
                <li>
                  ✓ Sus cambios se guardan automáticamente en la base de datos
                </li>
                <li>
                  ✓ Todas sus acciones son registradas para auditoría y seguridad
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

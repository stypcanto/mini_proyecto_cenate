// ========================================================================
// 👋 BienvenidaGestionTerritorial.jsx – Página de Bienvenida Gestión Territorial
// Ruta: /roles/gestionterritorial/bienvenida
// Roles: GESTIONTERRITORIAL, GESTOR_TERRITORIAL_TI
// ========================================================================

import React from "react";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  BarChart3,
  Building2,
  Network,
  FileText,
  ArrowRight,
  CheckCircle2,
  Upload,
  History,
} from "lucide-react";

const accesos = [
  {
    icono: BarChart3,
    titulo: "Dashboard por Redes",
    descripcion: "Visualiza estadísticas de atenciones agrupadas por redes de salud",
    ruta: "/roles/gestionterritorial/dashboardredes",
    color: "blue",
  },
  {
    icono: Building2,
    titulo: "Diagnóstico de IPRESS",
    descripcion: "Análisis y diagnóstico del estado operativo de las IPRESS",
    ruta: "/roles/gestionterritorial/diagnosticoipress",
    color: "teal",
  },
  {
    icono: FileText,
    titulo: "Respuestas de Solicitudes",
    descripcion: "Revisa respuestas a los requerimientos de las IPRESS",
    ruta: "/roles/gestionterritorial/respuestas-solicitudes",
    color: "indigo",
  },
  {
    icono: Network,
    titulo: "Listado de IPRESS",
    descripcion: "Consulta y gestiona el directorio de IPRESS registradas",
    ruta: "/ipress/listado",
    color: "violet",
  },
  {
    icono: MapPin,
    titulo: "Gestión de Redes",
    descripcion: "Administra la estructura de redes de salud territoriales",
    ruta: "/ipress/redes",
    color: "cyan",
  },
  {
    icono: BarChart3,
    titulo: "Producción Diaria",
    descripcion: "Panel Power BI — Reporte de pendientes del día en tiempo real",
    ruta: "/estadisticas/programacion",
    color: "emerald",
  },
  {
    icono: Upload,
    titulo: "Cargar Excel",
    descripcion: "Importación masiva de solicitudes de bolsa desde Excel",
    ruta: "/bolsas/cargar-excel",
    color: "orange",
  },
  {
    icono: History,
    titulo: "Historial de Bolsas",
    descripcion: "Consulta el historial de cargas y solicitudes de bolsas",
    ruta: "/bolsas/historial",
    color: "slate",
  },
];

const colorMap = {
  blue:    { bg: "bg-blue-50",    icon: "text-blue-600",    btn: "bg-blue-600 hover:bg-blue-700" },
  teal:    { bg: "bg-teal-50",    icon: "text-teal-600",    btn: "bg-teal-600 hover:bg-teal-700" },
  indigo:  { bg: "bg-indigo-50",  icon: "text-indigo-600",  btn: "bg-indigo-600 hover:bg-indigo-700" },
  violet:  { bg: "bg-violet-50",  icon: "text-violet-600",  btn: "bg-violet-600 hover:bg-violet-700" },
  cyan:    { bg: "bg-cyan-50",    icon: "text-cyan-600",    btn: "bg-cyan-600 hover:bg-cyan-700" },
  emerald: { bg: "bg-emerald-50", icon: "text-emerald-600", btn: "bg-emerald-600 hover:bg-emerald-700" },
  orange:  { bg: "bg-orange-50",  icon: "text-orange-600",  btn: "bg-orange-600 hover:bg-orange-700" },
  slate:   { bg: "bg-slate-100",  icon: "text-slate-600",   btn: "bg-slate-600 hover:bg-slate-700" },
};

export default function BienvenidaGestionTerritorial() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const genero = user?.genero === "F" || user?.genero === "FEMENINO" ? "a" : "o";
  const nombreUsuario = user?.nombreCompleto || "Usuario";

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-slate-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-slate-900">
            ¡Bienvenid{genero}, {nombreUsuario}!
          </h1>
          <p className="text-lg text-slate-600">
            Centro Nacional de Telemedicina — CENATE
          </p>
        </div>

        {/* Card principal */}
        <div className="bg-gradient-to-br from-teal-600 to-blue-700 rounded-2xl shadow-lg overflow-hidden">
          <div className="grid md:grid-cols-5 gap-6 p-8 text-white items-center">
            <div className="md:col-span-4 space-y-3">
              <h2 className="text-2xl font-bold">
                Módulo de Gestión Territorial
              </h2>
              <p className="text-teal-100 text-sm leading-relaxed">
                Monitorea la cobertura de atenciones por redes y IPRESS, analiza el
                diagnóstico operativo del territorio y gestiona los requerimientos
                de las instituciones prestadoras de salud.
              </p>
              <div className="pt-2 flex items-center gap-2 text-teal-100 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span className="font-medium">GESTIÓN TERRITORIAL — CENATE</span>
              </div>
            </div>

            {/* Ícono territorial */}
            <div className="flex justify-center items-center md:col-span-1">
              <svg className="w-24 h-24" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Mapa simplificado */}
                <rect x="15" y="20" width="70" height="55" rx="6" fill="white" opacity="0.2"/>
                <rect x="15" y="20" width="70" height="55" rx="6" stroke="white" strokeWidth="2" opacity="0.7"/>
                {/* Pin marcador */}
                <circle cx="50" cy="42" r="8" fill="white" opacity="0.95"/>
                <path d="M50 50 L44 62 L50 58 L56 62 Z" fill="white" opacity="0.9"/>
                {/* Líneas de grid */}
                <line x1="35" y1="20" x2="35" y2="75" stroke="white" strokeWidth="1" opacity="0.3"/>
                <line x1="65" y1="20" x2="65" y2="75" stroke="white" strokeWidth="1" opacity="0.3"/>
                <line x1="15" y1="45" x2="85" y2="45" stroke="white" strokeWidth="1" opacity="0.3"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Grid de accesos rápidos */}
        <div>
          <h3 className="text-lg font-semibold text-slate-700 mb-4">
            Acceso Rápido
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {accesos.map((item) => {
              const Icono = item.icono;
              const c = colorMap[item.color];
              return (
                <button
                  key={item.ruta}
                  onClick={() => navigate(item.ruta)}
                  className={`${c.bg} rounded-xl p-5 text-left hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group border border-transparent hover:border-white/60`}
                >
                  <div className={`w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center mb-3`}>
                    <Icono className={`w-5 h-5 ${c.icon}`} />
                  </div>
                  <p className="font-semibold text-slate-800 text-sm mb-1">{item.titulo}</p>
                  <p className="text-xs text-slate-500 leading-relaxed">{item.descripcion}</p>
                  <div className={`mt-3 flex items-center gap-1 text-xs font-medium ${c.icon} opacity-0 group-hover:opacity-100 transition-opacity`}>
                    <span>Ir al módulo</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}

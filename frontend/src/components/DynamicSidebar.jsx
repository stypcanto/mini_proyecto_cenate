// ========================================================================
// 🌐 DynamicSidebar.jsx – Menú dinámico MBAC CENATE 2025
// ------------------------------------------------------------------------
// - Menú dinámico basado en permisos (usePermissions)
// - Logo de CENATE en la parte superior
// - Compatible con SUPERADMIN / ADMIN y roles MBAC personalizados
// - ✅ Funcionalidad de colapsar/expandir sidebar con tooltips
// - Estado del Sistema solo visible para SuperAdmin
// - Nota: Perfil de usuario y opciones están en el Header
// ========================================================================

import React, { useState, useMemo, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import usePermissions from "../hooks/usePermissions"; // ✅ default import
import {
  LayoutDashboard,
  Users,
  Shield,
  FileText,
  Activity,
  Stethoscope,
  Calendar,
  ClipboardList,
  BarChart3,
  UserPlus,
  Clock,
  Building2,
  FileCheck,
  Lock,
  Settings,
  Database,
  TrendingUp,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  UserCog,
  Search,
  HeartPulse,
  UsersRound,
  UserCheck,
  ClipboardCheck,
  CalendarCheck,
  FileBarChart,
  Hospital,
  FileSearch,
  Network,
  Server,
  Eye,
  Layout,
} from "lucide-react";

export default function DynamicSidebar({ collapsed = false, onToggleCollapse }) {
  const { user } = useAuth();
  const { getModulosAgrupados, loading } = usePermissions(user.id);
  const location = useLocation();
  const [openSections, setOpenSections] = useState({});

  const roles = (user?.roles || []).map((r) =>
    typeof r === "string"
      ? r.toUpperCase()
      : r?.authority
      ? r.authority.replace("ROLE_", "").toUpperCase()
      : String(r).toUpperCase()
  );

  const isSuperAdmin = roles.includes("SUPERADMIN") || roles.includes("ADMIN");

  const toggleSection = (key) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  // Cuando está colapsado, cerrar todas las secciones
  useEffect(() => {
    if (collapsed) {
      setOpenSections({});
    }
  }, [collapsed]);

  // ============================================================
  // 🧭 Obtener módulos permitidos (según permisos MBAC)
  // ============================================================

  const modulosPermitidos = useMemo(() => {
    console.log({
      "es admin": isSuperAdmin
    })

    if (isSuperAdmin) 
      return null;

    const agrupados = getModulosAgrupados();
     console.log({
      "agrupados": agrupados
    })

    return agrupados;
  }, [getModulosAgrupados, isSuperAdmin]);



  // ============================================================
  // 🧱 Definición base del menú (para Superadmin)
  // ============================================================
  const fullMenu = {

    admin: {
      title: "Administración",
      icon: UserCog,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      items: [
        { label: "Dashboard Admin", path: "/admin/dashboard", icon: LayoutDashboard },
        { label: "Gestión de Usuarios", path: "/admin/users", icon: Users },
        { label: "Solicitudes de Registros", path: "/admin/solicitudes", icon: FileCheck },
        { label: "CMS Dashboard Médico", path: "/admin/dashboard-medico/cms", icon: Layout },
        { label: "Logs del Sistema", path: "/admin/logs", icon: Eye },
      ],
    },


    asegurados: {
      title: "Listado de Asegurados",
      icon: Search,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      items: [
        { label: "Buscar Asegurado", path: "/asegurados/buscar", icon: Search },
        { label: "Dashboard", path: "/asegurados/dashboard", icon: BarChart3 },
      ],
    },
    medico: {
      title: "Panel Médico",
      icon: HeartPulse,
      color: "text-green-400",
      bgColor: "bg-green-500/10",
      items: [
        { label: "Dashboard Médico", path: "/roles/medico/dashboard", icon: LayoutDashboard },
        { label: "Pacientes", path: "/roles/medico/pacientes", icon: UsersRound },
        { label: "Citas Médicas", path: "/roles/medico/citas", icon: CalendarCheck },
        { label: "Indicadores", path: "/roles/medico/indicadores", icon: TrendingUp },
      ],
    },
    coordinador: {
      title: "Panel Coordinador",
      icon: ClipboardCheck,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      items: [
        { label: "Dashboard", path: "/roles/coordinador/dashboard", icon: LayoutDashboard },
        { label: "Agenda Médica", path: "/roles/coordinador/agenda", icon: Calendar },
        { label: "Asignar Gestor", path: "/roles/coordinador/asignacion", icon: UserCheck },
        { label: "Sistema de Coordinación", path: "/roles/coordinador/sistema-coordinacion", icon: Network },
      ],
    },
    externo: {
      title: "Personal Externo",
      icon: UserCheck,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
      items: [
        { label: "Dashboard", path: "/roles/externo/dashboard", icon: LayoutDashboard },
        { label: "Reportes", path: "/roles/externo/reportes", icon: FileBarChart },
      ],
    },
    citas: {
      title: "Gestión de Citas",
      icon: CalendarCheck,
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10",
      items: [
        { label: "Dashboard", path: "/citas/dashboard", icon: LayoutDashboard },
        { label: "Gestión del Asegurado", path: "/citas/gestion-asegurado", icon: Users },
       // { label: "Agenda", path: "/citas/agenda", icon: Calendar },
      ],
    },
    lineamientos: {
      title: "Lineamientos IPRESS",
      icon: FileSearch,
      color: "text-indigo-400",
      bgColor: "bg-indigo-500/10",
      items: [
        { label: "Dashboard", path: "/lineamientos/ipress", icon: LayoutDashboard },
       // { label: "Registro", path: "/lineamientos/registro", icon: FileCheck },
      ],
    },
    ipress: {
        title: "IPRESS",
        icon: Hospital,
        color: "text-blue-400",
        bgColor: "bg-blue-500/10",
        items: [
          { label: "Listado de IPRESS", path: "/ipress/listado", icon: Hospital },
        ],
      },
  };

  // ============================================================
  // 🧩 Render principal
  // ============================================================

  return (
    <div className={`w-full h-full flex flex-col bg-gradient-to-b from-[#0f172a] to-[#1e293b] text-white transition-all duration-300 ${collapsed ? 'items-center' : ''}`} style={{ overflow: 'visible', position: 'relative' }}>
      {/* 🏥 Logo CENATE - En el espacio donde estaba el usuario */}
      <div className="flex-shrink-0 border-b border-slate-700/50 transition-all duration-300">
        <div className={`flex items-center justify-center gap-3 transition-all duration-300 ${collapsed ? 'px-3 py-4' : 'px-5 py-5'}`}>
          {!collapsed ? (
            <>
              {/* Logo completo en modo expandido */}
              <div className="flex items-center gap-3 w-full">
                <img
                  src="/images/LogoCENATEBlanco.png"
                  alt="Logo CENATE"
                  className="h-10 w-auto object-contain drop-shadow-lg"
                />
                {/* 🔘 Botón para colapsar/expandir (solo en desktop) */}
                {onToggleCollapse && (
                  <button
                    onClick={onToggleCollapse}
                    className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-slate-700/50 transition-all duration-200 ml-auto z-10"
                    aria-label="Colapsar menú"
                    title="Colapsar menú"
                  >
                    <ChevronLeft className="w-5 h-5 text-slate-300" />
                  </button>
                )}
          </div>
            </>
          ) : (
            <>
              {/* Logo compacto en modo colapsado */}
              <div className="relative w-full flex items-center justify-center">
                <img
                  src="/images/LogoCENATEBlanco.png"
                  alt="Logo CENATE"
                  className="h-8 w-auto object-contain drop-shadow-lg"
                />
                {/* 🔘 Botón para expandir (solo en desktop) */}
                {onToggleCollapse && (
                  <button
                    onClick={onToggleCollapse}
                    className="absolute top-0 right-0 hidden lg:flex items-center justify-center w-6 h-6 rounded-lg hover:bg-slate-700/50 transition-all duration-200 z-10 bg-slate-800/80"
                    aria-label="Expandir menú"
                    title="Expandir menú"
                  >
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </button>
                )}
          </div>
            </>
          )}
        </div>
      </div>

      {/* 📋 Menú de navegación - Flex-1 para ocupar el espacio disponible */}
      <nav className={`flex-1 py-4 space-y-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent transition-all duration-300 ${collapsed ? 'px-2' : 'px-4'}`} style={{ overflowY: 'auto', overflowX: 'visible', position: 'relative' }}>
        {loading && (
          <p className={`text-center text-slate-400 text-sm ${collapsed ? 'text-xs' : ''}`}>
            {collapsed ? '...' : 'Cargando permisos...'}
          </p>
        )}

          {isSuperAdmin
            ? Object.entries(fullMenu).map(([key, section]) => (
                <SidebarSection
                  key={key}
                  section={section}
                  openSections={openSections}
                  toggleSection={toggleSection}
                  location={location}
                  collapsed={collapsed}
                />
              ))
            : modulosPermitidos &&
              Object.entries(modulosPermitidos).map(([modulo, rutas]) => (
                <DynamicSection
                  key={modulo}
                  title={modulo}
                  rutas={rutas}
                  location={location}
                  toggleSection={toggleSection}
                  openSections={openSections}
                  collapsed={collapsed}
                />
              ))}
      </nav>

      {/* 🧮 Estado del Sistema (solo para SuperAdmin) */}
      {isSuperAdmin && (
      <div className="flex-shrink-0 border-t border-slate-700 bg-slate-900/40">
          {!collapsed && (
            <div className="p-3">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-2">
              <Database className="w-4 h-4" />
              <span>Estado del Sistema</span>
            </div>
            <div className="space-y-1.5 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Módulos activos</span>
                <span className="text-green-400 font-bold">6/6</span>
              </div>
              <div className="flex justify-between">
                <span>Sistema</span>
                <span className="flex items-center gap-1 text-green-400 font-bold">
                  <TrendingUp className="w-3 h-3" /> 100%
                </span>
              </div>
            </div>
          </div>
        )}
          {collapsed && (
            <TooltipWrapper collapsed={collapsed} text="Módulos activos: 6/6">
              <div className="p-2 flex justify-center">
                <div className="flex flex-col items-center gap-1">
                  <Database className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 text-xs font-bold">6/6</span>
                </div>
              </div>
            </TooltipWrapper>
          )}
      </div>
      )}


    </div>
  );
}

// ============================================================
// 🧱 Subcomponentes
// ============================================================

// Componente wrapper para tooltips con posición fija
function TooltipWrapper({ children, collapsed, text }) {
  const [tooltipPosition, setTooltipPosition] = React.useState({ top: 0, left: 0 });
  const [showTooltip, setShowTooltip] = React.useState(false);
  const wrapperRef = React.useRef(null);

  const handleMouseEnter = () => {
    if (collapsed && wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      setTooltipPosition({
        top: rect.top + rect.height / 2,
        left: rect.right + 12,
      });
      setShowTooltip(true);
    }
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  if (!collapsed) {
    return <div className="relative group">{children}</div>;
  }

  return (
    <>
      <div 
        ref={wrapperRef}
        className="relative group mb-2" 
        style={{ overflow: 'visible', position: 'static' }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>
      {showTooltip && (
        <div 
          className="fixed px-3 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg shadow-2xl whitespace-nowrap pointer-events-none border border-slate-700 transition-opacity duration-200"
          style={{ 
            zIndex: 10000,
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
            transform: 'translateY(-50%)',
            backdropFilter: 'blur(8px)',
            opacity: 1,
          }}
        >
          {text}
          {/* Flecha del tooltip */}
          <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-r-[6px] border-r-slate-900 border-b-[6px] border-b-transparent"></div>
        </div>
      )}
    </>
  );
}

function SidebarSection({ section, openSections, toggleSection, location, collapsed }) {
  const SectionIcon = section.icon;
  const isOpen = openSections[section.title.toLowerCase()];
  const hasActiveChild = section.items.some((i) => location.pathname === i.path);
  
  // Hooks siempre deben estar al inicio, fuera de condicionales
  const [tooltipPosition, setTooltipPosition] = React.useState({ top: 0, left: 0 });
  const [showTooltip, setShowTooltip] = React.useState(false);
  const linkRef = React.useRef(null);

  const handleMouseEnter = () => {
    if (linkRef.current) {
      const rect = linkRef.current.getBoundingClientRect();
      setTooltipPosition({
        top: rect.top + rect.height / 2,
        left: rect.right + 12,
      });
      setShowTooltip(true);
    }
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  if (collapsed) {
    const firstItem = section.items[0];

    return (
      <>
        <div className="relative mb-2" style={{ overflow: 'visible', position: 'static' }}>
          <NavLink
            ref={linkRef}
            to={firstItem?.path || "#"}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all mx-auto hover:bg-slate-800/60 ${
              hasActiveChild
                ? `${section.bgColor} ${section.color}`
                : "text-slate-400 hover:text-white"
            }`}
          >
            <SectionIcon className="w-5 h-5" />
          </NavLink>
        </div>
        {/* Tooltip cuando está colapsado - Fixed position */}
        {showTooltip && (
          <div 
            className="fixed px-3 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg shadow-2xl whitespace-nowrap pointer-events-none border border-slate-700 transition-opacity duration-200"
            style={{ 
              zIndex: 10000,
              top: `${tooltipPosition.top}px`,
              left: `${tooltipPosition.left}px`,
              transform: 'translateY(-50%)',
              backdropFilter: 'blur(8px)',
              opacity: 1,
            }}
          >
            {section.title}
            {/* Flecha del tooltip */}
            <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-r-[6px] border-r-slate-900 border-b-[6px] border-b-transparent"></div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="space-y-1">
      <button
        onClick={() => toggleSection(section.title.toLowerCase())}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${
          hasActiveChild
            ? `${section.bgColor} ${section.color}`
            : "hover:bg-slate-800/60 text-slate-300"
        }`}
      >
        <div className="flex items-center gap-3">
          <SectionIcon
            className={`w-5 h-5 ${
              hasActiveChild ? section.color : "text-slate-400 group-hover:text-white"
            }`}
          />
          <span className="font-semibold text-sm">{section.title}</span>
        </div>
        {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      {isOpen && (
        <div className="ml-3 pl-3 border-l-2 border-slate-700/50 space-y-1 animate-fadeIn">
          {section.items.map((item, idx) => {
            const ItemIcon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={idx}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#0A5BA9] text-white shadow-md"
                    : "hover:bg-slate-800/60 text-slate-400 hover:text-white"
                }`}
              >
                <ItemIcon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      )}
    </div>
  );
}

function DynamicSection({ title, rutas, location, toggleSection, openSections, collapsed }) {
  const isOpen = openSections[title];
  const hasActiveChild = rutas.some((r) => location.pathname === r.path);

  // Hooks siempre deben estar al inicio, fuera de condicionales
  const [tooltipPosition, setTooltipPosition] = React.useState({ top: 0, left: 0 });
  const [showTooltip, setShowTooltip] = React.useState(false);
  const linkRef = React.useRef(null);

  const handleMouseEnter = () => {
    if (linkRef.current) {
      const rect = linkRef.current.getBoundingClientRect();
      setTooltipPosition({
        top: rect.top + rect.height / 2,
        left: rect.right + 12,
      });
      setShowTooltip(true);
    }
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  if (collapsed) {
    const firstRuta = rutas[0];

    return (
      <>
        <div className="relative mb-2" style={{ overflow: 'visible', position: 'static' }}>
          <NavLink
            ref={linkRef}
            to={firstRuta?.path || "#"}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all mx-auto hover:bg-slate-800/60 ${
              hasActiveChild
                ? "bg-[#0A5BA9]/10 text-blue-300"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <ClipboardList className="w-5 h-5" />
          </NavLink>
        </div>
        {/* Tooltip cuando está colapsado - Fixed position */}
        {showTooltip && (
          <div 
            className="fixed px-3 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg shadow-2xl whitespace-nowrap pointer-events-none border border-slate-700 transition-opacity duration-200"
            style={{ 
              zIndex: 10000,
              top: `${tooltipPosition.top}px`,
              left: `${tooltipPosition.left}px`,
              transform: 'translateY(-50%)',
              backdropFilter: 'blur(8px)',
              opacity: 1,
            }}
          >
            {title}
            {/* Flecha del tooltip */}
            <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-r-[6px] border-r-slate-900 border-b-[6px] border-b-transparent"></div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="space-y-1">
      <button
        onClick={() => toggleSection(title)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
          hasActiveChild
            ? "bg-[#0A5BA9]/10 text-blue-300"
            : "hover:bg-slate-800/60 text-slate-300"
        }`}
      >
        <div className="flex items-center gap-3">
          <ClipboardList className="w-5 h-5" />
          <span className="font-semibold text-sm truncate">{title}</span>
        </div>
        {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      {isOpen && (
        <div className="ml-3 pl-3 border-l-2 border-slate-700/50 space-y-1 animate-fadeIn">
          {rutas.map((r, idx) => {
            const isActive = location.pathname === r.path;
            return (
              <NavLink
                key={idx}
                to={r.path}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#0A5BA9] text-white shadow-md"
                    : "hover:bg-slate-800/60 text-slate-400 hover:text-white"
                }`}
              >
                <FileText className="w-4 h-4" />
                <span className="truncate">{r.pagina}</span>
              </NavLink>
            );
          })}
        </div>
      )}
    </div>
  );
}
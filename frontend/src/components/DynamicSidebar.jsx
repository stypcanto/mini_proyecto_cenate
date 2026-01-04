// ========================================================================
// DynamicSidebar.jsx - Menu dinamico RBAC CENATE 2025
// ------------------------------------------------------------------------
// - Menu dinamico basado en permisos RBAC (usePermissions)
// - Iconos cargados desde la base de datos (dim_modulos_sistema.icono)
// - Compatible con SUPERADMIN / ADMIN y roles personalizados
// - Funcionalidad de colapsar/expandir sidebar con tooltips
// ========================================================================

import React, { useState, useMemo, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import usePermissions from "../hooks/usePermissions";
import { VERSION } from "../config/version";
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
  Layers,
  BoxSelect,
  Folder,
  MessageSquare,
  Bot,
} from "lucide-react";

// Mapeo de nombres de iconos a componentes de Lucide
const iconMap = {
  'Settings': Settings,
  'Users': Users,
  'Building2': Building2,
  'CalendarCheck': CalendarCheck,
  'UserCog': UserCog,
  'UsersCog': UserCog,  // Alias por si está mal escrito en BD
  'Hospital': Hospital,
  'ClipboardList': ClipboardList,
  'Stethoscope': Stethoscope,
  'BarChart3': BarChart3,
  'Search': Search,
  'HeartPulse': HeartPulse,
  'UsersRound': UsersRound,
  'UserCheck': UserCheck,
  'ClipboardCheck': ClipboardCheck,
  'FileSearch': FileSearch,
  'FileBarChart': FileBarChart,
  'LayoutDashboard': LayoutDashboard,
  'FileText': FileText,
  'Calendar': Calendar,
  'TrendingUp': TrendingUp,
  'Network': Network,
  'Eye': Eye,
  'Layout': Layout,
  'Shield': Shield,
  'Lock': Lock,
  'Database': Database,
  'Server': Server,
  'Folder': Folder,
  'FileCheck': FileCheck,
  'Activity': Activity,
  'Layers': Layers,
  'BoxSelect': BoxSelect,
  'MessageSquare': MessageSquare,
  'Bot': Bot,
};

const getIconComponent = (iconName) => {
  console.log('Icon name received:', iconName, '| Found:', !!iconMap[iconName]);
  if (!iconName) return Folder;
  return iconMap[iconName] || Folder;
};

// Colores por defecto para modulos dinamicos
const moduleColors = [
  { color: "text-blue-400", bgColor: "bg-blue-500/10" },
  { color: "text-emerald-400", bgColor: "bg-emerald-500/10" },
  { color: "text-green-400", bgColor: "bg-green-500/10" },
  { color: "text-purple-400", bgColor: "bg-purple-500/10" },
  { color: "text-amber-400", bgColor: "bg-amber-500/10" },
  { color: "text-cyan-400", bgColor: "bg-cyan-500/10" },
  { color: "text-indigo-400", bgColor: "bg-indigo-500/10" },
  { color: "text-rose-400", bgColor: "bg-rose-500/10" },
  { color: "text-teal-400", bgColor: "bg-teal-500/10" },
  { color: "text-orange-400", bgColor: "bg-orange-500/10" },
];

const getModuleColor = (index) => moduleColors[index % moduleColors.length];

export default function DynamicSidebar({ collapsed = false, onToggleCollapse }) {
  const { user } = useAuth();
  const { getModulosConDetalle, loading } = usePermissions(user.id);
  const location = useLocation();
  const [openSections, setOpenSections] = useState({});

  const roles = (user?.roles || []).map((r) =>
    typeof r === "string"
      ? r.toUpperCase()
      : r?.authority
      ? r.authority.replace("ROLE_", "").toUpperCase()
      : String(r).toUpperCase()
  );

  const isSuperAdmin = roles.includes("SUPERADMIN");
  const isAdmin = roles.includes("ADMIN");
  const isPrivileged = isSuperAdmin || isAdmin;

  const toggleSection = (key) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  // Cuando esta colapsado, cerrar todas las secciones
  useEffect(() => {
    if (collapsed) {
      setOpenSections({});
    }
  }, [collapsed]);

  // Expandir automáticamente módulos según el rol del usuario
  const isExterno = roles.includes("EXTERNO") || roles.includes("INSTITUCION_EX");
  const isCoordinadorRed = roles.includes("COORDINADOR_RED");
  const isGestorCitas = roles.includes("GESTOR DE CITAS") || roles.includes("GESTOR_CITAS");
  const isEnfermeria = roles.includes("ENFERMERIA");

  // ============================================================
  // Obtener modulos permitidos (segun permisos RBAC)
  // ============================================================

  // Módulos y rutas exclusivas de SUPERADMIN
  const MODULOS_SUPERADMIN = ['Gestión de Módulos', 'Asegurados', 'Gestión de Pacientes'];
  const RUTAS_SUPERADMIN = ['/admin/mbac'];

  const modulosPermitidos = useMemo(() => {
    // Todos los usuarios (incluido admin) usan permisos de la BD
    const modulosDetalle = getModulosConDetalle();

    // Si es ADMIN (pero NO SUPERADMIN), filtrar módulos y páginas exclusivas de SUPERADMIN
    if (isAdmin && !isSuperAdmin) {
      return modulosDetalle
        // Filtrar módulos completos exclusivos de SUPERADMIN
        .filter(modulo => !MODULOS_SUPERADMIN.includes(modulo.nombreModulo))
        // Filtrar páginas exclusivas de SUPERADMIN dentro de otros módulos
        .map(modulo => ({
          ...modulo,
          paginas: modulo.paginas.filter(pagina =>
            !RUTAS_SUPERADMIN.includes(pagina.ruta)
          )
        }))
        .filter(modulo => modulo.paginas.length > 0)
        // Ordenar alfabéticamente por nombre de módulo
        .sort((a, b) => a.nombreModulo.localeCompare(b.nombreModulo));
    }

    // Ordenar alfabéticamente por nombre de módulo
    return modulosDetalle.sort((a, b) => a.nombreModulo.localeCompare(b.nombreModulo));
  }, [getModulosConDetalle, isAdmin, isSuperAdmin]);

  // Expandir automáticamente módulos según el rol del usuario
  useEffect(() => {
    if (!loading && modulosPermitidos && modulosPermitidos.length > 0 && !collapsed) {
      const sectionsToOpen = {};

      // Para usuarios EXTERNO: expandir "Gestión de Personal Externo"
      if (isExterno) {
        const moduloExterno = modulosPermitidos.find(m =>
          m.nombreModulo?.toLowerCase().includes("personal externo") ||
          m.nombreModulo?.toLowerCase().includes("gestión de personal externo")
        );
        if (moduloExterno) {
          sectionsToOpen[moduloExterno.nombreModulo] = true;
        }
      }

      // Para usuarios COORDINADOR_RED: expandir "Gestión de Red"
      if (isCoordinadorRed) {
        const moduloRed = modulosPermitidos.find(m =>
          m.nombreModulo?.toLowerCase().includes("gestión de red") ||
          m.nombreModulo?.toLowerCase().includes("red")
        );
        if (moduloRed) {
          sectionsToOpen[moduloRed.nombreModulo] = true;
        }
      }

      // Para usuarios GESTOR DE CITAS: expandir "Gestión de Citas"
      if (isGestorCitas) {
        const moduloCitas = modulosPermitidos.find(m =>
          m.nombreModulo?.toLowerCase().includes("gestión de citas") ||
          m.nombreModulo?.toLowerCase().includes("citas")
        );
        if (moduloCitas) {
          sectionsToOpen[moduloCitas.nombreModulo] = true;
        }
      }

      // Para usuarios ENFERMERIA: expandir "Enfermería"
      if (isEnfermeria) {
        const moduloEnfermeria = modulosPermitidos.find(m =>
          m.nombreModulo?.toLowerCase().includes("enfermería") ||
          m.nombreModulo?.toLowerCase().includes("enfermeria")
        );
        if (moduloEnfermeria) {
          sectionsToOpen[moduloEnfermeria.nombreModulo] = true;
        }
      }

      // Si hay secciones para abrir, establecerlas
      if (Object.keys(sectionsToOpen).length > 0) {
        setOpenSections(prev => ({ ...prev, ...sectionsToOpen }));
      }
    }
  }, [loading, modulosPermitidos, collapsed, isExterno, isCoordinadorRed, isGestorCitas, isEnfermeria]);

  // ============================================================
  // Render principal - Menu dinamico desde la BD
  // ============================================================

  return (
    <div className={`w-full h-full flex flex-col bg-gradient-to-b from-[#0f172a] to-[#1e293b] text-white transition-all duration-300 ${collapsed ? 'items-center' : ''}`} style={{ overflow: 'visible', position: 'relative' }}>
      {/* Logo CENATE */}
      <div className="flex-shrink-0 border-b border-slate-700/50 transition-all duration-300">
        <div className={`flex items-center justify-center gap-3 transition-all duration-300 ${collapsed ? 'px-3 py-4' : 'px-5 py-5'}`}>
          {!collapsed ? (
            <div className="flex items-center gap-3 w-full">
              <img
                src="/images/LogoCENATEBlanco.png"
                alt="Logo CENATE"
                className="h-10 w-auto object-contain drop-shadow-lg"
              />
              {onToggleCollapse && (
                <button
                  onClick={onToggleCollapse}
                  className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-slate-700/50 transition-all duration-200 ml-auto z-10"
                  aria-label="Colapsar menu"
                  title="Colapsar menu"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-300" />
                </button>
              )}
            </div>
          ) : (
            <div className="relative w-full flex items-center justify-center">
              <img
                src="/images/LogoCENATEBlanco.png"
                alt="Logo CENATE"
                className="h-8 w-auto object-contain drop-shadow-lg"
              />
              {onToggleCollapse && (
                <button
                  onClick={onToggleCollapse}
                  className="absolute top-0 right-0 hidden lg:flex items-center justify-center w-6 h-6 rounded-lg hover:bg-slate-700/50 transition-all duration-200 z-10 bg-slate-800/80"
                  aria-label="Expandir menu"
                  title="Expandir menu"
                >
                  <ChevronRight className="w-4 h-4 text-slate-300" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Menu de navegacion dinamico */}
      <nav className={`flex-1 py-4 space-y-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent transition-all duration-300 ${collapsed ? 'px-2' : 'px-4'}`} style={{ overflowY: 'auto', overflowX: 'visible', position: 'relative' }}>
        {loading && (
          <p className={`text-center text-slate-400 text-sm ${collapsed ? 'text-xs' : ''}`}>
            {collapsed ? '...' : 'Cargando permisos...'}
          </p>
        )}

        {!loading && modulosPermitidos && modulosPermitidos.length === 0 && (
          <p className="text-center text-slate-500 text-sm px-2">
            No tienes modulos asignados
          </p>
        )}

        {!loading && modulosPermitidos && modulosPermitidos.map((modulo, index) => (
          <DynamicModuleSection
            key={modulo.idModulo || index}
            modulo={modulo}
            colorConfig={getModuleColor(index)}
            location={location}
            toggleSection={toggleSection}
            openSections={openSections}
            collapsed={collapsed}
            getIconComponent={getIconComponent}
          />
        ))}
      </nav>

      {/* Estado del Sistema (solo para usuarios privilegiados) */}
      {isPrivileged && (
        <div className="flex-shrink-0 border-t border-slate-700 bg-slate-900/40">
          {!collapsed && (
            <div className="p-3">
              <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-2">
                <Database className="w-4 h-4" />
                <span>Estado del Sistema</span>
              </div>
              <div className="space-y-1.5 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Modulos activos</span>
                  <span className="text-green-400 font-bold">{modulosPermitidos?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sistema</span>
                  <span className="flex items-center gap-1 text-green-400 font-bold">
                    <TrendingUp className="w-3 h-3" /> OK
                  </span>
                </div>
              </div>
            </div>
          )}
          {collapsed && (
            <TooltipWrapper collapsed={collapsed} text={`Modulos: ${modulosPermitidos?.length || 0}`}>
              <div className="p-2 flex justify-center">
                <div className="flex flex-col items-center gap-1">
                  <Database className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 text-xs font-bold">{modulosPermitidos?.length || 0}</span>
                </div>
              </div>
            </TooltipWrapper>
          )}
        </div>
      )}

      {/* Version del Sistema */}
      <div className="flex-shrink-0 border-t border-slate-700/50 py-2 px-3">
        <p className={`text-slate-500 text-center ${collapsed ? 'text-[10px]' : 'text-xs'}`}>
          v{VERSION.number}
        </p>
      </div>

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

// Componente para renderizar modulos dinamicos con iconos de la BD
function DynamicModuleSection({ modulo, colorConfig, location, toggleSection, openSections, collapsed, getIconComponent }) {
  const { nombreModulo, icono, paginas } = modulo;
  const ModuleIcon = getIconComponent(icono);
  const isOpen = openSections[nombreModulo];
  const hasActiveChild = paginas.some((p) => location.pathname === p.ruta);

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
    const firstPage = paginas[0];

    return (
      <>
        <div className="relative mb-2" style={{ overflow: 'visible', position: 'static' }}>
          <NavLink
            ref={linkRef}
            to={firstPage?.ruta || "#"}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all mx-auto hover:bg-slate-800/60 ${
              hasActiveChild
                ? `${colorConfig.bgColor} ${colorConfig.color}`
                : "text-slate-400 hover:text-white"
            }`}
          >
            <ModuleIcon className="w-5 h-5" />
          </NavLink>
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
            {nombreModulo}
            <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-r-[6px] border-r-slate-900 border-b-[6px] border-b-transparent"></div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="space-y-1">
      <button
        onClick={() => toggleSection(nombreModulo)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${
          hasActiveChild
            ? `${colorConfig.bgColor} ${colorConfig.color}`
            : "hover:bg-slate-800/60 text-slate-300"
        }`}
      >
        <div className="flex items-center gap-3">
          <ModuleIcon
            className={`w-5 h-5 ${
              hasActiveChild ? colorConfig.color : "text-slate-400 group-hover:text-white"
            }`}
          />
          <span className="font-semibold text-sm truncate">{nombreModulo}</span>
        </div>
        {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
      </button>

      {isOpen && (
        <div className="ml-3 pl-3 border-l-2 border-slate-700/50 space-y-1 animate-fadeIn">
          {paginas.map((pagina, idx) => {
            const isActive = location.pathname === pagina.ruta;
            return (
              <NavLink
                key={pagina.idPagina || idx}
                to={pagina.ruta}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#0A5BA9] text-white shadow-md"
                    : "hover:bg-slate-800/60 text-slate-400 hover:text-white"
                }`}
              >
                <FileText className="w-4 h-4" />
                <span className="truncate">{pagina.nombre}</span>
              </NavLink>
            );
          })}
        </div>
      )}
    </div>
  );
}
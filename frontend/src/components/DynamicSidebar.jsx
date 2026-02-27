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
import ExternoSidebar from "./ExternoSidebar";
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
  Package,
  Upload,
  ListChecks,
  FolderOpen,
  Bug,
  List,
  Headphones,
  Phone,
  PhoneCall,
  Mail,
  Home,
  User,
  Inbox,
  Plus,
  Trash2,
  Edit,
  Copy,
  Download,
  Share2,
  AlertCircle,
  CheckCircle,
  Info,
  Zap,
  TrendingDown,
  PieChart,
  LineChart,
  MoreVertical,
  Filter,
  RefreshCw,
  Code,
  Wifi,
  AlertTriangle,
  Pill,
  MapPin,
  Ambulance,
  Heart,
  Microscope,
  Bookmark,
  Star,
  GitBranch,
  Briefcase,
  MapPinned,
  TicketCheck,
  CircleDot,
  HelpCircle,
} from "lucide-react";

// Mapeo de nombres de iconos a componentes de Lucide
const iconMap = {
  'Settings': Settings,
  'Users': Users,
  'Building2': Building2,
  'CalendarCheck': CalendarCheck,
  'UserCog': UserCog,
  'UsersCog': UserCog,
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
  'Package': Package,
  'Upload': Upload,
  'ListChecks': ListChecks,
  'FolderOpen': FolderOpen,
  'Bug': Bug,
  'List': List,
  'Headphones': Headphones,
  'Phone': Phone,
  'PhoneCall': PhoneCall,
  'Mail': Mail,
  'Home': Home,
  'User': User,
  'Inbox': Inbox,
  'Plus': Plus,
  'Trash2': Trash2,
  'Edit': Edit,
  'Copy': Copy,
  'Download': Download,
  'Share2': Share2,
  'AlertCircle': AlertCircle,
  'CheckCircle': CheckCircle,
  'Info': Info,
  'Zap': Zap,
  'TrendingDown': TrendingDown,
  'PieChart': PieChart,
  'LineChart': LineChart,
  'MoreVertical': MoreVertical,
  'Filter': Filter,
  'RefreshCw': RefreshCw,
  'Code': Code,
  'Wifi': Wifi,
  'AlertTriangle': AlertTriangle,
  'Pill': Pill,
  'MapPin': MapPin,
  'Ambulance': Ambulance,
  'Heart': Heart,
  'Microscope': Microscope,
  'Bookmark': Bookmark,
  'Star': Star,
  'GitBranch': GitBranch,
  'Briefcase': Briefcase,
  'MapPinned': MapPinned,
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
  const isCoordinadorGestionCitas = roles.includes("COORDINADOR_GESTION_CITAS") || roles.includes("COORD_GESTION_CITAS") || roles.includes("COORDINADOR GESTION CITAS") || roles.includes("COORD. GESTION CITAS");
  // Detección flexible de PERSONAL_107 (puede venir como PERSONAL_107, PERSONAL-107, etc)
  const isPersonal107 = roles.some(r => r.includes("PERSONAL") && r.includes("107"));
  const isMedico = roles.includes("MEDICO");
  const isProfesionalSalud = roles.some(r => [
    "MEDICO", "ENFERMERIA", "OBSTETRA", "LABORATORIO", "RADIOLOGIA",
    "FARMACIA", "PSICOLOGO", "TERAPISTA_LENG", "TERAPISTA_FISI", "NUTRICION"
  ].includes(r));
  const isCoordinadorTeleurgencias = roles.includes("COORDINADOR_MEDICO_TELEURGENCIAS") || roles.includes("SOPORTE_TELEUE");
  const isMesaDeAyuda = roles.some(r => r.includes("MESA") && r.includes("AYUDA"));

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

      // Para SUPERADMIN: expandir "Administración"
      if (isSuperAdmin) {
        const moduloAdmin = modulosPermitidos.find(m =>
          m.nombreModulo?.toLowerCase() === "administración" ||
          m.nombreModulo?.toLowerCase() === "administracion"
        );
        if (moduloAdmin) {
          sectionsToOpen[moduloAdmin.nombreModulo] = true;
        }
      }

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

      // Para usuarios COORDINADOR_GESTION_CITAS: expandir "Bolsas de Pacientes"
      if (isCoordinadorGestionCitas) {
        const moduloBolsas = modulosPermitidos.find(m =>
          m.nombreModulo?.toLowerCase().includes("bolsa") ||
          m.nombreModulo?.toLowerCase() === "bolsas de pacientes"
        );
        if (moduloBolsas) {
          sectionsToOpen[moduloBolsas.nombreModulo] = true;
        }
      }

      // Para usuarios PERSONAL_107: expandir "Bolsas de Pacientes"
      if (isPersonal107) {
        const moduloBolsas = modulosPermitidos.find(m =>
          m.nombreModulo?.toLowerCase().includes("bolsa") ||
          m.nombreModulo?.toLowerCase() === "bolsas de pacientes"
        );
        if (moduloBolsas) {
          sectionsToOpen[moduloBolsas.nombreModulo] = true;
        }
      }

      // Para profesionales de salud: expandir "Panel profesional de salud"
      if (isProfesionalSalud) {
        const moduloPanelSalud = modulosPermitidos.find(m =>
          m.nombreModulo?.toLowerCase().includes("panel profesional") ||
          m.nombreModulo?.toLowerCase().includes("panel médico") ||
          m.nombreModulo?.toLowerCase().includes("panel medico")
        );
        if (moduloPanelSalud) {
          sectionsToOpen[moduloPanelSalud.nombreModulo] = true;
        }
      }

      // Para MEDICO: también expandir "TeleECG"
      if (isMedico) {
        const moduloTeleECG = modulosPermitidos.find(m =>
          m.nombreModulo?.toLowerCase().includes("teleecg") ||
          m.nombreModulo?.toLowerCase().includes("tele ecg")
        );
        if (moduloTeleECG) {
          sectionsToOpen[moduloTeleECG.nombreModulo] = true;
        }
      }

      // Para usuarios COORDINADOR_MEDICO_TELEURGENCIAS: expandir "Coordinador de Teleurgencias"
      if (isCoordinadorTeleurgencias) {
        const moduloTeleurgencias = modulosPermitidos.find(m =>
          m.nombreModulo?.toLowerCase().includes("coordinador de teleurgencias") ||
          m.nombreModulo?.toLowerCase().includes("teleurgencias")
        );
        if (moduloTeleurgencias) {
          sectionsToOpen[moduloTeleurgencias.nombreModulo] = true;
        }
      }

      // Para usuarios MESA_DE_AYUDA: expandir "Mesa de Ayuda"
      if (isMesaDeAyuda) {
        const moduloMesaAyuda = modulosPermitidos.find(m =>
          m.nombreModulo?.toLowerCase().includes("mesa de ayuda") ||
          m.nombreModulo?.toLowerCase().includes("mesa ayuda")
        );
        if (moduloMesaAyuda) {
          sectionsToOpen[moduloMesaAyuda.nombreModulo] = true;
        }
      }

      // Si hay secciones para abrir, establecerlas
      if (Object.keys(sectionsToOpen).length > 0) {
        setOpenSections(prev => ({ ...prev, ...sectionsToOpen }));
      }
    }
  }, [loading, modulosPermitidos, collapsed, isSuperAdmin, isExterno, isCoordinadorRed, isGestorCitas, isCoordinadorGestionCitas, isPersonal107, isMedico, isProfesionalSalud, isCoordinadorTeleurgencias, isMesaDeAyuda]);

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

      {/* Menu de navegacion: sidebar estático para EXTERNO, dinámico para otros roles */}
      {isExterno ? (
        <ExternoSidebar collapsed={collapsed} VERSION={VERSION} />
      ) : (
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
              isPersonal107={isPersonal107}
            />
          ))}
        </nav>
      )}

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

// Función helper mejorada para obtener el icono según módulo y página
function getPageIcon(nombreModulo, nombrePagina) {
  const lowerName = nombrePagina.toLowerCase();
  const lowerModule = nombreModulo.toLowerCase();

  // ========== MAPEOS ESPECÍFICOS POR MÓDULO ==========

  // --- MÓDULO: ENFERMERÍA ---
  if (lowerModule.includes('enfermería') || lowerModule.includes('enfermeria')) {
    if (lowerName.includes('bienvenida')) return Home;
    if (lowerName.includes('dashboard') || lowerName.includes('inicio')) return LayoutDashboard;
    if (lowerName.includes('paciente')) return Users;
    if (lowerName.includes('atención') || lowerName.includes('atencion')) return Stethoscope;
    if (lowerName.includes('vital') || lowerName.includes('signo')) return HeartPulse;
    if (lowerName.includes('historia') || lowerName.includes('historial')) return ClipboardList;
    return Hospital;
  }

  // --- MÓDULO: GESTIÓN DE CITAS ---
  if (lowerModule.includes('gestión de citas') || lowerModule.includes('citas')) {
    if (lowerName.includes('bienvenida')) return Home;
    if (lowerName.includes('dashboard') || lowerName.includes('inicio')) return LayoutDashboard;
    if (lowerName.includes('cita') || lowerName.includes('agendar')) return CalendarCheck;
    if (lowerName.includes('asegurado')) return Users;
    if (lowerName.includes('disponibilidad')) return Calendar;
    if (lowerName.includes('listar') || lowerName.includes('listado')) return List;
    return Clock;
  }

  // --- MÓDULO: GESTIÓN DE COORDINADOR MÉDICO ---
  if (lowerModule.includes('coordinador médico') || lowerModule.includes('coordinador medico')) {
    if (lowerName.includes('bienvenida')) return Home;
    if (lowerName.includes('dashboard')) return LayoutDashboard;
    if (lowerName.includes('rendimiento') || lowerName.includes('performance')) return BarChart3;
    if (lowerName.includes('feriado') || lowerName.includes('festivo') || lowerName.includes('holiday')) return Calendar;
    if (lowerName.includes('configuración') || lowerName.includes('configuracion')) return Settings;
    if (lowerName.includes('coordinación') || lowerName.includes('coordinacion')) return Users;
    if (lowerName.includes('requerimiento') || lowerName.includes('requisito') || lowerName.includes('especialidad') || lowerName.includes('telemedicina')) return Stethoscope;
    if (lowerName.includes('período') || lowerName.includes('periodo') || lowerName.includes('disponibilidad')) return Calendar;
    if (lowerName.includes('paciente')) return Users;
    if (lowerName.includes('médico') || lowerName.includes('medico')) return Stethoscope;
    if (lowerName.includes('asignación') || lowerName.includes('asignacion')) return UserCheck;
    return Briefcase;
  }

  // --- MÓDULO: GESTIÓN DE MÓDULOS ---
  if (lowerModule.includes('gestión de módulos') || lowerModule.includes('gestion de modulos')) {
    if (lowerName.includes('descripción')) return FileText;
    if (lowerName.includes('modulo')) return Layers;
    if (lowerName.includes('página') || lowerName.includes('pagina')) return Layout;
    if (lowerName.includes('control') || lowerName.includes('acceso')) return Lock;
    if (lowerName.includes('rol')) return Shield;
    return Database;
  }

  // --- MÓDULO: CONTROL DE ROLES, ACCESOS Y PERMISOS ---
  if (lowerModule.includes('control') || lowerModule.includes('roles') || lowerModule.includes('acceso') || lowerModule.includes('permiso')) {
    if (lowerName.includes('rol')) return Shield;
    if (lowerName.includes('usuario') || lowerName.includes('personal')) return Users;
    if (lowerName.includes('permiso')) return Lock;
    if (lowerName.includes('auditoria') || lowerName.includes('auditoría')) return Eye;
    return UserCog;
  }

  // --- MÓDULO: GESTIÓN DE PERSONAL EXTERNO ---
  if (lowerModule.includes('personal externo')) {
    if (lowerName.includes('bienvenida')) return Home;
    if (lowerName.includes('dashboard')) return LayoutDashboard;
    if (lowerName.includes('personal')) return Users;
    if (lowerName.includes('institución') || lowerName.includes('institucion')) return Building2;
    return UserPlus;
  }

  // --- MÓDULO: GESTIÓN TERRITORIAL ---
  if (lowerModule.includes('gestión territorial') || lowerModule.includes('gestion territorial')) {
    if (lowerName.includes('diagnóstico') || lowerName.includes('diagnostico')) return BarChart3;
    if (lowerName.includes('ipress')) return Hospital;
    if (lowerName.includes('red') || lowerName.includes('territorio')) return MapPinned;
    if (lowerName.includes('respuesta')) return CheckCircle;
    return MapPin;
  }

  // --- MÓDULO: IPRESS ---
  if (lowerModule.includes('ipress')) {
    if (lowerName.includes('bienvenida')) return Home;
    if (lowerName.includes('institución') || lowerName.includes('institucion')) return Hospital;
    if (lowerName.includes('catálogo') || lowerName.includes('catalogo')) return Database;
    if (lowerName.includes('personal')) return Users;
    return Building2;
  }

  // --- MÓDULO: PANEL PROFESIONAL DE SALUD (antes: Panel Médico) ---
  if (lowerModule.includes('panel profesional') || lowerModule.includes('panel médico') || lowerModule.includes('panel medico')) {
    if (lowerName.includes('bienvenida') || lowerName.includes('inicio')) return HeartPulse;
    if (lowerName.includes('mis pacientes') || lowerName.includes('paciente')) return Users;
    if (lowerName.includes('producción') || lowerName.includes('produccion') || lowerName.includes('kpi') || lowerName.includes('estadística')) return BarChart3;
    if (lowerName.includes('disponibilidad') || lowerName.includes('horario')) return CalendarCheck;
    if (lowerName.includes('información') || lowerName.includes('informacion') || lowerName.includes('perfil')) return User;
    if (lowerName.includes('receta')) return Pill;
    if (lowerName.includes('interconsulta')) return Microscope;
    return Stethoscope;
  }

  // --- MÓDULO: PROGRAMACIÓN CENATE ---
  if (lowerModule.includes('programación') || lowerModule.includes('programacion')) {
    if (lowerName.includes('horario') || lowerName.includes('disponibilidad')) return Calendar;
    if (lowerName.includes('médico') || lowerName.includes('medico')) return Stethoscope;
    if (lowerName.includes('turno') || lowerName.includes('schedule')) return Clock;
    return CalendarCheck;
  }

  // --- MÓDULO: TELEECG ---
  if (lowerModule.includes('teleecg') || lowerModule.includes('tele ecg') || lowerModule.includes('ecg')) {
    if (lowerName.includes('recibida') || lowerName.includes('recibido')) return Inbox;
    if (lowerName.includes('enviada') || lowerName.includes('enviado')) return Share2;
    if (lowerName.includes('paciente')) return Users;
    if (lowerName.includes('resultado') || lowerName.includes('analisis')) return BarChart3;
    return Heart;
  }

  // --- MÓDULO: BOLSAS DE PACIENTES ---
  if (lowerModule.includes('bolsa')) {
    if (lowerName.includes('módulo 107')) return Database;
    if (lowerName.includes('dengue')) return AlertTriangle;
    if (lowerName.includes('solicitud')) return ListChecks;
    if (lowerName.includes('paciente')) return Users;
    if (lowerName.includes('respuesta')) return CheckCircle;
    return Package;
  }

  // --- MÓDULO: MESA DE AYUDA ---
  if (lowerModule.includes('mesa') && lowerModule.includes('ayuda')) {
    if (lowerName.includes('bienvenida')) return Home;
    if (lowerName.includes('pendiente')) return CircleDot;
    if (lowerName.includes('atendido') || lowerName.includes('resuelto')) return TicketCheck;
    if (lowerName.includes('faq') || lowerName.includes('pregunta')) return HelpCircle;
    if (lowerName.includes('estadística') || lowerName.includes('estadisticas')) return BarChart3;
    return Headphones;
  }

  // --- MÓDULO: ADMINISTRACIÓN ---
  if (lowerModule.includes('administración') || lowerModule.includes('administracion')) {
    if (lowerName.includes('usuario')) return Users;
    if (lowerName.includes('rol')) return Shield;
    if (lowerName.includes('módulo') || lowerName.includes('modulo')) return Layers;
    if (lowerName.includes('configuración') || lowerName.includes('configuracion')) return Settings;
    if (lowerName.includes('auditoría') || lowerName.includes('auditoria')) return Eye;
    return UserCog;
  }

  // --- MÓDULO: ASEGURADOS ---
  if (lowerModule.includes('asegurado')) {
    if (lowerName.includes('buscar')) return Search;
    if (lowerName.includes('duplicado')) return Copy;
    if (lowerName.includes('dashboard')) return LayoutDashboard;
    return Users;
  }

  // ========== MAPEOS GENERALES (FALLBACK) ==========

  if (lowerName.includes('bienvenida')) return Home;
  if (lowerName.includes('inicio') || lowerName.includes('dashboard')) return LayoutDashboard;
  if (lowerName.includes('excel') || lowerName.includes('cargar') || lowerName.includes('importar')) return Upload;
  if (lowerName.includes('descargar') || lowerName.includes('exportar') || lowerName.includes('download')) return Download;
  if (lowerName.includes('listar') || lowerName.includes('listado') || lowerName.includes('casos')) return List;
  if (lowerName.includes('buscar') || lowerName.includes('búsqueda') || lowerName.includes('search')) return Search;
  if (lowerName.includes('resultado') || lowerName.includes('estadística') || lowerName.includes('estadisticas') || lowerName.includes('analisis')) return BarChart3;
  if (lowerName.includes('paciente')) return Users;
  if (lowerName.includes('disponibilidad')) return Calendar;
  if (lowerName.includes('información') || lowerName.includes('informacion') || lowerName.includes('perfil')) return User;
  if (lowerName.includes('recibida') || lowerName.includes('recibido') || lowerName.includes('inbox')) return Inbox;
  if (lowerName.includes('atención') || lowerName.includes('atencion') || lowerName.includes('clínica') || lowerName.includes('clinica')) return Stethoscope;
  if (lowerName.includes('asignación') || lowerName.includes('asignacion') || lowerName.includes('assign')) return UserCheck;
  if (lowerName.includes('error') || lowerName.includes('fallo') || lowerName.includes('problema')) return AlertTriangle;
  if (lowerName.includes('solicitud') || lowerName.includes('request')) return ListChecks;
  if (lowerName.includes('historial') || lowerName.includes('history') || lowerName.includes('log')) return FolderOpen;
  if (lowerName.includes('módulo') || lowerName.includes('modulo') || lowerName.includes('grupo')) return Database;
  if (lowerName.includes('rol')) return Shield;
  if (lowerName.includes('usuario')) return Users;
  if (lowerName.includes('médico') || lowerName.includes('medico')) return Stethoscope;
  if (lowerName.includes('enfermería') || lowerName.includes('enfermeria')) return Hospital;
  if (lowerName.includes('dengue')) return AlertTriangle;
  if (lowerName.includes('configuración') || lowerName.includes('configuracion')) return Settings;
  if (lowerName.includes('ayuda') || lowerName.includes('soporte')) return Headphones;

  return FileText;
}

// Componente para renderizar una página con submenú (nivel 3)
function PaginaConSubmenu({ pagina, location, nombreModulo, getIconComponent, autoExpand = false }) {
  const hasActiveSubpage = pagina.subpaginas?.some((sub) => location.pathname === sub.ruta);
  const subStateKey = `${nombreModulo}-${pagina.id_pagina}`;
  // Expandir automáticamente si hay una subpágina activa o si es Módulo 107
  const shouldAutoExpand = hasActiveSubpage || (autoExpand && pagina.nombre?.toLowerCase().includes("módulo 107"));
  const [isSubOpen, setIsSubOpen] = React.useState(shouldAutoExpand);

  // Actualizar estado si cambia la subpágina activa
  React.useEffect(() => {
    if (hasActiveSubpage || (autoExpand && pagina.nombre?.toLowerCase().includes("módulo 107"))) {
      setIsSubOpen(true);
    }
  }, [hasActiveSubpage, autoExpand, pagina.nombre]);

  // Priorizar hardcoded getPageIcon primero (para médico y otros roles específicos), luego icono de BD, luego por defecto
  const PageIcon = getPageIcon(nombreModulo, pagina.nombre) || (pagina.icono ? getIconComponent(pagina.icono) : null) || Folder;

  return (
    <div className="space-y-1">
      {/* Botón padre con chevron */}
      <button
        onClick={() => setIsSubOpen(!isSubOpen)}
        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
          hasActiveSubpage
            ? "bg-slate-800/80 text-blue-400"
            : "hover:bg-slate-800/60 text-slate-400 hover:text-white"
        }`}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <PageIcon className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{pagina.nombre}</span>
        </div>
        {isSubOpen ? (
          <ChevronDown className="w-4 h-4 flex-shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 flex-shrink-0" />
        )}
      </button>

      {/* Subpáginas */}
      {isSubOpen && (
        <div className="ml-3 pl-3 border-l-2 border-slate-700/30 space-y-1 animate-fadeIn">
          {pagina.subpaginas.sort((a, b) => (a.orden || 0) - (b.orden || 0)).map((subpagina, subIdx) => {
            const isActive = location.pathname === subpagina.ruta;
            // Priorizar hardcoded icons basado en nombre
            const SubIcon = getPageIcon(nombreModulo, subpagina.nombre) || (subpagina.icono ? getIconComponent(subpagina.icono) : Folder);
            return (
              <NavLink
                key={subpagina.id_pagina || subIdx}
                to={subpagina.ruta}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg text-xs font-medium transition-all block ${
                  isActive
                    ? "bg-[#0A5BA9] text-white shadow-md"
                    : "hover:bg-slate-800/40 text-slate-400 hover:text-white"
                }`}
              >
                <SubIcon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{subpagina.nombre}</span>
              </NavLink>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Función para obtener el mejor icono del módulo
function getModuleIcon(nombreModulo, iconoDeBaseDatos) {
  const lowerName = nombreModulo.toLowerCase();

  // Mapeos específicos por nombre de módulo
  if (lowerName.includes('asegurado')) return Users;
  if (lowerName.includes('enfermería') || lowerName.includes('enfermeria')) return Hospital;
  if (lowerName.includes('gestión de citas') || lowerName.includes('citas')) return CalendarCheck;
  if (lowerName.includes('coordinador de teleurgencias') || lowerName.includes('teleurgencias')) return Ambulance;
  if (lowerName.includes('coordinador médico') || lowerName.includes('coordinador medico')) return Briefcase;
  if (lowerName.includes('gestión de módulos') || lowerName.includes('gestion de modulos')) return Layers;
  if (lowerName.includes('control') && (lowerName.includes('rol') || lowerName.includes('acceso') || lowerName.includes('permiso'))) return UserCog;
  if (lowerName.includes('gestión de personal externo') || lowerName.includes('personal externo')) return UserPlus;
  if (lowerName.includes('gestión territorial') || lowerName.includes('gestion territorial')) return MapPinned;
  if (lowerName.includes('ipress')) return Building2;
  if (lowerName.includes('panel profesional') || lowerName.includes('panel médico') || lowerName.includes('panel medico')) return HeartPulse;
  if (lowerName.includes('programación') || lowerName.includes('programacion')) return Calendar;
  if (lowerName.includes('teleecg') || lowerName.includes('tele ecg') || lowerName.includes('ecg')) return Heart;
  if (lowerName.includes('bolsa')) return Package;
  if (lowerName.includes('administración') || lowerName.includes('administracion')) return Settings;
  if (lowerName.includes('dashboard')) return LayoutDashboard;
  if (lowerName.includes('catálogo') || lowerName.includes('catalogo')) return Database;
  if (lowerName.includes('reportes') || lowerName.includes('reporte')) return BarChart3;
  if (lowerName.includes('auditoría') || lowerName.includes('auditoria')) return Eye;
  if (lowerName.includes('notificaciones')) return MessageSquare;
  if (lowerName.includes('estado') && lowerName.includes('sistema')) return Activity;

  // Intentar usar el icono de la BD como fallback
  if (iconoDeBaseDatos) {
    return null; // Dejar que getPageIcon lo maneje
  }

  return Folder;
}

// Componente para renderizar modulos dinamicos con iconos de la BD
function DynamicModuleSection({ modulo, colorConfig, location, toggleSection, openSections, collapsed, getIconComponent, isPersonal107 = false }) {
  const { nombreModulo, icono, paginas } = modulo;

  // Intentar obtener icono específico del módulo primero
  let ModuleIcon = getModuleIcon(nombreModulo, icono) || getPageIcon(nombreModulo, nombreModulo) || getIconComponent(icono) || Folder;

  const isOpen = openSections[nombreModulo];

  // Verificar si alguna página o subpágina está activa
  const hasActiveChild = paginas.some((p) => {
    if (location.pathname === p.ruta) return true;
    if (p.subpaginas && p.subpaginas.length > 0) {
      return p.subpaginas.some((sub) => location.pathname === sub.ruta);
    }
    return false;
  });

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
          {paginas.sort((a, b) => {
            // Orden alfabético para módulos específicos
            if (
              nombreModulo.toLowerCase().includes('gestión territorial') ||
              nombreModulo.toLowerCase().includes('gestion territorial') ||
              nombreModulo.toLowerCase().includes('bolsas de pacientes') ||
              nombreModulo.toLowerCase().includes('bolsa')
            ) {
              return (a.nombre || '').localeCompare(b.nombre || '', 'es', { sensitivity: 'base' });
            }
            // Para otros módulos, mantener el orden original
            return (a.orden || 0) - (b.orden || 0);
          }).map((pagina, idx) => {
            // Verificar si tiene subpáginas
            const tieneSubpaginas = pagina.subpaginas && pagina.subpaginas.length > 0;

            if (tieneSubpaginas) {
              return (
                <PaginaConSubmenu
                  key={pagina.id_pagina || idx}
                  pagina={pagina}
                  location={location}
                  nombreModulo={nombreModulo}
                  getIconComponent={getIconComponent}
                  autoExpand={isPersonal107}
                />
              );
            } else {
              // Renderizar como página normal
              const isActive = location.pathname === pagina.ruta;
              const PageIcon = getPageIcon(nombreModulo, pagina.nombre) || (pagina.icono ? getIconComponent(pagina.icono) : null) || Folder;
              return (
                <NavLink
                  key={pagina.id_pagina || idx}
                  to={pagina.ruta}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-[#0A5BA9] text-white shadow-md"
                      : "hover:bg-slate-800/60 text-slate-400 hover:text-white"
                  }`}
                >
                  <PageIcon className="w-4 h-4" />
                  <span className="truncate">{pagina.nombre}</span>
                </NavLink>
              );
            }
          })}
        </div>
      )}
    </div>
  );
}
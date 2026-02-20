// ========================================================================
// ExternoSidebar.jsx - Sidebar estático para rol EXTERNO (IPRESS externas)
// ========================================================================
// Estructura de navegación estandarizada para IPRESS externas:
//   - Bienvenida
//   - Gestión IPRESS (dropdown)
//   - Servicios de Telemedicina (dropdown con sub-dropdowns anidados)
// ========================================================================

import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  Building2,
  ChevronDown,
  ChevronRight,
  FileText,
  Calendar,
  Settings,
  BarChart3,
  Heart,
  Users,
  Stethoscope,
  Activity,
  Monitor,
} from "lucide-react";

// ============================================================
// Helper: recolectar rutas de los children (para detectar ruta activa)
// ============================================================
function collectRoutes(children) {
  const routes = [];
  React.Children.forEach(children, (child) => {
    if (!child) return;
    if (child.props?.to) {
      routes.push(child.props.to);
    }
    if (child.props?.children) {
      routes.push(...collectRoutes(React.Children.toArray(child.props.children)));
    }
  });
  return routes;
}

// ============================================================
// NavItem: enlace simple — la indentación la dan los contenedores
// ============================================================
function NavItem({ to, icon: Icon, label }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <NavLink
      to={to}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
        isActive
          ? "bg-[#0A5BA9] text-white shadow-md"
          : "hover:bg-slate-800/60 text-slate-300 hover:text-white"
      }`}
    >
      {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
      <span className="truncate">{label}</span>
    </NavLink>
  );
}

// ============================================================
// DropdownSection: sección colapsable
// La indentación de sus hijos se logra con ml-3 pl-3 border-l
// ============================================================
function DropdownSection({ icon: Icon, label, children, defaultOpen = false }) {
  const location = useLocation();

  // Auto-expandir si alguna ruta hija está activa
  const childRoutes = collectRoutes(React.Children.toArray(children));
  const hasActiveChild = childRoutes.includes(location.pathname);

  const [isOpen, setIsOpen] = useState(defaultOpen || hasActiveChild);

  React.useEffect(() => {
    if (hasActiveChild) setIsOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <div className="space-y-0.5">
      {/* Botón del dropdown */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
          hasActiveChild
            ? "bg-slate-800/80 text-blue-300"
            : "hover:bg-slate-800/60 text-slate-300 hover:text-white"
        }`}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
          <span className="truncate">{label}</span>
        </div>
        {isOpen ? (
          <ChevronDown className="w-4 h-4 flex-shrink-0 text-slate-400" />
        ) : (
          <ChevronRight className="w-4 h-4 flex-shrink-0 text-slate-400" />
        )}
      </button>

      {/* Hijos — indentados con ml+pl+border */}
      {isOpen && (
        <div className="ml-3 pl-3 border-l border-slate-700/40 space-y-0.5">
          {children}
        </div>
      )}
    </div>
  );
}

// ============================================================
// ExternoSidebar principal
// ============================================================
export default function ExternoSidebar({ collapsed }) {
  if (collapsed) {
    return (
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        <NavLink
          to="/roles/externo/bienvenida"
          title="Bienvenida"
          className={({ isActive }) =>
            `flex items-center justify-center p-2.5 rounded-lg transition-all ${
              isActive ? "bg-[#0A5BA9] text-white" : "hover:bg-slate-800/60 text-slate-300 hover:text-white"
            }`
          }
        >
          <Home className="w-5 h-5" />
        </NavLink>
        <div className="flex items-center justify-center p-2.5 rounded-lg text-slate-400" title="Gestión IPRESS">
          <Building2 className="w-5 h-5" />
        </div>
        <div className="flex items-center justify-center p-2.5 rounded-lg text-slate-400" title="Servicios de Telemedicina">
          <Stethoscope className="w-5 h-5" />
        </div>
      </nav>
    );
  }

  return (
    <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">

      {/* ── Bienvenida ── */}
      <NavItem to="/roles/externo/bienvenida" icon={Home} label="Bienvenida" />

      {/* ── Gestión IPRESS ── */}
      <DropdownSection icon={Building2} label="Gestión IPRESS">
        <NavItem to="/roles/externo/formulario-diagnostico" icon={FileText}  label="Diagnóstico Situacional" />
        <NavItem to="/roles/externo/solicitud-turnos"       icon={Calendar}  label="Solicitud de Requerimientos" />
        <NavItem to="/roles/externo/gestion-modalidad"      icon={Settings}  label="Gestión de Modalidades de Atención" />
      </DropdownSection>

      {/* ── Servicios de Telemedicina ── */}
      <DropdownSection icon={Stethoscope} label="Servicios de Telemedicina" defaultOpen={true}>

        {/* Teleconsulta */}
        <DropdownSection icon={Monitor} label="Teleconsulta">
          <NavItem to="/roles/externo/teleconsulta/listado"      icon={Users}    label="Listado de pacientes" />
          <NavItem to="/roles/externo/teleconsulta/estadisticas" icon={BarChart3} label="Estadísticas Teleconsulta" />
        </DropdownSection>

        {/* Teleinterconsulta */}
        <DropdownSection icon={Activity} label="Teleinterconsulta">

          {/* Tele EKG */}
          <DropdownSection icon={Heart} label="Tele EKG">
            <NavItem to="/teleekgs/ipress-workspace" icon={Users}    label="Listado" />
            <NavItem to="/teleekgs/dashboard"        icon={BarChart3} label="Estadística" />
          </DropdownSection>

        </DropdownSection>

        {/* Teleapoyo al Diagnóstico */}
        <DropdownSection icon={FileText} label="Teleapoyo al Diagnóstico">
          <NavItem to="/roles/externo/seguimiento-lecturas" icon={BarChart3} label="Estadística" />
        </DropdownSection>

      </DropdownSection>

    </nav>
  );
}

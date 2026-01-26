// ========================================================================
// 🧭 UserDashboard.jsx – Centro Personal del Usuario (CENATE 2025)
// ------------------------------------------------------------------------
// • Inspirado en paneles corporativos tipo IBM / Salesforce / Apple HR
// • Integra Mi Perfil, Mi Información y Seguridad
// • Incluye mensajes ejecutivos y diseño institucional
// ========================================================================

import React, { useState, useEffect } from "react";
import {
  UserCircle2,
  IdCard,
  LockKeyhole,
  Bell,
  Settings,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import apiClient from "../../services/apiClient";

export default function UserDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔄 Cargar datos del usuario actual desde /api/personal/me
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await apiClient.get("/personal/me");
        console.log("✅ Datos del usuario cargados:", response);
        setUserData(response);
      } catch (error) {
        console.error("❌ Error al cargar datos del usuario:", error);
        // Si falla, usar datos del contexto
        setUserData({
          nombreCompleto: user?.username || "Usuario",
          ...user
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  // 🧠 Nombre + Apellido
  const full = (userData?.nombreCompleto || user?.username || "Usuario").trim();
  const tokens = full.split(/\s+/);
  const nombreYApellido =
    tokens.length >= 2 ? `${tokens[0]} ${tokens[1]}` : full;

  // 🎯 Determinar saludo según género
  const obtenerSaludo = () => {
    const genero = (userData?.genero?.toUpperCase() || user?.genero?.toUpperCase() || '');
    // Detectar tanto "F"/"M" como "FEMENINO"/"MASCULINO"
    if (genero === 'F' || genero === 'FEMENINO') return 'Bienvenida';
    if (genero === 'M' || genero === 'MASCULINO') return 'Bienvenido';
    return 'Bienvenido(a)'; // Por defecto si no hay género
  };

  // 🌐 Rutas destino
  const ROUTES = {
    profile: "/user/profile", // Seguridad / cambiar contraseña
    info: `/user/detail/${userData?.id ?? user?.id ?? user?.idUser ?? ""}`, // Ficha institucional
    dashboard: "/user/dashboard", // Hub personal
  };

  // Loading state
  if (loading) {
    return (
      <div className="w-full flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A5BA9] mx-auto"></div>
          <p className="mt-4 text-[var(--text-secondary)]">Cargando datos del usuario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* ======================================================= */}
      {/* 🧩 Encabezado Ejecutivo */}
      {/* ======================================================= */}
      <section className="mb-10 mt-4 flex flex-col sm:flex-row items-center gap-6 bg-gradient-to-r from-[#0A5BA9] to-[#1C5B36] rounded-2xl p-8 shadow-md text-white">
        <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-4xl font-bold uppercase">
          {nombreYApellido.charAt(0)}
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{obtenerSaludo()}, {nombreYApellido}</h1>
          <p className="text-white/90 mt-2 text-sm sm:text-base">
            Este es tu <strong>Centro Personal CENATE</strong>, un espacio
            diseñado para que gestiones tu información, revises tus accesos y
            mantengas actualizados tus datos institucionales dentro de la
            Intranet.
          </p>

          {/* 🔹 Información del Perfil */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            {userData?.username && (
              <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg backdrop-blur-sm">
                <IdCard className="w-4 h-4" />
                <span className="font-medium">DNI:</span>
                <span className="font-bold">{userData.username}</span>
              </div>
            )}

            {(userData?.emailPers || userData?.correoPersonal) && (
              <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg backdrop-blur-sm">
                <span className="text-lg">📧</span>
                <span className="truncate">{userData.emailPers || userData.correoPersonal}</span>
              </div>
            )}

            {(userData?.ipress || userData?.nombreIpress) && (
              <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg backdrop-blur-sm col-span-full">
                <span className="text-lg">🏥</span>
                <span className="font-medium">IPRESS:</span>
                <span className="truncate font-bold">{userData.ipress || userData.nombreIpress}</span>
              </div>
            )}

            {user?.roles && user.roles.length > 0 && (
              <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg backdrop-blur-sm col-span-full">
                <UserCircle2 className="w-4 h-4" />
                <span className="font-medium">Rol:</span>
                <span className="font-bold">{user.roles.join(", ")}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ======================================================= */}
      {/* 🧱 Bloques principales */}
      {/* ======================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">

       <DashboardCard
         icon={UserCircle2}
         title="Mi Perfil"
         description="Consulta tus datos personales, foto, y roles asignados dentro del sistema."
         color="#0A5BA9"
         onClick={() => navigate(`/user/detail/${userData?.id || user?.idUser || user?.id || ""}`)}  // ✅ corregido
       />



        <DashboardCard
          icon={IdCard}
          title="Mi Información"
          description="Actualiza tus datos institucionales, contactos y área de trabajo."
          color="#16A34A"
          onClick={() => navigate("/user/profile")}  // ✅ CORRECTO
        />

        <DashboardCard
          icon={LockKeyhole}
          title="Seguridad y Contraseña"
          description="Gestiona tu contraseña, sesiones activas y dispositivos confiables."
          color="#7C3AED"
          onClick={() => navigate("/user/security")}  // ✅ ahora lleva a UserSecurity.jsx
        />
      </div>

      {/* ======================================================= */}
      {/* 🔔 Panel de actividades según rol */}
      {/* ======================================================= */}
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-card)]/80 p-8 shadow-sm backdrop-blur-sm">
        <h2 className="text-xl font-semibold text-[var(--text-primary)] flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-[var(--color-primary)]" />
          {user?.roles?.includes("SUPERADMIN") || user?.roles?.includes("ADMIN")
            ? "Actividades Administrativas"
            : user?.roles?.includes("GESTOR DE CITAS")
            ? "Actividades como Gestor de Citas"
            : user?.roles?.includes("INSTITUCION_EX") || user?.roles?.includes("EXTERNO")
            ? "Actividades como Personal Externo"
            : "Comunicaciones institucionales"}
        </h2>

        <ul className="space-y-4 text-[var(--text-primary)] text-sm">
          {user?.roles?.includes("SUPERADMIN") || user?.roles?.includes("ADMIN") ? (
            <>
              <li>
                👥 <strong>Gestión de Usuarios:</strong> Administra cuentas de usuario, asigna roles y permisos según el sistema MBAC (Module-Based Access Control).
              </li>
              <li>
                🔐 <strong>Control de Permisos:</strong> Configura permisos modulares, gestiona accesos a páginas y funcionalidades del sistema para cada rol.
              </li>
              <li>
                📊 <strong>Auditoría del Sistema:</strong> Revisa logs de actividad, monitorea acciones críticas y genera reportes de auditoría de seguridad.
              </li>
              <li>
                ⚙️ <strong>Configuración del Sistema:</strong> Administra módulos del sistema, gestiona firma digital, aprueba solicitudes de usuarios y configura parámetros institucionales.
              </li>
              <li>
                📋 <strong>Gestión de Personal:</strong> Administra datos de personal médico, coordinadores, gestores de citas y personal externo del sistema CENATE.
              </li>
              <li>
                🔐 <strong>Seguridad:</strong> Recuerda actualizar tu contraseña cada 90 días para mantener el acceso seguro al sistema.
              </li>
            </>
          ) : user?.roles?.includes("GESTOR DE CITAS") ? (
            <>
              <li>
                📋 <strong>Gestión de Pacientes:</strong> Puedes revisar, asignar y dar seguimiento a los pacientes de la Bolsa 107, gestionando sus estados y derivaciones a especialidades.
              </li>
              <li>
                📞 <strong>Coordinación de Citas:</strong> Asigna citas médicas según disponibilidad de especialistas, coordina teleconsultas y gestiona reagendamientos.
              </li>
              <li>
                👥 <strong>Asignación de Casos:</strong> Deriva pacientes a médicos especialistas según la complejidad del caso y disponibilidad horaria del personal.
              </li>
              <li>
                📊 <strong>Reportes y Seguimiento:</strong> Genera reportes de atenciones realizadas, pacientes pendientes y métricas de gestión de citas.
              </li>
              <li>
                🔐 <strong>Seguridad:</strong> Recuerda actualizar tu contraseña cada 90 días para mantener el acceso seguro al sistema.
              </li>
            </>
          ) : user?.roles?.includes("INSTITUCION_EX") || user?.roles?.includes("EXTERNO") ? (
            <>
              <li>
                📝 <strong>Formulario de Diagnóstico:</strong> Completa el diagnóstico institucional de telemedicina para tu IPRESS, reportando capacidades técnicas y necesidades de equipamiento.
              </li>
              <li>
                📅 <strong>Solicitud de Turnos:</strong> Solicita turnos de atención médica especializada desde CENATE hacia tu institución de salud.
              </li>
              <li>
                🏥 <strong>Coordinación de Atenciones:</strong> Coordina las atenciones de telemedicina con el personal médico de CENATE según disponibilidad y especialidades requeridas.
              </li>
              <li>
                📊 <strong>Seguimiento de Solicitudes:</strong> Revisa el estado de tus solicitudes de turnos y el historial de atenciones realizadas en tu IPRESS.
              </li>
              <li>
                🔐 <strong>Seguridad:</strong> Recuerda actualizar tu contraseña cada 90 días para mantener el acceso seguro al sistema.
              </li>
            </>
          ) : (
            <>
              <li>
                📢 <strong>Actualización de roles MBAC:</strong> Los perfiles de
                usuario serán sincronizados automáticamente con el sistema central
                de gestión de permisos.
              </li>
              <li>
                🔐 <strong>Seguridad:</strong> Recuerda actualizar tu contraseña
                cada 90 días para mantener el acceso a la Intranet institucional.
              </li>
              <li>
                🕑 <strong>Soporte CENATE:</strong> Para incidencias técnicas, comunícate
                con el área de Transformación Digital de EsSalud.
              </li>
            </>
          )}
        </ul>
      </div>

      {/* ======================================================= */}
      {/* ⚙️ Preferencias rápidas */}
      {/* ======================================================= */}
      <section className="mt-10 mb-16 text-sm text-[var(--text-secondary)]">
        <div className="flex flex-col sm:flex-row items-center justify-between border-t pt-6">
          <p>
            CENATE – Centro Nacional de Telemedicina | Plataforma MBAC 2025 ©{" "}
            <span className="font-semibold text-[var(--text-primary)]">
              EsSalud
            </span>
          </p>
          <button
            onClick={() => navigate("/user/settings")}
            className="flex items-center gap-2 mt-4 sm:mt-0 text-[var(--color-primary)] hover:underline"
          >
            <Settings size={16} />
            Configurar preferencias
          </button>
        </div>
      </section>
    </div>
  );
}

/* ======================================================= */
/* 🧩 Subcomponente de tarjeta */
/* ======================================================= */
function DashboardCard({ icon: Icon, title, description, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className="text-left rounded-2xl p-6 border shadow-sm hover:shadow-lg transition-all duration-200
                 bg-[var(--bg-card)] border-[var(--border-color)] backdrop-blur-sm w-full hover:scale-[1.02]"
      style={{ outline: "none" }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${color}25` }}
        >
          <Icon size={22} style={{ color }} />
        </div>
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">
          {title}
        </h3>
      </div>
      <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
        {description}
      </p>
    </button>
  );
}
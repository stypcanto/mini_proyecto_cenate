// src/pages/coordinador/turnos/utils/ui.js

export const monthNames = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
];

export const pad2 = (v) => String(v).padStart(2, "0");

export const fmtDate = (val) => {
  if (!val) return "—";
  try {
    const fecha = new Date(val);
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const anio = fecha.getFullYear();
    return `${dia}/${mes}/${anio}`;
  } catch {
    return String(val);
  }
};

export const fmtDateTime = (val) => {
  if (!val) return "—";
  try {
    const fecha = new Date(val);
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const anio = fecha.getFullYear();
    const hora = String(fecha.getHours()).padStart(2, '0');
    const minutos = String(fecha.getMinutes()).padStart(2, '0');
    return `${dia}/${mes}/${anio}, ${hora}:${minutos}`;
  } catch {
    return String(val);
  }
};

export const safeNum = (n) => (Number.isFinite(Number(n)) ? Number(n) : 0);

export const yyyymmFromYearMonth = (year, monthIndex0) =>
  `${year}${pad2(monthIndex0 + 1)}`;

export const firstDayOfMonth = (year, monthIndex0) =>
  `${year}-${pad2(monthIndex0 + 1)}-01`;

export const lastDayOfMonth = (year, monthIndex0) => {
  const d = new Date(year, monthIndex0 + 1, 0);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};

export const chipDay = (d) => (
  <span
    key={d}
    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border border-indigo-200 bg-indigo-50 text-indigo-700"
  >
    {d}
  </span>
);

export const yesNoPill = (yes) => (
  <span
    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
      yes ? "border-green-200 bg-green-50 text-green-700" : "border-gray-200 bg-gray-50 text-gray-600"
    }`}
  >
    {yes ? "Sí" : "No"}
  </span>
);

export const TeleIcon = ({ enabled }) => {
  if (!enabled) {
    return <span className="text-gray-400 text-lg font-bold">—</span>;
  }
  return (
    <svg
      className="w-4 h-4 text-green-600 inline-block"
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
};

export const getEstadoBadgeDefault = (estado) => {
  // Paleta Corporativa con Gradientes - Profesional
  const badges = {
    // Estados de Solicitud (Azul Corporativo = Información/En Proceso)
    BORRADOR: "bg-gradient-to-r from-purple-500 to-purple-700 text-white font-semibold px-3 py-1.5 rounded-lg",
    ENVIADO: "bg-gradient-to-r from-[#0A5BA9] to-[#084a8a] text-white font-semibold px-3 py-1.5 rounded-lg",

    // Estados en Progreso (Ámbar = Advertencia/Pendiente)
    INICIADO: "bg-gradient-to-r from-amber-500 to-amber-700 text-white font-semibold px-3 py-1.5 rounded-lg",
    PENDIENTE: "bg-gradient-to-r from-amber-500 to-amber-700 text-white font-semibold px-3 py-1.5 rounded-lg",
    REVISADO: "bg-gradient-to-r from-amber-500 to-amber-700 text-white font-semibold px-3 py-1.5 rounded-lg",

    // Estados Exitosos (Verde = Completado/Aprobado)
    ACTIVO: "bg-gradient-to-r from-emerald-500 to-emerald-700 text-white font-semibold px-3 py-1.5 rounded-lg",
    APROBADA: "bg-gradient-to-r from-emerald-500 to-emerald-700 text-white font-semibold px-3 py-1.5 rounded-lg",
    APROBADO: "bg-gradient-to-r from-emerald-500 to-emerald-700 text-white font-semibold px-3 py-1.5 rounded-lg",
    ASIGNADO: "bg-gradient-to-r from-emerald-500 to-emerald-700 text-white font-semibold px-3 py-1.5 rounded-lg",

    // Estados Rechazados/Cerrados (Rojo = Crítico/Acción Requerida)
    CERRADO: "bg-gradient-to-r from-orange-600 to-red-700 text-white font-semibold px-3 py-1.5 rounded-lg",
    RECHAZADA: "bg-gradient-to-r from-orange-600 to-red-700 text-white font-semibold px-3 py-1.5 rounded-lg",
    RECHAZADO: "bg-gradient-to-r from-orange-600 to-red-700 text-white font-semibold px-3 py-1.5 rounded-lg",
    "NO PROCEDE": "bg-gradient-to-r from-orange-600 to-red-700 text-white font-semibold px-3 py-1.5 rounded-lg",
  };
  return badges[estado] || "bg-gradient-to-r from-gray-500 to-gray-700 text-white font-semibold px-3 py-1.5 rounded-lg";
};

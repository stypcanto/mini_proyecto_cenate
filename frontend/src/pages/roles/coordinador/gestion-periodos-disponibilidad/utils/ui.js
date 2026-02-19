// src/pages/coordinador/gestion-periodos-disponibilidad/utils/ui.js

export const monthNames = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
];

export const pad2 = (v) => String(v).padStart(2, "0");

export const fmtDate = (val) => {
  if (!val) return "—";
  try {
    // Si es string en formato YYYY-MM-DD, parsearlo directamente sin conversión de zona horaria
    if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val)) {
      const [anio, mes, dia] = val.split('-');
      return `${dia}/${mes}/${anio}`;
    }
    // Si tiene parte de tiempo (ISO datetime), extraer solo la fecha
    if (typeof val === 'string' && val.includes('T')) {
      const fechaPart = val.split('T')[0];
      const [anio, mes, dia] = fechaPart.split('-');
      return `${dia}/${mes}/${anio}`;
    }
    // Para otros formatos, usar Date (puede tener problemas de TZ)
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

export const getEstadoBadgeDefault = (estado) => {
  const badges = {
    BORRADOR: "bg-yellow-100 text-yellow-800 border-yellow-300",
    ACTIVO: "bg-green-100 text-green-800 border-green-300",
    CERRADO: "bg-red-100 text-red-800 border-red-300",
    ENVIADO: "bg-blue-100 text-blue-800 border-blue-300",
    REVISADO: "bg-purple-100 text-purple-800 border-purple-300",
    APROBADA: "bg-emerald-100 text-emerald-800 border-emerald-300",
    APROBADO: "bg-emerald-100 text-emerald-800 border-emerald-300",
    RECHAZADA: "bg-rose-100 text-rose-800 border-rose-300",
    RECHAZADO: "bg-rose-100 text-rose-800 border-rose-300",
    PENDIENTE: "bg-yellow-100 text-yellow-800 border-yellow-300",
    ASIGNADO: "bg-green-100 text-green-800 border-green-300",
    "NO PROCEDE": "bg-red-100 text-red-800 border-red-300",
  };
  return badges[estado] || "bg-gray-100 text-gray-800 border-gray-300";
};

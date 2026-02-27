// ========================================================================
// HistorialTimelineCard.jsx — Timeline clínico visual para chatbot CENATE
// ========================================================================
// v1.78.0 — Reemplaza la respuesta de texto con barras | por una tarjeta
// de timeline visual limpia. Se activa al clic en "Ver Historia" desde
// PatientRichCard, sin pasar por Claude.
//
// Props:
//   data    {PatientCardDTO}  — Misma estructura que usa PatientRichCard
//   onClose {() => void}      — Callback para cerrar/colapsar la vista
// ========================================================================

// ── Helpers ───────────────────────────────────────────────────────────────

/**
 * Formatea una fecha ISO a formato "10 MAR 2026".
 * Retorna "Sin fecha" si el valor es nulo o inválido.
 */
function formatearFecha(fechaIso) {
  if (!fechaIso) return 'Sin fecha';
  const fecha = new Date(fechaIso);
  if (isNaN(fecha.getTime())) return 'Sin fecha';
  return fecha
    .toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
    .toUpperCase()
    .replace('.', ''); // Elimina el punto que algunos locales añaden al mes
}

/**
 * Devuelve las clases Tailwind para el badge de estado.
 * Consistente con PatientRichCard.getBadgeEstado.
 */
function getBadgeClase(estado, activo, condicionMedica) {
  if (!activo) return 'bg-slate-100 text-slate-400';

  const estadoUpper = (estado || '').toUpperCase();
  const condicion = (condicionMedica || '').toLowerCase();

  if (estadoUpper === 'DESERTOR' || condicion.includes('deserci')) {
    return 'bg-orange-100 text-orange-700';
  }
  if (estadoUpper === 'ATENDIDO') return 'bg-green-100 text-green-700';
  if (estadoUpper === 'CITADO')   return 'bg-indigo-100 text-indigo-700';
  if (estadoUpper === 'PENDIENTE') return 'bg-blue-100 text-blue-700';
  return 'bg-slate-100 text-slate-600';
}

/**
 * Devuelve la etiqueta de texto del badge de estado.
 */
function getLabelEstado(estado, activo, condicionMedica) {
  if (!activo) return 'ARCHIVADO';
  const estadoUpper = (estado || '').toUpperCase();
  const condicion = (condicionMedica || '').toLowerCase();
  if (condicion.includes('deserci')) return 'DESERTOR';
  return estadoUpper || 'SIN ESTADO';
}

// ── Subcomponente: ítem individual del timeline ───────────────────────────

function TimelineItem({ registro }) {
  const { estado, especialidad, fechaAtencion, nombreMedico: medico, condicionMedica, activo } = registro;

  const badgeClase = getBadgeClase(estado, activo, condicionMedica);
  const labelEstado = getLabelEstado(estado, activo, condicionMedica);
  const fechaFormateada = formatearFecha(fechaAtencion);

  // Determina si la observación/condición tiene contenido significativo
  const condicionVisible =
    condicionMedica &&
    condicionMedica.trim().length > 0 &&
    condicionMedica.trim().toLowerCase() !== 'pendiente';

  // Estilos según estado activo/archivado
  const itemBg     = activo ? 'bg-white' : 'bg-slate-50';
  const borderLine = activo ? 'border-l-2 border-blue-400' : 'border-l-2 border-slate-300';
  const textoPrincipal  = activo ? 'text-slate-700' : 'text-slate-400';
  const textoSecundario = activo ? 'text-slate-600' : 'text-slate-400';
  const textoObservacion = activo ? 'text-slate-500' : 'text-slate-400';

  return (
    <div className={`flex gap-0 ${itemBg} rounded-r-lg mb-2 last:mb-0`}>
      {/* Línea vertical del timeline */}
      <div className={`${borderLine} shrink-0 ml-3`} aria-hidden="true" />

      {/* Contenido del ítem */}
      <div className="flex-1 min-w-0 px-3 py-2.5">
        {/* Fila superior: fecha + badge estado */}
        <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
          <span className={`text-[10px] font-mono ${textoSecundario}`}>
            {fechaFormateada}
          </span>
          <span
            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md shrink-0 ${badgeClase}`}
          >
            {labelEstado}
          </span>
        </div>

        {/* Especialidad */}
        <p className={`font-semibold text-xs leading-snug ${textoPrincipal}`}>
          {(especialidad || 'Sin especialidad').toUpperCase()}
        </p>

        {/* Profesional */}
        {medico && (
          <p className={`text-xs mt-0.5 ${textoSecundario}`}>
            Profesional: {medico}
          </p>
        )}

        {/* Observación / condición clínica */}
        {condicionVisible && (
          <p className={`text-xs italic mt-0.5 ${textoObservacion}`}>
            {condicionMedica}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────

/**
 * Tarjeta de timeline clínico para el chatbot CENATE.
 * Se renderiza en lugar de un mensaje de texto cuando el usuario
 * hace clic en "Ver Historia" desde PatientRichCard.
 *
 * @param {Object}   props
 * @param {Object}   props.data      — PatientCardDTO del backend
 * @param {Function} props.onClose   — Callback para cerrar la vista
 */
export default function HistorialTimelineCard({ data, onClose }) {
  // Guardia defensiva
  if (!data || !data.encontrado || !data.paciente) return null;

  const { paciente, registros = [], totalDeserciones = 0 } = data;
  const nombreMostrado = paciente.nombre || 'Nombre no disponible';
  const dniMostrado    = paciente.dni || '';

  return (
    <article
      className="bg-slate-50 border border-slate-200 border-t-4 border-t-[#0A5BA9] rounded-xl shadow-sm max-w-[95%] overflow-hidden text-left"
      aria-label={`Trazabilidad completa de ${nombreMostrado}`}
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="px-3 pt-3 pb-2 border-b border-slate-200">
        <p className="text-[10px] font-semibold text-[#0A5BA9] uppercase tracking-wide mb-0.5">
          Trazabilidad Completa
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-bold text-slate-800 text-sm leading-tight">
            {nombreMostrado}
          </p>
          <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-mono shrink-0">
            DNI {dniMostrado}
          </span>
        </div>
      </header>

      {/* ── Cuerpo: lista de registros en timeline ─────────────────────── */}
      <div className="px-0 pt-2 pb-1">
        {registros.length === 0 ? (
          <p className="text-xs text-slate-400 italic px-4 py-2">
            Sin registros históricos para este paciente.
          </p>
        ) : (
          registros.map((reg, idx) => (
            <TimelineItem key={idx} registro={reg} />
          ))
        )}
      </div>

      {/* ── Nota clínica de deserciones (solo si hay al menos 1) ──────── */}
      {totalDeserciones > 0 && (
        <div className="mx-3 mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
          <span className="font-semibold">Nota clínica: </span>
          {totalDeserciones === 1
            ? 'Paciente con 1 deserción registrada. Se recomienda confirmar disponibilidad antes de la cita.'
            : `Paciente con ${totalDeserciones} deserciones. Requiere seguimiento especial y confirmación previa.`}
        </div>
      )}

      {/* ── Pie: botón volver ──────────────────────────────────────────── */}
      <footer className="px-3 pb-3 pt-1 border-t border-slate-100">
        <button
          type="button"
          onClick={onClose}
          className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1 transition-colors"
          aria-label="Cerrar historial"
        >
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver
        </button>
      </footer>
    </article>
  );
}

// ========================================================================
// PatientRichCard.jsx — Tarjeta clínica enriquecida para chatbot CENATE
// ========================================================================
// v1.77.0 — Experiencia tipo WhatsApp clínico
// Props:
//   data       {PatientCardDTO}  — Datos del paciente desde el backend
//   onAction   {Function}        — Callback (tipo: string, payload: any)
//
// PatientCardDTO esperado:
//   encontrado          boolean
//   alertaSeveridad     'VERDE' | 'AMARILLA' | 'ROJA'
//   totalDeserciones    number
//   paciente            { dni, nombre, telefono, email, ... }
//   registros           RegistroInfo[]
//
// RegistroInfo esperado:
//   estado              string  (PENDIENTE | CITADO | ATENDIDO | DESERTOR)
//   especialidad        string
//   fechaAtencion       string
//   medico              string | null
//   condicionMedica     string | null
//   activo              boolean
// ========================================================================

// ── Helpers de color por estado ──────────────────────────────────────────

function getBadgeEstado(estado, activo, condicionMedica) {
  if (!activo) {
    return 'bg-slate-100 text-slate-500';
  }

  const estadoUpper = (estado || '').toUpperCase();
  const condicion = (condicionMedica || '').toLowerCase();

  if (estadoUpper === 'DESERTOR' || condicion.includes('deserci')) {
    return 'bg-orange-100 text-orange-700';
  }
  if (estadoUpper === 'ATENDIDO') {
    return 'bg-green-100 text-green-700';
  }
  if (estadoUpper === 'CITADO') {
    return 'bg-indigo-100 text-indigo-700';
  }
  if (estadoUpper === 'PENDIENTE') {
    return 'bg-blue-100 text-blue-700';
  }
  return 'bg-slate-100 text-slate-600';
}

function getBorderSeveridad(severidad) {
  switch ((severidad || '').toUpperCase()) {
    case 'ROJA':     return 'border-l-4 border-red-500';
    case 'AMARILLA': return 'border-l-4 border-yellow-400';
    default:         return 'border-l-4 border-green-400';
  }
}

function getLabelEstado(estado, activo, condicionMedica) {
  if (!activo) return 'ARCHIVADO';

  const estadoUpper = (estado || '').toUpperCase();
  const condicion = (condicionMedica || '').toLowerCase();

  if (condicion.includes('deserci')) return 'DESERTOR';
  return estadoUpper || 'SIN ESTADO';
}

// ── Iconos SVG inline (sin dependencias externas) ────────────────────────

function IconoTelefono({ className = 'w-3.5 h-3.5' }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
      />
    </svg>
  );
}

function IconoEmail({ className = 'w-3.5 h-3.5' }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
      />
    </svg>
  );
}

function IconoDocumento({ className = 'w-3.5 h-3.5' }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
      />
    </svg>
  );
}

function IconoCalendario({ className = 'w-3.5 h-3.5' }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
      />
    </svg>
  );
}

// ── Sección: Alerta de deserción ─────────────────────────────────────────

function AlertaDesercion({ total, severidad }) {
  if (!total || total <= 0) return null;

  const esRoja = (severidad || '').toUpperCase() === 'ROJA' || total >= 3;

  const estiloContenedor = esRoja
    ? 'bg-red-50 text-red-800 border border-red-200 rounded-lg px-3 py-2 text-xs flex items-start gap-1.5'
    : 'bg-yellow-50 text-yellow-800 border border-yellow-200 rounded-lg px-3 py-2 text-xs flex items-start gap-1.5';

  const icono = esRoja ? '🚨' : '⚠';
  const texto = esRoja
    ? `${total} deserciones — requiere seguimiento especial`
    : `${total} deserción registrada`;

  return (
    <div className={estiloContenedor} role="alert">
      <span className="shrink-0 leading-tight">{icono}</span>
      <span className="leading-tight font-medium">{texto}</span>
    </div>
  );
}

// ── Sección: Datos de contacto ───────────────────────────────────────────

function DatosContacto({ telefono, email }) {
  if (!telefono && !email) return null;

  return (
    <div className="bg-slate-50 rounded-lg px-3 py-2 text-sm flex flex-wrap gap-3">
      {telefono && (
        <span className="flex items-center gap-1.5 text-slate-600">
          <IconoTelefono className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-xs">{telefono}</span>
        </span>
      )}
      {email && (
        <span className="flex items-center gap-1.5 text-slate-600">
          <IconoEmail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-xs truncate max-w-[180px]">{email}</span>
        </span>
      )}
    </div>
  );
}

// ── Sección: Fila de registro ────────────────────────────────────────────

function FilaRegistro({ registro }) {
  const { estado, especialidad, fechaAtencion, nombreMedico: medico, condicionMedica, activo } = registro;

  const badgeClase = getBadgeEstado(estado, activo, condicionMedica);
  const labelEstado = getLabelEstado(estado, activo, condicionMedica);

  const textoEspecialidad = activo
    ? 'font-semibold text-slate-700 text-xs'
    : 'text-slate-400 text-xs';

  const textoPrincipal = activo ? 'text-slate-600' : 'text-slate-400';

  return (
    <div className="flex items-start gap-2 py-2 border-b border-slate-50 last:border-b-0">
      {/* Badge estado */}
      <span
        className={`shrink-0 mt-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${badgeClase}`}
      >
        {labelEstado}
      </span>

      {/* Datos del registro */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2 flex-wrap">
          <span className={textoEspecialidad}>
            {(especialidad || 'Sin especialidad').toUpperCase()}
          </span>
          {fechaAtencion && (
            <span className={`text-[10px] shrink-0 ${textoPrincipal}`}>
              {fechaAtencion}
            </span>
          )}
        </div>

        {medico && (
          <p className={`text-[10px] mt-0.5 ${textoPrincipal}`}>
            {medico}
          </p>
        )}

        {condicionMedica && (
          <p className="text-[10px] mt-0.5 text-slate-500 italic">
            Condición: {condicionMedica}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Sección: Lista de registros ──────────────────────────────────────────

function ListaRegistros({ registros }) {
  if (!registros || registros.length === 0) {
    return (
      <p className="text-xs text-slate-400 italic py-1">
        Sin registros encontrados
      </p>
    );
  }

  return (
    <div className="divide-y divide-slate-50">
      {registros.map((reg, idx) => (
        <FilaRegistro key={idx} registro={reg} />
      ))}
    </div>
  );
}

// ── Sección: Botones de acción ───────────────────────────────────────────

function BotonesAccion({ paciente, dniPaciente, onAction }) {
  return (
    <div className="flex flex-wrap gap-1.5 pt-1">
      <button
        type="button"
        onClick={() => onAction('contactar', paciente)}
        className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors"
      >
        <IconoTelefono className="w-3 h-3" />
        Contactar
      </button>

      <button
        type="button"
        onClick={() => onAction('historia', dniPaciente)}
        className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
      >
        <IconoDocumento className="w-3 h-3" />
        Ver Historia
      </button>

      <button
        type="button"
        onClick={() => onAction('reprogramar', dniPaciente)}
        className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-green-200 text-green-600 hover:bg-green-50 transition-colors"
      >
        <IconoCalendario className="w-3 h-3" />
        Reprogramar
      </button>
    </div>
  );
}

// ── Componente principal PatientRichCard ─────────────────────────────────

/**
 * Tarjeta clínica enriquecida para el chatbot CENATE.
 *
 * @param {Object}   props
 * @param {Object}   props.data      — PatientCardDTO del backend
 * @param {Function} props.onAction  — Callback (tipo: 'contactar'|'historia'|'reprogramar', payload)
 */
export default function PatientRichCard({ data, onAction }) {
  // Guardia defensiva: si no hay datos válidos, no renderizar nada
  if (!data || !data.encontrado) return null;

  const { paciente, registros, alertaSeveridad, totalDeserciones } = data;

  if (!paciente) return null;

  const borderSeveridad = getBorderSeveridad(alertaSeveridad);

  const handleAction = typeof onAction === 'function' ? onAction : () => {};

  return (
    <article
      className={`
        bg-white rounded-xl shadow-sm border border-slate-200
        ${borderSeveridad}
        max-w-[95%]
        p-3 space-y-2.5
        text-left
      `}
      aria-label={`Tarjeta clínica de ${paciente.nombre || paciente.dni}`}
    >
      {/* A) Header del paciente */}
      <header className="flex items-start gap-2 flex-wrap">
        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-800 text-sm leading-tight truncate">
            {paciente.nombre || 'Nombre no disponible'}
          </p>
        </div>
        <span className="shrink-0 text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-mono">
          DNI {paciente.dni}
        </span>
      </header>

      {/* B) Alerta de deserción */}
      <AlertaDesercion total={totalDeserciones} severidad={alertaSeveridad} />

      {/* C) Datos de contacto */}
      <DatosContacto telefono={paciente.telefono} email={paciente.email} />

      {/* D) Lista de registros */}
      <section aria-label="Registros clínicos">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">
          Registros
        </p>
        <ListaRegistros registros={registros} />
      </section>

      {/* E) Botones de acción */}
      <BotonesAccion
        paciente={paciente}
        dniPaciente={paciente.dni}
        onAction={handleAction}
      />
    </article>
  );
}

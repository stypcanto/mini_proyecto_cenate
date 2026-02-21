// ============================================================
// 📅 CitasAgendadas.jsx – Producción de citas gestionadas
// ============================================================
// v2.3 – Selección múltiple + Exportar seleccionados a Excel
// Módulo: Gestión de Citas | Ruta: /citas/citas-agendadas
// ============================================================

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { getToken } from "../../../constants/auth";
import {
  CalendarCheck,
  Search,
  RefreshCw,
  Clock,
  Phone,
  XCircle,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  MessageCircle,
  X,
  Send,
  Copy,
  SlidersHorizontal,
  User,
  CalendarDays,
  FileDown,
  CheckSquare,
} from "lucide-react";
import toast from "react-hot-toast";

// ── Constantes ────────────────────────────────────────────────
const ESTADOS_AGENDADOS = [
  'CITADO', 'YA_NO_REQUIERE', 'SIN_VIGENCIA', 'FALLECIDO', 'ATENDIDO_IPRESS',
  'HOSPITALIZADO', 'NO_IPRESS_CENATE', 'NUM_NO_EXISTE',
];

const BADGE = {
  CITADO:           { label: 'Citado',          bg: 'bg-blue-100',   text: 'text-blue-800',   dot: 'bg-blue-500'   },
  YA_NO_REQUIERE:   { label: 'Ya no requiere',  bg: 'bg-gray-100',   text: 'text-gray-600',   dot: 'bg-gray-400'   },
  SIN_VIGENCIA:     { label: 'Sin vigencia',     bg: 'bg-amber-100',  text: 'text-amber-800',  dot: 'bg-amber-400'  },
  FALLECIDO:        { label: 'Fallecido',        bg: 'bg-red-100',    text: 'text-red-700',    dot: 'bg-red-400'    },
  ATENDIDO_IPRESS:  { label: 'Atendido IPRESS',  bg: 'bg-green-100',  text: 'text-green-800',  dot: 'bg-green-500'  },
  HOSPITALIZADO:    { label: 'Hospitalizado',    bg: 'bg-purple-100', text: 'text-purple-800', dot: 'bg-purple-500' },
  NO_IPRESS_CENATE: { label: 'Otra IPRESS',      bg: 'bg-orange-100', text: 'text-orange-800', dot: 'bg-orange-400' },
  NUM_NO_EXISTE:    { label: 'Núm. no existe',   bg: 'bg-slate-100',  text: 'text-slate-700',  dot: 'bg-slate-400'  },
};

const KPI_CONFIG = [
  { key: 'total',            label: 'Total procesados',  accent: '#64748b', bg: '#f8fafc', border: '#e2e8f0'  },
  { key: 'CITADO',           label: 'Citados',           accent: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe'  },
  { key: 'ATENDIDO_IPRESS',  label: 'Atendidos IPRESS',  accent: '#10b981', bg: '#f0fdf4', border: '#bbf7d0'  },
  { key: 'YA_NO_REQUIERE',   label: 'Ya no requiere',    accent: '#94a3b8', bg: '#f8fafc', border: '#e2e8f0'  },
  { key: 'SIN_VIGENCIA',     label: 'Sin vigencia',      accent: '#f59e0b', bg: '#fffbeb', border: '#fde68a'  },
  { key: 'FALLECIDO',        label: 'Fallecidos',        accent: '#ef4444', bg: '#fef2f2', border: '#fecaca'  },
  { key: 'HOSPITALIZADO',    label: 'Hospitalizados',    accent: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe'  },
  { key: 'NO_IPRESS_CENATE', label: 'Otra IPRESS',       accent: '#ea580c', bg: '#fff7ed', border: '#fed7aa'  },
  { key: 'NUM_NO_EXISTE',    label: 'Núm. no existe',    accent: '#475569', bg: '#f8fafc', border: '#cbd5e1'  },
];

const PAGE_SIZE = 25;

const DIAS_SEMANA = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

// ── Helpers ───────────────────────────────────────────────────
const fmtFecha = (fecha) => {
  if (!fecha) return null;
  return new Date(fecha + 'T00:00:00').toLocaleDateString('es-PE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
};

const telNumero = (t) => (t || '').replace(/\D/g, '');

// ── KPI Card ─────────────────────────────────────────────────
function KpiCard({ label, valor, accent, bg, border, active, onClick }) {
  return (
    <div
      onClick={onClick}
      title={active ? `Quitar filtro "${label}"` : `Filtrar por "${label}"`}
      style={{
        background: active ? accent : bg,
        border: `2px solid ${active ? accent : border}`,
        borderLeft: `4px solid ${accent}`,
        borderRadius: '12px', padding: '14px 16px',
        display: 'flex', flexDirection: 'column', gap: '4px',
        minWidth: 0, cursor: 'pointer', transition: 'all 0.15s ease',
        boxShadow: active ? `0 4px 12px ${accent}40` : '0 1px 2px rgba(0,0,0,0.04)',
        transform: active ? 'translateY(-1px)' : 'none', userSelect: 'none',
      }}
    >
      <span style={{ fontSize: '11px', fontWeight: '600', color: active ? 'rgba(255,255,255,0.85)' : '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1.2 }}>
        {label}
      </span>
      <span style={{ fontSize: '32px', fontWeight: '800', lineHeight: 1, color: active ? '#fff' : accent }}>
        {valor}
      </span>
      {active && <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.75)', marginTop: '2px' }}>✕ clic para quitar filtro</span>}
    </div>
  );
}

// ── Calendario interactivo ────────────────────────────────────
function CalendarioCitas({ citasPorFecha, fechaSeleccionada, onSeleccionar }) {
  const hoy = new Date();
  const [vistaAnio, setVistaAnio]   = useState(fechaSeleccionada ? new Date(fechaSeleccionada + 'T00:00:00').getFullYear()  : hoy.getFullYear());
  const [vistaMes,  setVistaMes]    = useState(fechaSeleccionada ? new Date(fechaSeleccionada + 'T00:00:00').getMonth()     : hoy.getMonth());

  const irMesAnterior = () => {
    if (vistaMes === 0) { setVistaMes(11); setVistaAnio(v => v - 1); }
    else                { setVistaMes(v => v - 1); }
  };
  const irMesSiguiente = () => {
    if (vistaMes === 11) { setVistaMes(0); setVistaAnio(v => v + 1); }
    else                 { setVistaMes(v => v + 1); }
  };
  const irHoy = () => { setVistaAnio(hoy.getFullYear()); setVistaMes(hoy.getMonth()); };

  // Construir grilla del mes
  const diasMes = useMemo(() => {
    const primero  = new Date(vistaAnio, vistaMes, 1);
    const ultimo   = new Date(vistaAnio, vistaMes + 1, 0);
    const celdas   = [];
    // Relleno inicial (días del mes anterior)
    for (let i = 0; i < primero.getDay(); i++) celdas.push(null);
    for (let d = 1; d <= ultimo.getDate(); d++) celdas.push(d);
    return celdas;
  }, [vistaAnio, vistaMes]);

  const hoyStr = `${hoy.getFullYear()}-${String(hoy.getMonth()+1).padStart(2,'0')}-${String(hoy.getDate()).padStart(2,'0')}`;

  const maxCitas = useMemo(() => {
    let max = 0;
    Object.values(citasPorFecha).forEach(n => { if (n > max) max = n; });
    return max || 1;
  }, [citasPorFecha]);

  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px', minWidth: '280px', userSelect: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      {/* Cabecera del mes */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <button onClick={irMesAnterior} style={{ padding: '4px 8px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#475569' }}>
          <ChevronLeft size={15} />
        </button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>{MESES[vistaMes]} {vistaAnio}</div>
          <button onClick={irHoy} style={{ marginTop: '2px', fontSize: '10px', color: '#0D5BA9', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600', padding: 0 }}>
            Ir a hoy
          </button>
        </div>
        <button onClick={irMesSiguiente} style={{ padding: '4px 8px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#475569' }}>
          <ChevronRight size={15} />
        </button>
      </div>

      {/* Días de la semana */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '4px' }}>
        {DIAS_SEMANA.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: '10px', fontWeight: '700', color: '#94a3b8', padding: '2px 0', textTransform: 'uppercase' }}>{d}</div>
        ))}
      </div>

      {/* Celdas del mes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
        {diasMes.map((dia, i) => {
          if (!dia) return <div key={`empty-${i}`} />;

          const fechaKey = `${vistaAnio}-${String(vistaMes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
          const count    = citasPorFecha[fechaKey] || 0;
          const esHoy    = fechaKey === hoyStr;
          const esSel    = fechaKey === fechaSeleccionada;
          const tieneC   = count > 0;

          // Intensidad del color según cantidad relativa
          const intensidad = tieneC ? Math.max(0.15, count / maxCitas) : 0;
          const bgColor    = esSel
            ? '#0D5BA9'
            : tieneC
              ? `rgba(59, 130, 246, ${intensidad * 0.35})`
              : esHoy ? '#f0fdf4' : 'transparent';
          const txtColor   = esSel ? '#fff' : esHoy ? '#15803d' : tieneC ? '#1e40af' : '#374151';
          const border     = esSel ? '2px solid #0D5BA9' : esHoy ? '2px solid #16a34a' : tieneC ? '1px solid rgba(59,130,246,0.3)' : '1px solid transparent';

          return (
            <div
              key={fechaKey}
              onClick={() => onSeleccionar(esSel ? null : fechaKey)}
              title={tieneC ? `${count} cita${count !== 1 ? 's' : ''} el ${fmtFecha(fechaKey)}` : undefined}
              style={{
                borderRadius: '8px', padding: '4px 2px', textAlign: 'center', cursor: tieneC ? 'pointer' : 'default',
                background: bgColor, border, transition: 'all 0.1s ease',
                minHeight: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1px',
              }}
            >
              <span style={{ fontSize: '12px', fontWeight: esHoy || esSel ? '700' : '500', color: txtColor, lineHeight: 1 }}>{dia}</span>
              {tieneC && (
                <span style={{
                  fontSize: '9px', fontWeight: '700', lineHeight: 1,
                  color: esSel ? 'rgba(255,255,255,0.9)' : '#1d4ed8',
                  background: esSel ? 'rgba(255,255,255,0.25)' : 'rgba(59,130,246,0.15)',
                  borderRadius: '4px', padding: '1px 4px', marginTop: '1px',
                }}>
                  {count}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Leyenda */}
      <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', color: '#64748b' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'rgba(59,130,246,0.3)', border: '1px solid rgba(59,130,246,0.3)' }} />
          Con citas
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', color: '#64748b' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: '#0D5BA9' }} />
          Seleccionado
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', color: '#64748b' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '3px', border: '2px solid #16a34a', background: '#f0fdf4' }} />
          Hoy
        </div>
      </div>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────
export default function CitasAgendadas() {
  const [pacientes, setPacientes]           = useState([]);
  const [loading, setLoading]               = useState(true);
  const [busqueda, setBusqueda]             = useState('');
  const [filtroEstado, setFiltroEstado]     = useState(null);
  const [filtroIpress, setFiltroIpress]     = useState('');
  const [filtroEspec, setFiltroEspec]       = useState('');
  const [filtroMedico, setFiltroMedico]     = useState('');
  const [fechaSeleccionada, setFechaSelec]  = useState(null);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [pagina, setPagina]                 = useState(1);
  const [modalWA, setModalWA]               = useState({ visible: false, paciente: null, preview: '' });
  const [seleccionados, setSeleccionados]   = useState(new Set());

  // ── Carga ──────────────────────────────────────────────────
  const cargar = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch('/api/bolsas/solicitudes/mi-bandeja', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const solicitudes = data?.solicitudes || data?.content || [];

      const procesados = solicitudes
        .map(s => ({
          id:                      s.id_solicitud              || s.idSolicitud,
          pacienteNombre:          s.paciente_nombre           || s.pacienteNombre          || '—',
          pacienteDni:             s.paciente_dni              || s.pacienteDni             || '—',
          pacienteSexo:            s.paciente_sexo             || s.pacienteSexo            || null,
          pacienteEdad:            s.paciente_edad             || s.pacienteEdad            || null,
          pacienteTelefono:        s.paciente_telefono         || s.pacienteTelefono        || null,
          pacienteTelefonoAlterno: s.paciente_telefono_alterno || s.pacienteTelefonoAlterno || null,
          especialidad:            s.especialidad              || '—',
          codigoEstado:            s.cod_estado_cita           || s.codEstadoCita           || '—',
          fechaAtencion:           s.fecha_atencion            || s.fechaAtencion           || null,
          horaAtencion:            s.hora_atencion             || s.horaAtencion            || null,
          descIpress:              s.desc_ipress               || s.descIpress              || '—',
          tipoCita:                s.tipo_cita                 || s.tipoCita                || '—',
          nomMedico:               s.nombre_medico_asignado    || s.nombreMedicoAsignado    || s.nom_medico || s.nomMedico || null,
        }))
        .filter(p => ESTADOS_AGENDADOS.includes(p.codigoEstado));

      setPacientes(procesados);
    } catch (err) {
      console.error('Error cargando citas agendadas:', err);
      toast.error('No se pudieron cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { cargar(); }, []);

  // ── KPIs ───────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const counts = { total: pacientes.length };
    ESTADOS_AGENDADOS.forEach(e => { counts[e] = 0; });
    pacientes.forEach(p => { if (counts[p.codigoEstado] !== undefined) counts[p.codigoEstado]++; });
    return counts;
  }, [pacientes]);

  // ── Citas por fecha (para el calendario) ─────────────────
  const citasPorFecha = useMemo(() => {
    const mapa = {};
    pacientes.forEach(p => {
      if (p.fechaAtencion) {
        // Normalizar formato a YYYY-MM-DD
        const key = p.fechaAtencion.includes('T') ? p.fechaAtencion.split('T')[0] : p.fechaAtencion.substring(0, 10);
        mapa[key] = (mapa[key] || 0) + 1;
      }
    });
    return mapa;
  }, [pacientes]);

  // ── Listas dinámicas para filtros ─────────────────────────
  const listaIpress = useMemo(() => {
    const set = new Set(pacientes.map(p => p.descIpress).filter(v => v && v !== '—'));
    return Array.from(set).sort();
  }, [pacientes]);

  const listaEspec = useMemo(() => {
    const set = new Set(pacientes.map(p => p.especialidad).filter(v => v && v !== '—'));
    return Array.from(set).sort();
  }, [pacientes]);

  const listaMedicos = useMemo(() => {
    const set = new Set(pacientes.map(p => p.nomMedico).filter(Boolean));
    return Array.from(set).sort();
  }, [pacientes]);

  const hayFiltrosActivos = filtroIpress || filtroEspec || filtroMedico || fechaSeleccionada;

  const limpiarFiltros = () => {
    setFiltroIpress(''); setFiltroEspec(''); setFiltroMedico(''); setFechaSelec(null);
    setPagina(1);
  };

  // ── Filtrado ───────────────────────────────────────────────
  const filtrados = useMemo(() => {
    const q = busqueda.toLowerCase().trim();
    return pacientes.filter(p => {
      const matchBusqueda = !q || (p.pacienteDni || '').toLowerCase().includes(q) || (p.pacienteNombre || '').toLowerCase().includes(q);
      const matchEstado   = !filtroEstado || filtroEstado === 'total' || p.codigoEstado === filtroEstado;
      const matchIpress   = !filtroIpress || p.descIpress === filtroIpress;
      const matchEspec    = !filtroEspec  || p.especialidad === filtroEspec;
      const matchMedico   = !filtroMedico || p.nomMedico === filtroMedico;
      const matchFecha    = !fechaSeleccionada || (p.fechaAtencion && (
        p.fechaAtencion.includes('T')
          ? p.fechaAtencion.split('T')[0] === fechaSeleccionada
          : p.fechaAtencion.substring(0, 10) === fechaSeleccionada
      ));
      return matchBusqueda && matchEstado && matchIpress && matchEspec && matchMedico && matchFecha;
    });
  }, [pacientes, busqueda, filtroEstado, filtroIpress, filtroEspec, filtroMedico, fechaSeleccionada]);

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / PAGE_SIZE));
  const paginaActual = filtrados.slice((pagina - 1) * PAGE_SIZE, pagina * PAGE_SIZE);

  const handleBusqueda     = (v) => { setBusqueda(v); setPagina(1); };
  const handleFiltroEstado = (key) => { setFiltroEstado(prev => prev === key ? null : key); setPagina(1); };
  const handleFiltro       = (set) => (v) => { set(v); setPagina(1); };
  const handleFechaCalend  = useCallback((fecha) => { setFechaSelec(fecha); setPagina(1); }, []);

  // ── Selección múltiple ─────────────────────────────────────
  const todosSeleccionados = paginaActual.length > 0 && paginaActual.every(p => seleccionados.has(p.id ?? p.pacienteDni));
  const algunoSeleccionado = paginaActual.some(p => seleccionados.has(p.id ?? p.pacienteDni));

  const toggleFila = (p) => {
    const key = p.id ?? p.pacienteDni;
    setSeleccionados(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const toggleTodosEnPagina = () => {
    setSeleccionados(prev => {
      const next = new Set(prev);
      if (todosSeleccionados) {
        paginaActual.forEach(p => next.delete(p.id ?? p.pacienteDni));
      } else {
        paginaActual.forEach(p => next.add(p.id ?? p.pacienteDni));
      }
      return next;
    });
  };

  const seleccionarTodosLosFiltrados = () => {
    setSeleccionados(new Set(filtrados.map(p => p.id ?? p.pacienteDni)));
    toast.success(`${filtrados.length} filas seleccionadas`);
  };

  const limpiarSeleccion = () => setSeleccionados(new Set());

  const filasSeleccionadas = useMemo(
    () => filtrados.filter(p => seleccionados.has(p.id ?? p.pacienteDni)),
    [filtrados, seleccionados]
  );

  // ── Exportar seleccionados a Excel (CSV) ───────────────────
  const exportarExcel = () => {
    if (filasSeleccionadas.length === 0) { toast.error('Selecciona al menos una fila'); return; }
    const headers = ['N°','Paciente','DNI','Sexo','Edad','Teléfono','Teléfono Alt.','Prof. de Salud','Especialidad','Fecha Cita','Hora Cita','IPRESS','Tipo Cita','Estado'];
    const BADGE_LABEL = Object.fromEntries(Object.entries(BADGE).map(([k, v]) => [k, v.label]));
    const filas = filasSeleccionadas.map((p, i) => [
      i + 1,
      p.pacienteNombre,
      p.pacienteDni,
      p.pacienteSexo || '',
      p.pacienteEdad || '',
      p.pacienteTelefono || '',
      p.pacienteTelefonoAlterno || '',
      p.nomMedico || '',
      p.especialidad,
      p.fechaAtencion ? fmtFecha(p.fechaAtencion) : '',
      p.horaAtencion ? p.horaAtencion.substring(0, 5) : '',
      p.descIpress,
      p.tipoCita,
      BADGE_LABEL[p.codigoEstado] || p.codigoEstado,
    ]);
    const bom = '\uFEFF';
    const csv = bom + [headers, ...filas].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `citas-agendadas-${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 100);
    toast.success(`${filasSeleccionadas.length} filas exportadas a Excel`);
  };

  // ── WhatsApp ───────────────────────────────────────────────
  const generarMensaje = (p) => {
    let fechaObj = new Date(p.fechaAtencion);
    if (typeof p.fechaAtencion === 'string' && p.fechaAtencion.includes('-')) fechaObj.setDate(fechaObj.getDate() + 1);
    const dia = String(fechaObj.getDate()).padStart(2, '0');
    const mes = String(fechaObj.getMonth() + 1).padStart(2, '0');
    const año = String(fechaObj.getFullYear()).slice(-2);
    const hora = p.horaAtencion?.substring(0, 5) || '--:--';
    const [h, m] = hora.split(':').map(Number);
    const horaFin = `${String(h + Math.floor((m + 55) / 60)).padStart(2, '0')}:${String((m + 55) % 60).padStart(2, '0')}`;
    const medico = p.nomMedico || 'Por asignar';

    return `Estimado asegurado(a): ${p.pacienteNombre}
Recuerde estar pendiente 30 minutos antes de su cita virtual:

👩🏻 MEDICO/LICENCIADO: ${medico}
⚕️ ESPECIALIDAD: ${p.especialidad || 'No especificada'}
🗓️ DIA: ${dia}/${mes}/${año}
⏰ HORA REFERENCIAL: ${hora} a ${horaFin}

IMPORTANTE: Usted va a ser atendido por el Centro Nacional de Telemedicina (CENATE) - ESSALUD, por su seguridad las atenciones están siendo grabadas.
*Usted autoriza el tratamiento de sus datos personales afines a su atención por Telemedicina.
*Recuerde que se le llamará hasta 24 horas antes para confirmar su cita.
*Recuerde estar pendiente media hora antes de su cita.

El profesional se comunicará con usted a través del siguiente número: 01 2118830

Atte. Centro Nacional de Telemedicina
CENATE de Essalud`;
  };

  const abrirModalWA = (p) => {
    if (!p.fechaAtencion || !p.horaAtencion) { toast.error('El paciente debe tener fecha y hora de cita agendada'); return; }
    setModalWA({ visible: true, paciente: p, preview: generarMensaje(p) });
  };

  const enviarWA = () => {
    const { paciente, preview } = modalWA;
    if (!paciente?.pacienteTelefono) { toast.error('El paciente no tiene teléfono registrado'); return; }
    let tel = telNumero(paciente.pacienteTelefono);
    if (!tel.startsWith('51')) tel = '51' + (tel.length === 10 ? tel.substring(1) : tel);
    window.open(`https://wa.me/${tel}?text=${encodeURIComponent(preview)}`, '_blank');
    setModalWA(prev => ({ ...prev, visible: false }));
    toast.success('Mensaje enviado por WhatsApp');
  };

  const copiarMensaje = () => {
    navigator.clipboard.writeText(modalWA.preview).then(() => toast.success('Mensaje copiado al portapapeles'));
  };

  // ── Render ─────────────────────────────────────────────────
  return (
    <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Encabezado */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '10px', background: '#0D5BA9', borderRadius: '12px', display: 'flex' }}>
            <TrendingUp size={22} color="white" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#0f172a' }}>Citas Agendadas</h1>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
              Producción de citas gestionadas
              {!loading && <span style={{ marginLeft: '6px', fontWeight: '600', color: '#0D5BA9' }}>· {pacientes.length} paciente{pacientes.length !== 1 ? 's' : ''} procesados</span>}
            </p>
          </div>
        </div>
        <button
          onClick={cargar}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', color: '#475569', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Actualizar
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
        {KPI_CONFIG.map(k => (
          <KpiCard key={k.key} label={k.label} valor={kpis[k.key] ?? 0} accent={k.accent} bg={k.bg} border={k.border} active={filtroEstado === k.key} onClick={() => handleFiltroEstado(k.key)} />
        ))}
      </div>

      {/* Chip filtro estado */}
      {filtroEstado && filtroEstado !== 'total' && (() => {
        const kpi = KPI_CONFIG.find(k => k.key === filtroEstado);
        return kpi ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Filtrando por:</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '3px 10px 3px 12px', background: kpi.accent, color: '#fff', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
              {kpi.label}
              <button onClick={() => handleFiltroEstado(filtroEstado)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', display: 'flex', padding: 0, opacity: 0.8 }}><XCircle size={14} /></button>
            </span>
          </div>
        ) : null;
      })()}

      {/* ── Layout: Calendario + Tabla ── */}
      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>

        {/* Columna izquierda: Calendario */}
        <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
            <CalendarDays size={15} color="#0D5BA9" />
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Calendario de Citas</span>
          </div>
          <CalendarioCitas
            citasPorFecha={citasPorFecha}
            fechaSeleccionada={fechaSeleccionada}
            onSeleccionar={handleFechaCalend}
          />
          {fechaSeleccionada && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px' }}>
              <CalendarDays size={14} color="#1d4ed8" />
              <span style={{ fontSize: '12px', fontWeight: '600', color: '#1d4ed8', flex: 1 }}>
                {fmtFecha(fechaSeleccionada)} · {citasPorFecha[fechaSeleccionada] || 0} citas
              </span>
              <button onClick={() => handleFechaCalend(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', color: '#93c5fd', padding: 0 }}>
                <X size={14} />
              </button>
            </div>
          )}
        </div>

        {/* Columna derecha: Búsqueda + Filtros + Tabla */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Buscador + toggle filtros */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: '1', minWidth: '220px', maxWidth: '360px' }}>
              <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text" value={busqueda} onChange={e => handleBusqueda(e.target.value)}
                placeholder="Buscar por DNI o nombre..."
                style={{ width: '100%', boxSizing: 'border-box', paddingLeft: '36px', paddingRight: busqueda ? '32px' : '12px', paddingTop: '9px', paddingBottom: '9px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '13px', color: '#374151', outline: 'none' }}
              />
              {busqueda && (
                <button onClick={() => handleBusqueda('')} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex' }}>
                  <XCircle size={15} />
                </button>
              )}
            </div>

            <button
              onClick={() => setMostrarFiltros(v => !v)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 14px', borderRadius: '8px', border: `1px solid ${mostrarFiltros || hayFiltrosActivos ? '#0D5BA9' : '#d1d5db'}`, background: mostrarFiltros || hayFiltrosActivos ? '#eff6ff' : '#fff', color: mostrarFiltros || hayFiltrosActivos ? '#0D5BA9' : '#475569', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}
            >
              <SlidersHorizontal size={15} />
              Filtros
              {hayFiltrosActivos && (
                <span style={{ background: '#0D5BA9', color: '#fff', borderRadius: '10px', padding: '1px 7px', fontSize: '11px', fontWeight: '700' }}>
                  {[filtroIpress, filtroEspec, filtroMedico, fechaSeleccionada].filter(Boolean).length}
                </span>
              )}
            </button>

            {hayFiltrosActivos && (
              <button onClick={limpiarFiltros} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '9px 12px', borderRadius: '8px', border: '1px solid #fca5a5', background: '#fff', color: '#dc2626', fontSize: '12px', fontWeight: '500', cursor: 'pointer' }}>
                <XCircle size={13} /> Limpiar filtros
              </button>
            )}
          </div>

          {/* Panel de filtros */}
          {mostrarFiltros && (
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>IPRESS</label>
                <select value={filtroIpress} onChange={e => handleFiltro(setFiltroIpress)(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '13px', color: '#374151', background: '#fff', outline: 'none', cursor: 'pointer' }}>
                  <option value="">Todas las IPRESS</option>
                  {listaIpress.map(ip => <option key={ip} value={ip}>{ip}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Especialidad</label>
                <select value={filtroEspec} onChange={e => handleFiltro(setFiltroEspec)(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '13px', color: '#374151', background: '#fff', outline: 'none', cursor: 'pointer' }}>
                  <option value="">Todas las especialidades</option>
                  {listaEspec.map(es => <option key={es} value={es}>{es}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                  <User size={11} /> Profesional de Salud
                </label>
                <select value={filtroMedico} onChange={e => handleFiltro(setFiltroMedico)(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '13px', color: '#374151', background: '#fff', outline: 'none', cursor: 'pointer' }}>
                  <option value="">Todos los profesionales</option>
                  {listaMedicos.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* Tabla */}
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            {/* Barra de selección */}
            <div style={{ padding: '10px 16px', borderBottom: '1px solid #f1f5f9', background: seleccionados.size > 0 ? '#eff6ff' : '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', transition: 'background 0.2s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>
                  {filtrados.length} resultado{filtrados.length !== 1 ? 's' : ''}
                  {fechaSeleccionada && <span style={{ marginLeft: '8px', fontSize: '11px', color: '#0D5BA9', fontWeight: '600' }}>· {fmtFecha(fechaSeleccionada)}</span>}
                </span>
                {seleccionados.size > 0 && (
                  <>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#0D5BA9', background: '#dbeafe', padding: '2px 10px', borderRadius: '12px' }}>
                      {seleccionados.size} seleccionado{seleccionados.size !== 1 ? 's' : ''}
                    </span>
                    {seleccionados.size < filtrados.length && (
                      <button onClick={seleccionarTodosLosFiltrados} style={{ fontSize: '11px', color: '#0D5BA9', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}>
                        Seleccionar todos ({filtrados.length})
                      </button>
                    )}
                    <button onClick={limpiarSeleccion} style={{ fontSize: '11px', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', padding: 0 }}>
                      <X size={12} /> Quitar selección
                    </button>
                  </>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {totalPaginas > 1 && <span style={{ fontSize: '12px', color: '#94a3b8' }}>Página {pagina} de {totalPaginas}</span>}
                <button
                  onClick={exportarExcel}
                  disabled={seleccionados.size === 0}
                  title={seleccionados.size === 0 ? 'Selecciona filas para exportar' : `Exportar ${seleccionados.size} fila${seleccionados.size !== 1 ? 's' : ''} a Excel`}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '8px', border: '1px solid ' + (seleccionados.size > 0 ? '#16a34a' : '#e2e8f0'), background: seleccionados.size > 0 ? '#16a34a' : '#fff', color: seleccionados.size > 0 ? '#fff' : '#cbd5e1', fontSize: '12px', fontWeight: '600', cursor: seleccionados.size > 0 ? 'pointer' : 'not-allowed', transition: 'all 0.15s' }}
                >
                  <FileDown size={14} />
                  Exportar{seleccionados.size > 0 ? ` (${seleccionados.size})` : ''}
                </button>
              </div>
            </div>

            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '64px', gap: '10px', color: '#94a3b8' }}>
                <RefreshCw size={18} className="animate-spin" /><span style={{ fontSize: '14px' }}>Cargando producción...</span>
              </div>
            ) : paginaActual.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px', gap: '8px', color: '#94a3b8' }}>
                <CalendarCheck size={36} style={{ opacity: 0.25 }} />
                <p style={{ margin: 0, fontSize: '14px' }}>{busqueda ? 'Sin resultados para esa búsqueda' : 'Sin pacientes procesados aún'}</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#0D5BA9' }}>
                      {/* Checkbox cabecera */}
                      <th style={{ padding: '10px 12px', width: '40px', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={todosSeleccionados}
                          ref={el => { if (el) el.indeterminate = algunoSeleccionado && !todosSeleccionados; }}
                          onChange={toggleTodosEnPagina}
                          title={todosSeleccionados ? 'Deseleccionar página' : 'Seleccionar página'}
                          style={{ width: '15px', height: '15px', cursor: 'pointer', accentColor: '#fff' }}
                        />
                      </th>
                      {['Paciente', 'DNI', 'Teléfono', 'Prof. de Salud', 'Especialidad', 'Fecha / Hora Cita', 'IPRESS', 'Estado', 'Acc.'].map((h, i) => (
                        <th key={h} style={{ padding: '10px 12px', textAlign: i === 8 ? 'center' : 'left', fontSize: '10px', fontWeight: '700', color: '#e0f2fe', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap', width: i === 8 ? '52px' : 'auto' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginaActual.map((p, idx) => {
                      const badge    = BADGE[p.codigoEstado] || { label: p.codigoEstado, bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' };
                      const rowBg    = idx % 2 === 0 ? '#ffffff' : '#f9fafb';
                      const esCitado = p.codigoEstado === 'CITADO';
                      const key      = p.id ?? p.pacienteDni;
                      const esSel    = seleccionados.has(key);

                      return (
                        <tr key={p.id || idx} style={{ background: esSel ? '#eff6ff' : rowBg, borderBottom: '1px solid #f1f5f9', outline: esSel ? '1px solid #bfdbfe' : 'none' }} onMouseEnter={e => { if (!esSel) e.currentTarget.style.background = '#f8fafc'; }} onMouseLeave={e => { if (!esSel) e.currentTarget.style.background = rowBg; }}>
                          <td style={{ padding: '10px 12px', textAlign: 'center', width: '40px' }}>
                            <input
                              type="checkbox"
                              checked={esSel}
                              onChange={() => toggleFila(p)}
                              style={{ width: '15px', height: '15px', cursor: 'pointer', accentColor: '#0D5BA9' }}
                            />
                          </td>

                          <td style={{ padding: '10px 12px', minWidth: '150px' }}>
                            <div style={{ fontWeight: '600', color: '#0f172a', fontSize: '13px' }}>{p.pacienteNombre}</div>
                            {(p.pacienteSexo || p.pacienteEdad) && (
                              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                                {[p.pacienteSexo, p.pacienteEdad ? `${p.pacienteEdad} años` : null].filter(Boolean).join(' · ')}
                              </div>
                            )}
                          </td>

                          <td style={{ padding: '10px 12px' }}>
                            <span style={{ fontFamily: 'monospace', fontWeight: '700', color: '#1d4ed8', background: '#eff6ff', padding: '2px 8px', borderRadius: '6px', fontSize: '13px' }}>{p.pacienteDni}</span>
                          </td>

                          <td style={{ padding: '10px 12px', minWidth: '120px' }}>
                            {p.pacienteTelefono ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                <a href={`https://wa.me/${telNumero(p.pacienteTelefono)}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#15803d', fontWeight: '600', fontSize: '12px', textDecoration: 'none' }}>
                                  <Phone size={12} />{p.pacienteTelefono}
                                </a>
                                {p.pacienteTelefonoAlterno && (
                                  <a href={`https://wa.me/${telNumero(p.pacienteTelefonoAlterno)}`} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#16a34a', fontSize: '11px', textDecoration: 'none', opacity: 0.8 }}>
                                    <Phone size={11} />{p.pacienteTelefonoAlterno}
                                  </a>
                                )}
                              </div>
                            ) : <span style={{ color: '#d1d5db', fontSize: '12px' }}>—</span>}
                          </td>

                          {/* PROF. DE SALUD */}
                          <td style={{ padding: '10px 12px', minWidth: '140px' }}>
                            {p.nomMedico ? (
                              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                                <span style={{ flexShrink: 0, marginTop: '1px', width: '20px', height: '20px', borderRadius: '50%', background: '#dbeafe', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: '700', color: '#1d4ed8' }}>
                                  {p.nomMedico.charAt(0).toUpperCase()}
                                </span>
                                <span style={{ fontSize: '12px', color: '#1e293b', fontWeight: '500', lineHeight: '1.3' }}>
                                  {p.nomMedico}
                                </span>
                              </div>
                            ) : (
                              <span style={{ fontSize: '11px', color: '#cbd5e1', fontStyle: 'italic' }}>Sin asignar</span>
                            )}
                          </td>

                          <td style={{ padding: '10px 12px', color: '#475569', fontSize: '12px' }}>{p.especialidad}</td>

                          <td style={{ padding: '10px 12px' }}>
                            {p.fechaAtencion ? (
                              <div>
                                <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '13px' }}>{fmtFecha(p.fechaAtencion)}</div>
                                {p.horaAtencion && <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#64748b', fontSize: '11px', marginTop: '2px' }}><Clock size={11} />{p.horaAtencion.substring(0, 5)}</div>}
                              </div>
                            ) : <span style={{ color: '#d1d5db', fontSize: '12px' }}>—</span>}
                          </td>

                          <td style={{ padding: '10px 12px', color: '#475569', fontSize: '12px', maxWidth: '160px' }}>
                            <span title={p.descIpress} style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.descIpress}</span>
                          </td>

                          <td style={{ padding: '10px 12px' }}>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${badge.bg} ${badge.text}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />{badge.label}
                            </span>
                          </td>

                          {/* ACCIONES */}
                          <td style={{ padding: '10px 12px', textAlign: 'center', width: '52px' }}>
                            {esCitado && (
                              <button
                                onClick={() => abrirModalWA(p)}
                                title="Enviar mensaje de cita por WhatsApp"
                                style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '8px', background: '#7c3aed', border: 'none', cursor: 'pointer', color: '#fff', transition: 'background 0.15s' }}
                                onMouseEnter={e => e.currentTarget.style.background = '#6d28d9'}
                                onMouseLeave={e => e.currentTarget.style.background = '#7c3aed'}
                              >
                                <MessageCircle size={15} strokeWidth={2} />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Paginación */}
            {totalPaginas > 1 && (
              <div style={{ padding: '10px 16px', borderTop: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <button onClick={() => setPagina(p => Math.max(1, p - 1))} disabled={pagina === 1} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '13px', color: '#475569', cursor: pagina === 1 ? 'not-allowed' : 'pointer', opacity: pagina === 1 ? 0.4 : 1 }}>
                  <ChevronLeft size={15} /> Anterior
                </button>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                    const pg = Math.min(Math.max(pagina - 2, 1) + i, totalPaginas);
                    return <button key={pg} onClick={() => setPagina(pg)} style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid ' + (pg === pagina ? '#0D5BA9' : '#e2e8f0'), background: pg === pagina ? '#0D5BA9' : '#fff', color: pg === pagina ? '#fff' : '#64748b', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>{pg}</button>;
                  })}
                </div>
                <button onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))} disabled={pagina === totalPaginas} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '13px', color: '#475569', cursor: pagina === totalPaginas ? 'not-allowed' : 'pointer', opacity: pagina === totalPaginas ? 0.4 : 1 }}>
                  Siguiente <ChevronRight size={15} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Modal WhatsApp ── */}
      {modalWA.visible && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
          onClick={e => { if (e.target === e.currentTarget) setModalWA(prev => ({ ...prev, visible: false })); }}
        >
          <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '560px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', overflow: 'hidden' }}>
            <div style={{ background: '#7c3aed', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <MessageCircle size={20} color="#fff" strokeWidth={2} />
                <div>
                  <p style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#fff' }}>Enviar por WhatsApp</p>
                  <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.75)' }}>
                    {modalWA.paciente?.pacienteNombre} · DNI {modalWA.paciente?.pacienteDni}
                  </p>
                </div>
              </div>
              <button onClick={() => setModalWA(prev => ({ ...prev, visible: false }))} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', display: 'flex', color: '#fff' }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: '16px 20px' }}>
              <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vista previa del mensaje</p>
              <textarea
                readOnly value={modalWA.preview}
                style={{ width: '100%', boxSizing: 'border-box', minHeight: '220px', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '12px', lineHeight: '1.6', color: '#374151', background: '#f9fafb', resize: 'vertical', outline: 'none', fontFamily: 'inherit' }}
              />
            </div>
            <div style={{ padding: '12px 20px 16px', display: 'flex', gap: '10px', borderTop: '1px solid #f1f5f9' }}>
              <button onClick={copiarMensaje} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#475569', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>
                <Copy size={15} /> Copiar
              </button>
              <button onClick={enviarWA} style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', borderRadius: '10px', border: 'none', background: '#16a34a', color: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                <Send size={15} /> Enviar por WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

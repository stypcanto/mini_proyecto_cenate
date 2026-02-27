/**
 * DashboardCoordinadorTeleurgencias.jsx
 * Vista "Total Pacientes Teleurgencias" — distribución por médico
 * v1.79.0 — Patrón enfermería: tabla + drawer + filtros fecha/turno + reasignación masiva
 *
 * Acceso: COORDINADOR_MEDICO_TELEURGENCIAS / COORDINADOR
 * Datos: GET /api/gestion-pacientes/coordinador/teleurgencias/estadisticas/por-medico
 *        GET /api/gestion-pacientes/coordinador/teleurgencias/pacientes/por-medico
 *        GET /api/gestion-pacientes/coordinador/teleurgencias/medicos
 *        PUT /api/gestion-pacientes/coordinador/teleurgencias/reasignar-masivo
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import teleurgenciasService from '../../../../services/teleurgenciasService';
import * as XLSX from 'xlsx';
import {
  Users, RefreshCw, Calendar, Search, ArrowUp, ArrowDown, ArrowUpDown,
  Stethoscope, ChevronDown, Loader2, ArrowRightLeft, X, XCircle, AlertCircle,
  CheckCircle2, Clock, ChevronLeft, ChevronRight, Filter, Download, Activity,
} from 'lucide-react';

// ── Estados de condición médica ───────────────────────────────
const ESTADOS = [
  { key: 'pendientes', label: 'Pendiente',  accent: '#f59e0b', bg: '#fffbeb', border: '#fde68a' },
  { key: 'atendidos',  label: 'Atendido',   accent: '#10b981', bg: '#f0fdf4', border: '#bbf7d0' },
  { key: 'desercion',  label: 'Deserción',  accent: '#ef4444', bg: '#fef2f2', border: '#fecaca' },
];

// ── Helpers ───────────────────────────────────────────────────
const n  = (v) => Number(v) || 0;
const _hoy = new Date();
const HOY = `${_hoy.getFullYear()}-${String(_hoy.getMonth()+1).padStart(2,'0')}-${String(_hoy.getDate()).padStart(2,'0')}`;

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MESES_ES   = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

// ── Botón de ordenamiento ────────────────────────────────────
function SortBtn({ label, col, sortCol, sortDir, onSort }) {
  const active = sortCol === col;
  const Icon   = active ? (sortDir === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown;
  return (
    <button
      onClick={() => onSort(col)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '5px',
        background: active ? 'rgba(255,255,255,0.18)' : 'transparent',
        border: active ? '1px solid rgba(255,255,255,0.35)' : '1px solid transparent',
        borderRadius: '5px', cursor: 'pointer', color: '#fff',
        fontWeight: '700', fontSize: '10px', textTransform: 'uppercase',
        letterSpacing: '0.06em', padding: '3px 6px', transition: 'all 0.15s',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
      <Icon size={11} strokeWidth={active ? 2.5 : 1.8} style={{ opacity: active ? 1 : 0.45 }} />
    </button>
  );
}

// ── Badge ────────────────────────────────────────────────────
function Badge({ valor, accent, bg }) {
  if (!valor) return <span style={{ color: '#e2e8f0', fontSize: '12px' }}>—</span>;
  return (
    <span style={{
      display: 'inline-block', padding: '2px 10px', borderRadius: '20px',
      background: bg, color: accent, fontWeight: '700', fontSize: '12px',
    }}>
      {n(valor).toLocaleString()}
    </span>
  );
}

// ── Selector calendario de fecha ─────────────────────────────
function SelectorFecha({ fecha, onChange, diasConDatos = {}, maxBadge = 999, popupZIndex = 50 }) {
  const [abierto, setAbierto] = useState(false);
  const [anio, setAnio]       = useState(new Date().getFullYear());
  const [mes, setMes]         = useState(new Date().getMonth());
  const ref                   = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setAbierto(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const primerDia = new Date(anio, mes, 1).getDay();
  const diasEnMes = new Date(anio, mes + 1, 0).getDate();
  const padDia    = (d) => String(d).padStart(2, '0');
  const padMes    = (m) => String(m + 1).padStart(2, '0');

  const irAtras = () => {
    if (mes === 0) { setMes(11); setAnio(a => a - 1); }
    else setMes(m => m - 1);
  };
  const irAdelante = () => {
    if (mes === 11) { setMes(0); setAnio(a => a + 1); }
    else setMes(m => m + 1);
  };

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setAbierto(v => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '6px 14px', borderRadius: '8px', cursor: 'pointer',
          border: `1.5px solid ${abierto || fecha ? '#1d4ed8' : '#cbd5e1'}`,
          background: abierto || fecha ? '#eff6ff' : '#f8fafc',
          color: fecha ? '#1d4ed8' : '#475569',
          fontSize: '13px', fontWeight: '600', transition: 'all 0.15s',
        }}
      >
        <Calendar size={14} color={fecha ? '#1d4ed8' : '#64748b'} />
        {fecha || 'Seleccionar fecha'}
        <ChevronRight size={14} style={{ transform: abierto ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', color: '#94a3b8' }} />
      </button>

      {abierto && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', left: 0, zIndex: popupZIndex,
          background: '#fff', border: '1.5px solid #1d4ed8', borderRadius: '12px',
          overflow: 'hidden', minWidth: '280px', boxShadow: '0 4px 16px rgba(29,78,216,0.12)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#eff6ff', borderBottom: '1px solid #bfdbfe' }}>
            <button onClick={irAtras} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px', display: 'flex', color: '#1d4ed8' }}>
              <ChevronLeft size={18} />
            </button>
            <span style={{ fontWeight: '700', fontSize: '14px', color: '#1e3a5f' }}>
              {MESES_ES[mes]} {anio}
            </span>
            <button onClick={irAdelante} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px', display: 'flex', color: '#1d4ed8' }}>
              <ChevronRight size={18} />
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '8px 8px 0', gap: '2px' }}>
            {DIAS_SEMANA.map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: '10px', fontWeight: '700', color: '#94a3b8', padding: '2px 0' }}>{d}</div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '4px 8px 10px', gap: '2px' }}>
            {Array.from({ length: primerDia }, (_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: diasEnMes }, (_, idx) => {
              const dia        = idx + 1;
              const fechaStr   = `${anio}-${padMes(mes)}-${padDia(dia)}`;
              const esHoy      = fechaStr === HOY;
              const activo     = fechaStr === fecha;
              const totalDia   = diasConDatos[fechaStr];
              const tieneDatos = !!totalDia;
              return (
                <button
                  key={fechaStr}
                  onClick={() => { onChange(activo ? null : fechaStr); setAbierto(false); }}
                  title={tieneDatos ? `${totalDia} pacientes` : undefined}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    padding: '3px 2px', borderRadius: '8px', minHeight: '38px', cursor: 'pointer',
                    border: esHoy ? '2px solid #1d4ed8' : '2px solid transparent',
                    background: activo ? '#1d4ed8' : tieneDatos ? '#eff6ff' : 'transparent',
                    color: activo ? '#fff' : '#1e293b', transition: 'all 0.1s',
                  }}
                >
                  <span style={{ fontSize: '12px', fontWeight: (esHoy || activo || tieneDatos) ? '800' : '400', lineHeight: 1 }}>{dia}</span>
                  {tieneDatos && (
                    <span style={{
                      fontSize: '9px', fontWeight: '700', lineHeight: 1, marginTop: '2px',
                      color: activo ? '#bfdbfe' : '#1d4ed8',
                    }}>
                      {totalDia > maxBadge ? `${maxBadge}+` : totalDia}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {fecha && (
            <div style={{ padding: '0 8px 10px', textAlign: 'center' }}>
              <button
                onClick={() => { onChange(null); setAbierto(false); }}
                style={{ fontSize: '11px', color: '#1d4ed8', background: 'none', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '4px 12px', cursor: 'pointer', fontWeight: '600' }}
              >
                Ver todas las fechas
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Autocomplete para médico destino ──────────────────────────
function AutocompleteMedico({ medicos, value, onChange, placeholder }) {
  const [texto, setTexto]       = useState('');
  const [abierto, setAbierto]   = useState(false);
  const [iniciado, setIniciado] = useState(false);
  const ref                     = useRef(null);

  useEffect(() => {
    if (!value) { setTexto(''); setIniciado(false); return; }
    const found = medicos.find(m => String(m.idPersonal) === String(value));
    if (found) setTexto(found.nombreCompleto);
  }, [value, medicos]);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setAbierto(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtrados = useMemo(() => {
    if (!iniciado || !texto.trim()) return medicos.slice(0, 30);
    return medicos.filter(m => m.nombreCompleto.toLowerCase().includes(texto.toLowerCase())).slice(0, 20);
  }, [texto, medicos, iniciado]);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        <input
          type="text"
          value={texto}
          placeholder={placeholder || 'Buscar médico...'}
          onChange={e => { setTexto(e.target.value); setIniciado(true); setAbierto(true); onChange(null); }}
          onFocus={() => setAbierto(true)}
          style={{
            width: '100%', boxSizing: 'border-box',
            padding: '9px 32px 9px 12px',
            border: `1.5px solid ${value ? '#1d4ed8' : '#cbd5e1'}`,
            borderRadius: '8px', fontSize: '13px', outline: 'none',
            background: value ? '#eff6ff' : '#fff', color: '#1e293b',
          }}
        />
        {texto ? (
          <button
            onMouseDown={e => { e.preventDefault(); setTexto(''); onChange(null); setIniciado(false); setAbierto(false); }}
            style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', padding: 0 }}
          >
            <X size={14} />
          </button>
        ) : (
          <ChevronDown size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
        )}
      </div>
      {abierto && filtrados.length > 0 && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 200,
          background: '#fff', border: '1.5px solid #bfdbfe', borderRadius: '10px',
          boxShadow: '0 8px 24px rgba(29,78,216,0.18)', maxHeight: '220px', overflowY: 'auto',
        }}>
          {filtrados.map(m => (
            <div
              key={m.idPersonal}
              onMouseDown={ev => { ev.preventDefault(); setTexto(m.nombreCompleto); onChange(String(m.idPersonal)); setAbierto(false); setIniciado(false); }}
              style={{
                padding: '9px 14px', cursor: 'pointer', fontSize: '13px',
                color: String(m.idPersonal) === String(value) ? '#1d4ed8' : '#1e293b',
                background: String(m.idPersonal) === String(value) ? '#eff6ff' : 'transparent',
                fontWeight: String(m.idPersonal) === String(value) ? '600' : '400',
                borderBottom: '1px solid #f1f5f9',
              }}
              onMouseEnter={ev => { if (String(m.idPersonal) !== String(value)) ev.currentTarget.style.background = '#f8fafc'; }}
              onMouseLeave={ev => { if (String(m.idPersonal) !== String(value)) ev.currentTarget.style.background = 'transparent'; }}
            >
              {m.nombreCompleto}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// Drawer lateral — detalle de pacientes de un médico
// ══════════════════════════════════════════════════════════════
function DrawerMedico({ medico, fecha, turno, onClose, onReasignacionExitosa }) {
  const [pacientes,      setPacientes]      = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [busqueda,       setBusqueda]       = useState('');
  const [filtroEstado,   setFiltroEstado]   = useState('');
  const [fechaLocal,     setFechaLocal]     = useState(fecha || HOY);
  const [turnoLocal,     setTurnoLocal]     = useState(turno || null);
  const [diasConDatosMedico, setDiasConDatosMedico] = useState({});
  const [seleccionados,  setSeleccionados]  = useState(new Set());
  const [medicos,        setMedicos]        = useState([]);
  const [modalAbierto,   setModalAbierto]   = useState(false);
  const [medicoDestino,  setMedicoDestino]  = useState(null);
  const [fechaReasig,    setFechaReasig]    = useState('');
  const [horaReasig,     setHoraReasig]     = useState('');
  const [reasignando,    setReasignando]    = useState(false);
  const [progreso,       setProgreso]       = useState({ ok: 0, err: 0, total: 0 });
  const [exitoVisible,   setExitoVisible]   = useState(false);

  // Cargar pacientes del médico
  useEffect(() => {
    const cargar = async () => {
      setLoading(true);
      try {
        const data = await teleurgenciasService.pacientesPorMedico(medico.id_medico, fechaLocal, turnoLocal);
        setPacientes(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('Error cargando pacientes de médico:', e);
        setPacientes([]);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [medico.id_medico, fechaLocal, turnoLocal]);

  // Cargar médicos disponibles para reasignación
  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await teleurgenciasService.medicos();
        const lista = Array.isArray(data) ? data : [];
        setMedicos(lista.filter(m => String(m.idPersonal) !== String(medico.id_medico)));
      } catch (e) {
        console.error('Error cargando médicos:', e);
      }
    };
    cargar();
  }, [medico.id_medico]);

  // Cargar fechas disponibles del médico
  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await teleurgenciasService.fechasPorMedico(medico.id_medico);
        setDiasConDatosMedico(data && typeof data === 'object' ? data : {});
      } catch (e) {
        console.error('Error cargando fechas por médico:', e);
      }
    };
    cargar();
  }, [medico.id_medico]);

  const pacientesFiltrados = useMemo(() => {
    return pacientes.filter(p => {
      const condicion = p.condicionMedica || p.condicion_medica || '';
      const matchEstado = !filtroEstado ||
        (filtroEstado === 'Sin estado' ? !condicion : condicion === filtroEstado);
      const nombre = p.pacienteNombre || p.paciente_nombre || '';
      const dni    = p.pacienteDni    || p.paciente_dni    || '';
      const matchBusq = !busqueda || (
        nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        dni.includes(busqueda)
      );
      return matchEstado && matchBusq;
    });
  }, [pacientes, filtroEstado, busqueda]);

  const getId = (p) => p.idSolicitud ?? p.id_solicitud;

  const todosSeleccionados = pacientesFiltrados.length > 0 &&
    pacientesFiltrados.every(p => seleccionados.has(getId(p)));

  const toggleTodos = () => {
    if (todosSeleccionados) {
      const nuevo = new Set(seleccionados);
      pacientesFiltrados.forEach(p => nuevo.delete(getId(p)));
      setSeleccionados(nuevo);
    } else {
      const nuevo = new Set(seleccionados);
      pacientesFiltrados.forEach(p => nuevo.add(getId(p)));
      setSeleccionados(nuevo);
    }
  };

  const toggleUno = (id) => {
    const nuevo = new Set(seleccionados);
    nuevo.has(id) ? nuevo.delete(id) : nuevo.add(id);
    setSeleccionados(nuevo);
  };

  const confirmarReasignacion = async () => {
    if (!medicoDestino || seleccionados.size === 0 || !fechaReasig || !horaReasig) return;
    const ids = Array.from(seleccionados).map(Number);
    setReasignando(true);
    setProgreso({ ok: 0, err: 0, total: ids.length });
    try {
      await teleurgenciasService.reasignarMasivo({
        ids,
        idPersonal: Number(medicoDestino),
        fecha: fechaReasig,
        hora: horaReasig,
      });
      setProgreso({ ok: ids.length, err: 0, total: ids.length });
      setExitoVisible(true);
      setTimeout(() => {
        setModalAbierto(false);
        setReasignando(false);
        setExitoVisible(false);
        setSeleccionados(new Set());
        setFechaReasig('');
        setHoraReasig('');
        onReasignacionExitosa();
        onClose();
      }, 2200);
    } catch (e) {
      console.error('Error reasignando:', e);
      setProgreso({ ok: 0, err: ids.length, total: ids.length });
      setReasignando(false);
    }
  };

  const medicoDestNombre = medicos.find(m => String(m.idPersonal) === String(medicoDestino))?.nombreCompleto;

  const exportarExcel = () => {
    const filas = pacientesFiltrados.map((p, idx) => ({
      'N°': idx + 1,
      'Nombre del Paciente': p.pacienteNombre || p.paciente_nombre || '',
      'DNI': p.pacienteDni || p.paciente_dni || '',
      'Hora Cita': p.horaCita || p.hora_cita || '',
      'Condición Médica': p.condicionMedica || p.condicion_medica || '',
      'Fecha Atención': fechaLocal || '',
    }));

    const ws = XLSX.utils.json_to_sheet(filas);
    ws['!cols'] = [
      { wch: 5 }, { wch: 36 }, { wch: 12 }, { wch: 10 }, { wch: 14 }, { wch: 14 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Pacientes');

    const turnoLabel = turnoLocal === 'MANANA' ? '_Mañana' : turnoLocal === 'TARDE' ? '_Tarde' : '';
    const fechaLabel = fechaLocal ? `_${fechaLocal}` : '';
    const estadoLabel = filtroEstado ? `_${filtroEstado}` : '';
    const medNombre   = (medico.nombre_medico || 'Medico').replace(/\s+/g, '_');
    const filename    = `Pacientes_${medNombre}${fechaLabel}${turnoLabel}${estadoLabel}.xlsx`;

    XLSX.writeFile(wb, filename);
  };

  const estadoColor = (condicion) => {
    if (condicion === 'Pendiente') return { color: '#f59e0b', bg: '#fffbeb' };
    if (condicion === 'Atendido')  return { color: '#10b981', bg: '#f0fdf4' };
    if (condicion === 'Deserción') return { color: '#ef4444', bg: '#fef2f2' };
    return { color: '#64748b', bg: '#f1f5f9' };
  };

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.45)',
          zIndex: 80, backdropFilter: 'blur(2px)', animation: 'fadeIn 0.2s ease',
        }}
      />

      {/* Panel lateral */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: 'min(660px, 95vw)',
        background: '#fff', zIndex: 90,
        display: 'flex', flexDirection: 'column',
        boxShadow: '-8px 0 40px rgba(0,0,0,0.18)',
        animation: 'slideInRight 0.25s ease',
      }}>

        {/* Cabecera */}
        <div style={{ background: '#1d4ed8', padding: '16px 20px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: '800', color: '#fff', flexShrink: 0 }}>
                {(medico.nombre_medico || 'M').charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ color: '#fff', fontWeight: '700', fontSize: '15px', lineHeight: 1.2 }}>
                  {medico.nombre_medico || 'Sin nombre'}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px', marginTop: '2px' }}>
                  {n(medico.total).toLocaleString()} pacientes asignados
                  {fechaLocal && ` · ${fechaLocal}`}
                </div>
              </div>
            </div>
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '8px', cursor: 'pointer', color: '#fff', display: 'flex', padding: '6px' }}>
              <X size={18} />
            </button>
          </div>

          {/* Filtros de estado (badges clickeables) */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {ESTADOS.map(e => {
              const val    = n(medico[e.key]);
              const activo = filtroEstado === e.label;
              return (
                <button
                  key={e.key}
                  onClick={() => setFiltroEstado(prev => prev === e.label ? '' : e.label)}
                  title={`Filtrar: ${e.label}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                    padding: '3px 10px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                    background: activo ? '#fff' : 'rgba(255,255,255,0.18)',
                    color: activo ? e.accent : '#fff',
                    fontWeight: '700', fontSize: '11px', transition: 'all 0.15s',
                  }}
                >
                  <span>{val.toLocaleString()}</span>
                  <span style={{ fontWeight: '400', opacity: activo ? 1 : 0.85 }}>{e.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Barra búsqueda + filtros + reasignar */}
        <div style={{ padding: '10px 16px', borderBottom: '1px solid #f1f5f9', flexShrink: 0, background: '#fafafa', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Fila 1: búsqueda + reasignar */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              <input
                type="text"
                placeholder="Buscar por nombre o DNI..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                style={{ width: '100%', boxSizing: 'border-box', padding: '7px 10px 7px 30px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '12px', outline: 'none', background: '#fff' }}
              />
            </div>
            {seleccionados.size > 0 && (
              <button
                onClick={() => { setMedicoDestino(null); setFechaReasig(''); setHoraReasig(''); setProgreso({ ok: 0, err: 0, total: 0 }); setExitoVisible(false); setModalAbierto(true); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '7px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                  background: '#1d4ed8', color: '#fff', fontWeight: '600', fontSize: '12px',
                  whiteSpace: 'nowrap', flexShrink: 0,
                }}
              >
                <ArrowRightLeft size={13} />
                Reasignar ({seleccionados.size})
              </button>
            )}
          </div>
          {/* Fila 2: filtros fecha + turno + estado */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flexShrink: 0 }}>
              <SelectorFecha
                fecha={fechaLocal}
                onChange={f => { setFechaLocal(f || HOY); setSeleccionados(new Set()); }}
                diasConDatos={diasConDatosMedico}
                maxBadge={9}
                popupZIndex={200}
              />
            </div>
            <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
              {[{ key: 'MANANA', label: '☀ Mañana' }, { key: 'TARDE', label: '🌆 Tarde' }].map(t => (
                <button
                  key={t.key}
                  onClick={() => { setTurnoLocal(prev => prev === t.key ? null : t.key); setSeleccionados(new Set()); }}
                  style={{
                    padding: '5px 10px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: '600',
                    background: turnoLocal === t.key ? '#1d4ed8' : '#f1f5f9',
                    color:      turnoLocal === t.key ? '#fff'    : '#475569',
                    transition: 'all 0.15s',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: '130px' }}>
              <Filter size={13} color="#64748b" style={{ flexShrink: 0 }} />
              <select
                value={filtroEstado}
                onChange={e => setFiltroEstado(e.target.value)}
                style={{ flex: 1, padding: '5px 8px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '12px', outline: 'none', background: '#fff', color: '#1e293b', cursor: 'pointer' }}
              >
                <option value="">Todos los estados</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Atendido">Atendido</option>
                <option value="Deserción">Deserción</option>
                <option value="Sin estado">Sin estado</option>
              </select>
            </div>
            {pacientesFiltrados.length > 0 && (
              <button
                onClick={exportarExcel}
                title="Exportar a Excel"
                style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  padding: '5px 10px', borderRadius: '8px', border: '1.5px solid #16a34a',
                  background: '#f0fdf4', color: '#16a34a', fontWeight: '600', fontSize: '11px',
                  cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#dcfce7'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#f0fdf4'; }}
              >
                <Download size={12} />
                Excel
              </button>
            )}
          </div>
        </div>

        {/* Tabla de pacientes */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', gap: '12px', color: '#64748b' }}>
              <Loader2 size={28} color="#1d4ed8" style={{ animation: 'spin 1s linear infinite' }} />
              <span style={{ fontSize: '13px' }}>Cargando pacientes...</span>
            </div>
          ) : pacientesFiltrados.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 24px', color: '#94a3b8' }}>
              <Users size={36} style={{ opacity: 0.2, marginBottom: '10px' }} />
              <p style={{ margin: 0, fontSize: '14px' }}>
                {filtroEstado ? `No hay pacientes "${filtroEstado}"` : 'No hay pacientes para este médico'}
              </p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', position: 'sticky', top: 0, zIndex: 10 }}>
                  <th style={{ padding: '10px 12px', borderBottom: '2px solid #e2e8f0', width: '36px' }}>
                    <input
                      type="checkbox"
                      checked={todosSeleccionados}
                      onChange={toggleTodos}
                      style={{ cursor: 'pointer', width: '14px', height: '14px', accentColor: '#1d4ed8' }}
                    />
                  </th>
                  <th style={{ padding: '10px 12px', borderBottom: '2px solid #e2e8f0', textAlign: 'left', fontWeight: '700', color: '#475569', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Paciente</th>
                  <th style={{ padding: '10px 8px', borderBottom: '2px solid #e2e8f0', textAlign: 'center', fontWeight: '700', color: '#475569', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Hora</th>
                  <th style={{ padding: '10px 12px', borderBottom: '2px solid #e2e8f0', textAlign: 'center', fontWeight: '700', color: '#475569', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Condición</th>
                </tr>
              </thead>
              <tbody>
                {pacientesFiltrados.map((p, idx) => {
                  const pid    = getId(p);
                  const selec  = seleccionados.has(pid);
                  const rowBg  = selec ? '#eff6ff' : idx % 2 === 0 ? '#fff' : '#fafafa';
                  const condicion = p.condicionMedica || p.condicion_medica || '';
                  const nombre    = p.pacienteNombre  || p.paciente_nombre  || 'Sin nombre';
                  const dni       = p.pacienteDni     || p.paciente_dni     || '—';
                  const hora      = p.horaCita        || p.hora_cita        || null;
                  const { color: ec, bg: eb } = estadoColor(condicion);
                  return (
                    <tr
                      key={pid}
                      onClick={() => toggleUno(pid)}
                      style={{ background: rowBg, cursor: 'pointer', borderBottom: '1px solid #f1f5f9', transition: 'background 0.1s' }}
                      onMouseEnter={e => { if (!selec) e.currentTarget.style.background = '#f0f7ff'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = rowBg; }}
                    >
                      <td style={{ padding: '9px 12px', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={selec}
                          onChange={() => toggleUno(pid)}
                          onClick={e => e.stopPropagation()}
                          style={{ cursor: 'pointer', width: '14px', height: '14px', accentColor: '#1d4ed8' }}
                        />
                      </td>
                      <td style={{ padding: '9px 12px' }}>
                        <div style={{ fontWeight: '600', color: '#1e293b', lineHeight: 1.3 }}>{nombre}</div>
                        <div style={{ color: '#94a3b8', fontSize: '11px', marginTop: '1px' }}>DNI: {dni}</div>
                      </td>
                      <td style={{ padding: '9px 8px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        {hora ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '11px', fontWeight: '700', color: '#1d4ed8', background: '#eff6ff', padding: '2px 7px', borderRadius: '6px' }}>
                            <Clock size={10} />
                            {hora}
                          </span>
                        ) : (
                          <span style={{ fontSize: '10px', color: '#cbd5e1' }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '9px 12px', textAlign: 'center' }}>
                        <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '20px', background: eb, color: ec, fontWeight: '600', fontSize: '10px', whiteSpace: 'nowrap' }}>
                          {condicion || 'Sin estado'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        {!loading && pacientesFiltrados.length > 0 && (
          <div style={{ padding: '12px 16px', borderTop: '1px solid #e2e8f0', background: '#f8fafc', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              {pacientesFiltrados.length.toLocaleString()} pacientes
              {filtroEstado && ` — ${filtroEstado}`}
              {seleccionados.size > 0 && (
                <strong style={{ color: '#1d4ed8', marginLeft: '6px' }}>
                  · {seleccionados.size} seleccionados
                </strong>
              )}
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              {seleccionados.size > 0 && (
                <button onClick={() => setSeleccionados(new Set())} style={{ fontSize: '11px', color: '#64748b', background: 'none', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer' }}>
                  Limpiar selección
                </button>
              )}
              <button onClick={toggleTodos} style={{ fontSize: '11px', color: '#1d4ed8', background: 'none', border: '1px solid #bfdbfe', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontWeight: '600' }}>
                {todosSeleccionados ? 'Deseleccionar' : 'Seleccionar todos'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal reasignación */}
      {modalAbierto && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,23,42,0.6)', animation: 'fadeIn 0.15s ease' }}>
          <div style={{ background: '#fff', borderRadius: '16px', width: '420px', maxWidth: '95vw', boxShadow: '0 20px 60px rgba(0,0,0,0.25)', overflow: 'visible', animation: 'slideUp 0.2s ease' }}>
            {/* Header modal */}
            <div style={{ background: '#1d4ed8', borderRadius: '16px 16px 0 0', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ArrowRightLeft size={18} color="#fff" />
              <div style={{ flex: 1 }}>
                <div style={{ color: '#fff', fontWeight: '700', fontSize: '14px' }}>Reasignar pacientes</div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px' }}>
                  {seleccionados.size} pacientes de {medico.nombre_medico}
                </div>
              </div>
              <button onClick={() => setModalAbierto(false)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '6px', cursor: 'pointer', color: '#fff', display: 'flex', padding: '4px' }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ padding: '20px' }}>
              {/* Resumen */}
              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '12px 14px', marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                <Stethoscope size={20} color="#1d4ed8" style={{ flexShrink: 0 }} />
                <div style={{ fontSize: '12px', color: '#1e40af' }}>
                  Se moverán <strong>{seleccionados.size} pacientes</strong> de{' '}
                  <strong>{medico.nombre_medico}</strong> al médico que selecciones.
                </div>
              </div>

              {/* Selector médico destino */}
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                Médico destino
              </label>
              <div style={{ position: 'relative', zIndex: 150 }}>
                <AutocompleteMedico
                  medicos={medicos}
                  value={medicoDestino}
                  onChange={setMedicoDestino}
                  placeholder="Escribe para buscar médico..."
                />
              </div>

              {/* Nueva fecha y hora de cita */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                    <Calendar size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                    Nueva fecha de cita
                  </label>
                  <input
                    type="date"
                    value={fechaReasig}
                    onChange={e => setFechaReasig(e.target.value)}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', border: `1.5px solid ${fechaReasig ? '#1d4ed8' : '#e2e8f0'}`, borderRadius: '8px', fontSize: '12px', outline: 'none', background: '#fff', color: '#1e293b', cursor: 'pointer' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                    <Clock size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                    Nueva hora de cita
                  </label>
                  <input
                    type="time"
                    value={horaReasig}
                    onChange={e => setHoraReasig(e.target.value)}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', border: `1.5px solid ${horaReasig ? '#1d4ed8' : '#e2e8f0'}`, borderRadius: '8px', fontSize: '12px', outline: 'none', background: '#fff', color: '#1e293b', cursor: 'pointer' }}
                  />
                </div>
              </div>

              {(fechaReasig && horaReasig) && (
                <div style={{ marginTop: '10px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '8px 12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <CheckCircle2 size={13} color="#10b981" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: '11px', color: '#15803d' }}>
                    La cita se reprogramará al <strong>{fechaReasig}</strong> a las <strong>{horaReasig}</strong>.
                  </span>
                </div>
              )}

              {/* Barra de progreso */}
              {reasignando && (
                <div style={{ marginTop: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '11px', color: '#64748b' }}>
                    <span>Reprogramando citas...</span>
                    <span>{progreso.ok + progreso.err} / {progreso.total}</span>
                  </div>
                  <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '8px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${progreso.total ? ((progreso.ok + progreso.err) / progreso.total) * 100 : 0}%`,
                      background: progreso.err > 0 ? '#ef4444' : '#10b981',
                      borderRadius: '8px', transition: 'width 0.3s',
                    }} />
                  </div>
                  {exitoVisible && (
                    <div style={{ marginTop: '12px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '10px', padding: '12px 14px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <CheckCircle2 size={20} color="#16a34a" style={{ flexShrink: 0 }} />
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '13px', color: '#15803d' }}>
                          Reprogramación realizada con Éxito
                        </div>
                        <div style={{ fontSize: '11px', color: '#16a34a', marginTop: '2px' }}>
                          {progreso.total} cita{progreso.total !== 1 ? 's' : ''} reprogramada{progreso.total !== 1 ? 's' : ''} → {fechaReasig} {horaReasig}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Botones */}
              {!reasignando && (
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <button onClick={() => setModalAbierto(false)} style={{ flex: 1, padding: '9px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', color: '#475569', fontSize: '13px', cursor: 'pointer', fontWeight: '500' }}>
                    Cancelar
                  </button>
                  <button
                    onClick={confirmarReasignacion}
                    disabled={!medicoDestino || !fechaReasig || !horaReasig}
                    style={{
                      flex: 2, padding: '9px', borderRadius: '8px', border: 'none',
                      cursor: (medicoDestino && fechaReasig && horaReasig) ? 'pointer' : 'not-allowed',
                      background: (medicoDestino && fechaReasig && horaReasig) ? '#1d4ed8' : '#e2e8f0',
                      color:      (medicoDestino && fechaReasig && horaReasig) ? '#fff'    : '#94a3b8',
                      fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    }}
                  >
                    <ArrowRightLeft size={14} />
                    Confirmar reprogramación
                    {medicoDestNombre && (
                      <span style={{ fontWeight: '400', fontSize: '11px', opacity: 0.85 }}>→ {medicoDestNombre.split(' ')[0]}</span>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes fadeIn       { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp      { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes spin         { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}

// ── Estilo TH reutilizable ─────────────────────────────────────
const TH = {
  padding: '11px 14px',
  textAlign: 'center',
  fontSize: '10px',
  fontWeight: '700',
  color: '#e0f2fe',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
};

// ══════════════════════════════════════════════════════════════
// Componente principal
// ══════════════════════════════════════════════════════════════
export default function DashboardCoordinadorTeleurgencias() {
  const [medicos,       setMedicos]       = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState('');
  const [fecha,         setFecha]         = useState(null);
  const [diasConDatos,  setDiasConDatos]  = useState({});
  const [turno,         setTurno]         = useState(null);
  const [busqueda,      setBusqueda]      = useState('');
  const [sortCol,       setSortCol]       = useState('total');
  const [sortDir,       setSortDir]       = useState('desc');
  const [medicoDrawer,  setMedicoDrawer]  = useState(null);

  const handleSort = (col) => {
    if (sortCol === col) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCol(col);
      setSortDir(col === 'nombre_medico' ? 'asc' : 'desc');
    }
  };

  const cargar = useCallback(async (f, t) => {
    setLoading(true);
    setError('');
    try {
      const data = await teleurgenciasService.estadisticasPorMedico(f || null, t || null);
      setMedicos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error cargando estadísticas teleurgencias:', err);
      setError('No se pudieron cargar las estadísticas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar(null, null);
    teleurgenciasService.fechasDisponibles()
      .then(data => { if (data && typeof data === 'object') setDiasConDatos(data); })
      .catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelectFecha = (f) => {
    setFecha(f);
    cargar(f, turno);
  };

  const handleTurno = (t) => {
    const nuevo = turno === t ? null : t;
    setTurno(nuevo);
    cargar(fecha, nuevo);
  };

  // Totales generales
  const totales = useMemo(() => {
    const t = { total: 0, pendientes: 0, atendidos: 0, desercion: 0 };
    medicos.forEach(m => {
      t.total      += n(m.total);
      t.pendientes += n(m.pendientes);
      t.atendidos  += n(m.atendidos);
      t.desercion  += n(m.desercion);
    });
    return t;
  }, [medicos]);

  const medicosFiltrados = useMemo(() => {
    return [...medicos]
      .filter(m => !busqueda || (m.nombre_medico || '').toLowerCase().includes(busqueda.toLowerCase()))
      .sort((a, b) => {
        const dir = sortDir === 'asc' ? 1 : -1;
        if (sortCol === 'nombre_medico') return dir * (a.nombre_medico || '').localeCompare(b.nombre_medico || '', 'es', { sensitivity: 'base' });
        return dir * (n(a[sortCol]) - n(b[sortCol]));
      });
  }, [medicos, busqueda, sortCol, sortDir]);

  if (loading) return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ height: '32px', background: '#f1f5f9', borderRadius: '8px', width: '320px', animation: 'pulse 1.5s infinite' }} />
      <div style={{ height: '52px', background: '#f1f5f9', borderRadius: '10px', animation: 'pulse 1.5s infinite' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
        {Array.from({ length: 4 }, (_, i) => <div key={i} style={{ height: '80px', background: '#f1f5f9', borderRadius: '12px', animation: 'pulse 1.5s infinite' }} />)}
      </div>
      <div style={{ height: '300px', background: '#f1f5f9', borderRadius: '12px', animation: 'pulse 1.5s infinite' }} />
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }`}</style>
    </div>
  );

  if (error) return (
    <div style={{ padding: '24px' }}>
      <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '12px', padding: '20px', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <AlertCircle size={20} />
        <div style={{ flex: 1 }}>
          <strong>Error al cargar datos</strong>
          <p style={{ margin: '4px 0 0', fontSize: '13px' }}>{error}</p>
        </div>
        <button onClick={() => cargar(fecha, turno)} style={{ padding: '8px 16px', background: '#b91c1c', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}>
          Reintentar
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>

      {/* Encabezado */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '10px', background: '#1d4ed8', borderRadius: '12px', display: 'flex' }}>
            <Activity size={22} color="white" />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#0f172a' }}>Total Pacientes Teleurgencias</h2>
            <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
              {fecha || 'Todas las fechas'}{turno ? ` · ${turno === 'MANANA' ? '☀️ Mañana' : '🌆 Tarde'}` : ''} · <strong style={{ color: '#1d4ed8' }}>{totales.total.toLocaleString()}</strong> pacientes · {medicos.length} médicos ·{' '}
              <span style={{ color: '#94a3b8' }}>Clic en una fila para ver detalle y reasignar</span>
            </p>
          </div>
        </div>
        <button
          onClick={() => cargar(fecha, turno)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', color: '#475569', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}
        >
          <RefreshCw size={14} /> Actualizar
        </button>
      </div>

      {/* Filtros: fecha + turno */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {/* Fila 1: fecha */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <Calendar size={15} color="#64748b" />
          <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fecha de atención</span>
          <SelectorFecha fecha={fecha} onChange={handleSelectFecha} diasConDatos={diasConDatos} />
          {fecha && (
            <button
              onClick={() => handleSelectFecha(null)}
              style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                padding: '4px 10px', borderRadius: '20px',
                background: '#1d4ed8', color: '#fff',
                border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: '600',
              }}
            >
              {fecha} <XCircle size={13} style={{ opacity: 0.8 }} />
            </button>
          )}
        </div>
        {/* Fila 2: turno */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Turno</span>
          {[
            { key: 'MANANA', label: '☀️ Mañana', sub: '07:00 – 13:59' },
            { key: 'TARDE',  label: '🌆 Tarde',   sub: '14:00 – 20:59' },
          ].map(({ key, label, sub }) => {
            const activo = turno === key;
            return (
              <button
                key={key}
                onClick={() => handleTurno(key)}
                title={sub}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '5px 14px', borderRadius: '20px', cursor: 'pointer',
                  border: `1.5px solid ${activo ? '#1d4ed8' : '#cbd5e1'}`,
                  background: activo ? '#1d4ed8' : '#f8fafc',
                  color: activo ? '#fff' : '#475569',
                  fontSize: '13px', fontWeight: '600', transition: 'all 0.15s',
                }}
              >
                {label}
                <span style={{ fontSize: '10px', opacity: 0.75 }}>({sub})</span>
              </button>
            );
          })}
          {turno && (
            <button
              onClick={() => handleTurno(turno)}
              style={{ fontSize: '11px', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Ver todos los turnos
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
        {/* Total */}
        <div style={{ background: '#1d4ed8', borderRadius: '12px', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '4px', boxShadow: '0 2px 8px rgba(29,78,216,0.25)' }}>
          <span style={{ fontSize: '11px', fontWeight: '600', color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Asignados</span>
          <span style={{ fontSize: '30px', fontWeight: '800', color: '#fff', lineHeight: 1 }}>{totales.total.toLocaleString()}</span>
          <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)' }}>{medicos.length} médicos</span>
        </div>

        {/* Pendientes */}
        <div style={{ background: '#fffbeb', border: '2px solid #fde68a', borderLeft: '4px solid #f59e0b', borderRadius: '12px', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pendientes</span>
            <Clock size={13} color="#f59e0b" />
          </div>
          <span style={{ fontSize: '26px', fontWeight: '800', lineHeight: 1, color: '#f59e0b' }}>{totales.pendientes.toLocaleString()}</span>
          <span style={{ fontSize: '10px', color: '#94a3b8' }}>{totales.total ? Math.round((totales.pendientes / totales.total) * 100) : 0}% del total</span>
        </div>

        {/* Atendidos */}
        <div style={{ background: '#f0fdf4', border: '2px solid #bbf7d0', borderLeft: '4px solid #10b981', borderRadius: '12px', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Atendidos</span>
            <CheckCircle2 size={13} color="#10b981" />
          </div>
          <span style={{ fontSize: '26px', fontWeight: '800', lineHeight: 1, color: '#10b981' }}>{totales.atendidos.toLocaleString()}</span>
          <span style={{ fontSize: '10px', color: '#94a3b8' }}>{totales.total ? Math.round((totales.atendidos / totales.total) * 100) : 0}% del total</span>
        </div>

        {/* Deserción */}
        <div style={{ background: '#fef2f2', border: '2px solid #fecaca', borderLeft: '4px solid #ef4444', borderRadius: '12px', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Deserción</span>
            <XCircle size={13} color="#ef4444" />
          </div>
          <span style={{ fontSize: '26px', fontWeight: '800', lineHeight: 1, color: '#ef4444' }}>{totales.desercion.toLocaleString()}</span>
          <span style={{ fontSize: '10px', color: '#94a3b8' }}>{totales.total ? Math.round((totales.desercion / totales.total) * 100) : 0}% del total</span>
        </div>
      </div>

      {/* Buscador de médico */}
      <div style={{ position: 'relative', width: '280px' }}>
        <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        <input
          type="text"
          placeholder="Buscar médico..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          style={{
            width: '100%', boxSizing: 'border-box',
            padding: '8px 12px 8px 36px',
            border: '1.5px solid #e2e8f0', borderRadius: '8px',
            fontSize: '13px', color: '#1e293b', outline: 'none', background: '#fff',
          }}
        />
        {busqueda && (
          <button
            onClick={() => setBusqueda('')}
            style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', display: 'flex', padding: 0 }}
          >
            <XCircle size={15} />
          </button>
        )}
      </div>

      {/* Tabla */}
      {medicosFiltrados.length === 0 ? (
        <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '12px', padding: '48px', textAlign: 'center', color: '#94a3b8' }}>
          <Users size={40} style={{ opacity: 0.2, marginBottom: '12px' }} />
          <p style={{ margin: 0, fontSize: '15px' }}>No hay datos para la fecha seleccionada</p>
          <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#cbd5e1' }}>Selecciona otra fecha en el calendario</p>
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#1d4ed8' }}>
                  <th style={TH}>#</th>
                  <th style={{ ...TH, textAlign: 'left', minWidth: '200px' }}>
                    <SortBtn label="Médico" col="nombre_medico" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                  </th>
                  <th style={TH}>
                    <SortBtn label="Total" col="total" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                  </th>
                  <th style={TH}>
                    <SortBtn label="Pendientes" col="pendientes" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                  </th>
                  <th style={TH}>
                    <SortBtn label="Atendidos" col="atendidos" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                  </th>
                  <th style={TH}>
                    <SortBtn label="Deserción" col="desercion" sortCol={sortCol} sortDir={sortDir} onSort={handleSort} />
                  </th>
                  <th style={{ ...TH, minWidth: '120px' }}>Avance</th>
                </tr>
              </thead>
              <tbody>
                {medicosFiltrados.map((m, idx) => {
                  const rowBg = idx % 2 === 0 ? '#fff' : '#fafafa';
                  const pctAtendidos = n(m.total) ? Math.round((n(m.atendidos) / n(m.total)) * 100) : 0;
                  return (
                    <tr
                      key={m.id_medico}
                      onClick={() => setMedicoDrawer(m)}
                      title="Clic para ver detalle y reasignar pacientes"
                      style={{ borderBottom: '1px solid #f1f5f9', background: rowBg, cursor: 'pointer', transition: 'background 0.12s' }}
                      onMouseEnter={ev => { ev.currentTarget.style.background = '#eff6ff'; ev.currentTarget.style.boxShadow = 'inset 3px 0 0 #1d4ed8'; }}
                      onMouseLeave={ev => { ev.currentTarget.style.background = rowBg; ev.currentTarget.style.boxShadow = 'none'; }}
                    >
                      <td style={{ padding: '11px 14px', textAlign: 'center', color: '#94a3b8', fontWeight: '600', fontSize: '12px' }}>{idx + 1}</td>
                      <td style={{ padding: '11px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: '#1d4ed8', flexShrink: 0 }}>
                            {(m.nombre_medico || 'M').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '13px' }}>{m.nombre_medico || 'Sin nombre'}</div>
                            <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '1px' }}>
                              {pctAtendidos}% atendido · ver detalle →
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '11px 14px', textAlign: 'center' }}>
                        <span style={{ fontWeight: '800', color: '#0f172a', fontSize: '15px' }}>{n(m.total).toLocaleString()}</span>
                      </td>
                      <td style={{ padding: '11px 14px', textAlign: 'center' }}>
                        <Badge valor={n(m.pendientes)} accent="#f59e0b" bg="#fffbeb" />
                      </td>
                      <td style={{ padding: '11px 14px', textAlign: 'center' }}>
                        <Badge valor={n(m.atendidos)} accent="#10b981" bg="#f0fdf4" />
                      </td>
                      <td style={{ padding: '11px 14px', textAlign: 'center' }}>
                        <Badge valor={n(m.desercion)} accent="#ef4444" bg="#fef2f2" />
                      </td>
                      <td style={{ padding: '11px 14px' }}>
                        {n(m.total) > 0 ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ flex: 1, height: '10px', background: '#f1f5f9', borderRadius: '6px', overflow: 'hidden', display: 'flex', minWidth: '80px' }}>
                              {n(m.pendientes) > 0 && (
                                <div style={{ width: `${Math.round((n(m.pendientes) / n(m.total)) * 100)}%`, background: '#f59e0b', transition: 'width 0.5s' }} />
                              )}
                              {n(m.atendidos) > 0 && (
                                <div style={{ width: `${Math.round((n(m.atendidos) / n(m.total)) * 100)}%`, background: '#10b981', transition: 'width 0.5s' }} />
                              )}
                              {n(m.desercion) > 0 && (
                                <div style={{ width: `${Math.round((n(m.desercion) / n(m.total)) * 100)}%`, background: '#ef4444', transition: 'width 0.5s' }} />
                              )}
                            </div>
                            <span style={{ fontSize: '11px', fontWeight: '700', color: '#10b981', minWidth: '32px', textAlign: 'right' }}>
                              {pctAtendidos}%
                            </span>
                          </div>
                        ) : (
                          <span style={{ color: '#e2e8f0', fontSize: '12px' }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ background: '#f1f5f9', borderTop: '2px solid #e2e8f0', fontWeight: '700' }}>
                  <td colSpan={2} style={{ padding: '12px 14px', color: '#1e293b', fontSize: '12px' }}>
                    TOTAL ({medicos.length} médicos)
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'center', color: '#0f172a', fontWeight: '800', fontSize: '15px' }}>{totales.total.toLocaleString()}</td>
                  <td style={{ padding: '12px 14px', textAlign: 'center' }}><Badge valor={totales.pendientes} accent="#f59e0b" bg="#fffbeb" /></td>
                  <td style={{ padding: '12px 14px', textAlign: 'center' }}><Badge valor={totales.atendidos} accent="#10b981" bg="#f0fdf4" /></td>
                  <td style={{ padding: '12px 14px', textAlign: 'center' }}><Badge valor={totales.desercion} accent="#ef4444" bg="#fef2f2" /></td>
                  <td style={{ padding: '12px 14px' }}>
                    {totales.total > 0 && (
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#10b981' }}>
                        {Math.round((totales.atendidos / totales.total) * 100)}% atendido
                      </span>
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Leyenda */}
      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '12px 16px' }}>
        <div style={{ fontSize: '11px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Leyenda</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
          {ESTADOS.map(e => (
            <div key={e.key} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#374151' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: e.accent, display: 'inline-block' }} />
              <span style={{ fontWeight: '600', color: e.accent }}>{e.label}</span>
            </div>
          ))}
          <div style={{ borderLeft: '1px solid #e2e8f0', paddingLeft: '16px', fontSize: '11px', color: '#64748b' }}>
            Datos de <strong>Teleurgencias</strong> · 47 médicos · Filtro por fecha_atencion
          </div>
        </div>
      </div>

      {/* Drawer lateral */}
      {medicoDrawer && (
        <DrawerMedico
          medico={medicoDrawer}
          fecha={fecha}
          turno={turno}
          onClose={() => setMedicoDrawer(null)}
          onReasignacionExitosa={() => cargar(fecha, turno)}
        />
      )}
    </div>
  );
}

// ========================================================================
// PacientesAnulados.jsx - Lista de pacientes anulados (Mesa de Ayuda)
// ========================================================================

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  UserX, Search, RefreshCw, Calendar, User, Building2, Stethoscope,
  FileText, AlertTriangle, PlusCircle, X, CheckCircle, Loader2
} from 'lucide-react';
import apiClient from '../../lib/apiClient';
import { getToken } from '../../constants/auth';

// ── Drum picker constants ─────────────────────────────────────────────────
const DRUM_HOURS = Array.from({ length: 17 }, (_, i) => i + 7); // 07..23
const DRUM_MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
const DRUM_ITEM_H = 40;

function getApiBase() {
  if (process.env.REACT_APP_API_URL) return process.env.REACT_APP_API_URL;
  const { protocol, hostname, port } = window.location;
  return `${protocol}//${hostname}${port ? `:${port}` : ''}/api`;
}
function getHeaders() {
  return { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' };
}
function formatearNombreEspecialista(m) {
  const ap = (m?.apellidoPaterno || m?.apPaterno || '').trim();
  const am = (m?.apellidoMaterno || m?.apMaterno || '').trim();
  const nombres = (m?.nombres || '').trim();
  if (ap && am && nombres) return `${ap} ${am}, ${nombres}`;
  const full = (m?.nombre || '').trim().replace(/\s+/g, ' ');
  if (!full) return 'Sin nombre';
  const p = full.split(' ');
  if (p.length >= 3) return `${p.slice(-2).join(' ')}, ${p.slice(0, -2).join(' ')}`;
  return full;
}
function formatearLabelEspecialista(m) {
  const doc = m?.documento || m?.numDocPers || m?.numeroDocumento || 'Sin doc';
  return `${formatearNombreEspecialista(m)} - DNI: ${doc}`;
}
function obtenerApellidoPaterno(m) {
  const ap = (m?.apellidoPaterno || m?.apPaterno || '').trim();
  if (ap) return ap;
  const full = (m?.nombre || '').trim().replace(/\s+/g, ' ');
  const p = full.split(' ');
  if (p.length >= 3) return p[p.length - 2];
  if (p.length === 2) return p[1];
  return p[0] || '';
}

// ── NuevaCitaModal ────────────────────────────────────────────────────────
function NuevaCitaModal({ row, onClose, onSuccess }) {
  const API_BASE = getApiBase();

  // Especialidad
  const [especialidadesAPI, setEspecialidadesAPI] = useState([]);
  const [cargandoEsps, setCargandoEsps] = useState(false);
  const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState(row.especialidad || '');
  const [busquedaEsp, setBusquedaEsp] = useState(row.especialidad || '');
  const [mostrarDropEsp, setMostrarDropEsp] = useState(false);

  // Profesional
  const [medicosDisponibles, setMedicosDisponibles] = useState([]);
  const [medicoSeleccionado, setMedicoSeleccionado] = useState('');
  const [busquedaProf, setBusquedaProf] = useState('');
  const [mostrarDropProf, setMostrarDropProf] = useState(false);

  // Fecha / hora
  const [fechaHora, setFechaHora] = useState('');
  const [horasOcupadas, setHorasOcupadas] = useState([]);

  // Motivo
  const [motivo, setMotivo] = useState('');

  // Estado envío
  const [creando, setCreando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Drum refs
  const hourRef = useRef(null);
  const minuteRef = useRef(null);

  // Cargar especialidades al montar
  useEffect(() => {
    setCargandoEsps(true);
    fetch(`${API_BASE}/especialidades/activas`, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then(r => r.ok ? r.json() : [])
      .then(data => setEspecialidadesAPI(
        (Array.isArray(data) ? data : [])
          .map(e => e.descripcion?.toUpperCase()?.trim()).filter(Boolean).sort()
      ))
      .catch(() => {})
      .finally(() => setCargandoEsps(false));
  }, []); // eslint-disable-line

  // Cargar médicos al cambiar especialidad
  useEffect(() => {
    if (!especialidadSeleccionada) {
      setMedicosDisponibles([]); setMedicoSeleccionado(''); setBusquedaProf(''); return;
    }
    fetch(
      `${API_BASE}/bolsas/solicitudes/fetch-doctors-by-specialty?especialidad=${encodeURIComponent(especialidadSeleccionada)}`,
      { method: 'POST', headers: getHeaders() }
    )
      .then(r => r.ok ? r.json() : { data: [] })
      .then(result => {
        const ordenados = [...(result.data || [])].sort((a, b) => {
          const c = obtenerApellidoPaterno(a).localeCompare(obtenerApellidoPaterno(b), 'es', { sensitivity: 'base' });
          return c !== 0 ? c : formatearNombreEspecialista(a).localeCompare(formatearNombreEspecialista(b), 'es', { sensitivity: 'base' });
        });
        setMedicosDisponibles(ordenados);
      })
      .catch(() => setMedicosDisponibles([]));
    setMedicoSeleccionado(''); setBusquedaProf('');
  }, [especialidadSeleccionada]); // eslint-disable-line

  // Cargar horas ocupadas al cambiar médico o fecha
  useEffect(() => {
    const fecha = fechaHora?.split('T')[0];
    if (!medicoSeleccionado || !fecha) return;
    fetch(
      `${API_BASE}/bolsas/solicitudes/horas-ocupadas?idPersonal=${medicoSeleccionado}&fecha=${fecha}`,
      { headers: { Authorization: `Bearer ${getToken()}` } }
    )
      .then(r => r.ok ? r.json() : {})
      .then(d => setHorasOcupadas(d.horasOcupadas || []))
      .catch(() => {});
  }, [medicoSeleccionado, fechaHora?.split('T')[0]]); // eslint-disable-line

  // Sync drum scroll cuando cambia fechaHora
  useEffect(() => {
    const time = fechaHora?.split('T')[1];
    if (!time) return;
    const [h, m] = time.split(':').map(Number);
    const hIdx = DRUM_HOURS.indexOf(h);
    const mIdx = DRUM_MINUTES.indexOf(m);
    if (hourRef.current && hIdx >= 0) hourRef.current.scrollTop = hIdx * DRUM_ITEM_H;
    if (minuteRef.current && mIdx >= 0) minuteRef.current.scrollTop = mIdx * DRUM_ITEM_H;
  }, [fechaHora]);

  const handleDrumScroll = useCallback((tipo) => {
    const ref = tipo === 'hour' ? hourRef : minuteRef;
    if (!ref.current) return;
    clearTimeout(ref.current._t);
    ref.current._t = setTimeout(() => {
      const idx = Math.round(ref.current.scrollTop / DRUM_ITEM_H);
      const arr = tipo === 'hour' ? DRUM_HOURS : DRUM_MINUTES;
      const clamped = Math.max(0, Math.min(idx, arr.length - 1));
      ref.current.scrollTop = clamped * DRUM_ITEM_H;
      const fechaActual = fechaHora?.split('T')[0] || '';
      if (!fechaActual) return;
      const time = fechaHora?.split('T')[1] || '07:00';
      const [currH, currM] = time.split(':').map(Number);
      const newH = tipo === 'hour' ? arr[clamped] : currH;
      const newM = tipo === 'minute' ? arr[clamped] : currM;
      setFechaHora(`${fechaActual}T${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`);
    }, 120);
  }, [fechaHora]);

  const selH = fechaHora?.split('T')[1]?.split(':')[0] ? parseInt(fechaHora.split('T')[1].split(':')[0]) : 7;
  const selM = fechaHora?.split('T')[1]?.split(':')[1] ? parseInt(fechaHora.split('T')[1].split(':')[1]) : 0;

  const handleCrear = async () => {
    if (!motivo.trim()) { setErrorMsg('El motivo es obligatorio'); return; }
    setCreando(true); setErrorMsg(null);
    try {
      const body = { motivo: motivo.trim() };
      if (especialidadSeleccionada) body.especialidad = especialidadSeleccionada;
      if (medicoSeleccionado) body.idPersonal = medicoSeleccionado;
      if (fechaHora?.split('T')[0]) body.fechaAtencion = fechaHora.split('T')[0];
      if (fechaHora?.split('T')[1]) body.horaAtencion = fechaHora.split('T')[1] + ':00';

      const res = await apiClient.post(
        `/bolsas/solicitudes/${row.idSolicitud}/nueva-cita-desde-anulacion`,
        body
      );
      setResultado(res.data || res);
      if (onSuccess) onSuccess();
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Error al crear la nueva cita. Intente nuevamente.');
    } finally {
      setCreando(false);
    }
  };

  const hoy = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })();

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl ring-1 ring-black/8 w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="border-t-4 border-blue-600 flex-shrink-0">
          <div className="flex items-start justify-between px-6 pt-5 pb-4 bg-gradient-to-b from-slate-50/80 to-white border-b border-gray-100">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-blue-600 mb-1">Solicitud de nueva atención</p>
              <h2 className="text-[15px] font-bold text-gray-900">Nueva Cita desde Anulación</h2>
            </div>
            <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-gray-100 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          {resultado ? (
            /* Éxito */
            <div className="text-center space-y-4 py-2">
              <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <p className="font-bold text-gray-900 text-base">Cita creada correctamente</p>
                <p className="text-sm text-gray-500 mt-1">
                  El paciente fue ingresado a la bolsa en estado{' '}
                  <span className="font-semibold text-blue-600">
                    {medicoSeleccionado && fechaHora ? 'Citado' : 'Pendiente de Citar'}
                  </span>
                </p>
              </div>
              <div className="bg-blue-50 rounded-xl px-4 py-3 text-left ring-1 ring-blue-100">
                <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-1">N° Solicitud</p>
                <p className="font-mono font-bold text-blue-900 text-lg">{resultado.numeroSolicitud}</p>
                <p className="text-xs text-blue-600 mt-0.5">Origen: #{resultado.idSolicitudOrigen}</p>
              </div>
              <button onClick={onClose} className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
                Cerrar
              </button>
            </div>
          ) : (
            <>
              {/* Info paciente anulado */}
              <div className="bg-white ring-1 ring-gray-100 shadow-sm rounded-xl overflow-hidden text-sm">
                <div className="grid grid-cols-2 divide-x divide-gray-100">
                  <div className="px-4 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Paciente</p>
                    <p className="font-semibold text-gray-900 text-[13px]">{row.pacienteNombre || '—'}</p>
                    <p className="font-mono text-xs text-gray-500 mt-0.5">DNI {row.pacienteDni}</p>
                  </div>
                  <div className="px-4 py-3 bg-red-50/40">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-red-400 mb-1">Motivo anulación original</p>
                    <p className="text-[12px] text-red-800 leading-snug">{row.motivoAnulacion || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Aviso auditoría */}
              <div className="flex items-start gap-2.5 bg-amber-50 ring-1 ring-amber-100 rounded-xl px-4 py-3">
                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-[12px] text-amber-800 leading-snug">
                  El registro anulado <span className="font-semibold">no se modifica</span>. Se creará una <span className="font-semibold">nueva solicitud independiente</span>.
                  Si asignas médico y fecha aquí, el paciente quedará en estado <span className="font-semibold">Citado</span> directamente.
                </p>
              </div>

              {/* Motivo (obligatorio) */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                  Motivo de la nueva cita <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={motivo}
                  onChange={e => setMotivo(e.target.value)}
                  placeholder="Ej: Paciente solicita reagendamiento, condición médica persiste..."
                  rows={2}
                  autoFocus
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-[13px] text-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors resize-none"
                />
              </div>

              <div className="border-t border-gray-100 pt-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Datos de la cita (opcionales)</p>

                {/* Especialidad */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-xl border-2 border-green-300 mb-3">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Especialidad / Servicio
                  </label>
                  {(() => {
                    const termino = busquedaEsp.toLowerCase().trim();
                    const filtradas = termino
                      ? especialidadesAPI.filter(e => e.toLowerCase().includes(termino))
                      : especialidadesAPI;
                    return (
                      <div className="relative">
                        <input
                          type="text"
                          value={busquedaEsp}
                          onChange={e => { setBusquedaEsp(e.target.value); setMostrarDropEsp(true); if (!e.target.value) { setEspecialidadSeleccionada(''); setMedicoSeleccionado(''); setBusquedaProf(''); } }}
                          onFocus={() => setMostrarDropEsp(true)}
                          onBlur={() => setTimeout(() => setMostrarDropEsp(false), 150)}
                          placeholder={cargandoEsps ? 'Cargando...' : 'Buscar especialidad...'}
                          disabled={cargandoEsps}
                          className={`w-full px-3 py-2 border-2 rounded-lg text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-green-500/30 ${
                            especialidadSeleccionada ? 'bg-white border-green-500 text-green-900' : 'bg-green-50 border-green-300 text-gray-600'
                          }`}
                        />
                        {mostrarDropEsp && !cargandoEsps && (
                          <ul className="absolute z-50 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto text-sm">
                            {filtradas.length === 0 ? (
                              <li className="px-3 py-2 text-gray-400 italic">Sin resultados</li>
                            ) : filtradas.map(esp => (
                              <li key={esp}
                                onMouseDown={() => { setEspecialidadSeleccionada(esp); setBusquedaEsp(esp); setMostrarDropEsp(false); setMedicoSeleccionado(''); setBusquedaProf(''); }}
                                className={`px-3 py-2 cursor-pointer hover:bg-green-50 ${especialidadSeleccionada === esp ? 'bg-green-100 font-semibold text-green-900' : 'text-gray-800'}`}
                              >{esp}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Profesional */}
                <div className={`p-3 rounded-xl border-2 transition-all mb-3 ${!especialidadSeleccionada ? 'bg-gray-50 border-gray-200 opacity-50 pointer-events-none' : 'bg-blue-50 border-blue-300'}`}>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Profesional de Salud</label>
                  {!especialidadSeleccionada ? (
                    <div className="px-3 py-2 border-2 border-gray-300 rounded-lg bg-gray-100 text-gray-400 text-sm">Primero selecciona una especialidad</div>
                  ) : (
                    <div className="relative">
                      <input
                        type="text"
                        value={busquedaProf}
                        onChange={e => { setBusquedaProf(e.target.value); setMostrarDropProf(true); if (!e.target.value) setMedicoSeleccionado(''); }}
                        onFocus={() => setMostrarDropProf(true)}
                        onBlur={() => setTimeout(() => setMostrarDropProf(false), 150)}
                        placeholder={medicosDisponibles.length === 0 ? 'Sin profesionales disponibles' : 'Buscar por nombre o DNI...'}
                        disabled={medicosDisponibles.length === 0}
                        className={`w-full px-3 py-2 border-2 rounded-lg text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/30 ${
                          medicoSeleccionado ? 'bg-white border-blue-500 text-blue-900' : 'bg-white border-blue-300 text-gray-700'
                        }`}
                      />
                      {mostrarDropProf && medicosDisponibles.length > 0 && (() => {
                        const termino = busquedaProf.toLowerCase().trim();
                        const filtrados = termino ? medicosDisponibles.filter(m => formatearLabelEspecialista(m).toLowerCase().includes(termino)) : medicosDisponibles;
                        return filtrados.length > 0 ? (
                          <ul className="absolute z-50 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto text-sm">
                            <li className="px-3 py-2 text-gray-400 italic cursor-pointer hover:bg-gray-50"
                              onMouseDown={() => { setMedicoSeleccionado(''); setBusquedaProf(''); setMostrarDropProf(false); }}>
                              Sin asignar (opcional)
                            </li>
                            {filtrados.map(m => (
                              <li key={m.idPers}
                                onMouseDown={() => { setMedicoSeleccionado(String(m.idPers)); setBusquedaProf(formatearLabelEspecialista(m)); setMostrarDropProf(false); }}
                                className={`px-3 py-2 cursor-pointer hover:bg-blue-50 ${String(medicoSeleccionado) === String(m.idPers) ? 'bg-blue-100 font-semibold text-blue-900' : 'text-gray-800'}`}
                              >{formatearLabelEspecialista(m)}</li>
                            ))}
                          </ul>
                        ) : (
                          <ul className="absolute z-50 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 text-sm">
                            <li className="px-3 py-2 text-gray-400 italic">Sin resultados</li>
                          </ul>
                        );
                      })()}
                    </div>
                  )}
                </div>

                {/* Fecha y Hora */}
                <div className={`p-3 rounded-xl border-2 transition-all ${!medicoSeleccionado ? 'bg-gray-50 border-gray-200 opacity-50 pointer-events-none' : 'bg-purple-50 border-purple-300'}`}>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Fecha y Hora de Cita</label>
                  {!medicoSeleccionado ? (
                    <div className="px-3 py-2 border-2 border-gray-300 rounded-lg bg-gray-100 text-gray-400 text-sm">Primero selecciona un profesional</div>
                  ) : (
                    <div className="space-y-2">
                      <input
                        type="date"
                        value={fechaHora?.split('T')[0] || ''}
                        onChange={e => setFechaHora(e.target.value)}
                        min={hoy}
                        className="w-full px-3 py-2 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 focus:outline-none text-sm"
                      />
                      {/* Drum */}
                      <div>
                        <label className="text-xs text-gray-600 font-medium mb-1 block">Horario</label>
                        <div className="flex gap-2">
                          {/* Horas */}
                          <div className="flex-1">
                            <p className="text-center text-xs text-gray-400 mb-1">Hora</p>
                            <div className="relative rounded-xl overflow-hidden border-2 border-purple-200 bg-white shadow-inner" style={{ height: DRUM_ITEM_H * 5 }}>
                              <div className="absolute inset-x-0 pointer-events-none z-10" style={{ top: DRUM_ITEM_H * 2, height: DRUM_ITEM_H, background: 'rgba(124,58,237,0.12)', borderTop: '2px solid #7c3aed', borderBottom: '2px solid #7c3aed' }} />
                              <div className="absolute inset-x-0 top-0 pointer-events-none z-10" style={{ height: DRUM_ITEM_H * 2, background: 'linear-gradient(to bottom, rgba(255,255,255,0.95), rgba(255,255,255,0))' }} />
                              <div className="absolute inset-x-0 bottom-0 pointer-events-none z-10" style={{ height: DRUM_ITEM_H * 2, background: 'linear-gradient(to top, rgba(255,255,255,0.95), rgba(255,255,255,0))' }} />
                              <div ref={hourRef} onScroll={() => handleDrumScroll('hour')} className="absolute inset-0 overflow-y-scroll" style={{ scrollSnapType: 'y mandatory', scrollbarWidth: 'none' }}>
                                <div style={{ paddingTop: DRUM_ITEM_H * 2, paddingBottom: DRUM_ITEM_H * 2 }}>
                                  {DRUM_HOURS.map(h => {
                                    const p = h < 12 ? 'a.m.' : 'p.m.';
                                    const h12 = h === 12 ? 12 : h > 12 ? h - 12 : h;
                                    return (
                                      <div key={h} style={{ height: DRUM_ITEM_H, scrollSnapAlign: 'center' }}
                                        className={`flex items-center justify-center cursor-pointer select-none font-semibold text-sm transition-all ${selH === h ? 'text-purple-700' : 'text-gray-500'}`}
                                        onClick={() => {
                                          const fa = fechaHora?.split('T')[0] || '';
                                          if (!fa) return;
                                          setFechaHora(`${fa}T${String(h).padStart(2, '0')}:${String(selM).padStart(2, '0')}`);
                                          if (hourRef.current) hourRef.current.scrollTop = DRUM_HOURS.indexOf(h) * DRUM_ITEM_H;
                                        }}
                                      >{String(h12).padStart(2, '0')} {p}</div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-center text-2xl font-bold text-purple-400 pb-1">:</div>
                          {/* Minutos */}
                          <div className="flex-1">
                            <p className="text-center text-xs text-gray-400 mb-1">Minutos</p>
                            <div className="relative rounded-xl overflow-hidden border-2 border-purple-200 bg-white shadow-inner" style={{ height: DRUM_ITEM_H * 5 }}>
                              <div className="absolute inset-x-0 pointer-events-none z-10" style={{ top: DRUM_ITEM_H * 2, height: DRUM_ITEM_H, background: 'rgba(124,58,237,0.12)', borderTop: '2px solid #7c3aed', borderBottom: '2px solid #7c3aed' }} />
                              <div className="absolute inset-x-0 top-0 pointer-events-none z-10" style={{ height: DRUM_ITEM_H * 2, background: 'linear-gradient(to bottom, rgba(255,255,255,0.95), rgba(255,255,255,0))' }} />
                              <div className="absolute inset-x-0 bottom-0 pointer-events-none z-10" style={{ height: DRUM_ITEM_H * 2, background: 'linear-gradient(to top, rgba(255,255,255,0.95), rgba(255,255,255,0))' }} />
                              <div ref={minuteRef} onScroll={() => handleDrumScroll('minute')} className="absolute inset-0 overflow-y-scroll" style={{ scrollSnapType: 'y mandatory', scrollbarWidth: 'none' }}>
                                <div style={{ paddingTop: DRUM_ITEM_H * 2, paddingBottom: DRUM_ITEM_H * 2 }}>
                                  {DRUM_MINUTES.map(m => {
                                    const mm = String(m).padStart(2, '0');
                                    const slot = `${String(selH).padStart(2, '0')}:${mm}`;
                                    const ocupado = horasOcupadas.includes(slot);
                                    return (
                                      <div key={m} style={{ height: DRUM_ITEM_H, scrollSnapAlign: 'center' }}
                                        className={`flex items-center justify-center gap-1 cursor-pointer select-none font-semibold text-sm transition-all
                                          ${ocupado ? 'text-red-400 cursor-not-allowed' : ''}
                                          ${selM === m && !ocupado ? 'text-purple-700' : ''}
                                          ${!ocupado && selM !== m ? 'text-gray-500' : ''}`}
                                        onClick={() => {
                                          if (ocupado) return;
                                          const fa = fechaHora?.split('T')[0] || '';
                                          if (!fa) return;
                                          setFechaHora(`${fa}T${String(selH).padStart(2, '0')}:${mm}`);
                                          if (minuteRef.current) minuteRef.current.scrollTop = DRUM_MINUTES.indexOf(m) * DRUM_ITEM_H;
                                        }}
                                      >
                                        <span>{mm}</span>
                                        {ocupado && <span className="text-xs text-red-400">✕</span>}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          {fechaHora?.includes('T') ? (() => {
                            const [, t] = fechaHora.split('T');
                            const [hh, mm] = t.split(':').map(Number);
                            const p = hh < 12 ? 'a. m.' : 'p. m.';
                            const h12 = hh === 12 ? 12 : hh > 12 ? hh - 12 : hh;
                            const ocupado = horasOcupadas.includes(t);
                            return (
                              <p className={`text-xs font-semibold ${ocupado ? 'text-red-600' : 'text-purple-700'}`}>
                                {ocupado ? '⚠ Horario ocupado' : `Seleccionado: ${String(h12).padStart(2, '0')}:${String(mm).padStart(2, '0')} ${p}`}
                              </p>
                            );
                          })() : <span className="text-xs text-gray-400">Desplaza para seleccionar hora</span>}
                          {horasOcupadas.length > 0 && <span className="text-xs text-amber-600 font-medium">{horasOcupadas.length} ocupados</span>}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {errorMsg && (
                <div className="flex items-start gap-2 p-3 bg-red-50 ring-1 ring-red-100 rounded-xl">
                  <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-[12px] text-red-800">{errorMsg}</p>
                </div>
              )}

              {/* Botones */}
              <div className="flex items-center gap-2 pt-1">
                <button type="button" onClick={onClose} disabled={creando}
                  className="px-4 py-2 rounded-xl text-[13px] text-gray-500 font-medium hover:bg-gray-100 disabled:opacity-50 transition-colors">
                  Cancelar
                </button>
                <div className="flex-1" />
                <button type="button" onClick={handleCrear}
                  disabled={creando || !motivo.trim()}
                  className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 text-white rounded-xl text-[13px] font-semibold hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors">
                  {creando
                    ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Creando...</>
                    : <><PlusCircle className="w-4 h-4" />Crear Nueva Cita</>}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────
const PacientesAnulados = () => {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [busquedaInput, setBusquedaInput] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const PAGE_SIZE = 50;

  const [modalRow, setModalRow] = useState(null);

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page, size: PAGE_SIZE });
      if (busqueda) params.set('busqueda', busqueda);
      const res = await apiClient.get(`/mesa-ayuda/pacientes-anulados?${params}`, true);
      setData(res.data || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 0);
    } catch (err) {
      setError('No se pudo cargar la lista de pacientes anulados.');
    } finally {
      setLoading(false);
    }
  }, [busqueda, page]);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  const handleBuscar = (e) => { e.preventDefault(); setPage(0); setBusqueda(busquedaInput.trim()); };
  const handleLimpiar = () => { setBusquedaInput(''); setBusqueda(''); setPage(0); };

  const formatFecha = (fecha) => {
    if (!fecha) return '—';
    try {
      return new Date(fecha).toLocaleString('es-PE', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch { return fecha; }
  };

  return (
    <>
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2.5 bg-red-100 rounded-xl">
            <UserX className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Pacientes Anulados</h1>
            <p className="text-sm text-gray-500">Historial de atenciones anuladas en el sistema</p>
          </div>
        </div>
      </div>

      {/* Leyenda informativa */}
      <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800 leading-relaxed">
          <p className="font-semibold mb-1">¿Por qué aparece este paciente aquí?</p>
          <p>
            Al anular una cita, el paciente es <span className="font-semibold">retirado de la bandeja del profesional de salud</span>.
            El registro queda preservado para <span className="font-semibold">trazabilidad y auditoría</span>.
            Si requiere nueva atención, usa el botón <span className="font-semibold">Nueva Cita</span> — puedes asignar médico y fecha directamente.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-red-100 shadow-sm p-4 flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-lg"><AlertTriangle className="w-5 h-5 text-red-500" /></div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Anulados</p>
            <p className="text-2xl font-bold text-red-600">{total.toLocaleString('es-PE')}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-lg"><FileText className="w-5 h-5 text-blue-500" /></div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Mostrando</p>
            <p className="text-2xl font-bold text-blue-600">{data.length.toLocaleString('es-PE')}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
          <div className="p-3 bg-orange-50 rounded-lg"><Calendar className="w-5 h-5 text-orange-500" /></div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Páginas</p>
            <p className="text-2xl font-bold text-orange-600">{totalPages}</p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-4">
        <form onSubmit={handleBuscar} className="flex gap-3 flex-wrap items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-gray-600 mb-1">Buscar (DNI, nombre, especialidad)</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text" value={busquedaInput}
                onChange={e => setBusquedaInput(e.target.value)}
                placeholder="Ej: 12345678 o Juan Pérez..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            </div>
          </div>
          <button type="submit" className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2">
            <Search className="w-4 h-4" />Buscar
          </button>
          <button type="button" onClick={handleLimpiar} className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />Limpiar
          </button>
          <button type="button" onClick={cargarDatos} className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />Recargar
          </button>
        </form>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-gray-500">
            <RefreshCw className="w-5 h-5 animate-spin" /><span className="text-sm">Cargando pacientes anulados...</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-16 gap-3 text-red-500">
            <AlertTriangle className="w-5 h-5" /><span className="text-sm">{error}</span>
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
            <UserX className="w-10 h-10" />
            <p className="text-sm font-medium">No se encontraron pacientes anulados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">#</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">
                    <div className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" />Paciente</div>
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">DNI</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">
                    <div className="flex items-center gap-1.5"><Stethoscope className="w-3.5 h-3.5" />Especialidad</div>
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">
                    <div className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" />IPRESS</div>
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Médico asignado</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Motivo anulación</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">Anulado por</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">
                    <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />Fecha anulación</div>
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-600 whitespace-nowrap text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.map((row, idx) => (
                  <tr key={row.idSolicitud ?? idx} className="hover:bg-red-50/30 transition-colors">
                    <td className="px-4 py-3 text-gray-400 text-xs">{page * PAGE_SIZE + idx + 1}</td>
                    <td className="px-4 py-3"><span className="font-medium text-gray-900">{row.pacienteNombre || '—'}</span></td>
                    <td className="px-4 py-3"><span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{row.pacienteDni || '—'}</span></td>
                    <td className="px-4 py-3 text-gray-700">{row.especialidad || '—'}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs max-w-[160px] truncate" title={row.ipress}>{row.ipress || '—'}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{row.medicoNombre?.trim() || '—'}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full max-w-[200px] inline-block truncate" title={row.motivoAnulacion}>
                        {row.motivoAnulacion || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{row.anuladoPor || '—'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{formatFecha(row.fechaAnulacion)}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setModalRow(row)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap mx-auto"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />Nueva Cita
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginación */}
        {!loading && !error && totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-500">Página {page + 1} de {totalPages} — {total.toLocaleString('es-PE')} registros totales</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                Anterior
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>

    {/* Modal */}
    {modalRow && (
      <NuevaCitaModal
        row={modalRow}
        onClose={() => setModalRow(null)}
        onSuccess={cargarDatos}
      />
    )}
    </>
  );
};

export default PacientesAnulados;

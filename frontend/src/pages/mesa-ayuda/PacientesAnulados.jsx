// ========================================================================
// PacientesAnulados.jsx - Lista de pacientes anulados (Mesa de Ayuda)
// ========================================================================

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  UserX, Search, RefreshCw, Calendar, User, Building2, Stethoscope,
  FileText, AlertTriangle, PlusCircle, X, CheckCircle, Loader2, Filter, ChevronDown, ChevronUp
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

  const [especialidadesAPI, setEspecialidadesAPI] = useState([]);
  const [cargandoEsps, setCargandoEsps] = useState(false);
  const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState(row.especialidad || '');
  const [busquedaEsp, setBusquedaEsp] = useState(row.especialidad || '');
  const [mostrarDropEsp, setMostrarDropEsp] = useState(false);

  const [medicosDisponibles, setMedicosDisponibles] = useState([]);
  const [medicoSeleccionado, setMedicoSeleccionado] = useState('');
  const [busquedaProf, setBusquedaProf] = useState('');
  const [mostrarDropProf, setMostrarDropProf] = useState(false);

  const [fechaHora, setFechaHora] = useState('');
  const [horasOcupadas, setHorasOcupadas] = useState([]);
  const [motivo, setMotivo] = useState('');

  const [creando, setCreando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const hourRef = useRef(null);
  const minuteRef = useRef(null);

  useEffect(() => {
    setCargandoEsps(true);
    fetch(`${API_BASE}/especialidades/activas`, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then(r => r.ok ? r.json() : [])
      .then(data => setEspecialidadesAPI(
        (Array.isArray(data) ? data : []).map(e => e.descripcion?.toUpperCase()?.trim()).filter(Boolean).sort()
      ))
      .catch(() => {})
      .finally(() => setCargandoEsps(false));
  }, []); // eslint-disable-line

  useEffect(() => {
    if (!especialidadSeleccionada) { setMedicosDisponibles([]); setMedicoSeleccionado(''); setBusquedaProf(''); return; }
    fetch(`${API_BASE}/bolsas/solicitudes/fetch-doctors-by-specialty?especialidad=${encodeURIComponent(especialidadSeleccionada)}`,
      { method: 'POST', headers: getHeaders() })
      .then(r => r.ok ? r.json() : { data: [] })
      .then(res => {
        const ordenados = [...(res.data || [])].sort((a, b) => {
          const c = obtenerApellidoPaterno(a).localeCompare(obtenerApellidoPaterno(b), 'es', { sensitivity: 'base' });
          return c !== 0 ? c : formatearNombreEspecialista(a).localeCompare(formatearNombreEspecialista(b), 'es', { sensitivity: 'base' });
        });
        setMedicosDisponibles(ordenados);
      })
      .catch(() => setMedicosDisponibles([]));
    setMedicoSeleccionado(''); setBusquedaProf('');
  }, [especialidadSeleccionada]); // eslint-disable-line

  useEffect(() => {
    const fecha = fechaHora?.split('T')[0];
    if (!medicoSeleccionado || !fecha) return;
    fetch(`${API_BASE}/bolsas/solicitudes/horas-ocupadas?idPersonal=${medicoSeleccionado}&fecha=${fecha}`,
      { headers: { Authorization: `Bearer ${getToken()}` } })
      .then(r => r.ok ? r.json() : {})
      .then(d => setHorasOcupadas(d.horasOcupadas || []))
      .catch(() => {});
  }, [medicoSeleccionado, fechaHora?.split('T')[0]]); // eslint-disable-line

  useEffect(() => {
    const time = fechaHora?.split('T')[1];
    if (!time) return;
    const [h, m] = time.split(':').map(Number);
    const hIdx = DRUM_HOURS.indexOf(h); const mIdx = DRUM_MINUTES.indexOf(m);
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
      const fa = fechaHora?.split('T')[0] || ''; if (!fa) return;
      const [currH, currM] = (fechaHora?.split('T')[1] || '07:00').split(':').map(Number);
      const newH = tipo === 'hour' ? arr[clamped] : currH;
      const newM = tipo === 'minute' ? arr[clamped] : currM;
      setFechaHora(`${fa}T${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`);
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
      const res = await apiClient.post(`/bolsas/solicitudes/${row.idSolicitud}/nueva-cita-desde-anulacion`, body);
      setResultado(res.data || res);
      if (onSuccess) onSuccess();
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Error al crear la nueva cita. Intente nuevamente.');
    } finally { setCreando(false); }
  };

  const hoy = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; })();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden">

        {/* Header — mismo estilo que RegistrarCitaAdicionalModal */}
        <div className="bg-gradient-to-r from-blue-600 to-teal-600 px-6 py-4 flex items-center justify-between rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              {resultado ? <CheckCircle className="w-5 h-5 text-white" /> : <PlusCircle className="w-5 h-5 text-white" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Nueva Cita desde Anulación</h2>
              <p className="text-blue-100 text-xs">
                {resultado ? 'Cita creada correctamente' : 'Revisa los datos del paciente y completa la nueva cita'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Éxito */}
        {resultado ? (
          <div className="p-10 text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Cita creada correctamente</h3>
            <p className="text-gray-600">
              Se ha generado una nueva solicitud para{' '}
              <span className="font-semibold">{row.pacienteNombre}</span>{' '}
              en estado{' '}
              <span className="font-semibold text-blue-600">
                {medicoSeleccionado && fechaHora ? 'Citado' : 'Pendiente de Citar'}
              </span>
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 inline-block text-left">
              <p className="text-xs text-blue-500 font-semibold uppercase tracking-wide mb-1">N° Solicitud</p>
              <p className="font-mono font-bold text-blue-900 text-xl">{resultado.numeroSolicitud}</p>
              <p className="text-xs text-blue-500 mt-0.5">Origen: solicitud #{resultado.idSolicitudOrigen}</p>
            </div>
            <div className="flex gap-3 justify-center pt-2">
              <button onClick={onClose}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors">
                Cerrar
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Cuerpo: 2 columnas */}
            <div className="grid grid-cols-2 divide-x divide-gray-200">

              {/* COLUMNA IZQUIERDA — Datos del paciente anulado */}
              <div className="p-5 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold bg-blue-600 text-white">1</span>
                  <span className="text-sm font-semibold text-gray-700">Datos del paciente</span>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>

                {/* Card paciente */}
                <div className="border border-green-200 bg-green-50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="font-semibold text-sm text-green-700">Paciente identificado</span>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-green-100 space-y-2">
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                      <div>
                        <p className="text-xs text-gray-400">DNI</p>
                        <p className="text-sm font-semibold text-gray-800">{row.pacienteDni || '—'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Especialidad origen</p>
                        <p className="text-sm font-semibold text-gray-800">{row.especialidad || '—'}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Nombre completo</p>
                      <p className="text-sm font-bold text-gray-800">{row.pacienteNombre || '—'}</p>
                    </div>
                    {row.ipress && (
                      <div>
                        <p className="text-xs text-gray-400">IPRESS</p>
                        <p className="text-sm font-semibold text-gray-800">{row.ipress}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Motivo anulación */}
                {row.motivoAnulacion && (
                  <div className="border border-red-200 bg-red-50 rounded-xl p-3">
                    <p className="text-xs text-red-500 font-semibold uppercase tracking-wide mb-1">Motivo de anulación original</p>
                    <p className="text-sm text-red-800">{row.motivoAnulacion}</p>
                  </div>
                )}

                {/* Aviso */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2 items-start">
                  <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 leading-relaxed">
                    El registro anulado <span className="font-semibold">no se modifica</span>. Se creará una nueva solicitud independiente.
                    Si asignas médico y fecha, el paciente quedará <span className="font-semibold">Citado</span> directamente.
                  </p>
                </div>

                {/* Motivo nueva cita */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">
                    Motivo de la nueva cita <span className="text-red-500 font-bold">*</span>
                  </label>
                  <textarea
                    value={motivo}
                    onChange={e => setMotivo(e.target.value)}
                    placeholder="Ej: Paciente solicita reagendamiento, condición médica persiste..."
                    rows={3}
                    autoFocus
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  />
                </div>
              </div>

              {/* COLUMNA DERECHA — Datos de la cita */}
              <div className="p-5 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold bg-blue-600 text-white">2</span>
                  <span className="text-sm font-semibold text-gray-700">Datos de la cita</span>
                  <span className="text-xs text-gray-400">(opcionales)</span>
                </div>

                {/* Especialidad */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg border-2 border-green-300">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Especialidad / Servicio
                  </label>
                  {(() => {
                    const termino = busquedaEsp.toLowerCase().trim();
                    const filtradas = termino ? especialidadesAPI.filter(e => e.toLowerCase().includes(termino)) : especialidadesAPI;
                    return (
                      <div className="relative">
                        <input type="text" value={busquedaEsp}
                          onChange={e => { setBusquedaEsp(e.target.value); setMostrarDropEsp(true); if (!e.target.value) { setEspecialidadSeleccionada(''); setMedicoSeleccionado(''); setBusquedaProf(''); } }}
                          onFocus={() => setMostrarDropEsp(true)}
                          onBlur={() => setTimeout(() => setMostrarDropEsp(false), 150)}
                          placeholder={cargandoEsps ? 'Cargando especialidades...' : 'Buscar especialidad...'}
                          disabled={cargandoEsps}
                          className={`w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 text-sm font-medium transition-all ${
                            especialidadSeleccionada ? 'bg-white border-green-500 text-green-900' : 'bg-green-50 border-green-300 text-gray-500'
                          }`}
                        />
                        {mostrarDropEsp && !cargandoEsps && (
                          <ul className="absolute z-50 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto text-sm">
                            {filtradas.length === 0
                              ? <li className="px-3 py-2 text-gray-400 italic">Sin resultados</li>
                              : <>
                                  <li className="px-3 py-1 text-xs font-bold text-gray-400 uppercase tracking-wide bg-gray-50 border-b">Especialidades / Servicios</li>
                                  {filtradas.map(esp => (
                                    <li key={esp}
                                      onMouseDown={() => { setEspecialidadSeleccionada(esp); setBusquedaEsp(esp); setMostrarDropEsp(false); setMedicoSeleccionado(''); setBusquedaProf(''); }}
                                      className={`px-3 py-2 cursor-pointer hover:bg-green-50 ${especialidadSeleccionada === esp ? 'bg-green-100 font-semibold text-green-900' : 'text-gray-800'}`}
                                    >{esp}</li>
                                  ))}
                                </>
                            }
                          </ul>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Profesional */}
                <div className={`p-3 rounded-lg border-2 transition-all ${!especialidadSeleccionada ? 'bg-gray-50 border-gray-200 opacity-50 pointer-events-none' : 'bg-blue-50 border-blue-300'}`}>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Profesional de Salud</label>
                  {!especialidadSeleccionada
                    ? <div className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg bg-gray-100 text-gray-400 text-sm">Primero selecciona una especialidad</div>
                    : (
                      <div className="relative">
                        <input type="text" value={busquedaProf}
                          onChange={e => { setBusquedaProf(e.target.value); setMostrarDropProf(true); if (!e.target.value) setMedicoSeleccionado(''); }}
                          onFocus={() => setMostrarDropProf(true)}
                          onBlur={() => setTimeout(() => setMostrarDropProf(false), 150)}
                          placeholder={medicosDisponibles.length === 0 ? 'Sin profesionales disponibles' : 'Buscar por nombre o DNI...'}
                          disabled={medicosDisponibles.length === 0}
                          className={`w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-sm font-medium transition-all ${
                            medicoSeleccionado ? 'bg-white border-blue-500 text-blue-900' : 'bg-white border-blue-300 text-gray-700'
                          }`}
                        />
                        {mostrarDropProf && medicosDisponibles.length > 0 && (() => {
                          const termino = busquedaProf.toLowerCase().trim();
                          const filtrados = termino ? medicosDisponibles.filter(m => formatearLabelEspecialista(m).toLowerCase().includes(termino)) : medicosDisponibles;
                          return filtrados.length > 0 ? (
                            <ul className="absolute z-50 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto text-sm">
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
                              <li className="px-3 py-2 text-gray-400 italic">Sin resultados para "{busquedaProf}"</li>
                            </ul>
                          );
                        })()}
                      </div>
                    )
                  }
                </div>

                {/* Fecha y hora */}
                <div className={`p-3 rounded-lg border-2 transition-all ${!medicoSeleccionado ? 'bg-gray-50 border-gray-200 opacity-50 pointer-events-none' : 'bg-purple-50 border-purple-300'}`}>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Fecha y Hora de Cita</label>
                  {!medicoSeleccionado
                    ? <div className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg bg-gray-100 text-gray-400 text-sm">Primero selecciona un profesional</div>
                    : (
                      <div className="space-y-2">
                        <div>
                          <label className="text-xs text-gray-700 font-medium">Fecha</label>
                          <input type="date"
                            value={fechaHora?.split('T')[0] || ''}
                            onChange={e => setFechaHora(e.target.value)}
                            min={hoy}
                            className="w-full mt-1 px-3 py-2 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-purple-600 text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-700 font-medium mb-2 block">Horario</label>
                          <div className="flex gap-2">
                            {/* Horas drum */}
                            <div className="flex-1">
                              <p className="text-center text-xs text-gray-400 mb-1">Hora</p>
                              <div className="relative rounded-xl overflow-hidden border-2 border-purple-200 bg-white shadow-inner" style={{ height: DRUM_ITEM_H * 5 }}>
                                <div className="absolute inset-x-0 pointer-events-none z-10" style={{ top: DRUM_ITEM_H * 2, height: DRUM_ITEM_H, background: 'rgba(124,58,237,0.12)', borderTop: '2px solid #7c3aed', borderBottom: '2px solid #7c3aed' }} />
                                <div className="absolute inset-x-0 top-0 pointer-events-none z-10" style={{ height: DRUM_ITEM_H * 2, background: 'linear-gradient(to bottom,rgba(255,255,255,0.95),rgba(255,255,255,0))' }} />
                                <div className="absolute inset-x-0 bottom-0 pointer-events-none z-10" style={{ height: DRUM_ITEM_H * 2, background: 'linear-gradient(to top,rgba(255,255,255,0.95),rgba(255,255,255,0))' }} />
                                <div ref={hourRef} onScroll={() => handleDrumScroll('hour')} className="absolute inset-0 overflow-y-scroll" style={{ scrollSnapType: 'y mandatory', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                                  <div style={{ paddingTop: DRUM_ITEM_H * 2, paddingBottom: DRUM_ITEM_H * 2 }}>
                                    {DRUM_HOURS.map(h => {
                                      const p = h < 12 ? 'a.m.' : 'p.m.'; const h12 = h === 12 ? 12 : h > 12 ? h - 12 : h;
                                      return (
                                        <div key={h} style={{ height: DRUM_ITEM_H, scrollSnapAlign: 'center' }}
                                          className={`flex items-center justify-center cursor-pointer select-none font-semibold text-sm transition-all ${selH === h ? 'text-purple-700' : 'text-gray-500'}`}
                                          onClick={() => { const fa = fechaHora?.split('T')[0] || ''; if (!fa) return; setFechaHora(`${fa}T${String(h).padStart(2,'0')}:${String(selM).padStart(2,'0')}`); if (hourRef.current) hourRef.current.scrollTop = DRUM_HOURS.indexOf(h) * DRUM_ITEM_H; }}
                                        >{String(h12).padStart(2,'0')} {p}</div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center justify-center text-2xl font-bold text-purple-400 pb-1">:</div>
                            {/* Minutos drum */}
                            <div className="flex-1">
                              <p className="text-center text-xs text-gray-400 mb-1">Minutos</p>
                              <div className="relative rounded-xl overflow-hidden border-2 border-purple-200 bg-white shadow-inner" style={{ height: DRUM_ITEM_H * 5 }}>
                                <div className="absolute inset-x-0 pointer-events-none z-10" style={{ top: DRUM_ITEM_H * 2, height: DRUM_ITEM_H, background: 'rgba(124,58,237,0.12)', borderTop: '2px solid #7c3aed', borderBottom: '2px solid #7c3aed' }} />
                                <div className="absolute inset-x-0 top-0 pointer-events-none z-10" style={{ height: DRUM_ITEM_H * 2, background: 'linear-gradient(to bottom,rgba(255,255,255,0.95),rgba(255,255,255,0))' }} />
                                <div className="absolute inset-x-0 bottom-0 pointer-events-none z-10" style={{ height: DRUM_ITEM_H * 2, background: 'linear-gradient(to top,rgba(255,255,255,0.95),rgba(255,255,255,0))' }} />
                                <div ref={minuteRef} onScroll={() => handleDrumScroll('minute')} className="absolute inset-0 overflow-y-scroll" style={{ scrollSnapType: 'y mandatory', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                                  <div style={{ paddingTop: DRUM_ITEM_H * 2, paddingBottom: DRUM_ITEM_H * 2 }}>
                                    {DRUM_MINUTES.map(m => {
                                      const mm = String(m).padStart(2,'0'); const slot = `${String(selH).padStart(2,'0')}:${mm}`; const ocupado = horasOcupadas.includes(slot);
                                      return (
                                        <div key={m} style={{ height: DRUM_ITEM_H, scrollSnapAlign: 'center' }}
                                          className={`flex items-center justify-center gap-1 cursor-pointer select-none font-semibold text-sm transition-all ${ocupado ? 'text-red-400 cursor-not-allowed' : ''} ${selM === m && !ocupado ? 'text-purple-700' : ''} ${!ocupado && selM !== m ? 'text-gray-500' : ''}`}
                                          onClick={() => { if (ocupado) return; const fa = fechaHora?.split('T')[0] || ''; if (!fa) return; setFechaHora(`${fa}T${String(selH).padStart(2,'0')}:${mm}`); if (minuteRef.current) minuteRef.current.scrollTop = DRUM_MINUTES.indexOf(m) * DRUM_ITEM_H; }}
                                        >
                                          <span>{mm}</span>{ocupado && <span className="text-xs text-red-400">✕</span>}
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
                              const [, t] = fechaHora.split('T'); const [hh, mm] = t.split(':').map(Number);
                              const p = hh < 12 ? 'a. m.' : 'p. m.'; const h12 = hh === 12 ? 12 : hh > 12 ? hh - 12 : hh;
                              const ocupado = horasOcupadas.includes(t);
                              return <p className={`text-xs font-semibold ${ocupado ? 'text-red-600' : 'text-purple-700'}`}>{ocupado ? '⚠ Horario ocupado' : `Seleccionado: ${String(h12).padStart(2,'0')}:${String(mm).padStart(2,'0')} ${p}`}</p>;
                            })() : <span className="text-xs text-gray-400">Desplaza para seleccionar hora</span>}
                            {horasOcupadas.length > 0 && <span className="text-xs text-amber-600 font-medium">{horasOcupadas.length} ocupados</span>}
                          </div>
                        </div>
                      </div>
                    )
                  }
                </div>

                {errorMsg && (
                  <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-red-800">{errorMsg}</p>
                  </div>
                )}

                {/* Botón crear */}
                <button onClick={handleCrear}
                  disabled={creando || !motivo.trim()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm">
                  {creando ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
                  {creando ? 'Creando cita...' : 'Crear Nueva Cita'}
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 rounded-b-xl">
              <button onClick={onClose} className="w-full px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors">
                Cerrar
              </button>
            </div>
          </>
        )}
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
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const PAGE_SIZE = 50;

  // Filtros
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [filtros, setFiltros] = useState({ busqueda: '', especialidad: '', ipress: '', medico: '', motivoAnulacion: '', anuladoPor: '', fechaDesde: '', fechaHasta: '' });
  const [filtrosInput, setFiltrosInput] = useState({ busqueda: '', especialidad: '', ipress: '', medico: '', motivoAnulacion: '', anuladoPor: '', fechaDesde: '', fechaHasta: '' });

  const [modalRow, setModalRow] = useState(null);

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page, size: PAGE_SIZE });
      if (filtros.busqueda)        params.set('busqueda', filtros.busqueda);
      if (filtros.especialidad)    params.set('especialidad', filtros.especialidad);
      if (filtros.ipress)          params.set('ipress', filtros.ipress);
      if (filtros.medico)          params.set('medico', filtros.medico);
      if (filtros.motivoAnulacion) params.set('motivoAnulacion', filtros.motivoAnulacion);
      if (filtros.anuladoPor)      params.set('anuladoPor', filtros.anuladoPor);
      if (filtros.fechaDesde)      params.set('fechaDesde', filtros.fechaDesde);
      if (filtros.fechaHasta)      params.set('fechaHasta', filtros.fechaHasta);
      const res = await apiClient.get(`/mesa-ayuda/pacientes-anulados?${params}`, true);
      setData(res.data || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 0);
    } catch (err) {
      setError('No se pudo cargar la lista de pacientes anulados.');
    } finally {
      setLoading(false);
    }
  }, [filtros, page]);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  const setInput = (campo, valor) => setFiltrosInput(prev => ({ ...prev, [campo]: valor }));

  const handleBuscar = (e) => {
    e.preventDefault();
    setPage(0);
    setFiltros({ ...filtrosInput });
  };

  const handleLimpiar = () => {
    const empty = { busqueda: '', especialidad: '', ipress: '', medico: '', motivoAnulacion: '', anuladoPor: '', fechaDesde: '', fechaHasta: '' };
    setFiltrosInput(empty);
    setFiltros(empty);
    setPage(0);
  };

  const hayFiltrosActivos = Object.values(filtros).some(v => v !== '');

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
        <form onSubmit={handleBuscar}>
          {/* Fila principal */}
          <div className="flex gap-3 flex-wrap items-end">
            <div className="flex-1 min-w-[220px]">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Buscar (DNI o nombre)</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" value={filtrosInput.busqueda}
                  onChange={e => setInput('busqueda', e.target.value)}
                  placeholder="Ej: 12345678 o Juan Pérez..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>
            </div>
            <button type="button" onClick={() => setMostrarFiltros(v => !v)}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 ${mostrarFiltros ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              <Filter className="w-4 h-4" />
              Filtros avanzados
              {mostrarFiltros ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              {hayFiltrosActivos && <span className="ml-1 w-2 h-2 bg-red-500 rounded-full" />}
            </button>
            <button type="submit" className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2">
              <Search className="w-4 h-4" />Buscar
            </button>
            <button type="button" onClick={handleLimpiar} className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />Limpiar
            </button>
          </div>

          {/* Filtros avanzados */}
          {mostrarFiltros && (
            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Especialidad</label>
                <input type="text" value={filtrosInput.especialidad}
                  onChange={e => setInput('especialidad', e.target.value)}
                  placeholder="Ej: Cardiología"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">IPRESS</label>
                <input type="text" value={filtrosInput.ipress}
                  onChange={e => setInput('ipress', e.target.value)}
                  placeholder="Nombre de la IPRESS"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Médico asignado</label>
                <input type="text" value={filtrosInput.medico}
                  onChange={e => setInput('medico', e.target.value)}
                  placeholder="Nombre del médico"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Motivo anulación</label>
                <input type="text" value={filtrosInput.motivoAnulacion}
                  onChange={e => setInput('motivoAnulacion', e.target.value)}
                  placeholder="Texto del motivo"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Anulado por</label>
                <input type="text" value={filtrosInput.anuladoPor}
                  onChange={e => setInput('anuladoPor', e.target.value)}
                  placeholder="Usuario que anuló"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Fecha anulación — Desde</label>
                <input type="date" value={filtrosInput.fechaDesde}
                  onChange={e => setInput('fechaDesde', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Fecha anulación — Hasta</label>
                <input type="date" value={filtrosInput.fechaHasta}
                  onChange={e => setInput('fechaHasta', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>
          )}
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

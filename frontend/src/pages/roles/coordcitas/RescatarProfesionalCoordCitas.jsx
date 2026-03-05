import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Search, RefreshCw, AlertCircle, X,
  CheckCircle, User, ArrowRightLeft, Ban, Stethoscope, ChevronDown
} from 'lucide-react';

/**
 * RescatarProfesionalCoordCitas v1.1.0
 * Flujo: Buscar paciente por DNI → clic Rescatar/Reasignar →
 *        Modal: (1) seleccionar especialidad → (2) seleccionar profesional de esa especialidad → confirmar
 */

function getToken() {
  return (
    localStorage.getItem('token') ||
    localStorage.getItem('auth.token') ||
    sessionStorage.getItem('token') ||
    null
  );
}

const API_BASE = (() => {
  let url = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8080';
  url = url.replace(/http:\/\/localhost/, 'http://127.0.0.1');
  if (!url.endsWith('/api')) url = url.endsWith('/') ? url + 'api' : url + '/api';
  return url;
})();

// ─── Badges ──────────────────────────────────────────────────────────────────

function BadgeCondicion({ valor }) {
  const v = (valor || '').toLowerCase();
  if (v.includes('deserci') || v.includes('desercio'))
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">{valor}</span>;
  if (v === 'pendiente')
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 border border-yellow-200">{valor}</span>;
  if (v === 'atendido')
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">{valor}</span>;
  return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">{valor || '—'}</span>;
}

function BadgeEstado({ valor }) {
  const v = (valor || '').toUpperCase();
  const map = {
    PENDIENTE: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    ATENDIDO:  'bg-green-100  text-green-700  border-green-200',
    ANULADO:   'bg-gray-100   text-gray-500   border-gray-200',
    CITADO:    'bg-blue-100   text-blue-700   border-blue-200',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${map[v] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
      {valor || '—'}
    </span>
  );
}

// ─── Select flotante de profesional (portal para escapar overflow) ────────────

function SelectProfesional({ value, onChange, profesionales, disabled }) {
  const [query,   setQuery]   = useState('');
  const [open,    setOpen]    = useState(false);
  const [dropPos, setDropPos] = useState({ top: 0, left: 0, width: 0 });
  const inputRef = useRef(null);
  const listRef  = useRef(null);

  const filtered = query.trim()
    ? profesionales.filter(p =>
        p.nombreCompleto.toLowerCase().includes(query.toLowerCase()) ||
        (p.numDoc || '').includes(query)
      )
    : profesionales;

  const openDropdown = () => {
    if (disabled) return;
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    }
    setOpen(true);
  };

  const select = (p) => { onChange(String(p.idPersonal)); setQuery(p.nombreCompleto); setOpen(false); };
  const clear  = ()  => { onChange(''); setQuery(''); setOpen(false); };

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (inputRef.current && !inputRef.current.contains(e.target) &&
          listRef.current  && !listRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <>
      <div className="relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); openDropdown(); }}
          onFocus={openDropdown}
          disabled={disabled}
          placeholder={disabled ? 'Selecciona una especialidad primero...' : 'Escribe nombre o DNI del profesional...'}
          autoComplete="off"
          className={`w-full pl-8 pr-8 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0a5ba9] bg-white
            ${disabled ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed' : 'border-gray-300'}`}
        />
        {!disabled && (query || value) && (
          <button onMouseDown={clear} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500">
            <X size={13} />
          </button>
        )}
      </div>
      {open && !disabled && createPortal(
        <div ref={listRef} style={{ position: 'fixed', top: dropPos.top, left: dropPos.left, width: dropPos.width, zIndex: 9999 }}
          className="bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden">
          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0
              ? <div className="px-3 py-3 text-xs text-gray-400 text-center">Sin resultados para &ldquo;{query}&rdquo;</div>
              : filtered.map(p => (
                  <div key={p.idPersonal} onMouseDown={() => select(p)}
                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 flex items-center justify-between gap-2
                      ${String(p.idPersonal) === String(value) ? 'bg-blue-50 text-[#0a5ba9] font-medium' : 'text-gray-800'}`}>
                    <span>{p.nombreCompleto}</span>
                    <span className="text-xs text-gray-400 font-mono shrink-0">{p.numDoc}</span>
                  </div>
                ))
            }
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ mensaje, tipo, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  const esExito = tipo === 'exito';
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium
      ${esExito ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
      {esExito ? <CheckCircle size={18} className="text-green-600" /> : <AlertCircle size={18} className="text-red-600" />}
      {mensaje}
      <button onClick={onClose} className="ml-2 text-gray-400 hover:text-gray-600"><X size={14} /></button>
    </div>
  );
}

// ─── Modal de reasignación con selector de especialidad interno ───────────────

function ModalReasignar({ paciente, especialidades, onConfirmar, onCerrar, guardando }) {
  const [especialidad,          setEspecialidad]          = useState('');
  const [profesionales,         setProfesionales]         = useState([]);
  const [cargandoProf,          setCargandoProf]          = useState(false);
  const [idPersonalSeleccionado, setIdPersonalSeleccionado] = useState('');

  const esDeserccion = (paciente.condicionMedica || '').toLowerCase().includes('deserci');

  // Cargar profesionales cuando se selecciona una especialidad
  useEffect(() => {
    if (!especialidad) { setProfesionales([]); setIdPersonalSeleccionado(''); return; }
    setCargandoProf(true);
    setIdPersonalSeleccionado('');
    fetch(
      `${API_BASE}/bolsas/solicitudes/fetch-doctors-by-specialty?especialidad=${encodeURIComponent(especialidad)}`,
      { method: 'POST', headers: { Authorization: `Bearer ${getToken()}` } }
    )
      .then(r => r.json())
      .then(data => {
        const rawList = data?.data || [];
        setProfesionales(rawList.map(p => ({ idPersonal: p.idPers, nombreCompleto: p.nombre, numDoc: p.documento })));
      })
      .catch(() => setProfesionales([]))
      .finally(() => setCargandoProf(false));
  }, [especialidad]);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#0a5ba9] text-white">
          <div className="flex items-center gap-2">
            <ArrowRightLeft size={20} />
            <span className="font-bold text-base">
              {esDeserccion ? 'Rescatar y Reasignar Paciente' : 'Reasignar Paciente'}
            </span>
          </div>
          <button onClick={onCerrar} className="p-1 rounded-lg hover:bg-white/20 transition"><X size={18} /></button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">

          {/* Datos del paciente */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <p className="text-xs font-semibold text-[#0a5ba9] uppercase tracking-wide mb-2">Datos del paciente</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
              <div>
                <span className="text-gray-500">Nombre:</span>
                <p className="font-semibold text-gray-800 mt-0.5">{paciente.pacienteNombre}</p>
              </div>
              <div>
                <span className="text-gray-500">DNI:</span>
                <p className="font-semibold text-gray-800 font-mono mt-0.5">{paciente.pacienteDni}</p>
              </div>
              <div>
                <span className="text-gray-500">Condicion:</span>
                <div className="mt-0.5"><BadgeCondicion valor={paciente.condicionMedica} /></div>
              </div>
              <div>
                <span className="text-gray-500">Estado:</span>
                <div className="mt-0.5"><BadgeEstado valor={paciente.estado} /></div>
              </div>
              {paciente.especialidad && (
                <div className="col-span-2">
                  <span className="text-gray-500">Especialidad actual:</span>
                  <p className="font-medium text-gray-700 mt-0.5">{paciente.especialidad}</p>
                </div>
              )}
              {paciente.nombreEnfermera && (
                <div className="col-span-2">
                  <span className="text-gray-500">Profesional asignado actual:</span>
                  <p className="font-medium text-gray-700 mt-0.5">{paciente.nombreEnfermera}</p>
                </div>
              )}
            </div>
          </div>

          {/* Cambios que se realizarán */}
          {esDeserccion && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
              <p className="font-semibold mb-1">Al rescatar:</p>
              <ul className="space-y-0.5 list-disc list-inside text-amber-700">
                <li>Condicion medica → <strong>Pendiente</strong></li>
                <li>Estado → <strong>PENDIENTE</strong></li>
                <li>Fecha de atencion medica → <strong>se limpiara</strong></li>
              </ul>
            </div>
          )}

          {/* Paso 1: Seleccionar especialidad */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              <Stethoscope size={12} className="inline mr-1" />
              Especialidad destino <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Stethoscope size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <select
                value={especialidad}
                onChange={e => setEspecialidad(e.target.value)}
                className="w-full pl-8 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0a5ba9] appearance-none bg-white"
              >
                <option value="">— Selecciona especialidad —</option>
                {especialidades.map(esp => (
                  <option key={esp} value={esp}>{esp}</option>
                ))}
              </select>
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Paso 2: Seleccionar profesional (solo si hay especialidad) */}
          {especialidad && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                <User size={12} className="inline mr-1" />
                Nuevo profesional asignado <span className="text-red-500">*</span>
                {cargandoProf && (
                  <span className="ml-2 text-gray-400 font-normal">
                    <RefreshCw size={10} className="inline animate-spin mr-1" />Cargando...
                  </span>
                )}
              </label>
              <SelectProfesional
                value={idPersonalSeleccionado}
                onChange={setIdPersonalSeleccionado}
                profesionales={profesionales}
                disabled={cargandoProf}
              />
              {!cargandoProf && profesionales.length === 0 && (
                <p className="mt-1 text-xs text-amber-600">
                  No hay profesionales disponibles para esta especialidad.
                </p>
              )}
              {!cargandoProf && profesionales.length > 0 && (
                <p className="mt-1 text-xs text-gray-400">
                  {profesionales.length} profesional{profesionales.length !== 1 ? 'es' : ''} disponible{profesionales.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onCerrar}
            disabled={guardando}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirmar(idPersonalSeleccionado || null)}
            disabled={guardando || !idPersonalSeleccionado || cargandoProf}
            className="flex items-center gap-2 px-5 py-2 text-sm bg-[#0a5ba9] hover:bg-[#0d4e90] text-white rounded-lg font-semibold transition disabled:opacity-50"
          >
            {guardando
              ? <><RefreshCw size={14} className="animate-spin" /> Reasignando...</>
              : <><ArrowRightLeft size={14} /> Confirmar Reasignacion</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function RescatarProfesionalCoordCitas() {
  const [especialidades,       setEspecialidades]       = useState([]);

  const [dni,                  setDni]                  = useState('');
  const [resultados,           setResultados]           = useState([]);
  const [buscando,             setBuscando]             = useState(false);
  const [errorBusca,           setErrorBusca]           = useState('');
  const [yaBuscado,            setYaBuscado]            = useState(false);

  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [guardando,            setGuardando]            = useState(false);

  const [toast, setToast] = useState(null);

  // Cargar especialidades al montar (para el select del modal)
  useEffect(() => {
    fetch(`${API_BASE}/bolsas/solicitudes/especialidades`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then(r => r.json())
      .then(data => setEspecialidades((data?.especialidades || []).filter(Boolean).sort()))
      .catch(() => {});
  }, []);

  const buscar = async () => {
    const dniBuscar = dni.trim();
    if (!dniBuscar) return;
    setBuscando(true);
    setErrorBusca('');
    setResultados([]);
    setYaBuscado(false);
    try {
      const res = await fetch(
        `${API_BASE}/enfermeria/pacientes/buscar?dni=${encodeURIComponent(dniBuscar)}`,
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setResultados(Array.isArray(data) ? data : []);
      setYaBuscado(true);
    } catch (e) {
      setErrorBusca('No se pudo realizar la busqueda. Intenta nuevamente.');
    } finally {
      setBuscando(false);
    }
  };

  const formatFechaHora = (iso) => {
    if (!iso) return null;
    try {
      return new Date(iso).toLocaleString('es-PE', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
    } catch { return null; }
  };

  const esDeserccion  = (condicion) => { const c = (condicion || '').toLowerCase(); return c.includes('deserci') || c.includes('desercio'); };
  const esPendiente   = (estado)    => (estado || '').toUpperCase() === 'PENDIENTE';
  const esAtendido    = (estado)    => (estado || '').toUpperCase() === 'ATENDIDO';
  const puedeReasignar = (r)        => esPendiente(r.estado) || esDeserccion(r.condicionMedica);

  const handleClickReasignar = (r) => {
    if (esAtendido(r.estado) && !esDeserccion(r.condicionMedica)) {
      setToast({ mensaje: `No se puede reasignar a ${r.pacienteNombre}: el paciente ya fue ATENDIDO.`, tipo: 'error' });
      return;
    }
    setPacienteSeleccionado(r);
  };

  const confirmarReasignacion = async (idPersonalNuevo) => {
    if (!pacienteSeleccionado || !idPersonalNuevo) return;
    setGuardando(true);
    const esRescate = esDeserccion(pacienteSeleccionado.condicionMedica);
    const endpoint  = esRescate
      ? `${API_BASE}/enfermeria/pacientes/${pacienteSeleccionado.idSolicitud}/rescatar`
      : `${API_BASE}/enfermeria/pacientes/${pacienteSeleccionado.idSolicitud}/reasignar`;
    try {
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ idPersonal: Number(idPersonalNuevo) }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || `HTTP ${res.status}`);
      }
      const actualizado = await res.json();
      setResultados(prev => prev.map(r => r.idSolicitud === actualizado.idSolicitud ? actualizado : r));
      setPacienteSeleccionado(null);
      const accion = esRescate ? 'rescatado y reasignado' : 'reasignado';
      setToast({ mensaje: `Paciente ${actualizado.pacienteNombre} ${accion} exitosamente.`, tipo: 'exito' });
    } catch (e) {
      setToast({ mensaje: e.message || 'Error al reasignar el paciente.', tipo: 'error' });
    } finally {
      setGuardando(false);
    }
  };

  const totalPendientes = resultados.filter(r => puedeReasignar(r)).length;
  const totalAtendidos  = resultados.filter(r => esAtendido(r.estado)).length;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">

      {/* Encabezado */}
      <div className="mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-100 rounded-xl">
            <ArrowRightLeft size={22} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Rescatar Profesional</h1>
            <p className="text-sm text-gray-500">
              Busca al paciente por DNI, luego selecciona la especialidad y el nuevo profesional a asignar.
            </p>
          </div>
        </div>
      </div>

      {/* Buscador */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-5">
        <label className="block text-xs font-semibold text-gray-600 mb-2">
          <Search size={12} className="inline mr-1" />Buscar paciente por DNI
        </label>
        <div className="flex gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={dni}
              onChange={e => setDni(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && buscar()}
              placeholder="Ej: 33432958"
              maxLength={20}
              className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0a5ba9]"
            />
          </div>
          <button
            onClick={buscar}
            disabled={buscando || !dni.trim()}
            className="flex items-center gap-2 px-5 py-2.5 text-sm bg-[#0a5ba9] hover:bg-[#0d4e90] text-white rounded-lg font-semibold transition disabled:opacity-50"
          >
            {buscando
              ? <><RefreshCw size={14} className="animate-spin" /> Buscando...</>
              : <><Search size={14} /> Buscar</>
            }
          </button>
        </div>
      </div>

      {/* Error */}
      {errorBusca && (
        <div className="mb-4 flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertCircle size={16} /> {errorBusca}
        </div>
      )}

      {/* Resultados */}
      {yaBuscado && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between flex-wrap gap-2">
            <span className="text-sm font-semibold text-gray-700">
              {resultados.length === 0
                ? 'Sin resultados'
                : `${resultados.length} registro${resultados.length !== 1 ? 's' : ''} encontrado${resultados.length !== 1 ? 's' : ''}`}
            </span>
            <div className="flex gap-2">
              {totalPendientes > 0 && (
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-full px-2.5 py-0.5">
                  {totalPendientes} reasignable{totalPendientes !== 1 ? 's' : ''}
                </span>
              )}
              {totalAtendidos > 0 && (
                <span className="text-xs font-semibold text-green-600 bg-green-50 border border-green-200 rounded-full px-2.5 py-0.5">
                  {totalAtendidos} atendido{totalAtendidos !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          {resultados.length === 0 && (
            <div className="p-12 text-center">
              <Search size={40} className="mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500 text-sm">No se encontraron registros para el DNI <strong>{dni}</strong></p>
            </div>
          )}

          {resultados.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#0a5ba9] text-white">
                    {['N Solicitud', 'Paciente', 'DNI', 'Especialidad', 'Condicion Medica', 'Estado', 'Profesional Asignado', 'Accion'].map(h => (
                      <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {resultados.map((r, idx) => (
                    <tr key={r.idSolicitud}
                      className={`border-b border-gray-100 hover:bg-blue-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                        ${esAtendido(r.estado) && !esDeserccion(r.condicionMedica) ? 'opacity-60' : ''}`}>
                      <td className="px-3 py-2.5 text-xs font-mono text-gray-500 whitespace-nowrap">{r.numeroSolicitud || `#${r.idSolicitud}`}</td>
                      <td className="px-3 py-2.5 font-medium text-gray-800 text-xs max-w-[180px]">
                        <span title={r.pacienteNombre} className="block truncate">{r.pacienteNombre || '—'}</span>
                      </td>
                      <td className="px-3 py-2.5 text-xs font-mono text-gray-700 whitespace-nowrap">{r.pacienteDni || '—'}</td>
                      <td className="px-3 py-2.5 text-xs text-gray-600 whitespace-nowrap">{r.especialidad || '—'}</td>
                      <td className="px-3 py-2.5"><BadgeCondicion valor={r.condicionMedica} /></td>
                      <td className="px-3 py-2.5"><BadgeEstado valor={r.estado} /></td>
                      <td className="px-3 py-2.5 text-xs text-gray-600">
                        {r.nombreEnfermera ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="inline-flex items-center gap-1">
                              <User size={11} className="text-gray-400 shrink-0" />{r.nombreEnfermera}
                            </span>
                            {esAtendido(r.estado) && r.fechaAtencionMedica && (
                              <span className="text-[10px] text-green-600 font-medium pl-3.5">{formatFechaHora(r.fechaAtencionMedica)}</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">Sin asignar</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        {puedeReasignar(r) ? (
                          <button onClick={() => handleClickReasignar(r)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-[#0a5ba9] hover:bg-[#0d4e90] text-white rounded-lg font-semibold transition">
                            <ArrowRightLeft size={13} />
                            {esDeserccion(r.condicionMedica) ? 'Rescatar' : 'Reasignar'}
                          </button>
                        ) : esAtendido(r.estado) ? (
                          <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-400 cursor-not-allowed" title="Paciente ya atendido">
                            <Ban size={13} /> Atendido
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 italic">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {pacienteSeleccionado && (
        <ModalReasignar
          paciente={pacienteSeleccionado}
          especialidades={especialidades}
          onConfirmar={confirmarReasignacion}
          onCerrar={() => setPacienteSeleccionado(null)}
          guardando={guardando}
        />
      )}

      {/* Toast */}
      {toast && <Toast mensaje={toast.mensaje} tipo={toast.tipo} onClose={() => setToast(null)} />}
    </div>
  );
}

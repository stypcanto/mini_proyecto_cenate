import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Search, RefreshCw, AlertCircle, LifeBuoy, X,
  CheckCircle, User
} from 'lucide-react';

/**
 * RescatarPacienteEnfermeria v1.0.0
 * Coordinadora de Enfermería — Recuperar pacientes con estado "Deserción"
 * y reasignarlos con estado "Pendiente".
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
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
        {valor}
      </span>
    );
  if (v === 'pendiente')
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 border border-yellow-200">
        {valor}
      </span>
    );
  if (v === 'atendido')
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
        {valor}
      </span>
    );
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
      {valor || '—'}
    </span>
  );
}

function BadgeEstado({ valor }) {
  const v = (valor || '').toUpperCase();
  const map = {
    PENDIENTE: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    ATENDIDO:  'bg-green-100  text-green-700  border-green-200',
    ANULADO:   'bg-gray-100   text-gray-500   border-gray-200',
    CITADO:    'bg-blue-100   text-blue-700   border-blue-200',
  };
  const cls = map[v] || 'bg-gray-100 text-gray-600 border-gray-200';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${cls}`}>
      {valor || '—'}
    </span>
  );
}

// ─── Select de enfermera flotante (escapa overflow del modal via portal) ──────

function SelectEnfermera({ value, onChange, enfermeras }) {
  const [query,   setQuery]   = useState('');
  const [open,    setOpen]    = useState(false);
  const [dropPos, setDropPos] = useState({ top: 0, left: 0, width: 0 });
  const inputRef = useRef(null);
  const listRef  = useRef(null);

  const filtered = query.trim()
    ? enfermeras.filter(e =>
        e.nombreCompleto.toLowerCase().includes(query.toLowerCase()) ||
        (e.numDoc || '').includes(query)
      )
    : enfermeras;

  const openDropdown = () => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    }
    setOpen(true);
  };

  const select = (enf) => {
    onChange(String(enf.idPersonal));
    setQuery(enf.nombreCompleto);
    setOpen(false);
  };

  const clear = () => {
    onChange('');
    setQuery('');
    setOpen(false);
  };

  // Cerrar al hacer click fuera
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (
        inputRef.current && !inputRef.current.contains(e.target) &&
        listRef.current  && !listRef.current.contains(e.target)
      ) setOpen(false);
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
          placeholder="Escribe para buscar enfermera..."
          autoComplete="off"
          className="w-full pl-8 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0a5ba9] bg-white"
        />
        {(query || value) && (
          <button
            onMouseDown={clear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
          >
            <X size={13} />
          </button>
        )}
      </div>

      {open && createPortal(
        <div
          ref={listRef}
          style={{
            position: 'fixed',
            top:   dropPos.top,
            left:  dropPos.left,
            width: dropPos.width,
            zIndex: 9999,
          }}
          className="bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden"
        >
          {/* Opción: sin cambio */}
          <div
            onMouseDown={() => { onChange(''); setQuery(''); setOpen(false); }}
            className="px-3 py-2 text-xs text-gray-400 italic cursor-pointer hover:bg-gray-50 border-b border-gray-100"
          >
            — Sin cambio (mantener actual) —
          </div>

          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-3 py-3 text-xs text-gray-400 text-center">
                Sin resultados para &ldquo;{query}&rdquo;
              </div>
            ) : (
              filtered.map(enf => (
                <div
                  key={enf.idPersonal}
                  onMouseDown={() => select(enf)}
                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 flex items-center justify-between gap-2
                    ${String(enf.idPersonal) === String(value) ? 'bg-blue-50 text-[#0a5ba9] font-medium' : 'text-gray-800'}`}
                >
                  <span>{enf.nombreCompleto}</span>
                  <span className="text-xs text-gray-400 font-mono shrink-0">{enf.numDoc}</span>
                </div>
              ))
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ mensaje, tipo, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

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

// ─── Modal de confirmación ────────────────────────────────────────────────────

function ModalRescatar({ paciente, enfermeras, onConfirmar, onCerrar, guardando }) {
  const [idPersonalSeleccionado, setIdPersonalSeleccionado] = useState('');

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#0a5ba9] text-white">
          <div className="flex items-center gap-2">
            <LifeBuoy size={20} />
            <span className="font-bold text-base">Rescatar Paciente</span>
          </div>
          <button onClick={onCerrar} className="p-1 rounded-lg hover:bg-white/20 transition">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">

          {/* Datos del paciente (readonly) */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-[#0a5ba9] uppercase tracking-wide mb-1">Datos del paciente</p>
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
                <span className="text-gray-500">Condición actual:</span>
                <div className="mt-0.5"><BadgeCondicion valor={paciente.condicionMedica} /></div>
              </div>
              <div>
                <span className="text-gray-500">Estado:</span>
                <div className="mt-0.5"><BadgeEstado valor={paciente.estado} /></div>
              </div>
              {paciente.especialidad && (
                <div className="col-span-2">
                  <span className="text-gray-500">Especialidad:</span>
                  <p className="font-medium text-gray-700 mt-0.5">{paciente.especialidad}</p>
                </div>
              )}
              {paciente.nombreEnfermera && (
                <div className="col-span-2">
                  <span className="text-gray-500">Enfermera asignada:</span>
                  <p className="font-medium text-gray-700 mt-0.5">{paciente.nombreEnfermera}</p>
                </div>
              )}
            </div>
          </div>

          {/* Acción que se realizará */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
            <p className="font-semibold mb-1">Se realizarán los siguientes cambios:</p>
            <ul className="space-y-0.5 list-disc list-inside text-amber-700">
              <li>Condición médica → <strong>Pendiente</strong></li>
              <li>Estado → <strong>PENDIENTE</strong></li>
              <li>Fecha de atención médica → <strong>se limpiará</strong></li>
            </ul>
          </div>

          {/* Select de reasignación */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              <User size={12} className="inline mr-1" />
              Reasignar enfermera <span className="font-normal text-gray-400">(opcional)</span>
            </label>
            <SelectEnfermera
              value={idPersonalSeleccionado}
              onChange={setIdPersonalSeleccionado}
              enfermeras={enfermeras}
            />
          </div>
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
            disabled={guardando}
            className="flex items-center gap-2 px-5 py-2 text-sm bg-[#0a5ba9] hover:bg-[#0d4e90] text-white rounded-lg font-semibold transition disabled:opacity-50"
          >
            {guardando ? (
              <><RefreshCw size={14} className="animate-spin" /> Rescatando...</>
            ) : (
              <><LifeBuoy size={14} /> Confirmar Rescate</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function RescatarPacienteEnfermeria() {
  const [dni,         setDni]         = useState('');
  const [resultados,  setResultados]  = useState([]);
  const [buscando,    setBuscando]    = useState(false);
  const [errorBusca,  setErrorBusca]  = useState('');
  const [yaBuscado,   setYaBuscado]   = useState(false);

  const [enfermeras,  setEnfermeras]  = useState([]);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [guardando,   setGuardando]   = useState(false);

  const [toast, setToast] = useState(null);

  // Cargar lista de enfermeras al montar
  useEffect(() => {
    fetch(`${API_BASE}/enfermeria/enfermeras`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then(r => r.json())
      .then(data => setEnfermeras(Array.isArray(data) ? data : []))
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
      console.error('❌ Error al buscar:', e);
      setErrorBusca('No se pudo realizar la búsqueda. Intenta nuevamente.');
    } finally {
      setBuscando(false);
    }
  };

  const confirmarRescate = async (idPersonalNuevo) => {
    if (!pacienteSeleccionado) return;
    setGuardando(true);

    try {
      const body = {};
      if (idPersonalNuevo) body.idPersonal = Number(idPersonalNuevo);

      const res = await fetch(
        `${API_BASE}/enfermeria/pacientes/${pacienteSeleccionado.idSolicitud}/rescatar`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify(body),
        }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const actualizado = await res.json();

      // Actualizar fila en tabla local
      setResultados(prev =>
        prev.map(r => r.idSolicitud === actualizado.idSolicitud ? actualizado : r)
      );
      setPacienteSeleccionado(null);
      setToast({ mensaje: `Paciente ${actualizado.pacienteNombre} rescatado exitosamente.`, tipo: 'exito' });
    } catch (e) {
      console.error('❌ Error al rescatar:', e);
      setToast({ mensaje: 'Error al rescatar el paciente. Intenta nuevamente.', tipo: 'error' });
    } finally {
      setGuardando(false);
    }
  };

  const esDeserccion = (condicion) => {
    const c = (condicion || '').toLowerCase();
    return c.includes('deserci') || c.includes('desercio');
  };

  const totalDesercion = resultados.filter(r => esDeserccion(r.condicionMedica)).length;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">

      {/* ── Encabezado ─────────────────────────────────────────────────────── */}
      <div className="mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-red-100 rounded-xl">
            <LifeBuoy size={22} className="text-red-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Rescatar Paciente</h1>
            <p className="text-sm text-gray-500">
              Recupera pacientes en estado Deserción y los reasigna con estado Pendiente
            </p>
          </div>
        </div>
      </div>

      {/* ── Buscador ───────────────────────────────────────────────────────── */}
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
            {buscando ? (
              <><RefreshCw size={14} className="animate-spin" /> Buscando...</>
            ) : (
              <><Search size={14} /> Buscar</>
            )}
          </button>
        </div>
      </div>

      {/* ── Error de búsqueda ───────────────────────────────────────────────── */}
      {errorBusca && (
        <div className="mb-4 flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertCircle size={16} /> {errorBusca}
        </div>
      )}

      {/* ── Resultados ─────────────────────────────────────────────────────── */}
      {yaBuscado && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

          {/* Barra de estado */}
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">
              {resultados.length === 0
                ? 'Sin resultados'
                : `${resultados.length} registro${resultados.length !== 1 ? 's' : ''} encontrado${resultados.length !== 1 ? 's' : ''}`}
            </span>
            {totalDesercion > 0 && (
              <span className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-full px-2.5 py-0.5">
                {totalDesercion} en Deserción
              </span>
            )}
          </div>

          {/* Sin datos */}
          {resultados.length === 0 && (
            <div className="p-12 text-center">
              <Search size={40} className="mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500 text-sm">
                No se encontraron registros para el DNI <strong>{dni}</strong>
              </p>
            </div>
          )}

          {/* Tabla */}
          {resultados.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#0a5ba9] text-white">
                    {['N° Solicitud', 'Paciente', 'DNI', 'Especialidad', 'Condición Médica', 'Estado', 'Enfermera Asignada', 'Acción'].map(h => (
                      <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {resultados.map((r, idx) => (
                    <tr
                      key={r.idSolicitud}
                      className={`border-b border-gray-100 hover:bg-blue-50 transition-colors ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      } ${esDeserccion(r.condicionMedica) ? 'ring-1 ring-inset ring-red-200' : ''}`}
                    >
                      <td className="px-3 py-2.5 text-xs font-mono text-gray-500 whitespace-nowrap">
                        {r.numeroSolicitud || `#${r.idSolicitud}`}
                      </td>
                      <td className="px-3 py-2.5 font-medium text-gray-800 text-xs max-w-[180px]">
                        <span title={r.pacienteNombre} className="block truncate">{r.pacienteNombre || '—'}</span>
                      </td>
                      <td className="px-3 py-2.5 text-xs font-mono text-gray-700 whitespace-nowrap">
                        {r.pacienteDni || '—'}
                      </td>
                      <td className="px-3 py-2.5 text-xs text-gray-600 whitespace-nowrap">
                        {r.especialidad || '—'}
                      </td>
                      <td className="px-3 py-2.5">
                        <BadgeCondicion valor={r.condicionMedica} />
                      </td>
                      <td className="px-3 py-2.5">
                        <BadgeEstado valor={r.estado} />
                      </td>
                      <td className="px-3 py-2.5 text-xs text-gray-600 whitespace-nowrap">
                        {r.nombreEnfermera ? (
                          <span className="inline-flex items-center gap-1">
                            <User size={11} className="text-gray-400" />
                            {r.nombreEnfermera}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">Sin asignar</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        {esDeserccion(r.condicionMedica) ? (
                          <button
                            onClick={() => setPacienteSeleccionado(r)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition"
                          >
                            <LifeBuoy size={13} /> Rescatar
                          </button>
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

      {/* ── Modal ──────────────────────────────────────────────────────────── */}
      {pacienteSeleccionado && (
        <ModalRescatar
          paciente={pacienteSeleccionado}
          enfermeras={enfermeras}
          onConfirmar={confirmarRescate}
          onCerrar={() => setPacienteSeleccionado(null)}
          guardando={guardando}
        />
      )}

      {/* ── Toast ──────────────────────────────────────────────────────────── */}
      {toast && (
        <Toast
          mensaje={toast.mensaje}
          tipo={toast.tipo}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

// ========================================================================
// RegistrarCitaAdicionalModal.jsx — Modal reutilizable "Registrar cita adicional"
// Extraído de GestionAsegurado.jsx (v1.67.0) para uso en múltiples páginas
// ========================================================================
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  CheckCircle2, Calendar, X, Search, AlertCircle, Plus,
  Loader2, AlertTriangle, XCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { getToken } from "../../constants/auth";

const DRUM_HOURS = Array.from({ length: 17 }, (_, i) => i + 7); // 07..23
const DRUM_MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
const DRUM_ITEM_H = 40;

const ESPECIALIDADES_MEDICAS = [
  "CARDIOLOGIA","DERMATOLOGIA","HEMATOLOGIA","MEDICINA GENERAL",
  "NEUROLOGIA","OFTALMOLOGIA","PEDIATRIA","PSIQUIATRIA",
];
const OTROS_SERVICIOS = [
  "ENFERMERIA","NUTRICION","PSICOLOGIA","TERAPIA FISICA","TERAPIA DE LENGUAJE","S/E",
];
const TODAS_ESPECIALIDADES = [...ESPECIALIDADES_MEDICAS, ...OTROS_SERVICIOS];

function getApiBase() {
  if (process.env.REACT_APP_API_URL) return process.env.REACT_APP_API_URL;
  const { protocol, hostname, port } = window.location;
  return `${protocol}//${hostname}${port ? `:${port}` : ""}/api`;
}

function getHeaders() {
  return { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" };
}

function formatearNombreEspecialista(medico) {
  const ap = (medico?.apellidoPaterno || medico?.apPaterno || "").trim();
  const am = (medico?.apellidoMaterno || medico?.apMaterno || "").trim();
  const nombres = (medico?.nombres || "").trim();
  if (ap && am && nombres) return `${ap} ${am}, ${nombres}`;
  const full = (medico?.nombre || "").trim().replace(/\s+/g, " ");
  if (!full) return "Sin nombre";
  const p = full.split(" ");
  if (p.length >= 3) return `${p.slice(-2).join(" ")}, ${p.slice(0, -2).join(" ")}`;
  return full;
}

function formatearLabelEspecialista(medico) {
  const doc = medico?.documento || medico?.numDocPers || medico?.numeroDocumento || "Sin documento";
  return `${formatearNombreEspecialista(medico)} - DNI: ${doc}`;
}

function obtenerApellidoPaterno(medico) {
  const ap = (medico?.apellidoPaterno || medico?.apPaterno || "").trim();
  if (ap) return ap;
  const full = (medico?.nombre || "").trim().replace(/\s+/g, " ");
  const p = full.split(" ");
  if (p.length >= 3) return p[p.length - 2];
  if (p.length === 2) return p[1];
  return p[0] || "";
}

/**
 * Modal "Registrar cita adicional" reutilizable.
 * Props:
 *   open        {boolean}  — visible o no
 *   onClose     {function} — cerrar sin acción
 *   onSuccess   {function} — callback tras registrar cita (para refrescar lista)
 *   user        {object}   — usuario autenticado ({ id, ... })
 */
export default function RegistrarCitaAdicionalModal({ open, onClose, onSuccess, user }) {
  const API_BASE = getApiBase();

  // Paso 1: buscar paciente
  const [dni, setDni] = useState("");
  const [estadoBusqueda, setEstadoBusqueda] = useState("idle"); // idle|buscando|encontrado|no_encontrado|error
  const [paciente, setPaciente] = useState(null);
  // Paso 2: datos cita
  const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState("");
  const [busquedaEspecialidad, setBusquedaEspecialidad] = useState("");
  const [mostrarDropdownEsp, setMostrarDropdownEsp] = useState(false);
  const [medicoSeleccionado, setMedicoSeleccionado] = useState("");
  const [busquedaProfesional, setBusquedaProfesional] = useState("");
  const [mostrarDropdownProfes, setMostrarDropdownProfes] = useState(false);
  const [medicosDisponibles, setMedicosDisponibles] = useState([]);
  const [fechaHora, setFechaHora] = useState("");
  const [horasOcupadas, setHorasOcupadas] = useState([]);
  // Paso 3: éxito
  const [paso, setPaso] = useState(1); // 1|3
  const [guardando, setGuardando] = useState(false);

  // Drum refs
  const hourDrumRef = useRef(null);
  const minuteDrumRef = useRef(null);

  // Sincronizar drum cuando cambia fechaHora
  useEffect(() => {
    const time = fechaHora?.split("T")[1];
    if (!time) return;
    const [h, m] = time.split(":").map(Number);
    const hIdx = DRUM_HOURS.indexOf(h);
    const mIdx = DRUM_MINUTES.indexOf(m);
    if (hourDrumRef.current && hIdx >= 0) hourDrumRef.current.scrollTop = hIdx * DRUM_ITEM_H;
    if (minuteDrumRef.current && mIdx >= 0) minuteDrumRef.current.scrollTop = mIdx * DRUM_ITEM_H;
  }, [fechaHora]);

  const handleDrumScroll = useCallback((drumType) => {
    const ref = drumType === "hour" ? hourDrumRef : minuteDrumRef;
    if (!ref.current) return;
    clearTimeout(ref.current._scrollTimer);
    ref.current._scrollTimer = setTimeout(() => {
      const idx = Math.round(ref.current.scrollTop / DRUM_ITEM_H);
      const arr = drumType === "hour" ? DRUM_HOURS : DRUM_MINUTES;
      const clamped = Math.max(0, Math.min(idx, arr.length - 1));
      ref.current.scrollTop = clamped * DRUM_ITEM_H;
      const fechaActual = fechaHora?.split("T")[0] || "";
      if (!fechaActual) return;
      const time = fechaHora?.split("T")[1] || "07:00";
      const [currH, currM] = time.split(":").map(Number);
      const newH = drumType === "hour" ? arr[clamped] : currH;
      const newM = drumType === "minute" ? arr[clamped] : currM;
      const slot = `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
      setFechaHora(`${fechaActual}T${slot}`);
    }, 120);
  }, [fechaHora]);

  // Cargar médicos al cambiar especialidad
  useEffect(() => {
    if (!especialidadSeleccionada) {
      setMedicosDisponibles([]);
      setMedicoSeleccionado("");
      setBusquedaProfesional("");
      setMostrarDropdownProfes(false);
      return;
    }
    const load = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/bolsas/solicitudes/fetch-doctors-by-specialty?especialidad=${encodeURIComponent(especialidadSeleccionada)}`,
          { method: "POST", headers: getHeaders() }
        );
        if (res.ok) {
          const result = await res.json();
          const ordenados = [...(result.data || [])].sort((a, b) => {
            const c = obtenerApellidoPaterno(a).localeCompare(obtenerApellidoPaterno(b), "es", { sensitivity: "base" });
            return c !== 0 ? c : formatearNombreEspecialista(a).localeCompare(formatearNombreEspecialista(b), "es", { sensitivity: "base" });
          });
          setMedicosDisponibles(ordenados);
        } else {
          setMedicosDisponibles([]);
        }
      } catch {
        setMedicosDisponibles([]);
      }
    };
    load();
    setBusquedaProfesional("");
    setMostrarDropdownProfes(false);
    setMedicoSeleccionado("");
  }, [especialidadSeleccionada]); // eslint-disable-line

  // Cargar horas ocupadas al cambiar médico/fecha
  useEffect(() => {
    const fechaActual = fechaHora?.split("T")[0];
    if (!medicoSeleccionado || !fechaActual) return;
    const load = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/bolsas/solicitudes/horas-ocupadas?idPersonal=${medicoSeleccionado}&fecha=${fechaActual}`,
          { headers: { Authorization: `Bearer ${getToken()}` } }
        );
        if (res.ok) {
          const d = await res.json();
          setHorasOcupadas(d.horasOcupadas || []);
        }
      } catch { /* ignore */ }
    };
    load();
  }, [medicoSeleccionado, fechaHora?.split("T")[0]]); // eslint-disable-line

  const resetEstado = () => {
    setDni(""); setEstadoBusqueda("idle"); setPaciente(null);
    setEspecialidadSeleccionada(""); setBusquedaEspecialidad(""); setMostrarDropdownEsp(false);
    setMedicoSeleccionado(""); setBusquedaProfesional(""); setMostrarDropdownProfes(false);
    setMedicosDisponibles([]); setFechaHora(""); setHorasOcupadas([]); setPaso(1);
  };

  const handleClose = () => { resetEstado(); onClose(); };

  // ── Búsqueda de paciente ──────────────────────────────────────
  const buscarPaciente = async () => {
    if (!dni || dni.length !== 8) return;
    setEstadoBusqueda("buscando");
    setPaciente(null);
    try {
      const res = await fetch(`${API_BASE}/asegurados/doc/${encodeURIComponent(dni)}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data && (data.docPaciente || data.doc_paciente)) {
          setPaciente(data); setEstadoBusqueda("encontrado"); return;
        }
      }
      // Fallback búsqueda general
      const res2 = await fetch(`${API_BASE}/asegurados/buscar?q=${encodeURIComponent(dni)}&size=1`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res2.ok) {
        const data2 = await res2.json();
        const items = data2?.content || data2?.data || (Array.isArray(data2) ? data2 : []);
        if (items.length > 0) { setPaciente(items[0]); setEstadoBusqueda("encontrado"); return; }
      }
      setEstadoBusqueda("no_encontrado");
    } catch {
      setEstadoBusqueda("error");
    }
  };

  // ── Registrar cita ────────────────────────────────────────────
  const registrarCita = async () => {
    if (!especialidadSeleccionada) { toast.error("Selecciona una especialidad"); return; }
    if (!medicoSeleccionado) { toast.error("Selecciona un profesional"); return; }
    if (!fechaHora?.includes("T")) { toast.error("Selecciona fecha y hora"); return; }
    const fechaSel = fechaHora.split("T")[0];
    const ahora = new Date();
    const hoy = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, "0")}-${String(ahora.getDate()).padStart(2, "0")}`;
    if (fechaSel < hoy) { toast.error("No puedes citar a una fecha anterior a hoy"); return; }

    setGuardando(true);
    try {
      const res = await fetch(`${API_BASE}/bolsas/solicitudes/crear-adicional`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          pacienteDni: paciente.docPaciente || paciente.doc_paciente,
          pacienteNombre: paciente.paciente || paciente.nombre,
          pacienteEdad: paciente.edad,
          pacienteSexo: paciente.sexo,
          pacienteTelefono: paciente.telCelular || paciente.telFijo || paciente.telefono,
          pacienteTelefonoAlterno: paciente.telFijo || paciente.telCelular,
          descIpress: paciente.nombreIpress || paciente.casAdscripcion || paciente.cas_adscripcion,
          tipoCita: "TELECONSULTA",
          origen: "Importación Manual",
          codEstadoCita: "CITADO",
          usuarioCreacion: user?.id,
          especialidad: especialidadSeleccionada,
          idPersonal: parseInt(medicoSeleccionado),
          fechaAtencion: fechaHora.split("T")[0],
          horaAtencion: fechaHora.split("T")[1] + ":00",
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        if (res.status === 409 && err.error === "paciente_duplicado") {
          toast.error(`El paciente ya tiene una cita activa en ${especialidadSeleccionada}`);
          return;
        }
        throw new Error(err.message || `Error al crear cita (${res.status})`);
      }

      setPaso(3);
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(err.message || "Error al registrar la cita");
    } finally {
      setGuardando(false);
    }
  };

  if (!open) return null;

  const selH = fechaHora?.split("T")[1]?.split(":")[0] ? parseInt(fechaHora.split("T")[1].split(":")[0]) : 7;
  const selM = fechaHora?.split("T")[1]?.split(":")[1] ? parseInt(fechaHora.split("T")[1].split(":")[1]) : 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden transition-all">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-teal-600 px-6 py-4 flex items-center justify-between rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              {paso === 3 ? <CheckCircle2 className="w-5 h-5 text-white" /> : <Calendar className="w-5 h-5 text-white" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Registrar cita adicional</h2>
              <p className="text-blue-100 text-xs">
                {paso === 3 ? "Cita registrada correctamente" : "Busca al paciente y completa los datos de la cita"}
              </p>
            </div>
          </div>
          <button onClick={handleClose} className="text-white/80 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* ── PASO 3: Éxito ── */}
        {paso === 3 ? (
          <div className="p-10 text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Cita registrada con exito</h3>
            <p className="text-gray-600">
              Se ha colocado una cita adicional para{" "}
              <span className="font-semibold">{paciente?.paciente || paciente?.nombre}</span>{" "}
              (DNI: {paciente?.docPaciente || paciente?.doc_paciente}).
            </p>
            {fechaHora && (
              <p className="text-sm text-gray-500">
                Fecha: <span className="font-medium">{fechaHora.split("T")[0]}</span>
                {fechaHora.split("T")[1] && <> | Hora: <span className="font-medium">{fechaHora.split("T")[1]}</span></>}
                {busquedaProfesional && <> | Profesional: <span className="font-medium">{busquedaProfesional}</span></>}
              </p>
            )}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-left mx-auto max-w-md">
              <div className="flex gap-2 items-start">
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-700">
                  <span className="font-semibold">Importante:</span> No te olvides de asegurarte que el paciente
                  tambien este citado en el <span className="font-bold">ESSI</span> en el mismo horario para que el
                  profesional pueda atender.
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-center pt-4">
              <button
                onClick={() => {
                  resetEstado();
                }}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Registrar otra cita
              </button>
              <button
                onClick={handleClose}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* ── Cuerpo: 2 columnas ── */}
            <div className="grid grid-cols-2 divide-x divide-gray-200">
              {/* COLUMNA IZQUIERDA: Buscar paciente */}
              <div className="p-5 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${estadoBusqueda === "encontrado" ? "bg-green-600 text-white" : "bg-blue-600 text-white"}`}>1</span>
                  <span className="text-sm font-semibold text-gray-700">Buscar paciente</span>
                  {estadoBusqueda === "encontrado" && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                </div>

                {/* Input DNI */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1.5">Ingresa el DNI del paciente</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ej: 12345678"
                      maxLength={8}
                      value={dni}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "").slice(0, 8);
                        setDni(val);
                        if (val.length < 8) { setEstadoBusqueda("idle"); setPaciente(null); }
                      }}
                      onKeyDown={(e) => { if (e.key === "Enter" && dni.length === 8 && estadoBusqueda !== "buscando") buscarPaciente(); }}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      autoFocus
                    />
                    <button
                      disabled={dni.length !== 8 || estadoBusqueda === "buscando"}
                      onClick={buscarPaciente}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                    >
                      {estadoBusqueda === "buscando" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                      Buscar
                    </button>
                  </div>
                  {dni.length > 0 && dni.length < 8 && (
                    <p className="text-xs text-gray-400 mt-1">Ingresa los 8 digitos del DNI</p>
                  )}
                </div>

                {/* Encontrado */}
                {estadoBusqueda === "encontrado" && paciente && (
                  <div className="border border-green-200 bg-green-50 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span className="font-semibold text-sm text-green-700">Paciente encontrado</span>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-green-100 space-y-2">
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                        <div>
                          <p className="text-xs text-gray-400">DNI</p>
                          <p className="text-sm font-semibold text-gray-800">{paciente.docPaciente || paciente.doc_paciente}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Edad / Sexo</p>
                          <p className="text-sm font-semibold text-gray-800">{paciente.edad ? `${paciente.edad} a.` : "—"} / {paciente.sexo === "M" ? "M" : "F"}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Nombre completo</p>
                        <p className="text-sm font-bold text-gray-800">{paciente.paciente || paciente.nombre}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                        {(paciente.telCelular || paciente.telFijo || paciente.telefono) && (
                          <div>
                            <p className="text-xs text-gray-400">Telefono</p>
                            <p className="text-sm font-semibold text-gray-800">{paciente.telCelular || paciente.telFijo || paciente.telefono}</p>
                          </div>
                        )}
                        {(paciente.tipoSeguro || paciente.tipo_seguro) && (
                          <div>
                            <p className="text-xs text-gray-400">Tipo seguro</p>
                            <p className="text-sm font-semibold text-gray-800">{paciente.tipoSeguro || paciente.tipo_seguro}</p>
                          </div>
                        )}
                      </div>
                      {(paciente.casAdscripcion || paciente.cas_adscripcion || paciente.nombreIpress) && (
                        <div>
                          <p className="text-xs text-gray-400">IPRESS adscrita</p>
                          <p className="text-sm font-semibold text-gray-800">{paciente.nombreIpress || paciente.casAdscripcion || paciente.cas_adscripcion}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* No encontrado */}
                {estadoBusqueda === "no_encontrado" && (
                  <div className="border border-amber-200 bg-amber-50 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                      <span className="font-semibold text-sm text-amber-700">Paciente no encontrado</span>
                    </div>
                    <p className="text-sm text-amber-600">
                      No se encontro ningun asegurado con DNI <span className="font-bold">{dni}</span>.
                    </p>
                  </div>
                )}

                {/* Error */}
                {estadoBusqueda === "error" && (
                  <div className="border border-red-200 bg-red-50 rounded-xl p-3 space-y-2">
                    <div className="flex items-center gap-2 text-red-700">
                      <XCircle className="w-5 h-5" />
                      <span className="font-semibold text-sm">Error en la busqueda</span>
                    </div>
                    <p className="text-sm text-red-600">No se pudo verificar el DNI. Intenta nuevamente.</p>
                  </div>
                )}

                {/* Idle hint */}
                {estadoBusqueda === "idle" && dni.length === 0 && (
                  <div className="text-center py-6">
                    <Search className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">Ingresa un DNI para buscar al paciente</p>
                  </div>
                )}
              </div>

              {/* COLUMNA DERECHA: Datos de la cita */}
              <div className={`p-5 space-y-4 ${estadoBusqueda !== "encontrado" ? "opacity-40 pointer-events-none" : ""}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${estadoBusqueda === "encontrado" ? "bg-blue-600 text-white" : "bg-gray-300 text-white"}`}>2</span>
                  <span className="text-sm font-semibold text-gray-700">Datos de la cita</span>
                </div>

                {/* Especialidad */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg border-2 border-green-300">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Especialidad / Servicio <span className="text-red-600 text-lg">*</span>
                  </label>
                  {(() => {
                    const termino = busquedaEspecialidad.toLowerCase().trim();
                    const filtradas = termino ? TODAS_ESPECIALIDADES.filter(e => e.toLowerCase().includes(termino)) : TODAS_ESPECIALIDADES;
                    return (
                      <div className="relative">
                        <input
                          type="text"
                          value={busquedaEspecialidad}
                          onChange={(e) => {
                            setBusquedaEspecialidad(e.target.value);
                            setMostrarDropdownEsp(true);
                            if (!e.target.value) { setEspecialidadSeleccionada(""); setMedicoSeleccionado(""); setBusquedaProfesional(""); }
                          }}
                          onFocus={() => setMostrarDropdownEsp(true)}
                          onBlur={() => setTimeout(() => setMostrarDropdownEsp(false), 150)}
                          placeholder="Buscar especialidad..."
                          className={`w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 text-sm font-medium transition-all ${
                            especialidadSeleccionada ? "bg-white border-green-500 text-green-900" : "bg-green-50 border-green-300 text-gray-500"
                          }`}
                        />
                        {mostrarDropdownEsp && (
                          <ul className="absolute z-50 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto text-sm">
                            {filtradas.length === 0 ? (
                              <li className="px-3 py-2 text-gray-400 italic">Sin resultados</li>
                            ) : (
                              <>
                                {filtradas.filter(e => ESPECIALIDADES_MEDICAS.includes(e)).length > 0 && (
                                  <>
                                    <li className="px-3 py-1 text-xs font-bold text-gray-400 uppercase tracking-wide bg-gray-50 border-b">Especialidades Medicas</li>
                                    {filtradas.filter(e => ESPECIALIDADES_MEDICAS.includes(e)).map(esp => (
                                      <li key={esp} onMouseDown={() => { setEspecialidadSeleccionada(esp); setBusquedaEspecialidad(esp); setMostrarDropdownEsp(false); setMedicoSeleccionado(""); setBusquedaProfesional(""); }}
                                        className={`px-3 py-2 cursor-pointer hover:bg-green-50 ${especialidadSeleccionada === esp ? "bg-green-100 font-semibold text-green-900" : "text-gray-800"}`}
                                      >{esp}</li>
                                    ))}
                                  </>
                                )}
                                {filtradas.filter(e => OTROS_SERVICIOS.includes(e)).length > 0 && (
                                  <>
                                    <li className="px-3 py-1 text-xs font-bold text-gray-400 uppercase tracking-wide bg-gray-50 border-b border-t mt-1">Otros Servicios</li>
                                    {filtradas.filter(e => OTROS_SERVICIOS.includes(e)).map(esp => (
                                      <li key={esp} onMouseDown={() => { setEspecialidadSeleccionada(esp); setBusquedaEspecialidad(esp); setMostrarDropdownEsp(false); setMedicoSeleccionado(""); setBusquedaProfesional(""); }}
                                        className={`px-3 py-2 cursor-pointer hover:bg-green-50 ${especialidadSeleccionada === esp ? "bg-green-100 font-semibold text-green-900" : "text-gray-800"}`}
                                      >{esp}</li>
                                    ))}
                                  </>
                                )}
                              </>
                            )}
                          </ul>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Profesional */}
                <div className={`p-3 rounded-lg border-2 transition-all ${!especialidadSeleccionada ? "bg-gray-50 border-gray-200 opacity-50 pointer-events-none" : "bg-blue-50 border-blue-300"}`}>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Profesional de Salud</label>
                  {!especialidadSeleccionada ? (
                    <div className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg bg-gray-100 text-gray-400 text-sm">Primero selecciona una especialidad</div>
                  ) : (
                    <div className="relative">
                      <input
                        type="text"
                        value={busquedaProfesional}
                        onChange={(e) => { setBusquedaProfesional(e.target.value); setMostrarDropdownProfes(true); if (!e.target.value) setMedicoSeleccionado(""); }}
                        onFocus={() => setMostrarDropdownProfes(true)}
                        onBlur={() => setTimeout(() => setMostrarDropdownProfes(false), 150)}
                        placeholder={medicosDisponibles.length === 0 ? "Sin profesionales disponibles" : "Buscar por nombre o DNI..."}
                        disabled={medicosDisponibles.length === 0}
                        className={`w-full px-3 py-2 border-2 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-sm font-medium transition-all ${
                          medicoSeleccionado ? "bg-white border-blue-500 text-blue-900" : "bg-white border-blue-300 text-gray-700"
                        }`}
                      />
                      {mostrarDropdownProfes && medicosDisponibles.length > 0 && (() => {
                        const termino = busquedaProfesional.toLowerCase().trim();
                        const filtrados = termino ? medicosDisponibles.filter(m => formatearLabelEspecialista(m).toLowerCase().includes(termino)) : medicosDisponibles;
                        return filtrados.length > 0 ? (
                          <ul className="absolute z-50 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto text-sm">
                            <li className="px-3 py-2 text-gray-400 italic cursor-pointer hover:bg-gray-50" onMouseDown={() => { setMedicoSeleccionado(""); setBusquedaProfesional(""); setMostrarDropdownProfes(false); }}>
                              Seleccionar profesional (opcional)
                            </li>
                            {filtrados.map(medico => (
                              <li key={medico.idPers} onMouseDown={() => { setMedicoSeleccionado(String(medico.idPers)); setBusquedaProfesional(formatearLabelEspecialista(medico)); setMostrarDropdownProfes(false); }}
                                className={`px-3 py-2 cursor-pointer hover:bg-blue-50 ${String(medicoSeleccionado) === String(medico.idPers) ? "bg-blue-100 font-semibold text-blue-900" : "text-gray-800"}`}
                              >
                                {formatearLabelEspecialista(medico)}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <ul className="absolute z-50 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 text-sm">
                            <li className="px-3 py-2 text-gray-400 italic">Sin resultados para "{busquedaProfesional}"</li>
                          </ul>
                        );
                      })()}
                    </div>
                  )}
                </div>

                {/* Fecha y Hora */}
                <div className={`p-3 rounded-lg border-2 transition-all ${!medicoSeleccionado ? "bg-gray-50 border-gray-200 opacity-50 pointer-events-none" : "bg-purple-50 border-purple-300"}`}>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">Fecha y Hora de Cita</label>
                  {!medicoSeleccionado ? (
                    <div className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg bg-gray-100 text-gray-400 text-sm">Primero selecciona un profesional</div>
                  ) : (
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs text-gray-700 font-medium">Fecha</label>
                        <input
                          type="date"
                          value={fechaHora?.split("T")[0] || ""}
                          onChange={(e) => setFechaHora(e.target.value)}
                          min={(() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; })()}
                          className="w-full px-3 py-2 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-purple-600 text-sm"
                        />
                      </div>
                      {/* Drum picker */}
                      <div>
                        <label className="text-xs text-gray-700 font-medium mb-2 block">Horario</label>
                        {(() => {
                          const fechaActual = fechaHora?.split("T")[0] || "";
                          return (
                            <div className="flex gap-2">
                              {/* Horas */}
                              <div className="flex-1">
                                <p className="text-center text-xs text-gray-400 mb-1">Hora</p>
                                <div className="relative rounded-xl overflow-hidden border-2 border-purple-200 bg-white shadow-inner" style={{ height: DRUM_ITEM_H * 5 }}>
                                  <div className="absolute inset-x-0 pointer-events-none z-10" style={{ top: DRUM_ITEM_H * 2, height: DRUM_ITEM_H, background: "rgba(124,58,237,0.12)", borderTop: "2px solid #7c3aed", borderBottom: "2px solid #7c3aed" }} />
                                  <div className="absolute inset-x-0 top-0 pointer-events-none z-10" style={{ height: DRUM_ITEM_H * 2, background: "linear-gradient(to bottom, rgba(255,255,255,0.95), rgba(255,255,255,0))" }} />
                                  <div className="absolute inset-x-0 bottom-0 pointer-events-none z-10" style={{ height: DRUM_ITEM_H * 2, background: "linear-gradient(to top, rgba(255,255,255,0.95), rgba(255,255,255,0))" }} />
                                  <div ref={hourDrumRef} onScroll={() => handleDrumScroll("hour")} className="absolute inset-0 overflow-y-scroll" style={{ scrollSnapType: "y mandatory", scrollbarWidth: "none", msOverflowStyle: "none" }}>
                                    <div style={{ paddingTop: DRUM_ITEM_H * 2, paddingBottom: DRUM_ITEM_H * 2 }}>
                                      {DRUM_HOURS.map(h => {
                                        const p = h < 12 ? "a.m." : "p.m.";
                                        const h12 = h === 12 ? 12 : h > 12 ? h - 12 : h;
                                        return (
                                          <div key={h} style={{ height: DRUM_ITEM_H, scrollSnapAlign: "center" }}
                                            className={`flex items-center justify-center cursor-pointer select-none font-semibold text-sm transition-all ${selH === h ? "text-purple-700" : "text-gray-500"}`}
                                            onClick={() => {
                                              if (!fechaActual) { toast.error("Selecciona primero la fecha"); return; }
                                              setFechaHora(`${fechaActual}T${String(h).padStart(2,"0")}:${String(selM).padStart(2,"0")}`);
                                              if (hourDrumRef.current) hourDrumRef.current.scrollTop = DRUM_HOURS.indexOf(h) * DRUM_ITEM_H;
                                            }}
                                          >{String(h12).padStart(2,"0")} {p}</div>
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
                                  <div className="absolute inset-x-0 pointer-events-none z-10" style={{ top: DRUM_ITEM_H * 2, height: DRUM_ITEM_H, background: "rgba(124,58,237,0.12)", borderTop: "2px solid #7c3aed", borderBottom: "2px solid #7c3aed" }} />
                                  <div className="absolute inset-x-0 top-0 pointer-events-none z-10" style={{ height: DRUM_ITEM_H * 2, background: "linear-gradient(to bottom, rgba(255,255,255,0.95), rgba(255,255,255,0))" }} />
                                  <div className="absolute inset-x-0 bottom-0 pointer-events-none z-10" style={{ height: DRUM_ITEM_H * 2, background: "linear-gradient(to top, rgba(255,255,255,0.95), rgba(255,255,255,0))" }} />
                                  <div ref={minuteDrumRef} onScroll={() => handleDrumScroll("minute")} className="absolute inset-0 overflow-y-scroll" style={{ scrollSnapType: "y mandatory", scrollbarWidth: "none", msOverflowStyle: "none" }}>
                                    <div style={{ paddingTop: DRUM_ITEM_H * 2, paddingBottom: DRUM_ITEM_H * 2 }}>
                                      {DRUM_MINUTES.map(m => {
                                        const mm = String(m).padStart(2, "0");
                                        const slot = `${String(selH).padStart(2,"0")}:${mm}`;
                                        const ocupado = horasOcupadas.includes(slot);
                                        return (
                                          <div key={m} style={{ height: DRUM_ITEM_H, scrollSnapAlign: "center" }}
                                            className={`flex items-center justify-center gap-1 cursor-pointer select-none font-semibold text-sm transition-all
                                              ${ocupado ? "text-red-400 cursor-not-allowed" : ""}
                                              ${selM === m && !ocupado ? "text-purple-700" : ""}
                                              ${!ocupado && selM !== m ? "text-gray-500" : ""}`}
                                            onClick={() => {
                                              if (ocupado) { toast.error("Horario ocupado"); return; }
                                              if (!fechaActual) { toast.error("Selecciona primero la fecha"); return; }
                                              setFechaHora(`${fechaActual}T${String(selH).padStart(2,"0")}:${mm}`);
                                              if (minuteDrumRef.current) minuteDrumRef.current.scrollTop = DRUM_MINUTES.indexOf(m) * DRUM_ITEM_H;
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
                          );
                        })()}
                        {/* Slot seleccionado */}
                        <div className="mt-2 flex items-center justify-between">
                          {fechaHora?.includes("T") ? (() => {
                            const [, timeVal] = fechaHora.split("T");
                            const [hh, mmSel] = timeVal.split(":").map(Number);
                            const p = hh < 12 ? "a. m." : "p. m.";
                            const h12v = hh === 12 ? 12 : hh > 12 ? hh - 12 : hh;
                            const ocupado = horasOcupadas.includes(timeVal);
                            return (
                              <p className={`text-xs font-semibold ${ocupado ? "text-red-600" : "text-purple-700"}`}>
                                {ocupado ? "⚠ Horario ocupado" : `Seleccionado: ${String(h12v).padStart(2,"0")}:${String(mmSel).padStart(2,"0")} ${p}`}
                              </p>
                            );
                          })() : <span className="text-xs text-gray-400">Desplaza para seleccionar hora</span>}
                          {horasOcupadas.length > 0 && <span className="text-xs text-amber-600 font-medium">{horasOcupadas.length} ocupados</span>}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Botón Citar */}
                <button
                  onClick={registrarCita}
                  disabled={guardando || estadoBusqueda !== "encontrado" || !especialidadSeleccionada || !medicoSeleccionado || !fechaHora?.includes("T")}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {guardando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
                  {guardando ? "Citando paciente..." : "Citar Paciente"}
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 rounded-b-xl">
              <button onClick={handleClose} className="w-full px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors">
                Cerrar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================
// CargaMasivaPacientes.jsx — Carga masiva desde Excel
// ============================================================
// Módulo: Gestión de Citas | Ruta: /citas/carga-masiva-pacientes
// Rediseño: v2.0 — tipografía jerarquizada, layout 2 columnas,
// drop zone elegante, cards de resultado con barra de progreso.
// ============================================================

import React, { useState, useCallback, useRef } from "react";
import * as XLSX from "xlsx";
import {
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  FileSpreadsheet,
  User,
  Loader2,
  RefreshCw,
  Info,
  ChevronDown,
  ChevronUp,
  Download,
  FileDown,
  Eye,
  Users,
} from "lucide-react";
import { getToken } from "../../../constants/auth";
import { getApiBaseUrl } from "../../../utils/apiUrlHelper";
import toast from "react-hot-toast";

// ── Constantes ──────────────────────────────────────────────
const REQUIRED_COLS = [
  "DNI_MEDICO", "DOC_PACIENTE", "PACIENTE", "SEXO", "EDAD",
  "TEL_MOVIL", "CAS_ADSCRIPCION", "IPRESS_ATENCION", "HORA_CITA", "TIPO_CITA",
];

const COL_INFO = [
  { col: "DNI_MEDICO",       req: true,  desc: "DNI del profesional de salud"           },
  { col: "DOC_PACIENTE",     req: true,  desc: "DNI del paciente (8 dígitos)"           },
  { col: "PACIENTE",         req: true,  desc: "Nombre completo del paciente"           },
  { col: "SEXO",             req: true,  desc: "F (femenino) o M (masculino)"           },
  { col: "EDAD",             req: false, desc: "Edad en años"                           },
  { col: "TEL_MOVIL",        req: false, desc: "Teléfono celular"                       },
  { col: "CAS_ADSCRIPCION",  req: true,  desc: "Código CAS de adscripción"              },
  { col: "IPRESS_ATENCION",  req: true,  desc: "Código IPRESS de atención"              },
  { col: "HORA_CITA",        req: false, desc: "Hora de la cita — HH:MM:SS"            },
  { col: "TIPO_CITA",        req: false, desc: "RECITA / TELECONSULTA / INTERCONSULTA" },
];

const DEFAULTS_INFO = [
  { campo: "id_bolsa",               valor: "10",          desc: "Bolsa de Enfermería CENATE"          },
  { campo: "especialidad",           valor: "ENFERMERIA",   desc: "Especialidad por defecto"            },
  { campo: "id_servicio",            valor: "56",          desc: "ENFERMERÍA (cod F11)"                },
  { campo: "responsable_gestora_id", valor: "688",         desc: "Gestora: Claudia Lizbeth Valencia"   },
  { campo: "estado",                 valor: "PENDIENTE",   desc: "Estado inicial"                      },
  { campo: "fecha_atencion",         valor: "Hoy",         desc: "Fecha del día de carga"              },
];

const REQ_COUNT  = COL_INFO.filter((c) => c.req).length;
const OPT_COUNT  = COL_INFO.filter((c) => !c.req).length;

// ── Utilidades ───────────────────────────────────────────────
function normalizeHeader(h) {
  return String(h ?? "").trim().toUpperCase().replace(/\s+/g, "_");
}
function cellToString(val) {
  if (val == null) return "";
  if (typeof val === "number") return String(Math.round(val));
  return String(val).trim();
}

// ── Subcomponente Accordion ──────────────────────────────────
function Accordion({ icon, title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-200">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors duration-200"
      >
        <div className="flex items-center gap-3 text-gray-700 font-semibold text-sm">
          {icon}
          {title}
        </div>
        {open
          ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
          : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
        }
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  );
}

// ── Componente principal ─────────────────────────────────────
export default function CargaMasivaPacientes() {
  const [state, setState]                   = useState("idle"); // idle | preview | loading | result
  const [isDragging, setIsDragging]         = useState(false);
  const [fileName, setFileName]             = useState("");
  const [rows, setRows]                     = useState([]);
  const [dniMedico, setDniMedico]           = useState("");
  const [medico, setMedico]                 = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [resultado, setResultado]           = useState(null);
  const inputRef = useRef(null);

  // ── Descargar plantilla ──────────────────────────────────
  function handleDescargarPlantilla() {
    const headers = REQUIRED_COLS;
    const ejemplo = [
      ["46621574", "12345678", "LOPEZ GARCIA JUAN CARLOS", "M", "45",
       "987654321", "1234", "5678", "08:00:00", "RECITA"],
    ];
    const ws = XLSX.utils.aoa_to_sheet([headers, ...ejemplo]);
    ws["!cols"] = headers.map(() => ({ wch: 18 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Pacientes");
    XLSX.writeFile(wb, "plantilla_carga_masiva.xlsx");
    toast.success("Plantilla descargada");
  }

  // ── Leer Excel ───────────────────────────────────────────
  const handleFile = useCallback((file) => {
    if (!file) return;
    const ext = file.name.split(".").pop().toLowerCase();
    if (!["xlsx", "xls"].includes(ext)) {
      toast.error("Solo se aceptan archivos .xlsx o .xls");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("El archivo supera el límite de 10 MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb   = XLSX.read(e.target.result, { type: "array" });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const raw   = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

        if (raw.length < 2) {
          toast.error("El archivo está vacío o no tiene datos");
          return;
        }

        const headers = raw[0].map(normalizeHeader);
        const missing = REQUIRED_COLS.filter((c) => !headers.includes(c));
        if (missing.length > 0) {
          setValidationErrors(missing);
          setState("idle");
          toast.error(`Faltan ${missing.length} columna(s) requerida(s)`);
          return;
        }

        const dataRows = raw
          .slice(1)
          .filter((r) => r.some((c) => c !== ""))
          .map((r) => {
            const obj = {};
            headers.forEach((h, i) => { obj[h] = cellToString(r[i]); });
            return obj;
          });

        if (dataRows.length === 0) {
          toast.error("El archivo no contiene filas de datos");
          return;
        }

        const dni = dataRows[0]["DNI_MEDICO"] || "";
        setDniMedico(dni);
        setRows(dataRows);
        setFileName(file.name);
        setValidationErrors([]);
        setMedico(null);
        setState("preview");
        if (dni) buscarProfesional(dni);
      } catch (err) {
        toast.error("Error al leer el Excel: " + err.message);
      }
    };
    reader.readAsArrayBuffer(file);
  }, []);

  // ── Buscar profesional ───────────────────────────────────
  async function buscarProfesional(dni) {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/personal/buscar/${dni}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) {
        const data = await res.json();
        const p = Array.isArray(data) ? data[0] : data;
        if (p) {
          setMedico({
            idPers: p.idPers ?? p.id_pers ?? p.idpers,
            nombre:
              p.nombreCompleto ??
              p.nombre_completo ??
              [p.apePaterPers, p.apeMaterPers, p.nomPers].filter(Boolean).join(" ") ??
              "—",
          });
        }
      }
    } catch { /* ignorar */ }
  }

  // ── Drag & Drop ──────────────────────────────────────────
  function handleDragOver(e)  { e.preventDefault(); setIsDragging(true);  }
  function handleDragLeave()  { setIsDragging(false); }
  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }
  function handleInputChange(e) {
    const file = e.target.files[0];
    if (file) handleFile(file);
    e.target.value = "";
  }

  // ── Reset ────────────────────────────────────────────────
  function handleReset() {
    setState("idle");
    setFileName(""); setRows([]); setDniMedico("");
    setMedico(null); setValidationErrors([]); setResultado(null);
  }

  // ── Enviar al backend ────────────────────────────────────
  async function handleCargar() {
    if (!medico?.idPers) {
      toast.error("No se pudo identificar al profesional (DNI: " + dniMedico + ")");
      return;
    }
    setState("loading");
    try {
      const pacientes = rows.map((r) => ({
        docPaciente:    r["DOC_PACIENTE"],
        paciente:       r["PACIENTE"],
        sexo:           r["SEXO"],
        edad:           r["EDAD"] ? parseInt(r["EDAD"], 10) || null : null,
        telMovil:       r["TEL_MOVIL"] || null,
        casAdscripcion: r["CAS_ADSCRIPCION"] || null,
        ipressAtencion: r["IPRESS_ATENCION"] || null,
        horaCita:       r["HORA_CITA"] || null,
        tipoCita:       r["TIPO_CITA"] || "RECITA",
      }));

      const res = await fetch(
        `${getApiBaseUrl()}/api/bolsas/solicitudes/carga-masiva-pacientes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({ idPersonal: medico.idPers, pacientes }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error del servidor");
      setResultado(data);
      setState("result");
      toast.success(`Carga completada: ${data.insertados} pacientes registrados`);
    } catch (err) {
      toast.error("Error: " + err.message);
      setState("preview");
    }
  }

  // ════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gray-50 p-6">

      {/* ── HEADER ──────────────────────────────────────── */}
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-blue-600 text-white p-3 rounded-2xl shadow-sm">
          <Upload className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Carga Masiva de Pacientes
          </h1>
          <p className="text-sm text-gray-600 mt-0.5">
            Importa pacientes desde un archivo Excel directamente al sistema
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════
          ESTADO 1 — IDLE
      ══════════════════════════════════════════════════ */}
      {state === "idle" && (
        <>
          {/* Fila superior: Acordeones (izq) + Tarjeta plantilla (der) */}
          <div className="flex gap-6 mb-6">

            {/* Columna izquierda — Acordeones */}
            <div className="flex-1 space-y-3 min-w-0">

              {/* Acordeón 1: Columnas del Excel */}
              <Accordion
                icon={<Info className="w-4 h-4 text-blue-500" />}
                title="Columnas del Excel"
                defaultOpen={true}
              >
                <div className="mt-4 space-y-2">
                  {/* Pills de columnas */}
                  <div className="flex flex-wrap gap-2">
                    {COL_INFO.map((c) => (
                      <div
                        key={c.col}
                        title={c.desc}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-medium transition-all duration-200 cursor-default
                          ${c.req
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : "bg-gray-100 text-gray-500 border border-gray-200"
                          }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.req ? "bg-red-400" : "bg-gray-400"}`} />
                        {c.col}
                      </div>
                    ))}
                  </div>

                  {/* Leyenda + descripción expandida */}
                  <div className="flex items-center gap-4 pt-2">
                    <span className="flex items-center gap-1.5 text-xs text-gray-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />
                      Obligatorio
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-gray-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" />
                      Opcional
                    </span>
                  </div>

                  {/* Tabla detallada */}
                  <div className="mt-3 rounded-xl overflow-hidden border border-gray-100">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-widest text-gray-400">
                            Columna
                          </th>
                          <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-widest text-gray-400">
                            Descripción
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {COL_INFO.map((c) => (
                          <tr key={c.col} className="hover:bg-gray-50 transition-colors duration-150">
                            <td className="px-4 py-2.5 font-mono text-sm text-gray-700 font-medium whitespace-nowrap">
                              {c.col}
                            </td>
                            <td className="px-4 py-2.5 text-sm text-gray-600">
                              {c.desc}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </Accordion>

              {/* Acordeón 2: Valores aplicados automáticamente */}
              <Accordion
                icon={<FileSpreadsheet className="w-4 h-4 text-blue-500" />}
                title="Valores aplicados automáticamente"
              >
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {DEFAULTS_INFO.map((d) => (
                    <div
                      key={d.campo}
                      className="bg-gray-50 rounded-xl border border-gray-100 p-3"
                    >
                      <p className="font-mono text-xs text-gray-400">{d.campo}</p>
                      <p className="font-semibold text-gray-800 text-sm mt-0.5">{d.valor}</p>
                      <p className="text-gray-400 text-xs mt-0.5">{d.desc}</p>
                    </div>
                  ))}
                </div>
              </Accordion>

              {/* Acordeón 3: Requisitos */}
              <Accordion
                icon={<CheckCircle className="w-4 h-4 text-blue-500" />}
                title="Requisitos antes de cargar"
              >
                <ul className="mt-4 space-y-2.5">
                  {[
                    "El archivo debe tener la fila de cabeceras en la primera fila",
                    "El DNI_MEDICO debe corresponder a un profesional registrado en el sistema",
                    "El DOC_PACIENTE (DNI) debe tener 8 dígitos",
                    "HORA_CITA en formato HH:MM:SS (ej: 08:30:00)",
                    "TIPO_CITA: RECITA, TELECONSULTA o INTERCONSULTA",
                    "Pacientes ya existentes en la bolsa serán marcados como duplicados (no se insertan)",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                      <span className="mt-0.5 w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {i + 1}
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </Accordion>
            </div>

            {/* Columna derecha — Tarjeta plantilla (fixed width) */}
            <div className="w-64 flex-shrink-0">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-6">
                {/* Encabezado */}
                <div className="flex items-center gap-2 mb-5">
                  <FileSpreadsheet className="w-4 h-4 text-gray-500" />
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                    Estructura del Excel
                  </p>
                </div>

                {/* Badge de contadores */}
                <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 mb-5 space-y-3">
                  {/* Total */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Campos totales</span>
                    <span className="text-xl font-bold text-gray-800">
                      {COL_INFO.length}
                    </span>
                  </div>
                  <div className="border-t border-gray-100" />
                  {/* Obligatorios */}
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-sm text-red-600">
                      <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
                      Obligatorios
                    </span>
                    <span className="text-lg font-bold text-red-600">{REQ_COUNT}</span>
                  </div>
                  {/* Opcionales */}
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-sm text-gray-400">
                      <span className="w-2 h-2 rounded-full bg-gray-300 inline-block" />
                      Opcionales
                    </span>
                    <span className="text-lg font-bold text-gray-400">{OPT_COUNT}</span>
                  </div>
                </div>

                {/* Botón descargar */}
                <button
                  onClick={handleDescargarPlantilla}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  Descargar Plantilla
                </button>
                <p className="text-xs text-gray-400 text-center mt-2.5">
                  Incluye una fila de muestra
                </p>
              </div>
            </div>
          </div>

          {/* ── Zona drag & drop ───────────────────────────── */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`rounded-2xl border-2 border-dashed transition-all duration-200 p-12
              ${isDragging
                ? "border-blue-400 bg-blue-50 scale-[1.005]"
                : "border-gray-200 bg-gradient-to-b from-gray-50 to-white hover:border-blue-300 hover:bg-blue-50/30"
              }`}
          >
            <div className="flex flex-col items-center">
              {/* Ícono con sombra */}
              <div
                className={`w-16 h-16 bg-white shadow-md rounded-2xl flex items-center justify-center mb-5 transition-all duration-200
                  ${isDragging ? "shadow-blue-200 scale-110" : ""}`}
              >
                <Upload
                  className={`w-7 h-7 transition-colors duration-200 ${isDragging ? "text-blue-500" : "text-gray-400"}`}
                />
              </div>

              <p className={`font-semibold text-lg mb-1 transition-colors duration-200 ${isDragging ? "text-blue-700" : "text-gray-700"}`}>
                {isDragging ? "Suelta el archivo aquí" : "Arrastra tu archivo aquí"}
              </p>
              <p className="text-sm text-gray-400 mb-6">
                .xlsx o .xls · máx 10 MB
              </p>

              <button
                onClick={() => inputRef.current?.click()}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-8 rounded-xl transition-all duration-200 text-sm inline-flex items-center gap-2 shadow-sm"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Seleccionar archivo
              </button>
            </div>

            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleInputChange}
              className="hidden"
            />
          </div>

          {/* ── Error: columnas faltantes ──────────────────── */}
          {validationErrors.length > 0 && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 text-red-700 font-semibold text-sm mb-3">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                Columnas faltantes en el archivo subido
              </div>
              <div className="flex flex-wrap gap-2">
                {validationErrors.map((c) => (
                  <span
                    key={c}
                    className="bg-red-100 text-red-700 text-xs font-mono px-2.5 py-1 rounded-lg border border-red-200"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* ══════════════════════════════════════════════════
          ESTADO 2 — PREVIEW
      ══════════════════════════════════════════════════ */}
      {state === "preview" && (
        <div className="w-full space-y-4">

          {/* ── Archivo cargado ─── */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 border border-green-200 rounded-xl flex items-center justify-center flex-shrink-0">
                <FileSpreadsheet className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-sm">{fileName}</p>
                <p className="text-gray-400 text-xs mt-0.5 flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {rows.length} paciente{rows.length !== 1 ? "s" : ""} detectado{rows.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-xl transition-all duration-200"
              title="Cambiar archivo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* ── Profesional + contador ─── */}
          <div className="grid grid-cols-5 gap-4">

            {/* Profesional — 3 cols */}
            <div className="col-span-3 bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
                Profesional asignado
              </p>

              {medico ? (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#0a5ba9] rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                    <span className="text-white font-bold text-lg">
                      {medico.nombre.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm leading-snug truncate">
                      {medico.nombre}
                    </p>
                    <p className="text-gray-400 text-xs mt-1 font-mono">
                      DNI {dniMedico} · ID {medico.idPers}
                    </p>
                    <span className="mt-2 inline-flex items-center gap-1 bg-green-50 text-green-700 border border-green-200 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                      <CheckCircle className="w-3 h-3" /> Identificado
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-amber-50 border border-amber-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Buscando profesional…</p>
                    <p className="text-xs text-gray-400 mt-0.5 font-mono">DNI: {dniMedico}</p>
                    <span className="mt-2 inline-flex items-center gap-1 bg-amber-50 text-amber-600 border border-amber-200 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      Verificando identidad
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Contador pacientes — 2 cols */}
            <div className="col-span-2 bg-[#0a5ba9] rounded-2xl p-5 flex flex-col justify-between text-white shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/60">
                Listos para cargar
              </p>
              <div>
                <p className="text-5xl font-bold leading-none mt-2">{rows.length}</p>
                <p className="text-white/70 text-sm mt-1.5">
                  paciente{rows.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-white/60 text-xs mt-3">
                <Users className="w-3.5 h-3.5" />
                desde {fileName}
              </div>
            </div>
          </div>

          {/* ── Tabla preview ─── */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
              <Eye className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Vista previa
              </span>
              <span className="text-xs text-gray-400">—</span>
              <span className="text-xs font-semibold text-gray-700">
                primeras {Math.min(rows.length, 5)}
              </span>
              <span className="text-xs text-gray-400">de {rows.length} filas</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#0a5ba9] text-white">
                    {["DNI", "Paciente", "Sexo", "Edad", "Hora", "Tipo"].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-2.5 text-left text-xs font-semibold whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 5).map((r, i) => (
                    <tr
                      key={i}
                      className={`border-b border-gray-100 hover:bg-blue-50 transition-colors duration-150 ${i % 2 === 1 ? "bg-gray-50/50" : "bg-white"}`}
                    >
                      <td className="px-4 py-2.5 font-mono text-xs text-gray-500 whitespace-nowrap">{r["DOC_PACIENTE"]}</td>
                      <td className="px-4 py-2.5 text-xs text-gray-800 max-w-[200px] truncate font-medium">{r["PACIENTE"]}</td>
                      <td className="px-4 py-2.5 text-xs text-gray-500">{r["SEXO"]}</td>
                      <td className="px-4 py-2.5 text-xs text-gray-500">{r["EDAD"]}</td>
                      <td className="px-4 py-2.5 font-mono text-xs text-gray-500">{r["HORA_CITA"]}</td>
                      <td className="px-4 py-2.5">
                        <span className="bg-blue-100 text-[#0a5ba9] border border-blue-200 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                          {r["TIPO_CITA"] || "RECITA"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {rows.length > 5 && (
                <div className="px-5 py-2.5 bg-gray-50 border-t border-gray-100">
                  <p className="text-gray-400 text-xs">
                    … y <strong className="text-gray-600">{rows.length - 5}</strong> fila{rows.length - 5 !== 1 ? "s" : ""} adicional{rows.length - 5 !== 1 ? "es" : ""} no mostrada{rows.length - 5 !== 1 ? "s" : ""}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── Área de acciones ─── */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
            <div className="flex items-center gap-3">
              <button
                onClick={handleCargar}
                disabled={!medico?.idPers}
                className="flex-1 bg-[#0a5ba9] hover:bg-[#0d4e90] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm shadow-sm"
              >
                <Upload className="w-4 h-4" />
                Cargar {rows.length} Paciente{rows.length !== 1 ? "s" : ""}
              </button>
              <button
                onClick={handleReset}
                className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 font-medium py-3 px-5 rounded-xl transition-all duration-200 text-sm whitespace-nowrap"
              >
                Cancelar
              </button>
            </div>

            {!medico?.idPers && (
              <div className="mt-3 flex items-center justify-center gap-1.5 text-amber-600 text-xs bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" />
                Esperando datos del profesional antes de habilitar la carga…
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          ESTADO 3 — LOADING
      ══════════════════════════════════════════════════ */}
      {state === "loading" && (
        <div className="w-full text-center py-24">
          <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          </div>
          <p className="text-gray-900 font-bold text-xl">Cargando pacientes...</p>
          <p className="text-sm text-gray-500 mt-2 animate-pulse">
            Procesando {rows.length} registro{rows.length !== 1 ? "s" : ""}, por favor espera
          </p>
        </div>
      )}

      {/* ══════════════════════════════════════════════════
          ESTADO 4 — RESULTADO
      ══════════════════════════════════════════════════ */}
      {state === "result" && resultado && (
        <div className="w-full space-y-5">

          {/* Banner éxito/advertencia */}
          <div
            className={`rounded-2xl p-5 border transition-all duration-200
              ${resultado.errores === 0
                ? "bg-green-50 border-green-200"
                : "bg-amber-50 border-amber-200"
              }`}
          >
            <div className="flex items-center gap-3">
              {resultado.errores === 0
                ? <CheckCircle className="w-7 h-7 text-green-500 flex-shrink-0" />
                : <AlertCircle className="w-7 h-7 text-amber-500 flex-shrink-0" />
              }
              <div>
                <p className={`font-bold text-base ${resultado.errores === 0 ? "text-green-800" : "text-amber-800"}`}>
                  {resultado.errores === 0
                    ? "Carga completada sin errores"
                    : `Carga completada con ${resultado.errores} error${resultado.errores !== 1 ? "es" : ""}`
                  }
                </p>
                <p className={`text-sm mt-0.5 ${resultado.errores === 0 ? "text-green-600" : "text-amber-600"}`}>
                  {resultado.insertados} insertado{resultado.insertados !== 1 ? "s" : ""} · {" "}
                  {resultado.duplicados} duplicado{resultado.duplicados !== 1 ? "s" : ""} · {" "}
                  {resultado.total} total
                </p>
              </div>
            </div>

            {/* Barra de progreso visual */}
            {resultado.total > 0 && (
              <div className="mt-4">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className={resultado.errores === 0 ? "text-green-700" : "text-amber-700"}>
                    Insertados
                  </span>
                  <span className={resultado.errores === 0 ? "text-green-700 font-bold" : "text-amber-700 font-bold"}>
                    {Math.round((resultado.insertados / resultado.total) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-white rounded-full h-2.5 overflow-hidden border border-gray-100">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${resultado.errores === 0 ? "bg-green-500" : "bg-amber-500"}`}
                    style={{ width: `${(resultado.insertados / resultado.total) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* KPIs — 3 cards horizontales */}
          <div className="grid grid-cols-3 gap-4">
            {/* Insertados */}
            <div className="bg-white rounded-2xl border border-green-200 p-5 text-center shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-4xl font-bold text-green-700 leading-none">{resultado.insertados}</p>
              <p className="text-green-600 text-sm mt-2 font-semibold">Insertados</p>
            </div>

            {/* Duplicados */}
            <div className="bg-white rounded-2xl border border-amber-200 p-5 text-center shadow-sm">
              <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="w-6 h-6 text-amber-600" />
              </div>
              <p className="text-4xl font-bold text-amber-700 leading-none">{resultado.duplicados}</p>
              <p className="text-amber-600 text-sm mt-2 font-semibold">Duplicados</p>
              <p className="text-gray-400 text-xs mt-0.5">ya existían</p>
            </div>

            {/* Errores */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center shadow-sm">
              <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <X className="w-6 h-6 text-red-500" />
              </div>
              <p className="text-4xl font-bold text-red-600 leading-none">{resultado.errores}</p>
              <p className="text-red-500 text-sm mt-2 font-semibold">Errores</p>
            </div>
          </div>

          {/* Detalle errores */}
          {resultado.detalleErrores?.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
              <p className="font-semibold text-red-700 text-sm mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Detalle de errores
              </p>
              <ul className="space-y-1.5 max-h-44 overflow-y-auto">
                {resultado.detalleErrores.map((e, i) => (
                  <li
                    key={i}
                    className="text-red-600 text-xs font-mono bg-red-100 border border-red-200 rounded-lg px-3 py-1.5"
                  >
                    {e}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Accion: Nueva carga */}
          <button
            onClick={handleReset}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Nueva carga
          </button>
        </div>
      )}
    </div>
  );
}

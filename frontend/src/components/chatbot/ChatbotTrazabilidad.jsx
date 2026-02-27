// ========================================================================
// ChatbotTrazabilidad.jsx — Widget flotante de IA (v1.75.1)
// ========================================================================
// Asistente de trazabilidad para personal interno CENATE.
// Solo visible para roles en la lista blanca (no EXTERNO / INSTITUCION).
// Sugerencias y bienvenida personalizadas por rol.
// Posicionado fixed bottom-right, z-index 9000.
// v1.75.1: Estado expandido (680x680) con timestamps y textarea más cómodo.
// ========================================================================

import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import chatbotTrazabilidadService from '../../services/chatbotTrazabilidadService';

const RUTAS_PUBLICAS = ['/', '/login', '/crear-cuenta', '/cambiar-contrasena', '/unauthorized'];

// ── Helpers ──────────────────────────────────────────────────────────────

const ROLES_CON_CHATBOT = [
  'SUPERADMIN', 'ADMINISTRADOR', 'COORDINADOR',
  'COORDINADOR_GESTION_CITAS', 'GESTION_TERRITORIAL',
  'MEDICO', 'ENFERMERIA', 'CITAS', 'ESTADISTICA',
];

function tieneChatbotAccess(roles) {
  if (!Array.isArray(roles)) return false;
  return roles.some(r => {
    const nombre = (typeof r === 'string' ? r : r?.authority || '').toUpperCase();
    return ROLES_CON_CHATBOT.some(rol => nombre.includes(rol));
  });
}

function detectarRolPrincipal(roles) {
  if (!Array.isArray(roles)) return 'DEFAULT';
  for (const r of roles) {
    const nombre = (typeof r === 'string' ? r : r?.authority || '').toUpperCase();
    if (nombre.includes('SUPERADMIN') || nombre.includes('ADMINISTRADOR')) return 'ADMIN';
    if (nombre.includes('COORDINADOR_GESTION_CITAS')) return 'COORDINADOR_GESTION_CITAS';
    if (nombre.includes('COORDINADOR')) return 'COORDINADOR';
    if (nombre.includes('MEDICO')) return 'MEDICO';
    if (nombre.includes('GESTION_TERRITORIAL')) return 'GESTION_TERRITORIAL';
    if (nombre.includes('ENFERMERIA')) return 'ENFERMERIA';
    if (nombre.includes('CITAS')) return 'CITAS';
    if (nombre.includes('ESTADISTICA')) return 'ESTADISTICA';
  }
  return 'DEFAULT';
}

function getSugerenciasPorRol(roles) {
  const rol = detectarRolPrincipal(roles);
  switch (rol) {
    case 'ADMIN':
      return [
        'Buscar usuario admin',
        'Buscar profesional SALINAS',
        'Inconsistencias DNI 08643806',
        'Trazabilidad DNI 08643806',
      ];
    case 'COORDINADOR':
    case 'COORDINADOR_GESTION_CITAS':
      return [
        'Historial DNI 08643806',
        '¿Puede nueva cita DNI 08643806?',
        'Trazabilidad completa DNI 08643806',
        'Inconsistencias DNI 08643806',
      ];
    case 'MEDICO':
      return [
        'Historial DNI 08643806',
        '¿Tiene citas activas DNI 08643806?',
        'Trazabilidad completa DNI 08643806',
        'Buscar profesional por nombre',
      ];
    case 'GESTION_TERRITORIAL':
      return [
        'Buscar profesional GARCIA',
        'Historial DNI 08643806',
        'Inconsistencias DNI 08643806',
        'Buscar usuario coordinador',
      ];
    case 'ENFERMERIA':
    case 'CITAS':
      return [
        '¿Puede nueva cita DNI 08643806?',
        'Historial DNI 08643806',
        '¿Tiene solicitudes activas DNI 08643806?',
        'Buscar profesional por nombre',
      ];
    default:
      return [
        'Historial DNI 08643806',
        '¿Puede nueva cita DNI 08643806?',
        'Buscar usuario',
        'Inconsistencias DNI',
      ];
  }
}

function getMensajeBienvenida(roles) {
  const rol = detectarRolPrincipal(roles);
  switch (rol) {
    case 'ADMIN':
      return 'Hola Soy el asistente CENATE.\nPuedo buscar usuarios, profesionales, historial de pacientes e inconsistencias del sistema.';
    case 'COORDINADOR':
    case 'COORDINADOR_GESTION_CITAS':
      return 'Hola Soy el asistente de trazabilidad CENATE.\nPuedo consultar historial de pacientes, verificar si pueden recibir nueva cita y detectar inconsistencias en la BD.';
    case 'MEDICO':
      return 'Hola Soy tu asistente CENATE.\nPuedo consultar el historial y trazabilidad de tus pacientes en la BD.';
    case 'GESTION_TERRITORIAL':
      return 'Hola Soy el asistente CENATE.\nPuedo buscar profesionales, historial de pacientes e inconsistencias en tu territorio.';
    case 'CITAS':
      return 'Hola Soy tu asistente CENATE.\nPuedo verificar si un paciente puede recibir nueva cita, consultar su historial y buscar solicitudes activas antes de registrarlo.';
    case 'ENFERMERIA':
      return 'Hola Soy tu asistente CENATE.\nPuedo consultar el historial de pacientes, verificar solicitudes activas y buscar informacion antes de la atencion.';
    case 'ESTADISTICA':
      return 'Hola Soy el asistente CENATE.\nPuedo mostrarte resumenes y KPIs de solicitudes por estado o especialidad, y consultar historial de pacientes.';
    default:
      return 'Hola Soy el asistente de trazabilidad CENATE.\nPreguntame sobre pacientes, citas o usuarios del sistema.';
  }
}

// Helper para obtener hora actual formateada
function horaActual() {
  return new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
}

// ── Estilos animación flotante ────────────────────────────────────────────
const CENATITO_STYLES = `
  @keyframes cenatito-float {
    0%   { transform: translateY(0px);   }
    50%  { transform: translateY(-7px);  }
    100% { transform: translateY(0px);   }
  }
  @keyframes cenatito-glow {
    0%   { box-shadow: 0 0 12px 2px rgba(59,130,246,0.5), 0 4px 20px rgba(10,91,169,0.4); }
    50%  { box-shadow: 0 0 22px 6px rgba(99,179,237,0.7), 0 8px 28px rgba(10,91,169,0.6); }
    100% { box-shadow: 0 0 12px 2px rgba(59,130,246,0.5), 0 4px 20px rgba(10,91,169,0.4); }
  }
  .cenatito-float { animation: cenatito-float 2.4s ease-in-out infinite; }
  .cenatito-btn   { animation: cenatito-glow  2.4s ease-in-out infinite; }
`;

// ── Avatar animado Cenatito ───────────────────────────────────────────────
const TOTAL_FRAMES = 30;
const FRAME_INTERVAL = 80; // ms entre frames (~12fps)

function CenatitoBotAvatar({ size = 32, float = false, className = '' }) {
  const [frame, setFrame] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setFrame(f => (f + 1) % TOTAL_FRAMES);
    }, FRAME_INTERVAL);
    return () => clearInterval(timer);
  }, []);

  const src = `/images/Cenatito_animado/cenatito_${String(frame).padStart(3, '0')}.png`;

  return (
    <img
      src={src}
      alt="Cenatito CENATE"
      width={size}
      height={size}
      className={`select-none object-contain ${float ? 'cenatito-float' : ''} ${className}`}
      draggable={false}
    />
  );
}

function BotAvatar() {
  return <CenatitoBotAvatar size={26} />;
}

// ── Componente principal ──────────────────────────────────────────────────

export default function ChatbotTrazabilidad() {
  const { isAuthenticated, user } = useAuth();
  const { pathname } = useLocation();
  const [abierto, setAbierto] = useState(false);
  const [expandido, setExpandido] = useState(false);
  const [mensajes, setMensajes] = useState([
    {
      id: 0,
      tipo: 'bot',
      texto: 'Hola Soy el asistente de trazabilidad CENATE.\nPreguntame sobre pacientes, citas o usuarios del sistema.',
      hora: horaActual(),
    },
  ]);
  const [input, setInput] = useState('');
  const [cargando, setCargando] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Actualizar bienvenida cuando el usuario este disponible
  useEffect(() => {
    if (!user?.roles) return;
    const bienvenida = getMensajeBienvenida(user.roles);
    setMensajes([{ id: 0, tipo: 'bot', texto: bienvenida, hora: horaActual() }]);
  }, [user?.roles]);

  // Solo mostrar para personal interno autenticado con acceso al chatbot, fuera de rutas públicas
  const esRutaPublica = RUTAS_PUBLICAS.includes(pathname);
  const esInterno = isAuthenticated && !esRutaPublica && tieneChatbotAccess(user?.roles || []);

  // Hooks deben ir antes de cualquier return condicional (Rules of Hooks)
  useEffect(() => {
    if (!esInterno || !abierto) return;
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes, abierto, esInterno]);

  useEffect(() => {
    if (!esInterno || !abierto) return;
    inputRef.current?.focus();
  }, [abierto, esInterno]);

  if (!esInterno) return null;

  const sugerencias = getSugerenciasPorRol(user?.roles || []);

  // Dimensiones dinámicas según estado de expansión
  const panelStyle = expandido
    ? { width: 680, height: 680, transition: 'width 0.3s ease, height 0.3s ease' }
    : { width: 360, height: 500, transition: 'width 0.3s ease, height 0.3s ease' };

  const enviarMensaje = async (texto) => {
    const msg = texto.trim();
    if (!msg || cargando) return;

    const idUsuario = Date.now();
    setMensajes(prev => [...prev, { id: idUsuario, tipo: 'usuario', texto: msg, hora: horaActual() }]);
    setInput('');
    setCargando(true);

    try {
      const data = await chatbotTrazabilidadService.chat(msg);
      const respuesta = data?.respuesta || 'No se obtuvo respuesta del servidor.';
      setMensajes(prev => [...prev, { id: idUsuario + 1, tipo: 'bot', texto: respuesta, hora: horaActual() }]);
    } catch (error) {
      setMensajes(prev => [
        ...prev,
        {
          id: idUsuario + 1,
          tipo: 'bot',
          texto: 'Error al procesar la consulta. Verifica tu conexion o intenta de nuevo.',
          hora: horaActual(),
        },
      ]);
    } finally {
      setCargando(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviarMensaje(input);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-[9000] flex flex-col items-end">
      <style>{CENATITO_STYLES}</style>

      {/* Panel de conversación */}
      {abierto && (
        <div
          className="mb-3 flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
          style={panelStyle}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#0A5BA9] text-white shrink-0">
            <div className="flex items-center gap-2">
              <BotAvatar />
              <div>
                <p className="font-semibold text-sm leading-none">Asistente CENATE</p>
                <p className="text-xs text-blue-200 mt-0.5">Trazabilidad en tiempo real</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {/* Botón expandir/contraer — va ANTES del botón × */}
              <button
                onClick={() => setExpandido(prev => !prev)}
                className="text-white hover:text-blue-200 transition-colors mr-2 p-1 rounded"
                aria-label={expandido ? 'Contraer' : 'Expandir'}
                title={expandido ? 'Vista compacta' : 'Expandir conversación'}
              >
                {expandido ? (
                  // Icono minimizar (dos flechas hacia adentro)
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 9L4 4m0 0h5m-5 0v5M15 9l5-5m0 0h-5m5 0v5M9 15l-5 5m0 0h5m-5 0v-5M15 15l5 5m0 0h-5m5 0v-5" />
                  </svg>
                ) : (
                  // Icono expandir (dos flechas hacia afuera)
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                )}
              </button>

              {/* Botón cerrar */}
              <button
                onClick={() => setAbierto(false)}
                className="text-white hover:text-blue-200 transition-colors text-xl leading-none"
                aria-label="Cerrar chatbot"
              >
                ×
              </button>
            </div>
          </div>

          {/* Mensajes */}
          <div className={`flex-1 overflow-y-auto bg-slate-50 ${expandido ? 'p-4 space-y-3' : 'p-3 space-y-2'}`}>
            {mensajes.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.tipo === 'usuario' ? 'justify-end' : 'justify-start'}`}
              >
                {m.tipo === 'bot' && (
                  <span className="mr-1.5 mt-1 shrink-0 text-base">🤖</span>
                )}
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                    m.tipo === 'usuario'
                      ? 'bg-[#0A5BA9] text-white rounded-br-sm'
                      : 'bg-white text-slate-700 rounded-bl-sm shadow-sm border border-slate-100'
                  }`}
                >
                  {m.tipo === 'usuario' ? (
                    <span className="whitespace-pre-wrap">{m.texto}</span>
                  ) : (
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className="mb-1.5 last:mb-0">{children}</p>,
                        strong: ({ children }) => <strong className="font-semibold text-slate-800">{children}</strong>,
                        ul: ({ children }) => <ul className="list-disc list-inside space-y-0.5 my-1.5 pl-1">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal list-inside space-y-0.5 my-1.5 pl-1">{children}</ol>,
                        li: ({ children }) => <li className="text-slate-700">{children}</li>,
                        table: ({ children }) => (
                          <div className="overflow-x-auto my-2 rounded-lg border border-slate-200">
                            <table className="w-full text-xs border-collapse">{children}</table>
                          </div>
                        ),
                        thead: ({ children }) => <thead className="bg-[#0A5BA9] text-white">{children}</thead>,
                        tbody: ({ children }) => <tbody className="divide-y divide-slate-100">{children}</tbody>,
                        th: ({ children }) => <th className="px-2 py-1.5 text-left font-semibold whitespace-nowrap">{children}</th>,
                        td: ({ children }) => <td className="px-2 py-1.5 text-slate-700">{children}</td>,
                        tr: ({ children }) => <tr className="even:bg-slate-50">{children}</tr>,
                        code: ({ children }) => <code className="bg-slate-100 text-blue-700 rounded px-1 py-0.5 text-xs font-mono">{children}</code>,
                        blockquote: ({ children }) => <blockquote className="border-l-2 border-blue-300 pl-2 text-slate-500 italic my-1">{children}</blockquote>,
                        h3: ({ children }) => <h3 className="font-semibold text-slate-800 mt-2 mb-1">{children}</h3>,
                      }}
                    >
                      {m.texto}
                    </ReactMarkdown>
                  )}

                  {/* Timestamp — visible solo en estado expandido */}
                  {expandido && m.hora && (
                    <p className={`text-[10px] opacity-60 mt-1 ${m.tipo === 'usuario' ? 'text-right text-blue-100' : 'text-right text-slate-400'}`}>
                      {m.hora}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {/* Spinner mientras carga */}
            {cargando && (
              <div className="flex justify-start">
                <span className="mr-1.5 mt-1 text-base shrink-0">🤖</span>
                <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-sm px-3 py-2 shadow-sm">
                  <span className="flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Sugerencias rapidas (solo al inicio) */}
          {mensajes.length === 1 && !cargando && (
            <div className="px-3 py-2 flex flex-wrap gap-1.5 bg-white border-t border-slate-100 shrink-0">
              {sugerencias.map((s) => (
                <button
                  key={s}
                  onClick={() => enviarMensaje(s)}
                  className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full border border-blue-200 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="flex items-end gap-2 px-3 py-2.5 bg-white border-t border-slate-200 shrink-0">
            <textarea
              ref={inputRef}
              rows={expandido ? 2 : 1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu consulta... (Enter para enviar)"
              disabled={cargando}
              className="flex-1 resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50 max-h-24 overflow-y-auto"
              style={{ lineHeight: '1.4' }}
            />
            <button
              onClick={() => enviarMensaje(input)}
              disabled={!input.trim() || cargando}
              className="shrink-0 w-9 h-9 flex items-center justify-center rounded-xl bg-[#0A5BA9] text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Enviar"
            >
              <svg className="w-4 h-4 rotate-90" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0l-7 7m7-7 7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Boton flotante — círculo azul oscuro con Cenatito flotando */}
      <button
        onClick={() => setAbierto(prev => !prev)}
        className={`w-[72px] h-[72px] rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 ${
          abierto ? 'bg-[#0d1b3e]' : 'bg-[#0d1b3e] cenatito-btn'
        }`}
        aria-label={abierto ? 'Cerrar asistente' : 'Abrir asistente CENATE'}
        title="Asistente de Trazabilidad CENATE"
      >
        {abierto
          ? <span className="text-white text-3xl font-thin leading-none">×</span>
          : <CenatitoBotAvatar size={52} float={true} />
        }
      </button>
    </div>
  );
}

// ========================================================================
// 🤖 ChatbotTrazabilidad.jsx — Widget flotante de IA (v1.70.0)
// ========================================================================
// Asistente de trazabilidad para personal interno CENATE.
// Solo visible para roles internos (no EXTERNO / INSTITUCION).
// Posicionado fixed bottom-right, z-index 9000.
// ========================================================================

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import chatbotTrazabilidadService from '../../services/chatbotTrazabilidadService';

// ── Helpers ──────────────────────────────────────────────────────────────

function isRoleExterno(roles) {
  if (!Array.isArray(roles)) return false;
  return roles.some(r => {
    const nombre = (typeof r === 'string' ? r : r?.authority || '').toUpperCase();
    return nombre.includes('EXTERNO') || nombre.includes('INSTITUCION');
  });
}

function BotAvatar() {
  return (
    <span className="text-lg select-none" role="img" aria-label="bot">🤖</span>
  );
}

// ── Componente principal ──────────────────────────────────────────────────

export default function ChatbotTrazabilidad() {
  const { isAuthenticated, user } = useAuth();
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState([
    {
      id: 0,
      tipo: 'bot',
      texto: 'Hola 👋 Soy el asistente de trazabilidad CENATE.\nPregúntame sobre pacientes, citas, usuarios o problemas del sistema.',
    },
  ]);
  const [input, setInput] = useState('');
  const [cargando, setCargando] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Solo mostrar para personal interno autenticado
  const esInterno = isAuthenticated && !isRoleExterno(user?.roles || []);

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

  const enviarMensaje = async (texto) => {
    const msg = texto.trim();
    if (!msg || cargando) return;

    const idUsuario = Date.now();
    setMensajes(prev => [...prev, { id: idUsuario, tipo: 'usuario', texto: msg }]);
    setInput('');
    setCargando(true);

    try {
      const data = await chatbotTrazabilidadService.chat(msg);
      const respuesta = data?.respuesta || 'No se obtuvo respuesta del servidor.';
      setMensajes(prev => [...prev, { id: idUsuario + 1, tipo: 'bot', texto: respuesta }]);
    } catch (error) {
      setMensajes(prev => [
        ...prev,
        {
          id: idUsuario + 1,
          tipo: 'bot',
          texto: '❌ Error al procesar la consulta. Verifica tu conexión o intenta de nuevo.',
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

  const sugerencias = [
    '¿Qué roles existen?',
    'Buscar usuario admin',
    'DNI 08643806',
    'Detectar inconsistencias',
  ];

  return (
    <div className="fixed bottom-4 right-4 z-[9000] flex flex-col items-end">

      {/* Panel expandido */}
      {abierto && (
        <div
          className="mb-3 flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
          style={{ width: 360, height: 500 }}
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
            <button
              onClick={() => setAbierto(false)}
              className="text-white hover:text-blue-200 transition-colors text-xl leading-none"
              aria-label="Cerrar chatbot"
            >
              ×
            </button>
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50">
            {mensajes.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.tipo === 'usuario' ? 'justify-end' : 'justify-start'}`}
              >
                {m.tipo === 'bot' && (
                  <span className="mr-1.5 mt-1 shrink-0 text-base">🤖</span>
                )}
                <div
                  className={`max-w-[78%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed ${
                    m.tipo === 'usuario'
                      ? 'bg-[#0A5BA9] text-white rounded-br-sm'
                      : 'bg-white text-slate-700 rounded-bl-sm shadow-sm border border-slate-100'
                  }`}
                >
                  {m.texto}
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

          {/* Sugerencias rápidas (solo al inicio) */}
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
              rows={1}
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

      {/* Botón flotante */}
      <button
        onClick={() => setAbierto(prev => !prev)}
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl transition-all duration-200 hover:scale-110 active:scale-95 ${
          abierto
            ? 'bg-slate-500 text-white'
            : 'bg-[#0A5BA9] text-white hover:bg-blue-700'
        }`}
        aria-label={abierto ? 'Cerrar asistente' : 'Abrir asistente CENATE'}
        title="Asistente de Trazabilidad CENATE"
      >
        {abierto ? '×' : '🤖'}
      </button>
    </div>
  );
}

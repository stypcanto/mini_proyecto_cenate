import React, { useState, useRef, useEffect } from "react";
import { X, Mail, Loader2, CheckCircle2, AlertTriangle, User, ChevronRight, Clock } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { API_ROUTES } from "../../constants/apiRoutes";
import {apiClient} from "../../../../../lib/apiClient";

export default function ForgotPasswordModal({ onClose }) {
  // Estados para flujo de 2 pasos
  const [paso, setPaso] = useState(1); // 1: Ingresar DNI, 2: Seleccionar correo
  const [username, setUsername] = useState("");
  const [correosDisponibles, setCorreosDisponibles] = useState(null);
  const [correoSeleccionado, setCorreoSeleccionado] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Estado para modal de confirmación
  const [showConfirmacion, setShowConfirmacion] = useState(false);
  const [correoEnviado, setCorreoEnviado] = useState("");

  const idemKeyRef = useRef(null);
  const timerRef = useRef(null);

  // Limpiar timer al desmontar
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const getIdemKey = ()=>{
    if (!idemKeyRef.current){
      console.log("Se genera un nuevo idemKeyRef");
      idemKeyRef.current = uuidv4();
    }
    return idemKeyRef.current;
  };

  // Cerrar modal de confirmación
  const cerrarConfirmacion = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setShowConfirmacion(false);
    setPaso(1);
    setUsername("");
    setCorreosDisponibles(null);
    setCorreoSeleccionado("");
    setCorreoEnviado("");
    setMessage(null);
    onClose();
  };

  // Paso 1: Buscar correos disponibles del usuario
  const handleBuscarCorreos = async (e) => {
    e.preventDefault();
    if(loading) return;
    setMessage(null);
    setError(null);

    if (!username.trim()) {
      setError("Por favor ingrese su DNI.");
      return;
    }

    try {
      setLoading(true);

      const response = await apiClient.get(
        `/api/sesion/correos-disponibles/${username}`,
        false,
        { timeoutMs: 15000 }
      );

      if (response?.data) {
        setCorreosDisponibles(response.data);
        setPaso(2); // Avanzar al paso 2

        // Pre-seleccionar correo personal si está disponible
        if (response.data.tieneCorreoPersonal) {
          setCorreoSeleccionado(response.data.correoPersonal);
        } else if (response.data.tieneCorreoCorporativo) {
          setCorreoSeleccionado(response.data.correoCorporativo);
        }
      }

    } catch (err) {
      setError(err.message || "No se pudo consultar los correos. Verifique su DNI.");
    } finally {
      setLoading(false);
    }
  };

  // Paso 2: Enviar enlace al correo seleccionado
  const handleEnviarEnlace = async (e) => {
    e.preventDefault();
    if(loading) return;
    setMessage(null);
    setError(null);

    if (!correoSeleccionado) {
      setError("Por favor seleccione un correo.");
      return;
    }

    try {
      setLoading(true);
      const idempotencyKey = getIdemKey();

      await apiClient.post(
        API_ROUTES.INICIO.RECUPERAR_PWD,
        {
          username: username,
          email: correoSeleccionado
        },
        false,
        {
          timeoutMs: 15000,
          headers: {
            "Idempotency-Key": idempotencyKey
          }
        }
      );

      idemKeyRef.current = null;

      // Guardar correo enmascarado y mostrar modal de confirmación
      const correoEnmascaradoFinal = correoSeleccionado === correosDisponibles.correoPersonal
        ? correosDisponibles.correoPersonalEnmascarado
        : correosDisponibles.correoCorporativoEnmascarado;

      setCorreoEnviado(correoEnmascaradoFinal);
      setShowConfirmacion(true);

      // Auto-cerrar después de 60 segundos
      timerRef.current = setTimeout(() => {
        cerrarConfirmacion();
      }, 60000);

    } catch (err) {
      setError(err.message || "No se pudo procesar la solicitud.");
    } finally {
      setLoading(false);
    }
  };

  // Volver al paso 1
  const handleVolver = () => {
    setPaso(1);
    setCorreosDisponibles(null);
    setCorreoSeleccionado("");
    setError(null);
    setMessage(null);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center border-b px-5 py-3 bg-[#0a5ba9]/10">
          <h2 className="text-[#0a5ba9] font-bold text-lg">
            Recuperar contraseña
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          {/* Indicador de pasos */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className={`flex items-center gap-2 ${paso === 1 ? 'text-[#0a5ba9]' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${paso === 1 ? 'bg-[#0a5ba9] text-white' : 'bg-gray-200'}`}>
                1
              </div>
              <span className="text-sm font-medium">DNI</span>
            </div>
            <ChevronRight size={16} className="text-gray-400" />
            <div className={`flex items-center gap-2 ${paso === 2 ? 'text-[#0a5ba9]' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${paso === 2 ? 'bg-[#0a5ba9] text-white' : 'bg-gray-200'}`}>
                2
              </div>
              <span className="text-sm font-medium">Correo</span>
            </div>
          </div>

          {/* PASO 1: Ingresar DNI */}
          {paso === 1 && (
            <form onSubmit={handleBuscarCorreos} className="space-y-4">
              <p className="text-sm text-gray-600">
                Ingresa tu <b>DNI</b> para consultar los correos registrados en el sistema.
              </p>

              <div>
                <label className="text-sm font-semibold text-gray-700">
                  DNI / Documento de identidad
                </label>
                <div className="flex items-center border rounded-xl px-3 py-2 mt-1 focus-within:ring-2 focus-within:ring-[#0a5ba9]/40">
                  <User size={18} className="text-gray-400 mr-2" />
                  <input
                    type="text"
                    placeholder="Ejemplo: 44914706"
                    className="flex-1 outline-none text-sm text-gray-700"
                    value={username}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
                      setUsername(value);
                    }}
                    maxLength={12}
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg">
                  <AlertTriangle className="mt-0.5" size={18} />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-[#0a5ba9] text-white flex items-center gap-2 hover:opacity-95 disabled:opacity-60"
                >
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  Continuar
                </button>
              </div>
            </form>
          )}

          {/* PASO 2: Seleccionar correo */}
          {paso === 2 && correosDisponibles && (
            <form onSubmit={handleEnviarEnlace} className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-800">
                  <b>{correosDisponibles.nombreCompleto}</b>
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  DNI: {correosDisponibles.username}
                </p>
              </div>

              <p className="text-sm text-gray-600">
                Selecciona el correo donde deseas recibir el enlace de recuperación:
              </p>

              <div className="space-y-3">
                {/* Correo Personal */}
                {correosDisponibles.tieneCorreoPersonal && (
                  <label className={`flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    correoSeleccionado === correosDisponibles.correoPersonal
                      ? 'border-[#0a5ba9] bg-[#0a5ba9]/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="correo"
                      value={correosDisponibles.correoPersonal}
                      checked={correoSeleccionado === correosDisponibles.correoPersonal}
                      onChange={(e) => setCorreoSeleccionado(e.target.value)}
                      className="mt-1 accent-[#0a5ba9]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Mail size={16} className="text-gray-500" />
                        <span className="text-sm font-semibold text-gray-800">Correo Personal</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {correosDisponibles.correoPersonalEnmascarado}
                      </p>
                    </div>
                  </label>
                )}

                {/* Correo Corporativo */}
                {correosDisponibles.tieneCorreoCorporativo && (
                  <label className={`flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    correoSeleccionado === correosDisponibles.correoCorporativo
                      ? 'border-[#0a5ba9] bg-[#0a5ba9]/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="correo"
                      value={correosDisponibles.correoCorporativo}
                      checked={correoSeleccionado === correosDisponibles.correoCorporativo}
                      onChange={(e) => setCorreoSeleccionado(e.target.value)}
                      className="mt-1 accent-[#0a5ba9]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Mail size={16} className="text-gray-500" />
                        <span className="text-sm font-semibold text-gray-800">Correo Institucional</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {correosDisponibles.correoCorporativoEnmascarado}
                      </p>
                    </div>
                  </label>
                )}
              </div>

              {message && (
                <div className="flex items-start gap-2 bg-green-50 border border-green-200 text-green-700 text-sm p-3 rounded-lg">
                  <CheckCircle2 className="mt-0.5" size={18} />
                  <span>{message}</span>
                </div>
              )}
              {error && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg">
                  <AlertTriangle className="mt-0.5" size={18} />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleVolver}
                  disabled={loading}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 disabled:opacity-60"
                >
                  Volver
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-[#0a5ba9] text-white flex items-center gap-2 hover:opacity-95 disabled:opacity-60"
                >
                  {loading && <Loader2 size={16} className="animate-spin" />}
                  Enviar enlace
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Modal de Confirmación de Envío */}
      {showConfirmacion && (
        <div className="fixed inset-0 bg-black/60 z-[1100] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scaleIn">
            {/* Header con gradiente verde */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white relative">
              <button
                onClick={cerrarConfirmacion}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/20 transition-colors"
                title="Cerrar"
              >
                <X size={20} />
              </button>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
                  <CheckCircle2 size={40} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold">¡Correo Enviado!</h3>
              </div>
            </div>

            {/* Contenido */}
            <div className="p-6 space-y-4">
              {/* Mensaje principal */}
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                <p className="text-gray-800 text-sm leading-relaxed">
                  Se ha enviado un <b>enlace de recuperación de contraseña</b> al correo:
                </p>
                <div className="flex items-center justify-center gap-2 mt-3 bg-white rounded-lg p-3 border border-green-300">
                  <Mail size={18} className="text-green-600" />
                  <span className="text-green-700 font-semibold text-sm">
                    {correoEnviado}
                  </span>
                </div>
              </div>

              {/* Instrucciones */}
              <div className="space-y-3">
                <div className="flex items-start gap-3 text-sm text-gray-700">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 font-bold text-xs">1</span>
                  </div>
                  <p>
                    Revisa tu <b>bandeja de entrada</b> en los próximos <b>1 a 3 minutos</b>.
                  </p>
                </div>

                <div className="flex items-start gap-3 text-sm text-gray-700">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 font-bold text-xs">2</span>
                  </div>
                  <p>
                    Si no lo encuentras, verifica tu <b>carpeta de spam o correo no deseado</b>.
                  </p>
                </div>

                <div className="flex items-start gap-3 text-sm text-gray-700">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 font-bold text-xs">3</span>
                  </div>
                  <p>
                    Haz clic en el <b>enlace del correo</b> para restablecer tu contraseña de forma segura.
                  </p>
                </div>
              </div>

              {/* Info de auto-cierre */}
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500 pt-2 border-t border-gray-200">
                <Clock size={14} />
                <span>Esta ventana se cerrará automáticamente en 60 segundos</span>
              </div>

              {/* Botón de cerrar */}
              <button
                onClick={cerrarConfirmacion}
                className="w-full py-3 bg-[#0a5ba9] text-white rounded-xl font-medium hover:opacity-95 transition-opacity"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

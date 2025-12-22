import React, { useState, useRef } from "react";
import { X, Mail, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { API_ROUTES } from "../../constants/apiRoutes";
import {apiClient} from "../../lib/apiClient";

export default function ForgotPasswordModal({ onClose }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);


  const idemKeyRef = useRef(null);

  const getIdemKey = ()=>{
    if (!idemKeyRef.current){
      console.log("Se genera un nuevo idemKeyRef");
      idemKeyRef.current = uuidv4();
    }
    return idemKeyRef.current;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(loading) return; // evitamos el doble click
    setMessage(null);
    setError(null);

    if (!email.trim()) {
      setError("Por favor ingrese su correo electrónico.");
      return;
    }

    try {
      setLoading(true);
      const idempotencyKey = getIdemKey();


      const datos = await apiClient.post(
        API_ROUTES.INICIO.RECUPERAR_PWD,
        {email},
        false,
        {
          timeoutMs:15000, // se implementara despues con AbortController
          headers:{
            "Idempotency-Key": idempotencyKey
          }


        }
      );
      setMessage(datos?.message|| "Si el correo está registrado, se enviará un enlace de recuperación.");
      setEmail("");
      idemKeyRef.current= null;

    } catch (err) {
      setError(err.message || "No se pudo procesar la solicitud.");
    } finally {
      setLoading(false);
    }
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-sm text-gray-600">
            Ingresa tu <b>correo personal o institucional</b>. Si está registrado,
            recibirás un enlace de recuperación en tu correo personal.
          </p>

          <div>
            <label className="text-sm font-semibold text-gray-700">
              Correo electrónico
            </label>
            <div className="flex items-center border rounded-xl px-3 py-2 mt-1 focus-within:ring-2 focus-within:ring-[#0a5ba9]/40">
              <Mail size={18} className="text-gray-400 mr-2" />
              <input
                type="email"
                placeholder="tucorreo@ejemplo.com"
                className="flex-1 outline-none text-sm text-gray-700"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
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
              Enviar enlace
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

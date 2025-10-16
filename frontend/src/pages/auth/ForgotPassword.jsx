import React, { useState } from "react";
import { forgotPassword } from "@/api/auth";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, Mail } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Por favor ingresa tu correo electrónico.");
      return;
    }
    setLoading(true);
    try {
      await forgotPassword(email);
      toast.success("Solicitud registrada. Revisa tu correo.");
      setEmail("");
    } catch (error) {
      toast.error(error.message || "No se pudo enviar la solicitud.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-[#001a3a] to-[#002b5c] text-white relative">
      <Link
        to="/auth/login"
        className="absolute top-6 left-6 flex items-center text-sm text-gray-300 hover:text-white"
      >
        <ArrowLeft size={16} className="mr-1" /> Volver
      </Link>

      <div className="w-full max-w-md p-8 bg-white/95 rounded-2xl shadow-2xl text-gray-800 mx-4">
        <h2 className="text-2xl font-bold text-center text-[#002b5c] mb-1">
          Recuperar Contraseña
        </h2>
        <p className="text-sm text-gray-500 mb-6 text-center">
          Ingresa tu correo para recibir instrucciones.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-500" size={18} />
            <input
              type="email"
              placeholder="Correo electrónico institucional"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white py-3 rounded-lg transition-all"
          >
            {loading ? "Enviando..." : "Enviar solicitud"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
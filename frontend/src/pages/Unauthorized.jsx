import React from "react";
import { ShieldOff, ArrowLeft, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Unauthorized = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token"); // 👈 Detecta si el usuario tiene sesión activa

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0b2149] via-[#1c3f7a] to-[#2456a0] text-white p-6 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_2px_2px,white_1px,transparent_0)] bg-[length:50px_50px]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 p-10 rounded-3xl shadow-2xl max-w-lg w-full text-center"
      >
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-3xl flex items-center justify-center shadow-lg">
            <ShieldOff className="w-12 h-12 text-white" />
          </div>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
          Acceso no autorizado
        </h1>
        <p className="text-blue-100 mb-8 leading-relaxed text-base">
          {token
            ? "No cuentas con los permisos necesarios para acceder a este módulo del sistema."
            : "Tu sesión ha expirado o no has iniciado sesión. Por favor, accede nuevamente."}
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/")}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#2e63a6] to-[#1d4f8a] hover:from-[#2456a0] hover:to-[#194072] text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5" /> Volver al inicio
          </motion.button>

          {!token && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/login")}
              className="flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-all duration-300"
            >
              <LogIn className="w-5 h-5" /> Ir al Login
            </motion.button>
          )}
        </div>
      </motion.div>

      <p className="mt-10 text-sm text-blue-100 opacity-80 relative z-10">
        © {new Date().getFullYear()} CENATE — Centro Nacional de Telemedicina
      </p>
    </div>
  );
};

export default Unauthorized;
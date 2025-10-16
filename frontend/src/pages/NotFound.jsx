// ========================================================================
// 🌀 NotFound.jsx — Página 404 profesional, coherente con el estilo CENATE
// ========================================================================

import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertTriangle, Home } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0b2149] via-[#1c3f7a] to-[#2456a0] text-white p-6 relative overflow-hidden">
      {/* 🔹 Fondo decorativo con patrón */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_2px_2px,white_1px,transparent_0)] bg-[length:50px_50px]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-10 text-center max-w-lg bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl shadow-2xl p-10"
      >
        {/* Ícono principal */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-[#2e63a6] to-[#1d4f8a] rounded-3xl flex items-center justify-center shadow-lg">
            <AlertTriangle className="w-12 h-12 text-white" />
          </div>
        </div>

        <h1 className="text-6xl font-extrabold mb-2 tracking-tight text-white drop-shadow-md">
          404
        </h1>
        <h2 className="text-2xl font-semibold text-blue-100 mb-4">
          Página no encontrada
        </h2>

        <p className="text-blue-100 text-base leading-relaxed mb-8 px-4">
          La ruta que intentas visitar no existe o fue movida.
          Por favor, verifica la dirección o regresa al inicio del sistema.
        </p>

        {/* Botón de regreso */}
        <motion.button
          whileHover={{ scale: 1.05, backgroundColor: "#1d4f8a" }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/")}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#2e63a6] to-[#1d4f8a] hover:from-[#2456a0] hover:to-[#194072] text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-all duration-300 mx-auto"
        >
          <Home className="w-5 h-5" /> Volver al inicio
        </motion.button>
      </motion.div>

      {/* Pie de página */}
      <p className="mt-10 text-sm text-blue-100 opacity-80 relative z-10">
        © {new Date().getFullYear()} CENATE — Centro Nacional de Telemedicina
      </p>
    </div>
  );
};

export default NotFound;
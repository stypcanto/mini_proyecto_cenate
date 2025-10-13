// ========================================================================
// 🌀 NotFound.jsx — Página 404 profesional estilo CENATE
// ========================================================================

import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertCircle, Home } from "lucide-react";

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-tr from-[#061326] via-[#0a204a] to-[#14346e] text-white p-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="text-center max-w-lg bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl p-10"
            >
                <AlertCircle className="w-20 h-20 mx-auto text-blue-300 mb-6" />
                <h1 className="text-5xl font-bold text-white mb-3">404</h1>
                <h2 className="text-2xl font-semibold mb-3">Página no encontrada</h2>
                <p className="text-blue-100 mb-8 leading-relaxed">
                    La ruta a la que intentas acceder no existe o fue movida.
                    <br /> Verifica la dirección o regresa al inicio del sistema.
                </p>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/")}
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg transition"
                >
                    <Home className="w-4 h-4" /> Ir al Inicio
                </motion.button>
            </motion.div>

            <p className="mt-10 text-sm text-blue-200 opacity-80">
                © {new Date().getFullYear()} CENATE — Centro Nacional de Telemedicina
            </p>
        </div>
    );
};

export default NotFound;
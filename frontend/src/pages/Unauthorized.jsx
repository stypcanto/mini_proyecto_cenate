// ========================================================================
// 🚫 Unauthorized.jsx — Acceso denegado con estilo corporativo CENATE
// ========================================================================

import React from "react";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Unauthorized = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0a1832] via-[#102a56] to-[#163b70] text-white p-6">
            <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-white/10 backdrop-blur-lg border border-white/20 p-10 rounded-3xl shadow-2xl max-w-lg w-full text-center"
            >
                <div className="flex justify-center mb-6">
                    <ShieldAlert className="w-16 h-16 text-yellow-400" />
                </div>

                <h1 className="text-3xl font-bold mb-3 text-white">
                    Acceso No Autorizado
                </h1>
                <p className="text-blue-100 mb-8 leading-relaxed">
                    No cuentas con los permisos necesarios para acceder a este módulo del sistema.
                    <br />
                    Si crees que se trata de un error, contacta con el administrador del sistema.
                </p>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(-1)}
                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg transition"
                >
                    <ArrowLeft className="w-4 h-4" /> Volver
                </motion.button>
            </motion.div>

            <p className="mt-10 text-sm text-blue-200 opacity-80">
                © {new Date().getFullYear()} CENATE — Centro Nacional de Telemedicina
            </p>
        </div>
    );
};

export default Unauthorized;
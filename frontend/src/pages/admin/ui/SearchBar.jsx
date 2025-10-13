import React from "react";
import { Search, X } from "lucide-react";
import { motion } from "framer-motion";

export default function SearchBar({ value, onChange, placeholder = "Buscar..." }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative w-full max-w-md"
        >
            {/* Ícono de búsqueda */}
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />

            {/* Input */}
            <input
                type="text"
                value={value}
                placeholder={placeholder}
                onChange={(e) => onChange(e.target.value)}
                className={`w-full pl-10 pr-10 py-2.5 bg-white/80 backdrop-blur-md border-2 border-gray-200 rounded-xl
        text-sm text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent
        transition-all duration-200 shadow-sm hover:shadow-md`}
            />

            {/* Botón para limpiar */}
            {value && (
                <button
                    onClick={() => onChange("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Limpiar búsqueda"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
        </motion.div>
    );
}
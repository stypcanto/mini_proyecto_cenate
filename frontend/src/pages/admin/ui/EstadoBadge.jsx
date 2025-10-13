import React from "react";
import { CheckCircle, XCircle, Clock, Lock } from "lucide-react";
import { motion } from "framer-motion";

export default function EstadoBadge({ estado }) {
    if (!estado) return null;

    const normalizado = estado.toString().trim().toUpperCase();
    const isActivo = ["A", "ACTIVO", "ACTIVE"].includes(normalizado);
    const isInactivo = ["I", "INACTIVO", "INACTIVE"].includes(normalizado);
    const isPendiente = ["P", "PENDIENTE", "PENDING"].includes(normalizado);
    const isBloqueado = ["BLOQUEADO", "LOCKED"].includes(normalizado);

    const config = isActivo
        ? { icon: CheckCircle, text: "Activo", color: "green" }
        : isInactivo
            ? { icon: XCircle, text: "Inactivo", color: "red" }
            : isPendiente
                ? { icon: Clock, text: "Pendiente", color: "amber" }
                : isBloqueado
                    ? { icon: Lock, text: "Bloqueado", color: "gray" }
                    : { icon: Clock, text: normalizado, color: "blue" };

    const Icon = config.icon;

    return (
        <motion.span
            key={estado}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className={`inline-flex items-center px-3 py-1 bg-${config.color}-100 text-${config.color}-800 rounded-full text-xs font-semibold shadow-sm`}
        >
            <Icon className="w-3.5 h-3.5 mr-1.5" />
            {config.text}
        </motion.span>
    );
}
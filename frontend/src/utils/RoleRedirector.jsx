// src/utils/RoleRedirector.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * 🧭 Componente de redirección automática según roles
 * @param {Array} roles - lista de roles del usuario autenticado
 */
export default function RoleRedirector({ roles = [] }) {
    const navigate = useNavigate();

    useEffect(() => {
        if (!roles || roles.length === 0) {
            navigate("/user/dashboard");
            return;
        }

        const normalizedRoles = roles.map((r) => r.toUpperCase());

        // 👑 Admins
        if (normalizedRoles.includes("SUPERADMIN") || normalizedRoles.includes("ADMIN")) {
            navigate("/admin");
            return;
        }

        // 🩺 Profesionales de salud
        if (
            normalizedRoles.some((r) =>
                [
                    "MEDICO",
                    "ENFERMERIA",
                    "OBSTETRA",
                    "LABORATORIO",
                    "RADIOLOGIA",
                    "FARMACIA",
                    "PSICOLOGO",
                    "TERAPISTA_LENG",
                    "TERAPISTA_FISI",
                    "NUTRICION",
                ].includes(r)
            )
        ) {
            navigate("/roles/profesionaldesalud");
            return;
        }

        // 🗓️ Coordinadores
        if (
            normalizedRoles.includes("COORDINACION") ||
            normalizedRoles.includes("COORD_TRANSFER")
        ) {
            navigate("/roles/coordinador");
            return;
        }

        // 🏛️ Usuarios externos
        if (
            normalizedRoles.some((r) =>
                ["INSTITUCION_EX", "ASEGURADORA", "REGULADOR"].includes(r)
            )
        ) {
            navigate("/roles/externo");
            return;
        }

        // 👤 Por defecto → usuario normal
        navigate("/user/dashboard");
    }, [roles, navigate]);

    return null;
}
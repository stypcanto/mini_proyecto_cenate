// ========================================================================
// 🧠 useAuth.js — Hook de autenticación y autorización (CENATE)
// 💎 Versión profesional optimizada (sin warnings de ESLint)
// ========================================================================

import { useMemo, useCallback } from "react";

export default function useAuth() {
    // ----------------------------------------------------------
    // 🧩 Lectura segura desde localStorage
    // ----------------------------------------------------------
    const safeParse = useCallback((key) => {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : [];
        } catch (error) {
            console.warn(`⚠️ Error al parsear ${key} en localStorage:`, error);
            return [];
        }
    }, []);

    // ----------------------------------------------------------
    // 🧩 Datos base
    // ----------------------------------------------------------
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    const nombreCompleto = localStorage.getItem("nombreCompleto");
    const rol = localStorage.getItem("rol");

    const roles = safeParse("roles").map((r) => String(r).toUpperCase());
    const permisos = safeParse("permisos").map((p) => String(p).toUpperCase());

    const isAuthenticated = Boolean(token);

    // ----------------------------------------------------------
    // 🔐 Lógica de roles y permisos (memoizada)
    // ----------------------------------------------------------
    const hasRole = useCallback(
        (requiredRoles = []) => {
            if (requiredRoles.includes("*")) return true;
            const requiredUpper = requiredRoles.map((r) => r.toUpperCase());
            return roles.some((r) => requiredUpper.includes(r));
        },
        [roles]
    );

    const hasPermission = useCallback(
        (perm) => {
            const permUpper = String(perm).toUpperCase();
            return permisos.includes(permUpper) || roles.includes("SUPERADMIN");
        },
        [permisos, roles]
    );

    // ----------------------------------------------------------
    // 💎 Resultado memoizado (sin advertencias)
    // ----------------------------------------------------------
    return useMemo(
        () => ({
            token,
            username,
            nombreCompleto,
            rol,
            roles,
            permisos,
            isAuthenticated,
            hasRole,
            hasPermission,
        }),
        [
            token,
            username,
            nombreCompleto,
            rol,
            roles,
            permisos,
            isAuthenticated,
            hasRole,
            hasPermission,
        ]
    );
}
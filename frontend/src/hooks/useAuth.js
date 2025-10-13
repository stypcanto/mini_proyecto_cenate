// src/hooks/useAuth.js
import { useMemo } from "react";

export default function useAuth() {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    const nombreCompleto = localStorage.getItem("nombreCompleto");
    const rol = localStorage.getItem("rol");
    const roles = JSON.parse(localStorage.getItem("roles") || "[]");
    const permisos = JSON.parse(localStorage.getItem("permisos") || "[]");

    const isAuthenticated = !!token;

    const hasRole = (requiredRoles = []) =>
        requiredRoles.includes("*") ||
        roles.some((r) => requiredRoles.includes(r.toUpperCase()));

    const hasPermission = (perm) =>
        permisos.includes(perm) || roles.includes("SUPERADMIN");

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
        [token, username, roles, permisos]
    );
}
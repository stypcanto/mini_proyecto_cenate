// ========================================================================
// 👥 useUsuarios - Gestión centralizada de autenticación y usuarios
// ========================================================================
import { useState, useEffect } from "react";
import {
    getUsuarios,
    getUsuarioById,
    createUsuario,
    updateUsuario,
    deleteUsuario,
    getCurrentUser,
} from "@/api/usuarios";
import * as AuthAPI from "@/api/auth"; // ✅ Import limpio

export const useUsuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [usuarioActual, setUsuarioActual] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // ======================================================
    // 🔐 LOGIN
    // ======================================================
    const loginUser = async (username, password) => {
        setLoading(true);
        setError("");
        try {
            const data = await AuthAPI.login(username, password);

            if (data?.token) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("username", data.username || "");
                localStorage.setItem("nombreCompleto", data.nombreCompleto || "Usuario");
                localStorage.setItem("rol", data.rolPrincipal || "Sin rol");
                localStorage.setItem("roles", JSON.stringify(data.roles || []));
                localStorage.setItem("permisos", JSON.stringify(data.permisos || []));
                setUsuarioActual(data);
            }

            return data;
        } catch (err) {
            console.error("❌ Error en loginUser:", err);
            setError(err.message || "Error al iniciar sesión.");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // ======================================================
    // 👤 CARGA DE USUARIO AUTENTICADO
    // ======================================================
    const loadCurrentUser = async () => {
        try {
            const data = await getCurrentUser();
            setUsuarioActual(data);
        } catch (err) {
            console.warn("⚠️ No se pudo obtener el usuario actual:", err);
        }
    };

    // ======================================================
    // 🔁 RECUPERAR / CAMBIAR CONTRASEÑA
    // ======================================================
    const recoverPassword = async (email) => {
        setLoading(true);
        setError("");
        try {
            const data = await AuthAPI.forgotPassword(email);
            if (!data?.success) throw new Error(data?.message);
            return data;
        } catch (err) {
            console.error("❌ Error en recoverPassword:", err);
            setError(err.message || "Error al registrar solicitud.");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updatePassword = async (currentPassword, newPassword, confirmPassword) => {
        setLoading(true);
        try {
            return await AuthAPI.changePassword(currentPassword, newPassword, confirmPassword);
        } catch (err) {
            setError(err.message || "Error al cambiar contraseña.");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // ======================================================
    // 👥 CRUD DE USUARIOS
    // ======================================================
    const fetchUsuarios = async () => {
        setLoading(true);
        try {
            const data = await getUsuarios();
            setUsuarios(data);
        } catch (err) {
            console.error("❌ Error al obtener usuarios:", err);
            setError("Error al obtener usuarios.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (localStorage.getItem("token")) loadCurrentUser();
    }, []);

    return {
        usuarios,
        usuarioActual,
        loading,
        error,
        loginUser,
        recoverPassword,
        updatePassword,
        fetchUsuarios,
    };
};
// src/hooks/useUsuarios.js
import { useState, useEffect } from "react";
import {
    getUsuarios,
    getUsuarioById,
    createUsuario,
    updateUsuario,
    deleteUsuario,
} from "../api/usuarios";
import {
    login,
    getCurrentUser,
    forgotPassword,
    changePassword,
} from "../api/auth"; // ✅ ahora importamos todas las funciones de autenticación

/**
 * Hook centralizado para manejar autenticación y usuarios.
 */
export const useUsuarios = () => {
    // Estados globales
    const [usuarios, setUsuarios] = useState([]);
    const [usuarioActual, setUsuarioActual] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // ======================================================
    // 🔐 AUTENTICACIÓN
    // ======================================================

    /** 🔑 Login de usuario */
    const loginUser = async (username, password) => {
        setLoading(true);
        setError("");
        try {
            const data = await login(username, password);
            if (data?.token) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("username", data.username || "");
                localStorage.setItem("userId", data.userId || "");
                localStorage.setItem("roles", JSON.stringify(data.roles || []));
                localStorage.setItem("permisos", JSON.stringify(data.permisos || []));
                setUsuarioActual(data);
            }
            return data;
        } catch (err) {
            console.error("❌ Error en login:", err);
            setError(err.message || "Error al iniciar sesión");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    /** 👤 Cargar usuario autenticado actual */
    const loadCurrentUser = async () => {
        try {
            const data = await getCurrentUser();
            setUsuarioActual(data);
        } catch (err) {
            console.warn("⚠️ No se pudo obtener el usuario actual:", err);
        }
    };

    /** 🚪 Logout */
    const logout = () => {
        localStorage.clear();
        setUsuarioActual(null);
    };

    // ======================================================
    // 🔁 RECUPERAR / CAMBIAR CONTRASEÑA
    // ======================================================

    /** 📩 Recuperar contraseña */
    const recoverPassword = async (email) => {
        setLoading(true);
        setError("");
        try {
            const data = await forgotPassword(email);
            return data;
        } catch (err) {
            setError("Error al enviar correo de recuperación.");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    /** 🔒 Cambiar contraseña (usuario autenticado) */
    const updatePassword = async (currentPassword, newPassword, confirmPassword) => {
        setLoading(true);
        setError("");
        try {
            const data = await changePassword(currentPassword, newPassword, confirmPassword);
            return data;
        } catch (err) {
            setError("Error al cambiar la contraseña.");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // ======================================================
    // 👥 CRUD de usuarios (ya existente)
    // ======================================================
    const fetchUsuarios = async () => {
        setLoading(true);
        try {
            const data = await getUsuarios();
            setUsuarios(data);
        } catch (err) {
            setError("Error al obtener usuarios");
        } finally {
            setLoading(false);
        }
    };

    const fetchUsuarioById = async (id) => {
        setLoading(true);
        try {
            return await getUsuarioById(id);
        } catch (err) {
            setError("Error al obtener usuario");
        } finally {
            setLoading(false);
        }
    };

    const addUsuario = async (usuario) => {
        try {
            const data = await createUsuario(usuario);
            setUsuarios([...usuarios, data]);
        } catch (err) {
            setError("Error al crear usuario");
        }
    };

    const editUsuario = async (id, usuario) => {
        try {
            const data = await updateUsuario(id, usuario);
            setUsuarios(usuarios.map((u) => (u.id === id ? data : u)));
        } catch (err) {
            setError("Error al actualizar usuario");
        }
    };

    const removeUsuario = async (id) => {
        try {
            await deleteUsuario(id);
            setUsuarios(usuarios.filter((u) => u.id !== id));
        } catch (err) {
            setError("Error al eliminar usuario");
        }
    };

    // ======================================================
    // ⚙️ Efecto inicial
    // ======================================================
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) loadCurrentUser();
    }, []);

    // ======================================================
    // 🔁 Retorno del hook
    // ======================================================
    return {
        usuarios,
        usuarioActual,
        loading,
        error,
        loginUser,
        logout,
        loadCurrentUser,
        recoverPassword,
        updatePassword,
        fetchUsuarios,
        fetchUsuarioById,
        addUsuario,
        editUsuario,
        removeUsuario,
    };
};
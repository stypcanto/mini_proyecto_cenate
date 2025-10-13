// ========================================================================
// 👥 useUsuarios - Gestión centralizada y profesional de usuarios CENATE
// Estilo macOS + manejo de autenticación y CRUD con notificaciones
// ========================================================================

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import {
    getUsuarios,
    getUsuarioById,
    createUsuario,
    updateUsuario,
    deleteUsuario,
    getCurrentUser,
    getUsuariosExternos,
    getUsuariosInternos,
} from "@/api/usuarios";
import * as AuthAPI from "@/api/auth";

export const useUsuarios = () => {
    // ----------------------------------------------------------
    // 🧩 Estados base
    // ----------------------------------------------------------
    const [usuarios, setUsuarios] = useState([]);
    const [usuarioActual, setUsuarioActual] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // ======================================================
    // 🔐 LOGIN Y AUTENTICACIÓN
    // ======================================================
    const loginUser = useCallback(async (username, password) => {
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

                toast.success(`Bienvenido, ${data.nombreCompleto || username} 👋`);
            }

            return data;
        } catch (err) {
            const message = err.message || "Error al iniciar sesión.";
            toast.error(message);
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    // ======================================================
    // 👤 USUARIO AUTENTICADO
    // ======================================================
    const loadCurrentUser = useCallback(async () => {
        try {
            const data = await getCurrentUser();
            setUsuarioActual(data);
        } catch (err) {
            console.warn("⚠️ No se pudo obtener el usuario actual:", err);
        }
    }, []);

    // ======================================================
    // 🔁 RECUPERAR / CAMBIAR CONTRASEÑA
    // ======================================================
    const recoverPassword = useCallback(async (email) => {
        setLoading(true);
        setError("");
        try {
            const data = await AuthAPI.forgotPassword(email);
            if (!data?.success) throw new Error(data?.message || "No se pudo enviar el correo.");
            toast.success("📨 Correo de recuperación enviado.");
            return data;
        } catch (err) {
            const message = err.message || "Error al recuperar contraseña.";
            toast.error(message);
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    const updatePassword = useCallback(async (currentPassword, newPassword, confirmPassword) => {
        setLoading(true);
        setError("");
        try {
            const data = await AuthAPI.changePassword(currentPassword, newPassword, confirmPassword);
            toast.success("🔒 Contraseña actualizada correctamente.");
            return data;
        } catch (err) {
            const message = err.message || "Error al cambiar contraseña.";
            toast.error(message);
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    // ======================================================
    // 👥 CRUD DE USUARIOS (Panel Admin)
    // ======================================================

    // 🔹 Obtener lista general de usuarios
    const fetchUsuarios = useCallback(async (tipo = "internos") => {
        setLoading(true);
        setError("");

        try {
            const data =
                tipo === "externos" ? await getUsuariosExternos() : await getUsuariosInternos();
            setUsuarios(Array.isArray(data) ? data : []);
            toast.success("📋 Usuarios cargados correctamente.");
            return data;
        } catch (err) {
            const message = "Error al cargar usuarios.";
            toast.error(message);
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    // 🔹 Obtener usuario por ID
    const fetchUsuarioById = useCallback(async (id) => {
        try {
            return await getUsuarioById(id);
        } catch (err) {
            toast.error("Error al obtener el usuario.");
            console.error(`❌ Error al obtener usuario con ID ${id}:`, err);
            throw new Error("No se pudo obtener la información del usuario.");
        }
    }, []);

    // 🔹 Crear nuevo usuario
    const createNewUsuario = useCallback(async (usuario) => {
        try {
            const data = await createUsuario(usuario);
            setUsuarios((prev) => [...prev, data]);
            toast.success("✅ Usuario creado correctamente.");
            return data;
        } catch (err) {
            toast.error("Error al crear usuario.");
            throw new Error("Error al registrar usuario.");
        }
    }, []);

    // 🔹 Actualizar usuario existente
    const updateExistingUsuario = useCallback(async (id, usuario) => {
        try {
            const data = await updateUsuario(id, usuario);
            setUsuarios((prev) => prev.map((u) => (u.idUser === id ? data : u)));
            toast.success("✏️ Usuario actualizado con éxito.");
            return data;
        } catch (err) {
            toast.error("Error al actualizar usuario.");
            throw new Error("Error al actualizar usuario.");
        }
    }, []);

    // 🔹 Eliminar usuario
    const deleteExistingUsuario = useCallback(async (id) => {
        try {
            const success = await deleteUsuario(id);
            if (success) {
                setUsuarios((prev) => prev.filter((u) => u.idUser !== id));
                toast.success("🗑️ Usuario eliminado correctamente.");
            }
            return success;
        } catch (err) {
            toast.error("Error al eliminar usuario.");
            throw new Error("Error al eliminar usuario.");
        }
    }, []);

    // ======================================================
    // 🚀 AUTO-CARGA (token válido)
    // ======================================================
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) loadCurrentUser();
    }, [loadCurrentUser]);

    // ======================================================
    // 🎯 Retorno público del hook
    // ======================================================
    return {
        usuarios,
        usuarioActual,
        loading,
        error,

        // 🔐 Auth
        loginUser,
        recoverPassword,
        updatePassword,
        loadCurrentUser,

        // 👥 CRUD
        fetchUsuarios,
        fetchUsuarioById,
        createNewUsuario,
        updateExistingUsuario,
        deleteExistingUsuario,
    };
};
// ========================================================================
// 👥 useUsuarios.js - Hook profesional para gestión de usuarios (CENATE)
// ========================================================================

import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import {
    getUsuariosInternos,
    getUsuariosExternos,
    getUsuarioById,
    getUsuarioDetalle,
    createUsuario,
    updateUsuario,
    deleteUsuario,
    getCurrentUser,
} from "@/api/usuarios";
import * as AuthAPI from "@/api/auth";

// ========================================================================
// 🧠 Hook principal de gestión de usuarios
// ========================================================================

export const useUsuarios = () => {
    // ----------------------------------------------------------
    // 🧩 Estados base
    // ----------------------------------------------------------
    const [usuarios, setUsuarios] = useState([]);
    const [usuarioActual, setUsuarioActual] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // ======================================================
    // 🔐 LOGIN / AUTENTICACIÓN
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
    // 👤 USUARIO AUTENTICADO ACTUAL
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
    // 👥 CRUD DE USUARIOS
    // ======================================================

    // 🔹 Obtener lista de usuarios (internos o externos)
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

    // 🔹 Obtener detalle extendido (username)
    const fetchUsuarioDetalle = useCallback(async (username) => {
        try {
            const data = await getUsuarioDetalle(username);
            return data;
        } catch (err) {
            toast.error("Error al obtener detalle del usuario.");
            console.error(`❌ Error al obtener detalle del usuario ${username}:`, err);
            throw new Error("No se pudo obtener el detalle del usuario.");
        }
    }, []);

    // 🔹 Crear usuario
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

    // 🔹 Actualizar usuario
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
    // 🚀 AUTO-CARGA SI HAY TOKEN
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
        loadCurrentUser,

        // 👥 CRUD
        fetchUsuarios,
        fetchUsuarioById,
        fetchUsuarioDetalle,
        createNewUsuario,
        updateExistingUsuario,
        deleteExistingUsuario,
    };
};
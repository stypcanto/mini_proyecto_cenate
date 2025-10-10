import { useState, useEffect } from "react";
import {
    getUsuarios,
    createUsuario,
    updateUsuario,
    deleteUsuario,
    getUsuarioById,
} from "../api/config"; // Corregido

export const useUsuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // 🔸 Cargar lista de usuarios
    const fetchUsuarios = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getUsuarios();
            setUsuarios(data);
        } catch (err) {
            setError(err.message || "Error al cargar usuarios");
        } finally {
            setLoading(false);
        }
    };

    // 🔸 Crear usuario
    const addUsuario = async (nuevoUsuario) => {
        setLoading(true);
        setError(null);
        try {
            await createUsuario(nuevoUsuario);
            await fetchUsuarios(); // refrescar lista
        } catch (err) {
            setError(err.message || "Error al crear usuario");
        } finally {
            setLoading(false);
        }
    };

    // 🔸 Actualizar usuario
    const editUsuario = async (id, usuarioActualizado) => {
        setLoading(true);
        setError(null);
        try {
            await updateUsuario(id, usuarioActualizado);
            await fetchUsuarios();
        } catch (err) {
            setError(err.message || "Error al actualizar usuario");
        } finally {
            setLoading(false);
        }
    };

    // 🔸 Eliminar usuario
    const removeUsuario = async (id) => {
        setLoading(true);
        setError(null);
        try {
            await deleteUsuario(id);
            await fetchUsuarios();
        } catch (err) {
            setError(err.message || "Error al eliminar usuario");
        } finally {
            setLoading(false);
        }
    };

    // 🔸 Obtener usuario por ID
    const getUsuario = async (id) => {
        try {
            return await getUsuarioById(id);
        } catch (err) {
            setError(err.message || "Error al obtener usuario");
        }
    };

    useEffect(() => {
        fetchUsuarios();
    }, []);

    return {
        usuarios,
        loading,
        error,
        fetchUsuarios,
        addUsuario,
        editUsuario,
        removeUsuario,
        getUsuario,
    };
};

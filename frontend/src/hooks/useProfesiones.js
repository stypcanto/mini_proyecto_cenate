// src/hooks/useProfesiones.js
import { useState, useCallback } from "react";
import * as ProfesionesAPI from "@/api/profesionesApi";
import toast from "react-hot-toast";

export const useProfesiones = () => {
    const [profesiones, setProfesiones] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchProfesiones = useCallback(async () => {
        setLoading(true);
        try {
            const data = await ProfesionesAPI.getProfesiones();
            setProfesiones(data);
        } catch {
            toast.error("Error al cargar profesiones");
        } finally {
            setLoading(false);
        }
    }, []);

    const createProfesion = async (profesion) => {
        try {
            await ProfesionesAPI.createProfesion(profesion);
            toast.success("Profesión creada correctamente");
            fetchProfesiones();
        } catch {
            toast.error("Error al crear profesión");
        }
    };

    const updateProfesion = async (id, data) => {
        try {
            await ProfesionesAPI.updateProfesion(id, data);
            toast.success("Profesión actualizada");
            fetchProfesiones();
        } catch {
            toast.error("Error al actualizar");
        }
    };

    const deleteProfesion = async (id) => {
        if (!window.confirm("¿Eliminar esta profesión?")) return;
        try {
            await ProfesionesAPI.deleteProfesion(id);
            toast.success("Profesión eliminada");
            fetchProfesiones();
        } catch {
            toast.error("Error al eliminar");
        }
    };

    return {
        profesiones,
        loading,
        fetchProfesiones,
        createProfesion,
        updateProfesion,
        deleteProfesion,
    };
};
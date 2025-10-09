// frontend/src/hooks/usePacientes.js
import { useEffect, useState } from "react";
import { getAsegurados } from "../api/pacientes";

export const usePacientes = () => {
    const [pacientes, setPacientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPacientes = async () => {
            try {
                setLoading(true);
                setError(null);

                const data = await getAsegurados(0, 20); // ⚡ consume Spring Data con paginación
                setPacientes(data.content || []); // ⚡ Spring devuelve {content, totalPages, etc.}
            } catch (err) {
                setError(err.message || "Error desconocido");
                setPacientes([]);
            } finally {
                setLoading(false);
            }
        };

        fetchPacientes();
    }, []);

    return { pacientes, loading, error };
};

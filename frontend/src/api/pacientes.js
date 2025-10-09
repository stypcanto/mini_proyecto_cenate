// frontend/src/api/pacientes.js
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080/api";


export const getAsegurados = async (page = 0, size = 10) => {
    try {
        const response = await fetch(`${API_URL}/asegurados?page=${page}&size=${size}`);
        if (!response.ok) {
            throw new Error("Error al obtener asegurados");
        }
        return await response.json();
    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
};

export const getAseguradoById = async (pkAsegurado) => {
    try {
        const response = await fetch(`${API_URL}/asegurados/id/${pkAsegurado}`);
        if (!response.ok) {
            throw new Error("Asegurado no encontrado");
        }
        return await response.json();
    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
};

export const getAseguradoByDoc = async (docPaciente) => {
    try {
        const response = await fetch(`${API_URL}/asegurados/doc/${docPaciente}`);
        if (!response.ok) {
            throw new Error("Asegurado no encontrado");
        }
        return await response.json();
    } catch (error) {
        console.error("API Error:", error);
        throw error;
    }
};

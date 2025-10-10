// frontend/src/api/pacientes.js
import { API_BASE, getHeaders, handleResponse } from "@/config/api";

export const getAsegurados = async (page = 0, size = 10) => {
    try {
        const response = await fetch(`${API_BASE}/asegurados?page=${page}&size=${size}`, {
            headers: getHeaders(true),
        });
        return await handleResponse(response);
    } catch (error) {
        console.error("getAsegurados error:", error);
        throw error;
    }
};

export const getAseguradoById = async (pkAsegurado) => {
    try {
        const response = await fetch(`${API_BASE}/asegurados/id/${pkAsegurado}`, {
            headers: getHeaders(true),
        });
        return await handleResponse(response);
    } catch (error) {
        console.error("getAseguradoById error:", error);
        throw error;
    }
};

export const getAseguradoByDoc = async (docPaciente) => {
    try {
        const response = await fetch(`${API_BASE}/asegurados/doc/${docPaciente}`, {
            headers: getHeaders(true),
        });
        return await handleResponse(response);
    } catch (error) {
        console.error("getAseguradoByDoc error:", error);
        throw error;
    }
};

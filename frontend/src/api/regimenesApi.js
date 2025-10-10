// src/api/regimenesApi.js

import { API_BASE, getHeaders, handleResponse } from "@/config/api";

// Obtener todos los regímenes laborales
export const getRegimenes = async () => {
    try {
        const response = await fetch(`${API_BASE}/usuario/regimenes`, {
            method: "GET",
            headers: getHeaders(true), // incluye token si es necesario
        });
        return await handleResponse(response);
    } catch (error) {
        console.error("getRegimenes error:", error);
        return [];
    }
};

// Crear un nuevo régimen laboral
export const createRegimen = async (regimen) => {
    try {
        const response = await fetch(`${API_BASE}/usuario/regimenes`, {
            method: "POST",
            headers: getHeaders(true),
            body: JSON.stringify(regimen),
        });
        return await handleResponse(response);
    } catch (error) {
        console.error("createRegimen error:", error);
    }
};

// Actualizar un régimen laboral
export const updateRegimen = async (id, regimen) => {
    try {
        const response = await fetch(`${API_BASE}/usuario/regimenes/${id}`, {
            method: "PUT",
            headers: getHeaders(true),
            body: JSON.stringify(regimen),
        });
        return await handleResponse(response);
    } catch (error) {
        console.error("updateRegimen error:", error);
    }
};

// Eliminar un régimen laboral
export const deleteRegimen = async (id) => {
    try {
        const response = await fetch(`${API_BASE}/usuario/regimenes/${id}`, {
            method: "DELETE",
            headers: getHeaders(true),
        });
        await handleResponse(response);
        return true;
    } catch (error) {
        console.error("deleteRegimen error:", error);
        return false;
    }
};

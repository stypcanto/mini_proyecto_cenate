import { useState, useEffect, useCallback } from 'react';
import * as examenesAPI from '../api/examenes';

/**
 * Custom Hook para manejar el estado de exámenes
 * @param {number} initialPage - Página inicial
 * @param {number} pageSize - Tamaño de página
 * @returns {Object} Estado y funciones para manejar exámenes
 */
export const useExamenes = (initialPage = 0, pageSize = 10) => {
  const [examenes, setExamenes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Cargar exámenes
  const fetchExamenes = useCallback(async (page = currentPage) => {
    setLoading(true);
    setError(null);
    try {
      const response = await examenesAPI.getExamenes(page, pageSize);
      setExamenes(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
      setCurrentPage(page);
    } catch (err) {
      setError(err.message);
      console.error('Error al cargar exámenes:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize]);

  // Buscar exámenes
  const searchExamenes = useCallback(async (nombre = '', codigo = '') => {
    setLoading(true);
    setError(null);
    try {
      const response = await examenesAPI.buscarExamenes(nombre, codigo);
      setExamenes(response);
      setTotalPages(1);
      setTotalElements(response.length);
    } catch (err) {
      setError(err.message);
      console.error('Error al buscar exámenes:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear examen
  const createExamen = useCallback(async (examenData) => {
    setLoading(true);
    setError(null);
    try {
      const nuevoExamen = await examenesAPI.createExamen(examenData);
      await fetchExamenes(currentPage); // Recargar la lista
      return nuevoExamen;
    } catch (err) {
      setError(err.message);
      console.error('Error al crear examen:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentPage, fetchExamenes]);

  // Actualizar examen
  const updateExamen = useCallback(async (id, examenData) => {
    setLoading(true);
    setError(null);
    try {
      const examenActualizado = await examenesAPI.updateExamen(id, examenData);
      await fetchExamenes(currentPage); // Recargar la lista
      return examenActualizado;
    } catch (err) {
      setError(err.message);
      console.error('Error al actualizar examen:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentPage, fetchExamenes]);

  // Eliminar examen
  const deleteExamen = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await examenesAPI.deleteExamen(id);
      await fetchExamenes(currentPage); // Recargar la lista
      return true;
    } catch (err) {
      setError(err.message);
      console.error('Error al eliminar examen:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentPage, fetchExamenes]);

  // Ir a página siguiente
  const nextPage = useCallback(() => {
    if (currentPage < totalPages - 1) {
      fetchExamenes(currentPage + 1);
    }
  }, [currentPage, totalPages, fetchExamenes]);

  // Ir a página anterior
  const previousPage = useCallback(() => {
    if (currentPage > 0) {
      fetchExamenes(currentPage - 1);
    }
  }, [currentPage, fetchExamenes]);

  // Ir a una página específica
  const goToPage = useCallback((page) => {
    if (page >= 0 && page < totalPages) {
      fetchExamenes(page);
    }
  }, [totalPages, fetchExamenes]);

  // Cargar exámenes al montar el componente
  useEffect(() => {
    fetchExamenes();
  }, []);

  return {
    examenes,
    loading,
    error,
    currentPage,
    totalPages,
    totalElements,
    fetchExamenes,
    searchExamenes,
    createExamen,
    updateExamen,
    deleteExamen,
    nextPage,
    previousPage,
    goToPage,
    refetch: fetchExamenes,
  };
};

export default useExamenes;

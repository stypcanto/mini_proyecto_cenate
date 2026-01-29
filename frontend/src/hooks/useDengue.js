import { useState, useCallback } from 'react';
import dengueService from '../services/dengueService';

/**
 * 🦟 Custom Hook - useDengue
 * Gestiona el estado y operaciones del módulo Dengue
 *
 * @returns {Object} - Estado y funciones para manejar dengue
 */
export const useDengue = () => {
  const [casos, setCasos] = useState([]);
  const [totalCasos, setTotalCasos] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(30);

  // Estados para upload
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  /**
   * Carga casos dengue con paginación
   */
  const cargarCasos = useCallback(
    async (page = 0, size = 30, sortBy = 'fechaSolicitud', sortDirection = 'DESC') => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await dengueService.listarCasosDengue(page, size, sortBy, sortDirection);
        setCasos(response.content || []);
        setTotalCasos(response.totalElements || 0);
        setCurrentPage(page);
        setPageSize(size);
        return response;
      } catch (err) {
        const mensaje = dengueService.formatearErrorDengue(err);
        setError(mensaje);
        console.error('Error cargando casos:', err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Busca casos con filtros
   */
  const buscarCasos = useCallback(
    async (filtros = {}) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await dengueService.buscarCasosDengue(filtros);
        setCasos(response.content || []);
        setTotalCasos(response.totalElements || 0);
        setCurrentPage(filtros.page || 0);
        setPageSize(filtros.size || 30);
        return response;
      } catch (err) {
        const mensaje = dengueService.formatearErrorDengue(err);
        setError(mensaje);
        console.error('Error buscando casos:', err);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Carga archivo Excel
   */
  const cargarArchivo = useCallback(
    async (archivo, usuarioId) => {
      setIsUploading(true);
      setUploadError(null);
      setUploadResult(null);
      try {
        const response = await dengueService.cargarExcelDengue(archivo, usuarioId);
        setUploadResult(response);
        return response;
      } catch (err) {
        const mensaje = dengueService.formatearErrorDengue(err);
        setUploadError(mensaje);
        console.error('Error cargando archivo:', err);
        throw err;
      } finally {
        setIsUploading(false);
      }
    },
    []
  );

  /**
   * Limpia el resultado de upload
   */
  const limpiarUpload = useCallback(() => {
    setUploadResult(null);
    setUploadError(null);
  }, []);

  /**
   * Limpia errores
   */
  const limpiarError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // Estado de casos
    casos,
    totalCasos,
    isLoading,
    error,
    currentPage,
    pageSize,

    // Estado de upload
    isUploading,
    uploadResult,
    uploadError,

    // Funciones
    cargarCasos,
    buscarCasos,
    cargarArchivo,
    limpiarUpload,
    limpiarError,
  };
};

export default useDengue;

/**
 * DengueCasosList.jsx - Listado dinámico de casos dengue
 *
 * Características:
 * - Modo: Listar todos o Buscar con filtros
 * - Tabla dinámica que muestra columnas específicas de dengue
 * - Paginación y ordenamiento
 * - Filtros: DNI, CIE-10
 * - Color coding por tipo de dengue (A97.0, A97.1, A97.2)
 *
 * @version 1.0.0
 * @since 2026-01-29
 */

import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useDengue } from '../../hooks/useDengue';
import TablaDengueCompleta from './TablaDengueCompleta';
import './DengueCasosList.css';

export default function DengueCasosList({ mode = null }) {
  const location = useLocation();

  // Detectar modo desde la URL si no se proporciona
  const detectedMode = mode || (location.pathname.includes('/buscar') ? 'buscar' : 'listar');
  const {
    casos,
    totalCasos,
    isLoading,
    error,
    currentPage,
    pageSize,
    cargarCasos,
    buscarCasos,
  } = useDengue();

  // Estado de filtros
  const [filtros, setFiltros] = useState({
    dni: '',
    dxMain: '',
  });

  const [sortBy, setSortBy] = useState('fechaSolicitud');
  const [sortDirection, setSortDirection] = useState('DESC');

  // Cargar datos al iniciar o cambiar página
  useEffect(() => {
    if (detectedMode === 'listar') {
      cargarCasos(0, pageSize, sortBy, sortDirection);
    }
  }, [detectedMode, pageSize, sortBy, sortDirection, cargarCasos]);

  /**
   * Realiza la búsqueda
   */
  const handleBuscar = () => {
    if (detectedMode === 'buscar') {
      buscarCasos({
        dni: filtros.dni || '',
        dxMain: filtros.dxMain || '',
        page: 0,
        size: pageSize,
        sortBy,
        sortDirection,
      });
    }
  };

  /**
   * Limpia los filtros
   */
  const handleLimpiar = () => {
    setFiltros({ dni: '', dxMain: '' });
    cargarCasos(0, pageSize, sortBy, sortDirection);
  };

  /**
   * Navega a página
   */
  const handlePageChange = (newPage) => {
    if (detectedMode === 'buscar') {
      buscarCasos({
        dni: filtros.dni || '',
        dxMain: filtros.dxMain || '',
        page: newPage,
        size: pageSize,
        sortBy,
        sortDirection,
      });
    } else {
      cargarCasos(newPage, pageSize, sortBy, sortDirection);
    }
  };

  /**
   * Cambia tamaño de página
   */
  const handlePageSizeChange = (newSize) => {
    if (detectedMode === 'buscar') {
      buscarCasos({
        dni: filtros.dni || '',
        dxMain: filtros.dxMain || '',
        page: 0,
        size: newSize,
        sortBy,
        sortDirection,
      });
    } else {
      cargarCasos(0, newSize, sortBy, sortDirection);
    }
  };

  const totalPages = Math.ceil(totalCasos / pageSize) || 1;

  return (
    <div className="dengue-casos-list">
      {/* Filtros */}
      {detectedMode === 'buscar' && (
        <div className="filtros-section">
          <div className="filtros-container">
            <div className="filtro-group">
              <label htmlFor="dni-filter">DNI del Paciente</label>
              <input
                id="dni-filter"
                type="text"
                placeholder="Ej: 00370941"
                value={filtros.dni}
                onChange={(e) =>
                  setFiltros({ ...filtros, dni: e.target.value })
                }
                maxLength="8"
              />
            </div>

            <div className="filtro-group">
              <label htmlFor="dxmain-filter">Código CIE-10</label>
              <select
                id="dxmain-filter"
                value={filtros.dxMain}
                onChange={(e) =>
                  setFiltros({ ...filtros, dxMain: e.target.value })
                }
              >
                <option value="">Todos</option>
                <option value="A97.0">A97.0 - Fiebre amarilla</option>
                <option value="A97.1">A97.1 - Dengue</option>
                <option value="A97.2">A97.2 - Dengue hemorrágico</option>
              </select>
            </div>

            <div className="filtro-actions">
              <button
                className="btn btn-primary"
                onClick={handleBuscar}
                disabled={isLoading}
              >
                🔍 Buscar
              </button>
              <button
                className="btn btn-secondary"
                onClick={handleLimpiar}
                disabled={isLoading}
              >
                ✕ Limpiar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Información de resultados */}
      <div className="resultados-info">
        <span className="info-total">
          Casos encontrados: <strong>{totalCasos}</strong>
        </span>
        <div className="sort-controls">
          <label>Ordenar por:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="fechaSolicitud">Fecha Solicitud</option>
            <option value="pacienteDni">DNI</option>
            <option value="dxMain">CIE-10</option>
          </select>
          <button
            className={`sort-direction ${sortDirection}`}
            onClick={() =>
              setSortDirection(sortDirection === 'DESC' ? 'ASC' : 'DESC')
            }
            title={`Ordenar ${sortDirection === 'DESC' ? 'ascendente' : 'descendente'}`}
          >
            {sortDirection === 'DESC' ? '⬇️' : '⬆️'}
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Cargando casos...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="error-state">
          <p className="error-icon">⚠️</p>
          <p className="error-message">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && casos.length === 0 && (
        <div className="empty-state">
          <p className="empty-icon">🦟</p>
          <p className="empty-message">
            {mode === 'buscar'
              ? 'No se encontraron casos con los filtros especificados'
              : 'No hay casos dengue registrados'}
          </p>
        </div>
      )}

      {/* Tabla */}
      {!isLoading && !error && casos.length > 0 && (
        <>
          <TablaDengueCompleta casos={casos} />

          {/* Paginación */}
          <div className="pagination-section">
            <div className="pagination-info">
              <label>Registros por página:</label>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              >
                <option value={10}>10</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="page-indicator">
                Página {currentPage + 1} de {totalPages}
              </span>
            </div>

            <div className="pagination-buttons">
              <button
                className="btn btn-icon"
                onClick={() => handlePageChange(0)}
                disabled={currentPage === 0 || isLoading}
                title="Primera página"
              >
                ⏮️
              </button>
              <button
                className="btn btn-icon"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0 || isLoading}
                title="Página anterior"
              >
                ⬅️
              </button>
              <button
                className="btn btn-icon"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1 || isLoading}
                title="Siguiente página"
              >
                ➡️
              </button>
              <button
                className="btn btn-icon"
                onClick={() => handlePageChange(totalPages - 1)}
                disabled={currentPage >= totalPages - 1 || isLoading}
                title="Última página"
              >
                ⏭️
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

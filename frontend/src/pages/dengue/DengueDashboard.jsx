/**
 * DengueDashboard.jsx - Panel principal del Módulo Dengue
 *
 * Características:
 * - Tabs: Cargar Excel, Listar Casos, Buscar
 * - Integración con API /api/dengue
 * - Tabla dinámica que muestra 11 columnas dengue-específicas
 * - Upload con validación de formato .xlsx
 * - Paginación y filtros
 *
 * @version 1.0.0
 * @since 2026-01-29
 */

import React, { useState } from 'react';
import './DengueDashboard.css';
import DengueUploadForm from './DengueUploadForm';
import DengueCasosList from './DengueCasosList';
import DengueValidationReport from './DengueValidationReport';

export default function DengueDashboard() {
  const [activeTab, setActiveTab] = useState('cargar');
  const [importResult, setImportResult] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const handleImportSuccess = (result) => {
    setImportResult(result);
    setShowResult(true);
    // Cambiar a tab de resultados después de 2 segundos
    setTimeout(() => {
      setActiveTab('resultados');
    }, 500);
  };

  const handleCloseResult = () => {
    setShowResult(false);
    setImportResult(null);
  };

  return (
    <div className="dengue-dashboard">
      {/* Header */}
      <div className="dengue-header">
        <div className="header-content">
          <div className="header-icon">
            <span className="icon">🦟</span>
          </div>
          <div className="header-text">
            <h1>Módulo Dengue</h1>
            <p>Gestión de casos dengue - Integración Bolsas</p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="dengue-tabs">
        <button
          className={`tab-btn ${activeTab === 'cargar' ? 'active' : ''}`}
          onClick={() => setActiveTab('cargar')}
        >
          <span className="tab-icon">📤</span>
          Cargar Excel
        </button>
        <button
          className={`tab-btn ${activeTab === 'listar' ? 'active' : ''}`}
          onClick={() => setActiveTab('listar')}
        >
          <span className="tab-icon">📋</span>
          Listar Casos
        </button>
        <button
          className={`tab-btn ${activeTab === 'buscar' ? 'active' : ''}`}
          onClick={() => setActiveTab('buscar')}
        >
          <span className="tab-icon">🔍</span>
          Buscar
        </button>
        <button
          className={`tab-btn ${activeTab === 'resultados' ? 'active' : ''}`}
          onClick={() => setActiveTab('resultados')}
          disabled={!importResult}
        >
          <span className="tab-icon">✅</span>
          Resultados
        </button>
      </div>

      {/* Tab Content */}
      <div className="dengue-content">
        {/* Tab: Cargar Excel */}
        {activeTab === 'cargar' && (
          <div className="tab-panel">
            <DengueUploadForm onImportSuccess={handleImportSuccess} />
          </div>
        )}

        {/* Tab: Listar Casos */}
        {activeTab === 'listar' && (
          <div className="tab-panel">
            <DengueCasosList mode="listar" />
          </div>
        )}

        {/* Tab: Buscar */}
        {activeTab === 'buscar' && (
          <div className="tab-panel">
            <DengueCasosList mode="buscar" />
          </div>
        )}

        {/* Tab: Resultados */}
        {activeTab === 'resultados' && importResult && (
          <div className="tab-panel">
            <DengueValidationReport
              result={importResult}
              onClose={handleCloseResult}
            />
          </div>
        )}
      </div>

      {/* Modal de resultado flotante (opcional) */}
      {showResult && importResult && (
        <div className="result-modal-overlay" onClick={handleCloseResult}>
          <div className="result-modal" onClick={(e) => e.stopPropagation()}>
            <div className="result-header">
              <h3>Resultado de Importación</h3>
              <button
                className="result-close-btn"
                onClick={handleCloseResult}
              >
                ✕
              </button>
            </div>
            <div className="result-summary">
              <div className={`summary-stat ${importResult.exitoso ? 'success' : 'error'}`}>
                <span className="stat-label">Estado:</span>
                <span className="stat-value">
                  {importResult.exitoso ? '✅ Exitoso' : '❌ Con errores'}
                </span>
              </div>
              <div className="summary-stat">
                <span className="stat-label">Total Procesados:</span>
                <span className="stat-value">{importResult.totalProcesados}</span>
              </div>
              <div className="summary-stat success">
                <span className="stat-label">Insertados:</span>
                <span className="stat-value">{importResult.insertados}</span>
              </div>
              <div className="summary-stat warning">
                <span className="stat-label">Actualizados:</span>
                <span className="stat-value">{importResult.actualizados}</span>
              </div>
              <div className="summary-stat error">
                <span className="stat-label">Errores:</span>
                <span className="stat-value">{importResult.errores}</span>
              </div>
              <div className="summary-stat">
                <span className="stat-label">Tiempo:</span>
                <span className="stat-value">{importResult.tiempoMs}ms</span>
              </div>
            </div>
            <button className="result-close-action" onClick={handleCloseResult}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

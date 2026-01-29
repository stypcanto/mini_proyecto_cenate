/**
 * DengueValidationReport.jsx - Reporte de validación de importación
 *
 * Características:
 * - Muestra resumen de la importación (exitoso, errores, etc)
 * - Lista de errores detallados (si las hay)
 * - Estadísticas de la carga
 * - Tiempo de procesamiento
 *
 * @version 1.0.0
 * @since 2026-01-29
 */

import React, { useState } from 'react';
import './DengueValidationReport.css';

export default function DengueValidationReport({ result, onClose }) {
  const [expandedErrors, setExpandedErrors] = useState(false);

  const successRate = result.totalProcesados
    ? ((
        ((result.insertados + result.actualizados) /
          result.totalProcesados) *
        100
      ).toFixed(2))
    : 0;

  const hasErrors = result.errores > 0;

  /**
   * Calcula el porcentaje de cada tipo de operación
   */
  const getPercentage = (value) => {
    if (result.totalProcesados === 0) return 0;
    return ((value / result.totalProcesados) * 100).toFixed(1);
  };

  return (
    <div className="dengue-validation-report">
      {/* Header */}
      <div className="report-header">
        <div className="header-title">
          <span className="header-icon">
            {result.exitoso ? '✅' : '⚠️'}
          </span>
          <h2>
            {result.exitoso ? 'Importación Exitosa' : 'Importación con Alertas'}
          </h2>
        </div>
        <button className="close-btn" onClick={onClose}>
          ✕
        </button>
      </div>

      {/* Main Stats */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-card-header">
            <span className="stat-icon">📊</span>
            <span className="stat-title">Total Procesados</span>
          </div>
          <div className="stat-card-value">{result.totalProcesados}</div>
        </div>

        <div className="stat-card success">
          <div className="stat-card-header">
            <span className="stat-icon">➕</span>
            <span className="stat-title">Insertados</span>
          </div>
          <div className="stat-card-value">{result.insertados}</div>
          <div className="stat-card-percentage">
            {getPercentage(result.insertados)}%
          </div>
        </div>

        <div className="stat-card warning">
          <div className="stat-card-header">
            <span className="stat-icon">🔄</span>
            <span className="stat-title">Actualizados</span>
          </div>
          <div className="stat-card-value">{result.actualizados}</div>
          <div className="stat-card-percentage">
            {getPercentage(result.actualizados)}%
          </div>
        </div>

        <div className={`stat-card ${hasErrors ? 'error' : 'success'}`}>
          <div className="stat-card-header">
            <span className="stat-icon">{hasErrors ? '❌' : '✓'}</span>
            <span className="stat-title">Errores</span>
          </div>
          <div className="stat-card-value">{result.errores}</div>
          <div className="stat-card-percentage">
            {getPercentage(result.errores)}%
          </div>
        </div>

        <div className="stat-card info">
          <div className="stat-card-header">
            <span className="stat-icon">⏱️</span>
            <span className="stat-title">Tiempo</span>
          </div>
          <div className="stat-card-value">{result.tiempoMs}ms</div>
          <div className="stat-card-percentage">
            {(result.tiempoMs / 1000).toFixed(2)}s
          </div>
        </div>

        <div className="stat-card highlight">
          <div className="stat-card-header">
            <span className="stat-icon">📈</span>
            <span className="stat-title">Tasa de Éxito</span>
          </div>
          <div className="stat-card-value">{successRate}%</div>
          <div className="stat-card-percentage">
            {result.insertados + result.actualizados} de{' '}
            {result.totalProcesados}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-section">
        <div className="progress-title">Distribución de Resultados</div>
        <div className="progress-bar">
          {result.insertados > 0 && (
            <div
              className="progress-segment success"
              style={{
                width: `${getPercentage(result.insertados)}%`,
              }}
              title={`Insertados: ${result.insertados}`}
            ></div>
          )}
          {result.actualizados > 0 && (
            <div
              className="progress-segment warning"
              style={{
                width: `${getPercentage(result.actualizados)}%`,
              }}
              title={`Actualizados: ${result.actualizados}`}
            ></div>
          )}
          {result.errores > 0 && (
            <div
              className="progress-segment error"
              style={{
                width: `${getPercentage(result.errores)}%`,
              }}
              title={`Errores: ${result.errores}`}
            ></div>
          )}
        </div>
      </div>

      {/* Error Messages Section */}
      {hasErrors && (
        <div className="errors-section">
          <button
            className="errors-toggle"
            onClick={() => setExpandedErrors(!expandedErrors)}
          >
            <span className="toggle-icon">{expandedErrors ? '▼' : '▶'}</span>
            <span className="toggle-label">
              Ver {result.errores} Error{result.errores !== 1 ? 'es' : ''} ({result.mensajesError?.length || 0} registrados)
            </span>
          </button>

          {expandedErrors && result.mensajesError && (
            <div className="errors-list">
              {result.mensajesError.slice(0, 20).map((error, index) => (
                <div key={index} className="error-item">
                  <span className="error-number">{index + 1}.</span>
                  <span className="error-message">{error}</span>
                </div>
              ))}
              {result.mensajesError.length > 20 && (
                <div className="errors-more">
                  ... y {result.mensajesError.length - 20} errores más
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Success Message */}
      {result.exitoso && (
        <div className="success-banner">
          <span className="banner-icon">🎉</span>
          <span className="banner-text">
            ¡Importación completada exitosamente!
            {result.insertados > 0 &&
              ` Se han insertado ${result.insertados} nuevos caso${result.insertados !== 1 ? 's' : ''}.`}
            {result.actualizados > 0 &&
              ` Se han actualizado ${result.actualizados} caso${result.actualizados !== 1 ? 's' : ''}.`}
          </span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="report-actions">
        <button className="btn btn-primary" onClick={onClose}>
          ✓ Cerrar Reporte
        </button>
        <button className="btn btn-secondary" onClick={() => window.print()}>
          🖨️ Imprimir
        </button>
      </div>

      {/* Technical Details */}
      <div className="technical-details">
        <details>
          <summary>Detalles Técnicos</summary>
          <div className="details-content">
            <div className="detail-item">
              <span className="detail-label">Exitoso:</span>
              <span className="detail-value">
                {result.exitoso ? '✓ Sí' : '✗ No'}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Total Procesados:</span>
              <span className="detail-value">{result.totalProcesados}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Insertados:</span>
              <span className="detail-value">{result.insertados}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Actualizados:</span>
              <span className="detail-value">{result.actualizados}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Errores:</span>
              <span className="detail-value">{result.errores}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Tiempo de procesamiento:</span>
              <span className="detail-value">{result.tiempoMs}ms</span>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}

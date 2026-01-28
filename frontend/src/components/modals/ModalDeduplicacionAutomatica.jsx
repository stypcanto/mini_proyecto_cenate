import React, { useState } from 'react';
import './ModalDeduplicacionAutomatica.css';

/**
 * Modal que muestra los DNI duplicados detectados y consolidados
 * Estrategia KEEP_FIRST: se mantiene primer registro, se descartan duplicados
 *
 * @version v2.2.0 (2026-01-28)
 * @param {Object} datosDeduplicacion - Reporte de deduplicación del backend
 * @param {boolean} visible - Si el modal es visible
 * @param {function} onConfirm - Callback al confirmar
 * @param {function} onCancel - Callback al cancelar
 */
const ModalDeduplicacionAutomatica = ({
  datosDeduplicacion,
  visible,
  onConfirm,
  onCancel
}) => {
  const [expandidos, setExpandidos] = useState({});

  if (!visible || !datosDeduplicacion) return null;

  const {
    filas_total = 0,
    filas_ok = 0,
    filas_deduplicadas_saltadas = 0,
    reporte_deduplicacion = {},
    reporte_analisis_duplicados = {}
  } = datosDeduplicacion;

  const { dniDuplicadosDetalles = [] } = reporte_deduplicacion;

  const toggleExpand = (index) => {
    setExpandidos(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-deduplicacion">
        {/* Header */}
        <div className="modal-header">
          <h2>🔄 Consolidación Automática de Duplicados</h2>
          <button
            className="close-btn"
            onClick={onCancel}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Resumen */}
          <div className="resumen-section">
            <h3>📊 Resumen de Procesamiento</h3>
            <div className="stats-grid">
              <div className="stat-card total">
                <div className="stat-number">{filas_total}</div>
                <div className="stat-label">Filas Total</div>
              </div>
              <div className="stat-card success">
                <div className="stat-number">{filas_ok}</div>
                <div className="stat-label">Filas Cargadas</div>
              </div>
              <div className="stat-card warning">
                <div className="stat-number">{filas_deduplicadas_saltadas}</div>
                <div className="stat-label">Filas Consolidadas</div>
              </div>
              <div className="stat-card info">
                <div className="stat-number">
                  {filas_deduplicadas_saltadas > 0
                    ? ((filas_deduplicadas_saltadas / filas_total) * 100).toFixed(1)
                    : 0}%
                </div>
                <div className="stat-label">Tasa de Consolidación</div>
              </div>
            </div>
          </div>

          {/* Estrategia */}
          <div className="estrategia-section">
            <div className="info-box">
              <div className="info-icon">ℹ️</div>
              <div className="info-content">
                <h4>Estrategia: KEEP_FIRST</h4>
                <p>Se mantiene el <strong>primer registro</strong> de cada DNI duplicado y se descartan los posteriores.
                  Esto garantiza carga <strong>100% exitosa sin errores</strong>.</p>
              </div>
            </div>
          </div>

          {/* Detalle de Duplicados */}
          {filas_deduplicadas_saltadas > 0 && (
            <div className="duplicados-section">
              <h3>📋 Detalle de DNI Consolidados ({filas_deduplicadas_saltadas})</h3>
              <div className="duplicados-list">
                {dniDuplicadosDetalles.map((item, index) => (
                  <div key={index} className="duplicado-item">
                    <div
                      className="duplicado-header"
                      onClick={() => toggleExpand(index)}
                    >
                      <div className="duplicado-toggle">
                        {expandidos[index] ? '▼' : '▶'}
                      </div>
                      <div className="duplicado-info">
                        <div className="dni-badge">DNI: {item.dni}</div>
                        <div className="filas-info">
                          Filas: {item.fila} (duplicado encontrado)
                        </div>
                      </div>
                      <div className="duplicado-action">
                        ✓ Mantener fila {item.fila}
                      </div>
                    </div>

                    {expandidos[index] && (
                      <div className="duplicado-detail">
                        <p><strong>Razon:</strong> {item.razon}</p>
                        <p><strong>Acción:</strong> Se mantiene el primer registro de este DNI.
                          Los posteriores se descartan para evitar duplicación.</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ventajas */}
          <div className="ventajas-section">
            <h4>✅ Ventajas</h4>
            <ul>
              <li>Sin intervención manual - automático</li>
              <li>Carga 100% exitosa</li>
              <li>Zero errores de duplicados</li>
              <li>Reporte transparente de consolidación</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button
            className="btn-cancel"
            onClick={onCancel}
          >
            ❌ Cancelar
          </button>
          <button
            className="btn-confirm"
            onClick={onConfirm}
          >
            ✅ Confirmar Carga
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalDeduplicacionAutomatica;

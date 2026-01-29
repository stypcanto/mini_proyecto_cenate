/**
 * TablaDengueCompleta.jsx - Tabla con 11 columnas dengue-específicas
 *
 * Columnas:
 * 1. DNI
 * 2. Nombre
 * 3. Sexo
 * 4. CAS (cenasicod)
 * 5. CIE-10 (dxMain) - Con color coding
 * 6. IPRESS
 * 7. Red Asistencial
 * 8. Fecha Atención
 * 9. Fecha Síntomas
 * 10. Semana Epidemiológica
 * 11. Estado
 *
 * Color coding por CIE-10:
 * - A97.0: Amarillo (Fiebre Amarilla)
 * - A97.1: Verde (Dengue)
 * - A97.2: Rojo (Dengue Hemorrágico)
 *
 * @version 1.0.0
 * @since 2026-01-29
 */

import React from 'react';
import './TablaDengueCompleta.css';

export default function TablaDengueCompleta({ casos = [] }) {
  /**
   * Obtiene el color según el CIE-10
   */
  const getColorByCIE10 = (dxMain) => {
    switch (dxMain) {
      case 'A97.0':
        return 'yellow'; // Fiebre Amarilla
      case 'A97.1':
        return 'green'; // Dengue
      case 'A97.2':
        return 'red'; // Dengue Hemorrágico
      default:
        return 'gray';
    }
  };

  /**
   * Obtiene el nombre del CIE-10
   */
  const getCIE10Name = (dxMain) => {
    switch (dxMain) {
      case 'A97.0':
        return 'Fiebre Amarilla';
      case 'A97.1':
        return 'Dengue';
      case 'A97.2':
        return 'Dengue Hemorrágico';
      default:
        return 'Desconocido';
    }
  };

  /**
   * Formatea fecha a dd/mm/yyyy
   */
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-PE');
    } catch {
      return dateString;
    }
  };

  /**
   * Formatea el sexo
   */
  const formatSexo = (sexo) => {
    if (sexo === 'M') return 'Masculino';
    if (sexo === 'F') return 'Femenino';
    return sexo || '-';
  };

  return (
    <div className="tabla-dengue-completa-container">
      <div className="tabla-scroll">
        <table className="tabla-dengue-completa">
          <thead>
            <tr className="header-row">
              <th className="col-dni">DNI</th>
              <th className="col-nombre">Nombre</th>
              <th className="col-sexo">Sexo</th>
              <th className="col-cas">CAS</th>
              <th className="col-cie10">CIE-10</th>
              <th className="col-ipress">IPRESS</th>
              <th className="col-red">Red Asistencial</th>
              <th className="col-fecha-atencion">Fecha Atención</th>
              <th className="col-fecha-sintomas">Fecha Síntomas</th>
              <th className="col-semana">Semana Epidem.</th>
              <th className="col-estado">Estado</th>
            </tr>
          </thead>
          <tbody>
            {casos.map((caso, index) => (
              <tr key={caso.idSolicitud || index} className="data-row">
                <td className="col-dni">{caso.pacienteDni || '-'}</td>
                <td className="col-nombre">{caso.pacienteNombre || '-'}</td>
                <td className="col-sexo">
                  {formatSexo(caso.pacienteSexo)}
                </td>
                <td className="col-cas">{caso.cenasicod || '-'}</td>
                <td className={`col-cie10 cie10-${getColorByCIE10(caso.dxMain)}`}>
                  <span className="cie10-badge">
                    {caso.dxMain}
                    <br />
                    <small>{getCIE10Name(caso.dxMain)}</small>
                  </span>
                </td>
                <td className="col-ipress">{caso.nombreIpress || '-'}</td>
                <td className="col-red">{caso.redAsistencial || '-'}</td>
                <td className="col-fecha-atencion">
                  {formatDate(caso.fechaAtencion)}
                </td>
                <td className="col-fecha-sintomas">
                  {formatDate(caso.fechaSintomas)}
                </td>
                <td className="col-semana">{caso.semanaEpidem || '-'}</td>
                <td className="col-estado">
                  <span
                    className={`estado-badge estado-${(caso.estado || 'pendiente').toLowerCase()}`}
                  >
                    {caso.estado || 'PENDIENTE'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Leyenda de colores */}
      <div className="tabla-legend">
        <div className="legend-title">Leyenda de CIE-10:</div>
        <div className="legend-items">
          <div className="legend-item yellow">
            <span className="legend-color"></span>
            <span className="legend-label">A97.0 - Fiebre Amarilla</span>
          </div>
          <div className="legend-item green">
            <span className="legend-color"></span>
            <span className="legend-label">A97.1 - Dengue</span>
          </div>
          <div className="legend-item red">
            <span className="legend-color"></span>
            <span className="legend-label">A97.2 - Dengue Hemorrágico</span>
          </div>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="tabla-stats">
        <div className="stat-item">
          <span className="stat-label">Total registros:</span>
          <span className="stat-value">{casos.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Dengue (A97.1):</span>
          <span className="stat-value green">
            {casos.filter((c) => c.dxMain === 'A97.1').length}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Dengue Hemorrágico (A97.2):</span>
          <span className="stat-value red">
            {casos.filter((c) => c.dxMain === 'A97.2').length}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Fiebre Amarilla (A97.0):</span>
          <span className="stat-value yellow">
            {casos.filter((c) => c.dxMain === 'A97.0').length}
          </span>
        </div>
      </div>
    </div>
  );
}

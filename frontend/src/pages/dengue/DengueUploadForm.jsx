/**
 * DengueUploadForm.jsx - Formulario de carga de Excel
 *
 * Características:
 * - Drag & drop de archivo
 * - Validación de formato .xlsx
 * - Indicador de progreso
 * - Manejo de errores
 *
 * @version 1.0.0
 * @since 2026-01-29
 */

import React, { useState, useRef } from 'react';
import { useDengue } from '../../hooks/useDengue';
import './DengueUploadForm.css';

export default function DengueUploadForm({ onImportSuccess }) {
  const fileInputRef = useRef(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const { isUploading, uploadError, cargarArchivo, limpiarUpload } = useDengue();

  // Obtener ID de usuario del localStorage o contexto
  const usuarioId = localStorage.getItem('userId') || 1;

  /**
   * Valida que el archivo sea .xlsx
   */
  const isValidFile = (file) => {
    if (!file) return false;
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];
    const validExtensions = ['.xlsx', '.xls'];
    const hasValidType = validTypes.includes(file.type);
    const hasValidExtension = validExtensions.some((ext) =>
      file.name.toLowerCase().endsWith(ext)
    );
    return hasValidType || hasValidExtension;
  };

  /**
   * Maneja el cambio de archivo
   */
  const handleFileChange = (files) => {
    const file = files[0];
    if (!file) return;

    if (!isValidFile(file)) {
      alert('Por favor selecciona un archivo .xlsx válido');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      // 10MB límite
      alert('El archivo no puede exceder 10MB');
      return;
    }

    setSelectedFile(file);
  };

  /**
   * Drag handlers
   */
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const files = e.dataTransfer.files;
    handleFileChange(files);
  };

  /**
   * Inicia la carga del archivo
   */
  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Por favor selecciona un archivo');
      return;
    }

    try {
      const result = await cargarArchivo(selectedFile, usuarioId);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      onImportSuccess(result);
    } catch (error) {
      console.error('Error durante la carga:', error);
    }
  };

  return (
    <div className="dengue-upload-form">
      <div className="upload-container">
        {/* Drop Zone */}
        <div
          className={`upload-dropzone ${isDragActive ? 'active' : ''} ${
            isUploading ? 'loading' : ''
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => handleFileChange(e.target.files)}
            disabled={isUploading}
            style={{ display: 'none' }}
          />

          <div className="dropzone-content">
            {isUploading ? (
              <>
                <div className="upload-spinner"></div>
                <p>Cargando archivo...</p>
              </>
            ) : selectedFile ? (
              <>
                <span className="file-icon">📄</span>
                <p className="file-name">{selectedFile.name}</p>
                <p className="file-size">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </>
            ) : (
              <>
                <span className="upload-icon">📤</span>
                <p className="upload-text">
                  Arrastra aquí tu archivo Excel o haz clic para seleccionar
                </p>
                <p className="upload-hint">Formato: .xlsx | Máximo: 10MB</p>
              </>
            )}
          </div>
        </div>

        {/* Error Message */}
        {uploadError && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            <div className="error-text">
              <p className="error-title">Error en la carga</p>
              <p className="error-detail">{uploadError}</p>
            </div>
            <button
              className="error-close"
              onClick={() => limpiarUpload()}
            >
              ✕
            </button>
          </div>
        )}

        {/* Instructions */}
        <div className="upload-instructions">
          <h3>Requisitos del archivo:</h3>
          <ul>
            <li>✓ Formato: .xlsx (Excel)</li>
            <li>✓ Columnas requeridas: DNI, Nombre, CIE-10, Fecha Atención</li>
            <li>✓ Máximo: 10MB</li>
            <li>✓ Los registros duplicados (DNI + Fecha) serán actualizados</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="upload-actions">
          <button
            className="btn btn-primary"
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
          >
            {isUploading ? '⏳ Cargando...' : '✓ Cargar Excel'}
          </button>
          {selectedFile && !isUploading && (
            <button
              className="btn btn-secondary"
              onClick={() => {
                setSelectedFile(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
            >
              ✕ Limpiar
            </button>
          )}
        </div>

        {/* Expected Data Sample */}
        <div className="data-sample">
          <h4>Formato esperado (primeras columnas):</h4>
          <table className="sample-table">
            <thead>
              <tr>
                <th>DNI</th>
                <th>Nombre</th>
                <th>Sexo</th>
                <th>Edad</th>
                <th>CAS</th>
                <th>CIE-10</th>
                <th>IPRESS</th>
                <th>Red</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>00370941</td>
                <td>PARDO SANDOVAL CESAR</td>
                <td>M</td>
                <td>54</td>
                <td>292</td>
                <td>A97.0</td>
                <td>H.I CARLOS ALBERTO CORTEZ</td>
                <td>RED ASISTENCIAL TUMBES</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

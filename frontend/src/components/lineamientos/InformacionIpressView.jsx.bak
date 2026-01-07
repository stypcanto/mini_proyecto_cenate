/**
 * Componente: InformacionIpressView
 * Descripción: Visualización de información de IPRESS según lineamientos
 *
 * @author Ing. Styp Canto Rondón
 * @version 1.0.0
 * @since 2026-01-06
 */

import React, { useState, useEffect } from 'react';
import { informacionIpressService } from '../../services/lineamientoService';
import toast from 'react-hot-toast';
import './InformacionIpressView.css';

export default function InformacionIpressView() {
  // Estado
  const [loading, setLoading] = useState(false);
  const [informaciones, setInformaciones] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [paginaActual, setPaginaActual] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);

  // Cargar datos
  useEffect(() => {
    cargarInformaciones();
  }, [paginaActual, filtroEstado]);

  const cargarInformaciones = async () => {
    try {
      setLoading(true);
      const response = await informacionIpressService.listarInformacionesIpress(paginaActual, 10);
      if (response.data && response.data.data) {
        let datos = response.data.data;

        // Filtrar por estado
        if (filtroEstado !== 'todos') {
          datos = datos.filter(item => item.estadoCumplimiento === filtroEstado);
        }

        // Filtrar por búsqueda
        if (busqueda) {
          datos = datos.filter(item =>
            item.tituloLineamiento?.toLowerCase().includes(busqueda.toLowerCase()) ||
            item.descIpress?.toLowerCase().includes(busqueda.toLowerCase())
          );
        }

        setInformaciones(datos);
        setTotalPaginas(response.data.totalPages || 1);
      }
    } catch (error) {
      console.error('Error al cargar informaciones:', error);
      toast.error('Error al cargar informaciones IPRESS');
    } finally {
      setLoading(false);
    }
  };

  // Renderizar badge de estado
  const renderBadgeEstado = (estado) => {
    const estilos = {
      'CUMPLE': 'badge-cumple',
      'NO_CUMPLE': 'badge-no-cumple',
      'EN_PROGRESO': 'badge-en-progreso',
      'PENDIENTE': 'badge-pendiente'
    };

    const iconos = {
      'CUMPLE': '✅',
      'NO_CUMPLE': '❌',
      'EN_PROGRESO': '⏳',
      'PENDIENTE': '⚠️'
    };

    return (
      <span className={`badge ${estilos[estado] || 'badge-pendiente'}`}>
        {iconos[estado]}
        {estado}
      </span>
    );
  };

  // Renderizar tarjeta de información
  const renderTarjeta = (info) => (
    <div key={info.idInformacionIpress} className="tarjeta-informacion">
      <div className="tarjeta-header">
        <div className="tarjeta-titulo">
          <h3>{info.tituloLineamiento}</h3>
          <span className="codigo">{info.codigoLineamiento}</span>
        </div>
        {renderBadgeEstado(info.estadoCumplimiento)}
      </div>

      <div className="tarjeta-ipress">
        <span>📍</span>
        <div>
          <h4>{info.descIpress}</h4>
          <p className="red-info">{info.nombreRed}</p>
        </div>
      </div>

      {info.responsable && (
        <div className="tarjeta-responsable">
          <span>👤</span>
          <span>{info.responsable}</span>
        </div>
      )}

      {info.contenido && (
        <div className="tarjeta-contenido">
          <p className="label">Contenido:</p>
          <p>{info.contenido}</p>
        </div>
      )}

      {info.requisitos && (
        <div className="tarjeta-requisitos">
          <p className="label">Requisitos:</p>
          <p>{info.requisitos}</p>
        </div>
      )}

      {info.observaciones && (
        <div className="tarjeta-observaciones">
          <span>📄</span>
          <p>{info.observaciones}</p>
        </div>
      )}

      {info.fechaImplementacion && (
        <div className="tarjeta-fecha">
          <span>📅</span>
          <span>Implementado: {new Date(info.fechaImplementacion).toLocaleDateString('es-PE')}</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="informacion-ipress-container">
      {/* Header */}
      <div className="ipress-header">
        <h1>📋 Información IPRESS - Lineamientos</h1>
        <p>Gestión de información específica de IPRESS según lineamientos técnicos y operativos</p>
      </div>

      {/* Controles */}
      <div className="ipress-controles">
        <div className="control-busqueda">
          <input
            type="text"
            placeholder="Buscar por lineamiento o IPRESS..."
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPaginaActual(0);
            }}
            className="input-busqueda"
          />
        </div>

        <div className="control-filtros">
          <select
            value={filtroEstado}
            onChange={(e) => {
              setFiltroEstado(e.target.value);
              setPaginaActual(0);
            }}
            className="select-filtro"
          >
            <option value="todos">Todos los estados</option>
            <option value="CUMPLE">✅ Cumple</option>
            <option value="NO_CUMPLE">❌ No Cumple</option>
            <option value="EN_PROGRESO">⏳ En Progreso</option>
            <option value="PENDIENTE">⚠️ Pendiente</option>
          </select>
        </div>
      </div>

      {/* Contenido */}
      <div className="ipress-contenido">
        {loading ? (
          <div className="loading-state">
            <div className="spin">⏳</div>
            <p>Cargando información IPRESS...</p>
          </div>
        ) : informaciones.length > 0 ? (
          <>
            <div className="informaciones-grid">
              {informaciones.map(renderTarjeta)}
            </div>

            {/* Paginación */}
            {totalPaginas > 1 && (
              <div className="paginacion">
                <button
                  disabled={paginaActual === 0}
                  onClick={() => setPaginaActual(paginaActual - 1)}
                  className="btn-paginacion"
                >
                  ← Anterior
                </button>

                <span className="info-paginacion">
                  Página {paginaActual + 1} de {totalPaginas}
                </span>

                <button
                  disabled={paginaActual >= totalPaginas - 1}
                  onClick={() => setPaginaActual(paginaActual + 1)}
                  className="btn-paginacion"
                >
                  Siguiente →
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">⚠️</div>
            <h3>No hay información IPRESS disponible</h3>
            <p>No se encontraron registros con los filtros seleccionados</p>
          </div>
        )}
      </div>
    </div>
  );
}

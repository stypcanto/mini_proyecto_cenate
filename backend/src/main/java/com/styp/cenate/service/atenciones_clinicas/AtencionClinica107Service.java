package com.styp.cenate.service.atenciones_clinicas;

import com.styp.cenate.dto.AtencionClinica107DTO;
import com.styp.cenate.dto.AtencionClinica107FiltroDTO;
import com.styp.cenate.dto.EstadisticasAtencion107DTO;
import com.styp.cenate.dto.EstadisticasCondicionMedica107DTO;
import org.springframework.data.domain.Page;

/**
 * 🎯 AtencionClinica107Service
 * Propósito: Interface del servicio de atenciones clínicas
 * Módulo: 107
 * Métodos principales:
 *   - Listar con filtros y paginación
 *   - Obtener estadísticas globales
 *   - Obtener detalle de una atención
 */
public interface AtencionClinica107Service {

    /**
     * Listar atenciones con filtros avanzados y paginación
     * @param filtro DTO con todos los filtros y parámetros
     * @return Página de AtencionClinica107DTO
     */
    Page<AtencionClinica107DTO> listarConFiltros(AtencionClinica107FiltroDTO filtro);

    /**
     * Obtener estadísticas globales de atenciones
     * @return DTO con total, pendientes, atendidos
     */
    EstadisticasAtencion107DTO obtenerEstadisticas();

    /**
     * 🆕 Obtener estadísticas basadas en condición médica
     * @return DTO con total, pendientes, atendidos, deserciones
     */
    EstadisticasCondicionMedica107DTO obtenerEstadisticasCondicionMedica();

    /**
     * Obtener detalle completo de una atención
     * @param idSolicitud ID de la solicitud
     * @return AtencionClinica107DTO con todos los datos
     */
    AtencionClinica107DTO obtenerDetalle(Long idSolicitud);
}

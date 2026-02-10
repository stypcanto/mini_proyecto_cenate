package com.styp.cenate.service.atenciones_clinicas;

import com.styp.cenate.dto.*;
import org.springframework.data.domain.Page;

import java.util.List;

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

    // ========================================================================
    // 📊 NUEVOS MÉTODOS DE ESTADÍSTICAS AVANZADAS
    // ========================================================================

    /**
     * 📈 Obtener estadísticas de resumen general
     * @return DTO con métricas principales del dashboard
     */
    EstadisticasResumen107DTO obtenerEstadisticasResumen();

    /**
     * 📅 Obtener estadísticas por mes/año
     * @return Lista de EstadisticasMensuales107DTO ordenadas por fecha
     */
    List<EstadisticasMensuales107DTO> obtenerEstadisticasMensuales();

    /**
     * 🏥 Obtener estadísticas por IPRESS
     * @param limit Número máximo de registros (opcional, default: 10)
     * @return Lista de EstadisticasIpress107DTO ordenadas por total
     */
    List<EstadisticasIpress107DTO> obtenerEstadisticasIpress(Integer limit);

    /**
     * 🩺 Obtener estadísticas por especialidad (derivación interna)
     * @return Lista de EstadisticasEspecialidad107DTO ordenadas por total
     */
    List<EstadisticasEspecialidad107DTO> obtenerEstadisticasEspecialidad();

    /**
     * 📞 Obtener estadísticas por tipo de cita
     * @return Lista de EstadisticasTipoCita107DTO ordenadas por total
     */
    List<EstadisticasTipoCita107DTO> obtenerEstadisticasTipoCita();
}

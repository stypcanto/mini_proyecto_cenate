package com.styp.cenate.service.form107;

import com.styp.cenate.dto.form107.Modulo107PacienteDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.OffsetDateTime;
import java.util.Map;

/**
 * 📋 Modulo107Service - Capa de negocio del Módulo 107
 *
 * Servicio encargado de la lógica de negocio para la Bolsa 107:
 * - Listado de pacientes con paginación
 * - Búsqueda avanzada con múltiples filtros
 * - Cálculo de estadísticas y KPIs
 * - Auditoría de operaciones críticas
 *
 * @since v3.0.0 (2026-01-29)
 */
public interface Modulo107Service {

    /**
     * Listar todos los pacientes del Módulo 107 con paginación
     *
     * @param pageable Configuración de paginación y ordenamiento
     * @return Página de DTOs de pacientes del Módulo 107
     */
    Page<Modulo107PacienteDTO> listarPacientes(Pageable pageable);

    /**
     * Buscar pacientes con filtros avanzados
     *
     * Permite búsqueda multi-criterio:
     * - DNI: búsqueda parcial
     * - Nombre: búsqueda case-insensitive
     * - IPRESS: búsqueda exacta
     * - Estado: filtro por estado de gestión
     * - Fechas: rango de fechas de solicitud
     *
     * @param dni DNI del paciente (opcional)
     * @param nombre Nombre del paciente (opcional)
     * @param codigoIpress Código IPRESS (opcional)
     * @param estadoId ID del estado de gestión (opcional)
     * @param fechaDesde Fecha inicio del rango (opcional)
     * @param fechaHasta Fecha fin del rango (opcional)
     * @param pageable Configuración de paginación
     * @return Página de DTOs de pacientes que coinciden con los filtros
     */
    Page<Modulo107PacienteDTO> buscarPacientes(
            String dni,
            String nombre,
            String codigoIpress,
            Long estadoId,
            OffsetDateTime fechaDesde,
            OffsetDateTime fechaHasta,
            Pageable pageable
    );

    /**
     * Obtener estadísticas completas del Módulo 107
     *
     * Retorna un dashboard con:
     * - KPIs generales (total, atendidos, pendientes, cancelados, horas promedio)
     * - Distribución por estado
     * - Distribución por especialidad
     * - Top 10 IPRESS
     * - Evolución temporal (últimos 30 días)
     *
     * @return Map con todas las estadísticas agrupadas
     */
    Map<String, Object> obtenerEstadisticas();
}

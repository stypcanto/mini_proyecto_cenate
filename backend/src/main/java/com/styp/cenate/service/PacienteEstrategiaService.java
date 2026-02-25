package com.styp.cenate.service;

import com.styp.cenate.dto.AsignarEstrategiaRequest;
import com.styp.cenate.dto.BajaCenacronListDto;
import com.styp.cenate.dto.DesasignarEstrategiaRequest;
import com.styp.cenate.dto.PacienteEstrategiaResponse;
import com.styp.cenate.model.PacienteEstrategia;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;

/**
 * Servicio para gestionar la asignación de estrategias a pacientes
 * Permite:
 * - Asignar pacientes a estrategias
 * - Desasignar/desvincular pacientes de estrategias
 * - Consultar estrategias activas e historial
 * - Reportería de pacientes por estrategia
 *
 * @author Claude Code + Styp Canto Rondón
 * @version 1.0.0
 * @since 2026-01-06
 */
public interface PacienteEstrategiaService {

    /**
     * Asigna una estrategia a un paciente
     * Valida que no exista una asignación activa previa
     *
     * @param request Datos de la asignación
     * @param idUsuarioAsigno ID del usuario que realiza la asignación
     * @return Respuesta con los datos de la asignación creada
     * @throws IllegalArgumentException si la asignación ya existe o datos inválidos
     */
    PacienteEstrategiaResponse asignarEstrategia(
            AsignarEstrategiaRequest request,
            Long idUsuarioAsigno
    );

    /**
     * Desasigna (desvincla) un paciente de una estrategia
     *
     * @param idAsignacion ID de la asignación a desasignar
     * @param request Datos de la desasignación (estado, observación)
     * @return Respuesta con los datos de la asignación actualizada
     * @throws IllegalArgumentException si la asignación no existe
     */
    PacienteEstrategiaResponse desasignarEstrategia(
            Long idAsignacion,
            DesasignarEstrategiaRequest request
    );

    /**
     * Obtiene todas las estrategias activas de un paciente
     *
     * @param pkAsegurado ID del paciente
     * @return Lista de estrategias activas
     */
    List<PacienteEstrategiaResponse> obtenerEstrategiasActivas(String pkAsegurado);

    /**
     * Obtiene el historial completo de estrategias de un paciente
     *
     * @param pkAsegurado ID del paciente
     * @return Lista de todas las asignaciones (activas, inactivas, completadas)
     */
    List<PacienteEstrategiaResponse> obtenerHistorialEstrategias(String pkAsegurado);

    /**
     * Obtiene el historial de estrategias con paginación
     *
     * @param pkAsegurado ID del paciente
     * @param pageable Configuración de paginación
     * @return Página de asignaciones
     */
    Page<PacienteEstrategiaResponse> obtenerHistorialEstrategiasPaginado(
            String pkAsegurado,
            Pageable pageable
    );

    /**
     * Obtiene una asignación específica por su ID
     *
     * @param idAsignacion ID de la asignación
     * @return Respuesta con los datos de la asignación
     * @throws IllegalArgumentException si la asignación no existe
     */
    PacienteEstrategiaResponse obtenerAsignacion(Long idAsignacion);

    /**
     * Verifica si un paciente tiene una asignación activa a una estrategia
     *
     * @param pkAsegurado ID del paciente
     * @param idEstrategia ID de la estrategia
     * @return true si existe asignación activa, false en caso contrario
     */
    boolean tieneAsignacionActiva(String pkAsegurado, Long idEstrategia);

    /**
     * Obtiene todos los pacientes asignados a una estrategia (activos)
     *
     * @param idEstrategia ID de la estrategia
     * @return Lista de asignaciones activas
     */
    List<PacienteEstrategiaResponse> obtenerPacientesActivosPorEstrategia(Long idEstrategia);

    /**
     * Obtiene los pacientes asignados a una estrategia con paginación
     *
     * @param idEstrategia ID de la estrategia
     * @param pageable Configuración de paginación
     * @return Página de asignaciones
     */
    Page<PacienteEstrategiaResponse> obtenerPacientesActivosPorEstrategiaPaginado(
            Long idEstrategia,
            Pageable pageable
    );

    /**
     * Cuenta cuántos pacientes tienen asignación activa a una estrategia
     *
     * @param idEstrategia ID de la estrategia
     * @return Cantidad de pacientes activos
     */
    long contarPacientesActivosPorEstrategia(Long idEstrategia);

    /**
     * Obtiene la entidad raw de una asignación (para uso interno)
     *
     * @param idAsignacion ID de la asignación
     * @return Entidad PacienteEstrategia
     * @throws IllegalArgumentException si no existe
     */
    PacienteEstrategia obtenerAsignacionRaw(Long idAsignacion);

    /**
     * Lista paginada de bajas del programa CENACRON con datos de auditoría.
     *
     * @param busqueda   Texto libre: busca en DNI o nombre del paciente
     * @param estado     Filtro por estado: INACTIVO | COMPLETADO | null = todos
     * @param fechaInicio Fecha mínima de baja (formato yyyy-MM-dd), puede ser null
     * @param fechaFin    Fecha máxima de baja (formato yyyy-MM-dd), puede ser null
     * @param page        Número de página (0-indexed)
     * @param size        Tamaño de página
     * @return Mapa con claves: bajas, total, totalPaginas, pagina
     */
    Map<String, Object> listarBajasCenacron(String busqueda, String estado,
                                             String fechaInicio, String fechaFin,
                                             int page, int size);
}

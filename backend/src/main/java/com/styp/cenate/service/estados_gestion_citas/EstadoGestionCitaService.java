package com.styp.cenate.service.estados_gestion_citas;

import com.styp.cenate.dto.EstadoGestionCitaResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * 📋 Servicio de Estados de Gestión de Citas - Interfaz
 * v1.33.0 - Contrato de servicios CRUD
 *
 * Define operaciones disponibles para gestión de estados de citas
 */
public interface EstadoGestionCitaService {

    /**
     * Obtiene todos los estados activos sin paginación
     *
     * @return Lista de estados activos ordenados
     */
    List<EstadoGestionCitaResponse> obtenerTodosEstadosActivos();

    /**
     * Obtiene un estado por su identificador
     *
     * @param idEstadoCita ID del estado
     * @return Estado encontrado
     * @throws RuntimeException si no existe
     */
    EstadoGestionCitaResponse obtenerEstadoPorId(Long idEstadoCita);

    /**
     * Obtiene un estado por su código
     *
     * @param codigo código del estado
     * @return Estado encontrado
     * @throws RuntimeException si no existe
     */
    EstadoGestionCitaResponse obtenerEstadoPorCodigo(String codigo);

    /**
     * Búsqueda paginada de estados con filtros
     *
     * @param busqueda término de búsqueda (opcional)
     * @param estado filtro por estado 'A' o 'I' (opcional)
     * @param pageable paginación
     * @return Página de resultados
     */
    Page<EstadoGestionCitaResponse> buscarEstados(String busqueda, String estado, Pageable pageable);

    /**
     * Crea un nuevo estado de cita
     *
     * @param request datos del nuevo estado
     * @return Estado creado
     * @throws RuntimeException si código ya existe
     */
    EstadoGestionCitaResponse crearEstado(EstadoGestionCitaRequest request);

    /**
     * Actualiza un estado existente
     *
     * @param idEstadoCita ID del estado a actualizar
     * @param request nuevos datos
     * @return Estado actualizado
     * @throws RuntimeException si no existe
     */
    EstadoGestionCitaResponse actualizarEstado(Long idEstadoCita, EstadoGestionCitaRequest request);

    /**
     * Cambia el estado de actividad de un registro
     *
     * @param idEstadoCita ID del estado
     * @param nuevoEstado 'A' para activo, 'I' para inactivo
     * @return Estado actualizado
     * @throws RuntimeException si no existe o estado inválido
     */
    EstadoGestionCitaResponse cambiarEstado(Long idEstadoCita, String nuevoEstado);

    /**
     * Elimina (inactiva) un estado
     *
     * @param idEstadoCita ID del estado a eliminar
     * @throws RuntimeException si no existe
     */
    void eliminarEstado(Long idEstadoCita);

    /**
     * Obtiene estadísticas del módulo
     *
     * @return Estadísticas (total, activos, inactivos)
     */
    EstadisticasEstadosDTO obtenerEstadisticas();

    /**
     * 📝 Record para crear/actualizar estados
     *
     * @param codEstadoCita código único del estado
     * @param descEstadoCita descripción del estado
     */
    record EstadoGestionCitaRequest(
        String codEstadoCita,
        String descEstadoCita
    ) {}

    /**
     * 📊 Record para estadísticas del módulo
     *
     * @param totalEstados total de estados (activos + inactivos)
     * @param estadosActivos cantidad de estados activos
     * @param estadosInactivos cantidad de estados inactivos
     */
    record EstadisticasEstadosDTO(
        Long totalEstados,
        Long estadosActivos,
        Long estadosInactivos
    ) {}
}

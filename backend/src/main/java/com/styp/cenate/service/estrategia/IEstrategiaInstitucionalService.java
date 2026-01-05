package com.styp.cenate.service.estrategia;

import com.styp.cenate.dto.EstrategiaInstitucionalDTO;

import java.util.List;

/**
 * Interfaz del servicio para gestionar Estrategias Institucionales
 *
 * @author Claude Code + Styp Canto Rondón
 * @version 2.0.0
 * @since 2026-01-03
 */
public interface IEstrategiaInstitucionalService {

    /**
     * Obtiene todas las estrategias institucionales
     *
     * @return Lista de todas las estrategias
     */
    List<EstrategiaInstitucionalDTO> obtenerTodas();

    /**
     * Obtiene solo las estrategias activas
     *
     * @return Lista de estrategias activas
     */
    List<EstrategiaInstitucionalDTO> obtenerActivas();

    /**
     * Obtiene una estrategia por su ID
     *
     * @param id ID de la estrategia
     * @return DTO de la estrategia encontrada
     * @throws com.styp.cenate.exception.ResourceNotFoundException si no se encuentra
     */
    EstrategiaInstitucionalDTO obtenerPorId(Long id);

    /**
     * Crea una nueva estrategia institucional
     *
     * @param dto DTO con los datos de la estrategia
     * @return DTO de la estrategia creada
     * @throws com.styp.cenate.exception.DuplicateResourceException si el código o sigla ya existe
     */
    EstrategiaInstitucionalDTO crear(EstrategiaInstitucionalDTO dto);

    /**
     * Actualiza una estrategia existente
     *
     * @param id ID de la estrategia a actualizar
     * @param dto DTO con los nuevos datos
     * @return DTO de la estrategia actualizada
     * @throws com.styp.cenate.exception.ResourceNotFoundException si no se encuentra
     * @throws com.styp.cenate.exception.DuplicateResourceException si el código o sigla ya existe
     */
    EstrategiaInstitucionalDTO actualizar(Long id, EstrategiaInstitucionalDTO dto);

    /**
     * Elimina una estrategia institucional
     *
     * @param id ID de la estrategia a eliminar
     * @throws com.styp.cenate.exception.ResourceNotFoundException si no se encuentra
     */
    void eliminar(Long id);

    /**
     * Activa una estrategia (cambia estado a 'A')
     *
     * @param id ID de la estrategia
     * @return DTO de la estrategia activada
     */
    EstrategiaInstitucionalDTO activar(Long id);

    /**
     * Inactiva una estrategia (cambia estado a 'I')
     *
     * @param id ID de la estrategia
     * @return DTO de la estrategia inactivada
     */
    EstrategiaInstitucionalDTO inactivar(Long id);
}

package com.styp.cenate.service.tipoatencion;

import com.styp.cenate.dto.TipoAtencionTelemedicinaDTO;

import java.util.List;

/**
 * Interfaz del servicio para gestionar Tipos de Atención en Telemedicina
 *
 * @author Claude Code + Styp Canto Rondón
 * @version 2.0.0
 * @since 2026-01-03
 */
public interface ITipoAtencionTelemedicinaService {

    /**
     * Obtiene todos los tipos de atención
     *
     * @return Lista de todos los tipos de atención
     */
    List<TipoAtencionTelemedicinaDTO> obtenerTodos();

    /**
     * Obtiene solo los tipos de atención activos
     *
     * @return Lista de tipos de atención activos
     */
    List<TipoAtencionTelemedicinaDTO> obtenerActivos();

    /**
     * Obtiene tipos de atención activos que requieren profesional
     *
     * @return Lista de tipos de atención que requieren profesional
     */
    List<TipoAtencionTelemedicinaDTO> obtenerActivosConProfesional();

    /**
     * Obtiene un tipo de atención por su ID
     *
     * @param id ID del tipo de atención
     * @return DTO del tipo de atención encontrado
     * @throws com.styp.cenate.exception.ResourceNotFoundException si no se encuentra
     */
    TipoAtencionTelemedicinaDTO obtenerPorId(Long id);

    /**
     * Crea un nuevo tipo de atención
     *
     * @param dto DTO con los datos del tipo de atención
     * @return DTO del tipo de atención creado
     * @throws com.styp.cenate.exception.DuplicateResourceException si el código ya existe
     */
    TipoAtencionTelemedicinaDTO crear(TipoAtencionTelemedicinaDTO dto);

    /**
     * Actualiza un tipo de atención existente
     *
     * @param id ID del tipo de atención a actualizar
     * @param dto DTO con los nuevos datos
     * @return DTO del tipo de atención actualizado
     * @throws com.styp.cenate.exception.ResourceNotFoundException si no se encuentra
     * @throws com.styp.cenate.exception.DuplicateResourceException si el código ya existe
     */
    TipoAtencionTelemedicinaDTO actualizar(Long id, TipoAtencionTelemedicinaDTO dto);

    /**
     * Elimina un tipo de atención
     *
     * @param id ID del tipo de atención a eliminar
     * @throws com.styp.cenate.exception.ResourceNotFoundException si no se encuentra
     */
    void eliminar(Long id);

    /**
     * Activa un tipo de atención (cambia estado a 'A')
     *
     * @param id ID del tipo de atención
     * @return DTO del tipo de atención activado
     */
    TipoAtencionTelemedicinaDTO activar(Long id);

    /**
     * Inactiva un tipo de atención (cambia estado a 'I')
     *
     * @param id ID del tipo de atención
     * @return DTO del tipo de atención inactivado
     */
    TipoAtencionTelemedicinaDTO inactivar(Long id);
}

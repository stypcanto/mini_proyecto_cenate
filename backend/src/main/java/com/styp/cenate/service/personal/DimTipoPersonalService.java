package com.styp.cenate.service.personal;

import java.util.List;
import com.styp.cenate.dto.DimTipoPersonalDTO;

/**
 * Servicio ampliado para DimTipoPersonal
 */
public interface DimTipoPersonalService {

    // ✅ MÉTODOS ORIGINALES:
    List<DimTipoPersonalDTO> listarTodos();
    List<DimTipoPersonalDTO> listarActivos();
    DimTipoPersonalDTO buscarPorId(Long idTipPers);
    DimTipoPersonalDTO crear(DimTipoPersonalDTO dto);
    DimTipoPersonalDTO actualizar(Long idTipPers, DimTipoPersonalDTO dto);
    void eliminar(Long idTipPers);

    // 🆕 MÉTODOS NUEVOS AGREGADOS:

    /**
     * Encuentra todos los tipos de personal (alias de listarTodos())
     */
    List<DimTipoPersonalDTO> findAll();

    /**
     * Encuentra todos los tipos activos (alias de listarActivos())
     */
    List<DimTipoPersonalDTO> findAllActivos();

    /**
     * Encuentra todos los tipos inactivos
     */
    List<DimTipoPersonalDTO> findAllInactivos();

    /**
     * Busca un tipo por ID (alias de buscarPorId())
     */
    DimTipoPersonalDTO findById(Long id);

    /**
     * Busca tipos por descripción (LIKE search)
     */
    List<DimTipoPersonalDTO> searchByDescripcion(String keyword);

    /**
     * Crea un nuevo tipo (usando CreateRequest)
     */
    DimTipoPersonalDTO create(DimTipoPersonalDTO.CreateRequest request);

    /**
     * Actualiza un tipo (usando UpdateRequest)
     */
    DimTipoPersonalDTO update(Long id, DimTipoPersonalDTO.UpdateRequest request);

    /**
     * Elimina un tipo
     */
    void delete(Long id);

    /**
     * Activa un tipo de personal
     */
    DimTipoPersonalDTO activar(Long id);

    /**
     * Inactiva un tipo de personal
     */
    DimTipoPersonalDTO inactivar(Long id);

    /**
     * Cuenta tipos por estado
     */
    long countByEstado(String estado);
}

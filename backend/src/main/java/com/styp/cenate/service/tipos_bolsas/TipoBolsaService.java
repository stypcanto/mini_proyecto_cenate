package com.styp.cenate.service.tipos_bolsas;

import com.styp.cenate.dto.TipoBolsaResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * 📋 Servicio de Tipos de Bolsas - Interfaz
 */
public interface TipoBolsaService {

    /**
     * Obtiene todos los tipos de bolsas activos
     */
    List<TipoBolsaResponse> obtenerTodosTiposBolsasActivos();

    /**
     * Obtiene un tipo de bolsa por ID
     */
    TipoBolsaResponse obtenerTipoBolsaPorId(Long idTipoBolsa);

    /**
     * Obtiene un tipo de bolsa por código
     */
    TipoBolsaResponse obtenerTipoBolsaPorCodigo(String codigo);

    /**
     * Búsqueda paginada con filtros
     */
    Page<TipoBolsaResponse> buscarTiposBolsas(String busqueda, String estado, Pageable pageable);

    /**
     * Crea un nuevo tipo de bolsa
     */
    TipoBolsaResponse crearTipoBolsa(TipoBolsaRequest request);

    /**
     * Actualiza un tipo de bolsa existente
     */
    TipoBolsaResponse actualizarTipoBolsa(Long idTipoBolsa, TipoBolsaRequest request);

    /**
     * Cambia el estado de un tipo de bolsa
     */
    TipoBolsaResponse cambiarEstadoTipoBolsa(Long idTipoBolsa, String nuevoEstado);

    /**
     * Elimina (inactiva) un tipo de bolsa
     */
    void eliminarTipoBolsa(Long idTipoBolsa);

    /**
     * Obtiene estadísticas de tipos de bolsas
     */
    EstadisticasTiposBolsasDTO obtenerEstadisticas();

    /**
     * DTO para crear/actualizar tipos de bolsas
     */
    record TipoBolsaRequest(
        String codTipoBolsa,
        String descTipoBolsa
    ) {}

    /**
     * DTO para estadísticas
     */
    record EstadisticasTiposBolsasDTO(
        Long totalTipos,
        Long tiposActivos,
        Long tiposInactivos
    ) {}
}

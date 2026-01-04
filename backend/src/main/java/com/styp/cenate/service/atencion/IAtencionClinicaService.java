package com.styp.cenate.service.atencion;

import com.styp.cenate.dto.AtencionClinicaCreateDTO;
import com.styp.cenate.dto.AtencionClinicaResponseDTO;
import com.styp.cenate.dto.AtencionClinicaUpdateDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Interfaz del servicio para gestionar atenciones clínicas
 *
 * @author Claude Code + Styp Canto Rondón
 * @version 2.0.0
 * @since 2026-01-03
 */
public interface IAtencionClinicaService {

    /**
     * Obtener todas las atenciones de un asegurado específico (paginado)
     *
     * @param pkAsegurado ID del asegurado
     * @param pageable    Objeto de paginación
     * @return Page de atenciones del asegurado
     */
    Page<AtencionClinicaResponseDTO> obtenerPorAsegurado(String pkAsegurado, Pageable pageable);

    /**
     * Obtener detalle completo de una atención específica
     *
     * @param id ID de la atención
     * @return DTO con detalle completo de la atención
     */
    AtencionClinicaResponseDTO obtenerPorId(Long id);

    /**
     * Obtener atenciones creadas por el profesional logueado (paginado)
     *
     * @param pageable Objeto de paginación
     * @return Page de atenciones creadas por el profesional
     */
    Page<AtencionClinicaResponseDTO> obtenerMisAtenciones(Pageable pageable);

    /**
     * Crear una nueva atención clínica
     *
     * @param dto Datos de la atención a crear
     * @return DTO de la atención creada
     */
    AtencionClinicaResponseDTO crear(AtencionClinicaCreateDTO dto);

    /**
     * Actualizar una atención clínica existente
     *
     * @param id  ID de la atención a actualizar
     * @param dto Datos actualizados
     * @return DTO de la atención actualizada
     */
    AtencionClinicaResponseDTO actualizar(Long id, AtencionClinicaUpdateDTO dto);

    /**
     * Eliminar una atención clínica
     *
     * @param id ID de la atención a eliminar
     */
    void eliminar(Long id);

    /**
     * Obtener estadísticas de atenciones de un asegurado
     *
     * @param pkAsegurado ID del asegurado
     * @return Map con estadísticas (total, última atención, etc.)
     */
    java.util.Map<String, Object> obtenerEstadisticasAsegurado(String pkAsegurado);

    /**
     * Obtener comparación de signos vitales con la atención anterior
     * Permite visualizar tendencias (mejorando/empeorando)
     *
     * @param idAtencion ID de la atención actual
     * @return DTO con comparación de signos vitales y tendencias
     */
    com.styp.cenate.dto.SignosVitalesComparativoDTO obtenerComparativoSignosVitales(Long idAtencion);
}

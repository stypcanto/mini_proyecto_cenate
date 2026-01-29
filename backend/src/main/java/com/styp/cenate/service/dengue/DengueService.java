package com.styp.cenate.service.dengue;

import com.styp.cenate.dto.dengue.DengueImportResultDTO;
import com.styp.cenate.model.bolsas.SolicitudBolsa;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

/**
 * Interface para servicio de Dengue
 *
 * @version 1.0.0
 * @since 2026-01-29
 */
public interface DengueService {

    /**
     * Carga archivo Excel con casos dengue
     * @param archivo MultipartFile con Excel
     * @param usuarioId ID del usuario que realiza la carga
     * @return DengueImportResultDTO con resultados
     */
    DengueImportResultDTO cargarExcelDengue(MultipartFile archivo, Long usuarioId);

    /**
     * Lista todos los casos dengue
     * @param pageable Información de paginación
     * @return Page con casos dengue
     */
    Page<SolicitudBolsa> listarCasosDengue(Pageable pageable);

    /**
     * Busca casos dengue con filtros
     * @param dni DNI del paciente (opcional)
     * @param dxMain Código CIE-10 (opcional)
     * @param pageable Información de paginación
     * @return Page con casos filtrados
     */
    Page<SolicitudBolsa> buscarCasosDengue(String dni, String dxMain, Pageable pageable);

    /**
     * Obtiene un caso específico
     * @param idSolicitud ID de la solicitud
     * @return SolicitudBolsa
     */
    SolicitudBolsa obtenerCasoDengue(Long idSolicitud);
}

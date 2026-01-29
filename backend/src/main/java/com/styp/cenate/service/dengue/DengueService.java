package com.styp.cenate.service.dengue;

import com.styp.cenate.dto.dengue.DengueImportResultDTO;
import com.styp.cenate.model.bolsas.SolicitudBolsa;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

/**
 * Interfaz de servicio para gestión del módulo Dengue
 *
 * Define operaciones para:
 * - Importación masiva de Excel (6,548 registros)
 * - Listado y búsqueda de casos Dengue
 * - Integración con:
 *   1. CIE-10 (validación de dx_main)
 *   2. IPRESS (lookup de IPRESS + Red)
 *   3. Asegurados (búsqueda/creación de pacientes)
 *   4. dim_solicitud_bolsa (almacenamiento final)
 *
 * @version 1.0.0
 * @since 2026-01-29
 */
public interface DengueService {

    /**
     * Carga un archivo Excel con casos de dengue
     *
     * Procesa 6,548 registros aplicando:
     * 1. Normalización de DNI (8 dígitos)
     * 2. Validación CIE-10 (A97.0/A97.1/A97.2)
     * 3. Lookup de IPRESS por cenasicod
     * 4. Búsqueda/creación en asegurados
     * 5. Deduplicación (DNI + fecha_atencion)
     *
     * @param archivo MultipartFile con Excel (.xlsx)
     * @param usuarioId ID del usuario que carga el archivo (para auditoría)
     * @return DengueImportResultDTO con estadísticas (insertados, actualizados, errores)
     * @throws IOException Si hay error leyendo el archivo
     * @throws RuntimeException Si hay error procesando registros
     */
    DengueImportResultDTO cargarExcelDengue(MultipartFile archivo, Long usuarioId);

    /**
     * Lista todos los casos de dengue con paginación
     *
     * @param pageable Información de paginación (page, size, sort)
     * @return Page con casos de dengue ordenados por fecha_solicitud DESC
     */
    Page<SolicitudBolsa> listarCasosDengue(Pageable pageable);

    /**
     * Busca casos de dengue con filtros opcionales
     *
     * @param dni DNI del paciente (opcional, búsqueda parcial)
     * @param dxMain Código CIE-10 (opcional, búsqueda exacta: A97.0, A97.1, A97.2)
     * @param pageable Información de paginación
     * @return Page con casos que coinciden con los filtros
     */
    Page<SolicitudBolsa> buscarCasosDengue(String dni, String dxMain, Pageable pageable);

    /**
     * Obtiene un caso específico por ID
     *
     * @param idSolicitud ID de la solicitud de bolsa
     * @return SolicitudBolsa con el caso dengue
     * @throws RuntimeException Si no existe el registro
     */
    SolicitudBolsa obtenerCasoDengue(Long idSolicitud);

}

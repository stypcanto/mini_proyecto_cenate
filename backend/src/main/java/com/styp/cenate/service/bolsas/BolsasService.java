package com.styp.cenate.service.bolsas;

import com.styp.cenate.dto.bolsas.BolsaDTO;
import com.styp.cenate.dto.bolsas.BolsaRequestDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * 📊 Servicio para gestión de Bolsas de Pacientes
 * v1.0.0 - Interface de servicio
 */
public interface BolsasService {

    // ========================================================================
    // 🔍 CONSULTAS
    // ========================================================================

    /**
     * Obtiene todas las bolsas activas
     */
    List<BolsaDTO> obtenerTodasLasBolsas();

    /**
     * Obtiene una bolsa por ID
     */
    BolsaDTO obtenerBolsaPorId(Long idBolsa);

    /**
     * Obtiene bolsas por especialidad
     */
    List<BolsaDTO> obtenerBolsasPorEspecialidad(Long especialidadId);

    /**
     * Obtiene bolsas por responsable
     */
    List<BolsaDTO> obtenerBolsasPorResponsable(Long responsableId);

    /**
     * Búsqueda paginada de bolsas con filtros
     */
    Page<BolsaDTO> buscarBolsas(String nombre, String estado, Pageable pageable);

    /**
     * Obtiene estadísticas generales de bolsas
     */
    BolsasEstadisticasDTO obtenerEstadisticas();

    // ========================================================================
    // ✏️ CREACIÓN Y ACTUALIZACIÓN
    // ========================================================================

    /**
     * Crea una nueva bolsa
     */
    BolsaDTO crearBolsa(BolsaRequestDTO request);

    /**
     * Actualiza una bolsa existente
     */
    BolsaDTO actualizarBolsa(Long idBolsa, BolsaRequestDTO request);

    /**
     * Cambia el estado de una bolsa
     */
    BolsaDTO cambiarEstadoBolsa(Long idBolsa, String nuevoEstado);

    // ========================================================================
    // 🗑️ ELIMINACIÓN
    // ========================================================================

    /**
     * Elimina una bolsa (soft delete)
     */
    void eliminarBolsa(Long idBolsa);

    // ========================================================================
    // 📊 PACIENTES EN BOLSA
    // ========================================================================

    /**
     * Añade pacientes a una bolsa
     */
    BolsaDTO agregarPacientesBolsa(Long idBolsa, List<Long> pacienteIds);

    /**
     * Asigna pacientes de una bolsa
     */
    BolsaDTO asignarPacientesBolsa(Long idBolsa, List<Long> pacienteIds);

    /**
     * Obtiene el porcentaje de asignación de una bolsa
     */
    Double obtenerPorcentajeAsignacion(Long idBolsa);

    // ========================================================================
    // 📥 IMPORTACIÓN DESDE EXCEL
    // ========================================================================

    /**
     * Importa bolsas desde archivo Excel
     */
    ImportacionResultadoDTO importarDesdeExcel(MultipartFile archivo, Long usuarioId, String usuarioNombre);

    /**
     * Obtiene historial de importaciones
     */
    List<ImportacionHistorialDTO> obtenerHistorialImportaciones();

    /**
     * Obtiene detalles de una importación específica
     */
    ImportacionHistorialDTO obtenerDetallesImportacion(Long idImportacion);

    // ========================================================================
    // 📋 DTO INTERNAS
    // ========================================================================

    /**
     * DTO para estadísticas
     */
    record BolsasEstadisticasDTO(
        Long totalBolsas,
        Long bolsasActivas,
        Long bolsasInactivas,
        Long totalPacientes,
        Long pacientesAsignados,
        Double porcentajeAsignacionPromedio,
        Long totalSolicitudes,
        Long solicitudesPendientes
    ) {}

    /**
     * DTO para resultados de importación
     */
    record ImportacionResultadoDTO(
        Long idImportacion,
        Integer totalRegistros,
        Integer registrosExitosos,
        Integer registrosFallidos,
        String estado,
        String mensaje
    ) {}

    /**
     * DTO para historial de importación
     */
    record ImportacionHistorialDTO(
        Long idImportacion,
        String nombreArchivo,
        Integer totalRegistros,
        Integer registrosExitosos,
        Integer registrosFallidos,
        String estado,
        String usuarioNombre,
        java.time.OffsetDateTime fechaImportacion
    ) {}
}

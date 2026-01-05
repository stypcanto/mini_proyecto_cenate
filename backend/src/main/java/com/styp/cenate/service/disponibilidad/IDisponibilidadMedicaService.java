package com.styp.cenate.service.disponibilidad;

import com.styp.cenate.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * Interfaz del servicio para gestionar disponibilidad médica.
 * Incluye métodos para CRUD, validaciones, sincronización con chatbot y reportes.
 *
 * @author Ing. Styp Canto Rondón
 * @version 2.0.0
 * @since 2026-01-03
 */
public interface IDisponibilidadMedicaService {

    // ==========================================================
    // 📝 CRUD Básico
    // ==========================================================

    /**
     * Crear nueva disponibilidad médica para un periodo
     *
     * @param request Datos de la disponibilidad a crear
     * @return DTO con la disponibilidad creada
     */
    DisponibilidadMedicaDTO crear(DisponibilidadRequestDTO request);

    /**
     * Actualizar disponibilidad existente (solo si está en BORRADOR)
     *
     * @param idDisponibilidad ID de la disponibilidad
     * @param request Datos actualizados
     * @return DTO con la disponibilidad actualizada
     */
    DisponibilidadMedicaDTO actualizar(Long idDisponibilidad, DisponibilidadRequestDTO request);

    /**
     * Obtener disponibilidad por ID con todos los detalles
     *
     * @param idDisponibilidad ID de la disponibilidad
     * @return DTO completo con detalles de turnos
     */
    DisponibilidadMedicaDTO obtenerPorId(Long idDisponibilidad);

    /**
     * Eliminar disponibilidad (solo si está en BORRADOR)
     *
     * @param idDisponibilidad ID de la disponibilidad
     */
    void eliminar(Long idDisponibilidad);

    // ==========================================================
    // 📋 Consultas y Listados
    // ==========================================================

    /**
     * Obtener disponibilidades del médico logueado
     *
     * @param pageable Paginación
     * @return Page de disponibilidades del médico
     */
    Page<DisponibilidadResponseDTO> obtenerMisDisponibilidades(Pageable pageable);

    /**
     * Obtener disponibilidades de un médico específico (para coordinadores)
     *
     * @param idPers ID del médico
     * @param pageable Paginación
     * @return Page de disponibilidades del médico
     */
    Page<DisponibilidadResponseDTO> obtenerPorMedico(Long idPers, Pageable pageable);

    /**
     * Obtener disponibilidades por periodo
     *
     * @param periodo Periodo en formato YYYYMM
     * @param pageable Paginación
     * @return Page de disponibilidades del periodo
     */
    Page<DisponibilidadResponseDTO> obtenerPorPeriodo(String periodo, Pageable pageable);

    /**
     * Obtener disponibilidades por estado
     *
     * @param estado Estado (BORRADOR, ENVIADO, REVISADO, SINCRONIZADO)
     * @param pageable Paginación
     * @return Page de disponibilidades con ese estado
     */
    Page<DisponibilidadResponseDTO> obtenerPorEstado(String estado, Pageable pageable);

    /**
     * Obtener disponibilidades por periodo y estado
     *
     * @param periodo Periodo en formato YYYYMM
     * @param estado Estado
     * @param pageable Paginación
     * @return Page de disponibilidades filtradas
     */
    Page<DisponibilidadResponseDTO> obtenerPorPeriodoYEstado(String periodo, String estado, Pageable pageable);

    // ==========================================================
    // 🔄 Flujo de Estados
    // ==========================================================

    /**
     * Enviar disponibilidad a revisión (BORRADOR → ENVIADO)
     * Valida que cumpla 150 horas mínimas
     *
     * @param idDisponibilidad ID de la disponibilidad
     * @return DTO actualizado
     */
    DisponibilidadMedicaDTO enviarARevision(Long idDisponibilidad);

    /**
     * Marcar disponibilidad como revisada (ENVIADO → REVISADO)
     * Solo para coordinadores
     *
     * @param idDisponibilidad ID de la disponibilidad
     * @param observaciones Observaciones del coordinador
     * @return DTO actualizado
     */
    DisponibilidadMedicaDTO marcarRevisado(Long idDisponibilidad, String observaciones);

    /**
     * Rechazar disponibilidad y regresar a BORRADOR
     * Solo para coordinadores
     *
     * @param idDisponibilidad ID de la disponibilidad
     * @param motivoRechazo Motivo del rechazo
     * @return DTO actualizado
     */
    DisponibilidadMedicaDTO rechazar(Long idDisponibilidad, String motivoRechazo);

    // ==========================================================
    // ⚙️ Ajustes de Coordinador
    // ==========================================================

    /**
     * Ajustar turnos de una disponibilidad (coordinador)
     * Permite cambiar tipos de turno y agregar observaciones
     *
     * @param ajusteDTO Datos de los ajustes
     * @return DTO actualizado
     */
    DisponibilidadMedicaDTO ajustarTurnos(AjusteDisponibilidadDTO ajusteDTO);

    // ==========================================================
    // 🔗 Sincronización con Chatbot
    // ==========================================================

    /**
     * Sincronizar disponibilidad con sistema de horarios chatbot
     * Crea/actualiza registros en ctr_horario y ctr_horario_det
     *
     * @param request Datos de sincronización
     * @return Respuesta con detalles de la sincronización
     */
    SincronizacionResponseDTO sincronizarConChatbot(SincronizacionRequestDTO request);

    /**
     * Validar consistencia entre disponibilidad y horarios chatbot
     * Compara horas declaradas vs horas cargadas
     *
     * @param idDisponibilidad ID de la disponibilidad
     * @return DTO con análisis de consistencia
     */
    ValidacionConsistenciaDTO validarConsistencia(Long idDisponibilidad);

    /**
     * Obtener disponibilidades pendientes de sincronización
     * Estado REVISADO sin id_ctr_horario_generado
     *
     * @return Lista de disponibilidades pendientes
     */
    List<DisponibilidadResponseDTO> obtenerPendientesSincronizacion();

    /**
     * Obtener disponibilidades con diferencias significativas vs chatbot
     * Diferencia > 10 horas entre declarado y cargado
     *
     * @return Lista de disponibilidades con discrepancias
     */
    List<ValidacionConsistenciaDTO> obtenerConDiferenciasSignificativas();

    // ==========================================================
    // 📊 Reportes y Estadísticas
    // ==========================================================

    /**
     * Obtener resumen estadístico de disponibilidad por periodo
     *
     * @param periodo Periodo en formato YYYYMM
     * @return Resumen con estadísticas completas
     */
    ResumenDisponibilidadDTO obtenerResumenPorPeriodo(String periodo);

    /**
     * Verificar si un médico ya tiene disponibilidad declarada
     *
     * @param idPers ID del médico
     * @param periodo Periodo
     * @param idServicio ID del servicio
     * @return true si ya existe, false si no
     */
    boolean existeDisponibilidad(Long idPers, String periodo, Long idServicio);

    /**
     * Calcular total de horas por periodo y servicio
     *
     * @param periodo Periodo
     * @param idServicio ID del servicio
     * @return Total de horas declaradas
     */
    java.math.BigDecimal calcularTotalHoras(String periodo, Long idServicio);
}

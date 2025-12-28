package com.styp.cenate.service.disponibilidad;

import com.styp.cenate.dto.*;

import java.util.List;
import java.util.Map;

/**
 * 🔧 Interfaz de servicio para la gestión de disponibilidad de turnos médicos.
 *
 * Define los métodos para:
 * - MÉDICO: Crear, actualizar, enviar y consultar sus disponibilidades
 * - COORDINADOR: Revisar, ajustar turnos y marcar como revisado
 * - UTILIDADES: Validar horas, calcular indicadores
 *
 * @author Ing. Styp Canto Rondon
 * @version 1.0.0
 * @since 2025-12-27
 */
public interface IDisponibilidadService {

    // ==========================================================
    // MÉTODOS PARA MÉDICO - CREAR Y ACTUALIZAR
    // ==========================================================

    /**
     * Crea una nueva disponibilidad médica.
     * Calcula automáticamente las horas según el régimen laboral del médico.
     *
     * @param request Datos de la disponibilidad
     * @return DisponibilidadResponse con la disponibilidad creada
     * @throws RuntimeException si ya existe una disponibilidad para ese periodo y especialidad
     */
    DisponibilidadResponse crear(DisponibilidadCreateRequest request);

    /**
     * Actualiza una disponibilidad existente.
     * Solo se puede actualizar si está en estado BORRADOR o ENVIADO.
     *
     * @param id ID de la disponibilidad
     * @param request Datos actualizados
     * @return DisponibilidadResponse con la disponibilidad actualizada
     * @throws RuntimeException si la disponibilidad no existe o no se puede editar
     */
    DisponibilidadResponse actualizar(Long id, DisponibilidadUpdateRequest request);

    /**
     * Guarda o actualiza un borrador de disponibilidad.
     * Si ya existe uno para el periodo y especialidad, lo actualiza.
     * Si no existe, lo crea.
     *
     * @param request Datos del borrador
     * @return DisponibilidadResponse con el borrador guardado
     */
    DisponibilidadResponse guardarBorrador(DisponibilidadCreateRequest request);

    // ==========================================================
    // MÉTODOS PARA MÉDICO - ENVIAR
    // ==========================================================

    /**
     * Envía una disponibilidad para revisión del coordinador.
     * Valida que cumpla con el mínimo de 150 horas.
     * Cambia el estado de BORRADOR a ENVIADO.
     *
     * @param id ID de la disponibilidad
     * @return DisponibilidadResponse con la disponibilidad enviada
     * @throws RuntimeException si no cumple el mínimo de horas o no está en estado BORRADOR
     */
    DisponibilidadResponse enviar(Long id);

    // ==========================================================
    // MÉTODOS PARA MÉDICO - CONSULTAS
    // ==========================================================

    /**
     * Lista todas las disponibilidades del médico autenticado.
     * Ordenadas por periodo descendente (más reciente primero).
     *
     * @return Lista de disponibilidades
     */
    List<DisponibilidadResponse> listarMisDisponibilidades();

    /**
     * Obtiene la disponibilidad del médico autenticado para un periodo y especialidad.
     *
     * @param periodo Periodo en formato YYYYMM
     * @param idEspecialidad ID de la especialidad
     * @return DisponibilidadResponse o null si no existe
     */
    DisponibilidadResponse obtenerMiDisponibilidad(String periodo, Long idEspecialidad);

    /**
     * Verifica si el médico autenticado ya tiene una disponibilidad para el periodo y especialidad.
     *
     * @param periodo Periodo en formato YYYYMM
     * @param idEspecialidad ID de la especialidad
     * @return true si existe, false en caso contrario
     */
    boolean existeMiDisponibilidad(String periodo, Long idEspecialidad);

    /**
     * Obtiene una disponibilidad por su ID.
     * Verifica que el usuario tenga permiso para verla.
     *
     * @param id ID de la disponibilidad
     * @return DisponibilidadResponse
     * @throws RuntimeException si no existe o no tiene permiso
     */
    DisponibilidadResponse obtenerPorId(Long id);

    // ==========================================================
    // MÉTODOS PARA COORDINADOR - CONSULTAS
    // ==========================================================

    /**
     * Lista todas las disponibilidades de un periodo.
     * Solo para COORDINADOR/ADMIN.
     *
     * @param periodo Periodo en formato YYYYMM
     * @return Lista de todas las disponibilidades del periodo
     */
    List<DisponibilidadResponse> listarPorPeriodo(String periodo);

    /**
     * Lista solo las disponibilidades ENVIADAS de un periodo.
     * Útil para que el coordinador revise las solicitudes pendientes.
     *
     * @param periodo Periodo en formato YYYYMM
     * @return Lista de disponibilidades enviadas
     */
    List<DisponibilidadResponse> listarEnviadasPorPeriodo(String periodo);

    /**
     * Lista las disponibilidades de una especialidad en un periodo.
     *
     * @param idEspecialidad ID de la especialidad
     * @param periodo Periodo en formato YYYYMM
     * @return Lista de disponibilidades
     */
    List<DisponibilidadResponse> listarPorEspecialidadYPeriodo(Long idEspecialidad, String periodo);

    // ==========================================================
    // MÉTODOS PARA COORDINADOR - REVISIÓN
    // ==========================================================

    /**
     * Marca una disponibilidad como REVISADO.
     * Solo el coordinador puede hacer esto.
     * Cambia el estado de ENVIADO a REVISADO.
     *
     * @param id ID de la disponibilidad
     * @return DisponibilidadResponse con la disponibilidad revisada
     * @throws RuntimeException si no está en estado ENVIADO
     */
    DisponibilidadResponse marcarRevisado(Long id);

    /**
     * Ajusta un turno específico de una disponibilidad.
     * Permite al coordinador cambiar el tipo de turno (M, T, MT).
     * Recalcula las horas y actualiza el total.
     *
     * @param idDisponibilidad ID de la disponibilidad
     * @param request Datos del ajuste (idDetalle, nuevoTurno, observación)
     * @return DisponibilidadResponse actualizada
     * @throws RuntimeException si el detalle no existe
     */
    DisponibilidadResponse ajustarTurno(Long idDisponibilidad, AjusteTurnoRequest request);

    // ==========================================================
    // MÉTODOS UTILITARIOS
    // ==========================================================

    /**
     * Valida y calcula las horas de una disponibilidad.
     * Recalcula el total sumando todas las horas de los detalles.
     *
     * @param id ID de la disponibilidad
     * @return Map con: totalHoras, horasRequeridas, cumpleMinimo, horasFaltantes
     */
    Map<String, Object> validarHoras(Long id);

    /**
     * Elimina una disponibilidad.
     * Solo se puede eliminar si está en estado BORRADOR.
     *
     * @param id ID de la disponibilidad
     * @throws RuntimeException si no está en BORRADOR o no tiene permiso
     */
    void eliminar(Long id);
}

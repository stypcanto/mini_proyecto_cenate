package com.styp.cenate.service.integracion;

import com.styp.cenate.dto.ComparativoDisponibilidadHorarioDTO;
import com.styp.cenate.dto.ResumenDisponibilidadPeriodoDTO;
import com.styp.cenate.dto.SincronizacionResultadoDTO;
import com.styp.cenate.model.SincronizacionHorarioLog;

import java.util.List;

/**
 * 🔄 Servicio de integración entre Disponibilidad Médica y Horarios Chatbot.
 *
 * Responsable de:
 * - Sincronizar disponibilidades REVISADAS a horarios chatbot
 * - Generar comparativos antes de sincronizar
 * - Registrar logs de sincronización
 * - Validar datos antes de crear/actualizar horarios
 *
 * FLUJO CRÍTICO:
 * 1. Coordinador revisa disponibilidad → Estado REVISADO
 * 2. Coordinador llama a sincronizarDisponibilidadAHorario()
 * 3. Sistema mapea turnos (M→158, T→131, MT→200A) según régimen
 * 4. Crea/actualiza ctr_horario + ctr_horario_det
 * 5. Marca disponibilidad como SINCRONIZADO
 * 6. Registra log en sincronizacion_horario_log
 *
 * IMPORTANTE:
 * - Solo disponibilidades en estado REVISADO pueden sincronizarse
 * - Cada disponibilidad genera UN horario por área
 * - El mapeo de turnos depende del régimen laboral (728/CAS/LOCADOR)
 *
 * @author Ing. Styp Canto Rondón
 * @version 1.0.0
 * @since 2026-01-03
 */
public interface IIntegracionHorarioService {

    /**
     * MÉTODO CRÍTICO: Sincroniza una disponibilidad a horario chatbot.
     *
     * Proceso de 8 pasos:
     * 1. Validar disponibilidad (debe estar REVISADO, no SINCRONIZADO)
     * 2. Validar área (debe existir y estar activa)
     * 3. Buscar/crear horario en ctr_horario
     * 4. Mapear turnos según régimen laboral:
     *    - M → 158 (728/CAS) o 158 (LOCADOR)
     *    - T → 131 (728/CAS) o 131 (LOCADOR)
     *    - MT → 200A (728/CAS) o 200A (LOCADOR)
     * 5. Crear detalles en ctr_horario_det
     * 6. Recalcular totales del horario
     * 7. Marcar disponibilidad como SINCRONIZADO
     * 8. Registrar log en sincronizacion_horario_log
     *
     * @param idDisponibilidad ID de la disponibilidad a sincronizar
     * @param idArea ID del área donde se cargará el horario
     * @return Resultado de la sincronización con estadísticas
     * @throws IllegalStateException Si disponibilidad no está REVISADO
     * @throws IllegalArgumentException Si área no existe o está inactiva
     */
    SincronizacionResultadoDTO sincronizarDisponibilidadAHorario(Long idDisponibilidad, Long idArea);

    /**
     * Obtiene comparativo entre disponibilidad y horario actual.
     *
     * Muestra al coordinador:
     * - Turnos que se agregarían
     * - Turnos que se modificarían
     * - Turnos que se eliminarían
     * - Totales de horas antes/después
     *
     * Útil para mostrar preview antes de sincronizar.
     *
     * @param idDisponibilidad ID de la disponibilidad
     * @param idArea ID del área
     * @return Comparativo con diferencias
     */
    ComparativoDisponibilidadHorarioDTO obtenerComparativo(Long idDisponibilidad, Long idArea);

    /**
     * Obtiene comparativos de todas las disponibilidades de un periodo.
     *
     * Genera un resumen de sincronización para todas las disponibilidades
     * del periodo especificado (formato YYYYMM, ej: 202601).
     *
     * Para cada disponibilidad retorna:
     * - Datos del médico y especialidad
     * - Horas declaradas vs horas sincronizadas al chatbot
     * - Estado de sincronización
     * - Indicador de inconsistencias
     * - Cantidad de slots generados
     *
     * @param periodo Periodo en formato YYYYMM (ej: "202601")
     * @return Lista de comparativos del periodo
     */
    List<ResumenDisponibilidadPeriodoDTO> obtenerComparativosPorPeriodo(String periodo);

    /**
     * Obtiene historial de sincronizaciones de una disponibilidad.
     *
     * @param idDisponibilidad ID de la disponibilidad
     * @return Lista de logs de sincronización (ordenados por fecha desc)
     */
    List<SincronizacionHorarioLog> obtenerHistorialSincronizacion(Long idDisponibilidad);

    /**
     * Valida si una disponibilidad puede sincronizarse.
     *
     * Verifica:
     * - Estado REVISADO
     * - No esté ya SINCRONIZADO
     * - Tenga detalles (al menos 1 día)
     * - Personal existe y está activo
     * - Régimen laboral existe
     *
     * @param idDisponibilidad ID de la disponibilidad
     * @return true si puede sincronizarse, false si no
     */
    boolean puedeRealizarSincronizacion(Long idDisponibilidad);

    /**
     * Resincroniza una disponibilidad (fuerza actualización).
     *
     * Útil cuando:
     * - Se modificó la disponibilidad después de sincronizar
     * - Se detectaron errores en la sincronización anterior
     * - Se cambió el área de destino
     *
     * IMPORTANTE: Elimina horario anterior y crea uno nuevo.
     *
     * @param idDisponibilidad ID de la disponibilidad
     * @param idArea ID del área (puede ser diferente a la anterior)
     * @return Resultado de la resincronización
     */
    SincronizacionResultadoDTO resincronizarDisponibilidad(Long idDisponibilidad, Long idArea);
}

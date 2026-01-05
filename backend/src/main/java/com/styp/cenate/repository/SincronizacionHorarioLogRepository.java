package com.styp.cenate.repository;

import com.styp.cenate.model.DisponibilidadMedica;
import com.styp.cenate.model.SincronizacionHorarioLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 📝 Repositorio para logs de sincronización disponibilidad → horario.
 * Tabla: sincronizacion_horario_log
 *
 * Proporciona auditoría completa de:
 * - Qué disponibilidades se sincronizaron
 * - Cuándo se sincronizaron
 * - Quién las sincronizó
 * - Resultado (EXITOSO/FALLIDO/PARCIAL)
 * - Detalles en formato JSON
 *
 * @author Ing. Styp Canto Rondón
 * @version 1.0.0
 * @since 2026-01-03
 */
@Repository
public interface SincronizacionHorarioLogRepository extends JpaRepository<SincronizacionHorarioLog, Long> {

    /**
     * Busca historial de sincronizaciones de una disponibilidad.
     * Ordenado por fecha descendente (más recientes primero).
     *
     * @param disponibilidad Disponibilidad a buscar
     * @return Lista de logs de sincronización
     */
    List<SincronizacionHorarioLog> findByDisponibilidadOrderByFechaSincronizacionDesc(
        DisponibilidadMedica disponibilidad
    );

    /**
     * Busca logs por resultado.
     *
     * @param resultado EXITOSO, FALLIDO, PARCIAL
     * @return Lista de logs con ese resultado
     */
    List<SincronizacionHorarioLog> findByResultadoOrderByFechaSincronizacionDesc(String resultado);

    /**
     * Busca logs por tipo de operación.
     *
     * @param tipoOperacion CREACION, ACTUALIZACION
     * @return Lista de logs de ese tipo
     */
    List<SincronizacionHorarioLog> findByTipoOperacionOrderByFechaSincronizacionDesc(String tipoOperacion);

    /**
     * Cuenta sincronizaciones exitosas de una disponibilidad.
     *
     * @param disponibilidad Disponibilidad a buscar
     * @return Cantidad de sincronizaciones exitosas
     */
    long countByDisponibilidadAndResultado(DisponibilidadMedica disponibilidad, String resultado);
}

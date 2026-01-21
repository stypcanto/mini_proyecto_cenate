package com.styp.cenate.repository;

import com.styp.cenate.model.TeleECGImagen;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository para gestión de imágenes ECG (TeleEKG)
 *
 * Proporciona métodos para:
 * - Búsquedas eficientes por DNI, estado, IPRESS
 * - Paginación para listados
 * - Limpieza automática de datos vencidos
 * - Estadísticas y reportes
 *
 * @author Styp Canto Rondón
 * @version 1.0.0
 * @since 2026-01-13
 */
@Repository
public interface TeleECGImagenRepository extends JpaRepository<TeleECGImagen, Long> {

    /**
     * Busca todas las imágenes de un paciente por su DNI
     * Útil para: historial médico del paciente
     */
    List<TeleECGImagen> findByNumDocPacienteAndStatImagenEquals(
        String numDocPaciente,
        String statImagen
    );

    /**
     * Busca imagen por DNI y está activa (no vencida)
     * Orden de fecha más reciente primero
     */
    List<TeleECGImagen> findByNumDocPacienteAndStatImagenOrderByFechaEnvioDesc(
        String numDocPaciente,
        String statImagen
    );

    /**
     * Busca todas las imágenes en estado PENDIENTE (sin procesar)
     * Usado por: Personal CENATE para ver trabajo pendiente
     */
    Page<TeleECGImagen> findByEstadoAndStatImagenEquals(
        String estado,
        String statImagen,
        Pageable pageable
    );

    /**
     * Busca imágenes por estado específico
     * Estados: PENDIENTE, PROCESADA, RECHAZADA, VINCULADA
     */
    Page<TeleECGImagen> findByEstadoOrderByFechaEnvioDesc(
        String estado,
        Pageable pageable
    );

    /**
     * Búsqueda combinada: DNI + Estado
     * La más usada (optimizada con índice compuesto)
     */
    Page<TeleECGImagen> findByNumDocPacienteAndEstadoAndStatImagenOrderByFechaEnvioDesc(
        String numDocPaciente,
        String estado,
        String statImagen,
        Pageable pageable
    );

    /**
     * Imágenes de una IPRESS específica
     * Usado por: reportes por institución
     */
    @Query("""
        SELECT t FROM TeleECGImagen t
        WHERE t.ipressOrigen.idIpress = :idIpress
          AND t.statImagen = :statImagen
        ORDER BY t.fechaEnvio DESC
        """)
    Page<TeleECGImagen> findByIpressOrigenIdAndStatImagenOrderByFechaEnvioDesc(
        @Param("idIpress") Long idIpress,
        @Param("statImagen") String statImagen,
        Pageable pageable
    );

    /**
     * Imágenes vencidas (próximas a vencer o ya vencidas)
     * Para: alertas y limpieza automática
     */
    List<TeleECGImagen> findByStatImagenAndFechaExpiracionBefore(
        String statImagen,
        LocalDateTime fechaExpiracion
    );

    /**
     * Imágenes próximas a vencer (< 3 días)
     * Para: notificaciones al personal
     */
    @Query("""
        SELECT t FROM TeleECGImagen t
        WHERE t.statImagen = 'A'
          AND t.fechaExpiracion BETWEEN CURRENT_TIMESTAMP AND CURRENT_TIMESTAMP + 3 DAY
        ORDER BY t.fechaExpiracion ASC
        """)
    List<TeleECGImagen> findProximasVencer();

    /**
     * Cuenta imágenes por estado
     * Útil para: estadísticas en dashboard
     */
    Long countByEstadoAndStatImagenEquals(String estado, String statImagen);

    /**
     * Cuenta imágenes totales activas por IPRESS
     */
    @Query("""
        SELECT COUNT(t) FROM TeleECGImagen t
        WHERE t.ipressOrigen.idIpress = :idIpress
          AND t.statImagen = :statImagen
        """)
    Long countByIpressOrigenIdAndStatImagenEquals(
        @Param("idIpress") Long idIpress,
        @Param("statImagen") String statImagen
    );

    /**
     * LIMPIEZA AUTOMÁTICA: Marca imágenes como inactivas si pasaron 30 días
     * Ejecutada automáticamente cada 2am por el scheduler
     * @param statImagen debe ser 'A' (activo)
     * @param fecha límite de expiración
     */
    @Modifying
    @Transactional
    @Query("""
        UPDATE TeleECGImagen t
        SET t.statImagen = 'I'
        WHERE t.statImagen = :statImagen
          AND t.fechaExpiracion < :fechaLimite
        """)
    int marcarComoInactivas(
        @Param("statImagen") String statImagen,
        @Param("fechaLimite") LocalDateTime fechaLimite
    );

    /**
     * Obtiene estadísticas de imágenes por IPRESS
     * Retorna: [id_ipress, nombre_ipress, total_imagenes, pendientes, procesadas, rechazadas]
     */
    @Query("""
        SELECT
            t.ipressOrigen.idIpress,
            t.nombreIpress,
            COUNT(t),
            SUM(CASE WHEN t.estado = 'PENDIENTE' THEN 1 ELSE 0 END),
            SUM(CASE WHEN t.estado = 'PROCESADA' THEN 1 ELSE 0 END),
            SUM(CASE WHEN t.estado = 'RECHAZADA' THEN 1 ELSE 0 END)
        FROM TeleECGImagen t
        WHERE t.statImagen = 'A'
        GROUP BY t.ipressOrigen.idIpress, t.nombreIpress
        ORDER BY COUNT(t) DESC
        """)
    List<Object[]> getEstadisticasPorIpress();

    /**
     * Obtiene volumen de datos por IPRESS (en MB)
     */
    @Query("""
        SELECT
            t.nombreIpress,
            SUM(t.sizeBytes) / 1024 / 1024
        FROM TeleECGImagen t
        WHERE t.statImagen = 'A'
        GROUP BY t.nombreIpress
        ORDER BY SUM(t.sizeBytes) DESC
        """)
    List<Object[]> getVolumenPorIpress();

    /**
     * Tasa de rechazo por IPRESS (%)
     */
    @Query("""
        SELECT
            t.nombreIpress,
            ROUND(100.0 * SUM(CASE WHEN t.estado = 'RECHAZADA' THEN 1 ELSE 0 END) / COUNT(t), 2)
        FROM TeleECGImagen t
        WHERE t.statImagen = 'A'
        GROUP BY t.nombreIpress
        HAVING COUNT(t) > 0
        ORDER BY ROUND(100.0 * SUM(CASE WHEN t.estado = 'RECHAZADA' THEN 1 ELSE 0 END) / COUNT(t), 2) DESC
        """)
    List<Object[]> getTasaRechazo();

    /**
     * Imágenes sin procesar desde hace más de X horas
     * Usado para: alertas de retraso
     */
    @Query("""
        SELECT t FROM TeleECGImagen t
        WHERE t.estado = 'PENDIENTE'
          AND t.fechaEnvio < :hace_x_horas
          AND t.statImagen = 'A'
        ORDER BY t.fechaEnvio ASC
        """)
    List<TeleECGImagen> findPendientesAtrasadas(@Param("hace_x_horas") LocalDateTime horaLimite);

    /**
     * Búsqueda flexible con múltiples filtros
     * Usado por: filtrados avanzados en frontend
     * ✅ FIX T-ECG-002: Agregado filtro fecha_expiracion >= CURRENT_TIMESTAMP
     *    Evita que ECGs vencidas aparezcan en los resultados de búsqueda
     */
    @Query("""
        SELECT t FROM TeleECGImagen t
        WHERE (:numDoc IS NULL OR t.numDocPaciente LIKE %:numDoc%)
          AND (:estado IS NULL OR t.estado = :estado)
          AND (:idIpress IS NULL OR t.ipressOrigen.idIpress = :idIpress)
          AND t.statImagen = 'A'
          AND t.fechaEnvio >= :fechaDesde
          AND t.fechaEnvio <= :fechaHasta
          AND t.fechaExpiracion >= CURRENT_TIMESTAMP
        ORDER BY t.fechaEnvio DESC
        """)
    Page<TeleECGImagen> buscarFlexible(
        @Param("numDoc") String numDoc,
        @Param("estado") String estado,
        @Param("idIpress") Long idIpress,
        @Param("fechaDesde") LocalDateTime fechaDesde,
        @Param("fechaHasta") LocalDateTime fechaHasta,
        Pageable pageable
    );

    /**
     * Obtiene resumen diario de carga de imágenes
     */
    @Query("""
        SELECT
            CAST(t.fechaEnvio AS DATE),
            COUNT(t),
            SUM(t.sizeBytes) / 1024 / 1024
        FROM TeleECGImagen t
        WHERE t.statImagen = 'A'
          AND t.fechaEnvio >= :desde
        GROUP BY CAST(t.fechaEnvio AS DATE)
        ORDER BY CAST(t.fechaEnvio AS DATE) DESC
        """)
    List<Object[]> getResumenDiario(@Param("desde") LocalDateTime desde);

    /**
     * Obtiene imágenes procesadas para calcular tiempo promedio en Java
     * (EXTRACT(EPOCH) no está soportado en Hibernate JPA)
     */
    @Query("""
        SELECT t FROM TeleECGImagen t
        WHERE t.estado = 'PROCESADA'
          AND t.fechaRecepcion IS NOT NULL
          AND t.fechaEnvio IS NOT NULL
        ORDER BY t.fechaRecepcion DESC
        """)
    List<TeleECGImagen> findProcessedWithTimestamps();

    /**
     * Busca imagen por hash SHA256 (para detectar duplicados)
     */
    Optional<TeleECGImagen> findBySha256AndStatImagenEquals(String sha256, String statImagen);

    /**
     * Verifica si existe una imagen con el mismo DNI y hash en los últimos X minutos
     * (para evitar carga duplicada)
     */
    @Query("""
        SELECT COUNT(t) FROM TeleECGImagen t
        WHERE t.numDocPaciente = :numDoc
          AND t.sha256 = :sha256
          AND t.fechaEnvio > :hace_x_minutos
          AND t.statImagen = 'A'
        """)
    Long contarDuplicados(
        @Param("numDoc") String numDoc,
        @Param("sha256") String sha256,
        @Param("hace_x_minutos") LocalDateTime hacexMinutos
    );

    /**
     * ✅ FIX T-ECG-001: Obtener total de imágenes ACTIVAS y NO VENCIDAS
     * Agregado: Filtro fecha_expiracion >= CURRENT_TIMESTAMP
     * Evita contar ECGs que ya pasaron su periodo de 30 días
     */
    @Query("""
        SELECT COUNT(t) FROM TeleECGImagen t
        WHERE t.statImagen = 'A'
          AND t.fechaExpiracion >= CURRENT_TIMESTAMP
        """)
    Long countTotalActivas();

    /**
     * ✅ FIX T-ECG-001: Contar imágenes por estado (ACTIVAS + NO VENCIDAS)
     */
    @Query("""
        SELECT COUNT(t) FROM TeleECGImagen t
        WHERE t.estado = :estado
          AND t.statImagen = 'A'
          AND t.fechaExpiracion >= CURRENT_TIMESTAMP
        """)
    Long countByEstadoActivas(@Param("estado") String estado);

    /**
     * ✅ FIX T-ECG-001 (v1.21.5): Obtener todas las estadísticas en una sola query
     * Retorna: [total, pendientes (ENVIADA), observadas (OBSERVADA), atendidas (ATENDIDA)]
     * Actualizado para usar los estados correctos de v3.0.0: ENVIADA, OBSERVADA, ATENDIDA
     * Usando nativeQuery=true para SQL nativo (PostgreSQL)
     *
     * IMPORTANTE: Los CAST deben ser CAST(x AS INTEGER) para que Spring los interprete como números
     */
    @Query(value = """
        SELECT
            CAST(COUNT(*) AS INTEGER),
            CAST(COALESCE(SUM(CASE WHEN estado = 'ENVIADA' THEN 1 ELSE 0 END), 0) AS INTEGER),
            CAST(COALESCE(SUM(CASE WHEN estado = 'OBSERVADA' THEN 1 ELSE 0 END), 0) AS INTEGER),
            CAST(COALESCE(SUM(CASE WHEN estado = 'ATENDIDA' THEN 1 ELSE 0 END), 0) AS INTEGER)
        FROM tele_ecg_imagenes
        WHERE stat_imagen = 'A'
          AND fecha_expiracion >= CURRENT_TIMESTAMP
        """, nativeQuery = true)
    Object[] getEstadisticasCompletas();

    /**
     * Búsqueda flexible sin paginación (v1.21.5)
     * Retorna todas las imágenes que coincidan con los filtros
     * Usado para agrupar ECGs por asegurado sin límite de resultados
     */
    @Query("""
        SELECT t FROM TeleECGImagen t
        WHERE (:numDoc IS NULL OR t.numDocPaciente LIKE %:numDoc%)
          AND (:estado IS NULL OR t.estado = :estado)
          AND (:idIpress IS NULL OR t.ipressOrigen.idIpress = :idIpress)
          AND t.statImagen = 'A'
          AND t.fechaEnvio >= :fechaDesde
          AND t.fechaEnvio <= :fechaHasta
          AND t.fechaExpiracion >= CURRENT_TIMESTAMP
        ORDER BY t.fechaEnvio DESC
        """)
    List<TeleECGImagen> buscarFlexibleSinPaginacion(
        @Param("numDoc") String numDoc,
        @Param("estado") String estado,
        @Param("idIpress") Long idIpress,
        @Param("fechaDesde") LocalDateTime fechaDesde,
        @Param("fechaHasta") LocalDateTime fechaHasta
    );
}

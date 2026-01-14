package com.styp.cenate.repository;

import com.styp.cenate.model.TeleECGAuditoria;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository para auditoría de accesos y cambios en ECGs
 *
 * Registra TODAS las acciones realizadas sobre imágenes ECG:
 * - Quién, cuándo, qué, desde dónde
 * - Cumple requisitos de auditoría corporativa de EsSalud
 * - Retención mínima: 3 años
 *
 * @author Styp Canto Rondón
 * @version 1.0.0
 * @since 2026-01-13
 */
@Repository
public interface TeleECGAuditoriaRepository extends JpaRepository<TeleECGAuditoria, Long> {

    /**
     * Obtiene el historial de accesos de una imagen ECG
     * Ordenado por fecha descendente (más reciente primero)
     */
    List<TeleECGAuditoria> findByImagenIdImagenOrderByFechaAccionDesc(Long idImagen);

    /**
     * Obtiene el historial con paginación
     */
    Page<TeleECGAuditoria> findByImagenIdImagenOrderByFechaAccionDesc(
        Long idImagen,
        Pageable pageable
    );

    /**
     * Obtiene todas las acciones de un usuario
     */
    @Query("""
        SELECT a FROM TeleECGAuditoria a
        WHERE a.usuario.idUser = :idUsuario
        ORDER BY a.fechaAccion DESC
        """)
    Page<TeleECGAuditoria> findByUsuarioIdOrderByFechaAccionDesc(
        @Param("idUsuario") Long idUsuario,
        Pageable pageable
    );

    /**
     * Obtiene acciones de un usuario en un rango de fechas
     */
    @Query("""
        SELECT a FROM TeleECGAuditoria a
        WHERE a.usuario.idUser = :idUsuario
          AND a.fechaAccion BETWEEN :fechaInicio AND :fechaFin
        ORDER BY a.fechaAccion DESC
        """)
    List<TeleECGAuditoria> findByUsuarioIdAndFechaAccionBetweenOrderByFechaAccionDesc(
        @Param("idUsuario") Long idUsuario,
        @Param("fechaInicio") LocalDateTime fechaInicio,
        @Param("fechaFin") LocalDateTime fechaFin
    );

    /**
     * Obtiene todas las acciones de un tipo específico
     * Ej: todas las descargas, todos los rechazos
     */
    Page<TeleECGAuditoria> findByAccionOrderByFechaAccionDesc(
        String accion,
        Pageable pageable
    );

    /**
     * Obtiene acciones fallidas (para análisis de errores)
     */
    List<TeleECGAuditoria> findByResultadoOrderByFechaAccionDesc(String resultado);

    /**
     * Obtiene acciones "SOSPECHOSAS" (intentos maliciosos detectados)
     */
    List<TeleECGAuditoria> findByResultadoAndFechaAccionAfterOrderByFechaAccionDesc(
        String resultado,
        LocalDateTime desde
    );

    /**
     * Obtiene acciones desde una IP específica
     * Útil para: análisis de accesos desde ubicaciones específicas
     */
    List<TeleECGAuditoria> findByIpUsuarioOrderByFechaAccionDesc(String ipUsuario);

    /**
     * Cuenta accesos a una imagen específica
     */
    Long countByImagenIdImagen(Long idImagen);

    /**
     * Cuenta acciones de un usuario en un período
     */
    @Query("""
        SELECT COUNT(a) FROM TeleECGAuditoria a
        WHERE a.usuario.idUser = :idUsuario
          AND a.fechaAccion BETWEEN :inicio AND :fin
        """)
    Long countByUsuarioIdAndFechaAccionBetween(
        @Param("idUsuario") Long idUsuario,
        @Param("inicio") LocalDateTime inicio,
        @Param("fin") LocalDateTime fin
    );

    /**
     * Obtiene usuarios más activos (más acciones)
     * Retorna: [id_usuario, nombre_usuario, cantidad_acciones]
     */
    @Query("""
        SELECT a.usuario.idUser, a.nombreUsuario, COUNT(a)
        FROM TeleECGAuditoria a
        WHERE a.fechaAccion >= :desde
        GROUP BY a.usuario.idUser, a.nombreUsuario
        ORDER BY COUNT(a) DESC
        LIMIT 10
        """)
    List<Object[]> getUsuariosMasActivos(@Param("desde") LocalDateTime desde);

    /**
     * Obtiene tipos de acciones más frecuentes
     * Retorna: [accion, cantidad]
     */
    @Query("""
        SELECT a.accion, COUNT(a)
        FROM TeleECGAuditoria a
        WHERE a.fechaAccion >= :desde
        GROUP BY a.accion
        ORDER BY COUNT(a) DESC
        """)
    List<Object[]> getAccionesMasFrecuentes(@Param("desde") LocalDateTime desde);

    /**
     * Obtiene distribución de acciones por rol
     * Retorna: [rol, cantidad]
     */
    @Query("""
        SELECT a.rolUsuario, COUNT(a)
        FROM TeleECGAuditoria a
        WHERE a.fechaAccion >= :desde
        GROUP BY a.rolUsuario
        ORDER BY COUNT(a) DESC
        """)
    List<Object[]> getAccionesPorRol(@Param("desde") LocalDateTime desde);

    /**
     * Obtiene actividad por hora (para análisis de patrones)
     * Retorna: [hora, cantidad]
     */
    @Query("""
        SELECT
            EXTRACT(HOUR FROM a.fechaAccion),
            COUNT(a)
        FROM TeleECGAuditoria a
        WHERE a.fechaAccion >= :desde
        GROUP BY EXTRACT(HOUR FROM a.fechaAccion)
        ORDER BY EXTRACT(HOUR FROM a.fechaAccion) ASC
        """)
    List<Object[]> getActividadPorHora(@Param("desde") LocalDateTime desde);

    /**
     * Detecta posibles intentos de acceso no autorizado
     * Búsqueda de patrones sospechosos (múltiples fallos en corto tiempo)
     */
    @Query("""
        SELECT a.usuario.idUser, a.nombreUsuario, COUNT(a)
        FROM TeleECGAuditoria a
        WHERE a.resultado = 'FALLIDA'
          AND a.fechaAccion >= :hace_una_hora
        GROUP BY a.usuario.idUser, a.nombreUsuario
        HAVING COUNT(a) >= 5
        ORDER BY COUNT(a) DESC
        """)
    List<Object[]> detectarIntentosNoAutorizados(@Param("hace_una_hora") LocalDateTime hace1h);

    /**
     * Obtiene accesos desde múltiples IPs por el mismo usuario
     * (para detectar accesos concurrentes de ubicaciones distintas)
     */
    @Query("""
        SELECT a.usuario.idUser, a.nombreUsuario, COUNT(DISTINCT a.ipUsuario), COUNT(a)
        FROM TeleECGAuditoria a
        WHERE a.fechaAccion >= :desde
        GROUP BY a.usuario.idUser, a.nombreUsuario
        HAVING COUNT(DISTINCT a.ipUsuario) > 1
        ORDER BY COUNT(DISTINCT a.ipUsuario) DESC
        """)
    List<Object[]> getAccesosDesdeMultiplesIPs(@Param("desde") LocalDateTime desde);

    /**
     * Obtiene historial de un usuario para un período específico
     * Usado por: reportes de auditoría ejecutivos
     */
    @Query("""
        SELECT a FROM TeleECGAuditoria a
        WHERE a.usuario.idUser = :idUsuario
          AND a.fechaAccion BETWEEN :inicio AND :fin
        ORDER BY a.fechaAccion DESC
        """)
    List<TeleECGAuditoria> getHistorialUsuario(
        @Param("idUsuario") Long idUsuario,
        @Param("inicio") LocalDateTime inicio,
        @Param("fin") LocalDateTime fin
    );

    /**
     * Obtiene todas las acciones de un código de error
     * Útil para: debugging y análisis de problemas
     */
    List<TeleECGAuditoria> findByCodigoErrorOrderByFechaAccionDesc(String codigoError);

    /**
     * Resumen diario de actividad
     * Retorna: [fecha, total_acciones, total_usuarios]
     */
    @Query("""
        SELECT
            CAST(a.fechaAccion AS DATE),
            COUNT(a),
            COUNT(DISTINCT a.usuario.idUser)
        FROM TeleECGAuditoria a
        WHERE a.fechaAccion >= :desde
        GROUP BY CAST(a.fechaAccion AS DATE)
        ORDER BY CAST(a.fechaAccion AS DATE) DESC
        """)
    List<Object[]> getResumenDiario(@Param("desde") LocalDateTime desde);

    /**
     * Busca accesos desde una IP y usuario específicos
     * Para: análisis detallado de sesiones sospechosas
     */
    @Query("""
        SELECT a FROM TeleECGAuditoria a
        WHERE a.usuario.idUser = :idUsuario
          AND a.ipUsuario = :ipUsuario
        ORDER BY a.fechaAccion DESC
        """)
    List<TeleECGAuditoria> findByUsuarioIdAndIpUsuarioOrderByFechaAccionDesc(
        @Param("idUsuario") Long idUsuario,
        @Param("ipUsuario") String ipUsuario
    );

    /**
     * Acciones más recientes de una imagen (últimas N acciones)
     */
    @Query("""
        SELECT a FROM TeleECGAuditoria a
        WHERE a.imagen.idImagen = :idImagen
        ORDER BY a.fechaAccion DESC
        LIMIT :limite
        """)
    List<TeleECGAuditoria> getUltimasAcciones(
        @Param("idImagen") Long idImagen,
        @Param("limite") int limite
    );

    /**
     * Búsqueda avanzada con múltiples filtros
     */
    @Query("""
        SELECT a FROM TeleECGAuditoria a
        WHERE (:idImagen IS NULL OR a.imagen.idImagen = :idImagen)
          AND (:idUsuario IS NULL OR a.usuario.idUser = :idUsuario)
          AND (:accion IS NULL OR a.accion = :accion)
          AND (:resultado IS NULL OR a.resultado = :resultado)
          AND a.fechaAccion BETWEEN :inicio AND :fin
        ORDER BY a.fechaAccion DESC
        """)
    Page<TeleECGAuditoria> buscarAvanzado(
        @Param("idImagen") Long idImagen,
        @Param("idUsuario") Long idUsuario,
        @Param("accion") String accion,
        @Param("resultado") String resultado,
        @Param("inicio") LocalDateTime inicio,
        @Param("fin") LocalDateTime fin,
        Pageable pageable
    );
}

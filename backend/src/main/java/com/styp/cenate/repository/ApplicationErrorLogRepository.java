package com.styp.cenate.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.styp.cenate.model.ApplicationErrorLog;

import java.time.OffsetDateTime;
import java.util.List;

/**
 * Repositorio para ApplicationErrorLog
 * Tabla: application_error_log
 * 
 * Repositorio de solo lectura/inserción para logs de errores.
 * NO incluye métodos de actualización masiva ni eliminación.
 */
@Repository
public interface ApplicationErrorLogRepository extends JpaRepository<ApplicationErrorLog, Long> {

    /**
     * Busca errores por categoría
     */
    List<ApplicationErrorLog> findByErrorCategoryOrderByCreatedAtDesc(String errorCategory);

    /**
     * Busca errores no resueltos
     */
    List<ApplicationErrorLog> findByResolvedFalseOrderByCreatedAtDesc();

    /**
     * Busca errores por usuario (por ID)
     */
    List<ApplicationErrorLog> findByUserIdOrderByCreatedAtDesc(Long userId);

    /**
     * Busca errores por rango de fechas
     */
    List<ApplicationErrorLog> findByCreatedAtBetweenOrderByCreatedAtDesc(
        OffsetDateTime startDate,
        OffsetDateTime endDate
    );

    /**
     * Busca errores por endpoint
     */
    List<ApplicationErrorLog> findByEndpointContainingIgnoreCaseOrderByCreatedAtDesc(String endpoint);

    /**
     * Busca errores por código de error
     */
    List<ApplicationErrorLog> findByErrorCodeOrderByCreatedAtDesc(String errorCode);

    /**
     * Busca errores por nombre de tabla (errores de BD)
     */
    List<ApplicationErrorLog> findByTableNameOrderByCreatedAtDesc(String tableName);

    /**
     * Cuenta errores no resueltos por categoría
     */
    long countByErrorCategoryAndResolvedFalse(String errorCategory);

    /**
     * Obtiene los últimos N errores
     */
    List<ApplicationErrorLog> findTop50ByOrderByCreatedAtDesc();
}

package com.styp.cenate.repository.bolsas;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

/**
 * ✅ NUEVO v1.20.0: Repositorio para auditoría de errores de importación
 * Almacena todos los errores detectados durante importación de Excel
 * v2.1.0 - Métodos mejorados para frontend
 */
@Repository
public interface AuditErroresImportacionRepository extends JpaRepository<com.styp.cenate.model.bolsas.AuditErrorImportacion, Long> {

    /**
     * Obtiene errores por historial de carga
     */
    List<com.styp.cenate.model.bolsas.AuditErrorImportacion> findByIdCargaHistorial(Long idCargaHistorial);

    /**
     * Obtiene errores por tipo (v2.1.0)
     */
    List<com.styp.cenate.model.bolsas.AuditErrorImportacion> findByTipoError(String tipoError);

    /**
     * Obtiene errores ordenados por fecha descendente (v2.1.0)
     */
    @Query(value = """
        SELECT * FROM audit_errores_importacion_bolsa
        ORDER BY fecha_creacion DESC
        """, nativeQuery = true)
    List<com.styp.cenate.model.bolsas.AuditErrorImportacion> obtenerTodosOrdenados();

    /**
     * Cuenta errores por tipo
     */
    @Query(value = """
        SELECT tipo_error as tipo, COUNT(*) as cantidad
        FROM audit_errores_importacion_bolsa
        WHERE id_carga_historial = :idCarga
        GROUP BY tipo_error
        """, nativeQuery = true)
    List<Map<String, Object>> contarErroresPorTipo(Long idCarga);

    /**
     * Obtiene errores recientes
     */
    @Query(value = """
        SELECT * FROM audit_errores_importacion_bolsa
        WHERE id_carga_historial = :idCarga
        ORDER BY numero_fila ASC
        LIMIT :limite
        """, nativeQuery = true)
    List<com.styp.cenate.model.bolsas.AuditErrorImportacion> obtenerErroresRecientes(
        Long idCarga, int limite
    );
}

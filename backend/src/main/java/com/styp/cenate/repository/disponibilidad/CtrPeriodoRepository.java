package com.styp.cenate.repository.disponibilidad;

import com.styp.cenate.model.CtrPeriodo;
import com.styp.cenate.model.CtrPeriodoId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Repository para gestión de periodos de control por área.
 * Tabla: ctr_periodo
 * PK Compuesta: (periodo, id_area)
 */
@Repository
public interface CtrPeriodoRepository extends JpaRepository<CtrPeriodo, CtrPeriodoId> {

    /**
     * Lista todos los periodos ordenados por periodo descendente.
     * Incluye JOIN FETCH para cargar área, coordinador y su personal.
     */
    @Query("""
            SELECT DISTINCT p FROM CtrPeriodo p
            LEFT JOIN FETCH p.area
            LEFT JOIN FETCH p.coordinador c
            LEFT JOIN FETCH c.personalCnt
            ORDER BY p.id.periodo DESC, p.id.idArea DESC
            """)
    List<CtrPeriodo> findAllWithRelations();

    /**
     * Lista todos los periodos ordenados por periodo descendente (sin fetch).
     */
    List<CtrPeriodo> findAllByOrderByIdPeriodoDesc();

    /**
     * Lista periodos por estado ordenados por periodo descendente.
     */
    @Query("SELECT p FROM CtrPeriodo p WHERE p.estado = :estado ORDER BY p.id.periodo DESC")
    List<CtrPeriodo> findByEstadoOrderByPeriodoDesc(@Param("estado") String estado);

    /**
     * Lista periodos por área específica.
     */
    @Query("SELECT p FROM CtrPeriodo p WHERE p.id.idArea = :idArea ORDER BY p.id.periodo DESC")
    List<CtrPeriodo> findByAreaOrderByPeriodoDesc(@Param("idArea") Long idArea);

    /**
     * Lista periodos por área y estado.
     */
    @Query("SELECT p FROM CtrPeriodo p WHERE p.id.idArea = :idArea AND p.estado = :estado ORDER BY p.id.periodo DESC")
    List<CtrPeriodo> findByAreaAndEstado(@Param("idArea") Long idArea, @Param("estado") String estado);

    /**
     * Busca periodo por clave compuesta.
     */
    Optional<CtrPeriodo> findById(CtrPeriodoId id);

    /**
     * Verifica si existe un periodo para un área específica.
     */
    @Query("SELECT CASE WHEN COUNT(p) > 0 THEN true ELSE false END FROM CtrPeriodo p WHERE p.id.periodo = :periodo AND p.id.idArea = :idArea")
    boolean existsByPeriodoAndArea(@Param("periodo") String periodo, @Param("idArea") Long idArea);

    /**
     * Obtiene periodos abiertos (ABIERTO o REABIERTO).
     */
    @Query("SELECT p FROM CtrPeriodo p WHERE p.estado IN ('ABIERTO', 'REABIERTO') ORDER BY p.id.periodo DESC")
    List<CtrPeriodo> findAbiertos();

    /**
     * Obtiene periodos abiertos para un área específica.
     */
    @Query("SELECT p FROM CtrPeriodo p WHERE p.id.idArea = :idArea AND p.estado IN ('ABIERTO', 'REABIERTO') ORDER BY p.id.periodo DESC")
    List<CtrPeriodo> findAbiertosParaArea(@Param("idArea") Long idArea);

    /**
     * Obtiene periodos vigentes (abiertos y dentro del rango de fechas).
     */
    @Query("""
            SELECT p FROM CtrPeriodo p
            WHERE p.estado IN ('ABIERTO', 'REABIERTO')
              AND p.fechaInicio <= :ahora
              AND p.fechaFin >= :ahora
            ORDER BY p.id.periodo DESC
            """)
    List<CtrPeriodo> findVigentes(@Param("ahora") LocalDate ahora);

    default List<CtrPeriodo> findVigentes() {
        return findVigentes(LocalDate.now());
    }

    /**
     * Obtiene periodos vigentes para un área específica.
     */
    @Query("""
            SELECT p FROM CtrPeriodo p
            WHERE p.id.idArea = :idArea
              AND p.estado IN ('ABIERTO', 'REABIERTO')
              AND p.fechaInicio <= :ahora
              AND p.fechaFin >= :ahora
            ORDER BY p.id.periodo DESC
            """)
    List<CtrPeriodo> findVigentesParaArea(@Param("idArea") Long idArea, @Param("ahora") LocalDate ahora);

    default List<CtrPeriodo> findVigentesParaArea(Long idArea) {
        return findVigentesParaArea(idArea, LocalDate.now());
    }

    /**
     * Lista los años disponibles registrados (solo períodos no cerrados).
     */
    @Query("""
            SELECT DISTINCT CAST(SUBSTRING(p.id.periodo, 1, 4) AS integer)
            FROM CtrPeriodo p
            WHERE p.estado IN ('ABIERTO', 'EN_VALIDACION', 'REABIERTO')
            ORDER BY CAST(SUBSTRING(p.id.periodo, 1, 4) AS integer) DESC
            """)
    List<Integer> listarAniosDisponibles();

    /**
     * Lista los años por área específica.
     */
    @Query("""
            SELECT DISTINCT CAST(SUBSTRING(p.id.periodo, 1, 4) AS integer)
            FROM CtrPeriodo p
            WHERE p.id.idArea = :idArea
            ORDER BY CAST(SUBSTRING(p.id.periodo, 1, 4) AS integer) DESC
            """)
    List<Integer> listarAniosPorArea(@Param("idArea") Long idArea);

    /**
     * Lista periodos por coordinador.
     */
    @Query("SELECT p FROM CtrPeriodo p WHERE p.idCoordinador = :idCoordinador ORDER BY p.id.periodo DESC")
    List<CtrPeriodo> findByCoordinador(@Param("idCoordinador") Long idCoordinador);

    /**
     * Cuenta periodos por estado.
     */
    @Query("SELECT COUNT(p) FROM CtrPeriodo p WHERE p.estado = :estado")
    long countByEstado(@Param("estado") String estado);

    /**
     * Cuenta periodos por área y estado.
     */
    @Query("SELECT COUNT(p) FROM CtrPeriodo p WHERE p.id.idArea = :idArea AND p.estado = :estado")
    long countByAreaAndEstado(@Param("idArea") Long idArea, @Param("estado") String estado);
}

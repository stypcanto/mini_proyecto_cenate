package com.styp.cenate.repository;

import com.styp.cenate.model.FirmaDigitalPersonal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * 📦 Repository para gestión de firma digital del personal.
 *
 * @author Ing. Styp Canto Rondon
 * @version 1.0.0
 * @since 2025-12-30
 */
@Repository
public interface FirmaDigitalPersonalRepository extends JpaRepository<FirmaDigitalPersonal, Long> {

    /**
     * Busca la firma digital de un personal específico
     *
     * @param idPersonal ID del personal (dim_personal_cnt.id_pers)
     * @return Optional con la firma digital si existe
     */
    Optional<FirmaDigitalPersonal> findByPersonal_IdPers(Long idPersonal);

    /**
     * Verifica si existe firma digital para un personal
     *
     * @param idPersonal ID del personal
     * @return true si existe, false si no
     */
    boolean existsByPersonal_IdPers(Long idPersonal);

    /**
     * Lista firmas digitales por estado
     *
     * @param statFirma Estado del registro (A = Activo, I = Inactivo)
     * @return Lista de firmas digitales con ese estado
     */
    List<FirmaDigitalPersonal> findByStatFirma(String statFirma);

    /**
     * Lista firmas digitales por motivo y estado
     * Útil para listar entregas PENDIENTES activas
     *
     * @param motivo Motivo sin token (YA_TIENE, NO_REQUIERE, PENDIENTE)
     * @param stat Estado del registro
     * @return Lista de firmas digitales que cumplen criterios
     */
    List<FirmaDigitalPersonal> findByMotivoSinTokenAndStatFirma(String motivo, String stat);

    /**
     * Busca certificados próximos a vencer en un rango de fechas
     * Útil para alertas y reportes preventivos
     *
     * @param fechaActual Fecha actual (usualmente LocalDate.now())
     * @param fechaLimite Fecha límite para considerar "próximo a vencer"
     * @return Lista de firmas digitales con certificados próximos a vencer
     */
    @Query("SELECT f FROM FirmaDigitalPersonal f " +
           "WHERE f.statFirma = 'A' " +
           "AND f.entregoToken = true " +
           "AND f.fechaVencimientoCertificado IS NOT NULL " +
           "AND f.fechaVencimientoCertificado BETWEEN :fechaActual AND :fechaLimite " +
           "ORDER BY f.fechaVencimientoCertificado ASC")
    List<FirmaDigitalPersonal> findCertificadosProximosVencer(
        @Param("fechaActual") LocalDate fechaActual,
        @Param("fechaLimite") LocalDate fechaLimite
    );

    /**
     * Busca certificados ya vencidos
     * Útil para reportes de certificados expirados
     *
     * @param fechaActual Fecha actual (usualmente LocalDate.now())
     * @return Lista de firmas digitales con certificados vencidos
     */
    @Query("SELECT f FROM FirmaDigitalPersonal f " +
           "WHERE f.statFirma = 'A' " +
           "AND f.entregoToken = true " +
           "AND f.fechaVencimientoCertificado IS NOT NULL " +
           "AND f.fechaVencimientoCertificado < :fechaActual " +
           "ORDER BY f.fechaVencimientoCertificado DESC")
    List<FirmaDigitalPersonal> findCertificadosVencidos(@Param("fechaActual") LocalDate fechaActual);

    /**
     * Lista todas las firmas digitales activas
     *
     * @return Lista de firmas digitales activas
     */
    default List<FirmaDigitalPersonal> findAllActivas() {
        return findByStatFirma("A");
    }

    /**
     * Lista todas las entregas pendientes activas
     * Útil para dashboard de entregas pendientes
     *
     * @return Lista de firmas digitales con motivo PENDIENTE
     */
    default List<FirmaDigitalPersonal> findEntregasPendientes() {
        return findByMotivoSinTokenAndStatFirma("PENDIENTE", "A");
    }
}

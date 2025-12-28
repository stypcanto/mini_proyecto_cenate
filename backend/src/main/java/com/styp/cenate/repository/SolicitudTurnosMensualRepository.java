package com.styp.cenate.repository;

import com.styp.cenate.model.SolicitudTurnosMensual;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SolicitudTurnosMensualRepository extends JpaRepository<SolicitudTurnosMensual, Long> {

    List<SolicitudTurnosMensual> findByIdIpressOrderByPeriodoDesc(Long idIpress);

    List<SolicitudTurnosMensual> findByPeriodoOrderByIdIpressAsc(String periodo);

    Optional<SolicitudTurnosMensual> findByPeriodoAndIdIpress(String periodo, Long idIpress);

    List<SolicitudTurnosMensual> findByEstadoOrderByPeriodoDesc(String estado);

    @Query("SELECT s FROM SolicitudTurnosMensual s WHERE s.idIpress = :idIpress AND s.estado = :estado ORDER BY s.periodo DESC")
    List<SolicitudTurnosMensual> findByIdIpressAndEstado(@Param("idIpress") Long idIpress, @Param("estado") String estado);

    boolean existsByPeriodoAndIdIpress(String periodo, Long idIpress);
}

package com.styp.cenate.repository;

import com.styp.cenate.model.SolicitudTurnosDetalle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SolicitudTurnosDetalleRepository extends JpaRepository<SolicitudTurnosDetalle, Long> {

    List<SolicitudTurnosDetalle> findBySolicitudIdSolicitud(Long idSolicitud);

    @Query("SELECT d FROM SolicitudTurnosDetalle d WHERE d.solicitud.idSolicitud = :idSolicitud AND d.cantidadTurnos > 0")
    List<SolicitudTurnosDetalle> findBySolicitudIdSolicitudWithTurnos(@Param("idSolicitud") Long idSolicitud);

    void deleteBySolicitudIdSolicitud(Long idSolicitud);
}

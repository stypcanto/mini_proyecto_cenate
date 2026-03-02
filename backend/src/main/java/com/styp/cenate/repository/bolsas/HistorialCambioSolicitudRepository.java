package com.styp.cenate.repository.bolsas;

import com.styp.cenate.model.bolsas.HistorialCambioSolicitud;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HistorialCambioSolicitudRepository extends JpaRepository<HistorialCambioSolicitud, Long> {

    /** Devuelve todos los registros de historial de una solicitud, ordenados por fecha */
    List<HistorialCambioSolicitud> findByIdSolicitudOrderByFechaCambioAsc(Long idSolicitud);
}

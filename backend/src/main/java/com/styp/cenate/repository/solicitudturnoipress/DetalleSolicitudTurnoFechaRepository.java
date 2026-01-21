package com.styp.cenate.repository.solicitudturnoipress;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.styp.cenate.model.solicitudturnoipress.DetalleSolicitudTurnoFecha;

@Repository
public interface DetalleSolicitudTurnoFechaRepository extends JpaRepository<DetalleSolicitudTurnoFecha, Long> {
    void deleteByDetalle_IdDetalle(Long idDetalle);
    List<DetalleSolicitudTurnoFecha> findByDetalle_IdDetalleOrderByFechaAsc(Long idDetalle);
    
    
   
    long countByDetalle_IdDetalle(Long idDetalle);


}

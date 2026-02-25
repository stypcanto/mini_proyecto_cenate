package com.styp.cenate.service.pendientes;

import com.styp.cenate.dto.pendientes.ConsolidadoPendientesDTO;
import com.styp.cenate.dto.pendientes.DetallePendientesDTO;
import com.styp.cenate.dto.pendientes.PendientesResumenDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface PendientesService {

    Page<ConsolidadoPendientesDTO> obtenerConsolidado(
        String turno,
        String servicio,
        String subactividad,
        LocalDate fechaDesde,
        LocalDate fechaHasta,
        Pageable pageable
    );

    Page<DetallePendientesDTO> obtenerDetalle(
        String turno,
        String servicio,
        String subactividad,
        String busqueda,
        LocalDate fechaDesde,
        LocalDate fechaHasta,
        Pageable pageable
    );

    List<DetallePendientesDTO> obtenerDetallePorMedico(String dniMedico, String turno);

    PendientesResumenDTO obtenerKpis(String turno);

    List<Map<String, Object>> obtenerCalendario(String turno);
}

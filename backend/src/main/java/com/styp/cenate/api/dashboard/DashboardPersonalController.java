package com.styp.cenate.api.dashboard;

import com.styp.cenate.dto.dashboard.EstadisticasPersonalDTO;
import com.styp.cenate.service.dashboard.DashboardPersonalService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller para estadísticas de personal en el dashboard
 */
@RestController
@RequestMapping("/admin/dashboard")
@RequiredArgsConstructor
@Slf4j
public class DashboardPersonalController {

    private final DashboardPersonalService dashboardPersonalService;

    /**
     * Obtiene estadísticas de personal interno vs externo con desglose por red
     *
     * @return Estadísticas completas
     */
    @GetMapping("/estadisticas-personal")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORDINADOR')")
    public ResponseEntity<EstadisticasPersonalDTO> obtenerEstadisticasPersonal() {
        log.info("GET /admin/dashboard/estadisticas-personal - Solicitando estadísticas de personal");

        EstadisticasPersonalDTO estadisticas = dashboardPersonalService.obtenerEstadisticasPersonal();

        log.info("Estadísticas obtenidas: Interno={}, Externo={}, Redes={}",
                estadisticas.getTotalInterno(),
                estadisticas.getTotalExterno(),
                estadisticas.getTotalRedesConExternos());

        return ResponseEntity.ok(estadisticas);
    }
}

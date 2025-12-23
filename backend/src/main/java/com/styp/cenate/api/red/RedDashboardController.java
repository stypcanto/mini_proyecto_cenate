package com.styp.cenate.api.red;

import com.styp.cenate.dto.PersonalExternoResponse;
import com.styp.cenate.dto.formdiag.FormDiagListResponse;
import com.styp.cenate.dto.red.RedDashboardResponse;
import com.styp.cenate.security.mbac.CheckMBACPermission;
import com.styp.cenate.service.red.RedDashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Controller para el modulo de Red (Coordinadores de Red)
 * Permite a los coordinadores ver informacion de su red asignada
 */
@Slf4j
@RestController
@RequestMapping("/api/red")
@RequiredArgsConstructor
@Tag(name = "Red Dashboard", description = "Endpoints para coordinadores de red")
public class RedDashboardController {

    private final RedDashboardService redDashboardService;

    /**
     * Obtiene el dashboard con info de la red y estadisticas
     */
    @GetMapping("/mi-red")
    @CheckMBACPermission(pagina = "/red/dashboard", accion = "ver")
    @Operation(summary = "Obtener dashboard de mi red",
               description = "Retorna informacion de la red asignada al usuario y estadisticas")
    public ResponseEntity<RedDashboardResponse> obtenerMiRed() {
        log.info("GET /api/red/mi-red");
        return ResponseEntity.ok(redDashboardService.obtenerDashboard());
    }

    /**
     * Lista el personal externo de la red
     */
    @GetMapping("/personal")
    @CheckMBACPermission(pagina = "/red/dashboard", accion = "ver")
    @Operation(summary = "Listar personal externo de mi red",
               description = "Retorna la lista de personal externo de las IPRESS de la red")
    public ResponseEntity<List<PersonalExternoResponse>> obtenerPersonal() {
        log.info("GET /api/red/personal");
        return ResponseEntity.ok(redDashboardService.obtenerPersonalExterno());
    }

    /**
     * Lista los formularios de diagnostico de la red
     */
    @GetMapping("/formularios")
    @CheckMBACPermission(pagina = "/red/dashboard", accion = "ver")
    @Operation(summary = "Listar formularios de diagnostico de mi red",
               description = "Retorna la lista de formularios de diagnostico de las IPRESS de la red")
    public ResponseEntity<List<FormDiagListResponse>> obtenerFormularios() {
        log.info("GET /api/red/formularios");
        return ResponseEntity.ok(redDashboardService.obtenerFormularios());
    }
}

package com.styp.cenate.api.seguridad;

import com.styp.cenate.dto.SolicitudRegistroDTO;
import com.styp.cenate.service.solicitud.AccountRequestService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
@Slf4j
@RequiredArgsConstructor
public class SolicitudRegistroController {

    private final AccountRequestService accountRequestService;

    @PostMapping("/auth/solicitar-registro")
    public ResponseEntity<?> crearSolicitud(@RequestBody SolicitudRegistroDTO dto) {
        try {
            log.info("Nueva solicitud de registro: {} {}", dto.getNombres(), dto.getApellidoPaterno());
            
            SolicitudRegistroDTO solicitudCreada = accountRequestService.crearSolicitud(dto);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "message", "Solicitud de registro creada exitosamente",
                    "solicitud", solicitudCreada
            ));
            
        } catch (RuntimeException e) {
            log.error("Error al crear solicitud: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "error", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("Error inesperado al crear solicitud", e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Error al procesar la solicitud"
            ));
        }
    }

    @GetMapping("/admin/solicitudes-registro")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<List<SolicitudRegistroDTO>> listarTodasSolicitudes() {
        log.info("Listando todas las solicitudes de registro");
        return ResponseEntity.ok(accountRequestService.listarTodasLasSolicitudes());
    }

    @GetMapping("/admin/solicitudes-registro/pendientes")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<List<SolicitudRegistroDTO>> listarSolicitudesPendientes() {
        log.info("Listando solicitudes pendientes");
        return ResponseEntity.ok(accountRequestService.listarSolicitudesPendientes());
    }

    @GetMapping("/admin/solicitudes-registro/estadisticas")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<Map<String, Long>> obtenerEstadisticas() {
        log.info("Obteniendo estadisticas de solicitudes");
        return ResponseEntity.ok(accountRequestService.obtenerEstadisticas());
    }

    @PutMapping("/admin/solicitudes-registro/{id}/aprobar")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<?> aprobarSolicitud(@PathVariable Long id) {
        try {
            log.info("Aprobando solicitud ID: {}", id);
            
            SolicitudRegistroDTO solicitud = accountRequestService.aprobarSolicitud(id);
            
            return ResponseEntity.ok(Map.of(
                    "message", "Solicitud aprobada y usuario creado exitosamente",
                    "solicitud", solicitud
            ));
            
        } catch (RuntimeException e) {
            log.error("Error al aprobar solicitud: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "error", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("Error inesperado al aprobar solicitud", e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Error al procesar la solicitud"
            ));
        }
    }

    @PutMapping("/admin/solicitudes-registro/{id}/rechazar")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<?> rechazarSolicitud(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        try {
            String motivoRechazo = body.getOrDefault("motivo", "Sin motivo especificado");
            
            log.info("Rechazando solicitud ID: {}", id);
            
            SolicitudRegistroDTO solicitud = accountRequestService.rechazarSolicitud(id, motivoRechazo);
            
            return ResponseEntity.ok(Map.of(
                    "message", "Solicitud rechazada exitosamente",
                    "solicitud", solicitud
            ));
            
        } catch (RuntimeException e) {
            log.error("Error al rechazar solicitud: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "error", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("Error inesperado al rechazar solicitud", e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Error al procesar la solicitud"
            ));
        }
    }
}

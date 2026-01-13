package com.styp.cenate.api.solicitudturnos;

import com.styp.cenate.dto.SolicitudTurnosRequest;
import com.styp.cenate.dto.SolicitudTurnosResponse;
import com.styp.cenate.service.solicitudturnos.ISolicitudTurnosService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("/api/solicitud-turnos")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://10.0.89.13:5173",
        "http://10.0.89.13:3000"
})

// Se observa que hay tablas con datos similares. Esto no tomar en cuenta. Tomare en cuenta las tablas:
// select * from solicitud_turno_ipress;
// select * from detalle_solicitud_turno dst ;


public class SolicitudTurnosController {

	
	
	
    private final ISolicitudTurnosService solicitudService;

    @PostMapping
    public ResponseEntity<SolicitudTurnosResponse> guardarSolicitud(
            @RequestBody SolicitudTurnosRequest request) {
        log.info("POST /api/solicitud-turnos - Guardar solicitud periodo {}", request.getPeriodo());
        try {
            SolicitudTurnosResponse response = solicitudService.guardarSolicitud(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error al guardar solicitud: {}", e.getMessage());
            throw new RuntimeException("Error al guardar la solicitud: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<SolicitudTurnosResponse> obtenerPorId(@PathVariable Long id) {
        log.info("GET /api/solicitud-turnos/{} - Obtener por ID", id);
        return solicitudService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @GetMapping("/periodo/{periodo}/ipress/{idIpress}")
    public ResponseEntity<SolicitudTurnosResponse> obtenerPorPeriodoYIpress(
            @PathVariable String periodo,
            @PathVariable Long idIpress) {
        log.info("GET /api/solicitud-turnos/periodo/{}/ipress/{}", periodo, idIpress);
        return solicitudService.obtenerPorPeriodoYIpress(periodo, idIpress)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @GetMapping("/ipress/{idIpress}")
    public ResponseEntity<List<SolicitudTurnosResponse>> listarPorIpress(@PathVariable Long idIpress) {
        log.info("GET /api/solicitud-turnos/ipress/{} - Listar por IPRESS", idIpress);
        return ResponseEntity.ok(solicitudService.listarPorIpress(idIpress));
    }

    @GetMapping("/periodo/{periodo}")
    public ResponseEntity<List<SolicitudTurnosResponse>> listarPorPeriodo(@PathVariable String periodo) {
        log.info("GET /api/solicitud-turnos/periodo/{} - Listar por periodo", periodo);
        return ResponseEntity.ok(solicitudService.listarPorPeriodo(periodo));
    }

    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<SolicitudTurnosResponse>> listarPorEstado(@PathVariable String estado) {
        log.info("GET /api/solicitud-turnos/estado/{} - Listar por estado", estado);
        return ResponseEntity.ok(solicitudService.listarPorEstado(estado));
    }

    @PostMapping("/{id}/enviar")
    public ResponseEntity<SolicitudTurnosResponse> enviarSolicitud(@PathVariable Long id) {
        log.info("POST /api/solicitud-turnos/{}/enviar - Enviar solicitud", id);
        try {
            SolicitudTurnosResponse response = solicitudService.enviarSolicitud(id);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error al enviar solicitud: {}", e.getMessage());
            throw new RuntimeException("Error al enviar la solicitud: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/aprobar")
    public ResponseEntity<SolicitudTurnosResponse> aprobarSolicitud(@PathVariable Long id) {
        log.info("POST /api/solicitud-turnos/{}/aprobar - Aprobar solicitud", id);
        try {
            SolicitudTurnosResponse response = solicitudService.aprobarSolicitud(id);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error al aprobar solicitud: {}", e.getMessage());
            throw new RuntimeException("Error al aprobar la solicitud: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/rechazar")
    public ResponseEntity<SolicitudTurnosResponse> rechazarSolicitud(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String motivo = body.get("motivo");
        log.info("POST /api/solicitud-turnos/{}/rechazar - Rechazar solicitud", id);
        try {
            SolicitudTurnosResponse response = solicitudService.rechazarSolicitud(id, motivo);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error al rechazar solicitud: {}", e.getMessage());
            throw new RuntimeException("Error al rechazar la solicitud: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarSolicitud(@PathVariable Long id) {
        log.info("DELETE /api/solicitud-turnos/{} - Eliminar solicitud", id);
        try {
            solicitudService.eliminarSolicitud(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("Error al eliminar solicitud: {}", e.getMessage());
            throw new RuntimeException("Error al eliminar la solicitud: " + e.getMessage());
        }
    }

    @GetMapping("/existe")
    public ResponseEntity<Map<String, Boolean>> verificarExistencia(
            @RequestParam String periodo,
            @RequestParam Long idIpress) {
        log.info("GET /api/solicitud-turnos/existe?periodo={}&idIpress={}", periodo, idIpress);
        boolean existe = solicitudService.existeSolicitud(periodo, idIpress);
        return ResponseEntity.ok(Map.of("existe", existe));
    }
    
}

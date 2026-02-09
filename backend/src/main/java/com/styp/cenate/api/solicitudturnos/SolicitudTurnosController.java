package com.styp.cenate.api.solicitudturnos;

import com.styp.cenate.dto.SolicitudTurnosRequest;
import com.styp.cenate.dto.SolicitudTurnosResponse;
import com.styp.cenate.dto.teleconsultorio.TeleconsultorioConfigDTO;
import com.styp.cenate.service.solicitudturnos.ISolicitudTurnosService;
import com.styp.cenate.service.teleconsultorio.ITeleconsultorioService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;


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
        "http://10.0.89.241:5173",
        "http://10.0.89.241:3000"
})

// Se observa que hay tablas con datos similares. Esto no tomar en cuenta. Tomare en cuenta las tablas:
// select * from solicitud_turno_ipress;
// select * from detalle_solicitud_turno dst ;


public class SolicitudTurnosController {

    private final ISolicitudTurnosService solicitudService;
    private final ITeleconsultorioService teleconsultorioService;

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

    // === ENDPOINT DE PRUEBA TELECONSULTORIO ===
    @GetMapping("/{id}/test-teleconsultorio")
    public ResponseEntity<Map<String, Object>> testTeleconsultorio(@PathVariable Long id) {
        log.info("GET /api/solicitud-turnos/{}/test-teleconsultorio - Test endpoint", id);
        Map<String, Object> response = Map.of(
                "message", "Endpoint de teleconsultorio funcionando",
                "idSolicitud", id,
                "timestamp", java.time.LocalDateTime.now().toString(),
                "serviceInjected", teleconsultorioService != null
        );
        return ResponseEntity.ok(response);
    }

    // === ENDPOINT SUPER SIMPLE PARA PRUEBA ===
    @GetMapping("/test-simple")
    public ResponseEntity<String> testSimple() {
        log.info("GET /api/solicitud-turnos/test-simple - Test super simple");
        return ResponseEntity.ok("Backend funcionando - " + java.time.LocalDateTime.now());
    }

    // === ENDPOINTS DE TELECONSULTORIO ===
    
    /**
     * Obtiene la configuración de teleconsultorio para una solicitud
     * GET /api/solicitud-turnos/{id}/teleconsultorio
     */
    @GetMapping("/{id}/teleconsultorio")
    public ResponseEntity<TeleconsultorioConfigDTO> obtenerConfiguracionTeleconsultorio(@PathVariable Long id) {
        log.info("GET /api/solicitud-turnos/{}/teleconsultorio - Obtener configuración", id);
        Optional<TeleconsultorioConfigDTO> config = teleconsultorioService.obtenerConfiguracion(id);
        if (config.isPresent()) {
            return ResponseEntity.ok(config.get());
        } else {
            // Devolver configuración vacía en lugar de 404
            TeleconsultorioConfigDTO configVacia = new TeleconsultorioConfigDTO();
            configVacia.setIdSolicitud(id);
            configVacia.setDias(new ArrayList<String>());
            configVacia.setTipo("laborables");
            configVacia.setTotalHoras(0);
            return ResponseEntity.ok(configVacia);
        }
    }

    /**
     * Guarda o actualiza la configuración de teleconsultorio para una solicitud
     * POST /api/solicitud-turnos/{id}/teleconsultorio
     */
    @PostMapping("/{id}/teleconsultorio")
    public ResponseEntity<TeleconsultorioConfigDTO> guardarConfiguracionTeleconsultorio(
            @PathVariable Long id,
            @RequestBody TeleconsultorioConfigDTO config) {
        log.info("POST /api/solicitud-turnos/{}/teleconsultorio - Guardar configuración", id);
        log.info("  - Config recibida: {}", config);
        log.info("  - Dias: {}", config != null ? config.getDias() : "null");
        log.info("  - Tipo: {}", config != null ? config.getTipo() : "null");
        
        try {
            config.setIdSolicitud(id); // Asegurar que el ID coincide
            log.info("  - Llamando al servicio...");
            TeleconsultorioConfigDTO response = teleconsultorioService.guardarConfiguracion(config);
            log.info("  - Respuesta del servicio: {}", response);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error al guardar configuración de teleconsultorio: {}", e.getMessage());
            log.error("Stack trace:", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Elimina la configuración de teleconsultorio para una solicitud
     * DELETE /api/solicitud-turnos/{id}/teleconsultorio
     */
    @DeleteMapping("/{id}/teleconsultorio")
    public ResponseEntity<Void> eliminarConfiguracionTeleconsultorio(@PathVariable Long id) {
        log.info("DELETE /api/solicitud-turnos/{}/teleconsultorio - Eliminar configuración", id);
        try {
            teleconsultorioService.eliminarConfiguracion(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            log.error("Error al eliminar configuración de teleconsultorio: {}", e.getMessage());
            throw new RuntimeException("Error al eliminar la configuración: " + e.getMessage());
        }
    }

    /**
     * Verifica si existe configuración de teleconsultorio para una solicitud
     * GET /api/solicitud-turnos/{id}/teleconsultorio/existe
     */
    @GetMapping("/{id}/teleconsultorio/existe")
    public ResponseEntity<Map<String, Object>> verificarExistenciaTeleconsultorio(@PathVariable Long id) {
        log.info("GET /api/solicitud-turnos/{}/teleconsultorio/existe - Verificar existencia", id);
        boolean existe = teleconsultorioService.existeConfiguracion(id);
        Integer totalHoras = teleconsultorioService.obtenerTotalHoras(id);
        return ResponseEntity.ok(Map.of(
                "existe", existe,
                "totalHoras", totalHoras
        ));
    }

}

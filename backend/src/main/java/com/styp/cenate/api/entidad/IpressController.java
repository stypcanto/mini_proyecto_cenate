package com.styp.cenate.api.entidad;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.styp.cenate.dto.IpressRequest;
import com.styp.cenate.dto.IpressResponse;
import com.styp.cenate.service.ipress.IpressService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 🌐 Controlador REST para gestión de IPRESS (Instituciones Prestadoras de Servicios de Salud)
 *
 * Base URL: /api/ipress
 */
@RestController
@RequestMapping("/api/ipress")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://10.0.89.13:5173",
        "http://10.0.89.239:5173"
})
@Data
public class IpressController {

    private final IpressService ipressService;

    // ============================================================
    // 🔹 Obtener IPRESS activas (PÚBLICO - para registro)
    // ============================================================
    @GetMapping("/publicas")
    public ResponseEntity<List<IpressResponse>> getIpressPublicas() {
        log.info("📋 Consultando IPRESS activas (endpoint público)");
        return ResponseEntity.ok(ipressService.getIpressActivas());
    }

    // ============================================================
    // 🔹 Obtener IPRESS por RED (PÚBLICO - para registro)
    // ============================================================
    @GetMapping("/publicas/por-red/{idRed}")
    public ResponseEntity<List<IpressResponse>> getIpressPorRed(@PathVariable Long idRed) {
        log.info("📋 Consultando IPRESS activas por RED: {}", idRed);
        return ResponseEntity.ok(ipressService.getIpressActivasPorRed(idRed));
    }

    // ============================================================
    // 🔹 Obtener todas las IPRESS (PÚBLICO - respeta SecurityConfig)
    // ============================================================
    @GetMapping
    public ResponseEntity<List<IpressResponse>> getAllIpress() {
        log.info("📋 Consultando todas las IPRESS");
        return ResponseEntity.ok(ipressService.getAllIpress());
    }

    // ============================================================
    // 🔹 Obtener IPRESS activas (PÚBLICO - respeta SecurityConfig)
    // ============================================================
    @GetMapping("/activas")
    public ResponseEntity<List<IpressResponse>> getIpressActivas() {
        log.info("📋 Consultando IPRESS activas");
        return ResponseEntity.ok(ipressService.getIpressActivas());
    }

    // ============================================================
    // 🔹 Obtener IPRESS por ID (PÚBLICO - respeta SecurityConfig)
    // ============================================================
    @GetMapping("/{id}")
    public ResponseEntity<IpressResponse> getIpressById(@PathVariable Long id) {
        log.info("🔍 Consultando IPRESS con ID: {}", id);
        return ResponseEntity.ok(ipressService.getIpressById(id));
    }

    // ============================================================
    // 🔹 Buscar IPRESS por nombre (PÚBLICO - respeta SecurityConfig)
    // ============================================================
    @GetMapping("/buscar")
    public ResponseEntity<List<IpressResponse>> searchIpress(@RequestParam("q") String q) {
        log.info("🔎 Buscando IPRESS con término: {}", q);
        return ResponseEntity.ok(ipressService.searchIpress(q));
    }

    // ============================================================
    // 🔹 CREAR (CREATE)
    // ============================================================
    /**
     * POST /api/ipress
     * Crea una nueva IPRESS
     * Requiere rol: ADMIN o SUPERADMIN
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPERADMIN')")
    public ResponseEntity<Map<String, Object>> createIpress(@Valid @RequestBody IpressRequest request) {
        log.info("➕ Creando nueva IPRESS: {}", request.getDescIpress());
        IpressResponse ipress = ipressService.createIpress(request);
        Map<String, Object> response = new HashMap<>();
        response.put("status", 201);
        response.put("data", ipress);
        response.put("message", "IPRESS creada exitosamente");
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ============================================================
    // 🔹 ACTUALIZAR (UPDATE)
    // ============================================================
    /**
     * PUT /api/ipress/{id}
     * Actualiza una IPRESS existente
     * Requiere rol: ADMIN o SUPERADMIN
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPERADMIN')")
    public ResponseEntity<Map<String, Object>> updateIpress(
            @PathVariable Long id,
            @Valid @RequestBody IpressRequest request) {
        log.info("✏️ Actualizando IPRESS con ID: {}", id);
        IpressResponse ipress = ipressService.updateIpress(id, request);
        Map<String, Object> response = new HashMap<>();
        response.put("status", 200);
        response.put("data", ipress);
        response.put("message", "IPRESS actualizada exitosamente");
        return ResponseEntity.ok(response);
    }

    // ============================================================
    // 🔹 ELIMINAR (DELETE) - Solo SUPERADMIN
    // ============================================================
    /**
     * DELETE /api/ipress/{id}
     * Elimina una IPRESS
     * Requiere rol: SUPERADMIN únicamente
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<Map<String, Object>> deleteIpress(@PathVariable Long id) {
        log.info("🗑️ Eliminando IPRESS con ID: {} (solo SUPERADMIN)", id);
        ipressService.deleteIpress(id);
        Map<String, Object> response = new HashMap<>();
        response.put("status", 200);
        response.put("message", "IPRESS eliminada exitosamente");
        return ResponseEntity.ok(response);
    }
}

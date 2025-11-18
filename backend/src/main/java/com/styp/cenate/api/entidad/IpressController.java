package com.styp.cenate.api.entidad;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.styp.cenate.dto.IpressResponse;
import com.styp.cenate.service.ipress.IpressService;

import java.util.List;

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
    // 🔹 Obtener todas las IPRESS
    // ============================================================
    @GetMapping
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'USER')")
    public ResponseEntity<List<IpressResponse>> getAllIpress() {
        log.info("📋 Consultando todas las IPRESS");
        return ResponseEntity.ok(ipressService.getAllIpress());
    }

    // ============================================================
    // 🔹 Obtener IPRESS activas
    // ============================================================
    @GetMapping("/activas")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'USER')")
    public ResponseEntity<List<IpressResponse>> getIpressActivas() {
        log.info("📋 Consultando IPRESS activas");
        return ResponseEntity.ok(ipressService.getIpressActivas());
    }

    // ============================================================
    // 🔹 Obtener IPRESS por ID
    // ============================================================
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'USER')")
    public ResponseEntity<IpressResponse> getIpressById(@PathVariable Long id) {
        log.info("🔍 Consultando IPRESS con ID: {}", id);
        return ResponseEntity.ok(ipressService.getIpressById(id));
    }

    // ============================================================
    // 🔹 Buscar IPRESS por nombre (búsqueda parcial)
    // ============================================================
    @GetMapping("/buscar")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'USER')")
    public ResponseEntity<List<IpressResponse>> searchIpress(@RequestParam("q") String q) {
        log.info("🔎 Buscando IPRESS con término: {}", q);
        return ResponseEntity.ok(ipressService.searchIpress(q));
    }
}

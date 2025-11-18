package com.styp.cenate.api.usuario;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.styp.cenate.dto.RegimenLaboralResponse;
import com.styp.cenate.service.regimen.RegimenLaboralService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * ============================================================
 * 🧩 CONTROLADOR: REGÍMENES LABORALES
 * ============================================================
 * Gestiona operaciones CRUD sobre la tabla dim_regimen_laboral
 * ============================================================
 */
@RestController
@RequestMapping("/api/regimenes")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost",
        "http://127.0.0.1",
        "http://10.0.89.13",
        "http://10.0.89.239"
})
@Data
public class RegimenLaboralController {

    private final RegimenLaboralService regimenLaboralService;

    // ============================================================
    // 📘 OBTENER TODOS LOS REGÍMENES (requiere token)
    // ============================================================
    @GetMapping
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<List<RegimenLaboralResponse>> getAllRegimenes() {
        log.info("📋 Consultando todos los regímenes laborales");
        List<RegimenLaboralResponse> regimenes = regimenLaboralService.getAllRegimenes();
        return ResponseEntity.ok(regimenes);
    }

    // ============================================================
    // 📘 OBTENER SOLO REGÍMENES ACTIVOS (público, sin token)
    // ============================================================
    @GetMapping("/publicos")
    public ResponseEntity<List<RegimenLaboralResponse>> getRegimenesActivos() {
        log.info("🌐 Consultando regímenes laborales activos (público)");
        List<RegimenLaboralResponse> activos = regimenLaboralService.getAllRegimenes()
                .stream()
                .filter(r -> "A".equalsIgnoreCase(r.getStatRegLab()))
                .toList();
        return ResponseEntity.ok(activos);
    }

    // ============================================================
    // 📘 OBTENER RÉGIMEN POR ID
    // ============================================================
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<RegimenLaboralResponse> getRegimenById(@PathVariable Long id) {
        log.info("🔍 Consultando régimen laboral por ID: {}", id);
        RegimenLaboralResponse regimen = regimenLaboralService.getRegimenById(id);
        return ResponseEntity.ok(regimen);
    }

    // ============================================================
    // 🟢 CREAR NUEVO RÉGIMEN
    // ============================================================
    @PostMapping
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<RegimenLaboralResponse> createRegimen(@RequestBody Map<String, String> request) {
        log.info("🟢 Creando nuevo régimen laboral");
        RegimenLaboralResponse regimen = regimenLaboralService.createRegimen(
                request.get("descRegLab"),
                request.getOrDefault("statRegLab", "A")
        );
        return ResponseEntity.ok(regimen);
    }

    // ============================================================
    // 🟡 ACTUALIZAR RÉGIMEN
    // ============================================================
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<RegimenLaboralResponse> updateRegimen(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        log.info("🟡 Actualizando régimen laboral con ID: {}", id);
        RegimenLaboralResponse regimen = regimenLaboralService.updateRegimen(
                id,
                request.get("descRegLab"),
                request.get("statRegLab")
        );
        return ResponseEntity.ok(regimen);
    }

    // ============================================================
    // 🔴 ELIMINAR RÉGIMEN
    // ============================================================
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<Map<String, String>> deleteRegimen(@PathVariable Long id) {
        log.info("🔴 Eliminando régimen laboral con ID: {}", id);
        regimenLaboralService.deleteRegimen(id);

        Map<String, String> response = new HashMap<>();
        response.put("message", "✅ Régimen laboral eliminado exitosamente");
        return ResponseEntity.ok(response);
    }
}

package styp.com.cenate.api;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import styp.com.cenate.dto.AreaResponse;
import styp.com.cenate.service.AreaService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/areas")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://localhost"})
public class AreaController {

    private final AreaService areaService;

    /** ==================== CONSULTAS ==================== */

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<List<AreaResponse>> getAllAreas() {
        log.info("Consultando todas las áreas");
        List<AreaResponse> areas = areaService.getAllAreas();
        return ResponseEntity.ok(areas);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<AreaResponse> getAreaById(@PathVariable Long id) {
        log.info("Consultando área por ID: {}", id);
        AreaResponse area = areaService.getAreaById(id);
        return ResponseEntity.ok(area);
    }

    /** ==================== CREACIÓN ==================== */

    @PostMapping
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<AreaResponse> createArea(@RequestBody Map<String, String> request) {
        log.info("Creando nueva área");
        String descArea = request.get("descArea");
        String statArea = request.getOrDefault("statArea", "A"); // Valor por defecto
        AreaResponse area = areaService.createArea(descArea, statArea);
        return ResponseEntity.ok(area);
    }

    /** ==================== ACTUALIZACIÓN ==================== */

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<AreaResponse> updateArea(@PathVariable Long id,
                                                   @RequestBody Map<String, String> request) {
        log.info("Actualizando área con ID: {}", id);
        String descArea = request.get("descArea");
        String statArea = request.get("statArea");
        AreaResponse area = areaService.updateArea(id, descArea, statArea);
        return ResponseEntity.ok(area);
    }

    /** ==================== ELIMINACIÓN ==================== */

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<Map<String, String>> deleteArea(@PathVariable Long id) {
        log.info("Eliminando área con ID: {}", id);
        areaService.deleteArea(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Área eliminada exitosamente");
        return ResponseEntity.ok(response);
    }
}

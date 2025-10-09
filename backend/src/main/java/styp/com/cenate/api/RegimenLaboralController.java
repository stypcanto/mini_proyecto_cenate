package styp.com.cenate.api;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import styp.com.cenate.dto.RegimenLaboralResponse;
import styp.com.cenate.service.RegimenLaboralService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/regimenes-laborales")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://localhost"})
public class RegimenLaboralController {
    
    private final RegimenLaboralService regimenLaboralService;
    
    @GetMapping
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<List<RegimenLaboralResponse>> getAllRegimenes() {
        log.info("Consultando todos los regímenes laborales");
        List<RegimenLaboralResponse> regimenes = regimenLaboralService.getAllRegimenes();
        return ResponseEntity.ok(regimenes);
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<RegimenLaboralResponse> getRegimenById(@PathVariable Long id) {
        log.info("Consultando régimen laboral por ID: {}", id);
        RegimenLaboralResponse regimen = regimenLaboralService.getRegimenById(id);
        return ResponseEntity.ok(regimen);
    }
    
    @PostMapping
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<RegimenLaboralResponse> createRegimen(@RequestBody Map<String, String> request) {
        log.info("Creando nuevo régimen laboral");
        RegimenLaboralResponse regimen = regimenLaboralService.createRegimen(
            request.get("descRegLab"),
            request.getOrDefault("statRegLab", "A")
        );
        return ResponseEntity.ok(regimen);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<RegimenLaboralResponse> updateRegimen(
            @PathVariable Long id, 
            @RequestBody Map<String, String> request) {
        log.info("Actualizando régimen laboral con ID: {}", id);
        RegimenLaboralResponse regimen = regimenLaboralService.updateRegimen(
            id,
            request.get("descRegLab"),
            request.get("statRegLab")
        );
        return ResponseEntity.ok(regimen);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<?> deleteRegimen(@PathVariable Long id) {
        log.info("Eliminando régimen laboral con ID: {}", id);
        regimenLaboralService.deleteRegimen(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Régimen laboral eliminado exitosamente");
        return ResponseEntity.ok(response);
    }
}

package com.styp.cenate.api.usuario;
import lombok.extern.slf4j.Slf4j;

import com.styp.cenate.dto.ProfesionResponse;
import com.styp.cenate.model.Profesion;
import com.styp.cenate.service.profesion.ProfesionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * ======================================================================
 * 🎓 CONTROLADOR DE PROFESIONES - CENATE
 * ======================================================================
 * Endpoints:
 *   GET    /api/profesiones           → lista todas las profesiones
 *   GET    /api/profesiones/activas   → lista solo las activas
 *   POST   /api/profesiones           → crear una nueva profesión
 *   PUT    /api/profesiones/{id}      → actualizar una profesión
 *   DELETE /api/profesiones/{id}      → eliminar una profesión
 * ======================================================================
 */
@RestController
@RequestMapping("/api/profesiones")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {
        "http://localhost:3000",
        "http://localhost:5173",
        "http://10.0.89.241:5173",
        "http://10.0.89.241:3000"
})
public class ProfesionController {

    private final ProfesionService profesionService;

    @GetMapping
    public ResponseEntity<List<ProfesionResponse>> obtenerTodas() {
        return ResponseEntity.ok(profesionService.obtenerTodas());
    }

    @GetMapping("/activas")
    public ResponseEntity<List<ProfesionResponse>> obtenerActivas() {
        return ResponseEntity.ok(profesionService.obtenerActivas());
    }

    @PostMapping
    public ResponseEntity<ProfesionResponse> crear(@RequestBody Profesion profesion) {
        return ResponseEntity.ok(profesionService.crear(profesion));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProfesionResponse> actualizar(@PathVariable Long id, @RequestBody Profesion profesion) {
        return ResponseEntity.ok(profesionService.actualizar(id, profesion));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> eliminar(@PathVariable Long id) {
        profesionService.eliminar(id);
        return ResponseEntity.ok("Profesión eliminada correctamente");
    }
}

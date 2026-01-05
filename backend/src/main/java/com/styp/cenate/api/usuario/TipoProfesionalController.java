package com.styp.cenate.api.usuario;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.styp.cenate.model.TipoProfesional;
import com.styp.cenate.service.tipoprofesional.TipoProfesionalService;

import java.util.List;

@RestController
@RequestMapping("/api/admin/tipos-profesionales")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {
        "http://localhost",
        "http://localhost:3000",
        "http://localhost:5173",
        "http://10.0.89.13:3000",
        "http://10.0.89.13:5173"
})
@PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
public class TipoProfesionalController {

    private final TipoProfesionalService tipoProfesionalService;

    // =====================================================
    // 📋 OBTENER TODOS LOS TIPOS PROFESIONALES
    // =====================================================
    @GetMapping
    public ResponseEntity<List<TipoProfesional>> obtenerTodos() {
        try {
            List<TipoProfesional> tipos = tipoProfesionalService.getAll();
            return ResponseEntity.ok(tipos);
        } catch (Exception e) {
            log.error("❌ Error al obtener tipos profesionales: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    // =====================================================
    // 📋 OBTENER SOLO TIPOS PROFESIONALES ACTIVOS
    // =====================================================
    @GetMapping("/activos")
    public ResponseEntity<List<TipoProfesional>> obtenerActivos() {
        try {
            List<TipoProfesional> tipos = tipoProfesionalService.getAllActivos();
            return ResponseEntity.ok(tipos);
        } catch (Exception e) {
            log.error("❌ Error al obtener tipos profesionales activos: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    // =====================================================
    // 🔍 OBTENER TIPO PROFESIONAL POR ID
    // =====================================================
    @GetMapping("/{id}")
    public ResponseEntity<TipoProfesional> obtenerPorId(@PathVariable Long id) {
        try {
            TipoProfesional tipo = tipoProfesionalService.getById(id);
            return tipo != null ? ResponseEntity.ok(tipo) : ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("❌ Error al obtener tipo profesional {}: {}", id, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    // =====================================================
    // ➕ CREAR NUEVO TIPO PROFESIONAL
    // =====================================================
    @PostMapping
    public ResponseEntity<?> crear(@RequestBody TipoProfesional tipoProfesional) {
        try {
            TipoProfesional nuevo = tipoProfesionalService.createTipoProfesional(tipoProfesional);
            log.info("✅ Tipo profesional creado exitosamente: {}", nuevo.getDescTipPers());
            return ResponseEntity.ok(nuevo);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("💥 Error al crear tipo profesional: {}", e.getMessage());
            return ResponseEntity.internalServerError().body("Error interno al crear el tipo profesional");
        }
    }

    // =====================================================
    // ✏️ ACTUALIZAR TIPO PROFESIONAL EXISTENTE
    // =====================================================
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Long id, @RequestBody TipoProfesional tipoProfesional) {
        try {
            TipoProfesional actualizado = tipoProfesionalService.updateTipoProfesional(id, tipoProfesional);
            log.info("✏️ Tipo profesional actualizado: {}", actualizado.getDescTipPers());
            return ResponseEntity.ok(actualizado);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("💥 Error al actualizar tipo profesional {}: {}", id, e.getMessage());
            return ResponseEntity.internalServerError().body("Error interno al actualizar el tipo profesional");
        }
    }

    // =====================================================
    // 🗑️ ELIMINAR TIPO PROFESIONAL
    // =====================================================
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        try {
            tipoProfesionalService.deleteTipoProfesional(id);
            log.info("🗑️ Tipo profesional eliminado: ID {}", id);
            return ResponseEntity.ok("Tipo profesional eliminado exitosamente");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("💥 Error al eliminar tipo profesional {}: {}", id, e.getMessage());
            return ResponseEntity.internalServerError().body("Error interno al eliminar el tipo profesional");
        }
    }
}

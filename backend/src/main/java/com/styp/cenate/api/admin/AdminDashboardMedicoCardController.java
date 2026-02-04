// ========================================================================
// 🎴 AdminDashboardMedicoCardController.java – Sistema CMS Dashboard Médico CENATE 2025
// ------------------------------------------------------------------------
// • Controlador REST para gestionar las cards del Dashboard Médico
// • Permite CRUD completo: crear, leer, actualizar y eliminar cards
// • Endpoint público para obtener solo cards activas (para el dashboard)
// • Gestión de orden y activación/desactivación de cards
// ========================================================================

package com.styp.cenate.api.admin;

import com.styp.cenate.dto.DashboardMedicoCardRequest;
import com.styp.cenate.dto.DashboardMedicoCardResponse;
import com.styp.cenate.service.dashboardmedico.IDashboardMedicoCardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/dashboard-medico/cards")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {
        "http://localhost:3000",
        "http://localhost:5173",
        "http://10.0.89.241:5173",
        "http://10.0.89.241:3000"
})
public class AdminDashboardMedicoCardController {

    private final IDashboardMedicoCardService cardService;

    // ============================================================
    // 📋 Obtener todas las cards (admin)
    // ============================================================
    @GetMapping
    public ResponseEntity<List<DashboardMedicoCardResponse>> getAll() {
        log.info("📄 Listando todas las cards del Dashboard Médico");
        return ResponseEntity.ok(cardService.findAll());
    }

    // ============================================================
    // 📋 Obtener solo cards activas (público para dashboard)
    // ============================================================
    @GetMapping("/activas")
    public ResponseEntity<List<DashboardMedicoCardResponse>> getActivas() {
        log.info("📄 Listando cards activas del Dashboard Médico");
        return ResponseEntity.ok(cardService.findAllActivas());
    }

    // ============================================================
    // 🔍 Obtener card por ID
    // ============================================================
    @GetMapping("/{id}")
    public ResponseEntity<DashboardMedicoCardResponse> getById(@PathVariable Integer id) {
        log.info("🔍 Obteniendo card con ID: {}", id);
        try {
            return ResponseEntity.ok(cardService.findById(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).build();
        }
    }

    // ============================================================
    // ➕ Crear nueva card
    // ============================================================
    @PostMapping
    public ResponseEntity<?> create(@RequestBody DashboardMedicoCardRequest request) {
        log.info("🧩 Creando nueva card: {}", request.getTitulo());
        
        if (request.getTitulo() == null || request.getTitulo().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "El título es requerido"
            ));
        }

        if (request.getLink() == null || request.getLink().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "El link es requerido"
            ));
        }

        if (request.getIcono() == null || request.getIcono().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "El icono es requerido"
            ));
        }

        try {
            DashboardMedicoCardResponse created = cardService.create(request);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Card creada correctamente",
                    "data", created
            ));
        } catch (Exception e) {
            log.error("❌ Error al crear card: {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Error al crear la card: " + e.getMessage()
            ));
        }
    }

    // ============================================================
    // ✏️ Actualizar card
    // ============================================================
    @PutMapping("/{id}")
    public ResponseEntity<?> update(
            @PathVariable Integer id,
            @RequestBody DashboardMedicoCardRequest request
    ) {
        log.info("✏️ Actualizando card con ID: {}", id);
        
        try {
            DashboardMedicoCardResponse updated = cardService.update(id, request);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Card actualizada correctamente",
                    "data", updated
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("❌ Error al actualizar card: {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Error al actualizar la card: " + e.getMessage()
            ));
        }
    }

    // ============================================================
    // ❌ Eliminar card
    // ============================================================
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        log.warn("🗑️ Eliminando card con ID: {}", id);
        
        try {
            cardService.delete(id);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Card eliminada correctamente",
                    "id", id
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("❌ Error al eliminar card: {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Error al eliminar la card: " + e.getMessage()
            ));
        }
    }

    // ============================================================
    // 🔄 Actualizar orden de cards
    // ============================================================
    @PutMapping("/orden")
    public ResponseEntity<?> updateOrden(@RequestBody Map<String, List<Integer>> body) {
        List<Integer> ids = body.get("ids");
        if (ids == null || ids.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "La lista de IDs es requerida"
            ));
        }

        log.info("🔄 Actualizando orden de {} cards", ids.size());
        
        try {
            cardService.updateOrden(ids);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Orden actualizado correctamente"
            ));
        } catch (Exception e) {
            log.error("❌ Error al actualizar orden: {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Error al actualizar el orden: " + e.getMessage()
            ));
        }
    }

    // ============================================================
    // 🔄 Activar/Desactivar card
    // ============================================================
    @PutMapping("/{id}/toggle-activo")
    public ResponseEntity<?> toggleActivo(@PathVariable Integer id) {
        log.info("🔄 Cambiando estado activo de card con ID: {}", id);
        
        try {
            DashboardMedicoCardResponse updated = cardService.toggleActivo(id);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Card " + (updated.getActivo() ? "activada" : "desactivada") + " correctamente",
                    "data", updated
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("❌ Error al cambiar estado: {}", e.getMessage());
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Error al cambiar el estado: " + e.getMessage()
            ));
        }
    }
}


package com.styp.cenate.api.usuario;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.styp.cenate.model.Rol;
import com.styp.cenate.service.rol.RolService;

import java.util.List;

@RestController
@RequestMapping("/api/admin/roles")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {
        "http://localhost",
        "http://localhost:3000",
        "http://localhost:5173",
        "http://10.0.89.241:3000",
        "http://10.0.89.241:5173"
})
@PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
@Data
public class RolController {

    private final RolService rolService;

    // =====================================================
    // 📋 OBTENER TODOS LOS ROLES
    // =====================================================
    @GetMapping
    public ResponseEntity<List<Rol>> obtenerTodosLosRoles() {
        try {
            List<Rol> roles = rolService.getAll();
            return ResponseEntity.ok(roles);
        } catch (Exception e) {
            log.error("❌ Error al obtener roles: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    // =====================================================
    // 🔍 OBTENER ROL POR ID
    // =====================================================
    @GetMapping("/{id}")
    public ResponseEntity<Rol> obtenerRolPorId(@PathVariable Integer id) {
        try {
            Rol rol = rolService.getById(id);
            return rol != null ? ResponseEntity.ok(rol) : ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("❌ Error al obtener rol {}: {}", id, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    // =====================================================
    // ➕ CREAR NUEVO ROL
    // =====================================================
    @PostMapping
    public ResponseEntity<?> crearRol(@RequestBody Rol rol) {
        try {
            Rol nuevo = rolService.createRol(rol);
            log.info("✅ Rol creado exitosamente: {}", nuevo.getDescRol());
            return ResponseEntity.ok(nuevo);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("💥 Error al crear rol: {}", e.getMessage());
            return ResponseEntity.internalServerError().body("Error interno al crear el rol");
        }
    }

    // =====================================================
    // ✏️ ACTUALIZAR ROL EXISTENTE
    // =====================================================
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarRol(@PathVariable Integer id, @RequestBody Rol rolActualizado) {
        try {
            Rol actualizado = rolService.updateRol(id, rolActualizado);
            log.info("✏️ Rol actualizado: {}", actualizado.getDescRol());
            return ResponseEntity.ok(actualizado);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("💥 Error al actualizar rol {}: {}", id, e.getMessage());
            return ResponseEntity.internalServerError().body("Error interno al actualizar el rol");
        }
    }

    // =====================================================
    // 🗑️ ELIMINAR ROL
    // =====================================================
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarRol(@PathVariable Integer id) {
        try {
            rolService.deleteRol(id);
            log.info("🗑️ Rol eliminado: ID {}", id);
            return ResponseEntity.ok("Rol eliminado exitosamente");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            log.error("💥 Error al eliminar rol {}: {}", id, e.getMessage());
            return ResponseEntity.internalServerError().body("Error interno al eliminar el rol");
        }
    }
}

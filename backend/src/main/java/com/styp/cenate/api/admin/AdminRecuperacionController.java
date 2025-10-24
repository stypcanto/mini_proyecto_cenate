// ========================================================================
// 🔐 AdminRecuperacionController.java – Sistema MBAC CENATE 2025
// ------------------------------------------------------------------------
// • Controlador REST para gestionar solicitudes de recuperación de contraseña
// • Permite listar, actualizar estado y eliminar solicitudes
// • Compatible con el flujo institucional de asignación de contraseña temporal
// ========================================================================

package com.styp.cenate.api.admin;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.styp.cenate.model.RecuperacionCuenta;
import com.styp.cenate.repository.RecuperacionCuentaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/recuperacion")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {
        "http://localhost:3000",
        "http://localhost:5173",
        "http://10.0.89.13:5173",
        "http://10.0.89.13:3000"
})
public class AdminRecuperacionController {

    private final RecuperacionCuentaRepository recuperacionCuentaRepository;

    // ============================================================
    // 📋 Obtener todas las solicitudes (opcionalmente filtrar por estado)
    // ============================================================
    @GetMapping
    public ResponseEntity<List<RecuperacionCuenta>> getAll(
            @RequestParam(required = false) String estado
    ) {
        List<RecuperacionCuenta> lista;
        if (estado != null && !estado.isBlank()) {
            lista = recuperacionCuentaRepository.findByEstadoIgnoreCase(estado.trim());
            log.info("📄 Listando solicitudes de recuperación con estado: {}", estado);
        } else {
            lista = recuperacionCuentaRepository.findAll();
            log.info("📄 Listando todas las solicitudes de recuperación");
        }
        return ResponseEntity.ok(lista);
    }

    // ============================================================
    // 📨 Registrar nueva solicitud de recuperación (pública)
    // ============================================================
    @PostMapping("/solicitar")
    public ResponseEntity<?> solicitarRecuperacion(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        if (username == null || username.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Debe ingresar el nombre de usuario o DNI"
            ));
        }

        RecuperacionCuenta solicitud = new RecuperacionCuenta();
        solicitud.setUsername(username.trim());
        solicitud.setEstado("PENDIENTE");
        solicitud.setFechaSolicitud(LocalDateTime.now());
        solicitud.setObservacion("Solicitud inicial del usuario");

        recuperacionCuentaRepository.save(solicitud);
        log.info("📝 Nueva solicitud de recuperación registrada para usuario: {}", username);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Solicitud registrada correctamente",
                "usuario", username
        ));
    }

    // ============================================================
    // 🔄 Actualizar estado de una solicitud (por SUPERADMIN)
    // ============================================================
    @PutMapping("/{id}/estado")
    public ResponseEntity<?> updateEstado(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        String nuevoEstado = body.get("estado");
        String observacion = body.getOrDefault("observacion", "");

        if (nuevoEstado == null || nuevoEstado.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Debe indicar un nuevo estado válido"
            ));
        }

        return recuperacionCuentaRepository.findById(id)
                .map(solicitud -> {
                    solicitud.setEstado(nuevoEstado.trim().toUpperCase());
                    solicitud.setObservacion(observacion);
                    solicitud.setFechaActualizacion(LocalDateTime.now());
                    recuperacionCuentaRepository.save(solicitud);

                    log.info("✅ Estado actualizado a '{}' para solicitud {}", nuevoEstado, id);
                    return ResponseEntity.ok(Map.of(
                            "success", true,
                            "message", "Estado actualizado correctamente",
                            "id", id,
                            "nuevoEstado", nuevoEstado
                    ));
                })
                .orElse(ResponseEntity.status(404).body(Map.of(
                        "success", false,
                        "message", "Solicitud no encontrada"
                )));
    }

    // ============================================================
    // ❌ Eliminar una solicitud (opcional)
    // ============================================================
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!recuperacionCuentaRepository.existsById(id)) {
            return ResponseEntity.status(404).body(Map.of(
                    "success", false,
                    "message", "Solicitud no encontrada"
            ));
        }

        recuperacionCuentaRepository.deleteById(id);
        log.warn("🗑️ Solicitud de recuperación eliminada (ID: {})", id);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Solicitud eliminada correctamente",
                "id", id
        ));
    }
}
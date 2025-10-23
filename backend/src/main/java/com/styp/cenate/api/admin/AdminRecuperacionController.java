package com.styp.cenate.api.admin;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.styp.cenate.model.RecuperacionCuenta;
import com.styp.cenate.repository.RecuperacionCuentaRepository;

import java.util.List;
import java.util.Map;

/**
 * 👑 Módulo administrativo para gestionar solicitudes de recuperación de contraseña
 */
@RestController
@RequestMapping("/api/admin/recuperacion")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://10.0.89.13:5173"
})
@Data
public class AdminRecuperacionController {

    private final RecuperacionCuentaRepository recuperacionCuentaRepository;

    // 🔹 Obtener todas las solicitudes (opcionalmente filtrar por estado)
    @GetMapping
    public ResponseEntity<List<RecuperacionCuenta>> getAll(@RequestParam(required = false) String estado) {
        List<RecuperacionCuenta> lista;
        if (estado != null && !estado.isBlank()) {
            lista = recuperacionCuentaRepository.findByEstado(estado.toUpperCase());
        } else {
            lista = recuperacionCuentaRepository.findAll();
        }
        return ResponseEntity.ok(lista);
    }

    // 🔹 Actualizar estado de una solicitud
    @PutMapping("/{id}/estado")
    public ResponseEntity<?> updateEstado(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        String nuevoEstado = body.get("estado");
        String observacion = body.getOrDefault("observacion", "");

        return recuperacionCuentaRepository.findById(id)
                .map(solicitud -> {
                    solicitud.setEstado(nuevoEstado.toUpperCase());
                    solicitud.setObservacion(observacion);
                    recuperacionCuentaRepository.save(solicitud);
                    log.info("✅ Estado actualizado a '{}' para solicitud {}", nuevoEstado, id);
                    return ResponseEntity.ok(Map.of("success", true, "message", "Estado actualizado correctamente"));
                })
                .orElse(ResponseEntity.status(404).body(Map.of("success", false, "message", "Solicitud no encontrada")));
    }

    // 🔹 Eliminar una solicitud (opcional)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!recuperacionCuentaRepository.existsById(id)) {
            return ResponseEntity.status(404).body(Map.of("success", false, "message", "Solicitud no encontrada"));
        }
        recuperacionCuentaRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Solicitud eliminada correctamente"));
    }
}

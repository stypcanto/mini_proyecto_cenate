// ============================================================================
// 🔔 NotificacionController.java – API de Notificaciones (CENATE 2025)
// ----------------------------------------------------------------------------
// Maneja notificaciones del sistema, incluyendo cumpleaños de médicos
// ============================================================================

package com.styp.cenate.api.notificacion;

import com.styp.cenate.dto.NotificacionResponse;
import com.styp.cenate.service.notificacion.NotificacionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/notificaciones")
@RequiredArgsConstructor
public class NotificacionController {

    private final NotificacionService notificacionService;

    /**
     * 🎂 Obtiene la lista de médicos que cumplen años hoy
     * Solo accesible para ADMIN y SUPERADMIN
     */
    @GetMapping("/cumpleanos")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<List<NotificacionResponse>> obtenerCumpleanosHoy() {
        log.info("🎂 Solicitando lista de cumpleaños del día");
        try {
            List<NotificacionResponse> cumpleanos = notificacionService.obtenerCumpleanosHoy();
            log.info("✅ Encontrados {} cumpleaños para hoy", cumpleanos.size());
            return ResponseEntity.ok(cumpleanos);
        } catch (Exception e) {
            log.error("❌ Error al obtener cumpleaños: {}", e.getMessage(), e);
            return ResponseEntity.ok(List.of()); // Retornar lista vacía en caso de error
        }
    }

    /**
     * 🔔 Obtiene el conteo de notificaciones sin leer
     * (Para el badge en la campanita)
     */
    @GetMapping("/count")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<Integer> contarNotificaciones() {
        log.info("🔔 Solicitando conteo de notificaciones");
        try {
            int count = notificacionService.contarCumpleanosHoy();
            log.info("✅ Total de notificaciones: {}", count);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            log.error("❌ Error al contar notificaciones: {}", e.getMessage(), e);
            return ResponseEntity.ok(0);
        }
    }
}

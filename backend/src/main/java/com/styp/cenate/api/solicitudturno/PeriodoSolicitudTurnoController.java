package com.styp.cenate.api.solicitudturno;

import com.styp.cenate.dto.PeriodoSolicitudTurnoRequest;
import com.styp.cenate.dto.PeriodoSolicitudTurnoResponse;
import com.styp.cenate.service.solicitudturno.PeriodoSolicitudTurnoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controlador REST para gestion de periodos de solicitud de turnos.
 * Base URL: /api/periodos-solicitud
 */
@RestController
@RequestMapping("/api/periodos-solicitud")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://10.0.89.13:5173",
        "http://10.0.89.239:5173"
})
public class PeriodoSolicitudTurnoController {

    private final PeriodoSolicitudTurnoService periodoService;

    // ============================================================
    // Listar periodos
    // ============================================================

    /**
     * Lista todos los periodos (para admin/coordinador)
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORDINADOR')")
    public ResponseEntity<List<PeriodoSolicitudTurnoResponse>> listarTodos() {
        log.info("Listando todos los periodos de solicitud");
        return ResponseEntity.ok(periodoService.listarTodos());
    }

    /**
     * Lista periodos activos (para usuarios externos)
     */
    @GetMapping("/activos")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORDINADOR', 'INSTITUCION_EX')")
    public ResponseEntity<List<PeriodoSolicitudTurnoResponse>> listarActivos() {
        log.info("Listando periodos activos");
        return ResponseEntity.ok(periodoService.listarActivos());
    }

    /**
     * Lista periodos vigentes (activos y dentro del rango de fechas)
     */
    @GetMapping("/vigentes")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORDINADOR', 'INSTITUCION_EX')")
    public ResponseEntity<List<PeriodoSolicitudTurnoResponse>> listarVigentes() {
        log.info("Listando periodos vigentes");
        return ResponseEntity.ok(periodoService.listarVigentes());
    }

    // ============================================================
    // Obtener periodo
    // ============================================================

    /**
     * Obtiene un periodo por ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORDINADOR', 'INSTITUCION_EX')")
    public ResponseEntity<PeriodoSolicitudTurnoResponse> obtenerPorId(@PathVariable Long id) {
        log.info("Obteniendo periodo con ID: {}", id);
        return ResponseEntity.ok(periodoService.obtenerPorId(id));
    }

    /**
     * Obtiene un periodo con estadisticas
     */
    @GetMapping("/{id}/estadisticas")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORDINADOR')")
    public ResponseEntity<PeriodoSolicitudTurnoResponse> obtenerConEstadisticas(@PathVariable Long id) {
        log.info("Obteniendo periodo con estadisticas, ID: {}", id);
        return ResponseEntity.ok(periodoService.obtenerConEstadisticas(id));
    }

    // ============================================================
    // CRUD - Solo Coordinador/Admin
    // ============================================================

    /**
     * Crea un nuevo periodo
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORDINADOR')")
    public ResponseEntity<PeriodoSolicitudTurnoResponse> crear(
            @Valid @RequestBody PeriodoSolicitudTurnoRequest request,
            Authentication authentication) {
        log.info("Creando nuevo periodo: {}", request.getPeriodo());
        String createdBy = authentication.getName();
        PeriodoSolicitudTurnoResponse response = periodoService.crear(request, createdBy);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Actualiza un periodo existente
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORDINADOR')")
    public ResponseEntity<PeriodoSolicitudTurnoResponse> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody PeriodoSolicitudTurnoRequest request) {
        log.info("Actualizando periodo con ID: {}", id);
        return ResponseEntity.ok(periodoService.actualizar(id, request));
    }

    /**
     * Cambia el estado de un periodo
     */
    @PutMapping("/{id}/estado")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORDINADOR')")
    public ResponseEntity<PeriodoSolicitudTurnoResponse> cambiarEstado(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String nuevoEstado = body.get("estado");
        log.info("Cambiando estado del periodo {} a {}", id, nuevoEstado);
        return ResponseEntity.ok(periodoService.cambiarEstado(id, nuevoEstado));
    }

    /**
     * Elimina un periodo
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORDINADOR')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        log.info("Eliminando periodo con ID: {}", id);
        periodoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}

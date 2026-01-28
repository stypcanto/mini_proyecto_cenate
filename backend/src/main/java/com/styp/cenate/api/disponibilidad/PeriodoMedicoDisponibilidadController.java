package com.styp.cenate.api.disponibilidad;

import com.styp.cenate.dto.disponibilidad.PeriodoMedicoDisponibilidadRequest;
import com.styp.cenate.dto.disponibilidad.PeriodoMedicoDisponibilidadResponse;
import com.styp.cenate.service.disponibilidad.PeriodoMedicoDisponibilidadService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * Controlador REST para gestión de periodos globales
 * de disponibilidad médica.
 *
 * Base URL: /api/periodos-medicos-disponibilidad
 */
@RestController
@RequestMapping("/api/periodos-medicos-disponibilidad")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://10.0.89.13:5173",
        "http://10.0.89.239:5173"
})
public class PeriodoMedicoDisponibilidadController {

    private final PeriodoMedicoDisponibilidadService service;

    // ============================================================
    // Listar periodos
    // ============================================================

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORDINADOR')")
    public ResponseEntity<List<PeriodoMedicoDisponibilidadResponse>> listarTodos() {
        log.info("Listando todos los periodos médicos de disponibilidad");
        return ResponseEntity.ok(service.listarTodos());
    }

    @GetMapping("/activos")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORDINADOR')")
    public ResponseEntity<List<PeriodoMedicoDisponibilidadResponse>> listarActivos() {
        log.info("Listando periodos médicos de disponibilidad activos");
        return ResponseEntity.ok(service.listarActivos());
    }

    @GetMapping("/vigentes")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORDINADOR')")
    public ResponseEntity<List<PeriodoMedicoDisponibilidadResponse>> listarVigentes() {
        log.info("Listando periodos médicos de disponibilidad vigentes");
        return ResponseEntity.ok(service.listarVigentes());
    }

    @GetMapping("/anios")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORDINADOR')")
    public ResponseEntity<List<Integer>> listarAnios() {
        log.info("Listando años disponibles de periodos médicos de disponibilidad");
        return ResponseEntity.ok(service.listarAnios());
    }

    // ============================================================
    // Obtener / CRUD básico
    // ============================================================

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORDINADOR')")
    public ResponseEntity<PeriodoMedicoDisponibilidadResponse> obtenerPorId(@PathVariable("id") Long id) {
        log.info("Obteniendo periodo médico de disponibilidad con ID: {}", id);
        return ResponseEntity.ok(service.obtenerPorId(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORDINADOR')")
    public ResponseEntity<PeriodoMedicoDisponibilidadResponse> crear(
            @Valid @RequestBody PeriodoMedicoDisponibilidadRequest request,
            Authentication authentication
    ) {
        String username = authentication != null ? authentication.getName() : "system";
        log.info("Creando nuevo periodo médico de disponibilidad para usuario {}", username);
        PeriodoMedicoDisponibilidadResponse response = service.crear(request, username);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORDINADOR')")
    public ResponseEntity<PeriodoMedicoDisponibilidadResponse> actualizar(
            @PathVariable("id") Long id,
            @Valid @RequestBody PeriodoMedicoDisponibilidadRequest request,
            Authentication authentication
    ) {
        String username = authentication != null ? authentication.getName() : "system";
        log.info("Actualizando periodo médico de disponibilidad {} por usuario {}", id, username);
        return ResponseEntity.ok(service.actualizar(id, request, username));
    }

    @PutMapping("/{id}/estado")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORDINADOR')")
    public ResponseEntity<PeriodoMedicoDisponibilidadResponse> cambiarEstado(
            @PathVariable("id") Long id,
            @RequestBody Map<String, String> body,
            Authentication authentication
    ) {
        String nuevoEstado = body.get("estado");
        String username = authentication != null ? authentication.getName() : "system";
        log.info("Cambiando estado del periodo médico de disponibilidad {} a {} por usuario {}", id, nuevoEstado, username);
        return ResponseEntity.ok(service.cambiarEstado(id, nuevoEstado, username));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORDINADOR')")
    public ResponseEntity<Void> eliminar(@PathVariable("id") Long id) {
        log.info("Eliminando periodo médico de disponibilidad con ID: {}", id);
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}


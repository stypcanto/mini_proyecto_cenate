package com.styp.cenate.api.solicitudturno;

import java.util.List;
import java.util.Map;

import org.springframework.data.web.PageableDefault;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.styp.cenate.dto.PeriodoSolicitudTurnoRequest;
import com.styp.cenate.dto.PeriodoSolicitudTurnoResponse;
import com.styp.cenate.dto.solicitudturno.PeriodoFechasUpdateRequest;
import com.styp.cenate.dto.solicitudturno.PeriodoFechasUpdateResponse;
import com.styp.cenate.dto.solicitudturno.PeriodoSolicitudTurnoResumenView;
import com.styp.cenate.dto.solicitudturno.PeriodoSolicitudTurnoRow;
import com.styp.cenate.service.solicitudturno.PeriodoSolicitudTurnoService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

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
        "http://10.0.89.241:5173",
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
            @PathVariable("id") Long id,
            @RequestBody Map<String, String> body) {
        String nuevoEstado = body.get("estado");
        log.info("Cambiando estado del periodo {} a {}", id, nuevoEstado);
        return ResponseEntity.ok(periodoService.cambiarEstado(id, nuevoEstado));
    }

    /**
     * Elimina un periodo
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable("id") Long id) {
        log.info("Eliminando periodo con ID: {}", id);
        periodoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
    /*ACTUALIZAR FECHA DE INICIO Y FIN DE LOS PERIODOS*/
    
    @PutMapping("/{id}/fechas")
    //@PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORDINADOR')")
    public ResponseEntity<PeriodoFechasUpdateResponse> actualizarFechas(
            @PathVariable("id") Long id,
            @Valid @RequestBody PeriodoFechasUpdateRequest req) {

        log.info("PUT /periodos-solicitud/{}/fechas -> inicio={}, fin={}", id, req.getFechaInicio(), req.getFechaFin());
        return ResponseEntity.ok(periodoService.actualizarFechas(id, req));
    }

    /* FILTRAR LOS PERIODOS*/
    /**
     * Lista periodos con paginación y filtros.
     * Ejemplo:
    Ya no sera necesario porque le pasamos por defecto(&sort=fechaInicio,desc)
	GET /api/periodos-solicitud/filtros?estado=ACTIVO&anio=2026&page=0&size=10&sort=fechaInicio,desc
	GET /api/periodos-solicitud/filtros?estado=TODOS&anio=2026&page=0&size=10
     */
    @GetMapping("/filtros2")
    public ResponseEntity<Page<PeriodoSolicitudTurnoRow>> listar(
            @RequestParam(required = false, name="estado") String estado,  // TODOS | ACTIVO | CERRADO
            @RequestParam(required = false, name="anio") Integer anio,    // 2026
            @PageableDefault(size = 10, sort = "fechaInicio", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(periodoService.listarConConteoSolicitudes(estado, anio, pageable));
    }
    
    @GetMapping("/filtros")
    public ResponseEntity<Page<PeriodoSolicitudTurnoResumenView>> listarConResumen(
            @RequestParam(required = false, name="estado") String estado,  // TODOS | ACTIVO | CERRADO
            @RequestParam(required = false, name="anio") Integer anio,    // 2026
            @PageableDefault(size = 10, sort = "fechaInicio", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(periodoService.listarConResumen(estado, anio, pageable));
    }
    
    
    

    /**
     * Devuelve los años disponibles de los periodos registrados
     * http://localhost:8080/api/periodos-solicitud/anios
     */
    @GetMapping("/anios")
    //@PreAuthorize("hasAnyRole('SUPERADMIN','ADMIN','COORDINADOR')")
    public ResponseEntity<List<Integer>> listarAnios() {
        log.info("Listando años disponibles de periodos");
        return ResponseEntity.ok(periodoService.listarAnios());
    }
    
    
}

package com.styp.cenate.api.pendientes;

import com.styp.cenate.dto.pendientes.ConsolidadoPendientesDTO;
import com.styp.cenate.dto.pendientes.DetallePendientesDTO;
import com.styp.cenate.dto.pendientes.PendientesResumenDTO;
import com.styp.cenate.service.pendientes.PendientesService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestMethod;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controller REST para el módulo de Pendientes Mensuales.
 * Expone datos de consolidado y detalle de pacientes pendientes por médico.
 *
 * Roles permitidos: SUPERADMIN, ADMIN, COORDINADOR, COORD. GESTION CITAS,
 *                   GESTOR_TERRITORIAL_TI, GESTIONTERRITORIAL
 */
@Slf4j
@RestController
@RequestMapping("/api/pendientes-mensuales")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*",
        methods = {RequestMethod.GET, RequestMethod.OPTIONS})
public class PendientesMensualesController {

    private static final String ROLES_PERMITIDOS =
            "hasAnyRole('SUPERADMIN','ADMIN','COORDINADOR','COORD. GESTION CITAS','GESTOR_TERRITORIAL_TI','GESTIONTERRITORIAL')";

    private final PendientesService pendientesService;

    // ─────────────────────────────────────────────────────────────────────────
    // 1. KPIs globales
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * GET /api/pendientes-mensuales/kpis
     * KPIs globales: total médicos, pacientes, abandonos y distribución.
     */
    @GetMapping("/kpis")
    @PreAuthorize(ROLES_PERMITIDOS)
    public ResponseEntity<Map<String, Object>> obtenerKpis() {
        log.info("📊 GET /api/pendientes-mensuales/kpis");
        try {
            PendientesResumenDTO kpis = pendientesService.obtenerKpis();
            return ok(kpis, "KPIs obtenidos exitosamente");
        } catch (Exception e) {
            log.error("❌ Error al obtener KPIs: {}", e.getMessage(), e);
            return error(e.getMessage(), "Error al calcular KPIs");
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 2. Consolidado por médico
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * GET /api/pendientes-mensuales/consolidado
     * Resumen paginado por médico con filtros opcionales.
     */
    @GetMapping("/consolidado")
    @PreAuthorize(ROLES_PERMITIDOS)
    public ResponseEntity<Map<String, Object>> obtenerConsolidado(
            @RequestParam(required = false) String servicio,
            @RequestParam(required = false) String subactividad,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaDesde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaHasta,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        log.info("📋 GET /api/pendientes-mensuales/consolidado - servicio={}, subactividad={}, page={}, size={}",
                servicio, subactividad, page, size);

        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<ConsolidadoPendientesDTO> resultado = pendientesService.obtenerConsolidado(
                    servicio, subactividad, fechaDesde, fechaHasta, pageable);
            log.info("✅ {} registros encontrados (página {}/{})",
                    resultado.getTotalElements(), page + 1, resultado.getTotalPages());
            return ok(resultado, "Consolidado obtenido exitosamente");
        } catch (Exception e) {
            log.error("❌ Error al obtener consolidado: {}", e.getMessage(), e);
            return error(e.getMessage(), "Error al obtener consolidado de pendientes");
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 3. Detalle nominal paginado
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * GET /api/pendientes-mensuales/detalle
     * Listado nominal paginado con filtros y búsqueda por DNI/nombre de paciente.
     */
    @GetMapping("/detalle")
    @PreAuthorize(ROLES_PERMITIDOS)
    public ResponseEntity<Map<String, Object>> obtenerDetalle(
            @RequestParam(required = false) String servicio,
            @RequestParam(required = false) String subactividad,
            @RequestParam(required = false) String busqueda,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaDesde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaHasta,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        log.info("📄 GET /api/pendientes-mensuales/detalle - busqueda={}, page={}, size={}",
                busqueda, page, size);

        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<DetallePendientesDTO> resultado = pendientesService.obtenerDetalle(
                    servicio, subactividad, busqueda, fechaDesde, fechaHasta, pageable);
            log.info("✅ {} pacientes encontrados", resultado.getTotalElements());
            return ok(resultado, "Detalle obtenido exitosamente");
        } catch (Exception e) {
            log.error("❌ Error al obtener detalle: {}", e.getMessage(), e);
            return error(e.getMessage(), "Error al obtener detalle de pendientes");
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 4. Detalle por médico específico
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * GET /api/pendientes-mensuales/detalle/{dniMedico}
     * Lista todos los pacientes pendientes de un médico específico.
     */
    @GetMapping("/detalle/{dniMedico}")
    @PreAuthorize(ROLES_PERMITIDOS)
    public ResponseEntity<Map<String, Object>> obtenerDetallePorMedico(
            @PathVariable String dniMedico) {

        log.info("👨‍⚕️ GET /api/pendientes-mensuales/detalle/{}", dniMedico);

        try {
            List<DetallePendientesDTO> resultado = pendientesService.obtenerDetallePorMedico(dniMedico);
            log.info("✅ {} pacientes para médico {}", resultado.size(), dniMedico);
            return ok(resultado, "Detalle del médico obtenido exitosamente");
        } catch (Exception e) {
            log.error("❌ Error al obtener detalle del médico {}: {}", dniMedico, e.getMessage(), e);
            return error(e.getMessage(), "Error al obtener detalle del médico");
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────

    private ResponseEntity<Map<String, Object>> ok(Object data, String message) {
        Map<String, Object> resp = new HashMap<>();
        resp.put("status", HttpStatus.OK.value());
        resp.put("data", data);
        resp.put("message", message);
        return ResponseEntity.ok(resp);
    }

    private ResponseEntity<Map<String, Object>> error(String detail, String message) {
        Map<String, Object> resp = new HashMap<>();
        resp.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        resp.put("error", detail);
        resp.put("message", message);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(resp);
    }
}

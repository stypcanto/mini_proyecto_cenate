package com.styp.cenate.api.firmadigital;

import com.styp.cenate.dto.ActualizarEntregaTokenRequest;
import com.styp.cenate.dto.FirmaDigitalRequest;
import com.styp.cenate.dto.FirmaDigitalResponse;
import com.styp.cenate.service.firmadigital.FirmaDigitalService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 🌐 Controlador REST para gestión de firma digital del personal.
 *
 * Endpoints disponibles:
 * - POST   /api/firma-digital                      - Crear/actualizar firma digital
 * - GET    /api/firma-digital/personal/{id}        - Obtener por ID de personal
 * - GET    /api/firma-digital/{id}                 - Obtener por ID de firma digital
 * - PUT    /api/firma-digital/{id}/actualizar-entrega - Actualizar PENDIENTE a entregado
 * - GET    /api/firma-digital                      - Listar todas las firmas digitales activas
 * - GET    /api/firma-digital/pendientes           - Listar entregas pendientes
 * - GET    /api/firma-digital/proximos-vencer      - Certificados próximos a vencer
 * - GET    /api/firma-digital/vencidos             - Certificados vencidos
 * - POST   /api/firma-digital/importar-personal    - Importar personal CENATE CAS/728
 * - DELETE /api/firma-digital/{id}                 - Eliminar (soft delete)
 *
 * @author Ing. Styp Canto Rondon
 * @version 1.0.0
 * @since 2025-12-30
 */
@Slf4j
@RestController
@RequestMapping("/api/firma-digital")
@CrossOrigin(origins = "*")
public class FirmaDigitalController {

    private final FirmaDigitalService firmaDigitalService;

    public FirmaDigitalController(@Qualifier("personalFirmaDigitalService") FirmaDigitalService firmaDigitalService) {
        this.firmaDigitalService = firmaDigitalService;
    }

    /**
     * Crear o actualizar firma digital (UPSERT)
     *
     * POST /api/firma-digital
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<?> guardarFirmaDigital(@RequestBody FirmaDigitalRequest request) {
        log.info("📥 POST /api/firma-digital - Personal ID: {}", request.getIdPersonal());

        try {
            FirmaDigitalResponse response = firmaDigitalService.guardarFirmaDigital(request);

            Map<String, Object> result = new HashMap<>();
            result.put("status", 200);
            result.put("message", "Firma digital guardada exitosamente");
            result.put("data", response);

            return ResponseEntity.ok(result);

        } catch (IllegalArgumentException e) {
            log.error("❌ Error de validación: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "status", 400,
                "error", "Validation Error",
                "message", e.getMessage()
            ));

        } catch (Exception e) {
            log.error("❌ Error al guardar firma digital: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "status", 500,
                "error", "Internal Server Error",
                "message", "Error al guardar firma digital: " + e.getMessage()
            ));
        }
    }

    /**
     * Listar todas las firmas digitales activas
     *
     * GET /api/firma-digital
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORDINADOR')")
    public ResponseEntity<?> listarActivas() {
        log.info("📥 GET /api/firma-digital");

        try {
            List<FirmaDigitalResponse> firmas = firmaDigitalService.listarActivas();

            return ResponseEntity.ok(Map.of(
                "status", 200,
                "total", firmas.size(),
                "data", firmas
            ));

        } catch (Exception e) {
            log.error("❌ Error al listar firmas digitales: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "status", 500,
                "error", "Internal Server Error",
                "message", e.getMessage()
            ));
        }
    }

    /**
     * Obtener firma digital por ID de personal
     *
     * GET /api/firma-digital/personal/{idPersonal}
     */
    @GetMapping("/personal/{idPersonal}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'MEDICO', 'COORDINADOR')")
    public ResponseEntity<?> obtenerPorIdPersonal(@PathVariable Long idPersonal) {
        log.info("📥 GET /api/firma-digital/personal/{}", idPersonal);

        try {
            FirmaDigitalResponse response = firmaDigitalService.obtenerPorIdPersonal(idPersonal);

            if (response == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "status", 404,
                    "message", "Firma digital no encontrada para el personal ID: " + idPersonal
                ));
            }

            return ResponseEntity.ok(Map.of(
                "status", 200,
                "data", response
            ));

        } catch (Exception e) {
            log.error("❌ Error al obtener firma digital: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "status", 500,
                "error", "Internal Server Error",
                "message", e.getMessage()
            ));
        }
    }

    /**
     * Obtener firma digital por ID
     *
     * GET /api/firma-digital/{id}
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORDINADOR')")
    public ResponseEntity<?> obtenerPorId(@PathVariable Long id) {
        log.info("📥 GET /api/firma-digital/{}", id);

        try {
            FirmaDigitalResponse response = firmaDigitalService.obtenerPorId(id);

            return ResponseEntity.ok(Map.of(
                "status", 200,
                "data", response
            ));

        } catch (RuntimeException e) {
            log.error("❌ Firma digital no encontrada: {}", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                "status", 404,
                "error", "Not Found",
                "message", e.getMessage()
            ));

        } catch (Exception e) {
            log.error("❌ Error al obtener firma digital: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "status", 500,
                "error", "Internal Server Error",
                "message", e.getMessage()
            ));
        }
    }

    /**
     * Actualizar entrega de token PENDIENTE
     *
     * PUT /api/firma-digital/{id}/actualizar-entrega
     */
    @PutMapping("/{id}/actualizar-entrega")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<?> actualizarEntregaToken(
        @PathVariable Long id,
        @RequestBody ActualizarEntregaTokenRequest request
    ) {
        log.info("📥 PUT /api/firma-digital/{}/actualizar-entrega", id);

        try {
            request.setIdFirmaPersonal(id); // Asegurar que el ID coincida
            FirmaDigitalResponse response = firmaDigitalService.actualizarEntregaToken(request);

            return ResponseEntity.ok(Map.of(
                "status", 200,
                "message", "Entrega de token actualizada exitosamente",
                "data", response
            ));

        } catch (IllegalArgumentException e) {
            log.error("❌ Error de validación: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "status", 400,
                "error", "Validation Error",
                "message", e.getMessage()
            ));

        } catch (IllegalStateException e) {
            log.error("❌ Estado inválido: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                "status", 409,
                "error", "Conflict",
                "message", e.getMessage()
            ));

        } catch (RuntimeException e) {
            log.error("❌ Firma digital no encontrada: {}", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                "status", 404,
                "error", "Not Found",
                "message", e.getMessage()
            ));

        } catch (Exception e) {
            log.error("❌ Error al actualizar entrega: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "status", 500,
                "error", "Internal Server Error",
                "message", e.getMessage()
            ));
        }
    }

    /**
     * Listar entregas pendientes
     *
     * GET /api/firma-digital/pendientes
     */
    @GetMapping("/pendientes")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORDINADOR')")
    public ResponseEntity<?> listarPendientes() {
        log.info("📥 GET /api/firma-digital/pendientes");

        try {
            List<FirmaDigitalResponse> pendientes = firmaDigitalService.listarEntregasPendientes();

            return ResponseEntity.ok(Map.of(
                "status", 200,
                "total", pendientes.size(),
                "data", pendientes
            ));

        } catch (Exception e) {
            log.error("❌ Error al listar pendientes: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "status", 500,
                "error", "Internal Server Error",
                "message", e.getMessage()
            ));
        }
    }

    /**
     * Listar certificados próximos a vencer (30 días)
     *
     * GET /api/firma-digital/proximos-vencer
     * GET /api/firma-digital/proximos-vencer?dias=60
     */
    @GetMapping("/proximos-vencer")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORDINADOR')")
    public ResponseEntity<?> listarProximosVencer(@RequestParam(required = false, defaultValue = "30") int dias) {
        log.info("📥 GET /api/firma-digital/proximos-vencer?dias={}", dias);

        try {
            List<FirmaDigitalResponse> proximosVencer = firmaDigitalService.listarCertificadosProximosVencer(dias);

            return ResponseEntity.ok(Map.of(
                "status", 200,
                "diasAlerta", dias,
                "total", proximosVencer.size(),
                "data", proximosVencer
            ));

        } catch (Exception e) {
            log.error("❌ Error al listar próximos a vencer: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "status", 500,
                "error", "Internal Server Error",
                "message", e.getMessage()
            ));
        }
    }

    /**
     * Listar certificados vencidos
     *
     * GET /api/firma-digital/vencidos
     */
    @GetMapping("/vencidos")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORDINADOR')")
    public ResponseEntity<?> listarVencidos() {
        log.info("📥 GET /api/firma-digital/vencidos");

        try {
            List<FirmaDigitalResponse> vencidos = firmaDigitalService.listarCertificadosVencidos();

            return ResponseEntity.ok(Map.of(
                "status", 200,
                "total", vencidos.size(),
                "data", vencidos
            ));

        } catch (Exception e) {
            log.error("❌ Error al listar vencidos: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "status", 500,
                "error", "Internal Server Error",
                "message", e.getMessage()
            ));
        }
    }

    /**
     * Eliminar firma digital (soft delete)
     *
     * DELETE /api/firma-digital/{id}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<?> eliminarFirmaDigital(@PathVariable Long id) {
        log.info("📥 DELETE /api/firma-digital/{}", id);

        try {
            firmaDigitalService.eliminarFirmaDigital(id);

            return ResponseEntity.ok(Map.of(
                "status", 200,
                "message", "Firma digital eliminada exitosamente"
            ));

        } catch (RuntimeException e) {
            log.error("❌ Firma digital no encontrada: {}", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                "status", 404,
                "error", "Not Found",
                "message", e.getMessage()
            ));

        } catch (Exception e) {
            log.error("❌ Error al eliminar firma digital: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "status", 500,
                "error", "Internal Server Error",
                "message", e.getMessage()
            ));
        }
    }

    /**
     * Importar automáticamente personal CENATE (CAS y 728)
     *
     * POST /api/firma-digital/importar-personal
     */
    @PostMapping("/importar-personal")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<?> importarPersonalCENATE() {
        log.info("📥 POST /api/firma-digital/importar-personal");

        try {
            int registrosCreados = firmaDigitalService.importarPersonalCENATE();

            return ResponseEntity.ok(Map.of(
                "status", 200,
                "message", "Importación completada exitosamente",
                "registrosCreados", registrosCreados
            ));

        } catch (Exception e) {
            log.error("❌ Error al importar personal: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "status", 500,
                "error", "Internal Server Error",
                "message", "Error al importar personal: " + e.getMessage()
            ));
        }
    }

    /**
     * Verificar si existe firma digital para un personal
     *
     * GET /api/firma-digital/existe/{idPersonal}
     */
    @GetMapping("/existe/{idPersonal}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORDINADOR')")
    public ResponseEntity<?> existeFirmaDigital(@PathVariable Long idPersonal) {
        log.info("📥 GET /api/firma-digital/existe/{}", idPersonal);

        try {
            boolean existe = firmaDigitalService.existeFirmaDigital(idPersonal);

            return ResponseEntity.ok(Map.of(
                "status", 200,
                "existe", existe
            ));

        } catch (Exception e) {
            log.error("❌ Error al verificar existencia: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "status", 500,
                "error", "Internal Server Error",
                "message", e.getMessage()
            ));
        }
    }
}

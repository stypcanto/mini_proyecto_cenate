package com.styp.cenate.api.atencion;

import com.styp.cenate.dto.AtencionClinicaCreateDTO;
import com.styp.cenate.dto.AtencionClinicaDTO;
import com.styp.cenate.dto.AtencionClinicaUpdateDTO;
import com.styp.cenate.dto.ObservacionEnfermeriaDTO;
import com.styp.cenate.security.mbac.CheckMBACPermission;
import com.styp.cenate.service.atencion.IAtencionClinicaService;
import com.styp.cenate.service.auditlog.AuditLogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller REST para gestionar Atenciones Clínicas
 *
 * @author Claude Code + Styp Canto Rondón
 * @version 2.0.0
 * @since 2026-01-03
 */
@Slf4j
@RestController
@RequestMapping("/api/atenciones-clinicas")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AtencionClinicaController {

    private final IAtencionClinicaService atencionService;
    private final AuditLogService auditLogService;

    /**
     * GET /api/atenciones-clinicas/asegurado/{pkAsegurado}
     * Obtiene las atenciones de un asegurado (paginado)
     */
    @GetMapping("/asegurado/{pkAsegurado}")
    @CheckMBACPermission(pagina = "/atenciones-clinicas", accion = "ver")
    public ResponseEntity<Map<String, Object>> obtenerAtencionesPorAsegurado(
            @PathVariable String pkAsegurado,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        log.info("📋 GET /api/atenciones-clinicas/asegurado/{} - Página: {}, Tamaño: {}", pkAsegurado, page, size);

        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by("fechaAtencion").descending());
            Page<AtencionClinicaDTO> atenciones = atencionService.obtenerAtencionesPorAsegurado(pkAsegurado, pageable);

            Map<String, Object> response = new HashMap<>();
            response.put("content", atenciones.getContent());
            response.put("totalElements", atenciones.getTotalElements());
            response.put("totalPages", atenciones.getTotalPages());
            response.put("currentPage", atenciones.getNumber());
            response.put("pageSize", atenciones.getSize());

            log.info("✅ Se encontraron {} atenciones para el asegurado {}", atenciones.getTotalElements(), pkAsegurado);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Error al obtener atenciones del asegurado {}: {}", pkAsegurado, e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Error al obtener atenciones");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * GET /api/atenciones-clinicas/{id}
     * Obtiene el detalle completo de una atención
     */
    @GetMapping("/{id}")
    @CheckMBACPermission(pagina = "/atenciones-clinicas", accion = "ver")
    public ResponseEntity<Map<String, Object>> obtenerAtencionDetalle(@PathVariable Long id) {
        log.info("🔍 GET /api/atenciones-clinicas/{}", id);

        try {
            AtencionClinicaDTO atencion = atencionService.obtenerAtencionDetalle(id);

            Map<String, Object> response = new HashMap<>();
            response.put("data", atencion);
            response.put("message", "Atención obtenida exitosamente");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Error al obtener atención {}: {}", id, e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Error al obtener atención");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    /**
     * POST /api/atenciones-clinicas
     * Crea una nueva atención clínica
     */
    @PostMapping
    @CheckMBACPermission(pagina = "/atenciones-clinicas", accion = "crear")
    public ResponseEntity<Map<String, Object>> crearAtencion(
            @Valid @RequestBody AtencionClinicaCreateDTO dto,
            Authentication authentication) {

        log.info("➕ POST /api/atenciones-clinicas - Asegurado: {}", dto.getPkAsegurado());

        try {
            // Obtener ID del personal creador desde el Authentication
            Long idPersonalCreador = obtenerIdPersonalDeAuth(authentication);

            // Crear atención
            AtencionClinicaDTO atencionCreada = atencionService.crearAtencion(dto, idPersonalCreador);

            // Auditar
            auditLogService.registrarEvento(
                    obtenerUserIdDeAuth(authentication),
                    "CREATE",
                    "ATENCION_CLINICA",
                    atencionCreada.getIdAtencion(),
                    String.format("Atención creada para asegurado %s - Tipo: %s",
                            dto.getPkAsegurado(), atencionCreada.getNombreTipoAtencion())
            );

            Map<String, Object> response = new HashMap<>();
            response.put("data", atencionCreada);
            response.put("message", "Atención clínica creada exitosamente");

            log.info("✅ Atención clínica creada con ID: {}", atencionCreada.getIdAtencion());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (Exception e) {
            log.error("❌ Error al crear atención: {}", e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Error al crear atención");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * PUT /api/atenciones-clinicas/{id}
     * Actualiza una atención existente
     */
    @PutMapping("/{id}")
    @CheckMBACPermission(pagina = "/atenciones-clinicas", accion = "editar")
    public ResponseEntity<Map<String, Object>> actualizarAtencion(
            @PathVariable Long id,
            @Valid @RequestBody AtencionClinicaUpdateDTO dto,
            Authentication authentication) {

        log.info("✏️ PUT /api/atenciones-clinicas/{}", id);

        try {
            // Obtener ID del personal modificador y su rol
            Long idPersonalModificador = obtenerIdPersonalDeAuth(authentication);
            String rolUsuario = obtenerRolPrincipalDeAuth(authentication);

            // Actualizar atención
            AtencionClinicaDTO atencionActualizada = atencionService.actualizarAtencion(
                    id, dto, idPersonalModificador, rolUsuario);

            // Auditar
            auditLogService.registrarEvento(
                    obtenerUserIdDeAuth(authentication),
                    "UPDATE",
                    "ATENCION_CLINICA",
                    id,
                    String.format("Atención actualizada - Rol: %s", rolUsuario)
            );

            Map<String, Object> response = new HashMap<>();
            response.put("data", atencionActualizada);
            response.put("message", "Atención actualizada exitosamente");

            log.info("✅ Atención {} actualizada exitosamente", id);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Error al actualizar atención {}: {}", id, e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Error al actualizar atención");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * PUT /api/atenciones-clinicas/{id}/observacion-enfermeria
     * Agrega una observación de enfermería a una atención
     */
    @PutMapping("/{id}/observacion-enfermeria")
    @CheckMBACPermission(pagina = "/atenciones-clinicas", accion = "editar")
    public ResponseEntity<Map<String, Object>> agregarObservacionEnfermeria(
            @PathVariable Long id,
            @Valid @RequestBody ObservacionEnfermeriaDTO dto,
            Authentication authentication) {

        log.info("🩺 PUT /api/atenciones-clinicas/{}/observacion-enfermeria", id);

        try {
            // Verificar que el usuario tiene rol ENFERMERIA
            String rolUsuario = obtenerRolPrincipalDeAuth(authentication);
            if (!"ENFERMERIA".equals(rolUsuario)) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Acceso denegado");
                error.put("message", "Solo personal de enfermería puede agregar observaciones");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }

            Long idPersonal = obtenerIdPersonalDeAuth(authentication);

            // Agregar observación
            atencionService.agregarObservacionEnfermeria(id, dto, idPersonal);

            // Auditar
            auditLogService.registrarEvento(
                    obtenerUserIdDeAuth(authentication),
                    "UPDATE_ENFERMERIA",
                    "ATENCION_CLINICA",
                    id,
                    "Observación de enfermería agregada"
            );

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Observación de enfermería agregada exitosamente");

            log.info("✅ Observación de enfermería agregada a atención {}", id);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Error al agregar observación a atención {}: {}", id, e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Error al agregar observación");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * DELETE /api/atenciones-clinicas/{id}
     * Elimina una atención clínica (solo ADMIN/SUPERADMIN)
     */
    @DeleteMapping("/{id}")
    @CheckMBACPermission(pagina = "/atenciones-clinicas", accion = "eliminar")
    public ResponseEntity<Map<String, Object>> eliminarAtencion(
            @PathVariable Long id,
            Authentication authentication) {

        log.info("🗑️ DELETE /api/atenciones-clinicas/{}", id);

        try {
            // Eliminar atención
            atencionService.eliminarAtencion(id);

            // Auditar
            auditLogService.registrarEvento(
                    obtenerUserIdDeAuth(authentication),
                    "DELETE",
                    "ATENCION_CLINICA",
                    id,
                    "Atención clínica eliminada"
            );

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Atención eliminada exitosamente");

            log.info("✅ Atención {} eliminada exitosamente", id);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Error al eliminar atención {}: {}", id, e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Error al eliminar atención");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * GET /api/atenciones-clinicas/mis-atenciones
     * Obtiene las atenciones creadas por el médico actual
     */
    @GetMapping("/mis-atenciones")
    @CheckMBACPermission(pagina = "/atenciones-clinicas", accion = "ver")
    public ResponseEntity<Map<String, Object>> obtenerMisAtenciones(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {

        log.info("👨‍⚕️ GET /api/atenciones-clinicas/mis-atenciones - Página: {}, Tamaño: {}", page, size);

        try {
            Long idPersonal = obtenerIdPersonalDeAuth(authentication);
            Pageable pageable = PageRequest.of(page, size, Sort.by("fechaAtencion").descending());
            Page<AtencionClinicaDTO> atenciones = atencionService.obtenerAtencionesPorProfesional(idPersonal, pageable);

            Map<String, Object> response = new HashMap<>();
            response.put("content", atenciones.getContent());
            response.put("totalElements", atenciones.getTotalElements());
            response.put("totalPages", atenciones.getTotalPages());
            response.put("currentPage", atenciones.getNumber());

            log.info("✅ Se encontraron {} atenciones del profesional {}", atenciones.getTotalElements(), idPersonal);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Error al obtener mis atenciones: {}", e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Error al obtener atenciones");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // ========== MÉTODOS AUXILIARES ==========

    private Long obtenerUserIdDeAuth(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof org.springframework.security.core.userdetails.UserDetails) {
            org.springframework.security.core.userdetails.UserDetails userDetails =
                    (org.springframework.security.core.userdetails.UserDetails) authentication.getPrincipal();
            // Asumiendo que username es el ID del usuario
            return Long.parseLong(userDetails.getUsername());
        }
        return null;
    }

    private Long obtenerIdPersonalDeAuth(Authentication authentication) {
        // Obtener del UserDetails o de los claims del JWT
        // Por ahora retornamos el mismo ID del usuario
        return obtenerUserIdDeAuth(authentication);
    }

    private String obtenerRolPrincipalDeAuth(Authentication authentication) {
        if (authentication != null && authentication.getAuthorities() != null) {
            return authentication.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .filter(role -> role.startsWith("ROLE_"))
                    .map(role -> role.substring(5)) // Quitar prefijo "ROLE_"
                    .findFirst()
                    .orElse("USER");
        }
        return "USER";
    }
}

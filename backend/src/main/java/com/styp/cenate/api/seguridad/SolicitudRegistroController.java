package com.styp.cenate.api.seguridad;

import com.styp.cenate.dto.SolicitudRegistroDTO;
import com.styp.cenate.service.solicitud.AccountRequestService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
@Slf4j
@RequiredArgsConstructor
public class SolicitudRegistroController {

    private final AccountRequestService accountRequestService;

    @PostMapping("/auth/solicitar-registro")
    public ResponseEntity<?> crearSolicitud(@RequestBody SolicitudRegistroDTO dto) {
        try {
            log.info("Nueva solicitud de registro: {} {}", dto.getNombres(), dto.getApellidoPaterno());
            
            SolicitudRegistroDTO solicitudCreada = accountRequestService.crearSolicitud(dto);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "message", "Solicitud de registro creada exitosamente",
                    "solicitud", solicitudCreada
            ));
            
        } catch (RuntimeException e) {
            log.error("Error al crear solicitud: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "error", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("Error inesperado al crear solicitud", e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Error al procesar la solicitud"
            ));
        }
    }

    @GetMapping("/admin/solicitudes-registro")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<List<SolicitudRegistroDTO>> listarTodasSolicitudes() {
        log.info("Listando todas las solicitudes de registro");
        return ResponseEntity.ok(accountRequestService.listarTodasLasSolicitudes());
    }

    @GetMapping("/admin/solicitudes-registro/pendientes")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<List<SolicitudRegistroDTO>> listarSolicitudesPendientes() {
        log.info("Listando solicitudes pendientes");
        return ResponseEntity.ok(accountRequestService.listarSolicitudesPendientes());
    }

    @GetMapping("/admin/solicitudes-registro/estadisticas")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<Map<String, Long>> obtenerEstadisticas() {
        log.info("Obteniendo estadisticas de solicitudes");
        return ResponseEntity.ok(accountRequestService.obtenerEstadisticas());
    }

    @GetMapping("/admin/solicitudes-registro/{id}/validar-usuario")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<?> validarExistenciaUsuario(@PathVariable Long id) {
        try {
            log.info("Validando existencia de usuario para solicitud ID: {}", id);
            return ResponseEntity.ok(accountRequestService.validarExistenciaUsuario(id));
        } catch (RuntimeException e) {
            log.warn("Error al validar usuario: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "error", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("Error inesperado al validar usuario", e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Error al validar usuario"
            ));
        }
    }

    @PutMapping("/admin/solicitudes-registro/{id}/aprobar")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<?> aprobarSolicitud(@PathVariable Long id) {
        try {
            log.info("Aprobando solicitud ID: *********************** {}", id);
            
            SolicitudRegistroDTO solicitud = accountRequestService.aprobarSolicitud(id);
            
            return ResponseEntity.ok(Map.of(
                    "message", "Solicitud aprobada y usuario creado exitosamente",
                    "solicitud", solicitud
            ));
            
        } catch (RuntimeException e) {
            log.error("Error al aprobar solicitud: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "error", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("Error inesperado al aprobar solicitud", e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Error al procesar la solicitud"
            ));
        }
    }

    @PutMapping("/admin/solicitudes-registro/{id}/rechazar")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<?> rechazarSolicitud(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        try {
            String motivoRechazo = body.getOrDefault("motivo", "Sin motivo especificado");

            log.info("Rechazando solicitud ID: {}", id);

            SolicitudRegistroDTO solicitud = accountRequestService.rechazarSolicitud(id, motivoRechazo);

            return ResponseEntity.ok(Map.of(
                    "message", "Solicitud rechazada exitosamente",
                    "solicitud", solicitud
            ));

        } catch (RuntimeException e) {
            log.error("Error al rechazar solicitud: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "error", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("Error inesperado al rechazar solicitud", e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Error al procesar la solicitud"
            ));
        }
    }

    // ================================================================
    // ENDPOINTS PARA USUARIOS PENDIENTES DE ACTIVACIÓN
    // ================================================================

    /**
     * Lista usuarios que fueron aprobados pero aún no han activado su cuenta
     * (requiere_cambio_password = true)
     */
    @GetMapping("/admin/usuarios/pendientes-activacion")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<?> listarUsuariosPendientesActivacion() {
        try {
            log.info("Listando usuarios pendientes de activación");
            return ResponseEntity.ok(accountRequestService.listarUsuariosPendientesActivacion());
        } catch (Exception e) {
            log.error("Error al listar usuarios pendientes: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Error al obtener usuarios pendientes"
            ));
        }
    }

    /**
     * Lista usuarios pendientes filtrados por Red ID
     * GET /api/admin/usuarios/pendientes-activacion/por-red/{idRed}
     */
    @GetMapping("/admin/usuarios/pendientes-activacion/por-red/{idRed}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<?> listarUsuariosPendientesPorRed(@PathVariable Long idRed) {
        try {
            log.info("Listando usuarios pendientes de activación para Red ID: {}", idRed);
            return ResponseEntity.ok(accountRequestService.listarUsuariosPendientesPorRed(idRed));
        } catch (Exception e) {
            log.error("Error al listar usuarios pendientes por red: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Error al obtener usuarios pendientes"
            ));
        }
    }

    /**
     * Lista usuarios pendientes filtrados por Macrorregión ID
     * GET /api/admin/usuarios/pendientes-activacion/por-macroregion/{idMacroregion}
     */
    @GetMapping("/admin/usuarios/pendientes-activacion/por-macroregion/{idMacroregion}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<?> listarUsuariosPendientesPorMacroregion(@PathVariable Long idMacroregion) {
        try {
            log.info("Listando usuarios pendientes de activación para Macrorregión ID: {}", idMacroregion);
            return ResponseEntity.ok(accountRequestService.listarUsuariosPendientesPorMacroregion(idMacroregion));
        } catch (Exception e) {
            log.error("Error al listar usuarios pendientes por macrorregión: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Error al obtener usuarios pendientes"
            ));
        }
    }

    /**
     * Reenvía el email de activación a un usuario específico
     */
    @PostMapping("/admin/usuarios/{idUsuario}/reenviar-activacion")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<?> reenviarEmailActivacion(
            @PathVariable Long idUsuario,
            @RequestBody(required = false) Map<String, String> body) {
        try {
            // Obtener tipo de correo del body (PERSONAL o CORPORATIVO)
            // Si no se especifica, se usará el comportamiento por defecto (priorizar personal)
            String tipoCorreo = body != null ? body.get("tipoCorreo") : null;

            log.info("Reenviando email de activación a usuario ID: {} - Tipo: {}",
                    idUsuario, tipoCorreo != null ? tipoCorreo : "DEFAULT");

            boolean enviado = accountRequestService.reenviarEmailActivacion(idUsuario, tipoCorreo);

            if (enviado) {
                return ResponseEntity.ok(Map.of(
                        "message", "Email de activación reenviado exitosamente",
                        "success", true
                ));
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "No se pudo enviar el email de activación",
                        "success", false
                ));
            }

        } catch (RuntimeException e) {
            log.error("Error al reenviar email: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "error", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("Error inesperado al reenviar email", e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Error al procesar la solicitud"
            ));
        }
    }

    /**
     * Elimina un usuario pendiente de activación para que pueda volver a registrarse.
     * Solo elimina usuarios que tienen requiere_cambio_password = true (nunca activaron su cuenta)
     */
    @DeleteMapping("/admin/usuarios/{idUsuario}/pendiente-activacion")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<?> eliminarUsuarioPendiente(@PathVariable Long idUsuario) {
        try {
            log.info("Eliminando usuario pendiente de activación ID: {}", idUsuario);

            accountRequestService.eliminarUsuarioPendienteActivacion(idUsuario);

            return ResponseEntity.ok(Map.of(
                    "message", "Usuario eliminado exitosamente. Ahora puede volver a registrarse.",
                    "success", true
            ));

        } catch (RuntimeException e) {
            log.error("Error al eliminar usuario: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "error", e.getMessage(),
                    "success", false
            ));
        } catch (Exception e) {
            log.error("Error inesperado al eliminar usuario", e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Error al procesar la solicitud"
            ));
        }
    }

    // ================================================================
    // ENDPOINTS PARA LIMPIEZA DE DATOS HUÉRFANOS
    // ================================================================

    /**
     * Verifica si existen datos huérfanos para un número de documento.
     * Útil para diagnosticar por qué un usuario no puede registrarse.
     */
    @GetMapping("/admin/datos-huerfanos/{numDocumento}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<?> verificarDatosHuerfanos(@PathVariable String numDocumento) {
        try {
            log.info("Verificando datos existentes para documento: {}", numDocumento);
            Map<String, Object> resultado = accountRequestService.verificarDatosExistentes(numDocumento);
            return ResponseEntity.ok(resultado);

        } catch (Exception e) {
            log.error("Error al verificar datos: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Error al verificar datos existentes"
            ));
        }
    }

    /**
     * Limpia todos los datos huérfanos de un número de documento.
     * Elimina registros en todas las tablas relacionadas y permite el re-registro.
     */
    @DeleteMapping("/admin/datos-huerfanos/{numDocumento}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<?> limpiarDatosHuerfanos(@PathVariable String numDocumento) {
        try {
            log.info("Limpiando datos huérfanos para documento: {}", numDocumento);
            Map<String, Object> resultado = accountRequestService.limpiarDatosHuerfanos(numDocumento);
            return ResponseEntity.ok(resultado);

        } catch (Exception e) {
            log.error("Error al limpiar datos: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Error al limpiar datos huérfanos"
            ));
        }
    }
}

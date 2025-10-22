package com.styp.cenate.api.mbac;
import lombok.extern.slf4j.Slf4j;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.styp.cenate.dto.mbac.CheckPermisoRequestDTO;
import com.styp.cenate.dto.mbac.CheckPermisoResponseDTO;
import com.styp.cenate.dto.mbac.PermisoUsuarioResponseDTO;
import com.styp.cenate.service.mbac.PermisosService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controlador REST para la gestión de permisos modulares (MBAC).
 * 
 * Proporciona endpoints para:
 * - Consultar permisos de usuarios
 * - Verificar permisos específicos
 * - Obtener módulos y páginas accesibles
 * 
 * @author CENATE Development Team
 * @version 1.0
 */
@RestController
@RequestMapping("/api/permisos")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Permisos MBAC", description = "Gestión de permisos modulares basados en roles")
@SecurityRequirement(name = "bearerAuth")
public class PermisosController {

    private final PermisosService permisosService;

    /**
     * Obtiene todos los permisos activos de un usuario por ID.
     * 
     * GET /api/permisos/usuario/{id}
     */
    @Operation(
        summary = "Obtener permisos de usuario por ID",
        description = "Retorna todos los permisos activos del usuario especificado, " +
                      "agrupados por rol, módulo y página"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Permisos obtenidos exitosamente",
            content = @Content(schema = @Schema(implementation = PermisoUsuarioResponseDTO.class))
        ),
        @ApiResponse(responseCode = "404", description = "Usuario no encontrado o sin permisos"),
        @ApiResponse(responseCode = "401", description = "No autorizado"),
        @ApiResponse(responseCode = "403", description = "Acceso denegado")
    })
    @GetMapping("/usuario/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<List<PermisoUsuarioResponseDTO>> obtenerPermisosPorUsuario(
            @Parameter(description = "ID del usuario", required = true, example = "1")
            @PathVariable("id") Long id) {
        
        log.info("GET /api/permisos/usuario/{} - Consultando permisos", id);
        List<PermisoUsuarioResponseDTO> permisos = permisosService.obtenerPermisosPorUsuario(id);
        return ResponseEntity.ok(permisos);
    }

    /**
     * Obtiene todos los permisos activos de un usuario por username.
     * 
     * GET /api/permisos/usuario/username/{username}
     */
    @Operation(
        summary = "Obtener permisos de usuario por username",
        description = "Retorna todos los permisos activos del usuario especificado por su nombre de usuario"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Permisos obtenidos exitosamente"),
        @ApiResponse(responseCode = "404", description = "Usuario no encontrado"),
        @ApiResponse(responseCode = "401", description = "No autorizado")
    })
    @GetMapping("/usuario/username/{username}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<List<PermisoUsuarioResponseDTO>> obtenerPermisosPorUsername(
            @Parameter(description = "Nombre de usuario", required = true, example = "jperez")
            @PathVariable("username") String username) {
        
        log.info("GET /api/permisos/usuario/username/{} - Consultando permisos", username);
        List<PermisoUsuarioResponseDTO> permisos = permisosService.obtenerPermisosPorUsername(username);
        return ResponseEntity.ok(permisos);
    }

    /**
     * Obtiene los permisos de un usuario en un módulo específico.
     * 
     * GET /api/permisos/usuario/{userId}/modulo/{idModulo}
     */
    @Operation(
        summary = "Obtener permisos de usuario en un módulo",
        description = "Retorna los permisos del usuario para un módulo específico"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Permisos obtenidos exitosamente"),
        @ApiResponse(responseCode = "404", description = "Usuario o módulo no encontrado"),
        @ApiResponse(responseCode = "401", description = "No autorizado")
    })
    @GetMapping("/usuario/{userId}/modulo/{idModulo}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'MEDICO', 'ENFERMERO')")
    public ResponseEntity<List<PermisoUsuarioResponseDTO>> obtenerPermisosPorUsuarioYModulo(
            @Parameter(description = "ID del usuario", required = true)
            @PathVariable("userId") Long userId,
            @Parameter(description = "ID del módulo", required = true)
            @PathVariable("idModulo") Integer idModulo) {
        
        log.info("GET /api/permisos/usuario/{}/modulo/{} - Consultando permisos", userId, idModulo);
        List<PermisoUsuarioResponseDTO> permisos = permisosService.obtenerPermisosPorUsuarioYModulo(userId, idModulo);
        return ResponseEntity.ok(permisos);
    }

    /**
     * Verifica si un usuario tiene un permiso específico.
     * 
     * POST /api/permisos/check
     */
    @Operation(
        summary = "Verificar permiso específico",
        description = "Verifica si un usuario tiene permiso para realizar una acción en una página específica"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Verificación realizada exitosamente"),
        @ApiResponse(responseCode = "400", description = "Datos de entrada inválidos"),
        @ApiResponse(responseCode = "401", description = "No autorizado")
    })
    @PostMapping("/check")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CheckPermisoResponseDTO> verificarPermiso(
            @Parameter(description = "Datos del permiso a verificar", required = true)
            @Valid @RequestBody CheckPermisoRequestDTO request) {
        
        log.info("POST /api/permisos/check - Usuario: {}, Página: {}, Acción: {}", 
                 request.getUserId(), request.getRutaPagina(), request.getAccion());
        
        CheckPermisoResponseDTO response = permisosService.verificarPermiso(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Obtiene todos los módulos a los que un usuario tiene acceso.
     * 
     * GET /api/permisos/usuario/{userId}/modulos
     */
    @Operation(
        summary = "Obtener módulos accesibles",
        description = "Retorna la lista de módulos a los que el usuario tiene acceso"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Módulos obtenidos exitosamente"),
        @ApiResponse(responseCode = "401", description = "No autorizado")
    })
    @GetMapping("/usuario/{userId}/modulos")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> obtenerModulosAccesibles(
            @Parameter(description = "ID del usuario", required = true)
            @PathVariable("userId") Long userId) {
        
        log.info("GET /api/permisos/usuario/{}/modulos - Obteniendo módulos accesibles", userId);
        
        List<String> modulos = permisosService.obtenerModulosAccesiblesUsuario(userId);
        
        Map<String, Object> response = new HashMap<>();
        response.put("userId", userId);
        response.put("modulos", modulos);
        response.put("total", modulos.size());
        
        return ResponseEntity.ok(response);
    }

    /**
     * Obtiene todas las páginas de un módulo a las que un usuario tiene acceso.
     * 
     * GET /api/permisos/usuario/{userId}/modulo/{idModulo}/paginas
     */
    @Operation(
        summary = "Obtener páginas accesibles de un módulo",
        description = "Retorna la lista de páginas del módulo a las que el usuario tiene acceso"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Páginas obtenidas exitosamente"),
        @ApiResponse(responseCode = "401", description = "No autorizado")
    })
    @GetMapping("/usuario/{userId}/modulo/{idModulo}/paginas")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> obtenerPaginasAccesibles(
            @Parameter(description = "ID del usuario", required = true)
            @PathVariable("userId") Long userId,
            @Parameter(description = "ID del módulo", required = true)
            @PathVariable("idModulo") Integer idModulo) {
        
        log.info("GET /api/permisos/usuario/{}/modulo/{}/paginas - Obteniendo páginas accesibles", 
                 userId, idModulo);
        
        List<String> paginas = permisosService.obtenerPaginasAccesiblesUsuario(userId, idModulo);
        
        Map<String, Object> response = new HashMap<>();
        response.put("userId", userId);
        response.put("idModulo", idModulo);
        response.put("paginas", paginas);
        response.put("total", paginas.size());
        
        return ResponseEntity.ok(response);
    }

    /**
     * Health check del servicio de permisos.
     * 
     * GET /api/permisos/health
     */
    @Operation(
        summary = "Health check",
        description = "Verifica que el servicio de permisos esté funcionando correctamente"
    )
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        Map<String, String> health = new HashMap<>();
        health.put("status", "UP");
        health.put("service", "PermisosService");
        health.put("timestamp", java.time.LocalDateTime.now().toString());
        return ResponseEntity.ok(health);
    }
}

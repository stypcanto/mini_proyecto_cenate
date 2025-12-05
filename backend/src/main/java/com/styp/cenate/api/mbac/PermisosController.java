// ============================================================================
// 🧩 PermisosController.java – Controlador REST MBAC/RBAC (CENATE 2025)
// ----------------------------------------------------------------------------
// Gestiona todos los permisos MBAC: consultas, creación, edición, verificación,
// y compatibilidad con la vista vw_permisos_usuario_activos.
// Integrado con React MBAC Panel (frontend).
// ============================================================================

package com.styp.cenate.api.mbac;

import com.styp.cenate.dto.mbac.*;
import com.styp.cenate.model.Permiso;
import com.styp.cenate.service.mbac.PermisosService;
import com.styp.cenate.service.permiso.PermisoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/permisos")  // ✅ Corregido: cambiado de /api/mbac/permisos a /api/permisos
@CrossOrigin(origins = {
        "http://localhost:3000",
        "http://localhost:5173",
        "http://10.0.89.13:3000",
        "http://10.0.89.13:5173",
        "http://localhost:80",
        "http://10.0.89.13:80"
})
public class PermisosController {

    private final PermisosService permisosService;
    private final PermisoService permisoService; // Compatibilidad con backend RBAC base

    // ============================================================
    // 🟢 0. Health Check
    // ============================================================
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        log.info("✅ Health check solicitado");
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "PermisosController RBAC",
                "version", "1.0",
                "timestamp", java.time.LocalDateTime.now().toString()
        ));
    }

    // ============================================================
    // 🔹 1. LISTAR PERMISOS POR USUARIO (username o ID) - ENDPOINT PRINCIPAL
    // ============================================================
    @GetMapping("/usuario/{userIdentifier}")
    public ResponseEntity<List<PermisoUsuarioResponseDTO>> obtenerPermisosPorUsuario(
            @PathVariable("userIdentifier") String userIdentifier) {
        log.info("📥 [MBAC] GET /api/permisos/usuario/{}", userIdentifier);
        
        try {
            // Intentar parsear como ID numérico
            Long userId = Long.parseLong(userIdentifier);
            log.info("🔍 Buscando permisos por ID: {}", userId);
            List<PermisoUsuarioResponseDTO> permisos = permisosService.obtenerPermisosPorUsuario(userId);
            log.info("Pemisos: {}", permisos.toString());
            log.info("✅ Permisos encontrados por ID: {} registros", permisos.size());
            return ResponseEntity.ok(permisos);
        } catch (NumberFormatException e) {
            // Si no es número, buscar por username
            log.info("🔍 Buscando permisos por username: {}", userIdentifier);
            List<PermisoUsuarioResponseDTO> permisos = permisosService.obtenerPermisosPorUsername(userIdentifier);
            log.info("✅ Permisos encontrados por username: {} registros", permisos.size());
            return ResponseEntity.ok(permisos);
        } catch (Exception e) {
            log.error("❌ Error obteniendo permisos para: {}", userIdentifier, e);
            throw e;
        }
    }

    // ============================================================
    // 🔹 2. OBTENER PERMISOS POR USERNAME (ruta específica)
    // ============================================================
    @GetMapping("/usuario/nombre/{username}")
    public ResponseEntity<List<PermisoUsuarioResponseDTO>> obtenerPermisosPorUsername(@PathVariable String username) {
        log.info("📥 [MBAC] GET /api/permisos/usuario/nombre/{}", username);
        List<PermisoUsuarioResponseDTO> permisos = permisosService.obtenerPermisosPorUsername(username);
        log.info("✅ {} permisos encontrados para {}", permisos.size(), username);
        return ResponseEntity.ok(permisos);
    }

    // ============================================================
    // 🔹 3. CREAR NUEVO PERMISO
    // ============================================================
    @PostMapping
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<PermisoUsuarioResponseDTO> crearPermiso(
            @Valid @RequestBody PermisoUsuarioRequestDTO request) {
        log.info("🆕 [MBAC] POST /api/permisos -> Creando permiso {}", request);
        PermisoUsuarioResponseDTO creado = permisosService.crearPermiso(request);
        return ResponseEntity.ok(creado);
    }

    // ============================================================
    // 🔹 3b. GUARDAR O ACTUALIZAR PERMISO (UPSERT)
    // ============================================================
    @PostMapping("/upsert")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<PermisoUsuarioResponseDTO> guardarOActualizarPermiso(
            @RequestBody PermisoUsuarioRequestDTO request) {
        log.info("🔄 [MBAC] POST /api/permisos/upsert -> Guardando o actualizando permiso");
        PermisoUsuarioResponseDTO resultado = permisosService.guardarOActualizarPermiso(request);
        return ResponseEntity.ok(resultado);
    }

    // ============================================================
    // 🔹 3c. GUARDAR PERMISOS EN BATCH PARA UN USUARIO
    // ============================================================
    @PostMapping("/batch/{userId}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<List<PermisoUsuarioResponseDTO>> guardarPermisosBatch(
            @PathVariable Long userId,
            @RequestBody List<PermisoUsuarioRequestDTO> permisos) {
        log.info("📦 [MBAC] POST /api/permisos/batch/{} -> Guardando {} permisos", userId, permisos.size());
        List<PermisoUsuarioResponseDTO> resultados = permisosService.guardarPermisosBatch(userId, permisos);
        return ResponseEntity.ok(resultados);
    }

    // ============================================================
    // 🔹 4. ACTUALIZAR PERMISO EXISTENTE
    // ============================================================
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<PermisoUsuarioResponseDTO> actualizarPermiso(
            @PathVariable Integer id,
            @Valid @RequestBody PermisoUsuarioRequestDTO request) {
        log.info("✏️ [MBAC] PUT /api/permisos/{} -> Actualizando permiso", id);
        PermisoUsuarioResponseDTO actualizado = permisosService.actualizarPermiso(id, request);
        return ResponseEntity.ok(actualizado);
    }

    // ============================================================
    // 🔹 5. ACTUALIZAR CAMPOS ESPECÍFICOS (modo granular)
    // ============================================================
    @PutMapping("/editar/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<Permiso> updateCamposPermiso(
            @PathVariable Long id,
            @RequestBody Map<String, Object> cambios) {
        log.info("🧩 Actualizando campos específicos del permiso {}", id);
        Permiso actualizado = permisoService.updateCamposPermiso(id, cambios);
        return ResponseEntity.ok(actualizado);
    }

    // ============================================================
    // 🔹 6. ELIMINAR PERMISO
    // ============================================================
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<Void> eliminarPermiso(@PathVariable Integer id) {
        log.warn("🗑️ [MBAC] DELETE /api/permisos/{} -> Eliminando permiso", id);
        permisosService.eliminarPermiso(id);
        return ResponseEntity.noContent().build();
    }

    // ============================================================
    // 🔹 7. LISTAR TODOS LOS PERMISOS (solo administración)
    // ============================================================
    @GetMapping
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<List<PermisoUsuarioResponseDTO>> listarPermisos() {
        log.info("📋 [MBAC] GET /api/permisos -> Listando permisos");
        List<PermisoUsuarioResponseDTO> permisos = permisosService.listarPermisos();
        return ResponseEntity.ok(permisos);
    }

    // ============================================================
    // 🔹 8. CONSULTAR PERMISOS POR MÓDULO (usuario + módulo)
    // ============================================================
    @GetMapping("/usuario/{userIdentifier}/modulos")
    public ResponseEntity<List<ModuloSistemaResponse>> obtenerModulosAccesiblesUsuario(
            @PathVariable String userIdentifier) {
        log.info("📦 [MBAC] GET /api/permisos/usuario/{}/modulos", userIdentifier);
        
        try {
            Long userId = Long.parseLong(userIdentifier);
            List<ModuloSistemaResponse> modulos = permisosService.obtenerModulosAccesiblesUsuario(userId);
            return ResponseEntity.ok(modulos);
        } catch (NumberFormatException e) {
            // Si es username, convertir a ID primero
            Long userId = permisosService.obtenerUserIdPorUsername(userIdentifier);
            if (userId == null) {
                throw new RuntimeException("Usuario no encontrado: " + userIdentifier);
            }
            List<ModuloSistemaResponse> modulos = permisosService.obtenerModulosAccesiblesUsuario(userId);
            return ResponseEntity.ok(modulos);
        }
    }

    // ============================================================
    // 🔹 9. CONSULTAR PERMISOS POR USUARIO Y MÓDULO
    // ============================================================
    @GetMapping("/usuario/{userId}/modulo/{idModulo}")
    public ResponseEntity<List<PermisoUsuarioResponseDTO>> obtenerPermisosPorUsuarioYModulo(
            @PathVariable Long userId, @PathVariable Long idModulo) {
        log.info("📥 [MBAC] GET /api/permisos/usuario/{}/modulo/{}", userId, idModulo);
        List<PermisoUsuarioResponseDTO> permisos =
                permisosService.obtenerPermisosPorUsuarioYModulo(userId, idModulo);
        return ResponseEntity.ok(permisos);
    }

    // ============================================================
    // 🔹 10. LISTAR PÁGINAS ACCESIBLES DENTRO DE UN MÓDULO
    // ============================================================
    @GetMapping("/usuario/{userId}/modulo/{idModulo}/paginas")
    public ResponseEntity<List<PaginaModuloResponse>> obtenerPaginasAccesiblesUsuario(
            @PathVariable Long userId, @PathVariable Long idModulo) {
        log.info("📑 [MBAC] GET /api/permisos/usuario/{}/modulo/{}/paginas", userId, idModulo);
        List<PaginaModuloResponse> paginas =
                permisosService.obtenerPaginasAccesiblesUsuario(userId, idModulo);
        return ResponseEntity.ok(paginas);
    }

    // ============================================================
    // 🔹 11. VERIFICAR PERMISO ESPECÍFICO (botones/acciones) - POST
    // ============================================================
    @PostMapping("/check")
    public ResponseEntity<CheckPermisoResponseDTO> verificarPermisoPost(
            @Valid @RequestBody CheckPermisoRequestDTO request) {
        log.info("📤 [MBAC] POST /api/permisos/check -> userId={}, ruta={}, accion={}", 
                request.getIdUser(), request.getRutaPagina(), request.getAccion());
        
        try {
            CheckPermisoResponseDTO response = permisosService.verificarPermiso(request);
            log.info("✅ Verificación completada: permitido={}", response.getPermitido());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("❌ Error verificando permiso", e);
            throw e;
        }
    }

    // ============================================================
    // 🔹 12. VALIDAR PERMISO DE ACCIÓN (alias rápido) - GET
    // ============================================================
    @GetMapping("/check/{userIdentifier}")
    public ResponseEntity<Boolean> validarPermisoRapido(
            @PathVariable String userIdentifier,
            @RequestParam String ruta,
            @RequestParam String accion) {
        log.info("🔍 [MBAC] GET /api/permisos/check/{} -> ruta={}, accion={}", userIdentifier, ruta, accion);

        try {
            Long userId = Long.parseLong(userIdentifier);
            boolean tienePermiso = permisosService.validarPermiso(userId, ruta, accion);
            return ResponseEntity.ok(tienePermiso);
        } catch (NumberFormatException e) {
            Long userId = permisosService.obtenerUserIdPorUsername(userIdentifier);
            if (userId == null) {
                return ResponseEntity.ok(false);
            }
            boolean tienePermiso = permisosService.validarPermiso(userId, ruta, accion);
            return ResponseEntity.ok(tienePermiso);
        }
    }

    // ============================================================
    // 🔹 13. OBTENER PERMISOS PREDETERMINADOS POR ROLES
    // ============================================================
    @PostMapping("/roles/predeterminados")
    public ResponseEntity<List<PermisoUsuarioResponseDTO>> obtenerPermisosPredefiidosPorRoles(
            @RequestBody List<String> nombresRoles) {
        log.info("📦 [MBAC] POST /api/permisos/roles/predeterminados -> roles={}", nombresRoles);

        try {
            List<PermisoUsuarioResponseDTO> permisos = permisosService.obtenerPermisosPredefiidosPorRoles(nombresRoles);
            log.info("✅ {} permisos predeterminados encontrados para roles: {}", permisos.size(), nombresRoles);
            return ResponseEntity.ok(permisos);
        } catch (Exception e) {
            log.error("❌ Error obteniendo permisos predeterminados para roles: {}", nombresRoles, e);
            throw e;
        }
    }
}

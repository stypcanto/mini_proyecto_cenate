package com.styp.cenate.api.mbac;
import lombok.Data;

import com.styp.cenate.dto.mbac.CheckPermisoRequestDTO;
import com.styp.cenate.dto.mbac.CheckPermisoResponseDTO;
import com.styp.cenate.dto.mbac.ModuloSistemaResponse;
import com.styp.cenate.dto.mbac.PaginaModuloResponse;
import com.styp.cenate.dto.mbac.PermisoUsuarioResponseDTO;
import com.styp.cenate.service.mbac.PermisosService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 🎯 Controlador REST para gestionar permisos de usuario en el sistema MBAC.
 * -------------------------------------------------------------
 * Este controlador consulta permisos activos, verifica accesos
 * y lista módulos o páginas accesibles para el usuario autenticado.
 *
 * Autor: CENATE Development Team
 * Versión: 1.2 (actualizado)
 */
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/mbac/permisos")
@Data
public class PermisosController {

    private final PermisosService permisosService;

    // ============================================================
    // 🔹 CONSULTAR PERMISOS POR ID DE USUARIO
    // ============================================================
    @GetMapping("/usuario/{id}")
    public ResponseEntity<List<PermisoUsuarioResponseDTO>> obtenerPermisosPorUsuario(@PathVariable Long id) {
        log.info("📥 GET /api/mbac/permisos/usuario/{}", id);
        List<PermisoUsuarioResponseDTO> permisos = permisosService.obtenerPermisosPorUsuario(id);
        return ResponseEntity.ok(permisos);
    }

    // ============================================================
    // 🔹 CONSULTAR PERMISOS POR USERNAME
    // ============================================================
    @GetMapping("/usuario/nombre/{username}")
    public ResponseEntity<List<PermisoUsuarioResponseDTO>> obtenerPermisosPorUsername(@PathVariable String username) {
        log.info("📥 GET /api/mbac/permisos/usuario/nombre/{}", username);
        List<PermisoUsuarioResponseDTO> permisos = permisosService.obtenerPermisosPorUsername(username);
        return ResponseEntity.ok(permisos);
    }

    // ============================================================
    // 🔹 CONSULTAR PERMISOS POR USUARIO Y MÓDULO
    // ============================================================
    @GetMapping("/usuario/{userId}/modulo/{idModulo}")
    public ResponseEntity<List<PermisoUsuarioResponseDTO>> obtenerPermisosPorUsuarioYModulo(
            @PathVariable Long userId, @PathVariable Integer idModulo) {
        log.info("📥 GET /api/mbac/permisos/usuario/{}/modulo/{}", userId, idModulo);
        List<PermisoUsuarioResponseDTO> permisos =
                permisosService.obtenerPermisosPorUsuarioYModulo(userId, idModulo);
        return ResponseEntity.ok(permisos);
    }

    // ============================================================
    // 🔹 VERIFICAR PERMISO ESPECÍFICO (para botones, acciones, etc.)
    // ============================================================
    @PostMapping("/verificar")
    public ResponseEntity<CheckPermisoResponseDTO> verificarPermiso(
            @Valid @RequestBody CheckPermisoRequestDTO request) {
        log.info("📤 POST /api/mbac/permisos/verificar: {}", request);
        CheckPermisoResponseDTO response = permisosService.verificarPermiso(request);
        return ResponseEntity.ok(response);
    }

    // ============================================================
    // 🔹 LISTAR MÓDULOS ACCESIBLES POR USUARIO
    // ============================================================
    @GetMapping("/usuario/{userId}/modulos")
    public ResponseEntity<List<ModuloSistemaResponse>> obtenerModulosAccesiblesUsuario(
            @PathVariable Long userId) {
        log.info("📦 GET /api/mbac/permisos/usuario/{}/modulos", userId);
        List<ModuloSistemaResponse> modulos = permisosService.obtenerModulosAccesiblesUsuario(userId);
        return ResponseEntity.ok(modulos);
    }

    // ============================================================
    // 🔹 LISTAR PÁGINAS ACCESIBLES DENTRO DE UN MÓDULO
    // ============================================================
    @GetMapping("/usuario/{userId}/modulo/{idModulo}/paginas")
    public ResponseEntity<List<PaginaModuloResponse>> obtenerPaginasAccesiblesUsuario(
            @PathVariable Long userId, @PathVariable Integer idModulo) {
        log.info("📑 GET /api/mbac/permisos/usuario/{}/modulo/{}/paginas", userId, idModulo);
        List<PaginaModuloResponse> paginas = permisosService.obtenerPaginasAccesiblesUsuario(userId, idModulo);
        return ResponseEntity.ok(paginas);
    }
}
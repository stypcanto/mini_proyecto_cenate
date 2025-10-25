package com.styp.cenate.api.mbac;

import com.styp.cenate.dto.mbac.*;
import com.styp.cenate.service.mbac.PermisosService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * ============================================================================
 * 🎯 CONTROLADOR MBAC – GESTIÓN DE PERMISOS DE USUARIO
 * ----------------------------------------------------------------------------
 * Control centralizado para manejar:
 *   • Permisos de usuario (por ID o username)
 *   • Permisos por módulo y página
 *   • Módulos y páginas accesibles
 *   • Verificación puntual de permisos (acciones, botones, etc.)
 *
 * Autor  : Equipo de Desarrollo CENATE
 * Versión: 2.0 (Actualizado con soporte a vistas dim_modulo / dim_pagina)
 * Fecha  : Octubre 2025
 * ============================================================================
 */
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/mbac/permisos")
public class PermisosController {

    private final PermisosService permisosService;

    // ============================================================
    // 🔹 1. CONSULTAR PERMISOS POR ID DE USUARIO
    // ============================================================
    @GetMapping("/usuario/{id}")
    public ResponseEntity<List<PermisoUsuarioResponseDTO>> obtenerPermisosPorUsuario(@PathVariable Long id) {
        log.info("📥 [MBAC] GET /api/mbac/permisos/usuario/{}", id);

        List<PermisoUsuarioResponseDTO> permisos = permisosService.obtenerPermisosPorUsuario(id);

        if (permisos.isEmpty()) {
            log.warn("⚠️ No se encontraron permisos para el usuario con ID {}", id);
        } else {
            log.info("✅ Se obtuvieron {} permisos activos para el usuario ID {}", permisos.size(), id);
        }

        return ResponseEntity.ok(permisos);
    }

    // ============================================================
    // 🔹 2. CONSULTAR PERMISOS POR USERNAME
    // ============================================================
    @GetMapping("/usuario/nombre/{username}")
    public ResponseEntity<List<PermisoUsuarioResponseDTO>> obtenerPermisosPorUsername(@PathVariable String username) {
        log.info("📥 [MBAC] GET /api/mbac/permisos/usuario/nombre/{}", username);

        List<PermisoUsuarioResponseDTO> permisos = permisosService.obtenerPermisosPorUsername(username);

        if (permisos.isEmpty()) {
            log.warn("⚠️ No se encontraron permisos para el usuario '{}'", username);
        } else {
            log.info("✅ Se obtuvieron {} permisos para el usuario '{}'", permisos.size(), username);
        }

        return ResponseEntity.ok(permisos);
    }

    // ============================================================
    // 🔹 3. CONSULTAR PERMISOS POR USUARIO Y MÓDULO
    // ============================================================
    @GetMapping("/usuario/{userId}/modulo/{idModulo}")
    public ResponseEntity<List<PermisoUsuarioResponseDTO>> obtenerPermisosPorUsuarioYModulo(
            @PathVariable Long userId,
            @PathVariable Long idModulo) {

        log.info("📥 [MBAC] GET /api/mbac/permisos/usuario/{}/modulo/{}", userId, idModulo);

        List<PermisoUsuarioResponseDTO> permisos =
                permisosService.obtenerPermisosPorUsuarioYModulo(userId, idModulo);

        if (permisos.isEmpty()) {
            log.warn("⚠️ No se encontraron permisos del usuario {} para el módulo {}", userId, idModulo);
        } else {
            log.info("✅ Se obtuvieron {} permisos del usuario {} para el módulo {}", permisos.size(), userId, idModulo);
        }

        return ResponseEntity.ok(permisos);
    }

    // ============================================================
    // 🔹 4. VERIFICAR PERMISO ESPECÍFICO (para botones/acciones)
    // ============================================================
    @PostMapping("/verificar")
    public ResponseEntity<CheckPermisoResponseDTO> verificarPermiso(
            @Valid @RequestBody CheckPermisoRequestDTO request) {

        log.info("📤 [MBAC] POST /api/mbac/permisos/verificar -> {}", request);

        CheckPermisoResponseDTO response = permisosService.verificarPermiso(request);

        log.info("🔍 Resultado de verificación: usuario={}, ruta={}, acción={}, permitido={}",
                response.getIdUser(), response.getRutaPagina(), response.getAccion(), response.getPermitido());

        return ResponseEntity.ok(response);
    }

    // ============================================================
    // 🔹 5. LISTAR MÓDULOS ACCESIBLES POR USUARIO
    // ============================================================
    @GetMapping("/usuario/{userId}/modulos")
    public ResponseEntity<List<ModuloSistemaResponse>> obtenerModulosAccesiblesUsuario(@PathVariable Long userId) {
        log.info("📦 [MBAC] GET /api/mbac/permisos/usuario/{}/modulos", userId);

        List<ModuloSistemaResponse> modulos = permisosService.obtenerModulosAccesiblesUsuario(userId);

        if (modulos.isEmpty()) {
            log.warn("⚠️ El usuario {} no tiene módulos asignados", userId);
        } else {
            log.info("✅ Se encontraron {} módulos accesibles para el usuario {}", modulos.size(), userId);
        }

        return ResponseEntity.ok(modulos);
    }

    // ============================================================
    // 🔹 6. LISTAR PÁGINAS ACCESIBLES DENTRO DE UN MÓDULO
    // ============================================================
    @GetMapping("/usuario/{userId}/modulo/{idModulo}/paginas")
    public ResponseEntity<List<PaginaModuloResponse>> obtenerPaginasAccesiblesUsuario(
            @PathVariable Long userId,
            @PathVariable Long idModulo) {

        log.info("📑 [MBAC] GET /api/mbac/permisos/usuario/{}/modulo/{}/paginas", userId, idModulo);

        List<PaginaModuloResponse> paginas =
                permisosService.obtenerPaginasAccesiblesUsuario(userId, idModulo);

        if (paginas.isEmpty()) {
            log.warn("⚠️ No se encontraron páginas accesibles para el usuario {} en módulo {}", userId, idModulo);
        } else {
            log.info("✅ El usuario {} tiene acceso a {} páginas del módulo {}", userId, paginas.size(), idModulo);
        }

        return ResponseEntity.ok(paginas);
    }

    // ============================================================
    // 🔹 7. VALIDAR PERMISO DE ACCIÓN (alias rápido)
    // ============================================================
    @GetMapping("/check/{userId}")
    public ResponseEntity<Boolean> validarPermisoRapido(
            @PathVariable Long userId,
            @RequestParam String ruta,
            @RequestParam String accion) {

        log.info("⚙️ [MBAC] Validando acceso rápido -> usuario={}, ruta={}, acción={}", userId, ruta, accion);

        boolean tienePermiso = permisosService.validarPermiso(userId, ruta, accion);

        log.info("🔐 Resultado rápido -> {}", tienePermiso ? "PERMITIDO ✅" : "DENEGADO ❌");

        return ResponseEntity.ok(tienePermiso);
    }
}
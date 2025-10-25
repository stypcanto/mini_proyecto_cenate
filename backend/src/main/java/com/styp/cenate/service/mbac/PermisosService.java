package com.styp.cenate.service.mbac;

import com.styp.cenate.dto.mbac.*;

import java.util.List;

/**
 * 🧩 Servicio MBAC – Gestión de permisos, módulos y páginas por usuario.
 *
 * Define la interfaz del sistema de control de accesos modular (MBAC) para:
 *   - Consultar permisos y módulos accesibles por usuario.
 *   - Verificar permisos por ruta y acción.
 *   - Validar acceso en base a roles y páginas.
 */
public interface PermisosService {

    // ============================================================
    // 🔹 Consultas principales
    List<PermisoUsuarioResponseDTO> obtenerPermisosPorUsuario(Long idUser);
    List<PermisoUsuarioResponseDTO> obtenerPermisosPorUsername(String username);
    List<PermisoUsuarioResponseDTO> obtenerPermisosPorUsuarioYModulo(Long idUser, Long idModulo);

    // ============================================================
    // 🔹 Verificación y validación
    CheckPermisoResponseDTO verificarPermiso(CheckPermisoRequestDTO request);

    boolean tienePermiso(Long idUser, String rutaPagina, String accion);
    boolean validarPermiso(Long idUser, String rutaPagina, String accion);

    // ============================================================
    // 🔹 Accesos por módulos y páginas
    List<ModuloSistemaResponse> obtenerModulosAccesiblesUsuario(Long idUser);
    List<PaginaModuloResponse> obtenerPaginasAccesiblesUsuario(Long idUser, Long idModulo);

    // ============================================================
    // 🔹 Utilitario
    Long obtenerUserIdPorUsername(String username);
}
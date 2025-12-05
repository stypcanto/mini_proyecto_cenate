// ============================================================================
// 🧩 PermisosService.java – Interfaz de servicio MBAC (CENATE 2025)
// ----------------------------------------------------------------------------
// Define todos los contratos del sistema modular basado en permisos (MBAC).
// Incluye:
//   • Consultas de permisos por usuario, módulo y ruta
//   • Verificación de acciones MBAC (ver, crear, editar, eliminar, etc.)
//   • CRUD completo para la gestión de permisos desde panel administrativo
// ============================================================================
package com.styp.cenate.service.mbac;

import com.styp.cenate.dto.mbac.*;
import java.util.List;

public interface PermisosService {

    // ============================================================
    // 🔹 CONSULTAS PRINCIPALES (LECTURA)
    // ============================================================

    /** Obtiene todos los permisos activos de un usuario por ID */
    List<PermisoUsuarioResponseDTO> obtenerPermisosPorUsuario(Long idUser);

    /** Obtiene los permisos de un usuario a partir de su nombre de usuario */
    List<PermisoUsuarioResponseDTO> obtenerPermisosPorUsername(String username);

    /** Obtiene los permisos de un usuario para un módulo específico */
    List<PermisoUsuarioResponseDTO> obtenerPermisosPorUsuarioYModulo(Long idUser, Long idModulo);

    /** 🚀 OPTIMIZACIÓN: Obtiene permisos de múltiples usuarios en una sola query */
    java.util.Map<Long, java.util.List<PermisoUsuarioResponseDTO>> obtenerPermisosPorUsuarios(List<Long> userIds);


    // ============================================================
    // 🔹 VERIFICACIÓN Y VALIDACIÓN
    // ============================================================

    /** Verifica si el usuario tiene permiso para una acción específica */
    CheckPermisoResponseDTO verificarPermiso(CheckPermisoRequestDTO request);

    /** Verifica si el usuario tiene un permiso particular (por ruta y acción) */
    boolean tienePermiso(Long idUser, String rutaPagina, String accion);

    /** Alias para compatibilidad con evaluadores MBAC */
    boolean validarPermiso(Long idUser, String rutaPagina, String accion);


    // ============================================================
    // 🔹 ACCESOS POR MÓDULOS Y PÁGINAS
    // ============================================================

    /** Retorna los módulos accesibles por un usuario */
    List<ModuloSistemaResponse> obtenerModulosAccesiblesUsuario(Long idUser);

    /** Retorna las páginas accesibles para un usuario dentro de un módulo */
    List<PaginaModuloResponse> obtenerPaginasAccesiblesUsuario(Long idUser, Long idModulo);


    // ============================================================
    // 🔹 UTILITARIOS
    // ============================================================

    /** Obtiene el ID del usuario a partir del username */
    Long obtenerUserIdPorUsername(String username);


    // ============================================================
    // 🔹 CRUD COMPLETO DE PERMISOS (ADMINISTRACIÓN)
    // ============================================================

    /** Crea un nuevo permiso MBAC */
    PermisoUsuarioResponseDTO crearPermiso(PermisoUsuarioRequestDTO request);

    /** Actualiza un permiso existente */
    PermisoUsuarioResponseDTO actualizarPermiso(Integer idPermiso, PermisoUsuarioRequestDTO request);

    /** Crea o actualiza un permiso (upsert) - Usado por el panel de permisos */
    PermisoUsuarioResponseDTO guardarOActualizarPermiso(PermisoUsuarioRequestDTO request);

    /** Guarda múltiples permisos en batch para un usuario */
    List<PermisoUsuarioResponseDTO> guardarPermisosBatch(Long idUser, List<PermisoUsuarioRequestDTO> permisos);

    /** Elimina un permiso por su ID */
    void eliminarPermiso(Integer idPermiso);

    /** Lista todos los permisos registrados */
    List<PermisoUsuarioResponseDTO> listarPermisos();

    // ============================================================
    // 🔹 PERMISOS PREDETERMINADOS POR ROL
    // ============================================================

    /** Obtiene los permisos predeterminados para una lista de nombres de roles */
    List<PermisoUsuarioResponseDTO> obtenerPermisosPredefiidosPorRoles(List<String> nombresRoles);
}
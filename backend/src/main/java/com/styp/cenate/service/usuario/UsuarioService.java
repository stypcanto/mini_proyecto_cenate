// ============================================================================
// 💼 UsuarioService.java – Servicio principal de usuarios (CENATE 2025)
// ----------------------------------------------------------------------------
// Define las operaciones CRUD, control de estado, filtros por rol, gestión de
// contraseñas y consultas extendidas del sistema MBAC / CENATE.
// ============================================================================
package com.styp.cenate.service.usuario;

import com.styp.cenate.dto.UsuarioCreateRequest;
import com.styp.cenate.dto.UsuarioResponse;
import com.styp.cenate.dto.UsuarioUpdateRequest;
import com.styp.cenate.dto.mbac.RolResponse;

import java.util.List;
import java.util.Map;

public interface UsuarioService {

    // ============================================================
    // 🔍 CONSULTAS GENERALES
    // ============================================================
    List<UsuarioResponse> getAllUsers();
    
    /**
     * 📋 Obtiene TODO el personal de CENATE (registros con y sin usuario asociado)
     * @return Lista completa de personal con su información
     * @deprecated Usar getAllPersonal(page, size, sortBy, direction) para mejor rendimiento
     */
    @Deprecated
    List<UsuarioResponse> getAllPersonal();
    
    /**
     * 📋 Obtiene el personal de CENATE con paginación (optimizado para rendimiento)
     * @param page Número de página (0-indexed)
     * @param size Tamaño de página
     * @param sortBy Campo para ordenar
     * @param direction Dirección de ordenamiento (asc/desc)
     * @return Map con los datos paginados: content (List), totalElements, totalPages, currentPage, size
     */
    Map<String, Object> getAllPersonal(int page, int size, String sortBy, String direction);
    
    UsuarioResponse getUserById(Long id);
    UsuarioResponse getUserByUsername(String username);
    UsuarioResponse obtenerDetalleUsuarioExtendido(String username);

    // ============================================================
    // ⚙️ GESTIÓN DE USUARIOS
    // ============================================================
    UsuarioResponse createUser(UsuarioCreateRequest request);
    UsuarioResponse updateUser(Long id, UsuarioUpdateRequest request);
    void deleteUser(Long id);

    // ============================================================
    // 🔒 CONTROL DE ESTADO
    // ============================================================
    UsuarioResponse activateUser(Long id);
    UsuarioResponse deactivateUser(Long id);
    UsuarioResponse unlockUser(Long id);

    // ============================================================
    // 📊 CONSULTAS AVANZADAS
    // ============================================================
    List<Map<String, Object>> obtenerDetalleUsuario(String username);

    // ============================================================
    // 🧭 FILTROS POR ROLES
    // ============================================================
    List<UsuarioResponse> getUsuariosByRoles(List<String> roles);
    List<UsuarioResponse> getUsuariosExcluyendoRoles(List<String> roles);

    /**
     * 🔹 Retorna los nombres de roles asociados al usuario autenticado.
     */
    List<String> getRolesByUsername(String username);

    /**
     * 🧩 Retorna los roles completos asociados a un usuario (DTO RolResponse).
     * Usado por el endpoint /api/mbac/usuarios/{username}/roles
     */
    List<RolResponse> obtenerRolesPorUsername(String username);

    // ============================================================
    // 🔑 GESTIÓN DE CONTRASEÑAS
    // ============================================================
    /**
     * 🔐 Cambia la contraseña de un usuario autenticado.
     *
     * @param username        Usuario autenticado que realiza el cambio.
     * @param currentPassword Contraseña actual.
     * @param newPassword     Nueva contraseña.
     * @throws RuntimeException Si la contraseña actual es incorrecta o
     *                          si la nueva no cumple los requisitos de seguridad.
     */
    void changePassword(String username, String currentPassword, String newPassword);

    /**
     * 🔄 Resetea la contraseña de un usuario (solo para ADMIN/SUPERADMIN).
     * No requiere la contraseña actual.
     *
     * @param id          ID del usuario a resetear.
     * @param newPassword Nueva contraseña temporal.
     * @throws jakarta.persistence.EntityNotFoundException Si el usuario no existe.
     */
    void resetPassword(Long id, String newPassword);

    /**
     * 🆕 Completa el primer acceso del usuario.
     * Cambia la contraseña temporal y actualiza datos personales obligatorios.
     *
     * @param username Usuario autenticado
     * @param request Datos de contraseña y personales
     * @throws RuntimeException Si hay errores de validación
     */
    void completarPrimerAcceso(String username, com.styp.cenate.dto.CompletarPrimerAccesoRequest request);

    // ============================================================
    // 🧩 MÉTODO INTERNO (para autenticación y seguridad)
    // ============================================================
    /**
     * Retorna la entidad completa de un usuario a partir de su nombre de usuario.
     * Se usa internamente por el sistema de autenticación (AuthController).
     *
     * @param username Nombre de usuario
     * @return Entidad Usuario
     */
    com.styp.cenate.model.Usuario findByUsername(String username);

    // ============================================================
    // ✏️ ACTUALIZACIÓN DE DATOS COMPLETOS
    // ============================================================
    /**
     * ✏️ Actualiza información completa del personal (datos personales, profesionales y laborales).
     *
     * @param id      ID del usuario a actualizar
     * @param request DTO con los datos a actualizar
     * @return UsuarioResponse con los datos actualizados
     * @throws jakarta.persistence.EntityNotFoundException Si el usuario no existe
     */
    UsuarioResponse actualizarDatosPersonal(Long id, com.styp.cenate.dto.PersonalUpdateRequest request);

    // ================================================================
    // 🔔 NOTIFICACIONES: Usuarios Pendientes de Asignar Rol Específico
    // ================================================================

    /**
     * Cuenta usuarios que solo tienen rol básico (USER o INSTITUCION_EX)
     * y necesitan asignación manual de rol específico por el administrador.
     *
     * @return Cantidad de usuarios pendientes
     */
    Long contarUsuariosConRolBasico();

    /**
     * Lista usuarios que solo tienen rol básico (USER o INSTITUCION_EX)
     *
     * @return Lista de usuarios pendientes de asignar rol
     */
    List<UsuarioResponse> listarUsuariosConRolBasico();

    /**
     * Lista usuarios que tienen un rol específico
     *
     * @param nombreRol Nombre del rol a filtrar
     * @return Lista de usuarios con el rol especificado
     */
    List<UsuarioResponse> listarUsuariosPorRol(String nombreRol);
}

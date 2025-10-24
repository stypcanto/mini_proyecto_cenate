package com.styp.cenate.service.usuario;

import com.styp.cenate.dto.UsuarioCreateRequest;
import com.styp.cenate.dto.UsuarioResponse;
import com.styp.cenate.dto.UsuarioUpdateRequest;

import java.util.List;
import java.util.Map;

/**
 * 🧩 Servicio para la gestión de usuarios en el sistema CENATE.
 * Capa intermedia entre el controlador y el repositorio.
 */
public interface UsuarioService {

    // ============================================================
    // 🔹 Consultas generales
    // ============================================================
    List<UsuarioResponse> getAllUsers();
    UsuarioResponse getUserById(Long id);
    UsuarioResponse getUserByUsername(String username);
    UsuarioResponse obtenerDetalleUsuarioExtendido(String username);

    // ============================================================
    // ⚙️ Gestión de usuarios
    // ============================================================
    UsuarioResponse createUser(UsuarioCreateRequest request);
    UsuarioResponse updateUser(Long id, UsuarioUpdateRequest request);
    void deleteUser(Long id);

    // ============================================================
    // 🔐 Control de estado
    // ============================================================
    UsuarioResponse activateUser(Long id);
    UsuarioResponse deactivateUser(Long id);
    UsuarioResponse unlockUser(Long id);

    // ============================================================
    // 🔍 Consultas avanzadas
    // ============================================================
    List<Map<String, Object>> obtenerDetalleUsuario(String username);

    // ============================================================
    // 🧭 Filtros por roles
    // ============================================================
    List<UsuarioResponse> getUsuariosByRoles(List<String> roles);
    List<UsuarioResponse> getUsuariosExcluyendoRoles(List<String> roles);

    /**
     * 🔹 Retorna los nombres de roles asociados al usuario autenticado.
     */
    List<String> getRolesByUsername(String username);
}
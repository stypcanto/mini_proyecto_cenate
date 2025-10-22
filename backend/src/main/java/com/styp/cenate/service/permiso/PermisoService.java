package com.styp.cenate.service.permiso;

import com.styp.cenate.dto.mbac.PermisoUsuarioResponseDTO;
import com.styp.cenate.model.Permiso;

import java.util.List;
import java.util.Map;

/**
 * 🎯 Servicio de gestión de permisos (MBAC/RBAC)
 * Define las operaciones principales de acceso, actualización y filtrado.
 */
public interface PermisoService {

    /**
     * 🔹 Obtiene los permisos activos de un usuario por su username.
     */
    List<PermisoUsuarioResponseDTO> obtenerPermisosPorUsername(String username);

    /**
     * 🔹 Obtiene todos los permisos asociados a un rol específico.
     */
    List<Permiso> getPermisosByRol(Integer idRol);

    /**
     * ✏️ Actualiza campos de un permiso (ej: descripción o flags booleanos).
     */
    Permiso updateCamposPermiso(Long idPermiso, Map<String, Object> cambios);

    /**
     * 🧩 Lista todos los permisos activos (al menos uno de los flags true).
     */
    List<Permiso> getPermisosActivos();
}
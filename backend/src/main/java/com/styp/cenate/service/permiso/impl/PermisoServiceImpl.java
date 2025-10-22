package com.styp.cenate.service.permiso.impl;
import lombok.extern.slf4j.Slf4j;

import com.styp.cenate.dto.mbac.PermisoUsuarioResponseDTO;
import com.styp.cenate.exception.ResourceNotFoundException;
import com.styp.cenate.model.Permiso;
import com.styp.cenate.model.Usuario;
import com.styp.cenate.repository.PermisoRepository;
import com.styp.cenate.repository.UsuarioRepository;
import com.styp.cenate.repository.mbac.PermisoModularRepository;
import com.styp.cenate.service.permiso.PermisoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

/**
 * 🧩 Implementación del servicio MBAC/RBAC de permisos para CENATE.
 * Gestiona la lógica de roles, usuarios y permisos activos.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PermisoServiceImpl implements PermisoService {

    private final UsuarioRepository usuarioRepository;
    private final PermisoRepository permisoRepository;
    private final PermisoModularRepository permisoModularRepository;

    // ============================================================
    // 🔹 Permisos por username (vista MBAC)
    // ============================================================
    @Override
    @Transactional(readOnly = true)
    public List<PermisoUsuarioResponseDTO> obtenerPermisosPorUsername(String username) {
        log.info("🔍 Buscando permisos para el usuario '{}'", username);

        Usuario usuario = usuarioRepository.findByNameUser(username)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado: " + username));

        List<PermisoUsuarioResponseDTO> permisos =
                permisoModularRepository.findPermisosPorUsuarioId(usuario.getIdUser());

        log.info("✅ Usuario '{}' tiene {} permisos asignados", username, permisos.size());
        return permisos;
    }

    // ============================================================
    // 🔹 Permisos por rol
    // ============================================================
    @Override
    @Transactional(readOnly = true)
    public List<Permiso> getPermisosByRol(Integer idRol) {
        log.info("🔍 Consultando permisos asociados al rol ID {}", idRol);
        return permisoRepository.findByRolIdRol(idRol);
    }

    // ============================================================
    // 🧩 Permisos activos (al menos un flag = true)
    // ============================================================
    @Override
    @Transactional(readOnly = true)
    public List<Permiso> getPermisosActivos() {
        log.info("🧩 Listando permisos activos (al menos un permiso booleano TRUE)");
        return permisoRepository.findAllActive();
    }

    // ============================================================
    // ✏️ Actualizar campos de un permiso
    // ============================================================
    @Override
    @Transactional
    public Permiso updateCamposPermiso(Long idPermiso, Map<String, Object> cambios) {
        Permiso permiso = permisoRepository.findById(idPermiso)
                .orElseThrow(() -> new IllegalArgumentException("Permiso no encontrado con ID: " + idPermiso));

        cambios.forEach((campo, valor) -> {
            switch (campo) {
                case "descPermiso" -> permiso.setDescPermiso(valor.toString());
                case "puedeVer" -> permiso.setPuedeVer(Boolean.parseBoolean(valor.toString()));
                case "puedeCrear" -> permiso.setPuedeCrear(Boolean.parseBoolean(valor.toString()));
                case "puedeActualizar" -> permiso.setPuedeActualizar(Boolean.parseBoolean(valor.toString()));
                case "puedeEliminar" -> permiso.setPuedeEliminar(Boolean.parseBoolean(valor.toString()));
                case "puedeEditar" -> permiso.setPuedeEditar(Boolean.parseBoolean(valor.toString()));
                case "puedeExportar" -> permiso.setPuedeExportar(Boolean.parseBoolean(valor.toString()));
                case "puedeAprobar" -> permiso.setPuedeAprobar(Boolean.parseBoolean(valor.toString()));
                default -> throw new IllegalArgumentException("Campo no reconocido: " + campo);
            }
        });

        permisoRepository.save(permiso);
        log.info("✅ Permiso ID {} actualizado correctamente.", idPermiso);
        return permiso;
    }
}

// ============================================================================
// 🧩 PermisoServiceImpl.java – Servicio MBAC/RBAC (CENATE 2025)
// ----------------------------------------------------------------------------
// Implementación de la lógica de permisos para roles y usuarios en el sistema
// MBAC de CENATE. Gestiona el acceso modular, permisos activos y actualizaciones.
// ============================================================================
package com.styp.cenate.service.permiso.impl;

import lombok.Data;
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
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Data
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
                permisoModularRepository.findPermisosPorUsuarioId(usuario.getIdUser().longValue());

        log.info("✅ Usuario '{}' tiene {} permisos asignados", username, permisos.size());
        return permisos.stream()
                .map(p -> PermisoUsuarioResponseDTO.builder()
                        .idPermiso(p.getIdPermiso())
                        .nombreModulo(p.getNombreModulo())
                        .idPagina(p.getIdPagina())
                        .nombrePagina(p.getNombrePagina())
                        .rutaPagina(p.getRutaPagina())
                        .ver(Boolean.TRUE.equals(p.getVer()))
                        .crear(Boolean.TRUE.equals(p.getCrear()))
                        .editar(Boolean.TRUE.equals(p.getEditar()))
                        .eliminar(Boolean.TRUE.equals(p.getEliminar()))
                        .exportar(Boolean.TRUE.equals(p.getExportar()))
                        .aprobar(Boolean.TRUE.equals(p.getAprobar()))
                        .build())
                .collect(Collectors.toList());
    }

    // ============================================================
    // 🎯 Permisos por ID de usuario
    // ============================================================
    @Override
    @Transactional(readOnly = true)
    public List<PermisoUsuarioResponseDTO> obtenerPermisosPorUserId(Integer idUser) {
        log.info("🎯 Buscando permisos para el usuario con ID {}", idUser);

        if (idUser == null || idUser <= 0) {
            throw new IllegalArgumentException("El ID de usuario no es válido: " + idUser);
        }

        List<PermisoUsuarioResponseDTO> permisos =
                permisoModularRepository.findPermisosPorUsuarioId(idUser.longValue());

        if (permisos == null || permisos.isEmpty()) {
            log.warn("⚠️ El usuario con ID {} no tiene permisos asignados o no existe en la vista MBAC.", idUser);
        } else {
            log.info("✅ Usuario con ID {} tiene {} permisos asignados", idUser, permisos.size());
        }

        return permisos.stream()
                .map(p -> PermisoUsuarioResponseDTO.builder()
                        .idPermiso(p.getIdPermiso())
                        .nombreModulo(p.getNombreModulo())
                        .idPagina(p.getIdPagina())
                        .nombrePagina(p.getNombrePagina())
                        .rutaPagina(p.getRutaPagina())
                        .ver(Boolean.TRUE.equals(p.getVer()))
                        .crear(Boolean.TRUE.equals(p.getCrear()))
                        .editar(Boolean.TRUE.equals(p.getEditar()))
                        .eliminar(Boolean.TRUE.equals(p.getEliminar()))
                        .exportar(Boolean.TRUE.equals(p.getExportar()))
                        .aprobar(Boolean.TRUE.equals(p.getAprobar()))
                        .build())
                .collect(Collectors.toList());
    }

    // ============================================================
    // 🔹 Permisos por rol
    // ============================================================
    @Override
    @Transactional(readOnly = true)
    public List<Permiso> getPermisosByRol(Integer idRol) {
        log.info("🔍 Consultando permisos asociados al rol ID {}", idRol);
        return permisoRepository.findByRol_IdRol(idRol);
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
                case "ver" -> permiso.setPuedeVer(Boolean.parseBoolean(valor.toString()));
                case "crear" -> permiso.setPuedeCrear(Boolean.parseBoolean(valor.toString()));
                case "editar" -> permiso.setPuedeEditar(Boolean.parseBoolean(valor.toString()));
                case "actualizar" -> permiso.setPuedeActualizar(Boolean.parseBoolean(valor.toString()));
                case "eliminar" -> permiso.setPuedeEliminar(Boolean.parseBoolean(valor.toString()));
                case "exportar" -> permiso.setPuedeExportar(Boolean.parseBoolean(valor.toString()));
                case "aprobar" -> permiso.setPuedeAprobar(Boolean.parseBoolean(valor.toString()));
                default -> throw new IllegalArgumentException("Campo no reconocido: " + campo);
            }
        });

        permisoRepository.save(permiso);
        log.info("✅ Permiso ID {} actualizado correctamente.", idPermiso);
        return permiso;
    }
}
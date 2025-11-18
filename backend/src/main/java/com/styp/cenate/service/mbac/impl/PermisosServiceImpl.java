// ========================================================================
// 🧩 PermisosServiceImpl.java – Servicio MBAC (CENATE 2025)
// ------------------------------------------------------------------------
// Gestiona permisos por usuario, módulo y página.
// Soporte CRUD completo para administración desde frontend (MBAC Admin).
// ========================================================================

package com.styp.cenate.service.mbac.impl;

import com.styp.cenate.dto.mbac.*;
import com.styp.cenate.model.PermisoModular;
import com.styp.cenate.model.Usuario;
import com.styp.cenate.model.view.ModuloView;
import com.styp.cenate.model.view.PermisoActivoView;
import com.styp.cenate.repository.UsuarioRepository;
import com.styp.cenate.repository.mbac.PermisoModularRepository;
import com.styp.cenate.repository.view.ModuloViewRepository;
import com.styp.cenate.repository.view.PermisoActivoViewRepository;
import com.styp.cenate.service.mbac.PermisosService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class PermisosServiceImpl implements PermisosService {

    private final UsuarioRepository usuarioRepository;
    private final PermisoModularRepository permisoModularRepository;
    private final ModuloViewRepository moduloViewRepository;
    private final PermisoActivoViewRepository permisoActivoViewRepository;

    // ===========================================================
    // 🔹 1. Obtener permisos activos (vista consolidada)
    // ===========================================================
    @Override
    @Transactional(readOnly = true)
    public List<PermisoUsuarioResponseDTO> obtenerPermisosPorUsuario(Long idUser) {
        var permisosView = permisoActivoViewRepository.findByIdUser(idUser);
        log.info("✅ {} permisos activos cargados desde vista para usuario ID {}", permisosView.size(), idUser);

        return permisosView.stream()
                .map(p -> PermisoUsuarioResponseDTO.builder()
                        .idPermiso(p.getIdPermiso() != null ? p.getIdPermiso().longValue() : 0L)
                        .idPagina(p.getIdPagina())
                        .rutaPagina(p.getRutaPagina())
                        .nombrePagina(p.getPagina())
                        .nombreModulo(p.getModulo())
                        .ver(Boolean.TRUE.equals(p.getPuedeVer()))
                        .crear(Boolean.TRUE.equals(p.getPuedeCrear()))
                        .editar(Boolean.TRUE.equals(p.getPuedeEditar()))
                        .eliminar(Boolean.TRUE.equals(p.getPuedeEliminar()))
                        .exportar(Boolean.TRUE.equals(p.getPuedeExportar()))
                        .aprobar(Boolean.TRUE.equals(p.getPuedeAprobar()))
                        .build())
                .collect(Collectors.toList());
    }

    // ===========================================================
    // 🔹 2. Obtener permisos por nombre de usuario
    // ===========================================================
    @Override
    @Transactional(readOnly = true)
    public List<PermisoUsuarioResponseDTO> obtenerPermisosPorUsername(String username) {
        Long idUser = obtenerUserIdPorUsername(username);
        if (idUser == null)
            throw new EntityNotFoundException("❌ Usuario no encontrado: " + username);
        return obtenerPermisosPorUsuario(idUser);
    }

    // ===========================================================
    // 🔹 3. Obtener permisos por usuario y módulo
    // ===========================================================
    @Override
    @Transactional(readOnly = true)
    public List<PermisoUsuarioResponseDTO> obtenerPermisosPorUsuarioYModulo(Long idUser, Long idModulo) {
        var permisos = permisoActivoViewRepository.findByIdUserAndIdModulo(idUser, idModulo);
        return permisos.stream()
                .map(p -> PermisoUsuarioResponseDTO.builder()
                        .idPermiso(p.getIdPermiso() != null ? p.getIdPermiso().longValue() : 0L)
                        .idPagina(p.getIdPagina())
                        .rutaPagina(p.getRutaPagina())
                        .nombrePagina(p.getPagina())
                        .nombreModulo(p.getModulo())
                        .ver(Boolean.TRUE.equals(p.getPuedeVer()))
                        .crear(Boolean.TRUE.equals(p.getPuedeCrear()))
                        .editar(Boolean.TRUE.equals(p.getPuedeEditar()))
                        .eliminar(Boolean.TRUE.equals(p.getPuedeEliminar()))
                        .exportar(Boolean.TRUE.equals(p.getPuedeExportar()))
                        .aprobar(Boolean.TRUE.equals(p.getPuedeAprobar()))
                        .build())
                .collect(Collectors.toList());
    }

    // ===========================================================
    // 🔹 4. Crear un nuevo permiso MBAC
    // ===========================================================
    @Override
    public PermisoUsuarioResponseDTO crearPermiso(PermisoUsuarioRequestDTO request) {
        log.info("🆕 Creando nuevo permiso MBAC → usuario={}, página={}, acción={}",
                request.getIdUser(), request.getRutaPagina(), request.getAccion());

        var permiso = PermisoModular.builder()
                .idUser(request.getIdUser())
                .idRol(request.getIdRol().intValue())
                .idModulo(request.getIdModulo().intValue())
                .idPagina(request.getIdPagina().intValue())
                .accion(request.getAccion())
                .puedeVer(request.getVer())
                .puedeCrear(request.getCrear())
                .puedeEditar(request.getEditar())
                .puedeEliminar(request.getEliminar())
                .puedeExportar(request.getExportar())
                .puedeAprobar(request.getAprobar())
                .activo(true)
                .build();

        permiso = permisoModularRepository.save(permiso);

        return PermisoUsuarioResponseDTO.builder()
                .idPermiso(permiso.getIdPermiso().longValue())
                .idPagina(permiso.getIdPagina())
                .ver(permiso.getPuedeVer())
                .crear(permiso.getPuedeCrear())
                .editar(permiso.getPuedeEditar())
                .eliminar(permiso.getPuedeEliminar())
                .exportar(permiso.getPuedeExportar())
                .aprobar(permiso.getPuedeAprobar())
                .build();
    }

    // ===========================================================
    // 🔹 5. Actualizar un permiso existente
    // ===========================================================
    @Override
    public PermisoUsuarioResponseDTO actualizarPermiso(Integer idPermiso, PermisoUsuarioRequestDTO request) {
        log.info("✏️ Actualizando permiso MBAC ID {} → acción={}", idPermiso, request.getAccion());

        var permiso = permisoModularRepository.findById(idPermiso)
                .orElseThrow(() -> new EntityNotFoundException("❌ Permiso no encontrado"));

        permiso.setPuedeVer(request.getVer());
        permiso.setPuedeCrear(request.getCrear());
        permiso.setPuedeEditar(request.getEditar());
        permiso.setPuedeEliminar(request.getEliminar());
        permiso.setPuedeExportar(request.getExportar());
        permiso.setPuedeAprobar(request.getAprobar());

        permisoModularRepository.save(permiso);

        return PermisoUsuarioResponseDTO.builder()
                .idPermiso(permiso.getIdPermiso().longValue())
                .idPagina(permiso.getIdPagina())
                .ver(permiso.getPuedeVer())
                .crear(permiso.getPuedeCrear())
                .editar(permiso.getPuedeEditar())
                .eliminar(permiso.getPuedeEliminar())
                .exportar(permiso.getPuedeExportar())
                .aprobar(permiso.getPuedeAprobar())
                .build();
    }

    // ===========================================================
    // 🔹 6. Eliminar / revocar un permiso
    // ===========================================================
    @Override
    public void eliminarPermiso(Integer idPermiso) {
        log.warn("🗑️ Eliminando permiso MBAC ID {}", idPermiso);
        if (!permisoModularRepository.existsById(idPermiso))
            throw new EntityNotFoundException("❌ El permiso no existe");
        permisoModularRepository.deleteById(idPermiso);
    }

    // ===========================================================
    // 🔹 7. Listar todos los permisos (panel admin)
    // ===========================================================
    @Override
    @Transactional(readOnly = true)
    public List<PermisoUsuarioResponseDTO> listarPermisos() {
        var permisos = permisoModularRepository.findAll();
        log.info("📋 Listando todos los permisos MBAC: {} registros", permisos.size());

        return permisos.stream()
                .map(p -> PermisoUsuarioResponseDTO.builder()
                        .idPermiso(p.getIdPermiso().longValue())
                        .idPagina(p.getIdPagina())
                        .ver(p.getPuedeVer())
                        .crear(p.getPuedeCrear())
                        .editar(p.getPuedeEditar())
                        .eliminar(p.getPuedeEliminar())
                        .exportar(p.getPuedeExportar())
                        .aprobar(p.getPuedeAprobar())
                        .build())
                .collect(Collectors.toList());
    }

    // ===========================================================
    // 🔹 8. Verificar permiso específico
    // ===========================================================
    @Override
    public CheckPermisoResponseDTO verificarPermiso(CheckPermisoRequestDTO request) {
        boolean permitido = tienePermiso(request.getIdUser(), request.getRutaPagina(), request.getAccion());

        return CheckPermisoResponseDTO.builder()
                .idUser(request.getIdUser())
                .rutaPagina(request.getRutaPagina())   // ✅ corregido campo
                .accion(request.getAccion())
                .permitido(permitido)
                .build();
    }

    // ===========================================================
    // 🔹 9. Obtener módulos accesibles por usuario
    // ===========================================================
    @Override
    @Transactional(readOnly = true)
    public List<ModuloSistemaResponse> obtenerModulosAccesiblesUsuario(Long idUser) {
        var modulos = moduloViewRepository.findByIdUser(idUser);
        return modulos.stream()
                .map(m -> ModuloSistemaResponse.builder()
                        .idModulo(m.getIdModulo())
                        .nombreModulo(m.getNombreModulo())
                        .icono(m.getIcono())
                        .build())
                .collect(Collectors.toList());
    }

    // ===========================================================
    // 🔹 10. Obtener páginas accesibles dentro de un módulo
    // ===========================================================
    @Override
    @Transactional(readOnly = true)
    public List<PaginaModuloResponse> obtenerPaginasAccesiblesUsuario(Long idUser, Long idModulo) {
        var permisos = permisoActivoViewRepository.findByIdUserAndIdModulo(idUser, idModulo);
        return permisos.stream()
                .map(p -> PaginaModuloResponse.builder()
                        .idPagina(p.getIdPagina())
                        .nombrePagina(p.getPagina())
                        .rutaPagina(p.getRutaPagina())
                        .ver(p.getPuedeVer())
                        .crear(p.getPuedeCrear())
                        .editar(p.getPuedeEditar())
                        .eliminar(p.getPuedeEliminar())
                        .exportar(p.getPuedeExportar())
                        .aprobar(p.getPuedeAprobar())
                        .build())
                .collect(Collectors.toList());
    }

    // ===========================================================
    // 🔹 11. Verificar si un permiso está activo
    // ===========================================================
    @Override
    public boolean tienePermiso(Long idUser, String rutaPagina, String accion) {
        var permisos = obtenerPermisosPorUsuario(idUser);
        return permisos.stream()
                .filter(p -> rutaPagina.equalsIgnoreCase(p.getRutaPagina()))
                .anyMatch(p -> switch (accion.toLowerCase()) {
                    case "ver" -> Boolean.TRUE.equals(p.getVer());
                    case "crear" -> Boolean.TRUE.equals(p.getCrear());
                    case "editar", "actualizar" -> Boolean.TRUE.equals(p.getEditar());
                    case "eliminar" -> Boolean.TRUE.equals(p.getEliminar());
                    case "exportar" -> Boolean.TRUE.equals(p.getExportar());
                    case "aprobar" -> Boolean.TRUE.equals(p.getAprobar());
                    default -> false;
                });
    }

    // ===========================================================
    // 🔹 12. Alias para compatibilidad MBAC Evaluator
    // ===========================================================
    @Override
    public boolean validarPermiso(Long idUser, String rutaPagina, String accion) {
        return tienePermiso(idUser, rutaPagina, accion);
    }

    // ===========================================================
    // 🔹 13. Obtener ID de usuario por nombre
    // ===========================================================
    @Override
    public Long obtenerUserIdPorUsername(String username) {
        return usuarioRepository.findByNameUser(username)
                .map(Usuario::getIdUser)
                .orElse(null);
    }

    // ===========================================================
    // 🚀 OPTIMIZACIÓN: Obtener permisos de múltiples usuarios en batch
    // ===========================================================
    @Override
    @Transactional(readOnly = true)
    public java.util.Map<Long, java.util.List<PermisoUsuarioResponseDTO>> obtenerPermisosPorUsuarios(List<Long> userIds) {
        if (userIds == null || userIds.isEmpty()) {
            return new java.util.HashMap<>();
        }

        log.info("🚀 Cargando permisos en batch para {} usuarios", userIds.size());
        
        // 🚀 UNA SOLA QUERY para todos los usuarios
        List<com.styp.cenate.model.view.PermisoActivoView> permisosView = permisoActivoViewRepository.findByIdUserIn(userIds);
        
        log.info("✅ {} permisos cargados desde vista para {} usuarios", permisosView.size(), userIds.size());

        // Mejor solución: agrupar directamente desde la vista
        java.util.Map<Long, java.util.List<com.styp.cenate.model.view.PermisoActivoView>> permisosPorUsuario = permisosView.stream()
                .collect(java.util.stream.Collectors.groupingBy(com.styp.cenate.model.view.PermisoActivoView::getIdUser));

        java.util.Map<Long, java.util.List<PermisoUsuarioResponseDTO>> resultado = new java.util.HashMap<>();
        for (Long userId : userIds) {
            List<com.styp.cenate.model.view.PermisoActivoView> permisosDelUsuario = permisosPorUsuario.getOrDefault(userId, new java.util.ArrayList<>());
            List<PermisoUsuarioResponseDTO> permisosDTO = permisosDelUsuario.stream()
                    .map(p -> PermisoUsuarioResponseDTO.builder()
                            .idPermiso(p.getIdPermiso() != null ? p.getIdPermiso().longValue() : 0L)
                            .idPagina(p.getIdPagina())
                            .rutaPagina(p.getRutaPagina())
                            .nombrePagina(p.getPagina())
                            .nombreModulo(p.getModulo())
                            .ver(Boolean.TRUE.equals(p.getPuedeVer()))
                            .crear(Boolean.TRUE.equals(p.getPuedeCrear()))
                            .editar(Boolean.TRUE.equals(p.getPuedeEditar()))
                            .eliminar(Boolean.TRUE.equals(p.getPuedeEliminar()))
                            .exportar(Boolean.TRUE.equals(p.getPuedeExportar()))
                            .aprobar(Boolean.TRUE.equals(p.getPuedeAprobar()))
                            .build())
                    .collect(java.util.stream.Collectors.toList());
            resultado.put(userId, permisosDTO);
        }

        log.info("✅ Permisos agrupados para {} usuarios", resultado.size());
        return resultado;
    }
}
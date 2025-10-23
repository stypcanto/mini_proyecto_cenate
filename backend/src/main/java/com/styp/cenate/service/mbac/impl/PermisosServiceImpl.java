package com.styp.cenate.service.mbac.impl;
import lombok.Data;

import com.styp.cenate.dto.mbac.*;
import com.styp.cenate.model.Usuario;
import com.styp.cenate.repository.UsuarioRepository;
import com.styp.cenate.repository.mbac.PermisoModularRepository;
import com.styp.cenate.service.mbac.PermisosService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * 🧩 Servicio MBAC: Gestión de permisos por usuario, módulo y página
 * Fuente de datos: vista vw_permisos_activos
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Data
public class PermisosServiceImpl implements PermisosService {

    private final UsuarioRepository usuarioRepository;
    private final PermisoModularRepository permisoModularRepository;

    // ===========================================================
    // 🔹 1. Obtener todos los permisos por ID de usuario
    // ===========================================================
    @Override
    public List<PermisoUsuarioResponseDTO> obtenerPermisosPorUsuario(Long idUser) {
        List<PermisoUsuarioResponseDTO> permisos = permisoModularRepository.findPermisosPorUsuarioId(idUser);
        log.info("✅ Permisos cargados para usuario ID {} -> {} registros", idUser, permisos.size());
        return permisos;
    }

    // ===========================================================
    // 🔹 2. Obtener permisos por nombre de usuario
    // ===========================================================
    @Override
    public List<PermisoUsuarioResponseDTO> obtenerPermisosPorUsername(String username) {
        Long userId = obtenerUserIdPorUsername(username);
        if (userId == null) {
            log.warn("⚠️ Usuario '{}' no encontrado en la base de datos", username);
            return Collections.emptyList();
        }
        return obtenerPermisosPorUsuario(userId);
    }

    // ===========================================================
    // 🔹 3. Obtener permisos por usuario y módulo específico
    // ===========================================================
    @Override
    public List<PermisoUsuarioResponseDTO> obtenerPermisosPorUsuarioYModulo(Long idUser, Integer idModulo) {
        return obtenerPermisosPorUsuario(idUser).stream()
                .filter(p -> Objects.nonNull(p.getNombreModulo()))
                .filter(p -> p.getNombreModulo().hashCode() == idModulo.hashCode()) // comparación simbólica
                .collect(Collectors.toList());
    }

    // ===========================================================
    // 🔹 4. Verificar si un permiso específico está permitido
    // ===========================================================
    @Override
    public CheckPermisoResponseDTO verificarPermiso(CheckPermisoRequestDTO request) {
        boolean permitido = tienePermiso(request.getIdUser(), request.getRutaPagina(), request.getAccion());
        return new CheckPermisoResponseDTO(
                request.getIdUser(),
                request.getRutaPagina(),
                request.getAccion(),
                permitido
        );
    }

    // ===========================================================
    // 🔹 5. Listar módulos accesibles por usuario
    // ===========================================================
    @Override
    public List<ModuloSistemaResponse> obtenerModulosAccesiblesUsuario(Long idUser) {
        List<PermisoUsuarioResponseDTO> permisos = obtenerPermisosPorUsuario(idUser);

        return permisos.stream()
                .map(PermisoUsuarioResponseDTO::getNombreModulo)
                .filter(Objects::nonNull)
                .distinct()
                .map(nombreModulo -> ModuloSistemaResponse.builder()
                        .idModulo(null)
                        .nombreModulo(nombreModulo)
                        .descripcion(null)
                        .icono(null)
                        .activo(true)
                        .build()
                )
                .collect(Collectors.toList());
    }

    // ===========================================================
    // 🔹 6. Listar páginas accesibles dentro de un módulo
    // ===========================================================
    @Override
    public List<PaginaModuloResponse> obtenerPaginasAccesiblesUsuario(Long idUser, Integer idModulo) {
        List<PermisoUsuarioResponseDTO> permisos = obtenerPermisosPorUsuarioYModulo(idUser, idModulo);

        return permisos.stream()
                .map(p -> PaginaModuloResponse.builder()
                        .idPagina(null)
                        .nombrePagina(p.getNombrePagina())
                        .rutaPagina(p.getRutaPagina())
                        .ver(p.getVer())
                        .crear(p.getCrear())
                        .editar(p.getEditar())
                        .eliminar(p.getEliminar())
                        .exportar(p.getExportar())
                        .aprobar(p.getAprobar())
                        .build()
                )
                .collect(Collectors.toList());
    }

    // ===========================================================
    // 🔹 7. Obtener el ID de usuario a partir del username
    // ===========================================================
    @Override
    public Long obtenerUserIdPorUsername(String username) {
        return usuarioRepository.findByNameUser(username)
                .map(Usuario::getIdUser)
                .orElse(null);
    }

    // ===========================================================
    // 🔹 8. Validar si un usuario tiene un permiso concreto
    // ===========================================================
    @Override
    public boolean tienePermiso(Long idUser, String rutaPagina, String accion) {
        log.debug("🔐 Validando permiso: usuario={}, ruta={}, acción={}", idUser, rutaPagina, accion);

        List<PermisoUsuarioResponseDTO> permisos = obtenerPermisosPorUsuario(idUser);
        if (permisos.isEmpty()) return false;

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
    // 🔹 9. Alias para compatibilidad con Aspect y Evaluator
    // ===========================================================
    @Override
    public boolean validarPermiso(Long idUser, String rutaPagina, String accion) {
        return tienePermiso(idUser, rutaPagina, accion);
    }
}
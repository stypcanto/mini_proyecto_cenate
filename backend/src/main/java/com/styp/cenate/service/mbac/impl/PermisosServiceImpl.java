package com.styp.cenate.service.mbac.impl;

import com.styp.cenate.dto.mbac.*;
import com.styp.cenate.model.Usuario;
import com.styp.cenate.model.view.ModuloView;
import com.styp.cenate.model.view.PaginaView;
import com.styp.cenate.repository.UsuarioRepository;
import com.styp.cenate.repository.mbac.PermisoModularRepository;
import com.styp.cenate.repository.view.ModuloViewRepository;
import com.styp.cenate.repository.view.PaginaViewRepository;
import com.styp.cenate.service.mbac.PermisosService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * 🧩 Servicio MBAC: Gestión de permisos por usuario, módulo y página
 * ✅ Adaptado a las vistas:
 *   - dim_modulo
 *   - dim_pagina
 *   - vw_permisos_activos (PermisoModularRepository)
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PermisosServiceImpl implements PermisosService {

    private final UsuarioRepository usuarioRepository;
    private final PermisoModularRepository permisoModularRepository;
    private final ModuloViewRepository moduloViewRepository;
    private final PaginaViewRepository paginaViewRepository;

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
    // 🔹 3. Obtener permisos por usuario y módulo (cruce con dim_pagina)
    // ===========================================================
    @Override
    public List<PermisoUsuarioResponseDTO> obtenerPermisosPorUsuarioYModulo(Long idUser, Long idModulo) {
        List<PermisoUsuarioResponseDTO> permisos = obtenerPermisosPorUsuario(idUser);

        // Obtener las rutas de las páginas que pertenecen al módulo indicado
        List<PaginaView> paginasModulo = paginaViewRepository.findByIdModulo(idModulo);
        Set<String> rutasModulo = paginasModulo.stream()
                .map(PaginaView::getRutaPagina)
                .collect(Collectors.toSet());

        return permisos.stream()
                .filter(p -> rutasModulo.contains(p.getRutaPagina()))
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
    // 🔹 5. Listar módulos accesibles por usuario (usa vista dim_modulo)
    // ===========================================================
    @Override
    public List<ModuloSistemaResponse> obtenerModulosAccesiblesUsuario(Long idUser) {
        List<ModuloView> modulos = moduloViewRepository.findAll();
        log.info("🧭 {} módulos disponibles en vista dim_modulo", modulos.size());

        return modulos.stream()
                .map(m -> ModuloSistemaResponse.builder()
                        .idModulo(m.getIdModulo().intValue()) // Conversión Long → Integer
                        .nombreModulo(m.getNombreModulo())
                        .descripcion(m.getDescripcion())
                        .icono(m.getIcono())
                        .activo(m.getActivo())
                        .paginas(Collections.emptyList())
                        .build()
                )
                .collect(Collectors.toList());
    }

    // ===========================================================
    // 🔹 6. Listar páginas accesibles dentro de un módulo (usa vista dim_pagina)
    // ===========================================================
    @Override
    public List<PaginaModuloResponse> obtenerPaginasAccesiblesUsuario(Long idUser, Long idModulo) {
        List<PaginaView> paginas = paginaViewRepository.findByIdModulo(idModulo);
        List<PermisoUsuarioResponseDTO> permisos = obtenerPermisosPorUsuario(idUser);

        return paginas.stream()
                .map(p -> {
                    Optional<PermisoUsuarioResponseDTO> permiso = permisos.stream()
                            .filter(per -> Objects.equals(per.getRutaPagina(), p.getRutaPagina()))
                            .findFirst();

                    return PaginaModuloResponse.builder()
                            .idPagina(p.getIdPagina().intValue()) // Conversión Long → Integer
                            .nombrePagina(p.getNombrePagina())
                            .rutaPagina(p.getRutaPagina())
                            .ver(permiso.map(PermisoUsuarioResponseDTO::getVer).orElse(false))
                            .crear(permiso.map(PermisoUsuarioResponseDTO::getCrear).orElse(false))
                            .editar(permiso.map(PermisoUsuarioResponseDTO::getEditar).orElse(false))
                            .eliminar(permiso.map(PermisoUsuarioResponseDTO::getEliminar).orElse(false))
                            .exportar(permiso.map(PermisoUsuarioResponseDTO::getExportar).orElse(false))
                            .aprobar(permiso.map(PermisoUsuarioResponseDTO::getAprobar).orElse(false))
                            .build();
                })
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
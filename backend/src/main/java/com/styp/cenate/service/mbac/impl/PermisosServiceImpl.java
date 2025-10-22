package com.styp.cenate.service.mbac.impl;

import com.styp.cenate.dto.mbac.*;
import com.styp.cenate.model.Usuario;
import com.styp.cenate.repository.UsuarioRepository;
import com.styp.cenate.service.mbac.PermisosService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PermisosServiceImpl implements PermisosService {

    private final UsuarioRepository usuarioRepository;

    @Override
    public List<PermisoUsuarioResponseDTO> obtenerPermisosPorUsuario(Long idUser) {
        throw new UnsupportedOperationException("Implementar obtenerPermisosPorUsuario(Long)");
    }

    @Override
    public List<PermisoUsuarioResponseDTO> obtenerPermisosPorUsername(String username) {
        throw new UnsupportedOperationException("Implementar obtenerPermisosPorUsername(String)");
    }

    @Override
    public List<PermisoUsuarioResponseDTO> obtenerPermisosPorUsuarioYModulo(Long idUser, Integer idModulo) {
        throw new UnsupportedOperationException("Implementar obtenerPermisosPorUsuarioYModulo(Long,Integer)");
    }

    @Override
    public CheckPermisoResponseDTO verificarPermiso(CheckPermisoRequestDTO request) {
        throw new UnsupportedOperationException("Implementar verificarPermiso(CheckPermisoRequestDTO)");
    }

    @Override
    public List<ModuloSistemaResponse> obtenerModulosAccesiblesUsuario(Long idUser) {
        throw new UnsupportedOperationException("Implementar obtenerModulosAccesiblesUsuario(Long)");
    }

    @Override
    public List<PaginaModuloResponse> obtenerPaginasAccesiblesUsuario(Long idUser, Integer idModulo) {
        throw new UnsupportedOperationException("Implementar obtenerPaginasAccesiblesUsuario(Long,Integer)");
    }

    @Override
    public Long obtenerUserIdPorUsername(String username) {
        return usuarioRepository.findByNameUser(username)
                .map(Usuario::getIdUser)
                .orElse(null);
    }

    @Override
    public boolean tienePermiso(Long idUser, String rutaPagina, String accion) {
        // Mismo cuerpo que validarPermiso
        log.debug("🔐 tienePermiso({}, {}, {})", idUser, rutaPagina, accion);
        return false; // TODO: implementar lógica real con tu vista vw_permisos_activos
    }

    @Override
    public boolean validarPermiso(Long idUser, String rutaPagina, String accion) {
        // Alias para compatibilidad con MBACPermissionAspect y MBACPermissionEvaluator
        return tienePermiso(idUser, rutaPagina, accion);
    }
}
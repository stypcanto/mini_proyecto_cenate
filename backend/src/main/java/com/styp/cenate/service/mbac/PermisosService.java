package com.styp.cenate.service.mbac;

import com.styp.cenate.dto.mbac.*;

import java.util.List;

public interface PermisosService {

    List<PermisoUsuarioResponseDTO> obtenerPermisosPorUsuario(Long idUser);
    List<PermisoUsuarioResponseDTO> obtenerPermisosPorUsername(String username);
    List<PermisoUsuarioResponseDTO> obtenerPermisosPorUsuarioYModulo(Long idUser, Integer idModulo);

    CheckPermisoResponseDTO verificarPermiso(CheckPermisoRequestDTO request);

    List<ModuloSistemaResponse> obtenerModulosAccesiblesUsuario(Long idUser);
    List<PaginaModuloResponse> obtenerPaginasAccesiblesUsuario(Long idUser, Integer idModulo);

    Long obtenerUserIdPorUsername(String username);

    // 🔹 Ambos nombres son soportados (tus MBAC llaman a validarPermiso)
    boolean tienePermiso(Long idUser, String rutaPagina, String accion);
    boolean validarPermiso(Long idUser, String rutaPagina, String accion);
}
package com.styp.cenate.service.mbac;

import com.styp.cenate.dto.mbac.CheckPermisoRequestDTO;
import com.styp.cenate.dto.mbac.CheckPermisoResponseDTO;
import com.styp.cenate.dto.mbac.PermisoUsuarioResponseDTO;

import java.util.List;

/**
 * Interfaz de servicio para la gestión de permisos modulares (MBAC).
 * Proporciona métodos para consultar y verificar permisos de usuarios.
 * 
 * @author CENATE Development Team
 * @version 1.0
 */
public interface PermisosService {

    /**
     * Obtiene todos los permisos activos de un usuario.
     * 
     * @param userId ID del usuario
     * @return Lista de permisos del usuario agrupados por rol, módulo y página
     */
    List<PermisoUsuarioResponseDTO> obtenerPermisosPorUsuario(Long userId);

    /**
     * Obtiene los permisos de un usuario por nombre de usuario.
     * 
     * @param username Nombre de usuario
     * @return Lista de permisos del usuario
     */
    List<PermisoUsuarioResponseDTO> obtenerPermisosPorUsername(String username);

    /**
     * Obtiene los permisos de un usuario para un módulo específico.
     * 
     * @param userId ID del usuario
     * @param idModulo ID del módulo
     * @return Lista de permisos del usuario en el módulo especificado
     */
    List<PermisoUsuarioResponseDTO> obtenerPermisosPorUsuarioYModulo(Long userId, Integer idModulo);

    /**
     * Verifica si un usuario tiene un permiso específico en una página.
     * 
     * @param request Datos de la solicitud (userId, rutaPagina, accion)
     * @return Respuesta indicando si el permiso está permitido
     */
    CheckPermisoResponseDTO verificarPermiso(CheckPermisoRequestDTO request);

    /**
     * Verifica si un usuario puede realizar una acción en una página específica.
     * 
     * @param userId ID del usuario
     * @param rutaPagina Ruta de la página
     * @param accion Acción a verificar (ver, crear, editar, eliminar, exportar, aprobar)
     * @return true si el usuario tiene el permiso, false en caso contrario
     */
    boolean tienePermiso(Long userId, String rutaPagina, String accion);

    /**
     * Obtiene todos los módulos a los que un usuario tiene acceso.
     * 
     * @param userId ID del usuario
     * @return Lista de nombres de módulos
     */
    List<String> obtenerModulosAccesiblesUsuario(Long userId);

    /**
     * Obtiene todas las páginas de un módulo a las que un usuario tiene acceso.
     * 
     * @param userId ID del usuario
     * @param idModulo ID del módulo
     * @return Lista de nombres de páginas
     */
    List<String> obtenerPaginasAccesiblesUsuario(Long userId, Integer idModulo);
}

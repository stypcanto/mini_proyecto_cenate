package com.styp.cenate.service.mbac.impl;
import lombok.extern.slf4j.Slf4j;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.styp.cenate.dto.mbac.*;
import com.styp.cenate.exception.ResourceNotFoundException;
import com.styp.cenate.model.view.PermisoActivoView;
import com.styp.cenate.repository.mbac.PermisoActivoViewRepository;
import com.styp.cenate.service.mbac.PermisosService;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementación del servicio de permisos modulares (MBAC).
 * Este servicio proporciona la lógica de negocio para gestionar y verificar
 * permisos de usuarios basados en roles, módulos y páginas.
 * 
 * @author CENATE Development Team
 * @version 1.0
 */
@Service
@Slf4j
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PermisosServiceImpl implements PermisosService {

    private final PermisoActivoViewRepository permisoActivoViewRepository;

    @Override
    public List<PermisoUsuarioResponseDTO> obtenerPermisosPorUsuario(Long userId) {
        log.info("Obteniendo permisos para el usuario con ID: {}", userId);
        
        List<PermisoActivoView> permisos = permisoActivoViewRepository.findByUserId(userId);
        
        if (permisos.isEmpty()) {
            log.warn("No se encontraron permisos para el usuario con ID: {}", userId);
            throw new ResourceNotFoundException("No se encontraron permisos para el usuario especificado");
        }
        
        return permisos.stream()
                .map(this::mapToPermisoUsuarioResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<PermisoUsuarioResponseDTO> obtenerPermisosPorUsername(String username) {
        log.info("Obteniendo permisos para el usuario: {}", username);
        
        List<PermisoActivoView> permisos = permisoActivoViewRepository.findByUsername(username);
        
        if (permisos.isEmpty()) {
            log.warn("No se encontraron permisos para el usuario: {}", username);
            throw new ResourceNotFoundException("No se encontraron permisos para el usuario especificado");
        }
        
        return permisos.stream()
                .map(this::mapToPermisoUsuarioResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<PermisoUsuarioResponseDTO> obtenerPermisosPorUsuarioYModulo(Long userId, Integer idModulo) {
        log.info("Obteniendo permisos del usuario {} para el módulo {}", userId, idModulo);
        
        List<PermisoActivoView> permisos = permisoActivoViewRepository.findByUserIdAndModuloId(userId, idModulo);
        
        if (permisos.isEmpty()) {
            log.warn("No se encontraron permisos para el usuario {} en el módulo {}", userId, idModulo);
        }
        
        return permisos.stream()
                .map(this::mapToPermisoUsuarioResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public CheckPermisoResponseDTO verificarPermiso(CheckPermisoRequestDTO request) {
        log.info("Verificando permiso - Usuario: {}, Página: {}, Acción: {}", 
                 request.getUserId(), request.getRutaPagina(), request.getAccion());
        
        boolean tienePermiso = tienePermiso(
            request.getUserId(), 
            request.getRutaPagina(), 
            request.getAccion()
        );
        
        String mensaje = tienePermiso 
            ? "Permiso concedido" 
            : "Permiso denegado - El usuario no tiene acceso a esta acción";
        
        return CheckPermisoResponseDTO.builder()
                .permitido(tienePermiso)
                .mensaje(mensaje)
                .pagina(request.getRutaPagina())
                .accion(request.getAccion())
                .build();
    }

    @Override
    public boolean tienePermiso(Long userId, String rutaPagina, String accion) {
        log.debug("Verificando permiso: usuario={}, página={}, acción={}", userId, rutaPagina, accion);
        
        // Validar que la acción sea válida
        if (!esAccionValida(accion)) {
            log.warn("Acción no válida: {}", accion);
            return false;
        }
        
        Integer resultado = permisoActivoViewRepository.checkPermiso(userId, rutaPagina, accion);
        boolean tienePermiso = resultado != null && resultado == 1;
        
        log.debug("Resultado de verificación de permiso: {}", tienePermiso);
        return tienePermiso;
    }

    @Override
    public List<String> obtenerModulosAccesiblesUsuario(Long userId) {
        log.info("Obteniendo módulos accesibles para el usuario: {}", userId);
        return permisoActivoViewRepository.findModulosByUserId(userId);
    }

    @Override
    public List<String> obtenerPaginasAccesiblesUsuario(Long userId, Integer idModulo) {
        log.info("Obteniendo páginas accesibles del módulo {} para el usuario: {}", idModulo, userId);
        return permisoActivoViewRepository.findPaginasByUserIdAndModuloId(userId, idModulo);
    }

    /**
     * Convierte una entidad PermisoActivoView a PermisoUsuarioResponseDTO.
     */
    private PermisoUsuarioResponseDTO mapToPermisoUsuarioResponseDTO(PermisoActivoView view) {
        PermisosDTO permisos = PermisosDTO.builder()
                .ver(view.getPuedeVer())
                .crear(view.getPuedeCrear())
                .editar(view.getPuedeEditar())
                .eliminar(view.getPuedeEliminar())
                .exportar(view.getPuedeExportar())
                .aprobar(view.getPuedeAprobar())
                .build();
        
        return PermisoUsuarioResponseDTO.builder()
                .rol(view.getRol())
                .modulo(view.getModulo())
                .pagina(view.getPagina())
                .rutaPagina(view.getRutaPagina())
                .permisos(permisos)
                .build();
    }

    /**
     * Valida que la acción sea una de las soportadas por el sistema.
     */
    private boolean esAccionValida(String accion) {
        return accion != null && (
            accion.equalsIgnoreCase("ver") ||
            accion.equalsIgnoreCase("crear") ||
            accion.equalsIgnoreCase("editar") ||
            accion.equalsIgnoreCase("eliminar") ||
            accion.equalsIgnoreCase("exportar") ||
            accion.equalsIgnoreCase("aprobar")
        );
    }
}

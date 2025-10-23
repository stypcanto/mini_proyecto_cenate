package com.styp.cenate.service.view.impl;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;

import com.styp.cenate.dto.mbac.PaginaModuloPermisosResponse;
import com.styp.cenate.model.view.PermisoActivoView;
import com.styp.cenate.repository.view.PermisoActivoViewRepository;
import com.styp.cenate.service.view.PermisoActivoViewService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 🧩 Implementación del servicio para obtener permisos activos de usuarios.
 * Conecta la vista vw_permisos_activos con el DTO PaginaModuloPermisosResponse.
 *
 * 📦 Capa: SERVICE → VIEW
 * 🧱 Fuente: vista SQL vw_permisos_activos
 * 🎯 Propósito: devolver permisos activos agrupados por página y módulo.
 */
@Service
@Slf4j
@Data
public class PermisoActivoViewServiceImpl implements PermisoActivoViewService {

    private static final Logger log = LoggerFactory.getLogger(PermisoActivoViewServiceImpl.class);

    private final PermisoActivoViewRepository permisoActivoViewRepository;

    public PermisoActivoViewServiceImpl(PermisoActivoViewRepository permisoActivoViewRepository) {
        this.permisoActivoViewRepository = permisoActivoViewRepository;
    }

    /**
     * 🔹 Obtiene los permisos activos del usuario desde la vista.
     *
     * @param idUser ID del usuario
     * @return lista de permisos activos por página
     */
    @Override
    @Transactional(readOnly = true)
    public List<PaginaModuloPermisosResponse> obtenerPermisosActivosPorUsuario(Long idUser) {
        log.info("🔍 Consultando permisos activos desde vw_permisos_activos para el usuario ID: {}", idUser);

        List<PermisoActivoView> permisos = permisoActivoViewRepository.findByIdUser(idUser);

        if (permisos.isEmpty()) {
            log.warn("⚠️ No se encontraron permisos activos para el usuario con ID {}", idUser);
            return List.of();
        }

        return permisos.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * 🔹 Convierte un registro de la vista a un DTO de respuesta.
     */
    private PaginaModuloPermisosResponse mapToResponse(PermisoActivoView view) {
        return PaginaModuloPermisosResponse.builder()
                .idPagina(view.getIdPagina())
                .nombrePagina(view.getPagina())
                .rutaPagina(view.getRutaPagina())
                .modulo(view.getModulo())
                .puedeVer(view.getPuedeVer())
                .puedeCrear(view.getPuedeCrear())
                .puedeEditar(view.getPuedeEditar())
                .puedeEliminar(view.getPuedeEliminar())
                .puedeExportar(view.getPuedeExportar())
                .puedeAprobar(view.getPuedeAprobar())
                .build();
    }
}
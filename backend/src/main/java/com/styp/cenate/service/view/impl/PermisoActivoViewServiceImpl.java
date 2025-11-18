package com.styp.cenate.service.view.impl;

import com.styp.cenate.dto.mbac.PaginaModuloPermisosResponse;
import com.styp.cenate.model.view.PermisoActivoView;
import com.styp.cenate.repository.view.PermisoActivoViewRepository;
import com.styp.cenate.service.view.PermisoActivoViewService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PermisoActivoViewServiceImpl implements PermisoActivoViewService {

    private final PermisoActivoViewRepository permisoActivoViewRepository;

    @Override
    @Transactional(readOnly = true)
    public List<PaginaModuloPermisosResponse> obtenerPermisosActivosPorUsuario(Long idUser) {
        log.info("🔍 Consultando permisos activos desde vw_permisos_activos para usuario ID: {}", idUser);

        List<PermisoActivoView> permisos = permisoActivoViewRepository.findByIdUser(idUser);

        if (permisos.isEmpty()) {
            log.warn("⚠️ No se encontraron permisos activos para el usuario con ID {}", idUser);
            return List.of();
        }

        return permisos.stream()
                .map(this::mapToResponse)
                .toList();
    }

    private PaginaModuloPermisosResponse mapToResponse(PermisoActivoView view) {
        return PaginaModuloPermisosResponse.builder()
                .idPagina(view.getIdPagina())
                .nombrePagina(view.getPagina())
                .rutaPagina(view.getRutaPagina())
                .modulo(view.getModulo())
                .puedeVer(Boolean.TRUE.equals(view.getPuedeVer()))
                .puedeCrear(Boolean.TRUE.equals(view.getPuedeCrear()))
                .puedeEditar(Boolean.TRUE.equals(view.getPuedeEditar()))
                .puedeEliminar(Boolean.TRUE.equals(view.getPuedeEliminar()))
                .puedeExportar(Boolean.TRUE.equals(view.getPuedeExportar()))
                .puedeAprobar(Boolean.TRUE.equals(view.getPuedeAprobar()))
                .build();
    }
}
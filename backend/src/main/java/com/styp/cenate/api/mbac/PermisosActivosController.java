package com.styp.cenate.api.mbac;

import com.styp.cenate.dto.mbac.PaginaModuloPermisosResponse;
import com.styp.cenate.service.view.PermisoActivoViewService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 🎯 Controlador para obtener los permisos activos de un usuario según su ID.
 *
 * Endpoint: GET /api/mbac/permisos-activos/{idUser}
 * Retorna una lista de páginas con sus permisos disponibles (ver, crear, editar, etc.).
 *
 * 📦 Capa: API → MBAC
 * 🧱 Servicio: PermisoActivoViewService
 */
@RestController
@RequestMapping("/api/mbac/permisos-activos")
@RequiredArgsConstructor
@Slf4j
public class PermisosActivosController {

    private final PermisoActivoViewService permisoActivoViewService;

    /**
     * 🔹 Obtiene los permisos activos del usuario especificado.
     *
     * @param idUser ID del usuario
     * @return Lista de permisos por página y módulo
     */
    @GetMapping("/{idUser}")
    public List<PaginaModuloPermisosResponse> obtenerPermisosPorUsuario(@PathVariable Long idUser) {
        log.info("🧩 Solicitando permisos activos del usuario con ID: {}", idUser);
        return permisoActivoViewService.obtenerPermisosActivosPorUsuario(idUser);
    }
}
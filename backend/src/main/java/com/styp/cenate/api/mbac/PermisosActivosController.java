package com.styp.cenate.api.mbac;

import com.styp.cenate.dto.mbac.PaginaModuloPermisosResponse;
import com.styp.cenate.service.view.PermisoActivoViewService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 🎯 Controlador REST – Permisos activos por usuario (MBAC)
 * ------------------------------------------------------------------------
 * Endpoint principal:
 *   GET /api/mbac/permisos-activos/{idUser}
 *
 * Retorna una lista de páginas con sus permisos activos (ver, crear, editar, eliminar…)
 * según los roles asignados al usuario.
 *
 * 📦 Capa: API (MBAC)
 * 🧩 Servicio: PermisoActivoViewService
 */
@RestController
@RequestMapping("/api/mbac/permisos-activos")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {
        "http://localhost:3000",
        "http://localhost:5173",
        "http://10.0.89.13:3000",
        "http://10.0.89.13:5173"
})
public class PermisosActivosController {

    private final PermisoActivoViewService permisoActivoViewService;

    /**
     * 🔹 Obtiene los permisos activos del usuario especificado.
     *
     * @param idUser ID del usuario autenticado
     * @return Lista de permisos por módulo/página o 204 si no hay resultados
     */
    @GetMapping("/{idUser}")
    public ResponseEntity<List<PaginaModuloPermisosResponse>> obtenerPermisosPorUsuario(
            @PathVariable Long idUser) {

        log.info("🧩 Solicitando permisos activos del usuario ID: {}", idUser);
        List<PaginaModuloPermisosResponse> permisos = permisoActivoViewService.obtenerPermisosActivosPorUsuario(idUser);

        if (permisos == null || permisos.isEmpty()) {
            log.warn("⚠️ No se encontraron permisos activos para el usuario {}", idUser);
            return ResponseEntity.noContent().build();
        }

        log.info("✅ {} permisos activos encontrados para usuario {}", permisos.size(), idUser);
        return ResponseEntity.ok(permisos);
    }
}
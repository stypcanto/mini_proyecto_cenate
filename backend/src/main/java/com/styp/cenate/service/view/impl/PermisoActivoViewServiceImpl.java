package com.styp.cenate.api.admin;
import lombok.extern.slf4j.Slf4j;

import com.styp.cenate.model.view.PermisoActivoView;
import com.styp.cenate.service.view.PermisoActivoViewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/permisos/activos")
@RequiredArgsConstructor
@Slf4j
public class PermisoActivoViewServiceImpl {

    private final PermisoActivoViewService permisoActivoViewService;

    @GetMapping("/usuario/{username}")
    public ResponseEntity<List<PermisoActivoView>> obtenerPermisosPorUsuario(
            @PathVariable String username) {
        List<PermisoActivoView> permisos = permisoActivoViewService.obtenerPermisosPorUsuario(username);
        return permisos.isEmpty()
                ? ResponseEntity.noContent().build()
                : ResponseEntity.ok(permisos);
    }
}

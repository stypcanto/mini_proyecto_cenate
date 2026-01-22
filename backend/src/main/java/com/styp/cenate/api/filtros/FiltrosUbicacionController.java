package com.styp.cenate.api.filtros;

import com.styp.cenate.dto.filtros.IpressOptionDTO;
import com.styp.cenate.dto.filtros.MacroregionOptionDTO;
import com.styp.cenate.dto.filtros.RedOptionDTO;
import com.styp.cenate.service.filtros.FiltrosUbicacionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/filtros")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {
        "http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173",
        "http://10.0.89.13:5173", "http://10.0.89.239:5173"
})
public class FiltrosUbicacionController {

    private final FiltrosUbicacionService service;

    @GetMapping("/macroregiones")
    public ResponseEntity<List<MacroregionOptionDTO>> macroregiones() {
        log.info("GET /api/filtros/macroregiones");
        return ResponseEntity.ok(service.listarMacroregiones());
    }

    @GetMapping("/redes")
    public ResponseEntity<List<RedOptionDTO>> redes(@RequestParam("macroId") Long macroId) {
        log.info("GET /api/filtros/redes?macroId={}", macroId);
        return ResponseEntity.ok(service.listarRedesPorMacro(macroId));
    }

    @GetMapping("/ipress")
    public ResponseEntity<List<IpressOptionDTO>> ipress(@RequestParam("redId") Long redId) {
        log.info("GET /api/filtros/ipress?redId={}", redId);
        return ResponseEntity.ok(service.listarIpressPorRed(redId));
    }
}

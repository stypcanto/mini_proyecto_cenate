package com.styp.cenate.api.catalogo;

import com.styp.cenate.dto.RegimenLaboralResponse;
import com.styp.cenate.service.regimen.RegimenLaboralService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * ============================================================
 * 📚 CONTROLADOR DE CATÁLOGOS PÚBLICOS
 * ============================================================
 * Endpoints públicos para obtener catálogos básicos sin autenticación
 * ============================================================
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://10.0.89.13:5173",
        "http://10.0.89.239:5173"
})
public class CatalogoPublicoController {

    private final RegimenLaboralService regimenLaboralService;

    /**
     * 📋 Alias público para regímenes laborales (con guión)
     */
    @GetMapping("/regimenes-laborales")
    public ResponseEntity<List<RegimenLaboralResponse>> getRegimenesLaborales() {
        log.info("📋 Consultando regímenes laborales (alias público)");
        List<RegimenLaboralResponse> activos = regimenLaboralService.getAllRegimenes()
                .stream()
                .filter(r -> "A".equalsIgnoreCase(r.getStatRegLab()))
                .toList();
        return ResponseEntity.ok(activos);
    }
}

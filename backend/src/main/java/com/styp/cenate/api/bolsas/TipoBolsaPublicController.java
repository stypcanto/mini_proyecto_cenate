package com.styp.cenate.api.bolsas;

import com.styp.cenate.dto.TipoBolsaResponse;
import com.styp.cenate.service.tipos_bolsas.TipoBolsaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * 📋 Controller público para Tipos de Bolsas
 * Base URL: /api/bolsas/tipos-bolsas
 */
@RestController
@RequestMapping("/api/bolsas")
@RequiredArgsConstructor
@Slf4j
public class TipoBolsaPublicController {

    private final TipoBolsaService tipoBolsaService;

    /**
     * Obtiene todos los tipos de bolsas activos
     * GET /api/bolsas/tipos-bolsas/activos
     */
    @GetMapping("/tipos-bolsas/activos")
    public ResponseEntity<List<TipoBolsaResponse>> obtenerTiposBolsasActivos() {
        log.info("📋 GET /api/bolsas/tipos-bolsas/activos");
        return ResponseEntity.ok(tipoBolsaService.obtenerTodosTiposBolsasActivos());
    }
}

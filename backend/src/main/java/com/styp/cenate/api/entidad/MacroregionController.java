package com.styp.cenate.api.entidad;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.styp.cenate.dto.MacroregionResponse;
import com.styp.cenate.model.Macroregion;
import com.styp.cenate.repository.MacroregionRepository;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 🌍 Controlador REST para gestionar macrorregiones
 */
@RestController
@RequestMapping("/api/macrorregiones")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:5173" })
public class MacroregionController {

    private final MacroregionRepository repository;

    /**
     * Obtener todas las macrorregiones activas
     */
    @GetMapping
    public ResponseEntity<List<MacroregionResponse>> listar() {
        log.info("📋 Listando todas las macrorregiones activas");
        List<MacroregionResponse> list = repository.findAll().stream()
                .filter(Macroregion::isActiva) // Filtrar solo activas
                .map(this::convertToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    /**
     * Obtener macroregión por ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<MacroregionResponse> obtenerPorId(@PathVariable Long id) {
        Macroregion macro = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Macrorregión no encontrada"));
        return ResponseEntity.ok(convertToResponse(macro));
    }

    /**
     * Convierte entidad Macroregion a DTO
     */
    private MacroregionResponse convertToResponse(Macroregion macro) {
        return MacroregionResponse.builder()
                .idMacro(macro.getIdMacro())
                .descMacro(macro.getDescMacro())
                .statMacro(macro.getStatMacro())
                .build();
    }
}

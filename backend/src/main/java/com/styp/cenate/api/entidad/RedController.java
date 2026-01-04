package com.styp.cenate.api.entidad;

import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.styp.cenate.dto.MacroregionResponse;
import com.styp.cenate.dto.RedResponse;
import com.styp.cenate.model.Macroregion;
import com.styp.cenate.model.Red;
import com.styp.cenate.repository.MacroregionRepository;
import com.styp.cenate.service.red.RedService;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/redes")
@RequiredArgsConstructor
@Slf4j
@Data
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:5173" })
public class RedController {

    private final RedService service;
    private final MacroregionRepository macroregionRepository;

    @GetMapping
    public ResponseEntity<List<RedResponse>> listar() {
        List<RedResponse> list = service.listar().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    /**
     * Endpoint público para obtener REDs activas (para registro de usuarios
     * externos)
     */
    @GetMapping("/publicas")
    public ResponseEntity<List<RedResponse>> listarPublicas() {
        log.info("📋 Consultando REDs activas (endpoint público)");
        List<RedResponse> list = service.listar().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RedResponse> obtenerPorId(@PathVariable Long id) {
        Red r = service.obtenerPorId(id);
        return ResponseEntity.ok(convertToResponse(r));
    }

    @PostMapping
    public ResponseEntity<RedResponse> crear(@RequestBody RedResponse request) {
        log.info("📝 Creando nueva red con macrorregión ID: {}", request.getIdMacro());

        Macroregion macro = macroregionRepository.findById(request.getIdMacro())
                .orElseThrow(() -> new IllegalArgumentException("Macrorregión no encontrada"));

        Red nuevo = Red.builder()
                .codigo(request.getCodRed())
                .descripcion(request.getDescRed())
                .macroregion(macro)
                .build();
        Red creado = service.crear(nuevo);
        return ResponseEntity.ok(convertToResponse(creado));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RedResponse> actualizar(@PathVariable Long id, @RequestBody RedResponse request) {
        log.info("✏️ Actualizando red {} con macrorregión ID: {}", id, request.getIdMacro());

        Macroregion macro = macroregionRepository.findById(request.getIdMacro())
                .orElseThrow(() -> new IllegalArgumentException("Macrorregión no encontrada"));

        Red toUpdate = Red.builder()
                .codigo(request.getCodRed())
                .descripcion(request.getDescRed())
                .macroregion(macro)
                .build();
        Red actualizado = service.actualizar(id, toUpdate);
        return ResponseEntity.ok(convertToResponse(actualizado));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Convierte entidad Red a DTO con Macroregión
     */
    private RedResponse convertToResponse(Red red) {
        Macroregion macro = red.getMacroregion();

        MacroregionResponse macroResponse = null;
        if (macro != null) {
            macroResponse = MacroregionResponse.builder()
                    .idMacro(macro.getIdMacro())
                    .descMacro(macro.getDescMacro())
                    .statMacro(macro.getStatMacro())
                    .build();
        }

        return RedResponse.builder()
                .idRed(red.getId())
                .codRed(red.getCodigo())
                .descRed(red.getDescripcion())
                .macroregion(macroResponse)
                .idMacro(macro != null ? macro.getIdMacro() : null)
                .activa(red.isActiva())
                .build();
    }
}

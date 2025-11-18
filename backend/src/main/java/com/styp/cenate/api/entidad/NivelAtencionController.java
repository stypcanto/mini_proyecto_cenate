package com.styp.cenate.api.entidad;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;

import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.styp.cenate.dto.NivelAtencionResponse;
import com.styp.cenate.model.NivelAtencion;
import com.styp.cenate.service.nivel.NivelAtencionService;

import java.util.List;

@RestController
@RequestMapping("/api/niveles-atencion")
@RequiredArgsConstructor
@Slf4j
@Data
public class NivelAtencionController {

    private final NivelAtencionService service;
    private final ModelMapper mapper;

    @GetMapping
    public ResponseEntity<List<NivelAtencionResponse>> listar() {
        List<NivelAtencionResponse> list = service.listar().stream()
                .map(n -> mapper.map(n, NivelAtencionResponse.class))
                .toList();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<NivelAtencionResponse> obtenerPorId(@PathVariable Long id) {
        NivelAtencion n = service.obtenerPorId(id);
        return ResponseEntity.ok(mapper.map(n, NivelAtencionResponse.class));
    }

    @PostMapping
    public ResponseEntity<NivelAtencionResponse> crear(@RequestBody NivelAtencionResponse request) {
        NivelAtencion nuevo = service.crear(mapper.map(request, NivelAtencion.class));
        return ResponseEntity.ok(mapper.map(nuevo, NivelAtencionResponse.class));
    }

    @PutMapping("/{id}")
    public ResponseEntity<NivelAtencionResponse> actualizar(@PathVariable Long id, @RequestBody NivelAtencionResponse request) {
        NivelAtencion actualizado = service.actualizar(id, mapper.map(request, NivelAtencion.class));
        return ResponseEntity.ok(mapper.map(actualizado, NivelAtencionResponse.class));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}

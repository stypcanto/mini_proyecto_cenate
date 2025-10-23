package com.styp.cenate.api.entidad;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;

import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.styp.cenate.dto.RedResponse;
import com.styp.cenate.model.Red;
import com.styp.cenate.service.red.RedService;

import java.util.List;

@RestController
@RequestMapping("/api/redes")
@RequiredArgsConstructor
@Slf4j
@Data
public class RedController {

    private final RedService service;
    private final ModelMapper mapper;

    @GetMapping
    public ResponseEntity<List<RedResponse>> listar() {
        List<RedResponse> list = service.listar().stream()
                .map(r -> mapper.map(r, RedResponse.class))
                .toList();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RedResponse> obtenerPorId(@PathVariable Long id) {
        Red r = service.obtenerPorId(id);
        return ResponseEntity.ok(mapper.map(r, RedResponse.class));
    }

    @PostMapping
    public ResponseEntity<RedResponse> crear(@RequestBody RedResponse request) {
        Red nuevo = service.crear(mapper.map(request, Red.class));
        return ResponseEntity.ok(mapper.map(nuevo, RedResponse.class));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RedResponse> actualizar(@PathVariable Long id, @RequestBody RedResponse request) {
        Red actualizado = service.actualizar(id, mapper.map(request, Red.class));
        return ResponseEntity.ok(mapper.map(actualizado, RedResponse.class));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}

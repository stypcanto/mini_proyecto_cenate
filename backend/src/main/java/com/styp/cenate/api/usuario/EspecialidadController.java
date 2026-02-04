package com.styp.cenate.api.usuario;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.styp.cenate.dto.EspecialidadDTO;
import com.styp.cenate.service.especialidad.IEspecialidadService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/especialidades")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://10.0.89.241:5173",
        "http://10.0.89.241:3000"
})
public class EspecialidadController {

    private final IEspecialidadService servicioEspecialidad;

    @GetMapping
    public ResponseEntity<List<EspecialidadDTO>> listarTodas() {
        log.info("GET /api/especialidades - Listando todas las especialidades");
        return ResponseEntity.ok(servicioEspecialidad.listarTodas());
    }

    @GetMapping("/activas")
    public ResponseEntity<List<EspecialidadDTO>> listarActivas() {
        log.info("GET /api/especialidades/activas - Listando especialidades activas");
        return ResponseEntity.ok(servicioEspecialidad.listar());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EspecialidadDTO> obtenerPorId(@PathVariable Long id) {
        log.info("GET /api/especialidades/{} - Buscando por ID", id);
        return servicioEspecialidad.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    @PostMapping
    public ResponseEntity<EspecialidadDTO> crear(@RequestBody EspecialidadDTO dto) {
        log.info("POST /api/especialidades - Creando especialidad: {}", dto.getDescripcion());
        EspecialidadDTO creada = servicioEspecialidad.crear(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(creada);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EspecialidadDTO> actualizar(
            @PathVariable Long id,
            @RequestBody EspecialidadDTO dto
    ) {
        log.info("PUT /api/especialidades/{} - Actualizando especialidad", id);
        EspecialidadDTO actualizada = servicioEspecialidad.actualizar(id, dto);
        return ResponseEntity.ok(actualizada);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        log.info("DELETE /api/especialidades/{} - Eliminando especialidad", id);
        servicioEspecialidad.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/con-medicos-activos")
    public ResponseEntity<List<EspecialidadDTO>> listarConMedicosActivos() {
        log.info("GET /api/especialidades/con-medicos-activos - Listando especialidades con médicos activos");
        return ResponseEntity.ok(servicioEspecialidad.listarConMedicosActivos());
    }
}

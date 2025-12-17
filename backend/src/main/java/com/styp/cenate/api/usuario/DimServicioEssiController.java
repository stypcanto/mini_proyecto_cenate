package com.styp.cenate.api.usuario;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.styp.cenate.dto.DimServicioEssiDTO;
import com.styp.cenate.service.personal.DimServicioEssiService;

@RestController
@RequestMapping("/api/servicio-essi")
public class DimServicioEssiController {

    private final DimServicioEssiService servicio;

    public DimServicioEssiController(DimServicioEssiService servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    public ResponseEntity<List<DimServicioEssiDTO>> listarTodos() {
        return ResponseEntity.ok(servicio.listarTodos());
    }

    @GetMapping("/activos")
    public ResponseEntity<List<DimServicioEssiDTO>> listarActivos() {
        return ResponseEntity.ok(servicio.listarActivos());
    }
    
    @GetMapping("/activos-cenate")
    public ResponseEntity<List<DimServicioEssiDTO>> listarActivosCenate() {
        return ResponseEntity.ok(servicio.listarActivosCenate());
    }
    

    @GetMapping("/{id}")
    public ResponseEntity<DimServicioEssiDTO> obtener(@PathVariable("id") Long id) {
        return ResponseEntity.ok(servicio.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<DimServicioEssiDTO> crear(@RequestBody DimServicioEssiDTO dto) {
        return ResponseEntity.ok(servicio.crear(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DimServicioEssiDTO> actualizar(@PathVariable("id") Long id,
                                                         @RequestBody DimServicioEssiDTO dto) {
        return ResponseEntity.ok(servicio.actualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable("id")  Long id) {
        servicio.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}

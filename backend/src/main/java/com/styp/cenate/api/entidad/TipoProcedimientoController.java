package com.styp.cenate.api.entidad;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;

import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.styp.cenate.dto.TipoProcedimientoResponse;
import com.styp.cenate.model.TipoProcedimiento;
import com.styp.cenate.service.tipoproced.TipoProcedimientoService;

import java.util.List;

/**
 * Controlador REST para gestionar los Tipos de Procedimiento.
 *
 * 💡 Este controlador expone endpoints REST para CRUD básico de la entidad {@link TipoProcedimiento}.
 * Utiliza {@link ModelMapper} para mapear entre entidades y DTOs,
 * de manera que la capa de presentación no dependa del modelo JPA directamente.
 *
 * Endpoints principales:
 *  - GET    /api/tipos-procedimiento           → Listar todos los tipos de procedimiento
 *  - GET    /api/tipos-procedimiento/{id}      → Obtener uno por ID
 *  - POST   /api/tipos-procedimiento           → Crear un nuevo registro
 *  - PUT    /api/tipos-procedimiento/{id}      → Actualizar un registro existente
 *  - DELETE /api/tipos-procedimiento/{id}      → Eliminar un registro por ID
 */
@RestController
@RequestMapping("/api/tipos-procedimiento")
@RequiredArgsConstructor
@Slf4j
@Data
public class TipoProcedimientoController {

    private final TipoProcedimientoService service;
    private final ModelMapper mapper;

    /**
     * Listar todos los tipos de procedimiento.
     */
    @GetMapping
    public ResponseEntity<List<TipoProcedimientoResponse>> listar() {
        List<TipoProcedimientoResponse> list = service.listar().stream()
                .map(tp -> mapper.map(tp, TipoProcedimientoResponse.class))
                .toList();
        return ResponseEntity.ok(list);
    }

    /**
     * Obtener un tipo de procedimiento por su ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<TipoProcedimientoResponse> obtenerPorId(@PathVariable Long id) {
        TipoProcedimiento tipoProcedimiento = service.obtenerPorId(id);
        return ResponseEntity.ok(mapper.map(tipoProcedimiento, TipoProcedimientoResponse.class));
    }

    /**
     * Crear un nuevo tipo de procedimiento.
     */
    @PostMapping
    public ResponseEntity<TipoProcedimientoResponse> crear(@RequestBody TipoProcedimientoResponse request) {
        TipoProcedimiento nuevo = mapper.map(request, TipoProcedimiento.class);
        TipoProcedimiento guardado = service.crear(nuevo);
        return ResponseEntity.ok(mapper.map(guardado, TipoProcedimientoResponse.class));
    }

    /**
     * Actualizar un tipo de procedimiento existente.
     */
    @PutMapping("/{id}")
    public ResponseEntity<TipoProcedimientoResponse> actualizar(@PathVariable Long id,
                                                                @RequestBody TipoProcedimientoResponse request) {
        TipoProcedimiento actualizado = service.actualizar(id, mapper.map(request, TipoProcedimiento.class));
        return ResponseEntity.ok(mapper.map(actualizado, TipoProcedimientoResponse.class));
    }

    /**
     * Eliminar un tipo de procedimiento por su ID.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}

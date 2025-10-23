package com.styp.cenate.api.entidad;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;

import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.styp.cenate.dto.ProcedimientoResponse;
import com.styp.cenate.model.Procedimiento;
import com.styp.cenate.service.proced.ProcedimientoService;

import java.util.List;

/**
 * Controlador REST para gestionar los Procedimientos médicos.
 *
 * 💡 Este controlador expone endpoints REST para CRUD básico de la entidad {@link Procedimiento}.
 * Utiliza {@link ModelMapper} para convertir entre entidades del modelo JPA y objetos DTO,
 * de forma que el frontend trabaje solo con representaciones ligeras y seguras.
 *
 * Endpoints principales:
 *  - GET    /api/procedimientos           → Listar todos los procedimientos
 *  - GET    /api/procedimientos/{id}      → Obtener uno por ID
 *  - POST   /api/procedimientos           → Crear un nuevo procedimiento
 *  - PUT    /api/procedimientos/{id}      → Actualizar un procedimiento existente
 *  - DELETE /api/procedimientos/{id}      → Eliminar un procedimiento por ID
 */
@RestController
@RequestMapping("/api/procedimientos")
@RequiredArgsConstructor
@Slf4j
@Data
public class ProcedimientoController {

    private final ProcedimientoService service;
    private final ModelMapper mapper;

    /**
     * Listar todos los procedimientos disponibles.
     *
     * @return lista de procedimientos mapeados a DTO.
     */
    @GetMapping
    public ResponseEntity<List<ProcedimientoResponse>> listar() {
        List<ProcedimientoResponse> list = service.listar().stream()
                .map(p -> mapper.map(p, ProcedimientoResponse.class))
                .toList();
        return ResponseEntity.ok(list);
    }

    /**
     * Obtener un procedimiento por su ID.
     *
     * @param id identificador único del procedimiento.
     * @return el procedimiento encontrado, mapeado a DTO.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProcedimientoResponse> obtenerPorId(@PathVariable Long id) {
        Procedimiento procedimiento = service.obtenerPorId(id);
        return ResponseEntity.ok(mapper.map(procedimiento, ProcedimientoResponse.class));
    }

    /**
     * Crear un nuevo procedimiento médico.
     *
     * @param request DTO con la información del nuevo procedimiento.
     * @return el procedimiento creado, mapeado a DTO.
     */
    @PostMapping
    public ResponseEntity<ProcedimientoResponse> crear(@RequestBody ProcedimientoResponse request) {
        Procedimiento nuevo = mapper.map(request, Procedimiento.class);
        Procedimiento guardado = service.crear(nuevo);
        return ResponseEntity.ok(mapper.map(guardado, ProcedimientoResponse.class));
    }

    /**
     * Actualizar un procedimiento existente.
     *
     * @param id identificador del procedimiento a actualizar.
     * @param request DTO con los nuevos datos.
     * @return el procedimiento actualizado, mapeado a DTO.
     */
    @PutMapping("/{id}")
    public ResponseEntity<ProcedimientoResponse> actualizar(@PathVariable Long id,
                                                            @RequestBody ProcedimientoResponse request) {
        Procedimiento actualizado = service.actualizar(id, mapper.map(request, Procedimiento.class));
        return ResponseEntity.ok(mapper.map(actualizado, ProcedimientoResponse.class));
    }

    /**
     * Eliminar un procedimiento médico por su ID.
     *
     * @param id identificador del procedimiento a eliminar.
     * @return respuesta vacía con estado 204 (sin contenido).
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}

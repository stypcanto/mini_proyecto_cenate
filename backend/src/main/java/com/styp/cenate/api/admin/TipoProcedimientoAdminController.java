package com.styp.cenate.api.admin;

import lombok.extern.slf4j.Slf4j;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.styp.cenate.dto.TipoProcedimientoResponse;
import com.styp.cenate.model.TipoProcedimiento;
import com.styp.cenate.service.tipoproced.TipoProcedimientoService;

import java.util.List;

/**
 * Controlador REST para gestionar los Tipos de Procedimiento (CPMS).
 * 
 * Endpoints principales:
 * - GET /api/admin/tipos-procedimiento → Listar todos
 * - GET /api/admin/tipos-procedimiento/{id} → Obtener uno por ID
 * - POST /api/admin/tipos-procedimiento → Crear nuevo
 * - PUT /api/admin/tipos-procedimiento/{id} → Actualizar existente
 * - DELETE /api/admin/tipos-procedimiento/{id} → Eliminar por ID
 */
@RestController
@RequestMapping("/api/admin/tipos-procedimiento")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
public class TipoProcedimientoAdminController {

    private final TipoProcedimientoService service;
    private final ModelMapper mapper;

    /**
     * Listar todos los tipos de procedimiento.
     */
    @GetMapping
    public ResponseEntity<List<TipoProcedimientoResponse>> listar() {
        log.info("📋 Listando todos los tipos de procedimiento");
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
        log.info("🔍 Obteniendo tipo de procedimiento ID: {}", id);
        TipoProcedimiento tipoProcedimiento = service.obtenerPorId(id);
        return ResponseEntity.ok(mapper.map(tipoProcedimiento, TipoProcedimientoResponse.class));
    }

    /**
     * Crear un nuevo tipo de procedimiento.
     */
    @PostMapping
    public ResponseEntity<TipoProcedimientoResponse> crear(@RequestBody TipoProcedimientoResponse request) {
        log.info("➕ Creando tipo de procedimiento: {}", request.getCodTipProced());
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
        log.info("✏️ Actualizando tipo de procedimiento ID: {}", id);
        TipoProcedimiento actualizado = service.actualizar(id, mapper.map(request, TipoProcedimiento.class));
        return ResponseEntity.ok(mapper.map(actualizado, TipoProcedimientoResponse.class));
    }

    /**
     * Eliminar un tipo de procedimiento por su ID.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        log.info("🗑️ Eliminando tipo de procedimiento ID: {}", id);
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}

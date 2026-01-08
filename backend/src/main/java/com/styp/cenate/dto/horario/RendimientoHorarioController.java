package com.styp.cenate.dto.horario;


import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.styp.cenate.service.horario.RendimientoHorarioService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/rendimiento-horario")
public class RendimientoHorarioController {

    private final RendimientoHorarioService service;



    /**
     * LISTA PAGINADA + FILTROS (para búsqueda avanzada)
     *
     * Ejemplos:
     * /api/rendimiento-horario?page=0&size=10
     * /api/rendimiento-horario?q=472&estado=A
     * /api/rendimiento-horario?idAreaHosp=1&idServicio=13&idActividad=6&pacMin=2&pacMax=5&estado=A&page=0&size=10
     */
    @GetMapping
    public Page<RendimientoHorarioResponse> listar(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Long idAreaHosp,
            @RequestParam(required = false) Long idServicio,
            @RequestParam(required = false) Long idActividad,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) Integer pacMin,
            @RequestParam(required = false) Integer pacMax,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return service.buscar(q, idAreaHosp, idServicio, idActividad, estado, pacMin, pacMax, page, size);
    }
    
    /*
     * Lista paginada con descripcion de campos (Tablas relacionadas) 
     * */
    @GetMapping("/listado")
    public Page<RendimientoHorarioListadoRow> listado(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Long idAreaHosp,
            @RequestParam(required = false) Long idServicio,
            @RequestParam(required = false) Long idActividad,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) Integer pacMin,
            @RequestParam(required = false) Integer pacMax,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
    	System.out.println("q=" + q + " | type=" + (q == null ? "null" : q.getClass()));

		return service.listar(q, idAreaHosp, idServicio, idActividad, estado, pacMin, pacMax, page, size);
    }

    
    
    
    
    /**
     * OBTENER POR ID
     */
    @GetMapping("/{id}")
    public RendimientoHorarioResponse obtener(@PathVariable Long id) {
        return service.obtenerPorId(id);
    }

    /**
     * CREAR
     */
    @PostMapping
    public ResponseEntity<RendimientoHorarioResponse> crear(@RequestBody RendimientoHorarioRequest req) {
        RendimientoHorarioResponse created = service.crear(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * ACTUALIZAR
     */
    @PutMapping("/{id}")
    public RendimientoHorarioResponse actualizar(@PathVariable Long id, @RequestBody RendimientoHorarioRequest req) {
        return service.actualizar(id, req);
    }

    /**
     * ELIMINAR
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}

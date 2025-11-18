package com.styp.cenate.api.usuario;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.styp.cenate.dto.DimPersonalTipoDTO;
import com.styp.cenate.service.personal.DimPersonalTipoService;

import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/personal-tipo")
@Slf4j
public class DimPersonalTipoController {

    private final DimPersonalTipoService servicio;

    public DimPersonalTipoController(DimPersonalTipoService servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    public ResponseEntity<List<DimPersonalTipoDTO>> listarTodos() {
        return ResponseEntity.ok(servicio.listarTodos());
    }

    @GetMapping("/personal/{idPers}")
    public ResponseEntity<List<DimPersonalTipoDTO>> listarPorPersonal(@PathVariable("idPers") Long idPers) {
        return ResponseEntity.ok(servicio.listarPorPersonal(idPers));
    }

    @GetMapping("/tipo/{idTipoPers}")
    public ResponseEntity<List<DimPersonalTipoDTO>> listarPorTipo(@PathVariable("idTipoPers") Long idTipoPers) {
        return ResponseEntity.ok(servicio.listarPorTipo(idTipoPers));
    }

    @PostMapping
    public ResponseEntity<DimPersonalTipoDTO> crear(@RequestBody DimPersonalTipoDTO dto) {
    	log.info("Codigo de Persona: {} - Tipo de Personal {} : ", dto.getIdPers(), dto.getIdTipoPers());
        return ResponseEntity.ok(servicio.crear(dto));
    }

    @DeleteMapping("/{idPers}/{idTipoPers}")
    public ResponseEntity<Void> eliminar(@PathVariable("idPers") Long idPers,
                                         @PathVariable("idTipoPers") Long idTipoPers) {
        servicio.eliminar(idPers, idTipoPers);
        return ResponseEntity.noContent().build();
    }
}

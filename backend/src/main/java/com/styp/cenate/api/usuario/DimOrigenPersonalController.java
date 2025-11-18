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

import com.styp.cenate.dto.DimOrigenPersonalDTO;
import com.styp.cenate.service.personal.DimOrigenPersonalService;

import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/origen-personal")
@Slf4j
public class DimOrigenPersonalController {

	private DimOrigenPersonalService servicio;

	public DimOrigenPersonalController(DimOrigenPersonalService servicioOrigen) {
		this.servicio = servicioOrigen;
	}

	@GetMapping
	public ResponseEntity<?> consultar() {
		log.info("Cargando Lista: {}", servicio.listarTodos());
		return ResponseEntity.ok(servicio.listarTodos());
	}

	@GetMapping("/activos")
	public ResponseEntity<List<DimOrigenPersonalDTO>> listarActivos() {
		return ResponseEntity.ok(servicio.listarActivos());
	}

	@GetMapping("/{id}")
	public ResponseEntity<DimOrigenPersonalDTO> obtener(@PathVariable("id") Long id) {
		log.info("Probando ::::::");
		return ResponseEntity.ok(servicio.buscarPorId(id));
	}

	@PostMapping
	public ResponseEntity<DimOrigenPersonalDTO> crear(@RequestBody DimOrigenPersonalDTO dto) {
		return ResponseEntity.ok(servicio.crear(dto));
	}

	@PutMapping("/{id}")
	public ResponseEntity<DimOrigenPersonalDTO> actualizar(@PathVariable("id") Long id,
			@RequestBody DimOrigenPersonalDTO dto) {
		return ResponseEntity.ok(servicio.actualizar(id, dto));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> eliminar(@PathVariable("id") Long id) {
		servicio.eliminar(id);
		return ResponseEntity.noContent().build();
	}

}

package com.styp.cenate.api.catalogo;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.styp.cenate.dto.catalogo.SubactividadEssiResponseDTO;
import com.styp.cenate.service.catalogo.ISubactividadEssiService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/catalogo/subactividad-essi")
@Slf4j
public class DimSubactividadEssiController {
	private final ISubactividadEssiService subactividadService;

	/*
	 * ========================= LISTAR GET /api/catalogo/subactividad-essi
	 * =========================
	 */
	@GetMapping
	public ResponseEntity<List<SubactividadEssiResponseDTO>> listar() {
		return ResponseEntity.ok(subactividadService.listar());
	}

	/*
	 * ========================= OBTENER POR ID GET
	 * /api/catalogo/subactividad-essi/{id} =========================
	 */
	@GetMapping("/{id}")
	public ResponseEntity<SubactividadEssiResponseDTO> obtenerPorId(@PathVariable Long id) {

		return ResponseEntity.ok(subactividadService.obtenerPorId(id));
	}

	@GetMapping("/activas/cenate")
	public ResponseEntity<List<SubactividadEssiResponseDTO>> listarActivasCenate() {
	    return ResponseEntity.ok(subactividadService.listarActivasCenate());
	}

	
	
	/*
	 * ========================= EXISTE POR ID (opcional) GET
	 * /api/catalogo/subactividad-essi/{id}/existe =========================
	 */
	@GetMapping("/{id}/existe")
	public ResponseEntity<Boolean> existePorId(@PathVariable Long id) {
		return ResponseEntity.ok(subactividadService.existePorId(id));
	}

	/*
	 * ========================= ELIMINACIÓN LÓGICA DELETE
	 * /api/catalogo/subactividad-essi/{id} =========================
	 */
	@DeleteMapping("/{id}")
	public ResponseEntity<Void> eliminarLogico(@PathVariable Long id) {
		subactividadService.eliminarLogico(id);
		return ResponseEntity.noContent().build(); // 204
	}

}

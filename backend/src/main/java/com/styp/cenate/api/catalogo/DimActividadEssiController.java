package com.styp.cenate.api.catalogo;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.styp.cenate.dto.catalogo.ActividadEssiResponseDTO;
import com.styp.cenate.service.catalogo.IActividadEssiService;
import lombok.RequiredArgsConstructor;


@RestController
@RequestMapping("/api/catalogo/actividades")
@RequiredArgsConstructor
public class DimActividadEssiController {

	private final IActividadEssiService actividadService;

	/*
	 * ========================= LISTAR ACTIVAS + CENATE GET
	 * /api/catalogo/actividades/activas/cenate =========================
	 */
	@GetMapping("/activas/cenate")
	public ResponseEntity<List<ActividadEssiResponseDTO>> listarActivasCenate() {
		return ResponseEntity.ok(actividadService.listarActivasCenate());
	}

}

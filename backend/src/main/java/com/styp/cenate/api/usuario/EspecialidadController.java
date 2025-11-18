package com.styp.cenate.api.usuario;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.styp.cenate.dto.EspecialidadDTO;
import com.styp.cenate.service.especialidad.IEspecialidadService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/especialidad")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {
        "http://localhost:3000",
        "http://localhost:5173",
        "http://10.0.89.13:5173",
        "http://10.0.89.13:3000"
})
public class EspecialidadController {

	private final IEspecialidadService servicioEspecialidad;

	@GetMapping
	public ResponseEntity<List<EspecialidadDTO>> consultar() {
		log.info("📋 Consultando todas las especialidades");
		return ResponseEntity.ok(servicioEspecialidad.listar());
	}

}

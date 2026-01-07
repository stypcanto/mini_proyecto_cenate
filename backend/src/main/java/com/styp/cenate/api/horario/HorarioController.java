package com.styp.cenate.api.horario;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.styp.cenate.dto.horario.HorarioDiaResult;
import com.styp.cenate.dto.horario.HorarioMesResponse;
import com.styp.cenate.dto.horario.RegistrarHorarioDiaRequest;
import com.styp.cenate.dto.horario.ValidacionProfesionalHorarioResult;
import com.styp.cenate.service.horario.HorarioMesService;
import com.styp.cenate.service.horario.HorarioService;
import com.styp.cenate.service.horario.ValidacionProfesionalHorarioService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/horarios")
@RequiredArgsConstructor
@Slf4j
public class HorarioController {

	private final HorarioService service;
	private final ValidacionProfesionalHorarioService serviceValidacionProfesional;
	private final HorarioMesService serviceHorarioMes;

	@GetMapping("/mes")
	public ResponseEntity<HorarioMesResponse> consultarMes(@RequestParam Long idPers, @RequestParam String periodo) {
		return ResponseEntity.ok(serviceHorarioMes.consultarMes(idPers, periodo));
	}

	@PostMapping("/dia")
	public ResponseEntity<?> registrarDia(@RequestBody RegistrarHorarioDiaRequest req) {

		if (req == null || req.getIdPers() == null || req.getFecha() == null || req.getCodHorarioVisual() == null
				|| req.getUsuario() == null || req.getCodHorarioVisual().trim().isEmpty()
				|| req.getUsuario().trim().isEmpty()) {

			return ResponseEntity.badRequest().body(
					Map.of("ok", false, "message", "Campos requeridos: idPers, fecha, codHorarioVisual, usuario"));
		}

		ValidacionProfesionalHorarioResult validacion = serviceValidacionProfesional.validar(req.getIdPers());
		log.info("Datos de validacion : {} ", validacion.toString());

		if (validacion == null) {
			log.warn("Validación devolvió NULL para idPers={}", req.getIdPers());
			return ResponseEntity.badRequest().body(Map.of("ok", false, "message",
					"No fue posible validar al profesional (sin respuesta de validación)."));
		}

		if (Boolean.FALSE.equals(validacion.getOk())) {
			log.warn("Profesional inválido para registrar horario. idPers={}, motivo={}", req.getIdPers(),
					validacion.getMotivo());

			return ResponseEntity.badRequest()
					.body(Map.of("ok", false, "message", validacion.getMotivo(), "validacion", validacion));
		}

		HorarioDiaResult result = service.registrarDia(req.getIdPers(), req.getFecha(), req.getCodHorarioVisual(),
				req.getUsuario());

		return ResponseEntity.ok(result);
	}
}

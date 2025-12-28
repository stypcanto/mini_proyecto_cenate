package com.styp.cenate.api.chatbot;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import com.styp.cenate.dto.AtencionDisponibilidadDTO;
import com.styp.cenate.service.chatbot.disponibilidad.IVwAtencionDisponibilidadService;
import com.styp.cenate.service.personal.DimServicioEssiService;

import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/v1/chatbot/disponibilidad")
@Slf4j
public class ChatbotDisponibilidadController {

	private final IVwAtencionDisponibilidadService service;
	private final DimServicioEssiService servicioEssi;

	public ChatbotDisponibilidadController(IVwAtencionDisponibilidadService service,DimServicioEssiService servicioEssi) {
		this.service = service;
		this.servicioEssi=servicioEssi;
	}

	// ============================================================
	// Filtro por servicio (exacto)
	// ============================================================
	@GetMapping("/por-servicio")
	public ResponseEntity<List<AtencionDisponibilidadDTO>> listarPorServicio(@RequestParam String servicio) {
		// Consultar el IdServicio a partir del codigoServicio
		var entidadServicioEssi = servicioEssi.findByCodServicio(servicio);
		// Esta consulta es por el nombre del servicio
		//var data = service.listarPorServicio(servicio);
		var data = service.listarPorIdServicio(entidadServicioEssi.getIdServicio());
		return ResponseEntity.ok(data);
	}

	// ============================================================
	// Filtro por servicio (sin distinguir mayúsculas/minúsculas)
	// ============================================================
	@GetMapping("/por-servicio-ignorecase")
	public ResponseEntity<List<AtencionDisponibilidadDTO>> listarPorServicioIgnoreCase(@RequestParam String servicio) {
		var data = service.listarPorServicioIgnoreCase(servicio);
		return ResponseEntity.ok(data);
	}

	// ============================================================
	// Filtro por servicio (LIKE %valor%)
	// ============================================================
	@GetMapping("/por-servicio-like")
	public ResponseEntity<List<AtencionDisponibilidadDTO>> listarPorServicioLike(@RequestParam String servicio) {
		var data = service.listarPorServicioLike(servicio);
		return ResponseEntity.ok(data);
	}

	// ============================================================
	// Filtro por idServicio
	// ============================================================
	@GetMapping("/por-id-servicio")
	public ResponseEntity<List<AtencionDisponibilidadDTO>> listarPorIdServicio(@RequestParam Long idServicio) {
		var data = service.listarPorIdServicio(idServicio);
		return ResponseEntity.ok(data);
	}

	// ============================================================
	// Filtro combinado: servicio + numDocPers
	// ============================================================
	@GetMapping("/por-servicio-doc")
	public ResponseEntity<List<AtencionDisponibilidadDTO>> listarPorServicioYNumDocPers(@RequestParam String servicio,
			@RequestParam String numDocPers) {
		var data = service.listarPorServicioYNumDocPers(servicio, numDocPers);
		return ResponseEntity.ok(data);
	}

	// ============================================================
	// Filtro combinado: idServicio + numDocPers
	// ============================================================
	@GetMapping("/por-idservicio-doc")
	public ResponseEntity<List<AtencionDisponibilidadDTO>> listarPorIdServicioYNumDocPers(@RequestParam Long idServicio,
			@RequestParam String numDocPers) {
		var data = service.findByIdServicioAndNumDocPers(idServicio, numDocPers);
		return ResponseEntity.ok(data);
	}

}

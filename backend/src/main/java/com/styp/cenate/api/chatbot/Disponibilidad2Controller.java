package com.styp.cenate.api.chatbot;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.styp.cenate.dto.chatbot.VwFechasDisponiblesChatbotDto;
import com.styp.cenate.dto.chatbot.VwSlotsDisponiblesChatbotDto;
import com.styp.cenate.service.chatbot.disponibilidad.VwFechasDisponiblesChatbotService;
import com.styp.cenate.service.chatbot.disponibilidad.VwSlotsDisponiblesChatbotService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v2/chatbot/disponibilidad")
@RequiredArgsConstructor
public class Disponibilidad2Controller {

	private final VwFechasDisponiblesChatbotService servicio;
	private final VwSlotsDisponiblesChatbotService servicioSlot;

	@GetMapping("/servicio")
	public ResponseEntity<List<VwFechasDisponiblesChatbotDto>> buscar(
			@RequestParam(required = false) Integer idServicio, @RequestParam(required = false) String codServicio) {

		return ResponseEntity.ok(servicio.buscar(idServicio, codServicio));
	}

	@GetMapping("/servicio-detalle")
	public ResponseEntity<List<VwSlotsDisponiblesChatbotDto>> buscar(
			@RequestParam(name = "fecha_cita", required = true) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaCita,

			@RequestParam(name = "cod_servicio", required = true) String codServicio) {

		return ResponseEntity.ok(servicioSlot.buscarPorFechaYCodServicio(fechaCita, codServicio));
	}

}

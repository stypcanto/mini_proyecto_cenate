package com.styp.cenate.api.chatbot;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.styp.cenate.service.chatbot.solicitudcita.IDimEstadoCitaService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/chatbot/estado-cita")
public class EstadoCitaController {
	
	
	private final IDimEstadoCitaService servicioEstado;
	
	@GetMapping
	public ResponseEntity<?> listarTodo(){
		return ResponseEntity.ok(servicioEstado.listarTodo());
	}
	
	

}

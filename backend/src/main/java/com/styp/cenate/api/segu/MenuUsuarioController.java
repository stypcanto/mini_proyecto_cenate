package com.styp.cenate.api.segu;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.styp.cenate.service.segu.MenuUsuarioService;

import lombok.Data;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/menu-usuario")
@Data
@Slf4j
public class MenuUsuarioController {
	
	private final MenuUsuarioService servicioMenu;
	
	
	@GetMapping("/usuario/{idUser}")
	public ResponseEntity<?> obtenerMenu(@PathVariable("idUser") Long idUser){
		return ResponseEntity.ok(servicioMenu.obtenerMenuUsuario(idUser));
	}
	
	
	
}

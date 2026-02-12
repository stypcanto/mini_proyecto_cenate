package com.styp.cenate.api.segu;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.styp.cenate.service.segu.MenuUsuarioService;

import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/menu-usuario")
@Slf4j
public class MenuUsuarioController {

	private final MenuUsuarioService servicioMenu;


	/**
	 * Obtiene el menú del usuario basándose en los permisos modulares
	 * asignados desde el panel de administración (tabla permiso_modular).
	 */
	@GetMapping("/usuario/{idUser}")
	public ResponseEntity<?> obtenerMenu(@PathVariable("idUser") Long idUser) {
		log.info("🔍 Obteniendo menú para usuario ID: {}", idUser);
		// Usar el nuevo método que consulta permisos modulares
		return ResponseEntity.ok(servicioMenu.obtenerMenuDesdePermisosModulares(idUser));
	}

	/**
	 * Endpoint alternativo que usa la función de base de datos original
	 * (para compatibilidad con sistemas existentes).
	 */
	@GetMapping("/usuario/{idUser}/legacy")
	public ResponseEntity<?> obtenerMenuLegacy(@PathVariable("idUser") Long idUser) {
		log.info("🔍 Obteniendo menú legacy para usuario ID: {}", idUser);
		return ResponseEntity.ok(servicioMenu.obtenerMenuUsuario(idUser));
	}

}

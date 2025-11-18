package com.styp.cenate.api.usuario;

import com.styp.cenate.dto.UsuarioCreateRequest;
import com.styp.cenate.dto.UsuarioResponse;
import com.styp.cenate.dto.UsuarioUpdateRequest;
import com.styp.cenate.service.usuario.UsuarioService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.styp.cenate.dto.mbac.RolResponse;
import java.util.HashMap;
import java.util.List;

import java.util.Map;

/**
 * 🎯 Controlador REST para la gestión interna de usuarios en el sistema CENATE.
 * Versión corregida para evitar conflictos de rutas y asegurar compatibilidad
 * con Spring Security.
 */
@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:5173", "http://10.0.89.13:3000",
		"http://10.0.89.13:5173" })
public class UsuarioController {

	private final UsuarioService usuarioService;

	// ============================================================
	// 🧩 NUEVO ENDPOINT: Listar roles del usuario por username
	// ============================================================
	@GetMapping("/roles/{username}")
	public ResponseEntity<List<RolResponse>> getRolesPorUsuario(@PathVariable String username) {
		log.info("🎯 Consultando roles asociados al usuario '{}'", username);
		List<RolResponse> roles = usuarioService.obtenerRolesPorUsername(username);
		return ResponseEntity.ok(roles);
	}

	// ============================================================
	// 📋 CONSULTAS GENERALES
	// ============================================================

	/** 🔹 Obtener todos los usuarios */
	@GetMapping
	@PreAuthorize("hasAnyRole('SUPERADMIN','ADMIN')")
	public ResponseEntity<List<UsuarioResponse>> getAllUsers() {
		log.info("📋 Consultando todos los usuarios registrados");
		return ResponseEntity.ok(usuarioService.getAllUsers());
	}

	/** 🔹 Obtener TODO el personal de CENATE (con y sin usuario) - Paginado */
	@GetMapping("/all-personal")
	public ResponseEntity<Map<String, Object>> getAllPersonal(
			@RequestParam(defaultValue = "0") int page,
			@RequestParam(defaultValue = "7") int size,  // 7 usuarios por página por defecto
			@RequestParam(defaultValue = "idPers") String sortBy,
			@RequestParam(defaultValue = "asc") String direction
	) {
		log.info("📋 Consultando personal de CENATE - Página: {}, Tamaño: {}, Orden: {} {}", 
				page, size, sortBy, direction);
		
		Map<String, Object> response = usuarioService.getAllPersonal(page, size, sortBy, direction);
		return ResponseEntity.ok(response);
	}

	/** 🔹 Obtener un usuario por su ID */
	@GetMapping("/id/{id}")
	public ResponseEntity<UsuarioResponse> getUserById(@PathVariable Long id) {
		log.info("🔎 Consultando usuario por ID: {}", id);
		return ResponseEntity.ok(usuarioService.getUserById(id));
	}

	/** 🔹 Obtener el usuario autenticado actual (incluye roles) */
	@GetMapping("/me")
	public ResponseEntity<?> getCurrentUser(Authentication authentication) {
		String username = authentication.getName();
		log.info("👤 Consultando información del usuario autenticado: {}", username);

		try {
			var usuario = usuarioService.getUserByUsername(username);
			if (usuario == null) {
				log.warn("⚠️ Usuario {} no encontrado en la base de datos", username);
				return ResponseEntity.status(404).body(Map.of("message", "Usuario no encontrado"));
			}

			List<String> roles = usuarioService.getRolesByUsername(username);
			Map<String, Object> response = new HashMap<>();
			response.put("idUser", usuario.getIdUser());
			response.put("username", usuario.getUsername());
			response.put("estado", usuario.getEstado());
			response.put("activo", usuario.isActivo());
			response.put("locked", usuario.isLocked());
			response.put("roles", roles);

			log.info("✅ Usuario autenticado encontrado: {} con roles {}", username, roles);
			return ResponseEntity.ok(response);

		} catch (Exception e) {
			log.error("❌ Error al obtener información del usuario autenticado {}: {}", username, e.getMessage());
			return ResponseEntity.internalServerError()
					.body(Map.of("message", "Error interno del servidor", "error", e.getMessage()));
		}
	}

	// ============================================================
	// 🧭 CONSULTAS FILTRADAS
	// ============================================================

	/** 🌐 Obtener usuarios EXTERNOS */
	@GetMapping("/externos")
	@PreAuthorize("hasAnyRole('SUPERADMIN','ADMIN')")
	public ResponseEntity<List<UsuarioResponse>> getExternalUsers() {
		log.info("🌍 Consultando usuarios EXTERNOS");
		return ResponseEntity
				.ok(usuarioService.getUsuariosByRoles(List.of("INSTITUCION_EX", "ASEGURADORA", "REGULADOR")));
	}

	/** 🏥 Obtener usuarios INTERNOS */
	@GetMapping("/internos")
	@PreAuthorize("hasAnyRole('SUPERADMIN','ADMIN')")
	public ResponseEntity<List<UsuarioResponse>> getInternalUsers() {
		log.info("🏥 Consultando usuarios INTERNOS");
		return ResponseEntity
				.ok(usuarioService.getUsuariosExcluyendoRoles(List.of("INSTITUCION_EX", "ASEGURADORA", "REGULADOR")));
	}

	// ============================================================
	// ⚙️ GESTIÓN ADMINISTRATIVA
	// ============================================================

	/** ✨ Crear nuevo usuario (Con roles básicos - ADMIN/USER) */
	@PostMapping("/crear")
	@PreAuthorize("hasAnyRole('SUPERADMIN','ADMIN')")
	public ResponseEntity<?> createUser(@RequestBody UsuarioCreateRequest request) {
		try {

			log.info("Origen de Usuario :" + request.getId_origen() + "******************" + "*".repeat(50));
			log.info("✨ Creando nuevo usuario: {}", request.getUsername());

			// Validar que no se intenten asignar roles privilegiados sin permiso SUPERADMIN
			if (request.getRoles() != null && !request.getRoles().isEmpty()) {
				List<String> rolesPrivilegiados = List.of("SUPERADMIN", "ADMIN");
				boolean intentaAsignarRolPrivilegiado = request.getRoles().stream()
						.anyMatch(rolesPrivilegiados::contains);

				if (intentaAsignarRolPrivilegiado) {
					return ResponseEntity.status(403).body(Map.of("error", "No autorizado", "message",
							"Solo usuarios con rol SUPERADMIN pueden asignar roles privilegiados. Use el endpoint /api/admin/usuarios/crear-con-roles"));
				}
			}
//            UsuarioResponse usuario = usuarioService.createUser(null);
			UsuarioResponse usuario = usuarioService.createUser(request);
			return ResponseEntity.ok(Map.of("message", "Usuario creado correctamente", "usuario", usuario));
		} catch (Exception e) {
			log.error("❌ Error al crear usuario: {}", e.getMessage());
			return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
		}
	}

	/** 🔑 NUEVO: Crear usuario con roles personalizados (Solo SUPERADMIN) */
	@PostMapping("/crear-con-roles")
	@PreAuthorize("hasRole('SUPERADMIN')")
	public ResponseEntity<?> createUserWithRoles(@RequestBody UsuarioCreateRequest request,
			Authentication authentication) {
		try {
			String adminUsername = authentication.getName();
			log.info("🔑 SUPERADMIN '{}' creando usuario con roles personalizados: {}", adminUsername,
					request.getUsername());
			log.info("🎯 Roles solicitados: {}", request.getRoles());

			// Validar que se hayan proporcionado roles
			if (request.getRoles() == null || request.getRoles().isEmpty()) {
				return ResponseEntity.badRequest().body(Map.of("error", "Roles no especificados", "message",
						"Debe especificar al menos un rol en el campo 'roles'"));
			}

			UsuarioResponse usuario = usuarioService.createUser(request);

			return ResponseEntity.ok(Map.of("message", "Usuario creado exitosamente con roles personalizados",
					"usuario", usuario, "rolesAsignados", usuario.getRoles(), "creadoPor", adminUsername));
		} catch (Exception e) {
			log.error("❌ Error al crear usuario con roles: {}", e.getMessage());
			return ResponseEntity.badRequest().body(Map.of("error", "Error en la creación", "message", e.getMessage()));
		}
	}

	/** ✏️ Actualizar usuario */
	@PutMapping("/id/{id}")
	@PreAuthorize("hasAnyRole('SUPERADMIN','ADMIN')")
	public ResponseEntity<UsuarioResponse> updateUser(@PathVariable Long id,
			@RequestBody UsuarioUpdateRequest request) {
		log.info("✏️ Actualizando usuario con ID: {}", id);
		return ResponseEntity.ok(usuarioService.updateUser(id, request));
	}

	/** ❌ Eliminar usuario */
	@DeleteMapping("/id/{id}")
	@PreAuthorize("hasRole('SUPERADMIN')")
	public ResponseEntity<Map<String, String>> deleteUser(@PathVariable Long id) {
		log.info("*".repeat(1000) + ": " +  id);
		usuarioService.deleteUser(id);
		log.info("🗑️ Usuario con ID {} eliminado exitosamente", id);
		return ResponseEntity.ok(Map.of("message", "✅ Usuario eliminado exitosamente"));
	}

	/** 🟢 Activar usuario */
	@PutMapping("/id/{id}/activate")
	@PreAuthorize("hasAnyRole('SUPERADMIN','ADMIN')")
	public ResponseEntity<UsuarioResponse> activateUser(@PathVariable("id") Long id) {
		log.info("🟢 Activando usuario con ID: {}", id);
		return ResponseEntity.ok(usuarioService.activateUser(id));
	}

	/** 🔴 Desactivar usuario */
	@PutMapping("/id/{id}/deactivate")
	@PreAuthorize("hasAnyRole('SUPERADMIN','ADMIN')")
	public ResponseEntity<UsuarioResponse> deactivateUser(@PathVariable("id") Long id) {
		log.info("🔴 Desactivando usuario con ID: {}", id);
		return ResponseEntity.ok(usuarioService.deactivateUser(id));
	}

	/** 🔓 Desbloquear usuario */
	@PutMapping("/id/{id}/unlock")
	@PreAuthorize("hasAnyRole('SUPERADMIN','ADMIN')")
	public ResponseEntity<UsuarioResponse> unlockUser(@PathVariable("id") Long id) {
		log.info("🔓 Desbloqueando usuario con ID: {}", id);
		return ResponseEntity.ok(usuarioService.unlockUser(id));
	}

	/** 🔄 Cambiar estado del usuario (ACTIVO/INACTIVO) */
	@PatchMapping("/{id}/estado")
	@PreAuthorize("hasAnyRole('SUPERADMIN','ADMIN')")
	public ResponseEntity<?> cambiarEstadoUsuario(@PathVariable("id") Long id, @RequestBody Map<String, String> request) {
		try {
			String nuevoEstado = request.get("estado");
			if (nuevoEstado == null || (!nuevoEstado.equals("ACTIVO") && !nuevoEstado.equals("INACTIVO"))) {
				return ResponseEntity.badRequest()
						.body(Map.of("message", "Estado inválido. Use 'ACTIVO' o 'INACTIVO'"));
			}

			log.info("🔄 Cambiando estado del usuario ID {} a {}", id, nuevoEstado);
			UsuarioResponse usuario = nuevoEstado.equals("ACTIVO") ? usuarioService.activateUser(id)
					: usuarioService.deactivateUser(id);

			return ResponseEntity.ok(Map.of("message", "Estado actualizado correctamente", "usuario", usuario));
		} catch (Exception e) {
			log.error("❌ Error al cambiar estado del usuario {}: {}", id, e.getMessage());
			return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
		}
	}

	// ============================================================
	// 🔍 CONSULTA DETALLADA
	// ============================================================

	@GetMapping("/detalle/{username}")
	public ResponseEntity<?> obtenerDetalleUsuario(@PathVariable String username) {
		try {
			log.info("🔍 Consultando detalle extendido del usuario: {}", username);
			UsuarioResponse detalle = usuarioService.obtenerDetalleUsuarioExtendido(username);
			if (detalle == null) {
				return ResponseEntity.status(404).body(Map.of("message", "Usuario no encontrado"));
			}
			return ResponseEntity.ok(detalle);
		} catch (Exception e) {
			log.error("❌ Error al obtener detalle del usuario {}: {}", username, e.getMessage());
			return ResponseEntity.internalServerError()
					.body(Map.of("message", "Error interno del servidor", "error", e.getMessage()));
		}
	}

	// ============================================================
	// 🔐 GESTIÓN DE CONTRASEÑA
	// ============================================================

	@PutMapping("/change-password")
	@PreAuthorize("isAuthenticated()")
	public ResponseEntity<?> changePassword(Authentication authentication, @RequestBody Map<String, String> request) {
		try {
			String username = request.getOrDefault("username", authentication.getName());
			String oldPassword = request.get("oldPassword");
			String newPassword = request.get("newPassword");

			usuarioService.changePassword(username, oldPassword, newPassword);
			log.info("🔑 Contraseña actualizada para usuario: {}", username);

			return ResponseEntity.ok(Map.of("message", "Contraseña actualizada correctamente"));
		} catch (Exception e) {
			log.error("❌ Error al cambiar contraseña: {}", e.getMessage());
			return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
		}
	}

	/** 🔄 Resetear contraseña (Solo ADMIN/SUPERADMIN) */
	@PutMapping("/id/{id}/reset-password")
	@PreAuthorize("hasAnyRole('SUPERADMIN','ADMIN')")
	public ResponseEntity<?> resetPassword(@PathVariable Long id, @RequestBody Map<String, String> request,
			Authentication authentication) {
		try {
			String adminUsername = authentication.getName();
			String newPassword = request.get("newPassword");

			if (newPassword == null || newPassword.isBlank()) {
				return ResponseEntity.badRequest().body(Map.of("error", "Contraseña requerida", "message",
						"Debe proporcionar 'newPassword' en el body"));
			}

			log.info("🔄 Admin '{}' reseteando contraseña para usuario ID: {}", adminUsername, id);
			usuarioService.resetPassword(id, newPassword);

			return ResponseEntity
					.ok(Map.of("message", "✅ Contraseña reseteada exitosamente", "resetBy", adminUsername));
		} catch (EntityNotFoundException e) {
			log.error("❌ Usuario no encontrado: {}", e.getMessage());
			return ResponseEntity.status(404).body(Map.of("error", "Usuario no encontrado", "message", e.getMessage()));
		} catch (IllegalArgumentException e) {
			log.error("❌ Contraseña inválida: {}", e.getMessage());
			return ResponseEntity.badRequest().body(Map.of("error", "Contraseña inválida", "message", e.getMessage()));
		} catch (Exception e) {
			log.error("❌ Error al resetear contraseña: {}", e.getMessage());
			return ResponseEntity.internalServerError()
					.body(Map.of("error", "Error interno", "message", e.getMessage()));
		}
	}

	// ============================================================
	// ✏️ ACTUALIZAR INFORMACIÓN COMPLETA DEL PERSONAL
	// ============================================================

	/** ✏️ Actualizar datos personales, profesionales y laborales */
	@PutMapping("/personal/{id}")
	@PreAuthorize("hasAnyRole('SUPERADMIN','ADMIN')")
	public ResponseEntity<?> actualizarDatosPersonal(@PathVariable Long id,
			@RequestBody com.styp.cenate.dto.PersonalUpdateRequest request) {
		try {
			log.info("✏️ Actualizando datos completos del usuario ID: {}", id);
			com.styp.cenate.dto.UsuarioResponse response = usuarioService.actualizarDatosPersonal(id, request);
			return ResponseEntity.ok(Map.of("message", "Datos actualizados correctamente", "usuario", response));
		} catch (EntityNotFoundException e) {
			log.error("❌ Usuario no encontrado: {}", e.getMessage());
			return ResponseEntity.status(404).body(Map.of("message", e.getMessage()));
		} catch (Exception e) {
			log.error("❌ Error al actualizar datos: {}", e.getMessage());
			return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
		}
	}
}
package com.styp.cenate.api.usuario;

import com.styp.cenate.dto.UsuarioCreateRequest;
import com.styp.cenate.dto.UsuarioResponse;
import com.styp.cenate.dto.UsuarioUpdateRequest;
import com.styp.cenate.service.usuario.UsuarioService;
import com.styp.cenate.service.security.PasswordTokenService;
import com.styp.cenate.security.mbac.CheckMBACPermission;
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
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:5173", "http://10.0.89.241:3000",
		"http://10.0.89.241:5173" })
public class UsuarioController {

	private final UsuarioService usuarioService;
	private final PasswordTokenService passwordTokenService;

	// ============================================================
	// 🧩 NUEVO ENDPOINT: Listar roles del usuario por username
	// ============================================================
	@GetMapping("/roles/{username}")
	public ResponseEntity<List<RolResponse>> getRolesPorUsuario(@PathVariable("username") String username) {
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
	@CheckMBACPermission(pagina = "/admin/users", accion = "ver", mensajeDenegado = "No tiene permiso para ver usuarios")
	public ResponseEntity<List<UsuarioResponse>> getAllUsers() {
		log.info("📋 Consultando todos los usuarios registrados");
		return ResponseEntity.ok(usuarioService.getAllUsers());
	}

	/** 🔹 Obtener TODO el personal de CENATE (con y sin usuario) - Paginado */
	@GetMapping("/all-personal")
	public ResponseEntity<Map<String, Object>> getAllPersonal(
			@RequestParam(name = "page", defaultValue = "0") int page,
			@RequestParam(name = "size", defaultValue = "7") int size, // 7 usuarios por página por defecto
			@RequestParam(name = "sortBy", defaultValue = "idPers") String sortBy,
			@RequestParam(name = "direction", defaultValue = "asc") String direction) {
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
	@CheckMBACPermission(pagina = "/admin/users", accion = "crear", mensajeDenegado = "No tiene permiso para crear usuarios")
	public ResponseEntity<?> createUser(@RequestBody UsuarioCreateRequest request) {
		try {

			log.info("Datos de Usuario :  {} ", request.toString());

			log.info("Origen de Usuario :" + request.getId_origen() + "******************" + "*".repeat(50));
			log.info("Especialidad : " + request.getId_especialidad());
			log.info("Profesion : " + request.getProfesion());

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
			// UsuarioResponse usuario = usuarioService.createUser(null);
			// request.setId_especialidad(13L);

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
	@CheckMBACPermission(pagina = "/admin/users", accion = "editar", mensajeDenegado = "No tiene permiso para editar usuarios")
	public ResponseEntity<UsuarioResponse> updateUser(@PathVariable Long id,
			@RequestBody UsuarioUpdateRequest request) {
		log.info("✏️ Actualizando usuario con ID: {}", id);
		return ResponseEntity.ok(usuarioService.updateUser(id, request));
	}

	/** ❌ Eliminar usuario */
	@DeleteMapping("/id/{id}")
	@PreAuthorize("hasRole('SUPERADMIN')")
	@CheckMBACPermission(pagina = "/admin/users", accion = "eliminar", mensajeDenegado = "No tiene permiso para eliminar usuarios")
	public ResponseEntity<?> deleteUser(@PathVariable Long id) {
		try {
			log.info("🗑️ Eliminando usuario con ID: {}", id);
			usuarioService.deleteUser(id);
			log.info("✅ Usuario con ID {} eliminado exitosamente", id);
			return ResponseEntity.ok(Map.of("message", "Usuario eliminado exitosamente"));
		} catch (EntityNotFoundException e) {
			log.warn("⚠️ Usuario no encontrado: {}", id);
			return ResponseEntity.status(404).body(Map.of(
				"error", "Usuario no encontrado",
				"message", e.getMessage()
			));
		} catch (Exception e) {
			log.error("❌ Error al eliminar usuario ID {}: {}", id, e.getMessage(), e);
			return ResponseEntity.status(500).body(Map.of(
				"error", "Error al eliminar usuario",
				"message", e.getMessage()
			));
		}
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
	public ResponseEntity<?> cambiarEstadoUsuario(@PathVariable("id") Long id,
			@RequestBody Map<String, String> request) {
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
	public ResponseEntity<?> obtenerDetalleUsuario(@PathVariable("username") String username) {
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

	/** 🔄 Resetear contraseña (Solo ADMIN/SUPERADMIN) - Envía correo con enlace */
	@PutMapping("/id/{id}/reset-password")
	@PreAuthorize("hasAnyRole('SUPERADMIN','ADMIN')")
	public ResponseEntity<?> resetPassword(@PathVariable("id") Long id,
			@RequestParam(required = false) String email,
			Authentication authentication) {
		try {
			String adminUsername = authentication.getName();

			log.info("🔄 Admin '{}' solicitando reset de contraseña para usuario ID: {}", adminUsername, id);

			boolean emailEnviado;

			if (email != null && !email.isBlank()) {
				// Si se especificó un correo, usar ese correo específico
				log.info("📧 Enviando correo de reset al correo especificado: {}", email);
				emailEnviado = passwordTokenService.crearTokenYEnviarEmail(id, email, "RESET");
			} else {
				// Si no se especificó correo, usar el correo del usuario (lógica anterior)
				log.info("📧 Enviando correo de reset al correo registrado del usuario");
				emailEnviado = passwordTokenService.crearTokenYEnviarEmail(id, "RESET");
			}

			if (!emailEnviado) {
				log.error("❌ No se pudo enviar correo de reset para usuario ID: {}", id);
				return ResponseEntity.status(500).body(Map.of(
						"error", "Error al enviar correo",
						"message",
						"No se pudo enviar el correo de restablecimiento. Verifique que el usuario tenga un correo registrado."));
			}

			log.info("✅ Correo de reset enviado exitosamente para usuario ID: {}", id);
			return ResponseEntity.ok(Map.of(
					"message", "Se ha enviado un correo al usuario con el enlace para restablecer su contraseña",
					"resetBy", adminUsername,
					"emailSentTo", email != null ? email : "correo registrado del usuario"));

		} catch (EntityNotFoundException e) {
			log.error("❌ Usuario no encontrado: {}", e.getMessage());
			return ResponseEntity.status(404).body(Map.of("error", "Usuario no encontrado", "message", e.getMessage()));
		} catch (Exception e) {
			log.error("❌ Error al resetear contraseña: {}", e.getMessage());
			return ResponseEntity.internalServerError()
					.body(Map.of("error", "Error interno", "message", e.getMessage()));
		}
	}

	// ============================================================
	// ✏️ ACTUALIZAR INFORMACIÓN COMPLETA DEL PERSONAL
	// ============================================================

	/** 📋 Obtener datos personales completos del usuario */
	@GetMapping("/personal/{id}")
	@PreAuthorize("isAuthenticated()")
	public ResponseEntity<?> obtenerDatosPersonal(@PathVariable("id") Long id, Authentication authentication) {
		try {
			// Verificar que el usuario solo puede obtener sus propios datos o es ADMIN/SUPERADMIN
			String username = authentication.getName();
			var usuarioActual = usuarioService.getUserByUsername(username);

			if (!usuarioActual.getIdUser().equals(id) &&
				!authentication.getAuthorities().stream().anyMatch(a ->
					a.getAuthority().contains("ADMIN") || a.getAuthority().contains("SUPERADMIN"))) {
				log.warn("⚠️ Usuario {} intentó acceder a datos de otro usuario (ID: {})", username, id);
				return ResponseEntity.status(403).body(Map.of("message", "No autorizado para acceder a estos datos"));
			}

			log.info("📋 Obteniendo datos personales completos del usuario ID: {}", id);
			com.styp.cenate.dto.UsuarioResponse response = usuarioService.getUserById(id);
			return ResponseEntity.ok(response);
		} catch (EntityNotFoundException e) {
			log.error("❌ Usuario no encontrado: {}", e.getMessage());
			return ResponseEntity.status(404).body(Map.of("message", e.getMessage()));
		} catch (Exception e) {
			log.error("❌ Error al obtener datos personales: {}", e.getMessage());
			return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
		}
	}

	/** ✏️ Actualizar datos personales, profesionales y laborales */
	@PutMapping("/personal/{id}")
	@PreAuthorize("isAuthenticated()")
	public ResponseEntity<?> actualizarDatosPersonal(@PathVariable("id") Long id,
			@RequestBody com.styp.cenate.dto.PersonalUpdateRequest request,
			Authentication authentication) {
		try {
			// Verificar que el usuario solo puede actualizar sus propios datos o es ADMIN/SUPERADMIN
			String username = authentication.getName();
			var usuarioActual = usuarioService.getUserByUsername(username);

			if (!usuarioActual.getIdUser().equals(id) &&
				!authentication.getAuthorities().stream().anyMatch(a ->
					a.getAuthority().contains("ADMIN") || a.getAuthority().contains("SUPERADMIN"))) {
				log.warn("⚠️ Usuario {} intentó actualizar datos de otro usuario (ID: {})", username, id);
				return ResponseEntity.status(403).body(Map.of("message", "No autorizado para actualizar estos datos"));
			}

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

	// ============================================================
	// 🎯 CONSULTA POR ROL
	// ============================================================

	/** 🔹 Obtener usuarios activos por rol(es) */
	@GetMapping("/por-rol")
	public ResponseEntity<List<UsuarioResponse>> getUsuariosPorRol(@RequestParam("roles") List<String> roles) {
		log.info("🎯 Consultando usuarios con roles: {}", roles);
		List<UsuarioResponse> usuarios = usuarioService.getUsuariosByRoles(roles);
		return ResponseEntity.ok(usuarios);
	}

	// ============================================================
	// 🔔 NOTIFICACIONES: Usuarios Pendientes de Asignar Rol
	// ============================================================

	/**
	 * 🔔 Contar usuarios que solo tienen rol básico (USER o INSTITUCION_EX)
	 * y necesitan asignación manual de rol específico.
	 *
	 * @return Cantidad de usuarios pendientes
	 */
	@GetMapping("/pendientes-rol")
	@PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
	public ResponseEntity<Map<String, Object>> contarUsuariosPendientesRol() {
		log.info("🔔 Consultando usuarios pendientes de asignar rol específico");
		try {
			Long cantidadPendientes = usuarioService.contarUsuariosConRolBasico();

			Map<String, Object> response = new HashMap<>();
			response.put("pendientes", cantidadPendientes);
			response.put("hayPendientes", cantidadPendientes > 0);

			log.info("✅ Usuarios pendientes de rol: {}", cantidadPendientes);
			return ResponseEntity.ok(response);
		} catch (Exception e) {
			log.error("❌ Error al contar usuarios pendientes: {}", e.getMessage());
			return ResponseEntity.status(500).body(Map.of(
					"error", "Error al obtener usuarios pendientes",
					"message", e.getMessage()));
		}
	}

	/**
	 * 📋 Listar usuarios que solo tienen rol básico (USER o INSTITUCION_EX)
	 *
	 * @return Lista de usuarios pendientes de asignar rol
	 */
	@GetMapping("/pendientes-rol/lista")
	@PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
	public ResponseEntity<List<UsuarioResponse>> listarUsuariosPendientesRol() {
		log.info("📋 Listando usuarios pendientes de asignar rol específico");
		try {
			List<UsuarioResponse> usuarios = usuarioService.listarUsuariosConRolBasico();
			log.info("✅ Encontrados {} usuarios pendientes", usuarios.size());
			return ResponseEntity.ok(usuarios);
		} catch (Exception e) {
			log.error("❌ Error al listar usuarios pendientes: {}", e.getMessage());
			return ResponseEntity.status(500).body(List.of());
		}
	}

	/**
	 * 👥 Listar usuarios con rol de ADMISION
	 *
	 * @return Lista de admisionistas activos
	 */
	@GetMapping("/admisionistas")
	@PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORDINADOR')")
	public ResponseEntity<List<UsuarioResponse>> listarAdmisionistas() {
		log.info("👥 Listando usuarios con rol ADMISION");
		try {
			List<UsuarioResponse> admisionistas = usuarioService.listarUsuariosPorRol("ADMISION");
			log.info("✅ Encontrados {} admisionistas", admisionistas.size());
			return ResponseEntity.ok(admisionistas);
		} catch (Exception e) {
			log.error("❌ Error al listar admisionistas: {}", e.getMessage(), e);
			log.error("❌ Tipo de excepción: {}", e.getClass().getName());
			log.error("❌ Stack trace completo:", e);
			return ResponseEntity.status(500).body(List.of());
		}
	}

	/**
	 * 👥 Listar usuarios con rol de COORDINADOR (Gestores de Citas)
	 *
	 * @return Lista de gestores de citas activos
	 */
	@GetMapping("/gestores-citas")
	@PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORDINADOR')")
	public ResponseEntity<List<UsuarioResponse>> listarGestoresCitas() {
		log.info("👥 Listando usuarios con rol GESTOR DE CITAS");
		try {
			// Buscar usuarios con el rol específico "GESTOR DE CITAS"
			List<UsuarioResponse> gestores = usuarioService.listarUsuariosPorRol("GESTOR DE CITAS");

			log.info("✅ Encontrados {} gestores de citas", gestores.size());
			return ResponseEntity.ok(gestores);
		} catch (Exception e) {
			log.error("❌ Error al listar gestores de citas: {}", e.getMessage(), e);
			log.error("❌ Tipo de excepción: {}", e.getClass().getName());
			log.error("❌ Stack trace completo:", e);
			return ResponseEntity.status(500).body(List.of());
		}
	}

	/**
	 * 👥 Listar usuarios por rol (genérico y flexible)
	 *
	 * @param rol Nombre del rol a buscar (ej: "GESTOR DE CITAS", "ADMISION", etc.)
	 * @return Lista de usuarios con ese rol
	 */

	@PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORDINADOR')")
	public ResponseEntity<List<UsuarioResponse>> listarUsuariosPorRol(@RequestParam("rol") String rol) {
		log.info("👥 Listando usuarios con rol: {}", rol);
		try {
			List<UsuarioResponse> usuarios = usuarioService.listarUsuariosPorRol(rol);
			log.info("✅ Encontrados {} usuarios con rol {}", usuarios.size(), rol);
			return ResponseEntity.ok(usuarios);
		} catch (Exception e) {
			log.error("❌ Error al listar usuarios por rol {}: {}", rol, e.getMessage(), e);
			return ResponseEntity.status(500).body(List.of());
		}
	}
}
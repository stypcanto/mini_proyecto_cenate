package com.styp.cenate.api.sesion;

import java.util.Map;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.styp.cenate.dto.ApiResponse;
import com.styp.cenate.dto.SolicitudContrasenaDTO;
import com.styp.cenate.model.PersonalCnt;
import com.styp.cenate.model.PersonalExterno;
import com.styp.cenate.model.Usuario;
import com.styp.cenate.repository.PersonalCntRepository;
import com.styp.cenate.repository.PersonalExternoRepository;
import com.styp.cenate.repository.UsuarioRepository;
import com.styp.cenate.service.personal.PersonalCntService;
import com.styp.cenate.service.personal.PersonalExternoService;
import com.styp.cenate.service.security.PasswordTokenService;
import com.styp.cenate.service.usuario.PasswordService;
import com.styp.cenate.service.usuario.SolicitudContrasenaService;

import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/sesion")
@Slf4j
@Validated
public class SesionController {

	private final PersonalCntService servicioPersonalCenate;
	private final PersonalExternoService servicioPersonalExterno;
	private final SolicitudContrasenaService servicioContrasena;
	private final PasswordService passwordService;
	private final PasswordTokenService passwordTokenService;
	private final UsuarioRepository usuarioRepository;
	private final PersonalCntRepository personalCntRepository;
	private final PersonalExternoRepository personalExternoRepository;

	public SesionController(PersonalCntService servicioPersonalCenate, PersonalExternoService servicioPersonalExterno,
			SolicitudContrasenaService servicioContrasena, PasswordService passwordService,
			PasswordTokenService passwordTokenService, UsuarioRepository usuarioRepository,
			PersonalCntRepository personalCntRepository, PersonalExternoRepository personalExternoRepository) {
		this.servicioPersonalCenate = servicioPersonalCenate;
		this.servicioPersonalExterno = servicioPersonalExterno;
		this.servicioContrasena = servicioContrasena;
		this.passwordService = passwordService;
		this.passwordTokenService = passwordTokenService;
		this.usuarioRepository = usuarioRepository;
		this.personalCntRepository = personalCntRepository;
		this.personalExternoRepository = personalExternoRepository;
	}

	@PostMapping
	public ResponseEntity<?> recuperar(@RequestBody Map<String, String> body,
			@RequestHeader(name = "Idempotency-Key", required = false) String idemKey) {
		log.info("cuerpo : " + body);
		log.info("header:" + idemKey);

		String correo = body.get("email");
		String username = body.get("username"); // Nuevo flujo: username + correo seleccionado

		// Validar que venga al menos uno de los dos
		if ((correo == null || correo.isBlank()) && (username == null || username.isBlank())) {
			 return ResponseEntity.badRequest().body(
			            new ApiResponse<>(
			                false,
			                "Debe proporcionar un correo electrónico o un usuario.",
			                "VALIDACION_FALLIDA",
			                null
			            )
			        );
		}

		if (idemKey == null || idemKey.isBlank()) {
			idemKey = java.util.UUID.randomUUID().toString();
			log.info("Generando nuevo UIID : {} ", idemKey);
		}


		Optional<SolicitudContrasenaDTO> solicitudExistenteOpt = servicioContrasena.buscarPorIdempotencia(idemKey);
		if (solicitudExistenteOpt.isPresent()) {
	        SolicitudContrasenaDTO solicitud = solicitudExistenteOpt.get();
	        Map<String, Object> data = Map.of(
	            "idSolicitud", solicitud.getId(),
	            "estado", solicitud.getEstado(),
	            "idempotencia", solicitud.getIdempotencia()
	        );

	        return ResponseEntity.ok(
	            new ApiResponse<>(
	                true,
	                "Ya existe una solicitud registrada para esta operación.",
	                "SOLICITUD_DUPLICADA",
	                data
	            )
	        );
	    }

		Long idUsuario = null;
		String correoDestino = correo; // El correo al que se enviará el enlace

		// ====================================================================
		// NUEVO FLUJO: Si viene username, buscar usuario y validar correo
		// ====================================================================
		if (username != null && !username.isBlank()) {
			log.info("🔍 Flujo nuevo: Buscando usuario por username: {}", username);

			// Buscar usuario por username (DNI)
			Optional<Usuario> usuarioOpt = usuarioRepository.findByNameUser(username);
			if (usuarioOpt.isEmpty()) {
				log.warn("❌ Usuario no encontrado: {}", username);
				return ResponseEntity.status(404).body(
					new ApiResponse<>(
						false,
						"No se encontró ningún usuario con ese DNI en el sistema.",
						"USUARIO_NO_ENCONTRADO",
						null
					)
				);
			}

			Usuario usuario = usuarioOpt.get();
			idUsuario = usuario.getIdUser();

			// Buscar datos del personal en PersonalCnt
			Optional<PersonalCnt> personalCntOpt = personalCntRepository.findByUsuario_IdUser(idUsuario);
			if (personalCntOpt.isPresent()) {
				PersonalCnt personal = personalCntOpt.get();

				// Si viene correo, validar que sea uno de los correos del usuario
				if (correo != null && !correo.isBlank()) {
					boolean esCorreoValido = correo.equalsIgnoreCase(personal.getEmailPers()) ||
					                         correo.equalsIgnoreCase(personal.getEmailCorpPers());
					if (!esCorreoValido) {
						return ResponseEntity.badRequest().body(
							new ApiResponse<>(
								false,
								"El correo seleccionado no pertenece al usuario indicado.",
								"CORREO_NO_COINCIDE",
								null
							)
						);
					}
					correoDestino = correo;
				} else {
					// Si no viene correo, usar el correo personal por defecto
					correoDestino = personal.getEmailPers();
				}

				log.info("✅ Usuario encontrado en PersonalCnt: {} → {}", username, correoDestino);
			} else {
				// Si no está en PersonalCnt, buscar en PersonalExterno
				Optional<PersonalExterno> personalExtOpt = personalExternoRepository.findByIdUser(idUsuario);
				if (personalExtOpt.isPresent()) {
					PersonalExterno personalExt = personalExtOpt.get();

					// Si viene correo, validar que sea uno de los correos del usuario
					if (correo != null && !correo.isBlank()) {
						boolean esCorreoValido = correo.equalsIgnoreCase(personalExt.getEmailPersExt()) ||
						                         correo.equalsIgnoreCase(personalExt.getEmailCorpExt());
						if (!esCorreoValido) {
							return ResponseEntity.badRequest().body(
								new ApiResponse<>(
									false,
									"El correo seleccionado no pertenece al usuario indicado.",
									"CORREO_NO_COINCIDE",
									null
								)
							);
						}
						correoDestino = correo;
					} else {
						// Si no viene correo, usar el correo personal por defecto
						correoDestino = personalExt.getEmailPersExt();
					}

					log.info("✅ Usuario encontrado en PersonalExterno: {} → {}", username, correoDestino);
				}
			}
		}
		// ====================================================================
		// FLUJO ANTIGUO: Solo correo (retrocompatibilidad)
		// ====================================================================
		else {
			log.info("🔍 Flujo antiguo: Buscando usuario por correo: {}", correo);

			// Solo buscar por correo personal (CNT)
			if (servicioPersonalCenate.existsByEmailPers(correo)) {
				idUsuario = servicioPersonalCenate.getUsuarioXCorreoPersonal(correo);
			}
			// Solo buscar por correo personal (Externo)
			else if (servicioPersonalExterno.existsByEmailPersExt(correo)) {
				idUsuario = servicioPersonalExterno.getUsuarioXCorreoPersonal(correo);
			}

			// Correo no encontrado
			if (idUsuario == null) {
				return ResponseEntity.status(404).body(
					new ApiResponse<>(
						false,
						"El correo personal ingresado no se encuentra registrado. Por favor, ingrese su correo personal (no institucional).",
						"EMAIL_NO_ENCONTRADO",
						null
					)
				);
			}
		}

		// Validar que el correo destino no esté vacío
		if (correoDestino == null || correoDestino.isBlank()) {
			return ResponseEntity.status(400).body(
				new ApiResponse<>(
					false,
					"El usuario no tiene un correo válido registrado. Contacte al administrador.",
					"SIN_CORREO_VALIDO",
					null
				)
			);
		}

		SolicitudContrasenaDTO solicitud = registrarSolicitud(idUsuario, idemKey, correoDestino);

		// Enviar correo con token de recuperación al correo específico seleccionado
		boolean emailEnviado = passwordTokenService.crearTokenYEnviarEmail(idUsuario, correoDestino, "RECUPERACION");
		if (!emailEnviado) {
			log.error("Error al enviar correo de recuperación a usuario {}", idUsuario);
			return ResponseEntity.status(500).body(
				new ApiResponse<>(
					false,
					"Error al enviar el correo de recuperación. Por favor, intente nuevamente.",
					"EMAIL_ERROR",
					null
				)
			);
		}

		// Enmascarar el correo para mostrar al usuario
		String correoEnmascarado = enmascararCorreo(correoDestino);

		Map<String, Object> data = Map.of(
			"idSolicitud", solicitud.getId(),
			"estado", solicitud.getEstado(),
			"idempotencia", solicitud.getIdempotencia(),
			"correoDestino", correoEnmascarado
		);

		return ResponseEntity.status(201).body(
			new ApiResponse<>(
				true,
				"Se ha enviado un enlace de recuperación a: " + correoEnmascarado,
				"OK",
				data
			)
		);

	}

	@GetMapping("/{id}")
	public ResponseEntity<SolicitudContrasenaDTO> obtener(@PathVariable Long id) {
		return servicioContrasena.buscarPorId(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
	}

	/**
	 * Endpoint para obtener los correos disponibles de un usuario dado su username (DNI).
	 * Permite al usuario elegir a qué correo desea recibir el enlace de recuperación.
	 *
	 * @param username DNI del usuario
	 * @return Lista de correos disponibles (personal y/o corporativo)
	 */
	@GetMapping("/correos-disponibles/{username}")
	public ResponseEntity<?> obtenerCorreosDisponibles(@PathVariable String username) {
		log.info("📧 Consultando correos disponibles para usuario: {}", username);

		if (username == null || username.isBlank()) {
			return ResponseEntity.badRequest().body(
				new ApiResponse<>(
					false,
					"Debe proporcionar un usuario válido.",
					"VALIDACION_FALLIDA",
					null
				)
			);
		}

		// Buscar usuario por username (DNI)
		Optional<Usuario> usuarioOpt = usuarioRepository.findByNameUser(username);
		if (usuarioOpt.isEmpty()) {
			log.warn("❌ Usuario no encontrado: {}", username);
			return ResponseEntity.status(404).body(
				new ApiResponse<>(
					false,
					"No se encontró ningún usuario con ese DNI en el sistema.",
					"USUARIO_NO_ENCONTRADO",
					null
				)
			);
		}

		Usuario usuario = usuarioOpt.get();
		Long idUsuario = usuario.getIdUser();
		String correoPersonal = null;
		String correoCorporativo = null;
		String nombreCompleto = null;

		// Buscar datos del personal en PersonalCnt
		Optional<PersonalCnt> personalCntOpt = personalCntRepository.findByUsuario_IdUser(idUsuario);
		if (personalCntOpt.isPresent()) {
			PersonalCnt personal = personalCntOpt.get();
			correoPersonal = personal.getEmailPers();
			correoCorporativo = personal.getEmailCorpPers();
			nombreCompleto = personal.getNombreCompleto();
			log.info("✅ Usuario encontrado en PersonalCnt: {}", username);
		} else {
			// Si no está en PersonalCnt, buscar en PersonalExterno
			Optional<PersonalExterno> personalExtOpt = personalExternoRepository.findByIdUser(idUsuario);
			if (personalExtOpt.isPresent()) {
				PersonalExterno personalExt = personalExtOpt.get();
				correoPersonal = personalExt.getEmailPersExt();
				correoCorporativo = personalExt.getEmailCorpExt();
				nombreCompleto = personalExt.getNombreCompleto();
				log.info("✅ Usuario encontrado en PersonalExterno: {}", username);
			}
		}

		// Validar que tenga al menos un correo registrado
		boolean tieneCorreoPersonal = correoPersonal != null && !correoPersonal.isBlank();
		boolean tieneCorreoCorporativo = correoCorporativo != null && !correoCorporativo.isBlank();

		if (!tieneCorreoPersonal && !tieneCorreoCorporativo) {
			log.warn("⚠️ Usuario {} no tiene correos registrados", username);
			return ResponseEntity.status(400).body(
				new ApiResponse<>(
					false,
					"El usuario no tiene correos electrónicos registrados en el sistema. Contacte al administrador.",
					"SIN_CORREOS_REGISTRADOS",
					null
				)
			);
		}

		// Construir respuesta con los correos disponibles
		var data = new java.util.HashMap<String, Object>();
		data.put("idUsuario", idUsuario);
		data.put("username", username);
		data.put("nombreCompleto", nombreCompleto);
		data.put("tieneCorreoPersonal", tieneCorreoPersonal);
		data.put("tieneCorreoCorporativo", tieneCorreoCorporativo);

		if (tieneCorreoPersonal) {
			data.put("correoPersonal", correoPersonal);
			data.put("correoPersonalEnmascarado", enmascararCorreo(correoPersonal));
		}

		if (tieneCorreoCorporativo) {
			data.put("correoCorporativo", correoCorporativo);
			data.put("correoCorporativoEnmascarado", enmascararCorreo(correoCorporativo));
		}

		log.info("📬 Correos disponibles: Personal={}, Corporativo={}", tieneCorreoPersonal, tieneCorreoCorporativo);

		return ResponseEntity.ok(
			new ApiResponse<>(
				true,
				"Correos disponibles obtenidos exitosamente.",
				"OK",
				data
			)
		);
	}

	public SolicitudContrasenaDTO registrarSolicitud(Long usuario, String idemKey, String correo) {

		SolicitudContrasenaDTO objSolicitud = new SolicitudContrasenaDTO();
		objSolicitud.setIdUsuario(usuario);
		objSolicitud.setEstado("GENERADA");// GENERADA, PENDIENTE,COMPLETADO
		objSolicitud.setIdempotencia(idemKey);
		objSolicitud.setContrasenaHash(passwordService.generarNuevaContrasena());
		objSolicitud.setCorreoDestino(correo);
		return servicioContrasena.guardar(objSolicitud);
	}

	/**
	 * Enmascara un correo electrónico para mostrar de forma segura.
	 * Ejemplo: styp611@outlook.com -> st***11@outlook.com
	 */
	private String enmascararCorreo(String correo) {
		if (correo == null || !correo.contains("@")) {
			return "***@***";
		}

		String[] partes = correo.split("@");
		String usuario = partes[0];
		String dominio = partes[1];

		if (usuario.length() <= 4) {
			return usuario.charAt(0) + "***@" + dominio;
		}

		// Mostrar primeros 2 y últimos 2 caracteres
		return usuario.substring(0, 2) + "***" + usuario.substring(usuario.length() - 2) + "@" + dominio;
	}

}

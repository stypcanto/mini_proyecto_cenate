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
import com.styp.cenate.service.personal.PersonalCntService;
import com.styp.cenate.service.personal.PersonalExternoService;
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

	public SesionController(PersonalCntService servicioPersonalCenate, PersonalExternoService servicioPersonalExterno,
			SolicitudContrasenaService servicioContrasena, PasswordService passwordService) {
		this.servicioPersonalCenate = servicioPersonalCenate;
		this.servicioPersonalExterno = servicioPersonalExterno;
		this.servicioContrasena = servicioContrasena;
		this.passwordService=passwordService;
	}

	@PostMapping
	public ResponseEntity<?> recuperar(@RequestBody Map<String, String> body,
			@RequestHeader(name = "Idempotency-Key", required = false) String idemKey) {
		log.info("cuerpo : " + body);
		log.info("header:" + idemKey);
		String correo = body.get("email");

		if (correo == null || correo.isBlank()) {
			 return ResponseEntity.badRequest().body(
			            new ApiResponse<>(
			                false,
			                "Falta enviar el correo electrónico.",
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
		String correoPersonalDestino = null;

		// Primero buscar por correo personal (CNT)
		if (servicioPersonalCenate.existsByEmailPers(correo)) {
			idUsuario = servicioPersonalCenate.getUsuarioXCorreoPersonal(correo);
			correoPersonalDestino = correo;
		}
		// Luego buscar por correo corporativo (CNT)
		else if (servicioPersonalCenate.existsByEmailCorpPers(correo)) {
			idUsuario = servicioPersonalCenate.getUsuarioXCorreo(correo);
			// Obtener el correo personal del usuario para enviar ahí
			correoPersonalDestino = servicioPersonalCenate.getCorreoPersonalDeUsuario(idUsuario);
			if (correoPersonalDestino == null || correoPersonalDestino.isBlank()) {
				correoPersonalDestino = correo; // Si no tiene personal, usar el corporativo
			}
		}
		// Buscar por correo personal (Externo)
		else if (servicioPersonalExterno.existsByEmailPersExt(correo)) {
			idUsuario = servicioPersonalExterno.getUsuarioXCorreoPersonal(correo);
			correoPersonalDestino = correo;
		}
		// Buscar por correo corporativo (Externo)
		else if (servicioPersonalExterno.existsByEmailCorpExt(correo)) {
			idUsuario = servicioPersonalExterno.getUsuarioXCorreo(correo);
			correoPersonalDestino = servicioPersonalExterno.getCorreoPersonalDeUsuario(idUsuario);
			if (correoPersonalDestino == null || correoPersonalDestino.isBlank()) {
				correoPersonalDestino = correo;
			}
		}

		// Correo no encontrado
		if (idUsuario == null) {
			return ResponseEntity.status(404).body(
				new ApiResponse<>(
					false,
					"El correo ingresado no se encuentra registrado.",
					"EMAIL_NO_ENCONTRADO",
					null
				)
			);
		}

		SolicitudContrasenaDTO solicitud = registrarSolicitud(idUsuario, idemKey, correoPersonalDestino);

		// Enmascarar el correo para mostrar al usuario
		String correoEnmascarado = enmascararCorreo(correoPersonalDestino);

		Map<String, Object> data = Map.of(
			"idSolicitud", solicitud.getId(),
			"estado", solicitud.getEstado(),
			"idempotencia", solicitud.getIdempotencia(),
			"correoDestino", correoEnmascarado
		);

		return ResponseEntity.status(201).body(
			new ApiResponse<>(
				true,
				"Se registró la solicitud de recuperación. Se enviará un enlace de recuperación a su correo personal: " + correoEnmascarado,
				"OK",
				data
			)
		);

	}

	@GetMapping("/{id}")
	public ResponseEntity<SolicitudContrasenaDTO> obtener(@PathVariable Long id) {
		return servicioContrasena.buscarPorId(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
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

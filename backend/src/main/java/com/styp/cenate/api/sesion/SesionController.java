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

	    boolean existeCorreoCenate = servicioPersonalCenate.existsByEmailCorpPers(correo);
	    if (existeCorreoCenate) {
	        idUsuario = servicioPersonalCenate.getUsuarioXCorreo(correo);
	    } else {
	        boolean existeCorreoExterno = servicioPersonalExterno.existsByEmailCorpExt(correo);
	        if (existeCorreoExterno) {
	            idUsuario = servicioPersonalExterno.getUsuarioXCorreo(correo);
	        }
	    }

	    // Correo no encontrado
	    if (idUsuario == null ) {
	        return ResponseEntity.status(404).body(
	            new ApiResponse<>(
	                false,
	                "El correo ingresado no se encuentra registrado.",
	                "EMAIL_NO_ENCONTRADO",
	                null
	            )
	        );
	    }
		
	    SolicitudContrasenaDTO solicitud = registrarSolicitud(idUsuario, idemKey, correo);

	    Map<String, Object> data = Map.of(
	        "idSolicitud", solicitud.getId(),
	        "estado", solicitud.getEstado(),
	        "idempotencia", solicitud.getIdempotencia()
	    );

	    return ResponseEntity.status(201).body(
	        new ApiResponse<>(
	            true,
	            "Se registró la solicitud de recuperación. Se enviará un correo con sus credenciales.",
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

}

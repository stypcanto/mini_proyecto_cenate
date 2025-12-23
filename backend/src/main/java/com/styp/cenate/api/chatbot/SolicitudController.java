package com.styp.cenate.api.chatbot;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.styp.cenate.api.admin.AdminDashboardMedicoCardController;
import com.styp.cenate.dto.chatbot.SolicitudCitaRequestDTO;
import com.styp.cenate.dto.chatbot.SolicitudCitaResponseDTO;
import com.styp.cenate.service.chatbot.solicitudcita.ISolicitudCitaService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/v1/chatbot/solicitud")
@Slf4j
@Validated // habilita validación en parámetros simples
public class SolicitudController {

	private final AdminDashboardMedicoCardController adminDashboardMedicoCardController;

	private final ISolicitudCitaService servicio;

	public SolicitudController(ISolicitudCitaService servicio,
			AdminDashboardMedicoCardController adminDashboardMedicoCardController) {
		this.servicio = servicio;
		this.adminDashboardMedicoCardController = adminDashboardMedicoCardController;
	}

	/**
	 * Guarda una nueva solicitud de cita. Ejemplo JSON: { "periodo":"202511",
	 * "docPaciente":"45781234", "nombresPaciente":"Juan Pérez", "sexo":"M",
	 * "edad":32, "telefono":"999999999", "fechaCita":"2025-11-10",
	 * "horaCita":"09:30:00", "fechaSolicitud":"2025-11-07T12:00:00-05:00",
	 * "estadoSolicitud":"PENDIENTE", "observacion":"Primera vez", "idServicio":5,
	 * "idActividad":2, "idSubactividad":1, "idAreaHospitalaria":4, "idPersonal":8 }
	 */

	@PostMapping
	public ResponseEntity<SolicitudCitaResponseDTO> guardar(@Valid @RequestBody SolicitudCitaRequestDTO dto) {
		log.info("Creando SolicitudCita para docPaciente={}, servicio={}, actividad={}, subactividad={}",
				dto.getDocPaciente(), dto.getIdServicio(), dto.getIdActividad(), dto.getIdSubactividad());
		var creado = servicio.guardar(dto);
		return ResponseEntity.status(HttpStatus.CREATED).body(creado);
	}

	/**
	 * Actualiza una solicitud existente. URL: PUT /api/solicitud-cita/{id} Cuerpo:
	 * mismo DTO que en POST (los campos ausentes se pueden conservar en service
	 * según tu lógica).
	 */
	@PutMapping("/{id}")
	public ResponseEntity<SolicitudCitaResponseDTO> actualizar(@PathVariable @Min(1) Long id,
			@Valid @RequestBody SolicitudCitaRequestDTO dto) {
		// @Validated → permite validar @Positive en @PathVariable
		// @Valid → valida el DTO completo
		log.info("Actualizando SolicitudCita id={} (docPaciente={}, estado={})", id, dto.getDocPaciente(), 0);
		var actualizado = servicio.actualizar(id, dto);
		return ResponseEntity.ok(actualizado);
	}

	@PutMapping("/estado/{id}")
	public ResponseEntity<SolicitudCitaResponseDTO> actualizarEstado(@PathVariable Long id,
			@RequestBody Map<String, String> body) {

		String estado = body.get("estadoSolicitud");

		if (estado == null || estado.isBlank()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El campo estadoSolicitud es obligatorio");
		}

		String observacion = body.get("observacion");
		Long lEstado;
		try {
			lEstado = Long.valueOf(estado);
		} catch (NumberFormatException e) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "estadoSolicitud debe ser numérico");
		}

		var actualizado = servicio.actualizarEstado(id, lEstado, observacion);
		return ResponseEntity.ok(actualizado);
	}

	@GetMapping("/{id}")
	public ResponseEntity<SolicitudCitaResponseDTO> obtenerPorId(@PathVariable @Min(1) Long id) {
		return servicio.buscarPorId(id).map(ResponseEntity::ok)
				.orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
	}

	@GetMapping("/paciente/{docPaciente}")
	public ResponseEntity<List<SolicitudCitaResponseDTO>> listarPorDocPaciente(
			@PathVariable @NotBlank(message = "El documento es obligatorio") @Size(min = 8, max = 15, message = "El documento debe tener entre 8 y 15 caracteres") String docPaciente) {

		log.info(" Buscando solicitudes por docPaciente={}", docPaciente);
		List<SolicitudCitaResponseDTO> resultados = servicio.buscarPorDocPaciente(docPaciente);
		if (resultados.isEmpty()) {
			return ResponseEntity.noContent().build();
		}
		return ResponseEntity.ok(resultados);
	}

	@DeleteMapping("/{idCita}")
	public ResponseEntity<Void> eliminarCita(@PathVariable Long idCita) {

		servicio.eliminarCita(idCita);

		return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
	}

}

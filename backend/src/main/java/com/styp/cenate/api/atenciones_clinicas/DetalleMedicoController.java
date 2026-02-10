package com.styp.cenate.api.atenciones_clinicas;

import com.styp.cenate.dto.DetalleMedicoDTO;
import com.styp.cenate.service.atenciones_clinicas.DetalleMedicoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 🏥 Controlador para gestionar detalles de médicos por especialidad
 * 
 * Endpoint: /api/atenciones-clinicas/detalle-medico Proporciona información de
 * médicos asociados a un servicio/especialidad
 */
@RestController
@RequestMapping("/api/atenciones-clinicas/detalle-medico")
@RequiredArgsConstructor
@Slf4j
public class DetalleMedicoController {

	private final DetalleMedicoService detalleMedicoService;

	/**
	 * Obtiene todos los médicos asociados a un servicio (especialidad)
	 * 
	 * GET /api/atenciones-clinicas/detalle-medico/por-servicio/{idServicio}
	 * 
	 * @param idServicio ID del servicio/especialidad
	 * @return Lista de DTOs con información de los médicos
	 */
	@GetMapping("/por-servicio/{idServicio}")
	public ResponseEntity<?> obtenerMedicosPorServicio(@PathVariable Long idServicio) {

		log.info("📥 Solicitud: Obtener médicos para el servicio ID: {}", idServicio);

		try {
			List<DetalleMedicoDTO> medicos = detalleMedicoService.obtenerMedicosPorServicio(idServicio);

			log.info("✅ Se retornaron {} médicos para el servicio ID: {}", medicos.size(), idServicio);

			return ResponseEntity.ok().body(new ApiResponse("success", "Médicos obtenidos correctamente", medicos));

		} catch (Exception e) {
			log.error("❌ Error al obtener médicos: {}", e.getMessage(), e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(new ApiResponse("error", "Error al obtener médicos: " + e.getMessage(), null));
		}
	}

	/**
	 * Obtiene TODOS los médicos disponibles para TeleECG
	 *
	 * GET /api/atenciones-clinicas/detalle-medico/para-teleecg
	 *
	 * @return Lista de todos los médicos disponibles (sin restricción de servicio)
	 */
	@GetMapping("/para-teleecg")
	public ResponseEntity<?> obtenerMedicosPorTeleECG() {

		log.info("📥 Solicitud: Obtener médicos disponibles para TeleECG");

		try {
			List<DetalleMedicoDTO> medicos = detalleMedicoService.obtenerTodosMedicos();

			log.info("✅ Se retornaron {} médicos para TeleECG", medicos.size());

			return ResponseEntity.ok().body(new ApiResponse("success", "Médicos obtenidos correctamente", medicos));

		} catch (Exception e) {
			log.error("❌ Error al obtener médicos para TeleECG: {}", e.getMessage(), e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(new ApiResponse("error", "Error al obtener médicos: " + e.getMessage(), null));
		}
	}

	/**
	 * Obtiene detalles de un médico específico
	 *
	 * GET /api/atenciones-clinicas/detalle-medico/{idPers}
	 *
	 * @param idPers ID del personal médico
	 * @return DTO con información del médico
	 */
	@GetMapping("/{idPers}")
	public ResponseEntity<?> obtenerDetalleMedico(@PathVariable Long idPers) {

		log.info("📥 Solicitud: Obtener detalles del médico ID: {}", idPers);

		try {
			DetalleMedicoDTO medico = detalleMedicoService.obtenerDetalleMedico(idPers);

			if (medico == null) {
				log.warn("⚠️ No se encontró el médico con ID: {}", idPers);
				return ResponseEntity.status(HttpStatus.NOT_FOUND)
						.body(new ApiResponse("not_found", "Médico no encontrado", null));
			}

			log.info("✅ Detalles del médico obtenidos: {}", idPers);

			return ResponseEntity.ok()
					.body(new ApiResponse("success", "Detalles del médico obtenidos correctamente", medico));

		} catch (Exception e) {
			log.error("❌ Error al obtener detalles del médico: {}", e.getMessage(), e);
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(new ApiResponse("error", "Error al obtener detalles del médico: " + e.getMessage(), null));
		}
	}

	/**
	 * Clase auxiliar para respuestas API estándar
	 */
	public static class ApiResponse {
		public String status;
		public String message;
		public Object data;

		public ApiResponse(String status, String message, Object data) {
			this.status = status;
			this.message = message;
			this.data = data;
		}

		// Getters para serialización JSON
		public String getStatus() {
			return status;
		}

		public String getMessage() {
			return message;
		}

		public Object getData() {
			return data;
		}
	}
}


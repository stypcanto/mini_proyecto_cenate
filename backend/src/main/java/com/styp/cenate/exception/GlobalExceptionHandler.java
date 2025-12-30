package com.styp.cenate.exception;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;

/**
 * 🌐 GlobalExceptionHandler Centraliza el manejo de excepciones para toda la
 * aplicación. Versión mejorada con logs detallados y respuestas informativas.
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

	// ======================================================
	// 1️⃣ Errores de validación de campos
	// ======================================================
	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<Map<String, Object>> handleValidationErrors(MethodArgumentNotValidException ex) {
		Map<String, String> fieldErrors = new HashMap<>();
		ex.getBindingResult().getAllErrors().forEach(error -> {
			String fieldName = ((FieldError) error).getField();
			String errorMessage = error.getDefaultMessage();
			fieldErrors.put(fieldName, errorMessage);
		});

		log.warn("⚠️ Error de validación: {}", fieldErrors);

		Map<String, Object> response = new HashMap<>();
		response.put("status", HttpStatus.BAD_REQUEST.value());
		response.put("error", "Error de validación");
		response.put("timestamp", LocalDateTime.now().toString());
		response.put("validationErrors", fieldErrors);

		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
	}

	// ======================================================
	// 2️⃣ Entidad no encontrada (404)
	// ======================================================
	@ExceptionHandler(EntityNotFoundException.class)
	public ResponseEntity<Map<String, Object>> handleEntityNotFoundException(EntityNotFoundException ex) {
		log.warn("⚠️ Entidad no encontrada: {}", ex.getMessage());

		Map<String, Object> response = new HashMap<>();
		response.put("status", HttpStatus.NOT_FOUND.value());
		response.put("error", "Recurso no encontrado");
		response.put("message", ex.getMessage());
		response.put("timestamp", LocalDateTime.now().toString());

		return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
	}

	// ======================================================
	// 3️⃣ Recurso no encontrado
	// ======================================================
	@ExceptionHandler(ResourceNotFoundException.class)
	public ResponseEntity<Map<String, Object>> handleResourceNotFoundException(ResourceNotFoundException ex) {
		log.warn("⚠️ Recurso no encontrado: {}", ex.getMessage());

		Map<String, Object> response = new HashMap<>();
		response.put("status", HttpStatus.NOT_FOUND.value());
		response.put("error", "Recurso no encontrado");
		response.put("message", ex.getMessage());
		response.put("timestamp", LocalDateTime.now().toString());

		return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
	}

	// ======================================================
	// 4️⃣ Contraseñas débiles
	// ======================================================
	@ExceptionHandler(WeakPasswordException.class)
	public ResponseEntity<Map<String, Object>> handleWeakPasswordException(WeakPasswordException ex) {
		log.warn("⚠️ Contraseña débil: {}", ex.getMessage());

		Map<String, Object> response = new HashMap<>();
		response.put("status", HttpStatus.BAD_REQUEST.value());
		response.put("error", "Contraseña no válida");
		response.put("message", ex.getMessage());
		response.put("timestamp", LocalDateTime.now().toString());

		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
	}

	// ======================================================
	// 5️⃣ Excepciones personalizadas de negocio
	// ======================================================
	@ExceptionHandler(BusinessException.class)
	public ResponseEntity<Map<String, Object>> handleBusinessException(BusinessException ex) {
		log.warn("⚠️ Excepción de negocio: {}", ex.getMessage());

		Map<String, Object> response = new HashMap<>();
		response.put("status", HttpStatus.CONFLICT.value());
		response.put("error", "Error de lógica de negocio");
		response.put("message", ex.getMessage());
		response.put("timestamp", LocalDateTime.now().toString());

		return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
	}

	// ======================================================
	// 6️⃣ Excepciones de validación lógicas
	// ======================================================
	@ExceptionHandler(ValidationException.class)
	public ResponseEntity<Map<String, Object>> handleValidationException(ValidationException ex) {
		log.warn("⚠️ Excepción de validación: {}", ex.getMessage());

		Map<String, Object> response = new HashMap<>();
		response.put("status", HttpStatus.BAD_REQUEST.value());
		response.put("error", "Error de validación");
		response.put("message", ex.getMessage());
		response.put("timestamp", LocalDateTime.now().toString());

		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
	}

	// ======================================================
	// 7️⃣ Excepciones personalizadas
	// ======================================================
	@ExceptionHandler(CustomException.class)
	public ResponseEntity<Map<String, Object>> handleCustomException(CustomException ex) {
		log.warn("⚠️ Excepción personalizada: {}", ex.getMessage());

		Map<String, Object> response = new HashMap<>();
		response.put("status", HttpStatus.BAD_REQUEST.value());
		response.put("error", "Error personalizado");
		response.put("message", ex.getMessage());
		response.put("timestamp", LocalDateTime.now().toString());

		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
	}

	// ======================================================
	// 8️⃣ RuntimeException (errores esperados con contexto)
	// ======================================================
	@ExceptionHandler(RuntimeException.class)
	public ResponseEntity<Map<String, Object>> handleRuntimeException(RuntimeException ex) {
		log.error("❌ RuntimeException: {}", ex.getMessage());
		log.error("📍 Clase: {}", ex.getClass().getName());

		// Log del stack trace para debugging
		if (log.isDebugEnabled()) {
			log.debug("Stack trace:", ex);
		}

		Map<String, Object> response = new HashMap<>();
		response.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
		response.put("error", "Error en tiempo de ejecución");
		response.put("message", ex.getMessage() != null ? ex.getMessage() : "Error desconocido");
		response.put("type", ex.getClass().getSimpleName());
		response.put("timestamp", LocalDateTime.now().toString());

		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
	}

	// ======================================================
	// 9️⃣ Errores generales (último recurso)
	// ======================================================
	@ExceptionHandler(Exception.class)
	public ResponseEntity<Map<String, Object>> handleGeneralException(Exception ex) {
		log.error("💥 Error inesperado en el servidor: {}", ex.getMessage(), ex);
		log.error("📍 Clase de excepción: {}", ex.getClass().getName());

		// Log detallado del stack trace
		if (log.isErrorEnabled()) {
			log.error("Stack trace completo:", ex);
		}

		Map<String, Object> response = new HashMap<>();
		response.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
		response.put("error", "Error interno del servidor");
		response.put("message", ex.getMessage() != null ? ex.getMessage() : "Ha ocurrido un error inesperado");
		response.put("type", ex.getClass().getSimpleName());
		response.put("timestamp", LocalDateTime.now().toString());

		// En desarrollo, incluir más detalles (comentar en producción)
		if (log.isDebugEnabled()) {
			response.put("cause", ex.getCause() != null ? ex.getCause().getMessage() : null);
		}

		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
	}

	/* CHATBOT */
	@ExceptionHandler(AseguradoNoEncontradoException.class)
	public ResponseEntity<Map<String, Object>> handleNotFound(AseguradoNoEncontradoException ex) {
		Map<String, Object> response = Map.of("status", HttpStatus.NOT_FOUND.value(), "error", "Paciente no encontrado",
				"message", ex.getMessage(), "timestamp", LocalDateTime.now().toString());
		return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
	}

	/* CHATBOT */
	@ExceptionHandler(RegistroCitaExistenteException.class)
	public ResponseEntity<Map<String, Object>> handleRegistroCitaExistente(RegistroCitaExistenteException ex) {
		Map<String, Object> response = Map.of("status", HttpStatus.CONFLICT.value(), "error",
				"Horario de cita ya registrada anteriormente.", "message", ex.getMessage(), "timestamp",
				LocalDateTime.now().toString());
		return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
	}

	// Error de validación de @RequestParam, @PathVariable, etc.
	@ExceptionHandler(ConstraintViolationException.class)
	public ResponseEntity<?> handleConstraintViolation(ConstraintViolationException ex) {
		// var errorMessage =
		// ex.getConstraintViolations().iterator().next().getMessage();
		return ResponseEntity.badRequest().body(Map.of("error", "Datos ingresados son invalidos", // errorMessage,
				"status", HttpStatus.BAD_REQUEST.value(), "message", ex.getMessage(), "timestamp",
				LocalDateTime.now().toString()));
	}

	// Errores por datos inválidos que tú lanzas (e.g., FK no existe)
	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<?> handleIllegalArgument(IllegalArgumentException ex) {
		return ResponseEntity.badRequest()
				.body(Map.of("error", "Datos ingresados son invalidos", "status", HttpStatus.BAD_REQUEST.value(),
						"message", ex.getMessage(), "timestamp", LocalDateTime.now().toString()));
	}

	// Violaciones de integridad (NOT NULL, UNIQUE, FK) a nivel BD
	@ExceptionHandler(DataIntegrityViolationException.class)
	public ResponseEntity<Map<String, String>> handleDataIntegrity(DataIntegrityViolationException ex) {
		String detalle = Optional.ofNullable(ex.getMostSpecificCause()).map(Throwable::getMessage)
				.orElse(ex.getMessage());
		return ResponseEntity.status(HttpStatus.CONFLICT)
				.body(Map.of("error", "Violación de integridad de datos", "detalle", detalle));
	}

	@ExceptionHandler(HttpMessageNotReadableException.class)
	public ResponseEntity<Map<String, String>> handleJsonParseError(HttpMessageNotReadableException ex) {
		String detalle = ex.getMostSpecificCause() != null ? ex.getMostSpecificCause().getMessage() : ex.getMessage();

		String mensajeUsuario = "Formato JSON inválido. Verifique los campos de fecha y hora.";

		if (detalle.contains("LocalDate")) {
			mensajeUsuario = "Formato de fecha inválido. Use yyyy-MM-dd (por ejemplo, 2025-11-03).";
		} else if (detalle.contains("LocalTime")) {
			mensajeUsuario = "Formato de hora inválido. Use HH:mm:ss (por ejemplo, 08:30:00).";
		} else if (detalle.contains("OffsetDateTime")) {
			mensajeUsuario = "Formato de fecha y hora inválido. Use yyyy-MM-dd'T'HH:mm:ssZ (por ejemplo, 2025-11-03T08:30:00-0500).";
		}
		return ResponseEntity.status(HttpStatus.BAD_REQUEST)
				.body(Map.of("error", "Formato JSON inválido", "detalle", mensajeUsuario, "mensaje", detalle));
	}

	
	// FORMULARIO 107 INICIO 
	@ExceptionHandler(ExcelValidationException.class)
	public ResponseEntity<?> handleExcelValidationException(ExcelValidationException ex) {
		if (ex.getDetail() != null) {
			return ResponseEntity.badRequest().body(ex.getDetail());
		}
		return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage()));
	}

	@ExceptionHandler(ExcelCargaDuplicadaException.class)
	public ResponseEntity<?> handleDup(ExcelCargaDuplicadaException ex) {
		return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", ex.getMessage()));
	}
	// FORMULARIO 107 FIN
	
	
}





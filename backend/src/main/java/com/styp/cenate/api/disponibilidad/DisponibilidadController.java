package com.styp.cenate.api.disponibilidad;

import com.styp.cenate.dto.*;
import com.styp.cenate.service.disponibilidad.IDisponibilidadService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 🌐 Controlador REST para gestión de disponibilidad de turnos médicos.
 *
 * Endpoints organizados por rol:
 * - MÉDICO: Crear, actualizar, enviar y consultar sus disponibilidades
 * - COORDINADOR: Revisar, ajustar turnos y marcar como revisado
 *
 * Todos los endpoints están protegidos con @PreAuthorize
 *
 * @author Ing. Styp Canto Rondon
 * @version 1.0.0
 * @since 2025-12-27
 */
@RestController
@RequestMapping("/api/disponibilidad")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:3000", "http://10.0.89.13", "http://10.0.89.239"})
public class DisponibilidadController {

    private final IDisponibilidadService disponibilidadService;

    // ==========================================================
    // ENDPOINTS PARA MÉDICO - CREAR Y ACTUALIZAR
    // ==========================================================

    /**
     * Lista todas las disponibilidades del médico autenticado
     *
     * @return Lista de disponibilidades
     */
    @GetMapping("/mis-disponibilidades")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'MEDICO')")
    public ResponseEntity<List<DisponibilidadResponse>> listarMisDisponibilidades() {
        log.info("GET /api/disponibilidad/mis-disponibilidades");
        List<DisponibilidadResponse> disponibilidades = disponibilidadService.listarMisDisponibilidades();
        return ResponseEntity.ok(disponibilidades);
    }

    /**
     * Obtiene la disponibilidad del médico para un periodo y especialidad específicos
     *
     * @param periodo Periodo en formato YYYYMM
     * @param idEspecialidad ID de la especialidad
     * @return DisponibilidadResponse o 204 No Content si no existe
     */
    @GetMapping("/mi-disponibilidad")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'MEDICO')")
    public ResponseEntity<DisponibilidadResponse> obtenerMiDisponibilidad(
            @RequestParam String periodo,
            @RequestParam Long idEspecialidad) {
        log.info("GET /api/disponibilidad/mi-disponibilidad - periodo: {}, especialidad: {}",
                periodo, idEspecialidad);

        DisponibilidadResponse response = disponibilidadService.obtenerMiDisponibilidad(periodo, idEspecialidad);
        return response != null ?
                ResponseEntity.ok(response) :
                ResponseEntity.noContent().build();
    }

    /**
     * Crea una nueva disponibilidad
     *
     * @param request Datos de la disponibilidad
     * @return DisponibilidadResponse creada
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'MEDICO')")
    public ResponseEntity<DisponibilidadResponse> crear(
            @Valid @RequestBody DisponibilidadCreateRequest request) {
        log.info("POST /api/disponibilidad - periodo: {}, especialidad: {}",
                request.getPeriodo(), request.getIdEspecialidad());

        DisponibilidadResponse response = disponibilidadService.crear(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Guarda o actualiza un borrador de disponibilidad
     *
     * @param request Datos del borrador
     * @return DisponibilidadResponse guardada
     */
    @PostMapping("/borrador")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'MEDICO')")
    public ResponseEntity<DisponibilidadResponse> guardarBorrador(
            @Valid @RequestBody DisponibilidadCreateRequest request) {
        log.info("POST /api/disponibilidad/borrador - periodo: {}, especialidad: {}",
                request.getPeriodo(), request.getIdEspecialidad());

        DisponibilidadResponse response = disponibilidadService.guardarBorrador(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Actualiza una disponibilidad existente
     *
     * @param id ID de la disponibilidad
     * @param request Datos actualizados
     * @return DisponibilidadResponse actualizada
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'MEDICO')")
    public ResponseEntity<DisponibilidadResponse> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody DisponibilidadUpdateRequest request) {
        log.info("PUT /api/disponibilidad/{} - actualizar", id);

        DisponibilidadResponse response = disponibilidadService.actualizar(id, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Envía una disponibilidad para revisión del coordinador
     * Valida que cumpla con el mínimo de 150 horas
     *
     * @param id ID de la disponibilidad
     * @return DisponibilidadResponse enviada
     */
    @PutMapping("/{id}/enviar")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'MEDICO')")
    public ResponseEntity<DisponibilidadResponse> enviar(@PathVariable Long id) {
        log.info("PUT /api/disponibilidad/{}/enviar", id);

        DisponibilidadResponse response = disponibilidadService.enviar(id);
        return ResponseEntity.ok(response);
    }

    /**
     * Valida las horas de una disponibilidad
     *
     * @param id ID de la disponibilidad
     * @return Map con totalHoras, horasRequeridas, cumpleMinimo, horasFaltantes
     */
    @GetMapping("/{id}/validar-horas")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'MEDICO')")
    public ResponseEntity<Map<String, Object>> validarHoras(@PathVariable Long id) {
        log.info("GET /api/disponibilidad/{}/validar-horas", id);

        Map<String, Object> validacion = disponibilidadService.validarHoras(id);
        return ResponseEntity.ok(validacion);
    }

    /**
     * Elimina una disponibilidad (solo si está en BORRADOR)
     *
     * @param id ID de la disponibilidad
     * @return 204 No Content
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'MEDICO')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        log.info("DELETE /api/disponibilidad/{}", id);

        disponibilidadService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    // ==========================================================
    // ENDPOINTS PARA COORDINADOR - CONSULTAS
    // ==========================================================

    /**
     * Lista todas las disponibilidades de un periodo
     * Solo para COORDINADOR/ADMIN
     *
     * @param periodo Periodo en formato YYYYMM
     * @return Lista de disponibilidades
     */
    @GetMapping("/periodo/{periodo}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORDINADOR')")
    public ResponseEntity<List<DisponibilidadResponse>> listarPorPeriodo(
            @PathVariable String periodo) {
        log.info("GET /api/disponibilidad/periodo/{}", periodo);

        List<DisponibilidadResponse> disponibilidades = disponibilidadService.listarPorPeriodo(periodo);
        return ResponseEntity.ok(disponibilidades);
    }

    /**
     * Lista solo las disponibilidades ENVIADAS de un periodo
     * Útil para que el coordinador revise las solicitudes pendientes
     *
     * @param periodo Periodo en formato YYYYMM
     * @return Lista de disponibilidades enviadas
     */
    @GetMapping("/periodo/{periodo}/enviadas")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORDINADOR')")
    public ResponseEntity<List<DisponibilidadResponse>> listarEnviadas(
            @PathVariable String periodo) {
        log.info("GET /api/disponibilidad/periodo/{}/enviadas", periodo);

        List<DisponibilidadResponse> disponibilidades = disponibilidadService.listarEnviadasPorPeriodo(periodo);
        return ResponseEntity.ok(disponibilidades);
    }

    /**
     * Obtiene una disponibilidad por su ID
     * Accesible por médico (si es suya) o coordinador/admin (cualquiera)
     *
     * @param id ID de la disponibilidad
     * @return DisponibilidadResponse
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'MEDICO', 'COORDINADOR')")
    public ResponseEntity<DisponibilidadResponse> obtenerPorId(@PathVariable Long id) {
        log.info("GET /api/disponibilidad/{}", id);

        DisponibilidadResponse response = disponibilidadService.obtenerPorId(id);
        return ResponseEntity.ok(response);
    }

    /**
     * Lista las disponibilidades de una especialidad en un periodo
     *
     * @param periodo Periodo en formato YYYYMM
     * @param idEspecialidad ID de la especialidad
     * @return Lista de disponibilidades
     */
    @GetMapping("/periodo/{periodo}/especialidad/{idEspecialidad}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORDINADOR')")
    public ResponseEntity<List<DisponibilidadResponse>> listarPorEspecialidadYPeriodo(
            @PathVariable String periodo,
            @PathVariable Long idEspecialidad) {
        log.info("GET /api/disponibilidad/periodo/{}/especialidad/{}", periodo, idEspecialidad);

        List<DisponibilidadResponse> disponibilidades = disponibilidadService
                .listarPorEspecialidadYPeriodo(idEspecialidad, periodo);
        return ResponseEntity.ok(disponibilidades);
    }

    // ==========================================================
    // ENDPOINTS PARA COORDINADOR - REVISIÓN
    // ==========================================================

    /**
     * Marca una disponibilidad como REVISADO
     * Solo el coordinador puede hacer esto
     *
     * @param id ID de la disponibilidad
     * @return DisponibilidadResponse revisada
     */
    @PutMapping("/{id}/revisar")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORDINADOR')")
    public ResponseEntity<DisponibilidadResponse> marcarRevisado(@PathVariable Long id) {
        log.info("PUT /api/disponibilidad/{}/revisar", id);

        DisponibilidadResponse response = disponibilidadService.marcarRevisado(id);
        return ResponseEntity.ok(response);
    }

    /**
     * Ajusta un turno específico de una disponibilidad
     * Permite al coordinador cambiar el tipo de turno (M, T, MT)
     *
     * @param id ID de la disponibilidad
     * @param request Datos del ajuste (idDetalle, nuevoTurno, observación)
     * @return DisponibilidadResponse actualizada
     */
    @PutMapping("/{id}/ajustar-turno")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORDINADOR')")
    public ResponseEntity<DisponibilidadResponse> ajustarTurno(
            @PathVariable Long id,
            @Valid @RequestBody AjusteTurnoRequest request) {
        log.info("PUT /api/disponibilidad/{}/ajustar-turno - detalle: {}, nuevo turno: {}",
                id, request.getIdDetalle(), request.getNuevoTurno());

        DisponibilidadResponse response = disponibilidadService.ajustarTurno(id, request);
        return ResponseEntity.ok(response);
    }

    // ==========================================================
    // MANEJO DE EXCEPCIONES
    // ==========================================================

    /**
     * Maneja RuntimeException lanzadas por el servicio
     *
     * @param ex Excepción
     * @return ResponseEntity con mensaje de error
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(RuntimeException ex) {
        log.error("Error en DisponibilidadController: {}", ex.getMessage());

        Map<String, Object> error = Map.of(
                "status", HttpStatus.BAD_REQUEST.value(),
                "error", "Error en disponibilidad",
                "message", ex.getMessage()
        );

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    /**
     * Maneja excepciones de validación
     *
     * @param ex Excepción
     * @return ResponseEntity con mensaje de error
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgumentException(IllegalArgumentException ex) {
        log.error("Error de validación: {}", ex.getMessage());

        Map<String, Object> error = Map.of(
                "status", HttpStatus.BAD_REQUEST.value(),
                "error", "Error de validación",
                "message", ex.getMessage()
        );

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
}

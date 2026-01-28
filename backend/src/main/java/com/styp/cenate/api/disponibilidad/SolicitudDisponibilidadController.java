package com.styp.cenate.api.disponibilidad;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.styp.cenate.dto.disponibilidad.SolicitudDisponibilidadRequest;
import com.styp.cenate.dto.disponibilidad.SolicitudDisponibilidadResponse;
import com.styp.cenate.security.mbac.CheckMBACPermission;
import com.styp.cenate.service.disponibilidad.ISolicitudDisponibilidadService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Controlador REST para la gestión de solicitudes de disponibilidad médica.
 * Permite a los médicos gestionar sus solicitudes de disponibilidad.
 */
@RestController
@RequestMapping("/api/solicitudes-disponibilidad")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Solicitudes de Disponibilidad", description = "API para la gestión de solicitudes de disponibilidad médica")
public class SolicitudDisponibilidadController {

    private final ISolicitudDisponibilidadService solicitudDisponibilidadService;

    /**
     * Obtiene todas las solicitudes de disponibilidad del médico autenticado.
     *
     * @param authentication Información del usuario autenticado
     * @return Lista de solicitudes de disponibilidad
     */
    @GetMapping("/mis-solicitudes")
    @CheckMBACPermission(pagina = "/medico/disponibilidad", accion = "ver")
    @Operation(summary = "Obtener todas las solicitudes de disponibilidad del médico")
    public ResponseEntity<List<SolicitudDisponibilidadResponse>> obtenerMisSolicitudes(
            Authentication authentication) {
        log.info("Obteniendo todas las solicitudes de disponibilidad para el médico: {}", 
                 authentication.getName());
        try {
            List<SolicitudDisponibilidadResponse> solicitudes = 
                solicitudDisponibilidadService.obtenerSolicitudesMedico(authentication.getName());
            return ResponseEntity.ok(solicitudes);
        } catch (Exception e) {
            log.error("Error al obtener solicitudes: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Obtiene la solicitud de disponibilidad activa del período actual para el médico autenticado.
     *
     * @param authentication Información del usuario autenticado
     * @return Solicitud de disponibilidad activa o 404 si no existe
     */
    @GetMapping("/periodo-actual")
    @CheckMBACPermission(pagina = "/medico/disponibilidad", accion = "ver")
    @Operation(summary = "Obtener la solicitud de disponibilidad del período actual")
    public ResponseEntity<SolicitudDisponibilidadResponse> obtenerSolicitudPeriodoActual(
            Authentication authentication) {
        log.info("Obteniendo solicitud de disponibilidad del período actual para: {}", 
                 authentication.getName());
        try {
            SolicitudDisponibilidadResponse solicitud = 
                solicitudDisponibilidadService.obtenerSolicitudPeriodoActual(authentication.getName());
            return ResponseEntity.ok(solicitud);
        } catch (IllegalArgumentException e) {
            log.warn("No hay solicitud activa en período actual: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error al obtener solicitud del período actual: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Obtiene las solicitudes de disponibilidad por período.
     *
     * @param idPeriodo ID del período
     * @return Lista de solicitudes del período
     */
    @GetMapping("/periodo/{idPeriodo}")
    @CheckMBACPermission(pagina = "/medico/disponibilidad", accion = "ver")
    @Operation(summary = "Obtener solicitudes de disponibilidad por período")
    public ResponseEntity<List<SolicitudDisponibilidadResponse>> obtenerSolicitudesPorPeriodo(
            @PathVariable("idPeriodo") Long idPeriodo) {
        log.info("Obteniendo solicitudes de disponibilidad para el período: {}", idPeriodo);
        try {
            List<SolicitudDisponibilidadResponse> solicitudes = 
                solicitudDisponibilidadService.obtenerSolicitudesPorPeriodo(idPeriodo);
            return ResponseEntity.ok(solicitudes);
        } catch (Exception e) {
            log.error("Error al obtener solicitudes por período: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Obtiene una solicitud de disponibilidad por su ID.
     *
     * @param idSolicitud ID de la solicitud
     * @return Solicitud de disponibilidad encontrada
     */
    @GetMapping("/{idSolicitud}")
    @CheckMBACPermission(pagina = "/medico/disponibilidad", accion = "ver")
    @Operation(summary = "Obtener una solicitud de disponibilidad por ID")
    public ResponseEntity<SolicitudDisponibilidadResponse> obtenerSolicitudPorId(
            @PathVariable("idSolicitud") Long idSolicitud) {
        log.info("Obteniendo solicitud de disponibilidad con ID: {}", idSolicitud);
        try {
            SolicitudDisponibilidadResponse solicitud = 
                solicitudDisponibilidadService.obtenerSolicitudPorId(idSolicitud);
            return ResponseEntity.ok(solicitud);
        } catch (IllegalArgumentException e) {
            log.warn("Solicitud no encontrada: {}", idSolicitud);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error al obtener solicitud: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Crea una nueva solicitud de disponibilidad.
     *
     * @param request Datos de la solicitud
     * @param authentication Información del usuario autenticado
     * @return Solicitud creada
     */
    @PostMapping
    @CheckMBACPermission(pagina = "/medico/disponibilidad", accion = "crear")
    @Operation(summary = "Crear una nueva solicitud de disponibilidad")
    public ResponseEntity<SolicitudDisponibilidadResponse> crearSolicitud(
            @Valid @RequestBody SolicitudDisponibilidadRequest request,
            Authentication authentication) {
        log.info("Creando nueva solicitud de disponibilidad para el médico: {}", 
                 authentication.getName());
        try {
            SolicitudDisponibilidadResponse solicitud = 
                solicitudDisponibilidadService.crearSolicitud(request, authentication.getName());
            return ResponseEntity.status(HttpStatus.CREATED).body(solicitud);
        } catch (IllegalArgumentException e) {
            log.warn("Datos inválidos: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Error al crear solicitud: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Actualiza una solicitud de disponibilidad existente.
     *
     * @param idSolicitud ID de la solicitud a actualizar
     * @param request     Datos actualizados
     * @return Solicitud actualizada
     */
    @PutMapping("/{idSolicitud}")
    @CheckMBACPermission(pagina = "/medico/disponibilidad", accion = "editar")
    @Operation(summary = "Actualizar una solicitud de disponibilidad existente")
    public ResponseEntity<SolicitudDisponibilidadResponse> actualizarSolicitud(
            @PathVariable("idSolicitud") Long idSolicitud,
            @Valid @RequestBody SolicitudDisponibilidadRequest request) {
        log.info("Actualizando solicitud de disponibilidad con ID: {}", idSolicitud);
        try {
            SolicitudDisponibilidadResponse solicitud = 
                solicitudDisponibilidadService.actualizarSolicitud(idSolicitud, request);
            return ResponseEntity.ok(solicitud);
        } catch (IllegalArgumentException e) {
            log.warn("Datos inválidos: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Error al actualizar solicitud: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Envía una solicitud de disponibilidad a revisión.
     *
     * @param idSolicitud ID de la solicitud a enviar
     * @return Solicitud actualizada
     */
    @PostMapping("/{idSolicitud}/enviar")
    @CheckMBACPermission(pagina = "/medico/disponibilidad", accion = "enviar")
    @Operation(summary = "Enviar una solicitud de disponibilidad a revisión")
    public ResponseEntity<SolicitudDisponibilidadResponse> enviarSolicitud(
            @PathVariable("idSolicitud") Long idSolicitud) {
        log.info("Enviando solicitud de disponibilidad con ID: {}", idSolicitud);
        try {
            SolicitudDisponibilidadResponse solicitud = 
                solicitudDisponibilidadService.enviarSolicitud(idSolicitud);
            return ResponseEntity.ok(solicitud);
        } catch (IllegalStateException e) {
            log.warn("Estado inválido para enviar: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Error al enviar solicitud: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}

package com.styp.cenate.api.formdiag;

import com.styp.cenate.dto.formdiag.FormDiagListResponse;
import com.styp.cenate.dto.formdiag.FormDiagRequest;
import com.styp.cenate.dto.formdiag.FormDiagResponse;
import com.styp.cenate.service.formdiag.FormDiagService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador REST para gestionar los formularios de diagnóstico situacional de Telesalud
 */
@RestController
@RequestMapping("/api/formulario-diagnostico")
@RequiredArgsConstructor
@Slf4j
public class FormDiagController {

    private final FormDiagService formDiagService;

    /**
     * Crear un nuevo formulario de diagnóstico
     */
    @PostMapping
    public ResponseEntity<FormDiagResponse> crear(
            @RequestBody FormDiagRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        log.info("POST /api/formulario-diagnostico - Creando nuevo formulario");
        String username = userDetails != null ? userDetails.getUsername() : "anonymous";
        FormDiagResponse response = formDiagService.crear(request, username);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Actualizar un formulario existente
     */
    @PutMapping("/{id}")
    public ResponseEntity<FormDiagResponse> actualizar(
            @PathVariable("id") Integer id,
            @RequestBody FormDiagRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        log.info("PUT /api/formulario-diagnostico/{} - Actualizando formulario", id);
        String username = userDetails != null ? userDetails.getUsername() : "anonymous";
        FormDiagResponse response = formDiagService.actualizar(id, request, username);
        return ResponseEntity.ok(response);
    }

    /**
     * Guardar borrador del formulario (crear o actualizar)
     */
    @PostMapping("/borrador")
    public ResponseEntity<FormDiagResponse> guardarBorrador(
            @RequestBody FormDiagRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        log.info("POST /api/formulario-diagnostico/borrador - Guardando borrador");
        String username = userDetails != null ? userDetails.getUsername() : "anonymous";
        FormDiagResponse response = formDiagService.guardarBorrador(request, username);
        return ResponseEntity.ok(response);
    }

    /**
     * Enviar formulario (cambiar estado a ENVIADO)
     */
    @PostMapping("/{id}/enviar")
    public ResponseEntity<FormDiagResponse> enviar(
            @PathVariable("id") Integer id,
            @AuthenticationPrincipal UserDetails userDetails) {
        log.info("POST /api/formulario-diagnostico/{}/enviar - Enviando formulario", id);
        String username = userDetails != null ? userDetails.getUsername() : "anonymous";
        FormDiagResponse response = formDiagService.enviar(id, username);
        return ResponseEntity.ok(response);
    }

    /**
     * Obtener formulario por ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<FormDiagResponse> obtenerPorId(@PathVariable("id") Integer id) {
        log.info("GET /api/formulario-diagnostico/{} - Obteniendo formulario", id);
        FormDiagResponse response = formDiagService.obtenerPorId(id);
        return ResponseEntity.ok(response);
    }

    /**
     * Obtener formulario activo (en proceso) por IPRESS
     */
    @GetMapping("/borrador/ipress/{idIpress}")
    public ResponseEntity<FormDiagResponse> obtenerBorradorPorIpress(@PathVariable("idIpress") Long idIpress) {
        log.info("GET /api/formulario-diagnostico/borrador/ipress/{} - Obteniendo borrador", idIpress);
        FormDiagResponse response = formDiagService.obtenerEnProcesoPorIpress(idIpress);
        if (response == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(response);
    }

    /**
     * Listar todos los formularios
     */
    @GetMapping
    public ResponseEntity<List<FormDiagListResponse>> listarTodos() {
        log.info("GET /api/formulario-diagnostico - Listando todos los formularios");
        List<FormDiagListResponse> response = formDiagService.listarTodos();
        return ResponseEntity.ok(response);
    }

    /**
     * Listar formularios por IPRESS
     */
    @GetMapping("/ipress/{idIpress}")
    public ResponseEntity<List<FormDiagListResponse>> listarPorIpress(@PathVariable("idIpress") Long idIpress) {
        log.info("GET /api/formulario-diagnostico/ipress/{} - Listando por IPRESS", idIpress);
        List<FormDiagListResponse> response = formDiagService.listarPorIpress(idIpress);
        return ResponseEntity.ok(response);
    }

    /**
     * Listar formularios por Red Asistencial
     */
    @GetMapping("/red/{idRed}")
    public ResponseEntity<List<FormDiagListResponse>> listarPorRed(@PathVariable("idRed") Long idRed) {
        log.info("GET /api/formulario-diagnostico/red/{} - Listando por Red", idRed);
        List<FormDiagListResponse> response = formDiagService.listarPorRed(idRed);
        return ResponseEntity.ok(response);
    }

    /**
     * Listar formularios por estado
     */
    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<FormDiagListResponse>> listarPorEstado(@PathVariable("estado") String estado) {
        log.info("GET /api/formulario-diagnostico/estado/{} - Listando por estado", estado);
        List<FormDiagListResponse> response = formDiagService.listarPorEstado(estado);
        return ResponseEntity.ok(response);
    }

    /**
     * Listar formularios por año
     */
    @GetMapping("/anio/{anio}")
    public ResponseEntity<List<FormDiagListResponse>> listarPorAnio(@PathVariable("anio") Integer anio) {
        log.info("GET /api/formulario-diagnostico/anio/{} - Listando por año", anio);
        List<FormDiagListResponse> response = formDiagService.listarPorAnio(anio);
        return ResponseEntity.ok(response);
    }

    /**
     * Eliminar formulario (solo si está en proceso)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable("id") Integer id) {
        log.info("DELETE /api/formulario-diagnostico/{} - Eliminando formulario", id);
        formDiagService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Verificar si existe un formulario en proceso para la IPRESS en el año actual
     */
    @GetMapping("/existe-en-proceso/ipress/{idIpress}")
    public ResponseEntity<Boolean> existeEnProcesoActual(@PathVariable("idIpress") Long idIpress) {
        log.info("GET /api/formulario-diagnostico/existe-en-proceso/ipress/{} - Verificando", idIpress);
        boolean existe = formDiagService.existeEnProcesoActual(idIpress);
        return ResponseEntity.ok(existe);
    }
}

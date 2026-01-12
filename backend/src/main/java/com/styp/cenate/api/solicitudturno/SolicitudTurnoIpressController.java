package com.styp.cenate.api.solicitudturno;

import com.styp.cenate.dto.MiIpressResponse;
import com.styp.cenate.dto.SolicitudTurnoIpressRequest;
import com.styp.cenate.dto.SolicitudTurnoIpressResponse;
import com.styp.cenate.service.solicitudturno.SolicitudTurnoIpressService;
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
 * Controlador REST para gestion de solicitudes de turnos de IPRESS.
 * Base URL: /api/solicitudes-turno
 */
@RestController
@RequestMapping("/api/solicitudes-turno")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://10.0.89.13:5173",
        "http://10.0.89.239:5173"
})
public class SolicitudTurnoIpressController {

    private final SolicitudTurnoIpressService solicitudService;

    // ============================================================
    // Datos del usuario actual (auto-detectados)
    // ============================================================

    /**
     * Obtiene los datos de IPRESS del usuario actual
     */
    @GetMapping("/mi-ipress")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORDINADOR', 'INSTITUCION_EX')")
    public ResponseEntity<MiIpressResponse> obtenerMiIpress() {
        log.info("Obteniendo datos de IPRESS del usuario actual");
        return ResponseEntity.ok(solicitudService.obtenerMiIpress());
    }

    // ============================================================
    // Mis solicitudes (usuario externo)
    // ============================================================

    /**
     * Lista las solicitudes del usuario actual
     */
    @GetMapping("/mis-solicitudes")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORDINADOR', 'INSTITUCION_EX')")
    public ResponseEntity<List<SolicitudTurnoIpressResponse>> listarMisSolicitudes() {
        log.info("Listando solicitudes del usuario actual");
        return ResponseEntity.ok(solicitudService.listarMisSolicitudes());
    }

    /**
     * Obtiene la solicitud del usuario actual para un periodo
     */
    @GetMapping("/mi-solicitud/periodo/{idPeriodo}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORDINADOR', 'INSTITUCION_EX')")
    public ResponseEntity<SolicitudTurnoIpressResponse> obtenerMiSolicitud(@PathVariable Long idPeriodo) {
        log.info("Obteniendo mi solicitud para periodo: {}", idPeriodo);
        SolicitudTurnoIpressResponse response = solicitudService.obtenerMiSolicitud(idPeriodo);
        if (response == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(response);
    }

    /**
     * Verifica si el usuario actual ya tiene solicitud en un periodo
     */
    @GetMapping("/periodo/{idPeriodo}/existe")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORDINADOR', 'INSTITUCION_EX')")
    public ResponseEntity<Map<String, Boolean>> existeMiSolicitud(@PathVariable Long idPeriodo) {
        log.info("Verificando si existe solicitud para periodo: {}", idPeriodo);
        boolean existe = solicitudService.existeMiSolicitud(idPeriodo);
        return ResponseEntity.ok(Map.of("existe", existe));
    }

    // ============================================================
    // Listar solicitudes (para coordinador/admin)
    // ============================================================

    /**
     * Lista solicitudes por periodo
     */
    @GetMapping("/periodo/{idPeriodo}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORDINADOR')")
    public ResponseEntity<List<SolicitudTurnoIpressResponse>> listarPorPeriodo(@PathVariable Long idPeriodo) {
        log.info("Listando solicitudes del periodo: {}", idPeriodo);
        return ResponseEntity.ok(solicitudService.listarPorPeriodo(idPeriodo));
    }

    /**
     * Lista solicitudes por periodo y red
     */
    @GetMapping("/periodo/{idPeriodo}/red/{idRed}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORDINADOR')")
    public ResponseEntity<List<SolicitudTurnoIpressResponse>> listarPorPeriodoYRed(
            @PathVariable Long idPeriodo,
            @PathVariable Long idRed) {
        log.info("Listando solicitudes del periodo {} y red {}", idPeriodo, idRed);
        return ResponseEntity.ok(solicitudService.listarPorPeriodoYRed(idPeriodo, idRed));
    }

    /**
     * Lista solicitudes por IPRESS
     */
    @GetMapping("/ipress/{idIpress}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORDINADOR')")
    public ResponseEntity<List<SolicitudTurnoIpressResponse>> listarPorIpress(@PathVariable Long idIpress) {
        log.info("Listando solicitudes de IPRESS: {}", idIpress);
        return ResponseEntity.ok(solicitudService.listarPorIpress(idIpress));
    }

    // ============================================================
    // Obtener solicitud individual
    // ============================================================

    /**
     * Obtiene una solicitud por ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORDINADOR', 'INSTITUCION_EX')")
    public ResponseEntity<SolicitudTurnoIpressResponse> obtenerPorId(@PathVariable Long id) {
        log.info("Obteniendo solicitud con ID: {}", id);
        return ResponseEntity.ok(solicitudService.obtenerPorIdConDetalles(id));
    }

    // ============================================================
    // CRUD - Crear y actualizar
    // ============================================================

    /**
     * Crea una nueva solicitud
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORDINADOR', 'INSTITUCION_EX')")
    public ResponseEntity<SolicitudTurnoIpressResponse> crear(
            @Valid @RequestBody SolicitudTurnoIpressRequest request) {
        log.info("Creando nueva solicitud para periodo: {}", request.getIdPeriodo());
        SolicitudTurnoIpressResponse response = solicitudService.crear(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Guarda como borrador (crea o actualiza)
     */
    @PostMapping("/borrador")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORDINADOR', 'INSTITUCION_EX')")
    public ResponseEntity<SolicitudTurnoIpressResponse> guardarBorrador(
            @Valid @RequestBody SolicitudTurnoIpressRequest request) {
    	log.info("Datos del borrador : {}", request.toString());
        log.info("Guardando borrador para periodo: {}", request.getIdPeriodo());
        SolicitudTurnoIpressResponse response = solicitudService.guardarBorrador(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Actualiza una solicitud existente
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORDINADOR', 'INSTITUCION_EX')")
    public ResponseEntity<SolicitudTurnoIpressResponse> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody SolicitudTurnoIpressRequest request) {
        log.info("Actualizando solicitud con ID: {}", id);
        return ResponseEntity.ok(solicitudService.actualizar(id, request));
    }

    // ============================================================
    // Cambios de estado
    // ============================================================

    /**
     * Envia una solicitud
     */
    @PutMapping("/{id}/enviar")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORDINADOR', 'INSTITUCION_EX')")
    public ResponseEntity<SolicitudTurnoIpressResponse> enviar(@PathVariable Long id) {
        log.info("Enviando solicitud con ID: {}", id);
        return ResponseEntity.ok(solicitudService.enviar(id));
    }

    /**
     * Marca una solicitud como revisada (solo coordinador)
     */
    @PutMapping("/{id}/revisar")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORDINADOR')")
    public ResponseEntity<SolicitudTurnoIpressResponse> marcarRevisada(@PathVariable Long id) {
        log.info("Marcando solicitud como revisada, ID: {}", id);
        return ResponseEntity.ok(solicitudService.marcarRevisada(id));
    }

    // ============================================================
    // Eliminar
    // ============================================================

    /**
     * Elimina una solicitud (solo si esta en borrador)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORDINADOR', 'EXTERNO')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        log.info("Eliminando solicitud con ID: {}", id);
        solicitudService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}

package com.styp.cenate.api;

import com.styp.cenate.dto.bolsas.*;
import com.styp.cenate.service.bolsas.BolsasService;
import com.styp.cenate.service.bolsas.SolicitudBolsasService;
import com.styp.cenate.security.mbac.CheckMBACPermission;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;
import java.util.List;

/**
 * 🌐 Controlador REST para gestión de Bolsas de Pacientes
 * v1.0.0 - Endpoint base: /api/bolsas
 */
@RestController
@RequestMapping("/api/bolsas")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost"
})
public class BolsasController {

    private final BolsasService bolsasService;
    private final SolicitudBolsasService solicitudBolsasService;

    // ========================================================================
    // 📊 BOLSAS - CONSULTAS
    // ========================================================================

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN', 'COORDINADOR', 'MEDICO')")
    public ResponseEntity<List<BolsaDTO>> obtenerTodasBolsas() {
        log.info("📋 Consultando todas las bolsas...");
        return ResponseEntity.ok(bolsasService.obtenerTodasLasBolsas());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN', 'COORDINADOR', 'MEDICO')")
    public ResponseEntity<BolsaDTO> obtenerBolsaPorId(@PathVariable Long id) {
        log.info("🔍 Consultando bolsa ID: {}", id);
        return ResponseEntity.ok(bolsasService.obtenerBolsaPorId(id));
    }

    @GetMapping("/especialidad/{especialidadId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN', 'COORDINADOR', 'MEDICO')")
    public ResponseEntity<List<BolsaDTO>> obtenerBolsasPorEspecialidad(@PathVariable Long especialidadId) {
        log.info("🏥 Consultando bolsas por especialidad: {}", especialidadId);
        return ResponseEntity.ok(bolsasService.obtenerBolsasPorEspecialidad(especialidadId));
    }

    @GetMapping("/responsable/{responsableId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN', 'COORDINADOR', 'MEDICO')")
    public ResponseEntity<List<BolsaDTO>> obtenerBolsasPorResponsable(@PathVariable Long responsableId) {
        log.info("👤 Consultando bolsas por responsable: {}", responsableId);
        return ResponseEntity.ok(bolsasService.obtenerBolsasPorResponsable(responsableId));
    }

    @GetMapping("/buscar")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN', 'COORDINADOR')")
    public ResponseEntity<Page<BolsaDTO>> buscarBolsas(
        @RequestParam(required = false) String nombre,
        @RequestParam(required = false) String estado,
        Pageable pageable) {
        log.info("🔎 Buscando bolsas: nombre={}, estado={}", nombre, estado);
        return ResponseEntity.ok(bolsasService.buscarBolsas(nombre, estado, pageable));
    }

    @GetMapping("/estadisticas")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    public ResponseEntity<Object> obtenerEstadisticas() {
        log.info("📊 Consultando estadísticas de bolsas...");
        return ResponseEntity.ok(bolsasService.obtenerEstadisticas());
    }

    // ========================================================================
    // 📊 BOLSAS - CRUD
    // ========================================================================

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    @CheckMBACPermission(pagina = "/bolsas/gestion-pacientes", accion = "crear")
    public ResponseEntity<BolsaDTO> crearBolsa(@Valid @RequestBody BolsaRequestDTO request) {
        log.info("✏️ Creando nueva bolsa: {}", request.getNombreBolsa());
        BolsaDTO nuevaBolsa = bolsasService.crearBolsa(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevaBolsa);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    @CheckMBACPermission(pagina = "/bolsas/gestion-pacientes", accion = "editar")
    public ResponseEntity<BolsaDTO> actualizarBolsa(
        @PathVariable Long id,
        @Valid @RequestBody BolsaRequestDTO request) {
        log.info("✏️ Actualizando bolsa ID: {}", id);
        BolsaDTO bolsaActualizada = bolsasService.actualizarBolsa(id, request);
        return ResponseEntity.ok(bolsaActualizada);
    }

    @PutMapping("/{id}/estado")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    @CheckMBACPermission(pagina = "/bolsas/gestion-pacientes", accion = "editar")
    public ResponseEntity<BolsaDTO> cambiarEstadoBolsa(
        @PathVariable Long id,
        @RequestParam String nuevoEstado) {
        log.info("🔄 Cambiando estado de bolsa ID: {} a {}", id, nuevoEstado);
        BolsaDTO bolsaActualizada = bolsasService.cambiarEstadoBolsa(id, nuevoEstado);
        return ResponseEntity.ok(bolsaActualizada);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    @CheckMBACPermission(pagina = "/bolsas/gestion-pacientes", accion = "eliminar")
    public ResponseEntity<Void> eliminarBolsa(@PathVariable Long id) {
        log.warn("🗑️ Eliminando bolsa ID: {}", id);
        bolsasService.eliminarBolsa(id);
        return ResponseEntity.noContent().build();
    }

    // ========================================================================
    // 📥 IMPORTACIÓN DESDE EXCEL
    // ========================================================================

    @PostMapping("/importar/excel")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    @CheckMBACPermission(pagina = "/bolsas/cargar-excel", accion = "crear")
    public ResponseEntity<Object> importarDesdeExcel(
        @RequestParam("archivo") MultipartFile archivo,
        @RequestParam Long usuarioId,
        @RequestParam String usuarioNombre,
        @RequestParam Long tipoBolesaId) {
        log.info("📥 Importando bolsas desde Excel: {} - Tipo: {}", archivo.getOriginalFilename(), tipoBolesaId);
        Object resultado = bolsasService.importarDesdeExcel(archivo, usuarioId, usuarioNombre, tipoBolesaId);
        return ResponseEntity.status(HttpStatus.CREATED).body(resultado);
    }

    @GetMapping("/importaciones/historial")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    public ResponseEntity<List<?>> obtenerHistorialImportaciones() {
        log.info("📋 Consultando historial de importaciones...");
        return ResponseEntity.ok(bolsasService.obtenerHistorialImportaciones());
    }

    @GetMapping("/importaciones/{idImportacion}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    public ResponseEntity<Object> obtenerDetallesImportacion(@PathVariable Long idImportacion) {
        log.info("🔍 Consultando detalles de importación: {}", idImportacion);
        return ResponseEntity.ok(bolsasService.obtenerDetallesImportacion(idImportacion));
    }

    /*
    // ========================================================================
    // 📋 SOLICITUDES - COMENTADAS (v1.6.0 en SolicitudBolsaController)
    // ========================================================================
    // DEPRECADO: Los endpoints de solicitudes fueron movidos a SolicitudBolsaController
    // para evitar conflictos de rutas con la nueva versión v1.6.0.
    // USE: /api/bolsas/solicitudes endpoints en SolicitudBolsaController en su lugar.

    @GetMapping("/solicitudes")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN', 'COORDINADOR', 'MEDICO')")
    public ResponseEntity<List<SolicitudBolsaDTO>> obtenerTodasSolicitudes() {
        log.info("📋 Consultando todas las solicitudes...");
        return ResponseEntity.ok(solicitudBolsasService.obtenerTodasLasSolicitudes());
    }

    @GetMapping("/solicitudes/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN', 'COORDINADOR', 'MEDICO')")
    public ResponseEntity<SolicitudBolsaDTO> obtenerSolicitudPorId(@PathVariable Long id) {
        log.info("🔍 Consultando solicitud ID: {}", id);
        return ResponseEntity.ok(solicitudBolsasService.obtenerSolicitudPorId(id));
    }

    @GetMapping("/solicitudes/numero/{numero}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN', 'COORDINADOR', 'MEDICO')")
    public ResponseEntity<SolicitudBolsaDTO> obtenerSolicitudPorNumero(@PathVariable String numero) {
        log.info("🔍 Consultando solicitud: {}", numero);
        return ResponseEntity.ok(solicitudBolsasService.obtenerSolicitudPorNumero(numero));
    }

    @GetMapping("/solicitudes/bolsa/{idBolsa}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN', 'COORDINADOR', 'MEDICO')")
    public ResponseEntity<List<SolicitudBolsaDTO>> obtenerSolicitudesPorBolsa(@PathVariable Long idBolsa) {
        log.info("📋 Consultando solicitudes de bolsa: {}", idBolsa);
        return ResponseEntity.ok(solicitudBolsasService.obtenerSolicitudesPorBolsa(idBolsa));
    }

    @GetMapping("/solicitudes/paciente/{dni}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN', 'COORDINADOR', 'MEDICO')")
    public ResponseEntity<List<SolicitudBolsaDTO>> obtenerSolicitudesPorPaciente(@PathVariable String dni) {
        log.info("📋 Consultando solicitudes de paciente: {}", dni);
        return ResponseEntity.ok(solicitudBolsasService.obtenerSolicitudesPorPaciente(dni));
    }

    @GetMapping("/solicitudes/estado/{estado}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN', 'COORDINADOR')")
    public ResponseEntity<List<SolicitudBolsaDTO>> obtenerSolicitudesPorEstado(@PathVariable String estado) {
        log.info("📋 Consultando solicitudes por estado: {}", estado);
        return ResponseEntity.ok(solicitudBolsasService.obtenerSolicitudesPorEstado(estado));
    }

    @GetMapping("/solicitudes/pendientes")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN', 'COORDINADOR')")
    public ResponseEntity<List<SolicitudBolsaDTO>> obtenerSolicitudesPendientes() {
        log.info("📋 Consultando solicitudes pendientes...");
        return ResponseEntity.ok(solicitudBolsasService.obtenerSolicitudesPendientes());
    }

    @GetMapping("/solicitudes/buscar")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN', 'COORDINADOR')")
    public ResponseEntity<Page<SolicitudBolsaDTO>> buscarSolicitudes(
        @RequestParam(required = false) String nombrePaciente,
        @RequestParam(required = false) String dni,
        @RequestParam(required = false) String estado,
        @RequestParam(required = false) String numeroSolicitud,
        Pageable pageable) {
        log.info("🔎 Buscando solicitudes: paciente={}, dni={}, estado={}", nombrePaciente, dni, estado);
        return ResponseEntity.ok(solicitudBolsasService.buscarSolicitudes(nombrePaciente, dni, estado, numeroSolicitud, pageable));
    }

    @GetMapping("/solicitudes/estadisticas")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    public ResponseEntity<Object> obtenerEstadisticasSolicitudes() {
        log.info("📊 Consultando estadísticas de solicitudes...");
        return ResponseEntity.ok(solicitudBolsasService.obtenerEstadisticas());
    }

    @PostMapping("/solicitudes")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN', 'COORDINADOR', 'MEDICO')")
    @CheckMBACPermission(pagina = "/bolsas/solicitudes", accion = "crear")
    public ResponseEntity<SolicitudBolsaDTO> crearSolicitud(
        @Valid @RequestBody SolicitudBolsaRequestDTO request) {
        log.info("✏️ Creando nueva solicitud para paciente: {}", request.pacienteDni());
        SolicitudBolsaDTO nuevaSolicitud = solicitudBolsasService.crearSolicitud(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevaSolicitud);
    }

    @PutMapping("/solicitudes/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN', 'COORDINADOR')")
    @CheckMBACPermission(pagina = "/bolsas/solicitudes", accion = "editar")
    public ResponseEntity<SolicitudBolsaDTO> actualizarSolicitud(
        @PathVariable Long id,
        @Valid @RequestBody SolicitudBolsaRequestDTO request) {
        log.info("✏️ Actualizando solicitud ID: {}", id);
        SolicitudBolsaDTO solicitudActualizada = solicitudBolsasService.actualizarSolicitud(id, request);
        return ResponseEntity.ok(solicitudActualizada);
    }

    @PutMapping("/solicitudes/{id}/aprobar")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN', 'COORDINADOR')")
    @CheckMBACPermission(pagina = "/bolsas/solicitudes", accion = "editar")
    public ResponseEntity<SolicitudBolsaDTO> aprobarSolicitud(
        @PathVariable Long id,
        @RequestParam Long responsableId,
        @RequestParam String responsableNombre,
        @RequestParam(required = false) String notas) {
        log.info("✅ Aprobando solicitud ID: {}", id);
        SolicitudBolsaDTO solicitudAprobada = solicitudBolsasService.aprobarSolicitud(id, responsableId, responsableNombre, notas);
        return ResponseEntity.ok(solicitudAprobada);
    }

    @PutMapping("/solicitudes/{id}/rechazar")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN', 'COORDINADOR')")
    @CheckMBACPermission(pagina = "/bolsas/solicitudes", accion = "editar")
    public ResponseEntity<SolicitudBolsaDTO> rechazarSolicitud(
        @PathVariable Long id,
        @RequestParam Long responsableId,
        @RequestParam String responsableNombre,
        @RequestParam String razon) {
        log.info("❌ Rechazando solicitud ID: {}", id);
        SolicitudBolsaDTO solicitudRechazada = solicitudBolsasService.rechazarSolicitud(id, responsableId, responsableNombre, razon);
        return ResponseEntity.ok(solicitudRechazada);
    }

    @DeleteMapping("/solicitudes/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    @CheckMBACPermission(pagina = "/bolsas/solicitudes", accion = "eliminar")
    public ResponseEntity<Void> eliminarSolicitud(@PathVariable Long id) {
        log.warn("🗑️ Eliminando solicitud ID: {}", id);
        solicitudBolsasService.eliminarSolicitud(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/solicitudes/{id}/asignar")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN', 'COORDINADOR')")
    @CheckMBACPermission(pagina = "/bolsas/solicitudes", accion = "editar")
    public ResponseEntity<SolicitudBolsaDTO> asignarAGestora(
        @PathVariable Long id,
        @Valid @RequestBody AsignarGestoraRequest request) {
        log.info("👤 Asignando solicitud ID: {} a gestora: {}", id, request.getGestoraNombre());
        SolicitudBolsaDTO solicitudAsignada = solicitudBolsasService.asignarAGestora(id, request);
        return ResponseEntity.ok(solicitudAsignada);
    }

    @GetMapping("/solicitudes/exportar")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN', 'COORDINADOR')")
    public ResponseEntity<byte[]> exportarCSV(
        @RequestParam(value = "ids", required = false) List<Long> ids) {
        log.info("📄 Exportando solicitudes a CSV");

        if (ids == null || ids.isEmpty()) {
            ids = solicitudBolsasService.obtenerTodasLasSolicitudes()
                .stream()
                .map(SolicitudBolsaDTO::getIdSolicitud)
                .toList();
        }

        byte[] csvData = solicitudBolsasService.exportarCSV(ids);

        return ResponseEntity.ok()
            .header("Content-Type", "text/csv; charset=UTF-8")
            .header("Content-Disposition", "attachment; filename=\"solicitudes_bolsas.csv\"")
            .body(csvData);
    }

    @PostMapping("/solicitudes/{id}/recordatorio")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN', 'COORDINADOR')")
    @CheckMBACPermission(pagina = "/bolsas/solicitudes", accion = "editar")
    public ResponseEntity<SolicitudBolsaDTO> enviarRecordatorio(
        @PathVariable Long id,
        @Valid @RequestBody EnviarRecordatorioRequest request) {
        log.info("📧 Enviando recordatorio {} para solicitud ID: {}", request.getTipo(), id);
        SolicitudBolsaDTO solicitudActualizada = solicitudBolsasService.enviarRecordatorio(id, request);
        return ResponseEntity.ok(solicitudActualizada);
    }
    */
}

package com.styp.cenate.api;

import com.styp.cenate.dto.bolsas.*;
import com.styp.cenate.service.bolsas.BolsasService;
import com.styp.cenate.service.bolsas.SolicitudBolsasService;
import com.styp.cenate.service.bolsas.SolicitudBolsaService;
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
import java.util.Map;

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
    private final SolicitudBolsaService solicitudBolsaService;

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
    @CheckMBACPermission(pagina = "/bolsas/estadisticas", accion = "crear")
    public ResponseEntity<BolsaDTO> crearBolsa(@Valid @RequestBody BolsaRequestDTO request) {
        log.info("✏️ Creando nueva bolsa: {}", request.getNombreBolsa());
        BolsaDTO nuevaBolsa = bolsasService.crearBolsa(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevaBolsa);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    @CheckMBACPermission(pagina = "/bolsas/estadisticas", accion = "editar")
    public ResponseEntity<BolsaDTO> actualizarBolsa(
        @PathVariable Long id,
        @Valid @RequestBody BolsaRequestDTO request) {
        log.info("✏️ Actualizando bolsa ID: {}", id);
        BolsaDTO bolsaActualizada = bolsasService.actualizarBolsa(id, request);
        return ResponseEntity.ok(bolsaActualizada);
    }

    @PutMapping("/{id}/estado")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    @CheckMBACPermission(pagina = "/bolsas/estadisticas", accion = "editar")
    public ResponseEntity<BolsaDTO> cambiarEstadoBolsa(
        @PathVariable Long id,
        @RequestParam String nuevoEstado) {
        log.info("🔄 Cambiando estado de bolsa ID: {} a {}", id, nuevoEstado);
        BolsaDTO bolsaActualizada = bolsasService.cambiarEstadoBolsa(id, nuevoEstado);
        return ResponseEntity.ok(bolsaActualizada);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    @CheckMBACPermission(pagina = "/bolsas/estadisticas", accion = "eliminar")
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
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN', 'COORD. GESTION CITAS')")
    public ResponseEntity<List<?>> obtenerHistorialImportaciones() {
        log.info("📋 Consultando historial de importaciones...");
        return ResponseEntity.ok(bolsasService.obtenerHistorialImportaciones());
    }

    @GetMapping("/importaciones/{idImportacion}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN', 'COORD. GESTION CITAS')")
    public ResponseEntity<Object> obtenerDetallesImportacion(@PathVariable Long idImportacion) {
        log.info("🔍 Consultando detalles de importación: {}", idImportacion);
        return ResponseEntity.ok(bolsasService.obtenerDetallesImportacion(idImportacion));
    }

    // ========================================================================
    // 📂 HISTORIAL DE BOLSAS - Solicitudes de bolsa (renamed semantically v1.11.0)
    // ========================================================================

    @GetMapping("/cargas")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    public ResponseEntity<?> obtenerListaCargas() {
        log.info("📂 Consultando historial/listado de solicitudes de bolsa...");
        return ResponseEntity.ok(solicitudBolsaService.listarTodas());
    }

    @GetMapping("/cargas/{idCarga}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    public ResponseEntity<?> obtenerDatosCarga(@PathVariable Long idCarga) {
        log.info("🔍 Consultando datos de solicitud de bolsa: {}", idCarga);
        return solicitudBolsaService.obtenerPorId(idCarga)
            .map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/cargas/{idCarga}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    @CheckMBACPermission(pagina = "/bolsas/historial", accion = "eliminar")
    public ResponseEntity<?> eliminarCarga(@PathVariable Long idCarga) {
        log.warn("🗑️ Eliminando solicitud de bolsa: {}", idCarga);
        solicitudBolsaService.eliminar(idCarga);
        return ResponseEntity.ok(Map.of("mensaje", "Solicitud de bolsa eliminada correctamente", "idSolicitud", idCarga));
    }

    @PutMapping("/cargas/{idCarga}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    @CheckMBACPermission(pagina = "/bolsas/historial", accion = "editar")
    public ResponseEntity<?> actualizarCarga(
        @PathVariable Long idCarga,
        @RequestParam(required = false) Long idGestora) {
        log.info("✏️ Actualizando solicitud de bolsa: {}", idCarga);
        if (idGestora != null) {
            solicitudBolsaService.asignarGestora(idCarga, idGestora);
        }
        return solicitudBolsaService.obtenerPorId(idCarga)
            .map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/cargas")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    @CheckMBACPermission(pagina = "/bolsas/historial", accion = "crear")
    public ResponseEntity<?> crearCarga(@Valid @RequestBody Map<String, Object> request) {
        log.info("✏️ Creando nueva solicitud de bolsa");
        // TODO: Implementar creación manual de solicitudes de bolsa
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("mensaje", "Creación de solicitudes debe ser a través de importación Excel"));
    }

    // ========================================================================
    // 🔄 SINCRONIZACIÓN DE ASEGURADOS
    // ========================================================================

    @PostMapping("/sincronizar-asegurados")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    public ResponseEntity<?> sincronizarAsegurados() {
        log.info("🔄 Ejecutando sincronización de asegurados desde dim_solicitud_bolsa...");
        var resultado = solicitudBolsaService.sincronizarAseguradosDesdebolsas();
        return ResponseEntity.ok(resultado);
    }

    @GetMapping("/asegurados-sincronizados-reciente")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN', 'COORDINADOR')")
    public ResponseEntity<?> obtenerAseguradosSincronizadosReciente() {
        log.info("🔍 Consultando asegurados sincronizados en las últimas 24 horas...");
        var asegurados = solicitudBolsaService.obtenerAseguradosSincronizadosReciente();
        return ResponseEntity.ok(Map.of(
            "total", asegurados.size(),
            "asegurados", asegurados,
            "mensaje", asegurados.isEmpty() ? "No hay asegurados sincronizados recientemente" : "Se encontraron " + asegurados.size() + " asegurados sincronizados"
        ));
    }
}

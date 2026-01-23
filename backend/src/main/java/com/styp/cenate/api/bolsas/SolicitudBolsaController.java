package com.styp.cenate.api.bolsas;

import com.styp.cenate.dto.bolsas.SolicitudBolsaDTO;
import com.styp.cenate.service.bolsas.SolicitudBolsaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

/**
 * Controller REST para gestión de solicitudes de bolsa
 * Endpoints para importación Excel, listado, búsqueda y actualización
 * 
 * @version v1.6.0
 * @since 2026-01-23
 */
@Slf4j
@RestController
@RequestMapping("/api/bolsas/solicitudes")
@RequiredArgsConstructor
public class SolicitudBolsaController {

    private final SolicitudBolsaService solicitudBolsaService;

    /**
     * Importa solicitudes desde archivo Excel
     * POST /api/bolsas/solicitudes/importar
     * 
     * @param file archivo Excel con columnas: DNI, Código Adscripción
     * @param idTipoBolsa ID del tipo de bolsa seleccionado (PASO 1)
     * @param idServicio ID del servicio/especialidad (PASO 2)
     * @return estadísticas de importación
     */
    @PostMapping(value = "/importar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> importarDesdeExcel(
            @RequestParam("file") MultipartFile file,
            @RequestParam("idTipoBolsa") Long idTipoBolsa,
            @RequestParam("idServicio") Long idServicio) {

        try {
            log.info("Iniciando importación de Excel - Tipo: {}, Servicio: {}",
                idTipoBolsa, idServicio);

            Map<String, Object> resultado = solicitudBolsaService.importarDesdeExcel(
                file,
                idTipoBolsa,
                idServicio,
                "usuario_actual" // En producción: obtener del contexto de seguridad
            );

            log.info("Importación completada: {} OK, {} errores",
                resultado.get("filas_ok"),
                resultado.get("filas_error"));

            return ResponseEntity.ok(resultado);

        } catch (Exception e) {
            log.error("Error en importación de Excel: ", e);
            return ResponseEntity.badRequest().body(
                Map.of("error", "Error en importación: " + e.getMessage())
            );
        }
    }

    /**
     * Obtiene todas las solicitudes activas
     * GET /api/bolsas/solicitudes
     * 
     * @return lista de solicitudes
     */
    @GetMapping
    public ResponseEntity<List<SolicitudBolsaDTO>> listarTodas() {
        log.info("Listando todas las solicitudes de bolsa");
        return ResponseEntity.ok(solicitudBolsaService.listarTodas());
    }

    /**
     * Obtiene una solicitud por ID
     * GET /api/bolsas/solicitudes/{id}
     * 
     * @param id ID de la solicitud
     * @return solicitud encontrada o 404
     */
    @GetMapping("/{id}")
    public ResponseEntity<SolicitudBolsaDTO> obtenerPorId(@PathVariable Long id) {
        log.info("Obteniendo solicitud por ID: {}", id);
        return solicitudBolsaService.obtenerPorId(id)
            .map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Asigna una gestora a una solicitud
     * PATCH /api/bolsas/solicitudes/{id}/asignar
     * 
     * @param id ID de la solicitud
     * @param idGestora ID de la gestora a asignar
     * @return mensaje de éxito
     */
    @PatchMapping("/{id}/asignar")
    public ResponseEntity<?> asignarGestora(
            @PathVariable Long id,
            @RequestParam("idGestora") Long idGestora) {

        try {
            log.info("Asignando gestora {} a solicitud {}", idGestora, id);
            solicitudBolsaService.asignarGestora(id, idGestora);

            return ResponseEntity.ok(Map.of(
                "mensaje", "Gestora asignada exitosamente",
                "idSolicitud", id,
                "idGestora", idGestora
            ));

        } catch (Exception e) {
            log.error("Error al asignar gestora: ", e);
            return ResponseEntity.badRequest().body(
                Map.of("error", "Error: " + e.getMessage())
            );
        }
    }

    /**
     * Cambia el estado de una solicitud
     * PATCH /api/bolsas/solicitudes/{id}/estado
     * 
     * @param id ID de la solicitud
     * @param nuevoEstadoId ID del nuevo estado (de dim_estados_gestion_citas)
     * @return mensaje de éxito
     */
    @PatchMapping("/{id}/estado")
    public ResponseEntity<?> cambiarEstado(
            @PathVariable Long id,
            @RequestParam("nuevoEstadoId") Long nuevoEstadoId) {

        try {
            log.info("Cambiando estado de solicitud {} a {}", id, nuevoEstadoId);
            solicitudBolsaService.cambiarEstado(id, nuevoEstadoId);

            return ResponseEntity.ok(Map.of(
                "mensaje", "Estado actualizado exitosamente",
                "idSolicitud", id,
                "nuevoEstadoId", nuevoEstadoId
            ));

        } catch (Exception e) {
            log.error("Error al cambiar estado: ", e);
            return ResponseEntity.badRequest().body(
                Map.of("error", "Error: " + e.getMessage())
            );
        }
    }

    /**
     * Obtiene asegurados nuevos detectados (que no existen en BD)
     * GET /api/bolsas/solicitudes/asegurados-nuevos
     *
     * Retorna lista de DNIs en solicitudes que no tienen correspondencia en tabla asegurados
     */
    @GetMapping("/asegurados-nuevos")
    public ResponseEntity<?> obtenerAseguradosNuevos() {
        try {
            log.info("Obteniendo asegurados nuevos detectados...");
            List<Map<String, Object>> aseguradosNuevos = solicitudBolsaService.obtenerAseguradosNuevos();

            return ResponseEntity.ok(Map.of(
                "total", aseguradosNuevos.size(),
                "asegurados", aseguradosNuevos,
                "mensaje", aseguradosNuevos.isEmpty() ?
                    "No hay asegurados nuevos pendientes de sincronización" :
                    "Se encontraron " + aseguradosNuevos.size() + " asegurados nuevos"
            ));

        } catch (Exception e) {
            log.error("Error al obtener asegurados nuevos: ", e);
            return ResponseEntity.badRequest().body(
                Map.of("error", "Error: " + e.getMessage())
            );
        }
    }

    /**
     * Elimina lógicamente una solicitud (soft delete)
     * DELETE /api/bolsas/solicitudes/{id}
     *
     * @param id ID de la solicitud
     * @return mensaje de éxito
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        try {
            log.info("Eliminando solicitud {}", id);
            solicitudBolsaService.eliminar(id);

            return ResponseEntity.ok(Map.of(
                "mensaje", "Solicitud eliminada exitosamente",
                "idSolicitud", id
            ));

        } catch (Exception e) {
            log.error("Error al eliminar solicitud: ", e);
            return ResponseEntity.badRequest().body(
                Map.of("error", "Error: " + e.getMessage())
            );
        }
    }
}

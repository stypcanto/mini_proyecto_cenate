package com.styp.cenate.api.atenciones_clinicas;

import com.styp.cenate.dto.AtencionClinica107DTO;
import com.styp.cenate.dto.AtencionClinica107FiltroDTO;
import com.styp.cenate.dto.EstadisticasAtencion107DTO;
import com.styp.cenate.service.atenciones_clinicas.AtencionClinica107Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

/**
 * 🎮 AtencionClinica107PublicController
 * Propósito: Endpoints REST para módulo 107 (Atenciones Clínicas)
 * Módulo: 107
 * Endpoints:
 *   - GET /api/atenciones-clinicas-107/listar (filtros + paginación)
 *   - GET /api/atenciones-clinicas-107/estadisticas (métricas)
 *   - GET /api/atenciones-clinicas-107/{id} (detalle)
 * 
 * ⚠️ NOTA: red y macrorregion NO son parámetros de filtro (dinámico en frontend)
 */
@RestController
@RequestMapping("/api/atenciones-clinicas-107")
@CrossOrigin(origins = "*", allowedHeaders = "*")
@Slf4j
@RequiredArgsConstructor
public class AtencionClinica107PublicController {

    private final AtencionClinica107Service service;

    /**
     * GET /api/atenciones-clinicas-107/listar
     * Listar atenciones con filtros avanzados y paginación
     * 
     * Parámetros de query:
     *   - estadoGestionCitasId: ID del estado (no string)
     *   - tipoDocumento: DNI|CE|PASAPORTE|todos
     *   - pacienteDni: Número de documento (búsqueda parcial)
     *   - fechaDesde: YYYY-MM-DD
     *   - fechaHasta: YYYY-MM-DD
     *   - idIpress: ID del IPRESS
     *   - derivacion: MEDICINA CENATE|NUTRICION CENATE|PSICOLOGIA CENATE
     *   - especialidad: especialidad médica
     *   - tipoCita: tipo de cita
     *   - searchTerm: Búsqueda general (nombre, DNI, solicitud)
     *   - pageNumber: número de página (default 0)
     *   - pageSize: registros por página (default 10)
     */
    @GetMapping("/listar")
    public ResponseEntity<Map<String, Object>> listar(
        @RequestParam(value = "idBolsa", required = false, defaultValue = "1") Long idBolsa,
        @RequestParam(value = "estadoGestionCitasId", required = false) Long estadoGestionCitasId,
        @RequestParam(value = "estado", required = false) String estado,
        @RequestParam(value = "tipoDocumento", required = false) String tipoDocumento,
        @RequestParam(value = "pacienteDni", required = false) String pacienteDni,
        @RequestParam(value = "fechaDesde", required = false) LocalDate fechaDesde,
        @RequestParam(value = "fechaHasta", required = false) LocalDate fechaHasta,
        @RequestParam(value = "idIpress", required = false) Long idIpress,
        @RequestParam(value = "derivacion", required = false) String derivacion,
        @RequestParam(value = "especialidad", required = false) String especialidad,
        @RequestParam(value = "tipoCita", required = false) String tipoCita,
        @RequestParam(value = "searchTerm", required = false) String searchTerm,
        @RequestParam(value = "pageNumber", defaultValue = "0") Integer pageNumber,
        @RequestParam(value = "pageSize", defaultValue = "10") Integer pageSize
    ) {
        try {
            log.info("📋 [MODULO 107] GET /listar - página {}, tamaño {}, bolsa {}", pageNumber, pageSize, idBolsa);
            log.debug("🔍 [MODULO 107] Parámetros recibidos: derivacion='{}', especialidad='{}', idIpress={}", derivacion, especialidad, idIpress);

            // Construir DTO con filtros
            AtencionClinica107FiltroDTO filtro = AtencionClinica107FiltroDTO.builder()
                .idBolsa(idBolsa)
                .estadoGestionCitasId(estadoGestionCitasId)
                .estado(estado)
                .tipoDocumento(tipoDocumento)
                .pacienteDni(pacienteDni)
                .fechaDesde(fechaDesde)
                .fechaHasta(fechaHasta)
                .idIpress(idIpress)
                .derivacionInterna(derivacion)
                .especialidad(especialidad)
                .tipoCita(tipoCita)
                .searchTerm(searchTerm)
                .pageNumber(pageNumber)
                .pageSize(pageSize)
                .build();

            log.debug("📦 [MODULO 107] DTO construido: derivacionInterna='{}'", filtro.getDerivacionInterna());

            // Obtener resultados
            Page<AtencionClinica107DTO> resultado = service.listarConFiltros(filtro);

            // Respuesta con metadata
            Map<String, Object> response = new HashMap<>();
            response.put("content", resultado.getContent());
            response.put("totalElements", resultado.getTotalElements());
            response.put("totalPages", resultado.getTotalPages());
            response.put("currentPage", resultado.getNumber());
            response.put("pageSize", resultado.getSize());
            response.put("hasNext", resultado.hasNext());
            response.put("hasPrevious", resultado.hasPrevious());

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            log.error("❌ [MODULO 107] Error de validación: {}", e.getMessage());
            return ResponseEntity.badRequest().body(
                Map.of("error", "Parámetro inválido", "mensaje", e.getMessage())
            );
        } catch (Exception e) {
            log.error("❌ [MODULO 107] Error al listar: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                Map.of("error", "Error al procesar solicitud", "mensaje", e.getMessage())
            );
        }
    }

    /**
     * GET /api/atenciones-clinicas-107/estadisticas
     * Obtener estadísticas globales de atenciones clínicas
     * 
     * Respuesta:
     *   {
     *     "total": <int>,
     *     "citado": <int>,           (Estado 1 - Para atender)
     *     "atendidoIpress": <int>,   (Estado 2 - Completados)
     *     "pendienteCita": <int>,    (Estado 11 - Nuevos en bolsa)
     *     "otros": <int>             (Resto de estados)
     *   }
     */
    @GetMapping("/estadisticas")
    public ResponseEntity<Map<String, Object>> estadisticas() {
        try {
            log.info("📊 [MODULO 107] GET /estadisticas");

            EstadisticasAtencion107DTO stats = service.obtenerEstadisticas();

            Map<String, Object> response = new HashMap<>();
            response.put("total", stats.getTotal());
            response.put("citado", stats.getCitado());
            response.put("atendidoIpress", stats.getAtendidoIpress());
            response.put("pendienteCita", stats.getPendienteCita());
            response.put("otros", stats.getOtros());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ [MODULO 107] Error al obtener estadísticas: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                Map.of("error", "Error al obtener estadísticas", "mensaje", e.getMessage())
            );
        }
    }

    /**
     * GET /api/atenciones-clinicas-107/{id}
     * Obtener detalle completo de una atención clínica
     * 
     * @param id ID de la solicitud (id_solicitud en la base de datos)
     */
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> detalle(@PathVariable Long id) {
        try {
            log.info("🔎 [MODULO 107] GET /{}", id);

            AtencionClinica107DTO detalle = service.obtenerDetalle(id);

            Map<String, Object> response = new HashMap<>();
            response.put("atencion", detalle);

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            log.error("⚠️ [MODULO 107] Recurso no encontrado: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                Map.of("error", "No encontrado", "mensaje", "Atención " + id + " no existe")
            );
        } catch (Exception e) {
            log.error("❌ [MODULO 107] Error al obtener detalle: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                Map.of("error", "Error al procesar", "mensaje", e.getMessage())
            );
        }
    }

    /**
     * GET /api/atenciones-clinicas-107/health
     * Health check para verificar que el endpoint está funcionando
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of(
            "status", "UP",
            "modulo", "107",
            "servicio", "Atenciones Clínicas",
            "nota", "red y macrorregion se muestran pero no se filtran (dinámico)"
        ));
    }
}


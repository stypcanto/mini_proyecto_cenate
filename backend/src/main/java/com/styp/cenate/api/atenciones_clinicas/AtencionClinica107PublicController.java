package com.styp.cenate.api.atenciones_clinicas;

import com.styp.cenate.dto.*;
import com.styp.cenate.repository.AseguradoRepository;
import com.styp.cenate.service.atenciones_clinicas.AtencionClinica107Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
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
    private final AseguradoRepository aseguradoRepository;

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
        @RequestParam(value = "macrorregion", required = false) String macrorregion,
        @RequestParam(value = "red", required = false) String red,
        @RequestParam(value = "derivacion", required = false) String derivacion,
        @RequestParam(value = "especialidad", required = false) String especialidad,
        @RequestParam(value = "tipoCita", required = false) String tipoCita,
        @RequestParam(value = "searchTerm", required = false) String searchTerm,
        @RequestParam(value = "condicionMedica", required = false) String condicionMedica,
        @RequestParam(value = "pageNumber", defaultValue = "0") Integer pageNumber,
        @RequestParam(value = "pageSize", defaultValue = "10") Integer pageSize
    ) {
        try {
            log.info("📋 [MODULO 107] GET /listar - página {}, tamaño {}, bolsa {}", pageNumber, pageSize, idBolsa);
            log.info("🔍 [MODULO 107] Filtros ubicación: macrorregion='{}', red='{}', idIpress={}", macrorregion, red, idIpress);
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
                .macrorregion(macrorregion)
                .red(red)
                .derivacionInterna(derivacion)
                .especialidad(especialidad)
                .tipoCita(tipoCita)
                .searchTerm(searchTerm)
                .condicionMedica(condicionMedica)
                .pageNumber(pageNumber)
                .pageSize(pageSize)
                .build();

            log.debug("📦 [MODULO 107] DTO construido: derivacionInterna='{}', macrorregion='{}', red='{}'", 
                filtro.getDerivacionInterna(), filtro.getMacrorregion(), filtro.getRed());

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
     * GET /api/atenciones-clinicas-107/estadisticas-condicion-medica
     * Obtener estadísticas basadas en condición médica (Pendiente, Atendido, Deserción)
     * 
     * Respuesta:
     *   {
     *     "total": <int>,
     *     "pendiente": <int>,    (Condición = 'Pendiente' o NULL)
     *     "atendido": <int>,     (Condición = 'Atendido')
     *     "desercion": <int>     (Condición = 'Deserción')
     *   }
     */
    @GetMapping("/estadisticas-condicion-medica")
    public ResponseEntity<Map<String, Object>> estadisticasCondicionMedica() {
        try {
            log.info("📊 [MODULO 107] GET /estadisticas-condicion-medica");

            EstadisticasCondicionMedica107DTO stats = service.obtenerEstadisticasCondicionMedica();

            Map<String, Object> response = new HashMap<>();
            response.put("total", stats.getTotal());
            response.put("pendiente", stats.getPendiente());
            response.put("atendido", stats.getAtendido());
            response.put("desercion", stats.getDesercion());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ [MODULO 107] Error al obtener estadísticas de condición médica: {}", e.getMessage(), e);
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
     * GET /api/atenciones-clinicas-107/asegurado/{pkAsegurado}
     * Obtener atenciones de un asegurado por su pkAsegurado (o DNI como fallback)
     */
    @GetMapping("/asegurado/{pkAsegurado}")
    public ResponseEntity<Map<String, Object>> listarPorAsegurado(
            @PathVariable String pkAsegurado,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        try {
            log.info("📋 [MODULO 107] GET /asegurado/{}", pkAsegurado);

            // Resolver DNI: buscar asegurado por pk, o usar el valor directamente como DNI
            String dni = aseguradoRepository.findById(pkAsegurado)
                    .map(a -> a.getDocPaciente())
                    .orElse(pkAsegurado); // fallback: tratar pkAsegurado como DNI

            AtencionClinica107FiltroDTO filtro = AtencionClinica107FiltroDTO.builder()
                    .pacienteDni(dni)
                    .pageNumber(page)
                    .pageSize(size)
                    .build();

            Page<AtencionClinica107DTO> resultado = service.listarConFiltros(filtro);

            Map<String, Object> response = new HashMap<>();
            response.put("content", resultado.getContent());
            response.put("totalElements", resultado.getTotalElements());
            response.put("totalPages", resultado.getTotalPages());
            response.put("number", resultado.getNumber());
            response.put("size", resultado.getSize());

            log.info("✅ [MODULO 107] {} atenciones encontradas para asegurado {}", resultado.getTotalElements(), pkAsegurado);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ [MODULO 107] Error al listar atenciones por asegurado {}: {}", pkAsegurado, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                    Map.of("error", "Error al cargar atenciones", "mensaje", e.getMessage())
            );
        }
    }

    // ========================================================================
    // 📊 NUEVOS ENDPOINTS DE ESTADÍSTICAS AVANZADAS
    // ========================================================================

    /**
     * GET /api/atenciones-clinicas-107/estadisticas-resumen
     * Obtener estadísticas de resumen general
     */
    @GetMapping("/estadisticas-resumen")
    public ResponseEntity<Map<String, Object>> estadisticasResumen() {
        try {
            log.info("📈 [MODULO 107] GET /estadisticas-resumen");

            EstadisticasResumen107DTO stats = service.obtenerEstadisticasResumen();

            Map<String, Object> response = new HashMap<>();
            response.put("totalAtenciones", stats.getTotalAtenciones());
            response.put("totalAtendidos", stats.getTotalAtendidos());
            response.put("totalPendientes", stats.getTotalPendientes());
            response.put("totalDeserciones", stats.getTotalDeserciones());
            response.put("tasaCumplimiento", stats.getTasaCumplimiento());
            response.put("tasaDesercion", stats.getTasaDesercion());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ [MODULO 107] Error al obtener estadísticas resumen: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                Map.of("error", "Error al obtener estadísticas resumen", "mensaje", e.getMessage())
            );
        }
    }

    /**
     * GET /api/atenciones-clinicas-107/estadisticas-mensuales
     * Obtener estadísticas agrupadas por mes/año
     */
    @GetMapping("/estadisticas-mensuales")
    public ResponseEntity<Map<String, Object>> estadisticasMensuales() {
        try {
            log.info("📅 [MODULO 107] GET /estadisticas-mensuales");

            List<EstadisticasMensuales107DTO> stats = service.obtenerEstadisticasMensuales();

            Map<String, Object> response = new HashMap<>();
            response.put("estadisticas", stats);
            response.put("total", stats.size());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ [MODULO 107] Error al obtener estadísticas mensuales: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                Map.of("error", "Error al obtener estadísticas mensuales", "mensaje", e.getMessage())
            );
        }
    }

    /**
     * GET /api/atenciones-clinicas-107/estadisticas-ipress
     * Obtener estadísticas por IPRESS (Top N)
     * 
     * @param limit Número máximo de resultados (opcional, default: 10)
     */
    @GetMapping("/estadisticas-ipress")
    public ResponseEntity<Map<String, Object>> estadisticasIpress(@RequestParam(defaultValue = "10") Integer limit) {
        try {
            log.info("🏥 [MODULO 107] GET /estadisticas-ipress?limit={}", limit);

            List<EstadisticasIpress107DTO> stats = service.obtenerEstadisticasIpress(limit);

            Map<String, Object> response = new HashMap<>();
            response.put("estadisticas", stats);
            response.put("limite", limit);
            response.put("total", stats.size());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ [MODULO 107] Error al obtener estadísticas IPRESS: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                Map.of("error", "Error al obtener estadísticas IPRESS", "mensaje", e.getMessage())
            );
        }
    }

    /**
     * GET /api/atenciones-clinicas-107/estadisticas-especialidad
     * Obtener estadísticas por especialidad (derivación interna)
     */
    @GetMapping("/estadisticas-especialidad")
    public ResponseEntity<Map<String, Object>> estadisticasEspecialidad() {
        try {
            log.info("🩺 [MODULO 107] GET /estadisticas-especialidad");

            List<EstadisticasEspecialidad107DTO> stats = service.obtenerEstadisticasEspecialidad();

            Map<String, Object> response = new HashMap<>();
            response.put("estadisticas", stats);
            response.put("total", stats.size());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ [MODULO 107] Error al obtener estadísticas especialidad: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                Map.of("error", "Error al obtener estadísticas especialidad", "mensaje", e.getMessage())
            );
        }
    }

    /**
     * GET /api/atenciones-clinicas-107/estadisticas-tipo-cita
     * Obtener estadísticas por tipo de cita
     */
    @GetMapping("/estadisticas-tipo-cita")
    public ResponseEntity<Map<String, Object>> estadisticasTipoCita() {
        try {
            log.info("📞 [MODULO 107] GET /estadisticas-tipo-cita");

            List<EstadisticasTipoCita107DTO> stats = service.obtenerEstadisticasTipoCita();

            Map<String, Object> response = new HashMap<>();
            response.put("estadisticas", stats);
            response.put("total", stats.size());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ [MODULO 107] Error al obtener estadísticas tipo cita: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                Map.of("error", "Error al obtener estadísticas tipo cita", "mensaje", e.getMessage())
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


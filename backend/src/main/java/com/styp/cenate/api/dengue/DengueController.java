package com.styp.cenate.api.dengue;

import com.styp.cenate.dto.dengue.DengueImportResultDTO;
import com.styp.cenate.model.bolsas.SolicitudBolsa;
import com.styp.cenate.service.dengue.DengueService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

/**
 * REST Controller para gestión de casos Dengue
 *
 * @version 1.0.0
 * @since 2026-01-29
 */
@RestController
@RequestMapping("/api/dengue")
@Slf4j
@CrossOrigin(
        origins = {
                "http://localhost:3000",
                "http://localhost:5173",
                "http://10.0.89.239:3000"
        },
        allowedHeaders = "*",
        allowCredentials = "true"
)
public class DengueController {

    private final DengueService dengueService;

    public DengueController(DengueService dengueService) {
        this.dengueService = dengueService;
        log.info("✅✅✅ DengueController inicializado exitosamente ✅✅✅");
    }

    @PostMapping("/cargar-excel")
    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINADOR')")
    public ResponseEntity<?> cargarExcelDengue(
            @RequestParam MultipartFile archivo,
            @RequestParam Long usuarioId
    ) {
        log.info("📥 POST /api/dengue/cargar-excel - Usuario: {}, Archivo: {}",
                usuarioId, archivo.getOriginalFilename());

        try {
            if (archivo.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Archivo no puede estar vacío"));
            }

            if (!archivo.getOriginalFilename().endsWith(".xlsx")) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Solo se aceptan archivos .xlsx"));
            }

            DengueImportResultDTO resultado = dengueService.cargarExcelDengue(archivo, usuarioId);

            if (!resultado.getExitoso()) {
                log.warn("⚠️  Carga con errores: {}", resultado.getMensajesError());
                return ResponseEntity.badRequest().body(resultado);
            }

            log.info("✅ Carga exitosa: {} insertados, {} actualizados, {} errores",
                    resultado.getInsertados(), resultado.getActualizados(), resultado.getErrores());

            return ResponseEntity.ok(resultado);

        } catch (Exception e) {
            log.error("❌ Error cargando Excel", e);
            return ResponseEntity.status(500)
                    .body(Map.of(
                            "error", "Error procesando archivo",
                            "detalles", e.getMessage()
                    ));
        }
    }

    @GetMapping("/casos")
    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINADOR', 'MEDICO')")
    public ResponseEntity<?> listarCasosDengue(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size,
            @RequestParam(defaultValue = "fechaSolicitud") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection
    ) {
        log.info("📋 GET /api/dengue/casos - page={}, size={}", page, size);

        try {
            Sort.Direction direction = "ASC".equalsIgnoreCase(sortDirection)
                    ? Sort.Direction.ASC
                    : Sort.Direction.DESC;

            Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
            Page<SolicitudBolsa> casos = dengueService.listarCasosDengue(pageable);

            log.info("✅ {} casos encontrados", casos.getTotalElements());
            return ResponseEntity.ok(casos);

        } catch (Exception e) {
            log.error("❌ Error listando casos", e);
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Error listando casos: " + e.getMessage()));
        }
    }

    @GetMapping("/buscar")
    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINADOR', 'MEDICO')")
    public ResponseEntity<?> buscarCasosDengue(
            @RequestParam(required = false) String dni,
            @RequestParam(required = false) String dxMain,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size,
            @RequestParam(defaultValue = "fechaSolicitud") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection
    ) {
        log.info("🔍 GET /api/dengue/buscar - dni={}, dxMain={}", dni, dxMain);

        try {
            Sort.Direction direction = "ASC".equalsIgnoreCase(sortDirection)
                    ? Sort.Direction.ASC
                    : Sort.Direction.DESC;

            Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
            Page<SolicitudBolsa> resultados = dengueService.buscarCasosDengue(dni, dxMain, pageable);

            log.info("✅ {} casos encontrados", resultados.getTotalElements());
            return ResponseEntity.ok(resultados);

        } catch (Exception e) {
            log.error("❌ Error buscando casos", e);
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Error buscando casos: " + e.getMessage()));
        }
    }

    @GetMapping("/estadisticas")
    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINADOR')")
    public ResponseEntity<?> obtenerEstadisticas() {
        log.info("📊 GET /api/dengue/estadisticas");

        try {
            Map<String, Object> stats = new HashMap<>();
            stats.put("mensaje", "Estadísticas no implementadas aún");

            return ResponseEntity.ok(stats);

        } catch (Exception e) {
            log.error("❌ Error obteniendo estadísticas", e);
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Error obteniendo estadísticas"));
        }
    }
}

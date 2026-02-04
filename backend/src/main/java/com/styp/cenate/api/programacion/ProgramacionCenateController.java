package com.styp.cenate.api.programacion;

import com.styp.cenate.dto.ProgramacionCenateResumenDTO;
import com.styp.cenate.service.programacion.ProgramacionCenateService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * Controlador REST para el modulo de Programacion CENATE.
 * Proporciona datos consolidados de las solicitudes de turnos.
 * Base URL: /api/programacion-cenate
 */
@RestController
@RequestMapping("/api/programacion-cenate")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://10.0.89.241:5173",
        "http://10.0.89.239:5173"
})
public class ProgramacionCenateController {

    private final ProgramacionCenateService programacionService;

    // ============================================================
    // Resumen general
    // ============================================================

    /**
     * Obtiene el resumen general de todos los periodos
     */
    @GetMapping("/resumen")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORDINADOR')")
    public ResponseEntity<List<ProgramacionCenateResumenDTO>> obtenerResumenGeneral() {
        log.info("Obteniendo resumen general de programacion CENATE");
        return ResponseEntity.ok(programacionService.obtenerResumenGeneral());
    }

    // ============================================================
    // Detalle por periodo
    // ============================================================

    /**
     * Obtiene el resumen consolidado de un periodo especifico
     */
    @GetMapping("/periodo/{idPeriodo}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORDINADOR')")
    public ResponseEntity<ProgramacionCenateResumenDTO> obtenerResumenPorPeriodo(@PathVariable Long idPeriodo) {
        log.info("Obteniendo resumen del periodo: {}", idPeriodo);
        return ResponseEntity.ok(programacionService.obtenerResumenPorPeriodo(idPeriodo));
    }

    /**
     * Alias para estadisticas detalladas (mismo endpoint que periodo)
     */
    @GetMapping("/estadisticas/{idPeriodo}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORDINADOR')")
    public ResponseEntity<ProgramacionCenateResumenDTO> obtenerEstadisticas(@PathVariable Long idPeriodo) {
        log.info("Obteniendo estadisticas del periodo: {}", idPeriodo);
        return ResponseEntity.ok(programacionService.obtenerResumenPorPeriodo(idPeriodo));
    }

    // ============================================================
    // Exportacion
    // ============================================================

    /**
     * Exporta los datos de un periodo a CSV
     */
    @GetMapping("/exportar/{idPeriodo}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORDINADOR')")
    public ResponseEntity<byte[]> exportarCsv(@PathVariable Long idPeriodo) {
        log.info("Exportando datos del periodo {} a CSV", idPeriodo);

        String csvContent = programacionService.exportarCsv(idPeriodo);
        byte[] csvBytes = csvContent.getBytes(StandardCharsets.UTF_8);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv; charset=UTF-8"));
        headers.setContentDispositionFormData("attachment", "programacion_cenate_" + idPeriodo + ".csv");
        headers.setContentLength(csvBytes.length);

        return ResponseEntity.ok()
                .headers(headers)
                .body(csvBytes);
    }
}

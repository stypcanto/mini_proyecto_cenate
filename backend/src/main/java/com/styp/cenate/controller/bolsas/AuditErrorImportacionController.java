package com.styp.cenate.controller.bolsas;

import com.styp.cenate.dto.bolsas.AuditErrorDTO;
import com.styp.cenate.service.bolsas.AuditErrorImportacionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 📋 Controller para Auditoría de Errores de Importación
 * Endpoints para consultar, filtrar y exportar errores de importación Excel
 * v1.20.0 - 2026-01-28
 */
@RestController
@RequestMapping("/api/bolsas/errores-importacion")
@Tag(name = "Auditoría de Errores", description = "Gestión de errores de importación")
@Slf4j
@RequiredArgsConstructor
public class AuditErrorImportacionController {

    private final AuditErrorImportacionService service;

    /**
     * GET /api/bolsas/errores-importacion
     * Obtiene todos los errores de importación registrados
     *
     * @return Lista de errores en JSON
     */
    @GetMapping
    @Operation(summary = "Obtener todos los errores de importación")
    public ResponseEntity<List<AuditErrorDTO>> obtenerTodos() {
        log.info("GET /api/bolsas/errores-importacion - Obtener todos los errores");
        List<AuditErrorDTO> errores = service.obtenerTodosLosErrores();
        return ResponseEntity.ok(errores);
    }

    /**
     * GET /api/bolsas/errores-importacion/por-carga/{idCarga}
     * Obtiene errores filtrados por carga específica
     *
     * @param idCarga ID del historial de carga
     * @return Lista de errores para esa carga
     */
    @GetMapping("/por-carga/{idCarga}")
    @Operation(summary = "Obtener errores por carga específica")
    public ResponseEntity<List<AuditErrorDTO>> obtenerPorCarga(@PathVariable Long idCarga) {
        log.info("GET /api/bolsas/errores-importacion/por-carga/{} - Obtener errores", idCarga);
        List<AuditErrorDTO> errores = service.obtenerErroresPorCarga(idCarga);
        return ResponseEntity.ok(errores);
    }

    /**
     * GET /api/bolsas/errores-importacion/resumen/{idCarga}
     * Obtiene resumen de errores por tipo para una carga
     *
     * @param idCarga ID del historial de carga
     * @return Map con conteo de errores por tipo
     */
    @GetMapping("/resumen/{idCarga}")
    @Operation(summary = "Obtener resumen de errores por carga")
    public ResponseEntity<Map<String, Long>> obtenerResumen(@PathVariable Long idCarga) {
        log.info("GET /api/bolsas/errores-importacion/resumen/{} - Obtener resumen", idCarga);
        Map<String, Long> resumen = service.contarErroresPorTipo(idCarga);
        return ResponseEntity.ok(resumen);
    }

    /**
     * GET /api/bolsas/errores-importacion/exportar
     * Exporta TODOS los errores en formato CSV
     *
     * @return Archivo CSV descargable
     */
    @GetMapping("/exportar")
    @Operation(summary = "Exportar todos los errores a CSV")
    public ResponseEntity<String> exportar() {
        log.info("GET /api/bolsas/errores-importacion/exportar - Exportar a CSV");
        try {
            List<AuditErrorDTO> errores = service.obtenerTodosLosErrores();

            // Construir CSV
            StringBuilder csv = new StringBuilder();
            csv.append("Fila,Tipo Error,DNI Paciente,Nombre Paciente,Especialidad,IPRESS,Descripción del Error\n");

            for (AuditErrorDTO error : errores) {
                csv.append(String.format("%d,%s,%s,%s,%s,%s,%s\n",
                        error.getNumeroFila(),
                        error.getTipoError(),
                        escaparCSV(error.getDniPaciente()),
                        escaparCSV(error.getNombrePaciente()),
                        escaparCSV(error.getEspecialidad()),
                        escaparCSV(error.getIpress()),
                        escaparCSV(error.getDescripcionError())
                ));
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType("text/csv; charset=utf-8"))
                    .header("Content-Disposition", "attachment; filename=errores-importacion.csv")
                    .body(csv.toString());

        } catch (Exception e) {
            log.error("Error exportando errores a CSV: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * GET /api/bolsas/errores-importacion/exportar/{idCarga}
     * Exporta errores de una carga específica en formato CSV
     *
     * @param idCarga ID del historial de carga
     * @return Archivo CSV descargable
     */
    @GetMapping("/exportar/{idCarga}")
    @Operation(summary = "Exportar errores de una carga a CSV")
    public ResponseEntity<String> exportarPorCarga(@PathVariable Long idCarga) {
        log.info("GET /api/bolsas/errores-importacion/exportar/{} - Exportar a CSV", idCarga);
        try {
            List<AuditErrorDTO> errores = service.obtenerErroresPorCarga(idCarga);

            // Construir CSV
            StringBuilder csv = new StringBuilder();
            csv.append("Fila,Tipo Error,DNI Paciente,Nombre Paciente,Especialidad,IPRESS,Descripción del Error\n");

            for (AuditErrorDTO error : errores) {
                csv.append(String.format("%d,%s,%s,%s,%s,%s,%s\n",
                        error.getNumeroFila(),
                        error.getTipoError(),
                        escaparCSV(error.getDniPaciente()),
                        escaparCSV(error.getNombrePaciente()),
                        escaparCSV(error.getEspecialidad()),
                        escaparCSV(error.getIpress()),
                        escaparCSV(error.getDescripcionError())
                ));
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType("text/csv; charset=utf-8"))
                    .header("Content-Disposition", "attachment; filename=errores-importacion-carga-" + idCarga + ".csv")
                    .body(csv.toString());

        } catch (Exception e) {
            log.error("Error exportando errores a CSV para carga {}: {}", idCarga, e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Helper para escapar valores CSV
     */
    private String escaparCSV(String valor) {
        if (valor == null) return "";
        if (valor.contains(",") || valor.contains("\"") || valor.contains("\n")) {
            return "\"" + valor.replace("\"", "\"\"") + "\"";
        }
        return valor;
    }
}

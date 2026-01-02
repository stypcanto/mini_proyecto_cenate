package com.styp.cenate.api.form107;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.styp.cenate.repository.form107.Bolsa107ItemRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 📋 Bolsa107Controller - Gestión de pacientes de la Bolsa 107
 *
 * Endpoints para listar, filtrar y gestionar pacientes importados
 * desde archivos Excel (Formulario 107 - CENATE)
 */
@RestController
@RequestMapping("/api/bolsa107")
@RequiredArgsConstructor
@Slf4j
public class Bolsa107Controller {

    private final Bolsa107ItemRepository itemRepository;

    /**
     * Listar todos los pacientes de la Bolsa 107
     *
     * @return Lista de pacientes con todos sus datos
     */
    @GetMapping("/pacientes")
    public ResponseEntity<?> listarPacientes() {
        log.info("📋 Listando todos los pacientes de la Bolsa 107");

        try {
            List<Map<String, Object>> pacientes = itemRepository.findAll()
                .stream()
                .map(item -> Map.of(
                    "id_item", item.getIdItem(),
                    "registro", item.getRegistro(),
                    "numero_documento", item.getNumeroDocumento() != null ? item.getNumeroDocumento() : "",
                    "paciente", item.getPaciente() != null ? item.getPaciente() : "",
                    "sexo", item.getSexo() != null ? item.getSexo() : "",
                    "telefono", item.getTelefono() != null ? item.getTelefono() : "",
                    "fecha_nacimiento", item.getFechaNacimiento() != null ? item.getFechaNacimiento().toString() : "",
                    "departamento", item.getDepartamento() != null ? item.getDepartamento() : "",
                    "provincia", item.getProvincia() != null ? item.getProvincia() : "",
                    "distrito", item.getDistrito() != null ? item.getDistrito() : "",
                    "afiliacion", item.getAfiliacion() != null ? item.getAfiliacion() : "",
                    "derivacion_interna", item.getDerivacionInterna() != null ? item.getDerivacionInterna() : "",
                    "motivo_llamada", item.getMotivoLlamada() != null ? item.getMotivoLlamada() : "",
                    "id_carga", item.getIdCarga() != null ? item.getIdCarga() : 0L
                ))
                .collect(Collectors.toList());

            log.info("✅ Retornando {} pacientes de la Bolsa 107", pacientes.size());

            return ResponseEntity.ok(pacientes);

        } catch (Exception e) {
            log.error("❌ Error al listar pacientes de Bolsa 107: ", e);
            return ResponseEntity.badRequest()
                .body(Map.of(
                    "error", "Error al cargar pacientes",
                    "message", e.getMessage()
                ));
        }
    }

    /**
     * Listar pacientes filtrados por derivación interna
     *
     * @param derivacion Derivación interna (PSICOLOGIA CENATE, MEDICINA CENATE, etc.)
     * @return Lista de pacientes filtrados
     */
    @GetMapping("/pacientes/por-derivacion")
    public ResponseEntity<?> listarPorDerivacion(
            @RequestParam(value = "derivacion", required = false) String derivacion) {

        log.info("📋 Listando pacientes por derivación: {}", derivacion);

        try {
            List<Map<String, Object>> pacientes;

            if (derivacion != null && !derivacion.isBlank()) {
                pacientes = itemRepository.findAll()
                    .stream()
                    .filter(item -> derivacion.equalsIgnoreCase(item.getDerivacionInterna()))
                    .map(item -> Map.of(
                        "id_item", item.getIdItem(),
                        "numero_documento", item.getNumeroDocumento() != null ? item.getNumeroDocumento() : "",
                        "paciente", item.getPaciente() != null ? item.getPaciente() : "",
                        "sexo", item.getSexo() != null ? item.getSexo() : "",
                        "telefono", item.getTelefono() != null ? item.getTelefono() : "",
                        "departamento", item.getDepartamento() != null ? item.getDepartamento() : "",
                        "derivacion_interna", item.getDerivacionInterna() != null ? item.getDerivacionInterna() : ""
                    ))
                    .collect(Collectors.toList());
            } else {
                // Sin filtro, retornar todos
                pacientes = itemRepository.findAll()
                    .stream()
                    .map(item -> Map.of(
                        "id_item", item.getIdItem(),
                        "numero_documento", item.getNumeroDocumento() != null ? item.getNumeroDocumento() : "",
                        "paciente", item.getPaciente() != null ? item.getPaciente() : "",
                        "derivacion_interna", item.getDerivacionInterna() != null ? item.getDerivacionInterna() : ""
                    ))
                    .collect(Collectors.toList());
            }

            log.info("✅ Retornando {} pacientes", pacientes.size());
            return ResponseEntity.ok(pacientes);

        } catch (Exception e) {
            log.error("❌ Error al filtrar pacientes: ", e);
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Obtener estadísticas de la Bolsa 107
     *
     * @return Estadísticas generales (total, por derivación, por ubicación, etc.)
     */
    @GetMapping("/estadisticas")
    public ResponseEntity<?> obtenerEstadisticas() {
        log.info("📊 Obteniendo estadísticas de la Bolsa 107");

        try {
            List<com.styp.cenate.model.form107.Bolsa107Item> items = itemRepository.findAll();

            long total = items.size();
            long psicologia = items.stream()
                .filter(i -> i.getDerivacionInterna() != null &&
                             i.getDerivacionInterna().contains("PSICOLOGIA"))
                .count();
            long medicina = items.stream()
                .filter(i -> i.getDerivacionInterna() != null &&
                             i.getDerivacionInterna().contains("MEDICINA"))
                .count();
            long lima = items.stream()
                .filter(i -> "LIMA".equalsIgnoreCase(i.getDepartamento()))
                .count();
            long provincia = total - lima;

            Map<String, Object> stats = Map.of(
                "total", total,
                "psicologia", psicologia,
                "medicina", medicina,
                "lima", lima,
                "provincia", provincia
            );

            log.info("✅ Estadísticas calculadas: {}", stats);
            return ResponseEntity.ok(stats);

        } catch (Exception e) {
            log.error("❌ Error al calcular estadísticas: ", e);
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        }
    }
}

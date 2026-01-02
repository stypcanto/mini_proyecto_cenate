package com.styp.cenate.api.form107;

import java.time.ZonedDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.styp.cenate.model.Usuario;
import com.styp.cenate.model.form107.Bolsa107Item;
import com.styp.cenate.repository.UsuarioRepository;
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
    private final UsuarioRepository usuarioRepository;

    /**
     * Helper method: Convertir Bolsa107Item a Map
     */
    private Map<String, Object> itemToMap(Bolsa107Item item) {
        Map<String, Object> map = new HashMap<>();
        map.put("id_item", item.getIdItem());
        map.put("registro", item.getRegistro());
        map.put("numero_documento", item.getNumeroDocumento() != null ? item.getNumeroDocumento() : "");
        map.put("paciente", item.getPaciente() != null ? item.getPaciente() : "");
        map.put("sexo", item.getSexo() != null ? item.getSexo() : "");
        map.put("telefono", item.getTelefono() != null ? item.getTelefono() : "");
        map.put("fecha_nacimiento", item.getFechaNacimiento() != null ? item.getFechaNacimiento().toString() : "");
        map.put("departamento", item.getDepartamento() != null ? item.getDepartamento() : "");
        map.put("provincia", item.getProvincia() != null ? item.getProvincia() : "");
        map.put("distrito", item.getDistrito() != null ? item.getDistrito() : "");
        map.put("afiliacion", item.getAfiliacion() != null ? item.getAfiliacion() : "");
        map.put("derivacion_interna", item.getDerivacionInterna() != null ? item.getDerivacionInterna() : "");
        map.put("motivo_llamada", item.getMotivoLlamada() != null ? item.getMotivoLlamada() : "");
        map.put("id_carga", item.getIdCarga() != null ? item.getIdCarga() : 0L);
        return map;
    }

    /**
     * Listar todos los pacientes de la Bolsa 107 con información de IPRESS
     *
     * @return Lista de pacientes con todos sus datos incluyendo IPRESS
     */
    @GetMapping("/pacientes")
    public ResponseEntity<?> listarPacientes() {
        log.info("📋 Listando todos los pacientes de la Bolsa 107 con información de IPRESS");

        try {
            List<Map<String, Object>> pacientes = itemRepository.findAllWithIpress();

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
                    .map(item -> {
                        Map<String, Object> map = new HashMap<>();
                        map.put("id_item", item.getIdItem());
                        map.put("numero_documento", item.getNumeroDocumento() != null ? item.getNumeroDocumento() : "");
                        map.put("paciente", item.getPaciente() != null ? item.getPaciente() : "");
                        map.put("sexo", item.getSexo() != null ? item.getSexo() : "");
                        map.put("telefono", item.getTelefono() != null ? item.getTelefono() : "");
                        map.put("departamento", item.getDepartamento() != null ? item.getDepartamento() : "");
                        map.put("derivacion_interna", item.getDerivacionInterna() != null ? item.getDerivacionInterna() : "");
                        return map;
                    })
                    .collect(Collectors.toList());
            } else {
                // Sin filtro, retornar todos
                pacientes = itemRepository.findAll()
                    .stream()
                    .map(item -> {
                        Map<String, Object> map = new HashMap<>();
                        map.put("id_item", item.getIdItem());
                        map.put("numero_documento", item.getNumeroDocumento() != null ? item.getNumeroDocumento() : "");
                        map.put("paciente", item.getPaciente() != null ? item.getPaciente() : "");
                        map.put("derivacion_interna", item.getDerivacionInterna() != null ? item.getDerivacionInterna() : "");
                        return map;
                    })
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

    /**
     * Asignar un paciente de Bolsa 107 a un admisionista
     *
     * @param request Map con id_item y id_admisionista
     * @return Resultado de la asignación
     */
    @PostMapping("/asignar-admisionista")
    public ResponseEntity<?> asignarAdmisionista(@RequestBody Map<String, Object> request) {
        log.info("👤 Asignando paciente a admisionista");

        try {
            // Extraer parámetros
            Long idItem = request.get("id_item") != null
                ? Long.parseLong(request.get("id_item").toString())
                : null;
            Long idAdmisionista = request.get("id_admisionista") != null
                ? Long.parseLong(request.get("id_admisionista").toString())
                : null;

            if (idItem == null || idAdmisionista == null) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Parámetros inválidos: id_item e id_admisionista son obligatorios"));
            }

            // Buscar paciente
            Bolsa107Item item = itemRepository.findById(idItem)
                .orElseThrow(() -> new RuntimeException("Paciente no encontrado"));

            // Buscar admisionista
            Usuario admisionista = usuarioRepository.findById(idAdmisionista)
                .orElseThrow(() -> new RuntimeException("Admisionista no encontrado"));

            // Asignar
            item.setIdAdmisionistaAsignado(idAdmisionista);
            item.setFechaAsignacionAdmisionista(ZonedDateTime.now());
            itemRepository.save(item);

            log.info("✅ Paciente {} asignado a admisionista {}",
                item.getPaciente(), admisionista.getNameUser());

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Paciente asignado correctamente",
                "paciente", item.getPaciente(),
                "admisionista", admisionista.getNameUser()
            ));

        } catch (Exception e) {
            log.error("❌ Error al asignar paciente: ", e);
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Obtener pacientes asignados al admisionista logueado
     *
     * @return Lista de pacientes asignados
     */
    @GetMapping("/mis-asignaciones")
    public ResponseEntity<?> obtenerMisAsignaciones() {
        log.info("📋 Obteniendo pacientes asignados al admisionista logueado");

        try {
            // Obtener usuario logueado
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String username = auth.getName();

            Usuario usuario = usuarioRepository.findByNameUser(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            // Obtener pacientes asignados
            List<Map<String, Object>> pacientes = itemRepository.findAllWithIpress()
                .stream()
                .filter(p -> {
                    Object idAdmisionista = p.get("id_admisionista_asignado");
                    return idAdmisionista != null &&
                           idAdmisionista.toString().equals(usuario.getIdUser().toString());
                })
                .collect(Collectors.toList());

            log.info("✅ Retornando {} pacientes asignados a {}",
                pacientes.size(), usuario.getNameUser());

            return ResponseEntity.ok(pacientes);

        } catch (Exception e) {
            log.error("❌ Error al obtener asignaciones: ", e);
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        }
    }
}

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
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
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
                map.put("fecha_nacimiento",
                                item.getFechaNacimiento() != null ? item.getFechaNacimiento().toString() : "");
                map.put("departamento", item.getDepartamento() != null ? item.getDepartamento() : "");
                map.put("provincia", item.getProvincia() != null ? item.getProvincia() : "");
                map.put("distrito", item.getDistrito() != null ? item.getDistrito() : "");
                map.put("afiliacion", item.getAfiliacion() != null ? item.getAfiliacion() : "");
                map.put("derivacion_interna", item.getDerivacionInterna() != null ? item.getDerivacionInterna() : "");
                map.put("motivo_llamada", item.getMotivoLlamada() != null ? item.getMotivoLlamada() : "");
                map.put("id_carga", item.getIdCarga() != null ? item.getIdCarga() : 0L);
                map.put("tipo_apoyo", item.getTipoApoyo() != null ? item.getTipoApoyo() : "OTROS");
                map.put("fecha_programacion", item.getFechaProgramacion() != null ? item.getFechaProgramacion().toString() : "");
                map.put("turno", item.getTurno() != null ? item.getTurno() : "");
                map.put("profesional", item.getProfesional() != null ? item.getProfesional() : "");
                map.put("dni_profesional", item.getDniProfesional() != null ? item.getDniProfesional() : "");
                map.put("especialidad", item.getEspecialidad() != null ? item.getEspecialidad() : "");
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
                                                        "message", e.getMessage()));
                }
        }

        /**
         * Listar pacientes filtrados por derivación interna
         *
         * @param derivacion Derivación interna (PSICOLOGIA CENATE, MEDICINA CENATE,
         *                   etc.)
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
                                                .filter(item -> derivacion
                                                                .equalsIgnoreCase(item.getDerivacionInterna()))
                                                .map(item -> {
                                                        Map<String, Object> map = new HashMap<>();
                                                        map.put("id_item", item.getIdItem());
                                                        map.put("numero_documento",
                                                                        item.getNumeroDocumento() != null
                                                                                        ? item.getNumeroDocumento()
                                                                                        : "");
                                                        map.put("paciente",
                                                                        item.getPaciente() != null ? item.getPaciente()
                                                                                        : "");
                                                        map.put("sexo", item.getSexo() != null ? item.getSexo() : "");
                                                        map.put("telefono",
                                                                        item.getTelefono() != null ? item.getTelefono()
                                                                                        : "");
                                                        map.put("departamento",
                                                                        item.getDepartamento() != null
                                                                                        ? item.getDepartamento()
                                                                                        : "");
                                                        map.put("derivacion_interna",
                                                                        item.getDerivacionInterna() != null
                                                                                        ? item.getDerivacionInterna()
                                                                                        : "");
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
                                                        map.put("numero_documento",
                                                                        item.getNumeroDocumento() != null
                                                                                        ? item.getNumeroDocumento()
                                                                                        : "");
                                                        map.put("paciente",
                                                                        item.getPaciente() != null ? item.getPaciente()
                                                                                        : "");
                                                        map.put("derivacion_interna",
                                                                        item.getDerivacionInterna() != null
                                                                                        ? item.getDerivacionInterna()
                                                                                        : "");
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
                                        "provincia", provincia);

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
                                                .body(Map.of("error",
                                                                "Parámetros inválidos: id_item e id_admisionista son obligatorios"));
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
                                        "admisionista", admisionista.getNameUser()));

                } catch (Exception e) {
                        log.error("❌ Error al asignar paciente: ", e);
                        return ResponseEntity.badRequest()
                                        .body(Map.of("error", e.getMessage()));
                }
        }

        /**
         * Asignar un paciente de Bolsa 107 a un gestor de citas
         *
         * @param request Map con id_item y id_gestor
         * @return Resultado de la asignación
         */
        @PostMapping("/asignar-gestor")
        public ResponseEntity<?> asignarGestor(@RequestBody Map<String, Object> request) {
                log.info("👤 Asignando paciente a gestor de citas");

                try {
                        // Extraer parámetros
                        Long idItem = request.get("id_item") != null
                                        ? Long.parseLong(request.get("id_item").toString())
                                        : null;
                        Long idGestor = request.get("id_gestor") != null
                                        ? Long.parseLong(request.get("id_gestor").toString())
                                        : null;

                        if (idItem == null || idGestor == null) {
                                return ResponseEntity.badRequest()
                                                .body(Map.of("error",
                                                                "Parámetros inválidos: id_item e id_gestor son obligatorios"));
                        }

                        // Buscar paciente
                        Bolsa107Item item = itemRepository.findById(idItem)
                                        .orElseThrow(() -> new RuntimeException("Paciente no encontrado"));

                        // Buscar gestor
                        Usuario gestor = usuarioRepository.findById(idGestor)
                                        .orElseThrow(() -> new RuntimeException("Gestor de citas no encontrado"));

                        // Asignar
                        item.setIdGestorAsignado(idGestor);
                        item.setFechaAsignacionGestor(ZonedDateTime.now());
                        itemRepository.save(item);

                        log.info("✅ Paciente {} asignado a gestor de citas {}",
                                        item.getPaciente(), gestor.getNameUser());

                        return ResponseEntity.ok(Map.of(
                                        "success", true,
                                        "message", "Paciente asignado correctamente al gestor de citas",
                                        "paciente", item.getPaciente(),
                                        "gestor", gestor.getNameUser()));

                } catch (Exception e) {
                        log.error("❌ Error al asignar paciente a gestor: ", e);
                        return ResponseEntity.badRequest()
                                        .body(Map.of("error", e.getMessage()));
                }
        }

        /**
         * Desasignar gestor de citas de un paciente
         *
         * @param request Map con id_item
         * @return Resultado de la operación
         */
        @PostMapping("/desasignar-gestor")
        public ResponseEntity<?> desasignarGestor(@RequestBody Map<String, Object> request) {
                log.info("🗑️ Desasignando gestor de citas de paciente");

                try {
                        Long idItem = request.get("id_item") != null
                                        ? Long.parseLong(request.get("id_item").toString())
                                        : null;

                        if (idItem == null) {
                                return ResponseEntity.badRequest()
                                                .body(Map.of("error", "Parámetros inválidos: id_item es obligatorio"));
                        }

                        Bolsa107Item item = itemRepository.findById(idItem)
                                        .orElseThrow(() -> new RuntimeException("Paciente no encontrado"));

                        item.setIdGestorAsignado(null);
                        item.setFechaAsignacionGestor(null);
                        itemRepository.save(item);

                        log.info("✅ Gestor desasignado del paciente {}", item.getPaciente());

                        return ResponseEntity.ok(Map.of(
                                        "success", true,
                                        "message", "Asignación eliminada correctamente"));

                } catch (Exception e) {
                        log.error("❌ Error al desasignar gestor: ", e);
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
                                                                idAdmisionista.toString()
                                                                                .equals(usuario.getIdUser().toString());
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

        /**
         * Obtener pacientes asignados al gestor de citas logueado
         *
         * @return Lista de pacientes asignados al gestor
         */
        @GetMapping("/mis-pacientes-gestor")
        public ResponseEntity<?> obtenerMisPacientesGestor() {
                log.info("📋 Obteniendo pacientes asignados al gestor de citas logueado");

                try {
                        // Obtener usuario logueado
                        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                        String username = auth.getName();

                        Usuario usuario = usuarioRepository.findByNameUser(username)
                                        .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

                        // Obtener pacientes asignados al gestor
                        List<Map<String, Object>> pacientes = itemRepository.findAllWithIpress()
                                        .stream()
                                        .filter(p -> {
                                                Object idGestor = p.get("id_gestor_asignado");
                                                return idGestor != null &&
                                                                idGestor.toString()
                                                                                .equals(usuario.getIdUser().toString());
                                        })
                                        .collect(Collectors.toList());

                        log.info("✅ Retornando {} pacientes asignados al gestor {}",
                                        pacientes.size(), usuario.getNameUser());

                        return ResponseEntity.ok(pacientes);

                } catch (Exception e) {
                        log.error("❌ Error al obtener pacientes del gestor: ", e);
                        return ResponseEntity.badRequest()
                                        .body(Map.of("error", e.getMessage()));
                }
        }

        /**
         * Obtener estadísticas del dashboard para el gestor de citas logueado
         *
         * @return Estadísticas resumidas de pacientes asignados
         */
        @GetMapping("/estadisticas-gestor")
        public ResponseEntity<?> obtenerEstadisticasGestor() {
                log.info("📊 Obteniendo estadísticas de dashboard para gestor de citas");

                try {
                        // Obtener usuario logueado
                        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                        String username = auth.getName();

                        Usuario usuario = usuarioRepository.findByNameUser(username)
                                        .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

                        // Obtener todos los pacientes asignados al gestor
                        List<Map<String, Object>> pacientes = itemRepository.findAllWithIpress()
                                        .stream()
                                        .filter(p -> {
                                                Object idGestor = p.get("id_gestor_asignado");
                                                return idGestor != null &&
                                                                idGestor.toString()
                                                                                .equals(usuario.getIdUser().toString());
                                        })
                                        .collect(Collectors.toList());

                        // Calcular estadísticas
                        long totalPacientes = pacientes.size();

                        // Por derivación
                        long psicologia = pacientes.stream()
                                        .filter(p -> {
                                                String derivacion = (String) p.get("derivacion_interna");
                                                return derivacion != null
                                                                && derivacion.toUpperCase().contains("PSICOLOGIA");
                                        })
                                        .count();

                        long medicina = pacientes.stream()
                                        .filter(p -> {
                                                String derivacion = (String) p.get("derivacion_interna");
                                                return derivacion != null
                                                                && derivacion.toUpperCase().contains("MEDICINA");
                                        })
                                        .count();

                        long nutricion = pacientes.stream()
                                        .filter(p -> {
                                                String derivacion = (String) p.get("derivacion_interna");
                                                return derivacion != null
                                                                && derivacion.toUpperCase().contains("NUTRICION");
                                        })
                                        .count();

                        // Por ubicación
                        long lima = pacientes.stream()
                                        .filter(p -> {
                                                String departamento = (String) p.get("departamento");
                                                return departamento != null
                                                                && departamento.toUpperCase().contains("LIMA");
                                        })
                                        .count();

                        long provincia = totalPacientes - lima;

                        // Pacientes recientes (últimos 5 asignados)
                        List<Map<String, Object>> pacientesRecientes = pacientes.stream()
                                        .sorted((p1, p2) -> {
                                                Object fecha1 = p1.get("fecha_asignacion_gestor");
                                                Object fecha2 = p2.get("fecha_asignacion_gestor");
                                                if (fecha1 == null)
                                                        return 1;
                                                if (fecha2 == null)
                                                        return -1;
                                                return fecha2.toString().compareTo(fecha1.toString());
                                        })
                                        .limit(5)
                                        .map(p -> {
                                                Map<String, Object> pacienteSimple = new HashMap<>();
                                                pacienteSimple.put("numero_documento", p.get("numero_documento"));
                                                pacienteSimple.put("paciente", p.get("paciente"));
                                                pacienteSimple.put("derivacion_interna", p.get("derivacion_interna"));
                                                pacienteSimple.put("fecha_asignacion_gestor",
                                                                p.get("fecha_asignacion_gestor"));
                                                return pacienteSimple;
                                        })
                                        .collect(Collectors.toList());

                        // Construir respuesta
                        Map<String, Object> estadisticas = new HashMap<>();
                        estadisticas.put("totalPacientes", totalPacientes);
                        estadisticas.put("porDerivacion", Map.of(
                                        "psicologia", psicologia,
                                        "medicina", medicina,
                                        "nutricion", nutricion));
                        estadisticas.put("porUbicacion", Map.of(
                                        "lima", lima,
                                        "provincia", provincia));
                        estadisticas.put("pacientesRecientes", pacientesRecientes);

                        // Por ahora todos los pacientes están en estado "Pendiente"
                        // ya que no se ha implementado el tracking de estado en BD
                        estadisticas.put("porEstado", Map.of(
                                        "pendiente", totalPacientes,
                                        "citado", 0L,
                                        "atendido", 0L,
                                        "noContactado", 0L,
                                        "reprogramacionFallida", 0L));

                        log.info("✅ Estadísticas calculadas: {} pacientes totales para gestor {}",
                                        totalPacientes, usuario.getNameUser());

                        return ResponseEntity.ok(estadisticas);

                } catch (Exception e) {
                        log.error("❌ Error al obtener estadísticas del gestor: ", e);
                        return ResponseEntity.badRequest()
                                        .body(Map.of("error", e.getMessage()));
                }
        }

        /**
         * Obtener lista de profesionales de salud del área asistencial
         *
         * @return Lista de profesionales activos
         */
        @GetMapping("/profesionales-salud")
        public ResponseEntity<?> obtenerProfesionalesSalud() {
                log.info("📋 Obteniendo lista de profesionales de salud del área asistencial");

                try {
                        List<Map<String, Object>> profesionales = itemRepository.findProfesionalesSaludActivos();

                        log.info("✅ Retornando {} profesionales de salud", profesionales.size());

                        return ResponseEntity.ok(profesionales);

                } catch (Exception e) {
                        log.error("❌ Error al obtener profesionales de salud: ", e);
                        return ResponseEntity.badRequest()
                                        .body(Map.of("error", e.getMessage()));
                }
        }

        /**
         * Actualizar datos del paciente (teléfono y observaciones)
         *
         * @param idItem ID del item en bolsa_107_item
         * @param datos  Datos a actualizar
         * @return Respuesta con el item actualizado
         */
        @PutMapping("/paciente/{idItem}")
        public ResponseEntity<?> actualizarPaciente(
                        @PathVariable Long idItem,
                        @RequestBody Map<String, Object> datos) {
                log.info("📝 Actualizando datos del paciente ID: {}", idItem);

                try {
                        // Buscar el item
                        Bolsa107Item item = itemRepository.findById(idItem)
                                        .orElseThrow(() -> new RuntimeException("Paciente no encontrado"));

                        // Actualizar campos permitidos
                        if (datos.containsKey("telefono")) {
                                String telefono = (String) datos.get("telefono");
                                item.setTelefono(telefono);
                                log.info("  → Teléfono actualizado: {}", telefono);
                        }

                        if (datos.containsKey("telCelular")) {
                                String telCelular = (String) datos.get("telCelular");
                                item.setTelCelular(telCelular);
                                log.info("  → Teléfono celular actualizado: {}", telCelular);
                        }

                        if (datos.containsKey("correoElectronico")) {
                                String correo = (String) datos.get("correoElectronico");
                                item.setCorreoElectronico(correo);
                                log.info("  → Correo electrónico actualizado: {}", correo);
                        }

                        if (datos.containsKey("codIpress")) {
                                String codIpress = (String) datos.get("codIpress");
                                item.setCodIpress(codIpress);
                                log.info("  → IPRESS actualizado: {}", codIpress);
                        }

                        if (datos.containsKey("observaciones")) {
                                String observaciones = (String) datos.get("observaciones");
                                item.setObservacionGestion(observaciones);
                                log.info("  → Observaciones actualizadas");
                        }

                        if (datos.containsKey("tipoApoyo")) {
                                String tipoApoyo = (String) datos.get("tipoApoyo");
                                item.setTipoApoyo(tipoApoyo);
                                log.info("  → Tipo de apoyo actualizado: {}", tipoApoyo);
                        }

                        if (datos.containsKey("fecha_programacion")) {
                                String fechaStr = (String) datos.get("fecha_programacion");
                                if (fechaStr != null && !fechaStr.isBlank()) {
                                        item.setFechaProgramacion(java.time.LocalDate.parse(fechaStr));
                                        log.info("  → Fecha de programación actualizada: {}", fechaStr);
                                } else {
                                        item.setFechaProgramacion(null);
                                }
                        }

                        if (datos.containsKey("turno")) {
                                String turno = (String) datos.get("turno");
                                item.setTurno(turno);
                                log.info("  → Turno actualizado: {}", turno);
                        }

                        if (datos.containsKey("profesional")) {
                                String profesional = (String) datos.get("profesional");
                                item.setProfesional(profesional);
                                log.info("  → Profesional actualizado: {}", profesional);
                        }

                        if (datos.containsKey("dni_profesional")) {
                                String dniProfesional = (String) datos.get("dni_profesional");
                                item.setDniProfesional(dniProfesional);
                                log.info("  → DNI profesional actualizado: {}", dniProfesional);
                        }

                        if (datos.containsKey("especialidad")) {
                                String especialidad = (String) datos.get("especialidad");
                                item.setEspecialidad(especialidad);
                                log.info("  → Especialidad actualizada: {}", especialidad);
                        }

                        // Guardar cambios
                        Bolsa107Item itemActualizado = itemRepository.save(item);

                        log.info("✅ Paciente {} actualizado correctamente", item.getPaciente());

                        return ResponseEntity.ok(itemToMap(itemActualizado));

                } catch (Exception e) {
                        log.error("❌ Error al actualizar paciente: ", e);
                        return ResponseEntity.badRequest()
                                        .body(Map.of("error", e.getMessage()));
                }
        }
}

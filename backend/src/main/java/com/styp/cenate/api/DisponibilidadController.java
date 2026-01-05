package com.styp.cenate.api;

import com.styp.cenate.dto.*;
import com.styp.cenate.security.mbac.CheckMBACPermission;
// import com.styp.cenate.service.auditlog.AuditLogService; // TODO: Descomentar cuando se implemente
import com.styp.cenate.service.disponibilidad.IDisponibilidadMedicaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controlador REST para gestión de disponibilidad médica.
 * Incluye CRUD, flujo de estados, sincronización con chatbot y reportes.
 *
 * @author Ing. Styp Canto Rondón
 * @version 2.0.0
 * @since 2026-01-03
 */
@RestController
@RequestMapping("/api/disponibilidad")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class DisponibilidadController {

    private final IDisponibilidadMedicaService disponibilidadService;
    // private final AuditLogService auditLogService; // TODO: Descomentar cuando se implemente

    // ==========================================================
    // 📝 CRUD Básico
    // ==========================================================

    /**
     * Crear nueva disponibilidad médica
     *
     * POST /api/disponibilidad
     */
    @CheckMBACPermission(pagina = "/medico/disponibilidad", accion = "crear")
    @PostMapping
    public ResponseEntity<Map<String, Object>> crear(@Valid @RequestBody DisponibilidadRequestDTO request) {
        try {
            log.info("📝 Creando nueva disponibilidad médica - Periodo: {}, Servicio: {}",
                request.getPeriodo(), request.getIdServicio());

            DisponibilidadMedicaDTO disponibilidad = disponibilidadService.crear(request);

            // TODO: Implementar auditoría correctamente
            // auditLogService.registrarEvento(...);

            Map<String, Object> response = new HashMap<>();
            response.put("status", HttpStatus.CREATED.value());
            response.put("data", disponibilidad);
            response.put("message", "Disponibilidad médica creada exitosamente");

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (Exception e) {
            log.error("❌ Error al crear disponibilidad: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", HttpStatus.BAD_REQUEST.value());
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Actualizar disponibilidad existente (solo BORRADOR)
     *
     * PUT /api/disponibilidad/{id}
     */
    @CheckMBACPermission(pagina = "/medico/disponibilidad", accion = "editar")
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody DisponibilidadRequestDTO request) {
        try {
            log.info("✏️ Actualizando disponibilidad ID: {}", id);

            DisponibilidadMedicaDTO disponibilidad = disponibilidadService.actualizar(id, request);

            // TODO: Implementar auditoría correctamente
            // auditLogService.registrarEvento(...);

            Map<String, Object> response = new HashMap<>();
            response.put("status", HttpStatus.OK.value());
            response.put("data", disponibilidad);
            response.put("message", "Disponibilidad actualizada exitosamente");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Error al actualizar disponibilidad ID {}: {}", id, e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", HttpStatus.BAD_REQUEST.value());
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Obtener disponibilidad por ID con todos los detalles
     *
     * GET /api/disponibilidad/{id}
     */
    @CheckMBACPermission(pagina = "/medico/disponibilidad", accion = "ver")
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> obtenerPorId(@PathVariable Long id) {
        try {
            log.info("🔍 Consultando disponibilidad ID: {}", id);

            DisponibilidadMedicaDTO disponibilidad = disponibilidadService.obtenerPorId(id);

            Map<String, Object> response = new HashMap<>();
            response.put("status", HttpStatus.OK.value());
            response.put("data", disponibilidad);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Error al consultar disponibilidad ID {}: {}", id, e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", HttpStatus.NOT_FOUND.value());
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
    }

    /**
     * Eliminar disponibilidad (solo BORRADOR)
     *
     * DELETE /api/disponibilidad/{id}
     */
    @CheckMBACPermission(pagina = "/medico/disponibilidad", accion = "eliminar")
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> eliminar(@PathVariable Long id) {
        try {
            log.info("🗑️ Eliminando disponibilidad ID: {}", id);

            disponibilidadService.eliminar(id);

            // TODO: Implementar auditoría correctamente
            // auditLogService.registrarEvento(...);

            Map<String, Object> response = new HashMap<>();
            response.put("status", HttpStatus.OK.value());
            response.put("message", "Disponibilidad eliminada exitosamente");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Error al eliminar disponibilidad ID {}: {}", id, e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", HttpStatus.BAD_REQUEST.value());
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // ==========================================================
    // 📋 Consultas y Listados
    // ==========================================================

    /**
     * Obtener disponibilidades del médico logueado
     *
     * GET /api/disponibilidad/mis-disponibilidades
     */
    @CheckMBACPermission(pagina = "/medico/disponibilidad", accion = "ver")
    @GetMapping("/mis-disponibilidades")
    public ResponseEntity<Map<String, Object>> obtenerMisDisponibilidades(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "periodo") String sortBy,
            @RequestParam(defaultValue = "DESC") String direction) {
        try {
            log.info("📋 Consultando mis disponibilidades - Page: {}, Size: {}", page, size);

            Sort.Direction sortDirection = Sort.Direction.fromString(direction);
            Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));

            Page<DisponibilidadResponseDTO> disponibilidades = disponibilidadService.obtenerMisDisponibilidades(pageable);

            Map<String, Object> response = new HashMap<>();
            response.put("status", HttpStatus.OK.value());
            response.put("data", disponibilidades);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Error al consultar mis disponibilidades: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", HttpStatus.BAD_REQUEST.value());
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Obtener disponibilidades de un médico específico (coordinadores)
     *
     * GET /api/disponibilidad/medico/{idPers}
     */
    @CheckMBACPermission(pagina = "/coordinador/disponibilidad", accion = "ver")
    @GetMapping("/medico/{idPers}")
    public ResponseEntity<Map<String, Object>> obtenerPorMedico(
            @PathVariable Long idPers,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            log.info("👨‍⚕️ Consultando disponibilidades del médico ID: {}", idPers);

            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "periodo"));
            Page<DisponibilidadResponseDTO> disponibilidades = disponibilidadService.obtenerPorMedico(idPers, pageable);

            Map<String, Object> response = new HashMap<>();
            response.put("status", HttpStatus.OK.value());
            response.put("data", disponibilidades);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Error al consultar disponibilidades del médico {}: {}", idPers, e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", HttpStatus.BAD_REQUEST.value());
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Obtener disponibilidades por periodo
     *
     * GET /api/disponibilidad/periodo/{periodo}
     */
    @CheckMBACPermission(pagina = "/coordinador/disponibilidad", accion = "ver")
    @GetMapping("/periodo/{periodo}")
    public ResponseEntity<Map<String, Object>> obtenerPorPeriodo(
            @PathVariable String periodo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            log.info("📅 Consultando disponibilidades del periodo: {}", periodo);

            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "personal.nombreCompleto"));
            Page<DisponibilidadResponseDTO> disponibilidades = disponibilidadService.obtenerPorPeriodo(periodo, pageable);

            Map<String, Object> response = new HashMap<>();
            response.put("status", HttpStatus.OK.value());
            response.put("data", disponibilidades);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Error al consultar disponibilidades del periodo {}: {}", periodo, e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", HttpStatus.BAD_REQUEST.value());
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Obtener disponibilidades por estado
     *
     * GET /api/disponibilidad/estado/{estado}
     */
    @CheckMBACPermission(pagina = "/coordinador/disponibilidad", accion = "ver")
    @GetMapping("/estado/{estado}")
    public ResponseEntity<Map<String, Object>> obtenerPorEstado(
            @PathVariable String estado,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            log.info("🔖 Consultando disponibilidades con estado: {}", estado);

            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "updatedAt"));
            Page<DisponibilidadResponseDTO> disponibilidades = disponibilidadService.obtenerPorEstado(estado, pageable);

            Map<String, Object> response = new HashMap<>();
            response.put("status", HttpStatus.OK.value());
            response.put("data", disponibilidades);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Error al consultar disponibilidades por estado {}: {}", estado, e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", HttpStatus.BAD_REQUEST.value());
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Obtener disponibilidades filtradas por periodo y estado
     *
     * GET /api/disponibilidad/filtrar
     */
    @CheckMBACPermission(pagina = "/coordinador/disponibilidad", accion = "ver")
    @GetMapping("/filtrar")
    public ResponseEntity<Map<String, Object>> obtenerPorPeriodoYEstado(
            @RequestParam String periodo,
            @RequestParam String estado,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            log.info("🔍 Filtrando disponibilidades - Periodo: {}, Estado: {}", periodo, estado);

            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "updatedAt"));
            Page<DisponibilidadResponseDTO> disponibilidades =
                disponibilidadService.obtenerPorPeriodoYEstado(periodo, estado, pageable);

            Map<String, Object> response = new HashMap<>();
            response.put("status", HttpStatus.OK.value());
            response.put("data", disponibilidades);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Error al filtrar disponibilidades: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", HttpStatus.BAD_REQUEST.value());
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // ==========================================================
    // 🔄 Flujo de Estados
    // ==========================================================

    /**
     * Enviar disponibilidad a revisión (BORRADOR → ENVIADO)
     * Valida que cumpla 150 horas mínimas
     *
     * POST /api/disponibilidad/{id}/enviar
     */
    @CheckMBACPermission(pagina = "/medico/disponibilidad", accion = "editar")
    @PostMapping("/{id}/enviar")
    public ResponseEntity<Map<String, Object>> enviarARevision(@PathVariable Long id) {
        try {
            log.info("📤 Enviando a revisión disponibilidad ID: {}", id);

            DisponibilidadMedicaDTO disponibilidad = disponibilidadService.enviarARevision(id);

            // TODO: Implementar auditoría correctamente
            // auditLogService.registrarEvento(...);

            Map<String, Object> response = new HashMap<>();
            response.put("status", HttpStatus.OK.value());
            response.put("data", disponibilidad);
            response.put("message", "Disponibilidad enviada a revisión exitosamente");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Error al enviar disponibilidad ID {}: {}", id, e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", HttpStatus.BAD_REQUEST.value());
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Marcar disponibilidad como revisada (ENVIADO → REVISADO)
     * Solo coordinadores
     *
     * POST /api/disponibilidad/{id}/revisar
     */
    @CheckMBACPermission(pagina = "/coordinador/disponibilidad", accion = "revisar")
    @PostMapping("/{id}/revisar")
    public ResponseEntity<Map<String, Object>> marcarRevisado(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body) {
        try {
            String observaciones = body != null ? body.get("observaciones") : null;
            log.info("✅ Marcando como revisada disponibilidad ID: {}", id);

            DisponibilidadMedicaDTO disponibilidad = disponibilidadService.marcarRevisado(id, observaciones);

            // TODO: Implementar auditoría correctamente
            // auditLogService.registrarEvento(...);

            Map<String, Object> response = new HashMap<>();
            response.put("status", HttpStatus.OK.value());
            response.put("data", disponibilidad);
            response.put("message", "Disponibilidad marcada como revisada");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Error al revisar disponibilidad ID {}: {}", id, e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", HttpStatus.BAD_REQUEST.value());
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Rechazar disponibilidad y regresar a BORRADOR
     * Solo coordinadores
     *
     * POST /api/disponibilidad/{id}/rechazar
     */
    @CheckMBACPermission(pagina = "/coordinador/disponibilidad", accion = "revisar")
    @PostMapping("/{id}/rechazar")
    public ResponseEntity<Map<String, Object>> rechazar(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        try {
            String motivoRechazo = body.get("motivoRechazo");
            log.info("❌ Rechazando disponibilidad ID: {} - Motivo: {}", id, motivoRechazo);

            DisponibilidadMedicaDTO disponibilidad = disponibilidadService.rechazar(id, motivoRechazo);

            // TODO: Implementar auditoría correctamente
            // auditLogService.registrarEvento(...);

            Map<String, Object> response = new HashMap<>();
            response.put("status", HttpStatus.OK.value());
            response.put("data", disponibilidad);
            response.put("message", "Disponibilidad rechazada y devuelta a borrador");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Error al rechazar disponibilidad ID {}: {}", id, e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", HttpStatus.BAD_REQUEST.value());
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // ==========================================================
    // ⚙️ Ajustes de Coordinador
    // ==========================================================

    /**
     * Ajustar turnos de una disponibilidad (coordinador)
     * Permite cambiar tipos de turno y agregar observaciones
     *
     * POST /api/disponibilidad/ajustar-turnos
     */
    @CheckMBACPermission(pagina = "/coordinador/disponibilidad", accion = "ajustar")
    @PostMapping("/ajustar-turnos")
    public ResponseEntity<Map<String, Object>> ajustarTurnos(@Valid @RequestBody AjusteDisponibilidadDTO ajusteDTO) {
        try {
            log.info("⚙️ Ajustando turnos de disponibilidad ID: {} - {} ajustes",
                ajusteDTO.getIdDisponibilidad(), ajusteDTO.getAjustes().size());

            DisponibilidadMedicaDTO disponibilidad = disponibilidadService.ajustarTurnos(ajusteDTO);

            // TODO: Implementar auditoría correctamente
            // auditLogService.registrarEvento(...);

            Map<String, Object> response = new HashMap<>();
            response.put("status", HttpStatus.OK.value());
            response.put("data", disponibilidad);
            response.put("message", String.format("Se ajustaron %d turnos exitosamente", ajusteDTO.getAjustes().size()));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Error al ajustar turnos: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", HttpStatus.BAD_REQUEST.value());
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // ==========================================================
    // 🔗 Sincronización con Chatbot
    // ==========================================================

    /**
     * Sincronizar disponibilidad con sistema de horarios chatbot
     * Crea/actualiza registros en ctr_horario y ctr_horario_det
     *
     * POST /api/disponibilidad/sincronizar
     */
    @CheckMBACPermission(pagina = "/coordinador/disponibilidad", accion = "sincronizar")
    @PostMapping("/sincronizar")
    public ResponseEntity<Map<String, Object>> sincronizarConChatbot(
            @Valid @RequestBody SincronizacionRequestDTO request) {
        try {
            log.info("🔄 Sincronizando disponibilidad ID: {} con chatbot", request.getIdDisponibilidad());

            SincronizacionResponseDTO resultado = disponibilidadService.sincronizarConChatbot(request);

            // TODO: Implementar auditoría correctamente
            // auditLogService.registrarEvento(...);

            Map<String, Object> response = new HashMap<>();
            response.put("status", HttpStatus.OK.value());
            response.put("data", resultado);
            response.put("message", "Disponibilidad sincronizada exitosamente con el chatbot");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Error al sincronizar con chatbot: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", HttpStatus.BAD_REQUEST.value());
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Validar consistencia entre disponibilidad y horarios chatbot
     * Compara horas declaradas vs horas cargadas
     *
     * GET /api/disponibilidad/{id}/validar-consistencia
     */
    @CheckMBACPermission(pagina = "/coordinador/disponibilidad", accion = "ver")
    @GetMapping("/{id}/validar-consistencia")
    public ResponseEntity<Map<String, Object>> validarConsistencia(@PathVariable Long id) {
        try {
            log.info("🔍 Validando consistencia de disponibilidad ID: {}", id);

            ValidacionConsistenciaDTO validacion = disponibilidadService.validarConsistencia(id);

            Map<String, Object> response = new HashMap<>();
            response.put("status", HttpStatus.OK.value());
            response.put("data", validacion);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Error al validar consistencia ID {}: {}", id, e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", HttpStatus.BAD_REQUEST.value());
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Obtener disponibilidades pendientes de sincronización
     * Estado REVISADO sin id_ctr_horario_generado
     *
     * GET /api/disponibilidad/pendientes-sincronizacion
     */
    @CheckMBACPermission(pagina = "/coordinador/disponibilidad", accion = "ver")
    @GetMapping("/pendientes-sincronizacion")
    public ResponseEntity<Map<String, Object>> obtenerPendientesSincronizacion() {
        try {
            log.info("📋 Consultando disponibilidades pendientes de sincronización");

            List<DisponibilidadResponseDTO> pendientes = disponibilidadService.obtenerPendientesSincronizacion();

            Map<String, Object> response = new HashMap<>();
            response.put("status", HttpStatus.OK.value());
            response.put("data", pendientes);
            response.put("total", pendientes.size());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Error al consultar pendientes de sincronización: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", HttpStatus.BAD_REQUEST.value());
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Obtener disponibilidades con diferencias significativas vs chatbot
     * Diferencia > 10 horas entre declarado y cargado
     *
     * GET /api/disponibilidad/con-diferencias
     */
    @CheckMBACPermission(pagina = "/coordinador/disponibilidad", accion = "ver")
    @GetMapping("/con-diferencias")
    public ResponseEntity<Map<String, Object>> obtenerConDiferencias() {
        try {
            log.info("⚠️ Consultando disponibilidades con diferencias significativas");

            List<ValidacionConsistenciaDTO> conDiferencias =
                disponibilidadService.obtenerConDiferenciasSignificativas();

            Map<String, Object> response = new HashMap<>();
            response.put("status", HttpStatus.OK.value());
            response.put("data", conDiferencias);
            response.put("total", conDiferencias.size());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Error al consultar diferencias: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", HttpStatus.BAD_REQUEST.value());
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    // ==========================================================
    // 📊 Reportes y Estadísticas
    // ==========================================================

    /**
     * Obtener resumen estadístico de disponibilidad por periodo
     *
     * GET /api/disponibilidad/resumen/{periodo}
     */
    @CheckMBACPermission(pagina = "/coordinador/disponibilidad", accion = "ver")
    @GetMapping("/resumen/{periodo}")
    public ResponseEntity<Map<String, Object>> obtenerResumen(@PathVariable String periodo) {
        try {
            log.info("📊 Generando resumen estadístico del periodo: {}", periodo);

            ResumenDisponibilidadDTO resumen = disponibilidadService.obtenerResumenPorPeriodo(periodo);

            Map<String, Object> response = new HashMap<>();
            response.put("status", HttpStatus.OK.value());
            response.put("data", resumen);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Error al generar resumen del periodo {}: {}", periodo, e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", HttpStatus.BAD_REQUEST.value());
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Verificar si un médico ya tiene disponibilidad declarada
     *
     * GET /api/disponibilidad/verificar-existencia
     */
    @CheckMBACPermission(pagina = "/medico/disponibilidad", accion = "ver")
    @GetMapping("/verificar-existencia")
    public ResponseEntity<Map<String, Object>> verificarExistencia(
            @RequestParam Long idPers,
            @RequestParam String periodo,
            @RequestParam Long idServicio) {
        try {
            log.info("🔍 Verificando existencia - Médico: {}, Periodo: {}, Servicio: {}",
                idPers, periodo, idServicio);

            boolean existe = disponibilidadService.existeDisponibilidad(idPers, periodo, idServicio);

            Map<String, Object> response = new HashMap<>();
            response.put("status", HttpStatus.OK.value());
            response.put("existe", existe);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Error al verificar existencia: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", HttpStatus.BAD_REQUEST.value());
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Calcular total de horas por periodo y servicio
     *
     * GET /api/disponibilidad/calcular-total-horas
     */
    @CheckMBACPermission(pagina = "/coordinador/disponibilidad", accion = "ver")
    @GetMapping("/calcular-total-horas")
    public ResponseEntity<Map<String, Object>> calcularTotalHoras(
            @RequestParam String periodo,
            @RequestParam Long idServicio) {
        try {
            log.info("🧮 Calculando total de horas - Periodo: {}, Servicio: {}", periodo, idServicio);

            BigDecimal totalHoras = disponibilidadService.calcularTotalHoras(periodo, idServicio);

            Map<String, Object> response = new HashMap<>();
            response.put("status", HttpStatus.OK.value());
            response.put("periodo", periodo);
            response.put("idServicio", idServicio);
            response.put("totalHoras", totalHoras);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Error al calcular total de horas: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", HttpStatus.BAD_REQUEST.value());
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}

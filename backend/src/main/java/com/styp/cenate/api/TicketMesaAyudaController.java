package com.styp.cenate.api;

import com.styp.cenate.dto.mesaayuda.TicketMesaAyudaRequestDTO;
import com.styp.cenate.dto.mesaayuda.TicketMesaAyudaResponseDTO;
import com.styp.cenate.dto.mesaayuda.ResponderTicketDTO;
import com.styp.cenate.dto.mesaayuda.MotivoMesaAyudaDTO;
import com.styp.cenate.dto.mesaayuda.RespuestaPredefinidaDTO;
import com.styp.cenate.service.mesaayuda.TicketMesaAyudaService;
import com.styp.cenate.service.mesaayuda.TicketMesaAyudaService.KPIsTicketDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import jakarta.annotation.PostConstruct;

/**
 * Controller REST para gestionar tickets de Mesa de Ayuda
 *
 * Endpoints:
 * POST   /api/mesa-ayuda/tickets              → Crear ticket (MEDICO)
 * GET    /api/mesa-ayuda/tickets              → Listar todos (MESA_DE_AYUDA)
 * GET    /api/mesa-ayuda/tickets/{id}         → Obtener ticket por ID
 * GET    /api/mesa-ayuda/tickets/medico/{id}  → Tickets del médico (MEDICO)
 * PUT    /api/mesa-ayuda/tickets/{id}/responder → Responder ticket (MESA_DE_AYUDA)
 * PUT    /api/mesa-ayuda/tickets/{id}/estado  → Cambiar estado
 * DELETE /api/mesa-ayuda/tickets/{id}         → Eliminar ticket (MESA_DE_AYUDA)
 * GET    /api/mesa-ayuda/kpis                 → Obtener KPIs
 *
 * @author Styp Canto Rondón
 * @version v1.64.0 (2026-02-18)
 */
@Slf4j
@RestController
@RequestMapping("/api/mesa-ayuda")
@RequiredArgsConstructor
@Validated
public class TicketMesaAyudaController {

    private final TicketMesaAyudaService ticketService;

    @PostConstruct
    public void init() {
        log.info("✅ TicketMesaAyudaController inicializado correctamente");
    }

    // ========== SIGUIENTE NÚMERO DE TICKET ==========

    /**
     * Obtener preview del siguiente número de ticket
     * Utilizado por CrearTicketModal para mostrar el número antes de crear
     *
     * @return ResponseEntity con el siguiente número (ej: "0001-2026")
     * @status 200 OK
     */
    @GetMapping("/siguiente-numero")
    public ResponseEntity<Map<String, String>> obtenerSiguienteNumero() {
        log.info("GET /api/mesa-ayuda/siguiente-numero - Obteniendo preview");

        String siguienteNumero = ticketService.obtenerSiguienteNumeroTicket();

        Map<String, String> response = new HashMap<>();
        response.put("siguienteNumero", siguienteNumero);
        return ResponseEntity.ok(response);
    }

    // ========== OBTENER MOTIVOS ==========

    /**
     * Obtener lista de motivos activos para el combo de CrearTicketModal
     * Endpoint llamado al abrir el modal
     *
     * @return ResponseEntity con lista de motivos ordenados por orden
     * @status 200 OK
     */
    @GetMapping("/motivos")
    public ResponseEntity<List<MotivoMesaAyudaDTO>> obtenerMotivos() {
        log.info("GET /api/mesa-ayuda/motivos - Obteniendo motivos activos");

        List<MotivoMesaAyudaDTO> motivos = ticketService.obtenerMotivos();
        return ResponseEntity.ok(motivos);
    }

    // ========== OBTENER RESPUESTAS PREDEFINIDAS ==========

    /**
     * Obtener lista de respuestas predefinidas activas para ResponderTicketModal
     *
     * @return Lista de respuestas predefinidas ordenadas
     * @status 200 OK
     */
    @GetMapping("/respuestas-predefinidas")
    public ResponseEntity<List<RespuestaPredefinidaDTO>> obtenerRespuestasPredefinidas() {
        log.info("GET /api/mesa-ayuda/respuestas-predefinidas - Obteniendo respuestas predefinidas");
        List<RespuestaPredefinidaDTO> respuestas = ticketService.obtenerRespuestasPredefinidas();
        return ResponseEntity.ok(respuestas);
    }

    // ========== CREAR TICKET ==========

    /**
     * Crear un nuevo ticket de Mesa de Ayuda
     * Utilizado por médicos desde MisPacientes
     *
     * @param requestDTO Datos del ticket (título, descripción, prioridad, etc.)
     * @return ResponseEntity con el ticket creado
     * @status 201 CREATED
     */
    @PostMapping("/tickets")
    public ResponseEntity<TicketMesaAyudaResponseDTO> crearTicket(
        @Valid @RequestBody TicketMesaAyudaRequestDTO requestDTO
    ) {
        log.info("POST /api/mesa-ayuda/tickets - Creando ticket para médico: {}", requestDTO.getIdMedico());

        TicketMesaAyudaResponseDTO creado = ticketService.crearTicket(requestDTO);

        return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(creado);
    }

    // ========== OBTENER TICKETS ==========

    /**
     * Obtener todos los tickets (para personal Mesa de Ayuda)
     * Retorna lista de todos los tickets activos
     *
     * @param page Número de página (default 0)
     * @param size Tamaño de página (default 20)
     * @return Page<TicketMesaAyudaResponseDTO> con los tickets
     * @status 200 OK
     */
    @GetMapping("/tickets")
    public ResponseEntity<Page<TicketMesaAyudaResponseDTO>> obtenerTodos(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        @RequestParam(required = false) String estado
    ) {
        log.info("GET /api/mesa-ayuda/tickets - Obteniendo tickets (page={}, size={}, estado={})", page, size, estado);

        Pageable pageable = PageRequest.of(page, size);

        Page<TicketMesaAyudaResponseDTO> resultado;
        if (estado != null && !estado.isEmpty()) {
            // Soporta múltiples estados separados por coma: "NUEVO,EN_PROCESO"
            List<String> estados = List.of(estado.split(","));
            resultado = ticketService.obtenerPorEstadosPaginado(estados, pageable);
        } else {
            resultado = ticketService.obtenerTodosPaginado(pageable);
        }

        return ResponseEntity.ok(resultado);
    }

    // ========== OBTENER TODOS SIN PAGINACIÓN ==========

    /**
     * Obtener TODOS los tickets SIN paginación (para filtrado completo en frontend)
     *
     * @param estado Filtro opcional por estado
     * @return ResponseEntity con lista completa de tickets
     * @status 200 OK
     */
    @GetMapping("/tickets/all")
    public ResponseEntity<List<TicketMesaAyudaResponseDTO>> obtenerTodosSinPaginacion(
        @RequestParam(required = false) String estado
    ) {
        log.info("GET /api/mesa-ayuda/tickets/all - Obteniendo TODOS los tickets sin paginación");
        log.debug("  Estado: {}", estado);

        List<TicketMesaAyudaResponseDTO> resultado = ticketService.obtenerTodosSinPaginacion(estado);

        return ResponseEntity.ok(resultado);
    }

    // ========== BÚSQUEDA PAGINADA CON FILTROS (v1.67.1) ==========

    /**
     * Búsqueda paginada de tickets con múltiples filtros opcionales.
     * Todos los filtros se aplican en backend (SQL) para máximo rendimiento.
     *
     * @param page           Número de página (default 0)
     * @param size           Tamaño de página (default 15)
     * @param estados        CSV de estados a filtrar (ej: "NUEVO,EN_PROCESO")
     * @param prioridad      Prioridad exacta (ALTA, MEDIA, BAJA)
     * @param dniPaciente    Búsqueda parcial por DNI
     * @param numeroTicket   Búsqueda parcial por número de ticket
     * @param idMedico       ID del profesional de salud
     * @param nombreAsignado Nombre exacto del personal asignado
     * @param fechaDesde     Fecha inicio (inclusive) formato yyyy-MM-dd
     * @param fechaHasta     Fecha fin (inclusive) formato yyyy-MM-dd
     * @return Page de tickets con paginación
     * @status 200 OK
     */
    @GetMapping("/tickets/buscar")
    public ResponseEntity<Page<TicketMesaAyudaResponseDTO>> buscarConFiltros(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "15") int size,
        @RequestParam(required = false) String estados,
        @RequestParam(required = false) String prioridad,
        @RequestParam(required = false) String dniPaciente,
        @RequestParam(required = false) String numeroTicket,
        @RequestParam(required = false) Long idMedico,
        @RequestParam(required = false) String nombreAsignado,
        @RequestParam(required = false) LocalDate fechaDesde,
        @RequestParam(required = false) LocalDate fechaHasta
    ) {
        log.info("GET /api/mesa-ayuda/tickets/buscar - page={}, size={}, estados={}, prioridad={}, dni={}, ticket={}, idMedico={}, asignado={}, fechaDesde={}, fechaHasta={}",
            page, size, estados, prioridad, dniPaciente, numeroTicket, idMedico, nombreAsignado, fechaDesde, fechaHasta);

        Pageable pageable = PageRequest.of(page, size);
        Page<TicketMesaAyudaResponseDTO> resultado = ticketService.buscarConFiltros(
            estados, prioridad, dniPaciente, numeroTicket, idMedico, nombreAsignado, fechaDesde, fechaHasta, pageable
        );

        return ResponseEntity.ok(resultado);
    }

    // ========== MÉDICOS CON CONTEO DE TICKETS ==========

    /**
     * Obtener lista de médicos creadores con conteo de tickets.
     * Usado para poblar el dropdown "Profesional de Salud".
     *
     * @return Lista de { idMedico, nombreMedico, count }
     * @status 200 OK
     */
    @GetMapping("/medicos-con-tickets")
    public ResponseEntity<List<Map<String, Object>>> obtenerMedicosConConteo() {
        log.info("GET /api/mesa-ayuda/medicos-con-tickets");
        List<Map<String, Object>> medicos = ticketService.obtenerMedicosConConteo();
        return ResponseEntity.ok(medicos);
    }

    /**
     * Obtener un ticket específico por ID
     *
     * @param id ID del ticket
     * @return ResponseEntity con los datos del ticket
     * @status 200 OK
     */
    @GetMapping("/tickets/{id}")
    public ResponseEntity<TicketMesaAyudaResponseDTO> obtenerPorId(
        @PathVariable @NotNull Long id
    ) {
        log.info("GET /api/mesa-ayuda/tickets/{} - Obteniendo ticket", id);

        try {
            TicketMesaAyudaResponseDTO ticket = ticketService.obtenerPorId(id);
            return ResponseEntity.ok(ticket);
        } catch (IllegalArgumentException e) {
            log.warn("Ticket no encontrado: {}", id);
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Obtener tickets de un médico con paginación
     * Utilizado en MisPacientes para mostrar historial de tickets del médico
     *
     * @param idMedico ID del médico
     * @param page Número de página (default 0)
     * @param size Tamaño de página (default 20)
     * @return Page<TicketMesaAyudaResponseDTO> con los tickets del médico
     * @status 200 OK
     */
    @GetMapping("/tickets/medico/{idMedico}")
    public ResponseEntity<Page<TicketMesaAyudaResponseDTO>> obtenerPorMedico(
        @PathVariable @NotNull Long idMedico,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        log.info("GET /api/mesa-ayuda/tickets/medico/{} - Obteniendo tickets", idMedico);

        Pageable pageable = PageRequest.of(page, size);
        Page<TicketMesaAyudaResponseDTO> resultado = ticketService.obtenerPorMedicoPaginado(idMedico, pageable);

        return ResponseEntity.ok(resultado);
    }

    /**
     * ✅ v1.67.0: Obtener tickets por idSolicitudBolsa
     * Verifica si un paciente ya tiene tickets creados
     * Utilizado antes de abrir CrearTicketModal
     *
     * @param idSolicitudBolsa ID del solicitud bolsa (paciente)
     * @return ResponseEntity con lista de tickets para ese paciente
     * @status 200 OK
     */
    @GetMapping("/tickets/solicitud-bolsa/{idSolicitudBolsa}")
    public ResponseEntity<List<TicketMesaAyudaResponseDTO>> obtenerPorSolicitudBolsa(
        @PathVariable @NotNull Long idSolicitudBolsa
    ) {
        log.info("GET /api/mesa-ayuda/tickets/solicitud-bolsa/{} - Obteniendo tickets", idSolicitudBolsa);

        List<TicketMesaAyudaResponseDTO> tickets = ticketService.obtenerPorSolicitudBolsa(idSolicitudBolsa);
        return ResponseEntity.ok(tickets);
    }

    /**
     * ✅ v1.67.0: Obtener detalle completo de un ticket por número
     * Devuelve todos los campos incluyendo respuesta, nombre medico, etc.
     *
     * @param numeroTicket Número único del ticket (ej: 001-2026)
     * @return ResponseEntity con detalles completos del ticket
     * @status 200 OK
     * @status 404 NOT FOUND si el ticket no existe
     */
    @GetMapping("/tickets/detalle/{numeroTicket}")
    public ResponseEntity<TicketMesaAyudaResponseDTO> obtenerDetalleTicket(
        @PathVariable @NotBlank String numeroTicket
    ) {
        log.info("GET /api/mesa-ayuda/tickets/detalle/{} - Obteniendo detalle del ticket", numeroTicket);
        
        TicketMesaAyudaResponseDTO ticket = ticketService.obtenerPorNumeroTicket(numeroTicket);
        return ResponseEntity.ok(ticket);
    }

    /**
     * Obtener tickets activos (NUEVO, EN_PROCESO, RESUELTO)
     *
     * @param page Número de página (default 0)
     * @param size Tamaño de página (default 20)
     * @return Page<TicketMesaAyudaResponseDTO> con los tickets activos
     * @status 200 OK
     */
    @GetMapping("/tickets/activos")
    public ResponseEntity<Page<TicketMesaAyudaResponseDTO>> obtenerActivos(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        log.info("GET /api/mesa-ayuda/tickets/activos - Obteniendo tickets activos");

        Pageable pageable = PageRequest.of(page, size);
        Page<TicketMesaAyudaResponseDTO> resultado = ticketService.obtenerTicketsActivosPaginado(pageable);

        return ResponseEntity.ok(resultado);
    }

    // ========== RESPONDER TICKET ==========

    /**
     * Responder a un ticket
     * Utilizado por personal Mesa de Ayuda para dar solución
     *
     * @param id ID del ticket
     * @param responderDTO Datos de la respuesta (respuesta, estado, idPersonalMesa)
     * @return ResponseEntity con el ticket actualizado
     * @status 200 OK
     */
    @PutMapping("/tickets/{id}/responder")
    public ResponseEntity<TicketMesaAyudaResponseDTO> responderTicket(
        @PathVariable @NotNull Long id,
        @Valid @RequestBody ResponderTicketDTO responderDTO
    ) {
        log.info("PUT /api/mesa-ayuda/tickets/{}/responder - Respondiendo ticket", id);

        try {
            TicketMesaAyudaResponseDTO respondido = ticketService.responderTicket(id, responderDTO);
            return ResponseEntity.ok(respondido);
        } catch (IllegalArgumentException e) {
            log.warn("Error al responder ticket: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // ========== CAMBIAR ESTADO ==========

    /**
     * Cambiar el estado de un ticket
     * Estados válidos: NUEVO, EN_PROCESO, RESUELTO, CERRADO
     *
     * @param id ID del ticket
     * @param requestBody { "estado": "RESUELTO" }
     * @return ResponseEntity con el ticket actualizado
     * @status 200 OK
     */
    @PutMapping("/tickets/{id}/estado")
    public ResponseEntity<TicketMesaAyudaResponseDTO> cambiarEstado(
        @PathVariable @NotNull Long id,
        @RequestBody Map<String, String> requestBody
    ) {
        log.info("PUT /api/mesa-ayuda/tickets/{}/estado - Cambiando estado", id);

        String nuevoEstado = requestBody.get("estado");
        if (nuevoEstado == null || nuevoEstado.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        try {
            TicketMesaAyudaResponseDTO actualizado = ticketService.cambiarEstado(id, nuevoEstado);
            return ResponseEntity.ok(actualizado);
        } catch (IllegalArgumentException e) {
            log.warn("Error al cambiar estado: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // ========== PERSONAL MESA DE AYUDA ==========

    /**
     * Obtener lista de personal con rol MESA_DE_AYUDA
     * Utilizado para el dropdown de asignación de tickets
     *
     * @return Lista de personal [{ idPersonal, nombreCompleto }]
     * @status 200 OK
     */
    @GetMapping("/personal")
    public ResponseEntity<List<Map<String, Object>>> obtenerPersonalMesaAyuda() {
        log.info("GET /api/mesa-ayuda/personal - Obteniendo personal Mesa de Ayuda");

        List<Map<String, Object>> personal = ticketService.obtenerPersonalMesaAyuda();
        return ResponseEntity.ok(personal);
    }

    // ========== ASIGNAR / DESASIGNAR TICKET ==========

    /**
     * Asignar personal de Mesa de Ayuda a un ticket
     *
     * @param id ID del ticket
     * @param requestBody { "idPersonalAsignado": 123, "nombrePersonalAsignado": "Juan Pérez" }
     * @return ResponseEntity con el ticket actualizado
     * @status 200 OK
     */
    @PutMapping("/tickets/{id}/asignar")
    public ResponseEntity<TicketMesaAyudaResponseDTO> asignarTicket(
        @PathVariable @NotNull Long id,
        @RequestBody Map<String, Object> requestBody
    ) {
        log.info("PUT /api/mesa-ayuda/tickets/{}/asignar - Asignando ticket", id);

        Object idPersonalObj = requestBody.get("idPersonalAsignado");
        String nombrePersonal = (String) requestBody.get("nombrePersonalAsignado");

        if (idPersonalObj == null || nombrePersonal == null || nombrePersonal.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        Long idPersonal = ((Number) idPersonalObj).longValue();

        try {
            TicketMesaAyudaResponseDTO actualizado = ticketService.asignarTicket(id, idPersonal, nombrePersonal);
            return ResponseEntity.ok(actualizado);
        } catch (IllegalArgumentException e) {
            log.warn("Error al asignar ticket: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Desasignar personal de un ticket
     *
     * @param id ID del ticket
     * @return ResponseEntity con el ticket actualizado
     * @status 200 OK
     */
    @PreAuthorize("hasRole('SUPERADMIN')")
    @PutMapping("/tickets/{id}/desasignar")
    public ResponseEntity<TicketMesaAyudaResponseDTO> desasignarTicket(
        @PathVariable @NotNull Long id
    ) {
        log.info("PUT /api/mesa-ayuda/tickets/{}/desasignar - Desasignando ticket", id);

        try {
            TicketMesaAyudaResponseDTO actualizado = ticketService.desasignarTicket(id);
            return ResponseEntity.ok(actualizado);
        } catch (IllegalArgumentException e) {
            log.warn("Error al desasignar ticket: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // ========== ASIGNACIÓN MASIVA ==========

    /**
     * Asignar personal de Mesa de Ayuda a múltiples tickets a la vez
     *
     * @param requestBody { "ticketIds": [1, 2, 3], "idPersonalAsignado": 123, "nombrePersonalAsignado": "Juan Pérez" }
     * @return ResponseEntity con la lista de tickets actualizados
     */
    @SuppressWarnings("unchecked")
    @PutMapping("/tickets/asignar-masivo")
    public ResponseEntity<?> asignarMasivo(@RequestBody Map<String, Object> requestBody) {
        log.info("PUT /api/mesa-ayuda/tickets/asignar-masivo - Asignación masiva");

        List<Number> ticketIds = (List<Number>) requestBody.get("ticketIds");
        Object idPersonalObj = requestBody.get("idPersonalAsignado");
        String nombrePersonal = (String) requestBody.get("nombrePersonalAsignado");

        if (ticketIds == null || ticketIds.isEmpty() || idPersonalObj == null || nombrePersonal == null || nombrePersonal.isEmpty()) {
            return ResponseEntity.badRequest().body("Faltan datos requeridos");
        }

        Long idPersonal = ((Number) idPersonalObj).longValue();
        List<TicketMesaAyudaResponseDTO> resultados = new java.util.ArrayList<>();
        List<String> errores = new java.util.ArrayList<>();

        for (Number ticketIdNum : ticketIds) {
            Long ticketId = ticketIdNum.longValue();
            try {
                TicketMesaAyudaResponseDTO actualizado = ticketService.asignarTicket(ticketId, idPersonal, nombrePersonal);
                resultados.add(actualizado);
            } catch (IllegalArgumentException e) {
                log.warn("Error al asignar ticket {}: {}", ticketId, e.getMessage());
                errores.add("Ticket " + ticketId + ": " + e.getMessage());
            }
        }

        Map<String, Object> response = new java.util.HashMap<>();
        response.put("asignados", resultados.size());
        response.put("errores", errores);
        response.put("tickets", resultados);

        return ResponseEntity.ok(response);
    }

    // ========== ACTUALIZAR TELÉFONOS ==========

    /**
     * Actualizar teléfonos del paciente asociado a un ticket
     * Actualiza en la tabla asegurados (fuente real) y en el ticket para coherencia
     *
     * @param id ID del ticket
     * @param requestBody { "telefonoPrincipal": "...", "telefonoAlterno": "..." }
     * @return ResponseEntity con el ticket actualizado
     * @status 200 OK
     */
    @PutMapping("/tickets/{id}/telefonos")
    public ResponseEntity<TicketMesaAyudaResponseDTO> actualizarTelefonos(
        @PathVariable @NotNull Long id,
        @RequestBody Map<String, String> requestBody
    ) {
        log.info("PUT /api/mesa-ayuda/tickets/{}/telefonos - Actualizando teléfonos", id);

        String telefonoPrincipal = requestBody.get("telefonoPrincipal");
        String telefonoAlterno = requestBody.get("telefonoAlterno");

        try {
            TicketMesaAyudaResponseDTO actualizado = ticketService.actualizarTelefonos(id, telefonoPrincipal, telefonoAlterno);
            return ResponseEntity.ok(actualizado);
        } catch (IllegalArgumentException e) {
            log.warn("Error al actualizar teléfonos: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // ========== ELIMINAR TICKET ==========

    /**
     * Eliminar un ticket (soft delete)
     *
     * @param id ID del ticket
     * @return ResponseEntity con código 204 NO_CONTENT
     * @status 204 NO_CONTENT
     */
    @DeleteMapping("/tickets/{id}")
    public ResponseEntity<Void> eliminarTicket(
        @PathVariable @NotNull Long id
    ) {
        log.info("DELETE /api/mesa-ayuda/tickets/{} - Eliminando ticket", id);

        try {
            ticketService.eliminarTicket(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            log.warn("Ticket no encontrado: {}", id);
            return ResponseEntity.notFound().build();
        }
    }

    // ========== BOLSA DE REPROGRAMACIÓN ==========

    /**
     * Enviar paciente del ticket a la Bolsa de Reprogramación (BOLSA_MESA_DE_AYUDA)
     * Solo aplica para motivos PS_CITA_REPROGRAMADA
     *
     * @param id ID del ticket
     * @return Mensaje de éxito o error
     */
    @PostMapping("/tickets/{id}/bolsa-reprogramacion")
    public ResponseEntity<?> enviarABolsaReprogramacion(
        @PathVariable @NotNull Long id
    ) {
        log.info("POST /api/mesa-ayuda/tickets/{}/bolsa-reprogramacion - Enviando a Bolsa", id);

        try {
            Map<String, Object> resultado = ticketService.enviarABolsaReprogramacion(id);
            return ResponseEntity.ok(resultado);
        } catch (IllegalArgumentException e) {
            log.warn("Error al enviar a bolsa de reprogramación: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error al enviar a bolsa de reprogramación: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Error al procesar la solicitud: " + e.getMessage()));
        }
    }

    // ========== KPIs ==========

    /**
     * Obtener KPIs del sistema de Mesa de Ayuda
     * Retorna: total de tickets, abiertos, en proceso, resueltos, cerrados, tasa de resolución
     *
     * @return ResponseEntity con los KPIs
     * @status 200 OK
     */
    @GetMapping("/kpis")
    public ResponseEntity<KPIsTicketDTO> obtenerKPIs() {
        log.info("GET /api/mesa-ayuda/kpis - Obteniendo KPIs");

        KPIsTicketDTO kpis = ticketService.obtenerKPIs();
        return ResponseEntity.ok(kpis);
    }

    // ========== ESTADÍSTICAS ==========

    /**
     * Obtener estadísticas completas de Mesa de Ayuda
     * GET /api/mesa-ayuda/estadisticas
     */
    @GetMapping("/estadisticas")
    public ResponseEntity<Map<String, Object>> obtenerEstadisticas() {
        log.info("GET /api/mesa-ayuda/estadisticas - Obteniendo estadísticas completas");
        Map<String, Object> estadisticas = ticketService.obtenerEstadisticas();
        return ResponseEntity.ok(estadisticas);
    }

    /**
     * GET /api/mesa-ayuda/estadisticas/personal?nombre=X&periodo=dia|semana|mes|ano
     * Estadísticas detalladas de un operador filtradas por período
     */
    @GetMapping("/estadisticas/personal")
    public ResponseEntity<Map<String, Object>> obtenerEstadisticasPersonal(
            @RequestParam String nombre,
            @RequestParam(defaultValue = "mes") String periodo) {
        log.info("GET /api/mesa-ayuda/estadisticas/personal - nombre={}, periodo={}", nombre, periodo);
        Map<String, Object> data = ticketService.obtenerEstadisticasPersonal(nombre, periodo);
        return ResponseEntity.ok(data);
    }

    // ========== ERROR HANDLING ==========

    /**
     * Manejo de excepciones generales
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException e) {
        log.error("Error de argumento: {}", e.getMessage());

        Map<String, String> error = new HashMap<>();
        error.put("error", "Argumento inválido");
        error.put("mensaje", e.getMessage());

        return ResponseEntity.badRequest().body(error);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGeneral(Exception e) {
        log.error("Error general: ", e);

        Map<String, String> error = new HashMap<>();
        error.put("error", "Error interno del servidor");
        error.put("mensaje", "Por favor intente más tarde");

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}

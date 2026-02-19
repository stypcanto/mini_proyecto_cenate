package com.styp.cenate.api;

import com.styp.cenate.dto.mesaayuda.TicketMesaAyudaRequestDTO;
import com.styp.cenate.dto.mesaayuda.TicketMesaAyudaResponseDTO;
import com.styp.cenate.dto.mesaayuda.ResponderTicketDTO;
import com.styp.cenate.dto.mesaayuda.MotivoMesaAyudaDTO;
import com.styp.cenate.service.mesaayuda.TicketMesaAyudaService;
import com.styp.cenate.service.mesaayuda.TicketMesaAyudaService.KPIsTicketDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.annotation.PostConstruct;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
            // Filtro por estado (implementar en servicio si es necesario)
            resultado = ticketService.obtenerTodosPaginado(pageable);
        } else {
            resultado = ticketService.obtenerTodosPaginado(pageable);
        }

        return ResponseEntity.ok(resultado);
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
     * Obtener tickets de un médico específico
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
     * Obtener tickets activos (ABIERTO, EN_PROCESO, RESUELTO)
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
     * Estados válidos: ABIERTO, EN_PROCESO, RESUELTO, CERRADO
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

package com.styp.cenate.service.mesaayuda;

import com.styp.cenate.dto.mesaayuda.TicketMesaAyudaRequestDTO;
import com.styp.cenate.dto.mesaayuda.TicketMesaAyudaResponseDTO;
import com.styp.cenate.dto.mesaayuda.ResponderTicketDTO;
import com.styp.cenate.dto.mesaayuda.MotivoMesaAyudaDTO;
import com.styp.cenate.model.mesaayuda.TicketMesaAyuda;
import com.styp.cenate.model.mesaayuda.DimMotivosMesaAyuda;
import com.styp.cenate.model.mesaayuda.DimSecuenciaTickets;
import com.styp.cenate.repository.mesaayuda.TicketMesaAyudaRepository;
import com.styp.cenate.repository.mesaayuda.MotivoMesaAyudaRepository;
import com.styp.cenate.repository.mesaayuda.SecuenciaTicketsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Servicio para gestionar tickets de Mesa de Ayuda
 *
 * Funcionalidades:
 * - Crear tickets desde MisPacientes
 * - Obtener tickets (filtrados por rol)
 * - Responder tickets
 * - Cambiar estado de tickets
 * - Generar reportes y KPIs
 *
 * @author Styp Canto Rondón
 * @version v1.64.0 (2026-02-18)
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class TicketMesaAyudaService {

    private final TicketMesaAyudaRepository ticketRepository;
    private final MotivoMesaAyudaRepository motivoRepository;
    private final SecuenciaTicketsRepository secuenciaRepository;

    // ========== GENERAR NÚMERO DE TICKET ==========

    /**
     * Generar número único del ticket con formato XXXX-YYYY
     * Incrementa el contador anual automáticamente
     *
     * @return Número generado (ej: 0001-2026, 0002-2026)
     */
    private String generarNumeroTicket() {
        int anioActual = java.time.Year.now().getValue();

        // Obtener o crear la secuencia para este año
        DimSecuenciaTickets secuencia = secuenciaRepository.findByAnio(anioActual)
            .orElseGet(() -> {
                DimSecuenciaTickets nueva = DimSecuenciaTickets.builder()
                    .anio(anioActual)
                    .contador(0)
                    .build();
                return secuenciaRepository.save(nueva);
            });

        // Incrementar contador
        secuenciaRepository.incrementarContador(anioActual);
        secuencia.setContador(secuencia.getContador() + 1);

        // Generar número con padding de 4 dígitos
        String numeroFormato = String.format("%04d-%04d", secuencia.getContador(), anioActual);
        log.info("Número de ticket generado: {}", numeroFormato);

        return numeroFormato;
    }

    // ========== SIGUIENTE NÚMERO DE TICKET ==========

    /**
     * Obtener el siguiente número de ticket (preview, sin incrementar)
     * Utilizado para mostrar en el modal antes de crear el ticket
     *
     * @return Siguiente número (ej: 0001-2026, 0002-2026)
     */
    @Transactional(readOnly = true)
    public String obtenerSiguienteNumeroTicket() {
        int anioActual = java.time.Year.now().getValue();

        int contadorActual = secuenciaRepository.findByAnio(anioActual)
            .map(DimSecuenciaTickets::getContador)
            .orElse(0);

        String siguienteNumero = String.format("%04d-%04d", contadorActual + 1, anioActual);
        log.debug("Siguiente número de ticket (preview): {}", siguienteNumero);
        return siguienteNumero;
    }

    // ========== OBTENER MOTIVOS ==========

    /**
     * Obtener todos los motivos activos ordenados por orden
     * Utilizado para llenar el combo de selección en CrearTicketModal
     *
     * @return Lista de motivos disponibles
     */
    @Transactional(readOnly = true)
    public List<MotivoMesaAyudaDTO> obtenerMotivos() {
        log.debug("Obteniendo motivos activos para combo");
        return motivoRepository.findByActivoTrueOrderByOrdenAsc()
            .stream()
            .map(motivo -> MotivoMesaAyudaDTO.builder()
                .id(motivo.getId())
                .codigo(motivo.getCodigo())
                .descripcion(motivo.getDescripcion())
                .build())
            .collect(Collectors.toList());
    }

    // ========== CREAR TICKET ==========

    /**
     * Crear un nuevo ticket de Mesa de Ayuda
     * Utilizado por médicos desde MisPacientes
     *
     * Si se proporciona idMotivo, el título se genera automáticamente desde la descripción del motivo
     * Si no hay idMotivo, se usa el título proporcionado directamente
     *
     * Genera automáticamente un número de ticket único (XXXX-YYYY) para trazabilidad
     *
     * @param requestDTO Datos del ticket (título OR idMotivo, descripción/observaciones, prioridad, datos del paciente)
     * @return TicketMesaAyudaResponseDTO con los datos del ticket creado (incluyendo numeroTicket)
     */
    public TicketMesaAyudaResponseDTO crearTicket(TicketMesaAyudaRequestDTO requestDTO) {
        log.info("Creando nuevo ticket para médico: {}", requestDTO.getIdMedico());

        // Resolver título: si hay idMotivo, usar la descripción del motivo; si no, usar el título directo
        String tituloFinal = requestDTO.getTitulo();
        if (requestDTO.getIdMotivo() != null) {
            DimMotivosMesaAyuda motivo = motivoRepository.findById(requestDTO.getIdMotivo())
                .orElseThrow(() -> new IllegalArgumentException("Motivo no encontrado con ID: " + requestDTO.getIdMotivo()));
            tituloFinal = motivo.getDescripcion();
        }

        // ✅ v1.64.1: Generar número único del ticket para trazabilidad
        String numeroTicket = generarNumeroTicket();

        TicketMesaAyuda ticket = TicketMesaAyuda.builder()
            .titulo(tituloFinal)
            .descripcion(requestDTO.getDescripcion() != null ? requestDTO.getDescripcion() : "")
            .prioridad(requestDTO.getPrioridad() != null ? requestDTO.getPrioridad() : "MEDIA")
            .estado("ABIERTO") // Estado inicial
            .idMedico(requestDTO.getIdMedico())
            .nombreMedico(requestDTO.getNombreMedico())
            .idSolicitudBolsa(requestDTO.getIdSolicitudBolsa())
            .dniPaciente(requestDTO.getDniPaciente())
            .nombrePaciente(requestDTO.getNombrePaciente())
            .especialidad(requestDTO.getEspecialidad())
            .ipress(requestDTO.getIpress())
            .idMotivo(requestDTO.getIdMotivo())
            .observaciones(requestDTO.getObservaciones())
            .numeroTicket(numeroTicket)
            .fechaCreacion(LocalDateTime.now(ZONA_PERU))
            .fechaActualizacion(LocalDateTime.now(ZONA_PERU))
            .build();

        TicketMesaAyuda saved = ticketRepository.save(ticket);
        log.info("Ticket creado exitosamente con ID: {} - Número: {}", saved.getId(), numeroTicket);

        return toResponseDTO(saved);
    }

    // ========== OBTENER TICKETS ==========

    /**
     * Obtener todos los tickets (para personal de Mesa de Ayuda)
     * Retorna tickets no eliminados, ordenados por prioridad y fecha
     */
    @Transactional(readOnly = true)
    public List<TicketMesaAyudaResponseDTO> obtenerTodos() {
        log.debug("Obteniendo todos los tickets");
        return ticketRepository.findAllByDeletedAtIsNullOrderByFechaCreacionDesc()
            .stream()
            .map(this::toResponseDTO)
            .collect(Collectors.toList());
    }

    /**
     * Obtener todos los tickets con paginación
     */
    @Transactional(readOnly = true)
    public Page<TicketMesaAyudaResponseDTO> obtenerTodosPaginado(Pageable pageable) {
        log.debug("Obteniendo tickets con paginación");
        return ticketRepository.findByDeletedAtIsNull(pageable)
            .map(this::toResponseDTO);
    }

    /**
     * Obtener tickets de un médico específico
     * Utilizado para mostrar los tickets creados por el médico en MisPacientes
     *
     * @param idMedico ID del médico
     * @return Lista de tickets del médico
     */
    @Transactional(readOnly = true)
    public List<TicketMesaAyudaResponseDTO> obtenerPorMedico(Long idMedico) {
        log.debug("Obteniendo tickets del médico: {}", idMedico);
        return ticketRepository.findByIdMedicoAndDeletedAtIsNullOrderByFechaCreacionDesc(idMedico)
            .stream()
            .map(this::toResponseDTO)
            .collect(Collectors.toList());
    }

    /**
     * Obtener tickets de un médico con paginación
     */
    @Transactional(readOnly = true)
    public Page<TicketMesaAyudaResponseDTO> obtenerPorMedicoPaginado(Long idMedico, Pageable pageable) {
        log.debug("Obteniendo tickets del médico {} con paginación", idMedico);
        return ticketRepository.findByIdMedicoAndDeletedAtIsNull(idMedico, pageable)
            .map(this::toResponseDTO);
    }

    /**
     * Obtener tickets por estado
     * Filtra tickets ABIERTOS, EN_PROCESO, RESUELTOS o CERRADOS
     */
    @Transactional(readOnly = true)
    public List<TicketMesaAyudaResponseDTO> obtenerPorEstado(String estado) {
        log.debug("Obteniendo tickets con estado: {}", estado);
        return ticketRepository
            .findByEstadoAndDeletedAtIsNullOrderByPrioridadDescFechaCreacionDesc(estado)
            .stream()
            .map(this::toResponseDTO)
            .collect(Collectors.toList());
    }

    /**
     * Obtener tickets activos (ABIERTO, EN_PROCESO, RESUELTO)
     */
    @Transactional(readOnly = true)
    public List<TicketMesaAyudaResponseDTO> obtenerTicketsActivos() {
        log.debug("Obteniendo tickets activos");
        return ticketRepository.findActiveTickets()
            .stream()
            .map(this::toResponseDTO)
            .collect(Collectors.toList());
    }

    /**
     * Obtener tickets activos con paginación
     */
    @Transactional(readOnly = true)
    public Page<TicketMesaAyudaResponseDTO> obtenerTicketsActivosPaginado(Pageable pageable) {
        log.debug("Obteniendo tickets activos con paginación");
        return ticketRepository.findActiveTickets(pageable)
            .map(this::toResponseDTO);
    }

    /**
     * Obtener un ticket específico por ID
     */
    @Transactional(readOnly = true)
    public TicketMesaAyudaResponseDTO obtenerPorId(Long id) {
        log.debug("Obteniendo ticket con ID: {}", id);
        TicketMesaAyuda ticket = ticketRepository.findByIdAndDeletedAtIsNull(id)
            .orElseThrow(() -> new IllegalArgumentException("Ticket no encontrado con ID: " + id));
        return toResponseDTO(ticket);
    }

    // ========== RESPONDER TICKET ==========

    /**
     * Responder a un ticket de Mesa de Ayuda
     * Actualiza: respuesta, estado, idPersonalMesa, nombrePersonalMesa, fechaRespuesta
     *
     * @param id ID del ticket
     * @param responderDTO Datos de la respuesta (respuesta, estado, idPersonalMesa, nombrePersonalMesa)
     * @return TicketMesaAyudaResponseDTO actualizado
     */
    public TicketMesaAyudaResponseDTO responderTicket(Long id, ResponderTicketDTO responderDTO) {
        log.info("Respondiendo ticket con ID: {}", id);

        TicketMesaAyuda ticket = ticketRepository.findByIdAndDeletedAtIsNull(id)
            .orElseThrow(() -> new IllegalArgumentException("Ticket no encontrado con ID: " + id));

        // Validar que el estado sea válido (no ABIERTO)
        String nuevoEstado = responderDTO.getEstado();
        if ("ABIERTO".equals(nuevoEstado)) {
            throw new IllegalArgumentException("No se puede cambiar a estado ABIERTO desde una respuesta");
        }

        // Actualizar campos
        ticket.setRespuesta(responderDTO.getRespuesta());
        ticket.setEstado(nuevoEstado);
        ticket.setIdPersonalMesa(responderDTO.getIdPersonalMesa());
        ticket.setNombrePersonalMesa(responderDTO.getNombrePersonalMesa());
        ticket.setFechaRespuesta(LocalDateTime.now(ZONA_PERU));
        ticket.setFechaActualizacion(LocalDateTime.now(ZONA_PERU));

        TicketMesaAyuda updated = ticketRepository.save(ticket);
        log.info("Ticket respondido exitosamente");

        return toResponseDTO(updated);
    }

    // ========== CAMBIAR ESTADO ==========

    /**
     * Cambiar el estado de un ticket
     * Estados válidos: ABIERTO, EN_PROCESO, RESUELTO, CERRADO
     *
     * @param id ID del ticket
     * @param nuevoEstado Nuevo estado
     * @return TicketMesaAyudaResponseDTO actualizado
     */
    public TicketMesaAyudaResponseDTO cambiarEstado(Long id, String nuevoEstado) {
        log.info("Cambiando estado del ticket {} a: {}", id, nuevoEstado);

        TicketMesaAyuda ticket = ticketRepository.findByIdAndDeletedAtIsNull(id)
            .orElseThrow(() -> new IllegalArgumentException("Ticket no encontrado con ID: " + id));

        // Validar estado
        List<String> estadosValidos = List.of("ABIERTO", "EN_PROCESO", "RESUELTO", "CERRADO");
        if (!estadosValidos.contains(nuevoEstado)) {
            throw new IllegalArgumentException("Estado no válido: " + nuevoEstado);
        }

        ticket.setEstado(nuevoEstado);
        ticket.setFechaActualizacion(LocalDateTime.now(ZONA_PERU));

        // Si es la primera respuesta, registrar fecha
        if (ticket.getFechaRespuesta() == null && !nuevoEstado.equals("ABIERTO")) {
            ticket.setFechaRespuesta(LocalDateTime.now(ZONA_PERU));
        }

        TicketMesaAyuda updated = ticketRepository.save(ticket);
        log.info("Estado cambiado exitosamente");

        return toResponseDTO(updated);
    }

    // ========== ELIMINAR (SOFT DELETE) ==========

    /**
     * Eliminar un ticket (soft delete)
     * Marca el ticket como eliminado sin borrarlo de la BD
     *
     * @param id ID del ticket
     */
    public void eliminarTicket(Long id) {
        log.info("Eliminando ticket con ID: {}", id);

        TicketMesaAyuda ticket = ticketRepository.findByIdAndDeletedAtIsNull(id)
            .orElseThrow(() -> new IllegalArgumentException("Ticket no encontrado con ID: " + id));

        ticket.setDeletedAt(LocalDateTime.now(ZONA_PERU));
        ticket.setFechaActualizacion(LocalDateTime.now(ZONA_PERU));
        ticketRepository.save(ticket);

        log.info("Ticket eliminado exitosamente");
    }

    // ========== KPIs Y ESTADÍSTICAS ==========

    /**
     * Obtener KPIs del sistema de Mesa de Ayuda
     * Retorna: total de tickets, abiertos, en proceso, resueltos, cerrados
     */
    @Transactional(readOnly = true)
    public KPIsTicketDTO obtenerKPIs() {
        log.debug("Calculando KPIs de Mesa de Ayuda");

        Long totalTickets = (long) ticketRepository.findAllByDeletedAtIsNullOrderByFechaCreacionDesc().size();
        Long ticketsAbiertos = ticketRepository.countByEstadoAndDeletedAtIsNull("ABIERTO");
        Long ticketsEnProceso = ticketRepository.countByEstadoAndDeletedAtIsNull("EN_PROCESO");
        Long ticketsResueltos = ticketRepository.countByEstadoAndDeletedAtIsNull("RESUELTO");
        Long ticketsCerrados = ticketRepository.countByEstadoAndDeletedAtIsNull("CERRADO");

        return KPIsTicketDTO.builder()
            .totalTickets(totalTickets)
            .ticketsAbiertos(ticketsAbiertos)
            .ticketsEnProceso(ticketsEnProceso)
            .ticketsResueltos(ticketsResueltos)
            .ticketsCerrados(ticketsCerrados)
            .tasaResolucion(totalTickets > 0 ? (ticketsResueltos.doubleValue() / totalTickets) * 100 : 0.0)
            .build();
    }

    // ========== UTILIDADES INTERNAS ==========

    /**
     * Convertir entidad TicketMesaAyuda a ResponseDTO
     * Calcula campos derivados como horasDesdeCreacion
     * Mapea idMotivo a nombreMotivo desde la BD (v1.64.0)
     */
    private static final ZoneId ZONA_PERU = ZoneId.of("America/Lima");

    private TicketMesaAyudaResponseDTO toResponseDTO(TicketMesaAyuda ticket) {
        long horasDesdeCreacion = ChronoUnit.HOURS.between(
            ticket.getFechaCreacion(),
            LocalDateTime.now(ZONA_PERU)
        );

        // Obtener descripción del motivo si existe
        String nombreMotivo = null;
        if (ticket.getIdMotivo() != null) {
            nombreMotivo = motivoRepository.findById(ticket.getIdMotivo())
                .map(DimMotivosMesaAyuda::getDescripcion)
                .orElse(null);
        }

        return TicketMesaAyudaResponseDTO.builder()
            .id(ticket.getId())
            .titulo(ticket.getTitulo())
            .descripcion(ticket.getDescripcion())
            .estado(ticket.getEstado())
            .prioridad(ticket.getPrioridad())
            .nombreMedico(ticket.getNombreMedico())
            .dniPaciente(ticket.getDniPaciente())
            .nombrePaciente(ticket.getNombrePaciente())
            .especialidad(ticket.getEspecialidad())
            .ipress(ticket.getIpress())
            .respuesta(ticket.getRespuesta())
            .nombrePersonalMesa(ticket.getNombrePersonalMesa())
            .fechaCreacion(ticket.getFechaCreacion())
            .fechaRespuesta(ticket.getFechaRespuesta())
            .fechaActualizacion(ticket.getFechaActualizacion())
            .horasDesdeCreacion(horasDesdeCreacion)
            .idMotivo(ticket.getIdMotivo())
            .nombreMotivo(nombreMotivo)
            .observaciones(ticket.getObservaciones())
            .numeroTicket(ticket.getNumeroTicket())
            .build();
    }

    // ========== DTO AUXILIAR ==========

    /**
     * DTO para retornar KPIs
     */
    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class KPIsTicketDTO {
        private Long totalTickets;
        private Long ticketsAbiertos;
        private Long ticketsEnProceso;
        private Long ticketsResueltos;
        private Long ticketsCerrados;
        private Double tasaResolucion; // Porcentaje resueltos
    }
}

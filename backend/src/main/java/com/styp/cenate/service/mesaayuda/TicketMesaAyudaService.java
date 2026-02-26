package com.styp.cenate.service.mesaayuda;

import com.styp.cenate.dto.mesaayuda.TicketMesaAyudaRequestDTO;
import com.styp.cenate.dto.mesaayuda.TicketMesaAyudaResponseDTO;
import com.styp.cenate.dto.mesaayuda.ResponderTicketDTO;
import com.styp.cenate.dto.mesaayuda.MotivoMesaAyudaDTO;
import com.styp.cenate.dto.mesaayuda.RespuestaPredefinidaDTO;
import com.styp.cenate.model.mesaayuda.TicketMesaAyuda;
import com.styp.cenate.model.mesaayuda.DimMotivosMesaAyuda;
import com.styp.cenate.model.mesaayuda.DimSecuenciaTickets;
import com.styp.cenate.repository.mesaayuda.TicketMesaAyudaRepository;
import com.styp.cenate.repository.mesaayuda.MotivoMesaAyudaRepository;
import com.styp.cenate.repository.mesaayuda.SecuenciaTicketsRepository;
import com.styp.cenate.repository.mesaayuda.RespuestasPredefinidasRepository;
import com.styp.cenate.repository.bolsas.SolicitudBolsaRepository;
import com.styp.cenate.model.bolsas.SolicitudBolsa;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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
    private final SolicitudBolsaRepository solicitudBolsaRepository;
    private final RespuestasPredefinidasRepository respuestasPredefinidasRepository;

    @PersistenceContext
    private EntityManager entityManager;

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

    // ========== RESPUESTAS PREDEFINIDAS ==========

    /**
     * Obtener respuestas predefinidas activas ordenadas por orden
     * Utilizado en ResponderTicketModal para mostrar opciones rápidas
     *
     * @return Lista de respuestas predefinidas
     */
    @Transactional(readOnly = true)
    public List<RespuestaPredefinidaDTO> obtenerRespuestasPredefinidas() {
        log.debug("Obteniendo respuestas predefinidas activas");
        return respuestasPredefinidasRepository.findByActivoTrueOrderByOrdenAsc()
            .stream()
            .map(r -> RespuestaPredefinidaDTO.builder()
                .id(r.getId())
                .codigo(r.getCodigo())
                .descripcion(r.getDescripcion())
                .esOtros(r.getEsOtros())
                .orden(r.getOrden())
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
            .estado("NUEVO") // Estado inicial
            .idMedico(requestDTO.getIdMedico())
            .nombreMedico(requestDTO.getNombreMedico())
            .idSolicitudBolsa(requestDTO.getIdSolicitudBolsa())
            .tipoDocumento(requestDTO.getTipoDocumento() != null ? requestDTO.getTipoDocumento() : "DNI")
            .dniPaciente(requestDTO.getDniPaciente())
            .nombrePaciente(requestDTO.getNombrePaciente())
            .especialidad(requestDTO.getEspecialidad())
            .ipress(requestDTO.getIpress())
            .telefonoPaciente(requestDTO.getTelefonoPaciente())
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
     * Obtener TODOS los tickets SIN paginación, opcionalmente filtrados por estado
     * (Para filtrado completo en el frontend)
     *
     * @param estado Estados a filtrar (ej: "RESUELTO,CERRADO"), o null para todos
     * @return Lista completa de tickets
     */
    @Transactional(readOnly = true)
    public List<TicketMesaAyudaResponseDTO> obtenerTodosSinPaginacion(String estado) {
        log.debug("Obteniendo TODOS los tickets sin paginación. Estado: {}", estado);

        List<TicketMesaAyuda> tickets;

        if (estado != null && !estado.isBlank()) {
            // Filtrar por estados específicos
            List<String> estadosList = Arrays.asList(estado.split(","));
            tickets = ticketRepository.findByDeletedAtIsNullAndEstadoInOrderByFechaCreacionDesc(estadosList);
        } else {
            // Obtener todos sin filtro de estado
            tickets = ticketRepository.findAllByDeletedAtIsNullOrderByFechaCreacionDesc();
        }

        return tickets.stream()
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
     * Obtener tickets filtrados por múltiples estados con paginación
     * Soporta: "NUEVO,EN_PROCESO" o "RESUELTO,CERRADO"
     *
     * @param estados Lista de estados a filtrar
     * @param pageable Paginación
     * @return Page<TicketMesaAyudaResponseDTO>
     */
    @Transactional(readOnly = true)
    public Page<TicketMesaAyudaResponseDTO> obtenerPorEstadosPaginado(List<String> estados, Pageable pageable) {
        log.debug("Obteniendo tickets con estados: {}", estados);
        return ticketRepository.findByEstadoInAndDeletedAtIsNull(estados, pageable)
            .map(this::toResponseDTO);
    }

    /**
     * ✅ v1.67.1: Búsqueda paginada con filtros dinámicos en backend.
     * Construye la query JPQL dinámicamente según los filtros proporcionados.
     * Usa EntityManager para máxima compatibilidad con Hibernate.
     *
     * @param estados       Filtro por estados (CSV: "NUEVO,EN_PROCESO")
     * @param prioridad     Filtro por prioridad exacta (ALTA, MEDIA, BAJA)
     * @param dniPaciente   Búsqueda parcial por DNI
     * @param numeroTicket  Búsqueda parcial por número de ticket
     * @param nombreMedico  Nombre exacto del profesional de salud
     * @param nombreAsignado Nombre exacto del personal asignado
     * @param pageable      Paginación
     * @return Page<TicketMesaAyudaResponseDTO>
     */
    /**
     * Obtener lista de médicos creadores con conteo de tickets
     * @return Lista de mapas con idMedico, nombreMedico, count
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> obtenerMedicosConConteo() {
        List<Object[]> rows = ticketRepository.findMedicosConConteo();
        return rows.stream().map(row -> {
            Map<String, Object> m = new HashMap<>();
            m.put("idMedico", row[0]);
            m.put("nombreMedico", row[1]);
            m.put("count", row[2]);
            return m;
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<TicketMesaAyudaResponseDTO> buscarConFiltros(
            String estados,
            String prioridad,
            String dniPaciente,
            String numeroTicket,
            Long idMedico,
            String nombreAsignado,
            LocalDate fechaDesde,
            LocalDate fechaHasta,
            Pageable pageable) {

        // Normalizar parámetros
        List<String> estadosList = (estados != null && !estados.isBlank())
            ? Arrays.asList(estados.split(",")) : null;
        String prioridadParam = (prioridad != null && !prioridad.isBlank()) ? prioridad : null;
        String dniParam = (dniPaciente != null && !dniPaciente.isBlank()) ? dniPaciente : null;
        String ticketParam = (numeroTicket != null && !numeroTicket.isBlank()) ? numeroTicket : null;
        String asignadoParam = (nombreAsignado != null && !nombreAsignado.isBlank()) ? nombreAsignado : null;

        log.debug("Búsqueda paginada: estados={}, prioridad={}, dni={}, ticket={}, idMedico={}, asignado={}, page={}, size={}",
            estadosList, prioridadParam, dniParam, ticketParam, idMedico, asignadoParam,
            pageable.getPageNumber(), pageable.getPageSize());

        // Construir query dinámicamente
        StringBuilder jpql = new StringBuilder("SELECT t FROM TicketMesaAyuda t WHERE t.deletedAt IS NULL");
        StringBuilder countJpql = new StringBuilder("SELECT COUNT(t) FROM TicketMesaAyuda t WHERE t.deletedAt IS NULL");

        Map<String, Object> params = new HashMap<>();

        if (estadosList != null && !estadosList.isEmpty()) {
            jpql.append(" AND t.estado IN :estados");
            countJpql.append(" AND t.estado IN :estados");
            params.put("estados", estadosList);
        }
        if (prioridadParam != null) {
            jpql.append(" AND t.prioridad = :prioridad");
            countJpql.append(" AND t.prioridad = :prioridad");
            params.put("prioridad", prioridadParam);
        }
        if (dniParam != null) {
            jpql.append(" AND t.dniPaciente LIKE :dniPaciente");
            countJpql.append(" AND t.dniPaciente LIKE :dniPaciente");
            params.put("dniPaciente", "%" + dniParam + "%");
        }
        if (ticketParam != null) {
            jpql.append(" AND t.numeroTicket LIKE :numeroTicket");
            countJpql.append(" AND t.numeroTicket LIKE :numeroTicket");
            params.put("numeroTicket", "%" + ticketParam + "%");
        }
        if (idMedico != null) {
            jpql.append(" AND t.idMedico = :idMedico");
            countJpql.append(" AND t.idMedico = :idMedico");
            params.put("idMedico", idMedico);
        }
        if (asignadoParam != null) {
            jpql.append(" AND t.nombrePersonalAsignado = :nombreAsignado");
            countJpql.append(" AND t.nombrePersonalAsignado = :nombreAsignado");
            params.put("nombreAsignado", asignadoParam);
        }
        if (fechaDesde != null) {
            jpql.append(" AND t.fechaCreacion >= :fechaDesde");
            countJpql.append(" AND t.fechaCreacion >= :fechaDesde");
            params.put("fechaDesde", fechaDesde.atStartOfDay());
        }
        if (fechaHasta != null) {
            jpql.append(" AND t.fechaCreacion < :fechaHasta");
            countJpql.append(" AND t.fechaCreacion < :fechaHasta");
            params.put("fechaHasta", fechaHasta.plusDays(1).atStartOfDay());
        }

        jpql.append(" ORDER BY t.fechaCreacion DESC");

        // Ejecutar count query
        var countQuery = entityManager.createQuery(countJpql.toString(), Long.class);
        params.forEach(countQuery::setParameter);
        long total = countQuery.getSingleResult();

        // Ejecutar data query con paginación
        var dataQuery = entityManager.createQuery(jpql.toString(), TicketMesaAyuda.class);
        params.forEach(dataQuery::setParameter);
        dataQuery.setFirstResult((int) pageable.getOffset());
        dataQuery.setMaxResults(pageable.getPageSize());

        List<TicketMesaAyuda> resultados = dataQuery.getResultList();
        List<TicketMesaAyudaResponseDTO> dtos = resultados.stream()
            .map(this::toResponseDTO)
            .collect(Collectors.toList());

        return new org.springframework.data.domain.PageImpl<>(dtos, pageable, total);
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
     * ✅ v1.67.0: Obtener tickets por idSolicitudBolsa
     * Utilizado para verificar si un paciente ya tiene ticket asociado
     */
    public TicketMesaAyudaResponseDTO obtenerPorNumeroTicket(String numeroTicket) {
        log.debug("Obteniendo ticket para numero_ticket: {}", numeroTicket);
        Optional<TicketMesaAyuda> ticket = ticketRepository.findByNumeroTicketAndDeletedAtIsNull(numeroTicket);
        if (ticket.isEmpty()) {
            log.warn("Ticket no encontrado: {}", numeroTicket);
            throw new RuntimeException("Ticket no encontrado: " + numeroTicket);
        }
        return toResponseDTO(ticket.get());
    }

    @Transactional(readOnly = true)
    public List<TicketMesaAyudaResponseDTO> obtenerPorSolicitudBolsa(Long idSolicitudBolsa) {
        log.debug("Obteniendo tickets para idSolicitudBolsa: {}", idSolicitudBolsa);
        return ticketRepository.findByIdSolicitudBolsaAndDeletedAtIsNullOrderByFechaCreacionDesc(idSolicitudBolsa)
            .stream()
            .map(this::toResponseDTO)
            .collect(Collectors.toList());
    }

    /**
     * Obtener tickets por estado
     * Filtra tickets NUEVOS, EN_PROCESO, RESUELTOS o CERRADOS
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
     * Obtener tickets activos (NUEVO, EN_PROCESO, RESUELTO)
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

        // Validar que el estado sea válido (no NUEVO)
        String nuevoEstado = responderDTO.getEstado();
        if ("NUEVO".equals(nuevoEstado)) {
            throw new IllegalArgumentException("No se puede cambiar a estado NUEVO desde una respuesta");
        }

        // Actualizar campos
        ticket.setRespuesta(responderDTO.getRespuesta());
        ticket.setEstado(nuevoEstado);
        ticket.setIdPersonalMesa(responderDTO.getIdPersonalMesa());
        ticket.setNombrePersonalMesa(responderDTO.getNombrePersonalMesa());
        ticket.setFechaRespuesta(LocalDateTime.now(ZONA_PERU));
        ticket.setFechaActualizacion(LocalDateTime.now(ZONA_PERU));

        // Registrar fecha de atención cuando se resuelve
        if ("RESUELTO".equals(nuevoEstado)) {
            ticket.setFechaAtencion(LocalDateTime.now(ZONA_PERU));
        }

        TicketMesaAyuda updated = ticketRepository.save(ticket);
        log.info("Ticket respondido exitosamente");

        return toResponseDTO(updated);
    }

    // ========== CAMBIAR ESTADO ==========

    /**
     * Cambiar el estado de un ticket
     * Estados válidos: NUEVO, EN_PROCESO, RESUELTO, CERRADO
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
        List<String> estadosValidos = List.of("NUEVO", "EN_PROCESO", "RESUELTO");
        if (!estadosValidos.contains(nuevoEstado)) {
            throw new IllegalArgumentException("Estado no válido: " + nuevoEstado);
        }

        // Ticket RESUELTO no puede cambiar de estado
        if ("RESUELTO".equals(ticket.getEstado())) {
            throw new IllegalArgumentException("No se puede cambiar el estado de un ticket ya resuelto");
        }

        ticket.setEstado(nuevoEstado);
        ticket.setFechaActualizacion(LocalDateTime.now(ZONA_PERU));

        // Si es la primera respuesta, registrar fecha
        if (ticket.getFechaRespuesta() == null && !nuevoEstado.equals("NUEVO")) {
            ticket.setFechaRespuesta(LocalDateTime.now(ZONA_PERU));
        }

        // Registrar fecha de atención cuando se resuelve
        if ("RESUELTO".equals(nuevoEstado)) {
            ticket.setFechaAtencion(LocalDateTime.now(ZONA_PERU));
        }

        TicketMesaAyuda updated = ticketRepository.save(ticket);
        log.info("Estado cambiado exitosamente");

        return toResponseDTO(updated);
    }

    // ========== PERSONAL MESA DE AYUDA ==========

    /**
     * Obtener lista de personal con rol MESA_DE_AYUDA
     * Utilizado para el dropdown de asignación de tickets
     *
     * @return Lista de mapas con id_pers y nombre_completo
     */
    @Transactional(readOnly = true)
    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> obtenerPersonalMesaAyuda() {
        log.debug("Obteniendo personal con rol MESA_DE_AYUDA");

        String sql = """
            SELECT p.id_pers,
                   CONCAT(p.nom_pers, ' ', p.ape_pater_pers, ' ', p.ape_mater_pers) AS nombre_completo
            FROM dim_personal_cnt p
            JOIN dim_usuarios u ON p.id_usuario = u.id_user
            JOIN rel_user_roles ur ON u.id_user = ur.id_user
            JOIN dim_roles r ON ur.id_rol = r.id_rol
            WHERE r.desc_rol ILIKE '%mesa%ayuda%'
            ORDER BY p.nom_pers
            """;

        List<Object[]> results = entityManager.createNativeQuery(sql).getResultList();

        List<Map<String, Object>> personal = new ArrayList<>();
        for (Object[] row : results) {
            Map<String, Object> item = new HashMap<>();
            item.put("idPersonal", ((Number) row[0]).longValue());
            item.put("nombreCompleto", row[1]);
            personal.add(item);
        }

        log.debug("Personal Mesa de Ayuda encontrado: {}", personal.size());
        return personal;
    }

    // ========== ASIGNAR / DESASIGNAR TICKET ==========

    /**
     * Asignar un personal de Mesa de Ayuda a un ticket
     *
     * @param id ID del ticket
     * @param idPersonal ID del personal a asignar
     * @param nombrePersonal Nombre del personal a asignar
     * @return TicketMesaAyudaResponseDTO actualizado
     */
    public TicketMesaAyudaResponseDTO asignarTicket(Long id, Long idPersonal, String nombrePersonal) {
        log.info("Asignando ticket {} al personal: {} ({})", id, nombrePersonal, idPersonal);

        TicketMesaAyuda ticket = ticketRepository.findByIdAndDeletedAtIsNull(id)
            .orElseThrow(() -> new IllegalArgumentException("Ticket no encontrado con ID: " + id));

        if ("RESUELTO".equals(ticket.getEstado())) {
            throw new IllegalArgumentException("No se puede reasignar un ticket ya resuelto");
        }

        // Ticket ya asignado no puede cambiar de personal
        if (ticket.getIdPersonalAsignado() != null) {
            throw new IllegalArgumentException("Este ticket ya está asignado a " + ticket.getNombrePersonalAsignado() + ". La asignación es permanente.");
        }

        ticket.setIdPersonalAsignado(idPersonal);
        ticket.setNombrePersonalAsignado(nombrePersonal);
        ticket.setFechaAsignacion(LocalDateTime.now(ZONA_PERU));
        ticket.setFechaActualizacion(LocalDateTime.now(ZONA_PERU));

        // Al asignar personal, el estado cambia automáticamente a EN_PROCESO
        if ("NUEVO".equals(ticket.getEstado())) {
            ticket.setEstado("EN_PROCESO");
            ticket.setFechaRespuesta(LocalDateTime.now(ZONA_PERU));
        }

        TicketMesaAyuda updated = ticketRepository.save(ticket);
        log.info("Ticket {} asignado exitosamente a {}", id, nombrePersonal);

        return toResponseDTO(updated);
    }

    /**
     * Desasignar el personal de un ticket
     * SOLO permitido para SUPERADMIN (validado en el Controller con @PreAuthorize)
     *
     * @param id ID del ticket
     * @return TicketMesaAyudaResponseDTO actualizado
     */
    public TicketMesaAyudaResponseDTO desasignarTicket(Long id) {
        log.info("SUPERADMIN desasignando ticket {}", id);

        TicketMesaAyuda ticket = ticketRepository.findByIdAndDeletedAtIsNull(id)
            .orElseThrow(() -> new IllegalArgumentException("Ticket no encontrado con ID: " + id));

        ticket.setIdPersonalAsignado(null);
        ticket.setNombrePersonalAsignado(null);
        ticket.setFechaAsignacion(null);
        ticket.setFechaActualizacion(LocalDateTime.now(ZONA_PERU));

        TicketMesaAyuda updated = ticketRepository.save(ticket);
        log.info("Ticket {} desasignado exitosamente por SUPERADMIN", id);

        return toResponseDTO(updated);
    }

    // ========== ACTUALIZAR TELÉFONOS ==========

    /**
     * Actualizar teléfonos del paciente asociado a un ticket
     * Actualiza en la tabla asegurados (fuente real) y en el ticket para coherencia
     *
     * @param ticketId ID del ticket
     * @param telPrincipal Teléfono principal (tel_fijo en asegurados)
     * @param telAlterno Teléfono alterno (tel_celular en asegurados)
     * @return TicketMesaAyudaResponseDTO actualizado
     */
    public TicketMesaAyudaResponseDTO actualizarTelefonos(Long ticketId, String telPrincipal, String telAlterno) {
        log.info("Actualizando teléfonos del ticket {}: principal={}, alterno={}", ticketId, telPrincipal, telAlterno);

        TicketMesaAyuda ticket = ticketRepository.findByIdAndDeletedAtIsNull(ticketId)
            .orElseThrow(() -> new IllegalArgumentException("Ticket no encontrado con ID: " + ticketId));

        String dni = ticket.getDniPaciente();
        if (dni == null || dni.isBlank()) {
            throw new IllegalArgumentException("El ticket no tiene DNI de paciente asociado");
        }

        // Actualizar en tabla asegurados (fuente real de teléfonos)
        entityManager.createNativeQuery(
            "UPDATE asegurados SET tel_fijo = :telFijo, tel_celular = :telCelular WHERE doc_paciente = :dni")
            .setParameter("telFijo", telPrincipal)
            .setParameter("telCelular", telAlterno)
            .setParameter("dni", dni)
            .executeUpdate();

        // Actualizar teléfono principal en el ticket para coherencia
        ticket.setTelefonoPaciente(telPrincipal);
        ticket.setFechaActualizacion(LocalDateTime.now(ZONA_PERU));
        ticketRepository.save(ticket);

        log.info("Teléfonos actualizados exitosamente para DNI: {}", dni);
        return toResponseDTO(ticket);
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
        Long ticketsNuevos = ticketRepository.countByEstadoAndDeletedAtIsNull("NUEVO");
        Long ticketsEnProceso = ticketRepository.countByEstadoAndDeletedAtIsNull("EN_PROCESO");
        Long ticketsResueltos = ticketRepository.countByEstadoAndDeletedAtIsNull("RESUELTO");

        return KPIsTicketDTO.builder()
            .totalTickets(totalTickets)
            .ticketsAbiertos(ticketsNuevos)
            .ticketsEnProceso(ticketsEnProceso)
            .ticketsResueltos(ticketsResueltos)
            .ticketsCerrados(0L)
            .tasaResolucion(totalTickets > 0 ? (ticketsResueltos.doubleValue() / totalTickets) * 100 : 0.0)
            .build();
    }

    // ========== ESTADÍSTICAS COMPLETAS ==========

    /**
     * Obtener estadísticas completas de Mesa de Ayuda
     * Incluye: totales, por estado, prioridad, motivo, personal y evolución diaria
     */
    @Transactional(readOnly = true)
    public Map<String, Object> obtenerEstadisticas() {
        log.info("Calculando estadísticas completas de Mesa de Ayuda");
        Map<String, Object> result = new HashMap<>();

        // 1. Totales por estado
        long total      = ticketRepository.countByDeletedAtIsNull();
        long nuevos     = ticketRepository.countByEstadoAndDeletedAtIsNull("NUEVO");
        long enProceso  = ticketRepository.countByEstadoAndDeletedAtIsNull("EN_PROCESO");
        long resueltos  = ticketRepository.countByEstadoAndDeletedAtIsNull("RESUELTO");
        double tasa     = total > 0 ? (resueltos * 100.0 / total) : 0.0;

        Map<String, Object> resumen = new HashMap<>();
        resumen.put("total", total);
        resumen.put("nuevos", nuevos);
        resumen.put("enProceso", enProceso);
        resumen.put("resueltos", resueltos);
        resumen.put("tasaResolucion", Math.round(tasa * 10.0) / 10.0);
        result.put("resumen", resumen);

        // 2. Por prioridad
        List<Map<String, Object>> porPrioridad = new ArrayList<>();
        for (String p : List.of("ALTA", "MEDIA", "BAJA")) {
            long cnt = ticketRepository.countByPrioridadAndDeletedAtIsNull(p);
            Map<String, Object> row = new HashMap<>();
            row.put("prioridad", p);
            row.put("cantidad", cnt);
            porPrioridad.add(row);
        }
        result.put("porPrioridad", porPrioridad);

        // 3. Por motivo (top 6)
        List<Object[]> motivosRaw = entityManager.createNativeQuery(
            "SELECT m.descripcion, COUNT(t.id) AS cnt " +
            "FROM dim_ticket_mesa_ayuda t " +
            "JOIN dim_motivos_mesadeayuda m ON t.id_motivo = m.id " +
            "WHERE t.deleted_at IS NULL " +
            "GROUP BY m.descripcion ORDER BY cnt DESC LIMIT 6"
        ).getResultList();
        List<Map<String, Object>> porMotivo = new ArrayList<>();
        for (Object[] row : motivosRaw) {
            Map<String, Object> m = new HashMap<>();
            m.put("motivo", row[0]);
            m.put("cantidad", ((Number) row[1]).longValue());
            porMotivo.add(m);
        }
        result.put("porMotivo", porMotivo);

        // 4. Por personal asignado (top 5 resueltos)
        List<Object[]> personalRaw = entityManager.createNativeQuery(
            "SELECT nombre_personal_asignado, COUNT(id) AS cnt " +
            "FROM dim_ticket_mesa_ayuda " +
            "WHERE deleted_at IS NULL AND nombre_personal_asignado IS NOT NULL " +
            "GROUP BY nombre_personal_asignado ORDER BY cnt DESC LIMIT 5"
        ).getResultList();
        List<Map<String, Object>> porPersonal = new ArrayList<>();
        for (Object[] row : personalRaw) {
            Map<String, Object> m = new HashMap<>();
            m.put("personal", row[0]);
            m.put("cantidad", ((Number) row[1]).longValue());
            porPersonal.add(m);
        }
        result.put("porPersonal", porPersonal);

        // 4b. Detalle por personal (para ranking y vista individual)
        List<Object[]> personalDetalleRaw = entityManager.createNativeQuery(
            "SELECT " +
            "  nombre_personal_asignado, " +
            "  COUNT(*) AS total, " +
            "  COUNT(CASE WHEN estado = 'RESUELTO' THEN 1 END) AS resueltos, " +
            "  COUNT(CASE WHEN estado = 'EN_PROCESO' THEN 1 END) AS en_proceso, " +
            "  COUNT(CASE WHEN estado = 'NUEVO' THEN 1 END) AS nuevos, " +
            "  COUNT(CASE WHEN estado = 'CERRADO' THEN 1 END) AS cerrados, " +
            "  COALESCE(AVG(CASE WHEN estado = 'RESUELTO' AND fecha_atencion IS NOT NULL " +
            "    THEN EXTRACT(EPOCH FROM (fecha_atencion - fecha_creacion))/60 END), 0) AS tprom " +
            "FROM dim_ticket_mesa_ayuda " +
            "WHERE deleted_at IS NULL AND nombre_personal_asignado IS NOT NULL " +
            "GROUP BY nombre_personal_asignado " +
            "ORDER BY total DESC"
        ).getResultList();
        List<Map<String, Object>> porPersonalDetalle = new ArrayList<>();
        for (Object[] row : personalDetalleRaw) {
            long tot = ((Number) row[1]).longValue();
            long res = ((Number) row[2]).longValue();
            Map<String, Object> m = new HashMap<>();
            m.put("personal", row[0]);
            m.put("total", tot);
            m.put("resueltos", res);
            m.put("enProceso", ((Number) row[3]).longValue());
            m.put("nuevos", ((Number) row[4]).longValue());
            m.put("cerrados", ((Number) row[5]).longValue());
            m.put("tasaResolucion", tot > 0 ? Math.round((res * 100.0 / tot) * 10.0) / 10.0 : 0.0);
            m.put("tiempoPromedioMinutos", ((Number) row[6]).longValue());
            porPersonalDetalle.add(m);
        }
        result.put("porPersonalDetalle", porPersonalDetalle);

        // 5. Tiempo promedio de resolución (minutos)
        Object tiempoRaw = entityManager.createNativeQuery(
            "SELECT AVG(EXTRACT(EPOCH FROM (fecha_atencion - fecha_creacion))/60) " +
            "FROM dim_ticket_mesa_ayuda " +
            "WHERE deleted_at IS NULL AND estado = 'RESUELTO' AND fecha_atencion IS NOT NULL"
        ).getSingleResult();
        long tiempoPromedio = tiempoRaw != null ? ((Number) tiempoRaw).longValue() : 0L;
        result.put("tiempoPromedioMinutos", tiempoPromedio);

        // 6. Tickets por día (últimos 7 días)
        List<Object[]> diasRaw = entityManager.createNativeQuery(
            "SELECT DATE(fecha_creacion AT TIME ZONE 'America/Lima') AS dia, COUNT(id) " +
            "FROM dim_ticket_mesa_ayuda " +
            "WHERE deleted_at IS NULL AND fecha_creacion >= NOW() - INTERVAL '7 days' " +
            "GROUP BY dia ORDER BY dia"
        ).getResultList();
        List<Map<String, Object>> porDia = new ArrayList<>();
        for (Object[] row : diasRaw) {
            Map<String, Object> m = new HashMap<>();
            m.put("fecha", row[0].toString());
            m.put("cantidad", ((Number) row[1]).longValue());
            porDia.add(m);
        }
        result.put("porDia", porDia);

        return result;
    }

    // ========== ESTADÍSTICAS POR PERSONAL Y PERÍODO ==========

    /**
     * Estadísticas detalladas de un operador filtradas por período.
     * periodo: "dia" | "semana" | "mes" | "ano"
     */
    @Transactional(readOnly = true)
    public Map<String, Object> obtenerEstadisticasPersonal(String nombre, String periodo) {
        log.info("Calculando estadísticas de '{}' para periodo '{}'", nombre, periodo);

        // Cláusula WHERE de período (hora Lima)
        String filtroFecha = switch (periodo) {
            case "dia"    -> "AND DATE(t.fecha_creacion AT TIME ZONE 'America/Lima') = CURRENT_DATE";
            case "semana" -> "AND t.fecha_creacion >= DATE_TRUNC('week',  NOW() AT TIME ZONE 'America/Lima') AT TIME ZONE 'America/Lima'";
            case "ano"    -> "AND t.fecha_creacion >= DATE_TRUNC('year',  NOW() AT TIME ZONE 'America/Lima') AT TIME ZONE 'America/Lima'";
            default       -> "AND t.fecha_creacion >= DATE_TRUNC('month', NOW() AT TIME ZONE 'America/Lima') AT TIME ZONE 'America/Lima'";
        };

        Map<String, Object> result = new HashMap<>();

        // 1. KPIs del operador en el período
        Object[] row = (Object[]) entityManager.createNativeQuery(
            "SELECT " +
            "  COUNT(*) AS total, " +
            "  COUNT(CASE WHEN t.estado = 'RESUELTO'    THEN 1 END) AS resueltos, " +
            "  COUNT(CASE WHEN t.estado = 'EN_PROCESO'  THEN 1 END) AS en_proceso, " +
            "  COUNT(CASE WHEN t.estado = 'NUEVO'       THEN 1 END) AS nuevos, " +
            "  COUNT(CASE WHEN t.estado = 'CERRADO'     THEN 1 END) AS cerrados, " +
            "  COALESCE(AVG(CASE WHEN t.estado = 'RESUELTO' AND t.fecha_atencion IS NOT NULL " +
            "    THEN EXTRACT(EPOCH FROM (t.fecha_atencion - t.fecha_creacion))/60 END), 0) " +
            "FROM dim_ticket_mesa_ayuda t " +
            "WHERE t.deleted_at IS NULL " +
            "  AND t.nombre_personal_asignado = :nombre " +
            filtroFecha
        ).setParameter("nombre", nombre).getSingleResult();

        long total     = ((Number) row[0]).longValue();
        long resueltos = ((Number) row[1]).longValue();
        double tasa    = total > 0 ? Math.round((resueltos * 100.0 / total) * 10.0) / 10.0 : 0.0;

        Map<String, Object> kpis = new HashMap<>();
        kpis.put("total",                total);
        kpis.put("resueltos",            resueltos);
        kpis.put("enProceso",            ((Number) row[2]).longValue());
        kpis.put("nuevos",               ((Number) row[3]).longValue());
        kpis.put("cerrados",             ((Number) row[4]).longValue());
        kpis.put("tasaResolucion",       tasa);
        kpis.put("tiempoPromedioMinutos", ((Number) row[5]).longValue());
        result.put("kpis", kpis);

        // 2. Evolución en el período (agrupación según granularidad)
        String groupExpr, labelExpr, orderExpr;
        if ("dia".equals(periodo)) {
            // Por hora
            groupExpr = "DATE_TRUNC('hour', t.fecha_creacion AT TIME ZONE 'America/Lima')";
            labelExpr = "TO_CHAR(" + groupExpr + ", 'HH24:MI')";
            orderExpr = groupExpr;
        } else if ("semana".equals(periodo)) {
            // Por día
            groupExpr = "DATE(t.fecha_creacion AT TIME ZONE 'America/Lima')";
            labelExpr = "TO_CHAR(" + groupExpr + ", 'DD Mon')";
            orderExpr = groupExpr;
        } else if ("ano".equals(periodo)) {
            // Por mes
            groupExpr = "DATE_TRUNC('month', t.fecha_creacion AT TIME ZONE 'America/Lima')";
            labelExpr = "TO_CHAR(" + groupExpr + ", 'Mon YYYY')";
            orderExpr = groupExpr;
        } else {
            // mes → por día
            groupExpr = "DATE(t.fecha_creacion AT TIME ZONE 'America/Lima')";
            labelExpr = "TO_CHAR(" + groupExpr + ", 'DD Mon')";
            orderExpr = groupExpr;
        }

        @SuppressWarnings("unchecked")
        List<Object[]> evolucionRaw = entityManager.createNativeQuery(
            "SELECT " + labelExpr + " AS etiqueta, COUNT(*) AS cnt " +
            "FROM dim_ticket_mesa_ayuda t " +
            "WHERE t.deleted_at IS NULL " +
            "  AND t.nombre_personal_asignado = :nombre " +
            filtroFecha +
            " GROUP BY " + groupExpr + " ORDER BY " + orderExpr
        ).setParameter("nombre", nombre).getResultList();

        List<Map<String, Object>> evolucion = new ArrayList<>();
        for (Object[] r : evolucionRaw) {
            Map<String, Object> m = new HashMap<>();
            m.put("etiqueta", r[0]);
            m.put("cantidad", ((Number) r[1]).longValue());
            evolucion.add(m);
        }
        result.put("evolucion", evolucion);

        // 3. Distribución por prioridad en el período
        @SuppressWarnings("unchecked")
        List<Object[]> prioridadRaw = entityManager.createNativeQuery(
            "SELECT t.prioridad, COUNT(*) " +
            "FROM dim_ticket_mesa_ayuda t " +
            "WHERE t.deleted_at IS NULL " +
            "  AND t.nombre_personal_asignado = :nombre " +
            filtroFecha +
            " GROUP BY t.prioridad"
        ).setParameter("nombre", nombre).getResultList();

        List<Map<String, Object>> porPrioridad = new ArrayList<>();
        for (Object[] r : prioridadRaw) {
            Map<String, Object> m = new HashMap<>();
            m.put("prioridad", r[0]);
            m.put("cantidad", ((Number) r[1]).longValue());
            porPrioridad.add(m);
        }
        result.put("porPrioridad", porPrioridad);

        result.put("periodo", periodo);
        result.put("nombre", nombre);
        return result;
    }

    // ========== BOLSA DE REPROGRAMACIÓN ==========

    /**
     * Enviar paciente del ticket a la Bolsa de Reprogramación (BOLSA_MESA_DE_AYUDA)
     * Crea una nueva entrada en dim_solicitud_bolsa con id_bolsa=13
     *
     * Si el paciente ya está en esa bolsa, retorna mensaje informativo sin error.
     *
     * @param ticketId ID del ticket con datos del paciente
     * @return Map con mensaje y numeroSolicitud (o mensaje ya existente)
     */
    @Transactional
    public Map<String, Object> enviarABolsaReprogramacion(Long ticketId) {
        log.info("Enviando paciente a Bolsa Reprogramación - Ticket ID: {}", ticketId);

        TicketMesaAyuda ticket = ticketRepository.findByIdAndDeletedAtIsNull(ticketId)
            .orElseThrow(() -> new IllegalArgumentException("Ticket no encontrado con ID: " + ticketId));

        String dniPaciente = ticket.getDniPaciente();
        if (dniPaciente == null || dniPaciente.isBlank()) {
            throw new IllegalArgumentException("El ticket no tiene DNI de paciente para enviar a la bolsa");
        }

        final Long ID_BOLSA_MESA_DE_AYUDA = 13L;
        final Long ID_ESTADO_PENDIENTE_CITA = 11L;
        final Long ID_SERVICIO_DEFAULT = 1L;

        // Verificar si el paciente ya está en la bolsa
        boolean yaExiste = solicitudBolsaRepository.existsByIdBolsaAndPacienteId(
            ID_BOLSA_MESA_DE_AYUDA, dniPaciente);

        if (yaExiste) {
            log.info("Paciente {} ya existe en BOLSA_MESA_DE_AYUDA, omitiendo duplicado", dniPaciente);
            Map<String, Object> response = new HashMap<>();
            response.put("mensaje", "El paciente ya se encontraba en la Bolsa de Reprogramación");
            response.put("yaExistia", true);
            return response;
        }

        // Generar número de solicitud único
        String numeroSolicitud = String.format("MESA-%d-%d", ticketId, System.currentTimeMillis());

        SolicitudBolsa solicitud = SolicitudBolsa.builder()
            .numeroSolicitud(numeroSolicitud)
            .pacienteId(dniPaciente)
            .pacienteDni(dniPaciente)
            .pacienteNombre(ticket.getNombrePaciente() != null ? ticket.getNombrePaciente() : "SIN NOMBRE")
            .especialidad(ticket.getEspecialidad())
            .tipoDocumento(ticket.getTipoDocumento() != null ? ticket.getTipoDocumento() : "DNI")
            .idBolsa(ID_BOLSA_MESA_DE_AYUDA)
            .idServicio(ID_SERVICIO_DEFAULT)
            .estadoGestionCitasId(ID_ESTADO_PENDIENTE_CITA)
            .estado("PENDIENTE")
            .activo(true)
            .build();

        solicitudBolsaRepository.save(solicitud);
        log.info("Paciente {} enviado exitosamente a BOLSA_MESA_DE_AYUDA - Solicitud: {}",
            dniPaciente, numeroSolicitud);

        Map<String, Object> response = new HashMap<>();
        response.put("mensaje", "Paciente enviado exitosamente a la Bolsa de Reprogramación");
        response.put("numeroSolicitud", numeroSolicitud);
        response.put("yaExistia", false);
        return response;
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

        // Obtener descripción y código del motivo si existe
        String nombreMotivo = null;
        String codigoMotivo = null;
        if (ticket.getIdMotivo() != null) {
            Optional<DimMotivosMesaAyuda> motivoOpt = motivoRepository.findById(ticket.getIdMotivo());
            if (motivoOpt.isPresent()) {
                nombreMotivo = motivoOpt.get().getDescripcion();
                codigoMotivo = motivoOpt.get().getCodigo();
            }
        }

        // Obtener teléfonos del paciente desde tabla asegurados (por DNI)
        String telefonoPrincipal = ticket.getTelefonoPaciente();
        String telefonoAlterno = null;
        if (ticket.getDniPaciente() != null && !ticket.getDniPaciente().isBlank()) {
            try {
                @SuppressWarnings("unchecked")
                List<Object[]> telResult = entityManager.createNativeQuery(
                    "SELECT tel_fijo, tel_celular FROM asegurados WHERE doc_paciente = :dni LIMIT 1")
                    .setParameter("dni", ticket.getDniPaciente())
                    .getResultList();
                if (!telResult.isEmpty()) {
                    Object[] row = telResult.get(0);
                    if (telefonoPrincipal == null || telefonoPrincipal.isBlank()) {
                        telefonoPrincipal = row[0] != null ? row[0].toString() : null;
                    }
                    telefonoAlterno = row[1] != null ? row[1].toString() : null;
                }
            } catch (Exception e) {
                log.warn("No se pudieron obtener teléfonos del asegurado {}: {}", ticket.getDniPaciente(), e.getMessage());
            }
        }

        return TicketMesaAyudaResponseDTO.builder()
            .id(ticket.getId())
            .titulo(ticket.getTitulo())
            .descripcion(ticket.getDescripcion())
            .estado(ticket.getEstado())
            .prioridad(ticket.getPrioridad())
            .nombreMedico(ticket.getNombreMedico())
            .idMedico(ticket.getIdMedico())
            .tipoDocumento(ticket.getTipoDocumento())
            .dniPaciente(ticket.getDniPaciente())
            .nombrePaciente(ticket.getNombrePaciente())
            .especialidad(ticket.getEspecialidad())
            .ipress(ticket.getIpress())
            .idSolicitudBolsa(ticket.getIdSolicitudBolsa())
            .telefonoPaciente(telefonoPrincipal)
            .telefonoPacienteAlterno(telefonoAlterno)
            .respuesta(ticket.getRespuesta())
            .nombrePersonalMesa(ticket.getNombrePersonalMesa())
            .fechaCreacion(ticket.getFechaCreacion())
            .fechaRespuesta(ticket.getFechaRespuesta())
            .fechaActualizacion(ticket.getFechaActualizacion())
            .horasDesdeCreacion(horasDesdeCreacion)
            .idMotivo(ticket.getIdMotivo())
            .codigoMotivo(codigoMotivo)
            .nombreMotivo(nombreMotivo)
            .observaciones(ticket.getObservaciones())
            .numeroTicket(ticket.getNumeroTicket())
            .idPersonalAsignado(ticket.getIdPersonalAsignado())
            .nombrePersonalAsignado(ticket.getNombrePersonalAsignado())
            .fechaAsignacion(ticket.getFechaAsignacion())
            .fechaAtencion(ticket.getFechaAtencion())
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

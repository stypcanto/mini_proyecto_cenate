package com.styp.cenate.service.disponibilidad.impl;

import com.styp.cenate.dto.*;
import com.styp.cenate.model.*;
import com.styp.cenate.repository.*;
import com.styp.cenate.service.auditlog.AuditLogService;
import com.styp.cenate.service.disponibilidad.IDisponibilidadService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 🔧 Implementación del servicio de gestión de disponibilidad de turnos médicos.
 *
 * Responsabilidades principales:
 * - Calcular horas según régimen laboral (728/CAS: 4h/8h, Locador: 6h/12h)
 * - Validar estados y transiciones
 * - Auditar todas las operaciones críticas
 * - Mapear entre entidades y DTOs
 *
 * @author Ing. Styp Canto Rondon
 * @version 1.0.0
 * @since 2025-12-27
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class DisponibilidadServiceImpl implements IDisponibilidadService {

    // ==========================================================
    // DEPENDENCIAS INYECTADAS
    // ==========================================================
    private final DisponibilidadMedicaRepository disponibilidadRepository;
    private final DetalleDisponibilidadRepository detalleRepository;
    private final PersonalCntRepository personalRepository;
    private final UsuarioRepository usuarioRepository;
    private final DimServicioEssiRepository especialidadRepository;
    private final AuditLogService auditLogService;

    // ==========================================================
    // MÉTODOS PARA MÉDICO - CREAR Y ACTUALIZAR
    // ==========================================================

    @Override
    @Transactional
    public DisponibilidadResponse crear(DisponibilidadCreateRequest request) {
        log.info("Creando disponibilidad para periodo: {}, especialidad: {}", request.getPeriodo(), request.getIdEspecialidad());

        // Obtener médico autenticado
        PersonalCnt medico = obtenerMedicoAutenticado();

        // Validar que no exista disponibilidad para ese periodo y especialidad
        if (disponibilidadRepository.existsByPersonalIdPersAndPeriodoAndEspecialidadIdServicio(
                medico.getIdPers(), request.getPeriodo(), request.getIdEspecialidad())) {
            throw new RuntimeException("Ya existe una disponibilidad para el periodo " + request.getPeriodo() +
                                     " y la especialidad seleccionada");
        }

        // Obtener especialidad
        DimServicioEssi especialidad = especialidadRepository.findById(request.getIdEspecialidad())
                .orElseThrow(() -> new RuntimeException("Especialidad no encontrada"));

        // Crear disponibilidad
        DisponibilidadMedica disponibilidad = DisponibilidadMedica.builder()
                .personal(medico)
                .especialidad(especialidad)
                .periodo(request.getPeriodo())
                .estado("BORRADOR")
                .observaciones(request.getObservaciones())
                .fechaCreacion(OffsetDateTime.now())
                .totalHoras(BigDecimal.ZERO)
                .horasRequeridas(new BigDecimal("150.00"))
                .build();

        // Crear detalles y calcular horas
        if (request.getDetalles() != null && !request.getDetalles().isEmpty()) {
            Set<DetalleDisponibilidad> detalles = new HashSet<>();
            BigDecimal totalHoras = BigDecimal.ZERO;

            for (DetalleDisponibilidadRequest detalleReq : request.getDetalles()) {
                BigDecimal horas = calcularHorasPorTurno(medico, detalleReq.getTurno());

                DetalleDisponibilidad detalle = DetalleDisponibilidad.builder()
                        .disponibilidad(disponibilidad)
                        .fecha(detalleReq.getFecha())
                        .turno(detalleReq.getTurno())
                        .horas(horas)
                        .build();

                detalles.add(detalle);
                totalHoras = totalHoras.add(horas);
            }

            disponibilidad.setDetalles(detalles);
            disponibilidad.setTotalHoras(totalHoras);
        }

        // Guardar
        disponibilidad = disponibilidadRepository.save(disponibilidad);

        // Auditar
        auditar("CREATE_DISPONIBILIDAD",
                String.format("Médico: %s, Periodo: %s, Especialidad: %s",
                        medico.getNombreCompleto(), request.getPeriodo(), especialidad.getDescServicio()),
                "INFO", "SUCCESS");

        log.info("Disponibilidad creada con ID: {}", disponibilidad.getIdDisponibilidad());
        return mapearAResponse(disponibilidad);
    }

    @Override
    @Transactional
    public DisponibilidadResponse actualizar(Long id, DisponibilidadUpdateRequest request) {
        log.info("Actualizando disponibilidad ID: {}", id);

        DisponibilidadMedica disponibilidad = obtenerDisponibilidadConPermiso(id);

        // Validar que se pueda editar
        if (!disponibilidad.puedeEditar()) {
            throw new RuntimeException("No se puede editar una disponibilidad en estado " + disponibilidad.getEstado());
        }

        // Actualizar observaciones
        disponibilidad.setObservaciones(request.getObservaciones());

        // Actualizar detalles
        if (request.getDetalles() != null) {
            // Eliminar detalles existentes
            disponibilidad.getDetalles().clear();
            detalleRepository.flush();

            // Crear nuevos detalles
            BigDecimal totalHoras = BigDecimal.ZERO;
            for (DetalleDisponibilidadRequest detalleReq : request.getDetalles()) {
                BigDecimal horas = calcularHorasPorTurno(disponibilidad.getPersonal(), detalleReq.getTurno());

                DetalleDisponibilidad detalle = DetalleDisponibilidad.builder()
                        .disponibilidad(disponibilidad)
                        .fecha(detalleReq.getFecha())
                        .turno(detalleReq.getTurno())
                        .horas(horas)
                        .build();

                disponibilidad.getDetalles().add(detalle);
                totalHoras = totalHoras.add(horas);
            }

            disponibilidad.setTotalHoras(totalHoras);
        }

        disponibilidad = disponibilidadRepository.save(disponibilidad);

        auditar("UPDATE_DISPONIBILIDAD",
                String.format("ID: %d, Total horas: %.2f", id, disponibilidad.getTotalHoras()),
                "INFO", "SUCCESS");

        log.info("Disponibilidad actualizada ID: {}", id);
        return mapearAResponse(disponibilidad);
    }

    @Override
    @Transactional
    public DisponibilidadResponse guardarBorrador(DisponibilidadCreateRequest request) {
        log.info("Guardando borrador para periodo: {}, especialidad: {}", request.getPeriodo(), request.getIdEspecialidad());

        PersonalCnt medico = obtenerMedicoAutenticado();

        // Verificar si ya existe
        Optional<DisponibilidadMedica> existente = disponibilidadRepository
                .findByPersonalIdPersAndPeriodoAndEspecialidadIdServicio(
                        medico.getIdPers(), request.getPeriodo(), request.getIdEspecialidad());

        if (existente.isPresent()) {
            // Actualizar existente
            DisponibilidadUpdateRequest updateRequest = DisponibilidadUpdateRequest.builder()
                    .observaciones(request.getObservaciones())
                    .detalles(request.getDetalles())
                    .build();
            return actualizar(existente.get().getIdDisponibilidad(), updateRequest);
        } else {
            // Crear nuevo
            return crear(request);
        }
    }

    // ==========================================================
    // MÉTODOS PARA MÉDICO - ENVIAR
    // ==========================================================

    @Override
    @Transactional
    public DisponibilidadResponse enviar(Long id) {
        log.info("Enviando disponibilidad ID: {}", id);

        DisponibilidadMedica disponibilidad = obtenerDisponibilidadConPermiso(id);

        // Validar que esté en estado BORRADOR
        if (!disponibilidad.isBorrador()) {
            throw new RuntimeException("Solo se pueden enviar disponibilidades en estado BORRADOR");
        }

        // Validar horas mínimas
        Map<String, Object> validacion = validarHoras(id);
        Boolean cumpleMinimo = (Boolean) validacion.get("cumpleMinimo");

        if (!cumpleMinimo) {
            BigDecimal horasFaltantes = (BigDecimal) validacion.get("horasFaltantes");
            throw new RuntimeException(String.format(
                    "No se puede enviar. Faltan %.2f horas para completar el mínimo de 150 horas",
                    horasFaltantes));
        }

        // Cambiar estado
        disponibilidad.enviar();
        disponibilidad = disponibilidadRepository.save(disponibilidad);

        auditar("SUBMIT_DISPONIBILIDAD",
                String.format("ID: %d, Médico: %s, Total horas: %.2f",
                        id, disponibilidad.getNombreCompleto(), disponibilidad.getTotalHoras()),
                "INFO", "SUCCESS");

        log.info("Disponibilidad enviada ID: {}", id);
        return mapearAResponse(disponibilidad);
    }

    // ==========================================================
    // MÉTODOS PARA MÉDICO - CONSULTAS
    // ==========================================================

    @Override
    public List<DisponibilidadResponse> listarMisDisponibilidades() {
        PersonalCnt medico = obtenerMedicoAutenticado();

        List<DisponibilidadMedica> disponibilidades = disponibilidadRepository
                .findByPersonalIdPersWithDetails(medico.getIdPers());

        return disponibilidades.stream()
                .map(this::mapearAResponse)
                .collect(Collectors.toList());
    }

    @Override
    public DisponibilidadResponse obtenerMiDisponibilidad(String periodo, Long idEspecialidad) {
        PersonalCnt medico = obtenerMedicoAutenticado();

        return disponibilidadRepository
                .findByPersonalIdPersAndPeriodoAndEspecialidadIdServicio(
                        medico.getIdPers(), periodo, idEspecialidad)
                .map(this::mapearAResponse)
                .orElse(null);
    }

    @Override
    public boolean existeMiDisponibilidad(String periodo, Long idEspecialidad) {
        PersonalCnt medico = obtenerMedicoAutenticado();

        return disponibilidadRepository.existsByPersonalIdPersAndPeriodoAndEspecialidadIdServicio(
                medico.getIdPers(), periodo, idEspecialidad);
    }

    @Override
    public DisponibilidadResponse obtenerPorId(Long id) {
        DisponibilidadMedica disponibilidad = disponibilidadRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new RuntimeException("Disponibilidad no encontrada"));

        // Verificar permiso (médico solo ve las suyas, coordinador/admin ve todas)
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario usuario = usuarioRepository.findByNameUser(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        boolean esCoordinadorOAdmin = usuario.getRoles().stream()
                .anyMatch(r -> r.getDescRol().matches("SUPERADMIN|ADMIN|COORDINADOR"));

        if (!esCoordinadorOAdmin) {
            // Si es médico, validar que sea su disponibilidad
            PersonalCnt personalUsuario = personalRepository.findByUsuario(usuario)
                    .orElseThrow(() -> new RuntimeException("Personal no encontrado"));

            if (!disponibilidad.getPersonal().getIdPers().equals(personalUsuario.getIdPers())) {
                throw new RuntimeException("No tiene permiso para ver esta disponibilidad");
            }
        }

        return mapearAResponse(disponibilidad);
    }

    // ==========================================================
    // MÉTODOS PARA COORDINADOR - CONSULTAS
    // ==========================================================

    @Override
    public List<DisponibilidadResponse> listarPorPeriodo(String periodo) {
        List<DisponibilidadMedica> disponibilidades = disponibilidadRepository
                .findByPeriodoWithDetails(periodo);

        return disponibilidades.stream()
                .map(this::mapearAResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<DisponibilidadResponse> listarEnviadasPorPeriodo(String periodo) {
        List<DisponibilidadMedica> disponibilidades = disponibilidadRepository
                .findEnviadasByPeriodo(periodo);

        return disponibilidades.stream()
                .map(this::mapearAResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<DisponibilidadResponse> listarPorEspecialidadYPeriodo(Long idEspecialidad, String periodo) {
        List<DisponibilidadMedica> disponibilidades = disponibilidadRepository
                .findByEspecialidadIdServicioAndPeriodo(idEspecialidad, periodo);

        return disponibilidades.stream()
                .map(this::mapearAResponse)
                .collect(Collectors.toList());
    }

    // ==========================================================
    // MÉTODOS PARA COORDINADOR - REVISIÓN
    // ==========================================================

    @Override
    @Transactional
    public DisponibilidadResponse marcarRevisado(Long id) {
        log.info("Marcando como revisado disponibilidad ID: {}", id);

        DisponibilidadMedica disponibilidad = disponibilidadRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new RuntimeException("Disponibilidad no encontrada"));

        // Validar que esté en estado ENVIADO
        if (!disponibilidad.isEnviado()) {
            throw new RuntimeException("Solo se pueden marcar como revisadas las disponibilidades en estado ENVIADO");
        }

        // Cambiar estado
        disponibilidad.marcarRevisado();
        disponibilidad = disponibilidadRepository.save(disponibilidad);

        auditar("REVIEW_DISPONIBILIDAD",
                String.format("ID: %d, Médico: %s, Periodo: %s",
                        id, disponibilidad.getNombreCompleto(), disponibilidad.getPeriodo()),
                "INFO", "SUCCESS");

        log.info("Disponibilidad marcada como revisada ID: {}", id);
        return mapearAResponse(disponibilidad);
    }

    @Override
    @Transactional
    public DisponibilidadResponse ajustarTurno(Long idDisponibilidad, AjusteTurnoRequest request) {
        log.info("Ajustando turno ID detalle: {} de disponibilidad: {}", request.getIdDetalle(), idDisponibilidad);

        // Obtener detalle
        DetalleDisponibilidad detalle = detalleRepository.findById(request.getIdDetalle())
                .orElseThrow(() -> new RuntimeException("Detalle no encontrado"));

        // Validar que pertenezca a la disponibilidad
        if (!detalle.getDisponibilidad().getIdDisponibilidad().equals(idDisponibilidad)) {
            throw new RuntimeException("El detalle no pertenece a esta disponibilidad");
        }

        // Obtener coordinador autenticado
        PersonalCnt coordinador = obtenerMedicoAutenticado();

        // Calcular nuevas horas
        BigDecimal nuevasHoras = calcularHorasPorTurno(
                detalle.getDisponibilidad().getPersonal(),
                request.getNuevoTurno());

        // Actualizar detalle
        detalle.setTurno(request.getNuevoTurno());
        detalle.setHoras(nuevasHoras);
        detalle.setAjustadoPor(coordinador);
        detalle.setObservacionAjuste(request.getObservacion());
        detalleRepository.save(detalle);

        // Recalcular total de horas
        BigDecimal totalHoras = detalleRepository.sumHorasByDisponibilidad(idDisponibilidad);
        DisponibilidadMedica disponibilidad = detalle.getDisponibilidad();
        disponibilidad.setTotalHoras(totalHoras);
        disponibilidadRepository.save(disponibilidad);

        auditar("ADJUST_DISPONIBILIDAD",
                String.format("ID Disponibilidad: %d, Fecha: %s, Turno: %s -> %s, Coordinador: %s",
                        idDisponibilidad, detalle.getFecha(), detalle.getTurno(),
                        request.getNuevoTurno(), coordinador.getNombreCompleto()),
                "WARNING", "SUCCESS");

        log.info("Turno ajustado en disponibilidad ID: {}", idDisponibilidad);
        return obtenerPorId(idDisponibilidad);
    }

    // ==========================================================
    // MÉTODOS UTILITARIOS
    // ==========================================================

    @Override
    @Transactional
    public Map<String, Object> validarHoras(Long id) {
        DisponibilidadMedica disponibilidad = disponibilidadRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Disponibilidad no encontrada"));

        BigDecimal totalHoras = detalleRepository.sumHorasByDisponibilidad(id);
        disponibilidad.setTotalHoras(totalHoras);
        disponibilidadRepository.save(disponibilidad);

        boolean cumple = totalHoras.compareTo(disponibilidad.getHorasRequeridas()) >= 0;
        BigDecimal faltante = cumple ? BigDecimal.ZERO :
                              disponibilidad.getHorasRequeridas().subtract(totalHoras);

        Map<String, Object> resultado = new HashMap<>();
        resultado.put("totalHoras", totalHoras);
        resultado.put("horasRequeridas", disponibilidad.getHorasRequeridas());
        resultado.put("cumpleMinimo", cumple);
        resultado.put("horasFaltantes", faltante);
        resultado.put("porcentajeCumplimiento", disponibilidad.getPorcentajeCumplimiento());

        return resultado;
    }

    @Override
    @Transactional
    public void eliminar(Long id) {
        log.info("Eliminando disponibilidad ID: {}", id);

        DisponibilidadMedica disponibilidad = obtenerDisponibilidadConPermiso(id);

        // Solo se puede eliminar si está en BORRADOR
        if (!disponibilidad.isBorrador()) {
            throw new RuntimeException("Solo se pueden eliminar disponibilidades en estado BORRADOR");
        }

        disponibilidadRepository.delete(disponibilidad);

        auditar("DELETE_DISPONIBILIDAD",
                String.format("ID: %d, Médico: %s, Periodo: %s",
                        id, disponibilidad.getNombreCompleto(), disponibilidad.getPeriodo()),
                "WARNING", "SUCCESS");

        log.info("Disponibilidad eliminada ID: {}", id);
    }

    // ==========================================================
    // MÉTODOS PRIVADOS - CÁLCULO DE HORAS (CRÍTICO)
    // ==========================================================

    /**
     * ⚠️ MÉTODO CRÍTICO - Calcula las horas de un turno según el régimen laboral del médico.
     *
     * Régimen 728/CAS:
     * - Mañana (M): 4 horas
     * - Tarde (T): 4 horas
     * - Completo (MT): 8 horas
     *
     * Régimen Locador:
     * - Mañana (M): 6 horas
     * - Tarde (T): 6 horas
     * - Completo (MT): 12 horas
     *
     * @param personal Médico
     * @param turno Tipo de turno (M, T, MT)
     * @return Horas del turno
     */
    private BigDecimal calcularHorasPorTurno(PersonalCnt personal, String turno) {
        RegimenLaboral regimen = personal.getRegimenLaboral();
        if (regimen == null) {
            throw new RuntimeException("El médico no tiene régimen laboral asignado");
        }

        String descRegimen = regimen.getDescRegLab().toUpperCase();

        // Régimen 728 o CAS: M=4h, T=4h, MT=8h
        if (descRegimen.contains("728") || descRegimen.contains("CAS")) {
            if ("M".equals(turno) || "T".equals(turno)) {
                return new BigDecimal("4.00");
            } else if ("MT".equals(turno)) {
                return new BigDecimal("8.00");
            }
        }

        // Régimen Locador: M=6h, T=6h, MT=12h
        if (descRegimen.contains("LOCADOR")) {
            if ("M".equals(turno) || "T".equals(turno)) {
                return new BigDecimal("6.00");
            } else if ("MT".equals(turno)) {
                return new BigDecimal("12.00");
            }
        }

        // Por defecto: asumimos 728
        log.warn("Régimen desconocido: {}, usando valores por defecto (728)", descRegimen);
        return "MT".equals(turno) ? new BigDecimal("8.00") : new BigDecimal("4.00");
    }

    // ==========================================================
    // MÉTODOS PRIVADOS - HELPERS
    // ==========================================================

    /**
     * Obtiene el médico autenticado actualmente
     */
    private PersonalCnt obtenerMedicoAutenticado() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario usuario = usuarioRepository.findByNameUser(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        return personalRepository.findByUsuario(usuario)
                .orElseThrow(() -> new RuntimeException("Personal no encontrado para el usuario"));
    }

    /**
     * Obtiene una disponibilidad y verifica que el usuario tenga permiso
     */
    private DisponibilidadMedica obtenerDisponibilidadConPermiso(Long id) {
        DisponibilidadMedica disponibilidad = disponibilidadRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new RuntimeException("Disponibilidad no encontrada"));

        PersonalCnt medicoAuth = obtenerMedicoAutenticado();

        // Verificar que sea su disponibilidad
        if (!disponibilidad.getPersonal().getIdPers().equals(medicoAuth.getIdPers())) {
            throw new RuntimeException("No tiene permiso para modificar esta disponibilidad");
        }

        return disponibilidad;
    }

    /**
     * Mapea una entidad DisponibilidadMedica a DisponibilidadResponse
     */
    private DisponibilidadResponse mapearAResponse(DisponibilidadMedica entidad) {
        PersonalCnt medico = entidad.getPersonal();
        DimServicioEssi especialidad = entidad.getEspecialidad();
        RegimenLaboral regimen = medico.getRegimenLaboral();

        // Calcular horas por turno según régimen
        BigDecimal horasManana, horasTarde, horasCompleto;
        if (regimen != null && (regimen.getDescRegLab().toUpperCase().contains("LOCADOR"))) {
            horasManana = new BigDecimal("6.00");
            horasTarde = new BigDecimal("6.00");
            horasCompleto = new BigDecimal("12.00");
        } else {
            horasManana = new BigDecimal("4.00");
            horasTarde = new BigDecimal("4.00");
            horasCompleto = new BigDecimal("8.00");
        }

        // Mapear detalles
        List<DetalleDisponibilidadResponse> detallesResponse = entidad.getDetalles().stream()
                .map(this::mapearDetalleAResponse)
                .sorted(Comparator.comparing(DetalleDisponibilidadResponse::getFecha))
                .collect(Collectors.toList());

        return DisponibilidadResponse.builder()
                .idDisponibilidad(entidad.getIdDisponibilidad())
                .periodo(entidad.getPeriodo())
                .estado(entidad.getEstado())
                .totalHoras(entidad.getTotalHoras())
                .horasRequeridas(entidad.getHorasRequeridas())
                .observaciones(entidad.getObservaciones())
                .fechaCreacion(entidad.getFechaCreacion())
                .fechaEnvio(entidad.getFechaEnvio())
                .fechaRevision(entidad.getFechaRevision())
                .idPers(medico.getIdPers())
                .nombreCompleto(medico.getNombreCompleto())
                .numDocumento(medico.getNumDocPers())
                .emailMedico(entidad.getEmailMedico())
                .idEspecialidad(especialidad.getIdServicio())
                .nombreEspecialidad(especialidad.getDescServicio())
                .codigoEspecialidad(especialidad.getCodServicio())
                .regimenLaboral(regimen != null ? regimen.getDescRegLab() : null)
                .horasPorTurnoManana(horasManana)
                .horasPorTurnoTarde(horasTarde)
                .horasPorTurnoCompleto(horasCompleto)
                .detalles(detallesResponse)
                .totalDiasDisponibles(detallesResponse.size())
                .cumpleMinimo(entidad.cumpleMinimo())
                .porcentajeCumplimiento(entidad.getPorcentajeCumplimiento())
                .build();
    }

    /**
     * Mapea un DetalleDisponibilidad a DetalleDisponibilidadResponse
     */
    private DetalleDisponibilidadResponse mapearDetalleAResponse(DetalleDisponibilidad detalle) {
        return DetalleDisponibilidadResponse.builder()
                .idDetalle(detalle.getIdDetalle())
                .fecha(detalle.getFecha())
                .turno(detalle.getTurno())
                .turnoNombre(detalle.getNombreTurno())
                .diaSemana(detalle.getDiaSemana())
                .horas(detalle.getHoras())
                .fueAjustado(detalle.fueAjustado())
                .ajustadoPor(detalle.getNombreCoordinador())
                .numDocCoordinador(detalle.getNumDocCoordinador())
                .observacionAjuste(detalle.getObservacionAjuste())
                .createdAt(detalle.getCreatedAt())
                .build();
    }

    /**
     * Registra una acción en el log de auditoría
     */
    private void auditar(String action, String detalle, String nivel, String estado) {
        try {
            String usuario = SecurityContextHolder.getContext().getAuthentication().getName();
            auditLogService.registrarEvento(usuario, action, "DISPONIBILIDAD", detalle, nivel, estado);
        } catch (Exception e) {
            log.warn("No se pudo registrar auditoría: {}", e.getMessage());
        }
    }
}

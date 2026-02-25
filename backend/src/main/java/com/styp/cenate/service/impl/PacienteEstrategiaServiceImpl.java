package com.styp.cenate.service.impl;

import com.styp.cenate.dto.AsignarEstrategiaRequest;
import com.styp.cenate.dto.BajaCenacronListDto;
import com.styp.cenate.dto.DesasignarEstrategiaRequest;
import com.styp.cenate.dto.PacienteEstrategiaResponse;
import com.styp.cenate.model.Usuario;
import com.styp.cenate.model.EstrategiaInstitucional;
import com.styp.cenate.model.PacienteEstrategia;
import com.styp.cenate.repository.AseguradoRepository;
import com.styp.cenate.repository.PacienteEstrategiaRepository;
import com.styp.cenate.repository.UsuarioRepository;
import com.styp.cenate.repository.EstrategiaInstitucionalRepository;
import com.styp.cenate.service.PacienteEstrategiaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Implementación del servicio para gestionar asignación de estrategias a pacientes
 *
 * @author Claude Code + Styp Canto Rondón
 * @version 1.0.0
 * @since 2026-01-06
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PacienteEstrategiaServiceImpl implements PacienteEstrategiaService {

    private final PacienteEstrategiaRepository pacienteEstrategiaRepository;
    private final EstrategiaInstitucionalRepository estrategiaRepository;
    private final UsuarioRepository usuariosRepository;
    private final AseguradoRepository aseguradoRepository;

    /**
     * Asigna una estrategia a un paciente
     * Valida restricción: solo una asignación ACTIVA por paciente-estrategia
     */
    @Override
    @Transactional
    public PacienteEstrategiaResponse asignarEstrategia(
            AsignarEstrategiaRequest request,
            Long idUsuarioAsigno) {

        log.info("Asignando estrategia {} al paciente {}", request.getIdEstrategia(), request.getPkAsegurado());

        // Validar que no exista una asignación activa previa
        boolean existeActiva = pacienteEstrategiaRepository.existsAsignacionActiva(
                request.getPkAsegurado(),
                request.getIdEstrategia()
        );

        if (existeActiva) {
            log.warn("El paciente {} ya tiene una asignación activa a la estrategia {}",
                    request.getPkAsegurado(), request.getIdEstrategia());
            throw new IllegalArgumentException(
                    "El paciente ya tiene una asignación activa a esta estrategia"
            );
        }

        // Obtener la estrategia
        EstrategiaInstitucional estrategia = estrategiaRepository.findById(request.getIdEstrategia())
                .orElseThrow(() -> new IllegalArgumentException("Estrategia no encontrada"));

        // Obtener el usuario asigno (si es null, se permite)
        Usuario usuarioAsigno = null;
        if (idUsuarioAsigno != null) {
            usuarioAsigno = usuariosRepository.findById(idUsuarioAsigno).orElse(null);
        }

        // Crear la asignación
        PacienteEstrategia asignacion = PacienteEstrategia.builder()
                .pkAsegurado(request.getPkAsegurado())
                .estrategia(estrategia)
                .idAtencionAsignacion(request.getIdAtencionAsignacion())
                .usuarioAsigno(usuarioAsigno)
                .fechaAsignacion(LocalDateTime.now())
                .estado("ACTIVO")
                .build();

        asignacion = pacienteEstrategiaRepository.save(asignacion);

        log.info("Estrategia {} asignada exitosamente al paciente {}",
                request.getIdEstrategia(), request.getPkAsegurado());

        // Sincronizar paciente_cronico en asegurados si la estrategia es CENACRON
        if ("CENACRON".equalsIgnoreCase(estrategia.getSigla())) {
            try {
                int filas = aseguradoRepository.actualizarPacienteCronico(request.getPkAsegurado(), true);
                log.info("✅ paciente_cronico=true sincronizado en asegurados para DNI {} ({} fila/s)", request.getPkAsegurado(), filas);
            } catch (Exception ex) {
                log.warn("⚠️ No se pudo sincronizar paciente_cronico al inscribir CENACRON (DNI {}): {}", request.getPkAsegurado(), ex.getMessage());
            }
        }

        return mapToResponse(asignacion);
    }

    /**
     * Desasigna un paciente de una estrategia
     * Cambia el estado a INACTIVO o COMPLETADO y registra fecha de desvinculación
     */
    @Override
    @Transactional
    public PacienteEstrategiaResponse desasignarEstrategia(
            Long idAsignacion,
            DesasignarEstrategiaRequest request) {

        log.info("Desasignando estrategia con ID {}", idAsignacion);

        PacienteEstrategia asignacion = pacienteEstrategiaRepository.findById(idAsignacion)
                .orElseThrow(() -> new IllegalArgumentException("Asignación no encontrada"));

        // Validar que el nuevo estado sea válido
        if (!request.getNuevoEstado().matches("(INACTIVO|COMPLETADO)")) {
            throw new IllegalArgumentException("Estado inválido. Use INACTIVO o COMPLETADO");
        }

        // Actualizar los datos
        asignacion.setEstado(request.getNuevoEstado());
        asignacion.setFechaDesvinculacion(LocalDateTime.now());
        asignacion.setObservacionDesvinculacion(request.getObservacionDesvinculacion());

        asignacion = pacienteEstrategiaRepository.save(asignacion);

        log.info("Estrategia desasignada exitosamente. Nueva estado: {}", request.getNuevoEstado());

        return mapToResponse(asignacion);
    }

    /**
     * Obtiene todas las estrategias activas de un paciente
     */
    @Override
    @Transactional(readOnly = true)
    public List<PacienteEstrategiaResponse> obtenerEstrategiasActivas(String pkAsegurado) {
        log.debug("Obteniendo estrategias activas del paciente {}", pkAsegurado);

        List<PacienteEstrategia> asignaciones = pacienteEstrategiaRepository
                .findEstrategiasActivasByPaciente(pkAsegurado);

        return asignaciones.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene el historial completo de estrategias de un paciente
     */
    @Override
    @Transactional(readOnly = true)
    public List<PacienteEstrategiaResponse> obtenerHistorialEstrategias(String pkAsegurado) {
        log.debug("Obteniendo historial de estrategias del paciente {}", pkAsegurado);

        List<PacienteEstrategia> asignaciones = pacienteEstrategiaRepository
                .findHistorialEstrategiasByPaciente(pkAsegurado);

        return asignaciones.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene el historial con paginación
     */
    @Override
    @Transactional(readOnly = true)
    public Page<PacienteEstrategiaResponse> obtenerHistorialEstrategiasPaginado(
            String pkAsegurado,
            Pageable pageable) {
        log.debug("Obteniendo historial paginado de estrategias del paciente {}", pkAsegurado);

        Page<PacienteEstrategia> page = pacienteEstrategiaRepository
                .findHistorialEstrategiasByPacientePaginado(pkAsegurado, pageable);

        return page.map(this::mapToResponse);
    }

    /**
     * Obtiene una asignación específica
     */
    @Override
    @Transactional(readOnly = true)
    public PacienteEstrategiaResponse obtenerAsignacion(Long idAsignacion) {
        log.debug("Obteniendo asignación {}", idAsignacion);

        PacienteEstrategia asignacion = pacienteEstrategiaRepository.findById(idAsignacion)
                .orElseThrow(() -> new IllegalArgumentException("Asignación no encontrada"));

        return mapToResponse(asignacion);
    }

    /**
     * Verifica si existe asignación activa
     */
    @Override
    @Transactional(readOnly = true)
    public boolean tieneAsignacionActiva(String pkAsegurado, Long idEstrategia) {
        log.debug("Verificando asignación activa para paciente {} y estrategia {}",
                pkAsegurado, idEstrategia);

        return pacienteEstrategiaRepository.existsAsignacionActiva(pkAsegurado, idEstrategia);
    }

    /**
     * Obtiene los pacientes activos de una estrategia
     */
    @Override
    @Transactional(readOnly = true)
    public List<PacienteEstrategiaResponse> obtenerPacientesActivosPorEstrategia(Long idEstrategia) {
        log.debug("Obteniendo pacientes activos de la estrategia {}", idEstrategia);

        List<PacienteEstrategia> asignaciones = pacienteEstrategiaRepository
                .findPacientesActivosPorEstrategia(idEstrategia);

        return asignaciones.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene los pacientes con paginación
     */
    @Override
    @Transactional(readOnly = true)
    public Page<PacienteEstrategiaResponse> obtenerPacientesActivosPorEstrategiaPaginado(
            Long idEstrategia,
            Pageable pageable) {
        log.debug("Obteniendo pacientes paginados de la estrategia {}", idEstrategia);

        Page<PacienteEstrategia> page = pacienteEstrategiaRepository
                .findPacientesActivosPorEstrategiaPaginado(idEstrategia, pageable);

        return page.map(this::mapToResponse);
    }

    /**
     * Cuenta los pacientes activos en una estrategia
     */
    @Override
    @Transactional(readOnly = true)
    public long contarPacientesActivosPorEstrategia(Long idEstrategia) {
        log.debug("Contando pacientes activos de la estrategia {}", idEstrategia);

        return pacienteEstrategiaRepository.contarPacientesPorEstrategiaYEstado(idEstrategia, "ACTIVO");
    }

    /**
     * Obtiene la entidad raw (para uso interno)
     */
    @Override
    @Transactional(readOnly = true)
    public PacienteEstrategia obtenerAsignacionRaw(Long idAsignacion) {
        return pacienteEstrategiaRepository.findById(idAsignacion)
                .orElseThrow(() -> new IllegalArgumentException("Asignación no encontrada"));
    }

    /**
     * Lista paginada de bajas CENACRON con datos de auditoría completos.
     * Mapea Object[] (índices 0-9) desde la query nativa a BajaCenacronListDto.
     */
    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> listarBajasCenacron(String busqueda, String estado,
                                                    String fechaInicio, String fechaFin,
                                                    int page, int size) {
        // Normalizar filtros vacíos a null para que la query nativa los ignore
        String busquedaNorm   = (busqueda   != null && busqueda.isBlank())   ? null : busqueda;
        String estadoNorm     = (estado     != null && estado.isBlank())     ? null : estado;
        String fechaInicioNorm = (fechaInicio != null && fechaInicio.isBlank()) ? null : fechaInicio;
        String fechaFinNorm    = (fechaFin    != null && fechaFin.isBlank())    ? null : fechaFin;

        org.springframework.data.domain.Pageable pageable =
                org.springframework.data.domain.PageRequest.of(page, size);

        org.springframework.data.domain.Page<Object[]> pageResult =
                pacienteEstrategiaRepository.findBajasCenacronPaginado(
                        busquedaNorm, estadoNorm, fechaInicioNorm, fechaFinNorm, pageable);

        List<BajaCenacronListDto> bajas = pageResult.getContent().stream()
                .map(row -> {
                    Object diasRaw = row[9];
                    Long dias = null;
                    if (diasRaw instanceof BigDecimal bd) {
                        dias = bd.longValue();
                    } else if (diasRaw instanceof Number n) {
                        dias = n.longValue();
                    }
                    return BajaCenacronListDto.builder()
                            .idAsignacion(row[0] != null ? ((Number) row[0]).longValue() : null)
                            .pkAsegurado(row[1] != null ? row[1].toString() : null)
                            .nombrePaciente(row[2] != null ? row[2].toString() : null)
                            .estado(row[3] != null ? row[3].toString() : null)
                            .motivo(row[4] != null ? row[4].toString() : null)
                            .fechaAsignacion(row[5] != null ? row[5].toString() : null)
                            .fechaDesvinculacion(row[6] != null ? row[6].toString() : null)
                            .usuarioBajaLogin(row[7] != null ? row[7].toString() : null)
                            .nombreQuienDioBaja(row[8] != null ? row[8].toString().trim() : null)
                            .diasEnPrograma(dias)
                            .build();
                })
                .collect(Collectors.toList());

        Map<String, Object> resultado = new HashMap<>();
        resultado.put("bajas", bajas);
        resultado.put("total", pageResult.getTotalElements());
        resultado.put("totalPaginas", pageResult.getTotalPages());
        resultado.put("pagina", page);
        return resultado;
    }

    /**
     * Convierte una entidad a DTO response
     * Calcula automáticamente los días en estrategia
     */
    private PacienteEstrategiaResponse mapToResponse(PacienteEstrategia asignacion) {
        if (asignacion == null) {
            return null;
        }

        return PacienteEstrategiaResponse.builder()
                .idAsignacion(asignacion.getIdAsignacion())
                .pkAsegurado(asignacion.getPkAsegurado())
                .idEstrategia(asignacion.getEstrategia().getIdEstrategia())
                .estrategiaSigla(asignacion.getEstrategia().getSigla())
                .estrategiaDescripcion(asignacion.getEstrategia().getDescEstrategia())
                .estado(asignacion.getEstado())
                .fechaAsignacion(asignacion.getFechaAsignacion())
                .fechaDesvinculacion(asignacion.getFechaDesvinculacion())
                .diasEnEstrategia(asignacion.getDiasEnEstrategia())
                .observacionDesvinculacion(asignacion.getObservacionDesvinculacion())
                .usuarioAsignoNombre(asignacion.getUsuarioAsigno() != null
                        ? asignacion.getUsuarioAsigno().getNombreCompleto()
                        : null)
                .idUsuarioAsigno(asignacion.getUsuarioAsigno() != null
                        ? asignacion.getUsuarioAsigno().getIdUser()
                        : null)
                .usuarioDesvinculoNombre(asignacion.getUsuarioDesvinculo() != null
                        ? asignacion.getUsuarioDesvinculo().getNombreCompleto()
                        : null)
                .idUsuarioDesvinculo(asignacion.getUsuarioDesvinculo() != null
                        ? asignacion.getUsuarioDesvinculo().getIdUser()
                        : null)
                .build();
    }
}

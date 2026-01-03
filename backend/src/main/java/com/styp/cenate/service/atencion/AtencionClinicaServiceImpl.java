package com.styp.cenate.service.atencion;

import com.styp.cenate.dto.AtencionClinicaCreateDTO;
import com.styp.cenate.dto.AtencionClinicaDTO;
import com.styp.cenate.dto.AtencionClinicaUpdateDTO;
import com.styp.cenate.dto.ObservacionEnfermeriaDTO;
import com.styp.cenate.exception.ResourceNotFoundException;
import com.styp.cenate.exception.UnauthorizedException;
import com.styp.cenate.model.*;
import com.styp.cenate.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.Period;

/**
 * Implementación del servicio para gestionar Atenciones Clínicas
 *
 * @author Claude Code + Styp Canto Rondón
 * @version 2.0.0
 * @since 2026-01-03
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AtencionClinicaServiceImpl implements IAtencionClinicaService {

    private final AtencionClinicaRepository atencionRepository;
    private final AseguradoRepository aseguradoRepository;
    private final IpressRepository ipressRepository;
    private final EspecialidadRepository especialidadRepository;
    private final EstrategiaInstitucionalRepository estrategiaRepository;
    private final TipoAtencionTelemedicinaRepository tipoAtencionRepository;
    private final PersonalSaludRepository personalSaludRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<AtencionClinicaDTO> obtenerAtencionesPorAsegurado(String pkAsegurado, Pageable pageable) {
        log.info("📋 Obteniendo atenciones del asegurado: {}", pkAsegurado);
        return atencionRepository.findByAsegurado_PkAsegurado(pkAsegurado, pageable)
                .map(this::convertirADTO);
    }

    @Override
    @Transactional(readOnly = true)
    public AtencionClinicaDTO obtenerAtencionDetalle(Long idAtencion) {
        log.info("🔍 Obteniendo detalle de atención ID: {}", idAtencion);
        AtencionClinica atencion = atencionRepository.findById(idAtencion)
                .orElseThrow(() -> new ResourceNotFoundException("Atención clínica no encontrada con ID: " + idAtencion));
        return convertirADTO(atencion);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AtencionClinicaDTO> obtenerAtencionesPorProfesional(Long idPersonalCreador, Pageable pageable) {
        log.info("👨‍⚕️ Obteniendo atenciones creadas por profesional ID: {}", idPersonalCreador);
        return atencionRepository.findByPersonalCreador_IdPersonal(idPersonalCreador, pageable)
                .map(this::convertirADTO);
    }

    @Override
    @Transactional
    public AtencionClinicaDTO crearAtencion(AtencionClinicaCreateDTO dto, Long idPersonalCreador) {
        log.info("➕ Creando nueva atención para asegurado: {}", dto.getPkAsegurado());

        // Validar que asegurado existe
        Asegurado asegurado = aseguradoRepository.findById(dto.getPkAsegurado())
                .orElseThrow(() -> new ResourceNotFoundException("Asegurado no encontrado con DNI: " + dto.getPkAsegurado()));

        // Validar que IPRESS existe
        Ipress ipress = ipressRepository.findById(dto.getIdIpress())
                .orElseThrow(() -> new ResourceNotFoundException("IPRESS no encontrada con ID: " + dto.getIdIpress()));

        // Validar que tipo de atención existe
        TipoAtencionTelemedicina tipoAtencion = tipoAtencionRepository.findById(dto.getIdTipoAtencion())
                .orElseThrow(() -> new ResourceNotFoundException("Tipo de atención no encontrado con ID: " + dto.getIdTipoAtencion()));

        // Validar que profesional creador existe
        PersonalSalud personalCreador = personalSaludRepository.findById(idPersonalCreador)
                .orElseThrow(() -> new ResourceNotFoundException("Personal de salud no encontrado con ID: " + idPersonalCreador));

        // Obtener especialidad si viene
        Especialidad especialidad = null;
        if (dto.getIdEspecialidad() != null) {
            especialidad = especialidadRepository.findById(dto.getIdEspecialidad())
                    .orElseThrow(() -> new ResourceNotFoundException("Especialidad no encontrada con ID: " + dto.getIdEspecialidad()));
        }

        // Obtener estrategia si viene
        EstrategiaInstitucional estrategia = null;
        if (dto.getIdEstrategia() != null) {
            estrategia = estrategiaRepository.findById(dto.getIdEstrategia())
                    .orElseThrow(() -> new ResourceNotFoundException("Estrategia institucional no encontrada con ID: " + dto.getIdEstrategia()));
        }

        // Obtener especialidad de interconsulta si viene
        Especialidad especialidadInterconsulta = null;
        if (dto.getTieneOrdenInterconsulta() && dto.getIdEspecialidadInterconsulta() != null) {
            especialidadInterconsulta = especialidadRepository.findById(dto.getIdEspecialidadInterconsulta())
                    .orElseThrow(() -> new ResourceNotFoundException("Especialidad de interconsulta no encontrada con ID: " + dto.getIdEspecialidadInterconsulta()));
        }

        // Crear entidad
        AtencionClinica atencion = AtencionClinica.builder()
                .asegurado(asegurado)
                .ipress(ipress)
                .especialidad(especialidad)
                .estrategia(estrategia)
                .tipoAtencion(tipoAtencion)
                .personalCreador(personalCreador)
                .fechaAtencion(dto.getFechaAtencion())
                .motivoConsulta(dto.getMotivoConsulta())
                .antecedentes(dto.getAntecedentes())
                .diagnostico(dto.getDiagnostico())
                .resultadosClinicos(dto.getResultadosClinicos())
                .observaciones(dto.getObservaciones())
                .datosSeguimiento(dto.getDatosSeguimiento())
                .presionArterial(dto.getPresionArterial())
                .temperatura(dto.getTemperatura())
                .pesoKg(dto.getPesoKg())
                .tallaCm(dto.getTallaCm())
                .saturacionO2(dto.getSaturacionO2())
                .frecuenciaCardiaca(dto.getFrecuenciaCardiaca())
                .frecuenciaRespiratoria(dto.getFrecuenciaRespiratoria())
                .tieneOrdenInterconsulta(dto.getTieneOrdenInterconsulta() != null && dto.getTieneOrdenInterconsulta())
                .especialidadInterconsulta(especialidadInterconsulta)
                .modalidadInterconsulta(dto.getModalidadInterconsulta())
                .requiereTelemonitoreo(dto.getRequiereTelemonitoreo() != null && dto.getRequiereTelemonitoreo())
                .build();

        // Guardar
        AtencionClinica savedAtencion = atencionRepository.save(atencion);
        log.info("✅ Atención clínica creada con ID: {}", savedAtencion.getIdAtencion());

        return convertirADTO(savedAtencion);
    }

    @Override
    @Transactional
    public AtencionClinicaDTO actualizarAtencion(Long idAtencion, AtencionClinicaUpdateDTO dto,
                                                  Long idPersonalModificador, String rolUsuario) {
        log.info("✏️ Actualizando atención ID: {}", idAtencion);

        // Buscar atención
        AtencionClinica atencion = atencionRepository.findById(idAtencion)
                .orElseThrow(() -> new ResourceNotFoundException("Atención clínica no encontrada con ID: " + idAtencion));

        // Validar permisos: MEDICO solo puede editar sus propias atenciones
        if ("MEDICO".equals(rolUsuario)) {
            if (!atencion.getPersonalCreador().getIdPersonal().equals(idPersonalModificador)) {
                throw new UnauthorizedException("No tiene permiso para editar esta atención. Solo puede editar sus propias atenciones.");
            }
        }

        // Actualizar campos si vienen en el DTO
        if (dto.getFechaAtencion() != null) {
            atencion.setFechaAtencion(dto.getFechaAtencion());
        }
        if (dto.getIdIpress() != null) {
            Ipress ipress = ipressRepository.findById(dto.getIdIpress())
                    .orElseThrow(() -> new ResourceNotFoundException("IPRESS no encontrada con ID: " + dto.getIdIpress()));
            atencion.setIpress(ipress);
        }
        if (dto.getIdEspecialidad() != null) {
            Especialidad especialidad = especialidadRepository.findById(dto.getIdEspecialidad())
                    .orElseThrow(() -> new ResourceNotFoundException("Especialidad no encontrada con ID: " + dto.getIdEspecialidad()));
            atencion.setEspecialidad(especialidad);
        }
        if (dto.getIdEstrategia() != null) {
            EstrategiaInstitucional estrategia = estrategiaRepository.findById(dto.getIdEstrategia())
                    .orElseThrow(() -> new ResourceNotFoundException("Estrategia institucional no encontrada con ID: " + dto.getIdEstrategia()));
            atencion.setEstrategia(estrategia);
        }
        if (dto.getIdTipoAtencion() != null) {
            TipoAtencionTelemedicina tipoAtencion = tipoAtencionRepository.findById(dto.getIdTipoAtencion())
                    .orElseThrow(() -> new ResourceNotFoundException("Tipo de atención no encontrado con ID: " + dto.getIdTipoAtencion()));
            atencion.setTipoAtencion(tipoAtencion);
        }
        if (dto.getMotivoConsulta() != null) {
            atencion.setMotivoConsulta(dto.getMotivoConsulta());
        }
        if (dto.getAntecedentes() != null) {
            atencion.setAntecedentes(dto.getAntecedentes());
        }
        if (dto.getDiagnostico() != null) {
            atencion.setDiagnostico(dto.getDiagnostico());
        }
        if (dto.getResultadosClinicos() != null) {
            atencion.setResultadosClinicos(dto.getResultadosClinicos());
        }
        if (dto.getObservaciones() != null) {
            atencion.setObservaciones(dto.getObservaciones());
        }
        if (dto.getDatosSeguimiento() != null) {
            atencion.setDatosSeguimiento(dto.getDatosSeguimiento());
        }

        // Signos vitales
        if (dto.getPresionArterial() != null) {
            atencion.setPresionArterial(dto.getPresionArterial());
        }
        if (dto.getTemperatura() != null) {
            atencion.setTemperatura(dto.getTemperatura());
        }
        if (dto.getPesoKg() != null) {
            atencion.setPesoKg(dto.getPesoKg());
        }
        if (dto.getTallaCm() != null) {
            atencion.setTallaCm(dto.getTallaCm());
        }
        if (dto.getSaturacionO2() != null) {
            atencion.setSaturacionO2(dto.getSaturacionO2());
        }
        if (dto.getFrecuenciaCardiaca() != null) {
            atencion.setFrecuenciaCardiaca(dto.getFrecuenciaCardiaca());
        }
        if (dto.getFrecuenciaRespiratoria() != null) {
            atencion.setFrecuenciaRespiratoria(dto.getFrecuenciaRespiratoria());
        }

        // Interconsulta
        if (dto.getTieneOrdenInterconsulta() != null) {
            atencion.setTieneOrdenInterconsulta(dto.getTieneOrdenInterconsulta());
            if (dto.getTieneOrdenInterconsulta() && dto.getIdEspecialidadInterconsulta() != null) {
                Especialidad especialidadInterconsulta = especialidadRepository.findById(dto.getIdEspecialidadInterconsulta())
                        .orElseThrow(() -> new ResourceNotFoundException("Especialidad de interconsulta no encontrada con ID: " + dto.getIdEspecialidadInterconsulta()));
                atencion.setEspecialidadInterconsulta(especialidadInterconsulta);
            }
            if (dto.getModalidadInterconsulta() != null) {
                atencion.setModalidadInterconsulta(dto.getModalidadInterconsulta());
            }
        }

        // Telemonitoreo
        if (dto.getRequiereTelemonitoreo() != null) {
            atencion.setRequiereTelemonitoreo(dto.getRequiereTelemonitoreo());
        }

        // Actualizar personal modificador
        PersonalSalud personalModificador = personalSaludRepository.findById(idPersonalModificador)
                .orElseThrow(() -> new ResourceNotFoundException("Personal de salud no encontrado con ID: " + idPersonalModificador));
        atencion.setPersonalModificador(personalModificador);

        // Guardar
        AtencionClinica updatedAtencion = atencionRepository.save(atencion);
        log.info("✅ Atención clínica actualizada con ID: {}", updatedAtencion.getIdAtencion());

        return convertirADTO(updatedAtencion);
    }

    @Override
    @Transactional
    public void agregarObservacionEnfermeria(Long idAtencion, ObservacionEnfermeriaDTO dto, Long idPersonal) {
        log.info("🩺 Agregando observación de enfermería a atención ID: {}", idAtencion);

        // Buscar atención
        AtencionClinica atencion = atencionRepository.findById(idAtencion)
                .orElseThrow(() -> new ResourceNotFoundException("Atención clínica no encontrada con ID: " + idAtencion));

        // Construir observación con timestamp
        String timestamp = OffsetDateTime.now().toString();
        String nuevaObservacion = String.format("[ENFERMERÍA - %s] %s", timestamp, dto.getObservacion());

        // Concatenar con observaciones existentes
        String observacionesActuales = atencion.getObservaciones() != null ? atencion.getObservaciones() : "";
        atencion.setObservaciones(observacionesActuales + "\n\n" + nuevaObservacion);

        // Actualizar datos de seguimiento si viene
        if (dto.getDatosSeguimiento() != null) {
            String seguimientoActual = atencion.getDatosSeguimiento() != null ? atencion.getDatosSeguimiento() : "";
            atencion.setDatosSeguimiento(seguimientoActual + "\n\n[" + timestamp + "] " + dto.getDatosSeguimiento());
        }

        atencionRepository.save(atencion);
        log.info("✅ Observación de enfermería agregada a atención ID: {}", idAtencion);
    }

    @Override
    @Transactional
    public void eliminarAtencion(Long idAtencion) {
        log.info("🗑️ Eliminando atención ID: {}", idAtencion);

        if (!atencionRepository.existsById(idAtencion)) {
            throw new ResourceNotFoundException("Atención clínica no encontrada con ID: " + idAtencion);
        }

        atencionRepository.deleteById(idAtencion);
        log.info("✅ Atención clínica eliminada con ID: {}", idAtencion);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AtencionClinicaDTO> busquedaAvanzada(String pkAsegurado, Long idIpress, Long idEspecialidad,
                                                      Long idTipoAtencion, Long idEstrategia,
                                                      OffsetDateTime fechaInicio, OffsetDateTime fechaFin,
                                                      Pageable pageable) {
        log.info("🔍 Búsqueda avanzada de atenciones con filtros múltiples");
        // Implementación simplificada - en producción usar Specifications
        return atencionRepository.findAll(pageable).map(this::convertirADTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AtencionClinicaDTO> obtenerAtencionesConInterconsulta(Pageable pageable) {
        log.info("📋 Obteniendo atenciones con interconsulta pendiente");
        return atencionRepository.findByTieneOrdenInterconsulta(true, pageable)
                .map(this::convertirADTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AtencionClinicaDTO> obtenerAtencionesConTelemonitoreo(Pageable pageable) {
        log.info("📋 Obteniendo atenciones que requieren telemonitoreo");
        return atencionRepository.findByRequiereTelemonitoreo(true, pageable)
                .map(this::convertirADTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Long contarAtencionesPorAsegurado(String pkAsegurado) {
        return atencionRepository.countByAsegurado_PkAsegurado(pkAsegurado);
    }

    @Override
    @Transactional(readOnly = true)
    public Long contarAtencionesPorProfesional(Long idPersonalCreador) {
        return atencionRepository.countByPersonalCreador_IdPersonal(idPersonalCreador);
    }

    /**
     * Convierte una entidad AtencionClinica a DTO
     */
    private AtencionClinicaDTO convertirADTO(AtencionClinica atencion) {
        AtencionClinicaDTO dto = new AtencionClinicaDTO();

        // Datos básicos
        dto.setIdAtencion(atencion.getIdAtencion());
        dto.setFechaAtencion(atencion.getFechaAtencion());

        // Asegurado
        dto.setPkAsegurado(atencion.getAsegurado().getPkAsegurado());
        dto.setNombreAsegurado(atencion.getAsegurado().getNombreCompleto());
        dto.setEdadAsegurado(calcularEdad(atencion.getAsegurado().getFechaNacimiento()));

        // IPRESS
        dto.setIdIpress(atencion.getIpress().getIdIpress());
        dto.setNombreIpress(atencion.getIpress().getNombreIpress());

        // Especialidad (opcional)
        if (atencion.getEspecialidad() != null) {
            dto.setIdEspecialidad(atencion.getEspecialidad().getIdEspecialidad());
            dto.setNombreEspecialidad(atencion.getEspecialidad().getDescEspecialidad());
        }

        // Estrategia (opcional)
        if (atencion.getEstrategia() != null) {
            dto.setIdEstrategia(atencion.getEstrategia().getIdEstrategia());
            dto.setNombreEstrategia(atencion.getEstrategia().getDescEstrategia());
            dto.setSiglaEstrategia(atencion.getEstrategia().getSigla());
        }

        // Tipo de Atención
        dto.setIdTipoAtencion(atencion.getTipoAtencion().getIdTipoAtencion());
        dto.setNombreTipoAtencion(atencion.getTipoAtencion().getDescTipoAtencion());
        dto.setSiglaTipoAtencion(atencion.getTipoAtencion().getSigla());

        // Personal Creador
        dto.setIdPersonalCreador(atencion.getPersonalCreador().getIdPersonal());
        dto.setNombrePersonalCreador(atencion.getPersonalCreador().getNombreCompleto());

        // Personal Modificador (opcional)
        if (atencion.getPersonalModificador() != null) {
            dto.setIdPersonalModificador(atencion.getPersonalModificador().getIdPersonal());
            dto.setNombrePersonalModificador(atencion.getPersonalModificador().getNombreCompleto());
        }

        // Datos clínicos
        dto.setMotivoConsulta(atencion.getMotivoConsulta());
        dto.setAntecedentes(atencion.getAntecedentes());
        dto.setDiagnostico(atencion.getDiagnostico());
        dto.setResultadosClinicos(atencion.getResultadosClinicos());
        dto.setObservaciones(atencion.getObservaciones());
        dto.setDatosSeguimiento(atencion.getDatosSeguimiento());

        // Signos vitales
        dto.setPresionArterial(atencion.getPresionArterial());
        dto.setTemperatura(atencion.getTemperatura());
        dto.setPesoKg(atencion.getPesoKg());
        dto.setTallaCm(atencion.getTallaCm());
        dto.setImc(atencion.getImc());
        dto.setSaturacionO2(atencion.getSaturacionO2());
        dto.setFrecuenciaCardiaca(atencion.getFrecuenciaCardiaca());
        dto.setFrecuenciaRespiratoria(atencion.getFrecuenciaRespiratoria());

        // Interconsulta
        dto.setTieneOrdenInterconsulta(atencion.getTieneOrdenInterconsulta());
        if (atencion.getEspecialidadInterconsulta() != null) {
            dto.setIdEspecialidadInterconsulta(atencion.getEspecialidadInterconsulta().getIdEspecialidad());
            dto.setNombreEspecialidadInterconsulta(atencion.getEspecialidadInterconsulta().getDescEspecialidad());
        }
        dto.setModalidadInterconsulta(atencion.getModalidadInterconsulta());

        // Telemonitoreo
        dto.setRequiereTelemonitoreo(atencion.getRequiereTelemonitoreo());

        // Auditoría
        dto.setCreatedAt(atencion.getCreatedAt());
        dto.setUpdatedAt(atencion.getUpdatedAt());

        // Flags calculados
        dto.setTieneSignosVitales(tieneSignosVitales(atencion));
        dto.setTieneInterconsultaCompleta(tieneInterconsultaCompleta(atencion));

        return dto;
    }

    /**
     * Calcula la edad a partir de la fecha de nacimiento
     */
    private Integer calcularEdad(LocalDate fechaNacimiento) {
        if (fechaNacimiento == null) {
            return null;
        }
        return Period.between(fechaNacimiento, LocalDate.now()).getYears();
    }

    /**
     * Verifica si la atención tiene signos vitales registrados
     */
    private Boolean tieneSignosVitales(AtencionClinica atencion) {
        return atencion.getPresionArterial() != null ||
               atencion.getTemperatura() != null ||
               atencion.getPesoKg() != null ||
               atencion.getSaturacionO2() != null ||
               atencion.getFrecuenciaCardiaca() != null ||
               atencion.getFrecuenciaRespiratoria() != null;
    }

    /**
     * Verifica si la interconsulta está completa
     */
    private Boolean tieneInterconsultaCompleta(AtencionClinica atencion) {
        return atencion.getTieneOrdenInterconsulta() &&
               atencion.getEspecialidadInterconsulta() != null &&
               atencion.getModalidadInterconsulta() != null;
    }
}

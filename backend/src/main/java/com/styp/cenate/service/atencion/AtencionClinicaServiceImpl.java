package com.styp.cenate.service.atencion;

import com.styp.cenate.dto.AtencionClinicaCreateDTO;
import com.styp.cenate.dto.AtencionClinicaResponseDTO;
import com.styp.cenate.dto.AtencionClinicaUpdateDTO;
import com.styp.cenate.dto.DiagnosticoCie10DTO;
import com.styp.cenate.dto.SignosVitalesComparativoDTO;
import com.styp.cenate.model.*;
import com.styp.cenate.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Implementación del servicio para gestionar atenciones clínicas
 *
 * @author Claude Code + Styp Canto Rondón
 * @version 2.0.0
 * @since 2026-01-03
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AtencionClinicaServiceImpl implements IAtencionClinicaService {

    private final AtencionClinicaRepository atencionRepository;
    private final UsuarioRepository usuarioRepository;
    private final AseguradoRepository aseguradoRepository;
    private final IpressRepository ipressRepository;
    private final DimServicioEssiRepository servicioEssiRepository;
    private final PersonalCntRepository personalCntRepository;
    private final EstrategiaInstitucionalRepository estrategiaRepository;
    private final TipoAtencionTelemedicinaRepository tipoAtencionRepository;
    private final DimCie10Repository dimCie10Repository;
    private final AtencionDiagnosticoCie10Repository diagnosticoCie10Repository;
    private final SignosVitalesTendenciaService tendenciaService;

    @Override
    @Transactional(readOnly = true)
    public Page<AtencionClinicaResponseDTO> obtenerPorAsegurado(String pkAsegurado, Pageable pageable) {
        log.info("📋 Obteniendo atenciones del asegurado: {}", pkAsegurado);

        Page<AtencionClinica> atenciones = atencionRepository
                .findByPkAseguradoOrderByFechaAtencionDesc(pkAsegurado, pageable);

        return atenciones.map(this::convertirAResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public AtencionClinicaResponseDTO obtenerPorId(Long id) {
        log.info("🔍 Obteniendo atención clínica ID: {}", id);

        AtencionClinica atencion = atencionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Atención clínica no encontrada con ID: " + id));

        return convertirAResponse(atencion);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AtencionClinicaResponseDTO> obtenerMisAtenciones(Pageable pageable) {
        log.info("👨‍⚕️ Obteniendo atenciones del profesional logueado");

        Usuario usuario = obtenerUsuarioActual();

        // Obtener ID del personal asociado al usuario
        Long idPersonal = obtenerIdPersonalDelUsuario(usuario);

        Page<AtencionClinica> atenciones = atencionRepository
                .findByIdPersonalCreadorOrderByFechaAtencionDesc(idPersonal, pageable);

        return atenciones.map(this::convertirAResponse);
    }

    @Override
    public AtencionClinicaResponseDTO crear(AtencionClinicaCreateDTO dto) {
        log.info("✅ Creando nueva atención clínica para asegurado: {}", dto.getPkAsegurado());

        // Validar que el asegurado existe
        if (!aseguradoRepository.existsById(dto.getPkAsegurado())) {
            throw new RuntimeException("Asegurado no encontrado con ID: " + dto.getPkAsegurado());
        }

        // Validar que la IPRESS existe
        if (!ipressRepository.existsById(dto.getIdIpress())) {
            throw new RuntimeException("IPRESS no encontrada con ID: " + dto.getIdIpress());
        }

        // Obtener usuario actual
        Usuario usuario = obtenerUsuarioActual();
        Long idPersonalCreador = obtenerIdPersonalDelUsuario(usuario);

        // Crear entidad
        AtencionClinica atencion = AtencionClinica.builder()
                .pkAsegurado(dto.getPkAsegurado())
                .fechaAtencion(dto.getFechaAtencion())
                .idIpress(dto.getIdIpress())
                .idEspecialidad(dto.getIdEspecialidad())
                .idServicio(dto.getIdServicio())
                .motivoConsulta(dto.getMotivoConsulta())
                .antecedentes(dto.getAntecedentes())
                .diagnostico(dto.getDiagnostico())
                .resultadosClinicos(dto.getResultadosClinicos())
                .observacionesGenerales(dto.getObservacionesGenerales())
                .datosSeguimiento(dto.getDatosSeguimiento())
                .presionArterial(dto.getPresionArterial())
                .temperatura(dto.getTemperatura())
                .pesoKg(dto.getPesoKg())
                .tallaCm(dto.getTallaCm())
                .imc(dto.getImc())
                .saturacionO2(dto.getSaturacionO2())
                .frecuenciaCardiaca(dto.getFrecuenciaCardiaca())
                .frecuenciaRespiratoria(dto.getFrecuenciaRespiratoria())
                .idEstrategia(dto.getIdEstrategia())
                .idTipoAtencion(dto.getIdTipoAtencion())
                .tieneOrdenInterconsulta(
                        dto.getTieneOrdenInterconsulta() != null ? dto.getTieneOrdenInterconsulta() : false)
                .idEspecialidadInterconsulta(dto.getIdEspecialidadInterconsulta())
                .modalidadInterconsulta(dto.getModalidadInterconsulta())
                .requiereTelemonitoreo(dto.getRequiereTelemonitoreo() != null ? dto.getRequiereTelemonitoreo() : false)
                .idPersonalCreador(idPersonalCreador)
                .build();

        AtencionClinica atencionGuardada = atencionRepository.save(atencion);

        log.info("✅ Atención clínica creada con ID: {}", atencionGuardada.getIdAtencion());

        return convertirAResponse(atencionGuardada);
    }

    @Override
    public AtencionClinicaResponseDTO actualizar(Long id, AtencionClinicaUpdateDTO dto) {
        log.info("🔄 Actualizando atención clínica ID: {}", id);

        AtencionClinica atencion = atencionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Atención clínica no encontrada con ID: " + id));

        // Obtener usuario actual
        Usuario usuario = obtenerUsuarioActual();
        Long idPersonalModificador = obtenerIdPersonalDelUsuario(usuario);

        // Actualizar solo campos no nulos
        if (dto.getFechaAtencion() != null) {
            atencion.setFechaAtencion(dto.getFechaAtencion());
        }
        if (dto.getIdIpress() != null) {
            atencion.setIdIpress(dto.getIdIpress());
        }
        if (dto.getIdEspecialidad() != null) {
            atencion.setIdEspecialidad(dto.getIdEspecialidad());
        }
        if (dto.getIdServicio() != null) {
            atencion.setIdServicio(dto.getIdServicio());
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
        if (dto.getObservacionesGenerales() != null) {
            atencion.setObservacionesGenerales(dto.getObservacionesGenerales());
        }
        if (dto.getDatosSeguimiento() != null) {
            atencion.setDatosSeguimiento(dto.getDatosSeguimiento());
        }
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
        if (dto.getImc() != null) {
            atencion.setImc(dto.getImc());
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
        if (dto.getIdEstrategia() != null) {
            atencion.setIdEstrategia(dto.getIdEstrategia());
        }
        if (dto.getIdTipoAtencion() != null) {
            atencion.setIdTipoAtencion(dto.getIdTipoAtencion());
        }
        if (dto.getTieneOrdenInterconsulta() != null) {
            atencion.setTieneOrdenInterconsulta(dto.getTieneOrdenInterconsulta());
        }
        if (dto.getIdEspecialidadInterconsulta() != null) {
            atencion.setIdEspecialidadInterconsulta(dto.getIdEspecialidadInterconsulta());
        }
        if (dto.getModalidadInterconsulta() != null) {
            atencion.setModalidadInterconsulta(dto.getModalidadInterconsulta());
        }
        if (dto.getRequiereTelemonitoreo() != null) {
            atencion.setRequiereTelemonitoreo(dto.getRequiereTelemonitoreo());
        }

        atencion.setIdPersonalModificador(idPersonalModificador);

        AtencionClinica atencionActualizada = atencionRepository.save(atencion);

        log.info("✅ Atención clínica actualizada ID: {}", id);

        return convertirAResponse(atencionActualizada);
    }

    @Override
    public void eliminar(Long id) {
        log.info("🗑️ Eliminando atención clínica ID: {}", id);

        if (!atencionRepository.existsById(id)) {
            throw new RuntimeException("Atención clínica no encontrada con ID: " + id);
        }

        atencionRepository.deleteById(id);

        log.info("✅ Atención clínica eliminada ID: {}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> obtenerEstadisticasAsegurado(String pkAsegurado) {
        log.info("📊 Obteniendo estadísticas del asegurado: {}", pkAsegurado);

        long totalAtenciones = atencionRepository.countByPkAsegurado(pkAsegurado);

        List<AtencionClinica> atenciones = atencionRepository
                .findByPkAseguradoOrderByFechaAtencionDesc(pkAsegurado);

        OffsetDateTime ultimaAtencion = null;
        long conInterconsulta = 0;
        long conTelemonitoreo = 0;

        if (!atenciones.isEmpty()) {
            ultimaAtencion = atenciones.get(0).getFechaAtencion();
            conInterconsulta = atenciones.stream()
                    .filter(a -> Boolean.TRUE.equals(a.getTieneOrdenInterconsulta()))
                    .count();
            conTelemonitoreo = atenciones.stream()
                    .filter(a -> Boolean.TRUE.equals(a.getRequiereTelemonitoreo()))
                    .count();
        }

        Map<String, Object> estadisticas = new HashMap<>();
        estadisticas.put("totalAtenciones", totalAtenciones);
        estadisticas.put("ultimaAtencion", ultimaAtencion);
        estadisticas.put("conInterconsulta", conInterconsulta);
        estadisticas.put("conTelemonitoreo", conTelemonitoreo);

        return estadisticas;
    }

    @Override
    @Transactional(readOnly = true)
    public SignosVitalesComparativoDTO obtenerComparativoSignosVitales(Long idAtencion) {
        log.info("📊 Obteniendo comparativo de signos vitales para atención ID: {}", idAtencion);

        // Obtener atención actual
        AtencionClinica atencionActual = atencionRepository.findById(idAtencion)
                .orElseThrow(() -> new RuntimeException("Atención clínica no encontrada con ID: " + idAtencion));

        // Buscar atención anterior del mismo paciente
        AtencionClinica atencionAnterior = atencionRepository.findPreviousAtencion(
                atencionActual.getPkAsegurado(),
                atencionActual.getFechaAtencion());

        // Calcular tendencias
        SignosVitalesComparativoDTO comparativo = tendenciaService.calcularTendencias(
                atencionActual,
                atencionAnterior);

        if (atencionAnterior != null) {
            log.info("✅ Comparación realizada con atención anterior ID: {} ({} días)",
                    atencionAnterior.getIdAtencion(),
                    comparativo.getDiasDesdeUltimaAtencion());
        } else {
            log.info("ℹ️ Primera atención del paciente, sin datos de comparación");
        }

        return comparativo;
    }

    // ==================== MÉTODOS AUXILIARES ====================

    /**
     * Convierte una entidad AtencionClinica a su DTO de respuesta con datos
     * enriquecidos
     */
    private AtencionClinicaResponseDTO convertirAResponse(AtencionClinica atencion) {
        // Obtener nombres relacionados
        String nombreAsegurado = obtenerNombreAsegurado(atencion.getPkAsegurado());
        String nombreIpress = obtenerNombreIpress(atencion.getIdIpress());
        String nombreEspecialidad = obtenerNombreEspecialidad(atencion.getIdEspecialidad());
        String nombreEstrategia = obtenerNombreEstrategia(atencion.getIdEstrategia());
        String siglaEstrategia = obtenerSiglaEstrategia(atencion.getIdEstrategia());
        String nombreTipoAtencion = obtenerNombreTipoAtencion(atencion.getIdTipoAtencion());
        String siglaTipoAtencion = obtenerSiglaTipoAtencion(atencion.getIdTipoAtencion());
        String nombreEspecialidadInterconsulta = obtenerNombreEspecialidad(atencion.getIdEspecialidadInterconsulta());
        String nombreProfesional = obtenerNombrePersonal(atencion.getIdPersonalCreador());
        String nombreModificador = obtenerNombrePersonal(atencion.getIdPersonalModificador());

        // Obtener descripción CIE-10 si existe (compatibilidad legacy)
        String cie10Descripcion = null;
        if (atencion.getCie10Codigo() != null && !atencion.getCie10Codigo().isEmpty()) {
            cie10Descripcion = dimCie10Repository.findDescripcionByCodigo(atencion.getCie10Codigo())
                    .orElse(null);
        }

        // Obtener lista completa de diagnósticos CIE-10 (soporte múltiple)
        List<DiagnosticoCie10DTO> diagnosticosCie10 = diagnosticoCie10Repository
                .findByIdAtencionOrderByOrdenAsc(atencion.getIdAtencion())
                .stream()
                .map(diag -> {
                    String descripcion = dimCie10Repository
                            .findDescripcionByCodigo(diag.getCie10Codigo())
                            .orElse(null);
                    return DiagnosticoCie10DTO.builder()
                            .cie10Codigo(diag.getCie10Codigo())
                            .cie10Descripcion(descripcion)
                            .esPrincipal(diag.getEsPrincipal())
                            .orden(diag.getOrden())
                            .observaciones(diag.getObservaciones())
                            .build();
                })
                .collect(Collectors.toList());

        // Construir DTO de signos vitales
        AtencionClinicaResponseDTO.SignosVitalesDTO signosVitales = AtencionClinicaResponseDTO.SignosVitalesDTO
                .builder()
                .presionArterial(atencion.getPresionArterial())
                .temperatura(atencion.getTemperatura())
                .pesoKg(atencion.getPesoKg())
                .tallaCm(atencion.getTallaCm())
                .imc(atencion.getImc())
                .saturacionO2(atencion.getSaturacionO2())
                .frecuenciaCardiaca(atencion.getFrecuenciaCardiaca())
                .frecuenciaRespiratoria(atencion.getFrecuenciaRespiratoria())
                .build();

        return AtencionClinicaResponseDTO.builder()
                .idAtencion(atencion.getIdAtencion())
                .pkAsegurado(atencion.getPkAsegurado())
                .nombreAsegurado(nombreAsegurado)
                .fechaAtencion(atencion.getFechaAtencion())
                .idIpress(atencion.getIdIpress())
                .nombreIpress(nombreIpress)
                .idEspecialidad(atencion.getIdEspecialidad())
                .nombreEspecialidad(nombreEspecialidad)
                .idServicio(atencion.getIdServicio())
                .motivoConsulta(atencion.getMotivoConsulta())
                .antecedentes(atencion.getAntecedentes())
                .diagnostico(atencion.getDiagnostico())
                .cie10Codigo(atencion.getCie10Codigo())
                .cie10Descripcion(cie10Descripcion)
                .diagnosticosCie10(diagnosticosCie10)
                .recomendacionEspecialista(atencion.getRecomendacionEspecialista())
                .tratamiento(atencion.getTratamiento())
                .resultadosClinicos(atencion.getResultadosClinicos())
                .observacionesGenerales(atencion.getObservacionesGenerales())
                .datosSeguimiento(atencion.getDatosSeguimiento())
                .signosVitales(signosVitales)
                .idEstrategia(atencion.getIdEstrategia())
                .nombreEstrategia(nombreEstrategia)
                .siglaEstrategia(siglaEstrategia)
                .idTipoAtencion(atencion.getIdTipoAtencion())
                .nombreTipoAtencion(nombreTipoAtencion)
                .siglaTipoAtencion(siglaTipoAtencion)
                .tieneOrdenInterconsulta(atencion.getTieneOrdenInterconsulta())
                .idEspecialidadInterconsulta(atencion.getIdEspecialidadInterconsulta())
                .nombreEspecialidadInterconsulta(nombreEspecialidadInterconsulta)
                .modalidadInterconsulta(atencion.getModalidadInterconsulta())
                .requiereTelemonitoreo(atencion.getRequiereTelemonitoreo())
                .idPersonalCreador(atencion.getIdPersonalCreador())
                .nombreProfesional(nombreProfesional)
                .idPersonalModificador(atencion.getIdPersonalModificador())
                .nombreModificador(nombreModificador)
                .createdAt(atencion.getCreatedAt())
                .updatedAt(atencion.getUpdatedAt())
                .tieneSignosVitales(atencion.tieneSignosVitales())
                .isCompleta(atencion.isCompleta())
                .build();
    }

    private Usuario obtenerUsuarioActual() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        return usuarioRepository.findByNameUser(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado: " + username));
    }

    private Long obtenerIdPersonalDelUsuario(Usuario usuario) {
        // El usuario debería tener un PersonalCNT asociado
        if (usuario.getPersonalCnt() != null) {
            return usuario.getPersonalCnt().getIdPers();
        }
        throw new RuntimeException("El usuario no tiene personal asociado");
    }

    private String obtenerNombreAsegurado(String pkAsegurado) {
        return aseguradoRepository.findById(pkAsegurado)
                .map(Asegurado::getPaciente)
                .orElse("Asegurado Desconocido");
    }

    private String obtenerNombreIpress(Long idIpress) {
        if (idIpress == null)
            return null;
        return ipressRepository.findById(idIpress)
                .map(Ipress::getDescIpress)
                .orElse(null);
    }

    private String obtenerNombreEspecialidad(Long idEspecialidad) {
        if (idEspecialidad == null)
            return null;
        return servicioEssiRepository.findById(idEspecialidad)
                .map(DimServicioEssi::getDescServicio)
                .orElse(null);
    }

    private String obtenerNombreEstrategia(Long idEstrategia) {
        if (idEstrategia == null)
            return null;
        return estrategiaRepository.findById(idEstrategia)
                .map(EstrategiaInstitucional::getDescEstrategia)
                .orElse(null);
    }

    private String obtenerSiglaEstrategia(Long idEstrategia) {
        if (idEstrategia == null)
            return null;
        return estrategiaRepository.findById(idEstrategia)
                .map(EstrategiaInstitucional::getSigla)
                .orElse(null);
    }

    private String obtenerNombreTipoAtencion(Long idTipoAtencion) {
        if (idTipoAtencion == null)
            return null;
        return tipoAtencionRepository.findById(idTipoAtencion)
                .map(TipoAtencionTelemedicina::getDescTipoAtencion)
                .orElse(null);
    }

    private String obtenerSiglaTipoAtencion(Long idTipoAtencion) {
        if (idTipoAtencion == null)
            return null;
        return tipoAtencionRepository.findById(idTipoAtencion)
                .map(TipoAtencionTelemedicina::getSigla)
                .orElse(null);
    }

    private String obtenerNombrePersonal(Long idPersonal) {
        if (idPersonal == null)
            return null;
        return personalCntRepository.findById(idPersonal)
                .map(p -> p.getNomPers() + " " + p.getApePaterPers() + " " + p.getApeMaterPers())
                .orElse(null);
    }
}

package com.styp.cenate.service.formdiag.impl;

import com.styp.cenate.dto.formdiag.FormDiagListResponse;
import com.styp.cenate.dto.formdiag.FormDiagRequest;
import com.styp.cenate.dto.formdiag.FormDiagResponse;
import com.styp.cenate.model.Ipress;
import com.styp.cenate.model.formdiag.*;
import com.styp.cenate.repository.IpressRepository;
import com.styp.cenate.repository.formdiag.*;
import com.styp.cenate.service.formdiag.FormDiagService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.Year;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementación del servicio de formularios de diagnóstico
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class FormDiagServiceImpl implements FormDiagService {

    private final FormDiagFormularioRepository formularioRepo;
    private final FormDiagDatosGeneralesRepository datosGeneralesRepo;
    private final FormDiagRecursosHumanosRepository recursosHumanosRepo;
    private final FormDiagInfraFisRepository infraFisRepo;
    private final FormDiagInfraTecRepository infraTecRepo;
    private final FormDiagConectividadSistRepository conectividadRepo;
    private final FormDiagEquipamientoRepository equipamientoRepo;
    private final FormDiagServicioRepository servicioRepo;
    private final FormDiagNecesidadRepository necesidadRepo;
    private final FormDiagNecCapacitacionRepository necCapacitacionRepo;
    private final FormDiagRhApoyoRepository rhApoyoRepo;
    private final IpressRepository ipressRepo;

    @Override
    public FormDiagResponse crear(FormDiagRequest request, String username) {
        log.info("Creando nuevo formulario de diagnóstico para IPRESS: {}", request.getIdIpress());

        Ipress ipress = ipressRepo.findById(request.getIdIpress())
                .orElseThrow(() -> new EntityNotFoundException("IPRESS no encontrada: " + request.getIdIpress()));

        // Crear formulario principal
        FormDiagFormulario formulario = FormDiagFormulario.builder()
                .ipress(ipress)
                .anio(request.getAnio() != null ? request.getAnio() : Year.now().getValue())
                .estado("EN_PROCESO")
                .usuarioRegistro(username)
                .observaciones(request.getObservaciones())
                .build();

        formulario = formularioRepo.save(formulario);
        Integer idFormulario = formulario.getIdFormulario();

        // Guardar secciones
        guardarSecciones(idFormulario, request, formulario);

        // Guardar PDF si se proporciona
        if (request.getPdfBase64() != null && !request.getPdfBase64().isEmpty()) {
            guardarPdfSinFirma(formulario, request.getPdfBase64());
        }

        return obtenerPorId(idFormulario);
    }

    @Override
    public FormDiagResponse actualizar(Integer idFormulario, FormDiagRequest request, String username) {
        log.info("Actualizando formulario de diagnóstico: {}", idFormulario);

        FormDiagFormulario formulario = formularioRepo.findById(idFormulario)
                .orElseThrow(() -> new EntityNotFoundException("Formulario no encontrado: " + idFormulario));

        if (!"EN_PROCESO".equals(formulario.getEstado())) {
            throw new IllegalStateException("Solo se pueden editar formularios en estado EN_PROCESO");
        }

        formulario.setObservaciones(request.getObservaciones());
        formularioRepo.save(formulario);

        // Actualizar secciones
        guardarSecciones(idFormulario, request, formulario);

        // Guardar PDF si se proporciona
        if (request.getPdfBase64() != null && !request.getPdfBase64().isEmpty()) {
            guardarPdfSinFirma(formulario, request.getPdfBase64());
        }

        return obtenerPorId(idFormulario);
    }

    @Override
    public FormDiagResponse guardarBorrador(FormDiagRequest request, String username) {
        if (request.getIdFormulario() != null) {
            return actualizar(request.getIdFormulario().intValue(), request, username);
        } else {
            return crear(request, username);
        }
    }

    @Override
    public FormDiagResponse enviar(Integer idFormulario, String username) {
        log.info("Enviando formulario de diagnóstico: {}", idFormulario);

        FormDiagFormulario formulario = formularioRepo.findById(idFormulario)
                .orElseThrow(() -> new EntityNotFoundException("Formulario no encontrado: " + idFormulario));

        formulario.setEstado("ENVIADO");
        formulario.setFechaEnvio(LocalDateTime.now());
        formularioRepo.save(formulario);

        return obtenerPorId(idFormulario);
    }

    @Override
    @Transactional(readOnly = true)
    public FormDiagResponse obtenerPorId(Integer idFormulario) {
        FormDiagFormulario formulario = formularioRepo.findById(idFormulario)
                .orElseThrow(() -> new EntityNotFoundException("Formulario no encontrado: " + idFormulario));

        return mapToResponse(formulario);
    }

    @Override
    @Transactional(readOnly = true)
    public FormDiagResponse obtenerEnProcesoPorIpress(Long idIpress) {
        int anioActual = Year.now().getValue();
        return formularioRepo.findEnProcesoPorIpressAndAnio(idIpress, anioActual)
                .map(this::mapToResponse)
                .orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public FormDiagResponse obtenerUltimoPorIpress(Long idIpress) {
        List<FormDiagFormulario> formularios = formularioRepo.findByIpressOrderByFechaCreacionDesc(idIpress);
        if (formularios.isEmpty()) {
            return null;
        }
        return mapToResponse(formularios.get(0));
    }

    @Override
    @Transactional(readOnly = true)
    public List<FormDiagListResponse> listarTodos() {
        return formularioRepo.findAll().stream()
                .map(this::mapToListResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<FormDiagListResponse> listarPorIpress(Long idIpress) {
        return formularioRepo.findByIdIpress(idIpress).stream()
                .map(this::mapToListResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<FormDiagListResponse> listarPorRed(Long idRed) {
        return formularioRepo.findByIdRed(idRed).stream()
                .map(this::mapToListResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<FormDiagListResponse> listarPorEstado(String estado) {
        return formularioRepo.findByEstadoOrderByFechaCreacionDesc(estado).stream()
                .map(this::mapToListResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<FormDiagListResponse> listarPorAnio(Integer anio) {
        return formularioRepo.findByAnioOrderByFechaCreacionDesc(anio).stream()
                .map(this::mapToListResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void eliminar(Integer idFormulario) {
        FormDiagFormulario formulario = formularioRepo.findById(idFormulario)
                .orElseThrow(() -> new EntityNotFoundException("Formulario no encontrado: " + idFormulario));

        // Permitir eliminar formularios en estado EN_PROCESO, ENVIADO o FIRMADO
        String estado = formulario.getEstado();
        if (!"EN_PROCESO".equals(estado) && !"ENVIADO".equals(estado) && !"FIRMADO".equals(estado)) {
            throw new IllegalStateException("Solo se pueden eliminar formularios en estado EN_PROCESO, ENVIADO o FIRMADO");
        }

        // Eliminar registros relacionados
        equipamientoRepo.deleteByIdFormulario(idFormulario);
        servicioRepo.deleteByIdFormulario(idFormulario);
        necesidadRepo.deleteByIdFormulario(idFormulario);
        necCapacitacionRepo.deleteByIdFormulario(idFormulario);
        rhApoyoRepo.deleteByIdFormulario(idFormulario);

        formularioRepo.delete(formulario);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existeEnProcesoActual(Long idIpress) {
        int anioActual = Year.now().getValue();
        return formularioRepo.findEnProcesoPorIpressAndAnio(idIpress, anioActual).isPresent();
    }

    // ==================== MÉTODOS PRIVADOS ====================

    /**
     * Guarda el PDF sin firma digital
     */
    private void guardarPdfSinFirma(FormDiagFormulario formulario, String pdfBase64) {
        try {
            byte[] pdfBytes = java.util.Base64.getDecoder().decode(pdfBase64);
            formulario.setPdfFirmado(pdfBytes);
            formulario.setPdfTamanio((long) pdfBytes.length);
            formulario.setPdfNombre(generarNombrePdf(formulario));

            // Calcular hash del documento
            java.security.MessageDigest digest = java.security.MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(pdfBytes);
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            formulario.setHashDocumento(hexString.toString());

            formularioRepo.save(formulario);
            log.info("PDF guardado para formulario {}, tamaño: {} bytes", formulario.getIdFormulario(), pdfBytes.length);
        } catch (Exception e) {
            log.error("Error al guardar PDF sin firma: {}", e.getMessage());
        }
    }

    /**
     * Genera un nombre único para el PDF
     */
    private String generarNombrePdf(FormDiagFormulario formulario) {
        String ipressCode = formulario.getIpress().getCodIpress();
        String timestamp = java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")
                .format(LocalDateTime.now());
        return String.format("DIAG_%s_%s.pdf", ipressCode, timestamp);
    }

    private void guardarSecciones(Integer idFormulario, FormDiagRequest request, FormDiagFormulario formulario) {
        // Datos Generales
        if (request.getDatosGenerales() != null) {
            guardarDatosGenerales(idFormulario, request.getDatosGenerales(), formulario);
        }

        // Recursos Humanos
        if (request.getRecursosHumanos() != null) {
            guardarRecursosHumanos(idFormulario, request.getRecursosHumanos(), formulario);
        }

        // Infraestructura
        if (request.getInfraestructura() != null) {
            guardarInfraestructura(idFormulario, request.getInfraestructura(), formulario);
        }

        // Equipamiento
        if (request.getEquipamiento() != null && !request.getEquipamiento().isEmpty()) {
            guardarEquipamiento(idFormulario, request.getEquipamiento());
        }

        // Conectividad
        if (request.getConectividad() != null) {
            guardarConectividad(idFormulario, request.getConectividad(), formulario);
        }

        // Servicios
        if (request.getServicios() != null && !request.getServicios().isEmpty()) {
            guardarServicios(idFormulario, request.getServicios());
        }

        // Necesidades
        if (request.getNecesidades() != null) {
            guardarNecesidades(idFormulario, request.getNecesidades(), formulario);
        }
    }

    private void guardarDatosGenerales(Integer idFormulario, FormDiagRequest.DatosGeneralesDto dto, FormDiagFormulario formulario) {
        FormDiagDatosGenerales entity = datosGeneralesRepo.findByIdFormulario(idFormulario)
                .orElse(new FormDiagDatosGenerales());

        // Solo setear formulario - @MapsId deriva el ID automáticamente
        entity.setFormulario(formulario);
        entity.setDirectorNombre(dto.getDirectorNombre());
        entity.setDirectorCorreo(dto.getDirectorCorreo());
        entity.setDirectorTelefono(dto.getDirectorTelefono());
        entity.setRespTelesaludNombre(dto.getResponsableNombre());
        entity.setRespTelesaludCorreo(dto.getResponsableCorreo());
        entity.setRespTelesaludTelefono(dto.getResponsableTelefono());
        entity.setPoblacionAdscrita(dto.getPoblacionAdscrita() != null ? dto.getPoblacionAdscrita().intValue() : null);
        entity.setPromedioAtencionesMensuales(dto.getAtencionesMenuales() != null ? BigDecimal.valueOf(dto.getAtencionesMenuales()) : null);

        datosGeneralesRepo.save(entity);
    }

    private void guardarRecursosHumanos(Integer idFormulario, FormDiagRequest.RecursosHumanosDto dto, FormDiagFormulario formulario) {
        FormDiagRecursosHumanos entity = recursosHumanosRepo.findByIdFormulario(idFormulario)
                .orElse(new FormDiagRecursosHumanos());

        // Solo setear formulario - @MapsId deriva el ID automáticamente
        entity.setFormulario(formulario);
        entity.setCoordDesignado(dto.getCoordTelesalud());
        entity.setCoordNombreCompleto(dto.getCoordNombreCompleto());
        entity.setCoordCorreo(dto.getCoordCorreo());
        entity.setCoordCelular(dto.getCoordCelular());
        entity.setPersonalApoyo(dto.getPersonalApoyo());
        entity.setCapacitacionTic(dto.getCapacitacionTic());
        entity.setConoceNormativa(dto.getNormativa());
        entity.setAlfabetizacionDigital(dto.getAlfabetizacion());
        entity.setPlanCapacitacion(dto.getPlanCapacitacion());
        entity.setNumCapacitacionesUltimoAnio(dto.getCapacitacionesAnio());
        entity.setNecesidadesCapacitacionTexto(dto.getNecesidadesCapacitacion());

        recursosHumanosRepo.save(entity);
    }

    private void guardarInfraestructura(Integer idFormulario, FormDiagRequest.InfraestructuraDto dto, FormDiagFormulario formulario) {
        // Infraestructura Física
        FormDiagInfraFis infraFis = infraFisRepo.findByIdFormulario(idFormulario)
                .orElse(new FormDiagInfraFis());

        // Solo setear formulario - @MapsId deriva el ID automáticamente
        infraFis.setFormulario(formulario);
        infraFis.setEspacioFisico(dto.getEspacioFisico());
        infraFis.setPrivacidad(dto.getPrivacidad());
        infraFis.setEscritorio(dto.getEscritorio());
        infraFis.setSillas(dto.getSillas());
        infraFis.setEstantes(dto.getEstantes());
        infraFis.setArchivero(dto.getArchivero());
        infraFis.setIluminacion(dto.getIluminacion());
        infraFis.setVentilacion(dto.getVentilacion());
        infraFis.setAireAcondicionado(dto.getAireAcondicionado());
        infraFis.setNumeroAmbientes(dto.getNumAmbientes());

        infraFisRepo.save(infraFis);

        // Infraestructura Tecnológica
        FormDiagInfraTec infraTec = infraTecRepo.findByIdFormulario(idFormulario)
                .orElse(new FormDiagInfraTec());

        // Solo setear formulario - @MapsId deriva el ID automáticamente
        infraTec.setFormulario(formulario);
        infraTec.setHardware(dto.getHardware());
        infraTec.setSoftware(dto.getSoftware());
        infraTec.setRedes(dto.getRedes());
        infraTec.setAlmacenamiento(dto.getAlmacenamiento());
        infraTec.setServicios(dto.getServiciosTec());

        infraTecRepo.save(infraTec);
    }

    private void guardarEquipamiento(Integer idFormulario, List<FormDiagRequest.EquipamientoDto> dtos) {
        // Eliminar equipamiento existente
        equipamientoRepo.deleteByIdFormulario(idFormulario);

        // Guardar nuevo equipamiento
        for (FormDiagRequest.EquipamientoDto dto : dtos) {
            if (dto.getIdEquipamiento() != null) {
                FormDiagEquipamiento entity = FormDiagEquipamiento.builder()
                        .idFormulario(idFormulario)
                        .idEquipamiento(dto.getIdEquipamiento())
                        .disponible(dto.getDisponible())
                        .cantidad(dto.getCantidad())
                        .idEstadoEquipo(dto.getIdEstadoEquipo())
                        .observaciones(dto.getObservaciones())
                        .build();
                equipamientoRepo.save(entity);
            }
        }
    }

    private void guardarConectividad(Integer idFormulario, FormDiagRequest.ConectividadDto dto, FormDiagFormulario formulario) {
        FormDiagConectividadSist entity = conectividadRepo.findByIdFormulario(idFormulario)
                .orElse(new FormDiagConectividadSist());

        // Solo setear formulario - @MapsId deriva el ID automáticamente
        entity.setFormulario(formulario);
        entity.setAccesoInternet(dto.getInternet());
        entity.setConexionEstable(dto.getEstable());
        entity.setSistemaEnergia(dto.getEnergiaAlt());
        entity.setPuntosRed(dto.getPuntosRed());
        entity.setRedWifi(dto.getWifi());
        entity.setTipoConexion(dto.getTipoConexion());
        entity.setProveedorInternet(dto.getProveedor());
        entity.setVelocidadContratada(dto.getVelocidadContratada() != null ? BigDecimal.valueOf(dto.getVelocidadContratada()) : null);
        entity.setVelocidadReal(dto.getVelocidadReal() != null ? BigDecimal.valueOf(dto.getVelocidadReal()) : null);
        entity.setPuntosRedDisponibles(dto.getNumPuntosRed());
        entity.setEssi(dto.getEssi());
        entity.setPacs(dto.getPacs());
        entity.setAnatpat(dto.getAnatpat());
        entity.setVideoconferencia(dto.getVideoconferencia());
        entity.setCitasLinea(dto.getCitasLinea());
        entity.setOtroSistemaInteroperable(dto.getOtroSistema());
        entity.setConfidencialidad(dto.getConfidencialidad());
        entity.setIntegridad(dto.getIntegridad());
        entity.setDisponibilidad(dto.getDisponibilidad());
        entity.setPlanesContingencia(dto.getContingencia());
        entity.setBackup(dto.getBackup());
        entity.setConsentimiento(dto.getConsentimiento());
        entity.setLey29733(dto.getLey29733());

        conectividadRepo.save(entity);
    }

    private void guardarServicios(Integer idFormulario, List<FormDiagRequest.ServicioDto> dtos) {
        // Eliminar servicios existentes
        servicioRepo.deleteByIdFormulario(idFormulario);

        // Guardar nuevos servicios
        for (FormDiagRequest.ServicioDto dto : dtos) {
            if (dto.getIdServicio() != null) {
                FormDiagServicio entity = FormDiagServicio.builder()
                        .idFormulario(idFormulario)
                        .idServicio(dto.getIdServicio())
                        .disponible(dto.getDisponible())
                        .observaciones(dto.getObservaciones())
                        .build();
                servicioRepo.save(entity);
            }
        }
    }

    private void guardarNecesidades(Integer idFormulario, FormDiagRequest.NecesidadesDto dto, FormDiagFormulario formulario) {
        // Eliminar necesidades existentes
        necesidadRepo.deleteByIdFormulario(idFormulario);
        necCapacitacionRepo.deleteByIdFormulario(idFormulario);

        // Guardar necesidades
        if (dto.getNecesidades() != null) {
            for (FormDiagRequest.NecesidadItemDto item : dto.getNecesidades()) {
                if (item.getIdNecesidad() != null) {
                    FormDiagNecesidad entity = FormDiagNecesidad.builder()
                            .idFormulario(idFormulario)
                            .idNecesidad(item.getIdNecesidad())
                            .cantidadRequerida(item.getCantidadRequerida())
                            .idPrioridad(item.getIdPrioridad())
                            .build();
                    necesidadRepo.save(entity);
                }
            }
        }

        // Guardar necesidades de capacitación
        if (dto.getCapacitacion() != null) {
            for (FormDiagRequest.CapacitacionDto cap : dto.getCapacitacion()) {
                FormDiagNecCapacitacion entity = FormDiagNecCapacitacion.builder()
                        .idFormulario(idFormulario)
                        .temaCapacitacion(cap.getTemaCapacitacion())
                        .poblacionObjetivo(cap.getPoblacionObjetivo())
                        .numParticipantes(cap.getNumParticipantes())
                        .idPrioridad(cap.getIdPrioridad())
                        .build();
                necCapacitacionRepo.save(entity);
            }
        }

        // Guardar campos de texto de necesidades en el formulario
        formulario.setNecesidadesConectividad(dto.getNecesidadesConectividad());
        formulario.setNecesidadesCapacitacion(dto.getNecesidadesCapacitacion());
        formulario.setObservacionesGenerales(dto.getObservacionesGenerales());
        formularioRepo.save(formulario);
    }

    // ==================== MAPEO A DTOs ====================

    private FormDiagResponse mapToResponse(FormDiagFormulario formulario) {
        Integer idFormulario = formulario.getIdFormulario();
        Ipress ipress = formulario.getIpress();

        FormDiagResponse.FormDiagResponseBuilder builder = FormDiagResponse.builder()
                .idFormulario(idFormulario)
                .idIpress(ipress.getIdIpress())
                .nombreIpress(ipress.getDescIpress())
                .codigoIpress(ipress.getCodIpress())
                .idRed(ipress.getRed() != null ? ipress.getRed().getId() : null)
                .nombreRed(ipress.getRed() != null ? ipress.getRed().getDescripcion() : null)
                .nombreMacroregion(ipress.getRed() != null && ipress.getRed().getMacroregion() != null
                        ? ipress.getRed().getMacroregion().getDescMacro() : null)
                .anio(formulario.getAnio())
                .estado(formulario.getEstado())
                .usuarioRegistro(formulario.getUsuarioRegistro())
                .observaciones(formulario.getObservaciones())
                .fechaCreacion(formulario.getFechaCreacion())
                .fechaEnvio(formulario.getFechaEnvio());

        // Mapear secciones
        datosGeneralesRepo.findByIdFormulario(idFormulario).ifPresent(dg ->
                builder.datosGenerales(mapDatosGenerales(dg)));

        recursosHumanosRepo.findByIdFormulario(idFormulario).ifPresent(rh ->
                builder.recursosHumanos(mapRecursosHumanos(rh)));

        // Mapear infraestructura (física + tecnológica)
        FormDiagResponse.InfraestructuraDto infraDto = mapInfraestructura(idFormulario);
        if (infraDto != null) {
            builder.infraestructura(infraDto);
        }

        // Mapear equipamiento
        List<FormDiagEquipamiento> equipamientoList = equipamientoRepo.findByIdFormulario(idFormulario);
        if (!equipamientoList.isEmpty()) {
            builder.equipamiento(equipamientoList.stream()
                    .map(this::mapEquipamiento)
                    .collect(Collectors.toList()));
        }

        // Mapear conectividad
        conectividadRepo.findByIdFormulario(idFormulario).ifPresent(con ->
                builder.conectividad(mapConectividad(con)));

        // Mapear servicios
        List<FormDiagServicio> serviciosList = servicioRepo.findByIdFormulario(idFormulario);
        if (!serviciosList.isEmpty()) {
            builder.servicios(serviciosList.stream()
                    .map(this::mapServicio)
                    .collect(Collectors.toList()));
        }

        // Mapear necesidades
        FormDiagResponse.NecesidadesDto necesidadesDto = mapNecesidades(idFormulario, formulario);
        if (necesidadesDto != null) {
            builder.necesidades(necesidadesDto);
        }

        return builder.build();
    }

    private FormDiagResponse.DatosGeneralesDto mapDatosGenerales(FormDiagDatosGenerales entity) {
        return FormDiagResponse.DatosGeneralesDto.builder()
                .directorNombre(entity.getDirectorNombre())
                .directorCorreo(entity.getDirectorCorreo())
                .directorTelefono(entity.getDirectorTelefono())
                .responsableNombre(entity.getRespTelesaludNombre())
                .responsableCorreo(entity.getRespTelesaludCorreo())
                .responsableTelefono(entity.getRespTelesaludTelefono())
                .poblacionAdscrita(entity.getPoblacionAdscrita() != null ? entity.getPoblacionAdscrita().longValue() : null)
                .atencionesMenuales(entity.getPromedioAtencionesMensuales() != null ? entity.getPromedioAtencionesMensuales().longValue() : null)
                .build();
    }

    private FormDiagResponse.RecursosHumanosDto mapRecursosHumanos(FormDiagRecursosHumanos entity) {
        return FormDiagResponse.RecursosHumanosDto.builder()
                .coordTelesalud(entity.getCoordDesignado())
                .coordNombreCompleto(entity.getCoordNombreCompleto())
                .coordCorreo(entity.getCoordCorreo())
                .coordCelular(entity.getCoordCelular())
                .personalApoyo(entity.getPersonalApoyo())
                .capacitacionTic(entity.getCapacitacionTic())
                .normativa(entity.getConoceNormativa())
                .alfabetizacion(entity.getAlfabetizacionDigital())
                .planCapacitacion(entity.getPlanCapacitacion())
                .capacitacionesAnio(entity.getNumCapacitacionesUltimoAnio())
                .necesidadesCapacitacion(entity.getNecesidadesCapacitacionTexto())
                .build();
    }

    private FormDiagResponse.InfraestructuraDto mapInfraestructura(Integer idFormulario) {
        FormDiagResponse.InfraestructuraDto.InfraestructuraDtoBuilder builder =
                FormDiagResponse.InfraestructuraDto.builder();

        infraFisRepo.findByIdFormulario(idFormulario).ifPresent(infraFis -> {
            builder.espacioFisico(infraFis.getEspacioFisico())
                    .privacidad(infraFis.getPrivacidad())
                    .escritorio(infraFis.getEscritorio())
                    .sillas(infraFis.getSillas())
                    .estantes(infraFis.getEstantes())
                    .archivero(infraFis.getArchivero())
                    .iluminacion(infraFis.getIluminacion())
                    .ventilacion(infraFis.getVentilacion())
                    .aireAcondicionado(infraFis.getAireAcondicionado())
                    .numAmbientes(infraFis.getNumeroAmbientes());
        });

        infraTecRepo.findByIdFormulario(idFormulario).ifPresent(infraTec -> {
            builder.hardware(infraTec.getHardware())
                    .software(infraTec.getSoftware())
                    .redes(infraTec.getRedes())
                    .almacenamiento(infraTec.getAlmacenamiento())
                    .serviciosTec(infraTec.getServicios());
        });

        return builder.build();
    }

    private FormDiagResponse.EquipamientoDto mapEquipamiento(FormDiagEquipamiento entity) {
        return FormDiagResponse.EquipamientoDto.builder()
                .id(entity.getIdFormEquip())
                .idEquipamiento(entity.getIdEquipamiento())
                .nombreEquipamiento(entity.getEquipamiento() != null ? entity.getEquipamiento().getDescripcion() : null)
                .tipoEquipamiento(entity.getEquipamiento() != null ? entity.getEquipamiento().getTipo() : null)
                .disponible(entity.getDisponible())
                .cantidad(entity.getCantidad())
                .idEstadoEquipo(entity.getIdEstadoEquipo())
                .estado(entity.getEstadoEquipo() != null ? entity.getEstadoEquipo().getNombre() : null)
                .observaciones(entity.getObservaciones())
                .build();
    }

    private FormDiagResponse.ConectividadDto mapConectividad(FormDiagConectividadSist entity) {
        return FormDiagResponse.ConectividadDto.builder()
                .internet(entity.getAccesoInternet())
                .estable(entity.getConexionEstable())
                .energiaAlt(entity.getSistemaEnergia())
                .puntosRed(entity.getPuntosRed())
                .wifi(entity.getRedWifi())
                .tipoConexion(entity.getTipoConexion())
                .proveedor(entity.getProveedorInternet())
                .velocidadContratada(entity.getVelocidadContratada() != null ? entity.getVelocidadContratada().intValue() : null)
                .velocidadReal(entity.getVelocidadReal() != null ? entity.getVelocidadReal().intValue() : null)
                .numPuntosRed(entity.getPuntosRedDisponibles())
                .essi(entity.getEssi())
                .pacs(entity.getPacs())
                .anatpat(entity.getAnatpat())
                .videoconferencia(entity.getVideoconferencia())
                .citasLinea(entity.getCitasLinea())
                .otroSistema(entity.getOtroSistemaInteroperable())
                .confidencialidad(entity.getConfidencialidad())
                .integridad(entity.getIntegridad())
                .disponibilidad(entity.getDisponibilidad())
                .contingencia(entity.getPlanesContingencia())
                .backup(entity.getBackup())
                .consentimiento(entity.getConsentimiento())
                .ley29733(entity.getLey29733())
                .build();
    }

    private FormDiagResponse.ServicioDto mapServicio(FormDiagServicio entity) {
        return FormDiagResponse.ServicioDto.builder()
                .id(entity.getIdFormServicio())
                .idServicio(entity.getIdServicio())
                .nombreServicio(entity.getServicio() != null ? entity.getServicio().getDescripcion() : null)
                .disponible(entity.getDisponible())
                .observaciones(entity.getObservaciones())
                .build();
    }

    private FormDiagResponse.NecesidadesDto mapNecesidades(Integer idFormulario, FormDiagFormulario formulario) {
        List<FormDiagNecesidad> necesidades = necesidadRepo.findByIdFormulario(idFormulario);
        List<FormDiagNecCapacitacion> capacitaciones = necCapacitacionRepo.findByIdFormulario(idFormulario);

        // Verificar si hay datos (incluyendo los campos de texto del formulario)
        boolean hayDatosTexto = formulario.getNecesidadesConectividad() != null ||
                formulario.getNecesidadesCapacitacion() != null ||
                formulario.getObservacionesGenerales() != null;

        if (necesidades.isEmpty() && capacitaciones.isEmpty() && !hayDatosTexto) {
            return null;
        }

        List<FormDiagResponse.NecesidadItemDto> necList = necesidades.stream()
                .map(nec -> FormDiagResponse.NecesidadItemDto.builder()
                        .id(nec.getIdFormNecesidad())
                        .idNecesidad(nec.getIdNecesidad())
                        .nombreNecesidad(nec.getNecesidad() != null ? nec.getNecesidad().getDescripcion() : null)
                        .categoria(nec.getNecesidad() != null ? nec.getNecesidad().getCategoria() : null)
                        .cantidadRequerida(nec.getCantidadRequerida())
                        .idPrioridad(nec.getIdPrioridad())
                        .prioridad(nec.getPrioridad() != null ? nec.getPrioridad().getNombre() : null)
                        .build())
                .collect(Collectors.toList());

        List<FormDiagResponse.CapacitacionDto> capList = capacitaciones.stream()
                .map(cap -> FormDiagResponse.CapacitacionDto.builder()
                        .id(cap.getIdNecCapacitacion())
                        .temaCapacitacion(cap.getTemaCapacitacion())
                        .poblacionObjetivo(cap.getPoblacionObjetivo())
                        .numParticipantes(cap.getNumParticipantes())
                        .idPrioridad(cap.getIdPrioridad())
                        .prioridad(cap.getPrioridad() != null ? cap.getPrioridad().getNombre() : null)
                        .build())
                .collect(Collectors.toList());

        return FormDiagResponse.NecesidadesDto.builder()
                .necesidades(necList)
                .capacitacion(capList)
                .necesidadesConectividad(formulario.getNecesidadesConectividad())
                .necesidadesCapacitacion(formulario.getNecesidadesCapacitacion())
                .observacionesGenerales(formulario.getObservacionesGenerales())
                .build();
    }

    private FormDiagListResponse mapToListResponse(FormDiagFormulario formulario) {
        Ipress ipress = formulario.getIpress();

        // Obtener datos generales si existen
        FormDiagListResponse.DatosGeneralesResumen datosGeneralesResumen = null;
        if (formulario.getDatosGenerales() != null) {
            datosGeneralesResumen = FormDiagListResponse.DatosGeneralesResumen.builder()
                    .directorNombre(formulario.getDatosGenerales().getDirectorNombre())
                    .responsableNombre(formulario.getDatosGenerales().getRespTelesaludNombre())
                    .build();
        }

        return FormDiagListResponse.builder()
                .idFormulario(formulario.getIdFormulario())
                .idIpress(ipress.getIdIpress())
                .nombreIpress(ipress.getDescIpress())
                .codigoIpress(ipress.getCodIpress())
                .idRed(ipress.getRed() != null ? ipress.getRed().getId() : null)
                .nombreRed(ipress.getRed() != null ? ipress.getRed().getDescripcion() : null)
                .nombreMacroregion(ipress.getRed() != null && ipress.getRed().getMacroregion() != null
                        ? ipress.getRed().getMacroregion().getDescMacro() : null)
                .anio(formulario.getAnio())
                .estado(formulario.getEstado())
                .usuarioRegistro(formulario.getUsuarioRegistro())
                .fechaCreacion(formulario.getFechaCreacion())
                .fechaEnvio(formulario.getFechaEnvio())
                // Campos de firma
                .tieneFirma(formulario.getFirmaDigital() != null || formulario.getFechaFirma() != null)
                .firmaDigital(formulario.getFirmaDigital())
                .dniFirmante(formulario.getDniFirmante())
                .nombreFirmante(formulario.getNombreFirmante())
                .fechaFirma(formulario.getFechaFirma())
                .entidadCertificadora(formulario.getEntidadCertificadora())
                .hashDocumento(formulario.getHashDocumento())
                .pdfTamanio(formulario.getPdfTamanio())
                .pdfNombre(formulario.getPdfNombre())
                // Datos generales
                .datosGenerales(datosGeneralesResumen)
                .build();
    }
}

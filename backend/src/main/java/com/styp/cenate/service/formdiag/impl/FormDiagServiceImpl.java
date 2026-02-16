package com.styp.cenate.service.formdiag.impl;

import com.styp.cenate.dto.formdiag.FormDiagEstadisticasDTO;
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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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

        int anio = request.getAnio() != null ? request.getAnio() : Year.now().getValue();

        // 🔍 VALIDACIÓN: Verificar si ya existe un formulario EN_PROCESO para esta IPRESS+año
        var formularioExistente = formularioRepo.findEnProcesoPorIpressAndAnio(request.getIdIpress(), anio);

        if (formularioExistente.isPresent()) {
            // ⚠️  Existe un formulario en proceso - NO crear duplicado
            log.warn("⚠️  Intento de crear formulario duplicado para IPRESS: {} año: {} - Existe uno EN_PROCESO",
                     request.getIdIpress(), anio);
            throw new IllegalStateException(
                "Ya existe un formulario en proceso para esta IPRESS en el año " + anio +
                ". Complete o envíe el existente antes de crear uno nuevo."
            );
        }

        // Crear formulario principal
        FormDiagFormulario formulario = FormDiagFormulario.builder()
                .ipress(ipress)
                .anio(anio)
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
            // Caso 1: El cliente tiene un ID - actualizar ese formulario
            return actualizar(request.getIdFormulario(), request, username);
        } else {
            // Caso 2: El cliente no tiene ID - verificar si ya existe uno en proceso
            int anioActual = Year.now().getValue();
            var formularioExistente = formularioRepo.findEnProcesoPorIpressAndAnio(request.getIdIpress(), anioActual);

            if (formularioExistente.isPresent()) {
                // ✅ Existe un formulario en proceso - actualizar ese en lugar de crear uno nuevo
                log.info("Formulario en proceso encontrado para IPRESS: {} - Actualizando en lugar de duplicar",
                         request.getIdIpress());
                return actualizar(formularioExistente.get().getIdFormulario(), request, username);
            } else {
                // ✅ No existe - crear uno nuevo
                return crear(request, username);
            }
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

    @Override
    @Transactional(readOnly = true)
    public FormDiagEstadisticasDTO obtenerEstadisticasDetalladas(Integer idFormulario) {
        log.info("Obteniendo estadísticas detalladas para formulario: {}", idFormulario);

        FormDiagFormulario formulario = formularioRepo.findById(idFormulario)
                .orElseThrow(() -> new EntityNotFoundException("Formulario no encontrado: " + idFormulario));

        // Obtener el FormDiagResponse completo que tiene todos los datos cargados y correctamente mapeados
        FormDiagResponse formResponse = mapToResponse(formulario);

        // Extraer necesidades del formResponse para los cálculos
        Object necesidadesResponseObj = formResponse.getNecesidades();
        List<Map<String, Object>> necesidadesResponse = new ArrayList<>();
        if (necesidadesResponseObj instanceof Map) {
            Map<String, Object> necesidadesMap = (Map<String, Object>) necesidadesResponseObj;
            Object necList = necesidadesMap.get("necesidades");
            if (necList instanceof List) {
                necesidadesResponse = (List<Map<String, Object>>) necList;
            }
        }

        Ipress ipress = formulario.getIpress();

        // ===== INFRAESTRUCTURA FÍSICA =====
        FormDiagInfraFis infraFisica = infraFisRepo.findByIdFormulario(idFormulario).orElse(null);
        FormDiagEstadisticasDTO.InfraestructuraFisicaStats infraFisStats = null;
        int preguntasSiTotal = 0;
        int preguntasNoTotal = 0;
        int totalPreguntasTotal = 0;

        if (infraFisica != null) {
            Map<String, Boolean> detallesFisica = new HashMap<>();
            int siCount = 0, noCount = 0;
            if (infraFisica.getEspacioFisico() != null) { detallesFisica.put("Espacio Físico", infraFisica.getEspacioFisico()); if (infraFisica.getEspacioFisico()) siCount++; else noCount++; }
            if (infraFisica.getPrivacidad() != null) { detallesFisica.put("Privacidad", infraFisica.getPrivacidad()); if (infraFisica.getPrivacidad()) siCount++; else noCount++; }
            if (infraFisica.getEscritorio() != null) { detallesFisica.put("Escritorio", infraFisica.getEscritorio()); if (infraFisica.getEscritorio()) siCount++; else noCount++; }
            if (infraFisica.getSillas() != null) { detallesFisica.put("Sillas", infraFisica.getSillas()); if (infraFisica.getSillas()) siCount++; else noCount++; }
            if (infraFisica.getEstantes() != null) { detallesFisica.put("Estantes", infraFisica.getEstantes()); if (infraFisica.getEstantes()) siCount++; else noCount++; }
            if (infraFisica.getArchivero() != null) { detallesFisica.put("Archivero", infraFisica.getArchivero()); if (infraFisica.getArchivero()) siCount++; else noCount++; }
            if (infraFisica.getIluminacion() != null) { detallesFisica.put("Iluminación", infraFisica.getIluminacion()); if (infraFisica.getIluminacion()) siCount++; else noCount++; }
            if (infraFisica.getVentilacion() != null) { detallesFisica.put("Ventilación", infraFisica.getVentilacion()); if (infraFisica.getVentilacion()) siCount++; else noCount++; }
            if (infraFisica.getAireAcondicionado() != null) { detallesFisica.put("Aire Acondicionado", infraFisica.getAireAcondicionado()); if (infraFisica.getAireAcondicionado()) siCount++; else noCount++; }

            int totalFisica = siCount + noCount;
            preguntasSiTotal += siCount;
            preguntasNoTotal += noCount;
            totalPreguntasTotal += totalFisica;

            infraFisStats = FormDiagEstadisticasDTO.InfraestructuraFisicaStats.builder()
                    .totalPreguntas(totalFisica)
                    .respuestasSi(siCount)
                    .respuestasNo(noCount)
                    .porcentajeCumplimiento(totalFisica > 0 ? (siCount * 100.0 / totalFisica) : 0)
                    .detalles(detallesFisica)
                    .build();
        }

        // ===== INFRAESTRUCTURA TECNOLÓGICA =====
        FormDiagInfraTec infraTec = infraTecRepo.findByIdFormulario(idFormulario).orElse(null);
        FormDiagEstadisticasDTO.InfraestructuraTecStats infraTecStats = null;

        if (infraTec != null) {
            Map<String, Boolean> detallesTec = new HashMap<>();
            int siCount = 0, noCount = 0;
            if (infraTec.getHardware() != null) { detallesTec.put("Hardware", infraTec.getHardware()); if (infraTec.getHardware()) siCount++; else noCount++; }
            if (infraTec.getSoftware() != null) { detallesTec.put("Software", infraTec.getSoftware()); if (infraTec.getSoftware()) siCount++; else noCount++; }
            if (infraTec.getRedes() != null) { detallesTec.put("Redes", infraTec.getRedes()); if (infraTec.getRedes()) siCount++; else noCount++; }
            if (infraTec.getAlmacenamiento() != null) { detallesTec.put("Almacenamiento", infraTec.getAlmacenamiento()); if (infraTec.getAlmacenamiento()) siCount++; else noCount++; }
            if (infraTec.getServicios() != null) { detallesTec.put("Servicios Técnicos", infraTec.getServicios()); if (infraTec.getServicios()) siCount++; else noCount++; }

            int totalTec = siCount + noCount;
            preguntasSiTotal += siCount;
            preguntasNoTotal += noCount;
            totalPreguntasTotal += totalTec;

            infraTecStats = FormDiagEstadisticasDTO.InfraestructuraTecStats.builder()
                    .totalPreguntas(totalTec)
                    .respuestasSi(siCount)
                    .respuestasNo(noCount)
                    .porcentajeCumplimiento(totalTec > 0 ? (siCount * 100.0 / totalTec) : 0)
                    .detalles(detallesTec)
                    .build();
        }

        // ===== CONECTIVIDAD =====
        FormDiagConectividadSist conectividad = conectividadRepo.findByIdFormulario(idFormulario).orElse(null);
        FormDiagEstadisticasDTO.ConectividadStats conectividadStats = null;

        if (conectividad != null) {
            List<FormDiagEstadisticasDTO.SistemaDisponible> sistemas = new ArrayList<>();
            sistemas.add(FormDiagEstadisticasDTO.SistemaDisponible.builder().nombre("ESSI").disponible(conectividad.getEssi() != null && conectividad.getEssi()).build());
            sistemas.add(FormDiagEstadisticasDTO.SistemaDisponible.builder().nombre("PACS").disponible(conectividad.getPacs() != null && conectividad.getPacs()).build());
            sistemas.add(FormDiagEstadisticasDTO.SistemaDisponible.builder().nombre("ANATPAT").disponible(conectividad.getAnatpat() != null && conectividad.getAnatpat()).build());
            sistemas.add(FormDiagEstadisticasDTO.SistemaDisponible.builder().nombre("Videoconferencia").disponible(conectividad.getVideoconferencia() != null && conectividad.getVideoconferencia()).build());
            sistemas.add(FormDiagEstadisticasDTO.SistemaDisponible.builder().nombre("Citas Línea").disponible(conectividad.getCitasLinea() != null && conectividad.getCitasLinea()).build());

            conectividadStats = FormDiagEstadisticasDTO.ConectividadStats.builder()
                    .tieneInternet(conectividad.getAccesoInternet() != null && conectividad.getAccesoInternet())
                    .esEstable(conectividad.getConexionEstable() != null && conectividad.getConexionEstable())
                    .tipoConexion(conectividad.getTipoConexion())
                    .proveedor(conectividad.getProveedorInternet())
                    .velocidadContratada(conectividad.getVelocidadContratada() != null ? conectividad.getVelocidadContratada().intValue() : 0)
                    .velocidadReal(conectividad.getVelocidadReal() != null ? conectividad.getVelocidadReal().intValue() : 0)
                    .numPuntosRed(conectividad.getPuntosRedDisponibles() != null ? conectividad.getPuntosRedDisponibles() : 0)
                    .tieneWifi(conectividad.getRedWifi() != null && conectividad.getRedWifi())
                    .tieneEnergyAlt(conectividad.getSistemaEnergia() != null && conectividad.getSistemaEnergia())
                    .sistemas(sistemas)
                    .build();
        }

        // ===== EQUIPAMIENTO =====
        // Mapa de nombres de equipamiento por ID (catálogo fijo del sistema)
        Map<Integer, String> equipamientoNombres = Map.ofEntries(
            Map.entry(1, "Computadora de escritorio"),
            Map.entry(2, "Computadora portátil (laptop)"),
            Map.entry(3, "Monitor"),
            Map.entry(4, "Cable HDMI"),
            Map.entry(5, "Cámara web HD 1080p"),
            Map.entry(6, "Micrófono"),
            Map.entry(7, "Parlantes/audífonos"),
            Map.entry(8, "Impresora"),
            Map.entry(9, "Escáner"),
            Map.entry(10, "Router/Switch de red"),
            Map.entry(11, "Pulsioxímetro digital"),
            Map.entry(12, "Dermatoscopio digital"),
            Map.entry(13, "Ecógrafo digital"),
            Map.entry(14, "Electrocardiógrafo digital"),
            Map.entry(15, "Equipo de gases arteriales digital"),
            Map.entry(16, "Estetoscopio digital"),
            Map.entry(17, "Fonendoscopio digital"),
            Map.entry(18, "Monitor de funciones vitales"),
            Map.entry(19, "Otoscopio digital"),
            Map.entry(20, "Oxímetro digital"),
            Map.entry(21, "Retinógrafo digital"),
            Map.entry(22, "Tensiómetro digital"),
            Map.entry(23, "Videocolposcopio"),
            Map.entry(24, "Estación móvil de telemedicina")
        );

        List<FormDiagEquipamiento> equiposList = equipamientoRepo.findByIdFormulario(idFormulario);
        List<FormDiagEstadisticasDTO.EquipamientoStats> equipamientoInfo = new ArrayList<>();
        List<FormDiagEstadisticasDTO.EquipamientoStats> equipamientoInformatico = new ArrayList<>();
        List<FormDiagEstadisticasDTO.EquipamientoStats> equipamientoBiomedico = new ArrayList<>();

        int equiposDisponibles = 0;
        for (FormDiagEquipamiento equipo : equiposList) {
            // Determinar tipo basado en idEquipamiento: 1-10 = INF, 11+ = BIO
            Integer idEq = equipo.getIdEquipamiento() != null ? equipo.getIdEquipamiento() : 0;
            String tipoEquipo = (idEq >= 1 && idEq <= 10) ? "INF" : "BIO";

            // Obtener nombre del equipamiento usando array inline
            String nombreEquipo;
            if (idEq == 1) nombreEquipo = "Computadora de escritorio";
            else if (idEq == 2) nombreEquipo = "Computadora portátil (laptop)";
            else if (idEq == 3) nombreEquipo = "Monitor";
            else if (idEq == 4) nombreEquipo = "Cable HDMI";
            else if (idEq == 5) nombreEquipo = "Cámara web HD 1080p";
            else if (idEq == 6) nombreEquipo = "Micrófono";
            else if (idEq == 7) nombreEquipo = "Parlantes/audífonos";
            else if (idEq == 8) nombreEquipo = "Impresora";
            else if (idEq == 9) nombreEquipo = "Escáner";
            else if (idEq == 10) nombreEquipo = "Router/Switch de red";
            else if (idEq == 11) nombreEquipo = "Pulsioxímetro digital";
            else if (idEq == 12) nombreEquipo = "Dermatoscopio digital";
            else if (idEq == 13) nombreEquipo = "Ecógrafo digital";
            else if (idEq == 14) nombreEquipo = "Electrocardiógrafo digital";
            else if (idEq == 15) nombreEquipo = "Equipo de gases arteriales digital";
            else if (idEq == 16) nombreEquipo = "Estetoscopio digital";
            else if (idEq == 17) nombreEquipo = "Fonendoscopio digital";
            else if (idEq == 18) nombreEquipo = "Monitor de funciones vitales";
            else if (idEq == 19) nombreEquipo = "Otoscopio digital";
            else if (idEq == 20) nombreEquipo = "Oxímetro digital";
            else if (idEq == 21) nombreEquipo = "Retinógrafo digital";
            else if (idEq == 22) nombreEquipo = "Tensiómetro digital";
            else if (idEq == 23) nombreEquipo = "Videocolposcopio";
            else if (idEq == 24) nombreEquipo = "Estación móvil de telemedicina";
            else nombreEquipo = "Equipo " + idEq;

            // Determinar estado: si está disponible entonces "Operativo", si no, "No disponible"
            String estado;
            if (equipo.getDisponible() != null && equipo.getDisponible()) {
                estado = "Operativo";
            } else {
                estado = "No disponible";
            }

            FormDiagEstadisticasDTO.EquipamientoStats stats = FormDiagEstadisticasDTO.EquipamientoStats.builder()
                    .id(equipo.getIdFormEquip())
                    .nombreEquipamiento(nombreEquipo)
                    .tipoEquipamiento(tipoEquipo)
                    .disponible(equipo.getDisponible() != null && equipo.getDisponible())
                    .cantidad(equipo.getCantidad() != null ? equipo.getCantidad() : 0)
                    .estado(estado)
                    .build();
            equipamientoInfo.add(stats);
            if (stats.getDisponible()) equiposDisponibles++;

            if ("INF".equalsIgnoreCase(tipoEquipo)) {
                equipamientoInformatico.add(stats);
            } else {
                equipamientoBiomedico.add(stats);
            }
        }

        FormDiagEstadisticasDTO.EquipamientoResumenStats equipamientoResumen = FormDiagEstadisticasDTO.EquipamientoResumenStats.builder()
                .totalEquipos(equiposList.size())
                .equiposDisponibles(equiposDisponibles)
                .equiposNoDisponibles(equiposList.size() - equiposDisponibles)
                .porcentajeDisponibilidad(equiposList.size() > 0 ? (equiposDisponibles * 100.0 / equiposList.size()) : 0)
                .build();

        // ===== SERVICIOS =====
        List<FormDiagServicio> serviciosList = servicioRepo.findByIdFormulario(idFormulario);
        List<FormDiagEstadisticasDTO.ServicioStats> servicios = new ArrayList<>();
        int serviciosDisponibles = 0;

        for (FormDiagServicio servicio : serviciosList) {
            // Mapear nombres de servicios por ID (catálogo de 12 servicios)
            Integer idServ = servicio.getIdServicio() != null ? servicio.getIdServicio() : 0;
            String nombreServicio;
            if (idServ == 1) nombreServicio = "Teleconsulta";
            else if (idServ == 2) nombreServicio = "Teleorientación";
            else if (idServ == 3) nombreServicio = "Telediagnóstico";
            else if (idServ == 4) nombreServicio = "Telemonitoreo";
            else if (idServ == 5) nombreServicio = "Telereceta";
            else if (idServ == 6) nombreServicio = "Telefarmacia";
            else if (idServ == 7) nombreServicio = "Teleradiología";
            else if (idServ == 8) nombreServicio = "Telepatología";
            else if (idServ == 9) nombreServicio = "Telecirugía";
            else if (idServ == 10) nombreServicio = "Teleinterconsulta";
            else if (idServ == 11) nombreServicio = "Teleasistencia";
            else if (idServ == 12) nombreServicio = "Teleformación";
            else nombreServicio = "Servicio " + idServ;

            FormDiagEstadisticasDTO.ServicioStats stats = FormDiagEstadisticasDTO.ServicioStats.builder()
                    .id(servicio.getIdFormServicio())
                    .nombreServicio(nombreServicio)
                    .disponible(servicio.getDisponible() != null && servicio.getDisponible())
                    .build();
            servicios.add(stats);
            if (stats.getDisponible()) serviciosDisponibles++;
        }

        FormDiagEstadisticasDTO.ServicioResumenStats servicioResumen = FormDiagEstadisticasDTO.ServicioResumenStats.builder()
                .totalServicios(serviciosList.size())
                .serviciosDisponibles(serviciosDisponibles)
                .serviciosNoDisponibles(serviciosList.size() - serviciosDisponibles)
                .porcentajeDisponibilidad(serviciosList.size() > 0 ? (serviciosDisponibles * 100.0 / serviciosList.size()) : 0)
                .build();

        // ===== NECESIDADES =====
        // NOTA: Usar datos del formulario original que ya están completos en formResponse
        List<FormDiagEstadisticasDTO.NecesidadStats> necesidades = new ArrayList<>();
        int necesidadesAlta = 0, necesidadesMedia = 0, necesidadesBaja = 0;
        int totalNecesidades = 0;

        // Obtener lista de necesidades del formulario original
        List<FormDiagNecesidad> necList = necesidadRepo.findByIdFormulario(idFormulario);
        totalNecesidades = necList.size();

        // Para esta versión, simplificamos y usamos el total
        // Las prioridades se calcularán correctamente en el Excel que usa mapToResponse
        FormDiagEstadisticasDTO.NecesidadResumenStats necesidadResumen = FormDiagEstadisticasDTO.NecesidadResumenStats.builder()
                .totalNecesidades(totalNecesidades)
                .necesidadesAlta(0)
                .necesidadesMedia(0)
                .necesidadesBaja(0)
                .build();

        // ===== RECURSOS HUMANOS =====
        FormDiagRecursosHumanos rrhh = recursosHumanosRepo.findByIdFormulario(idFormulario).orElse(null);
        FormDiagEstadisticasDTO.RecursosHumanosStats rrhhStats = null;

        if (rrhh != null) {
            int siCount = 0, noCount = 0;
            if (rrhh.getCoordDesignado() != null && rrhh.getCoordDesignado()) siCount++; else noCount++;
            if (rrhh.getCapacitacionTic() != null && rrhh.getCapacitacionTic()) siCount++; else noCount++;
            if (rrhh.getConoceNormativa() != null && rrhh.getConoceNormativa()) siCount++; else noCount++;

            preguntasSiTotal += siCount;
            preguntasNoTotal += noCount;
            totalPreguntasTotal += (siCount + noCount);

            rrhhStats = FormDiagEstadisticasDTO.RecursosHumanosStats.builder()
                    .totalPreguntas(siCount + noCount)
                    .respuestasSi(siCount)
                    .respuestasNo(noCount)
                    .porcentajeSi((siCount + noCount) > 0 ? (siCount * 100.0 / (siCount + noCount)) : 0)
                    .tieneCoordinador(rrhh.getCoordDesignado() != null && rrhh.getCoordDesignado())
                    .coordinadorNombre(rrhh.getCoordNombreCompleto())
                    .coordinadorCorreo(rrhh.getCoordCorreo())
                    .tieneCapacitacionTic(rrhh.getCapacitacionTic() != null && rrhh.getCapacitacionTic())
                    .conoceNormativa(rrhh.getConoceNormativa() != null && rrhh.getConoceNormativa())
                    .capacitacionesAnio(rrhh.getNumCapacitacionesUltimoAnio() != null ? rrhh.getNumCapacitacionesUltimoAnio() : 0)
                    .necesidadesCapacitacion(rrhh.getNecesidadesCapacitacionTexto())
                    .build();
        }

        // ===== CONSTRUCCIÓN DEL DTO =====
        double porcentajeSiGeneral = totalPreguntasTotal > 0 ? (preguntasSiTotal * 100.0 / totalPreguntasTotal) : 0;

        return FormDiagEstadisticasDTO.builder()
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
                .fechaEnvio(formulario.getFechaEnvio())
                .totalPreguntas(totalPreguntasTotal)
                .preguntasSi(preguntasSiTotal)
                .preguntasNo(preguntasNoTotal)
                .porcentajeSi(porcentajeSiGeneral)
                .infraFisica(infraFisStats)
                .infraTec(infraTecStats)
                .conectividad(conectividadStats)
                .equipamientoInformatico(equipamientoInformatico)
                .equipamientoBiomedico(equipamientoBiomedico)
                .equipamientoResumen(equipamientoResumen)
                .servicios(servicios)
                .servicioResumen(servicioResumen)
                .necesidades(necesidades)
                .necesidadResumen(necesidadResumen)
                .rrhh(rrhhStats)
                .build();
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

        // Guardar campos de suficiencia
        formulario.setNecInfraFisSuficiente(dto.getInfraFisicaSuficiente());
        formulario.setNecInfraFisObservaciones(dto.getInfraFisicaObservaciones());
        formulario.setNecInfraTecAdecuada(dto.getInfraTecAdecuada());
        formulario.setNecEquipInfoAdecuado(dto.getEquipInfoAdecuado());
        formulario.setNecEquipBioAdecuado(dto.getEquipBioAdecuado());

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
                formulario.getObservacionesGenerales() != null ||
                formulario.getNecInfraFisSuficiente() != null ||
                formulario.getNecInfraTecAdecuada() != null ||
                formulario.getNecEquipInfoAdecuado() != null ||
                formulario.getNecEquipBioAdecuado() != null;

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
                // Campos de suficiencia
                .infraFisicaSuficiente(formulario.getNecInfraFisSuficiente())
                .infraFisicaObservaciones(formulario.getNecInfraFisObservaciones())
                .infraTecAdecuada(formulario.getNecInfraTecAdecuada())
                .equipInfoAdecuado(formulario.getNecEquipInfoAdecuado())
                .equipBioAdecuado(formulario.getNecEquipBioAdecuado())
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

    /**
     * Obtener nombre del equipamiento por ID del catálogo
     */
    private String obtenerNombreEquipamiento(Integer idEq) {
        if (idEq == null || idEq <= 0) return "Equipo Desconocido";

        String[] nombres = {
            "", // índice 0 no usado
            "Computadora de escritorio",                    // 1
            "Computadora portátil (laptop)",                // 2
            "Monitor",                                       // 3
            "Cable HDMI",                                    // 4
            "Cámara web HD 1080p",                          // 5
            "Micrófono",                                     // 6
            "Parlantes/audífonos",                          // 7
            "Impresora",                                     // 8
            "Escáner",                                       // 9
            "Router/Switch de red",                         // 10
            "Pulsioxímetro digital",                        // 11
            "Dermatoscopio digital",                        // 12
            "Ecógrafo digital",                             // 13
            "Electrocardiógrafo digital",                   // 14
            "Equipo de gases arteriales digital",           // 15
            "Estetoscopio digital",                         // 16
            "Fonendoscopio digital",                        // 17
            "Monitor de funciones vitales",                 // 18
            "Otoscopio digital",                            // 19
            "Oxímetro digital",                             // 20
            "Retinógrafo digital",                          // 21
            "Tensiómetro digital",                          // 22
            "Videocolposcopio",                             // 23
            "Estación móvil de telemedicina"                // 24
        };

        if (idEq > 0 && idEq < nombres.length) {
            return nombres[idEq];
        }
        return "Equipo " + idEq;
    }
}

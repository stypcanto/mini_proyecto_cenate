package com.styp.cenate.service.teleconsultorio;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.styp.cenate.dto.teleconsultorio.TeleconsultorioConfigDTO;
import com.styp.cenate.dto.teleconsultorio.TeleconsultorioConfigDTO.TurnoConfigDTO;
import com.styp.cenate.model.SolicitudTurnoIpress;
import com.styp.cenate.model.teleconsultorio.SolicitudTurnoIpressTeleconsultorioDia;
import com.styp.cenate.model.teleconsultorio.SolicitudTurnoIpressTeleconsultorioTurno;
import com.styp.cenate.model.teleconsultorio.SolicitudTurnoIpressTeleconsultorioTurnoHora;
import com.styp.cenate.repository.SolicitudTurnoIpressRepository;
import com.styp.cenate.repository.teleconsultorio.SolicitudTurnoIpressTeleconsultorioDiaRepository;
import com.styp.cenate.repository.teleconsultorio.SolicitudTurnoIpressTeleconsultorioTurnoHoraRepository;
import com.styp.cenate.repository.teleconsultorio.SolicitudTurnoIpressTeleconsultorioTurnoRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Implementación del servicio de teleconsultorio
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class TeleconsultorioServiceImpl implements ITeleconsultorioService {

    // Formatter que maneja horas con 1 o 2 dígitos (8:00 o 08:00)
    private static final DateTimeFormatter HOUR_FORMATTER = DateTimeFormatter.ofPattern("[H:mm][HH:mm]");

    private final SolicitudTurnoIpressRepository solicitudRepository;
    private final SolicitudTurnoIpressTeleconsultorioDiaRepository diaRepository;
    private final SolicitudTurnoIpressTeleconsultorioTurnoRepository turnoRepository;
    private final SolicitudTurnoIpressTeleconsultorioTurnoHoraRepository horaRepository;

    @Override
    @Transactional(readOnly = true)
    public Optional<TeleconsultorioConfigDTO> obtenerConfiguracion(Long idSolicitud) {
        log.info("Obteniendo configuración de teleconsultorio para solicitud {}", idSolicitud);

        // Verificar que la solicitud existe
        Optional<SolicitudTurnoIpress> solicitudOpt = solicitudRepository.findById(idSolicitud);
        if (solicitudOpt.isEmpty()) {
            log.warn("Solicitud {} no encontrada", idSolicitud);
            return Optional.empty();
        }

        // Obtener días configurados
        List<SolicitudTurnoIpressTeleconsultorioDia> dias = diaRepository.findBySolicitudIdAndActivoTrue(idSolicitud);
        if (dias.isEmpty()) {
            log.info("No hay configuración de días para solicitud {}", idSolicitud);
            return Optional.empty();
        }

        // Obtener turnos configurados
        List<SolicitudTurnoIpressTeleconsultorioTurno> turnos = turnoRepository.findBySolicitudIdWithHoras(idSolicitud);
        log.info("Turnos encontrados para solicitud {}: {}", idSolicitud, turnos.size());
        
        for (SolicitudTurnoIpressTeleconsultorioTurno t : turnos) {
            log.info("  - Turno ID={}, tipo={}, horas={}", 
                t.getIdTurno(), t.getTurno(), 
                t.getHoras() != null ? t.getHoras().size() : 0);
        }

        // Construir el DTO
        TeleconsultorioConfigDTO config = TeleconsultorioConfigDTO.builder()
                .idSolicitud(idSolicitud)
                .dias(dias.stream().map(SolicitudTurnoIpressTeleconsultorioDia::getDiaSemanaString).collect(Collectors.toList()))
                .tipo(determinarTipoDias(dias))
                .build();

        // Procesar turnos
        for (SolicitudTurnoIpressTeleconsultorioTurno turno : turnos) {
            log.info("Procesando turno {}: {} horas cargadas", turno.getTurno(), 
                turno.getHoras() != null ? turno.getHoras().size() : 0);
            
            TurnoConfigDTO turnoDTO = TurnoConfigDTO.builder()
                    .tipo(turno.getTurno())
                    .activo(turno.getActivo())
                    .observaciones(turno.getObservaciones())
                    .horas(turno.getHoras().stream()
                            .filter(h -> h.getActivo())
                            .map(h -> h.getHora().toString())
                            .collect(Collectors.toList()))
                    .build();
            
            turnoDTO.setCantidad(turnoDTO.getHoras().size());
            log.info("  -> TurnoDTO creado con {} horas: {}", turnoDTO.getHoras().size(), turnoDTO.getHoras());

            if ("MANANA".equals(turno.getTurno())) {
                config.setHorariosManana(turnoDTO);
            } else if ("TARDE".equals(turno.getTurno())) {
                config.setHorariosTarde(turnoDTO);
            }
        }

        config.calcularTotalHoras();

        log.info("Configuración obtenida para solicitud {}: {} días, {} horas total", 
                idSolicitud, config.getDias().size(), config.getTotalHoras());

        return Optional.of(config);
    }

    @Override
    public TeleconsultorioConfigDTO guardarConfiguracion(TeleconsultorioConfigDTO config) {
        log.info("Guardando configuración de teleconsultorio para solicitud {}", config.getIdSolicitud());

        // Validar configuración
        if (!validarConfiguracion(config)) {
            throw new IllegalArgumentException("Configuración de teleconsultorio inválida");
        }

        // Verificar que la solicitud existe
        SolicitudTurnoIpress solicitud = solicitudRepository.findById(config.getIdSolicitud())
                .orElseThrow(() -> new IllegalArgumentException("Solicitud no encontrada: " + config.getIdSolicitud()));

        // Limpiar configuración anterior
        eliminarConfiguracionInterna(config.getIdSolicitud());

        // Guardar días
        guardarDias(solicitud, config.getDias());

        // Guardar turnos y horas
        if (config.isMananaActiva()) {
            guardarTurno(solicitud, "MANANA", config.getHorariosManana());
        }

        if (config.isTardeActiva()) {
            guardarTurno(solicitud, "TARDE", config.getHorariosTarde());
        }

        log.info("Configuración guardada exitosamente para solicitud {}", config.getIdSolicitud());

        return config;
    }

    @Override
    public void eliminarConfiguracion(Long idSolicitud) {
        log.info("Eliminando configuración de teleconsultorio para solicitud {}", idSolicitud);
        eliminarConfiguracionInterna(idSolicitud);
        log.info("Configuración eliminada para solicitud {}", idSolicitud);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existeConfiguracion(Long idSolicitud) {
        return diaRepository.countBySolicitudIdAndActivoTrue(idSolicitud) > 0;
    }

    @Override
    @Transactional(readOnly = true)
    public Integer obtenerTotalHoras(Long idSolicitud) {
        Long totalHoras = horaRepository.countBySolicitudIdAndActivoTrue(idSolicitud);
        return totalHoras != null ? totalHoras.intValue() : 0;
    }

    @Override
    public boolean validarConfiguracion(TeleconsultorioConfigDTO config) {
        if (config == null) {
            log.warn("Configuración es null");
            return false;
        }

        if (config.getIdSolicitud() == null) {
            log.warn("ID de solicitud es null");
            return false;
        }

        if (config.getDias() == null || config.getDias().isEmpty()) {
            log.warn("No se han seleccionado días");
            return false;
        }

        if (!config.isMananaActiva() && !config.isTardeActiva()) {
            log.warn("No se han configurado horarios de mañana ni tarde");
            return false;
        }

        return true;
    }

    // ==========================================================
    // Métodos privados
    // ==========================================================

    private void eliminarConfiguracionInterna(Long idSolicitud) {
        log.info("Eliminando configuración anterior para solicitud {}", idSolicitud);
        
        horaRepository.deleteBySolicitudId(idSolicitud);
        log.info("Eliminadas horas anteriores");
        
        turnoRepository.deleteBySolicitudId(idSolicitud);
        log.info("Eliminados turnos anteriores");
        
        diaRepository.deleteBySolicitudId(idSolicitud);
        log.info("Eliminados días anteriores");
        
        log.info("Configuración anterior eliminada completamente para solicitud {}", idSolicitud);
    }

    private void guardarDias(SolicitudTurnoIpress solicitud, List<String> diasStr) {
        List<SolicitudTurnoIpressTeleconsultorioDia> dias = new ArrayList<>();
        
        for (String diaStr : diasStr) {
            SolicitudTurnoIpressTeleconsultorioDia dia = SolicitudTurnoIpressTeleconsultorioDia.builder()
                    .solicitud(solicitud)
                    .diaSemana(SolicitudTurnoIpressTeleconsultorioDia.stringToDiaSemana(diaStr))
                    .activo(true)
                    .build();
            dias.add(dia);
        }
        
        diaRepository.saveAll(dias);
        log.info("Guardados {} días para solicitud {}", dias.size(), solicitud.getIdSolicitud());
    }

    private void guardarTurno(SolicitudTurnoIpress solicitud, String tipoTurno, TurnoConfigDTO turnoConfig) {
        if (turnoConfig == null || !turnoConfig.getActivo() || 
            turnoConfig.getHoras() == null || turnoConfig.getHoras().isEmpty()) {
            return;
        }

        // Crear turno
        SolicitudTurnoIpressTeleconsultorioTurno turno = SolicitudTurnoIpressTeleconsultorioTurno.builder()
                .solicitud(solicitud)
                .turno(tipoTurno)
                .activo(true)
                .observaciones(turnoConfig.getObservaciones())
                .build();

        turno = turnoRepository.save(turno);

        // Crear horas (eliminando duplicados usando LocalTime como clave)
        List<SolicitudTurnoIpressTeleconsultorioTurnoHora> horas = new ArrayList<>();
        Set<LocalTime> horasUnicas = new LinkedHashSet<>();
        
        // Parsear todas las horas y usar Set<LocalTime> para eliminar duplicados
        // Esto maneja "9:00" y "09:00" como la misma hora
        for (String horaStr : turnoConfig.getHoras()) {
            LocalTime hora = LocalTime.parse(horaStr, HOUR_FORMATTER);
            horasUnicas.add(hora);
        }
        
        log.info("Creando {} horas únicas para turno {} (original: {})", 
                horasUnicas.size(), tipoTurno, turnoConfig.getHoras().size());
        
        for (LocalTime hora : horasUnicas) {
            SolicitudTurnoIpressTeleconsultorioTurnoHora horaEntity = 
                    SolicitudTurnoIpressTeleconsultorioTurnoHora.builder()
                    .turno(turno)
                    .hora(hora)
                    .activo(true)
                    .build();
            horas.add(horaEntity);
        }

        horaRepository.saveAll(horas);
        log.info("Guardado turno {} con {} horas para solicitud {}", 
                tipoTurno, horas.size(), solicitud.getIdSolicitud());
    }

    private String determinarTipoDias(List<SolicitudTurnoIpressTeleconsultorioDia> dias) {
        List<String> diasStr = dias.stream()
                .map(SolicitudTurnoIpressTeleconsultorioDia::getDiaSemanaString)
                .collect(Collectors.toList());

        boolean tieneFinesSemana = diasStr.contains("SAB") || diasStr.contains("DOM");
        return tieneFinesSemana ? "todos" : "laborables";
    }
}
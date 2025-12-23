package com.styp.cenate.service.mbac.impl;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.styp.cenate.dto.mbac.AuditoriaModularResponseDTO;
import com.styp.cenate.model.view.AuditoriaModularView;
import com.styp.cenate.repository.mbac.AuditoriaModularViewRepository;
import com.styp.cenate.service.mbac.AuditoriaService;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
@Data
public class AuditoriaServiceImpl implements AuditoriaService {

    private final AuditoriaModularViewRepository auditoriaRepository;

    @Override
    public Page<AuditoriaModularResponseDTO> obtenerAuditoriaModular(Pageable pageable) {
        log.info("Obteniendo auditoría modular - Página: {}, Tamaño: {}", pageable.getPageNumber(), pageable.getPageSize());
        Page<AuditoriaModularView> auditoria = auditoriaRepository.findAllOrderByFechaHoraDesc(pageable);
        return auditoria.map(this::mapToAuditoriaResponseDTO);
    }

    @Override
    public Page<AuditoriaModularResponseDTO> obtenerAuditoriaPorUsuario(Long userId, Pageable pageable) {
        log.info("Obteniendo auditoría del usuario con ID: {}", userId);
        Page<AuditoriaModularView> auditoria = auditoriaRepository.findByUserId(userId, pageable);
        return auditoria.map(this::mapToAuditoriaResponseDTO);
    }

    @Override
    public Page<AuditoriaModularResponseDTO> obtenerAuditoriaPorUsername(String username, Pageable pageable) {
        log.info("Obteniendo auditoría del usuario: {}", username);
        Page<AuditoriaModularView> auditoria = auditoriaRepository.findByUsername(username, pageable);
        return auditoria.map(this::mapToAuditoriaResponseDTO);
    }

    @Override
    public Page<AuditoriaModularResponseDTO> obtenerAuditoriaPorModulo(String modulo, Pageable pageable) {
        log.info("Obteniendo auditoría del módulo: {}", modulo);
        Page<AuditoriaModularView> auditoria = auditoriaRepository.findByModulo(modulo, pageable);
        return auditoria.map(this::mapToAuditoriaResponseDTO);
    }

    @Override
    public Page<AuditoriaModularResponseDTO> obtenerAuditoriaPorAccion(String accion, Pageable pageable) {
        log.info("Obteniendo auditoría por acción: {}", accion);
        Page<AuditoriaModularView> auditoria = auditoriaRepository.findByAccion(accion, pageable);
        return auditoria.map(this::mapToAuditoriaResponseDTO);
    }

    @Override
    public Page<AuditoriaModularResponseDTO> obtenerAuditoriaPorRangoFechas(LocalDateTime fechaInicio, LocalDateTime fechaFin, Pageable pageable) {
        log.info("Obteniendo auditoría entre {} y {}", fechaInicio, fechaFin);
        Page<AuditoriaModularView> auditoria = auditoriaRepository.findByFechaHoraBetween(fechaInicio, fechaFin, pageable);
        return auditoria.map(this::mapToAuditoriaResponseDTO);
    }

    @Override
    public Page<AuditoriaModularResponseDTO> obtenerAuditoriaPorUsuarioYFechas(Long userId, LocalDateTime fechaInicio, LocalDateTime fechaFin, Pageable pageable) {
        log.info("Obteniendo auditoría del usuario {} entre {} y {}", userId, fechaInicio, fechaFin);
        Page<AuditoriaModularView> auditoria = auditoriaRepository.findByUserIdAndFechaHoraBetween(userId, fechaInicio, fechaFin, pageable);
        return auditoria.map(this::mapToAuditoriaResponseDTO);
    }

    @Override
    public Page<AuditoriaModularResponseDTO> obtenerAuditoriaPorModuloYAccion(String modulo, String accion, Pageable pageable) {
        log.info("Obteniendo auditoría del módulo {} con acción {}", modulo, accion);
        Page<AuditoriaModularView> auditoria = auditoriaRepository.findByModuloAndAccion(modulo, accion, pageable);
        return auditoria.map(this::mapToAuditoriaResponseDTO);
    }

    @Override
    public Map<String, Long> obtenerResumenPorTipoEvento() {
        log.info("Obteniendo resumen de auditoría por tipo de evento");
        List<Object[]> resultados = auditoriaRepository.countByTipoEvento();
        Map<String, Long> resumen = new HashMap<>();
        for (Object[] resultado : resultados) {
            String tipoEvento = (String) resultado[0];
            Long count = ((Number) resultado[1]).longValue();
            resumen.put(tipoEvento, count);
        }
        return resumen;
    }

    @Override
    public List<AuditoriaModularResponseDTO> obtenerUltimosEventos(int limit) {
        log.info("Obteniendo los últimos {} eventos de auditoría", limit);
        List<AuditoriaModularView> eventos = auditoriaRepository.findTopNOrderByFechaHoraDesc(limit);
        return eventos.stream().map(this::mapToAuditoriaResponseDTO).collect(Collectors.toList());
    }

    @Override
    public Page<AuditoriaModularResponseDTO> buscarEnDetalle(String searchText, Pageable pageable) {
        log.info("Buscando en auditoría: {}", searchText);
        Page<AuditoriaModularView> auditoria = auditoriaRepository.searchByDetalle(searchText, pageable);
        return auditoria.map(this::mapToAuditoriaResponseDTO);
    }

    private AuditoriaModularResponseDTO mapToAuditoriaResponseDTO(AuditoriaModularView view) {
        // Priorizar usuarioSesion (el que hizo la acción), si no existe usar username, si no "SYSTEM"
        String usuario = view.getUsuarioSesion();
        if (usuario == null || usuario.isBlank()) {
            usuario = view.getUsername();
        }
        if (usuario == null || usuario.isBlank()) {
            usuario = "SYSTEM";
        }

        return AuditoriaModularResponseDTO.builder()
                .id(view.getId())
                .fechaHora(view.getFechaHora())
                .fechaFormateada(view.getFechaFormateada())
                .usuario(usuario)
                .dni(view.getDni())
                .nombreCompleto(view.getNombreCompleto())
                .roles(view.getRoles())
                .modulo(view.getModulo())
                .accion(view.getAccion())
                .tipoEvento(view.getTipoEvento())
                .estado(view.getEstado())
                .detalle(view.getDetalle())
                .ip(view.getIp())
                .dispositivo(view.getDispositivo())
                .build();
    }
}
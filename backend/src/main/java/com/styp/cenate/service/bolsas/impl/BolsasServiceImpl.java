package com.styp.cenate.service.bolsas.impl;

import com.styp.cenate.dto.bolsas.BolsaDTO;
import com.styp.cenate.dto.bolsas.BolsaRequestDTO;
import com.styp.cenate.mapper.BolsaMapper;
import com.styp.cenate.model.DimBolsa;
import com.styp.cenate.repository.BolsaRepository;
import com.styp.cenate.repository.SolicitudBolsaRepository;
import com.styp.cenate.repository.HistorialImportacionBolsaRepository;
import com.styp.cenate.service.bolsas.BolsasService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * 📊 Servicio de Bolsas - Implementación
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class BolsasServiceImpl implements BolsasService {

    private final BolsaRepository bolsaRepository;
    private final SolicitudBolsaRepository solicitudBolsaRepository;
    private final HistorialImportacionBolsaRepository historialImportacionBolsaRepository;

    // ========================================================================
    // 🔍 CONSULTAS
    // ========================================================================

    @Override
    public List<BolsaDTO> obtenerTodasLasBolsas() {
        log.info("📊 Obteniendo todas las bolsas activas");
        return BolsaMapper.toDtoList(
                bolsaRepository.findByEstadoAndActivo("ACTIVA", true)
        );
    }

    @Override
    public BolsaDTO obtenerBolsaPorId(Long idBolsa) {
        log.info("🔍 Obteniendo bolsa ID: {}", idBolsa);
        DimBolsa bolsa = bolsaRepository.findById(idBolsa)
                .orElseThrow(() -> new RuntimeException("Bolsa no encontrada con ID: " + idBolsa));
        return BolsaMapper.toDto(bolsa);
    }

    @Override
    public List<BolsaDTO> obtenerBolsasPorEspecialidad(Long especialidadId) {
        log.info("🏥 Obteniendo bolsas por especialidad: {}", especialidadId);
        return BolsaMapper.toDtoList(
                bolsaRepository.findByEspecialidadIdAndActivo(especialidadId, true)
        );
    }

    @Override
    public List<BolsaDTO> obtenerBolsasPorResponsable(Long responsableId) {
        log.info("👤 Obteniendo bolsas por responsable: {}", responsableId);
        return BolsaMapper.toDtoList(
                bolsaRepository.findByResponsableIdAndActivo(responsableId, true)
        );
    }

    @Override
    public Page<BolsaDTO> buscarBolsas(String nombre, String estado, Pageable pageable) {
        log.info("🔎 Buscando bolsas: nombre={}, estado={}", nombre, estado);
        return bolsaRepository.buscarBolsas(nombre, estado, true, pageable)
                .map(BolsaMapper::toDto);
    }

    @Override
    public BolsasEstadisticasDTO obtenerEstadisticas() {
        log.info("📊 Calculando estadísticas de bolsas");

        long totalBolsas = bolsaRepository.countByActivo(true);
        long bolsasActivas = bolsaRepository.countByEstadoAndActivo("ACTIVA", true);
        long bolsasInactivas = bolsaRepository.countByEstadoAndActivo("INACTIVA", true);

        List<DimBolsa> todasBolsas = bolsaRepository.findByActivoOrderByFechaCreacionDesc(true);
        long totalPacientes = todasBolsas.stream().mapToLong(DimBolsa::getTotalPacientes).sum();
        long pacientesAsignados = todasBolsas.stream().mapToLong(DimBolsa::getPacientesAsignados).sum();

        double porcentajePromedio = totalPacientes > 0
                ? (double) pacientesAsignados / totalPacientes * 100
                : 0.0;

        long totalSolicitudes = solicitudBolsaRepository.countByActivo(true);
        long solicitudesPendientes = solicitudBolsaRepository.countByEstadoAndActivo("PENDIENTE", true);

        return new BolsasEstadisticasDTO(
                totalBolsas,
                bolsasActivas,
                bolsasInactivas,
                totalPacientes,
                pacientesAsignados,
                porcentajePromedio,
                totalSolicitudes,
                solicitudesPendientes
        );
    }

    // ========================================================================
    // ✏️ CREACIÓN Y ACTUALIZACIÓN
    // ========================================================================

    @Override
    @Transactional
    public BolsaDTO crearBolsa(BolsaRequestDTO request) {
        log.info("✏️ Creando nueva bolsa: {}", request.getNombreBolsa());

        // Verificar si ya existe una bolsa con el mismo nombre
        if (bolsaRepository.findByNombreBolsaIgnoreCase(request.getNombreBolsa()).isPresent()) {
            throw new RuntimeException("Ya existe una bolsa con el nombre: " + request.getNombreBolsa());
        }

        DimBolsa bolsa = BolsaMapper.toEntity(request);
        DimBolsa bolsaGuardada = bolsaRepository.save(bolsa);
        return BolsaMapper.toDto(bolsaGuardada);
    }

    @Override
    @Transactional
    public BolsaDTO actualizarBolsa(Long idBolsa, BolsaRequestDTO request) {
        log.info("✏️ Actualizando bolsa ID: {}", idBolsa);

        DimBolsa bolsa = bolsaRepository.findById(idBolsa)
                .orElseThrow(() -> new RuntimeException("Bolsa no encontrada con ID: " + idBolsa));

        BolsaMapper.updateEntity(bolsa, request);
        DimBolsa bolsaActualizada = bolsaRepository.save(bolsa);
        return BolsaMapper.toDto(bolsaActualizada);
    }

    @Override
    @Transactional
    public BolsaDTO cambiarEstadoBolsa(Long idBolsa, String nuevoEstado) {
        log.info("🔄 Cambiando estado de bolsa ID: {} a {}", idBolsa, nuevoEstado);

        DimBolsa bolsa = bolsaRepository.findById(idBolsa)
                .orElseThrow(() -> new RuntimeException("Bolsa no encontrada con ID: " + idBolsa));

        if (!nuevoEstado.matches("ACTIVA|INACTIVA|CERRADA")) {
            throw new RuntimeException("Estado inválido: " + nuevoEstado);
        }

        bolsa.setEstado(nuevoEstado);
        DimBolsa bolsaActualizada = bolsaRepository.save(bolsa);
        return BolsaMapper.toDto(bolsaActualizada);
    }

    // ========================================================================
    // 🗑️ ELIMINACIÓN
    // ========================================================================

    @Override
    @Transactional
    public void eliminarBolsa(Long idBolsa) {
        log.warn("🗑️ Eliminando bolsa ID: {}", idBolsa);

        DimBolsa bolsa = bolsaRepository.findById(idBolsa)
                .orElseThrow(() -> new RuntimeException("Bolsa no encontrada con ID: " + idBolsa));

        bolsa.setActivo(false);
        bolsaRepository.save(bolsa);
    }

    // ========================================================================
    // 📊 PACIENTES EN BOLSA
    // ========================================================================

    @Override
    @Transactional
    public BolsaDTO agregarPacientesBolsa(Long idBolsa, List<Long> pacienteIds) {
        log.info("➕ Agregando {} pacientes a bolsa ID: {}", pacienteIds.size(), idBolsa);

        DimBolsa bolsa = bolsaRepository.findById(idBolsa)
                .orElseThrow(() -> new RuntimeException("Bolsa no encontrada con ID: " + idBolsa));

        int nuevoTotal = bolsa.getTotalPacientes() + pacienteIds.size();
        bolsa.setTotalPacientes(nuevoTotal);
        DimBolsa bolsaActualizada = bolsaRepository.save(bolsa);
        return BolsaMapper.toDto(bolsaActualizada);
    }

    @Override
    @Transactional
    public BolsaDTO asignarPacientesBolsa(Long idBolsa, List<Long> pacienteIds) {
        log.info("✅ Asignando {} pacientes en bolsa ID: {}", pacienteIds.size(), idBolsa);

        DimBolsa bolsa = bolsaRepository.findById(idBolsa)
                .orElseThrow(() -> new RuntimeException("Bolsa no encontrada con ID: " + idBolsa));

        int nuevosAsignados = Math.min(
                bolsa.getPacientesAsignados() + pacienteIds.size(),
                bolsa.getTotalPacientes()
        );
        bolsa.setPacientesAsignados(nuevosAsignados);
        DimBolsa bolsaActualizada = bolsaRepository.save(bolsa);
        return BolsaMapper.toDto(bolsaActualizada);
    }

    @Override
    public Double obtenerPorcentajeAsignacion(Long idBolsa) {
        DimBolsa bolsa = bolsaRepository.findById(idBolsa)
                .orElseThrow(() -> new RuntimeException("Bolsa no encontrada con ID: " + idBolsa));
        return bolsa.getPorcentajeAsignacion();
    }

    // ========================================================================
    // 📥 IMPORTACIÓN DESDE EXCEL
    // ========================================================================

    @Override
    @Transactional
    public ImportacionResultadoDTO importarDesdeExcel(MultipartFile archivo, Long usuarioId, String usuarioNombre) {
        log.info("📥 Importando bolsas desde Excel: {}", archivo.getOriginalFilename());

        // TODO: Implementar lógica de importación desde Excel
        // Por ahora retornamos un DTO vacío para que compile

        return new ImportacionResultadoDTO(
                null,
                0,
                0,
                0,
                "PENDIENTE",
                "Importación no implementada aún"
        );
    }

    @Override
    public List<ImportacionHistorialDTO> obtenerHistorialImportaciones() {
        log.info("📋 Obteniendo historial de importaciones");

        return historialImportacionBolsaRepository
                .findByActivoOrderByFechaImportacionDesc(true)
                .stream()
                .map(h -> new ImportacionHistorialDTO(
                        h.getIdImportacion(),
                        h.getNombreArchivo(),
                        h.getTotalRegistros(),
                        h.getRegistrosExitosos(),
                        h.getRegistrosFallidos(),
                        h.getEstadoImportacion(),
                        h.getUsuarioNombre(),
                        h.getFechaImportacion()
                ))
                .toList();
    }

    @Override
    public ImportacionHistorialDTO obtenerDetallesImportacion(Long idImportacion) {
        log.info("🔍 Consultando detalles de importación: {}", idImportacion);

        var historial = historialImportacionBolsaRepository.findById(idImportacion)
                .orElseThrow(() -> new RuntimeException("Importación no encontrada"));

        return new ImportacionHistorialDTO(
                historial.getIdImportacion(),
                historial.getNombreArchivo(),
                historial.getTotalRegistros(),
                historial.getRegistrosExitosos(),
                historial.getRegistrosFallidos(),
                historial.getEstadoImportacion(),
                historial.getUsuarioNombre(),
                historial.getFechaImportacion()
        );
    }
}

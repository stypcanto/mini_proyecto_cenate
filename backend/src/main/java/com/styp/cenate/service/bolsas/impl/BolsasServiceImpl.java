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

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import com.styp.cenate.model.SolicitudBolsa;
import com.styp.cenate.model.HistorialImportacionBolsa;

import java.util.List;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.HashSet;
import java.util.Set;
import java.util.HashMap;
import java.util.Map;

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
        log.info("📥 Importando solicitudes desde Excel: {}", archivo.getOriginalFilename());

        int totalRegistros = 0;
        int registrosExitosos = 0;
        int registrosFallidos = 0;
        Set<String> dnisProcesados = new HashSet<>();
        Map<String, Long> bolsaCache = new HashMap<>();

        try (InputStream inputStream = archivo.getInputStream();
             Workbook workbook = new XSSFWorkbook(inputStream)) {

            Sheet sheet = workbook.getSheetAt(0);

            // Obtener bolsa por defecto (primera bolsa activa)
            List<DimBolsa> bolsasActivas = bolsaRepository.findByEstadoAndActivo("ACTIVA", true);
            if (bolsasActivas.isEmpty()) {
                throw new RuntimeException("No hay bolsas activas para importar solicitudes");
            }
            DimBolsa bolsaDefecto = bolsasActivas.get(0);

            // Procesar filas (saltar encabezado)
            for (int rowIndex = 1; rowIndex <= sheet.getLastRowNum(); rowIndex++) {
                try {
                    Row row = sheet.getRow(rowIndex);
                    if (row == null) continue;

                    // Mapeo de columnas del Excel
                    String dni = getCellStringValue(row, 6); // DOC_PACIENTE (columna G)
                    String nombrePaciente = getCellStringValue(row, 7); // PACIENTE (columna H)
                    String telefonoMovil = getCellStringValue(row, 4); // TEL_MOVIL (columna E)
                    String especialidad = getCellStringValue(row, 13); // ESPECIALIDAD (columna N)

                    // Validar datos mínimos
                    if (dni == null || dni.trim().isEmpty() || nombrePaciente == null || nombrePaciente.trim().isEmpty()) {
                        registrosFallidos++;
                        continue;
                    }

                    // Evitar duplicados dentro del mismo archivo
                    if (dnisProcesados.contains(dni)) {
                        log.warn("⚠️ DNI duplicado en importación: {}", dni);
                        registrosFallidos++;
                        continue;
                    }

                    dnisProcesados.add(dni);
                    totalRegistros++;

                    // Generar número de solicitud único
                    String numeroSolicitud = String.format("IMP-%d-%s-%d",
                        System.currentTimeMillis(),
                        dni,
                        rowIndex);

                    // Crear solicitud
                    // Para aseguradoId: usar el DNI como ID temporal (será resuelto manualmente después)
                    Long aseguradoId = null;
                    try {
                        aseguradoId = Long.parseLong(dni);
                    } catch (NumberFormatException e) {
                        aseguradoId = 0L; // Valor por defecto si DNI no es numérico
                    }

                    SolicitudBolsa solicitud = SolicitudBolsa.builder()
                            .numeroSolicitud(numeroSolicitud)
                            .aseguradoId(aseguradoId)
                            .pacienteNombre(nombrePaciente.trim())
                            .pacienteDni(dni)
                            .pacienteTelefono(telefonoMovil != null ? telefonoMovil.trim() : null)
                            .especialidad(especialidad != null ? especialidad.trim() : "No especificada")
                            .estado("PENDIENTE")
                            .bolsa(bolsaDefecto)
                            .estadoGestionCitasId(null) // No citado aún
                            .fechaSolicitud(OffsetDateTime.now())
                            .activo(true)
                            .build();

                    solicitudBolsaRepository.save(solicitud);
                    registrosExitosos++;

                } catch (Exception e) {
                    log.error("❌ Error procesando fila {}: {}", rowIndex, e.getMessage());
                    registrosFallidos++;
                }
            }

            // Registrar historial de importación
            HistorialImportacionBolsa historial = HistorialImportacionBolsa.builder()
                    .nombreArchivo(archivo.getOriginalFilename())
                    .totalRegistros(totalRegistros)
                    .registrosExitosos(registrosExitosos)
                    .registrosFallidos(registrosFallidos)
                    .estadoImportacion("COMPLETADA")
                    .usuarioNombre(usuarioNombre)
                    .fechaImportacion(OffsetDateTime.now())
                    .activo(true)
                    .build();

            HistorialImportacionBolsa historialGuardado = historialImportacionBolsaRepository.save(historial);

            log.info("✅ Importación completada: {} exitosos, {} fallidos de {} registros",
                registrosExitosos, registrosFallidos, totalRegistros);

            return new ImportacionResultadoDTO(
                    historialGuardado.getIdImportacion(),
                    totalRegistros,
                    registrosExitosos,
                    registrosFallidos,
                    "COMPLETADA",
                    String.format("Importados %d solicitudes de %d registros", registrosExitosos, totalRegistros)
            );

        } catch (Exception e) {
            log.error("❌ Error importando archivo Excel: {}", e.getMessage(), e);

            // Registrar importación fallida
            try {
                HistorialImportacionBolsa historialFallo = HistorialImportacionBolsa.builder()
                        .nombreArchivo(archivo.getOriginalFilename())
                        .totalRegistros(totalRegistros)
                        .registrosExitosos(registrosExitosos)
                        .registrosFallidos(registrosFallidos)
                        .estadoImportacion("ERROR")
                        .usuarioNombre(usuarioNombre)
                        .fechaImportacion(OffsetDateTime.now())
                        .activo(true)
                        .build();
                historialImportacionBolsaRepository.save(historialFallo);
            } catch (Exception historialError) {
                log.error("❌ Error registrando importación fallida: {}", historialError.getMessage());
            }

            throw new RuntimeException("Error al importar archivo: " + e.getMessage(), e);
        }
    }

    /**
     * Helper para obtener valor de celda como String
     */
    private String getCellStringValue(Row row, int columnIndex) {
        Cell cell = row.getCell(columnIndex);
        if (cell == null) return null;

        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue();
            case NUMERIC -> {
                if (DateUtil.isCellDateFormatted(cell)) {
                    yield cell.getLocalDateTimeCellValue().toString();
                } else {
                    yield String.valueOf((long) cell.getNumericCellValue());
                }
            }
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            default -> null;
        };
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

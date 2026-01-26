package com.styp.cenate.service.bolsas.impl;

import com.styp.cenate.dto.bolsas.BolsaDTO;
import com.styp.cenate.dto.bolsas.BolsaRequestDTO;
import com.styp.cenate.mapper.BolsaMapper;
import com.styp.cenate.model.DimBolsa;
import com.styp.cenate.repository.BolsaRepository;
//import com.styp.cenate.repository.SolicitudBolsaRepository;
import com.styp.cenate.repository.HistorialImportacionBolsaRepository;
import com.styp.cenate.service.bolsas.BolsasService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.web.multipart.MultipartFile;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
//import com.styp.cenate.model.SolicitudBolsa;
import com.styp.cenate.model.HistorialImportacionBolsa;
import com.styp.cenate.model.Asegurado;
import com.styp.cenate.repository.AseguradoRepository;

import java.util.List;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.HashSet;
import java.util.Set;
import java.util.HashMap;
import java.util.Map;
import java.util.ArrayList;
import java.util.zip.CRC32;

/**
 * 📊 Servicio de Bolsas - Implementación
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class BolsasServiceImpl implements BolsasService {

    private final BolsaRepository bolsaRepository;
    //private final SolicitudBolsaRepository solicitudBolsaRepository;
    private final HistorialImportacionBolsaRepository historialImportacionBolsaRepository;
    private final AseguradoRepository aseguradoRepository;
    private final JdbcTemplate jdbcTemplate;
    @Qualifier("writableTransactionTemplate")
    private final TransactionTemplate transactionTemplate;

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

        //        long totalSolicitudes = solicitudBolsaRepository.countByActivo(true);
        //        long solicitudesPendientes = solicitudBolsaRepository.countByEstadoAndActivo("PENDIENTE", true);

        return new BolsasEstadisticasDTO(
                totalBolsas,
                bolsasActivas,
                bolsasInactivas,
                totalPacientes,
                pacientesAsignados,
                porcentajePromedio,
                0L,  // totalSolicitudes - comentado
                0L   // solicitudesPendientes - comentado
        );
    }

    // ========================================================================
    // ✏️ CREACIÓN Y ACTUALIZACIÓN
    // ========================================================================

    @Override
    @Transactional
    public BolsaDTO crearBolsa(BolsaRequestDTO request) {
        log.info("✏️ Creando nueva bolsa: {}", request.getNombreBolsa());

        // Verificar si ya existe una bolsa con el mismo nombre de paciente
        if (bolsaRepository.findByPacienteNombreIgnoreCase(request.getNombreBolsa()).isPresent()) {
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
    public ImportacionResultadoDTO importarDesdeExcel(MultipartFile archivo, Long usuarioId, String usuarioNombre, Long tipoBolesaId) {
        log.info("📥 Importando solicitudes desde Excel: {} - Tipo Bolsa: {}", archivo.getOriginalFilename(), tipoBolesaId);

        int totalRegistros = 0;
        int registrosExitosos = 0;
        int registrosFallidos = 0;
        Set<String> dnisProcesados = new HashSet<>();
        List<BolsasService.AseguradoImportadoDTO> nuevosAsegurados = new ArrayList<>();

        try (InputStream inputStream = archivo.getInputStream();
             Workbook workbook = new XSSFWorkbook(inputStream)) {

            Sheet sheet = workbook.getSheetAt(0);

            // 🔍 Obtener el tipo de bolsa - EN TRANSACCIÓN SEPARADA (readOnly = false)
            String nombreBolsa = "BOLSA_IMPORTADA_" + System.currentTimeMillis();
            log.info("📋 Buscando tipo de bolsa con ID: {}", tipoBolesaId);

            // Ejecutar en transacción de escritura explícita
            DimBolsa bolsaSeleccionada = transactionTemplate.execute(status ->
                crearObtenerBolsaConTipo(nombreBolsa, tipoBolesaId)
            );

            if (bolsaSeleccionada == null || !bolsaSeleccionada.getActivo()) {
                throw new RuntimeException("La bolsa seleccionada no está activa");
            }

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

                    // Procesar cada registro en una transacción separada usando TransactionTemplate
                    final int currentRowIndex = rowIndex;
                    final DimBolsa bolsaFinal = bolsaSeleccionada;
                    try {
                        transactionTemplate.executeWithoutResult(status -> {
                            procesarRegistroImportacion(dni, nombrePaciente, telefonoMovil, especialidad,
                                                       bolsaFinal, currentRowIndex, nuevosAsegurados);
                        });
                        registrosExitosos++;
                    } catch (Exception rowError) {
                        log.error("❌ Error procesando fila {}: {}", rowIndex, rowError.getMessage());
                        registrosFallidos++;
                    }

                } catch (Exception e) {
                    log.error("❌ Error procesando fila {}: {}", rowIndex, e.getMessage());
                    registrosFallidos++;
                }
            }

            // Registrar historial de importación (en transacción separada)
            HistorialImportacionBolsa historial = HistorialImportacionBolsa.builder()
                    .nombreArchivo(archivo.getOriginalFilename())
                    .usuarioId(usuarioId)
                    .usuarioNombre(usuarioNombre)
                    .totalRegistros(totalRegistros)
                    .registrosExitosos(registrosExitosos)
                    .registrosFallidos(registrosFallidos)
                    .estadoImportacion("COMPLETADA")
                    .activo(true)
                    .build();

            HistorialImportacionBolsa historialGuardado = transactionTemplate.execute(status ->
                historialImportacionBolsaRepository.save(historial)
            );

            log.info("✅ Importación completada: {} exitosos, {} fallidos de {} registros. {} asegurados nuevos creados",
                registrosExitosos, registrosFallidos, totalRegistros, nuevosAsegurados.size());

            return new ImportacionResultadoDTO(
                    historialGuardado.getIdImportacion(),
                    totalRegistros,
                    registrosExitosos,
                    registrosFallidos,
                    "COMPLETADA",
                    String.format("Importados %d solicitudes de %d registros. %d asegurados nuevos creados", registrosExitosos, totalRegistros, nuevosAsegurados.size()),
                    nuevosAsegurados
            );

        } catch (Exception e) {
            log.error("❌ Error importando archivo Excel: {}", e.getMessage(), e);

            // Registrar importación fallida (en transacción separada)
            try {
                HistorialImportacionBolsa historialFallo = HistorialImportacionBolsa.builder()
                        .nombreArchivo(archivo.getOriginalFilename())
                        .usuarioId(usuarioId)
                        .usuarioNombre(usuarioNombre)
                        .totalRegistros(totalRegistros)
                        .registrosExitosos(registrosExitosos)
                        .registrosFallidos(registrosFallidos)
                        .estadoImportacion("ERROR")
                        .detallesError(e.getMessage())
                        .activo(true)
                        .build();

                transactionTemplate.executeWithoutResult(status ->
                    historialImportacionBolsaRepository.save(historialFallo)
                );
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

    // ========================================================================
    // 🛠️ MÉTODO HELPER - PROCESAR CADA REGISTRO EN TRANSACCIÓN SEPARADA
    // ========================================================================

    /**
     * Procesa un registro individual
     * Se invoca dentro de una transacción manejada por TransactionTemplate
     */
    public void procesarRegistroImportacion(String dni, String nombrePaciente, String telefonoMovil,
                                            String especialidad, DimBolsa bolsa, int rowIndex,
                                            List<BolsasService.AseguradoImportadoDTO> nuevosAsegurados) {
        // 🔍 BUSCAR ASEGURADO POR DNI
        Asegurado aseguradoExistente = aseguradoRepository.findByDocPaciente(dni).orElse(null);
        String nombreFinal = nombrePaciente;
        String telefonoFinal = telefonoMovil;

        if (aseguradoExistente != null) {
            // ✅ ENCONTRADO: Usar datos del asegurado existente
            log.info("✓ Asegurado existente encontrado: DNI={}", dni);
            nombreFinal = aseguradoExistente.getPaciente();
            if (aseguradoExistente.getTelCelular() != null) {
                telefonoFinal = aseguradoExistente.getTelCelular();
            }
        } else {
            // ❌ NO ENCONTRADO: Crear nuevo asegurado
            log.info("📝 Creando nuevo asegurado: DNI={}", dni);
            Asegurado nuevoAsegurado = new Asegurado();
            nuevoAsegurado.setDocPaciente(dni);
            nuevoAsegurado.setPaciente(nombrePaciente.trim());
            nuevoAsegurado.setTelCelular(telefonoMovil != null ? telefonoMovil.trim() : null);
            nuevoAsegurado.setPkAsegurado(dni); // Usar DNI como PK temporal

            Asegurado aseguradoGuardado = aseguradoRepository.save(nuevoAsegurado);

            // Registrar nuevo asegurado
            synchronized (nuevosAsegurados) {
                nuevosAsegurados.add(new BolsasService.AseguradoImportadoDTO(
                    dni,
                    nombrePaciente.trim(),
                    telefonoMovil != null ? telefonoMovil.trim() : "No disponible",
                    "No disponible"
                ));
            }
        }

        // Generar número de solicitud único
        String numeroSolicitud = String.format("IMP-%d-%s-%d",
            System.currentTimeMillis(),
            dni,
            rowIndex);

        // Generar ID único derivado del DNI usando CRC32 para mejor distribución de hash
        CRC32 crc = new CRC32();
        crc.update(dni.getBytes());
        Long pacienteIdDerivado = Math.abs(crc.getValue());

        // Crear solicitud de bolsa - COMENTADO (usar SolicitudBolsaService v1.6.0)
        /*
        SolicitudBolsa solicitud = SolicitudBolsa.builder()
                .numeroSolicitud(numeroSolicitud)
                .docPaciente(dni) // ✅ IMPORTANTE: Setear DNI para FK a asegurados
                .pacienteId(pacienteIdDerivado) // ✅ IMPORTANTE: Usar pacienteId
                .pacienteNombre(nombreFinal)
                .pacienteDni(dni)
                .pacienteTelefono(telefonoFinal)
                .especialidad(especialidad != null ? especialidad.trim() : "No especificada")
                .estado("PENDIENTE")
                .bolsa(bolsa)
                .activo(true)
                .build();

        solicitudBolsaRepository.save(solicitud);
        */
        log.info("✅ Solicitud (legacy) - usar SolicitudBolsaService v1.6.0: {}", numeroSolicitud);
    }

    // ========================================================================
    // 🛠️ MÉTODO HELPER - GUARDAR HISTORIAL EN NUEVA TRANSACCIÓN
    // ========================================================================

    /**
     * Guarda el historial de importación en una nueva transacción separada
     * Deprecated: Usar TransactionTemplate.execute() directamente
     */
    @Deprecated(forRemoval = true)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public HistorialImportacionBolsa guardarHistorialEnNuevaTransaccion(HistorialImportacionBolsa historial) {
        log.info("📝 Guardando historial de importación en nueva transacción (DEPRECATED)");
        return historialImportacionBolsaRepository.save(historial);
    }

    // ========================================================================
    // 🛠️ MÉTODO HELPER - CREAR O OBTENER BOLSA CON TIPO
    // ========================================================================

    /**
     * Crea o obtiene una bolsa específica con el tipo de bolsa indicado
     * Ejecuta la función SQL: get_or_create_bolsa(nombre, tipo_id)
     * NOTA: Debe ser llamado dentro de una transacción (via TransactionTemplate)
     */
    private DimBolsa crearObtenerBolsaConTipo(String nombreBolsa, Long tipoBolesaId) {
        try {
            // Ejecutar función SQL get_or_create_bolsa
            Long idBolsaCreada = jdbcTemplate.queryForObject(
                    "SELECT get_or_create_bolsa(?, ?) AS id",
                    new Object[]{nombreBolsa, tipoBolesaId},
                    Long.class
            );

            log.info("✅ Bolsa obtenida/creada: ID={}, Nombre={}, Tipo={}", idBolsaCreada, nombreBolsa, tipoBolesaId);

            // Obtener la bolsa creada
            DimBolsa bolsa = bolsaRepository.findById(idBolsaCreada)
                    .orElseThrow(() -> new RuntimeException("Error al obtener bolsa creada: " + idBolsaCreada));

            return bolsa;
        } catch (Exception e) {
            log.error("❌ Error al crear/obtener bolsa: {}", e.getMessage());
            throw new RuntimeException("Error al crear/obtener bolsa: " + e.getMessage());
        }
    }
}

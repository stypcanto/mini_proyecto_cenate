package com.styp.cenate.service.bolsas;

import com.styp.cenate.dto.bolsas.SolicitudBolsaDTO;
import com.styp.cenate.dto.bolsas.SolicitudBolsaExcelRowDTO;
import com.styp.cenate.mapper.SolicitudBolsaMapper;
import com.styp.cenate.model.bolsas.SolicitudBolsa;
import com.styp.cenate.model.Asegurado;
import com.styp.cenate.model.DimServicioEssi;
import com.styp.cenate.model.Ipress;
import com.styp.cenate.model.Red;
import com.styp.cenate.model.TipoBolsa;
import com.styp.cenate.repository.bolsas.SolicitudBolsaRepository;
import com.styp.cenate.repository.AseguradoRepository;
import com.styp.cenate.repository.DimServicioEssiRepository;
import com.styp.cenate.repository.IpressRepository;
import com.styp.cenate.repository.RedRepository;
import com.styp.cenate.repository.TipoBolsaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Implementación del servicio de solicitudes de bolsa
 * Maneja importación de Excel, validación y enriquecimiento de datos
 * 
 * @version v1.6.0
 * @since 2026-01-23
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class SolicitudBolsaServiceImpl implements SolicitudBolsaService {

    private final SolicitudBolsaRepository solicitudRepository;
    private final AseguradoRepository aseguradoRepository;
    private final DimServicioEssiRepository dimServicioEssiRepository;
    private final IpressRepository ipressRepository;
    private final RedRepository redRepository;
    private final TipoBolsaRepository tipoBolsaRepository;

    @Override
    @Transactional
    public Map<String, Object> importarDesdeExcel(
            MultipartFile file,
            Long idTipoBolsa,
            Long idServicio,
            String usuarioCarga) {

        Map<String, Object> resultado = new HashMap<>();
        List<Map<String, Object>> errores = new ArrayList<>();
        int filasOk = 0;
        int filasError = 0;

        try {
            // Validar tipo de archivo
            log.info("📁 [SolicitudBolsaServiceImpl] Archivo recibido: {} | ContentType: {}", file.getOriginalFilename(), file.getContentType());
            boolean esValido = esArchivoExcelValido(file);
            log.info("📁 [SolicitudBolsaServiceImpl] Validación: {}", esValido);

            if (!esValido) {
                String errorMsg = "VALIDATOR_V1_6_0: Solo se permiten archivos .xlsx | File: " + file.getOriginalFilename() + " | ContentType: " + file.getContentType();
                log.error(errorMsg);
                throw new IllegalArgumentException(errorMsg);
            }

            XSSFWorkbook workbook = new XSSFWorkbook(file.getInputStream());
            XSSFSheet sheet = workbook.getSheetAt(0);

            // Procesar filas del Excel (empezando en fila 1, ignorar header)
            int filaNumero = 1;
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                try {
                    // ============================================================================
                    // 📋 EXTRAR LOS 10 CAMPOS DE EXCEL v1.8.0
                    // ============================================================================
                    String fechaPreferidaNoAtendida = obtenerValorCelda(row.getCell(0));  // Col 1
                    String tipoDocumento = obtenerValorCelda(row.getCell(1));             // Col 2
                    String dni = obtenerValorCelda(row.getCell(2));                       // Col 3
                    String nombreCompleto = obtenerValorCelda(row.getCell(3));            // Col 4
                    String sexo = obtenerValorCelda(row.getCell(4));                      // Col 5
                    String fechaNacimiento = obtenerValorCelda(row.getCell(5));           // Col 6
                    String telefono = obtenerValorCelda(row.getCell(6));                  // Col 7
                    String correo = obtenerValorCelda(row.getCell(7));                    // Col 8
                    String codigoIpress = obtenerValorCelda(row.getCell(8));              // Col 9
                    String tipoCita = obtenerValorCelda(row.getCell(9));                  // Col 10

                    // Validar campos obligatorios
                    if (dni.isBlank() || codigoIpress.isBlank()) {
                        errores.add(Map.of(
                            "fila", filaNumero,
                            "error", "DNI o COD. IPRESS ADSCRIPCIÓN vacío"
                        ));
                        filasError++;
                        filaNumero++;
                        continue;
                    }

                    // Crear DTO para procesar fila con TODOS los 10 campos
                    SolicitudBolsaExcelRowDTO rowDTO = new SolicitudBolsaExcelRowDTO(
                        filaNumero,
                        fechaPreferidaNoAtendida,
                        tipoDocumento,
                        dni,
                        nombreCompleto,
                        sexo,
                        fechaNacimiento,
                        telefono,
                        correo,
                        codigoIpress,
                        tipoCita
                    );

                    // Procesar y validar fila
                    // En producción, aquí se realizarían las validaciones contra BD
                    SolicitudBolsa solicitud = procesarFilaExcel(
                        rowDTO, idTipoBolsa, idServicio, usuarioCarga
                    );

                    // Guardar solicitud
                    solicitudRepository.save(solicitud);
                    filasOk++;

                } catch (Exception e) {
                    log.warn("Error procesando fila {}: {}", filaNumero, e.getMessage());
                    errores.add(Map.of(
                        "fila", filaNumero,
                        "dni", obtenerValorCelda(row.getCell(0)),
                        "error", e.getMessage()
                    ));
                    filasError++;
                }

                filaNumero++;
            }

            workbook.close();

            // Preparar resultado
            resultado.put("filas_total", filasOk + filasError);
            resultado.put("filas_ok", filasOk);
            resultado.put("filas_error", filasError);
            resultado.put("errores", errores);
            resultado.put("mensaje", String.format(
                "Importación completada: %d OK, %d errores",
                filasOk, filasError
            ));

        } catch (IOException e) {
            log.error("Error al leer archivo Excel: ", e);
            throw new RuntimeException("Error al procesar archivo Excel: " + e.getMessage());
        }

        return resultado;
    }

    @Override
    public List<SolicitudBolsaDTO> listarTodas() {
        return SolicitudBolsaMapper.toDTOList(
            solicitudRepository.findByActivoTrueOrderByFechaSolicitudDesc()
        );
    }

    @Override
    public Optional<SolicitudBolsaDTO> obtenerPorId(Long id) {
        return solicitudRepository.findById(id)
            .map(SolicitudBolsaMapper::toDTO);
    }

    @Override
    @Transactional
    public void asignarGestora(Long idSolicitud, Long idGestora) {
        SolicitudBolsa solicitud = solicitudRepository.findById(idSolicitud)
            .orElseThrow(() -> new RuntimeException("Solicitud no encontrada"));

        solicitud.setResponsableGestoraId(idGestora);
        solicitud.setFechaAsignacion(java.time.OffsetDateTime.now());
        solicitudRepository.save(solicitud);

        log.info("Gestora asignada a solicitud {}: {}", idSolicitud, idGestora);
    }

    @Override
    @Transactional
    public void cambiarEstado(Long idSolicitud, Long nuevoEstadoId) {
        SolicitudBolsa solicitud = solicitudRepository.findById(idSolicitud)
            .orElseThrow(() -> new RuntimeException("Solicitud no encontrada"));

        solicitud.setEstadoGestionCitasId(nuevoEstadoId);
        // En producción, obtener cod y desc desde DimEstadosGestionCitas
        solicitudRepository.save(solicitud);

        log.info("Estado actualizado en solicitud {}: {}", idSolicitud, nuevoEstadoId);
    }

    @Override
    @Transactional
    public void eliminar(Long idSolicitud) {
        SolicitudBolsa solicitud = solicitudRepository.findById(idSolicitud)
            .orElseThrow(() -> new RuntimeException("Solicitud no encontrada"));

        solicitud.setActivo(false);
        solicitudRepository.save(solicitud);

        log.info("Solicitud eliminada (soft delete): {}", idSolicitud);
    }

    @Override
    public List<Map<String, Object>> obtenerAseguradosNuevos() {
        log.info("Buscando asegurados nuevos detectados...");

        // Obtener todas las solicitudes activas
        List<SolicitudBolsa> solicitudes = solicitudRepository.findByActivoTrueOrderByFechaSolicitudDesc();

        // Filtrar aquellas donde paciente_nombre empieza con "Paciente " (sin sincronizar)
        List<Map<String, Object>> aseguradosNuevos = new ArrayList<>();
        Set<String> dnisYaAgregados = new HashSet<>();

        for (SolicitudBolsa solicitud : solicitudes) {
            if (solicitud.getPacienteNombre() != null &&
                solicitud.getPacienteNombre().startsWith("Paciente ") &&
                !dnisYaAgregados.contains(solicitud.getPacienteDni())) {

                // Verificar que el DNI NO exista en asegurados
                java.util.Optional<Asegurado> asegurado = aseguradoRepository.findByDocPaciente(solicitud.getPacienteDni());
                if (asegurado.isEmpty()) {
                    aseguradosNuevos.add(Map.of(
                        "dni", solicitud.getPacienteDni(),
                        "estado_actual", "No sincronizado",
                        "solicitudes_con_este_dni", solicitudes.stream()
                            .filter(s -> s.getPacienteDni().equals(solicitud.getPacienteDni()))
                            .count(),
                        "fecha_primera_solicitud", solicitud.getFechaSolicitud()
                    ));

                    dnisYaAgregados.add(solicitud.getPacienteDni());
                }
            }
        }

        log.info("Se encontraron {} asegurados nuevos", aseguradosNuevos.size());
        return aseguradosNuevos;
    }

    /**
     * Procesa una fila del Excel: valida y auto-enriquece datos
     * Almacena los 10 campos de Excel v1.8.0
     *
     * @since v1.8.0
     */
    private SolicitudBolsa procesarFilaExcel(
            SolicitudBolsaExcelRowDTO row,
            Long idTipoBolsa,
            Long idServicio,
            String usuarioCarga) {

        Long pacienteIdGenerado = Math.abs(row.dni().hashCode()) % 1000000L;
        String pacienteNombre = "Paciente " + row.dni();
        String especialidad = "N/A";
        String codServicio = null;
        String codTipoBolsa = null;
        String descTipoBolsa = null;
        Long idIpress = null;
        String nombreIpress = "N/A";
        String redAsistencial = "N/A";

        // ============================================================================
        // 📋 PROCESAR LOS 10 CAMPOS DE EXCEL v1.8.0
        // ============================================================================

        // Parsear fechas
        java.time.LocalDate fechaPreferida = null;
        java.time.LocalDate fechaNacimiento = null;
        Integer edadCalculada = null;

        try {
            if (row.fechaPreferidaNoAtendida() != null && !row.fechaPreferidaNoAtendida().isBlank()) {
                fechaPreferida = java.time.LocalDate.parse(row.fechaPreferidaNoAtendida());
                log.info("✅ Fecha preferida parseada: {}", fechaPreferida);
            }
        } catch (Exception e) {
            log.warn("⚠️ No se pudo parsear fecha preferida: {}", e.getMessage());
        }

        try {
            if (row.fechaNacimiento() != null && !row.fechaNacimiento().isBlank()) {
                fechaNacimiento = java.time.LocalDate.parse(row.fechaNacimiento());
                // Calcular edad
                edadCalculada = java.time.LocalDate.now().getYear() - fechaNacimiento.getYear();
                log.info("✅ Fecha nacimiento parseada: {} | Edad calculada: {}", fechaNacimiento, edadCalculada);
            }
        } catch (Exception e) {
            log.warn("⚠️ No se pudo parsear fecha nacimiento: {}", e.getMessage());
        }

        // 0. Obtener nombre real del paciente desde dim_asegurados o sincronizar si es nuevo
        try {
            log.info("🔍 PASO 0: Buscando asegurado DNI {}", row.dni());
            java.util.Optional<Asegurado> aseguradoExistente = aseguradoRepository.findByDocPaciente(row.dni());

            if (aseguradoExistente.isPresent()) {
                // Asegurado existe: usar su nombre
                String nombre = aseguradoExistente.get().getPaciente();
                if (nombre != null && !nombre.isBlank()) {
                    pacienteNombre = nombre;
                    log.info("✅ Nombre de paciente obtenido de BD: {} para DNI {}", pacienteNombre, row.dni());
                }
            } else {
                // Asegurado NO existe
                log.info("⚠️  Asegurado NO existe en BD para DNI {}", row.dni());
                log.info("   - nombreCompleto: {}", row.nombreCompleto());
                log.info("   - sexo: {}", row.sexo());
                log.info("   - fechaNacimiento: {}", row.fechaNacimiento());
                log.info("   - telefono: {}", row.telefono());
                log.info("   - correo: {}", row.correo());

                if (row.nombreCompleto() != null && !row.nombreCompleto().isBlank()) {
                    // CREAR NUEVO ASEGURADO
                    pacienteNombre = row.nombreCompleto();
                    log.info("📝 CREANDO nuevo Asegurado para DNI {}: {}", row.dni(), row.nombreCompleto());

                    Asegurado nuevoAsegurado = new Asegurado();
                    nuevoAsegurado.setPkAsegurado(row.dni());
                    nuevoAsegurado.setDocPaciente(row.dni());
                    nuevoAsegurado.setPaciente(row.nombreCompleto());
                    nuevoAsegurado.setTelCelular(row.telefono());
                    nuevoAsegurado.setCorreoElectronico(row.correo());
                    nuevoAsegurado.setSexo(row.sexo());

                    if (fechaNacimiento != null) {
                        nuevoAsegurado.setFecnacimpaciente(fechaNacimiento);
                        log.info("   ✅ Fecha de nacimiento asignada: {}", fechaNacimiento);
                    }

                    log.info("   💾 Guardando en BD...");
                    aseguradoRepository.save(nuevoAsegurado);
                    log.info("   ✅ Nuevo asegurado guardado en BD!");
                    log.info("✅ ÉXITO: Nuevo asegurado creado y sincronizado: {} (DNI: {})", row.nombreCompleto(), row.dni());
                } else {
                    log.warn("⚠️  No hay nombreCompleto para DNI {} - usando fallback", row.dni());
                    pacienteNombre = "Paciente " + row.dni();
                }
            }
        } catch (Exception e) {
            log.error("❌ ERROR CRÍTICO al sincronizar asegurado para DNI {}: {}", row.dni(), e.getMessage(), e);
            pacienteNombre = "Paciente " + row.dni();
        }

        // 1. Obtener especialidad y código de servicio
        try {
            DimServicioEssi servicio = dimServicioEssiRepository.findById(idServicio).orElse(null);
            if (servicio != null) {
                especialidad = servicio.getDescServicio() != null ? servicio.getDescServicio() : "N/A";
                codServicio = servicio.getCodServicio();
            }
        } catch (Exception e) {
            log.warn("No se pudo obtener especialidad para ID {}: {}", idServicio, e.getMessage());
        }

        // 2. Obtener datos del tipo de bolsa
        try {
            TipoBolsa tipoBolsa = tipoBolsaRepository.findById(idTipoBolsa).orElse(null);
            if (tipoBolsa != null) {
                codTipoBolsa = tipoBolsa.getCodTipoBolsa();
                descTipoBolsa = tipoBolsa.getDescTipoBolsa();
            }
        } catch (Exception e) {
            log.warn("No se pudo obtener tipo de bolsa para ID {}: {}", idTipoBolsa, e.getMessage());
        }

        // 3. Obtener IPRESS desde código de adscripción (COD. IPRESS ADSCRIPCIÓN de Excel)
        try {
            Ipress ipress = ipressRepository.findByCodIpress(row.codigoIpress()).orElse(null);
            if (ipress != null) {
                idIpress = ipress.getIdIpress();
                nombreIpress = ipress.getDescIpress() != null ? ipress.getDescIpress() : "N/A";

                // 4. Obtener RED asociada a la IPRESS
                if (ipress.getRed() != null) {
                    redAsistencial = ipress.getRed().getDescripcion();
                }
            }
        } catch (Exception e) {
            log.warn("No se pudo obtener IPRESS para código {}: {}", row.codigoIpress(), e.getMessage());
        }

        return SolicitudBolsa.builder()
            .numeroSolicitud(SolicitudBolsaMapper.generarNumeroSolicitud())
            .pacienteDni(row.dni())
            .pacienteId(pacienteIdGenerado)
            .pacienteNombre(pacienteNombre)
            .especialidad(especialidad)
            .idBolsa(idTipoBolsa)
            .codTipoBolsa(codTipoBolsa)
            .descTipoBolsa(descTipoBolsa)
            .idServicio(idServicio)
            .codServicio(codServicio)
            .codigoAdscripcion(row.codigoIpress())
            .idIpress(idIpress)
            .nombreIpress(nombreIpress)
            .redAsistencial(redAsistencial)
            .estado("PENDIENTE")
            .solicitanteId(1L)
            .solicitanteNombre(usuarioCarga)
            .estadoGestionCitasId(5L)
            .codEstadoCita("PENDIENTE_CITA")
            .descEstadoCita("Pendiente de Cita")
            .activo(true)
            .recordatorioEnviado(false)
            // ============================================================================
            // 📋 LOS 10 CAMPOS DE EXCEL v1.8.0 - ASIGNADOS AL BUILDER
            // ============================================================================
            .fechaPreferidaNoAtendida(fechaPreferida)
            .tipoDocumento(row.tipoDocumento())
            .fechaNacimiento(fechaNacimiento)
            .pacienteSexo(row.sexo())
            .pacienteTelefono(row.telefono())
            .pacienteEmail(row.correo())
            .codigoIpressAdscripcion(row.codigoIpress())
            .tipoCita(row.tipoCita())
            .pacienteEdad(edadCalculada)
            .build();
    }

    /**
     * Valida que el archivo sea un Excel válido (.xlsx)
     */
    private boolean esArchivoExcelValido(MultipartFile file) {
        String filename = file.getOriginalFilename();

        // Validar SOLO la extensión del archivo
        // Muchos clientes envían contentType incorrecto para .xlsx
        if (filename == null) {
            log.warn("⚠️ Nombre de archivo null");
            return false;
        }

        boolean isValid = filename.toLowerCase().endsWith(".xlsx") || filename.toLowerCase().endsWith(".xls");

        if (!isValid) {
            log.warn("⚠️ Extensión de archivo no permitida: {}", filename);
        }

        return isValid;
    }

    /**
     * Extrae valor de celda de forma segura
     * Maneja correctamente fechas en formato Excel
     */
    private String obtenerValorCelda(Cell cell) {
        if (cell == null) {
            return "";
        }

        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue().trim();
            case NUMERIC -> {
                // ✅ Verificar si la celda contiene una fecha
                if (org.apache.poi.ss.usermodel.DateUtil.isCellDateFormatted(cell)) {
                    try {
                        java.time.LocalDate date = cell.getDateCellValue()
                            .toInstant()
                            .atZone(java.time.ZoneId.systemDefault())
                            .toLocalDate();
                        yield date.toString(); // Devuelve en formato YYYY-MM-DD
                    } catch (Exception e) {
                        log.warn("Error al convertir fecha en celda: {}", e.getMessage());
                        yield "";
                    }
                } else {
                    // No es una fecha, convertir como número
                    yield String.valueOf((long) cell.getNumericCellValue());
                }
            }
            default -> "";
        };
    }
}

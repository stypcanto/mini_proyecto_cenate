package com.styp.cenate.service.bolsas;

import com.styp.cenate.dto.bolsas.SolicitudBolsaDTO;
import com.styp.cenate.dto.bolsas.SolicitudBolsaExcelRowDTO;
import com.styp.cenate.dto.bolsas.ReporteDuplicadosDTO;
import com.styp.cenate.dto.bolsas.CrearSolicitudAdicionalRequest;
import com.styp.cenate.mapper.SolicitudBolsaMapper;
import com.styp.cenate.model.bolsas.SolicitudBolsa;
import com.styp.cenate.model.bolsas.DimSolicitudBolsasGeneral;
import com.styp.cenate.model.bolsas.TipoErrorImportacion;
import com.styp.cenate.model.Asegurado;
import com.styp.cenate.model.DimServicioEssi;
import com.styp.cenate.model.Ipress;
import com.styp.cenate.model.PersonalCnt;
import com.styp.cenate.model.Red;
import com.styp.cenate.model.TipoBolsa;
import com.styp.cenate.model.Usuario;
import com.styp.cenate.repository.bolsas.SolicitudBolsaRepository;
import com.styp.cenate.repository.bolsas.DimEstadosGestionCitasRepository;
import com.styp.cenate.repository.bolsas.DimSolicitudBolsasGeneralRepository;
import com.styp.cenate.repository.AseguradoRepository;
import com.styp.cenate.repository.DimServicioEssiRepository;
import com.styp.cenate.repository.IpressRepository;
import com.styp.cenate.repository.RedRepository;
import com.styp.cenate.repository.TipoBolsaRepository;
import com.styp.cenate.repository.UsuarioRepository;
import com.styp.cenate.repository.PersonalCntRepository;
import com.styp.cenate.repository.PacienteEstrategiaRepository;
import com.styp.cenate.exception.ResourceNotFoundException;
import com.styp.cenate.exception.ValidationException;
import com.styp.cenate.service.ApplicationErrorLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Implementación del servicio de solicitudes de bolsa
 * Maneja importación de Excel, validación y enriquecimiento de datos
 *
 * @version v1.17.2 - Validación FLEXIBLE de estructura Excel (mínimo 10 columnas)
 * @since 2026-01-23
 * @updated 2026-01-28 - Mejoras finales:
 *   - Validación flexible: Acepta 10+ columnas (algunos archivos POI lee una menos)
 *   - Mensaje de advertencia si detecta menos de 11
 *   - Procesa los datos disponibles pero alerta si hay menos columnas
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SolicitudBolsaServiceImpl implements SolicitudBolsaService {

    // ============================================================================
    // VALIDACIÓN DE TELÉFONO - REGEX PATTERN
    // ============================================================================
    private static final String PHONE_PATTERN = "^[0-9+()\\-\\s]*$";
    private static final String PHONE_VALIDATION_ERROR = "Formato de teléfono inválido. Solo se permiten números, +, (), - y espacios";

    private final SolicitudBolsaRepository solicitudRepository;
    private final DimEstadosGestionCitasRepository dimEstadosGestionCitasRepository;
    private final AuditErrorImportacionService auditErrorService;
    private final AseguradoRepository aseguradoRepository;
    private final PersonalCntRepository personalCntRepository;
    private final DimServicioEssiRepository dimServicioEssiRepository;
    private final IpressRepository ipressRepository;
    private final RedRepository redRepository;
    private final TipoBolsaRepository tipoBolsaRepository;
    private final UsuarioRepository usuarioRepository;
    private final PacienteEstrategiaRepository pacienteEstrategiaRepository;
    private final ApplicationErrorLogService errorLogService;
    private final DimSolicitudBolsasGeneralRepository dimSolicitudBolsasGeneralRepository;

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    @Transactional
    public Map<String, Object> importarDesdeExcel(
            MultipartFile file,
            Long idBolsa,
            Long idServicio,
            String usuarioCarga,
            Long idHistorial) {

        Map<String, Object> resultado = new HashMap<>();
        List<Map<String, Object>> errores = new ArrayList<>();
        List<Map<String, Object>> duplicados = new ArrayList<>();  // ✅ NUEVO: Lista separada de duplicados
        List<Map<String, Object>> otros_errores = new ArrayList<>(); // ✅ NUEVO: Lista de otros errores
        int filasOk = 0;
        int filasError = 0;

        // ✅ v2.2.0: KEEP_FIRST - Trackear DNI procesados para saltar duplicados
        Set<String> dniProcesados = new HashSet<>();
        List<Map<String, Object>> dniDuplicadosSaltados = new ArrayList<>();

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

            // ============================================================================
            // VALIDACIÓN OBLIGATORIA: Excel DEBE tener EXACTAMENTE 11 columnas
            // ============================================================================
            Row headerRow = sheet.getRow(0);
            int columnasEnHeader = 0;

            if (headerRow != null) {
                // Contar celdas NO VACÍAS en el header
                for (int col = 0; col < 15; col++) {
                    try {
                        Cell cell = headerRow.getCell(col);
                        if (cell != null) {
                            String valor = null;
                            switch (cell.getCellType()) {
                                case STRING:
                                    valor = cell.getStringCellValue();
                                    break;
                                case NUMERIC:
                                    valor = String.valueOf((long) cell.getNumericCellValue());
                                    break;
                                default:
                                    break;
                            }
                            if (valor != null && !valor.trim().isEmpty()) {
                                columnasEnHeader++;
                            }
                        }
                    } catch (Exception e) {
                        // Ignorar errores de lectura, contar solo celdas válidas
                    }
                }
                log.info("📊 [VALIDACIÓN ESTRUCTURA] Columnas encontradas: {}", columnasEnHeader);
            }

            // VALIDACIÓN: Debe tener mínimo 10 columnas
            if (columnasEnHeader < 10) {
                String errorMsg = String.format(
                    "❌ ARCHIVO INCORRECTO\n\n" +
                    "Tu Excel tiene %d columnas pero debe tener 11.\n\n" +
                    "LAS 11 COLUMNAS DEBEN SER (EN ESTE ORDEN):\n" +
                    "1. Fecha\n" +
                    "2. Tipo Documento\n" +
                    "3. DNI\n" +
                    "4. Nombres\n" +
                    "5. Sexo\n" +
                    "6. Fecha Nacimiento\n" +
                    "7. Teléfono Principal\n" +
                    "8. Teléfono Alterno\n" +
                    "9. Correo\n" +
                    "10. IPRESS\n" +
                    "11. Tipo Cita\n\n" +
                    "Por favor:\n" +
                    "• Descarga la plantilla oficial\n" +
                    "• Verifica que tenga exactamente 11 columnas\n" +
                    "• Intenta de nuevo",
                    columnasEnHeader
                );

                log.error("❌ [VALIDACIÓN FALLIDA] Columnas encontradas: {}, Mínimo requerido: 10", columnasEnHeader);
                throw new IllegalArgumentException(errorMsg);
            }

            if (columnasEnHeader < 11) {
                log.warn("⚠️ [VALIDACIÓN ADVERTENCIA] Excel tiene {} columnas, se esperan 11. " +
                         "Si hay errores, revisa que el Excel tenga exactamente 11 columnas sin espacios ocultos.", columnasEnHeader);
            } else {
                log.info("✅ [VALIDACIÓN OK] Estructura correcta: 11 columnas detectadas");
            }

            // ============================================================================
            // ✅ v2.2.0 NUEVO: ANÁLISIS PRE-PROCESAMIENTO DE DUPLICADOS
            // ============================================================================
            int totalFilasExcel = sheet.getLastRowNum();
            ReporteDuplicadosDTO reporteDuplicados = analizarDuplicadosEnExcel(sheet, totalFilasExcel);
            log.info("📊 [v2.2.0] Análisis de duplicados: {} mensaje",
                reporteDuplicados.getMensajeResumen());

            // Procesar filas del Excel (empezando en fila 1, ignorar header en fila 0)
            int filaNumero = 1;
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;

                // SEGURIDAD: Detectar si accidentalmente estamos leyendo una fila de headers
                // (si la primera celda es "FECHA PREFERIDA QUE NO FUE ATENDIDA" o similar)
                String primeracelda = obtenerValorCelda(row.getCell(0));
                if (primeracelda.toLowerCase().contains("fecha preferida") ||
                    primeracelda.toLowerCase().contains("tipo documento")) {
                    log.warn("⚠️  [FILA {}] Parece ser una fila de headers, saltando...", filaNumero);
                    filaNumero++;
                    continue;
                }

                // Declarar rowDTO fuera del try para que esté disponible en el catch
                SolicitudBolsaExcelRowDTO rowDTO = null;

                try {
                    // ============================================================================
                    // 📋 EXTRACCIÓN INTELIGENTE DE COLUMNAS v1.18.0
                    // Detecta posición de TIPO_CITA en la fila y mapea columnas dinámicamente
                    // Soluciona problema de Apache POI leyendo 10 vs 11 columnas
                    // ============================================================================
                    Map<String, String> camposExcel = extraerCamposInteligentemente(row, filaNumero);

                    String fechaPreferidaNoAtendida = camposExcel.get("fechaPreferidaNoAtendida");
                    String tipoDocumento = camposExcel.get("tipoDocumento");
                    if (tipoDocumento == null || tipoDocumento.isBlank()) {
                        tipoDocumento = "DNI";
                        log.info("📝 [TIPO_DOCUMENTO] Completado con valor por defecto: 'DNI'");
                    }
                    String dni = normalizarDNI(camposExcel.get("dni"));

                    // ✅ v2.2.0: KEEP_FIRST - Saltar si DNI ya fue procesado
                    if (dniProcesados.contains(dni)) {
                        Map<String, Object> saltado = Map.of(
                            "fila", filaNumero,
                            "dni", dni,
                            "razon", "DNI duplicado - mantenido el primer registro (estrategia KEEP_FIRST)"
                        );
                        dniDuplicadosSaltados.add(saltado);
                        log.warn("⏭️  [FILA {}] DNI {} ya fue procesado, SALTANDO (KEEP_FIRST)", filaNumero, dni);
                        filaNumero++;
                        continue;
                    }
                    dniProcesados.add(dni);  // Registrar DNI procesado
                    String nombreCompleto = camposExcel.get("nombreCompleto");
                    String sexo = camposExcel.get("sexo");
                    String fechaNacimiento = camposExcel.get("fechaNacimiento");
                    String telefonoPrincipal = camposExcel.get("telefonoPrincipal");
                    String telefonoAlterno = camposExcel.get("telefonoAlterno");
                    // Normalizar "No registrado" → vacío para teléfono alterno
                    if (telefonoAlterno != null && telefonoAlterno.equalsIgnoreCase("No registrado")) {
                        telefonoAlterno = "";
                    }
                    String correo = camposExcel.get("correo");
                    String codigoIpress = camposExcel.get("codigoIpress");

                    // ============================================================================
                    // 🔧 NORMALIZAR COD. IPRESS A 3 DÍGITOS (21 → 021)
                    // ============================================================================
                    if (codigoIpress != null && !codigoIpress.isBlank()) {
                        try {
                            int codigo = Integer.parseInt(codigoIpress.trim());
                            codigoIpress = String.format("%03d", codigo);
                            log.debug("✓ Código IPRESS normalizado: {} → {}", codigoIpress, codigoIpress);
                        } catch (NumberFormatException e) {
                            log.warn("⚠️ Código IPRESS no numérico: {} para DNI {} | Usando valor original", codigoIpress.trim(), dni);
                        }
                    }

                    String ipressAtencion = camposExcel.get("ipressAtencion");  // ✅ v1.15.0: Nueva columna
                    
                    // ============================================================================
                    // 🔧 NORMALIZAR IPRESS ATENCIÓN A 3 DÍGITOS (21 → 021) - v1.15.0
                    // ============================================================================
                    if (ipressAtencion != null && !ipressAtencion.isBlank()) {
                        try {
                            int codigo = Integer.parseInt(ipressAtencion.trim());
                            ipressAtencion = String.format("%03d", codigo);
                            log.debug("✓ Código IPRESS ATENCIÓN normalizado: {} → {}", ipressAtencion, ipressAtencion);
                        } catch (NumberFormatException e) {
                            log.warn("⚠️ Código IPRESS ATENCIÓN no numérico: {} para DNI {} | Usando valor original", ipressAtencion.trim(), dni);
                        }
                    }

                    String tipoCita = camposExcel.get("tipoCita");
                    // Normalizar tipoCita a PascalCase (VOLUNTARIA → Voluntaria, REFERENCIA → Referencia)
                    if (tipoCita != null && !tipoCita.isBlank()) {
                        String normalized = tipoCita.toLowerCase().trim();
                        tipoCita = normalized.equals("recita") ? "Recita" :
                                   normalized.equals("interconsulta") ? "Interconsulta" :
                                   normalized.equals("voluntaria") ? "Voluntaria" :
                                   normalized.equals("referencia") ? "Referencia" : tipoCita;
                    }

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

                    // ============================================================================
                    // 🔍 ENRIQUECIMIENTO INTELIGENTE OPTIMIZADO - Solo si datos están vacíos
                    // ============================================================================
                    // SOLO buscar en BD si SEXO o FECHA_NACIMIENTO están vacíos en Excel
                    Map<String, Object> datosEnriquecidos = new HashMap<>();
                    Boolean dniExisteEnBD = false;

                    if ((sexo == null || sexo.isBlank()) || (fechaNacimiento == null || fechaNacimiento.isBlank())) {
                        // Hay datos faltantes, buscar en BD
                        datosEnriquecidos = enriquecerDatosDesdeAsegurado(dni, sexo, fechaNacimiento);
                        dniExisteEnBD = (Boolean) datosEnriquecidos.get("existe");
                    } else {
                        // Excel tiene ambos datos, no buscar en BD
                        log.info("✓ [ENRIQUECIMIENTO SKIP] Excel tiene SEXO y FECHA_NACIMIENTO completos para DNI {}", dni);
                    }

                    String sexoEnriquecido = (String) datosEnriquecidos.getOrDefault("sexo", "");
                    String fechaNacimientoEnriquecido = (String) datosEnriquecidos.getOrDefault("fechaNacimiento", "");

                    // Lógica flexible de enriquecimiento:
                    // - Si existe en asegurados: enriquece datos faltantes desde BD
                    // - Si NO existe en asegurados: permite solo si Excel tiene SEXO y F.NAC completos
                    if (dniExisteEnBD) {
                        // DNI EXISTE: usar enriquecimiento para campos vacíos
                        if (sexo == null || sexo.isBlank()) {
                            sexo = sexoEnriquecido;
                            log.info("📊 [ENRIQUECIMIENTO] SEXO completado desde asegurados para DNI {}: {}", dni, sexo);
                        }
                        if (fechaNacimiento == null || fechaNacimiento.isBlank()) {
                            fechaNacimiento = fechaNacimientoEnriquecido;
                            log.info("📅 [ENRIQUECIMIENTO] FECHA_NACIMIENTO completada desde asegurados para DNI {}: {}", dni, fechaNacimiento);
                        }
                    }
                    // DNI no importa si existe o no - si Excel tiene SEXO y FECHA_NACIMIENTO, proceder

                    // ============================================================================
                    // ASEGURAR QUE SEXO Y FECHA_NACIMIENTO NO ESTÉN VACÍOS (FALLBACK A VALORES POR DEFECTO)
                    // ============================================================================
                    if (sexo == null || sexo.isBlank()) {
                        sexo = "O"; // Otro
                        log.warn("⚠️  Fila {}: SEXO está vacío incluso después de enriquecimiento. Usando fallback: '{}'", filaNumero, sexo);
                    }
                    if (fechaNacimiento == null || fechaNacimiento.isBlank()) {
                        fechaNacimiento = "1900-01-01"; // Fecha genérica como fallback
                        log.warn("⚠️  Fila {}: FECHA_NACIMIENTO está vacía incluso después de enriquecimiento. Usando fallback: '{}'", filaNumero, fechaNacimiento);
                    }

                    // Crear DTO para procesar fila con TODOS los 12 campos (v1.15.0 - ahora enriquecidos)
                    rowDTO = new SolicitudBolsaExcelRowDTO(
                        filaNumero,
                        fechaPreferidaNoAtendida,
                        tipoDocumento,
                        dni,
                        nombreCompleto,
                        sexo,
                        fechaNacimiento,
                        telefonoPrincipal,
                        telefonoAlterno,
                        correo,
                        codigoIpress,
                        ipressAtencion,  // ✅ v1.15.0: Nuevo campo
                        tipoCita
                    );

                    // ============================================================================
                    // CORRECCIÓN #1: VALIDAR TELÉFONOS ANTES DE PROCESAR
                    // ============================================================================
                    validarTelefonos(filaNumero, rowDTO.telefonoPrincipal(), rowDTO.telefonoAlterno());

                    // Obtener datos del servicio ANTES de procesar
                    DimServicioEssi servicio = dimServicioEssiRepository.findById(idServicio).orElse(null);

                    // Procesar y validar fila
                    SolicitudBolsa solicitud = procesarFilaExcel(
                        rowDTO, idBolsa, idServicio, usuarioCarga, idHistorial
                    );

                    // ============================================================================
                    // ✅ v1.20.0: DETECCIÓN DE DUPLICADOS CON AUDITORÍA
                    // ============================================================================
                    Map<String, Object> infoDuplicado = detectarDuplicado(filaNumero, idBolsa, solicitud, servicio);

                    // Si es duplicado, registrarlo en auditoría y saltar
                    if (infoDuplicado != null) {
                        duplicados.add(infoDuplicado);

                        // ✅ v1.20.0: Usar servicio dedicado de auditoría
                        auditErrorService.registrarError(
                            idHistorial,
                            filaNumero,
                            rowDTO,
                            TipoErrorImportacion.DUPLICADO,
                            (String) infoDuplicado.get("razon"),
                            solicitud
                        );

                        filasError++;
                        filaNumero++;
                        continue;
                    }

                    // Guardar solicitud (número ya pre-validado en procesarFilaExcel)
                    try {
                        solicitudRepository.save(solicitud);
                        
                        // ✅ Guardar también en DimSolicitudBolsasGeneral
                        try {
                            DimSolicitudBolsasGeneral dimSolicitud = DimSolicitudBolsasGeneral.builder()
                                .idCarga(idHistorial)
                                .idBolsa(idBolsa)
                                .idServicio(idServicio)
                                .fechaPreferidaNoAtendida(solicitud.getFechaPreferidaNoAtendida())
                                .tipoDocumento(rowDTO.tipoDocumento())
                                .dni(rowDTO.dni())
                                .asegurado(rowDTO.nombreCompleto())
                                .sexo(rowDTO.sexo())
                                .fechaNacimiento(solicitud.getFechaNacimiento())
                                .telefonoPrincipal(rowDTO.telefonoPrincipal())
                                .telefonoAlterno(rowDTO.telefonoAlterno())
                                .correo(rowDTO.correo())
                                .codIpressAdscripcion(rowDTO.codigoIpress())
                                .ipressAtencion(rowDTO.ipressAtencion())
                                .tipoCita(rowDTO.tipoCita())
                                .build();
                            
                            log.info("💾 [FILA {}] Guardando en DimSolicitudBolsasGeneral: DNI={}", filaNumero, rowDTO.dni());
                            dimSolicitudBolsasGeneralRepository.save(dimSolicitud);
                            log.info("✅ [FILA {}] DimSolicitudBolsasGeneral guardada exitosamente", filaNumero);
                        } catch (Exception e) {
                            log.error("❌ [FILA {}] Error guardando en DimSolicitudBolsasGeneral: {}", filaNumero, e.getMessage(), e);
                        }
                        
                        filasOk++;
                        log.info("✅ [FILA {}] Solicitud guardada exitosamente | DNI: {} | Bolsa: {} | Número: {}",
                            filaNumero, rowDTO.dni(), idBolsa, solicitud.getNumeroSolicitud());
                    } catch (org.springframework.dao.DataIntegrityViolationException e) {
                        // ============================================================================
                        // v1.20.0: MANEJAR ERRORES DE INTEGRIDAD CON AUDITORÍA
                        // ============================================================================
                        String mensajeError = manejarErrorIntegridad(filaNumero, rowDTO, e);
                        otros_errores.add(Map.of(
                            "fila", filaNumero,
                            "dni", rowDTO.dni(),
                            "error", mensajeError
                        ));

                        // ✅ v1.20.0: Usar servicio dedicado de auditoría con transacción independiente
                        auditErrorService.registrarError(
                            idHistorial,
                            filaNumero,
                            rowDTO,
                            TipoErrorImportacion.CONSTRAINT,
                            mensajeError,
                            solicitud
                        );

                        // ✅ NUEVO: Registrar error en application_error_log (método genérico)
                        try {
                            String constraintName = extraerConstraintName(e);
                            String tipoViolacion = extraerTipoViolacion(e);
                            errorLogService.logError(
                                "DATABASE",
                                tipoViolacion,
                                e,
                                null, // request - se pasa desde controller si está disponible
                                usuarioCarga,
                                Map.of(
                                    "archivo", file.getOriginalFilename(),
                                    "fila", filaNumero,
                                    "dni", rowDTO.dni(),
                                    "bolsa_id", idBolsa,
                                    "servicio_id", idServicio,
                                    "historial_id", idHistorial,
                                    "numero_solicitud", solicitud.getNumeroSolicitud() != null ? solicitud.getNumeroSolicitud() : "N/A",
                                    "constraint_name", constraintName,
                                    "table_name", "dim_solicitud_bolsa"
                                )
                            );
                        } catch (Exception logEx) {
                            log.warn("⚠️ No se pudo registrar error en application_error_log: {}", logEx.getMessage());
                        }

                        // ✅ CRÍTICO: Limpiar la sesión para prevenir "transaction aborted"
                        try {
                            entityManager.clear();
                            log.debug("🧹 Sesión limpiada después de error de constraint");
                        } catch (Exception cleanupEx) {
                            log.warn("⚠️ No se pudo limpiar sesión: {}", cleanupEx.getMessage());
                        }

                        filasError++;
                    }

                } catch (Exception e) {
                    log.warn("❌ Error procesando fila {}: {}", filaNumero, e.getMessage());

                    // Generar mensaje de error en español basado en el tipo de excepción
                    String mensajeEnEspanol = generarMensajeErrorEnEspanol(filaNumero, rowDTO, e);

                    // ✅ NUEVO: Registrar error genérico en application_error_log
                    try {
                        errorLogService.logError(
                            "BUSINESS",
                            "IMPORT_ROW_ERROR",
                            e,
                            null, // request
                            usuarioCarga,
                            Map.of(
                                "archivo", file.getOriginalFilename(),
                                "fila", filaNumero,
                                "dni", rowDTO != null ? rowDTO.dni() : "N/A",
                                "bolsa_id", idBolsa,
                                "servicio_id", idServicio,
                                "historial_id", idHistorial
                            )
                        );
                    } catch (Exception logEx) {
                        log.warn("⚠️ No se pudo registrar error en application_error_log: {}", logEx.getMessage());
                    }

                    otros_errores.add(Map.of(
                        "fila", filaNumero,
                        "dni", rowDTO != null ? rowDTO.dni() : "DESCONOCIDO",
                        "error", mensajeEnEspanol
                    ));

                    // ✅ v1.20.0: Usar servicio dedicado de auditoría con transacción independiente
                    if (rowDTO != null) {
                        auditErrorService.registrarError(
                            idHistorial,
                            filaNumero,
                            rowDTO,
                            TipoErrorImportacion.VALIDACION,
                            mensajeEnEspanol,
                            null  // solicitud podría no haberse creado
                        );
                    }

                    // ✅ CRÍTICO: Limpiar la sesión de Hibernate para prevenir "transaction aborted"
                    try {
                        entityManager.clear();
                        log.debug("🧹 Sesión limpiada después de error en fila {}", filaNumero);
                    } catch (Exception cleanupEx) {
                        log.warn("⚠️ No se pudo limpiar sesión en fila {}: {}", filaNumero, cleanupEx.getMessage());
                    }

                    filasError++;
                }

                filaNumero++;
            }

            workbook.close();

            // ============================================================================
            // ✅ v2.2.0: Agregar reporte de deduplicación KEEP_FIRST
            // ============================================================================
            Map<String, Object> reporteDeduplicacion = new HashMap<>();
            reporteDeduplicacion.put("estrategia", "KEEP_FIRST");
            reporteDeduplicacion.put("dniDuplicadosSaltados", dniDuplicadosSaltados.size());
            reporteDeduplicacion.put("dniDuplicadosDetalles", dniDuplicadosSaltados);

            // ============================================================================
            // ✅ CORRECCIÓN v1.19.0: Preparar resultado CON SEPARACIÓN DE DUPLICADOS
            // ============================================================================
            resultado.put("filas_total", filasOk + filasError);
            resultado.put("filas_ok", filasOk);
            resultado.put("filas_error", filasError);
            resultado.put("filas_duplicadas", duplicados.size());
            resultado.put("filas_otros_errores", otros_errores.size());
            resultado.put("filas_deduplicadas_saltadas", dniDuplicadosSaltados.size());  // ✅ v2.2.0

            // Incluir ambas listas por separado
            resultado.put("duplicados", duplicados);
            resultado.put("otros_errores", otros_errores);
            resultado.put("errores", errores); // Mantener para compatibilidad (lista combinada)
            resultado.put("reporte_deduplicacion", reporteDeduplicacion);  // ✅ v2.2.0
            resultado.put("reporte_analisis_duplicados", reporteDuplicados);  // ✅ v2.2.0

            resultado.put("mensaje", String.format(
                "Importación completada: %d OK, %d saltados (KEEP_FIRST), %d duplicados, %d otros errores",
                filasOk, dniDuplicadosSaltados.size(), duplicados.size(), otros_errores.size()
            ));

        } catch (org.springframework.transaction.UnexpectedRollbackException e) {
            // CRÍTICO: Spring marcó la transacción como rollback-only
            // Devolver error sin intentar más operaciones
            log.error("❌ Transacción marcada como rollback-only: {}", e.getMessage());
            resultado.put("error", "Error en importación: " + (e.getCause() != null ? e.getCause().getMessage() : e.getMessage()));
            resultado.put("filas_ok", filasOk);
            resultado.put("filas_error", filasError);
            return resultado;
        } catch (IOException e) {
            log.error("Error al leer archivo Excel: ", e);
            resultado.put("error", "Error al procesar archivo Excel: " + e.getMessage());
            return resultado;
        } catch (Exception e) {
            log.error("Error inesperado en importación: ", e);
            resultado.put("error", "Error inesperado: " + e.getMessage());
            return resultado;
        }

        return resultado;
    }

    @Override
    public List<SolicitudBolsaDTO> listarTodas() {
        log.info("📊 [SolicitudBolsaServiceImpl] Obteniendo solicitudes con enriquecimiento (v2.1.0 - BD limpia)");
        // Obtiene solicitudes con JOIN a dim_tipos_bolsas
        List<Object[]> resultados = solicitudRepository.findAllWithBolsaDescription();
        log.info("📊 Total de resultados: {}", resultados.size());
        if (!resultados.isEmpty()) {
            Object[] primera = resultados.get(0);
            log.info("📊 Longitud del array: {}, Valor índice 24 (desc_ipress): {}, Valor índice 25 (desc_red): {}",
                primera.length, primera.length > 24 ? primera[24] : "N/A",
                primera.length > 25 ? primera[25] : "N/A");
        }
        return resultados.stream()
            .map(this::mapFromResultSet)
            .collect(java.util.stream.Collectors.toList());
    }

    /**
     * Mapea un Object[] de la consulta SQL nativa a SolicitudBolsaDTO
     * Índices (0-40): 
     * (0-19): Campos base solicitud + estado
     * (20-26): Estado gestión citas + auditoría
     * (27-29): Descripciones (IPRESS, Red, Macroregión)
     * (30-37): Asignación gestora + campos temporales + médico
     * (38-40): IPRESS - Atención (NEW v1.15.0)
     */
    private SolicitudBolsaDTO mapFromResultSet(Object[] row) {
        try {
            // Convertir fechas SQL a LocalDate/OffsetDateTime
            java.time.LocalDate fechaPreferida = convertToLocalDate(row[6]); // fecha_preferida_no_atendida
            java.time.LocalDate fechaNacimiento = convertToLocalDate(row[8]); // fecha_nacimiento

            // Extraer IPRESS (antes de enriquecimiento)
            String descIpress = (String) row[27]; // +1 por desc_estado_cita en idx 22
            String pacienteDni = (String) row[4];

            // 🔍 DEBUG: Loguear cuándo descIpress está en blanco
            if (isBlank(descIpress)) {
                log.warn("🔍 [ENRIQUECIMIENTO] ID {} DNI {} - descIpress ESTÁ EN BLANCO, buscando en asegurados",
                    row[0], pacienteDni);
            }

            // ✅ v1.68.0 - Enriquecimiento extendido: Si falta fecha_nacimiento o IPRESS, buscar en asegurados por DNI
            if ((fechaNacimiento == null || isBlank(descIpress)) && !isBlank(pacienteDni)) {
                try {
                    Optional<Asegurado> aseguradoOpt = aseguradoRepository.findByDocPaciente(pacienteDni);
                    if (aseguradoOpt.isPresent()) {
                        Asegurado asegurado = aseguradoOpt.get();

                        // Si no hay fecha_nacimiento en BD de solicitud, usar la del asegurado
                        if (fechaNacimiento == null && asegurado.getFecnacimpaciente() != null) {
                            fechaNacimiento = asegurado.getFecnacimpaciente();
                            log.info("✅ v1.68.0 - Fecha nacimiento completada desde tabla asegurados para DNI: {}", pacienteDni);
                        }

                        // Si no hay IPRESS, usar casAdscripcion del asegurado y buscar descripción
                        if (isBlank(descIpress) && !isBlank(asegurado.getCasAdscripcion())) {
                            String codigoIpress = asegurado.getCasAdscripcion().trim();
                            // Buscar IPRESS por código en dim_ipress
                            try {
                                Optional<Ipress> ipressOpt = ipressRepository.findByCodIpress(codigoIpress);
                                if (ipressOpt.isPresent()) {
                                    descIpress = ipressOpt.get().getDescIpress();
                                    log.info("✅ v1.68.0 - IPRESS completada desde asegurados (código: {}) -> descripción: {}", codigoIpress, descIpress);
                                } else {
                                    descIpress = codigoIpress; // Fallback al código
                                    log.warn("⚠️ v1.68.0 - No se encontró descripción para código IPRESS: {}", codigoIpress);
                                }
                            } catch (Exception e) {
                                log.warn("⚠️ Error buscando descripción de IPRESS para código {}: {}", codigoIpress, e.getMessage());
                                descIpress = codigoIpress; // Fallback al código
                            }
                        }
                    }
                } catch (Exception e) {
                    log.error("❌ Error enriqueciendo fecha_nacimiento/IPRESS para DNI {}: {}", pacienteDni, e.getMessage());
                }
            }

            Integer edad = calcularEdad(fechaNacimiento);

            java.time.OffsetDateTime fechaSolicitud = convertToOffsetDateTime(row[23]); // fecha_solicitud (ajustado +1 a 23)
            java.time.OffsetDateTime fechaActualizacion = convertToOffsetDateTime(row[24]); // fecha_actualizacion (ajustado +1 a 24)
            java.time.OffsetDateTime fechaAsignacion = row.length > 31 ? convertToOffsetDateTime(row[31]) : null; // NEW v2.4.0 (ajustado +1 a 31)
            java.time.OffsetDateTime fechaCambioEstado = row.length > 32 ? convertToOffsetDateTime(row[32]) : null; // NEW v3.3.1 (ajustado +1 a 32)

            // ✅ v1.67.0 - Extraer datos de contacto y enriquecerlos desde tabla de asegurados si es necesario
            String pacienteTelefono = (String) row[10];
            String pacienteTelefonoAlterno = (String) row[11];
            String pacienteEmail = (String) row[12];
            // pacienteDni ya fue extraído línea 551

            // Si falta teléfono o correo, buscar en tabla de asegurados por DNI
            boolean necesitaEnriquecimiento = (isBlank(pacienteTelefono) || isBlank(pacienteTelefonoAlterno) || isBlank(pacienteEmail)) && !isBlank(pacienteDni);
            if (necesitaEnriquecimiento) {
                log.info("🔍 v1.67.0 - Necesita enriquecimiento DNI: {} | Tel: [{}] | Email: [{}]", pacienteDni, pacienteTelefono, pacienteEmail);
                try {
                    Optional<Asegurado> aseguradoOpt = aseguradoRepository.findByDocPaciente(pacienteDni);
                    if (aseguradoOpt.isPresent()) {
                        Asegurado asegurado = aseguradoOpt.get();
                        log.info("✅ v1.67.0 - Enriqueciendo contacto para DNI {} desde tabla de asegurados", pacienteDni);

                        // Si no hay teléfono principal, usar celular del asegurado
                        if (isBlank(pacienteTelefono) && !isBlank(asegurado.getTelCelular())) {
                            log.debug("  📱 Teléfono principal: {} → {}", pacienteTelefono, asegurado.getTelCelular());
                            pacienteTelefono = asegurado.getTelCelular();
                        }
                        // Si no hay teléfono alterno, usar teléfono fijo del asegurado
                        if (isBlank(pacienteTelefonoAlterno) && !isBlank(asegurado.getTelFijo())) {
                            log.debug("  ☎️  Teléfono alterno: {} → {}", pacienteTelefonoAlterno, asegurado.getTelFijo());
                            pacienteTelefonoAlterno = asegurado.getTelFijo();
                        }
                        // Si no hay correo, usar correo del asegurado
                        if (isBlank(pacienteEmail) && !isBlank(asegurado.getCorreoElectronico())) {
                            log.debug("  📧 Correo: {} → {}", pacienteEmail, asegurado.getCorreoElectronico());
                            pacienteEmail = asegurado.getCorreoElectronico();
                        }
                    } else {
                        log.debug("⚠️ DNI {} no encontrado en tabla de asegurados", pacienteDni);
                    }
                } catch (Exception e) {
                    log.error("❌ Error enriqueciendo contacto para DNI {}: {}", pacienteDni, e.getMessage());
                }
            }

            // ✅ Extraer detalles de cita agendada (NEW v3.4.0 - índices correctos: 35, 36, 37)
            java.time.LocalDate fechaAtencion = row.length > 35 ? convertToLocalDate(row[35]) : null;
            java.time.LocalTime horaAtencion = null;
            if (row.length > 36 && row[36] != null) {
                try {
                    if (row[36] instanceof java.time.LocalTime) {
                        horaAtencion = (java.time.LocalTime) row[36];
                    } else if (row[36] instanceof java.sql.Time) {
                        horaAtencion = ((java.sql.Time) row[36]).toLocalTime();
                    } else if (row[36] instanceof String) {
                        horaAtencion = java.time.LocalTime.parse((String) row[36]);
                    }
                } catch (Exception e) {
                    log.warn("⚠️ Error parsing horaAtencion: {}", e.getMessage());
                }
            }
            Long idPersonal = row.length > 37 ? toLongSafe("id_personal", row[37]) : null;

            // ✅ v3.5.0 - Extraer condición médica y fecha atención médica (índices correctos: 38, 39)
            String condicionMedica = row.length > 38 ? (String) row[38] : null;
            java.time.OffsetDateTime fechaAtencionMedica = row.length > 39 ? convertToOffsetDateTime(row[39]) : null;

            // ✅ v3.6.0 - Nombre del médico asignado (índice 40)
            String nombreMedicoAsignado = null;
            if (row.length > 40 && row[40] instanceof String) {
                String val = (String) row[40];
                if (!val.isBlank()) nombreMedicoAsignado = val.trim();
            }

            // ✅ v1.15.0 - IPRESS - Atención (NEW EXCEL COLUMN - índices 41, 42, 43)
            Long idIpressAtencion = row.length > 41 ? toLongSafe("id_ipress_atencion", row[41]) : null;
            String codIpressAtencion = row.length > 42 ? (String) row[42] : null;
            String descIpressAtencion = row.length > 43 ? (String) row[43] : null;
            String nombreGestora = row.length > 44 ? (String) row[44] : null;

            return SolicitudBolsaDTO.builder()
                    .idSolicitud(toLongSafe("id_solicitud", row[0]))
                    .numeroSolicitud((String) row[1])
                    .pacienteId((String) row[2])
                    .pacienteNombre((String) row[3])
                    .pacienteDni(pacienteDni)
                    .especialidad((String) row[5])
                    .fechaPreferidaNoAtendida(fechaPreferida)
                    .tipoDocumento((String) row[7])
                    .fechaNacimiento(fechaNacimiento)
                    .pacienteSexo((String) row[9])
                    .pacienteTelefono(pacienteTelefono)
                    .pacienteTelefonoAlterno(pacienteTelefonoAlterno)
                    .pacienteEmail(pacienteEmail)
                    .pacienteEdad(edad)
                    .codigoIpressAdscripcion((String) row[13])
                    .tipoCita((String) row[14])
                    .idBolsa(toLongSafe("id_bolsa", row[15]))
                    .descTipoBolsa((String) row[16])
                    .idServicio(toLongSafe("id_servicio", row[17]))
                    .codigoAdscripcion((String) row[18])
                    .idIpress(row[19] != null ? toLongSafe("id_ipress", row[19]) : null)
                    .estado((String) row[20])
                    .codEstadoCita((String) row[21])      // NEW v1.41.1 - cod_estado_cita para filtro Estado
                    .descEstadoCita((String) row[22])     // NEW - desc_estado_cita desde JOIN dim_estados_gestion_citas
                    .fechaSolicitud(fechaSolicitud)
                    .fechaActualizacion(fechaActualizacion)
                    .estadoGestionCitasId(toLongSafe("estado_gestion_citas_id", row[25])) // ajustado +1 a 25
                    .activo((Boolean) row[26])             // ajustado +1 a 26
                    .descIpress(descIpress)                // desc_ipress enriquecida (v1.68.0: completada desde asegurados si es necesario)
                    .descRed((String) row[28])             // desc_red desde JOIN (ajustado +1 a 28)
                    .descMacroregion((String) row[29])     // desc_macro desde JOIN (ajustado +1 a 29)
                    .responsableGestoraId(row.length > 30 ? toLongSafe("responsable_gestora_id", row[30]) : null) // NEW v2.4.0 (ajustado +1 a 30)
                    .fechaAsignacion(fechaAsignacion)      // NEW v2.4.0 (ajustado +1 a 31)
                    .fechaCambioEstado(fechaCambioEstado)  // NEW v3.3.1 (ajustado +1 a 32)
                    .usuarioCambioEstadoId(row.length > 33 ? toLongSafe("usuario_cambio_estado_id", row[33]) : null) // NEW v3.3.1 (ajustado +1 a 33)
                    .nombreUsuarioCambioEstado(row.length > 34 ? (String) row[34] : null) // NEW v3.3.1 (ajustado +1 a 34)
                    .fechaAtencion(fechaAtencion)          // NEW v3.4.0 - fecha_atencion (índice 35)
                    .horaAtencion(horaAtencion)            // NEW v3.4.0 - hora_atencion (índice 36)
                    .idPersonal(idPersonal)                // NEW v3.4.0 - id_personal (índice 37)
                    .condicionMedica(condicionMedica)      // NEW v3.5.0 - condicion_medica (índice 38)
                    .fechaAtencionMedica(fechaAtencionMedica) // NEW v3.5.0 - fecha_atencion_medica (índice 39)
                    .nombreMedicoAsignado(nombreMedicoAsignado) // NEW v3.6.0 - nombre médico desde JOIN (índice 37)
                    .idIpressAtencion(idIpressAtencion)    // NEW v1.15.0 - id_ipress_atencion (índice 38)
                    .codIpressAtencion(codIpressAtencion)  // NEW v1.15.0 - cod_ipress_atencion (índice 39)
                    .descIpressAtencion(descIpressAtencion) // NEW v1.15.0 - desc_ipress_atencion (índice 40)
                    .nombreGestora(nombreGestora)           // nombre gestora desde JOIN dim_usuarios
                    .build();
        } catch (Exception e) {
            log.error("Error mapeando resultado SQL en índice. Error: {}", e.getMessage(), e);
            throw new RuntimeException("Error procesando fila de solicitud: " + e.getMessage(), e);
        }
    }

    /**
     * Convierte java.sql.Date o java.time.LocalDate a LocalDate
     * También maneja Instant y Timestamp desde queries con COALESCE
     */
    private java.time.LocalDate convertToLocalDate(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof java.time.LocalDate) {
            return (java.time.LocalDate) value;
        }
        if (value instanceof java.sql.Date) {
            return ((java.sql.Date) value).toLocalDate();
        }
        if (value instanceof java.time.Instant) {
            return ((java.time.Instant) value).atZone(java.time.ZoneId.systemDefault()).toLocalDate();
        }
        if (value instanceof java.sql.Timestamp) {
            return ((java.sql.Timestamp) value).toInstant().atZone(java.time.ZoneId.systemDefault()).toLocalDate();
        }
        throw new ClassCastException("No se puede convertir " + value.getClass().getName() + " a LocalDate");
    }

    /**
     * Convierte timestamps SQL a OffsetDateTime
     */
    private java.time.OffsetDateTime convertToOffsetDateTime(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof java.time.OffsetDateTime) {
            return (java.time.OffsetDateTime) value;
        }
        if (value instanceof java.sql.Timestamp) {
            return ((java.sql.Timestamp) value).toInstant().atOffset(java.time.ZoneOffset.UTC);
        }
        if (value instanceof java.time.Instant) {
            return ((java.time.Instant) value).atOffset(java.time.ZoneOffset.UTC);
        }
        throw new ClassCastException("No se puede convertir " + value.getClass().getName() + " a OffsetDateTime. Tipo: " + value.getClass().getSimpleName());
    }

    /**
     * Convierte un valor Object a Long de forma segura
     * Maneja tanto Number como String con logs detallados
     */
    private Long toLongSafe(String fieldName, Object value) {
        if (value == null) {
            return null;
        }
        try {
            if (value instanceof Number) {
                return ((Number) value).longValue();
            }
            if (value instanceof String) {
                String strValue = (String) value;
                if (strValue.isBlank()) {
                    return null;
                }
                return Long.parseLong(strValue);
            }
            log.error("❌ Campo '{}': tipo inesperado {} = {}", fieldName, value.getClass().getSimpleName(), value);
            throw new ClassCastException("Campo '" + fieldName + "': no se puede convertir " + value.getClass().getName() + " a Long. Valor: " + value);
        } catch (Exception e) {
            log.error("❌ Error convirtiendo campo '{}' a Long. Tipo: {}, Valor: {}, Error: {}", fieldName, value.getClass().getSimpleName(), value, e.getMessage());
            throw new RuntimeException("Error en campo " + fieldName + ": " + e.getMessage(), e);
        }
    }

    /**
     * ✅ v1.67.0 - Verifica si un string es null o está en blanco
     */
    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    /**
     * Calcula la edad a partir de fecha de nacimiento
     */
    private Integer calcularEdad(java.time.LocalDate fechaNacimiento) {
        if (fechaNacimiento == null) {
            return null;
        }
        return java.time.LocalDate.now().getYear() - fechaNacimiento.getYear();
    }

    @Override
    public Optional<SolicitudBolsaDTO> obtenerPorId(Long id) {
        return solicitudRepository.findById(id)
            .map(SolicitudBolsaMapper::toDTO);
    }

    @Override
    @Transactional
    public void asignarGestora(Long idSolicitud, Long idGestora) {
        log.info("🔄 Asignando gestora {} a solicitud {}", idGestora, idSolicitud);

        // 1️⃣ VALIDAR que la solicitud existe y está activa
        SolicitudBolsa solicitud = solicitudRepository.findById(idSolicitud)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Solicitud " + idSolicitud + " no encontrada"
            ));

        if (!solicitud.getActivo()) {
            throw new ValidationException("No se puede asignar gestora a solicitud inactiva");
        }

        // 2️⃣ VALIDAR que la gestora existe y tiene el rol correcto
        Usuario gestora = usuarioRepository.findById(idGestora)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Usuario " + idGestora + " no encontrado"
            ));

        // Verificar rol GESTOR DE CITAS
        boolean tieneRolGestora = gestora.getRoles().stream()
            .anyMatch(rol -> rol.getDescRol() != null && "GESTOR DE CITAS".equals(rol.getDescRol().toUpperCase()));

        if (!tieneRolGestora) {
            throw new ValidationException(
                "El usuario " + gestora.getNameUser() +
                " no tiene el rol GESTOR DE CITAS"
            );
        }

        // Verificar usuario activo
        if (gestora.getStatUser() == null || (!gestora.getStatUser().equalsIgnoreCase("A") && !gestora.getStatUser().equalsIgnoreCase("ACTIVO"))) {
            throw new ValidationException(
                "El usuario " + gestora.getNameUser() + " está inactivo"
            );
        }

        // 3️⃣ ACTUALIZAR asignación
        Long gestoraAnterior = solicitud.getResponsableGestoraId();
        solicitud.setResponsableGestoraId(idGestora);
        solicitud.setFechaAsignacion(java.time.OffsetDateTime.now());

        // 4️⃣ GUARDAR
        solicitudRepository.save(solicitud);

        // 5️⃣ LOG de operación
        if (gestoraAnterior != null && !gestoraAnterior.equals(idGestora)) {
            log.info("✅ Solicitud {} REASIGNADA: {} → {} ({})",
                idSolicitud, gestoraAnterior, idGestora, gestora.getNameUser());
        } else {
            log.info("✅ Solicitud {} ASIGNADA a gestora {} ({})",
                idSolicitud, idGestora, gestora.getNameUser());
        }
    }

    @Override
    @Transactional
    public int asignarGestoraMasivo(List<Long> ids, Long idGestora) {
        log.info("🔄 [BULK] Asignando gestora {} a {} solicitudes", idGestora, ids.size());

        if (ids == null || ids.isEmpty()) {
            throw new ValidationException("La lista de IDs no puede estar vacía");
        }

        // Validar que la gestora existe y tiene el rol correcto
        Usuario gestora = usuarioRepository.findById(idGestora)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Usuario " + idGestora + " no encontrado"
            ));

        boolean tieneRolGestora = gestora.getRoles().stream()
            .anyMatch(rol -> rol.getDescRol() != null && "GESTOR DE CITAS".equals(rol.getDescRol().toUpperCase()));

        if (!tieneRolGestora) {
            throw new ValidationException(
                "El usuario " + gestora.getNameUser() + " no tiene el rol GESTOR DE CITAS"
            );
        }

        if (gestora.getStatUser() == null || (!gestora.getStatUser().equalsIgnoreCase("A") && !gestora.getStatUser().equalsIgnoreCase("ACTIVO"))) {
            throw new ValidationException(
                "La gestora " + gestora.getNameUser() + " no está activa"
            );
        }

        int actualizados = solicitudRepository.asignarGestoraMasivo(ids, idGestora, java.time.OffsetDateTime.now());

        log.info("✅ [BULK] {} de {} solicitudes asignadas a gestora {} ({})",
            actualizados, ids.size(), idGestora, gestora.getNameUser());

        return actualizados;
    }

    @Override
    @Transactional
    public void eliminarAsignacionGestora(Long idSolicitud) {
        log.info("🗑️ Eliminando asignación de gestora en solicitud {}", idSolicitud);

        // Validar que la solicitud existe
        SolicitudBolsa solicitud = solicitudRepository.findById(idSolicitud)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Solicitud " + idSolicitud + " no encontrada"
            ));

        // Guardar info anterior para log
        Long gestoraAnterior = solicitud.getResponsableGestoraId();

        // Eliminar asignación (setear a null)
        solicitud.setResponsableGestoraId(null);
        solicitud.setFechaAsignacion(null);

        // Guardar
        solicitudRepository.save(solicitud);

        log.info("✅ Asignación de gestora eliminada en solicitud {} (Anterior: {})",
            idSolicitud, gestoraAnterior);
    }

    @Override
    @Transactional
    public void cambiarEstado(Long idSolicitud, Long nuevoEstadoId) {
        SolicitudBolsa solicitud = solicitudRepository.findById(idSolicitud)
            .orElseThrow(() -> new RuntimeException("Solicitud no encontrada"));

        solicitud.setEstadoGestionCitasId(nuevoEstadoId);

        // AUDITORIA: Registrar fecha y usuario del cambio de estado (v3.3.1)
        solicitud.setFechaCambioEstado(java.time.OffsetDateTime.now());

        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated()) {
                String username = auth.getName();
                Usuario usuario = usuarioRepository.findByNameUser(username)
                    .orElse(null);
                if (usuario != null) {
                    solicitud.setUsuarioCambioEstadoId(usuario.getIdUser());
                    log.info("Estado actualizado en solicitud {}: {} por usuario {}",
                        idSolicitud, nuevoEstadoId, username);
                } else {
                    log.warn("Usuario no encontrado para cambio de estado en solicitud {}", idSolicitud);
                }
            }
        } catch (Exception e) {
            log.warn("Error obteniendo usuario para auditoria de cambio de estado: {}", e.getMessage());
        }

        solicitudRepository.save(solicitud);
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
    @Transactional
    public int eliminarMultiples(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            log.warn("⚠️ Lista vacía de IDs para eliminar");
            return 0;
        }

        log.info("🗑️ Iniciando eliminación de {} solicitudes", ids.size());

        int totalBorrados = 0;
        List<String> erroresDetallados = new ArrayList<>();

        for (Long id : ids) {
            try {
                log.debug("   Procesando solicitud ID: {}", id);
                Optional<SolicitudBolsa> solicitud = solicitudRepository.findById(id);

                if (solicitud.isPresent()) {
                    SolicitudBolsa sol = solicitud.get();
                    log.debug("   Solicitud encontrada: numero={}, paciente={}", sol.getNumeroSolicitud(), sol.getPacienteNombre());

                    // Realizar el soft delete
                    sol.setActivo(false);
                    solicitudRepository.save(sol);

                    totalBorrados++;
                    log.debug("   ✓ Solicitud {} marcada como inactiva (soft delete)", id);
                } else {
                    String msg = "Solicitud " + id + " no encontrada";
                    log.warn("   ⚠️ {}", msg);
                    erroresDetallados.add(msg);
                }
            } catch (Exception e) {
                String msg = "Error eliminando solicitud " + id + ": " + e.getMessage();
                log.error("   ❌ {}", msg, e);
                erroresDetallados.add(msg);
                // Continuar con las siguientes incluso si esta falla
            }
        }

        log.info("✅ Eliminación completada: {} de {} solicitudes eliminadas exitosamente",
            totalBorrados, ids.size());

        if (!erroresDetallados.isEmpty()) {
            log.warn("⚠️ Se encontraron {} errores durante la eliminación:", erroresDetallados.size());
            for (String error : erroresDetallados) {
                log.warn("   - {}", error);
            }
        }

        return totalBorrados;
    }

    @Override
    @Transactional
    public int rechazarMasivo(List<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            log.warn("⚠️ Lista vacía de IDs para rechazar");
            return 0;
        }

        log.info("❌ Iniciando rechazo masivo de {} solicitudes", ids.size());

        com.styp.cenate.model.bolsas.DimEstadosGestionCitas estado =
            dimEstadosGestionCitasRepository.findByCodigoEstado("RECHAZADO")
                .orElseThrow(() -> new RuntimeException("Estado RECHAZADO no encontrado en BD"));

        int actualizados = solicitudRepository.cambiarEstadoMasivo(ids, estado.getIdEstado());

        log.info("✅ {} solicitudes marcadas como RECHAZADO", actualizados);
        return actualizados;
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
     * ✅ NO usa transacción separada - maneja excepciones sin relanzarlas
     *
     * @since v1.8.0
     */
    public SolicitudBolsa procesarFilaExcel(
            SolicitudBolsaExcelRowDTO row,
            Long idBolsa,
            Long idServicio,
            String usuarioCarga,
            Long idHistorial) {

        String pacienteIdGenerado = row.dni(); // El pacienteId es el DNI (pk_asegurado)
        String pacienteNombre = "Paciente " + row.dni();
        String especialidad = "";
        String codServicio = null;
        String codTipoBolsa = null;
        String descTipoBolsa = null;
        Long idIpress = null;
        Long idIpressAtencion = null;  // ✅ v1.15.0: FK a dim_ipress.id_ipress para IPRESS ATENCIÓN
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
        // ✅ CRÍTICO: Usar transacción separada (REQUIRES_NEW) para evitar rollback-only
        try {
            log.info("🔍 PASO 0: Sincronizando asegurado para DNI {}", row.dni());
            String nombreAsegurado = sincronizarAseguradoEnTransaccionSeparada(row);

            if (nombreAsegurado != null) {
                pacienteNombre = nombreAsegurado;
                pacienteIdGenerado = row.dni();
                log.info("✅ Asegurado sincronizado exitosamente: {} (DNI: {})", nombreAsegurado, row.dni());
            } else {
                // Fallback: intentar crear asegurado mínimo
                log.warn("⚠️  No se pudo sincronizar asegurado, intentando crear mínimo...");
                try {
                    boolean creado = crearAseguradoMinimo(row);
                    if (creado) {
                        pacienteIdGenerado = row.dni();
                        pacienteNombre = row.nombreCompleto() != null && !row.nombreCompleto().isBlank()
                                ? row.nombreCompleto()
                                : "Paciente " + row.dni();
                        log.info("✅ Asegurado mínimo creado para DNI {}", row.dni());
                    } else {
                        log.error("❌ No se pudo crear asegurado para DNI {}", row.dni());
                        pacienteNombre = row.nombreCompleto() != null && !row.nombreCompleto().isBlank()
                                ? row.nombreCompleto()
                                : "Paciente " + row.dni();
                        pacienteIdGenerado = row.dni();
                    }
                } catch (Exception fallbackEx) {
                    // CRÍTICO: Capturar excepción de fallback para no marcar la transacción principal
                    log.error("❌ Error en fallback de asegurado para DNI {}: {}", row.dni(), fallbackEx.getMessage());
                    pacienteNombre = row.nombreCompleto() != null && !row.nombreCompleto().isBlank()
                            ? row.nombreCompleto()
                            : "Paciente " + row.dni();
                    pacienteIdGenerado = row.dni();
                }
            }
        } catch (Exception e) {
            log.error("❌ Error procesando asegurado para DNI {}: {}", row.dni(), e.getMessage());
            // Usar valores por defecto para continuar
            pacienteNombre = row.nombreCompleto() != null && !row.nombreCompleto().isBlank()
                    ? row.nombreCompleto()
                    : "Paciente " + row.dni();
            pacienteIdGenerado = row.dni();
        }

        // 1. Obtener especialidad y código de servicio
        try {
            DimServicioEssi servicio = dimServicioEssiRepository.findById(idServicio).orElse(null);
            if (servicio != null) {
                especialidad = servicio.getDescServicio() != null ? servicio.getDescServicio() : "";
                codServicio = servicio.getCodServicio();
            }
        } catch (Exception e) {
            log.warn("No se pudo obtener especialidad para ID {}: {}", idServicio, e.getMessage());
        }

        // 2. Obtener datos del tipo de bolsa
        try {
            TipoBolsa tipoBolsa = tipoBolsaRepository.findById(idBolsa).orElse(null);
            if (tipoBolsa != null) {
                codTipoBolsa = tipoBolsa.getCodTipoBolsa();
                descTipoBolsa = tipoBolsa.getDescTipoBolsa();
            }
        } catch (Exception e) {
            log.warn("No se pudo obtener tipo de bolsa para ID {}: {}", idBolsa, e.getMessage());
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
            // ✅ CRÍTICO: Limpiar la sesión de Hibernate para prevenir "transaction aborted"
            try {
                entityManager.clear();
                log.debug("🧹 Sesión limpiada después de error al obtener IPRESS");
            } catch (Exception cleanupEx) {
                log.warn("⚠️ No se pudo limpiar sesión: {}", cleanupEx.getMessage());
            }
        }

        // 4. Obtener IPRESS ATENCIÓN desde código (columna posición 11 - v1.15.0 - OBLIGATORIO)
        // ⭐ IMPORTANTE: ipressAtencion es OBLIGATORIO en v1.15.0. Viene como código STRING de Excel, debe convertirse a FK Long
        try {
            if (row.ipressAtencion() != null && !row.ipressAtencion().isBlank()) {
                Ipress ipressAtencionEntity = ipressRepository.findByCodIpress(row.ipressAtencion()).orElse(null);
                if (ipressAtencionEntity != null) {
                    idIpressAtencion = ipressAtencionEntity.getIdIpress();
                    log.debug("✅ IPRESS ATENCIÓN encontrada: {} (código: {}, ID: {})", 
                        ipressAtencionEntity.getDescIpress(), row.ipressAtencion(), idIpressAtencion);
                } else {
                    log.error("❌ IPRESS ATENCIÓN OBLIGATORIA no encontrada para código {}", row.ipressAtencion());
                }
            } else {
                log.error("❌ IPRESS ATENCIÓN OBLIGATORIA está vacía para esta fila - RECHAZADA (v1.15.0)");
            }
        } catch (Exception e) {
            log.error("❌ Error al obtener IPRESS ATENCIÓN OBLIGATORIA para código {}: {}", row.ipressAtencion(), e.getMessage());
            try {
                entityManager.clear();
            } catch (Exception cleanupEx) {
                log.warn("⚠️ No se pudo limpiar sesión después de error IPRESS ATENCIÓN: {}", cleanupEx.getMessage());
            }
        }

        return SolicitudBolsa.builder()
            .numeroSolicitud(encontrarNumeroSolicitudDisponible(5))  // ✅ FIX: Pre-valida 5 candidatos
            .pacienteDni(row.dni())
            .pacienteId(pacienteIdGenerado)
            .pacienteNombre(pacienteNombre)
            .idBolsa(idBolsa)
            .idServicio(idServicio)
            .codigoAdscripcion(row.codigoIpress())
            .idIpress(idIpress)
            .idIpressAtencion(idIpressAtencion)  // ✅ v1.15.0: IPRESS ATENCIÓN - FK a dim_ipress.id_ipress
            .idCargaExcel(idHistorial)  // ✅ Guardar ID de la carga Excel
            .estado("PENDIENTE")
            .estadoGestionCitasId(11L)  // ✅ ID 11: Estado "Pendiente Cita" en dim_estados_gestion_citas
            .activo(true)
            .condicionMedica(null)  // 🟢 v1.69.0: condicion_medica permanece null hasta que médico asigne
            // ============================================================================
            // 📋 LOS 12 CAMPOS DE EXCEL v1.15.0 - ASIGNADOS AL BUILDER
            // ============================================================================
            .fechaPreferidaNoAtendida(fechaPreferida)
            .tipoDocumento(row.tipoDocumento())
            .fechaNacimiento(fechaNacimiento)
            .pacienteSexo(row.sexo())
            .pacienteTelefono(row.telefonoPrincipal())
            .pacienteTelefonoAlterno(row.telefonoAlterno())
            .pacienteEmail(row.correo())
            .codigoIpressAdscripcion(row.codigoIpress())
            // v1.60.0: Default "Voluntaria" para Bolsa 107 si tipoCita viene null
            .tipoCita(row.tipoCita() != null && !row.tipoCita().isBlank() ? row.tipoCita() : "Voluntaria")
            .especialidad(especialidad)
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
     * NUEVO v1.18.3: Manejo de archivos con columnas desalineadas
     *
     * Problema Pediatría22: Archivo tiene 11 columnas visibles pero CORREO está vacía
     * Resultado: POI lee 10 columnas físicas, COD_IPRESS aparece en posición 8,
     * TIPO_CITA aparece en posición 9 en lugar de 10
     *
     * @param row Fila de Excel a procesar
     * @param filaNumero Número de fila (para logs)
     * @return Map con 11 campos extraídos
     */
    private Map<String, String> extraerCamposInteligentemente(Row row, int filaNumero) {
        Map<String, String> campos = new HashMap<>();

        // Leer todas las celdas disponibles
        String[] valores = new String[15];
        for (int i = 0; i < 15; i++) {
            valores[i] = obtenerValorCelda(row.getCell(i));
        }

        // Detectar TIPO_CITA para identificar posición real (puede estar en posición 10, 11 o 12)
        int tipoCitaPos = -1;
        for (int i = 9; i <= 12; i++) {
            String val = valores[i].toLowerCase().trim();
            if (val.equals("recita") || val.equals("interconsulta") ||
                val.equals("voluntaria") || val.equals("referencia")) {
                tipoCitaPos = i;
                break;
            }
        }

        // Mapear campos según posición detectada de TIPO_CITA
        String fechaPreferidaNoAtendida, tipoDocumento, dni, nombreCompleto, sexo,
               fechaNacimiento, telefonoPrincipal, telefonoAlterno, correo,
               codigoIpress, ipressAtencion, tipoCita;

        // ============================================================================
        // v1.15.0: Estructura con 12 campos (IPRESS ATENCIÓN es nuevo en posición 10)
        // ============================================================================
        if (tipoCitaPos == 11) {
            // Caso normal: 12 columnas correctamente alineadas (v1.15.0)
            fechaPreferidaNoAtendida = valores[0];
            tipoDocumento = valores[1];
            dni = valores[2];
            nombreCompleto = valores[3];
            sexo = valores[4];
            fechaNacimiento = valores[5];
            telefonoPrincipal = valores[6];
            telefonoAlterno = valores[7];
            correo = valores[8];
            codigoIpress = valores[9];
            ipressAtencion = valores[10];  // v1.15.0: Nueva posición 10
            tipoCita = valores[11];
            log.info("✅ [FILA {}] TIPO_CITA detectado en posición 11 (formato standard 12 columnas con IPRESS ATENCIÓN)",
                filaNumero);
        } else if (tipoCitaPos == 10) {
            // Caso fallback: 11 columnas (sin IPRESS ATENCIÓN) - compatibilidad hacia atrás
            fechaPreferidaNoAtendida = valores[0];
            tipoDocumento = valores[1];
            dni = valores[2];
            nombreCompleto = valores[3];
            sexo = valores[4];
            fechaNacimiento = valores[5];
            telefonoPrincipal = valores[6];
            telefonoAlterno = valores[7];
            correo = valores[8];
            codigoIpress = valores[9];
            ipressAtencion = "";  // Vacío si no está presente (v1.14.0 o anterior)
            tipoCita = valores[10];
            log.info("✅ [FILA {}] TIPO_CITA detectado en posición 10 (formato legacy 11 columnas sin IPRESS ATENCIÓN)",
                filaNumero);
        } else {
            // Fallback: asumir formato 12 columnas estándar (v1.15.0)
            fechaPreferidaNoAtendida = valores[0];
            tipoDocumento = valores[1];
            dni = valores[2];
            nombreCompleto = valores[3];
            sexo = valores[4];
            fechaNacimiento = valores[5];
            telefonoPrincipal = valores[6];
            telefonoAlterno = valores[7];
            correo = valores[8];
            codigoIpress = valores[9];
            ipressAtencion = valores[10];  // v1.15.0
            tipoCita = valores[11];
            log.warn("⚠️  [FILA {}] TIPO_CITA no detectado en posiciones 10-11 (usando default pos 11). Valores: {}",
                filaNumero, String.join(", ", valores));
        }

        log.debug("📋 [FILA {}] DNI={}, Nombres={}, TipoCita={}, IpressAtencion={}",
            filaNumero, dni, nombreCompleto, tipoCita, ipressAtencion);

        // ============================================================================
        // 🔧 NORMALIZAR CÓDIGOS IPRESS A 3 DÍGITOS (21 → 021)
        // ============================================================================
        if (codigoIpress != null && !codigoIpress.isBlank()) {
            try {
                int codigo = Integer.parseInt(codigoIpress.trim());
                codigoIpress = String.format("%03d", codigo);
            } catch (NumberFormatException e) {
                log.warn("⚠️ Código IPRESS ADSCRIPCIÓN no numérico: {}", codigoIpress.trim());
            }
        }

        // Normalizar IPRESS ATENCIÓN (v1.15.0)
        if (ipressAtencion != null && !ipressAtencion.isBlank()) {
            try {
                int codigo = Integer.parseInt(ipressAtencion.trim());
                ipressAtencion = String.format("%03d", codigo);
            } catch (NumberFormatException e) {
                log.warn("⚠️ Código IPRESS ATENCIÓN no numérico: {}", ipressAtencion.trim());
            }
        }

        // Llenar el mapa (12 campos para v1.15.0)
        campos.put("fechaPreferidaNoAtendida", fechaPreferidaNoAtendida);
        campos.put("tipoDocumento", tipoDocumento);
        campos.put("dni", dni);
        campos.put("nombreCompleto", nombreCompleto);
        campos.put("sexo", sexo);
        campos.put("fechaNacimiento", fechaNacimiento);
        campos.put("telefonoPrincipal", telefonoPrincipal);
        campos.put("telefonoAlterno", telefonoAlterno);
        campos.put("correo", correo);
        campos.put("codigoIpress", codigoIpress);
        campos.put("ipressAtencion", ipressAtencion);  // v1.15.0: Nuevo campo
        campos.put("tipoCita", tipoCita);

        return campos;
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

    /**
     * Sincroniza asegurados desde dim_solicitud_bolsa
     * Ejecuta el SP sincronizar_asegurados_desde_bolsas() en BD
     * Crea nuevos asegurados y actualiza teléfono/correo
     */
    @Override
    @Transactional
    public Map<String, Object> sincronizarAseguradosDesdebolsas() {
        log.info("🔄 Iniciando sincronización de asegurados desde dim_solicitud_bolsa...");

        Map<String, Object> resultado = new HashMap<>();

        try {
            // Los triggers automáticos en BD mantienen la sincronización
            // No necesitamos ejecutar SP manualmente ya que los triggers se encargan
            log.info("✅ Sincronización completada automáticamente por trigger");

            // Contar asegurados en BD
            long totalAsegurados = aseguradoRepository.count();

            resultado.put("estado", "exito");
            resultado.put("mensaje", "Sincronización completada. Los triggers automáticos mantienen la BD actualizada");
            resultado.put("total_asegurados_bd", totalAsegurados);
            resultado.put("ultimo_sincronizado", java.time.LocalDateTime.now());

            log.info("✅ Resultado sincronización: {}", resultado);

        } catch (Exception e) {
            log.error("❌ Error en sincronización: {}", e.getMessage(), e);
            resultado.put("estado", "error");
            resultado.put("mensaje", "Error en sincronización: " + e.getMessage());
            resultado.put("error", e.toString());
        }

        return resultado;
    }

    /**
     * Obtiene asegurados sincronizados recientemente (últimas 24 horas)
     * Busca solicitudes nuevas que tengan asegurados vinculados
     */
    @Override
    public List<Map<String, Object>> obtenerAseguradosSincronizadosReciente() {
        log.info("🔍 Buscando asegurados sincronizados en las últimas 24 horas...");

        List<Map<String, Object>> aseguradosSincronizados = new ArrayList<>();

        try {
            // Obtener solicitudes del último día que tengan asegurados vinculados
            java.time.OffsetDateTime hace24Horas = java.time.OffsetDateTime.now().minusHours(24);

            List<SolicitudBolsa> solicitudesRecientes = solicitudRepository.findAll().stream()
                .filter(s -> s.getActivo() == true &&
                            s.getPacienteDni() != null &&
                            s.getFechaSolicitud() != null &&
                            s.getFechaSolicitud().isAfter(hace24Horas) &&
                            !s.getPacienteNombre().startsWith("Paciente "))
                .toList();

            Set<String> dnisProcesados = new HashSet<>();

            for (SolicitudBolsa solicitud : solicitudesRecientes) {
                String dni = solicitud.getPacienteDni();

                // Evitar duplicados
                if (dnisProcesados.contains(dni)) {
                    continue;
                }
                dnisProcesados.add(dni);

                // Obtener asegurado de BD
                java.util.Optional<Asegurado> asegurado = aseguradoRepository.findByDocPaciente(dni);

                if (asegurado.isPresent()) {
                    Asegurado a = asegurado.get();
                    aseguradosSincronizados.add(Map.of(
                        "dni", a.getPkAsegurado(),
                        "nombre", a.getPaciente() != null ? a.getPaciente() : "N/A",
                        "telefono", a.getTelCelular() != null ? a.getTelCelular() : "N/A",
                        "correo", a.getCorreoElectronico() != null ? a.getCorreoElectronico() : "N/A",
                        "sexo", a.getSexo() != null ? a.getSexo() : "N/A",
                        "fecha_nacimiento", a.getFecnacimpaciente() != null ? a.getFecnacimpaciente().toString() : "N/A",
                        "estado", "Sincronizado",
                        "fecha_ultima_solicitud", solicitud.getFechaSolicitud().toString()
                    ));
                }
            }

            log.info("✅ Se encontraron {} asegurados sincronizados recientemente", aseguradosSincronizados.size());

        } catch (Exception e) {
            log.error("❌ Error obteniendo asegurados sincronizados: {}", e.getMessage(), e);
        }

        return aseguradosSincronizados;
    }

    /**
     * ============================================================================
     * 🔧 CORRECCIÓN #1: VALIDACIÓN DE TELÉFONOS
     * ============================================================================
     * Valida que los teléfonos cumplan el formato permitido
     * Solo: números, +, (), -, espacios
     *
     * @param filaNumero número de fila en el Excel (para logs)
     * @param telefonoPrincipal teléfono principal a validar
     * @param telefonoAlterno teléfono alterno a validar
     * @throws IllegalArgumentException si algún teléfono tiene formato inválido
     */
    private void validarTelefonos(int filaNumero, String telefonoPrincipal, String telefonoAlterno) {
        // Validar teléfono principal
        if (telefonoPrincipal != null && !telefonoPrincipal.isBlank()) {
            if (!telefonoPrincipal.matches(PHONE_PATTERN)) {
                String error = "Fila " + filaNumero + ": " + PHONE_VALIDATION_ERROR +
                              " | Valor: '" + telefonoPrincipal + "'";
                log.error("❌ {}", error);
                throw new IllegalArgumentException(error);
            }
        }

        // Validar teléfono alterno
        if (telefonoAlterno != null && !telefonoAlterno.isBlank()) {
            if (!telefonoAlterno.matches(PHONE_PATTERN)) {
                String error = "Fila " + filaNumero + ": " + PHONE_VALIDATION_ERROR +
                              " | Valor: '" + telefonoAlterno + "'";
                log.error("❌ {}", error);
                throw new IllegalArgumentException(error);
            }
        }

        log.debug("✅ [FILA {}] Validación de teléfonos OK | Principal: {} | Alterno: {}",
            filaNumero, telefonoPrincipal, telefonoAlterno);
    }

    /**
     * ============================================================================
     * 🔧 CORRECCIÓN #2: DETECCIÓN DE DUPLICADOS
     * ============================================================================
     * Detecta si una solicitud ya existe antes de intentar guardarla
     * Verifica constraint: (id_bolsa, paciente_id, id_servicio)
     *
     * @param filaNumero número de fila en el Excel (para logs)
     * @param idBolsa ID de la bolsa
     * @param solicitud solicitud a verificar
     * @param errores lista de errores para agregrar si hay duplicado
     * @return true si hay duplicado, false si es nueva
     */
    /**
     * ✅ CORRECCIÓN v1.19.0: Detecta duplicados y retorna información estructurada
     * @return null si no hay duplicado, o Map con detalles del duplicado
     */
    private Map<String, Object> detectarDuplicado(int filaNumero, Long idBolsa,
                                                   SolicitudBolsa solicitud,
                                                   DimServicioEssi servicio) {
        try {
            // ============================================================================
            // ✅ Solo detectar solicitudes ACTIVAS
            // Permite reusar pacientes de registros soft-deleted (activo=false)
            // ============================================================================
            boolean existeDuplicado = solicitudRepository.existsByIdBolsaAndPacienteIdAndIdServicioAndActivoTrue(
                idBolsa,
                solicitud.getPacienteId(),
                solicitud.getIdServicio()
            );

            if (existeDuplicado) {
                log.warn("⚠️  [FILA {}] Solicitud DUPLICADA detectada | Paciente: {} | Especialidad: {}",
                    filaNumero, solicitud.getPacienteDni(), solicitud.getEspecialidad());

                // Retornar map con detalles del duplicado
                return Map.of(
                    "fila", filaNumero,
                    "dni", solicitud.getPacienteDni(),
                    "paciente", solicitud.getPacienteNombre(),
                    "especialidad", solicitud.getEspecialidad(),
                    "ipress", solicitud.getCodigoIpressAdscripcion(),
                    "razon", "Ya existe solicitud para este paciente + especialidad en esta bolsa"
                );
            }

            log.debug("✅ [FILA {}] Verificación de duplicados OK - solicitud es nueva", filaNumero);
            return null; // No hay duplicado

        } catch (Exception e) {
            log.warn("⚠️  [FILA {}] Advertencia al detectar duplicados: {} | Continuando...",
                filaNumero, e.getMessage());
            return null; // Si hay error, permitir que continúe
        }
    }

    /**
     * ============================================================================
     * 🔧 CORRECCIÓN #3: MANEJO DE CONSTRAINT UNIQUE CON UPDATE FALLBACK
     * ============================================================================
     * Intenta actualizar una solicitud existente cuando se detecta
     * violación de constraint unique (solicitud_paciente_unique)
     *
     * @param idBolsa ID de la bolsa
     * @param nuevaSolicitud solicitud con los nuevos datos
     * @return true si se actualizó exitosamente, false si no se encontró la solicitud
     */
    private boolean intentarActualizarSolicitudExistente(Long idBolsa, SolicitudBolsa nuevaSolicitud) {
        try {
            // Buscar solicitud existente con misma (id_bolsa, paciente_id, id_servicio)
            List<SolicitudBolsa> existentes = solicitudRepository.findByIdBolsaAndPacienteIdAndIdServicio(
                idBolsa,
                nuevaSolicitud.getPacienteId(),
                nuevaSolicitud.getIdServicio()
            );

            if (existentes.isEmpty()) {
                log.warn("⚠️  No se encontró solicitud existente para UPDATE. Bolsa: {}, Paciente: {}, Servicio: {}",
                    idBolsa, nuevaSolicitud.getPacienteId(), nuevaSolicitud.getIdServicio());
                return false;
            }

            // Actualizar la primera solicitud encontrada
            SolicitudBolsa solicitudExistente = existentes.get(0);

            log.info("🔄 Actualizando solicitud existente ID: {}", solicitudExistente.getIdSolicitud());

            // Actualizar solo los campos que cambiaron
            boolean cambios = false;

            // Actualizar teléfono principal
            if (nuevaSolicitud.getPacienteTelefono() != null &&
                !nuevaSolicitud.getPacienteTelefono().equals(solicitudExistente.getPacienteTelefono())) {
                String anterior = solicitudExistente.getPacienteTelefono();
                solicitudExistente.setPacienteTelefono(nuevaSolicitud.getPacienteTelefono());
                log.info("📱 [UPDATE TEL_PRINCIPAL] {}: '{}' → '{}'",
                    solicitudExistente.getPacienteDni(), anterior, nuevaSolicitud.getPacienteTelefono());
                cambios = true;
            }

            // Actualizar teléfono alterno
            if (nuevaSolicitud.getPacienteTelefonoAlterno() != null &&
                !nuevaSolicitud.getPacienteTelefonoAlterno().equals(solicitudExistente.getPacienteTelefonoAlterno())) {
                String anterior = solicitudExistente.getPacienteTelefonoAlterno();
                solicitudExistente.setPacienteTelefonoAlterno(nuevaSolicitud.getPacienteTelefonoAlterno());
                log.info("📱 [UPDATE TEL_ALTERNO] {}: '{}' → '{}'",
                    solicitudExistente.getPacienteDni(), anterior, nuevaSolicitud.getPacienteTelefonoAlterno());
                cambios = true;
            }

            // Actualizar correo
            if (nuevaSolicitud.getPacienteEmail() != null &&
                !nuevaSolicitud.getPacienteEmail().equals(solicitudExistente.getPacienteEmail())) {
                String anterior = solicitudExistente.getPacienteEmail();
                solicitudExistente.setPacienteEmail(nuevaSolicitud.getPacienteEmail());
                log.info("📧 [UPDATE CORREO] {}: '{}' → '{}'",
                    solicitudExistente.getPacienteDni(), anterior, nuevaSolicitud.getPacienteEmail());
                cambios = true;
            }

            // Actualizar fecha de nacimiento si no existe
            if (solicitudExistente.getFechaNacimiento() == null &&
                nuevaSolicitud.getFechaNacimiento() != null) {
                solicitudExistente.setFechaNacimiento(nuevaSolicitud.getFechaNacimiento());
                log.info("[UPDATE FECHA_NAC] {}: {}",
                    solicitudExistente.getPacienteDni(), nuevaSolicitud.getFechaNacimiento());
                cambios = true;
            }

            if (cambios) {
                solicitudRepository.save(solicitudExistente);
                log.info("[UPDATE COMPLETADO] Solicitud {} actualizada con nuevos datos",
                    solicitudExistente.getIdSolicitud());
                return true;
            } else {
                log.info("[UPDATE] No hay cambios en solicitud {}", solicitudExistente.getIdSolicitud());
                return true; // Considerar como éxito porque la solicitud existe
            }

        } catch (Exception e) {
            log.error("❌ Error al intentar actualizar solicitud: {}", e.getMessage(), e);
            return false;
        }
    }

    /**
     * Normaliza DNI para garantizar exactamente 8 dígitos
     *
     * FUNCIONALIDAD v1.16.1 - Normalización de DNIs:
     * - Si tiene 9+ dígitos: toma los primeros 8
     * - Si tiene menos de 8: padding con ceros a la izquierda
     * - Remueve caracteres especiales (espacios, guiones, puntos)
     * - Ejemplo: "195681662" (9) → "19568166" (8)
     *
     * @param dniOriginal DNI posiblemente mal formateado
     * @return DNI normalizado con exactamente 8 dígitos
     */
    private String normalizarDNI(String dniOriginal) {
        if (dniOriginal == null || dniOriginal.isBlank()) {
            return "";
        }

        // Remover caracteres especiales (espacios, guiones, puntos, etc)
        String dniLimpio = dniOriginal.replaceAll("[^0-9]", "");

        if (dniLimpio.isEmpty()) {
            log.warn("⚠ DNI inválido después de normalización: '{}'", dniOriginal);
            return dniOriginal;
        }

        // Si tiene MÁS de 8 dígitos: tomar los primeros 8
        if (dniLimpio.length() > 8) {
            String dniNormalizado = dniLimpio.substring(0, 8);
            log.info("🔄 [NORMALIZACIÓN DNI] '{}' ({} dígitos) → '{}' (8 dígitos)",
                dniOriginal, dniLimpio.length(), dniNormalizado);
            return dniNormalizado;
        }

        // Si tiene MENOS de 8 dígitos: padding con ceros a la izquierda
        if (dniLimpio.length() < 8) {
            String dniNormalizado = String.format("%8s", dniLimpio).replace(' ', '0');
            log.info("🔄 [NORMALIZACIÓN DNI] '{}' ({} dígitos) → '{}' (8 dígitos con padding)",
                dniOriginal, dniLimpio.length(), dniNormalizado);
            return dniNormalizado;
        }

        // Si ya tiene exactamente 8: retornar limpio
        log.info("✓ [NORMALIZACIÓN DNI] '{}' ya estaba correcto (8 dígitos)", dniOriginal);
        return dniLimpio;
    }

    /**
     * Enriquece datos de SEXO y FECHA_NACIMIENTO desde la tabla de asegurados
     * Si estos campos estan vacios en Excel, los obtiene de la BD
     *
     * FUNCIONALIDAD INTELIGENTE v1.16.1:
     * - Si DNI existe en asegurados: usa datos de BD para campos vacios
     * - Si DNI no existe en asegurados: permite si Excel tiene SEXO y F.NAC completos
     *
     * @param dni DNI del paciente a buscar
     * @param sexoExcel sexo del Excel (puede ser null/blank)
     * @param fechaNacimientoExcel fecha de nacimiento del Excel (puede ser null/blank)
     * @return Map con: sexo, fechaNacimiento, existe (boolean)
     */
    private Map<String, Object> enriquecerDatosDesdeAsegurado(String dni, String sexoExcel, String fechaNacimientoExcel) {
        Map<String, Object> resultado = new HashMap<>();
        resultado.put("sexo", sexoExcel != null && !sexoExcel.isBlank() ? sexoExcel : "");
        resultado.put("fechaNacimiento", fechaNacimientoExcel != null && !fechaNacimientoExcel.isBlank() ? fechaNacimientoExcel : "");
        resultado.put("existe", false);

        try {
            // Buscar asegurado en BD
            java.util.Optional<Asegurado> aseguradoOpt = aseguradoRepository.findByDocPaciente(dni);

            if (aseguradoOpt.isPresent()) {
                Asegurado asegurado = aseguradoOpt.get();
                resultado.put("existe", true);

                // Si SEXO esta vacio en Excel, usar de BD
                if ((sexoExcel == null || sexoExcel.isBlank()) && asegurado.getSexo() != null) {
                    resultado.put("sexo", asegurado.getSexo());
                    log.info("📊 [ENRIQUECIMIENTO] SEXO completado desde asegurados para DNI {}: {}", dni, asegurado.getSexo());
                }

                // Si FECHA_NACIMIENTO esta vacia en Excel, usar de BD
                if ((fechaNacimientoExcel == null || fechaNacimientoExcel.isBlank()) && asegurado.getFecnacimpaciente() != null) {
                    // Convertir java.time.LocalDate a String (YYYY-MM-DD)
                    resultado.put("fechaNacimiento", asegurado.getFecnacimpaciente().toString());
                    log.info("📅 [ENRIQUECIMIENTO] FECHA_NACIMIENTO completada desde asegurados para DNI {}: {}",
                        dni, asegurado.getFecnacimpaciente());
                }

                log.info("✓ [ENRIQUECIMIENTO EXITOSO] DNI {} existe en asegurados | Sexo: {} | F.Nac: {}",
                    dni, resultado.get("sexo"), resultado.get("fechaNacimiento"));
            } else {
                log.warn("⚠ [ENRIQUECIMIENTO] DNI {} NO EXISTE en tabla asegurados", dni);
                resultado.put("existe", false);
            }
        } catch (Exception e) {
            log.error("ERROR al enriquecer datos para DNI {}: {}", dni, e.getMessage());
            resultado.put("existe", false);
        }

        return resultado;
    }

    /**
     * ============================================================================
     * 🔧 MANEJO INTELIGENTE DE ERRORES DE INTEGRIDAD - v1.17.0
     * ============================================================================
     * Detecta tipo de error y proporciona:
     * 1. Mensaje en español claro para el usuario
     * 2. Auto-creación de asegurados para errores FOREIGN KEY
     * 3. Reintentos de inserción si es posible
     *
     * @param filaNumero número de fila en Excel
     * @param rowDTO datos de la fila
     * @param e excepción de integridad
     * @return mensaje de error en español para mostrar al usuario
     */
    private String manejarErrorIntegridad(int filaNumero, SolicitudBolsaExcelRowDTO rowDTO,
                                         org.springframework.dao.DataIntegrityViolationException e) {
        String mensajeError = e.getMessage() != null ? e.getMessage() : "Error desconocido";
        String errorEnEspanol = "Error de integridad desconocido";

        try {
            // ========================================================================
            // 1️⃣ DETECCIÓN: Error FOREIGN KEY (paciente no existe)
            // ========================================================================
            if (mensajeError.contains("fk_solicitud_asegurado") ||
                mensajeError.contains("violates foreign key constraint") ||
                mensajeError.contains("paciente_id")) {

                log.error("❌ [FILA {}] FOREIGN KEY error detectado - El asegurado con DNI {} no existe",
                    filaNumero, rowDTO.dni());
                log.info("   (Este error NO debería ocurrir - el asegurado debería haberse creado en etapa anterior)");

                errorEnEspanol = "El paciente con DNI " + rowDTO.dni() +
                               " no existe en la base de datos y no se pudo crear automáticamente. " +
                               "Intente de nuevo o contacte al administrador si el problema persiste.";
                return errorEnEspanol;
            }

            // ========================================================================
            // 2️⃣ DETECCIÓN: Error UNIQUE/DUPLICATE (solicitud ya existe)
            // ========================================================================
            if (mensajeError.contains("unique constraint") ||
                mensajeError.contains("UNIQUE violation") ||
                mensajeError.contains("solicitud_paciente_unique") ||
                mensajeError.contains("duplicate") ||
                mensajeError.contains("Duplicate")) {

                log.warn("⚠️  [FILA {}] Constraint UNIQUE detectado - solicitud duplicada", filaNumero);
                errorEnEspanol = "DUPLICADO: El paciente con DNI " + rowDTO.dni() +
                               " ya existe en esta bolsa. No se puede cargar dos veces.";
                return errorEnEspanol;
            }

            // ========================================================================
            // 3️⃣ DETECCIÓN: Error NOT NULL (campo requerido faltante)
            // ========================================================================
            if (mensajeError.contains("NOT NULL") || mensajeError.contains("null")) {
                log.warn("⚠️  [FILA {}] Campo requerido (NOT NULL) faltante", filaNumero);

                if (mensajeError.contains("paciente_nombre") || mensajeError.contains("nombre")) {
                    errorEnEspanol = "Campo NOMBRE está vacío y no se pudo enriquecer desde la base de datos.";
                } else if (mensajeError.contains("fecha_preferida") || mensajeError.contains("fechaPreferida")) {
                    errorEnEspanol = "Campo FECHA PREFERIDA QUE NO FUE ATENDIDA está vacío.";
                } else if (mensajeError.contains("tipo_cita")) {
                    errorEnEspanol = "Campo TIPO DE CITA está vacío o inválido.";
                } else {
                    errorEnEspanol = "Campo requerido está vacío en la fila " + filaNumero + ".";
                }
                return errorEnEspanol;
            }

            // ========================================================================
            // 4️⃣ DETECCIÓN: Error CHECK constraint (validación de valores)
            // ========================================================================
            if (mensajeError.contains("check constraint") || mensajeError.contains("CHECK") ||
                mensajeError.contains("violates check")) {

                log.warn("⚠️  [FILA {}] Violación de CHECK constraint", filaNumero);
                errorEnEspanol = "Los datos en la fila " + filaNumero +
                               " violan una restricción de validación. Revise TIPO_CITA o campos numéricos.";
                return errorEnEspanol;
            }

            // ========================================================================
            // 5️⃣ DETECCIÓN: Error de referencia IPRESS (código de adscripción)
            // ========================================================================
            if (mensajeError.contains("ipress") || mensajeError.contains("cod_ipress")) {
                log.warn("⚠️  [FILA {}] Error IPRESS - código de adscripción inválido", filaNumero);
                errorEnEspanol = "El código de IPRESS ADSCRIPCIÓN '" + rowDTO.codigoIpress() +
                               "' no existe en la base de datos. Verifique el código.";
                return errorEnEspanol;
            }

            // ========================================================================
            // 6️⃣ FALLBACK: Mensaje genérico con instrucciones
            // ========================================================================
            log.error("❌ [FILA {}] Error de integridad sin clasificar: {}", filaNumero, mensajeError);
            errorEnEspanol = "Error de base de datos en fila " + filaNumero + ". " +
                           "Tipo: " + extraerTipoError(mensajeError) +
                           ". Contacte al administrador si el problema persiste.";
            return errorEnEspanol;

        } catch (Exception ex) {
            log.error("❌ Error procesando exception handler para fila {}: {}", filaNumero, ex.getMessage());
            return "Error inesperado procesando fila " + filaNumero + ". Contacte al administrador.";
        }
    }

    /**
     * Crea un asegurado mínimo con los datos disponibles del Excel
     * Se usa cuando el asegurado no existe en BD y hay FOREIGN KEY error
     *
     * CRÍTICO: Usa REQUIRES_NEW para no propagar errores de transacción al padre
     *
     * @param rowDTO fila de Excel con datos del paciente
     * @return true si se creó exitosamente, false en caso de error
     */
    /**
     * Sincroniza asegurado en transacción separada (REQUIRES_NEW)
     * Evita que errores de asegurado marquen la transacción principal como rollback-only
     *
     * @param rowDTO fila de Excel
     * @return nombre del paciente (obtenido o creado), o null si falla
     */
    public String sincronizarAseguradoEnTransaccionSeparada(SolicitudBolsaExcelRowDTO rowDTO) {
        try {
            java.util.Optional<Asegurado> aseguradoExistente = aseguradoRepository.findByDocPaciente(rowDTO.dni());

            if (aseguradoExistente.isPresent()) {
                Asegurado asegurado = aseguradoExistente.get();
                String nombre = asegurado.getPaciente();

                // Actualizar teléfonos si hay nuevos datos
                if (rowDTO.telefonoPrincipal() != null && !rowDTO.telefonoPrincipal().isBlank()) {
                    if (!rowDTO.telefonoPrincipal().equals(asegurado.getTelFijo())) {
                        asegurado.setTelFijo(rowDTO.telefonoPrincipal());
                    }
                }

                if (rowDTO.telefonoAlterno() != null && !rowDTO.telefonoAlterno().isBlank()) {
                    if (!rowDTO.telefonoAlterno().equals(asegurado.getTelCelular())) {
                        asegurado.setTelCelular(rowDTO.telefonoAlterno());
                    }
                }

                if (rowDTO.correo() != null && !rowDTO.correo().isBlank()) {
                    if (asegurado.getCorreoElectronico() == null || !asegurado.getCorreoElectronico().equals(rowDTO.correo())) {
                        asegurado.setCorreoElectronico(rowDTO.correo());
                    }
                }

                aseguradoRepository.save(asegurado);
                log.info("✅ Asegurado actualizado en BD: {} (DNI: {})", nombre, rowDTO.dni());
                return nombre;
            } else {
                // Crear nuevo asegurado
                Asegurado nuevoAsegurado = new Asegurado();
                nuevoAsegurado.setPkAsegurado(rowDTO.dni());
                nuevoAsegurado.setDocPaciente(rowDTO.dni());
                nuevoAsegurado.setVigencia(true);
                nuevoAsegurado.setPaciente(rowDTO.nombreCompleto());

                if (rowDTO.telefonoPrincipal() != null && !rowDTO.telefonoPrincipal().isBlank()) {
                    nuevoAsegurado.setTelFijo(rowDTO.telefonoPrincipal());
                }
                if (rowDTO.telefonoAlterno() != null && !rowDTO.telefonoAlterno().isBlank()) {
                    nuevoAsegurado.setTelCelular(rowDTO.telefonoAlterno());
                }
                if (rowDTO.correo() != null && !rowDTO.correo().isBlank()) {
                    nuevoAsegurado.setCorreoElectronico(rowDTO.correo());
                }
                if (rowDTO.sexo() != null && !rowDTO.sexo().isBlank()) {
                    nuevoAsegurado.setSexo(rowDTO.sexo());
                }

                aseguradoRepository.save(nuevoAsegurado);
                log.info("✅ Nuevo asegurado creado en BD: {} (DNI: {})", rowDTO.nombreCompleto(), rowDTO.dni());
                return rowDTO.nombreCompleto();
            }
        } catch (Exception e) {
            log.error("❌ Error sincronizando asegurado en transacción separada para DNI {}: {}", rowDTO.dni(), e.getMessage());
            // ✅ CRÍTICO: Limpiar la sesión de Hibernate para prevenir "transaction aborted"
            try {
                entityManager.clear();
                log.debug("🧹 Sesión de Hibernate limpiada después de error en sincronizarAsegurado");
            } catch (Exception cleanupEx) {
                log.warn("⚠️ No se pudo limpiar sesión en sincronizarAsegurado: {}", cleanupEx.getMessage());
            }
            return null;
        }
    }

    public boolean crearAseguradoMinimo(SolicitudBolsaExcelRowDTO rowDTO) {
        try {
            // Verificar nuevamente si existe (por si se creó en otro thread)
            java.util.Optional<Asegurado> existente = aseguradoRepository.findByDocPaciente(rowDTO.dni());
            if (existente.isPresent()) {
                log.info("✅ Asegurado ya existe en BD para DNI: {}", rowDTO.dni());
                return true;
            }

            // Crear nuevo asegurado con datos mínimos
            Asegurado nuevoAsegurado = new Asegurado();
            nuevoAsegurado.setPkAsegurado(rowDTO.dni());
            nuevoAsegurado.setDocPaciente(rowDTO.dni());
            nuevoAsegurado.setVigencia(true);  // ✅ CRÍTICO: vigencia es NOT NULL en BD

            // Usar nombre del Excel o fallback
            String nombre = rowDTO.nombreCompleto();
            if (nombre == null || nombre.isBlank()) {
                nombre = "Paciente " + rowDTO.dni();
            }
            nuevoAsegurado.setPaciente(nombre);

            // Asignar datos opcionales si están disponibles
            if (rowDTO.sexo() != null && !rowDTO.sexo().isBlank()) {
                nuevoAsegurado.setSexo(rowDTO.sexo());
            }

            // Parsear fecha de nacimiento si existe
            if (rowDTO.fechaNacimiento() != null && !rowDTO.fechaNacimiento().isBlank()) {
                try {
                    java.time.LocalDate fechaNac = java.time.LocalDate.parse(rowDTO.fechaNacimiento());
                    nuevoAsegurado.setFecnacimpaciente(fechaNac);
                } catch (Exception ex) {
                    log.warn("⚠️ No se pudo parsear fecha nacimiento para DNI {}: {}", rowDTO.dni(), ex.getMessage());
                }
            }

            // Teléfonos
            if (rowDTO.telefonoPrincipal() != null && !rowDTO.telefonoPrincipal().isBlank()) {
                nuevoAsegurado.setTelFijo(rowDTO.telefonoPrincipal());
            }
            if (rowDTO.telefonoAlterno() != null && !rowDTO.telefonoAlterno().isBlank()) {
                nuevoAsegurado.setTelCelular(rowDTO.telefonoAlterno());
            }

            // Correo
            if (rowDTO.correo() != null && !rowDTO.correo().isBlank()) {
                nuevoAsegurado.setCorreoElectronico(rowDTO.correo());
            }

            // Guardar en BD
            aseguradoRepository.save(nuevoAsegurado);
            log.info("✅ [AUTO-CREAR ASEGURADO] Asegurado creado para DNI {}: {} | Tel: {} / {}",
                rowDTO.dni(), nombre, nuevoAsegurado.getTelFijo(), nuevoAsegurado.getTelCelular());
            return true;

        } catch (Exception e) {
            log.error("❌ Error creando asegurado mínimo para DNI {}: {}", rowDTO.dni(), e.getMessage(), e);
            // ✅ CRÍTICO: Limpiar la sesión de Hibernate para prevenir "transaction aborted"
            try {
                entityManager.clear();
                log.debug("🧹 Sesión de Hibernate limpiada después de error");
            } catch (Exception cleanupEx) {
                log.warn("⚠️ No se pudo limpiar sesión: {}", cleanupEx.getMessage());
            }
            return false;
        }
    }

    /**
     * Extrae el tipo de error de forma legible del mensaje de excepción
     *
     * @param mensajeError mensaje de error bruto
     * @return tipo de error en texto legible
     */
    private String extraerTipoError(String mensajeError) {
        if (mensajeError == null) return "DESCONOCIDO";

        if (mensajeError.toLowerCase().contains("unique")) return "CONSTRAINT UNIQUE";
        if (mensajeError.toLowerCase().contains("foreign key")) return "FOREIGN KEY";
        if (mensajeError.toLowerCase().contains("not null")) return "NOT NULL";
        if (mensajeError.toLowerCase().contains("check")) return "CHECK CONSTRAINT";
        if (mensajeError.toLowerCase().contains("duplicate")) return "DUPLICATE";

        // Extraer primeras palabras significativas
        String[] partes = mensajeError.split(" ");
        if (partes.length > 0) {
            return partes[0].toUpperCase();
        }
        return "DESCONOCIDO";
    }

    /**
     * Genera un mensaje de error en español basado en el tipo de excepción
     * Clasifica excepciones y proporciona mensajes amigables
     *
     * @param filaNumero número de fila en Excel
     * @param rowDTO datos de la fila (puede ser null)
     * @param e excepción ocurrida
     * @return mensaje de error en español
     */
    private String generarMensajeErrorEnEspanol(int filaNumero, SolicitudBolsaExcelRowDTO rowDTO, Exception e) {
        String dniBuscado = rowDTO != null ? rowDTO.dni() : "DESCONOCIDO";
        String mensajeOriginal = e.getMessage() != null ? e.getMessage() : "Error desconocido";

        // ========================================================================
        // 1. IllegalArgumentException - Validación de campos
        // ========================================================================
        if (e instanceof IllegalArgumentException) {
            if (mensajeOriginal.contains("TIPO CITA")) {
                return "TIPO_CITA inválido. Valores válidos: RECITA, INTERCONSULTA, VOLUNTARIA, REFERENCIA.";
            }
            if (mensajeOriginal.contains("Formato de teléfono")) {
                return "Formato de teléfono inválido. Solo se permiten números, +, (), -, y espacios.";
            }
            if (mensajeOriginal.contains("DNI") || mensajeOriginal.contains("IPRESS")) {
                return mensajeOriginal; // Ya está en español desde la validación
            }
            return "Validación de datos falló: " + mensajeOriginal;
        }

        // ========================================================================
        // 2. DataIntegrityViolationException - Manejada arriba, pero por si acaso
        // ========================================================================
        if (e instanceof org.springframework.dao.DataIntegrityViolationException) {
            return manejarErrorIntegridad(filaNumero, rowDTO,
                (org.springframework.dao.DataIntegrityViolationException) e);
        }

        // ========================================================================
        // 3. EmptyResultDataAccessException - Registro no encontrado
        // ========================================================================
        if (e instanceof org.springframework.dao.EmptyResultDataAccessException) {
            return "Registro no encontrado al procesar fila " + filaNumero +
                   ". Verifique que todos los datos de referencia existan.";
        }

        // ========================================================================
        // 4. DataAccessException - Error de acceso a BD
        // ========================================================================
        if (e instanceof org.springframework.dao.DataAccessException) {
            return "Error al acceder a la base de datos. Por favor intente de nuevo.";
        }

        // ========================================================================
        // 5. UnsupportedOperationException - Operación no permitida
        // ========================================================================
        if (e instanceof UnsupportedOperationException) {
            return "Operación no soportada: " + mensajeOriginal;
        }

        // ========================================================================
        // 6. NullPointerException - Falta información
        // ========================================================================
        if (e instanceof NullPointerException) {
            log.error("NPE en fila {}: {}", filaNumero, e.getMessage(), e);
            return "Faltan datos requeridos en fila " + filaNumero + ". Revise que no haya campos vacíos.";
        }

        // ========================================================================
        // 7. NumberFormatException - Formato numérico inválido
        // ========================================================================
        if (e instanceof NumberFormatException) {
            return "Formato numérico inválido en fila " + filaNumero +
                   ". Revise que los números estén correctamente formateados.";
        }

        // ========================================================================
        // FALLBACK: Mensaje genérico en español
        // ========================================================================
        log.error("❌ Excepción sin clasificar en fila {}: {} ({})", filaNumero, e.getClass().getSimpleName(), mensajeOriginal);
        return "Error procesando fila " + filaNumero + ". Tipo: " + e.getClass().getSimpleName() +
               ". Contacte al administrador si el problema persiste.";
    }

    @Override
    @Transactional
    public SolicitudBolsaDTO cambiarTipoBolsa(Long idSolicitud, Long idBolsaNueva) {
        log.info("🔄 [cambiarTipoBolsa] Iniciando cambio de bolsa para solicitud {} → Nueva bolsa: {}",
            idSolicitud, idBolsaNueva);

        // 1. Validar que la solicitud existe
        SolicitudBolsa solicitud = solicitudRepository.findById(idSolicitud)
            .orElseThrow(() -> {
                log.error("❌ Solicitud {} no encontrada", idSolicitud);
                return new RuntimeException("Solicitud no encontrada con ID: " + idSolicitud);
            });

        log.info("   ✓ Solicitud encontrada: {} - Paciente: {}",
            solicitud.getNumeroSolicitud(), solicitud.getPacienteNombre());

        // 2. Validar que la nueva bolsa existe
        TipoBolsa nuevaBolsa = tipoBolsaRepository.findById(idBolsaNueva)
            .orElseThrow(() -> {
                log.error("❌ Tipo de bolsa {} no encontrado", idBolsaNueva);
                return new RuntimeException("Tipo de bolsa no encontrado con ID: " + idBolsaNueva);
            });

        log.info("   ✓ Nueva bolsa encontrada: {}", nuevaBolsa.getDescTipoBolsa());

        // 3. Cambiar el tipo de bolsa
        Long idBolsaAnterior = solicitud.getIdBolsa();
        solicitud.setIdBolsa(idBolsaNueva);

        // 4. Guardar en BD
        SolicitudBolsa solicitudActualizada = solicitudRepository.save(solicitud);

        log.info("✅ [cambiarTipoBolsa] Bolsa actualizada exitosamente");
        log.info("   📊 Cambio: Bolsa {} → Bolsa {} | Solicitud: {} | Paciente: {}",
            idBolsaAnterior, idBolsaNueva, solicitud.getNumeroSolicitud(), solicitud.getPacienteNombre());

        // 5. Retornar DTO actualizado
        return SolicitudBolsaMapper.toDTO(solicitudActualizada);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> obtenerGestorasDisponibles() {
        log.info("👤 Obteniendo gestoras disponibles (rol GESTOR DE CITAS)...");

        try {
            // 1️⃣ Obtener todos los usuarios
            List<com.styp.cenate.model.Usuario> todosUsuarios = usuarioRepository.findAll();

            if (todosUsuarios == null || todosUsuarios.isEmpty()) {
                log.warn("⚠️ No hay usuarios registrados en la BD");
                return new java.util.ArrayList<>();
            }

            // 2️⃣ Filtrar: rol GESTOR DE CITAS + activo
            List<Map<String, Object>> gestoras = new java.util.ArrayList<>();
            for (com.styp.cenate.model.Usuario usuario : todosUsuarios) {
                // Validar: activo
                if (usuario.getStatUser() == null || (!usuario.getStatUser().equalsIgnoreCase("A") && !usuario.getStatUser().equalsIgnoreCase("ACTIVO"))) {
                    continue;
                }

                // Validar: tiene rol GESTOR DE CITAS
                if (usuario.getRoles() == null) {
                    continue;
                }

                boolean tieneRolGestor = usuario.getRoles().stream()
                    .anyMatch(r -> {
                        if (r.getDescRol() == null) return false;
                        String rol = r.getDescRol().toUpperCase().trim();
                        return rol.contains("GESTOR") ||
                               rol.contains("GESTION CITAS") ||
                               rol.contains("GESTION_CITAS") ||
                               rol.contains("COORD. GESTION") ||
                               rol.contains("COORD_GESTION");
                    });

                if (!tieneRolGestor) {
                    continue;
                }

                // Agregar a lista
                java.util.Map<String, Object> gestora = new java.util.HashMap<>();
                gestora.put("id", usuario.getIdUser());

                // Obtener nombre completo desde PersonalCnt si está disponible
                String nombreCompleto = "Sin nombre";
                if (usuario.getPersonalCnt() != null) {
                    String nombre = usuario.getPersonalCnt().getNomPers() != null ? usuario.getPersonalCnt().getNomPers() : "";
                    String apePat = usuario.getPersonalCnt().getApePaterPers() != null ? usuario.getPersonalCnt().getApePaterPers() : "";
                    String apeMat = usuario.getPersonalCnt().getApeMaterPers() != null ? usuario.getPersonalCnt().getApeMaterPers() : "";

                    // Construir nombre completo: "Apellido Paterno Apellido Materno, Nombre"
                    StringBuilder sb = new StringBuilder();
                    if (!apePat.trim().isEmpty()) sb.append(apePat.trim());
                    if (!apeMat.trim().isEmpty()) {
                        if (sb.length() > 0) sb.append(" ");
                        sb.append(apeMat.trim());
                    }
                    if (!nombre.trim().isEmpty()) {
                        if (sb.length() > 0) sb.append(", ");
                        sb.append(nombre.trim());
                    }

                    if (sb.length() > 0) {
                        nombreCompleto = sb.toString();
                    } else if (usuario.getNameUser() != null) {
                        nombreCompleto = usuario.getNameUser();
                    }
                } else if (usuario.getNameUser() != null) {
                    nombreCompleto = usuario.getNameUser();
                }

                gestora.put("nombre", nombreCompleto);
                gestora.put("nombreCompleto", nombreCompleto);
                gestora.put("activo", true);
                gestoras.add(gestora);
            }

            log.info("✅ Se encontraron {} gestora(s) disponible(s)", gestoras.size());
            return gestoras;

        } catch (Exception e) {
            log.error("❌ Error al obtener gestoras: ", e);
            return new java.util.ArrayList<>();
        }
    }

    @Override
    @Transactional
    public void actualizarTelefonos(Long idSolicitud, String telefonoPrincipal, String telefonoAlterno) {
        log.info("📱 Actualizando teléfonos de solicitud {}", idSolicitud);

        // 1️⃣ VALIDAR que la solicitud existe y está activa
        SolicitudBolsa solicitud = solicitudRepository.findById(idSolicitud)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Solicitud " + idSolicitud + " no encontrada"
            ));

        if (!solicitud.getActivo()) {
            throw new ValidationException("No se puede actualizar teléfonos de solicitud inactiva");
        }

        // 2️⃣ VALIDAR que al menos uno de los teléfonos está presente
        if ((telefonoPrincipal == null || telefonoPrincipal.trim().isEmpty()) &&
            (telefonoAlterno == null || telefonoAlterno.trim().isEmpty())) {
            throw new ValidationException("Al menos uno de los teléfonos es requerido");
        }

        // 3️⃣ ACTUALIZAR teléfonos (pueden ser null/blank)
        String telPrincipalAnterior = solicitud.getPacienteTelefono();
        String telAlternoAnterior = solicitud.getPacienteTelefonoAlterno();

        solicitud.setPacienteTelefono(
            telefonoPrincipal != null && !telefonoPrincipal.trim().isEmpty() ? telefonoPrincipal.trim() : null
        );
        solicitud.setPacienteTelefonoAlterno(
            telefonoAlterno != null && !telefonoAlterno.trim().isEmpty() ? telefonoAlterno.trim() : null
        );

        // 4️⃣ GUARDAR
        solicitudRepository.save(solicitud);

        // 5️⃣ LOG de operación
        log.info("✅ Teléfonos actualizados en solicitud {}. Principal: {} → {}, Alterno: {} → {}",
            idSolicitud,
            telPrincipalAnterior, solicitud.getPacienteTelefono(),
            telAlternoAnterior, solicitud.getPacienteTelefonoAlterno());
    }

    @Override
    @Transactional
    public void actualizarFechaPreferida(Long idSolicitud, java.time.LocalDate fecha) {
        log.info("📅 Actualizando fecha preferida de solicitud {} → {}", idSolicitud, fecha);
        SolicitudBolsa solicitud = solicitudRepository.findById(idSolicitud)
            .orElseThrow(() -> new ResourceNotFoundException("Solicitud " + idSolicitud + " no encontrada"));
        java.time.LocalDate anterior = solicitud.getFechaPreferidaNoAtendida();
        solicitud.setFechaPreferidaNoAtendida(fecha);
        solicitudRepository.save(solicitud);
        log.info("✅ Fecha preferida actualizada en solicitud {}. {} → {}", idSolicitud, anterior, fecha);
    }

    @Override
    @Transactional
    public void actualizarIpressAtencion(Long idSolicitud, Long idIpressAtencion) {
        log.info("🏥 Actualizando IPRESS Atención de solicitud {} → idIpress: {}", idSolicitud, idIpressAtencion);

        SolicitudBolsa solicitud = solicitudRepository.findById(idSolicitud)
            .orElseThrow(() -> new ResourceNotFoundException("Solicitud " + idSolicitud + " no encontrada"));

        Long ipressAnterior = solicitud.getIdIpressAtencion();
        solicitud.setIdIpressAtencion(idIpressAtencion);
        solicitudRepository.save(solicitud);

        log.info("✅ IPRESS Atención actualizada en solicitud {}. {} → {}", idSolicitud, ipressAnterior, idIpressAtencion);
    }

    /**
     * ✅ NUEVA v2.2.0: Analiza el Excel y detecta DNI duplicados ANTES de procesar
     * Aplica estrategia KEEP_FIRST: mantiene primer DNI, descarta duplicados
     *
     * @param sheet Hoja del Excel a analizar
     * @param totalFilas Número total de filas
     * @return ReporteDuplicadosDTO con análisis de duplicados encontrados
     */
    public ReporteDuplicadosDTO analizarDuplicadosEnExcel(XSSFSheet sheet, int totalFilas) {
        log.info("🔍 [v2.2.0] Analizando duplicados en Excel - {} filas", totalFilas);

        Set<String> dniProcesados = new HashSet<>();
        Map<String, List<Integer>> dniPorFila = new HashMap<>();
        int filasUnicas = 0;
        int filasDuplicadas = 0;

        // Recorrer todas las filas (excepto header)
        for (int fila = 1; fila < totalFilas; fila++) {
            try {
                Row row = sheet.getRow(fila);
                if (row == null) continue;

                // Extraer DNI (columna C = columna 2)
                Cell cellDNI = row.getCell(2);
                if (cellDNI == null || cellDNI.getCellType() == CellType.BLANK) continue;

                String dni = obtenerValorCelda(cellDNI).trim();
                if (dni.isEmpty()) continue;

                // Registrar fila por DNI
                dniPorFila.computeIfAbsent(dni, k -> new ArrayList<>()).add(fila);

                // Contar si es único o duplicado
                if (dniProcesados.contains(dni)) {
                    filasDuplicadas++;
                    log.debug("   ⚠️  [FILA {}] DNI {} es DUPLICADO", fila, dni);
                } else {
                    dniProcesados.add(dni);
                    filasUnicas++;
                    log.debug("   ✅ [FILA {}] DNI {} es ÚNICO", fila, dni);
                }
            } catch (Exception e) {
                log.warn("⚠️  Error analizando fila {}: {}", fila, e.getMessage());
            }
        }

        // Construir detalles de duplicados
        List<Map<String, Object>> duplicadosDetalle = new ArrayList<>();
        for (Map.Entry<String, List<Integer>> entry : dniPorFila.entrySet()) {
            if (entry.getValue().size() > 1) {
                Map<String, Object> detalle = new HashMap<>();
                detalle.put("dni", entry.getKey());
                detalle.put("filas", entry.getValue());
                detalle.put("cantidadDuplicados", entry.getValue().size());
                detalle.put("primerRegistroMantenido", entry.getValue().get(0));
                detalle.put("filasDescartadas", entry.getValue().subList(1, entry.getValue().size()));
                duplicadosDetalle.add(detalle);
            }
        }

        // Generar reporte
        Double tasaDuplicidad = totalFilas > 0 ? (filasDuplicadas * 100.0) / totalFilas : 0;
        Boolean hayDuplicados = filasDuplicadas > 0;

        String mensajeResumen;
        if (hayDuplicados) {
            mensajeResumen = String.format(
                "⚠️  Se detectaron %d DNI duplicados en %d filas. " +
                "Se mantienen %d registros únicos (%.1f%% duplicidad). " +
                "Se descartarán %d filas en la importación.",
                dniPorFila.values().stream().filter(l -> l.size() > 1).count(),
                totalFilas - 1,
                filasUnicas,
                tasaDuplicidad,
                filasDuplicadas
            );
        } else {
            mensajeResumen = "✅ Sin duplicados detectados. Todas las filas son únicas.";
        }

        ReporteDuplicadosDTO reporte = ReporteDuplicadosDTO.builder()
            .totalFilas(totalFilas - 1)  // Excluir header
            .filasUnicas(filasUnicas)
            .filasDuplicadas(filasDuplicadas)
            .tasaDuplicidad(tasaDuplicidad)
            .duplicadosDetalle(duplicadosDetalle)
            .estrategia("KEEP_FIRST")
            .mensajeResumen(mensajeResumen)
            .hayDuplicados(hayDuplicados)
            .fechaDeteccion(java.time.LocalDateTime.now().toString())
            .build();

        log.info("✅ [v2.2.0] Análisis completado: {} únicos, {} duplicados ({}%)",
            filasUnicas, filasDuplicadas, String.format("%.2f", tasaDuplicidad));

        return reporte;
    }

    /**
     * Encuentra un número de solicitud disponible (que no existe en la BD)
     * Pre-valida candidatos generados ANTES de crear la entidad
     *
     * Estrategia:
     * 1. Genera múltiples candidatos
     * 2. Valida cuál no existe en BD
     * 3. Retorna el primero disponible
     * 4. Evita transacciones rollback-only por duplicados
     *
     * @param cantidadCandidatos cuántos números generar como candidatos
     * @return número de solicitud disponible garantizado sin duplicados en BD
     * @throws RuntimeException si no se encuentra número disponible después de intentos
     */
    private String encontrarNumeroSolicitudDisponible(int cantidadCandidatos) {
        log.debug("🔍 Buscando número de solicitud disponible (generando {} candidatos)...", cantidadCandidatos);

        // 1. Generar múltiples candidatos
        List<String> candidatos = SolicitudBolsaMapper.generarNumerosExclusivos(cantidadCandidatos);
        log.debug("   📋 Candidatos generados: {}", candidatos);

        // 2. Validar cuál no existe
        for (String candidato : candidatos) {
            if (!solicitudRepository.existsByNumeroSolicitud(candidato)) {
                log.debug("   ✅ Número disponible encontrado: {}", candidato);
                return candidato;
            }
        }

        // 3. Si ninguno disponible después de N intentos, lanzar excepción
        String errorMsg = String.format(
            "❌ No se encontró número de solicitud disponible después de %d intentos. " +
            "Última colisión: %s. Esto indica alta concurrencia.",
            cantidadCandidatos,
            candidatos.get(candidatos.size() - 1)
        );
        log.error(errorMsg);
        throw new RuntimeException(errorMsg);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SolicitudBolsaDTO> obtenerSolicitudesAsignadasAGestora() {
        try {
            // 1️⃣ OBTENER USUARIO ACTUAL DEL CONTEXTO DE SEGURIDAD
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            if (authentication == null || !authentication.isAuthenticated()) {
                log.warn("⚠️ No hay usuario autenticado para obtener Mi Bandeja");
                return new ArrayList<>();
            }

            String username = authentication.getName();
            log.info("📬 [Mi Bandeja] Obteniendo solicitudes para gestora: {}", username);
            log.info("   Auth type: {}, Principal: {}", authentication.getClass().getName(), authentication.getPrincipal());

            // 2️⃣ OBTENER USUARIO COMPLETO DESDE BD
            Usuario usuarioActual = usuarioRepository.findByNameUser(username)
                .orElseThrow(() -> new ResourceNotFoundException(
                    "Usuario " + username + " no encontrado en el sistema"
                ));

            Long usuarioId = usuarioActual.getIdUser();
            log.info("   ✓ Usuario encontrado - ID: {}, Username: {}, Estado: {}",
                usuarioId, usuarioActual.getNameUser(), usuarioActual.getStatUser());

            // 3️⃣ OBTENER SOLICITUDES ASIGNADAS A ESTA GESTORA
            log.info("   🔍 Buscando solicitudes con: responsableGestoraId={} AND activo=true", usuarioId);
            List<SolicitudBolsa> solicitudes = solicitudRepository.findByResponsableGestoraIdAndActivoTrue(usuarioId);

            log.info("   ✅ Query realizado: Se encontraron {} solicitud(es) asignada(s) a gestora (ID: {})",
                solicitudes.size(), usuarioId);

            // 5️⃣ DEBUG: Mostrar solicitudes encontradas
            if (!solicitudes.isEmpty()) {
                log.info("   📋 Primeras 3 solicitudes:");
                solicitudes.stream().limit(3).forEach(s ->
                    log.info("      - ID: {}, DNI: {}, Nombre: {}, Estado: {}, idBolsa: {}",
                        s.getIdSolicitud(), s.getPacienteDni(), s.getPacienteNombre(), s.getEstado(), s.getIdBolsa())
                );
            }

            // 4️⃣ PRE-CARGAR LOOKUPS EN BATCH (evita N+1: ~4 queries en lugar de 4×N)
            Set<Long> idIpressSet = solicitudes.stream()
                .filter(s -> s.getIdIpress() != null)
                .map(SolicitudBolsa::getIdIpress)
                .collect(Collectors.toSet());
            Set<Long> idBolsaSet = solicitudes.stream()
                .filter(s -> s.getIdBolsa() != null)
                .map(SolicitudBolsa::getIdBolsa)
                .collect(Collectors.toSet());
            List<String> dniList = solicitudes.stream()
                .filter(s -> s.getPacienteDni() != null && !s.getPacienteDni().isBlank())
                .map(SolicitudBolsa::getPacienteDni)
                .distinct()
                .collect(Collectors.toList());
            Set<Long> idPersonalSet = solicitudes.stream()
                .filter(s -> s.getIdPersonal() != null)
                .map(SolicitudBolsa::getIdPersonal)
                .collect(Collectors.toSet());

            Map<Long, Ipress> ipressMap = ipressRepository.findAllById(idIpressSet).stream()
                .collect(Collectors.toMap(Ipress::getIdIpress, i -> i));
            Map<Long, TipoBolsa> tipoBolsaMap = tipoBolsaRepository.findAllById(idBolsaSet).stream()
                .collect(Collectors.toMap(TipoBolsa::getIdTipoBolsa, tb -> tb));
            Map<String, Asegurado> aseguradoMap = aseguradoRepository.findByDocPacienteIn(dniList).stream()
                .collect(Collectors.toMap(Asegurado::getDocPaciente, a -> a));
            Map<Long, PersonalCnt> personalMap = personalCntRepository.findAllById(idPersonalSet).stream()
                .collect(Collectors.toMap(PersonalCnt::getIdPers, p -> p));

            log.info("   📦 Batch cargado: {} IPRESS, {} TipoBolsa, {} Asegurados, {} Personal",
                ipressMap.size(), tipoBolsaMap.size(), aseguradoMap.size(), personalMap.size());

            // 4️⃣ MAPEAR A DTOs CON ENRIQUECIMIENTO (sin queries por fila)
            List<SolicitudBolsaDTO> dtoList = solicitudes.stream()
                .map(s -> mapSolicitudBolsaToDTOBatch(s, ipressMap, tipoBolsaMap, aseguradoMap, personalMap))
                .collect(Collectors.toList());

            // 5️⃣ ENRIQUECER CON FLAG CENACRON (consulta masiva para evitar N+1)
            try {
                List<String> todosLosDnis = dtoList.stream()
                    .map(SolicitudBolsaDTO::getPacienteDni)
                    .filter(dni -> dni != null && !dni.isBlank())
                    .distinct()
                    .collect(Collectors.toList());

                if (!todosLosDnis.isEmpty()) {
                    List<String> dnisCenacron = pacienteEstrategiaRepository
                        .findDnisPertenecentesAEstrategia(todosLosDnis, "CENACRON");
                    Set<String> setCenacron = new HashSet<>(dnisCenacron);
                    log.info("   🏷️ CENACRON: {} pacientes identificados de {} DNIs consultados",
                        setCenacron.size(), todosLosDnis.size());
                    dtoList.forEach(dto -> dto.setEsCenacron(setCenacron.contains(dto.getPacienteDni())));
                }
            } catch (Exception ex) {
                log.warn("⚠️ No se pudo enriquecer flag CENACRON: {}", ex.getMessage());
            }

            return dtoList;

        } catch (ResourceNotFoundException e) {
            log.error("❌ Usuario no encontrado: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("❌ Error obteniendo bandeja de gestora: ", e);
            throw new RuntimeException("Error al obtener solicitudes asignadas: " + e.getMessage(), e);
        }
    }

    /**
     * 🆕 Obtiene todas las solicitudes asignadas a enfermeras (para COORD. ENFERMERIA)
     * Filtra por id_personal IN (id_pers de usuarios con rol ENFERMERIA) Y activo = true
     */
    @Override
    @Transactional(readOnly = true)
    public List<SolicitudBolsaDTO> obtenerBandejaEnfermeriaCoordinador() {
        log.info("👩‍⚕️ Obteniendo bandeja COORD. ENFERMERIA — buscando usuarios con rol ENFERMERIA...");
        try {
            // 1. Obtener todos los usuarios con rol ENFERMERIA y sus datos de personal
            List<Usuario> enfermeras = usuarioRepository.findByRolWithPersonalData("ENFERMERIA");
            log.info("   → {} enfermera(s) encontradas con rol ENFERMERIA", enfermeras.size());

            // 2. Extraer id_pers de cada enfermera
            List<Long> idPersonalList = enfermeras.stream()
                .filter(u -> u.getPersonalCnt() != null && u.getPersonalCnt().getIdPers() != null)
                .map(u -> u.getPersonalCnt().getIdPers())
                .collect(Collectors.toList());

            log.info("   → {} id_pers extraídos: {}", idPersonalList.size(), idPersonalList);

            if (idPersonalList.isEmpty()) {
                log.warn("   ⚠️ Ninguna enfermera tiene id_pers registrado en dim_personal_cnt");
                return List.of();
            }

            // 3. Obtener solicitudes activas asignadas a cualquier enfermera
            List<SolicitudBolsa> solicitudes = solicitudRepository.findByIdPersonalInAndActivoTrue(idPersonalList);
            log.info("   → {} solicitudes encontradas para {}", solicitudes.size(), idPersonalList);

            // 4. Pre-cargar lookups en batch (evita N+1)
            Set<Long> idIpressSet = solicitudes.stream()
                .filter(s -> s.getIdIpress() != null)
                .map(SolicitudBolsa::getIdIpress)
                .collect(Collectors.toSet());
            Set<Long> idBolsaSet = solicitudes.stream()
                .filter(s -> s.getIdBolsa() != null)
                .map(SolicitudBolsa::getIdBolsa)
                .collect(Collectors.toSet());
            List<String> dniList = solicitudes.stream()
                .filter(s -> s.getPacienteDni() != null && !s.getPacienteDni().isBlank())
                .map(SolicitudBolsa::getPacienteDni)
                .distinct()
                .collect(Collectors.toList());
            Set<Long> idPersonalSet = solicitudes.stream()
                .filter(s -> s.getIdPersonal() != null)
                .map(SolicitudBolsa::getIdPersonal)
                .collect(Collectors.toSet());

            Map<Long, Ipress> ipressMap = ipressRepository.findAllById(idIpressSet).stream()
                .collect(Collectors.toMap(Ipress::getIdIpress, i -> i));
            Map<Long, TipoBolsa> tipoBolsaMap = tipoBolsaRepository.findAllById(idBolsaSet).stream()
                .collect(Collectors.toMap(TipoBolsa::getIdTipoBolsa, tb -> tb));
            Map<String, Asegurado> aseguradoMap = aseguradoRepository.findByDocPacienteIn(dniList).stream()
                .collect(Collectors.toMap(Asegurado::getDocPaciente, a -> a));
            Map<Long, PersonalCnt> personalMap = personalCntRepository.findAllById(idPersonalSet).stream()
                .collect(Collectors.toMap(PersonalCnt::getIdPers, p -> p));

            // 4. Mapear a DTO usando batch maps (sin queries por fila)
            List<SolicitudBolsaDTO> resultado = solicitudes.stream()
                .map(s -> mapSolicitudBolsaToDTOBatch(s, ipressMap, tipoBolsaMap, aseguradoMap, personalMap))
                .collect(Collectors.toList());

            log.info("✅ Bandeja COORD. ENFERMERIA: {} pacientes", resultado.size());
            return resultado;

        } catch (Exception e) {
            log.error("❌ Error obteniendo bandeja de coordinador de enfermería: ", e);
            throw new RuntimeException("Error al obtener bandeja de enfermería: " + e.getMessage(), e);
        }
    }

    /**
     * Versión batch de mapSolicitudBolsaToDTO: usa Maps pre-cargados en lugar de
     * queries individuales por fila, eliminando el problema N+1.
     * Úsalo en lugar de mapSolicitudBolsaToDTO cuando el caller pre-carga los lookups.
     */
    private SolicitudBolsaDTO mapSolicitudBolsaToDTOBatch(
            SolicitudBolsa solicitud,
            Map<Long, Ipress> ipressMap,
            Map<Long, TipoBolsa> tipoBolsaMap,
            Map<String, Asegurado> aseguradoMap,
            Map<Long, PersonalCnt> personalMap) {

        java.time.LocalDate fechaNacimiento = solicitud.getFechaNacimiento();
        String descIpress = null;
        String pacienteTelefono = solicitud.getPacienteTelefono();
        String pacienteTelefonoAlterno = solicitud.getPacienteTelefonoAlterno();
        String pacienteDni = solicitud.getPacienteDni();

        // Enriquecer desde aseguradoMap (sin query por fila)
        if ((fechaNacimiento == null || solicitud.getIdIpress() == null || isBlank(pacienteTelefono))
                && !isBlank(pacienteDni)) {
            Asegurado asegurado = aseguradoMap.get(pacienteDni);
            if (asegurado != null) {
                if (isBlank(pacienteTelefono) && !isBlank(asegurado.getTelFijo())) {
                    pacienteTelefono = asegurado.getTelFijo();
                }
                if (isBlank(pacienteTelefonoAlterno) && !isBlank(asegurado.getTelCelular())) {
                    pacienteTelefonoAlterno = asegurado.getTelCelular();
                }
                if (fechaNacimiento == null && asegurado.getFecnacimpaciente() != null) {
                    fechaNacimiento = asegurado.getFecnacimpaciente();
                }
                if (solicitud.getIdIpress() == null && !isBlank(asegurado.getCasAdscripcion())) {
                    // Buscar en ipressMap por código (recorrer es O(n) de IPRESS, que son pocos)
                    String codigoIpress = asegurado.getCasAdscripcion().trim();
                    descIpress = ipressMap.values().stream()
                        .filter(ip -> codigoIpress.equals(ip.getCodIpress()))
                        .map(Ipress::getDescIpress)
                        .findFirst()
                        .orElse(codigoIpress);
                }
            }
        }

        // IPRESS desde map (sin query por fila)
        if (solicitud.getIdIpress() != null) {
            Ipress ipress = ipressMap.get(solicitud.getIdIpress());
            if (ipress != null) descIpress = ipress.getDescIpress();
        }

        // TipoBolsa desde map (sin query por fila)
        String descTipoBolsa = null;
        if (solicitud.getIdBolsa() != null) {
            TipoBolsa tipoBolsa = tipoBolsaMap.get(solicitud.getIdBolsa());
            if (tipoBolsa != null) descTipoBolsa = tipoBolsa.getDescTipoBolsa();
        }

        // Nombre médico desde map (sin query por fila)
        String nombreMedico = null;
        if (solicitud.getIdPersonal() != null) {
            PersonalCnt p = personalMap.get(solicitud.getIdPersonal());
            if (p != null) {
                nombreMedico = (p.getNomPers() + " "
                    + (p.getApePaterPers() != null ? p.getApePaterPers() : "") + " "
                    + (p.getApeMaterPers() != null ? p.getApeMaterPers() : "")).trim();
            }
        }

        return SolicitudBolsaDTO.builder()
            .idSolicitud(solicitud.getIdSolicitud())
            .numeroSolicitud(solicitud.getNumeroSolicitud())
            .pacienteId(solicitud.getPacienteId())
            .pacienteNombre(solicitud.getPacienteNombre())
            .pacienteDni(solicitud.getPacienteDni())
            .especialidad(solicitud.getEspecialidad())
            .fechaPreferidaNoAtendida(solicitud.getFechaPreferidaNoAtendida())
            .tipoDocumento(solicitud.getTipoDocumento())
            .fechaNacimiento(fechaNacimiento)
            .pacienteSexo(solicitud.getPacienteSexo())
            .pacienteTelefono(pacienteTelefono)
            .pacienteTelefonoAlterno(pacienteTelefonoAlterno)
            .pacienteEmail(solicitud.getPacienteEmail())
            .pacienteEdad(calcularEdad(fechaNacimiento))
            .codigoIpressAdscripcion(solicitud.getCodigoIpressAdscripcion())
            .tipoCita(solicitud.getTipoCita())
            .tiempoInicioSintomas(solicitud.getTiempoInicioSintomas())
            .consentimientoInformado(solicitud.getConsentimientoInformado())
            .idBolsa(solicitud.getIdBolsa())
            .descTipoBolsa(descTipoBolsa)
            .idServicio(solicitud.getIdServicio())
            .codigoAdscripcion(solicitud.getCodigoAdscripcion())
            .idIpress(solicitud.getIdIpress())
            .descIpress(descIpress)
            .estado(solicitud.getEstado())
            .codEstadoCita(solicitud.getEstadoGestionCitas() != null ? solicitud.getEstadoGestionCitas().getCodigoEstado() : null)
            .descEstadoCita(solicitud.getEstadoGestionCitas() != null ? solicitud.getEstadoGestionCitas().getDescripcionEstado() : "PENDIENTE")
            .fechaSolicitud(solicitud.getFechaSolicitud())
            .fechaActualizacion(solicitud.getFechaActualizacion())
            .estadoGestionCitasId(solicitud.getEstadoGestionCitasId())
            .activo(solicitud.getActivo())
            .responsableGestoraId(solicitud.getResponsableGestoraId())
            .fechaAsignacion(solicitud.getFechaAsignacion())
            .fechaCambioEstado(solicitud.getFechaCambioEstado())
            .usuarioCambioEstadoId(solicitud.getUsuarioCambioEstadoId())
            .nombreUsuarioCambioEstado(obtenerNombreCompleto(solicitud.getUsuarioCambioEstado()))
            .fechaAtencion(solicitud.getFechaAtencion())
            .horaAtencion(solicitud.getHoraAtencion())
            .idPersonal(solicitud.getIdPersonal())
            .nombreMedicoAsignado(nombreMedico)
            .condicionMedica(solicitud.getCondicionMedica())
            .fechaAtencionMedica(solicitud.getFechaAtencionMedica())
            .build();
    }

    /**
     * Mapea una SolicitudBolsa a SolicitudBolsaDTO con datos enriquecidos
     * v1.41.1: Incluye descriptions de IPRESS y Estado de Cita para Mi Bandeja
     * Método auxiliar para obtenerSolicitudesAsignadasAGestora()
     */
    private SolicitudBolsaDTO mapSolicitudBolsaToDTO(SolicitudBolsa solicitud) {
        // ✅ v1.69.0 - Enriquecimiento extendido: Si falta fecha_nacimiento o IPRESS, buscar en asegurados por DNI
        java.time.LocalDate fechaNacimiento = solicitud.getFechaNacimiento();
        String descIpress = null;

        // Teléfonos: enriquecer desde asegurados si están vacíos en la solicitud
        String pacienteTelefono = solicitud.getPacienteTelefono();
        String pacienteTelefonoAlterno = solicitud.getPacienteTelefonoAlterno();

        String pacienteDni = solicitud.getPacienteDni();
        if ((fechaNacimiento == null || solicitud.getIdIpress() == null || isBlank(pacienteTelefono)) && !isBlank(pacienteDni)) {
            try {
                Optional<Asegurado> aseguradoOpt = aseguradoRepository.findByDocPaciente(pacienteDni);
                if (aseguradoOpt.isPresent()) {
                    Asegurado asegurado = aseguradoOpt.get();

                    // Si no hay teléfono principal, usar tel_fijo del asegurado
                    if (isBlank(pacienteTelefono) && !isBlank(asegurado.getTelFijo())) {
                        pacienteTelefono = asegurado.getTelFijo();
                    }
                    // Si no hay teléfono alterno, usar tel_celular del asegurado
                    if (isBlank(pacienteTelefonoAlterno) && !isBlank(asegurado.getTelCelular())) {
                        pacienteTelefonoAlterno = asegurado.getTelCelular();
                    }

                    // Si no hay fecha_nacimiento, usar la del asegurado
                    if (fechaNacimiento == null && asegurado.getFecnacimpaciente() != null) {
                        fechaNacimiento = asegurado.getFecnacimpaciente();
                        log.info("✅ v1.69.0 - Fecha nacimiento completada desde tabla asegurados para DNI: {}", pacienteDni);
                    }

                    // Si no hay IPRESS, usar casAdscripcion del asegurado y buscar descripción
                    if (solicitud.getIdIpress() == null && !isBlank(asegurado.getCasAdscripcion())) {
                        String codigoIpress = asegurado.getCasAdscripcion().trim();
                        // Buscar IPRESS por código en dim_ipress
                        try {
                            Optional<Ipress> ipressOpt = ipressRepository.findByCodIpress(codigoIpress);
                            if (ipressOpt.isPresent()) {
                                descIpress = ipressOpt.get().getDescIpress();
                                log.info("✅ v1.69.0 - IPRESS completada desde asegurados (código: {}) -> descripción: {}", codigoIpress, descIpress);
                            } else {
                                // Si no encuentra por código, usar el código como fallback
                                descIpress = codigoIpress;
                                log.warn("⚠️ v1.69.0 - No se encontró descripción para código IPRESS: {}", codigoIpress);
                            }
                        } catch (Exception e) {
                            log.warn("⚠️ Error buscando descripción de IPRESS para código {}: {}", codigoIpress, e.getMessage());
                            descIpress = codigoIpress; // Fallback al código
                        }
                    }
                }
            } catch (Exception e) {
                log.error("❌ Error enriqueciendo en mapSolicitudBolsaToDTO para DNI {}: {}", pacienteDni, e.getMessage());
            }
        }

        // Enriquecer con descripción de IPRESS si existe (después de enriquecimiento)
        if (solicitud.getIdIpress() != null) {
            try {
                Ipress ipress = ipressRepository.findById(solicitud.getIdIpress()).orElse(null);
                if (ipress != null) {
                    descIpress = ipress.getDescIpress();
                }
            } catch (Exception e) {
                log.warn("⚠️ No se pudo cargar descripción de IPRESS: {}", e.getMessage());
            }
        }

        // Enriquecer con descripción de Tipo de Bolsa si existe
        String descTipoBolsa = null;
        if (solicitud.getIdBolsa() != null) {
            try {
                log.info("🔍 Buscando TipoBolsa con ID: {}", solicitud.getIdBolsa());
                TipoBolsa tipoBolsa = tipoBolsaRepository.findById(solicitud.getIdBolsa()).orElse(null);
                if (tipoBolsa != null) {
                    descTipoBolsa = tipoBolsa.getDescTipoBolsa();
                    log.info("✅ TipoBolsa encontrado: ID={} -> desc='{}'", solicitud.getIdBolsa(), descTipoBolsa);
                } else {
                    log.warn("⚠️ TipoBolsa NO encontrado para ID: {}", solicitud.getIdBolsa());
                }
            } catch (Exception e) {
                log.warn("⚠️ No se pudo cargar descripción de Tipo de Bolsa: {}", e.getMessage());
            }
        } else {
            log.warn("⚠️ Solicitud {} tiene id_bolsa NULL", solicitud.getIdSolicitud());
        }

        return SolicitudBolsaDTO.builder()
            .idSolicitud(solicitud.getIdSolicitud())
            .numeroSolicitud(solicitud.getNumeroSolicitud())
            .pacienteId(solicitud.getPacienteId())
            .pacienteNombre(solicitud.getPacienteNombre())
            .pacienteDni(solicitud.getPacienteDni())
            .especialidad(solicitud.getEspecialidad())
            .fechaPreferidaNoAtendida(solicitud.getFechaPreferidaNoAtendida())
            .tipoDocumento(solicitud.getTipoDocumento())
            .fechaNacimiento(fechaNacimiento)
            .pacienteSexo(solicitud.getPacienteSexo())
            .pacienteTelefono(pacienteTelefono)
            .pacienteTelefonoAlterno(pacienteTelefonoAlterno)
            .pacienteEmail(solicitud.getPacienteEmail())
            .pacienteEdad(calcularEdad(fechaNacimiento))
            .codigoIpressAdscripcion(solicitud.getCodigoIpressAdscripcion())
            .tipoCita(solicitud.getTipoCita())
            .tiempoInicioSintomas(solicitud.getTiempoInicioSintomas())
            .consentimientoInformado(solicitud.getConsentimientoInformado())
            .idBolsa(solicitud.getIdBolsa())
            .descTipoBolsa(descTipoBolsa)
            .idServicio(solicitud.getIdServicio())
            .codigoAdscripcion(solicitud.getCodigoAdscripcion())
            .idIpress(solicitud.getIdIpress())
            .descIpress(descIpress)
            .estado(solicitud.getEstado())
            .codEstadoCita(solicitud.getEstadoGestionCitas() != null ? solicitud.getEstadoGestionCitas().getCodigoEstado() : null)
            .descEstadoCita(solicitud.getEstadoGestionCitas() != null ? solicitud.getEstadoGestionCitas().getDescripcionEstado() : "PENDIENTE")
            .fechaSolicitud(solicitud.getFechaSolicitud())
            .fechaActualizacion(solicitud.getFechaActualizacion())
            .estadoGestionCitasId(solicitud.getEstadoGestionCitasId())
            .activo(solicitud.getActivo())
            .responsableGestoraId(solicitud.getResponsableGestoraId())
            .fechaAsignacion(solicitud.getFechaAsignacion())
            .fechaCambioEstado(solicitud.getFechaCambioEstado())
            .usuarioCambioEstadoId(solicitud.getUsuarioCambioEstadoId())
            .nombreUsuarioCambioEstado(obtenerNombreCompleto(solicitud.getUsuarioCambioEstado()))
            .fechaAtencion(solicitud.getFechaAtencion())
            .horaAtencion(solicitud.getHoraAtencion())
            .idPersonal(solicitud.getIdPersonal())
            .nombreMedicoAsignado(obtenerNombreMedico(solicitud.getIdPersonal()))
            .condicionMedica(solicitud.getCondicionMedica())
            .fechaAtencionMedica(solicitud.getFechaAtencionMedica())
            .build();
    }

    /**
     * Obtiene el nombre completo del médico a partir de su id_personal
     */
    private String obtenerNombreMedico(Long idPersonal) {
        if (idPersonal == null) return null;
        try {
            return personalCntRepository.findById(idPersonal)
                .map(p -> (p.getNomPers() + " " + (p.getApePaterPers() != null ? p.getApePaterPers() : "") + " " + (p.getApeMaterPers() != null ? p.getApeMaterPers() : "")).trim())
                .orElse(null);
        } catch (Exception e) {
            log.warn("⚠️ Error obteniendo nombre de médico para id_personal {}: {}", idPersonal, e.getMessage());
            return null;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<SolicitudBolsaDTO> listarTodasPaginado(
            org.springframework.data.domain.Pageable pageable) {
        try {
            log.info("📄 Obteniendo solicitudes paginadas - page: {}, size: {}",
                pageable.getPageNumber(), pageable.getPageSize());

            // Consulta con paginación directa en BD (v2.5.1: optimizado con índices)
            List<Object[]> resultados = solicitudRepository.findAllWithBolsaDescriptionPaginado(pageable);
            long total = solicitudRepository.countActivosNative();  // Usa índice para mejor performance

            // Mapear a DTOs
            List<SolicitudBolsaDTO> dtos = resultados.stream()
                .map(this::mapFromResultSet)
                .collect(Collectors.toList());

            log.info("✅ Página obtenida: {}/{} ({}  registros)",
                pageable.getPageNumber(), (total / pageable.getPageSize()), dtos.size());

            return new org.springframework.data.domain.PageImpl<>(dtos, pageable, total);

        } catch (Exception e) {
            log.error("❌ Error obteniendo solicitudes paginadas: ", e);
            throw new RuntimeException("Error al obtener solicitudes: " + e.getMessage(), e);
        }
    }

    /**
     * 🆕 v2.6.0 - Listar solicitudes CON FILTROS AVANZADOS + PAGINACIÓN
     * Pensado para UX máxima facilidad: el usuario selecciona filtros y obtiene resultados al instante
     *
     * @param bolsaNombre nombre/descripción de bolsa (null = todas)
     * @param macrorregion descripción macro (null = todas)
     * @param red descripción red (null = todas)
     * @param ipress descripción IPRESS (null = todas)
     * @param especialidad especialidad (null = todas)
     * @param estadoCodigo código estado cita (null = todos)
     * @param tipoCita tipo cita (null = todos)
     * @param busqueda búsqueda por DNI solamente (null = ignorar)
     * @param pageable paginación
     * @return Page con solicitudes que coinciden los filtros
     */
    public org.springframework.data.domain.Page<SolicitudBolsaDTO> listarConFiltros(
            String bolsaNombre,
            String macrorregion,
            String red,
            String ipress,
            String especialidad,
            String estadoCodigo,
            String ipressAtencion,
            String tipoCita,
            String asignacion,
            String busqueda,
            String fechaInicio,
            String fechaFin,
            String condicionMedica,
            Long gestoraId,
            String estadoBolsa,
            org.springframework.data.domain.Pageable pageable) {
        try {
            log.info("🔍 Listando solicitudes con filtros - Bolsa: {}, Macro: {}, Red: {}, IPRESS: {}, Especialidad: {}, Estado: {}, IPRESSAtencion: {}, TipoCita: {}, Asignación: {}, Búsqueda: {}, FechaInicio: {}, FechaFin: {}, EstadoBolsa: {}",
                bolsaNombre, macrorregion, red, ipress, especialidad, estadoCodigo, ipressAtencion, tipoCita, asignacion, busqueda, fechaInicio, fechaFin, estadoBolsa);

            // Convertir "todas"/"todos" a null para ignorar ese filtro
            String bolsaNombreFinal = (bolsaNombre == null || "todas".equals(bolsaNombre) || bolsaNombre.trim().isEmpty()) ? null : bolsaNombre.trim();
            String macrorFinal = (macrorregion == null || "todas".equals(macrorregion) || macrorregion.trim().isEmpty()) ? null : macrorregion.trim();
            String redFinal = (red == null || "todas".equals(red) || red.trim().isEmpty()) ? null : red.trim();
            String ipressFinal = (ipress == null || "todas".equals(ipress) || ipress.trim().isEmpty()) ? null : ipress.trim();
            String especialidadFinal = (especialidad == null || "todas".equals(especialidad) || especialidad.trim().isEmpty()) ? null : especialidad.trim();
            String estadoCod = (estadoCodigo == null || "todos".equals(estadoCodigo) || estadoCodigo.trim().isEmpty()) ? null : estadoCodigo.trim();
            String ipressAtencionFinal = (ipressAtencion == null || ipressAtencion.trim().isEmpty()) ? null : ipressAtencion.trim();
            String tipoCitaFinal = (tipoCita == null || "todas".equals(tipoCita) || tipoCita.trim().isEmpty()) ? null : tipoCita.trim();
            String asignacionFinal = (asignacion == null || "todos".equals(asignacion) || asignacion.trim().isEmpty()) ? null : asignacion.trim();
            String busquedaFinal = (busqueda == null || busqueda.trim().isEmpty()) ? null : busqueda.trim();
            String fechaInicioFinal = (fechaInicio == null || fechaInicio.trim().isEmpty()) ? null : fechaInicio.trim();
            String fechaFinFinal = (fechaFin == null || fechaFin.trim().isEmpty()) ? null : fechaFin.trim();
            String condicionMedicaFinal = (condicionMedica == null || condicionMedica.trim().isEmpty()) ? null : condicionMedica.trim();
            String estadoBolsaFinal = (estadoBolsa == null || "todos".equals(estadoBolsa) || estadoBolsa.trim().isEmpty()) ? null : estadoBolsa.trim();

            // Llamar al repository con filtros
            List<Object[]> resultados = solicitudRepository.findAllWithFiltersAndPagination(
                    bolsaNombreFinal, macrorFinal, redFinal, ipressFinal, especialidadFinal,
                    estadoCod, ipressAtencionFinal, tipoCitaFinal, asignacionFinal, busquedaFinal, fechaInicioFinal, fechaFinFinal, condicionMedicaFinal, gestoraId, estadoBolsaFinal, pageable);

            long total = solicitudRepository.countWithFilters(
                    bolsaNombreFinal, macrorFinal, redFinal, ipressFinal, especialidadFinal,
                    estadoCod, ipressAtencionFinal, tipoCitaFinal, asignacionFinal, busquedaFinal, fechaInicioFinal, fechaFinFinal, condicionMedicaFinal, gestoraId, estadoBolsaFinal);

            // Mapear a DTOs
            List<SolicitudBolsaDTO> dtos = resultados.stream()
                    .map(this::mapFromResultSet)
                    .collect(Collectors.toList());

            log.info("✅ Búsqueda con filtros completada: {} registros en página (Total: {})",
                    dtos.size(), total);

            return new org.springframework.data.domain.PageImpl<>(dtos, pageable, total);

        } catch (Exception e) {
            log.error("❌ Error en búsqueda con filtros: ", e);
            throw new RuntimeException("Error al filtrar solicitudes: " + e.getMessage(), e);
        }
    }

    /**
     * 🔎 Obtiene todas las especialidades únicas pobladas
     * v1.42.0: Para llenar dinámicamente el filtro de especialidades
     * @return lista de especialidades ordenadas alfabéticamente
     */
    @Override
    public List<String> obtenerEspecialidadesUnicas() {
        log.info("🔍 Obteniendo especialidades únicas de la base de datos...");
        try {
            List<String> especialidades = solicitudRepository.obtenerEspecialidadesUnicas();
            log.info("✅ Especialidades únicas obtenidas: {}", especialidades.size());
            return especialidades != null ? especialidades : List.of();
        } catch (Exception e) {
            log.error("❌ Error obteniendo especialidades únicas: ", e);
            return List.of(); // Retornar lista vacía en caso de error
        }
    }

    /**
     * Exporta solicitudes asignadas a la gestora actual a formato EXCEL
     * Incluye TODAS las columnas de la tabla GestionAsegurado
     * Usado en la descarga desde "Mi Bandeja"
     *
     * @param ids lista de IDs de solicitudes a exportar
     * @return datos EXCEL (.xlsx) en bytes
     */
    @Override
    @Transactional(readOnly = true)
    public byte[] exportarExcelAsignados(List<Long> ids) {
        try {
            log.info("📊 Exportando {} solicitudes asignadas a EXCEL", ids.size());

            if (ids.isEmpty()) {
                log.warn("⚠️ No hay solicitudes para exportar");
                return new byte[0];
            }

            // Usar query SQL nativa que trae TODOS los datos con JOINs
            String sql = """
                SELECT 
                    sb.fecha_asignacion,
                    sb.paciente_dni,
                    sb.paciente_nombre,
                    EXTRACT(YEAR FROM AGE(sb.fecha_nacimiento)) as paciente_edad,
                    sb.paciente_sexo,
                    sb.especialidad,
                    per.nom_pers as especialista_nombre,
                    sb.fecha_atencion,
                    sb.hora_atencion,
                    ir.desc_ipress as desc_ipress,
                    sb.tipo_cita,
                    sb.paciente_telefono,
                    sb.paciente_telefono_alterno,
                    dec.desc_estado_cita as desc_estado_cita,
                    sb.fecha_cambio_estado,
                    u.name_user as nombre_usuario_cambio_estado
                FROM dim_solicitud_bolsa sb
                LEFT JOIN dim_personal_cnt per ON sb.id_personal = per.id_pers
                LEFT JOIN dim_ipress ir ON sb.id_ipress = ir.id_ipress
                LEFT JOIN dim_estados_gestion_citas dec ON sb.estado_gestion_citas_id = dec.id_estado_cita
                LEFT JOIN dim_usuarios u ON sb.usuario_cambio_estado_id = u.id_user
                WHERE sb.id_solicitud IN (:ids)
                ORDER BY sb.fecha_asignacion DESC
                """;

            var query = entityManager.createNativeQuery(sql);
            query.setParameter("ids", ids);
            List<Object[]> resultados = query.getResultList();

            if (resultados.isEmpty()) {
                log.warn("⚠️ No hay solicitudes para exportar");
                return new byte[0];
            }

            // Crear workbook Excel con Apache POI
            try (var workbook = new org.apache.poi.xssf.usermodel.XSSFWorkbook()) {
                var sheet = workbook.createSheet("Pacientes Asignados");
                
                // Estilos
                var headerStyle = workbook.createCellStyle();
                headerStyle.setFillForegroundColor(org.apache.poi.ss.usermodel.IndexedColors.DARK_BLUE.getIndex());
                headerStyle.setFillPattern(org.apache.poi.ss.usermodel.FillPatternType.SOLID_FOREGROUND);
                var headerFont = workbook.createFont();
                headerFont.setColor(org.apache.poi.ss.usermodel.IndexedColors.WHITE.getIndex());
                headerFont.setBold(true);
                headerStyle.setFont(headerFont);
                headerStyle.setAlignment(org.apache.poi.ss.usermodel.HorizontalAlignment.CENTER);
                
                // Encabezados
                String[] headers = {
                    "FECHA ASIGNACIÓN", "DNI PACIENTE", "NOMBRE PACIENTE", "EDAD", "GÉNERO",
                    "ESPECIALIDAD", "ESPECIALISTA", "FECHA Y HORA CITA", "IPRESS", "TIPO CITA",
                    "TELÉFONO 1", "TELÉFONO 2", "ESTADO", "FECHA CAMBIO ESTADO", "USUARIO CAMBIO ESTADO"
                };
                
                // Crear fila de encabezado
                var headerRow = sheet.createRow(0);
                for (int i = 0; i < headers.length; i++) {
                    var cell = headerRow.createCell(i);
                    cell.setCellValue(headers[i]);
                    cell.setCellStyle(headerStyle);
                }
                
                // Llenar datos desde resultados SQL
                int rowNum = 1;
                for (Object[] row : resultados) {
                    var excelRow = sheet.createRow(rowNum++);
                    
                    int col = 0;
                    // 0: fecha_asignacion
                    excelRow.createCell(col++).setCellValue(row[0] != null ? row[0].toString() : "");
                    
                    // 1: paciente_dni
                    excelRow.createCell(col++).setCellValue(row[1] != null ? row[1].toString() : "");
                    
                    // 2: paciente_nombre
                    excelRow.createCell(col++).setCellValue(row[2] != null ? row[2].toString() : "");
                    
                    // 3: paciente_edad
                    excelRow.createCell(col++).setCellValue(row[3] != null ? row[3].toString() : "");
                    
                    // 4: paciente_sexo
                    excelRow.createCell(col++).setCellValue(row[4] != null ? row[4].toString() : "");
                    
                    // 5: especialidad
                    excelRow.createCell(col++).setCellValue(row[5] != null ? row[5].toString() : "");
                    
                    // 6: especialista_nombre
                    excelRow.createCell(col++).setCellValue(row[6] != null ? row[6].toString() : "");
                    
                    // 7-8: fecha_atencion + hora_atencion
                    String fechaHora = "";
                    if (row[7] != null && row[8] != null) {
                        fechaHora = row[7].toString() + " " + row[8].toString();
                    } else if (row[7] != null) {
                        fechaHora = row[7].toString();
                    }
                    excelRow.createCell(col++).setCellValue(fechaHora);
                    
                    // 9: desc_ipress
                    excelRow.createCell(col++).setCellValue(row[9] != null ? row[9].toString() : "");
                    
                    // 10: tipo_cita
                    excelRow.createCell(col++).setCellValue(row[10] != null ? row[10].toString() : "");
                    
                    // 11: paciente_telefono
                    excelRow.createCell(col++).setCellValue(row[11] != null ? row[11].toString() : "");
                    
                    // 12: paciente_telefono_alterno
                    excelRow.createCell(col++).setCellValue(row[12] != null ? row[12].toString() : "");
                    
                    // 13: desc_estado_cita
                    excelRow.createCell(col++).setCellValue(row[13] != null ? row[13].toString() : "");
                    
                    // 14: fecha_cambio_estado
                    excelRow.createCell(col++).setCellValue(row[14] != null ? row[14].toString() : "");
                    
                    // 15: nombre_usuario_cambio_estado
                    excelRow.createCell(col++).setCellValue(row[15] != null ? row[15].toString() : "");
                }
                
                // Ajustar ancho de columnas
                for (int i = 0; i < headers.length; i++) {
                    sheet.autoSizeColumn(i);
                }
                
                // Convertir a bytes
                var outputStream = new java.io.ByteArrayOutputStream();
                workbook.write(outputStream);
                log.info("✅ EXCEL generado exitosamente con {} registros", resultados.size());
                return outputStream.toByteArray();
            }

        } catch (Exception e) {
            log.error("❌ Error exportando solicitudes asignadas a EXCEL: ", e);
            return new byte[0];
        }
    }

    /**
     * Exporta solicitudes asignadas a la gestora actual a formato CSV
     * Usado en la descarga desde "Mi Bandeja" (GestionAsegurado)
     *
     * @param ids lista de IDs de solicitudes a exportar
     * @return datos CSV en bytes
     */
    @Override
    public byte[] exportarCSVAsignados(List<Long> ids) {
        try {
            log.info("📄 Exportando {} solicitudes asignadas a CSV", ids.size());

            // Obtener las solicitudes por IDs especificados
            List<SolicitudBolsaDTO> solicitudes = ids.stream()
                .map(id -> obtenerPorId(id).orElse(null))
                .filter(s -> s != null)
                .toList();

            if (solicitudes.isEmpty()) {
                log.warn("⚠️ No hay solicitudes para exportar");
                return new byte[0];
            }

            // Construir CSV manualmente con TODAS LAS COLUMNAS de la tabla
            StringBuilder csv = new StringBuilder();

            // Encabezados (coincidiendo con las columnas de la tabla en GestionAsegurado)
            csv.append("FECHA ASIGNACIÓN,DNI PACIENTE,NOMBRE PACIENTE,EDAD,GÉNERO,ESPECIALIDAD,ESPECIALISTA,");
            csv.append("FECHA Y HORA CITA,IPRESS,TIPO CITA,TELÉFONO 1,TELÉFONO 2,ESTADO,");
            csv.append("FECHA CAMBIO ESTADO,USUARIO CAMBIO ESTADO\n");

            // Datos - con formato compatible
            for (SolicitudBolsaDTO solicitud : solicitudes) {
                // Fecha Asignación
                String fechaAsignacion = solicitud.getFechaAsignacion() != null 
                    ? solicitud.getFechaAsignacion().toString() 
                    : "";
                csv.append(escaparCSV(fechaAsignacion)).append(",");
                
                // DNI Paciente
                csv.append(escaparCSV(solicitud.getPacienteDni())).append(",");
                
                // Nombre Paciente
                csv.append(escaparCSV(solicitud.getPacienteNombre())).append(",");
                
                // Edad
                csv.append(escaparCSV(String.valueOf(solicitud.getPacienteEdad() != null ? solicitud.getPacienteEdad() : ""))).append(",");
                
                // Género
                csv.append(escaparCSV(solicitud.getPacienteSexo())).append(",");
                
                // Especialidad
                csv.append(escaparCSV(solicitud.getEspecialidad())).append(",");
                
                // Especialista (ID del personal/médico asignado)
                String especialista = solicitud.getIdPersonal() != null ? String.valueOf(solicitud.getIdPersonal()) : "";
                csv.append(escaparCSV(especialista)).append(",");
                
                // Fecha y Hora de Cita
                String fechaHoraCita = solicitud.getFechaAtencion() != null && solicitud.getHoraAtencion() != null
                    ? solicitud.getFechaAtencion() + " " + solicitud.getHoraAtencion()
                    : "";
                csv.append(escaparCSV(fechaHoraCita)).append(",");
                
                // IPRESS
                csv.append(escaparCSV(solicitud.getDescIpress())).append(",");
                
                // Tipo de Cita
                csv.append(escaparCSV(solicitud.getTipoCita())).append(",");
                
                // Teléfono 1
                csv.append(escaparCSV(solicitud.getPacienteTelefono())).append(",");
                
                // Teléfono 2
                csv.append(escaparCSV(solicitud.getPacienteTelefonoAlterno())).append(",");
                
                // Estado
                csv.append(escaparCSV(solicitud.getDescEstadoCita())).append(",");
                
                // Fecha Cambio Estado
                String fechaCambioEstado = solicitud.getFechaCambioEstado() != null 
                    ? solicitud.getFechaCambioEstado().toString() 
                    : "";
                csv.append(escaparCSV(fechaCambioEstado)).append(",");
                
                // Usuario Cambio Estado
                csv.append(escaparCSV(solicitud.getNombreUsuarioCambioEstado() != null ? solicitud.getNombreUsuarioCambioEstado() : "")).append("\n");
            }

            log.info("✅ CSV generado exitosamente con {} registros (todas las columnas)", solicitudes.size());
            return csv.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
        } catch (Exception e) {
            log.error("❌ Error exportando solicitudes asignadas a CSV: ", e);
            return new byte[0];
        }
    }

    /**
     * Exporta solicitudes seleccionadas a formato CSV
     * Versión general que permite exportar cualquier solicitud sin restricción de gestora
     *
     * @param ids lista de IDs de solicitudes a exportar
     * @return datos CSV en bytes
     */
    @Override
    public byte[] exportarCSV(List<Long> ids) {
        try {
            log.info("📄 Exportando {} solicitudes seleccionadas a CSV", ids.size());

            // Obtener las solicitudes por IDs especificados
            List<SolicitudBolsaDTO> solicitudes = ids.stream()
                .map(id -> obtenerPorId(id).orElse(null))
                .filter(s -> s != null)
                .toList();

            if (solicitudes.isEmpty()) {
                log.warn("⚠️ No hay solicitudes para exportar");
                return new byte[0];
            }

            // Construir CSV manualmente con los campos deseados
            StringBuilder csv = new StringBuilder();

            // Encabezados
            csv.append("DNI,NOMBRE,EDAD,SEXO,TELÉFONO 1,TELÉFONO 2,ESPECIALIDAD,IPRESS,RED,MACRORREGIÓN,TIPO BOLSA,ESTADO,FECHA SOLICITUD\n");

            // Datos
            for (SolicitudBolsaDTO solicitud : solicitudes) {
                csv.append(escaparCSV(solicitud.getPacienteDni())).append(",");
                csv.append(escaparCSV(solicitud.getPacienteNombre())).append(",");
                csv.append(escaparCSV(String.valueOf(solicitud.getPacienteEdad()))).append(",");
                csv.append(escaparCSV(solicitud.getPacienteSexo())).append(",");
                csv.append(escaparCSV(solicitud.getPacienteTelefono())).append(",");
                csv.append(escaparCSV(solicitud.getPacienteTelefonoAlterno())).append(",");
                csv.append(escaparCSV(solicitud.getEspecialidad())).append(",");
                csv.append(escaparCSV(solicitud.getDescIpress())).append(",");
                csv.append(escaparCSV(solicitud.getDescRed())).append(",");
                csv.append(escaparCSV(solicitud.getDescMacroregion())).append(",");
                csv.append(escaparCSV(solicitud.getDescTipoBolsa())).append(",");
                csv.append(escaparCSV(solicitud.getDescEstadoCita())).append(",");
                csv.append(escaparCSV(String.valueOf(solicitud.getFechaSolicitud()))).append("\n");
            }

            log.info("✅ CSV generado exitosamente con {} registros", solicitudes.size());
            return csv.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
        } catch (Exception e) {
            log.error("❌ Error exportando solicitudes a CSV: ", e);
            return new byte[0];
        }
    }

    /**
     * Obtiene el nombre completo del usuario desde PersonalCnt o retorna username
     * @param usuario usuario del cual obtener el nombre
     * @return nombre completo o username si no está disponible
     */
    private String obtenerNombreCompleto(Usuario usuario) {
        if (usuario == null) {
            return null;
        }

        try {
            // Intentar cargar PersonalCnt para obtener nombre completo
            if (usuario.getPersonalCnt() != null) {
                String nombreCompleto = usuario.getPersonalCnt().getNombreCompleto();
                if (nombreCompleto != null && !nombreCompleto.trim().isEmpty()) {
                    return nombreCompleto;
                }
            }
        } catch (Exception e) {
            log.warn("Error cargando nombre completo de PersonalCnt para usuario {}: {}", usuario.getIdUser(), e.getMessage());
        }

        // Fallback al username si no está disponible el nombre completo
        return usuario.getNameUser();
    }

    /**
     * Escapa caracteres especiales en campos CSV
     * @param valor valor a escapar
     * @return valor escapado
     */
    private String escaparCSV(String valor) {
        if (valor == null || valor.isEmpty()) {
            return "";
        }
        // Si contiene coma, comillas o saltos de línea, envolver en comillas y escapar comillas internas
        if (valor.contains(",") || valor.contains("\"") || valor.contains("\n")) {
            return "\"" + valor.replace("\"", "\"\"") + "\"";
        }
        return valor;
    }

    // ============================================================================
    // ➕ IMPORTACIÓN DE PACIENTES ADICIONALES (v1.46.0)
    // ============================================================================

    @Override
    @Transactional(readOnly = true)
    public Optional<SolicitudBolsaDTO> buscarAsignacionExistente(String pacienteDni) {
        return solicitudRepository
            .findFirstByPacienteDniAndActivoTrueOrderByFechaSolicitudDesc(pacienteDni)
            .map(SolicitudBolsaMapper::toDTO);
    }

    @Override
    @Transactional
    public SolicitudBolsaDTO crearSolicitudAdicional(CrearSolicitudAdicionalRequest request, String username) {
        log.info("📝 Creando solicitud adicional para DNI: {}", request.getPacienteDni());
        log.info("🔍 [v1.46.5] ESPECIALIDAD RECIBIDA: '{}' (null={})", request.getEspecialidad(), request.getEspecialidad() == null);

        // ✅ v1.46.0: PERMITIR MÚLTIPLES ASIGNACIONES del mismo paciente
        // Un paciente puede tener múltiples solicitudes/asignaciones activas a diferentes médicos
        // Solo validar que el paciente exista en la BD de asegurados

        Asegurado asegurado = aseguradoRepository.findByDocPaciente(request.getPacienteDni())
            .orElseThrow(() -> new ResourceNotFoundException(
                "Paciente con DNI " + request.getPacienteDni() + " no existe en la base de datos"
            ));

        log.info("✅ Paciente validado: {} - DNI: {}", asegurado.getPaciente(), request.getPacienteDni());

        // 2. Obtener ID del usuario actual para auto-asignación (v1.46.4)
        log.info("🔍 [Auto-Assign] Buscando usuario con username: '{}'", username);
        Usuario usuarioActual = usuarioRepository.findByNameUserWithFullDetails(username)
            .orElse(null);
        Long responsableGestoraId = usuarioActual != null ? usuarioActual.getIdUser() : null;
        log.info("🔍 [Auto-Assign] Usuario encontrado: {} → ID: {}", usuarioActual != null ? usuarioActual.getNameUser() : "NO ENCONTRADO", responsableGestoraId);

        // 3.1 Obtener ID del servicio (v1.47.0)
        // Prioridad: 1) idServicio directo del request, 2) buscar por nombre de especialidad
        Long idServicio = 1L; // Valor por defecto
        if (request.getIdServicio() != null) {
            // ✅ v1.47.0: Usar idServicio directo si viene en el request
            idServicio = request.getIdServicio();
            log.info("✅ [v1.47.0] Usando idServicio directo del request: {}", idServicio);
        } else if (request.getEspecialidad() != null && !request.getEspecialidad().trim().isEmpty()) {
            // Fallback: buscar por nombre de especialidad
            Optional<DimServicioEssi> servicioOpt = dimServicioEssiRepository
                .findFirstByDescServicioIgnoreCaseAndEstado(request.getEspecialidad().trim(), "A");
            if (servicioOpt.isPresent()) {
                idServicio = servicioOpt.get().getIdServicio();
                log.info("✅ [v1.47.0] Servicio encontrado por nombre: '{}' → idServicio={}", request.getEspecialidad(), idServicio);
            } else {
                log.warn("⚠️ [v1.47.0] Servicio '{}' no encontrado, usando idServicio por defecto: 1", request.getEspecialidad());
            }
        }

        // 4. UPSERT: si ya existe registro sin profesional asignado, actualizarlo; si no, crear nuevo
        Optional<SolicitudBolsa> existenteOpt = solicitudRepository
            .findFirstByPacienteDniAndActivoTrueOrderByFechaSolicitudDesc(request.getPacienteDni());

        SolicitudBolsa guardado;
        if (existenteOpt.isPresent() && existenteOpt.get().getIdPersonal() == null) {
            // ✅ Actualizar registro existente sin profesional
            SolicitudBolsa existente = existenteOpt.get();
            log.info("🔄 Registro existente sin profesional encontrado (ID: {}). Actualizando...", existente.getIdSolicitud());
            existente.setIdPersonal(request.getIdPersonal());
            existente.setFechaAtencion(request.getFechaAtencion());
            existente.setHoraAtencion(request.getHoraAtencion());
            existente.setEspecialidad(request.getEspecialidad());
            existente.setTipoCita(request.getTipoCita());
            if (responsableGestoraId != null) existente.setResponsableGestoraId(responsableGestoraId);
            guardado = solicitudRepository.save(existente);
            log.info("✅ Solicitud actualizada: {} - Profesional ID: {}", guardado.getIdSolicitud(), request.getIdPersonal());
        } else {
            // Crear nueva solicitud
            String numeroSolicitud2 = generarNumeroSolicitud();
            SolicitudBolsa nuevaSolicitud = SolicitudBolsa.builder()
                .numeroSolicitud(numeroSolicitud2)
                .pacienteDni(request.getPacienteDni())
                .pacienteNombre(request.getPacienteNombre())
                .pacienteId(asegurado.getPkAsegurado())
                .pacienteSexo(request.getPacienteSexo())
                .pacienteTelefono(request.getPacienteTelefono())
                .pacienteTelefonoAlterno(request.getPacienteTelefonoAlterno())
                .codigoIpressAdscripcion(request.getDescIpress())
                .codigoAdscripcion(request.getDescIpress())
                .tipoCita(request.getTipoCita())
                .especialidad(request.getEspecialidad())
                .estado("PENDIENTE")
                .estadoGestionCitasId(1L)
                .idBolsa(10L)
                .idServicio(idServicio)
                .idPersonal(request.getIdPersonal())
                .fechaAtencion(request.getFechaAtencion())
                .horaAtencion(request.getHoraAtencion())
                .condicionMedica("Pendiente")
                .responsableGestoraId(responsableGestoraId)
                .fechaAsignacion(OffsetDateTime.now())
                .activo(true)
                .build();
            guardado = solicitudRepository.save(nuevaSolicitud);
            log.info("✅ Solicitud adicional creada: {} - Asignada a gestor ID: {}", guardado.getIdSolicitud(), responsableGestoraId);
        }

        // 6. Mapear a DTO
        return SolicitudBolsaMapper.toDTO(guardado);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SolicitudBolsaDTO> buscarPorDni(String dni) {
        log.info("🔍 Buscando solicitudes para DNI: {}", dni);

        List<SolicitudBolsa> solicitudes = solicitudRepository
            .findByPacienteDniAndActivoTrue(dni);

        return solicitudes.stream()
            .map(SolicitudBolsaMapper::toDTO)
            .collect(Collectors.toList());
    }

    /**
     * Obtiene estadísticas de pacientes agrupados por gestora de citas
     */
    @Override
    @Transactional(readOnly = true)
    public List<com.styp.cenate.dto.bolsas.BolsaXGestoraDTO> obtenerEstadisticasPorGestora() {
        log.info("📊 Obteniendo estadísticas por gestora de citas...");

        List<Object[]> rows = solicitudRepository.estadisticasPorGestora();

        List<com.styp.cenate.dto.bolsas.BolsaXGestoraDTO> result = new ArrayList<>();
        for (Object[] row : rows) {
            result.add(com.styp.cenate.dto.bolsas.BolsaXGestoraDTO.builder()
                .idGestora(row[0] != null ? ((Number) row[0]).longValue() : null)
                .nombreGestora(row[1] != null ? row[1].toString() : "Sin nombre")
                .total(row[2] != null ? ((Number) row[2]).longValue() : 0L)
                .porCitar(row[3] != null ? ((Number) row[3]).longValue() : 0L)
                .citados(row[4] != null ? ((Number) row[4]).longValue() : 0L)
                .enSeguimiento(row[5] != null ? ((Number) row[5]).longValue() : 0L)
                .observados(row[6] != null ? ((Number) row[6]).longValue() : 0L)
                .cerrados(row[7] != null ? ((Number) row[7]).longValue() : 0L)
                .atendidos(row[8] != null ? ((Number) row[8]).longValue() : 0L)
                .build());
        }

        log.info("✅ Estadísticas por gestora: {} gestoras encontradas", result.size());
        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public List<com.styp.cenate.dto.bolsas.BolsaXGestoraDTO> obtenerEstadisticasPorGestora(String fechaDesde, String fechaHasta) {
        log.info("📊 Estadísticas por gestora con filtro fechas: {} → {}", fechaDesde, fechaHasta);

        List<Object[]> rows = solicitudRepository.estadisticasPorGestoraFiltrado(
            (fechaDesde != null && !fechaDesde.isEmpty()) ? fechaDesde : null,
            (fechaHasta != null && !fechaHasta.isEmpty()) ? fechaHasta : null
        );

        List<com.styp.cenate.dto.bolsas.BolsaXGestoraDTO> result = new ArrayList<>();
        for (Object[] row : rows) {
            result.add(com.styp.cenate.dto.bolsas.BolsaXGestoraDTO.builder()
                .idGestora(row[0] != null ? ((Number) row[0]).longValue() : null)
                .nombreGestora(row[1] != null ? row[1].toString() : "Sin nombre")
                .total(row[2] != null ? ((Number) row[2]).longValue() : 0L)
                .porCitar(row[3] != null ? ((Number) row[3]).longValue() : 0L)
                .citados(row[4] != null ? ((Number) row[4]).longValue() : 0L)
                .enSeguimiento(row[5] != null ? ((Number) row[5]).longValue() : 0L)
                .observados(row[6] != null ? ((Number) row[6]).longValue() : 0L)
                .cerrados(row[7] != null ? ((Number) row[7]).longValue() : 0L)
                .atendidos(row[8] != null ? ((Number) row[8]).longValue() : 0L)
                .build());
        }

        log.info("✅ Estadísticas filtradas: {} gestoras", result.size());
        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public List<java.util.Map<String, Object>> obtenerConteoPorFecha(String mes) {
        log.info("📅 Conteo asignaciones por fecha, mes: {}", mes);
        List<Object[]> rows = solicitudRepository.conteoPorFecha(mes);
        List<java.util.Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : rows) {
            result.add(java.util.Map.of(
                "fecha", row[0] != null ? row[0].toString() : "",
                "total", row[1] != null ? ((Number) row[1]).longValue() : 0L
            ));
        }
        log.info("✅ Conteo por fecha: {} días con datos", result.size());
        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public List<com.styp.cenate.dto.bolsas.BolsaXMedicoDTO> obtenerEstadisticasPorMedico() {
        log.info("📊 Obteniendo estadísticas por médico...");
        List<Object[]> rows = solicitudRepository.estadisticasPorMedico();
        List<com.styp.cenate.dto.bolsas.BolsaXMedicoDTO> result = new ArrayList<>();
        for (Object[] row : rows) {
            result.add(com.styp.cenate.dto.bolsas.BolsaXMedicoDTO.builder()
                .idMedico(row[0] != null ? ((Number) row[0]).longValue() : null)
                .nombreMedico(row[1] != null ? row[1].toString() : "Sin nombre")
                .total(row[2] != null ? ((Number) row[2]).longValue() : 0L)
                .porCitar(row[3] != null ? ((Number) row[3]).longValue() : 0L)
                .citados(row[4] != null ? ((Number) row[4]).longValue() : 0L)
                .enSeguimiento(row[5] != null ? ((Number) row[5]).longValue() : 0L)
                .observados(row[6] != null ? ((Number) row[6]).longValue() : 0L)
                .cerrados(row[7] != null ? ((Number) row[7]).longValue() : 0L)
                .atendidos(row[8] != null ? ((Number) row[8]).longValue() : 0L)
                .build());
        }
        log.info("✅ Estadísticas por médico: {} médicos", result.size());
        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public List<com.styp.cenate.dto.bolsas.BolsaXMedicoDTO> obtenerEstadisticasPorMedico(String fechaDesde, String fechaHasta) {
        log.info("📊 Estadísticas por médico con filtro: {} → {}", fechaDesde, fechaHasta);
        List<Object[]> rows = solicitudRepository.estadisticasPorMedicoFiltrado(
            (fechaDesde != null && !fechaDesde.isEmpty()) ? fechaDesde : null,
            (fechaHasta != null && !fechaHasta.isEmpty()) ? fechaHasta : null
        );
        List<com.styp.cenate.dto.bolsas.BolsaXMedicoDTO> result = new ArrayList<>();
        for (Object[] row : rows) {
            result.add(com.styp.cenate.dto.bolsas.BolsaXMedicoDTO.builder()
                .idMedico(row[0] != null ? ((Number) row[0]).longValue() : null)
                .nombreMedico(row[1] != null ? row[1].toString() : "Sin nombre")
                .total(row[2] != null ? ((Number) row[2]).longValue() : 0L)
                .porCitar(row[3] != null ? ((Number) row[3]).longValue() : 0L)
                .citados(row[4] != null ? ((Number) row[4]).longValue() : 0L)
                .enSeguimiento(row[5] != null ? ((Number) row[5]).longValue() : 0L)
                .observados(row[6] != null ? ((Number) row[6]).longValue() : 0L)
                .cerrados(row[7] != null ? ((Number) row[7]).longValue() : 0L)
                .atendidos(row[8] != null ? ((Number) row[8]).longValue() : 0L)
                .build());
        }
        log.info("✅ Estadísticas por médico filtradas: {} médicos", result.size());
        return result;
    }

    /**
     * Genera número de solicitud único con formato: IMP-YYYYMMDD-NNNN
     */
    private String generarNumeroSolicitud() {
        String fecha = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));

        // Contar solicitudes del día
        long contador = solicitudRepository.countByFechaSolicitudBetween(
            LocalDateTime.now().toLocalDate().atStartOfDay(),
            LocalDateTime.now().toLocalDate().atTime(23, 59, 59)
        );

        return String.format("IMP-%s-%04d", fecha, contador + 1);
    }

    // ============================================================================
    // 🔧 MÉTODO AUXILIAR: Extraer nombre del constraint de la excepción
    // ============================================================================
    private String extraerConstraintName(org.springframework.dao.DataIntegrityViolationException e) {
        String mensaje = e.getMessage();
        if (mensaje == null) {
            return "unknown_constraint";
        }

        // Buscar patrón: constraint "nombre_constraint"
        if (mensaje.contains("constraint \"")) {
            int inicio = mensaje.indexOf("constraint \"") + 12;
            int fin = mensaje.indexOf("\"", inicio);
            if (fin > inicio) {
                return mensaje.substring(inicio, fin);
            }
        }

        // Buscar patrón alternativo: violates foreign key constraint "nombre"
        if (mensaje.contains("violates foreign key constraint \"")) {
            int inicio = mensaje.indexOf("violates foreign key constraint \"") + 34;
            int fin = mensaje.indexOf("\"", inicio);
            if (fin > inicio) {
                return mensaje.substring(inicio, fin);
            }
        }

        // Si no encuentra, devolver genérico
        return "unknown_constraint";
    }

    /**
     * Extrae el tipo de violación de constraint del mensaje de error SQL
     * Detecta: FK_VIOLATION, UNIQUE_VIOLATION, NOT_NULL_VIOLATION, CHECK_VIOLATION
     */
    private String extraerTipoViolacion(org.springframework.dao.DataIntegrityViolationException e) {
        String mensaje = e.getMessage() != null ? e.getMessage().toUpperCase() : "";
        
        // Verificar por texto del mensaje
        if (mensaje.contains("FOREIGN KEY")) {
            return "FK_VIOLATION";
        } else if (mensaje.contains("UNIQUE") || mensaje.contains("duplicate key")) {
            return "UNIQUE_VIOLATION";
        } else if (mensaje.contains("NOT NULL")) {
            return "NOT_NULL_VIOLATION";
        } else if (mensaje.contains("CHECK")) {
            return "CHECK_VIOLATION";
        }
        
        // Verificar por SQLState
        if (mensaje.contains("23503")) {
            return "FK_VIOLATION"; // SQLState 23503 = FK violation
        } else if (mensaje.contains("23505")) {
            return "UNIQUE_VIOLATION"; // SQLState 23505 = UNIQUE violation
        } else if (mensaje.contains("23502")) {
            return "NOT_NULL_VIOLATION"; // SQLState 23502 = NOT NULL violation
        }
        
        return "CONSTRAINT_VIOLATION"; // Genérico si no se identifica
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public org.springframework.data.domain.Page<java.util.Map<String, Object>> obtenerTrazabilidadRecitas(
            String busqueda, String fechaInicio, String fechaFin,
            String tipoCita, Long idPersonal,
            org.springframework.data.domain.Pageable pageable) {

        org.springframework.data.domain.Page<Object[]> rows =
            solicitudRepository.obtenerTrazabilidadRecitasInterconsultas(
                busqueda, fechaInicio, fechaFin, tipoCita, idPersonal, pageable);

        return rows.map(row -> {
            java.util.Map<String, Object> m = new java.util.LinkedHashMap<>();
            m.put("idSolicitud",         row[0]);
            m.put("numeroSolicitud",     row[1]);
            m.put("tipoCita",            row[2]);
            m.put("pacienteDni",         row[3]);
            m.put("pacienteNombre",      row[4]);
            m.put("especialidadDestino", row[5]);
            m.put("fechaSolicitud",      row[6]);
            m.put("estado",              row[7]);
            m.put("codEstado",           row[8]);
            m.put("descEstado",          row[9]);
            m.put("solicitudOrigen",     row[10]);
            m.put("idPersonalCreador",   row[11]);
            m.put("medicoCreador",       row[12]);
            m.put("usuarioCreador",      row[13]);
            m.put("fechaAtencionOrigen", row[14]);
            m.put("especialidadOrigen",  row[15]);
            m.put("fechaPreferida",      row[16]);
            m.put("origenBolsa",         row[17]);
            return m;
        });
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public java.util.List<java.util.Map<String, Object>> listarEnfermerasTrazabilidad() {
        return solicitudRepository.listarEnfermerasTrazabilidad().stream().map(row -> {
            java.util.Map<String, Object> m = new java.util.LinkedHashMap<>();
            m.put("idPersonal", row[0]);
            m.put("nombre",     row[1]);
            m.put("total",      row[2]);
            return m;
        }).toList();
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public java.util.Map<String, Object> obtenerKpisTrazabilidad() {
        java.util.Map<String, Object> row = solicitudRepository.kpisTrazabilidad();
        java.util.Map<String, Object> m = new java.util.LinkedHashMap<>();
        m.put("total",          row.get("total"));
        m.put("recitas",        row.get("recitas"));
        m.put("interconsultas", row.get("interconsultas"));
        m.put("sinCreador",     row.get("sin_creador"));
        return m;
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public java.util.List<java.util.Map<String, Object>> obtenerFechasConRecitas() {
        return solicitudRepository.fechasConRecitasInterconsultas().stream().map(row -> {
            java.util.Map<String, Object> m = new java.util.LinkedHashMap<>();
            m.put("fecha", row[0]);
            m.put("total", row[1]);
            return m;
        }).toList();
    }

    // ============================================================================
    // 📤 CARGA MASIVA DESDE EXCEL (v1.65.0)
    // Reemplaza el proceso manual SQL+Python por un endpoint REST
    // ============================================================================
    @Override
    @Transactional
    public Map<String, Object> cargaMasivaPacientes(com.styp.cenate.dto.bolsas.CargaMasivaRequest request) {
        if (request.getPacientes() == null || request.getPacientes().isEmpty()) {
            return Map.of("total", 0, "insertados", 0, "duplicados", 0, "errores", 0, "detalleErrores", List.of());
        }

        int total = request.getPacientes().size();
        int insertados = 0;
        int duplicados = 0;
        List<String> detalleErrores = new ArrayList<>();
        List<Map<String, String>> detalleDuplicados = new ArrayList<>();
        List<SolicitudBolsa> toInsert = new ArrayList<>();
        long baseTs = System.currentTimeMillis();

        Long idPersonal = request.getIdPersonal();
        String especialidad = request.getEspecialidad() != null ? request.getEspecialidad() : "ENFERMERIA";
        Long idServicio = request.getIdServicio() != null ? request.getIdServicio() : 56L;
        Long responsableGestoraId = request.getResponsableGestoraId() != null ? request.getResponsableGestoraId() : 688L;
        Long idBolsa = 10L;

        for (int i = 0; i < request.getPacientes().size(); i++) {
            com.styp.cenate.dto.bolsas.CargaMasivaRequest.PacienteExcelRow row = request.getPacientes().get(i);
            try {
                if (row.getDocPaciente() == null || row.getDocPaciente().isBlank()) {
                    detalleErrores.add("Fila " + (i + 1) + ": DNI vacío");
                    continue;
                }
                String dni = row.getDocPaciente().trim();

                // 1. Insertar en asegurados ON CONFLICT DO NOTHING
                entityManager.createNativeQuery(
                    "INSERT INTO asegurados (pk_asegurado, doc_paciente) VALUES (:dni, :dni) ON CONFLICT DO NOTHING"
                ).setParameter("dni", dni).executeUpdate();

                // 2. Verificar duplicado (mismo id_bolsa + paciente_id)
                if (solicitudRepository.existsByIdBolsaAndPacienteId(idBolsa, dni)) {
                    log.debug("⚠️ Duplicado detectado: bolsa={}, dni={}", idBolsa, dni);
                    duplicados++;
                    Map<String, String> dup = new HashMap<>();
                    dup.put("dni", dni);
                    dup.put("nombre", row.getPaciente() != null ? row.getPaciente().trim() : "—");
                    detalleDuplicados.add(dup);
                    continue;
                }

                // 3. Parsear hora de cita
                java.time.LocalTime horaAtencion = null;
                try {
                    if (row.getHoraCita() != null && !row.getHoraCita().isBlank()) {
                        String horaStr = row.getHoraCita().trim();
                        if (horaStr.length() > 8) horaStr = horaStr.substring(0, 8);
                        horaAtencion = java.time.LocalTime.parse(horaStr);
                    }
                } catch (Exception e) {
                    log.warn("⚠️ No se pudo parsear hora '{}' para DNI {}: {}", row.getHoraCita(), dni, e.getMessage());
                }

                // 4. Construir la entidad
                String numeroSolicitud = "REC-" + (baseTs + i);
                SolicitudBolsa solicitud = SolicitudBolsa.builder()
                    .numeroSolicitud(numeroSolicitud)
                    .idBolsa(idBolsa)
                    .idPersonal(idPersonal)
                    .pacienteDni(dni)
                    .pacienteId(dni)
                    .pacienteNombre(row.getPaciente() != null ? row.getPaciente().trim() : "")
                    .pacienteSexo(row.getSexo())
                    .pacienteTelefono(row.getTelMovil())
                    .codigoAdscripcion(row.getCasAdscripcion())
                    .codigoIpressAdscripcion(row.getIpressAtencion())
                    .horaAtencion(horaAtencion)
                    .tipoCita(row.getTipoCita())
                    .especialidad(especialidad)
                    .idServicio(idServicio)
                    .responsableGestoraId(responsableGestoraId)
                    .estado("PENDIENTE")
                    .estadoGestionCitasId(1L)
                    .activo(true)
                    .fechaAtencion(LocalDate.now())
                    .fechaSolicitud(OffsetDateTime.now())
                    .fechaActualizacion(OffsetDateTime.now())
                    .fechaAsignacion(OffsetDateTime.now())
                    .build();

                toInsert.add(solicitud);
                insertados++;

            } catch (Exception e) {
                String dni = row.getDocPaciente() != null ? row.getDocPaciente() : "?";
                log.error("❌ Error procesando fila {} (DNI {}): {}", i + 1, dni, e.getMessage());
                detalleErrores.add("Fila " + (i + 1) + " (DNI " + dni + "): " + e.getMessage());
            }
        }

        if (!toInsert.isEmpty()) {
            solicitudRepository.saveAll(toInsert);
            entityManager.flush();
            log.info("✅ Carga masiva: {} insertados, {} duplicados, {} errores de {} total",
                insertados, duplicados, detalleErrores.size(), total);
        }

        Map<String, Object> resultado = new HashMap<>();
        resultado.put("total", total);
        resultado.put("insertados", insertados);
        resultado.put("duplicados", duplicados);
        resultado.put("detalleDuplicados", detalleDuplicados);
        resultado.put("errores", detalleErrores.size());
        resultado.put("detalleErrores", detalleErrores);
        return resultado;
    }
}
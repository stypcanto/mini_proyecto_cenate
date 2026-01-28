package com.styp.cenate.service.form107;

import java.io.InputStream;
import java.security.MessageDigest;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Base64;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.CellValue;
import org.apache.poi.ss.usermodel.DateUtil;
import org.apache.poi.ss.usermodel.FormulaEvaluator;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.styp.cenate.dto.form107.Bolsa107RawRow;
import com.styp.cenate.dto.form107.ExcelImportResult;
import com.styp.cenate.exception.ExcelCargaDuplicadaException;
import com.styp.cenate.exception.ExcelValidationException;
import com.styp.cenate.model.form107.Bolsa107Carga;
import com.styp.cenate.model.Asegurado;
import com.styp.cenate.model.TipoBolsa;
import com.styp.cenate.model.DimServicioEssi;
import com.styp.cenate.model.EstadoGestionCita;
import com.styp.cenate.model.bolsas.SolicitudBolsa;
import com.styp.cenate.model.bolsas.HistorialCargaBolsas;
import com.styp.cenate.repository.form107.Bolsa107CargaRepository;
import com.styp.cenate.repository.form107.Bolsa107RawDao;
import com.styp.cenate.repository.bolsas.HistorialCargaBolsasRepository;
import com.styp.cenate.repository.AseguradoRepository;
import com.styp.cenate.repository.TipoBolsaRepository;
import com.styp.cenate.repository.DimServicioEssiRepository;
import com.styp.cenate.repository.EstadoGestionCitaRepository;
import com.styp.cenate.repository.IpressRepository;
import com.styp.cenate.repository.bolsas.SolicitudBolsaRepository;
import com.styp.cenate.util.ExcelHeaderNormalizer;
import com.styp.cenate.model.Ipress;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class ExcelImportService {

	private final Bolsa107CargaRepository cargaRepo;
	private final Bolsa107RawDao rawDao;
	private final JdbcTemplate jdbc;
	private final SolicitudBolsaRepository solicitudRepository;
	private final HistorialCargaBolsasRepository historialCargaBolsasRepository;
	private final TipoBolsaRepository tipoBolsaRepository;
	private final DimServicioEssiRepository servicioRepository;
	private final AseguradoRepository aseguradoRepository;
	private final EstadoGestionCitaRepository estadoCitaRepository;
	private final IpressRepository ipressRepository;

	public ExcelImportService(
		Bolsa107CargaRepository cargaRepo,
		Bolsa107RawDao rawDao,
		JdbcTemplate jdbc,
		SolicitudBolsaRepository solicitudRepository,
		HistorialCargaBolsasRepository historialCargaBolsasRepository,
		TipoBolsaRepository tipoBolsaRepository,
		DimServicioEssiRepository servicioRepository,
		AseguradoRepository aseguradoRepository,
		EstadoGestionCitaRepository estadoCitaRepository,
		IpressRepository ipressRepository) {
		this.cargaRepo = cargaRepo;
		this.rawDao = rawDao;
		this.jdbc = jdbc;
		this.solicitudRepository = solicitudRepository;
		this.historialCargaBolsasRepository = historialCargaBolsasRepository;
		this.tipoBolsaRepository = tipoBolsaRepository;
		this.servicioRepository = servicioRepository;
		this.aseguradoRepository = aseguradoRepository;
		this.estadoCitaRepository = estadoCitaRepository;
		this.ipressRepository = ipressRepository;
	}

	// Columnas esperadas del Excel (v1.8.0)
	private static final List<String> EXPECTED_COLUMNS = List.of(
		"FECHA PREFERIDA QUE NO FUE ATENDIDA",
		"TIPO DOCUMENTO",
		"DNI",
		"ASEGURADO",
		"SEXO",
		"FECHA DE NACIMIENTO",
		"TELÉFONO",
		"CORREO",
		"COD. IPRESS ADSCRIPCIÓN",
		"TIPO CITA"
	);

	// Campos obligatorios (SEXO, FECHA DE NACIMIENTO, CORREO son opcionales - se enriquecen desde dim_asegurados por DNI)
	private static final List<String> REQUIRED = List.of(
		"TIPO DOCUMENTO",
		"DNI",
		"ASEGURADO"
	);

	// 🆕 v1.13.8: Rastrear asegurados creados durante importación (para reportar al frontend)
	private List<Map<String, String>> aseguradosCreados = new ArrayList<>();

	@Transactional
	public Map<String, Object> importarYProcesar(MultipartFile file, String usuarioCarga, Long idBolsa, Long idServicio) {

		// 🆕 v1.13.8: Limpiar lista de asegurados creados de la importación anterior
		this.aseguradosCreados = new ArrayList<>();

		// 1) Validar .xlsx
		validateOnlyXlsx(file);

		// 1B) 🆕 v1.13.5: Obtener nombre real del usuario autenticado
		String usuarioRealNombre = obtenerNombreUsuarioAutenticado();
		log.info("👤 Usuario autenticado: {} ({} desde parámetro)", usuarioRealNombre, usuarioCarga);

		// 2) Hash
		String hash = sha256Hex(file);
		LocalDate hoy = LocalDate.now();

		// 3) Guardar cabecera primero (public.bolsa_107_carga)
		Bolsa107Carga carga = Bolsa107Carga.builder()
			.nombreArchivo(Optional.ofNullable(file.getOriginalFilename()).orElse("archivo.xlsx"))
			.hashArchivo(hash)
			.usuarioCarga(usuarioRealNombre)
			.estadoCarga("RECIBIDO")
			.fechaReporte(hoy)
			.build();

		try {
			carga = cargaRepo.save(carga);
		} catch (DataIntegrityViolationException dup) {
			// UNIQUE(fecha_reporte, hash_archivo)
			throw new ExcelCargaDuplicadaException("Ya se cargó este archivo hoy (mismo hash).");
		}

		long idCarga = carga.getIdCarga();

	// 4) Procesar Excel e insertar en staging.bolsa_107_raw (Opción A: desacoplado de dim_solicitud_bolsa)
	ExcelImportResult resultado = procesarEInsertarStaging(file, idCarga);

	int insertados = resultado.filas_total;
	int filasOk = resultado.filas_ok;
	int filasError = resultado.filas_error;

	log.info("📥 Excel procesado: {} filas totales, {} OK, {} errores", insertados, filasOk, filasError);

	// 5) Actualizar cabecera con estadísticas
		carga.setTotalFilas(insertados);
		carga.setFilasOk(filasOk);
		carga.setFilasError(filasError);
		carga.setEstadoCarga("PROCESADO");
		cargaRepo.save(carga);

		// 6B) 🆕 v1.13.5: Guardar también en dim_historial_carga_bolsas (módulo Bolsas)
		HistorialCargaBolsas historialBolsas = HistorialCargaBolsas.builder()
			.nombreArchivo(carga.getNombreArchivo())
			.hashArchivo(carga.getHashArchivo())
			.usuarioCarga(carga.getUsuarioCarga())
			.estadoCarga(carga.getEstadoCarga())
			.fechaReporte(carga.getFechaReporte())
			.totalFilas(insertados)
			.filasOk(filasOk)
			.filasError(filasError)
			.build();
		historialCargaBolsasRepository.save(historialBolsas);
		log.info("✅ Carga registrada también en dim_historial_carga_bolsas (módulo Bolsas)");

		// 7) Leer cabecera actualizada y devolver respuesta
		Bolsa107Carga finalCarga = cargaRepo.findById(idCarga)
			.orElseThrow(() -> new ExcelValidationException("No se pudo leer la cabecera final de la carga."));

		Map<String, Object> resp = new LinkedHashMap<>();
		resp.put("idCarga", finalCarga.getIdCarga());
		resp.put("estadoCarga", finalCarga.getEstadoCarga());
		resp.put("totalFilas", finalCarga.getTotalFilas());
		resp.put("filasOk", finalCarga.getFilasOk());
		resp.put("filasError", finalCarga.getFilasError());
		resp.put("hashArchivo", finalCarga.getHashArchivo());
		resp.put("nombreArchivo", finalCarga.getNombreArchivo());
		resp.put("mensaje", "Importados " + insertados + " registros exitosamente");

		// 🆕 v1.13.8: Agregar lista de asegurados creados (para mostrar al usuario)
		if (!this.aseguradosCreados.isEmpty()) {
			resp.put("aseguradosCreados", this.aseguradosCreados);
			resp.put("totalAseguradosCreados", this.aseguradosCreados.size());
			log.info("📝 Asegurados creados durante importación: {}", this.aseguradosCreados.size());
		}

		return resp;
	}

	// =============================
	// MÉTODO REMOVIDO (v3.1.3)
	// =============================
	// El método "leerExcelYProcesarDirecto" fue ELIMINADO en Opción A.
	// Razón: Formulario 107 ahora es COMPLETAMENTE INDEPENDIENTE de dim_solicitud_bolsa.
	//
	// Responsabilidad de Formulario 107:
	// - Guardar en: bolsa_107_carga (cabecera) + staging.bolsa_107_raw (detalle)
	// - NUNCA insertar en: dim_solicitud_bolsa (es del módulo Bolsas)
	//
	// Método reemplazado por: procesarEInsertarStaging() (línea 481+)
	// =============================

	private LocalDate parseLocalDate(String dateStr) {
		if (isBlank(dateStr))
			return null;
		try {
			return LocalDate.parse(dateStr);
		} catch (Exception e) {
			return null;
		}
	}

	// =============================
	  // EJECUTAR PROCEDIMIENTO
	  // =============================
	  private void ejecutarSpProcesar(long idCarga, Long idBolsa, Long idServicio) {
	    try {
	      log.info("🗄️ Ejecutando SP: sp_bolsa_107_procesar({}, {}, {})", idCarga, idBolsa, idServicio);

	      // Ejecutar SP con el formato correcto para PostgreSQL
	      jdbc.execute((org.springframework.jdbc.core.ConnectionCallback<Boolean>) con -> {
	        try (var stmt = con.prepareCall("{ CALL sp_bolsa_107_procesar(?, ?, ?) }")) {
	          stmt.setLong(1, idCarga);
	          stmt.setLong(2, idBolsa);
	          stmt.setLong(3, idServicio);
	          stmt.execute();
	        }
	        return true;
	      });

	      log.info("✅ SP ejecutado correctamente");

	    } catch (Exception e) {
	      log.error("❌ Error al ejecutar SP: {}", e.getMessage(), e);
	      throw new ExcelValidationException("Falló el procesamiento en BD: " + e.getMessage());
	    }
	  }
	
	

	// ==========================
	// LECTURA + INSERT STAGING
	// ==========================
	private ExcelImportResult procesarEInsertarStaging(MultipartFile file, long idCarga) {
		try (InputStream is = file.getInputStream(); Workbook wb = new XSSFWorkbook(is)) {

			Sheet sheet = wb.getSheetAt(0);

			int headerIndex = sheet.getFirstRowNum();
			Row headerRow = sheet.getRow(headerIndex);
			if (headerRow == null)
				throw new ExcelValidationException("No se encontró el encabezado (fila 1).");

			List<String> actualColumns = readHeader(headerRow);
			validateHeaderStrict(actualColumns);

			int filasTotal = 0;
			int filasOk = 0;
			int filasError = 0;

			List<Map<String, Object>> errores = new ArrayList<>();
			List<Bolsa107RawRow> batch = new ArrayList<>(500);

			int lastRow = sheet.getLastRowNum();

			for (int r = headerIndex + 1; r <= lastRow; r++) {
				Row row = sheet.getRow(r);
				if (row == null || isRowCompletelyEmpty(row))
					continue;

				filasTotal++;

				// Mapear columnas del Excel v1.8.0 a campos de staging
				String fechaPreferida = cellDateStr(row, 0);      // Columna 0
				String tipoDocumento = cellStr(row, 1);          // Columna 1
				String numeroDocumento = cellStr(row, 2);        // Columna 2

			// 🆕 v1.13.9: Normalizar DNI en lectura raw
			numeroDocumento = normalizeDni(numeroDocumento);
				String apellidos = cellStr(row, 3);              // Columna 3
				String sexo = cellStr(row, 4);                   // Columna 4
				String fechaNac = cellDateStr(row, 5);           // Columna 5
				String telefono = cellStr(row, 6);               // Columna 6
				String correo = cellStr(row, 7);                 // Columna 7
				String codigoIpress = cellStr(row, 8);           // Columna 8

			// 🆕 v1.13.9: Normalizar código IPRESS a 3 dígitos
			codigoIpress = normalizeIpress(codigoIpress);
			// 🆕 v1.15.0: Normalizar código IPRESS a 3 dígitos con padding
			codigoIpress = normalizeIpress(codigoIpress);
				String tipoCita = cellStr(row, 9);               // Columna 9

				// Campos no disponibles en v1.8.0 (se dejan vacíos)
				String registro = "";
				String opcionIngreso = "";
				String dep = "";
				String prov = "";
				String dist = "";
				String motivo = "";
				String afiliacion = "";
				String deriv = tipoCita; // Usar TIPO CITA como derivacion (no está en el archivo)

				// Validar campos obligatorios (v1.8.0 - solo 3 campos son requeridos)
				List<String> faltantes = new ArrayList<>();
				if (isBlank(tipoDocumento))
					faltantes.add("TIPO DOCUMENTO");
				if (isBlank(numeroDocumento))
					faltantes.add("DNI");
				if (isBlank(apellidos))
					faltantes.add("ASEGURADO");

				boolean ok = faltantes.isEmpty();
				if (ok)
					filasOk++;
				else
					filasError++;

				// Campos opcionales que se enriquecerán desde dim_asegurados (por DNI)
				List<String> enriquecerDesdeBD = new ArrayList<>();
				if (isBlank(sexo))
					enriquecerDesdeBD.add("SEXO");
				if (isBlank(fechaNac))
					enriquecerDesdeBD.add("FECHA DE NACIMIENTO");
				if (isBlank(correo))
					enriquecerDesdeBD.add("CORREO");
			
			String observacion;
			if (!ok) {
				if (enriquecerDesdeBD.isEmpty()) {
					observacion = "Faltan obligatorios: " + String.join(", ", faltantes);
				} else {
					observacion = "Faltan obligatorios: " + String.join(", ", faltantes) + " (Se enriquecerá desde BD: " + String.join(", ", enriquecerDesdeBD) + ")";
				}
			} else if (!enriquecerDesdeBD.isEmpty()) {
				observacion = "Se enriquecerá desde BD: " + String.join(", ", enriquecerDesdeBD);
			} else {
				observacion = null;
			}

				// raw_json (guardo todo lo que leí)
				Map<String, Object> rawMap = new LinkedHashMap<>();
				rawMap.put("REGISTRO", registro);
				rawMap.put("OPCIONES DE INGRESO DE LLAMADA", opcionIngreso);
				rawMap.put("TELEFONO", telefono);
				rawMap.put("TIPO DE DOCUMENTO", tipoDocumento);
				rawMap.put("DNI", numeroDocumento);
				rawMap.put("APELLIDOS Y NOMBRES", apellidos);
				rawMap.put("SEXO", sexo);
				rawMap.put("FechaNacimiento", fechaNac);
				rawMap.put("DEPARTAMENTO", dep);
				rawMap.put("PROVINCIA", prov);
				rawMap.put("DISTRITO", dist);
				rawMap.put("MOTIVO DE LA LLAMADA", motivo);
				rawMap.put("AFILIACION", afiliacion);
				rawMap.put("DERIVACION INTERNA", deriv);

				String rawJson = rawDao.toJson(rawMap);

				// Crear fila raw
				Bolsa107RawRow rawRow = new Bolsa107RawRow(idCarga, r + 1, // fila excel 1-based
						registro, opcionIngreso, telefono, tipoDocumento, numeroDocumento, apellidos, sexo, fechaNac,
						dep, prov, dist, motivo, afiliacion, deriv, observacion, rawJson);

				batch.add(rawRow);

				// guardar detalle de errores para respuesta
				if (!ok) {
					Map<String, Object> det = new LinkedHashMap<>();
					det.put("fila_excel", r + 1);
					det.put("faltantes", faltantes);
					det.put("dni_preview", numeroDocumento);
					errores.add(det);
				}

				// batch insert cada 500
				if (batch.size() >= 500) {
					rawDao.insertBatch(batch);
					batch.clear();
				}
			}

			// flush batch final
			if (!batch.isEmpty())
				rawDao.insertBatch(batch);

			return new ExcelImportResult(filasTotal, filasOk, filasError, errores);

		} catch (ExcelValidationException e) {
			throw e;
		} catch (Exception e) {
			throw new ExcelValidationException("Archivo inválido o corrupto. Debe ser un .xlsx válido.");
		}
	}

	// ==========================
	// VALIDACIONES Y HELPERS
	// ==========================
	private void validateOnlyXlsx(MultipartFile file) {
		if (file == null || file.isEmpty())
			throw new ExcelValidationException("No se envió archivo o está vacío.");
		String name = Optional.ofNullable(file.getOriginalFilename()).orElse("").trim().toLowerCase(Locale.ROOT);
		if (!name.endsWith(".xlsx"))
			throw new ExcelValidationException("Formato no permitido. Solo se acepta .xlsx");
	}

	private String sha256Hex(MultipartFile file) {
		try {
			MessageDigest md = MessageDigest.getInstance("SHA-256");
			byte[] digest = md.digest(file.getBytes());
			StringBuilder sb = new StringBuilder();
			for (byte b : digest)
				sb.append(String.format("%02x", b));
			return sb.toString();
		} catch (Exception e) {
			throw new ExcelValidationException("No se pudo calcular el hash del archivo.");
		}
	}

	/**
	 * 🆕 v1.13.0: Validación INTELIGENTE - Independiente de títulos de columnas
	 * - Aceptar archivos con CUALQUIER nombre de columna
	 * - Validar por ESTRUCTURA DE DATOS, no por TÍTULOS
	 * - Flexible con variaciones: OTORRINO vs OFTALMOLOGIA vs cualquier otro
	 *
	 * CAMBIO IMPORTANTE: Ya NO validamos que exista una columna llamada "DNI"
	 *                    Validamos que haya 10 columnas (posiciones fijas)
	 *                    Los datos serán validados por su TIPO, no por su NOMBRE
	 */
	private void validateHeaderStrict(List<String> actualColumns) {
		log.info("📋 Validando estructura Excel (v1.13.0 - Flexible por posición)");
		log.info("   📊 Total columnas encontradas: {}", actualColumns.size());
		log.info("   📋 Títulos de columnas: {}", actualColumns);

		// VALIDACIÓN: Debe haber exactamente 10 columnas
		// Los títulos pueden ser CUALQUIERA (no importan los nombres)
		if (actualColumns.size() != 10) {
			log.error("❌ Estructura inválida: {} columnas encontradas, se esperan 10 (exactas)", actualColumns.size());
			throw new ExcelValidationException(
				String.format("El archivo debe tener exactamente 10 columnas. Se encontraron: %d. " +
					"Los títulos no importan, pero la estructura sí: " +
					"Fecha, TipoDoc, DNI, Nombre, Sexo, FechaNac, Teléfono, Correo, IPRESS, TipoCita",
					actualColumns.size()));
		}

		// ✅ Validación exitosa
		log.info("✅ Validación exitosa:");
		log.info("   ✓ Estructura correcta: 10 columnas");
		log.info("   ✓ Los títulos pueden ser cualquiera (validación por DATOS, no por TÍTULOS)");
		log.info("   ✓ Ejemplos aceptados:");
		log.info("     • OTORRINO: TIPO DOC, DNI, NOMBRE/ASEGURADO, ...");
		log.info("     • OFTALMOLOGIA: TIPO DOCUMENTO, DOC_PACIENT, PACIENTE, ...");
		log.info("     • Cualquier otro: XXX, YYY, ZZZ, ... (10 columnas)");
	}

	private List<String> readHeader(Row headerRow) {
		int lastCell = headerRow.getLastCellNum();
		List<String> cols = new ArrayList<>();
		for (int i = 0; i < lastCell; i++) {
			Cell cell = headerRow.getCell(i, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
			cols.add(cell == null ? "" : cellToString(cell).trim());
		}
		while (!cols.isEmpty() && cols.get(cols.size() - 1).isBlank())
			cols.remove(cols.size() - 1);
		return cols;
	}

	private Map<String, Integer> buildColumnIndex(List<String> cols) {
		// 🆕 v1.8.0: Mapeo directo sin normalización excesiva
		// Para v1.8.0, los nombres de columnas son exactos
		Map<String, Integer> map = new HashMap<>();

		for (int i = 0; i < cols.size(); i++) {
			String colName = cols.get(i);
			if (colName != null && !colName.isBlank()) {
				// Almacenar con normalización simple (solo trim y lowercase)
				String key = colName.trim().toLowerCase(Locale.ROOT);
				map.put(key, i);
				log.debug("   📍 Columna '{}' → índice {}", colName, i);
			}
		}

		log.info("🗺️ Mapa de columnas creado con {} entradas", map.size());
		return map;
	}

	private boolean isRowCompletelyEmpty(Row row) {
			if (row == null)
				return true;

			// 🆕 v1.13.1: Check ONLY the 10 fixed columns (0-9)
			// Don't check the entire row, because Excel's getLastCellNum() might miss columns
			// We only care if columns 0-9 have ANY data
			for (int c = 0; c < 10; c++) {
				Cell cell = row.getCell(c, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
				if (cell == null)
					continue;
				String v = cellToString(cell).trim();
				if (!v.isEmpty()) {
					log.debug("✓ Row {} has data in column {}", row.getRowNum(), c);
					return false; // Row has at least some data
				}
			}
			log.debug("⚠️ Row {} is completely empty (all 10 columns blank)", row.getRowNum());
			return true; // All 10 columns are empty
	}

	private String cellStr(Row row, Integer idx) {
		if (idx == null)
			return "";
		Cell cell = row.getCell(idx, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
		if (cell == null)
			return "";
		return cellToString(cell).trim();
	}

	private String cellDateStr(Row row, Integer idx) {
		if (idx == null)
			return "";
		Cell cell = row.getCell(idx, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
		if (cell == null)
			return "";

		if (cell.getCellType() == CellType.NUMERIC && DateUtil.isCellDateFormatted(cell)) {
			// formateo a yyyy-MM-dd
			return cell.getLocalDateTimeCellValue().toLocalDate().toString();
		}

		// texto: acepto varios formatos y lo guardo como viene
		String s = cellToString(cell).trim();
		if (s.isEmpty())
			return "";

		// si quieres normalizar: intenta parsear y re-formatear a yyyy-MM-dd
		String normalized = normalizeDate(s);
		return normalized != null ? normalized : s;
	}

	private String normalizeDate(String s) {
		List<DateTimeFormatter> fmts = List.of(DateTimeFormatter.ofPattern("yyyy-MM-dd"),
				DateTimeFormatter.ofPattern("dd/MM/yyyy"), DateTimeFormatter.ofPattern("d/M/yyyy"),
				DateTimeFormatter.ofPattern("dd-MM-yyyy"), DateTimeFormatter.ofPattern("d-M-yyyy"));
		for (DateTimeFormatter f : fmts) {
			try {
				return LocalDate.parse(s, f).toString();
			} catch (Exception ignored) {
			}
		}
		return null;
	}

	private String cellToString(Cell cell) {
		return switch (cell.getCellType()) {
		case STRING -> cell.getStringCellValue();
		case NUMERIC -> numericToString(cell.getNumericCellValue());
		case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
		case FORMULA -> {
			try {
				FormulaEvaluator ev = cell.getSheet().getWorkbook().getCreationHelper().createFormulaEvaluator();
				CellValue cv = ev.evaluate(cell);
				if (cv == null)
					yield "";
				yield switch (cv.getCellType()) {
				case STRING -> cv.getStringValue();
				case NUMERIC -> numericToString(cv.getNumberValue());
				case BOOLEAN -> String.valueOf(cv.getBooleanValue());
				default -> "";
				};
			} catch (Exception e) {
				yield "";
			}
		}
		default -> "";
		};
	}

	private String numericToString(double v) {
		long asLong = (long) v;
		if (Math.abs(v - asLong) < 0.0000001)
			return String.valueOf(asLong);
		return String.valueOf(v);
	}

	private boolean isBlank(String s) {
		return s == null || s.trim().isEmpty();
	}

	private String n(String s) {
		return s == null ? "" : s.trim().replaceAll("\\s+", " ").toLowerCase(Locale.ROOT);
	}

	// =============================
	// 🆕 v1.13.5: OBTENER USUARIO AUTENTICADO
	// =============================
	/**
	 * Obtiene el nombre del usuario autenticado desde SecurityContextHolder
	 * Fallback: Si no está disponible, retorna "SISTEMA"
	 */
	private String obtenerNombreUsuarioAutenticado() {
		try {
			// 🆕 v1.13.8: Intentar obtener nombre desde JWT token primero
			try {
				ServletRequestAttributes attrs = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
				if (attrs != null) {
					HttpServletRequest request = attrs.getRequest();
					String authHeader = request.getHeader("Authorization");

					if (authHeader != null && authHeader.startsWith("Bearer ")) {
						String token = authHeader.substring(7);
						String[] parts = token.split("\\.");

						if (parts.length == 3) {
							// Decodificar payload
							String payload = new String(Base64.getDecoder().decode(parts[1]));
							Map<String, Object> claims = new ObjectMapper().readValue(payload, Map.class);

							// Buscar nombre completo en el payload
							String fullName = (String) claims.getOrDefault("nombre", null);
							if (fullName == null) {
								fullName = (String) claims.getOrDefault("nombreCompleto", null);
							}
							if (fullName == null) {
								fullName = (String) claims.getOrDefault("full_name", null);
							}
							if (fullName == null) {
								fullName = (String) claims.getOrDefault("name", null);
							}

							if (fullName != null && !fullName.isEmpty()) {
								log.info("👤 Nombre desde JWT token: {}", fullName);
								return fullName;
							}

							// Si no hay nombre completo, usar username del token
							String username = (String) claims.getOrDefault("sub", null);
							if (username != null && !username.isEmpty()) {
								log.info("👤 Username desde JWT token (sub): {}", username);
								return username;
							}
						}
					}
				}
			} catch (Exception tokenEx) {
				log.debug("⚠️ No se pudo extraer nombre del JWT token: {}", tokenEx.getMessage());
			}

			// Fallback: obtener del SecurityContext
			var authentication = SecurityContextHolder.getContext().getAuthentication();
			if (authentication != null && authentication.isAuthenticated()) {
				var principal = authentication.getPrincipal();

				// Si es una String (username)
				if (principal instanceof String) {
					String username = (String) principal;
					log.info("👤 Usuario (String): {}", username);

					if (username.equals("admin") || username.equals("anonymousUser")) {
						log.warn("⚠️ Usuario 'admin' o anónimo detectado");
						return "SISTEMA";
					}
					return username;
				}

				// Si es UserDetails, obtener username
				if (principal.getClass().getSimpleName().contains("UserDetails")) {
					String username = authentication.getName();
					log.info("👤 Usuario (UserDetails): {}", username);
					return username;
				}

				// Por defecto, usar getName()
				String username = authentication.getName();
				log.info("👤 Usuario (getName): {}", username);
				return !username.equals("anonymousUser") && !username.isEmpty() ? username : "SISTEMA";
			}
		} catch (Exception e) {
			log.warn("⚠️ Error obteniendo usuario autenticado: {}", e.getMessage());
		}
		return "SISTEMA"; // Fallback
	}

	// =============================
	// 🆕 v1.13.9: NORMALIZACIÓN DE DNI
	// =============================
	/**
	 * Normaliza DNI a 8 dígitos con ceros a la izquierda (formato estándar peruano)
	 *
	 * - Extrae solo dígitos del valor
	 * - Valida que tenga mínimo 8 dígitos
	 * - Si tiene más de 8, toma los últimos 8
	 * - Rellena con ceros a la izquierda si es necesario
	 *
	 * @param dni Valor original del DNI (puede tener espacios, guiones, etc)
	 * @return DNI normalizado a 8 dígitos, o null si no es válido
	 */
	private String normalizeDni(String dni) {
		if (isBlank(dni)) {
			return null;
		}

		// Remover espacios y caracteres especiales
		String digitsOnly = dni.replaceAll("[^0-9]", "");

		// Validar que tenga al menos 8 dígitos
		if (digitsOnly.length() < 8) {
			log.warn("⚠️ DNI inválido (menos de 8 dígitos): {}", dni);
			return null;
		}

		// Si tiene más de 8 dígitos, tomar los últimos 8
		if (digitsOnly.length() > 8) {
			digitsOnly = digitsOnly.substring(digitsOnly.length() - 8);
		}

		// Rellenar con ceros a la izquierda
		digitsOnly = String.format("%08d", Long.parseLong(digitsOnly));

		log.debug("✅ DNI normalizado: {} → {}", dni, digitsOnly);
		return digitsOnly;
	}

	// 🆕 v1.15.0: Normalizar código IPRESS a 3 dígitos con ceros a la izquierda
	/**
	 * Normaliza el código IPRESS a exactamente 3 dígitos con padding de ceros a la izquierda
	 * Ejemplo: "21" → "021", "421" → "421", "0421" → "421"
	 */
	private String normalizeIpress(String ipress) {
		if (isBlank(ipress)) {
			return null;
		}

		// Remover espacios y caracteres especiales
		String digitsOnly = ipress.replaceAll("[^0-9]", "");

		// Si está vacío después de remover caracteres
		if (digitsOnly.isEmpty()) {
			log.warn("⚠️ Código IPRESS inválido (sin dígitos): {}", ipress);
			return null;
		}

		// Si tiene más de 3 dígitos, tomar los últimos 3
		if (digitsOnly.length() > 3) {
			digitsOnly = digitsOnly.substring(digitsOnly.length() - 3);
		}

		// Rellenar con ceros a la izquierda a 3 dígitos
		digitsOnly = String.format("%03d", Long.parseLong(digitsOnly));

		log.debug("✅ Código IPRESS normalizado: {} → {}", ipress, digitsOnly);
		return digitsOnly;
	}
}

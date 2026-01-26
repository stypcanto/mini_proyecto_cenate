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
import com.styp.cenate.repository.form107.Bolsa107CargaRepository;
import com.styp.cenate.repository.form107.Bolsa107RawDao;
import com.styp.cenate.util.ExcelHeaderNormalizer;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class ExcelImportService {

	private final Bolsa107CargaRepository cargaRepo;
	private final Bolsa107RawDao rawDao;
	private final JdbcTemplate jdbc;

	public ExcelImportService(Bolsa107CargaRepository cargaRepo, Bolsa107RawDao rawDao, JdbcTemplate jdbc) {
		this.cargaRepo = cargaRepo;
		this.rawDao = rawDao;
		this.jdbc = jdbc;
	}

	private static final List<String> EXPECTED_COLUMNS = List.of("REGISTRO", "OPCIONES DE INGRESO DE LLAMADA",
			"TELEFONO", "TIPO DE DOCUMENTO", "DNI", "APELLIDOS Y NOMBRES", "SEXO", "FechaNacimiento", "DEPARTAMENTO",
			"PROVINCIA", "DISTRITO", "MOTIVO DE LA LLAMADA", "AFILIACION", "DERIVACION INTERNA"

	);

	// obligatorios para filas_ok (SEXO y FechaNacimiento ahora opcionales - se enriquecen desde BD por DNI)
	private static final List<String> REQUIRED = List.of("TIPO DE DOCUMENTO", "DNI", "APELLIDOS Y NOMBRES", "DERIVACION INTERNA");

	
	@Transactional
	  public Map<String, Object> importarYProcesar(MultipartFile file, String usuarioCarga, Long idTipoBolsa, Long idServicio) {

	    // 1) Validar .xlsx
	    validateOnlyXlsx(file);

	    // 2) Hash
	    String hash = sha256Hex(file);
	    LocalDate hoy = LocalDate.now();

	    // 3) Guardar cabecera primero (public.bolsa_107_carga)
	    Bolsa107Carga carga = Bolsa107Carga.builder()
	        .nombreArchivo(Optional.ofNullable(file.getOriginalFilename()).orElse("archivo.xlsx"))
	        .hashArchivo(hash)
	        .usuarioCarga(usuarioCarga)
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

	    // 4) Cargar TODO el Excel a staging.bolsa_107_raw (y opcionalmente ir contando ok/error)
	    //    (Aquí reutilizas tu método que ya hace lectura + batch insert en staging)
	    ExcelImportResult preResult = procesarEInsertarStaging(file, idCarga);

	    // (Opcional) puedes actualizar preliminarmente totales en cabecera antes del SP
	    carga.setTotalFilas(preResult.filas_total);
	    carga.setFilasOk(preResult.filas_ok);
	    carga.setFilasError(preResult.filas_error);
	    carga.setEstadoCarga("STAGING_CARGADO");
	    cargaRepo.save(carga);

	    // 5) Ejecutar SP (el SP enriquece, valida e inserta en dim_solicitud_bolsa)
	    ejecutarSpProcesar(idCarga, idTipoBolsa, idServicio);

	    // 6) Leer cabecera actualizada y devolver respuesta
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

	    return resp;
	  }

	// =============================
	  // EJECUTAR PROCEDIMIENTO
	  // =============================
	  private void ejecutarSpProcesar(long idCarga, Long idTipoBolsa, Long idServicio) {
	    try {
	      // CALL public.sp_bolsa_107_procesar(id_carga, id_bolsa, id_servicio);
	      log.info("🗄️ Ejecutando SP: sp_bolsa_107_procesar({}, {}, {})", idCarga, idTipoBolsa, idServicio);
	      jdbc.update("CALL public.sp_bolsa_107_procesar(?, ?, ?)", idCarga, idTipoBolsa, idServicio);
	      log.info("✅ SP ejecutado correctamente");
	    } catch (Exception e) {
	      log.error("❌ Error al ejecutar SP: {}", e.getMessage());
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

			Map<String, Integer> idx = buildColumnIndex(actualColumns);

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

				// Leer valores
				String registro = cellStr(row, idx.get(n("REGISTRO")));
				String opcionIngreso = cellStr(row, idx.get(n("OPCIONES DE INGRESO DE LLAMADA")));
				String telefono = cellStr(row, idx.get(n("TELEFONO")));

				String tipoDocumento = cellStr(row, idx.get(n("TIPO DE DOCUMENTO")));
				String numeroDocumento = cellStr(row, idx.get(n("DNI"))); // tu tabla raw lo llama numero_documento

				String apellidos = cellStr(row, idx.get(n("APELLIDOS Y NOMBRES")));
				String sexo = cellStr(row, idx.get(n("SEXO")));
				String fechaNac = cellDateStr(row, idx.get(n("FechaNacimiento")));

				String dep = cellStr(row, idx.get(n("DEPARTAMENTO")));
				String prov = cellStr(row, idx.get(n("PROVINCIA")));
				String dist = cellStr(row, idx.get(n("DISTRITO")));

				String motivo = cellStr(row, idx.get(n("MOTIVO DE LA LLAMADA")));
				String afiliacion = cellStr(row, idx.get(n("AFILIACION")));
				String deriv = cellStr(row, idx.get(n("DERIVACION INTERNA")));

				// Validar obligatorios
				List<String> faltantes = new ArrayList<>();
				if (isBlank(numeroDocumento))
					faltantes.add("DNI");
				if (isBlank(apellidos))
					faltantes.add("APELLIDOS Y NOMBRES");
				if (isBlank(sexo))
					// SEXO es opcional - se enriquece desde BD
				if (isBlank(fechaNac))
					// FechaNacimiento es opcional - se enriquece desde BD
				if (isBlank(deriv))
					faltantes.add("DERIVACION INTERNA");
				if (isBlank(tipoDocumento))
					faltantes.add("TIPO DE DOCUMENTO");

				boolean ok = faltantes.isEmpty();
				if (ok)
					filasOk++;
				else
					filasError++;

				// observación: campos faltantes obligatorios O campos a enriquecer desde BD
			List<String> enriquecerDesdeBD = new ArrayList<>();
			if (isBlank(sexo) && !faltantes.contains("SEXO"))
				enriquecerDesdeBD.add("SEXO");
			if (isBlank(fechaNac) && !faltantes.contains("FechaNacimiento"))
				enriquecerDesdeBD.add("FechaNacimiento");
			
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
	 * 🆕 v1.15.13: Validación FLEXIBLE de cabeceras
	 * - Acepta archivos con MENOS o MÁS columnas
	 * - Solo valida que existan las columnas OBLIGATORIAS
	 * - Usa normalización inteligente para mapear columnas
	 */
	private void validateHeaderStrict(List<String> actualColumns) {
		log.info("📋 Validando cabeceras: {} columnas encontradas", actualColumns.size());

		// Normalizar TODAS las columnas del archivo
		List<String> normalized = ExcelHeaderNormalizer.normalizeAll(actualColumns);

		// Definir columnas OBLIGATORIAS (pueden estar en cualquier posición)
		List<String> required = List.of(
			"DNI",                    // Puede ser DNI o NUMERO DE DOCUMENTO
			"APELLIDOS Y NOMBRES",    // Puede ser APELLIDOS Y NOMBRES o PACIENTE
			"SEXO",
			"FechaNacimiento",
			"DERIVACION INTERNA"
		);

		// Verificar que las columnas obligatorias existan (buscar en cualquier posición)
		List<String> missing = new ArrayList<>();
		for (String req : required) {
			boolean found = false;
			for (String norm : normalized) {
				if (req.equals(norm)) {
					found = true;
					break;
				}
			}
			if (!found) {
				missing.add(req);
			}
		}

		if (!missing.isEmpty()) {
			log.error("❌ Faltan columnas obligatorias: {}", missing);
			throw new ExcelValidationException(
				Map.of("message", "Faltan columnas obligatorias: " + String.join(", ", missing),
					"requiredColumns", required,
					"missingColumns", missing,
					"actualColumns", actualColumns));
		}

		// Log de normalización exitosa
		Map<String, Object> report = ExcelHeaderNormalizer.generateReport(actualColumns, normalized);
		log.info("✅ Cabeceras validadas correctamente:");
		log.info("   📊 Total columnas: {}", actualColumns.size());
		log.info("   📝 Normalizadas: {}", report.get("normalized"));
		log.info("   ✓ Sin cambios: {}", report.get("unchanged"));

		// Mostrar mapeo de columnas normalizadas
		for (int i = 0; i < actualColumns.size(); i++) {
			if (!actualColumns.get(i).equals(normalized.get(i))) {
				log.info("   🔄 '{}' → '{}'", actualColumns.get(i), normalized.get(i));
			}
		}
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
		// 🆕 v1.15.13: Normalizar TODAS las columnas del archivo (flexible)
		List<String> normalized = ExcelHeaderNormalizer.normalizeAll(cols);

		Map<String, Integer> map = new HashMap<>();
		for (int i = 0; i < normalized.size(); i++) {
			String normalizedName = normalized.get(i);
			if (normalizedName != null && !normalizedName.isBlank()) {
				map.put(n(normalizedName), i);
				log.debug("   📍 Columna '{}' → índice {}", normalizedName, i);
			}
		}

		log.info("🗺️ Mapa de columnas creado con {} entradas", map.size());
		return map;
	}

	private boolean isRowCompletelyEmpty(Row row) {
		if (row == null)
			return true;
		short first = row.getFirstCellNum();
		short last = row.getLastCellNum();
		if (first < 0 || last < 0)
			return true;

		for (int c = first; c < last; c++) {
			Cell cell = row.getCell(c, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
			if (cell == null)
				continue;
			String v = cellToString(cell).trim();
			if (!v.isEmpty())
				return false;
		}
		return true;
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
}

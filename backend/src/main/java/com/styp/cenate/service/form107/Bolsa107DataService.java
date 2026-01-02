package com.styp.cenate.service.form107;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.styp.cenate.model.form107.Bolsa107Carga;
import com.styp.cenate.model.form107.Bolsa107Error;
import com.styp.cenate.model.form107.Bolsa107Item;
import com.styp.cenate.repository.form107.Bolsa107CargaRepository;
import com.styp.cenate.repository.form107.Bolsa107ErrorRepository;
import com.styp.cenate.repository.form107.Bolsa107ItemRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class Bolsa107DataService {

	private final Bolsa107ItemRepository itemRepository;
	private final Bolsa107ErrorRepository errorRepository;
	private final Bolsa107CargaRepository cargaRepository;

	public Map<String, Object> obtenerDatosCarga(Long idCarga) {
		Map<String, Object> resultado = new HashMap<>();

		// Obtener items
		List<Map<String, Object>> items = itemRepository.findAllByIdCarga(idCarga);
		resultado.put("items", items);
		resultado.put("total_items", items.size());

		// Obtener errores
		List<Map<String, Object>> errores = errorRepository.findAllByIdCarga(idCarga);
		resultado.put("errores", errores);
		resultado.put("total_errores", errores.size());

		return resultado;
	}

	/**
	 * Obtener lista de todas las cargas
	 */
	public List<Map<String, Object>> obtenerListaCargas() {
		log.info("Obteniendo lista de todas las cargas");

		List<Bolsa107Carga> cargas = cargaRepository.findAll();

		return cargas.stream()
			.map(this::mapCargaToResponse)
			.collect(Collectors.toList());
	}

	/**
	 * 🆕 v1.15.14: Eliminar una carga con todos sus registros relacionados
	 * IMPORTANTE: Elimina en orden correcto para respetar foreign keys
	 */
	@Transactional
	public void eliminarCarga(Long idCarga) {
		log.info("🗑️ Eliminando carga ID: {}", idCarga);

		Bolsa107Carga carga = cargaRepository.findById(idCarga)
			.orElseThrow(() -> new RuntimeException("Carga no encontrada con ID: " + idCarga));

		// PASO 1: Eliminar errores primero (foreign key a id_carga)
		List<Bolsa107Error> errores = errorRepository.findByIdCarga(idCarga);
		if (!errores.isEmpty()) {
			errorRepository.deleteAll(errores);
			log.info("   ✓ Eliminados {} errores", errores.size());
		}

		// PASO 2: Eliminar items (foreign key a id_carga)
		List<Bolsa107Item> items = itemRepository.findByIdCarga(idCarga);
		if (!items.isEmpty()) {
			itemRepository.deleteAll(items);
			log.info("   ✓ Eliminados {} items", items.size());
		}

		// PASO 3: Finalmente eliminar la carga principal
		cargaRepository.delete(carga);

		log.info("✅ Carga {} eliminada correctamente (Total: {} items + {} errores)",
			idCarga, items.size(), errores.size());
	}

	/**
	 * Exportar carga a Excel
	 */
	public byte[] exportarCargaExcel(Long idCarga) {
		log.info("Exportando carga ID: {} a Excel", idCarga);

		Bolsa107Carga carga = cargaRepository.findById(idCarga)
			.orElseThrow(() -> new RuntimeException("Carga no encontrada con ID: " + idCarga));

		List<Bolsa107Item> items = itemRepository.findByIdCarga(idCarga);
		List<Bolsa107Error> errores = errorRepository.findByIdCarga(idCarga);

		try (Workbook workbook = new XSSFWorkbook()) {
			// Hoja 1: Pacientes importados correctamente
			Sheet sheetItems = workbook.createSheet("Pacientes Importados");
			crearHojaPacientes(sheetItems, items, workbook);

			// Hoja 2: Errores
			if (!errores.isEmpty()) {
				Sheet sheetErrores = workbook.createSheet("Errores");
				crearHojaErrores(sheetErrores, errores, workbook);
			}

			// Escribir a ByteArray
			ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
			workbook.write(outputStream);

			log.info("Exportación exitosa de carga {} - {} pacientes, {} errores",
				idCarga, items.size(), errores.size());

			return outputStream.toByteArray();

		} catch (Exception e) {
			log.error("Error al exportar carga a Excel: ", e);
			throw new RuntimeException("Error al generar archivo Excel: " + e.getMessage());
		}
	}

	/**
	 * Crear hoja de pacientes en Excel
	 */
	private void crearHojaPacientes(Sheet sheet, List<Bolsa107Item> items, Workbook workbook) {
		// Estilo para header
		CellStyle headerStyle = workbook.createCellStyle();
		Font headerFont = workbook.createFont();
		headerFont.setBold(true);
		headerFont.setColor(IndexedColors.WHITE.getIndex());
		headerStyle.setFont(headerFont);
		headerStyle.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
		headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

		// Header
		Row headerRow = sheet.createRow(0);
		String[] headers = {
			"Registro", "Tipo Doc", "N° Documento", "Paciente", "Sexo", "Fecha Nacimiento",
			"Teléfono", "Opción Ingreso", "Motivo", "Afiliación", "Derivación",
			"Departamento", "Provincia", "Distrito", "Observación"
		};

		for (int i = 0; i < headers.length; i++) {
			Cell cell = headerRow.createCell(i);
			cell.setCellValue(headers[i]);
			cell.setCellStyle(headerStyle);
		}

		// Datos
		DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
		int rowNum = 1;
		for (Bolsa107Item item : items) {
			Row row = sheet.createRow(rowNum++);

			row.createCell(0).setCellValue(item.getRegistro() != null ? item.getRegistro() : "");
			row.createCell(1).setCellValue(item.getTipoDocumento() != null ? item.getTipoDocumento() : "");
			row.createCell(2).setCellValue(item.getNumeroDocumento() != null ? item.getNumeroDocumento() : "");
			row.createCell(3).setCellValue(item.getPaciente() != null ? item.getPaciente() : "");
			row.createCell(4).setCellValue(item.getSexo() != null ? item.getSexo() : "");
			row.createCell(5).setCellValue(item.getFechaNacimiento() != null ?
				item.getFechaNacimiento().format(dateFormatter) : "");
			row.createCell(6).setCellValue(item.getTelefono() != null ? item.getTelefono() : "");
			row.createCell(7).setCellValue(item.getOpcionIngreso() != null ? item.getOpcionIngreso() : "");
			row.createCell(8).setCellValue(item.getMotivoLlamada() != null ? item.getMotivoLlamada() : "");
			row.createCell(9).setCellValue(item.getAfiliacion() != null ? item.getAfiliacion() : "");
			row.createCell(10).setCellValue(item.getDerivacionInterna() != null ? item.getDerivacionInterna() : "");
			row.createCell(11).setCellValue(item.getDepartamento() != null ? item.getDepartamento() : "");
			row.createCell(12).setCellValue(item.getProvincia() != null ? item.getProvincia() : "");
			row.createCell(13).setCellValue(item.getDistrito() != null ? item.getDistrito() : "");
			row.createCell(14).setCellValue(item.getObservacionOrigen() != null ? item.getObservacionOrigen() : "");
		}

		// Auto-size columns
		for (int i = 0; i < headers.length; i++) {
			sheet.autoSizeColumn(i);
		}
	}

	/**
	 * Crear hoja de errores en Excel
	 */
	private void crearHojaErrores(Sheet sheet, List<Bolsa107Error> errores, Workbook workbook) {
		// Estilo para header
		CellStyle headerStyle = workbook.createCellStyle();
		Font headerFont = workbook.createFont();
		headerFont.setBold(true);
		headerFont.setColor(IndexedColors.WHITE.getIndex());
		headerStyle.setFont(headerFont);
		headerStyle.setFillForegroundColor(IndexedColors.RED.getIndex());
		headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

		// Header
		Row headerRow = sheet.createRow(0);
		String[] headers = {"Registro", "Código Error", "Detalle Error", "Columnas Afectadas"};

		for (int i = 0; i < headers.length; i++) {
			Cell cell = headerRow.createCell(i);
			cell.setCellValue(headers[i]);
			cell.setCellStyle(headerStyle);
		}

		// Datos
		int rowNum = 1;
		for (Bolsa107Error error : errores) {
			Row row = sheet.createRow(rowNum++);

			row.createCell(0).setCellValue(error.getRegistro() != null ? error.getRegistro() : "");
			row.createCell(1).setCellValue(error.getCodigoError() != null ? error.getCodigoError() : "");
			row.createCell(2).setCellValue(error.getDetalleError() != null ? error.getDetalleError() : "");
			row.createCell(3).setCellValue(error.getColumnasError() != null ? error.getColumnasError() : "");
		}

		// Auto-size columns
		for (int i = 0; i < headers.length; i++) {
			sheet.autoSizeColumn(i);
		}
	}

	/**
	 * Mapear entidad Carga a Map para response
	 */
	private Map<String, Object> mapCargaToResponse(Bolsa107Carga carga) {
		Map<String, Object> map = new HashMap<>();
		map.put("idCarga", carga.getIdCarga());
		map.put("nombreArchivo", carga.getNombreArchivo());
		map.put("fechaReporte", carga.getFechaReporte());
		map.put("fechaCarga", carga.getCreatedAt()); // Fecha de creación de la carga
		map.put("totalFilas", carga.getTotalFilas());
		map.put("filasOk", carga.getFilasOk());
		map.put("filasError", carga.getFilasError());
		map.put("hashArchivo", carga.getHashArchivo());
		map.put("usuarioCarga", carga.getUsuarioCarga());
		return map;
	}
}
package com.styp.cenate.api.form107;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.styp.cenate.service.form107.Bolsa107DataService;
import com.styp.cenate.service.form107.ExcelImportService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/import-excel")
@RequiredArgsConstructor
@Slf4j
public class ImportExcelController {

	private final ExcelImportService service;
	private final Bolsa107DataService dataService;

	/**
	 * Importar archivo Excel con pacientes
	 */
	@PostMapping(value = "/pacientes", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<?> importarPacientes(@RequestParam("file") MultipartFile file) {
		log.info("📤 Iniciando importación de archivo Excel: {}", file.getOriginalFilename());

		try {
			Map<String, Object> result = service.importarYProcesar(file, "70073164");
			log.info("✅ Importación exitosa - Total: {}, OK: {}, Errores: {}",
				result.get("totalFilas"), result.get("filasOk"), result.get("filasError"));
			return ResponseEntity.ok(result);
		} catch (Exception e) {
			log.error("❌ Error en importación: ", e);
			return ResponseEntity.badRequest()
				.body(Map.of("error", e.getMessage()));
		}
	}

	/**
	 * Obtener lista de todas las cargas importadas
	 */
	@GetMapping("/cargas")
	public ResponseEntity<?> obtenerListaCargas() {
		log.info("📋 Obteniendo lista de todas las cargas");

		try {
			List<Map<String, Object>> cargas = dataService.obtenerListaCargas();
			log.info("✅ Retornando {} cargas", cargas.size());

			return ResponseEntity.ok(Map.of(
				"status", 200,
				"data", cargas,
				"message", "Lista de cargas obtenida correctamente"
			));
		} catch (Exception e) {
			log.error("❌ Error al obtener lista de cargas: ", e);
			return ResponseEntity.badRequest()
				.body(Map.of("error", e.getMessage()));
		}
	}

	/**
	 * Obtener datos completos de una carga específica (items + errores)
	 */
	@GetMapping("/pacientes/{idCarga}/datos")
	public ResponseEntity<?> obtenerDatosCarga(@PathVariable("idCarga") Long idCarga) {
		log.info("🔍 Obteniendo datos de carga ID: {}", idCarga);

		try {
			Map<String, Object> datos = dataService.obtenerDatosCarga(idCarga);
			log.info("✅ Datos de carga {} obtenidos - Items: {}, Errores: {}",
				idCarga, datos.get("total_items"), datos.get("total_errores"));

			return ResponseEntity.ok(Map.of(
				"status", 200,
				"data", datos,
				"message", "Datos de carga obtenidos correctamente"
			));
		} catch (Exception e) {
			log.error("❌ Error al obtener datos de carga: ", e);
			return ResponseEntity.badRequest()
				.body(Map.of("error", e.getMessage()));
		}
	}

	/**
	 * Eliminar una carga (soft delete o física según implementación)
	 */
	@DeleteMapping("/cargas/{idCarga}")
	public ResponseEntity<?> eliminarCarga(@PathVariable("idCarga") Long idCarga) {
		log.info("🗑️ Eliminando carga ID: {}", idCarga);

		try {
			dataService.eliminarCarga(idCarga);
			log.info("✅ Carga {} eliminada correctamente", idCarga);

			return ResponseEntity.ok(Map.of(
				"status", 200,
				"message", "Carga eliminada correctamente"
			));
		} catch (Exception e) {
			log.error("❌ Error al eliminar carga: ", e);
			return ResponseEntity.badRequest()
				.body(Map.of("error", e.getMessage()));
		}
	}

	/**
	 * Exportar carga a archivo Excel
	 */
	@GetMapping("/cargas/{idCarga}/exportar")
	public ResponseEntity<?> exportarCarga(@PathVariable("idCarga") Long idCarga) {
		log.info("📥 Exportando carga ID: {} a Excel", idCarga);

		try {
			byte[] excelBytes = dataService.exportarCargaExcel(idCarga);

			HttpHeaders headers = new HttpHeaders();
			headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
			headers.setContentDispositionFormData("attachment",
				"bolsa_107_carga_" + idCarga + ".xlsx");
			headers.setContentLength(excelBytes.length);

			log.info("✅ Exportación exitosa - Tamaño: {} bytes", excelBytes.length);

			return ResponseEntity.ok()
				.headers(headers)
				.body(excelBytes);

		} catch (Exception e) {
			log.error("❌ Error al exportar carga: ", e);
			return ResponseEntity.badRequest()
				.body(Map.of("error", e.getMessage()));
		}
	}
}

package com.styp.cenate.api.form107;

import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
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


	@PostMapping(value = "/pacientes", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<?> importarPacientes(@RequestParam("file") MultipartFile file
	// , @RequestParam(value="usuario", required=false) String usuario
	) {
		log.info("CONTROLLER DE IMPORTACION EXCEL");
		Map<String, Object> result = service.importarYProcesar(file, "70073164");
		return ResponseEntity.ok(result);
	}
	
	/**
	 * Obtiene los datos completos de una carga: items y errores
	 */
	@GetMapping("/pacientes/{idCarga}/datos")
	public ResponseEntity<?> obtenerDatosCarga(@PathVariable("idCarga") Long idCarga) {
		log.info("Obteniendo datos de carga ID: {}", idCarga);
		
		try {
			Map<String, Object> datos = dataService.obtenerDatosCarga(idCarga);
			return ResponseEntity.ok(datos);
		} catch (Exception e) {
			log.error("Error al obtener datos de carga: ", e);
			return ResponseEntity.badRequest()
					.body(Map.of("error", e.getMessage()));
		}
	}

}

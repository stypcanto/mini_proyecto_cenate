package com.styp.cenate.api.excel;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import com.styp.cenate.dto.excel.ImportResultadosDTO;
import com.styp.cenate.service.excel.ExcelImportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/import-excel")
@RequiredArgsConstructor
@Slf4j
public class ImportExcelController {

	private final ExcelImportService servicioExcel;

	@PostMapping(value = "/pacientes", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ResponseEntity<?> importarPacientes(@RequestParam("file") MultipartFile file) {
		log.info("CONTROLLER DE IMPORTACION EXCEL");
		ImportResultadosDTO resultado = servicioExcel.importarPacientes(file);
		if (resultado.getTotal() == 0 && !resultado.getErrores().isEmpty()) {
			return ResponseEntity.badRequest().body(resultado);
		}
		return ResponseEntity.ok(resultado);
	}

}

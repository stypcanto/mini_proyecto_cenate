package com.styp.cenate.service.excel;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.styp.cenate.dto.excel.ImportResultadosDTO;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class ExcelImportService {
	
	
	public ImportResultadosDTO importarPacientes(MultipartFile file) {
		
		ImportResultadosDTO resultados = new ImportResultadosDTO();
		
		if (file == null || file.isEmpty() ) {
			resultados.getErrores().add("El archivo se encuentra sin informacion");
			return resultados;
		}
		
		log.info("Probando excel");
		
		
		
		
		return resultados;
	}

}

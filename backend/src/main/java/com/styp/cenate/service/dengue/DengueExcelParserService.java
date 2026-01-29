package com.styp.cenate.service.dengue;

import com.styp.cenate.dto.dengue.DengueExcelRowDTO;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

/**
 * Interface para parsear archivos Excel de dengue
 *
 * @version 1.0.0
 * @since 2026-01-29
 */
public interface DengueExcelParserService {

    /**
     * Parsea archivo Excel y retorna lista de DTOs
     * @param archivo MultipartFile con Excel
     * @return List<DengueExcelRowDTO> con datos parseados
     * @throws IOException si hay error al parsear
     */
    List<DengueExcelRowDTO> parsearExcel(MultipartFile archivo) throws IOException;
}

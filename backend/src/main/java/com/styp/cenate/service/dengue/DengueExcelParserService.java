package com.styp.cenate.service.dengue;

import com.styp.cenate.dto.dengue.DengueExcelRowDTO;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

/**
 * Servicio para parsear archivos Excel de dengue
 *
 * Lee el archivo "Atendidos Dengue CENATE 2026-01-27.xlsx" con sus 14 columnas:
 * dni, sexo, edad, fec_aten, cenasicod, dx_main, servicio, ipress, red,
 * nombre, telef_fijo, telef_movil, fec_st, semana
 *
 * @version 1.0.0
 * @since 2026-01-29
 */
public interface DengueExcelParserService {

    /**
     * Parsea un archivo Excel y convierte sus filas a DTOs
     *
     * @param archivo MultipartFile con extensión .xlsx
     * @return List de DengueExcelRowDTO (uno por cada fila de datos)
     * @throws IOException Si hay error leyendo el archivo
     * @throws RuntimeException Si el formato Excel es inválido
     */
    List<DengueExcelRowDTO> parsearExcel(MultipartFile archivo) throws IOException;

}

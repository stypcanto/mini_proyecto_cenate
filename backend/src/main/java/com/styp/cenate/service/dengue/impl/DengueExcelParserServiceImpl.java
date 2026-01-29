package com.styp.cenate.service.dengue.impl;

import com.styp.cenate.dto.dengue.DengueExcelRowDTO;
import com.styp.cenate.service.dengue.DengueExcelParserService;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

/**
 * Implementación para parsear Excel de Dengue usando Apache POI
 *
 * @version 1.0.0
 * @since 2026-01-29
 */
@Service
@Slf4j
public class DengueExcelParserServiceImpl implements DengueExcelParserService {

    @Override
    public List<DengueExcelRowDTO> parsearExcel(MultipartFile archivo) throws IOException {
        log.info("📄 Iniciando parseo de archivo: {}", archivo.getOriginalFilename());
        List<DengueExcelRowDTO> filas = new ArrayList<>();

        try (Workbook workbook = new XSSFWorkbook(archivo.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            log.info("📋 Parseando sheet: {}", sheet.getSheetName());

            int numeroFila = 0;
            for (Row row : sheet) {
                // Saltar header (primera fila)
                if (numeroFila == 0) {
                    numeroFila++;
                    continue;
                }

                try {
                    DengueExcelRowDTO dto = construirDTO(row, numeroFila);
                    if (dto.esValida()) {
                        filas.add(dto);
                    }
                } catch (Exception e) {
                    log.warn("⚠️ Error en fila {}: {}", numeroFila, e.getMessage());
                }
                numeroFila++;
            }

            log.info("✅ Se parsearon {} filas válidas", filas.size());
        }

        return filas;
    }

    /**
     * Construye DTO a partir de una fila de Excel
     */
    private DengueExcelRowDTO construirDTO(Row row, int numeroFila) {
        return DengueExcelRowDTO.builder()
                .dni(getCellStringValue(row, 0))
                .sexo(getCellStringValue(row, 1))
                .edad(getCellIntValue(row, 2))
                .fechaAten(getCellDateValue(row, 3))
                .cenasicod(getCellIntValue(row, 4))
                .dxMain(getCellStringValue(row, 5))
                .servicio(getCellStringValue(row, 6))
                .ipress(getCellStringValue(row, 7))
                .red(getCellStringValue(row, 8))
                .nombre(getCellStringValue(row, 9))
                .telefFijo(getCellStringValue(row, 10))
                .telefMovil(getCellStringValue(row, 11))
                .fechaSt(getCellDateValue(row, 12))
                .semana(getCellStringValue(row, 13))
                .build();
    }

    /**
     * Obtiene valor String de celda
     */
    private String getCellStringValue(Row row, int columnIndex) {
        Cell cell = row.getCell(columnIndex);
        if (cell == null) return null;

        if (cell.getCellType() == CellType.STRING) {
            return cell.getStringCellValue().trim();
        } else if (cell.getCellType() == CellType.NUMERIC) {
            return String.valueOf((long) cell.getNumericCellValue());
        }
        return null;
    }

    /**
     * Obtiene valor Integer de celda
     */
    private Integer getCellIntValue(Row row, int columnIndex) {
        Cell cell = row.getCell(columnIndex);
        if (cell == null) return null;

        if (cell.getCellType() == CellType.NUMERIC) {
            return (int) cell.getNumericCellValue();
        }
        return null;
    }

    /**
     * Obtiene valor LocalDate de celda
     */
    private LocalDate getCellDateValue(Row row, int columnIndex) {
        Cell cell = row.getCell(columnIndex);
        if (cell == null) return null;

        if (cell.getCellType() == CellType.NUMERIC) {
            Date date = cell.getDateCellValue();
            return date.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
        }
        return null;
    }
}

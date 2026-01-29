package com.styp.cenate.service.dengue.impl;

import com.styp.cenate.dto.dengue.DengueExcelRowDTO;
import com.styp.cenate.service.dengue.DengueExcelParserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;

/**
 * Implementación del servicio para parsear Excel de dengue
 *
 * Utiliza Apache POI para leer archivos .xlsx
 * Mapea las 14 columnas del Excel a DengueExcelRowDTO
 *
 * @version 1.0.0
 * @since 2026-01-29
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DengueExcelParserServiceImpl implements DengueExcelParserService {

    /**
     * Parsea archivo Excel y convierte a DTOs
     *
     * @param archivo MultipartFile del Excel
     * @return List<DengueExcelRowDTO>
     * @throws IOException Si hay error al leer
     */
    @Override
    public List<DengueExcelRowDTO> parsearExcel(MultipartFile archivo) throws IOException {
        List<DengueExcelRowDTO> filas = new ArrayList<>();

        try (InputStream is = archivo.getInputStream();
             Workbook workbook = new XSSFWorkbook(is)) {

            Sheet sheet = workbook.getSheetAt(0);
            log.info("📄 Leyendo Excel: {} - Hojas: {}", archivo.getOriginalFilename(), workbook.getNumberOfSheets());

            boolean esEncabezado = true;
            int filaActual = 0;

            for (Row row : sheet) {
                filaActual++;

                // Saltar encabezado
                if (esEncabezado) {
                    log.debug("📋 Encabezado detectado en fila 1");
                    esEncabezado = false;
                    continue;
                }

                // Saltar filas vacías
                if (estaVacia(row)) {
                    continue;
                }

                try {
                    DengueExcelRowDTO fila = construirDTO(row, filaActual);
                    filas.add(fila);

                } catch (Exception e) {
                    log.warn("⚠️  Error en fila {}: {}", filaActual, e.getMessage());
                    // Continuar con siguiente fila - el servicio manejará errores
                }
            }

            log.info("✅ Excel parseado: {} filas leídas", filas.size());
            return filas;

        } catch (IOException e) {
            log.error("❌ Error leyendo Excel", e);
            throw new IOException("Error procesando archivo Excel: " + e.getMessage(), e);
        }
    }

    /**
     * Construye DTO a partir de una fila del Excel
     * Mapea 14 columnas: dni, sexo, edad, fec_aten, cenasicod, dx_main, servicio,
     * ipress, red, nombre, telef_fijo, telef_movil, fec_st, semana
     *
     * @param row Row del Excel
     * @param numeroFila Número de fila (para debugging)
     * @return DengueExcelRowDTO
     */
    private DengueExcelRowDTO construirDTO(Row row, int numeroFila) {
        return DengueExcelRowDTO.builder()
            .dni(getCellStringValue(row, 0))           // Columna 1: dni
            .sexo(getCellStringValue(row, 1))          // Columna 2: sexo
            .edad(getCellIntValue(row, 2))             // Columna 3: edad
            .fechaAten(getCellDateValue(row, 3))       // Columna 4: fec_aten
            .cenasicod(getCellIntValue(row, 4))        // Columna 5: cenasicod
            .dxMain(getCellStringValue(row, 5))        // Columna 6: dx_main
            .servicio(getCellStringValue(row, 6))      // Columna 7: servicio
            .ipress(getCellStringValue(row, 7))        // Columna 8: ipress
            .red(getCellStringValue(row, 8))           // Columna 9: red
            .nombre(getCellStringValue(row, 9))        // Columna 10: nombre
            .telefFijo(getCellStringValue(row, 10))    // Columna 11: telef_fijo
            .telefMovil(getCellStringValue(row, 11))   // Columna 12: telef_movil
            .fechaSt(getCellDateValue(row, 12))        // Columna 13: fec_st
            .semana(getCellStringValue(row, 13))       // Columna 14: semana
            .build();
    }

    /**
     * Obtiene valor String de una celda
     *
     * @param row Row del Excel
     * @param colIndex Índice de columna (0-based)
     * @return Valor como String o null
     */
    private String getCellStringValue(Row row, int colIndex) {
        Cell cell = row.getCell(colIndex);
        if (cell == null) {
            return null;
        }
        try {
            // Intentar leer como string
            return cell.getStringCellValue().trim();
        } catch (IllegalStateException e) {
            // Si es numérico, convertir
            try {
                return String.valueOf((long) cell.getNumericCellValue()).trim();
            } catch (Exception ex) {
                return null;
            }
        }
    }

    /**
     * Obtiene valor Integer de una celda
     *
     * @param row Row del Excel
     * @param colIndex Índice de columna (0-based)
     * @return Valor como Integer o null
     */
    private Integer getCellIntValue(Row row, int colIndex) {
        Cell cell = row.getCell(colIndex);
        if (cell == null) {
            return null;
        }
        try {
            return (int) cell.getNumericCellValue();
        } catch (Exception e) {
            try {
                return Integer.parseInt(cell.getStringCellValue().trim());
            } catch (Exception ex) {
                return null;
            }
        }
    }

    /**
     * Obtiene valor LocalDate de una celda
     * Maneja fechas en formato Excel (numeric)
     *
     * @param row Row del Excel
     * @param colIndex Índice de columna (0-based)
     * @return Valor como LocalDate o null
     */
    private LocalDate getCellDateValue(Row row, int colIndex) {
        Cell cell = row.getCell(colIndex);
        if (cell == null) {
            return null;
        }
        try {
            // Excel almacena fechas como números
            if (cell.getDateCellValue() != null) {
                return cell.getDateCellValue()
                    .toInstant()
                    .atZone(ZoneId.systemDefault())
                    .toLocalDate();
            }
        } catch (Exception e) {
            // Intentar parsear como string
            try {
                String fechaStr = cell.getStringCellValue().trim();
                if (fechaStr.equalsIgnoreCase("No hay información")) {
                    return null;
                }
                // Aquí podrías agregar lógica de parsing de strings si es necesario
            } catch (Exception ex) {
                // Ignorar
            }
        }
        return null;
    }

    /**
     * Verifica si una fila está completamente vacía
     *
     * @param row Row a verificar
     * @return true si la fila está vacía
     */
    private boolean estaVacia(Row row) {
        if (row == null) {
            return true;
        }
        Cell primerCell = row.getCell(0);
        return primerCell == null || primerCell.toString().trim().isEmpty();
    }

}

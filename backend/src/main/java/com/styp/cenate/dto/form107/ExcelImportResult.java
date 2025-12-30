package com.styp.cenate.dto.form107;
import java.util.List;
import java.util.Map;

public class ExcelImportResult {
  public int filas_total;
  public int filas_ok;
  public int filas_error;

  // opcional: detalle por fila
  public List<Map<String, Object>> errores;

  public ExcelImportResult(int total, int ok, int error, List<Map<String, Object>> errores) {
    this.filas_total = total;
    this.filas_ok = ok;
    this.filas_error = error;
    this.errores = errores;
  }
}

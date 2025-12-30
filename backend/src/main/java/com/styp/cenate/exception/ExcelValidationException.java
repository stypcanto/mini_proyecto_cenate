package com.styp.cenate.exception;
public class ExcelValidationException extends RuntimeException {

  private final Object detail;

  public ExcelValidationException(String message) {
    super(message);
    this.detail = null;
  }

  public ExcelValidationException(Object detail) {
    super("Excel validation error");
    this.detail = detail;
  }

  public Object getDetail() {
    return detail;
  }
}

package com.styp.cenate.model.bolsas;

/**
 * ✅ v1.20.0: Enum para tipos de error de importación
 * Define las categorías válidas de errores en importación Excel
 *
 * @since 2026-01-28
 */
public enum TipoErrorImportacion {
    DUPLICADO("Registro duplicado en la bolsa"),
    CONSTRAINT("Violación de restricción de integridad"),
    VALIDACION("Error de validación de datos"),
    FORMATO("Formato de datos inválido"),
    ENRIQUECIMIENTO("Fallo en enriquecimiento desde BD"),
    OTRO("Otro tipo de error");

    private final String descripcion;

    TipoErrorImportacion(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getDescripcion() {
        return descripcion;
    }
}

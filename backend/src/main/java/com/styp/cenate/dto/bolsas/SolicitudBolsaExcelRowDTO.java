package com.styp.cenate.dto.bolsas;

/**
 * DTO para representar una fila procesada del archivo Excel
 * Utilizado durante el procesamiento de importación de solicitudes de bolsa
 * Incluye los 11 campos de la plantilla v1.14.0
 *
 * @version v1.14.0 - 11 CAMPOS COMPLETOS (Agregado Teléfono Alterno)
 * @since 2026-01-28
 */
public record SolicitudBolsaExcelRowDTO(
    // Metadata
    int filaExcel,

    // ============================================================================
    // 📋 LOS 11 CAMPOS DE EXCEL v1.14.0
    // ============================================================================

    // 1. FECHA PREFERIDA QUE NO FUE ATENDIDA
    String fechaPreferidaNoAtendida,

    // 2. TIPO DOCUMENTO
    String tipoDocumento,

    // 3. DNI
    String dni,

    // 4. ASEGURADO (Nombres completos)
    String nombreCompleto,

    // 5. SEXO
    String sexo,

    // 6. FECHA DE NACIMIENTO (YYYY-MM-DD)
    String fechaNacimiento,

    // 7. TELÉFONO PRINCIPAL
    String telefonoPrincipal,

    // 8. TELÉFONO ALTERNO (NEW)
    String telefonoAlterno,

    // 9. CORREO
    String correo,

    // 10. COD. IPRESS ADSCRIPCIÓN
    String codigoIpress,

    // 11. TIPO CITA (Recita, Interconsulta, Voluntaria)
    String tipoCita
) {
    /**
     * Constructor compacto con validación de campos obligatorios
     * Campos opcionales: telefonoPrincipal, telefonoAlterno, correo (se llenan desde BD si faltan)
     */
    public SolicitudBolsaExcelRowDTO {
        if (filaExcel <= 0) {
            throw new IllegalArgumentException("Número de fila debe ser positivo");
        }
        if (fechaPreferidaNoAtendida == null || fechaPreferidaNoAtendida.isBlank()) {
            throw new IllegalArgumentException("Fila " + filaExcel + ": FECHA PREFERIDA QUE NO FUE ATENDIDA no puede estar vacía");
        }
        if (tipoDocumento == null || tipoDocumento.isBlank()) {
            throw new IllegalArgumentException("Fila " + filaExcel + ": TIPO DOCUMENTO no puede estar vacío");
        }
        if (dni == null || dni.isBlank()) {
            throw new IllegalArgumentException("Fila " + filaExcel + ": DNI no puede estar vacío");
        }
        if (nombreCompleto == null || nombreCompleto.isBlank()) {
            throw new IllegalArgumentException("Fila " + filaExcel + ": ASEGURADO no puede estar vacío");
        }
        if (sexo == null || sexo.isBlank()) {
            throw new IllegalArgumentException("Fila " + filaExcel + ": SEXO no puede estar vacío");
        }
        if (fechaNacimiento == null || fechaNacimiento.isBlank()) {
            throw new IllegalArgumentException("Fila " + filaExcel + ": FECHA DE NACIMIENTO no puede estar vacía");
        }
        // CAMPOS OPCIONALES: Se llenan desde BD si faltan
        // - telefonoPrincipal
        // - telefonoAlterno (NEW)
        // - correo

        if (codigoIpress == null || codigoIpress.isBlank()) {
            throw new IllegalArgumentException("Fila " + filaExcel + ": COD. IPRESS ADSCRIPCIÓN no puede estar vacío");
        }
        if (tipoCita == null || tipoCita.isBlank()) {
            throw new IllegalArgumentException("Fila " + filaExcel + ": TIPO CITA no puede estar vacío");
        }

        // Validar que TIPO CITA sea uno de los 3 valores válidos
        if (!tipoCita.equals("Recita") && !tipoCita.equals("Interconsulta") && !tipoCita.equals("Voluntaria")) {
            throw new IllegalArgumentException("Fila " + filaExcel + ": TIPO CITA debe ser uno de: Recita, Interconsulta, Voluntaria (recibido: " + tipoCita + ")");
        }
    }
}

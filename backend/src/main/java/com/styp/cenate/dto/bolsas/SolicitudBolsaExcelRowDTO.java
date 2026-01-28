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

    // 11. TIPO CITA (Recita, Interconsulta, Voluntaria, Referencia)
    String tipoCita
) {
    /**
     * Constructor compacto con validación de campos obligatorios
     *
     * Campos OBLIGATORIOS:
     * - dni: DNI del asegurado
     * - nombreCompleto: Nombres del asegurado
     * - codigoIpress: Código de IPRESS de adscripción
     * - tipoCita: RECITA, INTERCONSULTA, VOLUNTARIA, REFERENCIA
     *
     * Campos OPCIONALES (se completan desde BD o con fallbacks):
     * - fechaPreferidaNoAtendida: Fecha preferida (v1.18.0: ahora optional - algunos archivos no la tienen)
     * - tipoDocumento: Se completa con "DNI" si falta
     * - sexo: Se completa desde asegurados si está vacío
     * - fechaNacimiento: Se completa desde asegurados si está vacío
     * - telefonoPrincipal: Se completa desde asegurados si está vacío
     * - telefonoAlterno: Se completa desde asegurados si está vacío
     * - correo: Se completa desde asegurados si está vacío
     */
    public SolicitudBolsaExcelRowDTO {
        if (filaExcel <= 0) {
            throw new IllegalArgumentException("Número de fila debe ser positivo");
        }

        // FECHA PREFERIDA: Ahora OPCIONAL - algunos Excel no tienen esta columna
        // v1.18.0: Pediatría22 no tiene esta columna, cambiar a fallback si está vacía
        if (fechaPreferidaNoAtendida == null || fechaPreferidaNoAtendida.isBlank()) {
            // No lanzar excepción - usar fallback como None / vacío
            // log.info("ℹ️  Fila {}: FECHA PREFERIDA vacía - usando valor por defecto", filaExcel);
        }

        // TIPO DOCUMENTO ahora es opcional - se completa con "DNI" como fallback en el servicio
        // if (tipoDocumento == null || tipoDocumento.isBlank()) {
        //     throw new IllegalArgumentException("Fila " + filaExcel + ": TIPO DOCUMENTO no puede estar vacío");
        // }

        if (dni == null || dni.isBlank()) {
            throw new IllegalArgumentException("Fila " + filaExcel + ": DNI no puede estar vacío");
        }
        if (nombreCompleto == null || nombreCompleto.isBlank()) {
            throw new IllegalArgumentException("Fila " + filaExcel + ": ASEGURADO no puede estar vacío");
        }

        if (codigoIpress == null || codigoIpress.isBlank()) {
            throw new IllegalArgumentException("Fila " + filaExcel + ": COD. IPRESS ADSCRIPCIÓN no puede estar vacío");
        }
        if (tipoCita == null || tipoCita.isBlank()) {
            throw new IllegalArgumentException("Fila " + filaExcel + ": TIPO CITA no puede estar vacío");
        }

        // Validar que TIPO CITA sea uno de los 4 valores válidos (case-insensitive) - OBLIGATORIO
        String tipoCitaNormalizado = tipoCita.toLowerCase().trim();
        if (!tipoCitaNormalizado.equals("recita") && !tipoCitaNormalizado.equals("interconsulta") &&
            !tipoCitaNormalizado.equals("voluntaria") && !tipoCitaNormalizado.equals("referencia")) {
            throw new IllegalArgumentException("Fila " + filaExcel + ": TIPO CITA debe ser uno de: Recita, Interconsulta, Voluntaria, Referencia (recibido: " + tipoCita + ")");
        }
    }
}

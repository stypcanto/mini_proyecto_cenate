package com.styp.cenate.dto.bolsas;

/**
 * DTO para representar una fila procesada del archivo Excel
 * Utilizado durante el procesamiento de importación de solicitudes de bolsa
 * Incluye datos de asegurado para sincronización automática
 *
 * @version v1.6.0
 * @since 2026-01-23
 */
public record SolicitudBolsaExcelRowDTO(
    int filaExcel,
    String dni,
    String codigoAdscripcion,
    String nombreCompleto,
    String fechaNacimiento,
    String genero,
    String telefonoFijo,
    String telefonoCelular,
    String correoElectronico
) {
    /**
     * Constructor compacto con validación
     */
    public SolicitudBolsaExcelRowDTO {
        if (filaExcel <= 0) {
            throw new IllegalArgumentException("Número de fila debe ser positivo");
        }
        if (dni == null || dni.isBlank()) {
            throw new IllegalArgumentException("DNI no puede estar vacío");
        }
        if (codigoAdscripcion == null || codigoAdscripcion.isBlank()) {
            throw new IllegalArgumentException("Código de adscripción no puede estar vacío");
        }
    }
}

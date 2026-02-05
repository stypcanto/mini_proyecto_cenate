package com.styp.cenate.dto.formdiag;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import java.util.List;

/**
 * DTO para solicitud de descarga múltiple de PDFs en ZIP
 *
 * Permite al usuario descargar múltiples formularios/diagnósticos
 * en un único archivo ZIP comprimido.
 *
 * @version v1.45.3
 * @since 2026-02-05
 * @author Claude Haiku 4.5
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DescargarZipRequest {

    /**
     * Lista de IDs de formularios/diagnósticos a descargar
     *
     * - Máximo: 50 archivos por solicitud (para evitar sobrecarga)
     * - Mínimo: 1 archivo (lista no puede estar vacía)
     */
    @NotEmpty(message = "La lista de IDs no puede estar vacía")
    @Size(max = 50, message = "No se pueden descargar más de 50 PDFs a la vez")
    private List<Integer> ids;
}

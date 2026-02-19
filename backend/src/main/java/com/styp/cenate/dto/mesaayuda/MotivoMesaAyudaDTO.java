package com.styp.cenate.dto.mesaayuda;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para motivos de Mesa de Ayuda
 * Se retorna en el combo de selección de motivos
 *
 * @author Styp Canto Rondón
 * @version v1.64.0 (2026-02-18)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MotivoMesaAyudaDTO {

    /**
     * ID único del motivo
     */
    private Long id;

    /**
     * Código del motivo (referencia interna)
     */
    private String codigo;

    /**
     * Descripción del motivo (mostrada en el combo)
     */
    private String descripcion;

}

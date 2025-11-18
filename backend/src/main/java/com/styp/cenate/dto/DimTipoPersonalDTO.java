package com.styp.cenate.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * DTO para DimTipoPersonal con subclases para Request/Response
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DimTipoPersonalDTO {
    private Long idTipPers;
    private String descTipPers;
    private String statTipPers;
    private LocalDateTime createAt;
    private LocalDateTime updateAt;

    /**
     * DTO para crear un nuevo TipoPersonal
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateRequest {

        @NotBlank(message = "La descripción del tipo de personal es obligatoria")
        @Size(min = 3, max = 200, message = "La descripción debe tener entre 3 y 200 caracteres")
        private String descTipPers;

        @Pattern(regexp = "^[AI]$", message = "El estado debe ser 'A' (Activo) o 'I' (Inactivo)")
        private String statTipPers = "A";
    }

    /**
     * DTO para actualizar un TipoPersonal existente
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateRequest {

        @Size(min = 3, max = 200, message = "La descripción debe tener entre 3 y 200 caracteres")
        private String descTipPers;

        @Pattern(regexp = "^[AI]$", message = "El estado debe ser 'A' (Activo) o 'I' (Inactivo)")
        private String statTipPers;
    }
}

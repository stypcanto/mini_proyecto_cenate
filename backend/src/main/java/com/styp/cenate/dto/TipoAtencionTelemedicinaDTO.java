package com.styp.cenate.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

/**
 * DTO para transferir datos de Tipos de Atención en Telemedicina
 *
 * @author Claude Code + Styp Canto Rondón
 * @version 2.0.0
 * @since 2026-01-03
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TipoAtencionTelemedicinaDTO {

    private Long idTipoAtencion;

    @NotBlank(message = "El código del tipo de atención es obligatorio")
    @Size(max = 20, message = "El código no puede exceder 20 caracteres")
    private String codTipoAtencion;

    @NotBlank(message = "La descripción es obligatoria")
    @Size(max = 100, message = "La descripción no puede exceder 100 caracteres")
    private String descTipoAtencion;

    @NotBlank(message = "La sigla es obligatoria")
    @Size(max = 20, message = "La sigla no puede exceder 20 caracteres")
    private String sigla;

    @NotNull(message = "Debe especificar si requiere profesional")
    private Boolean requiereProfesional;

    @Pattern(regexp = "^[AI]$", message = "El estado debe ser 'A' (Activo) o 'I' (Inactivo)")
    private String estado;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
    private OffsetDateTime createdAt;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
    private OffsetDateTime updatedAt;

    // Campos calculados
    private Boolean activo;

    /**
     * Convierte el estado a boolean
     *
     * @return true si estado = 'A', false en caso contrario
     */
    public Boolean getActivo() {
        return "A".equals(this.estado);
    }
}

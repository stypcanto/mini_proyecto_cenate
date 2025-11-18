package com.styp.cenate.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;

/**
 * DTO para solicitudes de creación/actualización de Personal CNT
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PersonalCntRequest {

    @NotNull(message = "El tipo de documento es obligatorio")
    private Long idTipDoc;

    @NotBlank(message = "El número de documento es obligatorio")
    @Size(max = 20, message = "El número de documento no puede tener más de 20 caracteres")
    private String numDocPers;

    @Size(max = 255, message = "El nombre no puede tener más de 255 caracteres")
    private String nomPers;

    @Size(max = 255, message = "El apellido paterno no puede tener más de 255 caracteres")
    private String apePaterPers;

    @Size(max = 255, message = "El apellido materno no puede tener más de 255 caracteres")
    private String apeMaterPers;

    @NotBlank(message = "El periodo es obligatorio")
    @Pattern(regexp = "^\\d{6}$", message = "El periodo debe tener formato YYYYMM")
    private String perPers;

    @NotBlank(message = "El estado es obligatorio")
    @Pattern(regexp = "^[AI]$", message = "El estado debe ser 'A' (Activo) o 'I' (Inactivo)")
    private String statPers;

    @Past(message = "La fecha de nacimiento debe ser en el pasado")
    private LocalDate fechNaciPers;

    @Pattern(regexp = "^[MF]$", message = "El género debe ser 'M' o 'F'")
    private String genPers;

    @Size(max = 20, message = "El móvil no puede tener más de 20 caracteres")
    private String movilPers;

    @Email(message = "El email personal debe ser válido")
    @Size(max = 100, message = "El email personal no puede tener más de 100 caracteres")
    private String emailPers;

    @Email(message = "El email corporativo debe ser válido")
    @Size(max = 100, message = "El email corporativo no puede tener más de 100 caracteres")
    private String emailCorpPers;

    @Size(max = 20, message = "El número de colegiatura no puede tener más de 20 caracteres")
    private String colegPers;

    @Size(max = 50, message = "El código de planilla no puede tener más de 50 caracteres")
    private String codPlanRem;

    @Size(max = 255, message = "La dirección no puede tener más de 255 caracteres")
    private String direcPers;

    private Long idRegLab;
    private Long idArea;
    private Long idUsuario;
}

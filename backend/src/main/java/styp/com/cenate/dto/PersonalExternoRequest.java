package styp.com.cenate.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;

/**
 * DTO para solicitudes de creación/actualización de Personal Externo
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PersonalExternoRequest {

    @NotNull(message = "El tipo de documento es obligatorio")
    private Long idTipDoc;

    @NotBlank(message = "El número de documento es obligatorio")
    @Size(max = 20, message = "El número de documento no puede tener más de 20 caracteres")
    private String numDocExt;

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 255, message = "El nombre no puede tener más de 255 caracteres")
    private String nomExt;

    @NotBlank(message = "El apellido paterno es obligatorio")
    @Size(max = 255, message = "El apellido paterno no puede tener más de 255 caracteres")
    private String apePaterExt;

    @NotBlank(message = "El apellido materno es obligatorio")
    @Size(max = 255, message = "El apellido materno no puede tener más de 255 caracteres")
    private String apeMaterExt;

    @NotNull(message = "La fecha de nacimiento es obligatoria")
    @Past(message = "La fecha de nacimiento debe ser en el pasado")
    private LocalDate fechNaciExt;

    @NotBlank(message = "El género es obligatorio")
    @Pattern(regexp = "^[MF]$", message = "El género debe ser 'M' o 'F'")
    private String genExt;

    @Size(max = 20, message = "El móvil no puede tener más de 20 caracteres")
    private String movilExt;

    @Email(message = "El email personal debe ser válido")
    @Size(max = 100, message = "El email personal no puede tener más de 100 caracteres")
    private String emailPersExt;

    private Long idIpress;

    private Long idUser;
}

package styp.com.cenate.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * DTO para crear/actualizar Personal Externo
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PersonalExternoRequest {
    
    @NotNull(message = "El tipo de documento es requerido")
    private Long idTipDoc;  // ✅ Cambiado a Long
    
    @NotBlank(message = "El número de documento es requerido")
    @Size(max = 20, message = "El número de documento no puede exceder 20 caracteres")
    private String numDocExt;
    
    @NotBlank(message = "El nombre es requerido")
    @Size(max = 255, message = "El nombre no puede exceder 255 caracteres")
    private String nomExt;
    
    @NotBlank(message = "El apellido paterno es requerido")
    @Size(max = 255, message = "El apellido paterno no puede exceder 255 caracteres")
    private String apePaterExt;
    
    @Size(max = 255, message = "El apellido materno no puede exceder 255 caracteres")
    private String apeMaterExt;
    
    private LocalDate fechNaciExt;
    
    @Pattern(regexp = "^[MF]$", message = "El género debe ser M (Masculino) o F (Femenino)")
    private String genExt;
    
    @Size(max = 20, message = "El teléfono no puede exceder 20 caracteres")
    private String movilExt;
    
    @Email(message = "El email personal debe ser válido")
    @Size(max = 100, message = "El email personal no puede exceder 100 caracteres")
    private String emailPersExt;
    
    /**
     * ID de la institución (IPRESS) a la que pertenece
     */
    private Long idIpress;  // ✅ Cambiado a Long
    
    /**
     * ID del usuario asociado
     */
    private Long idUser;  // ✅ Cambiado a Long
}

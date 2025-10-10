package styp.com.cenate.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * DTO para crear/actualizar Personal CENATE (interno)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PersonalCntRequest {
    
    @NotNull(message = "El tipo de documento es requerido")
    private Long idTipDoc;
    
    @NotBlank(message = "El número de documento es requerido")
    @Size(max = 20, message = "El número de documento no puede exceder 20 caracteres")
    private String numDocPers;
    
    @NotBlank(message = "El nombre es requerido")
    @Size(max = 255, message = "El nombre no puede exceder 255 caracteres")
    private String nomPers;
    
    @NotBlank(message = "El apellido paterno es requerido")
    @Size(max = 255, message = "El apellido paterno no puede exceder 255 caracteres")
    private String apePaterPers;
    
    @Size(max = 255, message = "El apellido materno no puede exceder 255 caracteres")
    private String apeMaterPers;
    
    @Size(max = 6, message = "El periodo debe tener formato YYYYMM (6 dígitos)")
    @Pattern(regexp = "^\\d{6}$", message = "El periodo debe tener formato YYYYMM (ejemplo: 202504)")
    private String perPers;
    
    @NotBlank(message = "El estado es requerido")
    @Pattern(regexp = "^[AI]$", message = "El estado debe ser A (Activo) o I (Inactivo)")
    private String statPers;
    
    private LocalDate fechNaciPers;
    
    @Pattern(regexp = "^[MF]$", message = "El género debe ser M (Masculino) o F (Femenino)")
    private String genPers;
    
    @Size(max = 20, message = "El teléfono no puede exceder 20 caracteres")
    private String movilPers;
    
    @Email(message = "El email personal debe ser válido")
    @Size(max = 100, message = "El email personal no puede exceder 100 caracteres")
    private String emailPers;
    
    @Email(message = "El email corporativo debe ser válido")
    @Size(max = 100, message = "El email corporativo no puede exceder 100 caracteres")
    private String emailCorpPers;
    
    @Size(max = 20, message = "El número de colegiatura no puede exceder 20 caracteres")
    private String colegPers;
    
    @Size(max = 50, message = "El código de planilla no puede exceder 50 caracteres")
    private String codPlanRem;
    
    @Size(max = 255, message = "La dirección no puede exceder 255 caracteres")
    private String direcPers;
    
    private Long idRegLab;
    
    private Long idArea;
    
    private Long idUsuario;  // ✅ Cambiado a Long
}

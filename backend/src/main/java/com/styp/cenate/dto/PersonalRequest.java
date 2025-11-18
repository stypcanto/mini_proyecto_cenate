package com.styp.cenate.dto;

import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;

/**
 * DTO unificado para solicitudes de creación/actualización de Personal (CENATE y Externo)
 */
@Data               // Genera getters, setters, toString, equals y hashCode
@NoArgsConstructor  // Constructor vacío
@AllArgsConstructor // Constructor con todos los campos
@Builder            // Permite usar .builder()
public class PersonalRequest {

    public String getNombres() {
        return this.nombres;
    }

    public String getApellidoPaterno() {
        return this.apellidoPaterno;
    }

    public Long getIdIpress() {
        return this.idIpress;
    }

    public void setTipoPersonal(String tipoPersonal) {
        this.tipoPersonal = tipoPersonal;
    }

    // ============================================
    // TIPO DE PERSONAL
    // ============================================
    @NotBlank(message = "El tipo de personal es obligatorio")
    @Pattern(regexp = "^(CENATE|EXTERNO)$", message = "El tipo debe ser 'CENATE' o 'EXTERNO'")
    private String tipoPersonal;

    // ============================================
    // IDENTIFICACIÓN
    // ============================================
    @NotNull(message = "El tipo de documento es obligatorio")
    private Long idTipoDocumento;

    @NotBlank(message = "El número de documento es obligatorio")
    @Size(max = 20, message = "El número de documento no puede tener más de 20 caracteres")
    private String numeroDocumento;

    // ============================================
    // DATOS PERSONALES
    // ============================================
    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 255, message = "El nombre no puede tener más de 255 caracteres")
    private String nombres;

    @NotBlank(message = "El apellido paterno es obligatorio")
    @Size(max = 255, message = "El apellido paterno no puede tener más de 255 caracteres")
    private String apellidoPaterno;

    @NotBlank(message = "El apellido materno es obligatorio")
    @Size(max = 255, message = "El apellido materno no puede tener más de 255 caracteres")
    private String apellidoMaterno;

    @Past(message = "La fecha de nacimiento debe ser en el pasado")
    private LocalDate fechaNacimiento;

    @Pattern(regexp = "^[MF]$", message = "El género debe ser 'M' o 'F'")
    private String genero;

    // ============================================
    // CONTACTO
    // ============================================
    @Size(max = 20, message = "El teléfono no puede tener más de 20 caracteres")
    private String telefono;

    @Email(message = "El email personal debe ser válido")
    @Size(max = 100, message = "El email personal no puede tener más de 100 caracteres")
    private String emailPersonal;

    @Email(message = "El email corporativo debe ser válido")
    @Size(max = 100, message = "El email corporativo no puede tener más de 100 caracteres")
    private String emailCorporativo;

    // ============================================
    // INSTITUCIÓN
    // ============================================
    private Long idIpress; // Para personal EXTERNO

    // ============================================
    // INFORMACIÓN LABORAL (solo para CENATE)
    // ============================================
    @Pattern(regexp = "^[AI]$", message = "El estado debe ser 'A' (Activo) o 'I' (Inactivo)")
    private String estado;

    private Long idArea;

    private Long idRegimenLaboral;

    @Pattern(regexp = "^\\d{6}$", message = "El periodo debe tener formato YYYYMM")
    private String periodo;

    @Size(max = 50, message = "El código de planilla no puede tener más de 50 caracteres")
    private String codigoPlanilla;

    @Size(max = 20, message = "El número de colegiatura no puede tener más de 20 caracteres")
    private String numeroColegiatura;

    @Size(max = 255, message = "La dirección no puede tener más de 255 caracteres")
    private String direccion;

    // ============================================
    // RELACIÓN CON USUARIO
    // ============================================
    private Long idUsuario;
}

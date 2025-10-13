package styp.com.cenate.dto;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

/**
 * 🧑‍⚕️ DTO unificado para representar tanto personal interno (CENATE)
 * como externo. Incluye datos personales, institucionales y laborales.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PersonalResponse {

    // 🔹 IDENTIFICACIÓN
    private Long idPersonal;
    private String tipoPersonal; // INTERNO o EXTERNO
    private TipoDocumentoResponse tipoDocumento;
    private String numeroDocumento;

    // 🔹 DATOS PERSONALES
    private String nombres;
    private String apellidoPaterno;
    private String apellidoMaterno;
    private String nombreCompleto;
    private LocalDate fechaNacimiento;
    private Integer edad;
    private String genero;
    private String foto;

    // 🔹 CONTACTO
    private String telefono;
    private String emailPersonal;
    private String emailCorporativo;
    private String direccion;

    // 🔹 INFORMACIÓN LABORAL (CENATE)
    private String estado; // A o I
    private AreaResponse area;
    private RegimenLaboralResponse regimenLaboral;
    private String periodo;
    private String codigoPlanilla;
    private String numeroColegiatura;

    // 🔹 RELACIONES PROFESIONALES (N:N)
    private List<String> profesiones;   // dim_profesiones
    private List<String> tiposPersonal; // dim_tipo_personal
    private List<String> ocs;           // dim_oc
    private List<String> firmas;        // dim_firma_digital

    // 🔹 INFORMACIÓN INSTITUCIONAL (principalmente externos)
    private String institucion;

    // 🔹 DATOS DE USUARIO
    private Long idUsuario;
    private String username;
    private Set<String> roles;
    private Set<String> permisos;
    private String estadoUsuario;
    private LocalDateTime ultimoLogin;
    private Boolean cuentaBloqueada;

    // 🔹 AUDITORÍA
    private LocalDateTime createAt;
    private LocalDateTime updateAt;

    // 🧮 Utilidades
    public Integer getMesCumpleanos() {
        return fechaNacimiento != null ? fechaNacimiento.getMonthValue() : null;
    }

    public boolean isActivo() {
        if ("CENATE".equalsIgnoreCase(tipoPersonal) || "INTERNO".equalsIgnoreCase(tipoPersonal)) {
            return "A".equalsIgnoreCase(estado);
        }
        return estadoUsuario != null && "ACTIVO".equalsIgnoreCase(estadoUsuario);
    }

    public String getDisplayName() {
        return (nombreCompleto != null && !nombreCompleto.isBlank())
                ? nombreCompleto
                : (username != null ? username : "Usuario sin nombre");
    }
}
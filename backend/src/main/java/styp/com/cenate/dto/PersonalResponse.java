package styp.com.cenate.dto;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;

/**
 * DTO unificado que representa tanto personal interno (CENATE) como externo (otras instituciones).
 * Incluye información de usuario y datos personales, evitando duplicaciones.
 */
@Data               // Genera getters, setters, toString, equals y hashCode
@NoArgsConstructor  // Constructor vacío
@AllArgsConstructor // Constructor con todos los campos
@Builder            // Permite usar .builder()
public class PersonalResponse {

    // ============================================
    // IDENTIFICACIÓN
    // ============================================
    private Long idPersonal;
    private String tipoPersonal;
    private TipoDocumentoResponse tipoDocumento;
    private String numeroDocumento;

    // ============================================
    // DATOS PERSONALES
    // ============================================
    private String nombres;
    private String apellidoPaterno;
    private String apellidoMaterno;
    private String nombreCompleto;
    private LocalDate fechaNacimiento;
    private Integer edad;
    private String genero;

    // ============================================
    // CONTACTO
    // ============================================
    private String telefono;
    private String emailPersonal;
    private String emailCorporativo;

    // ============================================
    // INSTITUCIÓN
    // ============================================
    private String institucion;
    private IpressResponse ipress;

    // ============================================
    // INFORMACIÓN LABORAL (CENATE)
    // ============================================
    private String estado;
    private AreaResponse area;
    private RegimenLaboralResponse regimenLaboral;
    private String periodo;
    private String codigoPlanilla;
    private String numeroColegiatura;
    private String direccion;
    private String foto;

    // ============================================
    // DATOS DE USUARIO
    // ============================================
    private Long idUsuario;
    private String username;
    private Set<String> roles;
    private Set<String> permisos;
    private String estadoUsuario;
    private LocalDateTime ultimoLogin;
    private Boolean cuentaBloqueada;

    // ============================================
    // AUDITORÍA
    // ============================================
    private LocalDateTime createAt;
    private LocalDateTime updateAt;

    // ============================================
    // CAMPOS CALCULADOS
    // ============================================
    public Integer getMesCumpleanos() {
        return fechaNacimiento != null ? fechaNacimiento.getMonthValue() : null;
    }

    public boolean isActivo() {
        if ("CENATE".equalsIgnoreCase(tipoPersonal)) {
            return "A".equalsIgnoreCase(estado);
        }
        return estadoUsuario != null && "ACTIVO".equalsIgnoreCase(estadoUsuario);
    }
}

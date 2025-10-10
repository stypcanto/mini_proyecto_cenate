package styp.com.cenate.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;

/**
 * DTO unificado que representa tanto personal interno (CENATE) como externo (otras instituciones).
 * Incluye información de usuario y datos personales, evitando duplicaciones.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PersonalResponse {

    // ============================================
    // IDENTIFICACIÓN
    // ============================================
    private Long idPersonal;            // ID del personal (interno o externo)
    private String tipoPersonal;        // "CENATE" o "EXTERNO"
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
    private String institucion;       // Ej. "CENATE" o nombre IPRESS externa
    private IpressResponse ipress;    // Solo para externos

    // ============================================
    // INFORMACIÓN LABORAL (CENATE)
    // ============================================
    private String estado;                         // A o I
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

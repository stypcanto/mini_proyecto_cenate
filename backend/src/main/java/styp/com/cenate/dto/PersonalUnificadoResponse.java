package styp.com.cenate.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO unificado que representa tanto personal interno (CENATE) como externo (otras instituciones)
 * Este DTO permite mostrar en un solo panel todo el personal del sistema
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PersonalUnificadoResponse {
    
    // ============================================
    // IDENTIFICACIÓN Y TIPO
    // ============================================
    
    /**
     * ID del registro (puede ser de PersonalCnt o PersonalExterno)
     */
    private Long id;
    
    /**
     * Tipo de personal: "CENATE" o "EXTERNO"
     */
    private String tipoPersonal;
    
    /**
     * Tipo de documento
     */
    private TipoDocumentoResponse tipoDocumento;
    
    /**
     * Número de documento
     */
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
    
    /**
     * Nombre de la institución
     * - Para CENATE: "CENATE"
     * - Para EXTERNOS: Nombre de la IPRESS
     */
    private String institucion;
    
    /**
     * Datos completos de la IPRESS (solo para externos)
     */
    private IpressResponse ipress;
    
    // ============================================
    // INFORMACIÓN LABORAL (solo para personal CENATE)
    // ============================================
    
    /**
     * Estado (A=Activo, I=Inactivo) - solo para CENATE
     */
    private String estado;
    
    /**
     * Área de trabajo - solo para CENATE
     */
    private AreaResponse area;
    
    /**
     * Régimen laboral - solo para CENATE
     */
    private RegimenLaboralResponse regimenLaboral;
    
    /**
     * Periodo de trabajo - solo para CENATE
     */
    private String periodo;
    
    /**
     * Código de planilla - solo para CENATE
     */
    private String codigoPlanilla;
    
    /**
     * Número de colegiatura - solo para CENATE
     */
    private String numeroColegiatura;
    
    /**
     * Dirección - solo para CENATE
     */
    private String direccion;
    
    /**
     * Foto - solo para CENATE
     */
    private String foto;
    
    // ============================================
    // RELACIÓN CON USUARIO
    // ============================================
    
    private Long idUsuario;
    private UsuarioResponse usuario;
    
    // ============================================
    // AUDITORÍA
    // ============================================
    
    private LocalDateTime createAt;
    private LocalDateTime updateAt;
    
    // ============================================
    // CAMPOS CALCULADOS
    // ============================================
    
    /**
     * Mes de cumpleaños (1-12)
     */
    public Integer getMesCumpleanos() {
        return fechaNacimiento != null ? fechaNacimiento.getMonthValue() : null;
    }
    
    /**
     * Indica si el personal está activo
     */
    public boolean isActivo() {
        if ("CENATE".equals(tipoPersonal)) {
            return "A".equals(estado);
        }
        // Para externos, consideramos activos si tienen usuario activo
        return usuario != null && "ACTIVO".equals(usuario.getStatUser());
    }
}

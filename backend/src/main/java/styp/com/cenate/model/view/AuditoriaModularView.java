package styp.com.cenate.model.view;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Immutable;

import java.time.LocalDateTime;

/**
 * Entidad de solo lectura que mapea la vista vw_auditoria_modular_detallada.
 * Proporciona información detallada de auditoría específica para eventos
 * relacionados con permisos modulares (INSERT, UPDATE, DELETE).
 * 
 * Esta vista incluye información enriquecida del usuario que realizó la acción,
 * sus roles, datos personales y detalles de la operación ejecutada.
 * 
 * @author CENATE Development Team
 * @version 1.0
 */
@Entity
@Table(name = "vw_auditoria_modular_detallada")
@Immutable
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditoriaModularView {

    @Id
    @Column(name = "id")
    private Long id;

    @Column(name = "fecha_hora")
    private LocalDateTime fechaHora;

    @Column(name = "fecha_formateada")
    private String fechaFormateada;

    @Column(name = "usuario_sesion")
    private String usuarioSesion;

    @Column(name = "id_user")
    private Long idUser;

    @Column(name = "username")
    private String username;

    @Column(name = "dni")
    private String dni;

    @Column(name = "nombre_completo")
    private String nombreCompleto;

    @Column(name = "roles")
    private String roles;

    @Column(name = "correo_corporativo")
    private String correoCorporativo;

    @Column(name = "correo_personal")
    private String correoPersonal;

    @Column(name = "modulo")
    private String modulo;

    @Column(name = "accion")
    private String accion;

    @Column(name = "estado")
    private String estado;

    @Column(name = "detalle", columnDefinition = "TEXT")
    private String detalle;

    @Column(name = "ip")
    private String ip;

    @Column(name = "dispositivo", columnDefinition = "TEXT")
    private String dispositivo;

    @Column(name = "id_afectado")
    private Long idAfectado;

    @Column(name = "tipo_evento")
    private String tipoEvento;
}

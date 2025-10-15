package styp.com.cenate.model.view;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Immutable;

import java.time.LocalDateTime;

/**
 * Entidad de solo lectura que mapea la vista vw_permisos_activos.
 * Esta vista proporciona una consulta optimizada de todos los permisos activos
 * para cada usuario, rol, módulo y página del sistema.
 * 
 * Se utiliza para verificaciones rápidas de autorización sin necesidad de
 * realizar múltiples joins en tiempo de ejecución.
 * 
 * @author CENATE Development Team
 * @version 1.0
 */
@Entity
@Table(name = "vw_permisos_activos")
@Immutable
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PermisoActivoView {

    @Id
    @Column(name = "id_user")
    private Long idUser;

    @Column(name = "usuario")
    private String usuario;

    @Column(name = "id_rol")
    private Integer idRol;

    @Column(name = "rol")
    private String rol;

    @Column(name = "id_modulo")
    private Integer idModulo;

    @Column(name = "modulo")
    private String modulo;

    @Column(name = "id_pagina")
    private Integer idPagina;

    @Column(name = "pagina")
    private String pagina;

    @Column(name = "ruta_pagina")
    private String rutaPagina;

    @Column(name = "puede_ver")
    private Boolean puedeVer;

    @Column(name = "puede_crear")
    private Boolean puedeCrear;

    @Column(name = "puede_editar")
    private Boolean puedeEditar;

    @Column(name = "puede_eliminar")
    private Boolean puedeEliminar;

    @Column(name = "puede_exportar")
    private Boolean puedeExportar;

    @Column(name = "puede_aprobar")
    private Boolean puedeAprobar;

    @Column(name = "autorizado_por")
    private Integer autorizadoPor;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

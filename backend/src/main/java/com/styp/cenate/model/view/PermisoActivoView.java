package com.styp.cenate.model.view;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Immutable;

import java.time.LocalDateTime;

@Entity
@Table(name = "vw_permisos_usuario_activos")
@Immutable
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PermisoActivoView {

    @Id
    @Column(name = "id_permiso")
    private Long idPermiso;

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

    @Column(name = "activo")
    private Boolean activo;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
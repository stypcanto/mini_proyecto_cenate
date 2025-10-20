package com.styp.cenate.model.view;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Immutable;
import java.time.LocalDateTime;

/**
 * Entidad de solo lectura que mapea la vista SQL {@code vw_permisos_activos}.
 *
 * Contiene los permisos activos que tiene cada usuario combinando roles, módulos y páginas del sistema.
 * Se usa para verificar autorizaciones MBAC sin realizar múltiples JOINs en tiempo real.
 */
@Entity
@Table(name = "vw_permisos_activos")
@Immutable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PermisoActivoView {

    // ✅ Identificador único generado por la vista
    @Id
    @Column(name = "id_permiso")
    private Long idPermiso;

    // 🔹 Usuario
    @Column(name = "id_user")
    private Long userId;

    @Column(name = "usuario")
    private String usuario;

    // 🔹 Rol
    @Column(name = "id_rol")
    private Integer idRol;

    @Column(name = "rol")
    private String rol;

    // 🔹 Módulo
    @Column(name = "id_modulo")
    private Integer idModulo;

    @Column(name = "modulo")
    private String modulo;

    // 🔹 Página
    @Column(name = "id_pagina")
    private Integer idPagina;

    @Column(name = "pagina")
    private String pagina;

    @Column(name = "ruta_pagina")
    private String rutaPagina;

    // 🔹 Permisos
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

    // 🔹 Auditoría
    @Column(name = "autorizado_por")
    private Integer autorizadoPor;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
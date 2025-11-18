// ========================================================================
// 🧩 PermisoActivoView.java
// ------------------------------------------------------------------------
// Mapea la vista SQL "vw_permisos_usuario_activos" del esquema público.
// Solo lectura (@Immutable) → lista permisos activos por usuario.
// Compatible con Hibernate y Lombok (Spring Boot 3.x / Java 17).
// ========================================================================

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

    // 🆔 Identificador del permiso
    @Id
    @Column(name = "id_permiso")
    private Integer idPermiso;

    // 👤 Usuario
    @Column(name = "id_user")
    private Long idUser;

    @Column(name = "usuario", length = 50)
    private String usuario;

    // 🧱 Rol asociado
    @Column(name = "id_rol")
    private Integer idRol;

    @Column(name = "rol", length = 50)
    private String rol;

    // 🧩 Módulo del sistema
    @Column(name = "id_modulo")
    private Integer idModulo;

    @Column(name = "modulo", length = 100)
    private String modulo;

    // 📄 Página o funcionalidad
    @Column(name = "id_pagina")
    private Integer idPagina;

    @Column(name = "pagina", length = 100)
    private String pagina;

    @Column(name = "ruta_pagina", length = 200)
    private String rutaPagina;

    // 🔒 Permisos MBAC
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

    // 🕒 Auditoría
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
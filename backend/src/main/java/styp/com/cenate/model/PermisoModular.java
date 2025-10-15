package styp.com.cenate.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Entidad que representa los permisos modulares por rol y página.
 * Define qué acciones CRUD puede realizar cada rol en cada página del sistema.
 * 
 * Permisos soportados:
 * - puede_ver: Visualizar información
 * - puede_crear: Crear nuevos registros
 * - puede_editar: Modificar registros existentes
 * - puede_eliminar: Eliminar registros
 * - puede_exportar: Exportar información
 * - puede_aprobar: Aprobar o validar procesos
 * 
 * @author CENATE Development Team
 * @version 1.0
 */
@Entity
@Table(name = "dim_permisos_modulares", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"id_rol", "id_pagina"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PermisoModular {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_permiso_mod")
    private Integer idPermisoMod;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_rol", nullable = false)
    private Rol rol;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_pagina", nullable = false)
    private PaginaModulo pagina;

    @Column(name = "puede_ver")
    @Builder.Default
    private Boolean puedeVer = false;

    @Column(name = "puede_crear")
    @Builder.Default
    private Boolean puedeCrear = false;

    @Column(name = "puede_editar")
    @Builder.Default
    private Boolean puedeEditar = false;

    @Column(name = "puede_eliminar")
    @Builder.Default
    private Boolean puedeEliminar = false;

    @Column(name = "puede_exportar")
    @Builder.Default
    private Boolean puedeExportar = false;

    @Column(name = "puede_aprobar")
    @Builder.Default
    private Boolean puedeAprobar = false;

    @Column(name = "autorizado_por")
    private Integer autorizadoPor;

    @Column(name = "activo")
    @Builder.Default
    private Boolean activo = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

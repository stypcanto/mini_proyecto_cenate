package styp.com.cenate.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalDateTime;

/**
 * 🎯 Representa un permiso asociado a un rol (ej: GESTIONAR_USUARIOS, VER_REPORTES, etc.)
 */
@Entity
@Table(name = "dim_permisos", schema = "public")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "rol")
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Permiso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_permiso")
    @EqualsAndHashCode.Include
    private Long idPermiso;

    @Column(name = "desc_permiso", nullable = false, length = 100)
    private String descPermiso;

    // 🔗 Relación con Rol
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_rol", nullable = false)
    @JsonIgnore
    private Rol rol;

    // 🔸 Permisos base
    @Builder.Default
    @Column(name = "puede_ver", nullable = false)
    private boolean puedeVer = false;

    @Builder.Default
    @Column(name = "puede_crear", nullable = false)
    private boolean puedeCrear = false;

    @Builder.Default
    @Column(name = "puede_actualizar", nullable = false)
    private boolean puedeActualizar = false;

    @Builder.Default
    @Column(name = "puede_eliminar", nullable = false)
    private boolean puedeEliminar = false;

    // 🔸 Permisos extendidos (🆕 agregar estos)
    @Builder.Default
    @Column(name = "puede_editar", nullable = false)
    private boolean puedeEditar = false;

    @Builder.Default
    @Column(name = "puede_exportar", nullable = false)
    private boolean puedeExportar = false;

    @Builder.Default
    @Column(name = "puede_aprobar", nullable = false)
    private boolean puedeAprobar = false;

    // 🔸 Auditoría
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
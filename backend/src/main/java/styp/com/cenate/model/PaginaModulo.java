package styp.com.cenate.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Entidad que representa las páginas de un módulo en el sistema CENATE.
 * Cada página pertenece a un módulo y tiene permisos asociados.
 * 
 * @author CENATE Development Team
 * @version 1.0
 */
@Entity
@Table(name = "dim_paginas_modulo")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaginaModulo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_pagina")
    private Integer idPagina;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_modulo", nullable = false)
    private ModuloSistema modulo;

    @Column(name = "nombre_pagina", nullable = false, length = 255)
    private String nombrePagina;

    @Column(name = "ruta_pagina", nullable = false, length = 255)
    private String rutaPagina;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "activo")
    @Builder.Default
    private Boolean activo = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Relaciones
    @OneToMany(mappedBy = "pagina", cascade = CascadeType.ALL)
    private List<PermisoModular> permisos;

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

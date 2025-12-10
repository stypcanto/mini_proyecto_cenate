package com.styp.cenate.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.OffsetDateTime;

/**
 * 🏥 Entidad que representa una Red Asistencial de salud.
 * Tabla: dim_red
 */
@Entity
@Table(name = "dim_red")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Red {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_red")
    private Long id;

    @Column(name = "cod_red")
    private String codigo;

    @Column(name = "desc_red", nullable = false)
    private String descripcion;

    /**
     * Macroregión a la que pertenece esta Red
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "id_macro", nullable = false)
    private Macroregion macroregion;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime creado;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime actualizado;
}

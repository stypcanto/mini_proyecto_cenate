package com.styp.cenate.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;

/**
 * Entidad que representa los tipos de IPRESS (Instituciones Prestadoras de Servicios de Salud)
 * Ejemplo: HOSPITAL, CLÍNICA, CENTRO DE SALUD, POSTA, etc.
 */
@Entity
@Table(name = "tipo_ipress")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TipoIpress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tip_ipress")
    private Long id;

    @Column(name = "desc_tip_ipress", nullable = false, unique = true)
    private String descripcion;

    @Column(name = "stat_tip_ipress", nullable = false)
    private String estado; // Ejemplo: 'A' (Activo), 'I' (Inactivo)

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime creado;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime actualizado;
}
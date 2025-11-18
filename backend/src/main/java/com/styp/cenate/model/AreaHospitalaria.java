package com.styp.cenate.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "dim_area_hosp")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class AreaHospitalaria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_area_hosp")
    private Long id;

    @Column(name = "cod_area_hosp", nullable = false)
    private String codigo;

    @Column(name = "desc_area_hosp", nullable = false)
    private String descripcion;

    @Column(name = "abr_area_hosp")
    private String abreviatura;

    @Column(name = "stat_area_hosp", nullable = false)
    private String estado;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime creado;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime actualizado;
}
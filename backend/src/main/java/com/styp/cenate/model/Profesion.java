package com.styp.cenate.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "dim_profesiones")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Profesion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_prof")
    private Long idProf;

    @Column(name = "desc_prof", nullable = false, length = 150)
    private String descProf;

    @Builder.Default
    @Column(name = "stat_prof", nullable = false, length = 1)
    private String statProf = "A"; // A = Activo, I = Inactivo

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // 🔗 Especialidades asociadas
    @Builder.Default
    @OneToMany(mappedBy = "profesion", cascade = CascadeType.ALL, orphanRemoval = false)
    private Set<Especialidad> especialidades = new HashSet<>();

    public boolean isActivo() {
        return "A".equalsIgnoreCase(statProf);
    }
}
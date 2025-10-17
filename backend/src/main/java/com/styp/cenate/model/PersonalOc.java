package com.styp.cenate.model;

import jakarta.persistence.*;
import lombok.*;
import com.styp.cenate.model.id.PersonalOcId;
import java.io.Serializable;
import java.time.LocalDate;

/**
 * 📑 Entidad que representa las órdenes de compra vinculadas al personal.
 */
@Entity
@Table(name = "dim_personal_oc")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PersonalOc implements Serializable {

    @EmbeddedId
    private PersonalOcId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("idPersonal")
    @JoinColumn(name = "id_pers", referencedColumnName = "id_pers", nullable = false)
    private PersonalCnt personal;

    @Column(name = "num_oc", length = 50)
    private String numOc; // ✅ número de orden de compra

    @Column(name = "desc_oc", length = 255)
    private String descOc; // descripción breve de la OC

    @Column(name = "fecha_oc")
    private LocalDate fechaOc;

    @Column(name = "estado", length = 1)
    private String estado; // A/I

    @Column(name = "created_at")
    private java.time.LocalDateTime createdAt;

    @Column(name = "updated_at")
    private java.time.LocalDateTime updatedAt;

    // 🔹 Método auxiliar
    public String getNumOc() {
        return numOc != null ? numOc : descOc;
    }
}
package com.styp.cenate.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.OffsetDateTime;

@Entity
@Table(name = "frm_transf_img")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FrmTransfImg {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_frm_transf_img")
    private Long id;

    // 🔹 Red (ya la tienes como entidad aparte)
    @Column(name = "id_red", nullable = false)
    private Long idRed;

    @Column(name = "desc_red", nullable = false)
    private String descRed;

    // 🔹 Relación con IPRESS (ya existe la entidad Ipress)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_ipress", nullable = false)
    private Ipress ipress;

    @Column(name = "desc_ipress", nullable = false)
    private String descIpress;

    @Column(name = "id_nivel", nullable = false)
    private Long idNivel;

    @Column(name = "desc_niv_ipress", nullable = false)
    private String descNivelIpress;

    @Column(name = "id_area_hosp", nullable = false)
    private Long idAreaHosp;

    @Column(name = "desc_area_hosp", nullable = false)
    private String descAreaHosp;

    @Column(name = "id_tip_proced", nullable = false)
    private Long idTipProced;

    @Column(name = "desc_tip_proced", nullable = false)
    private String descTipProced;

    @Column(name = "id_proced", nullable = false)
    private Long idProced;

    @Column(name = "cod_proced", nullable = false)
    private String codProced;

    @Column(name = "desc_proced", nullable = false)
    private String descProced;

    @Column(name = "stat_frm_transf_img", nullable = false)
    private String estado;

    @Column(name = "cod_refe_transf_img")
    private String codRefe;

    @Column(name = "desc_refe_transf_img")
    private String descRefe;

    @Column(name = "req_refe", nullable = false)
    private boolean requiereReferencia;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime creado;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime actualizado;
}
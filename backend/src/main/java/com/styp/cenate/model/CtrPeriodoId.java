package com.styp.cenate.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * Clave compuesta para la entidad CtrPeriodo.
 * PK: (periodo, id_area)
 */
@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CtrPeriodoId implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * Código de periodo (formato YYYYMM, ej: "202602").
     */
    @Column(name = "periodo", nullable = false, length = 6)
    private String periodo;

    /**
     * ID del área asociada.
     */
    @Column(name = "id_area", nullable = false)
    private Long idArea;
}

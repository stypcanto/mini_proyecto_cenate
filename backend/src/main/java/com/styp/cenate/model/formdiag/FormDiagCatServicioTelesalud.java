package com.styp.cenate.model.formdiag;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Catálogo de servicios de telesalud
 * Tabla: form_diag_cat_servicio_telesalud
 */
@Entity
@Table(name = "form_diag_cat_servicio_telesalud")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FormDiagCatServicioTelesalud {

    @Id
    @Column(name = "id_servicio")
    private Integer idServicio;

    @Column(name = "codigo", length = 20)
    private String codigo;

    @Column(name = "descripcion", length = 200)
    private String descripcion;
}

package com.styp.cenate.model.view;

import jakarta.persistence.*;
import lombok.*;

/**
 * 🧭 Vista de páginas MBAC (basada en dim_pagina)
 * Relaciona cada página con su módulo real por ID.
 */
@Entity
@Table(name = "dim_pagina")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaginaView {

    @Id
    @Column(name = "id_pagina")
    private Long idPagina;

    @Column(name = "nombre_pagina")
    private String nombrePagina;

    @Column(name = "ruta_pagina")
    private String rutaPagina;

    @Column(name = "id_modulo")
    private Long idModulo;

    private Boolean activo;
}
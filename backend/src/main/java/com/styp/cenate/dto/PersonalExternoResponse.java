package com.styp.cenate.dto;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 🧾 DTO de respuesta para el personal externo (instituciones aliadas o externas).
 * Representa los datos que se devuelven al frontend tras operaciones CRUD.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PersonalExternoResponse {

    private Long idPersExt;

    // 🔗 Tipo de documento (objeto anidado)
    private TipoDocumentoResponse tipoDocumento;

    private String numDocExt;
    private String nomExt;
    private String apePaterExt;
    private String apeMaterExt;

    // 🧠 Datos derivados
    private String nombreCompleto;
    private LocalDate fechNaciExt;
    private Integer edad;

    private String genExt;

    // 🔗 IPRESS a la que pertenece
    private IpressResponse ipress;
    private String nombreInstitucion;

    private String movilExt;
    private String emailPersExt;
    private Long idUser;

    private LocalDateTime createAt;
    private LocalDateTime updateAt;
}
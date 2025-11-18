package com.styp.cenate.dto;

import java.time.OffsetDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DimServicioEssiDTO{

        /** Identificador único del servicio. */
        private Long idServicio;

        /** Código del servicio (varchar(10)). */
        private String codServicio;

        /** Descripción del servicio (text). */
        private String descServicio;

        /** Indica si pertenece a CENATE (true/false). */
        private Boolean esCenate;

        /** Estado del servicio: 'A' (activo) o 'I' (inactivo). */
        private String estado;

        /** Fecha y hora de creación (con zona horaria). */
        private OffsetDateTime createdAt;

        /** Fecha y hora de última actualización (con zona horaria). */
        private OffsetDateTime updatedAt;
        
        private Boolean esAperturaNuevos;
}

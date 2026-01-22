package com.styp.cenate.dto.bolsas;

import lombok.*;

import java.time.OffsetDateTime;
import java.util.Set;

/**
 * 📊 DTO para Bolsa de Pacientes
 * v1.0.0 - Data Transfer Object completo
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class BolsaDTO {

    private Long idBolsa;

    private String nombreBolsa;

    private String descripcion;

    private Long especialidadId;

    private String especialidadNombre;

    private Long responsableId;

    private String responsableNombre;

    private Integer totalPacientes;

    private Integer pacientesAsignados;

    private Double porcentajeAsignacion;

    private String estado;

    private OffsetDateTime fechaCreacion;

    private OffsetDateTime fechaActualizacion;

    private Boolean activo;

    private Set<Long> pacientes;

    private Integer cantidadSolicitudes;

    private Integer solicitudesPendientes;
}

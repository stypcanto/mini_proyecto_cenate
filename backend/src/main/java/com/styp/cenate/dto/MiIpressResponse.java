package com.styp.cenate.dto;

import lombok.*;

/**
 * DTO de respuesta con los datos de IPRESS del usuario actual.
 * Se usa para mostrar los datos auto-detectados en el formulario.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MiIpressResponse {

    // Datos del usuario
    private Long idPers;
    private String dniUsuario;
    private String nombreCompleto;
    private String emailContacto;
    private String telefonoContacto;

    // Datos de IPRESS
    private Long idIpress;
    private String codIpress;
    private String nombreIpress;

    // Datos de Red
    private Long idRed;
    private String nombreRed;

    // Indicador de completitud
    private boolean datosCompletos;
    private String mensajeValidacion;
}

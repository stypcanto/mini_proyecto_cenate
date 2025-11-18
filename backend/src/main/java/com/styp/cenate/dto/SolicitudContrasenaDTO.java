package com.styp.cenate.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SolicitudContrasenaDTO {

    private Long id;

    private Long idUsuario; 

    private String contrasenaHash;

    private LocalDateTime fechaEmision;

    private LocalDateTime fechaRegistro;

    private String estado;

    private int intentosEnvio;

    private String ultimoError;

    private String ipSolicitante;

    private String idempotencia;
    
    private String correoDestino;
}
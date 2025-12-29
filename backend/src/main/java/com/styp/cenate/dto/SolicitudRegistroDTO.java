package com.styp.cenate.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SolicitudRegistroDTO {
    private Long idSolicitud;
    private String tipoDocumento;
    private String numeroDocumento;
    private String nombres;
    private String apellidoPaterno;
    private String apellidoMaterno;
    private String genero;
    private LocalDate fechaNacimiento;
    private String correoPersonal;
    private String correoInstitucional;
    private String emailPreferido;
    private String telefono;
    private String tipoPersonal;
    private Long idIpress;
    private String nombreIpress;
    private String codigoIpress;
    private String estado;
    private String motivoRechazo;
    private Long revisadoPor;
    private LocalDateTime fechaRevision;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

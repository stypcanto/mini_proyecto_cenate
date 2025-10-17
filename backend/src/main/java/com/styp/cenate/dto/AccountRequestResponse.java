package com.styp.cenate.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * DTO para devolver los datos de una solicitud de creación de cuenta.
 * Usado en las respuestas del controlador AccountRequestController.
 */
@Data
@Builder
public class AccountRequestResponse {

    private Long id;
    private String nombreCompleto;      // 👈 este campo es el que usa el builder en el service
    private String tipoUsuario;
    private String numDocumento;
    private String motivo;
    private String estado;
    private String observacionAdmin;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaRespuesta;
}
package com.styp.cenate.dto.mbac;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO de respuesta para la auditoría modular.
 * Este DTO es utilizado por el endpoint GET /api/auditoria/modulos
 * 
 * @author CENATE Development Team
 * @version 1.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditoriaModularResponseDTO {
    
    @JsonProperty("id")
    private Long id;
    
    @JsonProperty("fechaHora")
    private LocalDateTime fechaHora;
    
    @JsonProperty("fechaFormateada")
    private String fechaFormateada;
    
    @JsonProperty("usuario")
    private String usuario;
    
    @JsonProperty("dni")
    private String dni;
    
    @JsonProperty("nombreCompleto")
    private String nombreCompleto;
    
    @JsonProperty("roles")
    private String roles;
    
    @JsonProperty("modulo")
    private String modulo;
    
    @JsonProperty("accion")
    private String accion;
    
    @JsonProperty("tipoEvento")
    private String tipoEvento;
    
    @JsonProperty("estado")
    private String estado;
    
    @JsonProperty("detalle")
    private String detalle;
    
    @JsonProperty("ip")
    private String ip;
    
    @JsonProperty("dispositivo")
    private String dispositivo;
}

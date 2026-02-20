package com.styp.cenate.dto.mesaayuda;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO admin para motivos de Mesa de Ayuda
 * Incluye todos los campos para gestión CRUD en panel admin
 *
 * @author Styp Canto Rondón
 * @version v1.65.0 (2026-02-19)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MotivoMesaAyudaAdminDTO {

    private Long id;
    private String codigo;
    private String descripcion;
    private Boolean activo;
    private Integer orden;
    private String prioridad;
    private LocalDateTime fechaCreacion;

}

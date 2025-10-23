package com.styp.cenate.dto.mbac;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO que representa un módulo del sistema accesible por un usuario.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModuloSistemaResponse {
    private Integer idModulo;       // ID del módulo
    private String nombreModulo;    // Nombre del módulo (ej: Gestión de Usuarios)
    private String descripcion;     // Descripción opcional
    private String icono;           // Ícono opcional
    private boolean activo;         // Indica si el módulo está activo
}
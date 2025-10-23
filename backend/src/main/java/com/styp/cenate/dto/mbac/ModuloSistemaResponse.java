package com.styp.cenate.dto.mbac;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

/**
 * DTO que representa un módulo del sistema junto con sus páginas activas.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModuloSistemaResponse {

    private Integer idModulo;         // ID del módulo
    private String nombreModulo;      // Nombre del módulo (ej: Gestión de Usuarios)
    private String descripcion;       // Descripción opcional
    private String icono;             // Ícono opcional
    private boolean activo;           // Indica si el módulo está activo

    // 🔹 Páginas asociadas al módulo
    private List<PaginaModuloResponse> paginas;
}
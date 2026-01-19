package com.styp.cenate.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 📋 DTO para representar un módulo disponible en el frontend
 * Contiene toda la información necesaria para renderizar una opción
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ModuloDisponibleDTO {

    /**
     * ID único del módulo en esta configuración
     */
    private Long id;

    /**
     * Código del módulo (TELEECG, FORMULARIO_DIAGNOSTICO, etc)
     */
    private String moduloCodigo;

    /**
     * Nombre mostrado en el frontend
     */
    private String moduloNombre;

    /**
     * Descripción de qué hace el módulo
     */
    private String descripcion;

    /**
     * Nombre del ícono Lucide React
     */
    private String icono;

    /**
     * Color de la tarjeta (indigo, blue, purple, rose, red, etc)
     */
    private String color;

    /**
     * Orden de aparición (1, 2, 3, 4...)
     */
    private Integer orden;

    /**
     * ✅ Si está habilitado para esta IPRESS
     */
    private Boolean habilitado;

    /**
     * Ruta del módulo (mapeada según el código)
     */
    private String ruta;

    /**
     * Getter que mapea el código del módulo a su ruta correspondiente
     */
    public String getRuta() {
        return switch (moduloCodigo) {
            case "FORMULARIO_DIAGNOSTICO" -> "/roles/externo/formulario-diagnostico";
            case "SOLICITUD_TURNOS" -> "/roles/externo/solicitud-turnos";
            case "MODALIDAD_ATENCION" -> "/roles/externo/gestion-modalidad";
            case "TELEECG" -> "/roles/externo/teleecgs";
            default -> "/roles/externo";
        };
    }
}

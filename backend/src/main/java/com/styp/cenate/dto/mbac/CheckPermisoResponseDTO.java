package com.styp.cenate.dto.mbac;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * ✅ DTO de respuesta para la verificación de permisos MBAC.
 * Devuelto por /api/mbac/permisos/verificar
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckPermisoResponseDTO {

    /** ID del usuario evaluado */
    private Long idUser;

    /** Ruta o endpoint verificado */
    private String rutaPagina;

    /** Acción verificada (ej. ver, crear, editar, eliminar) */
    private String accion;

    /** Resultado final del permiso */
    private Boolean permitido;  // 👈 Usa tipo Boolean para generar correctamente getPermitido()
}
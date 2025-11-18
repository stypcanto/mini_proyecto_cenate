// ========================================================================
// 🧩 PermisoUsuarioRequestDTO.java – Solicitud para CRUD MBAC
// ------------------------------------------------------------------------
// Utilizado en la creación o actualización de permisos de usuario.
// Enviado desde el frontend React (panel MBAC administrativo).
// ========================================================================

package com.styp.cenate.dto.mbac;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

/**
 * DTO para recibir datos de creación o actualización de permisos MBAC.
 * Permite al frontend definir las acciones habilitadas (ver, crear, editar, etc.)
 * para un usuario, rol o módulo específico.
 *
 * Compatible con la entidad permisos_modulares en PostgreSQL.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PermisoUsuarioRequestDTO {

    // ===========================================================
    // 🧱 IDENTIFICADORES DE RELACIÓN
    // ===========================================================

    @NotNull(message = "El ID del usuario es obligatorio.")
    private Long idUser;

    @NotNull(message = "El ID del rol es obligatorio.")
    private Integer idRol;

    @NotNull(message = "El ID del módulo es obligatorio.")
    private Integer idModulo;

    @NotNull(message = "El ID de la página es obligatorio.")
    private Integer idPagina;

    // ===========================================================
    // 🔗 INFORMACIÓN DE RUTA Y ACCIÓN
    // ===========================================================

    @NotBlank(message = "La ruta de la página es obligatoria.")
    private String rutaPagina;

    @NotBlank(message = "La acción es obligatoria (ver, crear, editar, etc.).")
    private String accion;

    // ===========================================================
    // 🔒 BANDERAS DE PERMISOS (por defecto: false)
    // ===========================================================

    @Builder.Default
    private Boolean ver = false;

    @Builder.Default
    private Boolean crear = false;

    @Builder.Default
    private Boolean editar = false;

    @Builder.Default
    private Boolean eliminar = false;

    @Builder.Default
    private Boolean exportar = false;

    @Builder.Default
    private Boolean aprobar = false;
}
// ========================================================================
// 🧩 PermisoUsuarioRequestDTO.java – Solicitud para CRUD MBAC
// ------------------------------------------------------------------------
// Utilizado en la creación o actualización de permisos de usuario.
// Enviado desde el frontend React (panel MBAC administrativo).
// ========================================================================

package com.styp.cenate.dto.mbac;

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

    private Long idUser;

    private Integer idRol;  // Opcional, se asigna automáticamente si no se proporciona

    private Integer idModulo;

    private Integer idPagina;

    // ===========================================================
    // 🔗 INFORMACIÓN DE RUTA Y ACCIÓN
    // ===========================================================

    private String rutaPagina;

    private String accion;  // Por defecto "all" si no se especifica

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
package com.styp.cenate.dto;

import lombok.Data;

/**
 * 📋 DTO utilizado para que un usuario solicite la creación de una cuenta.
 *
 * Este objeto representa los datos enviados desde el frontend
 * cuando alguien solicita acceso al sistema.
 *
 * Coincide con los campos principales de la entidad AccountRequest.
 *
 * Ejemplo JSON esperado:
 * {
 *   "nombreCompleto": "Juan Pérez",
 *   "tipoUsuario": "INTERNO",
 *   "numDocumento": "12345678",
 *   "motivo": "Acceso al sistema de gestión de pacientes"
 * }
 *
 * @author Styp
 * @since 2025
 */
@Data
public class AccountRequestCreateRequest {

    /** 🧍 Nombre completo del solicitante */
    private String nombreCompleto;

    /** 🏢 Tipo de usuario: puede ser INTERNO o EXTERNO */
    private String tipoUsuario;

    /** 🪪 Número de documento del solicitante (servirá como username) */
    private String numDocumento;

    /** 💬 Motivo o justificación de la solicitud */
    private String motivo;
}
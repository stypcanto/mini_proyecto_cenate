package com.styp.cenate.service.teleekgs;

import com.styp.cenate.dto.teleekgs.TeleECGImagenDTO;
import com.styp.cenate.model.Rol;
import com.styp.cenate.model.TeleECGImagen;
import com.styp.cenate.model.Usuario;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

/**
 * Transformador de Estados TeleECG v3.0.0
 *
 * Encargado de transformar los estados internos de la BD (ENVIADA/OBSERVADA/ATENDIDA)
 * a estados visibles según el rol del usuario:
 *
 * Para Usuario EXTERNO (PADOMI/IPRESS):
 *   BD: ENVIADA     → UI: ENVIADA ✈️
 *   BD: OBSERVADA   → UI: RECHAZADA ❌ (+ observaciones)
 *   BD: ATENDIDA    → UI: ATENDIDA ✅
 *
 * Para Personal CENATE:
 *   BD: ENVIADA     → UI: PENDIENTE ⏳
 *   BD: OBSERVADA   → UI: OBSERVADA 👁️
 *   BD: ATENDIDA    → UI: ATENDIDA ✅
 *
 * @author Claude Code
 * @version 3.0.0
 * @since 2026-01-20
 */
@Component
@Slf4j
public class TeleECGEstadoTransformer {

    /**
     * Roles que se consideran EXTERNOS (PADOMI, IPRESS)
     */
    private static final List<String> ROLES_EXTERNOS = Arrays.asList(
        "INSTITUCION_EX",  // External Institution
        "EXTERNO"          // Generic External
    );

    /**
     * Transforma el estado de una imagen según el rol del usuario
     *
     * @param imagen Imagen ECG con estado en BD
     * @param usuario Usuario que accede (null si no autenticado)
     * @return Estado transformado para presentación en UI
     */
    public String transformarEstado(TeleECGImagen imagen, Usuario usuario) {
        if (imagen == null || imagen.getEstado() == null) {
            return "DESCONOCIDO";
        }

        boolean esUsuarioExterno = usuario != null && esExterno(usuario);

        return transformarEstado(imagen.getEstado(), esUsuarioExterno);
    }

    /**
     * Transforma el estado de un DTO según el rol del usuario
     *
     * @param dto DTO con estado en BD
     * @param usuario Usuario que accede (null si no autenticado)
     * @return Estado transformado para presentación en UI
     */
    public String transformarEstado(TeleECGImagenDTO dto, Usuario usuario) {
        if (dto == null || dto.getEstado() == null) {
            return "DESCONOCIDO";
        }

        boolean esUsuarioExterno = usuario != null && esExterno(usuario);

        return transformarEstado(dto.getEstado(), esUsuarioExterno);
    }

    /**
     * Transforma un estado de BD dado un rol
     *
     * @param estadoBD Estado desde la base de datos (ENVIADA, OBSERVADA, ATENDIDA)
     * @param esUsuarioExterno TRUE si el usuario es externo, FALSE si es CENATE
     * @return Estado transformado para presentación
     */
    public String transformarEstado(String estadoBD, boolean esUsuarioExterno) {
        if (estadoBD == null) {
            return "DESCONOCIDO";
        }

        if (esUsuarioExterno) {
            // Usuario EXTERNO (PADOMI) ve estados simplificados
            return transformarParaExterno(estadoBD);
        } else {
            // Personal CENATE ve estados de proceso
            return transformarParaCENATE(estadoBD);
        }
    }

    /**
     * Transforma estado para usuario EXTERNO (PADOMI/IPRESS)
     *
     * ENVIADA     → ENVIADA (en espera)
     * OBSERVADA   → RECHAZADA (con problemas)
     * ATENDIDA    → ATENDIDA (completada)
     */
    private String transformarParaExterno(String estadoBD) {
        return switch (estadoBD) {
            case "ENVIADA" -> "ENVIADA";           // ✈️ En tránsito
            case "OBSERVADA" -> "RECHAZADA";       // ❌ Rechazada temporalmente
            case "ATENDIDA" -> "ATENDIDA";         // ✅ Completada
            default -> estadoBD;
        };
    }

    /**
     * Transforma estado para personal CENATE
     *
     * ENVIADA     → PENDIENTE (recibida, esperando revisión)
     * OBSERVADA   → OBSERVADA (revisada, tiene observaciones)
     * ATENDIDA    → ATENDIDA (completada)
     */
    private String transformarParaCENATE(String estadoBD) {
        return switch (estadoBD) {
            case "ENVIADA" -> "PENDIENTE";         // ⏳ En bandeja
            case "OBSERVADA" -> "OBSERVADA";       // 👁️ Revisada
            case "ATENDIDA" -> "ATENDIDA";         // ✅ Completada
            default -> estadoBD;
        };
    }

    /**
     * Determina si un usuario es externo
     *
     * @param usuario Usuario a verificar
     * @return TRUE si tiene rol INSTITUCION_EX o EXTERNO, FALSE si es CENATE
     */
    public boolean esExterno(Usuario usuario) {
        if (usuario == null || usuario.getRoles() == null || usuario.getRoles().isEmpty()) {
            return false;
        }

        // Buscar si alguno de los roles del usuario es INSTITUCION_EX o EXTERNO
        for (Rol rol : usuario.getRoles()) {
            if (rol != null) {
                // Buscar por ID (INSTITUCION_EX = 18, EXTERNO = 15)
                if (rol.getIdRol() != null && (rol.getIdRol() == 18 || rol.getIdRol() == 15)) {
                    return true;
                }

                // Buscar por nombre
                if (rol.getNombreRol() != null && ROLES_EXTERNOS.contains(rol.getNombreRol())) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Obtiene el símbolo de estado para mostrar en UI
     *
     * @param estadoTransformado Estado ya transformado según rol
     * @return Emoji/símbolo representativo
     */
    public String obtenerSimboloEstado(String estadoTransformado) {
        return switch (estadoTransformado) {
            case "ENVIADA" -> "✈️";     // En tránsito
            case "RECHAZADA" -> "❌";   // Rechazada
            case "ATENDIDA" -> "✅";    // Completada
            case "PENDIENTE" -> "⏳";   // Esperando
            case "OBSERVADA" -> "👁️";  // Revisada
            default -> "❓";
        };
    }

    /**
     * Obtiene color de estado para frontend
     *
     * @param estadoTransformado Estado ya transformado según rol
     * @return Color en Tailwind (bg-yellow-100, bg-red-100, etc)
     */
    public String obtenerColorEstado(String estadoTransformado) {
        return switch (estadoTransformado) {
            case "ENVIADA", "PENDIENTE" -> "bg-yellow-100 text-yellow-700";  // Amarillo
            case "RECHAZADA" -> "bg-red-100 text-red-700";                   // Rojo
            case "OBSERVADA" -> "bg-blue-100 text-blue-700";                 // Azul
            case "ATENDIDA" -> "bg-green-100 text-green-700";                // Verde
            default -> "bg-gray-100 text-gray-700";
        };
    }

    /**
     * Obtiene descripción legible del estado
     *
     * @param estadoTransformado Estado ya transformado según rol
     * @return Descripción en español
     */
    public String obtenerDescripcionEstado(String estadoTransformado) {
        return switch (estadoTransformado) {
            case "ENVIADA" -> "Enviado - En espera de revisión";
            case "PENDIENTE" -> "Pendiente - En bandeja de trabajo";
            case "OBSERVADA" -> "Observada - Tiene observaciones";
            case "RECHAZADA" -> "Rechazada - Ver observaciones";
            case "ATENDIDA" -> "Atendida - Completada";
            default -> "Estado desconocido";
        };
    }
}

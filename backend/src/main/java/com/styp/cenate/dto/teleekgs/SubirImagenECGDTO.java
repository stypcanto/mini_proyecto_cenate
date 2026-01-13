package com.styp.cenate.dto.teleekgs;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

/**
 * DTO para la solicitud de carga de electrocardiogramas
 *
 * Utilizado por:
 * - IPRESS Externas: para enviar ECGs de sus pacientes
 * - Personal CENATE: para cargar ECGs manualmente en testing
 *
 * Validaciones:
 * - DNI: 8 dígitos (formato peruano)
 * - Archivo: JPEG o PNG, máximo 5MB
 * - Nombres/Apellidos: opcionales (pueden venir de la IPRESS)
 *
 * Seguridad:
 * - Sin validación de archivo en cliente (se valida en servidor)
 * - File upload se valida con tipo MIME
 * - Todos los campos se sanitizan antes de guardar
 *
 * @author Styp Canto Rondón
 * @version 1.0.0
 * @since 2026-01-13
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubirImagenECGDTO {

    /**
     * Número de documento del paciente (DNI)
     * Formato: 8 dígitos numéricos
     * Validación: Requerido, exacto 8 dígitos
     * Búsqueda: Se utiliza para vincular con asegurado o crear nuevo
     */
    @NotBlank(message = "El número de documento es requerido")
    @Pattern(regexp = "^\\d{8}$", message = "El DNI debe tener exactamente 8 dígitos")
    private String numDocPaciente;

    /**
     * Nombres del paciente
     * Validación: Opcional (puede venir de IPRESS)
     * Máximo 100 caracteres
     */
    @Size(max = 100, message = "Los nombres no pueden exceder 100 caracteres")
    private String nombresPaciente;

    /**
     * Apellidos del paciente
     * Validación: Opcional (puede venir de IPRESS)
     * Máximo 100 caracteres
     */
    @Size(max = 100, message = "Los apellidos no pueden exceder 100 caracteres")
    private String apellidosPaciente;

    /**
     * ARCHIVO DE IMAGEN (JPEG o PNG)
     * Validación:
     * - Requerido
     * - Tipo MIME: image/jpeg, image/png
     * - Tamaño máximo: 5MB (5242880 bytes)
     *
     * Nota: La validación de tipo se realiza en servidor
     * No confiar en la extensión del archivo
     */
    @NotNull(message = "El archivo de imagen es requerido")
    private MultipartFile archivo;

    /**
     * Observaciones o notas sobre el ECG
     * Opcional: información contextual del envío
     * Máximo 500 caracteres
     */
    @Size(max = 500, message = "Las observaciones no pueden exceder 500 caracteres")
    private String observaciones;

    /**
     * Validación personalizada post-construcción
     * (Realizada también en backend)
     */
    public boolean esArchivoValido() {
        if (archivo == null || archivo.isEmpty()) {
            return false;
        }

        // Validar tipo MIME
        String contentType = archivo.getContentType();
        if (contentType == null ||
            (!contentType.equals("image/jpeg") && !contentType.equals("image/png"))) {
            return false;
        }

        // Validar tamaño (5MB máximo)
        long maxSize = 5 * 1024 * 1024; // 5MB
        return archivo.getSize() <= maxSize;
    }

    /**
     * Obtiene el nombre del archivo sin ruta
     */
    public String getNombreArchivoOriginal() {
        return archivo != null ? archivo.getOriginalFilename() : null;
    }

    /**
     * Obtiene el tamaño del archivo en bytes
     */
    public long getTamanioBytesArchivo() {
        return archivo != null ? archivo.getSize() : 0;
    }
}

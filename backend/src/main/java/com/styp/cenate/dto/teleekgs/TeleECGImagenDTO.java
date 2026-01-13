package com.styp.cenate.dto.teleekgs;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO para respuesta de listado de imágenes ECG
 *
 * Contiene información resumida de cada imagen (sin el contenido binario)
 * Utilizado para:
 * - Listar imágenes en frontend (tabla paginada)
 * - Mostrar detalles básicos de cada ECG
 * - Filtrar y buscar imágenes
 *
 * Nota: El contenido binario (bytes) NO se incluye en este DTO
 * Para descargar la imagen, se usa endpoint separado: /descargar/{id}
 *
 * @author Styp Canto Rondón
 * @version 1.0.0
 * @since 2026-01-13
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeleECGImagenDTO {

    /**
     * ID único de la imagen
     */
    @JsonProperty("id_imagen")
    private Long idImagen;

    /**
     * Número de documento del paciente
     */
    @JsonProperty("num_doc_paciente")
    private String numDocPaciente;

    /**
     * Nombres del paciente
     */
    @JsonProperty("nombres_paciente")
    private String nombresPaciente;

    /**
     * Apellidos del paciente
     */
    @JsonProperty("apellidos_paciente")
    private String apellidosPaciente;

    /**
     * Nombre completo del paciente
     * Generado combinando nombres + apellidos
     */
    @JsonProperty("paciente_nombre_completo")
    private String pacienteNombreCompleto;

    /**
     * Código de la IPRESS que envió el ECG
     */
    @JsonProperty("codigo_ipress")
    private String codigoIpress;

    /**
     * Nombre de la IPRESS
     */
    @JsonProperty("nombre_ipress")
    private String nombreIpress;

    /**
     * Nombre del archivo generado
     * Ej: "12345678_20260113_143052_a7f3.jpg"
     */
    @JsonProperty("nombre_archivo")
    private String nombreArchivo;

    /**
     * Nombre original del archivo como fue subido
     * Ej: "paciente_juan_ecg.jpg"
     */
    @JsonProperty("nombre_original")
    private String nombreOriginal;

    /**
     * Extensión del archivo
     * Valores: jpg, png
     */
    @JsonProperty("extension")
    private String extension;

    /**
     * Tipo MIME del archivo
     * Valores: image/jpeg, image/png
     */
    @JsonProperty("mime_type")
    private String mimeType;

    /**
     * Tamaño del archivo en bytes (máximo 5MB)
     */
    @JsonProperty("size_bytes")
    private Long sizeBytes;

    /**
     * Tamaño del archivo en formato legible
     * Ej: "2.5 MB", "500 KB"
     */
    @JsonProperty("tamanio_formato")
    private String tamanoFormato;

    /**
     * Hash SHA256 del archivo (64 caracteres hexadecimales)
     * Útil para: verificar integridad y detectar duplicados
     */
    @JsonProperty("sha256")
    private String sha256;

    /**
     * Tipo de almacenamiento
     * Valores: FILESYSTEM, S3, MINIO
     */
    @JsonProperty("storage_tipo")
    private String storageTipo;

    /**
     * Ruta completa del archivo en filesystem
     * NO se expone en listados por seguridad (solo en detalles con permiso)
     */
    @JsonProperty("storage_ruta")
    private String storageRuta;

    /**
     * Bucket para S3/MinIO (NULL para FILESYSTEM local)
     */
    @JsonProperty("storage_bucket")
    private String storageBucket;

    /**
     * ESTADO del ECG
     * Valores: PENDIENTE, PROCESADA, RECHAZADA, VINCULADA
     */
    @JsonProperty("estado")
    private String estado;

    /**
     * ESTADO en formato legible con emoji
     * Ej: "⏳ PENDIENTE", "✅ PROCESADA", "❌ RECHAZADA"
     */
    @JsonProperty("estado_formato")
    private String estadoFormato;

    /**
     * Razón del rechazo (si aplica)
     */
    @JsonProperty("motivo_rechazo")
    private String motivoRechazo;

    /**
     * Observaciones sobre el ECG
     */
    @JsonProperty("observaciones")
    private String observaciones;

    /**
     * Fecha y hora de envío
     */
    @JsonProperty("fecha_envio")
    private LocalDateTime fechaEnvio;

    /**
     * Fecha de envío en formato legible
     * Ej: "13-01-2026 14:30"
     */
    @JsonProperty("fecha_envio_formato")
    private String fechaEnvioFormato;

    /**
     * Fecha y hora de recepción/procesamiento
     */
    @JsonProperty("fecha_recepcion")
    private LocalDateTime fechaRecepcion;

    /**
     * Fecha de vencimiento
     * Después de esta fecha, la imagen será marcada como inactiva
     */
    @JsonProperty("fecha_expiracion")
    private LocalDateTime fechaExpiracion;

    /**
     * Días restantes hasta vencimiento
     */
    @JsonProperty("dias_restantes")
    private Integer diasRestantes;

    /**
     * Indicador de vigencia
     * Valores: VIGENTE, PROXIMO_A_VENCER, VENCIDA
     */
    @JsonProperty("vigencia")
    private String vigencia;

    /**
     * Status de la imagen en sistema
     * A = ACTIVA, I = INACTIVA (vencida)
     */
    @JsonProperty("stat_imagen")
    private String statImagen;

    /**
     * Número de accesos registrados a esta imagen
     */
    @JsonProperty("total_accesos")
    private Long totalAccesos;

    /**
     * Usuario que procesó la imagen (si aplica)
     */
    @JsonProperty("usuario_receptor_nombre")
    private String usuarioReceptorNombre;

    /**
     * Rol del usuario que procesó
     */
    @JsonProperty("usuario_receptor_rol")
    private String usuarioReceptorRol;

    /**
     * Timestamp de creación del registro
     */
    @JsonProperty("created_at")
    private LocalDateTime createdAt;

    /**
     * Timestamp de última actualización
     */
    @JsonProperty("updated_at")
    private LocalDateTime updatedAt;

    /**
     * Helper: obtener nombre completo del paciente
     */
    public String obtenerNombreCompleto() {
        if (nombresPaciente == null && apellidosPaciente == null) {
            return "N/A";
        }
        if (nombresPaciente == null) {
            return apellidosPaciente;
        }
        if (apellidosPaciente == null) {
            return nombresPaciente;
        }
        return apellidosPaciente + ", " + nombresPaciente;
    }

    /**
     * Formatea el tamaño en bytes a formato legible
     */
    public static String formatoTamanio(Long bytes) {
        if (bytes == null || bytes == 0) return "0 B";
        final String[] unidades = {"B", "KB", "MB", "GB"};
        int indice = 0;
        double tamanio = bytes;
        while (tamanio >= 1024 && indice < unidades.length - 1) {
            tamanio /= 1024;
            indice++;
        }
        return String.format("%.2f %s", tamanio, unidades[indice]);
    }

    /**
     * Obtiene representación emoji del estado
     */
    public static String formatoEstado(String estado) {
        return switch (estado) {
            case "PENDIENTE" -> "⏳ PENDIENTE";
            case "PROCESADA" -> "✅ PROCESADA";
            case "RECHAZADA" -> "❌ RECHAZADA";
            case "VINCULADA" -> "🔗 VINCULADA";
            default -> estado;
        };
    }

    /**
     * Obtiene indicador de vigencia
     */
    public static String obtenerVigencia(LocalDateTime fechaExpiracion) {
        if (fechaExpiracion == null) return "DESCONOCIDA";
        LocalDateTime ahora = LocalDateTime.now();
        if (fechaExpiracion.isBefore(ahora)) {
            return "VENCIDA";
        }
        if (fechaExpiracion.isBefore(ahora.plusDays(3))) {
            return "PROXIMO_A_VENCER";
        }
        return "VIGENTE";
    }

    /**
     * Calcula días restantes hasta vencimiento
     */
    public static Integer calcularDiasRestantes(LocalDateTime fechaExpiracion) {
        if (fechaExpiracion == null) return null;
        return (int) java.time.temporal.ChronoUnit.DAYS.between(
            LocalDateTime.now(),
            fechaExpiracion
        );
    }
}
